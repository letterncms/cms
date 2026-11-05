<?php

declare(strict_types=1);

namespace Cms\Modules\Sync\Tests;

use Cms\Support\Files;
use Cms\Modules\Sync\Catalog;
use Cms\Modules\Sync\Database;
use Cms\Modules\Sync\Pack;
use Cms\Modules\Sync\Receiver;
use Cms\Modules\Sync\Sessions;
use Cms\Tests\TestCase;
use Illuminate\Auth\SessionGuard;
use Illuminate\Session\EncryptedStore;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

/** The receiving side, in one process: what arrives is staged, switched in at once, and can be undone. */
final class ReceiverTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/sync'];
    }

    private function entry(string $collection, string $title, array $data = []): string
    {
        $id = strtolower((string) Str::ulid());
        DB::table('entries')->insert(['id' => $id, 'collection' => $collection, 'slug' => Str::slug($title), 'title' => $title, 'status' => 'published', 'data' => json_encode($data), 'created_at' => now(), 'updated_at' => now()]);

        return $id;
    }

    private function job(): string
    {
        return strtolower((string) Str::ulid());
    }

    public function test_tables_are_grouped_and_the_site_s_own_are_never_offered(): void
    {
        $catalog = app(Catalog::class)->classify(['entries', 'revisions', 'users', 'sessions', 'cache', 'migrations', 'api_tokens', 'workspace_threads', 'oauth_clients', 'wp_posts']);

        $this->assertSame(['entries', 'revisions'], $catalog['groups']['content']['tables']);
        $this->assertSame(['users'], $catalog['groups']['people']['tables']);
        $this->assertSame(['workspace_threads'], $catalog['groups']['chats']['tables']);
        $this->assertFalse($catalog['groups']['chats']['push']);
        $this->assertSame(['wp_posts'], $catalog['groups']['other']['tables']);
        $this->assertFalse($catalog['groups']['other']['pull']);
        $this->assertEqualsCanonicalizing(['sessions', 'cache', 'migrations', 'api_tokens', 'oauth_clients'], $catalog['keep']);
    }

    public function test_a_table_is_exported_in_chunks_that_add_up_to_every_row_once(): void
    {
        foreach (range(1, 250) as $i) {
            $this->entry('posts', 'Post '.$i, ['body' => str_repeat('x', 200)]);
        }

        $db = app(Database::class);
        $seen = [];
        $cursor = null;
        $chunks = 0;

        do {
            $chunk = $db->export('entries', $cursor, null, 20_000, 1_000);
            $at = array_search('id', $chunk['columns'], true);
            array_push($seen, ...array_column($chunk['rows'], $at));
            $cursor = $chunk['next'];
            $chunks++;
        } while ($cursor !== null);

        $this->assertGreaterThanOrEqual(4, $chunks);
        $this->assertCount(250, $seen);
        $this->assertCount(250, array_unique($seen));
    }

    public function test_a_sync_is_staged_switched_in_at_once_and_undone(): void
    {
        $keep = $this->entry('pages', 'Kept page');
        $this->entry('posts', 'Old post');
        Files::put(public_path('media/old.jpg'), 'old bytes');
        Files::put(public_path('media/gone.jpg'), 'gone');
        $receiver = app(Receiver::class);
        $db = app(Database::class);
        $job = $this->job();

        $receiver->begin($job, ['from' => ['name' => 'Production', 'url' => 'https://example.com'], 'direction' => 'pull', 'tables' => [['table' => 'entries', 'scope' => ['column' => 'collection', 'in' => ['posts']]]], 'areas' => ['media' => ['remove' => ['gone.jpg']]], 'bytes' => 1000]);
        $columns = $db->columns('entries');
        $row = static fn (string $title) => array_map(static fn (string $c) => match ($c) {
            'id' => strtolower((string) Str::ulid()), 'collection' => 'posts', 'slug' => Str::slug($title), 'title' => $title, 'status' => 'published', 'locale' => 'en', 'position' => 0, default => null,
        }, $columns);

        $receiver->import($job, 'entries', 0, $columns, [$row('New post 1'), $row('New post 2')]);
        $this->assertSame(['again' => true], array_intersect_key($receiver->import($job, 'entries', 0, $columns, [$row('Sent twice')]), ['again' => 1]));
        $receiver->write($job, Pack::encode([[['area' => 'media', 'path' => 'old.jpg', 'offset' => 0, 'size' => 9, 'mtime' => 1_700_000_000, 'sha1' => sha1('new bytes')], 'new bytes'], [['area' => 'media', 'path' => 'sub/new.jpg', 'offset' => 0, 'size' => 3, 'mtime' => 1_700_000_000], 'abc']]));

        // Nothing has changed yet: the site runs as it was until the switch.
        $this->assertSame(['Old post'], DB::table('entries')->where('collection', 'posts')->pluck('title')->all());
        $this->assertSame('old bytes', file_get_contents(public_path('media/old.jpg')));

        while (! $receiver->backup($job)['done']);
        $receiver->finalize($job);

        $this->assertEqualsCanonicalizing(['New post 1', 'New post 2'], DB::table('entries')->where('collection', 'posts')->pluck('title')->all());
        $this->assertTrue(DB::table('entries')->where('id', $keep)->exists(), 'Only the chosen collection is replaced.');
        $this->assertSame('new bytes', file_get_contents(public_path('media/old.jpg')));
        $this->assertSame(1_700_000_000, filemtime(public_path('media/old.jpg')));
        $this->assertSame('abc', file_get_contents(public_path('media/sub/new.jpg')));
        $this->assertFileDoesNotExist(public_path('media/gone.jpg'));
        $this->assertSame([], array_values(array_filter($db->tables(), static fn ($t) => str_starts_with($t, Database::STAGING))));
        $this->assertTrue($receiver->history()[0]['can_undo']);

        while (! $receiver->undo($job)['done']);

        $this->assertSame(['Old post'], DB::table('entries')->where('collection', 'posts')->pluck('title')->all());
        $this->assertSame('old bytes', file_get_contents(public_path('media/old.jpg')));
        $this->assertSame('gone', file_get_contents(public_path('media/gone.jpg')));
        $this->assertFileDoesNotExist(public_path('media/sub/new.jpg'));
        $this->assertFalse($receiver->history()[0]['can_undo']);
        $this->assertNull($receiver->busy());
    }

    public function test_chunks_out_of_order_and_a_second_sync_at_the_same_time_are_refused(): void
    {
        $receiver = app(Receiver::class);
        $job = $this->job();
        $receiver->begin($job, ['from' => [], 'direction' => 'push', 'tables' => [['table' => 'entries', 'scope' => null]], 'areas' => [], 'bytes' => 0]);

        try {
            $receiver->import($job, 'entries', 3, ['id'], []);
            $this->fail('Out of order was accepted.');
        } catch (RuntimeException $e) {
            $this->assertStringContainsString('out of order', $e->getMessage());
        }

        try {
            $receiver->begin($this->job(), ['from' => [], 'direction' => 'push', 'tables' => [], 'areas' => [], 'bytes' => 0]);
            $this->fail('A second sync started.');
        } catch (RuntimeException $e) {
            $this->assertStringContainsString('busy with another sync', $e->getMessage());
        }

        $receiver->cancel($job);
        $receiver->begin($this->job(), ['from' => [], 'direction' => 'push', 'tables' => [], 'areas' => [], 'bytes' => 0]);
        $this->assertNotNull($receiver->busy());
    }

    public function test_paths_that_leave_their_folder_or_hidden_files_are_refused(): void
    {
        $receiver = app(Receiver::class);
        $job = $this->job();
        $receiver->begin($job, ['from' => [], 'direction' => 'push', 'tables' => [], 'areas' => ['config' => ['remove' => ['plugins.yaml', 'license.key']]], 'bytes' => 0]);

        foreach (['../.env', 'a/../../.env', '.htaccess', 'plugins.yaml', 'licenses/acme.key'] as $path) {
            try {
                $receiver->write($job, Pack::encode([[['area' => 'config', 'path' => $path, 'offset' => 0, 'size' => 1, 'mtime' => 1], 'x']]));
                $this->fail("{$path} was written.");
            } catch (RuntimeException) {
                $this->assertFileDoesNotExist(site_path('.env.x'));
            }
        }

        $this->assertSame([], \Cms\Modules\Sync\Site::readJson(\Cms\Modules\Sync\Site::dir('incoming/'.$job.'/state.json'))['areas']['config']['remove']);
    }

    public function test_people_who_are_signed_in_stay_signed_in_when_people_are_replaced(): void
    {
        config(['session.driver' => 'file', 'session.files' => storage_path('framework/sessions'), 'session.encrypt' => true]);
        Files::ensureDir(storage_path('framework/sessions'));
        $hash = password_hash('secret', PASSWORD_BCRYPT, ['cost' => 4]);
        DB::table('users')->insert([
            ['id' => $ann = strtolower((string) Str::ulid()), 'name' => 'Ann', 'email' => 'ann@example.com', 'password' => $hash, 'created_at' => now(), 'updated_at' => now()],
            ['id' => $bob = strtolower((string) Str::ulid()), 'name' => 'Bob', 'email' => 'bob@example.com', 'password' => $hash, 'created_at' => now(), 'updated_at' => now()],
        ]);
        $key = 'login_web_'.sha1(SessionGuard::class);
        $sessions = [];

        foreach (['ann' => $ann, 'bob' => $bob] as $who => $id) {
            $store = new EncryptedStore('sync', app('session')->driver('file')->getHandler(), app('encrypter'));
            $store->start();
            $store->put($key, $id);
            $store->save();
            $sessions[$who] = $store->getId();
        }

        // Production has Ann under another id, and no Bob.
        $receiver = app(Receiver::class);
        $job = $this->job();
        $receiver->begin($job, ['from' => [], 'direction' => 'pull', 'tables' => [['table' => 'users', 'scope' => null]], 'areas' => [], 'bytes' => 0]);
        $columns = ['id', 'name', 'email', 'password', 'created_at', 'updated_at'];
        $receiver->import($job, 'users', 0, $columns, [[$annThere = strtolower((string) Str::ulid()), 'Ann There', 'ANN@example.com', $hash, now()->toDateTimeString(), now()->toDateTimeString()], [strtolower((string) Str::ulid()), 'Cy', 'cy@example.com', $hash, now()->toDateTimeString(), now()->toDateTimeString()]]);

        while (! $receiver->backup($job)['done']);
        $this->assertSame(2, $receiver->finalize($job)['signed_in']);

        $read = static function (string $id) use ($key) {
            $store = new EncryptedStore('sync', app('session')->driver('file')->getHandler(), app('encrypter'));
            $store->setId($id);
            $store->start();

            return $store->get($key);
        };

        $this->assertSame($annThere, $read($sessions['ann']));
        $this->assertSame($bob, $read($sessions['bob']));
        $this->assertEqualsCanonicalizing(['ann@example.com', 'bob@example.com', 'cy@example.com'], array_map('strtolower', DB::table('users')->pluck('email')->all()));
        $this->assertInstanceOf(Sessions::class, new Sessions);
    }

    public function test_a_sync_needs_room_on_the_disk(): void
    {
        $this->expectExceptionMessage('disk is too full');
        app(Receiver::class)->begin($this->job(), ['from' => [], 'direction' => 'push', 'tables' => [], 'areas' => [], 'bytes' => PHP_INT_MAX >> 2]);
    }
}

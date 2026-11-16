<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Revisions\Revisions;
use Cms\Support\Files;
use Cms\Tests\TestCase;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** A site from before every kind kept its versions in one history: its entries' revisions and its styling's version files. */
final class RevisionsMigrationTest extends TestCase
{
    private const string MIGRATION = '2026_11_17_000000_make_revisions_keep_every_kind';

    public function test_entry_revisions_and_styling_versions_move_into_the_one_history(): void
    {
        Schema::drop('revisions');
        Schema::create('revisions', static function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->ulid('entry_id');
            $table->string('collection', 64);
            $table->ulid('user_id')->nullable();
            $table->string('action', 32);
            $table->string('title', 512);
            $table->json('snapshot');
            $table->string('message', 512)->nullable();
            $table->timestamp('created_at')->nullable();
            $table->index(['entry_id', 'created_at']);
        });
        $entry = '01jbbbbbbbbbbbbbbbbbbbbbbb';
        DB::table('revisions')->insert(['id' => '01jaaaaaaaaaaaaaaaaaaaaaaa', 'entry_id' => $entry, 'collection' => 'pages', 'action' => 'publish', 'title' => 'Home', 'snapshot' => '{"title":"Home"}', 'created_at' => now()->subDay()]);
        $user = $this->userWithRole('admin');
        Files::putJson(storage_path('styling/versions/01h0000000000000000000000a.json'), ['css' => 'old', 'transition' => [], 'user' => null, 'at' => '2026-01-01T00:00:00+00:00']);
        Files::putJson(storage_path('styling/versions/01h0000000000000000000000b.json'), ['css' => 'new', 'transition' => ['type' => 'fade'], 'user' => $user->name, 'at' => '2026-02-01T00:00:00+00:00']);

        $this->assertSame(1, DB::table('migrations')->where('migration', self::MIGRATION)->delete());
        $this->assertSame(0, Artisan::call('migrate', ['--force' => true]));

        $revisions = $this->app->make(Revisions::class);
        $this->assertSame(['publish'], array_column($revisions->list('entry', $entry), 'action'));
        $this->assertSame('pages', DB::table('revisions')->where('subject', $entry)->value('collection'));
        $styling = $revisions->list('styling', 'theme');
        $this->assertSame([$user->name, null], array_map(static fn (array $r) => $r['user']['name'] ?? null, $styling));
        $this->assertSame(['type' => 'fade'], $revisions->find($styling[0]['id'])['snapshot']['transition']);
        $this->assertSame('old', $revisions->find($styling[1]['id'])['snapshot']['css']);
        $this->assertDirectoryDoesNotExist(storage_path('styling/versions'));

        // Run again, it changes nothing.
        (require database_path('migrations/'.self::MIGRATION.'.php'))->up();
        $this->assertSame(3, DB::table('revisions')->count());
    }
}

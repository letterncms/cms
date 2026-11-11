<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Carbon\CarbonImmutable;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Content\Entries\Entry;
use Cms\Content\Entries\ScheduledPublisher;
use Cms\Tests\TestCase;

/** A publication can have an end: from then on the entry is off the site, and the scheduler makes it a draft. */
final class ExpiryTest extends TestCase
{
    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();
        \Illuminate\Support\Carbon::setTestNow();
        parent::tearDown();
    }

    private function at(string $time): void
    {
        CarbonImmutable::setTestNow($time);
        \Illuminate\Support\Carbon::setTestNow($time);
    }

    private function ability(string $name, array $input = []): mixed
    {
        return $this->cms()->abilities()->execute($name, $input, AbilityContext::system());
    }

    public function test_an_entry_leaves_the_site_at_its_end_date_on_both_drivers(): void
    {
        $this->at('2026-06-01 12:00:00');
        $content = $this->cms()->entryService();
        $unpublished = [];
        $this->cms()->hooks()->on('entry.unpublished', function (Entry $entry) use (&$unpublished): void {
            $unpublished[] = $entry->title;
        });

        $offer = $this->ability('entries/create', ['collection' => 'posts', 'title' => 'Offer', 'data' => ['excerpt' => 'x'], 'status' => 'published', 'expiresAt' => '2026-06-10T00:00:00+00:00']);
        $note = $this->ability('entries/create', ['collection' => 'notes', 'title' => 'Notice', 'status' => 'published', 'expiresAt' => '2026-06-10T00:00:00+00:00']);
        $stays = $content->create('posts', ['title' => 'Stays', 'data' => ['excerpt' => 'x'], 'status' => 'published']);

        $this->assertSame('2026-06-10T00:00:00+00:00', $offer['expiresAt']);
        $this->assertSame('published', $offer['displayStatus']);
        $this->assertStringContainsString("expires_at: '2026-06-10T00:00:00+00:00'", (string) file_get_contents($this->site.'/content/collections/notes/notice.md'));
        $this->cms()->entries()->flush();
        $this->assertSame('2026-06-10T00:00:00+00:00', $this->cms()->entries()->find($note['id'])->expiresAt->toIso8601String());

        $live = fn (string $collection) => array_map(static fn (Entry $e) => $e->title, $this->cms()->entries()->query()->collection($collection)->live()->orderBy('title')->get());
        $this->assertSame(['Offer', 'Stays'], $live('posts'));
        $this->assertSame(['Notice'], $live('notes'));
        $this->app->make(ScheduledPublisher::class)->run();
        $this->assertSame([], $unpublished);

        // Its time is up: off the site at once, also before the scheduler has run.
        $this->at('2026-06-10 00:00:01');
        $this->cms()->entries()->flush();
        $this->assertSame(['Stays'], $live('posts'));
        $this->assertSame([], $live('notes'));
        $this->assertSame('expired', $this->ability('entries/get', ['id' => $offer['id']])['displayStatus']);
        $this->assertFalse($this->cms()->entries()->find($note['id'])->isLive());
        $this->getJson('/api/v1/content/posts')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'Stays');
        $this->getJson('/api/v1/content/posts/offer')->assertNotFound();
        $this->assertSame(['Offer'], array_column($this->ability('entries/list', ['collection' => 'posts', 'filters' => [['field' => 'expires_at', 'operator' => 'not null']]])['items'], 'title'));

        // The scheduler makes them drafts and says so, once.
        $publisher = $this->app->make(ScheduledPublisher::class);
        $publisher->run();
        $this->assertSame(2, $publisher->expired);
        sort($unpublished);
        $this->assertSame(['Notice', 'Offer'], $unpublished);

        foreach ([$offer['id'], $note['id']] as $id) {
            $this->cms()->entries()->flush();
            $entry = $this->cms()->entries()->find($id);
            $this->assertSame('draft', $entry->status);
            $this->assertNull($entry->expiresAt);
        }

        $this->assertTrue($this->cms()->entries()->find($stays->id)->isLive());
        $publisher->run();
        $this->assertSame(0, $publisher->expired);
        $this->assertSame(0, \Illuminate\Support\Facades\Artisan::call('publish:scheduled', ['--json' => true]));
        $this->assertSame(0, json_decode(\Illuminate\Support\Facades\Artisan::output(), true)['data']['expired']);
    }

    public function test_the_end_date_is_set_moved_and_removed_by_publishing(): void
    {
        $this->at('2026-06-01 12:00:00');
        $content = $this->cms()->entryService();
        $entry = $content->create('posts', ['title' => 'Offer', 'data' => ['excerpt' => 'x']]);

        $dry = $this->ability('entries/publish', ['id' => $entry->id, 'at' => '2026-06-05T00:00:00+00:00', 'expiresAt' => '2026-06-10T00:00:00+00:00', 'dryRun' => true]);
        $this->assertSame(['schedule', '2026-06-10T00:00:00+00:00'], [$dry['changes'][0]['action'], $dry['changes'][0]['expiresAt']]);

        $published = $this->ability('entries/publish', ['id' => $entry->id, 'expiresAt' => '2026-06-10T00:00:00+00:00']);
        $this->assertSame('2026-06-10T00:00:00+00:00', $published['expiresAt']);
        $version = $published['version'];

        // Publishing again without it keeps it; with it moves it; null removes it.
        $this->assertSame('2026-06-10T00:00:00+00:00', $this->ability('entries/publish', ['id' => $entry->id])['expiresAt']);
        $moved = $this->ability('entries/update', ['id' => $entry->id, 'publish' => true, 'expiresAt' => '2026-07-01T00:00:00+00:00']);
        $this->assertSame('2026-07-01T00:00:00+00:00', $moved['expiresAt']);
        $this->assertNotSame($version, $moved['version']);
        $this->assertNull($this->ability('entries/publish', ['id' => $entry->id, 'expiresAt' => null])['expiresAt']);

        // Unpublishing ends the publication, and its end with it.
        $this->ability('entries/publish', ['id' => $entry->id, 'expiresAt' => '2026-07-01T00:00:00+00:00']);
        $this->assertNull($this->ability('entries/unpublish', ['id' => $entry->id])['expiresAt']);

        foreach ([
            ['entries/publish', ['id' => $entry->id, 'expiresAt' => '2026-05-01T00:00:00+00:00']],
            ['entries/publish', ['id' => $entry->id, 'at' => '2026-06-05T00:00:00+00:00', 'expiresAt' => '2026-06-04T00:00:00+00:00']],
            ['entries/update', ['id' => $entry->id, 'expiresAt' => '2026-07-01T00:00:00+00:00']],
            ['entries/create', ['collection' => 'posts', 'title' => 'Draft', 'expiresAt' => '2026-07-01T00:00:00+00:00']],
        ] as [$name, $input]) {
            try {
                $this->ability($name, $input);
                $this->fail("{$name} took ".json_encode($input));
            } catch (AbilityException $e) {
                $this->assertSame('invalid_input', $e->type);
            }
        }
    }

    public function test_dates_given_in_another_time_zone_are_the_same_moment_on_both_drivers(): void
    {
        $this->at('2026-06-01 12:00:00');

        foreach (['posts', 'notes'] as $collection) {
            $entry = $this->ability('entries/create', ['collection' => $collection, 'title' => 'Zoned', 'data' => ['excerpt' => 'x'], 'status' => 'published', 'at' => '2026-06-05T10:00:00+05:00', 'expiresAt' => '2026-06-10T05:00:00+05:00']);
            $this->cms()->entries()->flush();
            $read = $this->cms()->entries()->find($entry['id']);

            $this->assertSame('2026-06-05T05:00:00+00:00', $read->publishedAt->utc()->toIso8601String(), $collection);
            $this->assertSame('2026-06-10T00:00:00+00:00', $read->expiresAt->utc()->toIso8601String(), $collection);

            // Live between the two moments, and at no other time.
            foreach (['2026-06-05 04:59:00' => false, '2026-06-05 05:01:00' => true, '2026-06-09 23:59:00' => true, '2026-06-10 00:01:00' => false] as $now => $live) {
                $this->at($now);
                $this->cms()->entries()->flush();
                $this->assertSame($live ? 1 : 0, $this->cms()->entries()->query()->collection($collection)->live()->where('id', $entry['id'])->count(), "{$collection} at {$now}");
            }

            $this->at('2026-06-01 12:00:00');
        }
    }

    public function test_an_entry_that_ran_out_is_published_again_before_the_scheduler_has_come_by(): void
    {
        $this->at('2026-06-01 12:00:00');
        $entry = $this->ability('entries/create', ['collection' => 'posts', 'title' => 'Offer', 'data' => ['excerpt' => 'x'], 'status' => 'published', 'expiresAt' => '2026-06-10T00:00:00+00:00']);

        $this->at('2026-06-11 00:00:00');
        $this->assertSame('expired', $this->ability('entries/get', ['id' => $entry['id']])['displayStatus']);

        $again = $this->ability('entries/publish', ['id' => $entry['id']]);
        $this->assertSame(['published', null], [$again['displayStatus'], $again['expiresAt']]);
        $this->ability('entries/update', ['id' => $entry['id'], 'title' => 'Offer, extended', 'publish' => true, 'expiresAt' => '2026-07-01T00:00:00+00:00']);
        $this->at('2026-07-02 00:00:00');
        $this->assertSame('Offer, extended', $this->ability('entries/update', ['id' => $entry['id'], 'publish' => true])['title']);
        $this->assertTrue($this->cms()->entries()->find($entry['id'])->isLive());
    }

    public function test_a_list_can_show_when_entries_end(): void
    {
        $get = fn (string $handle) => $this->cms()->abilities()->execute('views/get', ['id' => 'content', 'params' => ['collection' => $handle]], AbilityContext::forUser($this->admin(), 'admin'));
        $records = $get('posts')['root']['children'][0]['props'];
        $ends = array_column($records['columns'], null, 'key')['expiresAt'];
        // Written as the dates beside it: short, and marked while it is still to come.
        $this->assertSame(['Ends', 'field', ['type' => 'date'], '—', true, 'expires_at'], [$ends['label'], $ends['format'], $ends['field'], $ends['empty'], $ends['hidden'], $ends['sort']]);

        // Published means on the site or about to be: what ran out has a filter of its own, and can be published again from its row.
        $this->assertSame(['any', 'active', 'draft', 'expired'], array_column($records['filters'][0]['options'], 'value'));
        $publish = array_values(array_filter($records['actions'], static fn (array $a) => ($a['ability'] ?? '') === 'entries/publish'))[0];
        $this->assertSame('{row.displayStatus} is draft, changed, expired', $publish['when']);
        $this->assertSame('{row.displayStatus} is draft, changed, expired', $records['bulk'][0]['some']);

        // A collection can have it on from the start.
        $this->ability('collections/save', ['handle' => 'offers', 'definition' => ['title' => 'Offers', 'default_columns' => ['status', 'ends'], 'fields' => []]]);
        $shown = array_column($get('offers')['root']['children'][0]['props']['columns'], 'hidden', 'key');
        $this->assertFalse($shown['expiresAt']);
    }

    public function test_expired_and_active_are_statuses_to_ask_for_on_both_drivers(): void
    {
        $this->at('2026-06-01 12:00:00');

        foreach (['posts', 'notes'] as $collection) {
            foreach ([['Ran out', 'published', '2026-06-10T00:00:00+00:00'], ['Stays', 'published', null], ['Draft', 'draft', null]] as [$title, $status, $ends]) {
                $this->ability('entries/create', ['collection' => $collection, 'title' => $title, 'data' => ['excerpt' => 'x'], 'status' => $status, ...($ends ? ['expiresAt' => $ends] : [])]);
            }
            $this->ability('entries/create', ['collection' => $collection, 'title' => 'Later', 'data' => ['excerpt' => 'x'], 'status' => 'published', 'at' => '2026-08-01T00:00:00+00:00']);
        }

        $this->at('2026-06-11 00:00:00');
        $this->cms()->entries()->flush();

        foreach (['posts', 'notes'] as $collection) {
            $titles = fn (string $status) => array_column($this->ability('entries/list', ['collection' => $collection, 'status' => $status, 'sort' => 'title'])['items'], 'title');
            $this->assertSame(['Ran out'], $titles('expired'), $collection);
            $this->assertSame(['Later', 'Stays'], $titles('active'), $collection);
            $this->assertSame(['Later', 'Ran out', 'Stays'], $titles('published'), $collection);
            $this->assertSame(['Stays'], $titles('live'), $collection);
        }
    }
}

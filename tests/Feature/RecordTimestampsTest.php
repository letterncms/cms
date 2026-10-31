<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Carbon\CarbonImmutable;
use Cms\Abilities\AbilityContext;
use Cms\Content\Collections\Collection;
use Cms\Forms\Submission;
use Cms\Media\MediaItem;
use Cms\Navigation\Menus;
use Cms\Seo\Redirects;
use Cms\Support\RecordTimestamps;
use Cms\Support\Yaml;
use Cms\Tests\TestCase;

final class RecordTimestampsTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/forms', 'letterncms/media', 'letterncms/navigation', 'letterncms/seo', 'letterncms/i18n'];
    }

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    private function ability(string $name, array $input = []): mixed
    {
        return $this->cms()->abilities()->execute($name, $input, AbilityContext::system());
    }

    private function assertDates(array $record): void
    {
        $this->assertArrayHasKey('publishedAt', $record);
        $this->assertArrayHasKey('updatedAt', $record);
        foreach (['publishedAt', 'updatedAt'] as $key) {
            if ($record[$key] !== null) {
                $this->assertSame($record[$key], CarbonImmutable::parse($record[$key])->toIso8601String());
            }
        }
    }

    public function test_every_overview_exposes_the_same_timestamp_contract(): void
    {
        $this->ability('navigation/save', ['handle' => 'main', 'title' => 'Main', 'items' => []]);
        $this->ability('forms/save', ['handle' => 'contact', 'title' => 'Contact', 'fields' => [], 'settings' => []]);
        $this->ability('globals/save', ['handle' => 'footer', 'title' => 'Footer', 'fields' => []]);
        $this->app->make(Redirects::class)->save([['from' => '/old', 'to' => '/new']]);
        $user = $this->admin()->toPublic();
        $media = MediaItem::query()->create(['name' => 'File', 'filename' => 'file.txt', 'path' => 'media/file.txt', 'mime' => 'text/plain', 'size' => 3, 'hash' => hash('sha256', 'abc')]);
        $submission = Submission::query()->create(['form' => 'contact', 'data' => [], 'status' => 'new']);

        foreach (['collections/list', 'navigation/list', 'forms/list', 'globals/list', 'redirects/list'] as $ability) {
            $rows = $this->ability($ability);
            $this->assertNotEmpty($rows, $ability);
            foreach ($rows as $record) $this->assertDates($record);
        }
        foreach ($this->ability('languages/list')['languages'] as $record) $this->assertDates($record);
        foreach ($this->ability('packages/list')['items'] as $record) $this->assertDates($record);
        foreach ($this->ability('audit/list')['items'] as $record) $this->assertDates($record);
        foreach ([$user, $media->toPublic(), $submission->toPublic()] as $record) $this->assertDates($record);
        $this->assertNull($user['publishedAt']);
        $this->assertNull($submission->toPublic()['publishedAt']);
        $this->assertSame($media->toPublic()['createdAt'], $media->toPublic()['publishedAt']);
    }

    public function test_file_records_preserve_publication_and_advance_update_dates_across_reloads(): void
    {
        CarbonImmutable::setTestNow('2026-10-01 12:00:00 UTC');
        $first = $this->ability('navigation/save', ['handle' => 'main', 'title' => 'Main', 'items' => []]);
        $collection = Collection::fromArray('cases', ['title' => 'Cases', 'fields' => []]);
        $this->cms()->collections()->save($collection);
        $this->ability('globals/save', ['handle' => 'footer', 'title' => 'Footer', 'fields' => []]);
        $this->ability('forms/save', ['handle' => 'contact', 'title' => 'Contact', 'fields' => [], 'settings' => []]);
        $this->assertSame($first['publishedAt'], $first['updatedAt']);

        CarbonImmutable::setTestNow('2026-10-02 12:00:00 UTC');
        $saved = $this->ability('navigation/save', ['handle' => 'main', 'title' => 'Main menu', 'items' => []]);
        $fresh = new Menus($this->cms()->hooks());
        $this->assertSame($saved, $this->ability('navigation/get', ['handle' => 'main']));
        $this->assertSame($saved['updatedAt'], $fresh->find('main')['updatedAt']);
        $this->assertSame($first['publishedAt'], $saved['publishedAt']);
        $this->assertNotSame($first['updatedAt'], $saved['updatedAt']);
        $this->cms()->collections()->save($collection);
        $this->ability('globals/update', ['handle' => 'footer', 'values' => []]);
        $this->ability('forms/save', ['handle' => 'contact', 'title' => 'Contact us', 'fields' => [], 'settings' => []]);
        foreach ([$this->ability('collections/get', ['handle' => 'cases']), $this->ability('globals/get', ['handle' => 'footer']), $this->ability('forms/get', ['handle' => 'contact'])] as $record) {
            $this->assertSame($first['publishedAt'], $record['publishedAt']);
            $this->assertSame($saved['updatedAt'], $record['updatedAt']);
        }
    }

    public function test_bulk_redirect_saves_change_only_edited_rows_and_ignore_client_dates(): void
    {
        CarbonImmutable::setTestNow('2026-10-01 12:00:00 UTC');
        $redirects = $this->app->make(Redirects::class);
        $first = $redirects->save([['from' => '/one', 'to' => '/a'], ['from' => '/two', 'to' => '/b']]);
        CarbonImmutable::setTestNow('2026-10-02 12:00:00 UTC');
        $first[1]['to'] = '/c';
        $first[1]['publishedAt'] = '2000-01-01T00:00:00+00:00';
        $saved = $redirects->save($first);
        $this->assertSame($first[0], $saved[0]);
        $this->assertSame($first[0]['publishedAt'], $saved[1]['publishedAt']);
        $this->assertNotSame($first[0]['updatedAt'], $saved[1]['updatedAt']);
        $this->assertSame($saved, (new Redirects)->all());
        $this->assertSame($saved, $redirects->save($saved));
        $redirects->moved('/a', '/final');
        $this->assertSame('/final', $redirects->match('/one')['to']);
        $this->assertSame($first[0]['publishedAt'], $redirects->match('/one')['publishedAt']);
    }

    public function test_legacy_records_keep_unknown_publication_dates_and_reads_do_not_write(): void
    {
        Yaml::write(content_path('navigation/legacy.yaml'), ['title' => 'Legacy', 'items' => []]);
        $before = file_get_contents(content_path('navigation/legacy.yaml'));
        $legacy = $this->ability('navigation/get', ['handle' => 'legacy']);
        $this->assertNull($legacy['publishedAt']);
        $this->assertNull($legacy['updatedAt']);
        $this->assertSame($before, file_get_contents(content_path('navigation/legacy.yaml')));
        $saved = $this->ability('navigation/save', ['handle' => 'legacy', 'title' => 'Legacy', 'items' => []]);
        $this->assertNull($saved['publishedAt']);
        $this->assertNotNull($saved['updatedAt']);
        $this->assertSame(['publishedAt' => null, 'updatedAt' => null], RecordTimestamps::api(['published_at' => 'garbage', 'updated_at' => '']));
    }

    public function test_language_dates_follow_language_changes_but_not_unrelated_settings(): void
    {
        CarbonImmutable::setTestNow('2026-10-01 12:00:00 UTC');
        $first = array_column($this->ability('languages/save', ['default' => 'en', 'languages' => ['en', 'de', 'fr']]), null, 'code');
        $this->assertNotNull($first['fr']['publishedAt']);
        $this->assertNull($first['en']['publishedAt']);
        CarbonImmutable::setTestNow('2026-10-02 12:00:00 UTC');
        $this->cms()->saveSite(['name' => 'Renamed site']);
        $this->assertSame(array_values($first), array_map(static fn ($row) => array_diff_key($row, ['entries' => true]), $this->ability('languages/list')['languages']));
        $changed = array_column($this->ability('languages/save', ['default' => 'fr', 'languages' => ['en', 'de', 'fr']]), null, 'code');
        $this->assertSame($first['fr']['publishedAt'], $changed['fr']['publishedAt']);
        $this->assertNotSame($first['fr']['updatedAt'], $changed['fr']['updatedAt']);
        $this->assertSame($first['de'], $changed['de']);
        CarbonImmutable::setTestNow('2026-10-03 12:00:00 UTC');
        $prefixed = array_column($this->ability('languages/save', ['default' => 'fr', 'languages' => ['en', 'de', 'fr'], 'prefixDefault' => true]), null, 'code');
        $this->assertSame($changed['de'], $prefixed['de']);
        $this->assertSame($first['fr']['publishedAt'], $prefixed['fr']['publishedAt']);
        $this->assertNotSame($changed['fr']['updatedAt'], $prefixed['fr']['updatedAt']);
    }
}

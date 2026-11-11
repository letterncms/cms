<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Modules\Site\Rendering\Renderer;
use Cms\Tests\TestCase;

/** A detail page links to the entries before and after it: the Repeat source `neighbors`. */
final class NeighborsTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    protected function collections(): array
    {
        return [
            'soundings' => ['title' => 'Soundings', 'route' => '/soundings/{slug}', 'template' => 'sounding', 'sort' => 'position', 'body' => 'content', 'fields' => [['handle' => 'content', 'type' => 'blocks']]],
            'logbook' => ['title' => 'Logbook', 'structure' => 'dated', 'route' => '/log/{slug}', 'template' => 'sounding', 'body' => 'content', 'fields' => [['handle' => 'content', 'type' => 'blocks']]],
            'manual' => ['title' => 'Manual', 'structure' => 'tree', 'route' => '/manual/{parent_uri}/{slug}', 'template' => 'sounding', 'body' => 'content', 'fields' => [['handle' => 'content', 'type' => 'blocks']]],
        ];
    }

    /** @return array<string, string> title => the links its page shows, as "Title→/url" */
    private function pages(array $props, array $titles = ['First', 'Second', 'Third']): array
    {
        $this->cms()->entryService()->create('templates', ['title' => 'Sounding', 'slug' => 'sounding', 'status' => 'published', 'data' => ['blocks' => [
            ['type' => 'repeat', 'props' => ['source' => 'neighbors', 'tag' => 'nav', ...$props], 'children' => [
                ['type' => 'link', 'bind' => ['label' => 'item.title', 'url' => 'item.url']],
            ]],
        ]]]);
        $out = [];

        foreach ($titles as $i => $title) {
            $ids[$title] = $this->cms()->entryService()->create('soundings', ['title' => $title, 'status' => 'published', 'position' => $i, 'data' => ['content' => []]])->id;
        }

        foreach ($ids as $title => $id) {
            preg_match_all('#<a class="cms-link" href="([^"]+)">([^<]+)</a>#', $this->app->make(Renderer::class)->entry($this->cms()->entries()->find($id))['html'], $m);
            $out[$title] = array_map(static fn ($label, $href) => "{$label}→{$href}", $m[2], $m[1]);
        }

        return $out;
    }

    public function test_previous_and_next_in_the_collections_order(): void
    {
        $this->assertSame([
            'First' => ['Second→/soundings/second'],
            'Second' => ['First→/soundings/first', 'Third→/soundings/third'],
            'Third' => ['Second→/soundings/second'],
        ], $this->pages([]));
    }

    public function test_one_side_only_and_round_the_ends(): void
    {
        $this->assertSame([
            'First' => ['Second→/soundings/second'],
            'Second' => ['Third→/soundings/third'],
            'Third' => ['First→/soundings/first'],
        ], $this->pages(['show' => 'next', 'wrap' => true]));
    }

    /** The links on one entry's page, as titles. */
    private function linksOf(string $id): array
    {
        preg_match_all('#<a class="cms-link" href="[^"]+">([^<]+)</a>#', $this->app->make(Renderer::class)->entry($this->cms()->entries()->find($id))['html'], $m);

        return $m[1];
    }

    private function template(): void
    {
        $this->cms()->entryService()->create('templates', ['title' => 'Sounding', 'slug' => 'sounding', 'status' => 'published', 'data' => ['blocks' => [
            ['type' => 'repeat', 'props' => ['source' => 'neighbors', 'tag' => 'nav'], 'children' => [['type' => 'link', 'bind' => ['label' => 'item.title', 'url' => 'item.url']]]],
        ]]]);
    }

    public function test_a_dated_collection_goes_by_date_and_a_tree_by_reading_order(): void
    {
        $this->template();
        $create = fn (string $collection, array $input) => $this->cms()->entryService()->create($collection, ['status' => 'published', 'data' => ['content' => []], ...$input])->id;

        // Made out of order: the dates decide.
        $march = $create('logbook', ['title' => 'March', 'at' => '2026-03-01T10:00:00Z']);
        $january = $create('logbook', ['title' => 'January', 'at' => '2026-01-01T10:00:00Z']);
        $create('logbook', ['title' => 'February', 'at' => '2026-02-01T10:00:00Z']);
        $this->assertSame(['February'], $this->linksOf($january));
        $this->assertSame(['February'], $this->linksOf($march));

        // A tree is read top to bottom, children after their parent.
        $one = $create('manual', ['title' => 'One', 'position' => 0]);
        $two = $create('manual', ['title' => 'Two', 'position' => 1]);
        $inside = $create('manual', ['title' => 'One point one', 'parentId' => $one, 'position' => 0]);
        $this->assertSame(['One', 'Two'], $this->linksOf($inside));
        $this->assertSame(['One point one'], $this->linksOf($two));
    }

    public function test_only_what_is_on_the_site_is_a_neighbour_and_each_language_has_its_own(): void
    {
        $this->template();
        $create = fn (array $input) => $this->cms()->entryService()->create('soundings', ['data' => ['content' => []], ...$input])->id;
        $first = $create(['title' => 'First', 'status' => 'published', 'position' => 0]);
        $create(['title' => 'A draft', 'position' => 1]);
        $create(['title' => 'Over', 'status' => 'published', 'position' => 2, 'expiresAt' => now()->addHour()->toIso8601String()]);
        $create(['title' => 'Erste', 'status' => 'published', 'position' => 3, 'locale' => 'de']);
        $last = $create(['title' => 'Last', 'status' => 'published', 'position' => 4]);

        $this->travel(2)->hours();
        \Cms\Modules\Site\Rendering\AugmentedEntry::flush();

        $this->assertSame(['Last'], $this->linksOf($first), 'not a draft, not one whose time is over, not another language’s');
        $this->assertSame(['First'], $this->linksOf($last));
    }

    public function test_publishing_an_entry_builds_its_neighbours_again(): void
    {
        $this->template();
        $create = fn (string $title, int $position) => $this->cms()->entryService()->create('soundings', ['title' => $title, 'status' => 'published', 'position' => $position, 'data' => ['content' => []]])->id;
        $create('First', 0);
        $builder = $this->app->make(\Cms\Modules\Site\Build\SiteBuilder::class);
        $this->assertSame([], $builder->buildAll()['errors']);
        $this->assertStringNotContainsString('cms-link', (string) file_get_contents(public_path('soundings/first/index.html')));

        $create('Second', 1);
        while ($builder->hasWork()) {
            $builder->process(10_000);
        }

        $this->assertStringContainsString('>Second</a>', (string) file_get_contents(public_path('soundings/first/index.html')), 'the page before it now links to it');
    }
}

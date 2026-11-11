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
}

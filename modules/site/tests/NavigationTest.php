<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Modules\Blocks\Document;
use Cms\Modules\Site\Design\Design;
use Cms\Modules\Site\Rendering\Renderer;
use Cms\Tests\TestCase;

/** Client-side navigation is a choice of the design; pages stay complete HTML either way. */
final class NavigationTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    protected function collections(): array
    {
        return ['pages' => ['title' => 'Pages', 'route' => '/{slug}', 'body' => 'content', 'fields' => [['handle' => 'content', 'type' => 'blocks']]]];
    }

    private function page(array $blocks): string
    {
        $entry = $this->cms()->content()->create('pages', ['title' => 'Page '.bin2hex(random_bytes(3)), 'status' => 'published', 'data' => ['content' => $blocks]]);

        return $this->app->make(Renderer::class)->entry($this->cms()->entries()->find($entry->id))['html'];
    }

    public function test_pages_load_no_navigation_script_unless_the_design_asks(): void
    {
        $this->assertSame('document', $this->app->make(Design::class)->json()->transition()['navigation']);
        $html = $this->page([['type' => 'paragraph', 'props' => ['text' => 'Hello'], 'persist' => 'note']]);

        $this->assertStringNotContainsString('data-features', $html);
        $this->assertStringContainsString('data-cms-persist="note"', $html, 'harmless without it');
    }

    public function test_with_client_navigation_every_page_brings_the_script_and_keeps_its_links(): void
    {
        $this->cms()->abilities()->execute('design/update', ['transition' => ['type' => 'fade', 'duration' => 0.4, 'navigation' => 'client']], AbilityContext::system('test'));
        $this->assertSame(['type' => 'fade', 'duration' => 0.4, 'navigation' => 'client'], $this->cms()->abilities()->execute('design/get', [], AbilityContext::system('test'))['transition']);

        $html = $this->page([
            ['type' => 'link', 'props' => ['label' => 'About', 'url' => '/about']],
            ['type' => 'box', 'persist' => 'stage', 'children' => [['type' => 'paragraph', 'props' => ['text' => 'Stage']]]],
        ]);

        $this->assertMatchesRegularExpression('#<script type="module" src="[^"]+/runtime/cms-[^"]+\.js" data-features="navigate"></script>#', $html);
        $this->assertStringContainsString('<html lang="en" dir="ltr" data-cms-navigate-skip="/admin /api /install /media /_cms /__preview">', $html);
        $this->cms()->hooks()->addFilter('site.navigate.skip', fn (array $prefixes) => [...$prefixes, '/cart', '"><script>', 'no-slash']);
        $this->assertStringContainsString(' /__preview /cart">', $this->page([['type' => 'paragraph', 'props' => ['text' => 'Hi']]]), 'a plugin adds its paths; what is no path is dropped');
        $this->assertStringContainsString('href="/about"', $html, 'a link is a link: without the script the browser follows it');
        $this->assertStringContainsString('<div class="cms-box" data-cms-persist="stage">', $html);
        $this->assertStringContainsString('[data-cms-persist="stage"]{view-transition-name:cms-persist-stage}', $html);

        $canvas = $this->app->make(Renderer::class)->blocks([['id' => 'b1', 'type' => 'box', 'persist' => 'stage', 'children' => []]]);
        $this->assertStringNotContainsString('data-cms-persist', $canvas);
        $this->assertStringNotContainsString('navigate', $canvas);
    }

    public function test_a_persist_name_is_a_plain_name(): void
    {
        $normalize = fn (mixed $persist) => $this->app->make(Document::class)->normalize([['type' => 'box', 'persist' => $persist, 'children' => []]])[0];

        $this->assertSame('stage-1', $normalize('stage-1')['persist']);
        $this->assertArrayNotHasKey('persist', $normalize('"]{}body{display:none}'));
        $this->assertArrayNotHasKey('persist', $normalize(['stage']));
    }
}

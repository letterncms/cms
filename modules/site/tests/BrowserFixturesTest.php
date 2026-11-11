<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Modules\Site\Build\SiteBuilder;
use Cms\Support\Files;
use Cms\Tests\TestCase;

/**
 * Builds a small site that uses what runs in the browser, the way a real site would. With
 * CMS_BROWSER_FIXTURES=<folder> its public/ is copied there, and `node modules/site/tests/browser.mjs
 * --fixtures <folder>` opens the pages in headless Chrome and checks what they do.
 */
final class BrowserFixturesTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    protected function collections(): array
    {
        return ['pages' => ['title' => 'Pages', 'route' => '/{slug}', 'body' => 'content', 'fields' => [['handle' => 'content', 'type' => 'blocks']]]];
    }

    public function test_the_fixture_site_builds(): void
    {
        // A library from a CDN that is an array: kept in content/design/vendor and imported by name.
        $this->app->instance(\Cms\Modules\Site\Design\VendorFetcher::class, new FakeVendorFetcher([
            'https://cdn.jsdelivr.net/npm/tiny@1.0.0/+esm' => "export default { name: 'tiny' }\n",
        ]));
        $this->app->forgetInstance(\Cms\Modules\Site\Design\Vendor::class);
        $this->app->forgetInstance(\Cms\Modules\Site\Design\Code::class);
        $this->app->make(\Cms\Modules\Site\Design\Vendor::class)->add('tiny@1.0.0');

        foreach ($this->files() as $path => $contents) {
            Files::put(content_path('design/'.$path), $contents);
        }

        foreach ($this->pages() as $title => $blocks) {
            $this->cms()->content()->create('pages', ['title' => $title, 'status' => 'published', 'data' => ['content' => $blocks]]);
        }

        $status = $this->app->make(SiteBuilder::class)->buildAll();
        $this->assertSame([], $status['errors']);
        $this->assertSame([], $status['warnings']);

        if ($target = getenv('CMS_BROWSER_FIXTURES')) {
            Files::deleteDirectory($target);
            Files::copyDirectory(public_path(), $target);
        }
    }

    /** @return array<string, string> path under content/design => contents */
    private function files(): array
    {
        return [
            'scripts/lib/ease.js' => "export const ease = () => 'eased'\n",
            'scripts/hero.js' => "import { ease } from './lib/ease.js'\nimport tiny from 'tiny'\ndocument.documentElement.dataset.hero = ease()\ndocument.documentElement.dataset.vendor = tiny.name\n",
            // Says on the element what it was handed, and on the page what it undid.
            'scripts/probe.js' => <<<'JS'
                export function mount(el, props, { token, reducedMotion, signal }) {
                  el.dataset.mounted = JSON.stringify({ props, primary: token('color.primary'), reducedMotion })
                  window.__mounts = (window.__mounts ?? 0) + 1
                  signal.addEventListener('abort', () => (document.documentElement.dataset.aborted = props.name))
                  return () => (document.documentElement.dataset.cleaned = props.name)
                }
                export function unmount(el) {
                  document.documentElement.dataset.unmounted = el.dataset.mounted ? 'yes' : 'no'
                }
                JS,
            'styles/hero.css' => ".hero{outline:3px solid rgb(1, 2, 3)}\n",
        ];
    }

    /** @return array<string, list<array>> title => blocks */
    private function pages(): array
    {
        return [
            'Code' => [['type' => 'box', 'class' => 'hero', 'code' => ['scripts' => ['hero'], 'styles' => ['hero']], 'children' => [['type' => 'paragraph', 'props' => ['text' => 'Hero']]]]],
            'Behavior' => [
                ['type' => 'box', 'anchor' => 'first', 'behavior' => ['module' => 'probe', 'props' => ['name' => 'first', 'title' => '{entry.title}']], 'children' => [['type' => 'paragraph', 'props' => ['text' => 'First']]]],
                ['type' => 'box', 'style' => ['base' => ['height' => '400vh']], 'children' => []],
                ['type' => 'box', 'anchor' => 'later', 'behavior' => ['module' => 'probe', 'props' => ['name' => 'later'], 'when' => 'visible'], 'children' => [['type' => 'paragraph', 'props' => ['text' => 'Later']]]],
            ],
        ];
    }
}

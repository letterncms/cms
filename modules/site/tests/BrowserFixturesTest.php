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
    use InstallsStarterSite;

    public function createApplication()
    {
        $app = parent::createApplication();
        // The browser looks at real pages: for its fixtures the CSS is compiled, by the Node that runs the checks.
        getenv('CMS_BROWSER_FIXTURES') && putenv('CMS_NODE');

        return $app;
    }

    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    protected function collections(): array
    {
        return [
            'pages' => ['title' => 'Pages', 'route' => '/{slug}', 'fields' => [['handle' => 'content', 'type' => 'blocks', 'body' => true]]],
            'topics' => ['title' => 'Topics', 'type' => 'tags', 'route' => '/topics/{slug}', 'fields' => []],
            // Posts have a page per topic: the term's archive.
            'posts' => ['title' => 'Posts', 'route' => '/posts/{slug}', 'fields' => [['handle' => 'topics', 'type' => 'terms', 'taxonomy' => 'topics']], 'archives' => ['topics' => '/posts/topics/{slug}']],
        ];
    }

    public function test_the_fixture_site_builds(): void
    {
        // A library from a CDN that is an array: kept in content/styling/vendor and imported by name.
        $this->app->instance(\Cms\Modules\Site\Styling\VendorFetcher::class, new FakeVendorFetcher([
            'https://cdn.jsdelivr.net/npm/tiny@1.0.0/+esm' => "export default { name: 'tiny' }\n",
        ]));
        $this->app->forgetInstance(\Cms\Modules\Site\Styling\Vendor::class);
        $this->app->forgetInstance(\Cms\Modules\Site\Styling\Code::class);
        $this->app->make(\Cms\Modules\Site\Styling\Vendor::class)->add('tiny@1.0.0');

        foreach ($this->files() as $path => $contents) {
            Files::put(content_path('styling/'.$path), $contents);
        }

        // The pages' security policy is on, as on a new site: every check runs under it.
        $this->cms()->settingsRegistry()->save('site', ['csp' => true]);

        // Every page: links to two pages, and a stage that both keep.
        $this->cms()->entryService()->create('templates', ['title' => 'Default', 'slug' => 'default', 'status' => 'published', 'data' => ['blocks' => [
            ['type' => 'box', 'props' => ['tag' => 'nav'], 'children' => [
                ['type' => 'link', 'anchor' => 'to-one', 'props' => ['label' => 'One', 'url' => '/one']],
                ['type' => 'link', 'anchor' => 'to-two', 'props' => ['label' => 'Two', 'url' => '/two#deep']],
                ['type' => 'link', 'anchor' => 'to-two-plain', 'props' => ['label' => 'Two, from the top', 'url' => '/two']],
            ]],
            ['type' => 'box', 'anchor' => 'stage', 'persist' => 'stage', 'behavior' => ['module' => 'probe', 'props' => ['name' => 'stage']], 'children' => []],
            ['type' => 'box', 'props' => ['tag' => 'main'], 'anchor' => 'main', 'children' => [['type' => 'outlet']]],
        ]]]);
        $this->app->make(\Cms\Modules\Blocks\Templates::class)->flush();

        foreach ($this->pages() as $title => $blocks) {
            $this->cms()->entryService()->create('pages', ['title' => $title, 'status' => 'published', 'data' => ['content' => $blocks]]);
        }

        // A topic with more posts than one page of its archive lists.
        $tides = $this->cms()->entryService()->create('topics', ['title' => 'Tides', 'status' => 'published']);

        foreach (range(1, 12) as $n) {
            $this->cms()->entryService()->create('posts', ['title' => sprintf('Tide %02d', $n), 'status' => 'published', 'data' => ['topics' => [$tides->id]]]);
        }

        $this->cms()->entryService()->create('posts', ['title' => 'Unfiled', 'status' => 'published']);

        // The stylesheet styles emphasis inside a heading: an element style of its own, in the base layer.
        $styling = $this->app->make(\Cms\Modules\Site\Styling\Styling::class);
        $this->cms()->abilities()->execute('styling/update', ['css' => $styling->theme()."\n@layer base {\n  h2 em { font-style: normal; color: rgb(7, 8, 9); }\n}\n"], \Cms\Abilities\AbilityContext::system('test'));
        $status = $this->app->make(SiteBuilder::class)->buildAll();
        $this->assertSame([], $status['errors']);
        $this->assertSame([], $status['warnings']);

        // The builder's canvas of a block that a behaviour draws, and of one that has content of its own.
        Files::put(public_path('canvas/index.html'), $this->app->make(\Cms\Modules\Site\Rendering\Renderer::class)->blocks([
            ['id' => 'drawn', 'type' => 'box', 'anchor' => 'drawn', 'behavior' => ['module' => 'probe'], 'children' => []],
            ['id' => 'filled', 'type' => 'box', 'anchor' => 'filled', 'behavior' => ['module' => 'probe'], 'children' => [['id' => 'p1', 'type' => 'paragraph', 'props' => ['text' => 'Words']]]],
        ]));

        $this->assertFileExists(public_path('posts/topics/tides/page/2/index.html'));

        $target = getenv('CMS_BROWSER_FIXTURES');

        if ($target) {
            Files::deleteDirectory($target);
            Files::copyDirectory(public_path(), $target.'/plain');
        }

        // The same site, navigating without page loads.
        $this->cms()->abilities()->execute('styling/update', ['transition' => ['type' => 'fade', 'duration' => 0.2, 'navigation' => 'client']], \Cms\Abilities\AbilityContext::system('test'));
        $status = $this->app->make(SiteBuilder::class)->buildAll();
        $this->assertSame([], $status['errors']);
        $this->assertStringContainsString('navigate', (string) file_get_contents(public_path('one/index.html')));
        $target && Files::copyDirectory(public_path(), $target.'/client');
    }

    /** A new site as it starts: the pages of the site Starter, with the security policy a new site has. */
    public function test_the_starter_site_builds_under_its_policy(): void
    {
        $this->installStarterSite();
        $this->cms()->hooks()->dispatch('cms.installed', $this->admin());
        $this->assertTrue((bool) $this->cms()->setting('site', 'csp'));
        // This test site has a collection of its own already, which install leaves alone: the site's pages go in by hand.
        $sites = $this->app->make(\Cms\Modules\Site\Sites\Sites::class);
        $applied = $this->app->make(\Cms\Modules\Site\Sites\SiteApplier::class)->apply($sites->findOrFail('starter'), 'full', 'replace', $this->admin(), withoutPlugins: true);
        $this->assertNotSame([], array_filter($applied['steps'], static fn (array $step) => $step['type'] === 'entry' && $step['action'] === 'create'));

        $status = $this->app->make(SiteBuilder::class)->buildAll();
        $this->assertSame([], $status['errors']);
        $this->assertMatchesRegularExpression('/Header set Content-Security-Policy "[^"]*script-src \'self\' \'wasm-unsafe-eval\' \'sha256-/', (string) file_get_contents(public_path('.htaccess')));
        $this->assertFileExists(public_path('index.html'), 'the starter has a home page');

        if ($target = getenv('CMS_BROWSER_FIXTURES')) {
            Files::copyDirectory(public_path(), $target.'/starter');
        }
    }

    /** @return array<string, string> path under content/styling => contents */
    private function files(): array
    {
        return [
            'scripts/lib/ease.js' => "export const ease = () => 'eased'\n",
            'scripts/hero.js' => "import { ease } from './lib/ease.js'\nimport tiny from 'tiny'\ndocument.documentElement.dataset.hero = ease()\ndocument.documentElement.dataset.vendor = tiny.name\n",
            // Says on the element what it was handed, and on the page what it undid.
            'scripts/probe.js' => <<<'JS'
                export function mount(el, props, { token, reducedMotion, signal }) {
                  el.dataset.mounted = JSON.stringify({ props, primary: token('--color-primary'), reducedMotion, ready: document.readyState, fonts: document.fonts.status })
                  window.__mounts = (window.__mounts ?? 0) + 1
                  signal.addEventListener('abort', () => (document.documentElement.dataset.aborted = props.name))
                  return () => (document.documentElement.dataset.cleaned = props.name)
                }
                export function unmount(el) {
                  document.documentElement.dataset.unmounted = el.dataset.mounted ? 'yes' : 'no'
                }
                JS,
            'styles/one.css' => ".only-one{outline:3px solid rgb(4, 5, 6)}\n",
            'scripts/tag.js' => "export function mount(el, { word }) {\n  el.dataset.tag = word\n  return () => (document.documentElement.dataset.untagged = word)\n}\n",
            'styles/hero.css' => ".hero{outline:3px solid rgb(1, 2, 3)}\n",
        ];
    }

    /** @return array<string, list<array>> title => blocks */
    private function pages(): array
    {
        return [
            'Code' => [['type' => 'box', 'class' => 'hero', 'code' => ['scripts' => ['hero'], 'styles' => ['hero']], 'children' => [['type' => 'paragraph', 'props' => ['text' => 'Hero']]]]],
            'One' => [
                ['type' => 'heading', 'props' => ['text' => 'Page one', 'level' => '1']],
                ['type' => 'box', 'anchor' => 'leaving', 'class' => 'only-one', 'code' => ['styles' => ['one']], 'behavior' => ['module' => 'probe', 'props' => ['name' => 'leaving']], 'children' => []],
                ['type' => 'box', 'class' => 'h-[300vh]', 'children' => []],
            ],
            'Two' => [
                ['type' => 'heading', 'props' => ['text' => 'Page two', 'level' => '1']],
                ['type' => 'box', 'class' => 'h-[150vh]', 'children' => []],
                ['type' => 'paragraph', 'anchor' => 'deep', 'props' => ['text' => 'Deep in page two']],
                // Alpine, on a page reached without a page load.
                ['type' => 'box', 'logic' => ['data' => ['open' => false]], 'children' => [
                    ['type' => 'box', 'props' => ['tag' => 'button'], 'anchor' => 'opener', 'attrs' => ['aria-controls' => '#shown'], 'logic' => ['attrs' => ['aria-expanded' => 'open'], 'on' => [['event' => 'click', 'actions' => [['do' => 'toggle', 'var' => 'open']]]]], 'children' => [['type' => 'paragraph', 'props' => ['text' => 'Open']]]],
                    ['id' => 'shown', 'type' => 'box', 'anchor' => 'opened', 'logic' => ['show' => 'open'], 'children' => [['type' => 'paragraph', 'props' => ['text' => 'Now you see it']]]],
                ]],
                ['type' => 'link', 'anchor' => 'with-query', 'props' => ['label' => 'Sign out', 'url' => '/one?signout=1']],
                ['type' => 'link', 'anchor' => 'same-query', 'props' => ['label' => 'Add', 'url' => '/two?add=5']],
                ['type' => 'box', 'class' => 'h-[150vh]', 'children' => []],
            ],
            // The largest text of the page, with a page load animation from transparent.
            'Lcp' => [
                ['type' => 'heading', 'props' => ['text' => 'The largest text on this page by a long way', 'level' => '1'], 'class' => 'text-[4rem]', 'motion' => [['trigger' => ['type' => 'load'], 'steps' => [['target' => 'self', 'from' => ['opacity' => 0, 'y' => 24], 'duration' => 1.2, 'delay' => 0.2]]]]],
            ],
            'Motion' => [
                ['type' => 'box', 'class' => 'h-[120vh]', 'children' => []],
                // Followed with CSS where the browser can, by the runtime where it can't.
                ['type' => 'box', 'anchor' => 'linked', 'class' => 'h-50', 'motion' => [['trigger' => ['type' => 'scroll', 'start' => 'top bottom', 'end' => 'top top'], 'steps' => [['from' => ['opacity' => 0, 'y' => 60], 'to' => ['opacity' => 1, 'y' => 0], 'ease' => 'none']]]], 'children' => []],
                // Trails the scroll: the runtime's in every browser.
                ['type' => 'box', 'anchor' => 'trailing', 'class' => 'h-50', 'motion' => [['trigger' => ['type' => 'scroll', 'start' => 'top bottom', 'end' => 'top top', 'scrub' => 0.3], 'steps' => [['from' => ['opacity' => 0, 'y' => 60], 'to' => ['opacity' => 1, 'y' => 0], 'ease' => 'none']]]], 'children' => []],
                ['type' => 'box', 'anchor' => 'pinned', 'class' => 'h-screen', 'motion' => [['trigger' => ['type' => 'scroll', 'pin' => '200vh', 'progress' => true], 'steps' => [['from' => ['opacity' => 0], 'to' => ['opacity' => 1], 'ease' => 'none']]]], 'children' => [['type' => 'paragraph', 'props' => ['text' => 'Pinned']]]],
                // Lines that CSS animates (load): the runtime numbers them once the text is laid out.
                ['type' => 'heading', 'anchor' => 'load-lines', 'props' => ['text' => 'One two three four five six seven eight nine ten eleven twelve', 'level' => '2'], 'class' => 'w-65', 'motion' => [['trigger' => ['type' => 'load'], 'steps' => [['target' => 'lines', 'from' => ['yPercent' => 110], 'duration' => 0.4, 'stagger' => 0.1]]]]],
                ['type' => 'heading', 'anchor' => 'lines', 'props' => ['text' => 'One two three four five six seven eight nine ten eleven twelve', 'level' => '2'], 'class' => 'mt-[150vh] w-65', 'motion' => [['trigger' => ['type' => 'appear'], 'steps' => [['target' => 'lines', 'from' => ['yPercent' => 110], 'duration' => 0.4, 'stagger' => 0.1]]]]],
                ['type' => 'box', 'class' => 'h-[120vh]', 'children' => []],
            ],
            // Styles for dark, on a site that follows the visitor's system.
            'Dark' => [
                ['type' => 'heading', 'anchor' => 'water', 'props' => ['text' => 'Land and <em>water</em>', 'level' => '2']],
                ['type' => 'paragraph', 'anchor' => 'prose-em', 'props' => ['text' => 'Plain <em>emphasis</em>']],
                ['type' => 'box', 'anchor' => 'plain', 'class' => 'h-10 bg-[rgb(250,250,250)] dark:bg-[rgb(1,2,3)]', 'children' => []],
                ['type' => 'box', 'anchor' => 'narrow', 'class' => 'h-10 bg-[rgb(250,250,250)] max-md:bg-[rgb(240,240,240)] max-md:dark:bg-[rgb(4,5,6)]', 'children' => []],
                ['type' => 'box', 'anchor' => 'hovered', 'class' => 'text-[rgb(10,10,10)] hover:text-[rgb(20,20,20)] dark:text-[rgb(200,200,200)]', 'children' => [['type' => 'paragraph', 'props' => ['text' => 'Text']]]],
            ],
            // A Motion Toggle, and a behaviour that should hear it.
            'Toggle' => [
                ['type' => 'motion-toggle', 'anchor' => 'toggle'],
                ['type' => 'box', 'anchor' => 'heard', 'behavior' => ['module' => 'probe', 'props' => ['name' => 'heard']], 'children' => []],
                ['type' => 'box', 'class' => 'size-10', 'motion' => [['trigger' => ['type' => 'loop'], 'steps' => [['from' => ['rotate' => 0], 'to' => ['rotate' => 360], 'duration' => 2, 'ease' => 'none']], 'repeat' => -1]], 'children' => []],
            ],
            'Behavior' => [
                ['type' => 'box', 'anchor' => 'first', 'behavior' => ['module' => 'probe', 'props' => ['name' => 'first', 'title' => '{entry.title}']], 'children' => [['type' => 'paragraph', 'props' => ['text' => 'First']]]],
                ['type' => 'box', 'anchor' => 'both', 'behavior' => [['module' => 'probe', 'props' => ['name' => 'one-of-two']], ['module' => 'tag', 'props' => ['word' => 'tagged']]], 'children' => []],
                ['type' => 'box', 'anchor' => 'settled', 'behavior' => ['module' => 'probe', 'props' => ['name' => 'settled'], 'when' => 'loaded'], 'children' => []],
                ['type' => 'box', 'class' => 'h-[400vh]', 'children' => []],
                ['type' => 'box', 'anchor' => 'later', 'behavior' => ['module' => 'probe', 'props' => ['name' => 'later'], 'when' => 'visible'], 'children' => [['type' => 'paragraph', 'props' => ['text' => 'Later']]]],
            ],
        ];
    }
}

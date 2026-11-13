<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Modules\Media\MediaItem;
use Cms\Tests\TestCase;

/** Blocks, design, media, navigation and site abilities answer with what their output schemas say (checked on every execute). */
final class OutputSiteTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    protected function collections(): array
    {
        return [
            'pages' => ['title' => 'Pages', 'route' => '/{slug}', 'fields' => [['handle' => 'content', 'type' => 'blocks', 'body' => true], ['handle' => 'cover', 'type' => 'media'], ['handle' => 'note', 'type' => 'textarea'], ['handle' => 'link', 'type' => 'text']]],
        ];
    }

    /** What the ability answers with; with `$refused`, nothing: it has to refuse with that code. */
    private function ability(string $ability, array $input = [], ?string $refused = null): mixed
    {
        $this->ctx ??= AbilityContext::forUser($this->admin(), 'rest');

        try {
            $result = $this->cms()->abilities()->execute($ability, $input, $this->ctx);
        } catch (\Cms\Abilities\AbilityException $e) {
            $this->assertSame($refused, $e->type, $e->getMessage());

            return [];
        }

        $this->assertNull($refused, "{$ability} did not refuse");

        return $result;
    }

    private ?AbilityContext $ctx = null;

    public function test_block_abilities_answer_as_described(): void
    {
        $this->assertNotEmpty($this->ability('blocks/types')['blocks']);

        $icons = $this->ability('blocks/icons', ['query' => 'arrow', 'limit' => 5]);
        $this->assertCount(5, $icons);
        $this->assertSame([], $this->ability('blocks/icons', ['query' => 'no-such-icon-anywhere']));

        $blocks = $this->ability('blocks/from-markdown', ['markdown' => "# Hello\n\nSome **text**.\n\n- one\n- two\n"]);
        $this->assertSame('heading', $blocks[0]['type']);
        $this->assertSame([], $this->ability('blocks/from-markdown', ['markdown' => '']));

        $this->assertStringContainsString('Hello', $this->ability('blocks/to-markdown', ['blocks' => $blocks])['markdown']);
        $this->assertSame('', trim($this->ability('blocks/to-markdown', ['blocks' => []])['markdown']));

        $nested = $this->ability('blocks/from-markdown', ['markdown' => ":::section {\"anchor\":\"top\",\"style\":{\"base\":{\"paddingTop\":\"2rem\"}}}\n## Inside\n:::\n"]);
        $this->assertSame('top', $nested[0]['anchor']);
        $this->assertSame('heading', $nested[0]['children'][0]['type']);
        // A type nobody registered (a plugin that is off) stays as it was written.
        $this->assertSame(['x' => 1], $this->ability('blocks/from-markdown', ['markdown' => ":::plugin/unknown {\"props\":{\"x\":1},\"label\":\"Kept\"}\n:::\n"])[0]['props']);
    }

    public function test_components_and_templates_answer_as_described(): void
    {
        $this->assertSame([], $this->ability('components/list'));
        $this->assertSame([], $this->ability('templates/list'));

        $blocks = [['type' => 'heading', 'props' => ['text' => 'Card']]];
        $draft = $this->ability('components/save', ['handle' => 'teaser', 'title' => 'Teaser', 'blocks' => $blocks, 'publish' => false]);
        $this->assertSame([], $this->ability('components/list'));
        $this->assertCount(1, $this->ability('components/list', ['working' => true]));

        $card = $this->ability('components/save', ['handle' => 'card', 'title' => 'Card', 'description' => 'A card', 'category' => 'Cards', 'blocks' => $blocks,
            'props' => [['handle' => 'title', 'type' => 'text', 'label' => 'Title']]]);
        $again = $this->ability('components/save', ['handle' => 'card', 'title' => 'Card Two', 'blocks' => $blocks]);
        $this->assertSame($card['id'], $again['id']);
        $this->assertSame(['card'], array_column($this->ability('components/list'), 'handle'));

        // Everything a node can carry: styles, attributes, bindings, a script, an animation, children, a type nobody registered.
        $hero = $this->ability('components/save', ['handle' => 'hero', 'title' => 'Hero', 'blocks' => self::richBlocks()])['blocks'][0];
        $this->assertEqualsCanonicalizing(['id', 'type', 'props', 'style', 'anchor', 'class', 'label', 'attrs', 'bind', 'logic', 'motion', 'hidden', 'code', 'behavior', 'persist', 'children'], array_keys($hero));
        $this->assertSame(['module' => 'tilt', 'props' => ['max' => 8, 'nested' => ['a' => [1, 2]]], 'when' => 'visible'], $hero['behavior']);
        $this->assertSame(['type' => 'scroll', 'start' => 'top 85%', 'end' => 'bottom top', 'once' => true, 'pin' => '150vh', 'scrub' => 0.6], $hero['motion'][0]['trigger']);
        $this->assertSame(['scroll', 'spy', 'group', 'menu', 'carousel', 'marquee'], array_keys($hero['logic']['behaviors']));
        $this->assertSame(['if', 'play', 'scroll', 'copy', 'theme', 'focus', 'dispatch', 'fetch', 'lock', 'add'], array_column($hero['logic']['on'][0]['actions'], 'do'));
        $this->assertSame('words', $hero['motion'][0]['steps'][0]['target']);
        $this->assertSame('plugin/unknown', $hero['children'][1]['type']);
        $this->assertCount(2, $this->ability('components/list'));

        $this->cms()->entryService()->create('templates', ['title' => 'Default', 'slug' => 'default', 'status' => 'published', 'data' => ['description' => 'Frames pages', 'collections' => ['pages'], 'blocks' => [['type' => 'outlet']]]]);
        $this->cms()->entryService()->create('templates', ['title' => 'Bare', 'slug' => 'bare', 'status' => 'draft', 'data' => ['blocks' => []]]);
        $this->app->make(\Cms\Modules\Blocks\Templates::class)->flush();
        $this->assertSame(['default'], array_column($this->ability('templates/list'), 'handle'));
        $this->assertCount(2, $this->ability('templates/list', ['working' => true]));

        $this->cms()->entryService()->create('templates', ['title' => 'Rich', 'slug' => 'rich', 'status' => 'published', 'data' => ['blocks' => self::richBlocks()]]);
        $this->app->make(\Cms\Modules\Blocks\Templates::class)->flush();
        $this->assertArrayHasKey('logic', $this->ability('templates/list')[1]['blocks'][0]);
    }

    private static function richBlocks(): array
    {
        return [[
            'type' => 'section', 'label' => 'Hero', 'anchor' => 'hero', 'class' => 'wide', 'hidden' => true,
            'style' => ['base' => ['paddingTop' => '2rem', 'opacity' => 0.5], 'md:hover' => ['color' => 'token:color.primary']],
            'attrs' => ['data-test' => 'x', 'role' => 'region'],
            'bind' => ['visible' => 'entry.title'],
            'code' => ['scripts' => ['hero', 'lib/ease'], 'styles' => ['hero']],
            'behavior' => ['module' => 'tilt', 'props' => ['max' => 8, 'nested' => ['a' => [1, 2]]], 'when' => 'visible'],
            'persist' => 'stage',
            'logic' => [
                'data' => ['open' => false, 'count' => 1, 'tags' => ['a']],
                'init' => [['do' => 'set', 'var' => 'open', 'value' => 'true']],
                'on' => [['event' => 'click', 'mods' => ['prevent'], 'key' => 'enter', 'actions' => [
                    ['do' => 'if', 'test' => 'open', 'then' => [['do' => 'toggle', 'var' => 'open'], ['do' => 'wait', 'ms' => 100]], 'else' => [['do' => 'go', 'url' => '/x', 'newTab' => true]]],
                    ['do' => 'play', 'node' => 'b1', 'motion' => 'm1'], ['do' => 'scroll', 'to' => 'top'], ['do' => 'copy', 'value' => 'open'], ['do' => 'theme'],
                    ['do' => 'focus', 'node' => 'b1'], ['do' => 'dispatch', 'event' => 'ping', 'detail' => 'open'], ['do' => 'fetch', 'url' => '/x', 'target' => ['b1']],
                    ['do' => 'lock'], ['do' => 'add', 'var' => 'count'],
                ]]],
                'show' => 'open', 'transition' => 'fade', 'text' => 'count', 'states' => ['open' => 'open'], 'attrs' => ['aria-expanded' => 'open'], 'model' => 'query',
                'target' => ['b1'], 'push' => true, 'merge' => 'append',
                'behaviors' => ['scroll' => ['threshold' => 40, 'hide' => true], 'spy' => [], 'group' => true, 'menu' => true, 'carousel' => true, 'marquee' => ['speed' => 30]],
            ],
            'motion' => [[
                'id' => 'm1', 'name' => 'Fade Up', 'trigger' => ['type' => 'scroll', 'start' => 'top 85%', 'end' => 'bottom top', 'once' => true, 'pin' => '150vh', 'scrub' => 0.6], 'on' => ['desktop'],
                'steps' => [['target' => 'words', 'mask' => true, 'from' => ['opacity' => 0, 'y' => '2rem'], 'to' => ['color' => 'red'], 'duration' => 0.8, 'delay' => 0.1, 'ease' => 'expo.out', 'stagger' => 0.05, 'at' => 1]],
                'repeat' => -1, 'yoyo' => true, 'hold' => 2,
            ]],
            'children' => [['type' => 'heading', 'props' => ['text' => 'Hi']], ['type' => 'plugin/unknown', 'props' => ['x' => 1], 'extra' => 'kept']],
        ]];
    }

    public function test_navigation_abilities_answer_as_described(): void
    {
        $this->assertSame([], $this->ability('navigation/list'));
        $this->assertSame([], $this->ability('navigation/create', ['title' => 'Main'])['items']);
        $this->assertSame('/x', $this->ability('navigation/create', ['title' => 'Footer', 'handle' => 'foot', 'maxDepth' => 1, 'items' => [['url' => '/x', 'label' => 'X']]])['items'][0]['url']);
        $this->assertSame([], $this->ability('navigation/create', ['title' => 'Again', 'handle' => 'foot'], 'conflict'));
        $this->assertSame([], $this->ability('navigation/update', ['handle' => 'none', 'items' => []], 'not_found'));
        $this->assertTrue($this->ability('navigation/delete', ['handle' => 'foot'])['deleted']);

        $page = $this->cms()->entryService()->create('pages', ['title' => 'About', 'slug' => 'about', 'status' => 'published']);
        $menu = $this->ability('navigation/update', ['handle' => 'main', 'maxDepth' => 3, 'items' => [
            ['entry' => $page->id, 'locales' => ['de' => ['label' => 'Über uns']], 'children' => [
                ['url' => '/jobs', 'label' => 'Jobs', 'newTab' => true, 'locales' => ['de' => ['label' => 'Stellen', 'url' => '/de/jobs'], 'pt-BR' => ['url' => '/pt/jobs']], 'children' => [['url' => '#top', 'label' => 'Top']]],
            ]],
        ]]);
        $this->assertSame('About', $menu['items'][0]['target']['title']);
        $this->assertSame(['label' => 'Stellen', 'url' => '/de/jobs'], $menu['items'][0]['children'][0]['locales']['de']);
        $this->assertSame('Top', $menu['items'][0]['children'][0]['children'][0]['label']);

        $this->assertCount(2, $this->ability('navigation/add-item', ['menu' => 'main', 'url' => 'https://example.com', 'label' => 'Elsewhere'])['items']);
        $this->assertSame(4, $this->ability('navigation/list')[0]['count']);

        // A hand-written file may link to an entry that is gone.
        \Cms\Support\Yaml::write(content_path('navigation/old.yaml'), ['title' => 'Old', 'items' => [['entry' => '01hzzzzzzzzzzzzzzzzzzzzzzz', 'label' => 'Gone']]]);
        $this->app->forgetInstance(\Cms\Modules\Navigation\Menus::class);
        $this->assertSame('missing', $this->ability('navigation/get', ['handle' => 'old'])['items'][0]['target']['status']);

        $this->assertTrue($this->ability('navigation/delete', ['handle' => 'old'])['deleted']);
        $this->assertFalse($this->ability('navigation/delete', ['handle' => 'old'])['deleted']);
    }

    public function test_design_abilities_answer_as_described(): void
    {
        $this->assertSame([], $this->ability('design-code/set-custom')['saved']);
        $this->assertSame(['css', 'js'], $this->ability('design-code/set-custom', ['css' => 'body { color: red }', 'js' => 'console.log(1)'])['saved']);

        $font = $this->ability('design/fonts-upload', ['family' => 'Test Sans', 'data' => base64_encode('wOF2'.str_repeat("\0", 40))]);
        $this->assertSame('fonts/test-sans-400.woff2', $font['src']);
        $italic = $this->ability('design/fonts-upload', ['family' => 'Test Sans', 'name' => 'Test Sans Italic', 'data' => 'data:font/woff2;base64,'.base64_encode('wOF2'.str_repeat("\0", 40)), 'weight' => '100 900', 'style' => 'italic']);
        $this->assertSame('italic', $italic['style']);

        // Importing asks Google Fonts; here the files it would bring are given, as Fonts::import() answers.
        $this->assertSame([], $this->ability('design/fonts-import', ['family' => '!!'], 'invalid_input'));
        $this->app->bind(\Cms\Modules\Site\Design\Fonts::class, static fn () => new class
        {
            public function import(string $family, string $style = 'normal', array $weights = []): array
            {
                $italic = $style !== 'normal';

                return [
                    ['family' => $family, 'src' => 'fonts/inter-100-900.woff2', 'weight' => '100 900', 'style' => 'normal', 'preload' => true],
                    ...($italic ? [['family' => $family, 'src' => 'fonts/inter-100-900-italic.woff2', 'weight' => '100 900', 'style' => 'italic', 'preload' => false]] : []),
                ];
            }
        });
        $this->assertCount(2, $this->ability('design/fonts-import', ['family' => 'Inter', 'italic' => true])['fonts']);
        $this->app->offsetUnset(\Cms\Modules\Site\Design\Fonts::class);

        $this->ability('design/update', ['tokens' => ['color.primary' => '#0f766e', 'text.xl' => ['min' => '1.25rem', 'max' => '1.5rem']], 'dark' => ['color.primary' => '#5eead4'],
            'styles' => ['body' => ['color' => 'token:color.primary', 'lineHeight' => 1.5], 'a:hover' => ['textDecoration' => 'underline']],
            'prose' => ['spacing' => ['blocks' => '1em', 'items' => 0.5], 'h2' => ['fontSize' => '2rem']], 'buttons' => ['primary' => ['surface' => 'token:color.primary', 'base' => ['color' => '#fff'], 'hover' => ['opacity' => 0.9]]], 'fields' => ['field' => ['radius' => '0.25rem', 'borderWidth' => 2], 'spacing' => ['size' => 'lg']],
            'transition' => ['type' => 'fade', 'duration' => 0.4, 'navigation' => 'client']]);
        $this->assertNotEmpty($this->ability('design/preview', ['tokens' => ['color.primary' => '#000'], 'css' => 'a { color: blue }'])['css']);
        $design = $this->ability('design/get');
        $this->assertCount(2, $design['fonts']);
        $this->assertCount(2, $design['fontFiles']);
        $this->assertStringContainsString('color: red', $design['css']);
        $this->assertSame(['min' => '1.25rem', 'max' => '1.5rem'], array_column($design['tokens'], 'value', 'path')['text.xl']);
        $this->assertSame('#5eead4', array_column($design['tokens'], 'dark', 'path')['color.primary']);
        $this->assertSame(['h2', 'spacing'], array_keys((array) $design['prose']));
        $this->assertSame(['field' => ['radius' => '0.25rem', 'borderWidth' => 2], 'spacing' => ['size' => 'lg']], (array) $design['fields']);
        $this->assertSame(1.5, ((array) $design['styles'])['body']['lineHeight']);
        $this->assertSame(['type' => 'fade', 'duration' => 0.4, 'navigation' => 'client'], $design['transition']);
    }

    public function test_design_code_abilities_answer_as_described(): void
    {
        // Nothing yet: `templates` and `components` are maps also when empty.
        $this->assertSame(['scripts' => [], 'styles' => [], 'load' => ['scripts' => [], 'styles' => [], 'templates' => [], 'components' => []]], $this->ability('design-code/list'));

        $this->assertSame(['saved' => 'scripts/lib/ease.js'], $this->ability('design-code/save', ['path' => 'scripts/lib/ease.js', 'contents' => 'export const ease = 1']));
        $this->assertSame(['saved' => 'styles/hero.css'], $this->ability('design-code/save', ['path' => 'styles/hero.css', 'contents' => '.hero{color:red}']));
        $this->assertSame([], $this->ability('design-code/save', ['path' => 'scripts/../x.js', 'contents' => 'x'], 'invalid_input'));
        $this->assertSame('scripts/lib/ease.js', $this->ability('design-code/get', ['path' => 'scripts/lib/ease.js'])['path']);
        $this->assertSame([], $this->ability('design-code/get', ['path' => 'scripts/none.js'], 'not_found'));

        $loaded = $this->ability('design-code/set-load', ['scripts' => ['lib/ease'], 'templates' => ['post' => ['styles' => ['hero']]], 'components' => ['header' => ['scripts' => ['lib/ease'], 'styles' => ['hero']]]]);
        $this->assertSame(['lib/ease'], $loaded['scripts']);
        $this->assertSame(['scripts' => [], 'styles' => ['hero']], $loaded['load']['templates']['post']);
        $this->assertSame($loaded, $this->ability('design-code/list'));

        $this->assertSame(['deleted' => 'styles/hero.css'], $this->ability('design-code/delete', ['path' => 'styles/hero.css']));
        $this->assertSame([], $this->ability('design-code/list')['styles']);
    }

    public function test_design_vendor_abilities_answer_as_described(): void
    {
        $this->app->instance(\Cms\Modules\Site\Design\VendorFetcher::class, new \Cms\Modules\Site\Tests\FakeVendorFetcher([
            'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm' => "const gsap={to(){}};export{gsap as default};\n",
            'https://cdn.jsdelivr.net/npm/gsap@3.13.0/+esm' => "const gsap={to(){},v:2};export{gsap as default};\n",
            'https://registry.npmjs.org/gsap/latest' => '{"name":"gsap","version":"3.13.0"}',
            'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.mjs/+esm' => "export default class Lenis{}\n",
        ]));
        $this->app->forgetInstance(\Cms\Modules\Site\Design\Vendor::class);
        $this->app->forgetInstance(\Cms\Modules\Site\Design\Code::class);

        $this->assertSame(['imports' => []], $this->ability('design-vendor/list'));

        $added = $this->ability('design-vendor/create', ['package' => 'gsap@3.12.5']);
        $this->assertSame(['gsap'], $added['added']);
        $this->assertNull($added['imports'][0]['file']);
        $this->assertSame('/_cms/site/vendor/gsap@3.12.5/index.js', $added['imports'][0]['url']);
        $this->assertSame('dist/lenis.mjs', $this->ability('design-vendor/create', ['package' => 'lenis@1.1.13', 'file' => 'dist/lenis.mjs', 'as' => 'lenis'])['imports'][1]['file']);
        $this->assertSame([], $this->ability('design-vendor/create', ['package' => 'gsap@^3'], 'invalid_input'));

        $this->assertSame('3.13.0', $this->ability('design-vendor/update', ['import' => 'gsap'])['version']);
        $this->assertSame([], $this->ability('design-vendor/update', ['import' => 'none'], 'invalid_input'));
        $this->assertCount(2, $this->ability('design-vendor/list')['imports']);

        $removed = $this->ability('design-vendor/delete', ['import' => 'lenis']);
        $this->assertSame('lenis', $removed['removed']);
        $this->assertSame(['gsap'], array_column($removed['imports'], 'import'));
    }

    public function test_site_abilities_answer_as_described(): void
    {
        $idle = $this->ability('site/build-status');
        $this->assertSame('idle', $idle['state']);

        $page = $this->cms()->entryService()->create('pages', ['title' => 'About', 'slug' => 'about', 'status' => 'published', 'data' => ['content' => [['type' => 'heading', 'props' => ['text' => 'About']]]]]);
        $this->assertStringEndsWith('/__preview/'.$page->id, $this->ability('site/preview-url', ['id' => $page->id])['url']);

        $built = $this->ability('site/build');
        $this->assertContains($built['state'], ['queued', 'running', 'done']);
        $this->assertIsArray($this->ability('site/build-status')['errors']);
    }

    public function test_media_abilities_answer_as_described(): void
    {
        $this->assertSame([], $this->ability('media/get-many', ['ids' => []])['items']);
        $this->assertSame(0, $this->ability('media/report')['items']);

        $im = imagecreatetruecolor(40, 30);
        ob_start();
        imagepng($im);
        $image = $this->ability('media/import', ['filename' => 'dot.png', 'data' => base64_encode((string) ob_get_clean()), 'alt' => 'A dot', 'folder' => 'tests']);
        $this->assertSame('image', $image['kind']);
        $this->assertSame('A dot', $image['alt']);
        $text = $this->ability('media/import', ['filename' => 'notes.txt', 'data' => 'data:text/plain;base64,'.base64_encode('hello')]);
        $this->assertNull($text['width']);

        $updated = $this->ability('media/update', ['id' => $image['id'], 'name' => 'Dot', 'caption' => 'Small', 'folder' => 'icons', 'focal' => ['x' => 10, 'y' => 90]]);
        $this->assertSame(['x' => 10, 'y' => 90], $updated['focal']);
        $this->assertSame($text['id'], $this->ability('media/update', ['id' => $text['id']])['id']);

        $this->assertSame([$text['id'], $image['id']], array_column($this->ability('media/get-many', ['ids' => [$text['id'], 'nothing', $image['id']]])['items'], 'id'));
        $this->assertCount(2, $this->ability('media/list', ['folder' => null])['items']);
        $listed = $this->ability('media/list', ['kind' => 'image', 'folder' => 'icons', 'search' => 'Dot']);
        $this->assertSame(['icons'], $listed['folders']);
        $this->assertSame([$image['id']], array_column($listed['items'], 'id'));
        $this->assertSame([], $this->ability('media/list', ['search' => 'nothing-like-this'])['items']);

        // One file in use, one reference to nothing, one record without a file.
        $gone = '01hzzzzzzzzzzzzzzzzzzzzzzz';
        $this->cms()->entryService()->create('pages', ['title' => 'Uses', 'slug' => 'uses', 'status' => 'published', 'data' => ['cover' => [$image['id']], 'note' => 'Background: media:'.$gone, 'link' => '/media/none.png']]);
        MediaItem::query()->create(['name' => 'Lost', 'filename' => 'lost.txt', 'path' => 'media/lost.txt', 'mime' => 'text/plain', 'size' => 1, 'hash' => hash('sha256', 'lost'), 'folder' => '']);
        $report = $this->ability('media/report');
        $this->assertSame(3, $report['items']);
        $this->assertEqualsCanonicalizing([$gone, '/media/none.png'], array_column($report['dangling'], 'id'));
        $this->assertCount(1, $report['missing_files']);
        $this->assertContains($text['id'], $report['unused']);

        $this->assertSame($text['id'], $this->ability('media/delete', ['id' => $text['id']])['deleted']);
    }
}

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
            'pages' => ['title' => 'Pages', 'route' => '/{slug}', 'body' => 'content', 'fields' => [['handle' => 'content', 'type' => 'blocks'], ['handle' => 'cover', 'type' => 'media'], ['handle' => 'note', 'type' => 'textarea'], ['handle' => 'link', 'type' => 'text']]],
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

    public function test_patterns_and_templates_answer_as_described(): void
    {
        $this->assertSame([], $this->ability('patterns/list'));
        $this->assertSame([], $this->ability('templates/list'));

        $blocks = [['type' => 'heading', 'props' => ['text' => 'Card']]];
        $draft = $this->ability('patterns/save', ['handle' => 'teaser', 'title' => 'Teaser', 'blocks' => $blocks, 'publish' => false]);
        $this->assertFalse($draft['synced']);
        $this->assertSame([], $this->ability('patterns/list'));
        $this->assertCount(1, $this->ability('patterns/list', ['working' => true]));

        $card = $this->ability('patterns/save', ['handle' => 'card', 'title' => 'Card', 'description' => 'A card', 'category' => 'Cards', 'synced' => true, 'blocks' => $blocks,
            'props' => [['handle' => 'title', 'type' => 'text', 'label' => 'Title']]]);
        $this->assertTrue($card['synced']);
        $again = $this->ability('patterns/save', ['handle' => 'card', 'title' => 'Card Two', 'blocks' => $blocks]);
        $this->assertSame($card['id'], $again['id']);
        $this->assertSame(['card'], array_column($this->ability('patterns/list'), 'handle'));

        // Everything a node can carry: styles, attributes, bindings, a script, an animation, children, a type nobody registered.
        $hero = $this->ability('patterns/save', ['handle' => 'hero', 'title' => 'Hero', 'blocks' => self::richBlocks()])['blocks'][0];
        $this->assertEqualsCanonicalizing(['id', 'type', 'props', 'style', 'anchor', 'class', 'label', 'attrs', 'bind', 'logic', 'motion', 'hidden', 'children'], array_keys($hero));
        $this->assertSame(['scroll', 'spy', 'group', 'menu', 'carousel', 'marquee'], array_keys($hero['logic']['behaviors']));
        $this->assertSame(['if', 'play', 'scroll', 'copy', 'theme', 'focus', 'dispatch', 'fetch', 'lock', 'add'], array_column($hero['logic']['on'][0]['actions'], 'do'));
        $this->assertSame('words', $hero['motion'][0]['steps'][0]['target']);
        $this->assertSame('plugin/unknown', $hero['children'][1]['type']);
        $this->assertCount(2, $this->ability('patterns/list'));

        $this->cms()->content()->create('templates', ['title' => 'Default', 'slug' => 'default', 'status' => 'published', 'data' => ['description' => 'Frames pages', 'collections' => ['pages'], 'blocks' => [['type' => 'outlet']]]]);
        $this->cms()->content()->create('templates', ['title' => 'Bare', 'slug' => 'bare', 'status' => 'draft', 'data' => ['blocks' => []]]);
        $this->app->make(\Cms\Modules\Blocks\Templates::class)->flush();
        $this->assertSame(['default'], array_column($this->ability('templates/list'), 'handle'));
        $this->assertCount(2, $this->ability('templates/list', ['working' => true]));

        $this->cms()->content()->create('templates', ['title' => 'Rich', 'slug' => 'rich', 'status' => 'published', 'data' => ['blocks' => self::richBlocks()]]);
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
                'id' => 'm1', 'name' => 'Fade Up', 'trigger' => ['type' => 'scroll', 'start' => 'top 85%', 'end' => 'bottom top', 'once' => true], 'on' => ['desktop'],
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

        $page = $this->cms()->content()->create('pages', ['title' => 'About', 'slug' => 'about', 'status' => 'published']);
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
        $this->assertSame([], $this->ability('design/set-code')['saved']);
        $this->assertSame(['css', 'js'], $this->ability('design/set-code', ['css' => 'body { color: red }', 'js' => 'console.log(1)'])['saved']);

        $font = $this->ability('design/fonts-upload', ['family' => 'Test Sans', 'data' => base64_encode('wOF2'.str_repeat("\0", 40))]);
        $this->assertSame('fonts/test-sans-400.woff2', $font['src']);
        $italic = $this->ability('design/fonts-upload', ['family' => 'Test Sans', 'name' => 'Test Sans Italic', 'data' => 'data:font/woff2;base64,'.base64_encode('wOF2'.str_repeat("\0", 40)), 'weight' => '100 900', 'style' => 'italic']);
        $this->assertSame('italic', $italic['style']);

        // Importing asks Google Fonts; here the files it would bring are given, as Fonts::import() answers.
        $this->assertSame([], $this->ability('design/fonts-import', ['family' => '!!'], 'invalid_input'));
        $this->app->bind(\Cms\Modules\Site\Design\Fonts::class, static fn () => new class
        {
            public function import(string $family, bool $italic): array
            {
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
            'transition' => ['type' => 'fade', 'duration' => 0.4]]);
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
    }

    public function test_site_abilities_answer_as_described(): void
    {
        $idle = $this->ability('site/build-status');
        $this->assertSame('idle', $idle['state']);

        $page = $this->cms()->content()->create('pages', ['title' => 'About', 'slug' => 'about', 'status' => 'published', 'data' => ['content' => [['type' => 'heading', 'props' => ['text' => 'About']]]]]);
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
        $this->cms()->content()->create('pages', ['title' => 'Uses', 'slug' => 'uses', 'status' => 'published', 'data' => ['cover' => [$image['id']], 'note' => 'Background: media:'.$gone, 'link' => '/media/none.png']]);
        MediaItem::query()->create(['name' => 'Lost', 'filename' => 'lost.txt', 'path' => 'media/lost.txt', 'mime' => 'text/plain', 'size' => 1, 'hash' => hash('sha256', 'lost'), 'folder' => '']);
        $report = $this->ability('media/report');
        $this->assertSame(3, $report['items']);
        $this->assertEqualsCanonicalizing([$gone, '/media/none.png'], array_column($report['dangling'], 'id'));
        $this->assertCount(1, $report['missing_files']);
        $this->assertContains($text['id'], $report['unused']);

        $this->assertSame($text['id'], $this->ability('media/delete', ['id' => $text['id']])['deleted']);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Modules\Media\MediaItem;
use Cms\Tests\TestCase;

/** Blocks, design, media and site abilities answer with what their output schemas say (checked on every execute). */
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

    private function ability(string $ability, array $input = []): mixed
    {
        $this->ctx ??= AbilityContext::forUser($this->admin(), 'rest');

        return $this->cms()->abilities()->execute($ability, $input, $this->ctx);
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

        $this->cms()->content()->create('templates', ['title' => 'Default', 'slug' => 'default', 'status' => 'published', 'data' => ['description' => 'Frames pages', 'collections' => ['pages'], 'blocks' => [['type' => 'outlet']]]]);
        $this->cms()->content()->create('templates', ['title' => 'Bare', 'slug' => 'bare', 'status' => 'draft', 'data' => ['blocks' => []]]);
        $this->app->make(\Cms\Modules\Blocks\Templates::class)->flush();
        $this->assertSame(['default'], array_column($this->ability('templates/list'), 'handle'));
        $this->assertCount(2, $this->ability('templates/list', ['working' => true]));
    }

    public function test_design_abilities_answer_as_described(): void
    {
        $this->assertSame([], $this->ability('design/code')['saved']);
        $this->assertSame(['css', 'js'], $this->ability('design/code', ['css' => 'body { color: red }', 'js' => 'console.log(1)'])['saved']);

        $font = $this->ability('design/fonts-upload', ['family' => 'Test Sans', 'data' => base64_encode('wOF2'.str_repeat("\0", 40))]);
        $this->assertSame('fonts/test-sans-400.woff2', $font['src']);
        $italic = $this->ability('design/fonts-upload', ['family' => 'Test Sans', 'name' => 'Test Sans Italic', 'data' => 'data:font/woff2;base64,'.base64_encode('wOF2'.str_repeat("\0", 40)), 'weight' => '100 900', 'style' => 'italic']);
        $this->assertSame('italic', $italic['style']);

        $this->ability('design/update', ['tokens' => ['color.primary' => '#0f766e', 'text.xl' => ['min' => '1.25rem', 'max' => '1.5rem']], 'dark' => ['color.primary' => '#5eead4'],
            'prose' => ['spacing' => ['blocks' => '1em'], 'h2' => ['fontSize' => '2rem']], 'buttons' => ['primary' => ['base' => ['color' => '#fff']]], 'fields' => ['field' => ['height' => '3rem']],
            'transition' => ['type' => 'fade', 'duration' => 0.4]]);
        $this->assertNotEmpty($this->ability('design/preview', ['tokens' => ['color.primary' => '#000'], 'css' => 'a { color: blue }'])['css']);
        $design = $this->ability('design/get');
        $this->assertCount(2, $design['fonts']);
        $this->assertCount(2, $design['fontFiles']);
        $this->assertStringContainsString('color: red', $design['css']);
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

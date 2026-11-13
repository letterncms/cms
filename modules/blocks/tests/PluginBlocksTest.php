<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks\Tests;

use Cms\Modules\Blocks\BlockRegistry;
use Cms\Modules\Blocks\BlockRenderer;
use Cms\Modules\Blocks\Document;
use Cms\Modules\Blocks\MarkdownCodec;
use Cms\Modules\Blocks\Scope;
use Cms\Tests\TestCase;

/** A plugin's blocks when the plugin is off, gone, changed or broken: content is never lost, and pages still build. */
final class PluginBlocksTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks'];
    }

    protected function collections(): array
    {
        return ['pages' => ['title' => 'Pages', 'route' => '/{slug}', 'fields' => [['handle' => 'content', 'type' => 'blocks', 'body' => true]]]];
    }

    /** A plugin that is installed and off: its blocks are named after it. */
    protected function prepareSite(string $site): void
    {
        \Cms\Support\Files::put($site.'/plugins/cms-reviews/composer.json', (string) json_encode([
            'name' => 'acme/cms-reviews', 'type' => 'cms-plugin', 'version' => '1.0.0',
            'autoload' => ['psr-4' => ['Acme\\Reviews\\' => 'src/']],
            'extra' => ['cms' => ['provider' => 'Acme\\Reviews\\ReviewsPlugin', 'label' => 'Reviews']],
        ]));
        \Cms\Support\Files::put($site.'/plugins/cms-reviews/src/ReviewsPlugin.php', "<?php\nnamespace Acme\\Reviews;\nfinal class ReviewsPlugin extends \\Cms\\Packages\\Plugin {}\n");
    }

    private function render(array $nodes, bool $editor = false): string
    {
        $renderer = app(BlockRenderer::class);
        $renderer->begin();
        $renderer->editor = $editor;

        try {
            return $renderer->withEditorDocument($editor ? 'test-source' : null, fn () => $renderer->render($nodes, new Scope(['page' => ['uri' => '/menu']])));
        } finally {
            $renderer->editor = false;
        }
    }

    /** A block of a plugin that isn't on, holding blocks of its own. */
    private function stored(): array
    {
        return [
            ['id' => 'p1', 'type' => 'paragraph', 'props' => ['text' => 'Before']],
            ['id' => 'yt', 'type' => 'acme-video/player', 'props' => ['video' => 'dQw4w9WgXcQ', 'start' => 30], 'style' => ['base' => ['marginTop' => 'token:space.8']], 'children' => [
                ['id' => 'c1', 'type' => 'paragraph', 'props' => ['text' => 'Inside']],
            ]],
            ['id' => 'p2', 'type' => 'paragraph', 'props' => ['text' => 'After']],
        ];
    }

    public function test_a_block_whose_plugin_is_off_is_kept_as_it_is(): void
    {
        $nodes = app(Document::class)->normalize($this->stored());
        $this->assertSame($this->stored()[1], $nodes[1], 'saving changes nothing in it, its blocks included');

        $codec = app(MarkdownCodec::class);
        $this->assertEquals($this->stored()[1], app(Document::class)->normalize($codec->decode($codec->encode($nodes)))[1], 'nor does Block Markdown');
        $this->assertSame($this->stored()[1], json_decode((string) json_encode(Document::jsonable($nodes)), true)[1], 'nor JSON');

        $entry = $this->cms()->entryService()->create('pages', ['title' => 'Menu', 'status' => 'published', 'data' => ['content' => $this->stored()]]);
        $this->assertSame($this->stored()[1], $this->cms()->entries()->find($entry->id)->data['content'][1]);
    }

    public function test_the_site_leaves_it_out_quietly_and_the_canvas_names_it(): void
    {
        $warnings = [];
        $this->cms()->hooks()->on('render.warning', function (string $message) use (&$warnings) {
            $warnings[] = $message;
        });

        $site = $this->render($this->stored());
        $this->assertSame('<p class="cms-paragraph">Before</p><p class="cms-paragraph">After</p>', $site, 'nothing of it, nor of the blocks inside: they may make sense only in it');
        $this->assertSame([], $warnings, 'a plugin turned off on purpose is no fault of the page');

        $canvas = $this->render($this->stored(), editor: true);
        $this->assertStringContainsString('<div data-cms-document="test-source" data-cms-node="yt" data-cms-type="acme-video/player" data-cms-missing><div class="cms-placeholder">Player block — its plugin is not installed</div></div>', $canvas, 'it can be found, selected, moved and deleted');
        $this->assertStringNotContainsString('Inside', $canvas);

        $this->assertStringContainsString('<div class="cms-placeholder">Stars block — its plugin, Reviews, is turned off</div>', $this->render([['id' => 'r1', 'type' => 'reviews/stars']], editor: true), 'named after the plugin it comes from');
    }

    public function test_it_comes_back_unchanged_with_its_plugin(): void
    {
        $nodes = app(Document::class)->normalize($this->stored());

        app(BlockRegistry::class)->register(['name' => 'acme-video/player', 'title' => 'Player', 'children' => true, 'fields' => [['handle' => 'video', 'type' => 'text'], ['handle' => 'start', 'type' => 'number']],
            'render' => static fn (array $d) => '<div '.$d['attrs'].' data-video="'.e((string) $d['block']['video']).'" data-start="'.(int) $d['block']['start'].'">'.$d['content'].'</div>']);

        $html = $this->render($nodes);
        $this->assertMatchesRegularExpression('#<div class="cms-acme-video-player s\w+" data-video="dQw4w9WgXcQ" data-start="30"><p class="cms-paragraph">Inside</p></div>#', $html);
    }

    public function test_uninstalling_a_plugin_says_how_much_content_holds_its_blocks_and_deletes_none(): void
    {
        $content = $this->cms()->entryService();
        $content->create('pages', ['title' => 'One', 'status' => 'published', 'data' => ['content' => [['type' => 'box', 'children' => [['type' => 'reviews/stars', 'props' => ['product' => 'x']]]]]]]);
        $content->create('pages', ['title' => 'Two', 'status' => 'published', 'data' => ['content' => [['type' => 'reviews/stars'], ['type' => 'reviews/list']]]]);
        $content->create('pages', ['title' => 'Three', 'status' => 'published', 'data' => ['content' => [['type' => 'paragraph', 'props' => ['text' => 'No stars']]]]]);

        $this->assertSame(2, $this->app->make(\Cms\Modules\Blocks\Uses::class)->package('acme/cms-reviews'));
        $this->assertSame(0, $this->app->make(\Cms\Modules\Blocks\Uses::class)->package('acme/other'));

        $context = \Cms\Abilities\AbilityContext::forUser($this->admin(), 'admin');
        $report = $this->cms()->abilities()->execute('packages/uninstall', ['name' => 'acme/cms-reviews', 'dryRun' => true], $context);
        $this->assertSame(['2 entries use its blocks. They stay in them, show nothing meanwhile, and come back if you install the plugin again.'], $report['changes'][0]['keeps']);

        $this->cms()->abilities()->execute('packages/uninstall', ['name' => 'acme/cms-reviews'], $context);
        $two = collect($this->cms()->entries()->query()->get())->firstWhere('title', 'Two');
        $this->assertSame(['reviews/stars', 'reviews/list'], array_column($two->data['content'], 'type'), 'nothing is taken out of the content');
    }

    public function test_props_a_new_version_no_longer_knows_are_kept(): void
    {
        app(BlockRegistry::class)->register(['name' => 'acme/card', 'title' => 'Card', 'fields' => [['handle' => 'title', 'type' => 'text']]]);

        $nodes = app(Document::class)->normalize([['type' => 'acme/card', 'props' => ['title' => 'Hi', 'subtitle' => 'From version 1', 'tone' => ['warm' => true]]]]);

        $this->assertSame(['title' => 'Hi', 'subtitle' => 'From version 1', 'tone' => ['warm' => true]], $nodes[0]['props']);
    }

    public function test_a_block_that_fails_is_left_out_and_reported_with_its_page(): void
    {
        app(BlockRegistry::class)->register(['name' => 'acme/broken', 'title' => 'Broken', 'render' => static fn () => throw new \LogicException('No price list')]);
        $warnings = [];
        $reported = [];
        $this->cms()->hooks()->on('render.warning', function (string $message) use (&$warnings) {
            $warnings[] = $message;
        });
        $this->app->make(\Illuminate\Contracts\Debug\ExceptionHandler::class)->reportable(function (\Throwable $e) use (&$reported) {
            $reported[] = $e->getMessage();
        });

        $nodes = [['id' => 'p1', 'type' => 'paragraph', 'props' => ['text' => 'Still here']], ['id' => 'bk', 'type' => 'acme/broken']];
        $this->assertSame('<p class="cms-paragraph">Still here</p>', $this->render($nodes));
        $this->assertSame(['The Broken block bk could not be shown: No price list'], $warnings, 'the build lists it with the page, and `build --strict` fails on it');
        $this->assertContains('The acme/broken block bk on /menu failed to render: No price list', $reported);

        $canvas = $this->render($nodes, editor: true);
        $this->assertMatchesRegularExpression('#<div data-cms-document="test-source" data-cms-node="bk" data-cms-type="acme/broken" data-cms-failed [^>]*>Block “Broken” failed: No price list</div>#', $canvas);
    }
}

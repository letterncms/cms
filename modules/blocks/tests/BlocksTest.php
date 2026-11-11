<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Modules\Blocks\BlockRenderer;
use Cms\Modules\Blocks\Document;
use Cms\Modules\Blocks\MarkdownCodec;
use Cms\Modules\Blocks\StyleCompiler;
use Cms\Tests\TestCase;

final class BlocksTest extends TestCase
{
    public function test_a_block_keeps_a_short_id_so_the_editor_finds_it_on_the_canvas(): void
    {
        $nodes = $this->app->make(\Cms\Modules\Blocks\Document::class)->normalize([['id' => 'dl', 'type' => 'paragraph', 'props' => ['text' => 'Hi']]]);

        $this->assertSame('dl', $nodes[0]['id']);
    }

    public function test_creation_options_provide_a_usable_explicit_blocks_body(): void
    {
        $admin = $this->admin();
        $ctx = AbilityContext::forUser($admin, 'admin');
        $options = $this->cms()->abilities()->execute('collections/options', [], $ctx);
        $this->assertSame('content', $options['defaults']['body']);
        $this->assertSame('blocks', $options['defaults']['fields'][0]['type']);
        $this->cms()->abilities()->execute('collections/save', [
            'handle' => 'articles', 'createOnly' => true,
            'definition' => [...$options['defaults'], 'title' => 'Articles'],
        ], $ctx);
        $collection = $this->cms()->collections()->findOrFail('articles');
        $this->assertSame('blocks', $collection->blueprint()->field($collection->body)->type);
        $entry = $this->cms()->entryService()->create('articles', [
            'title' => 'A shared document', 'data' => ['content' => [['type' => 'paragraph', 'props' => ['text' => 'Hello']]]],
        ], $admin);
        $this->assertSame('Hello', $entry->data['content'][0]['props']['text']);
    }

    protected function plugins(): array
    {
        return ['letterncms/blocks'];
    }

    protected function collections(): array
    {
        return [
            'pages' => ['title' => 'Pages', 'route' => '/{slug}', 'body' => 'content', 'fields' => [['handle' => 'content', 'type' => 'blocks']]],
            'docs' => ['title' => 'Docs', 'driver' => 'files', 'route' => '/docs/{slug}', 'body' => 'content', 'fields' => [['handle' => 'content', 'type' => 'blocks']]],
        ];
    }

    public function test_cms_describes_itself_through_repeat_sources(): void
    {
        $sources = app(\Cms\Modules\Blocks\DataSources::class);
        $scope = new \Cms\Modules\Blocks\Scope([]);

        $groups = $sources->resolve('cms-ability-groups', [], $scope);
        $this->assertContains('entries', array_column($groups, 'name'));
        $this->assertNotEmpty($sources->resolve('cms-block-categories', [], $scope));
        $this->assertSame('abilities', $sources->resolve('cms-facts', [], $scope)[0]['label']);
        $this->assertCount(3, $sources->resolve('cms-abilities', ['limit' => 3], $scope));
    }

    public function test_markdown_round_trip_keeps_structure(): void
    {
        $codec = app(MarkdownCodec::class);
        $markdown = "## Hello\n\nSome **bold** and [a link](/x).\n\n- One\n- Two\n\n::: section {\"props\":{\"width\":\"wide\"},\"style\":{\"base\":{\"paddingBlock\":\"token:space.16\"}}}\n### Inside\n\n:::: buttons\n::::: button {\"props\":{\"label\":\"Go\",\"url\":\"/go\"}}\n:::::\n::::\n:::\n\n```php\necho 1;\n```";

        $nodes = app(Document::class)->normalize($codec->decode($markdown));

        $this->assertSame(['heading', 'paragraph', 'list', 'section', 'code'], array_column($nodes, 'type'));
        $this->assertSame('Some <strong>bold</strong> and <a href="/x">a link</a>.', $nodes[1]['props']['text']);
        $this->assertSame('wide', $nodes[3]['props']['width']);
        $this->assertSame('token:space.16', $nodes[3]['style']['base']['paddingBlock']);
        $this->assertSame('button', $nodes[3]['children'][1]['children'][0]['type']);
        $this->assertSame('php', $nodes[4]['props']['language']);

        $again = app(Document::class)->normalize($codec->decode($codec->encode($nodes)));
        $this->assertSame(array_column($nodes, 'type'), array_column($again, 'type'));
        $this->assertSame($nodes[3]['children'][1]['children'][0]['props']['label'], $again[3]['children'][1]['children'][0]['props']['label']);
    }

    public function test_a_stored_binding_to_a_style_that_no_longer_exists_does_nothing(): void
    {
        $renderer = app(\Cms\Modules\Blocks\BlockRenderer::class);
        $renderer->begin();
        // As it sits in content saved before: rendering doesn't normalize.
        $html = $renderer->render([['id' => 'b1', 'type' => 'box', 'bind' => ['style:bg' => 'site.name', 'style:color' => 'site.name'], 'children' => []]], new \Cms\Modules\Blocks\Scope(['site' => ['name' => 'red']]));

        $this->assertStringContainsString('style="color:red"', $html);
        $this->assertStringNotContainsString('background', $html);
    }

    public function test_an_attribute_names_another_block_by_its_id(): void
    {
        $warnings = [];
        $this->cms()->hooks()->on('render.warning', function (string $message) use (&$warnings) {
            $warnings[] = $message;
        });
        $renderer = app(\Cms\Modules\Blocks\BlockRenderer::class);
        $renderer->begin();
        $html = $renderer->render(app(Document::class)->normalize([
            ['id' => 'region', 'type' => 'box', 'props' => ['tag' => 'section'], 'attrs' => ['aria-labelledby' => '#title', 'aria-describedby' => '#lede written-by-hand #gone', 'title' => '#title'], 'children' => [
                ['id' => 'title', 'type' => 'heading', 'props' => ['text' => 'Maps that move', 'level' => '2']],
                ['id' => 'lede', 'type' => 'paragraph', 'props' => ['text' => 'A lede']],
            ]],
            ['id' => 'opener', 'type' => 'box', 'props' => ['tag' => 'button'], 'attrs' => ['aria-controls' => '#panel'], 'children' => []],
            ['id' => 'panel', 'type' => 'box', 'anchor' => 'details', 'children' => []],
        ]));

        $this->assertStringContainsString('aria-labelledby="maps-that-move"', $html, 'a heading keeps the id links already point at');
        $this->assertStringContainsString('<h2 class="cms-heading" data-cms="title" id="maps-that-move">', $html);
        $this->assertStringContainsString('aria-describedby="cms-lede written-by-hand "', $html, 'a block without an id gets one; a word written by hand stays');
        $this->assertStringContainsString('<p class="cms-paragraph" data-cms="lede" id="cms-lede">', $html);
        $this->assertStringContainsString('aria-controls="details"', $html, 'a block with an anchor is named by it');
        $this->assertStringContainsString('title="#title"', $html, 'only attributes that name elements are read this way');
        $this->assertStringNotContainsString("\x1B", $html);
        $this->assertCount(1, $warnings);
        $this->assertStringContainsString('#gone', $warnings[0]);
    }

    public function test_an_icon_with_an_svg_of_its_own_shows_that(): void
    {
        $render = function (array $props): string {
            $renderer = app(\Cms\Modules\Blocks\BlockRenderer::class);
            $renderer->begin();

            return $renderer->render(app(Document::class)->normalize([['type' => 'icon', 'props' => $props]]));
        };
        $own = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" onclick="alert(1)"/></svg>';

        $html = $render(['svg' => $own]);
        $this->assertStringContainsString('<circle cx="5" cy="5" r="4"', $html, 'with the default icon’s name still in the block');
        $this->assertSame(1, substr_count($html, '<svg'));
        $this->assertStringNotContainsString('onclick', $html);
        $this->assertStringContainsString('<circle', $render(['icon' => 'arrow-up-right', 'svg' => $own]), 'and with another name chosen');

        $this->assertStringNotContainsString('<circle', $render(['icon' => 'arrow-up-right']));
        $this->assertStringContainsString('<svg', $render(['icon' => 'arrow-up-right', 'svg' => 'not an svg']), 'what is no SVG leaves the named icon');
    }

    public function test_document_sanitizes_text_and_styles(): void
    {
        $nodes = app(Document::class)->normalize([
            ['type' => 'paragraph', 'props' => ['text' => 'Hi <script>alert(1)</script><em>there</em><img src=x onerror=alert(1)>']],
            ['type' => 'section', 'style' => ['base' => ['paddingBlock' => 'token:space.8', 'paddingY' => 'token:space.8', 'bg' => 'red', 'color' => 'red;}body{display:none', 'nonsense' => '1px'], 'evil' => ['color' => 'red']], 'children' => [
                ['type' => 'columns', 'children' => [['type' => 'paragraph', 'props' => ['text' => 'not a column']], ['type' => 'column']]],
            ]],
            ['type' => 'from-a-removed-plugin', 'props' => ['keep' => 'me']],
        ]);

        $this->assertSame('Hi <em>there</em>', $nodes[0]['props']['text']);
        $this->assertSame(['base' => ['paddingBlock' => 'token:space.8']], $nodes[1]['style'], 'a style key is a CSS property by its own name');
        $this->assertSame(['column'], array_column($nodes[1]['children'][0]['children'], 'type'));
        $this->assertSame('me', $nodes[2]['props']['keep']);
        $this->assertMatchesRegularExpression('/^b[a-z0-9]{10}$/', $nodes[0]['id']);
    }

    public function test_styles_compile_to_atomic_responsive_css(): void
    {
        $css = [];
        $this->cms()->hooks()->on('render.style', function ($class, $rule) use (&$css) {
            $css[$class] = $rule;
        });

        $compiler = app(StyleCompiler::class);
        $a = $compiler->classes(['base' => ['paddingTop' => 'token:space.8'], 'mobile' => ['paddingTop' => 'token:space.4'], 'hover' => ['color' => 'token:color.primary/50']]);
        $b = $compiler->classes(['base' => ['paddingTop' => 'token:space.8']]);

        $this->assertCount(3, explode(' ', $a));
        $this->assertSame(explode(' ', $a)[0], $b, 'identical declarations share a class');
        $all = implode('', $css);
        $this->assertStringContainsString('padding-top:var(--space-8)', $all);
        $this->assertStringContainsString('@media (max-width:767.98px)', $all);
        $this->assertStringContainsString(':hover{color:color-mix(in srgb, var(--color-primary) 50%, transparent)}', $all);
    }

    public function test_renders_blocks_with_theme_independent_markup(): void
    {
        $html = app(BlockRenderer::class)->render(app(Document::class)->normalize([
            ['type' => 'heading', 'props' => ['text' => 'Title', 'level' => '1']],
            ['type' => 'columns', 'props' => ['layout' => '1-2'], 'children' => [
                ['type' => 'column', 'children' => [['type' => 'paragraph', 'props' => ['text' => 'Left']]]],
                ['type' => 'column', 'children' => [['type' => 'button', 'props' => ['label' => 'Go', 'url' => '/go']]]],
            ]],
            ['type' => 'video', 'props' => ['url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ']],
            ['type' => 'embed', 'props' => ['url' => 'https://evil.example.com/x']],
        ]));

        $this->assertStringContainsString('<h1 class="cms-heading" id="title">Title</h1>', $html);
        $this->assertMatchesRegularExpression('/<div class="cms-columns( s\w+)+" data-stack="md">/', $html, 'layout props become atomic styles');
        $this->assertStringContainsString('<a class="cms-button" data-variant="primary" data-size="md" href="/go"><span>Go</span></a>', $html);
        $this->assertStringContainsString('youtube-nocookie.com/embed/dQw4w9WgXcQ', $html);
        $this->assertStringNotContainsString('evil.example.com', $html);
    }

    public function test_entries_accept_markdown_and_files_driver_stores_it(): void
    {
        $entry = $this->cms()->entryService()->create('docs', ['title' => 'Intro', 'data' => ['content' => "# Hi\n\nWelcome."]]);

        $this->assertSame('heading', $entry->data['content'][0]['type']);
        $file = content_path('collections/docs/intro.md');
        $this->assertStringContainsString("# Hi\n\nWelcome.", file_get_contents($file));
        $this->assertSame('Welcome.', $this->cms()->entries()->find($entry->id)->data['content'][1]['props']['text']);
    }

    public function test_custom_html_needs_permission(): void
    {
        $editor = $this->userWithRole('editor');
        $ctx = AbilityContext::forUser($editor, 'rest');

        $this->expectException(AbilityException::class);
        $this->cms()->abilities()->execute('entries/create', ['collection' => 'pages', 'title' => 'X', 'data' => ['content' => [['type' => 'html', 'props' => ['html' => '<script>x</script>']]]]], $ctx);
    }

    public function test_a_blocks_scripts_styles_and_behavior_need_the_code_permission(): void
    {
        $admin = $this->admin();
        $editor = AbilityContext::forUser($this->userWithRole('editor'), 'rest');
        $abilities = $this->cms()->abilities();
        $block = static fn (array $extra = [], string $text = 'Hi') => ['id' => 'b1', 'type' => 'paragraph', 'props' => ['text' => $text], ...$extra];
        $code = ['behavior' => ['module' => 'tilt', 'props' => ['max' => 8], 'when' => 'visible'], 'code' => ['scripts' => ['tilt']], 'persist' => 'player'];
        $refused = function (array $input, string $ability = 'entries/update') use ($abilities, $editor): void {
            try {
                $abilities->execute($ability, $input, $editor);
                $this->fail('block code was accepted from someone without site.code');
            } catch (AbilityException $e) {
                $this->assertSame('forbidden', $e->type);
            }
        };

        // Each of the three is refused on its own, on a new entry and on an existing one.
        foreach (['behavior', 'code', 'persist'] as $key) {
            $refused(['collection' => 'pages', 'title' => 'X', 'data' => ['content' => [$block([$key => $code[$key]])]]], 'entries/create');
        }

        $plain = $this->cms()->entryService()->create('pages', ['title' => 'Plain', 'data' => ['content' => [$block()]]], $admin);
        $refused(['id' => $plain->id, 'data' => ['content' => [$block(['behavior' => $code['behavior']])]]]);

        // Someone with the permission puts it there; an editor then changes the words and the code survives untouched.
        $entry = $this->cms()->entryService()->create('pages', ['title' => 'Coded', 'data' => ['content' => [$block($code)]]], $admin);
        $saved = $this->cms()->entries()->find($entry->id)->working()['data']['content'];
        $saved[0]['props']['text'] = 'Changed words';
        $abilities->execute('entries/update', ['id' => $entry->id, 'data' => ['content' => $saved]], $editor);
        $after = $this->cms()->entries()->find($entry->id)->working()['data']['content'][0];
        $this->assertSame('Changed words', $after['props']['text']);
        $this->assertSame($code['behavior'], $after['behavior']);
        $this->assertSame($code['code'], $after['code']);
        $this->assertSame('player', $after['persist']);

        // Changing any of it is refused; taking the block away is ordinary editing.
        $changed = $saved;
        $changed[0]['behavior']['module'] = 'other';
        $refused(['id' => $entry->id, 'data' => ['content' => $changed]]);
        $changed = $saved;
        $changed[0]['persist'] = 'elsewhere';
        $refused(['id' => $entry->id, 'data' => ['content' => $changed]]);
        $abilities->execute('entries/update', ['id' => $entry->id, 'data' => ['content' => [$block()]]], $editor);
        $this->assertArrayNotHasKey('behavior', $this->cms()->entries()->find($entry->id)->working()['data']['content'][0]);

        // With the permission it goes through.
        $abilities->execute('entries/update', ['id' => $plain->id, 'data' => ['content' => [$block($code)]]], AbilityContext::forUser($admin, 'rest'));
        $this->assertSame('tilt', $this->cms()->entries()->find($plain->id)->working()['data']['content'][0]['behavior']['module']);
    }

    public function test_headings_get_stable_unique_anchors(): void
    {
        $nodes = [
            ['type' => 'heading', 'props' => ['text' => 'Getting started', 'level' => '2']],
            ['type' => 'section', 'children' => [
                ['type' => 'heading', 'props' => ['text' => 'Install <em>Cms</em>', 'level' => '3']],
                ['type' => 'heading', 'props' => ['text' => 'Getting started', 'level' => '2']],
            ]],
            ['type' => 'heading', 'props' => ['text' => 'Custom', 'level' => '2', 'anchor' => 'my-anchor']],
            ['type' => 'heading', 'props' => ['text' => 'Deep', 'level' => '4']],
        ];

        $toc = (new \Cms\Modules\Blocks\BlocksDocument($nodes))->headings();
        $this->assertSame(['getting-started', 'install-cms', 'getting-started-2', 'my-anchor'], array_column($toc, 'id'));
        $this->assertSame('Install Cms', $toc[1]['text']);

        $this->assertSame('Getting started Install Cms Getting started Custom Deep', $this->app->make(\Cms\Modules\Blocks\Document::class)->text([...$nodes, ['type' => 'section', 'props' => ['align' => 'center'], 'style' => ['base' => ['color' => 'token:color.primary']]]]));

        $html = $this->app->make(\Cms\Modules\Blocks\BlockRenderer::class)->render($nodes);
        foreach (['getting-started', 'install-cms', 'getting-started-2', 'my-anchor', 'deep'] as $id) {
            $this->assertStringContainsString('id="'.$id.'"', $html);
        }
    }

    public function test_hand_written_markdown_gets_stable_block_ids(): void
    {
        $field = \Cms\Content\Fields\Field::fromArray(['handle' => 'body', 'type' => 'blocks']);
        $markdown = "## Hello\n\n::: section\nText\n:::";
        $type = new \Cms\Modules\Blocks\BlocksField;

        $first = $type->fromMarkdown($markdown, $field);
        $second = $type->fromMarkdown($markdown, $field);

        $this->assertSame($first, $second);
        $ids = [$first[0]['id'], $first[1]['id'], $first[1]['children'][0]['id']];
        $this->assertCount(3, array_unique($ids));
        $this->assertMatchesRegularExpression('/^m[0-9a-f]{10}$/', $ids[0]);
    }

    /** What a save does: the editor sends back what it read, the field cleans it, the file gets its Markdown. */
    private function save(string $markdown): string
    {
        $field = \Cms\Content\Fields\Field::fromArray(['handle' => 'body', 'type' => 'blocks']);
        $type = new \Cms\Modules\Blocks\BlocksField;

        return $type->toMarkdown($type->normalize($type->fromMarkdown($markdown, $field), $field), $field);
    }

    public function test_saving_without_edits_leaves_hand_written_markdown_as_it_was(): void
    {
        $markdown = "# Title\n\nSome **bold**, a [link](/x) and a line  \nbreak.\n\n- One\n- Two\n\n> A quote\n\n```php\necho 1;\n```\n\n---\n\n![Alt](/a.png \"Caption\")\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\n::: section\n## Inside\n\nText.\n:::";

        $this->assertSame($markdown, $this->save($markdown));
    }

    public function test_saving_keeps_what_plain_markdown_cannot_say(): void
    {
        $markdown = implode("\n\n", [
            '::: paragraph {"id":"hal-n","props":{"text":"Halden"}}'."\n:::",
            '::: paragraph {"props":{"text":"portfolio/","tag":"span"}}'."\n:::",
            '::: heading {"props":{"text":"Hello","level":"2","anchor":"hi"}}'."\n:::",
            '::: paragraph {"props":{"text":""}}'."\n:::",
            "- One",
            '::: list {"props":{"ordered":false,"items":["Two"]}}'."\n:::",
            '::: box {"id":"b1","logic":{"on":[{"event":"click","actions":[{"do":"toggle","target":"#m1"}]}]}}'."\n:::",
        ]);

        $saved = $this->save($markdown);
        $nodes = MarkdownCodec::stableIds(app(MarkdownCodec::class)->decode($saved));

        $this->assertSame(['paragraph', 'paragraph', 'heading', 'paragraph', 'list', 'list', 'box'], array_column($nodes, 'type'));
        $this->assertSame('hal-n', $nodes[0]['id'], 'an id from the file stays: behaviors point at blocks by id');
        $this->assertSame('span', $nodes[1]['props']['tag']);
        $this->assertSame('hi', $nodes[2]['props']['anchor']);
        $this->assertSame('', $nodes[3]['props']['text'], 'an empty paragraph is still there');
        $this->assertSame(['Two'], $nodes[5]['props']['items'], 'two lists in a row stay two');
        $this->assertSame($saved, $this->save($saved), 'a second save changes nothing');
    }

    public function test_an_id_reading_gave_stays_when_something_points_at_it(): void
    {
        $codec = app(MarkdownCodec::class);
        $nodes = MarkdownCodec::stableIds($codec->decode("Plain text.\n\n::: box\n:::"));
        $nodes[1]['logic'] = ['on' => [['event' => 'click', 'actions' => [['do' => 'toggle', 'target' => '#'.$nodes[0]['id']]]]]];

        $read = MarkdownCodec::stableIds($codec->decode($codec->encode($nodes)));

        $this->assertSame($nodes[0]['id'], $read[0]['id']);
        $this->assertStringStartsWith('::: paragraph {"id":"'.$nodes[0]['id'].'"', $codec->encode($nodes));
    }

    public function test_saving_drops_empty_breakpoints_instead_of_turning_them_into_lists(): void
    {
        $saved = $this->save('::: box {"id":"x","style":{"base":{},"tablet":{"color":"token:color.ink"}}}'."\n:::");

        $this->assertSame('::: box {"id":"x","style":{"tablet":{"color":"token:color.ink"}}}'."\n:::", $saved);
    }

    public function test_saving_keeps_heading_boxes_calc_motion_and_colour_variables(): void
    {
        $saved = $this->save(implode("\n\n", [
            '::: box {"id":"h","props":{"tag":"h2"}}'."\n:::",
            '::: box {"id":"m","motion":[{"id":"a","trigger":{"type":"appear"},"steps":[{"target":"self","at":0,"duration":0.5,"from":{"y":"calc(-1 * 8.25rem)"},"to":{"y":0}}]}]}'."\n:::",
            '::: box {"id":"v","attrs":{"style":"--color-primary:#d9432a;--color-panel:#f3e4cf"}}'."\n:::",
        ]));
        $nodes = app(MarkdownCodec::class)->decode($saved);

        $this->assertSame('h2', $nodes[0]['props']['tag']);
        $this->assertSame('calc(-1 * 8.25rem)', $nodes[1]['motion'][0]['steps'][0]['from']['y']);
        $this->assertSame('--color-primary:#d9432a;--color-panel:#f3e4cf', $nodes[2]['attrs']['style']);
        $this->assertSame([], Document::attrs(['style' => 'color:red;--x:url(javascript:alert(1))']), 'a style attribute only sets variables');
    }
}

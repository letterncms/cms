<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Modules\Blocks\Components;
use Cms\Modules\Site\Rendering\Renderer;
use Cms\Support\Files;
use Cms\Support\Yaml;
use Cms\Tests\TestCase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/** `cms migrate` renames the block `pattern` to `component` in what a site has stored. */
final class ComponentBlockMigrationTest extends TestCase
{
    private const string MIGRATION = '2026_11_13_000000_rename_pattern_block_to_component';

    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    protected function collections(): array
    {
        return [
            'pages' => ['title' => 'Pages', 'route' => '/{slug}', 'template' => 'page', 'body' => 'content', 'fields' => [
                ['handle' => 'content', 'type' => 'blocks', 'allowed' => ['heading', 'pattern', 'box']],
                ['handle' => 'kind', 'type' => 'select', 'options' => ['pattern' => 'Pattern', 'plain' => 'Plain']],
                ['handle' => 'allowed', 'type' => 'tags'],
            ]],
            'notes' => ['title' => 'Notes', 'driver' => 'files', 'route' => '/notes/{slug}', 'body' => 'body', 'fields' => [['handle' => 'body', 'type' => 'markdown'], ['handle' => 'aside', 'type' => 'blocks']]],
        ];
    }

    /** As on a site that was installed before the rename: the migration has not run yet. */
    private function migrate(): void
    {
        $this->assertSame(1, DB::table('migrations')->where('migration', self::MIGRATION)->delete());
        $this->assertSame(0, Artisan::call('migrate', ['--force' => true]));
        $this->assertSame(1, DB::table('migrations')->where('migration', self::MIGRATION)->count());
        $this->app->make(Components::class)->flush();
        $this->app->make(\Cms\Modules\Blocks\Templates::class)->flush();
    }

    private function again(): void
    {
        (require database_path('migrations/'.self::MIGRATION.'.php'))->up();
    }

    /** Every file the site keeps its content, its settings and its working copies in, with what it holds. */
    private function files(): array
    {
        $out = [];

        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($this->site, \FilesystemIterator::SKIP_DOTS)) as $file) {
            $path = substr($file->getPathname(), strlen($this->site) + 1);

            // Not content/schemas: `cms migrate` writes those after every run, whatever a migration did.
            if ($file->isFile() && ! $file->isLink() && preg_match('#^(content|config|storage/drafts)/#', $path) && ! str_starts_with($path, 'content/schemas/')) {
                $out[$path] = (string) file_get_contents($file->getPathname());
            }
        }

        ksort($out);

        return $out;
    }

    /** A tree as it was stored before: instances of a component, beside everything that only looks like one. */
    private function tree(string $type): array
    {
        return [
            ['id' => 'a1', 'type' => $type, 'props' => ['ref' => 'card', 'values' => ['title' => 'Fast', 'kind' => 'pattern']]],
            ['id' => 'a2', 'type' => 'box', 'props' => ['tag' => 'div'], 'label' => 'pattern', 'children' => [
                ['id' => 'a3', 'type' => $type, 'props' => ['ref' => 'card'], 'bind' => ['values.title' => 'entry.title'], 'label' => 'Second'],
                ['id' => 'a4', 'type' => 'paragraph', 'props' => ['text' => 'A pattern is {"type":"pattern","props":{"ref":"card"}} in JSON.']],
            ]],
            ['id' => 'a5', 'type' => $type, 'props' => []],
        ];
    }

    public function test_entries_working_copies_and_revisions_in_the_database_follow(): void
    {
        $this->cms()->entryService()->create('components', ['title' => 'Card', 'slug' => 'card', 'status' => 'published', 'data' => ['synced' => true,
            'props' => [['handle' => 'title', 'type' => 'text', 'label' => 'Title', 'default' => 'Card']],
            'blocks' => [['type' => 'heading', 'props' => ['level' => '3'], 'bind' => ['text' => 'props.title']]],
        ]]);
        $page = $this->cms()->entryService()->create('pages', ['title' => 'Home', 'slug' => 'home', 'status' => 'published', 'data' => ['content' => [['type' => 'paragraph', 'props' => ['text' => 'Soon.']]]]]);
        $other = $this->cms()->entryService()->create('pages', ['title' => 'Plain', 'slug' => 'plain', 'status' => 'published', 'data' => ['content' => [['type' => 'paragraph', 'props' => ['text' => 'No pattern here, only the word.']]]]]);
        $untouched = DB::table('entries')->where('id', $other->id)->first();

        // What only looks like the block stays: a value, a row of another field with `type`, a map with a key no block has.
        $rest = [
            'kind' => 'pattern',
            'allowed' => ['pattern'],
            'rows' => [['type' => 'pattern', 'text' => 'A row of a matrix'], ['type' => 'pattern', 'props' => ['ref' => 'card'], 'handle' => 'not-a-block'], ['type' => 'pattern', 'props' => ['ref' => ['card']]]],
        ];
        $json = static fn (array $value): string => str_replace('"props":[]', '"props":{}', json_encode($value, JSON_UNESCAPED_SLASHES));
        DB::table('entries')->where('id', $page->id)->update([
            'data' => $json(['content' => $this->tree('pattern'), ...$rest]),
            'draft' => $json(['title' => 'Home, edited', 'data' => ['content' => $this->tree('pattern'), ...$rest]]),
        ]);
        DB::table('revisions')->where('entry_id', $page->id)->delete();
        $revision = strtolower((string) Str::ulid());
        DB::table('revisions')->insert(['id' => $revision, 'entry_id' => $page->id, 'collection' => 'pages', 'action' => 'save', 'title' => 'Home', 'created_at' => now(),
            'snapshot' => $json(['title' => 'Home', 'slug' => 'home', 'status' => 'published', 'data' => ['content' => $this->tree('pattern'), ...$rest], 'draft' => ['data' => ['content' => $this->tree('pattern')]]])]);

        $person = $this->admin();
        DB::table('users')->where('id', $person->id)->update(['data' => $json(['bio' => $this->tree('pattern'), 'kind' => 'pattern'])]);

        $this->migrate();

        $check = function () use ($page, $other, $untouched, $revision, $rest, $person): void {
            $this->assertEquals(['bio' => $this->tree('component'), 'kind' => 'pattern'], json_decode((string) DB::table('users')->where('id', $person->id)->value('data'), true));

            // Compared as maps: MySQL keeps the keys of a JSON object in an order of its own.
            $row = DB::table('entries')->where('id', $page->id)->first();
            $this->assertEquals(['content' => $this->tree('component'), ...$rest], json_decode((string) $row->data, true));
            $this->assertEquals(['title' => 'Home, edited', 'data' => ['content' => $this->tree('component'), ...$rest]], json_decode((string) $row->draft, true));
            $this->assertInstanceOf(\stdClass::class, json_decode((string) $row->data)->content[2]->props, 'An empty map is still a map.');

            $snapshot = json_decode((string) DB::table('revisions')->where('id', $revision)->value('snapshot'), true);
            $this->assertEquals($this->tree('component'), $snapshot['data']['content']);
            $this->assertEquals($this->tree('component'), $snapshot['draft']['data']['content']);
            $this->assertEquals($rest['rows'], $snapshot['data']['rows']);
            $this->assertSame('Home', $snapshot['title']);

            // A row without the block is not written at all.
            $this->assertEquals($untouched, DB::table('entries')->where('id', $other->id)->first());

            // And the page shows its components again, as the code now reads them.
            $html = $this->app->make(Renderer::class)->entry($this->cms()->entries()->find($page->id))['html'];
            $this->assertStringContainsString('>Fast</h3>', $html);
            $this->assertStringContainsString('>Home</h3>', $html);
            $this->assertSame('component', $this->cms()->entries()->find($page->id)->withWorkingCopy()->data['content'][0]['type']);
        };

        $check();
        $this->again();
        $check();
        $this->migrate();
        $check();
    }

    public function test_files_follow_their_directives_front_matter_working_copies_and_definitions(): void
    {
        $content = $this->site.'/content';
        $fence = '```';
        $template = <<<MD
            ---
            id: 01m5x7ttztbtcwvfhg4p1ygzn2
            title:   "Page"
            status: published
            description: 'The pattern of every page.'
            ---

            ::: pattern {"id":"t-header","props":{"ref":"header"}}
            :::

            ::: box {"id":"t-main","props":{"tag":"main"},"label":"pattern"}
            The word pattern, and a line that only shows one:

            {$fence}
            :::: pattern {"props":{"ref":"header"}}
            ::::
            {$fence}

            :::: pattern {"props":{"ref":"header","values":{"title":"Twice"}},"bind":{"values.title":"entry.title"}}
            ::::

            :::: outlet {"id":"t-outlet"}
            ::::
            :::

            :::pattern
            :::
            MD;
        Files::put($content.'/collections/templates/page.md', $template."\n");
        Files::put($content.'/collections/components/header.md', <<<'MD'
            ---
            id: 01m5x7tz7b6n961bpt19rdef1k
            title: Header
            status: published
            synced: true
            props:
              - { handle: body, type: blocks, label: Body, allowed: [heading, pattern, pattern] }
              - { handle: other, type: select, label: Other, dynamic: patterns }
              - { handle: tags, type: tags, label: Tags, allowed: [pattern], dynamic: patterns-of-mine }
            ---

            ::: box {"props":{"tag":"header"}}
            ### Header
            :::

            MD);
        // A body that is Markdown, not blocks, only talks about the directive; the blocks in its front matter are blocks.
        Files::put($content.'/collections/notes/how.md', $note = <<<'MD'
            ---
            id: 01m5x7tz7b6n961bpt19rdef2k
            title: How
            status: published
            ---

            ::: pattern {"props":{"ref":"header"}}
            :::

            MD);
        Files::put($content.'/collections/notes/aside.md', <<<'MD'
            ---
            id: 01m5x7tz7b6n961bpt19rdef3k
            title: Aside
            status: published
            aside:
              - { id: n1, type: pattern, props: { ref: header } }
            ---

            ::: pattern {"props":{"ref":"header"}}
            :::

            MD);
        Files::putJson($this->site.'/storage/drafts/01m5x7ttztbtcwvfhg4p1ygzn2.json', ['title' => 'Page, edited', 'data' => ['blocks' => $this->tree('pattern')]]);
        Yaml::write($content.'/globals/footer.yaml', ['title' => 'Footer', 'fields' => [['handle' => 'columns', 'type' => 'blocks', 'allowed' => ['pattern', 'link']], ['handle' => 'pattern', 'type' => 'text']],
            'data' => ['columns' => $this->tree('pattern'), 'pattern' => 'pattern'], 'locales' => ['de' => ['columns' => [['id' => 'd1', 'type' => 'pattern', 'props' => ['ref' => 'card']]]]]]);
        Yaml::write($content.'/fieldsets/hero.yaml', ['title' => 'Hero', 'fields' => [['handle' => 'intro', 'type' => 'blocks', 'allowed' => ['pattern']]]]);
        Files::put($content.'/blocks/teaser/block.json', '{"name":"teaser","title":"Teaser","defaults":{},"fields":[{"handle":"card","type":"select","dynamic":"patterns"}],"template":[{"type":"pattern","props":{"ref":"card"}}],"keywords":["pattern"]}');
        Files::put($content.'/blocks/slot/block.json', '{"name":"slot","title":"Slot","parent":"pattern","children":["heading","pattern"]}');
        Files::put($content.'/blocks/strip/block.json', '{"name":"strip","title":"Strip","children":true}');
        Files::put($content.'/design/tokens.json', $tokens = '{"color":{"pattern":"#fff"},"type":"pattern"}');
        Files::put($content.'/media/01abc.yaml', $media = "type: pattern\nprops:\n  ref: card\n");
        $this->cms()->collections()->flush();

        $this->migrate();

        $check = function () use ($content, $template, $note, $tokens, $media, $fence): void {
            $this->assertSame(['name' => 'slot', 'title' => 'Slot', 'parent' => 'component', 'children' => ['heading', 'component']], Files::readJson($content.'/blocks/slot/block.json'), 'A block of the site\'s own keeps taking components as children.');
            $this->assertSame('{"name":"strip","title":"Strip","children":true}', file_get_contents($content.'/blocks/strip/block.json'));

            $expected = strtr($template, [
                '::: pattern {"id":"t-header"' => '::: component {"id":"t-header"',
                ':::: pattern {"props":{"ref":"header","values"' => ':::: component {"props":{"ref":"header","values"',
                ":::pattern\n" => ":::component\n",
            ]);
            $this->assertSame($expected."\n", file_get_contents($content.'/collections/templates/page.md'), 'Directives are renamed where the codec reads them; the front matter, the text and the code stay to the letter.');
            $this->assertStringContainsString("{$fence}\n:::: pattern {\"props\":{\"ref\":\"header\"}}\n::::\n{$fence}", $expected);

            $header = \Cms\Content\Entries\Frontmatter::parse((string) file_get_contents($content.'/collections/components/header.md'));
            $this->assertSame([
                ['handle' => 'body', 'type' => 'blocks', 'label' => 'Body', 'allowed' => ['heading', 'component']],
                ['handle' => 'other', 'type' => 'select', 'label' => 'Other', 'dynamic' => 'components'],
                ['handle' => 'tags', 'type' => 'tags', 'label' => 'Tags', 'allowed' => ['pattern'], 'dynamic' => 'patterns-of-mine'],
            ], $header[0]['props']);
            $this->assertSame("::: box {\"props\":{\"tag\":\"header\"}}\n### Header\n:::", $header[1]);

            $this->assertSame($note, file_get_contents($content.'/collections/notes/how.md'));
            $aside = \Cms\Content\Entries\Frontmatter::parse((string) file_get_contents($content.'/collections/notes/aside.md'));
            $this->assertSame([['id' => 'n1', 'type' => 'component', 'props' => ['ref' => 'header']]], $aside[0]['aside']);
            $this->assertSame("::: pattern {\"props\":{\"ref\":\"header\"}}\n:::", $aside[1]);

            $this->assertSame(['title' => 'Page, edited', 'data' => ['blocks' => $this->tree('component')]], Files::readJson($this->site.'/storage/drafts/01m5x7ttztbtcwvfhg4p1ygzn2.json'));

            $footer = Yaml::read($content.'/globals/footer.yaml');
            $this->assertSame([['handle' => 'columns', 'type' => 'blocks', 'allowed' => ['component', 'link']], ['handle' => 'pattern', 'type' => 'text']], $footer['fields']);
            $this->assertSame(['columns' => $this->tree('component'), 'pattern' => 'pattern'], $footer['data']);
            $this->assertSame('component', $footer['locales']['de']['columns'][0]['type']);
            $this->assertSame(['component'], Yaml::read($content.'/fieldsets/hero.yaml')['fields'][0]['allowed']);
            $this->assertSame(['heading', 'component', 'box'], Yaml::read($content.'/collections/pages.yaml')['fields'][0]['allowed']);
            $this->assertSame(['pattern' => 'Pattern', 'plain' => 'Plain'], Yaml::read($content.'/collections/pages.yaml')['fields'][1]['options']);

            $block = (string) file_get_contents($content.'/blocks/teaser/block.json');
            $this->assertSame(['name' => 'teaser', 'title' => 'Teaser', 'defaults' => [], 'fields' => [['handle' => 'card', 'type' => 'select', 'dynamic' => 'components']], 'template' => [['type' => 'component', 'props' => ['ref' => 'card']]], 'keywords' => ['pattern']], json_decode($block, true));
            $this->assertStringContainsString('"defaults": {}', $block);

            // Not blocks: the design's tokens, and a record of the media library.
            $this->assertSame($tokens, file_get_contents($content.'/design/tokens.json'));
            $this->assertSame($media, file_get_contents($content.'/media/01abc.yaml'));

            // What the code reads now: the template with its components, also in its working copy.
            $page = $this->cms()->entries()->find('01m5x7ttztbtcwvfhg4p1ygzn2');
            $this->assertSame(['component', 'box', 'component'], array_column($page->data['blocks'], 'type'));
            $this->assertSame(['paragraph', 'code', 'component', 'outlet'], array_column($page->data['blocks'][1]['children'], 'type'));
            $this->assertSame(":::: pattern {\"props\":{\"ref\":\"header\"}}\n::::", $page->data['blocks'][1]['children'][1]['props']['code']);
            $this->assertSame('component', $page->withWorkingCopy()->data['blocks'][0]['type']);
            $this->assertSame(['heading', 'component', 'box'], $this->cms()->collections()->find('pages')->blueprint()->field('content')->get('allowed'));
        };

        $check();
        $files = $this->files();
        $this->again();
        $check();
        $this->assertSame($files, $this->files(), 'A second run writes nothing.');
        $this->migrate();
        $this->assertSame($files, $this->files());
    }

    public function test_a_file_whose_front_matter_cannot_be_read_is_skipped_and_the_rest_renamed(): void
    {
        $content = $this->site.'/content';
        Files::put($content.'/collections/notes/broken.md', $broken = "---\ntitle: [unclosed\naside: pattern\n---\n::: pattern {\"props\":{\"ref\":\"header\"}}\n:::\n");
        Files::put($content.'/collections/notes/fine.md', "---\ntitle: Fine\naside:\n  - type: pattern\n    props:\n      ref: header\n---\nText.\n");
        Files::put($content.'/blocks/later/block.json', '{"name":"later","title":"Later","parent":"pattern"}');

        // A migration that threw here would stop `cms migrate`, and a deploy, half way.
        (require database_path('migrations/'.self::MIGRATION.'.php'))->up();

        $this->assertSame($broken, file_get_contents($content.'/collections/notes/broken.md'));
        $this->assertStringContainsString('type: component', (string) file_get_contents($content.'/collections/notes/fine.md'));
        $this->assertSame('component', Files::readJson($content.'/blocks/later/block.json')['parent']);
    }

    public function test_a_site_without_the_old_block_is_left_as_it_is(): void
    {
        $this->app->make(\Cms\Modules\Site\Starter::class)->refresh($this->admin());
        $files = $this->files();
        $rows = [DB::table('entries')->orderBy('id')->get()->all(), DB::table('revisions')->orderBy('id')->get()->all()];
        $this->assertNotSame([], $rows[0]);
        $this->assertArrayHasKey('content/collections/templates/default.md', $files);
        $this->assertStringContainsString('::: component {"id":"t-header","props":{"ref":"header"}}', $files['content/collections/templates/default.md']);

        $this->migrate();
        $this->again();

        $this->assertSame($files, $this->files());
        $this->assertEquals($rows, [DB::table('entries')->orderBy('id')->get()->all(), DB::table('revisions')->orderBy('id')->get()->all()]);
    }
}

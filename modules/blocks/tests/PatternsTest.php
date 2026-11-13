<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Content\Entries\Frontmatter;
use Cms\Modules\Blocks\Patterns;
use Cms\Support\Files;
use Cms\Tests\TestCase;

/** Patterns: blocks to start from, copied in and then changed freely. Never synced, no properties. */
final class PatternsTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks'];
    }

    private function ability(string $name, array $input = []): mixed
    {
        return $this->cms()->abilities()->execute($name, $input, AbilityContext::forUser($this->admin(), 'admin'));
    }

    public function test_patterns_are_a_collection_of_their_own_beside_templates_and_components(): void
    {
        $collection = $this->cms()->collections()->find(Patterns::COLLECTION);

        $this->assertNotNull($collection);
        $this->assertTrue($collection->system);
        $this->assertSame('files', $collection->driver);
        $this->assertSame(['blocks', 'category', 'description', 'keywords'], array_map(static fn ($f) => $f->handle, $collection->blueprint()->fields()));
        $this->assertSame('blocks', $collection->body()?->handle);
        $this->assertNotContains('synced', array_map(static fn ($f) => $f->handle, $this->cms()->collections()->find('components')->blueprint()->fields()), 'components are always synced');
    }

    public function test_a_pattern_is_saved_as_a_file_of_front_matter_and_block_markdown(): void
    {
        $saved = $this->ability('patterns/save', [
            'handle' => 'hero-photo', 'title' => 'Hero With Photo', 'category' => 'Heroes', 'description' => 'A photo behind a big title.', 'keywords' => ['intro', 'cover'],
            'blocks' => "::: section\n## Big title\n\nA line under it.\n:::",
        ]);

        $this->assertSame(['hero-photo', 'Hero With Photo', 'Heroes', ['intro', 'cover'], true, 'site'], [$saved['handle'], $saved['title'], $saved['category'], $saved['keywords'], $saved['editable'], $saved['source']]);
        $this->assertSame(['heading', 'paragraph'], array_column($saved['blocks'][0]['children'], 'type'));

        $file = content_path('collections/patterns/hero-photo.md');
        $this->assertFileExists($file);
        [$meta, $body] = Frontmatter::parse((string) file_get_contents($file));
        $this->assertSame(['Hero With Photo', 'Heroes', 'A photo behind a big title.', ['intro', 'cover']], [$meta['title'], $meta['category'], $meta['description'], $meta['keywords']]);
        $this->assertArrayNotHasKey('synced', $meta);
        $this->assertArrayNotHasKey('props', $meta);
        $this->assertStringContainsString('## Big title', $body, 'the blocks are the body, in Block Markdown');

        // Saved again by handle: the same pattern, changed.
        $again = $this->ability('patterns/save', ['handle' => 'hero-photo', 'title' => 'Hero, Photo', 'blocks' => [['type' => 'heading', 'props' => ['text' => 'Hi']]]]);
        $this->assertSame($saved['id'], $again['id']);
        $this->assertSame('Hero, Photo', $again['title']);
    }

    public function test_patterns_list_by_category_with_the_usual_ones_first(): void
    {
        foreach ([['pricing', 'Price Table', 'Lists'], ['team', 'Team', 'People'], ['home', 'Home', 'Pages'], ['odd', 'Odd One', 'Zines'], ['hero', 'Hero', 'Heroes'], ['loose', 'Loose', '']] as [$handle, $title, $category]) {
            $this->ability('patterns/save', ['handle' => $handle, 'title' => $title, 'category' => $category, 'blocks' => [['type' => 'paragraph', 'props' => ['text' => $title]]]]);
        }

        $this->assertSame(['Heroes', 'People', 'Lists', 'Pages', 'Other', 'Zines'], array_values(array_unique(array_column($this->ability('patterns/list'), 'category'))), 'the usual categories in their order, then the rest A–Z');
        $this->assertSame(['home'], array_column($this->ability('patterns/list', ['category' => 'pages']), 'handle'), 'the patterns a new page can start from');

        $draft = $this->ability('patterns/save', ['handle' => 'later', 'title' => 'Later', 'blocks' => [['type' => 'divider']], 'publish' => false]);
        $this->assertNotContains('later', array_column($this->ability('patterns/list'), 'handle'));
        $this->assertContains('later', array_column($this->ability('patterns/list', ['working' => true]), 'handle'));
        $this->assertNotNull($draft['id']);
    }

    public function test_a_plugin_ships_read_only_patterns(): void
    {
        $folder = storage_path('framework/testing/acme-patterns');
        Files::put($folder.'/acme-hero.md', "---\ntitle: Acme Hero\ncategory: Heroes\ndescription: From a plugin.\nkeywords: [acme]\n---\n\n## From Acme\n\nIts words.\n");
        Files::put($folder.'/acme-list.json', (string) json_encode(['title' => 'Acme List', 'category' => 'Lists', 'blocks' => [['type' => 'list', 'props' => ['items' => ['One', 'Two']]]]]));
        Files::put($folder.'/broken.md', "---\ntitle: [unclosed\n---\n");
        $this->cms()->hooks()->addFilter('blocks.pattern-sources', static fn (array $sources) => [...$sources, ['path' => $folder, 'source' => 'acme/patterns']]);
        $this->app->make(Patterns::class)->flush();

        $listed = array_column($this->ability('patterns/list'), null, 'handle');
        $this->assertSame(['acme-hero', 'acme-list'], array_keys($listed), 'a file that can’t be read is left out');
        $this->assertSame(['Acme Hero', 'Heroes', ['acme'], false, 'acme/patterns', null], [$listed['acme-hero']['title'], $listed['acme-hero']['category'], $listed['acme-hero']['keywords'], $listed['acme-hero']['editable'], $listed['acme-hero']['source'], $listed['acme-hero']['id']]);
        $this->assertSame(['heading', 'paragraph'], array_column($listed['acme-hero']['blocks'], 'type'));
        $this->assertSame('list', $listed['acme-list']['blocks'][0]['type']);

        $this->expectException(AbilityException::class);
        $this->ability('patterns/save', ['handle' => 'acme-hero', 'title' => 'Mine', 'blocks' => []]);
    }

    public function test_components_are_always_placed_as_references(): void
    {
        $saved = $this->ability('components/save', ['handle' => 'card', 'title' => 'Card', 'synced' => false, 'blocks' => [['type' => 'paragraph', 'props' => ['text' => 'Card']]]]);

        $this->assertArrayNotHasKey('synced', $saved);
        $this->assertSame('Components', $saved['category']);
        $this->assertArrayNotHasKey('synced', $this->cms()->entries()->find($saved['id'])->data, 'there is nothing to choose');
    }

    public function test_saving_a_pattern_keeps_the_same_guards_as_any_document(): void
    {
        $editor = AbilityContext::forUser($this->userWithRole('editor'), 'admin');
        $this->assertSame('Plain', $this->cms()->abilities()->execute('patterns/save', ['handle' => 'plain', 'title' => 'Plain', 'blocks' => [['type' => 'paragraph', 'props' => ['text' => 'Words']]]], $editor)['title'], 'an editor saves patterns');

        try {
            $this->cms()->abilities()->execute('patterns/save', ['handle' => 'raw', 'title' => 'Raw', 'blocks' => [['type' => 'html', 'props' => ['html' => '<script>x</script>']]]], $editor);
            $this->fail('Custom HTML went into a pattern without the permission for it.');
        } catch (AbilityException $e) {
            $this->assertStringContainsString('Custom HTML', $e->getMessage());
        }
    }
}

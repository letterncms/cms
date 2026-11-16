<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Content\Entries\Frontmatter;
use Cms\Modules\Blocks\Components;
use Cms\Support\Files;
use Cms\Tests\TestCase;

/** Components: synced ones are placed as references, the rest copied in and then changed freely. */
final class ComponentsTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks'];
    }

    private function ability(string $name, array $input = []): mixed
    {
        return $this->cms()->abilities()->execute($name, $input, AbilityContext::forUser($this->admin(), 'admin'));
    }

    public function test_components_are_a_collection_with_a_synced_setting_and_no_patterns_beside_them(): void
    {
        $collection = $this->cms()->collections()->find(Components::COLLECTION);

        $this->assertNotNull($collection);
        $this->assertTrue($collection->system);
        $this->assertSame('files', $collection->driver);
        $this->assertSame(['blocks', 'synced', 'category', 'description', 'keywords', 'props'], array_map(static fn ($f) => $f->handle, $collection->blueprint()->fields()));
        $this->assertSame('blocks', $collection->body()?->handle);
        $synced = $collection->blueprint()->field('synced');
        $this->assertSame(['toggle', true, 'sidebar'], [$synced->type, $synced->default, $synced->section]);
        $this->assertSame(['synced' => [true]], $collection->blueprint()->field('props')->condition(), 'properties only mean something for a synced component');
        $this->assertNull($this->cms()->collections()->find('patterns'));
        $this->assertNull($this->cms()->abilities()->get('patterns/list'));
        $this->assertNull($this->cms()->abilities()->get('patterns/save'));
    }

    public function test_a_component_is_synced_unless_it_says_otherwise(): void
    {
        $card = $this->ability('components/save', ['handle' => 'card', 'title' => 'Card', 'props' => [['handle' => 'title', 'type' => 'text']], 'blocks' => [['type' => 'paragraph', 'props' => ['text' => 'Card']]]]);

        $this->assertSame([true, 'Other', [], 1], [$card['synced'], $card['category'], $card['keywords'], count($card['props'])]);
        $this->assertTrue($this->cms()->entries()->find($card['id'])->data['synced'], 'the field’s default');

        $copy = $this->ability('components/save', ['handle' => 'card', 'title' => 'Card', 'synced' => false, 'blocks' => [['type' => 'paragraph', 'props' => ['text' => 'Card']]]]);
        $this->assertSame([$card['id'], false, []], [$copy['id'], $copy['synced'], $copy['props']], 'a copy takes no property values');
    }

    public function test_an_unsynced_component_is_saved_as_a_file_of_front_matter_and_block_markdown(): void
    {
        $saved = $this->ability('components/save', [
            'handle' => 'hero-photo', 'title' => 'Hero With Photo', 'synced' => false, 'category' => 'Heroes', 'description' => 'A photo behind a big title.', 'keywords' => ['intro', 'cover'],
            'blocks' => "::: section\n## Big title\n\nA line under it.\n:::",
        ]);

        $this->assertSame(['hero-photo', 'Hero With Photo', 'Heroes', ['intro', 'cover'], false, true, 'site'], [$saved['handle'], $saved['title'], $saved['category'], $saved['keywords'], $saved['synced'], $saved['editable'], $saved['source']]);
        $this->assertSame(['heading', 'paragraph'], array_column($saved['blocks'][0]['children'], 'type'));

        $file = content_path('collections/components/hero-photo.md');
        $this->assertFileExists($file);
        [$meta, $body] = Frontmatter::parse((string) file_get_contents($file));
        $this->assertSame(['Hero With Photo', false, 'Heroes', 'A photo behind a big title.', ['intro', 'cover']], [$meta['title'], $meta['synced'], $meta['category'], $meta['description'], $meta['keywords']]);
        $this->assertStringContainsString('## Big title', $body, 'the blocks are the body, in Block Markdown');

        // Saved again by handle without saying: the same component, still a copy.
        $again = $this->ability('components/save', ['handle' => 'hero-photo', 'title' => 'Hero, Photo', 'blocks' => [['type' => 'heading', 'props' => ['text' => 'Hi']]]]);
        $this->assertSame([$saved['id'], 'Hero, Photo', false], [$again['id'], $again['title'], $again['synced']]);
    }

    public function test_components_list_by_category_with_the_usual_ones_first(): void
    {
        foreach ([['pricing', 'Price Table', 'Lists'], ['team', 'Team', 'People'], ['home', 'Home', 'Pages'], ['odd', 'Odd One', 'Zines'], ['hero', 'Hero', 'Heroes'], ['loose', 'Loose', '']] as [$handle, $title, $category]) {
            $this->ability('components/save', ['handle' => $handle, 'title' => $title, 'synced' => $handle !== 'team', 'category' => $category, 'blocks' => [['type' => 'paragraph', 'props' => ['text' => $title]]]]);
        }
        $this->ability('components/save', ['handle' => 'header', 'title' => 'Header', 'category' => 'Pages', 'blocks' => [['type' => 'paragraph', 'props' => ['text' => 'Header']]]]);
        $this->ability('components/save', ['handle' => 'home', 'title' => 'Home', 'synced' => false, 'category' => 'Pages', 'blocks' => [['type' => 'paragraph', 'props' => ['text' => 'Home']]]]);

        $this->assertSame(['Heroes', 'People', 'Lists', 'Pages', 'Other', 'Zines'], array_values(array_unique(array_column($this->ability('components/list'), 'category'))), 'the usual categories in their order, then the rest A–Z');
        $this->assertSame(['header', 'home'], array_column($this->ability('components/list', ['category' => 'pages']), 'handle'));
        $this->assertSame(['home'], array_column($this->ability('components/list', ['category' => 'Pages', 'synced' => false]), 'handle'), 'what a new page can start from');
        $this->assertSame(['team', 'home'], array_column($this->ability('components/list', ['synced' => false]), 'handle'));

        $draft = $this->ability('components/save', ['handle' => 'later', 'title' => 'Later', 'blocks' => [['type' => 'divider']], 'publish' => false]);
        $this->assertNotContains('later', array_column($this->ability('components/list'), 'handle'));
        $this->assertContains('later', array_column($this->ability('components/list', ['working' => true]), 'handle'));
        $this->assertNotNull($draft['id']);
    }

    public function test_a_plugin_ships_read_only_components_as_json_or_block_markdown(): void
    {
        $folder = storage_path('framework/testing/acme-components');
        Files::put($folder.'/acme-hero.md', "---\ntitle: Acme Hero\nsynced: false\ncategory: Heroes\ndescription: From a plugin.\nkeywords: [acme]\n---\n\n## From Acme\n\nIts words.\n");
        Files::put($folder.'/acme-list.json', (string) json_encode(['title' => 'Acme List', 'category' => 'Lists', 'props' => [['handle' => 'title', 'type' => 'text']], 'blocks' => [['type' => 'list', 'props' => ['items' => ['One', 'Two']]]]]));
        Files::put($folder.'/broken.md', "---\ntitle: [unclosed\n---\n");
        $this->cms()->hooks()->addFilter('blocks.component-sources', static fn (array $sources) => [...$sources, ['path' => $folder, 'source' => 'acme/components']]);
        $this->app->make(Components::class)->flush();

        $listed = array_column($this->ability('components/list'), null, 'handle');
        $this->assertSame(['acme-hero', 'acme-list'], array_keys($listed), 'a file that can’t be read is left out');
        $this->assertSame(['Acme Hero', 'Heroes', ['acme'], false, false, 'acme/components', null], [$listed['acme-hero']['title'], $listed['acme-hero']['category'], $listed['acme-hero']['keywords'], $listed['acme-hero']['synced'], $listed['acme-hero']['editable'], $listed['acme-hero']['source'], $listed['acme-hero']['id']]);
        $this->assertSame(['heading', 'paragraph'], array_column($listed['acme-hero']['blocks'], 'type'));
        $this->assertSame([true, 'list'], [$listed['acme-list']['synced'], $listed['acme-list']['blocks'][0]['type']]);
    }

    public function test_saving_a_component_keeps_the_same_guards_as_any_document(): void
    {
        $editor = AbilityContext::forUser($this->userWithRole('editor'), 'admin');
        $this->assertSame('Plain', $this->cms()->abilities()->execute('components/save', ['handle' => 'plain', 'title' => 'Plain', 'synced' => false, 'blocks' => [['type' => 'paragraph', 'props' => ['text' => 'Words']]]], $editor)['title'], 'an editor saves components');

        try {
            $this->cms()->abilities()->execute('components/save', ['handle' => 'raw', 'title' => 'Raw', 'synced' => false, 'blocks' => [['type' => 'html', 'props' => ['html' => '<script>x</script>']]]], $editor);
            $this->fail('Custom HTML went into a component without the permission for it.');
        } catch (AbilityException $e) {
            $this->assertStringContainsString('Custom HTML', $e->getMessage());
        }
    }
}

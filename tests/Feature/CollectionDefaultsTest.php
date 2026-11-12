<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Content\Collections\Collection;
use Cms\Tests\TestCase;

final class CollectionDefaultsTest extends TestCase
{
    public function test_creation_options_without_blocks_support_a_field_only_collection(): void
    {
        $ctx = AbilityContext::forUser($this->admin(), 'admin');
        $options = $this->cms()->abilities()->execute('collections/options', [], $ctx);
        $this->assertSame([], $options['defaults']);
        $this->assertNotEmpty($options['settings']);
        $this->assertFalse($this->cms()->fields()->has('blocks'));

        $saved = $this->cms()->abilities()->execute('collections/save', [
            'handle' => 'services', 'createOnly' => true,
            'definition' => [...$options['defaults'], 'title' => 'Services'],
        ], $ctx);
        $this->assertSame([], $saved['fields']);
        $this->assertNull($this->cms()->collections()->findOrFail('services')->body);
        $entry = $this->cms()->entryService()->create('services', ['title' => 'Consulting'], $ctx->user);
        $this->assertSame([], $entry->data);
    }

    public function test_creation_options_expose_plugin_definition_defaults_before_explicit_settings(): void
    {
        $this->cms()->hooks()->addFilter('collections.defaults', static fn (array $defaults) => [
            ...$defaults, 'title' => 'Default name', 'fields' => [['handle' => 'reference', 'type' => 'text', 'label' => 'Reference']],
        ]);
        $ctx = AbilityContext::forUser($this->admin(), 'admin');
        $options = $this->cms()->abilities()->execute('collections/options', [], $ctx);
        $saved = $this->cms()->abilities()->execute('collections/save', [
            'handle' => 'records', 'createOnly' => true,
            'definition' => [...$options['defaults'], 'title' => 'Records'],
        ], $ctx);
        $this->assertSame('Records', $saved['title']);
        $this->assertSame('reference', $saved['fields'][0]['handle']);
    }

    public function test_the_default_entry_view_round_trips_through_settings_and_the_manifest(): void
    {
        $admin = $this->admin();
        $ctx = AbilityContext::forUser($admin, 'admin');
        $this->assertSame('table', Collection::fromArray('news', [])->defaultView);
        foreach (Collection::VIEWS as $view) {
            $this->cms()->abilities()->execute('collections/save', ['handle' => 'news', 'definition' => ['title' => 'News', 'default_view' => $view]], $ctx);
            $this->cms()->collections()->flush();
            $collection = $this->cms()->collections()->find('news');
            $this->assertSame($view, $collection->defaultView);
            $this->assertSame($view, $this->cms()->abilities()->execute('collections/get', ['handle' => 'news'], $ctx)['default_view']);
            $manifest = $this->app->make(\Cms\Admin\Manifest::class)->build($admin);
            $this->assertSame($view, array_column($manifest['collections'], null, 'handle')['news']['defaultView']);
        }
        $settings = array_column($this->cms()->collections()->settingsFields($collection), null, 'handle');
        $this->assertSame(['table', 'grid', 'calendar'], array_keys($settings['default_view']['options']));
    }

    public function test_an_invalid_default_view_cannot_be_saved(): void
    {
        $this->expectException(AbilityException::class);
        $this->expectExceptionMessage('Unknown default view invalid');
        $this->cms()->abilities()->execute('collections/save', ['handle' => 'news', 'definition' => ['default_view' => 'invalid']], AbilityContext::forUser($this->admin(), 'admin'));
    }

    public function test_default_display_fields_round_trip_and_keep_empty_distinct_from_automatic(): void
    {
        $ctx = AbilityContext::forUser($this->admin(), 'admin');
        foreach ([['status', 'field:category', 'published'], [], null] as $columns) {
            $definition = ['title' => 'News', 'default_columns' => $columns, 'fields' => [['handle' => 'category', 'type' => 'text']]];
            $saved = $this->cms()->abilities()->execute('collections/save', ['handle' => 'news', 'definition' => $definition], $ctx);
            $this->assertSame($columns, $saved['default_columns']);
            $this->cms()->collections()->flush();
            $collection = $this->cms()->collections()->findOrFail('news');
            $this->assertSame($columns, $collection->defaultColumns);
            $this->assertSame($columns, Collection::fromArray('news', $collection->toYaml())->defaultColumns);
            $this->assertSame($columns, $this->cms()->abilities()->execute('collections/get', ['handle' => 'news'], $ctx)['default_columns']);
        }
        $settings = array_column($this->cms()->collections()->settingsFields($collection), null, 'handle');
        $this->assertSame('collection-display-fields', $settings['default_columns']['component']);
        $this->assertArrayNotHasKey('editor', $settings);
    }

    public function test_invalid_default_display_fields_are_rejected(): void
    {
        foreach (['status', ['bad'], [false], [['nested']], ['column' => 'status']] as $invalid) {
            try {
                Collection::fromArray('news', ['default_columns' => $invalid]);
                $this->fail('Invalid display fields were accepted.');
            } catch (\InvalidArgumentException $e) {
                $this->assertStringContainsString('Default display fields', $e->getMessage());
            }
        }
    }

    public function test_defaults_do_not_guess_english_singulars(): void
    {
        foreach (['case_studies' => 'Case studies', 'news' => 'News', 'people' => 'People', 'status' => 'Status'] as $handle => $title) {
            $collection = Collection::fromArray($handle, ['title' => $title]);
            $this->assertSame('', $collection->template);
            $this->assertSame($title, $collection->singular);
            $this->assertSame($collection->toYaml(), Collection::fromArray($handle, $collection->toYaml())->toYaml());
        }
        $custom = Collection::fromArray('people', ['title' => 'People', 'singular' => 'Person', 'template' => 'profile']);
        $this->assertSame('Person', $custom->singular);
        $this->assertSame('profile', $custom->template);
        $this->assertSame('', Collection::fromArray('people', ['template' => ''])->template);
    }

    public function test_creation_saves_overrides_and_cannot_replace_an_existing_collection(): void
    {
        $ctx = AbilityContext::forUser($this->admin(), 'admin');
        $input = ['handle' => 'case_studies', 'createOnly' => true, 'definition' => [
            'title' => 'Case studies', 'singular' => 'Case study', 'template' => 'case_detail', 'route' => null, 'fields' => [],
        ]];
        $saved = $this->cms()->abilities()->execute('collections/save', $input, $ctx);
        $this->assertSame('Case study', $saved['singular']);
        $this->assertSame('case_detail', $saved['template']);
        $this->assertNull($this->cms()->collections()->find('case_studies')->route);

        try {
            $this->cms()->abilities()->execute('collections/save', [...$input, 'definition' => ['title' => 'Overwritten']], $ctx);
            $this->fail('Creation overwrote a collection.');
        } catch (AbilityException $e) {
            $this->assertSame('invalid_input', $e->type);
        }
        $this->assertSame('Case studies', $this->cms()->collections()->find('case_studies')->title);
        // The ordinary save ability still updates existing definitions.
        $updated = $this->cms()->abilities()->execute('collections/save', [...$input, 'createOnly' => false, 'definition' => [...$input['definition'], 'title' => 'Cases']], $ctx);
        $this->assertSame('Cases', $updated['title']);
    }

    public function test_the_list_marks_collections_the_cms_and_plugins_bring_so_the_collections_screen_can_leave_them_out(): void
    {
        $this->cms()->hooks()->addFilter('collections', static fn (array $collections) => [
            ...$collections,
            'testimonials' => Collection::fromArray('testimonials', ['title' => 'Testimonials', 'driver' => 'files', 'system' => true]),
        ]);
        $this->cms()->collections()->flush();
        $ctx = AbilityContext::forUser($this->admin(), 'admin');
        $this->cms()->abilities()->execute('collections/save', ['handle' => 'services', 'definition' => ['title' => 'Services']], $ctx);

        $system = array_column($this->cms()->abilities()->execute('collections/list', [], $ctx), 'system', 'handle');
        $this->assertFalse($system['services']);
        $this->assertTrue($system['testimonials']);
        // collections/get still describes them: their entries need the schema, and the screen reads `system` from it.
        $this->assertTrue($this->cms()->abilities()->execute('collections/get', ['handle' => 'testimonials'], $ctx)['system']);
        $this->assertFalse($this->cms()->abilities()->execute('collections/get', ['handle' => 'testimonials'], $ctx)['deletable']);
    }

    public function test_the_body_can_be_a_field_of_any_blueprint(): void
    {
        $collection = Collection::fromArray('notes', ['title' => 'Notes', 'fields' => [['handle' => 'summary', 'type' => 'text']], 'blueprints' => [
            'long' => ['title' => 'Long', 'fields' => [['handle' => 'content', 'type' => 'markdown', 'label' => 'Text']]],
            'built' => ['title' => 'Built', 'fields' => [['handle' => 'content', 'type' => 'blocks', 'label' => 'Page'], ['handle' => 'intro', 'type' => 'richtext', 'label' => 'Intro']]],
        ]]);
        $settings = array_column($this->cms()->collections()->settingsFields($collection), null, 'handle');
        $this->assertSame(['content', 'intro'], array_keys($settings['body']['options'] ?? []));
    }
}

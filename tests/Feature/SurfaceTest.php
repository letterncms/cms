<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Admin\Surface;
use Cms\Tests\TestCase;

final class SurfaceTest extends TestCase
{
    private function document(array $elements, string $root = 'root'): array
    {
        return ['version' => 1, 'id' => 'overview', 'title' => 'Overview', 'spec' => ['root' => $root, 'elements' => $elements]];
    }

    public function test_catalog_reuses_widget_permissions_and_exposes_plugin_schemas_in_the_manifest(): void
    {
        $admin = $this->cms()->admin();
        $admin->widget('private-widget', ['label' => 'Private', 'permission' => 'packages.manage']);
        $admin->widget('public-widget', ['label' => 'Public']);
        $admin->widget('launcher', ['label' => 'Launcher', 'assistant' => false]);
        $admin->component('reviews/summary', ['label' => 'Reviews', 'props' => ['type' => 'object', 'properties' => ['rating' => ['type' => 'number']], 'required' => ['rating']], 'permission' => 'packages.manage']);
        $author = $this->userWithRole('author');
        $surface = $this->app->make(Surface::class);
        $names = array_column($surface->catalog($author), 'id');
        $this->assertContains('widget/public-widget', $names);
        $this->assertNotContains('widget/private-widget', $names);
        $this->assertNotContains('widget/launcher', $names);
        $this->assertNotContains('reviews/summary', $names);
        $owner = $this->admin();
        $this->assertContains('reviews/summary', array_column($surface->catalog($owner), 'id'));
    }

    public function test_invalid_specs_fail_before_rendering(): void
    {
        $surface = $this->app->make(Surface::class);
        $user = $this->admin();
        $invalid = [
            ['root' => ['type' => 'script', 'props' => []]],
            ['root' => ['type' => 'ui/stat', 'props' => ['label' => 'Missing value']]],
            ['root' => ['type' => 'ui/text', 'props' => ['text' => 'Text', 'dangerouslySetInnerHTML' => 'bad']]],
            ['root' => ['type' => 'ui/stack', 'children' => ['root']]],
            ['root' => ['type' => 'ui/stack', 'children' => ['missing']]],
            ['root' => ['type' => 'ui/text', 'props' => ['text' => 'Text']], 'orphan' => ['type' => 'ui/stack']],
            ['root' => ['type' => 'ui/text', 'props' => ['text' => 'Text'], 'children' => ['child']], 'child' => ['type' => 'ui/stack']],
            ['root' => ['type' => 'ui/table', 'props' => ['columns' => ['A'], 'rows' => [[1, 2]]]]],
            ['root' => ['type' => 'ui/action', 'props' => ['label' => 'Run']]],
            ['root' => ['type' => 'ui/action', 'props' => ['label' => 'Run'], 'on' => ['submit' => ['action' => 'assistant/conversation-delete', 'params' => ['id' => 'other']]]]],
            ['root' => ['type' => 'ui/action', 'props' => ['label' => 'Run'], 'on' => ['submit' => ['action' => 'entries/create', 'params' => ['collection' => 'pages']]]]],
        ];
        foreach ($invalid as $elements) {
            try {
                $surface->validate($this->document($elements), $user);
                $this->fail('Accepted an invalid spec: '.json_encode($elements));
            } catch (\InvalidArgumentException|\Cms\Abilities\AbilityException $e) {
                $this->assertNotEmpty($e->getMessage());
            }
        }
    }

    public function test_layout_depth_and_size_are_bounded(): void
    {
        $surface = $this->app->make(Surface::class);
        $user = $this->admin();
        $elements = [];
        for ($i = 0; $i < 9; $i++) $elements['n'.$i] = ['type' => 'ui/stack', 'children' => $i < 8 ? ['n'.($i + 1)] : []];
        try {
            $surface->validate($this->document($elements, 'n0'), $user);
            $this->fail('Accepted excessive depth');
        } catch (\Cms\Abilities\AbilityException $e) {
            $this->assertStringContainsString('eight', $e->getMessage());
        }
        $this->expectException(\Cms\Abilities\AbilityException::class);
        $surface->validate($this->document(['root' => ['type' => 'ui/text', 'props' => ['text' => str_repeat('x', Surface::MAX_BYTES)]]]), $user);
    }

    public function test_custom_component_props_use_the_existing_schema_validator(): void
    {
        $this->cms()->admin()->component('reviews/summary', ['label' => 'Reviews', 'props' => ['type' => 'object', 'properties' => ['rating' => ['type' => 'number', 'minimum' => 0, 'maximum' => 5]], 'required' => ['rating']]]);
        $surface = $this->app->make(Surface::class);
        $user = $this->admin();
        $valid = $this->document(['root' => ['type' => 'reviews/summary', 'props' => ['rating' => 4.5]]]);
        $this->assertSame($valid, $surface->validate($valid, $user));
        $valid['spec']['elements']['root']['props']['rating'] = 9;
        $this->expectException(\Cms\Support\Schema\SchemaException::class);
        $surface->validate($valid, $user);
    }

    public function test_plugin_object_props_cannot_enable_dynamic_expressions(): void
    {
        $this->cms()->admin()->component('example/object', ['label' => 'Object', 'props' => ['type' => 'object']]);
        $this->expectException(\Cms\Abilities\AbilityException::class);
        $this->app->make(Surface::class)->validate($this->document(['root' => ['type' => 'example/object', 'props' => ['nested' => ['$state' => '/private']]]]), $this->admin());
    }
}

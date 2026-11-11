<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Modules\Blocks\Document;
use Cms\Modules\Site\Design\Code;
use Cms\Modules\Site\Rendering\Renderer;
use Cms\Support\Files;
use Cms\Tests\TestCase;

/** A block names a script of the design; the runtime mounts it on the element. */
final class BehaviorTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    protected function collections(): array
    {
        return ['pages' => ['title' => 'Pages', 'route' => '/{slug}', 'body' => 'content', 'fields' => [['handle' => 'content', 'type' => 'blocks']]]];
    }

    private function page(string $title, array $blocks): string
    {
        $entry = $this->cms()->entryService()->create('pages', ['title' => $title, 'status' => 'published', 'data' => ['content' => $blocks]]);

        return $this->app->make(Renderer::class)->entry($this->cms()->entries()->find($entry->id))['html'];
    }

    public function test_a_behaviour_becomes_the_attributes_the_runtime_reads(): void
    {
        Files::put(content_path('design/scripts/tilt.js'), "export function mount() {}\n");
        $this->app->make(Code::class)->flush();

        $html = $this->page('Tilted', [['type' => 'box', 'behavior' => ['module' => 'tilt', 'props' => ['max' => 8, 'label' => 'On {entry.title}', 'nested' => ['a' => [1, 2]]], 'when' => 'visible'], 'children' => []]]);

        $this->assertMatchesRegularExpression('#<div class="cms-box" data-cms-behavior="/_cms/site/scripts/tilt-[0-9a-f]{10}\.js" data-cms-props="\{&quot;max&quot;:8,&quot;label&quot;:&quot;On Tilted&quot;,&quot;nested&quot;:\{&quot;a&quot;:\[1,2\]\}\}" data-cms-when="visible">#', $html);
        $this->assertMatchesRegularExpression('#<script type="module" src="[^"]+/runtime/cms-[^"]+\.js" data-features="behavior"></script>#', $html);
        $this->assertStringContainsString('<script type="importmap">', $html, 'the script may import the others and the libraries');
        $this->assertStringNotContainsString('src="/_cms/site/scripts/tilt-', $html, 'the runtime imports it when the element is there');
    }

    public function test_a_component_hands_its_properties_to_its_behaviour(): void
    {
        Files::put(content_path('design/scripts/counter.js'), "export function mount() {}\n");
        $this->app->make(Code::class)->flush();
        $this->cms()->entryService()->create('components', ['title' => 'Counter', 'slug' => 'counter', 'status' => 'published', 'data' => ['synced' => true, 'props' => [['handle' => 'to', 'type' => 'text', 'label' => 'To']], 'blocks' => [
            ['type' => 'paragraph', 'props' => ['text' => '0'], 'behavior' => ['module' => 'counter', 'props' => ['to' => '{props.to}']]],
        ]]]);
        $this->app->make(\Cms\Modules\Blocks\Patterns::class)->flush();

        $html = $this->page('Numbers', [['type' => 'pattern', 'props' => ['ref' => 'counter', 'values' => ['to' => '120']]]]);

        $this->assertStringContainsString('data-cms-props="{&quot;to&quot;:&quot;120&quot;}"', $html);
    }

    public function test_the_canvas_runs_no_behaviour_and_a_missing_script_is_a_warning(): void
    {
        Files::put(content_path('design/scripts/tilt.js'), "export function mount() {}\n");
        $this->app->make(Code::class)->flush();
        $this->assertStringNotContainsString('data-cms-behavior', $this->app->make(Renderer::class)->blocks([['id' => 'b1', 'type' => 'box', 'behavior' => ['module' => 'tilt'], 'children' => []]]));

        $warnings = [];
        $this->cms()->hooks()->on('render.warning', function (string $message) use (&$warnings) {
            $warnings[] = $message;
        });
        $html = $this->page('Typo', [['type' => 'box', 'behavior' => ['module' => 'tillt'], 'children' => []]]);

        $this->assertStringNotContainsString('data-cms-behavior', $html);
        $this->assertStringNotContainsString('data-features', $html);
        $this->assertStringContainsString('scripts/tillt.js', $warnings[0]);
    }

    public function test_what_is_saved_is_a_name_and_plain_settings(): void
    {
        $this->assertSame([], Document::behavior(['module' => '../../x']));
        $this->assertSame([], Document::behavior(['module' => 'https://evil.example/x.js']));
        $this->assertSame(['module' => 'lib/tilt'], Document::behavior(['module' => 'lib/tilt', 'when' => 'load', 'props' => ['a', 'b']]));
        $this->assertSame(
            ['module' => 'tilt', 'props' => ['max' => 8, 'on' => true, 'list' => [1, 'two']], 'when' => 'idle'],
            Document::behavior(['module' => 'tilt', 'props' => ['max' => 8, 'on' => true, 'list' => [1, 'two'], 'bad key!' => 1, 'object' => new \stdClass], 'when' => 'idle']),
        );
        $this->assertArrayNotHasKey('props', Document::behavior(['module' => 'tilt', 'props' => ['big' => str_repeat('x', 900), 'b' => str_repeat('x', 900), 'c' => str_repeat('x', 900), 'd' => str_repeat('x', 900), 'e' => str_repeat('x', 900)]]));

        $nodes = $this->app->make(Document::class)->normalize([['type' => 'box', 'behavior' => ['module' => 'tilt', 'props' => ['max' => 8]], 'children' => []]]);
        $this->assertSame(['module' => 'tilt', 'props' => ['max' => 8]], $nodes[0]['behavior']);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks\Tests;

use Cms\Modules\Blocks\BlockRegistry;
use Cms\Modules\Blocks\BlockRenderer;
use Cms\Modules\Blocks\Document;
use Cms\Modules\Blocks\Embeds;
use Cms\Modules\Blocks\MapBlocks;
use Cms\Modules\Blocks\Scope;
use Cms\Tests\TestCase;

/** Map and Place: what a page prints for a map, its places as text, and what its script is told. */
final class MapBlocksTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks'];
    }

    private function render(array $nodes, array $scope = [], bool $editor = false): string
    {
        $renderer = app(BlockRenderer::class);
        $renderer->begin();
        $renderer->editor = $editor;

        try {
            return $renderer->withEditorDocument($editor ? 'test-source' : null, fn () => $renderer->render(app(Document::class)->normalize($nodes), new Scope($scope)));
        } finally {
            $renderer->editor = false;
        }
    }

    /** @return array<string, mixed> what the page tells the map's script */
    private static function mapOptions(string $html): array
    {
        preg_match('/data-cms-map="([^"]+)"/', $html, $m);

        return json_decode(html_entity_decode($m[1] ?? '{}', ENT_QUOTES), true);
    }

    private static function place(float $lat, float $lng, array $props = []): array
    {
        return ['type' => 'map-place', 'props' => ['place' => ['lat' => $lat, 'lng' => $lng], ...$props]];
    }

    public function test_a_map_comes_in_as_a_block_with_its_places_and_its_script(): void
    {
        $registry = app(BlockRegistry::class);

        $this->assertSame('media', $registry->get('map')->category);
        $this->assertSame(['map-place', 'repeat'], $registry->get('map')->children);
        $this->assertSame('map', $registry->get('map-place')->parent);
        $this->assertArrayHasKey('map', $registry->features());
    }

    public function test_a_map_prints_its_places_as_text_and_tells_its_script_how_to_draw(): void
    {
        $html = $this->render([['type' => 'map', 'props' => ['style' => 'blueprint', 'zoom' => 12, 'label' => 'Our campuses', 'color_pin' => '#C0392B', 'list' => true], 'children' => [
            self::place(51.0543, 3.7174, ['title' => 'Campus Gent', 'text' => "Mon–Fri\n8 to 18", 'url' => '/gent']),
            self::place(50.8467, 4.3525, ['title' => 'Campus Brussel']),
        ]]]);

        $this->assertStringContainsString('<figure', $html);
        $this->assertStringContainsString('role="region" aria-label="Our campuses"', $html);
        $this->assertStringContainsString('style="aspect-ratio:16/9"', $html);
        $this->assertStringContainsString('--cms-map-pin:#c0392b', $html);
        $this->assertStringContainsString(' data-list', $html);
        $this->assertSame(2, substr_count($html, 'data-cms-map-place'));
        $this->assertStringContainsString('data-lat="51.0543" data-lng="3.7174"', $html);
        $this->assertStringContainsString('<a href="/gent">Campus Gent</a>', $html);
        $this->assertStringContainsString("Mon–Fri<br>\n8 to 18", $html);
        $this->assertStringContainsString('https://www.openstreetmap.org/directions?to=50.8467%2C4.3525', $html);
        $this->assertTrue(app(BlockRenderer::class)->features['map'] ?? false);

        $options = self::mapOptions($html);
        $this->assertSame('blueprint', $options['style']);
        $this->assertSame(12, $options['zoom']);
        $this->assertTrue($options['interactive']);
        $this->assertSame(['pin' => '#c0392b'], $options['colors']);
        $this->assertArrayHasKey('zoomIn', $options['words']);
        $this->assertStringContainsString(':place', $options['words']['pin']);
    }

    public function test_a_map_takes_only_its_presets_steps_and_colors(): void
    {
        $options = self::mapOptions($this->render([['type' => 'map', 'props' => ['interactive' => false], 'children' => [self::place(1, 2)]]]));

        $this->assertSame('site', $options['style']);
        $this->assertSame(15, $options['zoom']);
        $this->assertFalse($options['interactive']);
        $this->assertArrayNotHasKey('colors', $options);

        // No CSS rides along into the map's style, and no preset or zoom it doesn't have.
        foreach ([['style' => 'neon'], ['zoom' => 40], ['color_water' => 'blue; x']] as $props) {
            try {
                app(Document::class)->normalize([['type' => 'map', 'props' => $props, 'children' => [self::place(1, 2)]]]);
                $this->fail('Saved '.json_encode($props));
            } catch (\Cms\Support\Schema\SchemaException) {
                $this->addToAssertionCount(1);
            }
        }
    }

    public function test_a_map_without_a_place_and_a_place_without_a_map_show_nothing(): void
    {
        $this->assertSame('', trim($this->render([['type' => 'map', 'children' => []]])));
        $this->assertSame('', trim($this->render([['type' => 'map', 'children' => [['type' => 'map-place', 'props' => ['title' => 'Nowhere']]]]])));
        $this->assertSame('', trim($this->render([self::place(51, 3, ['title' => 'Alone'])])));
    }

    public function test_a_repeat_in_a_map_makes_a_place_for_each_item(): void
    {
        $html = $this->render([['type' => 'map', 'children' => [
            ['type' => 'repeat', 'props' => ['source' => 'list', 'path' => 'campuses'], 'children' => [
                ['type' => 'map-place', 'bind' => ['place' => 'item.place', 'title' => 'item.title']],
            ]],
        ]]], ['campuses' => [
            ['title' => 'Lindenhof', 'place' => ['lat' => 51.03, 'lng' => 4.47, 'address' => 'Lindenlaan 1']],
            ['title' => 'Ter Heide', 'place' => ['lat' => 51.0408, 'lng' => 4.4381]],
            ['title' => 'Nowhere yet', 'place' => null],
        ]]);

        $this->assertSame(2, substr_count($html, 'data-cms-map-place'));
        $this->assertStringContainsString('Lindenhof', $html);
        $this->assertStringContainsString('Lindenlaan 1', $html);
        $this->assertStringNotContainsString('Nowhere yet', $html);
    }

    public function test_the_canvas_shows_the_map_drawn_by_its_own_script_and_every_place(): void
    {
        $html = $this->render([['type' => 'map', 'children' => [['type' => 'map-place', 'props' => ['title' => 'Not placed yet']]]]], editor: true);

        $this->assertStringContainsString('data-cms-map=', $html);
        // Places show under the map in the canvas, so each can be picked.
        $this->assertStringContainsString(' data-list', $html);
        $this->assertStringContainsString('Not placed yet', $html);
        // The editor runs the map's script in the canvas, still: nothing there moves or opens.
        $this->assertFalse(self::mapOptions($html)['interactive']);

        if (app(BlockRegistry::class)->features()['map']['script'] !== null) {
            $this->assertMatchesRegularExpression('#data-cms-canvas="\[\{&quot;src&quot;:&quot;/_cms/assets/[^"]+/media/map\.js#', $html);
        }
    }

    public function test_maps_are_the_map_blocks_and_never_an_embed(): void
    {
        $this->assertNull(Embeds::iframe('https://www.google.com/maps/embed?pb=!1m18'));
        $this->assertNotContains('www.google.com', Embeds::HOSTS);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Tests\TestCase;

/**
 * Every plugin registers at least one home-screen widget. This boots every plugin
 * that ships with the CMS and with the docs and website sites, and checks each one.
 */
final class PluginWidgetsTest extends TestCase
{
    /** @return list<string> plugin folders */
    private static function folders(): array
    {
        return array_values(array_filter(glob((getenv('CMS_TEST_PLUGINS') ?: getcwd().'/plugins').'/*', GLOB_ONLYDIR) ?: [], static fn ($dir) => is_file($dir.'/composer.json')));
    }

    public function createApplication()
    {
        $app = parent::createApplication();
        self::folders() === [] && $this->markTestSkipped("Needs every plugin, which aren't installed here.");

        return $app;
    }

    protected function plugins(): array
    {
        return array_map(static fn ($dir) => (string) json_decode((string) file_get_contents($dir.'/composer.json'), true)['name'], self::folders());
    }

    public function test_every_bundled_plugin_registers_a_widget(): void
    {
        $packages = $this->cms()->packages();
        $widgets = $this->cms()->admin()->widgetsByPackage();

        $this->assertSame([], $packages->inactive(), 'Every bundled plugin boots.');

        foreach ($this->plugins() as $name) {
            $this->assertNotEmpty($widgets[$name] ?? [], "{$name} registers no home-screen widget.");
        }

        $this->assertSame([], $packages->problems());
    }

    public function test_every_widget_tells_the_gallery_what_it_shows(): void
    {
        foreach ($this->cms()->admin()->widgets() as $id => $widget) {
            $this->assertNotSame('', trim($widget['description']), "Widget {$id} has no description.");
            $this->assertMatchesRegularExpression('/^[A-Z]/', $widget['label'], "Widget {$id} needs a label in sentence case.");
        }
    }

    public function test_only_a_few_widgets_are_on_by_default(): void
    {
        $enabled = array_keys(array_filter($this->cms()->admin()->widgets(), static fn ($w) => $w['enabled']));
        sort($enabled);

        $this->assertSame(['analytics-overview', 'recent', 'site-status'], $enabled);
    }

    public function test_a_plugin_without_a_widget_is_reported_but_keeps_running(): void
    {
        $registry = $this->cms()->admin();
        $owned = new \ReflectionProperty($registry, 'widgets');
        $owned->setValue($registry, array_filter($registry->widgets(), static fn ($w) => $w['package'] !== 'letterncms/seo'));

        $this->assertArrayHasKey('letterncms/seo', $this->cms()->packages()->problems());
        $this->assertTrue($this->cms()->packages()->isActive('letterncms/seo'));
        $this->assertArrayNotHasKey('letterncms/content', $this->cms()->packages()->problems(), 'Modules are the admin itself and exempt.');
    }
}

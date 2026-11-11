<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Tests\TestCase;

/**
 * The home-screen widgets of every plugin that ships with the CMS and with the docs
 * and website sites. A plugin registers one when it has something worth a glance:
 * none is fine, and nothing reports it.
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
        // Every optional module too, as a site has them.
        return [...array_map(static fn ($dir) => (string) json_decode((string) file_get_contents($dir.'/composer.json'), true)['name'], self::folders()), 'letterncms/assistant', 'letterncms/blocks', 'letterncms/collaboration', 'letterncms/languages', 'letterncms/mcp', 'letterncms/site'];
    }

    public function test_every_bundled_plugin_boots(): void
    {
        $this->assertSame([], $this->cms()->packages()->inactive(), 'Every bundled plugin boots.');
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

    public function test_a_plugin_without_a_widget_is_as_good_as_any(): void
    {
        $registry = $this->cms()->admin();
        $owned = new \ReflectionProperty($registry, 'widgets');
        $owned->setValue($registry, array_filter($registry->widgets(), static fn ($w) => $w['package'] !== 'letterncms/seo'));

        $this->assertTrue($this->cms()->packages()->isActive('letterncms/seo'));
        $seo = array_column($this->cms()->abilities()->execute('packages/list', ['type' => 'plugin'], \Cms\Abilities\AbilityContext::forUser($this->admin(), 'admin'))['items'], null, 'name')['letterncms/seo'];
        $this->assertNull($seo['problem']);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Tests\TestCase;

/**
 * A plugin is called one thing everywhere: its name (`extra.cms.label` in its
 * composer.json) is its settings page's and its screen's. They take it when
 * they leave out a label of their own. This boots every plugin and checks it.
 */
final class PluginNamesTest extends TestCase
{
    /** Screens of something a plugin adds, not the plugin's own place: they name themselves. Keep this short. */
    private const OTHER_PLACES = [
        'design' => 'Design System', // letterncms/site
    ];

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

    /** @return array<string, string> package => its name */
    private function names(): array
    {
        $names = [];

        foreach ($this->plugins() as $package) {
            $names[$package] = (string) $this->cms()->app()->make(\Cms\Packages\PackageRepository::class)->find($package)?->label;
        }

        return $names;
    }

    public function test_plugin_names_are_title_case(): void
    {
        foreach ($this->names() as $package => $name) {
            $this->assertNotSame('', $name, "{$package} has no extra.cms.label.");
            foreach (preg_split('/\s+/', $name) as $word) {
                $this->assertMatchesRegularExpression('/^(\p{Lu}|and$|or$|of$|for$|&$)/u', $word, "{$package}: “{$name}” is not in title case.");
            }
        }
    }

    public function test_a_plugins_settings_page_has_its_name(): void
    {
        $names = $this->names();

        foreach ($this->cms()->settingsRegistry()->schemas() as $namespace => $schema) {
            if (isset($names[$schema['package'] ?? '']) && ($schema['page'] ?? true)) {
                $this->assertSame($names[$schema['package']], $schema['label'], "The settings page {$namespace} of {$schema['package']} is called otherwise than the plugin.");
            }
        }
    }

    public function test_a_plugins_screen_has_its_name(): void
    {
        $names = $this->names();
        $seen = [];

        foreach ($this->cms()->admin()->navItems() as $id => $item) {
            if (! isset($names[$item['package'] ?? ''])) {
                continue;
            }

            if (isset(self::OTHER_PLACES[$id])) {
                $this->assertSame(self::OTHER_PLACES[$id], $item['label']);

                continue;
            }

            $this->assertSame($names[$item['package']], $item['label'], "The sidebar item {$id} of {$item['package']} is called otherwise than the plugin.");
            $this->assertArrayNotHasKey($item['package'], $seen, "{$item['package']} has two screens of its own ({$id} and another): the other one names itself, in OTHER_PLACES.");
            $seen[$item['package']] = $id;
        }

        $this->assertNotSame([], $seen);
    }
}

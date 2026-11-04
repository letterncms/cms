<?php

declare(strict_types=1);

namespace Cms\Modules\Settings;

use Cms\Packages\Plugin;

/**
 * The settings pages — the kernel's (site), each module's and each
 * plugin's, one item each in the settings sidebar — and the abilities they
 * are read and saved through. Required: it is how everything else is configured.
 */
final class SettingsModule extends Plugin
{
    public function boot(): void
    {
        $cms = $this->cms();

        $this->app->make(SettingsAbilities::class)->register($cms->abilities());

        // Every settings page is an item of the settings sidebar, in the section its namespace names (a plugin's
        // under Plugins), or the Settings tab of the screen it names as its home. Namespaces without a page have no item.
        $cms->hooks()->addFilter('admin.nav', function (array $items) use ($cms) {
            foreach (array_filter($cms->settingsRegistry()->schemas(), static fn (array $schema) => $schema['page']) as $namespace => $schema) {
                $home = $schema['home'] !== null ? ($items[$schema['home']]['path'] ?? null) : null;
                $items["settings.{$namespace}"] ??= [
                    'id' => "settings.{$namespace}",
                    'label' => $schema['label'],
                    'path' => $home !== null ? "{$home}?tab=settings" : "/settings/{$namespace}",
                    'icon' => $schema['icon'],
                    'section' => $schema['section'],
                    'order' => $schema['order'],
                    'permission' => $schema['permission'],
                    'home' => $schema['home'],
                    'package' => $schema['package'],
                ];
            }

            return $items;
        });

        $cms->admin()->widget('settings-setup', ['label' => 'Site Setup', 'description' => 'What the site still needs before launch.', 'icon' => 'check-circle', 'column' => 'side', 'order' => 15, 'permission' => 'settings.manage']);
        $this->adminModule();
    }
}

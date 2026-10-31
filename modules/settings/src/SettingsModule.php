<?php

declare(strict_types=1);

namespace Cms\Modules\Settings;

use Cms\Admin\Arranged;
use Cms\Packages\Plugin;

/**
 * The settings pages — the kernel's (site, admin), each module's and each
 * plugin's, one item each in the settings sidebar — and the abilities they
 * are read and saved through. Required: it is how everything else is configured.
 */
final class SettingsModule extends Plugin
{
    public function boot(): void
    {
        $cms = $this->cms();

        $this->app->make(SettingsAbilities::class)->register($cms->abilities());

        // Every settings page is an item of the settings sidebar, in the section its namespace names.
        $cms->hooks()->addFilter('admin.nav', function (array $items) use ($cms) {
            foreach ($cms->settingsRegistry()->schemas() as $namespace => $schema) {
                $items["settings.{$namespace}"] ??= [
                    'id' => "settings.{$namespace}",
                    'label' => $schema['label'],
                    'path' => "/settings/{$namespace}",
                    'icon' => $schema['icon'],
                    'section' => $schema['section'],
                    'order' => $schema['order'],
                    'permission' => $schema['permission'],
                ];
            }

            return $items;
        });

        $cms->admin()->command('admin-theme', ['label' => 'Change Admin Theme', 'icon' => 'layout', 'path' => '/settings/'.Arranged::SETTINGS, 'permission' => 'settings.manage', 'keywords' => ['appearance', 'look', 'theme']]);
        $cms->admin()->widget('settings-setup', ['label' => 'Site Setup', 'description' => 'What the site still needs before launch.', 'icon' => 'check-circle', 'column' => 'side', 'order' => 15, 'permission' => 'settings.manage']);
        $this->adminModule();
    }
}

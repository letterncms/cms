<?php

declare(strict_types=1);

namespace Cms\Modules\Packages;

use Cms\Cms;
use Cms\Users\User;

/**
 * Plugins as data: every plugin in one list, the store's and the site's own, on or off with their settings a click
 * away (a catalog component: it installs step by step); then updates; and whatever else belongs here,
 * added with the `view.plugins` filter. Of the CMS's own modules, those that can be
 * switched off are listed under Built In, a page of the settings; the required ones are not.
 */
final class PackagesViews
{
    public static function register(Cms $cms): void
    {
        $admin = $cms->admin();
        $admin->component('packages/store', ['label' => 'Plugins', 'description' => 'Every plugin: the installed ones to switch on or off, set up or uninstall, and a store\'s to install, or a zip to upload.', 'surface' => false, 'permission' => 'packages.manage', 'props' => ['type' => 'object', 'properties' => (object) [], 'additionalProperties' => false]]);
        $admin->component('packages/updates', ['label' => 'Updates', 'description' => 'Updates of the CMS and its plugins, installed in one click.', 'surface' => false, 'permission' => 'packages.manage', 'props' => ['type' => 'object', 'properties' => (object) [], 'additionalProperties' => false]]);

        $cms->views()->register('plugins', '/plugins', static fn (User $user) => self::view($cms), permission: 'packages.manage');
        // What comes with the CMS and can be switched off is set up once, with the rest of the site's settings: not among the plugins.
        $admin->nav('built-in', ['label' => 'Built In', 'path' => '/built-in', 'icon' => 'box', 'section' => 'system', 'order' => 70, 'permission' => 'packages.manage']);
        $cms->views()->register('built-in', '/built-in', static fn (User $user) => ['type' => 'ui/page', 'props' => ['title' => __('Built In'), 'icon' => 'box'], 'children' => [self::builtIn()]], permission: 'packages.manage');
    }

    private static function view(Cms $cms): array
    {
        $packages = $cms->packages();
        $pending = array_filter($packages->repository()->all(), static fn ($p) => $packages->isActive($p->name) && $packages->installedVersion($p->name) !== $p->version) !== [];
        $plugins = ['ability' => 'packages/list', 'input' => ['type' => 'plugin']];

        return ['type' => 'ui/page', 'props' => ['title' => __('Plugins'), 'icon' => 'plugin'], 'children' => [
            ['type' => 'ui/tabs', 'children' => [
                // Every plugin, the store's and what is installed here, in one list: Installed is its filter.
                ['type' => 'ui/tab', 'props' => ['id' => 'plugins', 'label' => __('Plugins'), 'count' => ['source' => $plugins, 'at' => 'total']], 'children' => [
                    ...($pending ? [['type' => 'ui/notice', 'props' => ['tone' => 'warning', 'title' => __('Database updates are waiting'),
                        'action' => ['label' => __('Update'), 'variant' => 'primary', 'ability' => 'packages/migrate', 'success' => __('Database is up to date'), 'then' => 'manifest']]]] : []),
                    // What the repository couldn't read, as it says it (data, not words of this view).
                    ...array_map(static fn (string $error) => ['type' => 'ui/notice', 'props' => ['tone' => 'danger', 'title' => $error]], $packages->repository()->errors()),
                    ['type' => 'packages/store'],
                ]],
                ['type' => 'ui/tab', 'props' => ['id' => 'updates', 'label' => __('Updates')], 'children' => [['type' => 'packages/updates']]],
            ]],
        ]];
    }

    /** What comes with the CMS and can be switched off, by name: no versions of their own, nothing to uninstall. */
    private static function builtIn(): array
    {
        return ['type' => 'ui/records', 'props' => [
            'id' => 'packages.modules', 'label' => __('Built In'), 'key' => 'name', 'search' => ['placeholder' => __('Search')],
            'source' => ['ability' => 'packages/list', 'input' => ['type' => 'module', 'optional' => true]],
            'columns' => [
                ['key' => 'label', 'label' => __('Name'), 'width' => 'minmax(160px,1fr)', 'icon' => 'icon', 'muted' => 'note', 'warning' => 'problem'],
                ['key' => 'enabled', 'label' => __('On'), 'width' => '72px', 'align' => 'end', 'format' => 'switch', 'ariaLabel' => __('{row.label} on'), 'disabled' => 'locked', 'reason' => 'keptOn', 'action' => [
                    'label' => __('On'), 'ability' => 'packages/switch', 'input' => ['name' => '{row.name}', 'on' => '{value}'], 'success' => '{result.message}', 'then' => 'manifest',
                ]],
                ['key' => 'name', 'label' => __('Package'), 'format' => 'code', 'hidden' => true],
            ],
            'open' => ['label' => __('Open'), 'to' => '{row.to}', 'when' => '{row.to}'],
            'actions' => [
                ['label' => __('Settings'), 'icon' => 'settings', 'to' => '{row.settingsTo}', 'when' => '{row.settingsTo}'],
            ],
        ]];
    }
}

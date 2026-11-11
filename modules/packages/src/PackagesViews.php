<?php

declare(strict_types=1);

namespace Cms\Modules\Packages;

use Cms\Cms;
use Cms\Users\User;

/**
 * Plugins as data: the site's plugins, on or off, with their settings a click away; the store and
 * updates (catalog components: they install and update step by step); and whatever else belongs here,
 * added with the `view.plugins` filter (the license module's Licenses). Of the CMS's own modules, those that can be
 * switched off are listed under Built In; the required ones are not.
 */
final class PackagesViews
{
    public static function register(Cms $cms): void
    {
        $admin = $cms->admin();
        $admin->component('packages/store', ['label' => 'Store', 'description' => 'Browse a store and install from it, or upload a zip.', 'surface' => false, 'permission' => 'packages.manage', 'props' => ['type' => 'object', 'properties' => (object) [], 'additionalProperties' => false]]);
        $admin->component('packages/updates', ['label' => 'Updates', 'description' => 'Updates of the CMS and its plugins, installed in one click.', 'surface' => false, 'permission' => 'packages.manage', 'props' => ['type' => 'object', 'properties' => (object) [], 'additionalProperties' => false]]);

        $cms->views()->register('plugins', '/plugins', static fn (User $user) => self::view($cms), permission: 'packages.manage');
    }

    private static function view(Cms $cms): array
    {
        $packages = $cms->packages();
        $pending = array_filter($packages->repository()->all(), static fn ($p) => $packages->isActive($p->name) && $packages->installedVersion($p->name) !== $p->version) !== [];
        $plugins = ['ability' => 'packages/list', 'input' => ['type' => 'plugin']];

        return ['type' => 'ui/page', 'props' => ['title' => __('Plugins'), 'icon' => 'plugin'], 'children' => [
            ['type' => 'ui/tabs', 'children' => [
                ['type' => 'ui/tab', 'props' => ['id' => 'installed', 'label' => __('Installed'), 'count' => ['source' => $plugins, 'at' => 'total']], 'children' => [
                    ...($pending ? [['type' => 'ui/notice', 'props' => ['tone' => 'warning', 'title' => __('Database updates are waiting'),
                        'action' => ['label' => __('Update'), 'variant' => 'primary', 'ability' => 'packages/migrate', 'success' => __('Database is up to date'), 'then' => 'manifest']]]] : []),
                    self::installed($plugins),
                    // What the repository couldn't read, as it says it (data, not words of this view).
                    ...array_map(static fn (string $error) => ['type' => 'ui/notice', 'props' => ['tone' => 'danger', 'title' => $error]], $packages->repository()->errors()),
                ]],
                ['type' => 'ui/tab', 'props' => ['id' => 'built-in', 'label' => __('Built In')], 'children' => [self::builtIn()]],
                ['type' => 'ui/tab', 'props' => ['id' => 'store', 'label' => __('Store')], 'children' => [['type' => 'packages/store']]],
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

    /**
     * The plugins, by name: on or off at once, without a reload. What another needs, or the site
     * requires, stays on and says why. A row opens where it is set up, when it is set up anywhere.
     */
    private static function installed(array $source): array
    {
        return ['type' => 'ui/records', 'props' => [
            'id' => 'packages.plugins', 'label' => __('Plugins'), 'key' => 'name',
            'source' => $source,
            'columns' => [
                ['key' => 'label', 'label' => __('Name'), 'width' => 'minmax(160px,1fr)', 'icon' => 'icon', 'muted' => 'note', 'warning' => 'problem'],
                ['key' => 'version', 'label' => __('Version'), 'width' => '80px'],
                ['key' => 'enabled', 'label' => __('On'), 'width' => '72px', 'align' => 'end', 'format' => 'switch', 'ariaLabel' => __('{row.label} on'), 'disabled' => 'locked', 'reason' => 'keptOn', 'action' => [
                    'label' => __('On'), 'ability' => 'packages/switch', 'input' => ['name' => '{row.name}', 'on' => '{value}'], 'success' => '{result.message}', 'then' => 'manifest',
                ]],
                // Found by its package name too.
                ['key' => 'name', 'label' => __('Package'), 'format' => 'code', 'hidden' => true],
            ],
            'open' => ['label' => __('Open'), 'to' => '{row.to}', 'when' => '{row.to}'],
            'actions' => [
                ['label' => __('Settings'), 'icon' => 'settings', 'to' => '{row.settingsTo}', 'when' => '{row.settingsTo}'],
                // What a plugin is (who makes it, what changed, what it needs) is told where it is sold.
                ['label' => __('View in Store'), 'icon' => 'plugin', 'to' => '/plugins?tab=store&item={row.name}', 'when' => '{row.inStore}'],
                // What another plugin needs stays.
                ['label' => __('Uninstall…'), 'icon' => 'trash', 'variant' => 'danger', 'ability' => 'packages/uninstall', 'input' => ['name' => '{row.name}', 'deleteFiles' => true], 'disabled' => '{row.dependents}',
                    'confirm' => ['title' => __('Uninstall {row.label}?'), 'text' => __('Its database tables, settings and files are removed.'), 'confirm' => __('Uninstall'), 'danger' => true],
                    'success' => '{result.message}', 'then' => 'manifest'],
            ],
            'empty' => ['icon' => 'plugin', 'title' => __('No plugins yet'), 'action' => ['label' => __('Open Store'), 'to' => '/plugins?tab=store']],
        ]];
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\Settings;

use Cms\Admin\Views;
use Cms\Packages\Plugin;
use Cms\Users\User;

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

        // Every settings page has one place: the Settings tab of the screen it names as its home, or, without a screen,
        // an item of the settings sidebar in the section its namespace names (a plugin's under Plugins). Namespaces without a page have no item.
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

        $cms->views()->register('settings', '/settings/:namespace', fn (User $user, array $params) => $this->view((string) ($params['namespace'] ?? ''), $user), permission: static fn (User $user) => $user->hasPermission('admin.access'));

        $this->adminModule();
    }

    /**
     * One settings page: its form as the first tab, General (tabs show once there is a second). Plugins add tabs and actions with the
     * `view.settings` filter, which gets the view, the user and `['namespace' => …]`:
     *
     *   $cms->hooks()->addFilter('view.settings', fn (array $view, User $user, array $params) => $params['namespace'] === 'seo'
     *       ? SettingsModule::withTab($view, ['type' => 'ui/tab', 'props' => ['id' => 'redirects', 'label' => __('Redirects')], 'children' => [...]]) : $view);
     *
     * A page kept with its plugin's screen (`home`) is that screen's Settings tab: its address leads there.
     */
    private function view(string $namespace, User $user): array
    {
        $schema = $this->cms()->settingsRegistry()->schemas()[$namespace] ?? null;

        if ($schema === null || ! $schema['page'] || ! $user->hasPermission($schema['permission'])) {
            return Views::notFound('settings', ['to' => '/settings', 'label' => __('Settings')]);
        }

        $home = $schema['home'] !== null ? ($this->cms()->admin()->navItems()[$schema['home']]['path'] ?? null) : null;

        if ($home !== null) {
            return ['type' => 'ui/page', 'props' => ['title' => __($schema['label']), 'icon' => $schema['icon']], 'children' => [['type' => 'ui/redirect', 'props' => ['to' => $home.(str_contains($home, '?') ? '&' : '?').'tab=settings']]]];
        }

        return ['type' => 'ui/page', 'props' => ['title' => __($schema['label']), 'icon' => $schema['icon'], 'width' => 'narrow', 'actions' => []], 'children' => [
            ['type' => 'ui/tabs', 'children' => [
                ['type' => 'ui/tab', 'props' => ['id' => 'settings', 'label' => __('General')], 'children' => [['type' => 'ui/settings', 'props' => ['namespace' => $namespace]]]],
            ]],
        ]];
    }

    /** A settings page's view with one more tab, after the form. */
    public static function withTab(array $view, array $tab): array
    {
        $view['children'][0]['children'][] = $tab;

        return $view;
    }

    /** A settings page's view with one more action in its bar, while one of its tabs is on view (the form's, `settings`, unless named). */
    public static function withAction(array $view, array $action, string $tab = 'settings'): array
    {
        foreach ($view['children'][0]['children'] ?? [] as $i => $node) {
            if (($node['props']['id'] ?? null) === $tab) {
                $view['children'][0]['children'][$i]['props']['actions'][] = $action;
            }
        }

        return $view;
    }
}

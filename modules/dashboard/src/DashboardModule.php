<?php

declare(strict_types=1);

namespace Cms\Modules\Dashboard;

use Cms\Admin\Arranged;
use Cms\Packages\Plugin;
use Cms\Users\User;

/**
 * The home screen. Widgets come from every module and plugin; each person
 * arranges their own right on the home screen (Customize), admins can make
 * theirs the default for everyone. Off, the admin opens on the first item of
 * the sidebar.
 */
final class DashboardModule extends Plugin
{
    public function register(): void
    {
        $this->app->singleton(Dashboard::class);
    }

    public function boot(): void
    {
        $cms = $this->cms();

        $cms->admin()->arrange('dashboard', Dashboard::class);
        $cms->admin()->nav('dashboard', ['label' => 'Dashboard', 'path' => '/', 'icon' => 'grid', 'section' => 'main', 'order' => 0, 'pinned' => true]);
        $cms->admin()->widget('shortcuts', ['label' => 'Shortcuts', 'description' => 'The keys worth knowing.', 'icon' => 'keyboard', 'order' => 90]);
        $cms->admin()->command('customize-home', ['label' => 'Customize Home Screen', 'icon' => 'layout', 'path' => '/?customize=1', 'keywords' => ['dashboard', 'widgets', 'arrange']]);

        // The default home screen for everyone is a value of the admin settings, arranged on the home screen itself.
        $cms->hooks()->addFilter('settings.fields', static fn (array $fields, string $namespace) => $namespace === Arranged::SETTINGS
            ? [...$fields, ['handle' => 'dashboard', 'type' => 'json', 'label' => 'Home Screen', 'component' => 'dashboard-default']]
            : $fields);

        $cms->hooks()->addFilter('admin.manifest', fn (array $manifest, User $user) => [...$manifest, ...$this->app->make(Dashboard::class)->forUser($user)]);

        $this->adminModule();
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\Dashboard;

use Cms\Abilities\AbilityContext;
use Cms\Admin\Arranged;
use Cms\Packages\Plugin;
use Cms\Support\Schema\Shape;
use Cms\Users\User;

/**
 * The Dashboard. Widgets come from every module and plugin; each person
 * arranges their own right on the Dashboard (Customize), admins can make
 * theirs the default for everyone. Off, the admin opens on the first item of
 * the sidebar. A new site's Dashboard starts with the guided start (Start).
 */
final class DashboardModule extends Plugin
{
    public function register(): void
    {
        $this->app->singleton(Dashboard::class);
        $this->app->singleton(Start::class);
    }

    public function boot(): void
    {
        $cms = $this->cms();

        $cms->admin()->arrange('dashboard', Dashboard::class);
        $cms->admin()->nav('dashboard', ['label' => 'Dashboard', 'path' => '/', 'icon' => 'grid', 'section' => 'main', 'order' => 0, 'pinned' => true]);
        $cms->admin()->widget('shortcuts', ['label' => 'Shortcuts', 'description' => 'The keys worth knowing.', 'icon' => 'keyboard', 'order' => 90]);
        $cms->admin()->command('customize-home', ['label' => 'Customize Dashboard', 'icon' => 'layout', 'path' => '/?customize=1', 'keywords' => ['dashboard', 'widgets', 'arrange']]);

        // The default Dashboard for everyone is a value of the admin settings, saved from the Dashboard's Customize.
        $cms->hooks()->addFilter('settings.fields', static fn (array $fields, string $namespace) => $namespace === Arranged::SETTINGS
            ? [...$fields, ['handle' => 'dashboard', 'type' => 'json', 'label' => 'Dashboard']]
            : $fields);

        $cms->hooks()->addFilter('admin.manifest', fn (array $manifest, User $user) => [...$manifest, ...$this->app->make(Dashboard::class)->forUser($user)]);

        $this->start();
        $this->adminModule();
    }

    /** The guided start: read and hidden through two abilities, its steps read from the site as it is. */
    private function start(): void
    {
        $cms = $this->cms();
        $start = fn (): Start => $this->app->make(Start::class);
        $state = Shape::of([
            'steps' => [['id' => Shape::STRING, 'label' => Shape::STRING, 'to' => Shape::STRING, 'done' => Shape::BOOLEAN]],
            'dismissed' => Shape::BOOLEAN,
            'open' => Shape::BOOLEAN,
        ]);
        $answer = static fn (User $user) => ['steps' => $start()->steps($user), 'dismissed' => $start()->state()['dismissed'], 'open' => $start()->open($user)];

        $cms->abilities()->register('dashboard-start/get', [
            'label' => 'Guided Start',
            'description' => 'The first steps of a new site as the Dashboard shows them (name the site, choose its design, create a page, connect an agent): each with the admin path it leads to and whether it is done. `open` is false once every step is done or the guide was hidden, and on a site that was installed before the guide existed.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => (object) []],
            'output' => $state,
            'handler' => static fn (array $in, AbilityContext $ctx) => $answer($ctx->user),
        ]);

        $cms->abilities()->register('dashboard-start/update', [
            'label' => 'Hide the Guided Start',
            'description' => 'Hide the guided start on the Dashboard for everyone (`dismissed: true`), or show it again (`false`). Steps are not set here: each is done when the site says so.',
            'permission' => 'settings.manage',
            'input' => ['type' => 'object', 'properties' => ['dismissed' => ['type' => 'boolean']], 'required' => ['dismissed']],
            'output' => $state,
            'handler' => static function (array $in, AbilityContext $ctx) use ($start, $answer) {
                $start()->dismiss($in['dismissed']);

                return $answer($ctx->user);
            },
        ]);

        // A new site starts the guide when it is ready, after the starter brought its pages and its design. A site that
        // was there before never gets the file, so an update shows it nothing.
        $cms->hooks()->on('cms.installed', static fn () => $start()->begin(), 100);
    }
}

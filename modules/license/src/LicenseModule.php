<?php

declare(strict_types=1);

namespace Cms\Modules\License;

use Cms\Cms;
use Cms\Packages\PackageManifest;
use Cms\Packages\Plugin;
use Cms\Users\User;
use Throwable;

/**
 * Checks the licences of paid plugins, and only theirs: the CMS itself has none. On a site with
 * no paid plugin this adds nothing a person can see. With one, it adds a screen and a banner in
 * the admin, the most any licence state ever does. It reads no file and verifies nothing at boot,
 * so a public request can't be touched by it.
 */
final class LicenseModule extends Plugin
{
    public function boot(): void
    {
        $cms = $this->cms();

        if ($this->app->runningInConsole()) {
            $this->commands([Console\LicenseStatusCommand::class, Console\LicenseSetCommand::class, Console\LicenseRefreshCommand::class, Console\LicenseClearCommand::class]);
        }

        if (self::paidPlugins($cms) === []) {
            return;
        }

        $cms->permissions()->register('license.view', 'View Licenses', 'System');
        $cms->permissions()->register('license.manage', 'Manage the License Key', 'System');
        (new LicenseAbilities)->register($cms->abilities());

        // A tab of Plugins (its admin module puts it there), beside the plugins it covers.
        $cms->admin()->command('license', ['label' => 'Licenses', 'icon' => 'key', 'path' => '/plugins?tab=licenses', 'permission' => 'license.view', 'keywords' => ['license', 'licence', 'key', 'domain']]);

        $cms->hooks()->addFilter('admin.manifest', static function (array $manifest, User $user): array {
            try {
                $service = app(LicenseService::class);
                $license = ['refreshDue' => $service->refreshDue()];

                if ($user->hasPermission('license.manage')) {
                    $report = $service->report();
                    $license += ['level' => $report->level, 'items' => $report->items, 'host' => $report->host, 'token' => $report->token];
                }
            } catch (Throwable $e) {
                report($e);
                $license = ['refreshDue' => false];
            }

            $manifest['config']['license'] = $license;

            return $manifest;
        });

        // The Licenses tab of Plugins. Its class loads only when that view is drawn, never for a public request.
        $cms->hooks()->addFilter('view.plugins', static fn (array $view, User $user) => LicenseViews::withTab($view, $user));
        $this->adminModule();
    }

    /** @return list<PackageManifest> The paid plugins that are on. One that's switched off is just a folder: it can't earn a site a banner. */
    public static function paidPlugins(Cms $cms): array
    {
        return array_values(array_filter($cms->packages()->active(), static fn (PackageManifest $package) => (((array) ($package->extra['license'] ?? []))['paid'] ?? false) === true));
    }
}

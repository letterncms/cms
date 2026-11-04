<?php

declare(strict_types=1);

namespace Cms\Modules\Packages;

use Cms\Packages\Install\PackageJobs;
use Cms\Packages\Plugin;
use Cms\Update\CoreUpdate;
use Cms\Update\ReleaseFeed;
use Cms\Users\User;
use Throwable;

/**
 * The Modules screen: every plugin and module, switched on and off in
 * one place. Required: it is how the others come back.
 */
final class PackagesModule extends Plugin
{
    public function boot(): void
    {
        $cms = $this->cms();

        $cms->permissions()->register('packages.manage', 'Manage Modules and Plugins', 'System');
        $cms->permissions()->register('packages.install_unsigned', 'Install Unsigned Packages', 'System', trusted: true);
        $this->app->make(PackageAbilities::class)->register($cms->abilities());
        $this->app->make(StoreAbilities::class)->register($cms->abilities());

        // The engine in core knows nothing about stores: who vouches for a download is decided here.
        $this->app->afterResolving(PackageJobs::class, function (PackageJobs $jobs): void {
            $jobs->verifier('store', fn (array $job) => $this->app->make(StoreClient::class)->verifyDownload($job));
            $jobs->verifier('store:inspected', fn (array $job) => $this->app->make(StoreClient::class)->verifyInspected($job));
            $jobs->verifier('upload', fn (array $job) => $this->app->make(StoreClient::class)->verifyUpload($job));
            $jobs->verifier('upload:inspected', fn (array $job) => $this->app->make(StoreClient::class)->verifyUploadInspected($job));
        });

        // The admin shell asks in the background, so no page waits on a store or a release list.
        $cms->hooks()->addFilter('admin.manifest', function (array $manifest, User $user): array {
            $manifest['config']['packages'] = self::shellState($user);

            return $manifest;
        });

        $cms->admin()->nav('plugins', ['label' => 'Plugins', 'path' => '/plugins', 'icon' => 'plugin', 'section' => 'main', 'order' => 20, 'permission' => 'packages.manage']);
        $cms->admin()->command('store', ['label' => 'Store', 'icon' => 'download', 'path' => '/plugins?tab=store', 'permission' => 'packages.manage', 'keywords' => ['plugins', 'install', 'marketplace']]);
        $cms->admin()->command('updates', ['label' => 'Updates', 'icon' => 'refresh', 'path' => '/plugins?tab=updates', 'permission' => 'packages.manage', 'keywords' => ['upgrade', 'version', 'security']]);
        $cms->admin()->widget('packages-system', ['label' => 'System', 'description' => '{brand} version, database updates and plugins that need attention.', 'icon' => 'plugin', 'column' => 'side', 'order' => 70, 'permission' => 'packages.manage']);
        $this->adminModule();
    }

    /** @return array<string, mixed> Whether to tick, and for managers what's worth a banner */
    private static function shellState(User $user): array
    {
        try {
            $feed = app(ReleaseFeed::class);
            $update = app(CoreUpdate::class);
            $status = $update->status();
            $out = ['tick' => $feed->due() || $status['state'] !== 'idle' && ($status['auto'] ?? false) && ! in_array($status['state'], ['done', 'failed', 'rolled_back'], true) || $update->autoBlocker() === null];

            if (! $user->hasPermission('packages.manage')) {
                return $out;
            }

            $offer = $update->offer();
            $store = app(StoreClient::class)->updates();

            return [...$out,
                // Never silent: a fix this site can't fetch, and a known problem with what it runs.
                'stuck' => array_values(array_column(array_filter($store['packages'], static fn (array $p) => $p['security'] && ! $p['allowed']), 'label')),
                'advisories' => array_column($store['advisories'], 'label'),
                'version' => $offer['current'],
                'state' => $status['state'],
                'error' => $status['error'] ?? null,
                'security' => (bool) ($offer['update']['security'] ?? false) ? $offer['update']['version'] : null,
                'update' => $offer['update']['version'] ?? null,
                'yanked' => $offer['yanked'],
                'supportEnded' => $offer['support_ended']['until'] ?? null,
            ];
        } catch (Throwable $e) {
            report($e);

            return ['tick' => false];
        }
    }
}

<?php

declare(strict_types=1);

namespace Cms\Packages;

use Illuminate\Support\ServiceProvider;
use Cms\Cms;

/**
 * Base class for every plugin and theme provider — built-in or third-party.
 * Built-in plugins use nothing beyond what this class and the CMS API expose.
 */
abstract class Plugin extends ServiceProvider
{
    protected PackageManifest $manifest;

    public function setManifest(PackageManifest $manifest): static
    {
        $this->manifest = $manifest;

        return $this;
    }

    public function manifest(): PackageManifest
    {
        return $this->manifest;
    }

    /** Called once, after the package's migrations ran for the first time. */
    public function install(): void {}

    /** Called when the installed version differs from the package version. */
    public function upgrade(string $fromVersion): void {}

    /** Called before the package's migrations are rolled back and its files removed. */
    public function uninstall(): void {}

    /**
     * Register this package's built admin module (dist/admin.js + dist/admin.css).
     * Pass $import to expose the module to other modules, e.g. "@letterncms/blocks".
     */
    protected function adminModule(string $js = 'admin.js', ?string $css = 'admin.css', ?string $import = null): void
    {
        $file = $this->path('dist/'.$js);

        if (! is_file($file)) {
            return;
        }

        $assets = $this->app->make(AssetPublisher::class);
        $version = '?v='.substr(hash('xxh3', $this->manifest->version.'|'.filemtime($file)), 0, 10);
        $url = $assets->url($this->manifest, $js).$version;
        $admin = $this->cms()->admin();

        $admin->module($this->manifest->handle(), $url, $this->manifest->name);

        if ($css !== null && is_file($this->path('dist/'.$css))) {
            $admin->style($assets->url($this->manifest, $css).$version);
        }

        if ($import !== null) {
            $admin->import($import, $url);
        }
    }

    /** Register the screens this package ships as data: each `views/<id>.json` (see Cms\Admin\Views). */
    protected function views(): void
    {
        foreach (glob($this->path('views/*.json')) ?: [] as $file) {
            $this->cms()->views()->registerFile($file, $this->manifest->name);
        }
    }

    /** Public URL of a file in this package's dist/ folder. */
    protected function asset(string $file): string
    {
        return $this->app->make(AssetPublisher::class)->url($this->manifest, $file);
    }

    protected function cms(): Cms
    {
        return $this->app->make(Cms::class);
    }

    protected function path(string $relative = ''): string
    {
        return $this->manifest->path($relative);
    }

    /** Plugin settings from config/<namespace>.yaml merged over defaults. */
    protected function settings(?string $key = null, mixed $default = null): mixed
    {
        return $this->cms()->settings($this->manifest->namespace, $key, $default);
    }
}

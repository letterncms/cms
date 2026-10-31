<?php

declare(strict_types=1);

namespace Cms\Foundation;

use Illuminate\Foundation\Application as LaravelApplication;
use Illuminate\Support\ServiceProvider;
use Cms\Packages\PackageManager;
use Cms\Packages\Plugin;
use Cms\Packages\Scope;

/**
 * Laravel application with the CMS's split layout: the cms path is this package (code),
 * the site path is the site around it (config, content, plugins, public, storage, .env).
 */
class Application extends LaravelApplication
{
    protected string $cmsPath;

    protected string $sitePath;

    public function __construct(string $cmsPath, string $sitePath)
    {
        $this->cmsPath = rtrim($cmsPath, DIRECTORY_SEPARATOR);
        $this->sitePath = rtrim($sitePath, DIRECTORY_SEPARATOR);

        parent::__construct($this->sitePath);

        $this->useAppPath($this->cmsPath.DIRECTORY_SEPARATOR.'src');
        $this->useConfigPath($this->cmsPath.DIRECTORY_SEPARATOR.'config');
        $this->useDatabasePath($this->cmsPath.DIRECTORY_SEPARATOR.'database');
        $this->useLangPath($this->cmsPath.DIRECTORY_SEPARATOR.'lang');
        $this->usePublicPath($this->sitePath.DIRECTORY_SEPARATOR.'public');
        $this->useStoragePath($this->sitePath.DIRECTORY_SEPARATOR.'storage');
        $this->useBootstrapPath($this->sitePath.DIRECTORY_SEPARATOR.'storage'.DIRECTORY_SEPARATOR.'framework');
        $this->useEnvironmentPath($this->sitePath);

        $this->instance(self::class, $this);
        $this->instance('path.cms', $this->cmsPath);
        $this->instance('path.site', $this->sitePath);
    }

    /** Root of the CMS package (code). */
    public function cmsPath(string $path = ''): string
    {
        return $this->joinPaths($this->cmsPath, $path);
    }

    /** Root of the current site (data). */
    public function sitePath(string $path = ''): string
    {
        return $this->joinPaths($this->sitePath, $path);
    }

    public function contentPath(string $path = ''): string
    {
        return $this->joinPaths($this->sitePath.DIRECTORY_SEPARATOR.'content', $path);
    }

    public function siteConfigPath(string $path = ''): string
    {
        return $this->joinPaths($this->sitePath.DIRECTORY_SEPARATOR.'config', $path);
    }

    public function resourcePath($path = '')
    {
        return $this->joinPaths($this->cmsPath('resources'), $path);
    }

    /** Packages boot inside their own scope, so what they add is theirs, and one that fails only stops itself. */
    protected function bootProvider(ServiceProvider $provider)
    {
        if (! $provider instanceof Plugin) {
            parent::bootProvider($provider);

            return;
        }

        $packages = $this->make(PackageManager::class);
        $packages->guard($provider->manifest(), fn () => Scope::run($provider->manifest()->name, fn () => parent::bootProvider($provider)));
        $packages->booted($provider->manifest());
    }

    public function getNamespace()
    {
        return 'Cms\\';
    }
}

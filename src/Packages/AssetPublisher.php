<?php

declare(strict_types=1);

namespace Cms\Packages;

use Cms\Foundation\Application;
use Cms\Support\Files;

/**
 * Publishes a package's dist/ folder to public/_cms/assets/<handle>/.
 * Local environments symlink (relative links) so rebuilt assets are picked up immediately.
 */
final class AssetPublisher
{
    /** @var array<string, bool> */
    private array $checked = [];

    public function __construct(private readonly Application $app) {}

    public function url(PackageManifest $package, string $file): string
    {
        $this->ensure($package);

        return '/_cms/assets/'.$package->handle().'/'.ltrim($file, '/');
    }

    public function ensure(PackageManifest $package): void
    {
        $handle = $package->handle();

        if (isset($this->checked[$handle])) {
            return;
        }

        $this->checked[$handle] = true;
        $source = $package->path('dist');

        if (! is_dir($source)) {
            return;
        }

        $target = $this->app->publicPath('_cms/assets/'.$handle);
        // A rebuild rewrites files in place, which leaves the folder's own mtime alone.
        $stamp = $package->version.'@'.max(array_map(static fn ($path) => (int) @filemtime($path), [$source, ...(glob($source.'/*') ?: [])]));

        // A link that resolves is always current; a dangling one (the tree moved) is republished.
        if ((is_link($target) && is_dir($target)) || (! is_link($target) && is_file($target.'/.published') && file_get_contents($target.'/.published') === $stamp)) {
            return;
        }

        $this->publish($package, $source, $target, $stamp);
    }

    public function remove(PackageManifest $package): void
    {
        Files::deleteDirectory($this->app->publicPath('_cms/assets/'.$package->handle()));
        unset($this->checked[$package->handle()]);
    }

    private function publish(PackageManifest $package, string $source, string $target, string $stamp): void
    {
        \Cms\Support\Files::ensureDir(dirname($target));

        $link = $this->app->environment('local') && function_exists('symlink');

        if ($link || is_link($target)) {
            Files::deleteDirectory($target);
        }

        // Relative, so the link works wherever the tree is mounted (the host, a container).
        if ($link && @symlink(Files::relativePath((string) realpath(dirname($target)), (string) realpath($source)), $target)) {
            return;
        }

        // Copied over what's there: static pages built before an update keep finding their hashed files until they are rebuilt.
        Files::copyDirectory($source, $target);
        Files::put($target.'/.published', $stamp);
    }
}

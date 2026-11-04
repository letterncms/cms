<?php

declare(strict_types=1);

namespace Cms\Packages;

use Cms\Foundation\Application;
use Cms\Support\Files;
use Throwable;

/**
 * Finds the modules in the CMS package and the plugins in the site's plugins/ folder, wherever they
 * came from: Composer and the store put them in the same place. Cached until a manifest changes.
 */
final class PackageRepository
{
    /** Bump when PackageManifest gains or changes a property. */
    private const int FORMAT = 3;

    /** @var array<string, PackageManifest>|null */
    private ?array $packages = null;

    /** @var list<string> */
    private array $errors = [];

    public function __construct(private readonly Application $app) {}

    /** @return array<string, PackageManifest> */
    public function all(): array
    {
        return $this->packages ??= $this->load();
    }

    public function find(string $name): ?PackageManifest
    {
        return $this->all()[$name] ?? null;
    }

    /** A plugin's name (`extra.cms.label`), for what is called after it; null for the kernel and its modules. */
    public static function labelOf(?string $package): ?string
    {
        return $package !== null && function_exists('app') && app()->bound(self::class) ? app(self::class)->find($package)?->label : null;
    }

    /** @return array<string, PackageManifest> */
    public function plugins(): array
    {
        return $this->all();
    }

    /** @return list<string> */
    public function errors(): array
    {
        $this->all();

        return $this->errors;
    }

    public function refresh(): void
    {
        $this->packages = null;
        @unlink($this->cacheFile());
    }

    /** @return array<string, PackageManifest> */
    private function load(): array
    {
        $sources = $this->sources();
        $signature = $this->signature($sources);
        $cache = $this->cacheFile();

        if (is_file($cache)) {
            $cached = @include $cache;

            if (is_array($cached) && ($cached['signature'] ?? null) === $signature) {
                $this->errors = $cached['errors'];

                return array_map(static fn (array $a) => new PackageManifest(...$a), $cached['packages']);
            }
        }

        $packages = [];
        $this->errors = [];

        foreach ($sources as [$path, $module]) {
            try {
                $composer = json_decode((string) file_get_contents($path.'/composer.json'), true, 32, JSON_THROW_ON_ERROR);

                if (($composer['type'] ?? null) !== PackageManifest::PLUGIN) {
                    continue;
                }

                $manifest = PackageManifest::fromComposer($path, $composer, $module);

                // A module is part of the core: a plugin by the same name never stands in for it.
                if (! $module && ($packages[$manifest->name]->core ?? false)) {
                    $this->errors[] = basename($path).': '.$manifest->name.' is part of '.\Cms\Support\Brand::get().'. Remove plugins/'.basename($path).'.';
                    continue;
                }

                $packages[$manifest->name] = $manifest;
            } catch (Throwable $e) {
                $this->errors[] = basename($path).': '.$e->getMessage();
            }
        }

        ksort($packages);

        try {
            Files::put($cache, '<?php return '.var_export([
                'signature' => $signature,
                'errors' => $this->errors,
                'packages' => array_map(static fn (PackageManifest $p) => get_object_vars($p), $packages),
            ], true).';');
        } catch (Throwable) {
            // Cache is an optimization only.
        }

        return $packages;
    }

    /** @return list<array{0: string, 1: bool}> [path, module] */
    private function sources(): array
    {
        return [
            ...array_map(static fn (string $file) => [dirname($file), true], glob($this->app->cmsPath('modules/*/composer.json')) ?: []),
            ...array_map(static fn (string $file) => [dirname($file), false], glob($this->app->sitePath('plugins/*/composer.json')) ?: []),
        ];
    }

    private function signature(array $sources): string
    {
        // The manifest format is part of the key: a cache written by other code is never read back.
        $parts = [self::FORMAT];

        foreach ($sources as [$path]) {
            $parts[] = $path.':'.@filemtime($path.'/composer.json');
        }

        return hash('xxh128', implode('|', $parts));
    }

    private function cacheFile(): string
    {
        return $this->app->storagePath('cache/packages.php');
    }
}

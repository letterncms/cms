<?php

declare(strict_types=1);

namespace Cms\Packages;

use Cms\Foundation\Application;
use Throwable;

/**
 * Keeps a self-updating site's composer.json saying what it runs, so it can move to Composer at any
 * time with `composer update`. A lock file from before the change no longer describes the site, so it goes.
 */
final class SiteComposer
{
    public function __construct(private readonly Application $app) {}

    public function requires(string $package, string $version): void
    {
        $this->change(static function (array $composer) use ($package, $version): array {
            $composer['require'][$package] = self::constraint($version);
            ksort($composer['require']);

            return $composer;
        });
    }

    public function removes(string $package): void
    {
        $this->change(static function (array $composer) use ($package): array {
            unset($composer['require'][$package]);

            return $composer;
        });
    }

    /** Below 1.0 first-party packages move together by minors, so anything below 1.0 suits. */
    public static function constraint(string $version): string
    {
        [$major, $minor] = array_map(intval(...), [...explode('.', $version), 0, 0]);

        return $major === 0 ? ">=0.{$minor} <1" : "^{$major}.{$minor}";
    }

    /** @param  callable(array<string, mixed>): array<string, mixed>  $change */
    private function change(callable $change): void
    {
        $file = $this->app->sitePath('composer.json');

        try {
            $composer = is_file($file) ? json_decode((string) file_get_contents($file), true, flags: JSON_THROW_ON_ERROR) : null;

            if (is_array($composer) && is_writable($file)) {
                file_put_contents($file, json_encode($change($composer), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)."\n");
                @unlink($this->app->sitePath('composer.lock'));
            }
        } catch (Throwable $e) {
            // Only the move to Composer needs it, and that can name its plugins by hand.
            report($e);
        }
    }
}

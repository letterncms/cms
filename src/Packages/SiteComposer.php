<?php

declare(strict_types=1);

namespace Cms\Packages;

use Cms\Foundation\Application;
use Cms\Support\Files;
use Cms\Update\Layout;
use Throwable;

/**
 * Keeps a site's composer.json saying what it runs when the admin adds or takes away a package, so the
 * next `composer update` agrees with it. On a self-updating site the lock goes, as it no longer describes
 * the site; on one Composer manages it stays, still true for vendor/ until that update.
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
                Files::putJson($file, $change($composer));

                if ($this->app->make(Layout::class)->managed() !== 'composer') {
                    @unlink($this->app->sitePath('composer.lock'));
                }
            }
        } catch (Throwable $e) {
            // composer.json can always name its plugins by hand.
            report($e);
        }
    }
}

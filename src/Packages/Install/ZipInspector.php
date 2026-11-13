<?php

declare(strict_types=1);

namespace Cms\Packages\Install;

use Cms\Packages\PackageManifest;
use Composer\Semver\Semver;
use RuntimeException;
use ZipArchive;

/**
 * What a package zip must be before anything is unpacked. Signed or not: a bad archive is bad
 * whoever vouches for it, and the check costs nothing.
 */
final class ZipInspector
{
    private const int MAX_ENTRIES = 5000;

    private const int MAX_BYTES = 200_000_000;

    private const int MAX_RATIO = 100;

    private const int SYMLINK = 0o120000;

    /**
     * @param  string|null  $expected  The package name it must be
     * @param  string  $coreVersion  What it must suit
     * @return array{top: string, composer: array<string, mixed>}
     */
    public function inspect(string $path, ?string $expected, string $coreVersion): array
    {
        $zip = new ZipArchive;

        if ($zip->open($path, ZipArchive::RDONLY) !== true) {
            throw new RuntimeException(__('That is not a zip file.'));
        }

        try {
            $top = $this->walk($zip, $path);
            $composer = json_decode((string) $zip->getFromName($top.'/composer.json'), true);

            if (! is_array($composer)) {
                throw new RuntimeException(__('The package has no composer.json at its top.'));
            }

            $this->manifest($composer, $expected, $coreVersion);
            ($composer['type'] ?? null) === PackageManifest::SITE ? $this->siteFiles($zip, $top) : $this->parseAll($zip);
        } finally {
            $zip->close();
        }

        return ['top' => $top, 'composer' => $composer];
    }

    private function walk(ZipArchive $zip, string $path): string
    {
        if ($zip->numFiles > self::MAX_ENTRIES) {
            throw new RuntimeException(__('The package has too many files.'));
        }

        $top = null;
        $seen = [];
        $bytes = 0;

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = (string) $zip->getNameIndex($i);
            $stat = $zip->statIndex($i);
            $bytes += (int) ($stat['size'] ?? 0);
            $zip->getExternalAttributesIndex($i, $system, $attributes);

            if ($name === '' || str_contains($name, "\0") || str_contains($name, '\\') || str_contains($name, ':') || str_starts_with($name, '/') || in_array('..', explode('/', $name), true)) {
                throw new RuntimeException(__('The package has an unsafe path: :name', ['name' => $name]));
            }

            if ((($attributes >> 16) & 0o170000) === self::SYMLINK) {
                throw new RuntimeException(__('The package has a symbolic link: :name', ['name' => $name]));
            }

            foreach (explode('/', rtrim($name, '/')) as $segment) {
                if (str_starts_with($segment, '.')) {
                    throw new RuntimeException(__('The package has a hidden file: :name', ['name' => $name]));
                }
            }

            if (str_ends_with(strtolower($name), '.phar')) {
                throw new RuntimeException(__('The package has a .phar file: :name', ['name' => $name]));
            }

            $folded = mb_strtolower(rtrim($name, '/'));

            if (isset($seen[$folded])) {
                throw new RuntimeException(__('The package has two files that differ only by case: :name', ['name' => $name]));
            }

            $seen[$folded] = true;
            $first = explode('/', $name, 2)[0];

            if ($top !== null && $first !== $top) {
                throw new RuntimeException(__('The package must have one folder at its top.'));
            }

            $top = $first;
        }

        if ($top === null) {
            throw new RuntimeException(__('The package is empty.'));
        }

        if ($bytes > self::MAX_BYTES || $bytes > max(1, (int) filesize($path)) * self::MAX_RATIO) {
            throw new RuntimeException(__('The package unpacks to an unreasonable size.'));
        }

        return $top;
    }

    /** @param  array<string, mixed>  $composer */
    private function manifest(array $composer, ?string $expected, string $coreVersion): void
    {
        $name = (string) ($composer['name'] ?? '');

        if ($expected !== null && $name !== $expected) {
            throw new RuntimeException(__('This zip holds :found, not :expected.', ['found' => $name ?: '?', 'expected' => $expected]));
        }

        if (! in_array($composer['type'] ?? null, [PackageManifest::PLUGIN, PackageManifest::SITE], true)) {
            throw new RuntimeException(__('This zip is not a plugin for this CMS.'));
        }

        foreach ((array) ($composer['require'] ?? []) as $dep => $constraint) {
            $constraint = (string) $constraint;

            if ($dep === 'php' && ! Semver::satisfies(PHP_VERSION, $constraint)) {
                throw new RuntimeException(__('This package needs PHP :constraint.', ['constraint' => $constraint]));
            }

            if (str_starts_with((string) $dep, 'ext-') && ! extension_loaded(substr((string) $dep, 4))) {
                throw new RuntimeException(__('This package needs the PHP extension :ext.', ['ext' => substr((string) $dep, 4)]));
            }

            if ($dep === PackageManifest::CORE && ! Semver::satisfies($coreVersion, $constraint)) {
                throw new RuntimeException(__('This package needs :brand :constraint.', ['constraint' => $constraint]));
            }
        }
    }

    /** A site is data: nothing in it may be a file a server runs, and it says what it is in site.json. */
    private function siteFiles(ZipArchive $zip, string $top): void
    {
        if ($zip->locateName($top.'/site.json') === false) {
            throw new RuntimeException(__('This zip is a site without a site.json.'));
        }

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = (string) $zip->getNameIndex($i);

            if (preg_match('/\.(php\d?|phtml|phar|pl|py|cgi|sh|asp|aspx|jsp|htaccess)(\.|\/|$)/i', $name)) {
                throw new RuntimeException(__('A site holds no code a server runs: :name', ['name' => $name]));
            }
        }
    }

    private function parseAll(ZipArchive $zip): void
    {
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = (string) $zip->getNameIndex($i);

            if (! str_ends_with(strtolower($name), '.php') || str_contains($name, '/vendor/')) {
                continue;
            }

            try {
                token_get_all((string) $zip->getFromIndex($i), TOKEN_PARSE);
            } catch (\ParseError $e) {
                throw new RuntimeException(__('A file in the package does not parse: :name, line :line', ['name' => $name, 'line' => $e->getLine()]));
            }
        }
    }
}

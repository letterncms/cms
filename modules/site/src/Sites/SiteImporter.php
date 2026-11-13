<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Sites;

use Cms\Abilities\AbilityException;
use Cms\Support\Files;
use ZipArchive;

/**
 * Puts a site that came as a zip (what Export Site downloads, or a site's folder zipped) into the site's `sites/`.
 * The zip is read without trust: no path outside the site, no link, nothing too many or too large; then the
 * unpacked folder is read as any site is (SiteFiles), so a site that is not safe is refused whole, by file.
 */
final class SiteImporter
{
    private const int MAX_ENTRIES = 6000;

    private const int MAX_BYTES = 520_000_000;

    private const int SYMLINK = 0o120000;

    public function __construct(private readonly Sites $sites, private readonly SiteFiles $files) {}

    /** @return Site the site now in sites/ */
    public function import(string $zipFile, bool $replace = false): Site
    {
        $zip = new ZipArchive;

        if ($zip->open($zipFile, ZipArchive::RDONLY) !== true) {
            throw AbilityException::invalid(__('That is not a zip file.'));
        }

        $stage = storage_path('framework/site-import-'.bin2hex(random_bytes(4)));

        try {
            $top = $this->check($zip);
            $root = $stage.'/site';
            Files::ensureDir($root);

            for ($i = 0; $i < $zip->numFiles; $i++) {
                $name = (string) $zip->getNameIndex($i);
                $relative = $top === '' ? $name : substr($name, strlen($top) + 1);

                if ($relative === '' || str_ends_with($name, '/') || str_starts_with($name, '__MACOSX/') || str_ends_with($name, '.DS_Store')) {
                    continue;
                }

                Files::put(Files::within($root, $relative), (string) $zip->getFromIndex($i));
            }

            $manifest = json_decode((string) @file_get_contents($root.'/'.Site::FILE), true);
            $handle = is_array($manifest) && is_string($manifest['handle'] ?? null) ? $manifest['handle'] : '';

            if (! Files::isHandle($handle)) {
                throw AbilityException::invalid(__('That zip holds no site: a site has a site.json.'));
            }

            $this->files->read($sitePackage = Site::load($root, 'site', $handle));

            if (is_dir($this->sites->path($handle)) && ! $replace) {
                throw AbilityException::conflict(__('There is a site “:handle” already. Choose another handle, or replace it.', ['handle' => $handle]));
            }

            $target = $this->sites->path($handle);
            Files::deleteDirectory($target);
            Files::ensureDir(dirname($target));

            if (! @rename($root, $target)) {
                throw new \RuntimeException(__('Could not put the site in :folder.', ['folder' => $target]));
            }
        } finally {
            $zip->close();
            Files::deleteDirectory($stage);
        }

        $this->sites->flush();

        return $this->sites->findOrFail($handle);
    }

    /** The folder every file is in (empty when they are at the top), after refusing a zip that is not safe to unpack. */
    private function check(ZipArchive $zip): string
    {
        if ($zip->numFiles > self::MAX_ENTRIES) {
            throw AbilityException::invalid(__('The zip has too many files.'));
        }

        $bytes = 0;
        $tops = [];
        $loose = false;

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $stat = $zip->statIndex($i);
            $name = (string) ($stat['name'] ?? '');
            $zip->getExternalAttributesIndex($i, $opsys, $attr);

            if ($name === '' || str_starts_with($name, '/') || str_contains($name, '..') || str_contains($name, '\\') || str_contains($name, "\0")
                || ($opsys === ZipArchive::OPSYS_UNIX && (($attr >> 16) & 0o170000) === self::SYMLINK)) {
                throw AbilityException::invalid(__('The zip holds a path no site has: :file.', ['file' => $name]));
            }

            // What a zip of a folder adds (macOS) is not part of the site.
            if (str_starts_with($name, '__MACOSX/') || str_ends_with($name, '.DS_Store')) {
                continue;
            }

            $bytes += (int) ($stat['size'] ?? 0);
            $parts = explode('/', $name);
            count($parts) > 1 ? $tops[$parts[0]] = true : ($loose = true);
        }

        if ($bytes > self::MAX_BYTES) {
            throw AbilityException::invalid(__('The zip is larger than a site may be.'));
        }

        if ($loose) {
            return $zip->locateName(Site::FILE) !== false ? '' : throw AbilityException::invalid(__('That zip holds no site: a site has a site.json.'));
        }

        return count($tops) === 1 && $zip->locateName(array_key_first($tops).'/'.Site::FILE) !== false ? (string) array_key_first($tops) : throw AbilityException::invalid(__('That zip holds no site: a site has a site.json.'));
    }
}

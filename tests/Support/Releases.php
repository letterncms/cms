<?php

declare(strict_types=1);

namespace Cms\Tests\Support;

use Cms\Support\Files;
use ZipArchive;

/** Release zips in the real layout, small enough to build in a test, and a signed feed listing them. */
final class Releases
{
    public const string URL = 'https://store.invalid/downloads/';

    /** @param  array<string, string>  $files  Extra or replaced files, relative to runtime/<version>/ */
    public static function zip(string $dir, string $version, array $files = []): string
    {
        $zip = new ZipArchive;
        $path = "{$dir}/cms-{$version}.zip";
        Files::ensureDir($dir);
        @unlink($path);
        $zip->open($path, ZipArchive::CREATE);
        $tree = [
            'vendor/autoload.php' => "<?php // stand-in\n",
            'vendor/letterncms/cms/src/Cms.php' => "<?php // {$version}\n",
            'root/index.php' => "<?php // loader {$version}\n",
            'root/.htaccess' => "# rules {$version}\n",
            ...$files,
        ];
        $list = '';

        foreach ($tree as $file => $body) {
            $zip->addFromString("runtime/{$version}/{$file}", $body);
            $list .= hash('sha256', $body).'  '.$file."\n";
        }

        $zip->addFromString("runtime/{$version}/release.files", $list);
        $zip->addFromString("runtime/{$version}/release.json", (string) json_encode([
            'version' => $version,
            'root_files' => ['index.php' => hash('sha256', (string) $tree['root/index.php']), '.htaccess' => hash('sha256', (string) $tree['root/.htaccess'])],
        ]));
        $zip->close();

        return $path;
    }

    /** @param  array<string, mixed>  $fields */
    public static function entry(string $zip, string $version, array $fields = []): array
    {
        return Signing::version('letterncms/cms', [
            'version' => $version,
            'major' => (int) explode('.', $version)[0],
            'sha256' => hash_file('sha256', $zip),
            'size' => filesize($zip),
            'url' => self::URL.basename($zip),
            'first_party' => true,
            ...$fields,
        ]);
    }

    /** @param  list<array<string, mixed>>  $releases */
    public static function feed(array $releases, array $fields = []): string
    {
        return Signing::feed('cms-updates', ['product' => 'letterncms/cms', 'support' => [], 'yanked' => [], 'releases' => $releases, ...$fields]);
    }

}

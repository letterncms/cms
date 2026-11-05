<?php

declare(strict_types=1);

namespace Cms\Support;

/**
 * The product's display name and links: one file, brand/brand.json at the root
 * of the installation, next to wordmark.svg and mark.svg. Everything a person
 * reads gets the name from here, so a rebrand edits those three files only.
 *
 *   Brand::get()                      the name
 *   Brand::get('docs_url')            any other value
 *   cms_brand('docs_url')             the same, as a helper
 *
 * Sites on a shared installation read the installation's file. Identifiers
 * (`Cms\`, `cms/*`, `CMS_*`) are neutral on purpose and never come from here.
 */
final class Brand
{
    /** @var array<string, array<string, string>> per file */
    private static array $values = [];

    public static function get(string $key = 'name'): string
    {
        return self::values()[$key] ?? '';
    }

    /** @return array<string, string> the file's values plus the URLs of the two images: what the admin sees. */
    public static function all(): array
    {
        return [...self::values(), 'mark' => self::asset('mark.svg'), 'wordmark' => self::asset('wordmark.svg')];
    }

    /** Changes with any of the three files, so static pages rebuild after a rebrand. */
    public static function signature(): string
    {
        return md5(implode('|', array_map(static fn (string $file) => (string) @md5_file(self::path($file)), ['brand.json', 'mark.svg', 'wordmark.svg'])));
    }

    /**
     * The public URL of mark.svg or wordmark.svg. Copied into this site's public
     * folder, so it also works on a static host; a read-only folder gets a data URI.
     */
    public static function asset(string $file): string
    {
        $source = self::path($file);
        $hash = (string) @md5_file($source);
        $target = public_path('_cms/brand/'.$file);

        if ($hash !== '' && @md5_file($target) !== $hash) {
            @mkdir(dirname($target), 0o755, true);
            @copy($source, $target);
        }

        return @md5_file($target) === $hash && $hash !== ''
            ? '/_cms/brand/'.$file.'?v='.substr($hash, 0, 10)
            : 'data:image/svg+xml;base64,'.base64_encode((string) @file_get_contents($source));
    }

    /** @return array<string, string> */
    private static function values(): array
    {
        $file = self::path('brand.json');

        return self::$values[$file] ??= array_filter(
            Files::readJson($file),
            is_string(...),
        );
    }

    private static function path(string $file): string
    {
        return app()->cmsPath('brand/'.$file);
    }
}

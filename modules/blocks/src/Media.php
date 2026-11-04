<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks;

use Cms\Modules\Media\Images;

/**
 * Image output for blocks: the media library's responsive <picture> for its files, a plain
 * <img> for any other address, and a warning for the build when an image is missing.
 */
final class Media
{
    /** @param array{priority?: bool, aspect?: ?string, sizes?: string, class?: string} $options */
    public static function img(mixed $image, string $alt = '', array $options = []): string
    {
        $html = app(Images::class)->picture($image, $alt, $options);

        if (is_string($html)) {
            return $html;
        }

        $url = self::url($image);

        if ($url === null) {
            self::warn($image);

            return '';
        }

        $priority = ! empty($options['priority']);
        $style = ! empty($options['aspect']) ? ' style="aspect-ratio:'.e($options['aspect']).';object-fit:cover;width:100%"' : '';

        return '<img src="'.e($url).'" alt="'.e($alt).'"'.self::size($url).($priority ? ' fetchpriority="high"' : ' loading="lazy"').' decoding="async"'.$style.'>';
    }

    /** A local file's own size, so the page holds its place while it loads. */
    private static function size(string $url): string
    {
        $file = str_starts_with($url, '/') && ! str_starts_with($url, '//') ? public_path(ltrim((string) parse_url($url, PHP_URL_PATH), '/')) : null;

        if ($file !== null && ! is_file($file)) {
            self::warn($url);

            return '';
        }

        $size = $file !== null ? @getimagesize($file) : false;

        return $size ? ' width="'.$size[0].'" height="'.$size[1].'"' : '';
    }

    /** Tell the build: a page asks for an image that isn't there. */
    private static function warn(mixed $image): void
    {
        $value = is_array($image) ? ($image[0] ?? $image['url'] ?? null) : $image;

        if (is_string($value) && $value !== '' && ! app(BlockRenderer::class)->editor) {
            cms()->hooks()->dispatch('render.warning', __('Missing image: :image', ['image' => $value]));
        }
    }

    public static function url(mixed $image): ?string
    {
        return app(Images::class)->url($image);
    }
}

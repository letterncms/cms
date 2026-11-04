<?php

declare(strict_types=1);

namespace Cms\Modules\Media;

/**
 * What a page shows for an image value: a media id, a /media/ path of a file with a record, a
 * field's list of one, or an Image. Each one makes the page depend on that file, so changing it
 * rebuilds the pages that show it.
 */
final class Images
{
    public function __construct(private readonly Variants $variants, private readonly MediaManifest $manifest) {}

    /** The library's record for an image value, when it has one and its file is there. */
    public function item(mixed $value): ?MediaItem
    {
        $id = is_array($value) ? ($value[0] ?? null) : $value;

        if ($id instanceof Image) {
            return $id->item;
        }

        if (! is_string($id)) {
            return null;
        }

        // A /media/ URL of a file with a record gets the same responsive markup as its id.
        if (str_starts_with($id, '/media/')) {
            $item = MediaItem::query()->where('path', ltrim((string) parse_url($id, PHP_URL_PATH), '/'))->first();
            $item && cms()->hooks()->dispatch('render.depend', 'media:'.$item->id);

            return $item;
        }

        if (! preg_match('/^[0-9a-z]{26}$/i', $id)) {
            return null;
        }

        $id = strtolower($id);
        $item = MediaItem::query()->find($id) ?? $this->lookAgain($id);
        cms()->hooks()->dispatch('render.depend', 'media:'.$id);

        return $item && is_file(public_path($item->path)) ? $item : null;
    }

    /** Responsive <picture> markup for a file in the library; null for anything else. Plugins adjust it with `media.img`. */
    public function picture(mixed $value, string $alt = '', array $options = []): ?string
    {
        $item = $this->item($value);
        $html = $item ? $this->variants->picture($item, $alt !== '' ? $alt : null, $options) : null;

        return cms()->hooks()->filter('media.img', $html, $value, $alt, $options);
    }

    /** The address of an image value: the library's file, or an address given as it is. Plugins adjust it with `media.url` (a CDN). */
    public function url(mixed $value): ?string
    {
        if ($item = $this->item($value)) {
            $url = $item->url();
        } else {
            $given = is_array($value) ? ($value[0] ?? $value['url'] ?? null) : $value;
            $url = is_string($given) && preg_match('#^(https?://|/)#', $given) ? $given : null;
        }

        return cms()->hooks()->filter('media.url', $url, $value);
    }

    /** A file added beside the site (by Sync, by hand) has no record yet: import, at most once a minute. */
    private function lookAgain(string $id): ?MediaItem
    {
        $stamp = storage_path('media-import.stamp');

        if ((is_file($stamp) && time() - (int) filemtime($stamp) < 60) || ! $this->manifest->stale()) {
            return null;
        }

        @touch($stamp);
        $this->manifest->import(5.0);

        return MediaItem::query()->find($id);
    }
}

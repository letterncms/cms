<?php

declare(strict_types=1);

namespace Cms\Content\Entries;

use Closure;
use Cms\Content\Collections\Collection;
use Cms\Extend\Hooks;

/**
 * Builds an entry's URI from its collection route, e.g.
 *   /blog/{slug}  ·  /{parent_uri}/{slug}  ·  /news/{year}/{month}/{slug}  ·  /docs/{section}/{slug}
 * A collection can have another pattern per language (`routes`).
 */
final class UriBuilder
{
    public function __construct(private readonly Hooks $hooks) {}

    /** @param Closure(string): ?Entry $parentResolver */
    public function build(Entry $entry, Collection $collection, Closure $parentResolver): ?string
    {
        if (! $collection->routable()) {
            return null;
        }

        if ($collection->home !== null && $entry->slug === $collection->home && $entry->parentId === null) {
            return $this->hooks->filter('entry.uri', '/', $entry, $collection);
        }

        // {parent_uri} is the chain of ancestor slugs (the home entry is skipped).
        $segments = [];
        $parentId = $entry->parentId;

        for ($depth = 0; $parentId !== null && $depth < 32; $depth++) {
            $parent = $parentResolver($parentId);

            if (! $parent) {
                break;
            }

            if (! ($collection->home !== null && $parent->slug === $collection->home && $parent->parentId === null)) {
                array_unshift($segments, $parent->slug);
            }

            $parentId = $parent->parentId;
        }

        $parentUri = implode('/', $segments);

        $date = $entry->publishedAt ?? $entry->createdAt;

        $uri = preg_replace_callback('/\{([a-z_]+)\}/', static fn (array $m) => match ($m[1]) {
            'slug' => $entry->slug,
            'parent_uri' => trim($parentUri, '/'),
            'year' => $date?->format('Y') ?? date('Y'),
            'month' => $date?->format('m') ?? date('m'),
            'day' => $date?->format('d') ?? date('d'),
            'id' => $entry->id,
            default => is_scalar($entry->data[$m[1]] ?? null) ? \Illuminate\Support\Str::slug((string) $entry->data[$m[1]]) : '',
        }, (string) $collection->routeFor($entry->locale));

        $uri = '/'.trim((string) preg_replace('#/+#', '/', $uri), '/');

        return $this->hooks->filter('entry.uri', $uri, $entry, $collection);
    }
}

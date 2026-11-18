<?php

declare(strict_types=1);

namespace Cms\Content\Collections;

use Cms\Content\Entries\Entry;
use Cms\Content\Entries\EntryRepository;
use Cms\Content\Entries\EntryService;
use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldTypeRegistry;
use Cms\Content\Fields\Types\Link;
use Cms\Extend\Hooks;

/**
 * A menu's links, for templates: a menu is a collection of type `menu`, each of its entries a link whose title is
 * the words and whose `link` field is where it goes. Only live links show, a link to a page only while that page is
 * live (and what is nested under it with it), each read in the language of the page (`entry.localized`); `current`
 * marks the link to the page being rendered and `active` the links above it.
 */
final class Menus
{
    public function __construct(
        private readonly CollectionRepository $collections,
        private readonly EntryRepository $entries,
        private readonly Hooks $hooks,
        private readonly FieldTypeRegistry $types,
    ) {}

    /** @return array<string, string> Each menu's title by its handle. */
    public function titles(): array
    {
        $out = [];

        foreach ($this->collections->all() as $collection) {
            $collection->isMenu() && $out[$collection->handle] = $collection->title;
        }

        return $out;
    }

    /**
     * Take the links to a page out of every menu once the page is gone, with their translations: what was nested
     * under one moves up.
     */
    public function forget(Entry $page, EntryService $entries): void
    {
        $menus = array_keys($this->titles());

        if ($menus === []) {
            return;
        }

        foreach ($this->entries->query()->collection(...$menus)->where('origin_id', 'null', null)->get() as $link) {
            if (($link->data['link']['type'] ?? null) === 'entry' && ($link->data['link']['value'] ?? null) === $page->id) {
                foreach ($this->entries->query()->collection($link->collection)->where('origin_id', $link->id)->get() as $translation) {
                    $entries->delete($translation->id);
                }

                $entries->delete($link->id);
            }
        }
    }

    /**
     * @param  string|null  $current  URI of the page being rendered (marks current and active links)
     * @return list<array{label: string, url: string, newTab: bool, current: bool, active: bool, children: list<array>}>|null  null when there is no such menu
     */
    public function resolve(string $handle, ?string $current = null, ?string $locale = null): ?array
    {
        $menu = $this->collections->find($handle);

        if (! $menu?->isMenu()) {
            return null;
        }

        $byParent = [];

        // The links in the language they were made in; each reads its translation where the page is in another.
        foreach ($this->entries->query()->collection($handle)->where('origin_id', 'null', null)->live()->orderBy('position')->get() as $entry) {
            $byParent[$entry->parentId ?? ''][] = $entry;
        }

        // Moving, renaming or unpublishing a link rebuilds every page that shows the menu.
        $this->hooks->dispatch('render.depend', 'collection:'.$handle);

        return $this->links($byParent, '', $current === null ? null : self::normal($current), $locale);
    }

    /** @param array<string, list<Entry>> $byParent */
    private function links(array $byParent, string $parent, ?string $current, ?string $locale): array
    {
        $out = [];

        foreach ($byParent[$parent] ?? [] as $item) {
            $words = $this->hooks->filter('entry.localized', $item, $locale);
            $link = is_array($words->data['link'] ?? null) ? $words->data['link'] : (is_array($item->data['link'] ?? null) ? $item->data['link'] : null);
            $url = $this->url($link, $locale);

            if ($url === null) {
                continue; // Hidden with what is under it until the page it leads to is live.
            }

            $children = $this->links($byParent, $item->id, $current, $locale);
            $local = str_starts_with($url, '/');
            $isCurrent = $current !== null && $local && self::normal($url) === $current;

            // A link's own fields beside its address, an icon or a few words to say what is behind it, in its language:
            // what the menu's own keys name stays theirs.
            $fields = array_diff_key([...$item->data, ...$words->data], ['link' => true]);

            $out[] = [
                ...$fields,
                'label' => $words->title,
                'url' => $url,
                'newTab' => ! empty($link['new_tab']),
                'current' => $isCurrent,
                'active' => $isCurrent || array_filter($children, static fn ($c) => $c['active']) !== []
                    || ($current !== null && $local && self::normal($url) !== '/' && str_starts_with($current.'/', self::normal($url).'/')),
                'children' => $children,
            ];
        }

        return $out;
    }

    /** Where a link leads in a language: a page's address while it is live there, null when it leads nowhere. */
    private function url(?array $link, ?string $locale): ?string
    {
        if ($link === null || ! isset($link['type'], $link['value'])) {
            return null;
        }

        if ($link['type'] === 'entry') {
            $page = $this->entries->find((string) $link['value']);
            $page = $page === null ? null : $this->hooks->filter('entry.localized', $page, $locale);
            // Renaming, moving or unpublishing the page rebuilds every page that shows the menu.
            $page && $this->hooks->dispatch('render.depend', 'entry:'.$page->id);

            return $page instanceof Entry && $page->isLive() && $page->uri !== null ? $page->uri : null;
        }

        // An address, an email, a phone number or a file: where the link field says it leads, an address only when it is safe to.
        if ($link['type'] === 'url' && ! Link::safe((string) $link['value'])) {
            return null;
        }

        return $this->types->resolve('link')->augment($link, Field::fromArray(['handle' => 'link', 'type' => 'link']))['url'] ?? null;
    }

    private static function normal(string $uri): string
    {
        $path = (string) parse_url($uri, PHP_URL_PATH);

        return $path === '' || $path === '/' ? '/' : rtrim($path, '/');
    }
}

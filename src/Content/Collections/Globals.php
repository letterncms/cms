<?php

declare(strict_types=1);

namespace Cms\Content\Collections;

use Cms\Content\Entries\Entry;
use Cms\Content\Entries\EntryRepository;
use Cms\Extend\Hooks;

/**
 * What the globals hold, for templates: a global is a collection of type `global`, its values the fields of its one
 * entry. A language with a live translation of that entry reads the translation (the `entry.localized` filter).
 */
final class Globals
{
    public function __construct(
        private readonly CollectionRepository $collections,
        private readonly EntryRepository $entries,
        private readonly Hooks $hooks,
    ) {}

    /** @return array<string, array> Each global's values in a language, by its handle. */
    public function all(?string $locale = null): array
    {
        $out = [];

        foreach ($this->collections->all() as $collection) {
            if ($collection->isGlobal()) {
                $out[$collection->handle] = $this->values($collection, $locale);
            }
        }

        return $out;
    }

    /** One global's values in a language, null when there is no such global. */
    public function find(string $handle, ?string $locale = null): ?array
    {
        $collection = $this->collections->find($handle);

        return $collection?->isGlobal() ? $this->values($collection, $locale) : null;
    }

    /** The live entry that holds a global's values in a language, if it has one. */
    public function entry(Collection $global, ?string $locale = null): ?Entry
    {
        // A page that shows a global is rebuilt when it changes, a translation made later included.
        $this->hooks->dispatch('render.depend', 'collection:'.$global->handle);
        $entry = $this->entries->query()->collection($global->handle)->where('origin_id', 'null', null)->live()->first();

        return $entry === null ? null : $this->hooks->filter('entry.localized', $entry, $locale);
    }

    private function values(Collection $global, ?string $locale): array
    {
        $blueprint = $global->blueprint();

        $values = $blueprint->augment(array_replace($blueprint->defaults(), $this->entry($global, $locale)?->data ?? []));

        // An option reads as its label on a page, and still equals its value.
        foreach ($blueprint->fields() as $field) {
            $field->type === 'select' && $values[$field->handle] = \Cms\Content\Fields\Choice::of($values[$field->handle] ?? null, $field);
        }

        return $values;
    }
}

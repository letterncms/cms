<?php

declare(strict_types=1);

namespace Cms\Content\Entries;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Cms\Content\Collections\Collection;
use Cms\Content\Collections\CollectionRepository;

/** Read/write access to entries across storage drivers. */
final class EntryRepository
{
    public function __construct(
        private readonly CollectionRepository $collections,
        private readonly DatabaseDriver $database,
        private readonly FileDriver $files,
    ) {}

    public function flush(): void
    {
        $this->files->flush();
    }

    public function query(): EntryQuery
    {
        return new EntryQuery($this);
    }

    public function find(string $id): ?Entry
    {
        if (! preg_match('/^[0-9a-z]{26}$/i', $id)) {
            return null;
        }

        return $this->database->find($id) ?? $this->files->find($id);
    }

    public function findOrFail(string $id): Entry
    {
        return $this->find($id) ?? throw (new ModelNotFoundException)->setModel('Entry', [$id]);
    }

    /** @return list<Entry> In the order of $ids. */
    public function findMany(array $ids): array
    {
        $ids = array_values(array_filter(array_map(static fn ($id) => strtolower((string) $id), $ids), static fn ($id) => preg_match('/^[0-9a-z]{26}$/', $id)));
        $found = [];

        foreach ([$this->database, $this->files] as $driver) {
            foreach ($driver->findMany(array_values(array_diff($ids, array_keys($found)))) as $entry) {
                $found[$entry->id] = $entry;
            }
        }

        return array_values(array_filter(array_map(static fn ($id) => $found[$id] ?? null, $ids)));
    }

    public function findByUri(string $uri, ?string $locale = null): ?Entry
    {
        return $this->database->findByUri($uri, $locale) ?? $this->files->findByUri($uri, $locale);
    }

    /** @return list<Entry> Public (`live`) queries answer only what this request may read. */
    public function run(EntryQuery $query): array
    {
        $public = $query->status === 'live' && ! $query->ungated;
        $entries = $this->fetch($public ? $this->withoutHidden($query) : $query);

        return $public ? array_map($this->gate()->view(...), $entries) : $entries;
    }

    public function gate(): EntryGate
    {
        return app(EntryGate::class);
    }

    private function withoutHidden(EntryQuery $query): EntryQuery
    {
        if (($hidden = $this->gate()->hiddenIds()) === []) {
            return $query;
        }

        $clone = clone $query;
        $clone->where('id', 'not in', $hidden);

        return $clone;
    }

    /** @return list<Entry> */
    private function fetch(EntryQuery $query): array
    {
        $groups = $this->groups($query);

        if (count($groups) <= 1) {
            [$driver, $handles] = $groups[0] ?? [null, []];

            return $driver ? $driver->query($query, $handles) : [];
        }

        // Mixed drivers: fetch enough from each, merge, sort and slice in memory.
        $merged = [];
        $window = clone $query;
        $window->offset = 0;
        $window->limit = $query->limit === null ? null : $query->offset + $query->limit;

        foreach ($groups as [$driver, $handles]) {
            array_push($merged, ...$driver->query($window, $handles));
        }

        $merged = EntryFilter::sort($merged, $query->orders ?: [['title', 'asc']], $query->relevance ? $query->search : null, $query->working);

        return array_slice($merged, $query->offset, $query->limit);
    }

    public function count(EntryQuery $query): int
    {
        $query = $query->status === 'live' && ! $query->ungated ? $this->withoutHidden($query) : $query;
        $total = 0;

        foreach ($this->groups($query) as [$driver, $handles]) {
            $total += $driver->count($query, $handles);
        }

        return $total;
    }

    public function save(Entry $entry): void
    {
        if ($entry->gated !== null) {
            throw new \LogicException('A gated reader\'s copy of an entry cannot be saved.');
        }

        $collection = $this->collections->findOrFail($entry->collection);
        $this->driver($collection)->save($entry, $collection);
    }

    public function delete(Entry $entry): void
    {
        $collection = $this->collections->findOrFail($entry->collection);
        $this->driver($collection)->delete($entry, $collection);
    }

    public function driver(Collection $collection): EntryDriver
    {
        return $collection->driver === 'files' ? $this->files : $this->database;
    }

    /** @return list<array{0: EntryDriver, 1: list<string>}> */
    private function groups(EntryQuery $query): array
    {
        $groups = [];

        foreach ($query->collections ?: array_keys($this->collections->all()) as $handle) {
            if ($collection = $this->collections->find($handle)) {
                $driver = $this->driver($collection);
                $groups[spl_object_id($driver)] ??= [$driver, []];
                $groups[spl_object_id($driver)][1][] = $handle;
            }
        }

        return array_values($groups);
    }
}

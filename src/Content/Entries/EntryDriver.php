<?php

declare(strict_types=1);

namespace Cms\Content\Entries;

use Cms\Content\Collections\Collection;

interface EntryDriver
{
    public function find(string $id): ?Entry;

    /** @return list<Entry> */
    public function query(EntryQuery $query, array $collections): array;

    public function count(EntryQuery $query, array $collections): int;

    public function save(Entry $entry, Collection $collection): void;

    public function delete(Entry $entry, Collection $collection): void;
}

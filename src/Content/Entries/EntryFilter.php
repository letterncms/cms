<?php

declare(strict_types=1);

namespace Cms\Content\Entries;

use Cms\Users\User;

/** In-memory implementation of EntryQuery semantics (flat files, merged results). */
final class EntryFilter
{
    /** @param list<Entry> $entries */
    public static function apply(array $entries, EntryQuery $query): array
    {
        $now = time();

        return array_values(array_filter($entries, static function (Entry $entry) use ($query, $now): bool {
            if ($query->locale !== null && $entry->locale !== $query->locale) {
                return false;
            }

            $ok = match ($query->status) {
                'published' => $entry->status === 'published',
                'draft' => $entry->status === 'draft',
                'live' => $entry->status === 'published' && ($entry->publishedAt === null || $entry->publishedAt->getTimestamp() <= $now),
                default => true,
            };

            if (! $ok) {
                return false;
            }

            foreach ($query->wheres as [$field, $operator, $value]) {
                if (! self::compare(self::value($entry, $field, $query->working), $operator, $value)) {
                    return false;
                }
            }

            foreach ($query->references as $reference) {
                $data = ($query->working ? $entry->working() : $entry->content())['data'];
                $within = $reference['field'] === null ? $data : data_get($data, $reference['field']);

                if ($reference['id'] === null || $reference['id'] === $entry->id || ! str_contains(strtolower((string) json_encode($within)), $reference['id'])) {
                    return false;
                }
            }

            if ($query->search !== null) {
                $content = $query->working ? $entry->working() : $entry->content();
                $haystack = mb_strtolower($content['title'].' '.$content['slug'].' '.json_encode($content['data'], JSON_UNESCAPED_UNICODE));

                if (! str_contains($haystack, mb_strtolower($query->search))) {
                    return false;
                }
            }

            return true;
        }));
    }

    /** @param list<array{0: string, 1: string}> $orders */
    public static function sort(array $entries, array $orders, ?string $search = null, bool $working = false): array
    {
        // Authors sort by name, like the database driver does.
        $names = in_array('author_id', array_column($orders, 0), true) ? User::query()->pluck('name', 'id')->all() : [];

        usort($entries, static function (Entry $a, Entry $b) use ($orders, $names, $search, $working): int {
            if ($search !== null) {
                $rank = self::relevance($a, $search, $working) <=> self::relevance($b, $search, $working);

                if ($rank !== 0) {
                    return $rank;
                }
            }

            foreach ($orders as [$field, $dir]) {
                [$x, $y] = $field === 'author_id'
                    ? [$names[self::value($a, 'author_id', $working)] ?? null, $names[self::value($b, 'author_id', $working)] ?? null]
                    : [self::value($a, $field, $working), self::value($b, $field, $working)];

                // Empty values last, whichever the direction.
                if (($x === null) !== ($y === null)) {
                    return $x === null ? 1 : -1;
                }

                $cmp = self::sortable($x) <=> self::sortable($y);

                if ($cmp !== 0) {
                    return $dir === 'desc' ? -$cmp : $cmp;
                }
            }

            return $a->id <=> $b->id;
        });

        return $entries;
    }

    /** Same tiers as DatabaseDriver: exact, prefix, substring, then body-only. */
    private static function relevance(Entry $entry, string $search, bool $working): int
    {
        $term = mb_strtolower($search);
        $content = $working ? $entry->working() : $entry->content();
        $title = mb_strtolower($content['title']);
        $slug = mb_strtolower($content['slug']);

        return match (true) {
            $title === $term => 0,
            $slug === $term => 1,
            str_starts_with($title, $term) => 2,
            str_contains($title, $term) => 3,
            str_starts_with($slug, $term) => 4,
            str_contains($slug, $term) => 5,
            default => 6,
        };
    }

    public static function value(Entry $entry, string $field, bool $working = false): mixed
    {
        $content = $working ? $entry->working() : $entry->content();
        return match ($field) {
            'id' => $entry->id,
            'title' => $content['title'],
            'slug' => $content['slug'],
            'uri' => $entry->uri,
            'status' => $entry->status,
            'locale' => $entry->locale,
            'parent_id' => $entry->parentId,
            'position' => $entry->position,
            'author_id' => $content['authorId'],
            'origin_id' => $entry->originId,
            'published_at' => $entry->publishedAt?->toIso8601String(),
            'created_at' => $entry->createdAt?->toIso8601String(),
            'updated_at' => $entry->updatedAt?->toIso8601String(),
            default => data_get($content['data'], $field),
        };
    }

    private static function compare(mixed $actual, string $operator, mixed $expected): bool
    {
        if ($expected instanceof \DateTimeInterface) {
            $expected = $expected->getTimestamp();
            $actual = $actual === null ? null : strtotime((string) $actual);
        }

        return match ($operator) {
            '=' => $actual == $expected,
            '!=' => $actual != $expected,
            '<' => $actual < $expected,
            '>' => $actual > $expected,
            '<=' => $actual <= $expected,
            '>=' => $actual >= $expected,
            'in' => in_array($actual, (array) $expected, false),
            'not in' => ! in_array($actual, (array) $expected, false),
            'null' => $actual === null,
            'not null' => $actual !== null,
            'contains' => is_array($actual) ? in_array($expected, $actual, false) : str_contains(mb_strtolower((string) $actual), mb_strtolower((string) $expected)),
            'like' => (bool) preg_match('/^'.str_replace(['%', '_'], ['.*', '.'], preg_quote((string) $expected, '/')).'$/iu', (string) $actual),
            default => false,
        };
    }

    private static function sortable(mixed $value): mixed
    {
        return is_string($value) ? mb_strtolower($value) : $value;
    }
}

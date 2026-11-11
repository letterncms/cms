<?php

declare(strict_types=1);

namespace Cms\Content\Entries;

use Carbon\CarbonImmutable;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Cms\Content\Collections\Collection;
use Cms\Content\Collections\CollectionRepository;

final class DatabaseDriver implements EntryDriver
{
    public function find(string $id): ?Entry
    {
        $row = $this->table()->where('id', strtolower($id))->first();

        return $row ? $this->hydrate($row) : null;
    }

    /** @return list<Entry> */
    public function findMany(array $ids): array
    {
        if ($ids === []) {
            return [];
        }

        return $this->table()->whereIn('id', array_map('strtolower', $ids))->get()->map($this->hydrate(...))->all();
    }

    public function findByUri(string $uri, ?string $locale): ?Entry
    {
        $row = $this->table()->where('uri', $uri)->when($locale, fn (Builder $q) => $q->where('locale', $locale))->first();

        return $row ? $this->hydrate($row) : null;
    }

    public function query(EntryQuery $query, array $collections): array
    {
        $builder = $this->build($query, $collections);

        if ($query->relevance && $query->search !== null) {
            $title = $this->expression($builder, 'title', $query->working);
            $slug = $this->expression($builder, 'slug', $query->working);
            $term = mb_strtolower($query->search);
            $literal = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $term);
            $builder->orderByRaw("case
                when lower({$title}) = ? then 0
                when lower({$slug}) = ? then 1
                when lower({$title}) like ? escape '!' then 2
                when lower({$title}) like ? escape '!' then 3
                when lower({$slug}) like ? escape '!' then 4
                when lower({$slug}) like ? escape '!' then 5
                else 6 end", [$term, $term, $literal.'%', '%'.$literal.'%', $literal.'%', '%'.$literal.'%']);
        }

        foreach ($query->orders ?: [['position', 'asc'], ['title', 'asc']] as [$field, $dir]) {
            $this->order($builder, $field, $dir, $query->working);
        }

        $builder->orderBy('id');

        if ($query->limit !== null) {
            $builder->limit($query->limit);
        }

        if ($query->offset > 0) {
            $builder->offset($query->offset)->limit($query->limit ?? PHP_INT_MAX);
        }

        return $builder->get()->map($this->hydrate(...))->all();
    }

    public function count(EntryQuery $query, array $collections): int
    {
        return $this->build($query, $collections)->count();
    }

    public function save(Entry $entry, Collection $collection): void
    {
        $now = CarbonImmutable::now();
        $entry->createdAt ??= $now;
        $entry->updatedAt = $now;

        $this->table()->upsert([[
            'id' => $entry->id,
            'collection' => $entry->collection,
            'blueprint' => $entry->blueprint,
            'locale' => $entry->locale,
            'origin_id' => $entry->originId,
            'parent_id' => $entry->parentId,
            'position' => $entry->position,
            'slug' => $entry->slug,
            'uri' => $entry->uri,
            'title' => $entry->title,
            'status' => $entry->status,
            'data' => json_encode($entry->data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
            'draft' => $entry->draft === null ? null : json_encode($entry->draft, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
            'author_id' => $entry->authorId,
            'published_at' => $entry->publishedAt,
            'expires_at' => $entry->expiresAt,
            'created_at' => $entry->createdAt,
            'updated_at' => $entry->updatedAt,
        ]], ['id']);
    }

    public function delete(Entry $entry, Collection $collection): void
    {
        $this->table()->where('id', $entry->id)->delete();
    }

    private function build(EntryQuery $query, array $collections): Builder
    {
        $builder = $this->table()->whereIn('collection', $collections);

        if ($query->locale !== null) {
            $builder->where('locale', $query->locale);
        }

        match ($query->status) {
            'published' => $builder->where('status', 'published'),
            'draft' => $builder->where('status', 'draft'),
            'expired' => $builder->where('status', 'published')->whereNotNull('expires_at')->where('expires_at', '<=', now()),
            'active' => $builder->where('status', 'published')->where(fn (Builder $q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now())),
            'live' => $builder->where('status', 'published')->where(fn (Builder $q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
                ->where(fn (Builder $q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now())),
            default => null,
        };

        foreach ($query->wheres as [$field, $operator, $value]) {
            if (! EntryQuery::isColumn($field)) {
                $builder->whereRaw(...$this->whereData($field, $operator, $value, $query->working));

                continue;
            }

            // The same answers as EntryFilter::compare(): nothing there is not equal to anything, and is not in any list.
            $column = DB::raw($this->expression($builder, $field, $query->working));
            $blank = $value === null || $value === '';
            match ($operator) {
                'in' => $builder->whereIn($column, (array) $value),
                'not in' => $builder->where(fn (Builder $q) => $q->whereNotIn($column, (array) $value)->orWhereNull($column)),
                'null' => $builder->whereNull($column),
                'not null' => $builder->whereNotNull($column),
                'contains' => $builder->whereRaw("lower({$column->getValue($builder->getGrammar())}) like ? escape '!'", ['%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], mb_strtolower((string) $value)).'%']),
                'like' => $builder->whereRaw("lower({$column->getValue($builder->getGrammar())}) like ?", [mb_strtolower((string) $value)]),
                '=' => $blank ? $builder->where(fn (Builder $q) => $q->whereNull($column)->orWhere($column, '')) : $builder->where($column, '=', $value),
                '!=' => $blank ? $builder->whereNotNull($column)->where($column, '!=', '') : $builder->where(fn (Builder $q) => $q->where($column, '!=', $value)->orWhereNull($column)),
                default => $builder->where($column, $operator, $value),
            };
        }

        foreach ($query->references as $reference) {
            if ($reference['id'] === null) {
                $builder->whereRaw('0 = 1');

                continue;
            }

            // The id anywhere in the entry's data, or in one field of it: as EntryFilter reads it.
            $data = $query->working ? "case when entries.draft is not null then json_extract(entries.draft, '$.data') else entries.data end" : 'entries.data';
            $fields = $reference['field'] === null ? [null] : (array) $reference['field'];

            if ($fields === []) {
                $builder->whereRaw('0 = 1');

                continue;
            }

            $builder->where('entries.id', '!=', $reference['id'])->where(static function (Builder $q) use ($fields, $data, $reference): void {
                foreach ($fields as $field) {
                    $within = $field === null ? $data : "json_extract({$data}, '$.{$field}')";
                    $q->orWhereRaw("lower(cast({$within} as char)) like ?", ['%'.$reference['id'].'%']);
                }
            });
        }

        if ($query->search !== null) {
            $term = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], mb_strtolower($query->search)).'%';
            $title = $this->expression($builder, 'title', $query->working);
            $slug = $this->expression($builder, 'slug', $query->working);
            $data = $query->working ? "case when draft is not null then json_extract(draft, '$.data') else data end" : 'data';
            // In lower case on both sides: MySQL compares its JSON, and the text taken from it, letter for letter.
            $builder->where(fn (Builder $q) => $q->whereRaw("lower({$title}) like ? escape '!'", [$term])->orWhereRaw("lower({$slug}) like ? escape '!'", [$term])->orWhereRaw("lower(cast({$data} as char)) like ? escape '!'", [$term]));
        }

        return $builder;
    }

    /**
     * One condition on a field of the data, in the JSON each database keeps. The answers are EntryFilter::compare()'s:
     * a field that is missing, null or empty equals only "nothing" and is unequal to everything else, is in no
     * list and is neither less nor more than anything; a number is compared as a number, true as true, a text as
     * it is written; `like` and `contains` do not mind case.
     *
     * @return array{0: string, 1: list<mixed>} SQL and its bindings.
     */
    private function whereData(string $field, string $operator, mixed $value, bool $working): array
    {
        if ($operator === 'contains') {
            return $this->contains($field, $value, $working);
        }

        $sqlite = DB::connection()->getDriverName() === 'sqlite';
        $document = $working ? "case when entries.draft is not null then json_extract(entries.draft, '$.data') else entries.data end" : 'entries.data';
        $json = "json_extract({$document}, '$.{$field}')";
        // JSON null is SQL null in SQLite, and a value of its own in MySQL.
        $none = $sqlite ? "{$json} is null" : "({$json} is null or json_type({$json}) = 'NULL')";
        $text = $sqlite ? $json : "json_unquote({$json})";
        $empty = "({$none} or {$text} = '')";
        // One value against the field, typed: SQLite binds it as what it is, MySQL compares JSON with JSON.
        $compare = static function (string $op, mixed $one) use ($sqlite, $json): array {
            if ($sqlite) {
                return match (true) {
                    is_bool($one) => ["{$json} {$op} ?", [(int) $one]],
                    is_float($one) => ["{$json} {$op} cast(? as real)", [$one]],
                    default => ["{$json} {$op} ?", [$one]],
                };
            }

            return ["{$json} {$op} cast(? as json)", [json_encode($one, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)]];
        };
        $blank = $value === null || $value === '';

        switch ($operator) {
            case 'null':
                return [$none, []];
            case 'not null':
                return ["not {$none}", []];
            case 'like':
                return ["(not {$none} and lower({$text}) like ?)", [mb_strtolower((string) $value)]];
            case 'in':
            case 'not in':
                $any = [];
                $bindings = [];

                foreach ((array) $value as $one) {
                    [$sql, $bound] = $compare('=', $one);
                    $any[] = $sql;
                    array_push($bindings, ...$bound);
                }

                $any = $any === [] ? '0 = 1' : implode(' or ', $any);

                return [$operator === 'in' ? "(not {$empty} and ({$any}))" : "({$empty} or not ({$any}))", $bindings];
            case '=':
                if ($blank) {
                    return [$empty, []];
                }

                [$sql, $bindings] = $compare('=', $value);

                return ["(not {$none} and {$sql})", $bindings];
            case '!=':
                if ($blank) {
                    return ["not {$empty}", []];
                }

                [$sql, $bindings] = $compare('!=', $value);

                return ["({$none} or {$sql})", $bindings];
            default:
                [$sql, $bindings] = $compare($operator, $value instanceof \DateTimeInterface ? $value->format('c') : $value);

                return ["(not {$empty} and {$sql})", $bindings];
        }
    }

    /**
     * A list in the data has this value, or a text has it in it, as EntryFilter reads `contains`. Each is asked
     * only of what it is: two blueprints of a collection can give one handle a list and a text, and SQLite
     * refuses to look into a text as if it were a list.
     *
     * @return array{0: string, 1: list<mixed>} SQL and its bindings.
     */
    private function contains(string $field, mixed $value, bool $working): array
    {
        $document = $working ? "case when entries.draft is not null then json_extract(entries.draft, '$.data') else entries.data end" : 'entries.data';

        $part = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], mb_strtolower(is_scalar($value) ? (string) $value : "\0")).'%';

        return DB::connection()->getDriverName() === 'sqlite'
            ? ["(exists (select 1 from json_each(case when json_type({$document}, '$.{$field}') = 'array' then json_extract({$document}, '$.{$field}') else '[]' end) where json_each.value = ?)"
                ." or (json_type({$document}, '$.{$field}') = 'text' and lower(json_extract({$document}, '$.{$field}')) like ? escape '!'))", [$value, $part]]
            : ["(case when json_type(json_extract({$document}, '$.{$field}')) = 'ARRAY' then json_contains(json_extract({$document}, '$.{$field}'), ?) else 0 end = 1"
                ." or (json_type(json_extract({$document}, '$.{$field}')) = 'STRING' and lower(json_unquote(json_extract({$document}, '$.{$field}'))) like ? escape '!'))", [json_encode($value, JSON_THROW_ON_ERROR), $part]];
    }

    /**
     * Same order as EntryFilter::sort: empty values last in either direction, text
     * without regard to case, and authors by name rather than by id.
     */
    private function order(Builder $builder, string $field, string $dir, bool $working): void
    {
        $column = $this->expression($builder, $field, $working);
        if ($field === 'author_id') {
            $name = DB::table('users')->selectRaw('lower(name)')->whereRaw("users.id = {$column}")->limit(1);
            $builder->addSelect('entries.*')->selectSub($name, '_cms_author_sort')->orderByRaw('_cms_author_sort is null')->orderBy('_cms_author_sort', $dir);

            return;
        }
        // MySQL reads a field of the data as text unless asked for the JSON: 10 would sort before 9, and null would be a word.
        if (! EntryQuery::isColumn($field) && DB::connection()->getDriverName() !== 'sqlite') {
            $document = $working ? "case when entries.draft is not null then json_extract(entries.draft, '$.data') else entries.data end" : 'entries.data';
            $json = "json_extract({$document}, '$.{$field}')";
            $builder->orderByRaw("({$json} is null or json_type({$json}) = 'NULL')")->orderByRaw("{$json} {$dir}");

            return;
        }

        $builder->orderByRaw("({$column}) is null");
        $builder->orderByRaw(in_array($field, EntryQuery::TEXT_COLUMNS, true) ? "lower({$column}) {$dir}" : "{$column} {$dir}");
    }

    /** Matching effective values for filtering, sorting and searching; public reads bypass drafts. */
    private function expression(Builder $builder, string $field, bool $working): string
    {
        $grammar = $builder->getGrammar();
        $base = $grammar->wrap(EntryQuery::isColumn($field) ? 'entries.'.$field : 'entries.data->'.str_replace('.', '->', $field));
        if (! $working || (EntryQuery::isColumn($field) && ! in_array($field, ['title', 'slug', 'author_id'], true))) return $base;
        $path = match ($field) {
            'author_id' => 'authorId',
            'title', 'slug' => $field,
            default => 'data->'.str_replace('.', '->', $field),
        };
        $draft = $grammar->wrap('entries.draft->'.$path);
        if ($field === 'author_id') {
            // A working copy always says who the author is; JSON null means nobody.
            return "case when entries.draft is not null then nullif({$draft}, 'null') else {$base} end";
        }

        return "case when entries.draft is not null then {$draft} else {$base} end";
    }

    private function hydrate(object $row): Entry
    {
        return new Entry(
            id: $row->id,
            collection: $row->collection,
            locale: $row->locale,
            slug: $row->slug,
            title: $row->title,
            status: $row->status,
            data: $row->data ? (array) json_decode($row->data, true) : [],
            draft: $row->draft ? (array) json_decode($row->draft, true) : null,
            uri: $row->uri,
            originId: $row->origin_id,
            parentId: $row->parent_id,
            position: (int) $row->position,
            authorId: $row->author_id,
            blueprint: $row->blueprint,
            publishedAt: $row->published_at ? CarbonImmutable::parse($row->published_at) : null,
            expiresAt: $row->expires_at ? CarbonImmutable::parse($row->expires_at) : null,
            createdAt: $row->created_at ? CarbonImmutable::parse($row->created_at) : null,
            updatedAt: $row->updated_at ? CarbonImmutable::parse($row->updated_at) : null,
        );
    }

    private function table(): Builder
    {
        return DB::table('entries');
    }
}

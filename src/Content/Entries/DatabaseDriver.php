<?php

declare(strict_types=1);

namespace Cms\Content\Entries;

use Carbon\CarbonImmutable;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Cms\Content\Collections\Collection;

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
            'live' => $builder->where('status', 'published')->where(fn (Builder $q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now())),
            default => null,
        };

        foreach ($query->wheres as [$field, $operator, $value]) {
            $column = DB::raw($this->expression($builder, $field, $query->working));

            if ($operator === 'contains' && ! EntryQuery::isColumn($field)) {
                $path = '$.'.$field;
                $base = "json_extract(entries.data, '{$path}')";
                $json = $query->working ? "case when entries.draft is not null then json_extract(entries.draft, '$.data.{$field}') else {$base} end" : $base;
                if (DB::connection()->getDriverName() === 'sqlite') {
                    $builder->whereRaw("exists (select 1 from json_each({$json}) where json_each.value = ?)", [$value]);
                } else {
                    $builder->whereRaw("json_contains({$json}, ?)", [json_encode($value, JSON_THROW_ON_ERROR)]);
                }
                continue;
            }
            match ($operator) {
                'in' => $builder->whereIn($column, (array) $value),
                'not in' => $builder->whereNotIn($column, (array) $value),
                'null' => $builder->whereNull($column),
                'not null' => $builder->whereNotNull($column),
                'contains' => $builder->where($column, 'like', '%'.$value.'%'),
                'like' => $builder->where($column, 'like', $value),
                default => $builder->where($column, $operator, $value),
            };
        }

        if ($query->search !== null) {
            $term = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $query->search).'%';
            $title = $this->expression($builder, 'title', $query->working);
            $slug = $this->expression($builder, 'slug', $query->working);
            $data = $query->working ? "case when draft is not null then json_extract(draft, '$.data') else data end" : 'data';
            $builder->where(fn (Builder $q) => $q->whereRaw("{$title} like ? escape '!'", [$term])->orWhereRaw("{$slug} like ? escape '!'", [$term])->orWhereRaw("{$data} like ? escape '!'", [$term]));
        }

        return $builder;
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
            // Old working copies did not store authorship; explicit JSON null clears it.
            $has = DB::connection()->getDriverName() === 'sqlite'
                ? "json_type(entries.draft, '$.authorId') is not null"
                : "json_contains_path(entries.draft, 'one', '$.authorId')";

            return "case when {$has} then nullif({$draft}, 'null') else {$base} end";
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
            createdAt: $row->created_at ? CarbonImmutable::parse($row->created_at) : null,
            updatedAt: $row->updated_at ? CarbonImmutable::parse($row->updated_at) : null,
        );
    }

    private function table(): Builder
    {
        return DB::table('entries');
    }
}

<?php

declare(strict_types=1);

namespace Cms\Content\Entries;

use InvalidArgumentException;

/**
 * Storage-agnostic query description. Drivers translate it to SQL or filter
 * flat-file indexes with identical semantics.
 */
final class EntryQuery
{
    public const array COLUMNS = ['id', 'title', 'slug', 'uri', 'status', 'locale', 'parent_id', 'position', 'author_id', 'origin_id', 'published_at', 'expires_at', 'created_at', 'updated_at'];

    /** Columns compared without regard to case when sorting. */
    public const array TEXT_COLUMNS = ['title', 'slug', 'uri', 'status', 'locale'];

    public const array OPERATORS = ['=', '!=', '<', '>', '<=', '>=', 'like', 'in', 'not in', 'contains', 'null', 'not null'];

    /** @var list<string> */
    public array $collections = [];

    public ?string $locale = null;

    /** "any" | "published" | "draft" | "live" */
    public string $status = 'any';

    /** @var list<array{0: string, 1: string, 2: mixed}> */
    public array $wheres = [];

    /** @var list<array{0: string, 1: string}> */
    public array $orders = [];

    /** @var list<array{id: ?string, field: ?string}> Only entries that name these (see references()); a null id matches nothing. */
    public array $references = [];

    public ?string $search = null;

    public bool $relevance = false;

    /** Admin queries use pending editorial values; public queries use published content. */
    public bool $working = false;

    /** Read past the gate: for admin code that already checked its own permission. */
    public bool $ungated = false;

    public ?int $limit = null;

    public int $offset = 0;

    public function __construct(private readonly EntryRepository $repository) {}

    public function working(): self
    {
        $this->working = true;

        return $this;
    }

    public function ungated(): self
    {
        $this->ungated = true;

        return $this;
    }

    public function collection(string ...$collections): self
    {
        $this->collections = array_values(array_unique([...$this->collections, ...$collections]));

        return $this;
    }

    public function locale(?string $locale): self
    {
        $this->locale = $locale;

        return $this;
    }

    public function status(string $status): self
    {
        if (! in_array($status, ['any', 'published', 'draft', 'live'], true)) {
            throw new InvalidArgumentException(__('Unknown status filter :status.', ['status' => $status]));
        }

        $this->status = $status;

        return $this;
    }

    public function live(): self
    {
        return $this->status('live');
    }

    public function where(string $field, mixed $operator, mixed $value = null): self
    {
        if (func_num_args() === 2) {
            [$operator, $value] = ['=', $operator];
        }

        $operator = strtolower((string) $operator);

        if (! in_array($operator, self::OPERATORS, true)) {
            throw new InvalidArgumentException(__('Unsupported operator :operator.', ['operator' => $operator]));
        }

        if (! preg_match('/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)*$/', $field)) {
            throw new InvalidArgumentException(__('Invalid field :field.', ['field' => $field]));
        }

        $this->wheres[] = [$field, $operator, $value];

        return $this;
    }

    public function whereIn(string $field, array $values): self
    {
        return $this->where($field, 'in', array_values($values));
    }

    public function parent(?string $parentId): self
    {
        return $this->where('parent_id', $parentId === null ? 'null' : '=', $parentId);
    }

    /**
     * Only entries that name this entry: the reverse of a relation. An entry names another when the other's id is
     * anywhere in its data — a relation or terms field at any depth (in a group, in the rows of a repeater or a
     * matrix), a link field, a link or a relation in a block. With `$field`, only inside that field (`author`,
     * `meta.related`, `sections`). An entry never names itself, and an id that is no entry matches nothing.
     *
     * Both drivers look for the id in the stored JSON, so they agree: an id is 26 characters nobody types by chance.
     */
    public function references(string $id, ?string $field = null): self
    {
        if ($field !== null && ! preg_match('/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)*$/', $field)) {
            throw new InvalidArgumentException(__('Invalid field :field.', ['field' => $field]));
        }

        $this->references[] = ['id' => $this->repository->find($id)?->id, 'field' => $field];

        return $this;
    }

    /**
     * How many of this query's entries name each of these entries, in one pass over them: for counts beside a
     * list of terms, where a query per term would be one too many.
     *
     * @param  list<string>  $ids
     * @return array<string, int> id => count, for every id given
     */
    public function referenceCounts(array $ids): array
    {
        $counts = array_fill_keys(array_map('strtolower', $ids), 0);

        if ($counts === []) {
            return [];
        }

        foreach ($this->get() as $entry) {
            $json = strtolower((string) json_encode(($this->working ? $entry->working() : $entry->content())['data']));

            if (preg_match_all('/[0-9a-z]{26}/', $json, $found)) {
                foreach (array_unique($found[0]) as $id) {
                    isset($counts[$id]) && $id !== $entry->id && $counts[$id]++;
                }
            }
        }

        return $counts;
    }

    public function search(?string $term): self
    {
        $this->search = $term !== null && trim($term) !== '' ? trim($term) : null;

        return $this;
    }

    /** Rank title and slug matches before body matches, ahead of ordinary sort fields. */
    public function orderByRelevance(): self
    {
        $this->relevance = true;

        return $this;
    }

    /**
     * Accepts "field" or "-field" (descending). Empty values sort last either way;
     * `author_id` sorts by the author's name.
     */
    public function orderBy(string $field, ?string $direction = null): self
    {
        if ($direction === null && str_starts_with($field, '-')) {
            [$field, $direction] = [substr($field, 1), 'desc'];
        }

        if (! preg_match('/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)*$/', $field)) {
            throw new InvalidArgumentException(__('Invalid sort field :field.', ['field' => $field]));
        }

        $this->orders[] = [$field, strtolower($direction ?? 'asc') === 'desc' ? 'desc' : 'asc'];

        return $this;
    }

    public function limit(?int $limit): self
    {
        $this->limit = $limit === null ? null : max(0, $limit);

        return $this;
    }

    public function offset(int $offset): self
    {
        $this->offset = max(0, $offset);

        return $this;
    }

    /** @return list<Entry> */
    public function get(): array
    {
        return $this->repository->run($this);
    }

    public function first(): ?Entry
    {
        $clone = clone $this;
        $clone->limit = 1;

        return $clone->get()[0] ?? null;
    }

    public function count(): int
    {
        return $this->repository->count($this);
    }

    /** @return array{items: list<Entry>, total: int, page: int, perPage: int, pages: int} */
    public function paginate(int $perPage = 20, int $page = 1): array
    {
        $perPage = max(1, min(200, $perPage));
        $page = max(1, $page);
        $total = $this->count();

        $clone = clone $this;
        $clone->limit = $perPage;
        $clone->offset = ($page - 1) * $perPage;

        return ['items' => $clone->get(), 'total' => $total, 'page' => $page, 'perPage' => $perPage, 'pages' => (int) max(1, ceil($total / $perPage))];
    }

    public static function isColumn(string $field): bool
    {
        return in_array($field, self::COLUMNS, true);
    }
}

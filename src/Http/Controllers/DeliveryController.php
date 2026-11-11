<?php

declare(strict_types=1);

namespace Cms\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Cms\Abilities\AbilityException;
use Cms\Content\Collections\Collection;
use Cms\Content\Entries\Entry;
use Cms\Content\Entries\EntryQuery;
use Cms\Content\Fields\Field;
use Cms\Content\Fields\Types\Entries;
use Cms\Cms;

/**
 * Public, read-only content API for headless use and dynamic front-end features.
 * Only live entries of collections with `api: true` (or routable ones) are served, as this request may read
 * them (see EntryGate): never a draft, never what is for signed-in visitors only.
 *
 *   ?filter[field]=value                 equals; a relation or terms field takes an id or a slug
 *   ?filter[field][ne|lt|lte|gt|gte]=…   compared
 *   ?filter[field][in]=a,b               one of
 *   ?filter[field][contains]=…           a list has it, or a text contains it
 *   ?filter[field][exists]=true|false    has a value, or none
 *   ?sort=-published_at,title            several fields, - for descending
 *   ?fields=title,uri,summary            only these (id always comes with it)
 *   ?expand=author,related.author        relations as entries instead of ids, at most two levels deep
 */
final class DeliveryController
{
    /** What a filter may compare, by the word in the query string. */
    private const array OPERATORS = ['eq' => '=', 'ne' => '!=', 'lt' => '<', 'lte' => '<=', 'gt' => '>', 'gte' => '>=', 'in' => 'in', 'contains' => 'contains', 'exists' => 'exists'];

    /** The columns a visitor may filter and sort by, as the API names them and as they are stored. */
    private const array COLUMNS = ['id' => 'id', 'title' => 'title', 'slug' => 'slug', 'uri' => 'uri', 'parentId' => 'parent_id', 'publishedAt' => 'published_at', 'updatedAt' => 'updated_at', 'position' => 'position'];

    private const array KEYS = ['id', 'collection', 'locale', 'title', 'slug', 'uri', 'data', 'parentId', 'publishedAt', 'updatedAt'];

    private const int EXPAND_DEPTH = 2;

    /** How many entries one answer expands at most, over all its relations and levels. */
    private const int EXPAND_LIMIT = 200;

    public function __construct(private readonly Cms $cms) {}

    public function index(Request $request, string $collection): JsonResponse
    {
        try {
            $collection = $this->collection($collection);
            $locale = $this->locale($request);
            $query = $this->cms->entries()->query()->collection($collection->handle)->locale($locale)->live()->search($request->query('q'));
            $sorts = $this->sorts($request, $collection);
            $filters = $this->filters($request, $collection, $locale);
            $shape = $this->shape($request, $collection);

            // Searching, filtering or sorting on withheld text would reveal it one guess at a time.
            $onData = array_filter([...array_column($filters, 0), ...array_column($sorts, 0)], static fn (string $field) => ! EntryQuery::isColumn($field));

            if ($request->filled('q') || $request->filled('references') || $onData !== []) {
                ($teasers = $this->cms->entries()->gate()->teaserIds()) && $query->where('id', 'not in', $teasers);
            }

            foreach ($filters as [$field, $operator, $value]) {
                $query->where($field, $operator, $value);
            }

            // The reverse of a relation: entries that name this one. An entry this reader may not read matches nothing.
            if (is_string($id = $request->query('references')) && $id !== '') {
                $target = $this->cms->entries()->query()->live()->where('id', strtolower($id))->first();
                $field = $request->query('references_field');
                $query->references($target && $target->gated !== 'locked' ? $target->id : '', is_string($field) && preg_match('/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)*$/', $field) ? $field : null);
            }

            foreach ($sorts as [$field, $direction]) {
                $query->orderBy($field, $direction);
            }

            $page = $query->paginate($this->number($request, 'limit', $collection->perPage, 200), $this->number($request, 'page', 1, PHP_INT_MAX));

            // A page past the last one is no page: said, not answered with an empty list.
            if ($page['page'] > $page['pages']) {
                throw $this->refused("There is no page {$page['page']}: the last one is {$page['pages']}.", ['page' => 'Out of range.']);
            }

            $link = static fn (?int $number) => $number === null ? null : $request->fullUrlWithQuery(['page' => $number]);

            return response()->json([
                'data' => $this->shaped($page['items'], $shape),
                'meta' => [
                    ...array_diff_key($page, ['items' => 1]),
                    'count' => count($page['items']),
                    'from' => $page['items'] === [] ? null : ($page['page'] - 1) * $page['perPage'] + 1,
                    'to' => $page['items'] === [] ? null : ($page['page'] - 1) * $page['perPage'] + count($page['items']),
                    'hasMore' => $page['page'] < $page['pages'],
                ],
                'links' => [
                    'self' => $link($page['page']),
                    'first' => $link(1),
                    'prev' => $link($page['page'] > 1 ? $page['page'] - 1 : null),
                    'next' => $link($page['page'] < $page['pages'] ? $page['page'] + 1 : null),
                    'last' => $link($page['pages']),
                ],
            ])->setPublic()->setMaxAge(60);
        } catch (AbilityException $e) {
            return response()->json(['error' => $e->toArray()], $e->status());
        }
    }

    public function show(Request $request, string $collection, string $slug): JsonResponse
    {
        try {
            $collection = $this->collection($collection);
            $shape = $this->shape($request, $collection);
            $entry = $this->cms->entries()->query()->collection($collection->handle)->locale($this->locale($request))->live()->where('slug', $slug)->first();

            abort_if($entry === null, 404);

            return response()->json(['data' => $this->shaped([$entry], $shape)[0]])->setPublic()->setMaxAge(60);
        } catch (AbilityException $e) {
            return response()->json(['error' => $e->toArray()], $e->status());
        }
    }

    private function collection(string $handle): Collection
    {
        $collection = $this->cms->collections()->find($handle);

        abort_if($collection === null || ! $this->served($collection), 404);

        return $collection;
    }

    /** A query the API cannot answer, said in English like the rest of what developers read: 422 with the part at fault. */
    private function refused(string $message, array $details = []): AbilityException
    {
        return AbilityException::invalid($message, $details);
    }

    /** A whole number from the query string, between 1 and `$max`; anything else is refused. */
    private function number(Request $request, string $name, int $default, int $max): int
    {
        $value = $request->query($name, (string) $default);

        if (! is_string($value) || ! preg_match('/^[1-9][0-9]{0,8}$/', $value) || (int) $value > $max) {
            throw $this->refused("`{$name}` is a whole number from 1".($max < PHP_INT_MAX ? " to {$max}" : '').'.', [$name => 'Out of range.']);
        }

        return (int) $value;
    }

    private function served(Collection $collection): bool
    {
        return (bool) $collection->get('api', $collection->routable());
    }

    private function locale(Request $request): string
    {
        $locale = (string) $request->query('locale', $this->cms->defaultLocale());

        return in_array($locale, $this->cms->locales(), true) ? $locale : $this->cms->defaultLocale();
    }

    /**
     * `filter[field]=value` and `filter[field][operator]=value`, as the query takes them.
     *
     * @return list<array{0: string, 1: string, 2: mixed}>
     */
    private function filters(Request $request, Collection $collection, string $locale): array
    {
        $filters = $request->query('filter', []);

        if (! is_array($filters)) {
            throw $this->refused('`filter` is given per field: filter[field]=value or filter[field][operator]=value.');
        }

        $relations = $collection->relations();
        $out = [];

        foreach ($filters as $name => $conditions) {
            $field = $this->field((string) $name, $collection);

            foreach (is_array($conditions) ? $conditions : ['eq' => $conditions] as $word => $value) {
                $operator = self::OPERATORS[$word] ?? null;

                if ($operator === null || ! is_scalar($value)) {
                    throw $this->refused("Unknown filter on {$name}. Use one of: ".implode(', ', array_keys(self::OPERATORS)).'.', ["filter.{$name}" => 'Not a filter.']);
                }

                $value = (string) $value;

                if ($operator === 'exists') {
                    $out[] = [$field, in_array(strtolower($value), ['0', 'false', 'no', ''], true) ? 'null' : 'not null', null];

                    continue;
                }

                $kind = $this->kind($collection, $field);
                $cast = fn (string $one): mixed => isset($relations[$field]) ? $this->related($relations[$field], $one, $locale) : match (true) {
                    $kind === 'number' && is_numeric($one) => $one + 0,
                    $kind === 'switch' => in_array(strtolower($one), ['1', 'true', 'yes', 'on'], true),
                    default => $one,
                };

                // Only a list can have a value in it, and only a text a part: a number or a place has neither.
                if ($operator === 'contains' && ! isset($relations[$field]) && ! in_array($kind, ['list', 'text'], true)) {
                    throw $this->refused("`contains` asks a list for a value or a text for a part of it: “{$name}” is neither.", ["filter.{$name}" => 'Not a list or a text.']);
                }

                // A relation holds a list of ids: "is" means "has", "is not" means "has not" cannot be asked of a list.
                if (isset($relations[$field]) && ! in_array($operator, ['=', 'contains'], true)) {
                    throw $this->refused("A relation is filtered by what it names: filter[{$name}]=<slug or id>.", ["filter.{$name}" => 'Not a filter for a relation.']);
                }

                $out[] = match (true) {
                    isset($relations[$field]) => [$field, 'contains', $cast($value)],
                    $operator === 'in' => [$field, 'in', array_map($cast, array_values(array_filter(array_map('trim', explode(',', $value)), static fn (string $v) => $v !== '')))],
                    default => [$field, $operator, $cast($value)],
                };
            }
        }

        return $out;
    }

    /** @return list<array{0: string, 1: string}> `sort=-published_at,title`: the collection's own order without it. */
    private function sorts(Request $request, Collection $collection): array
    {
        $sort = $request->query('sort');
        $given = is_string($sort) && trim($sort) !== '';
        $out = [];

        foreach (array_filter(array_map('trim', explode(',', $given ? $sort : $collection->sort)), static fn (string $s) => $s !== '') as $one) {
            $descending = str_starts_with($one, '-');
            // The collection's own order is the site's to choose; a visitor's is held to what a visitor may read.
            $out[] = [$given ? $this->field(ltrim($one, '-'), $collection) : ltrim($one, '-'), $descending ? 'desc' : 'asc'];
        }

        return $out;
    }

    /**
     * A name from the query string as the query knows it: a column a visitor may see (camelCase or as stored),
     * or a field of the collection, with what is inside it after a dot.
     */
    private function field(string $name, Collection $collection): string
    {
        $name = str_starts_with($name, 'data.') ? substr($name, 5) : $name;

        if (isset(self::COLUMNS[$name]) || in_array($name, self::COLUMNS, true)) {
            return self::COLUMNS[$name] ?? $name;
        }

        if (preg_match('/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)*$/', $name) && $collection->field(explode('.', $name)[0]) !== null) {
            return $name;
        }

        throw $this->refused("“{$name}” is not a field of {$collection->handle}.", [$name => 'Not a field.']);
    }

    /**
     * What a field holds, as far as a filter needs to know: `number`, `switch`, `text`, `list` or `other`. A path
     * goes into a group's fields and a place's latitude, longitude and address.
     */
    private function kind(Collection $collection, string $field): string
    {
        if (EntryQuery::isColumn($field)) {
            return $field === 'position' ? 'number' : 'text';
        }

        $segments = explode('.', $field);
        $definition = $collection->field(array_shift($segments));

        while ($definition && $segments !== []) {
            $segment = array_shift($segments);

            if ($definition->type === 'geo' && $segments === []) {
                return in_array($segment, ['lat', 'lng'], true) ? 'number' : ($segment === 'address' ? 'text' : 'other');
            }

            if ($definition->type === 'date-range' && $segments === []) {
                return in_array($segment, ['start', 'end'], true) ? 'text' : 'other';
            }

            $definition = $definition->type === 'group' ? \Cms\Content\Fields\Blueprint::make((array) $definition->get('fields', []))->field($segment) : null;
        }

        return match (true) {
            $definition === null => 'other',
            in_array($definition->type, ['number', 'range'], true) => 'number',
            $definition->type === 'toggle' => 'switch',
            in_array($definition->type, ['tags', 'entries', 'terms', 'users', 'media', 'file'], true), $definition->type === 'select' && $definition->get('multiple') => 'list',
            in_array($definition->type, ['text', 'textarea', 'markdown', 'richtext', 'slug', 'url', 'email', 'code', 'select', 'color', 'date', 'time', 'icon'], true) => 'text',
            default => 'other',
        };
    }

    /** The id a relation filter means: the value itself, or the published entry of the field's collections with that slug. */
    private function related(Field $field, string $value, string $locale): string
    {
        if (preg_match('/^[0-9a-z]{26}$/i', $value)) {
            return strtolower($value);
        }

        $type = $this->cms->fields()->resolve($field->type);
        $handles = $type instanceof Entries ? $type->collections($field) : [];
        $query = $this->cms->entries()->query()->live()->locale($locale)->where('slug', $value);

        return ($handles === [] ? $query : $query->collection(...$handles))->first()?->id ?? '';
    }

    /**
     * What an answer has of each entry: `fields` (null: everything) and `expand` as a tree of relation fields.
     *
     * @return array{fields: ?list<string>, expand: array<string, array>}
     */
    private function shape(Request $request, Collection $collection): array
    {
        $list = static fn (mixed $value): array => is_string($value) ? array_values(array_filter(array_map('trim', explode(',', $value)), static fn (string $v) => $v !== '')) : [];
        $fields = null;

        foreach ($list($request->query('fields')) as $name) {
            $name = str_starts_with($name, 'data.') ? substr($name, 5) : $name;

            if (! in_array($name, self::KEYS, true) && $collection->field($name) === null) {
                throw $this->refused("“{$name}” is not a field of {$collection->handle}.", ['fields' => 'Not a field.']);
            }

            $fields[] = $name;
        }

        $expand = [];
        $anywhere = [];

        foreach ($this->cms->collections()->all() as $other) {
            $this->served($other) && $anywhere += $other->relations();
        }

        foreach ($list($request->query('expand')) as $path) {
            // The first relation is one of this collection's (a group's as group.field); what follows it is one of the entries it names.
            $segments = explode('.', $path);
            $first = null;

            for ($take = count($segments); $take > 0 && $first === null; $take--) {
                isset($collection->relations()[$candidate = implode('.', array_slice($segments, 0, $take))]) && $first = $candidate;
            }

            if ($first === null) {
                throw $this->refused("“{$path}” is not a relation of {$collection->handle}.", ['expand' => 'Not a relation.']);
            }

            $rest = $first === $path ? null : substr($path, strlen($first) + 1);

            if ($rest !== null && ! isset($anywhere[$rest])) {
                throw $this->refused("“{$rest}” is not a relation of what “{$first}” names; relations are expanded at most ".self::EXPAND_DEPTH.' levels deep.', ['expand' => 'Not a relation, or too deep.']);
            }

            $expand[$first] ??= [];
            $rest === null || $expand[$first][$rest] = [];
        }

        return ['fields' => $fields, 'expand' => $expand];
    }

    /**
     * Entries as asked for: their relations expanded, then each cut down to the fields named.
     *
     * @param  list<Entry>  $entries
     * @return list<array<string, mixed>>
     */
    private function shaped(array $entries, array $shape): array
    {
        $budget = self::EXPAND_LIMIT;
        $presented = $this->expand(array_map($this->present(...), $entries), $entries, $shape['expand'], $budget);

        if ($shape['fields'] === null) {
            return $presented;
        }

        return array_map(static function (array $present) use ($shape): array {
            $out = ['id' => $present['id']];
            $data = [];

            foreach ($shape['fields'] as $name) {
                if (in_array($name, self::KEYS, true) && $name !== 'data') {
                    $out[$name] = $present[$name];
                } elseif ($name === 'data') {
                    $data = $present['data'];
                } elseif (array_key_exists($name, $present['data'])) {
                    $data[$name] = $present['data'][$name];
                }
            }

            return [...$out, ...($data !== [] || in_array('data', $shape['fields'], true) ? ['data' => (object) $data] : []), ...(isset($present['gated']) ? ['gated' => true] : [])];
        }, $presented);
    }

    /**
     * Relation fields named in `expand`, as the entries they name: only those this request may read, of
     * collections the API serves, each as the API presents it. Anything else stays out; an unexpanded
     * relation stays a list of ids. Every level is one lookup for all the entries of the answer, and the
     * answer expands no more than EXPAND_LIMIT entries in all.
     *
     * @param  list<array<string, mixed>>  $presented
     * @param  list<Entry>  $entries  The entries `$presented` are of, in the same order.
     * @param  array<string, array>  $tree
     * @return list<array<string, mixed>>
     */
    private function expand(array $presented, array $entries, array $tree, int &$budget): array
    {
        if ($tree === [] || $presented === []) {
            return $presented;
        }

        // What each entry names under each path, for those whose collection has that relation.
        $named = [];
        $ids = [];

        foreach ($presented as $i => $present) {
            $relations = $entries[$i]->collection()->relations();

            foreach (array_keys($tree) as $path) {
                $value = isset($relations[$path]) ? data_get($present['data'], $path) : null;

                if (is_array($value)) {
                    $named[$i][$path] = array_values(array_filter($value, 'is_string'));
                    $ids += array_flip($named[$i][$path]);
                }
            }
        }

        $gate = $this->cms->entries()->gate();
        $hidden = array_flip($gate->hiddenIds());
        $found = [];

        foreach ($ids === [] ? [] : $this->cms->entries()->findMany(array_map('strval', array_keys($ids))) as $other) {
            if ($other->isLive() && ! isset($hidden[$other->id]) && $this->served($other->collection())) {
                $view = $gate->view($other);
                $view->gated === 'locked' || $found[$other->id] = $view;
            }
        }

        if (($budget -= count($found)) < 0) {
            throw $this->refused('This would expand more than '.self::EXPAND_LIMIT.' entries. Ask for fewer entries per page or fewer relations.', ['expand' => 'Too many entries.']);
        }

        foreach ($tree as $path => $deeper) {
            // The entries named under this path, each once, with their own relations expanded in one go.
            $under = array_values(array_intersect_key($found, array_flip(array_merge([], ...array_map(static fn (array $paths) => $paths[$path] ?? [], $named)))));
            $expanded = array_combine(
                array_map(static fn (Entry $e) => $e->id, $under),
                $this->expand(array_map($this->present(...), $under), $under, $deeper, $budget),
            );

            foreach ($named as $i => $paths) {
                if (isset($paths[$path])) {
                    $data = $presented[$i]['data'];
                    data_set($data, $path, array_values(array_filter(array_map(static fn (string $id) => $expanded[$id] ?? null, $paths[$path]))));
                    $presented[$i]['data'] = $data;
                }
            }
        }

        return $presented;
    }

    private function present(Entry $entry): array
    {
        $public = $entry->toArray(withDraft: false);

        $present = array_intersect_key($public, array_flip(self::KEYS));

        return $entry->gated === 'teaser' ? [...$present, 'gated' => true] : $present;
    }
}

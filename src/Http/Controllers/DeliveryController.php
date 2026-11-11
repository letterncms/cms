<?php

declare(strict_types=1);

namespace Cms\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Cms\Content\Collections\Collection;
use Cms\Content\Entries\EntryQuery;
use Cms\Cms;

/**
 * Public, read-only content API for headless use and dynamic front-end features.
 * Only live entries of collections with `api: true` (or routable ones) are served.
 */
final class DeliveryController
{
    public function __construct(private readonly Cms $cms) {}

    public function index(Request $request, string $collection): JsonResponse
    {
        $collection = $this->collection($collection);
        $locale = $this->locale($request);

        $query = $this->cms->entries()->query()->collection($collection->handle)->locale($locale)->live()->search($request->query('q'));
        $sort = ltrim((string) $request->query('sort', $collection->sort), '-');

        // Searching, filtering or sorting on withheld text would reveal it one guess at a time.
        if ($request->filled('q') || $request->query('filter') || $request->filled('references') || ! EntryQuery::isColumn($sort)) {
            ($teasers = $this->cms->entries()->gate()->teaserIds()) && $query->where('id', 'not in', $teasers);
        }

        $relations = $collection->blueprint()->relations();

        foreach ((array) $request->query('filter', []) as $field => $value) {
            if (! is_string($field) || ! is_scalar($value)) {
                continue;
            }

            // A relation holds ids: filter[topics]=news finds the entries filed under the term with that slug (or id).
            if (isset($relations[$field])) {
                $query->where($field, 'contains', $this->related($relations[$field], (string) $value, $locale));

                continue;
            }

            $query->where($field, (string) $value);
        }

        // The reverse of a relation: entries that name this one. An entry this reader may not read matches nothing.
        if (is_string($id = $request->query('references')) && $id !== '') {
            $target = $this->cms->entries()->query()->live()->where('id', strtolower($id))->first();
            $field = $request->query('references_field');
            $query->references($target && $target->gated !== 'locked' ? $target->id : '', is_string($field) && preg_match('/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)*$/', $field) ? $field : null);
        }

        $query->orderBy((string) $request->query('sort', $collection->sort));
        $page = $query->paginate((int) $request->query('limit', $collection->perPage), (int) $request->query('page', 1));

        return response()->json([
            'data' => array_map(fn ($e) => $this->present($e), $page['items']),
            'meta' => array_diff_key($page, ['items' => 1]),
        ])->setPublic()->setMaxAge(60);
    }

    public function show(Request $request, string $collection, string $slug): JsonResponse
    {
        $collection = $this->collection($collection);
        $entry = $this->cms->entries()->query()->collection($collection->handle)->locale($this->locale($request))->live()->where('slug', $slug)->first();

        abort_if($entry === null, 404);

        return response()->json(['data' => $this->present($entry)])->setPublic()->setMaxAge(60);
    }

    private function collection(string $handle): Collection
    {
        $collection = $this->cms->collections()->find($handle);

        abort_if($collection === null || ! ($collection->get('api', $collection->routable())), 404);

        return $collection;
    }

    /** The id a relation filter means: the value itself, or the published entry of the field's collections with that slug. */
    private function related(\Cms\Content\Fields\Field $field, string $value, string $locale): string
    {
        if (preg_match('/^[0-9a-z]{26}$/i', $value)) {
            return strtolower($value);
        }

        $type = $this->cms->fields()->resolve($field->type);
        $handles = $type instanceof \Cms\Content\Fields\Types\Entries ? $type->collections($field) : [];
        $query = $this->cms->entries()->query()->live()->locale($locale)->where('slug', $value);

        return ($handles === [] ? $query : $query->collection(...$handles))->first()?->id ?? '';
    }

    private function locale(Request $request): string
    {
        $locale = (string) $request->query('locale', $this->cms->defaultLocale());

        return in_array($locale, $this->cms->locales(), true) ? $locale : $this->cms->defaultLocale();
    }

    private function present($entry): array
    {
        $public = $entry->toArray(withDraft: false);

        $present = array_intersect_key($public, array_flip(['id', 'collection', 'locale', 'title', 'slug', 'uri', 'data', 'parentId', 'publishedAt', 'updatedAt']));

        return $entry->gated === 'teaser' ? [...$present, 'gated' => true] : $present;
    }
}

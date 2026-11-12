<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Entries\EntryRepository;
use Cms\Content\Entries\EntryService;
use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

/** Relation to entries in one or more collections (stores ids). */
class Entries extends FieldType
{
    public function key(): string { return 'entries'; }

    public function label(): string { return __('Entries'); }

    public function icon(): string { return 'relation'; }

    public function description(): string { return __('Link to other entries.'); }

    public function group(): string { return __('Relations'); }

    public function schema(Field $field): array
    {
        return array_filter([
            'type' => 'array',
            'items' => ['type' => 'string', 'format' => 'ulid'],
            'maxItems' => $field->get('max'),
            'description' => $field->description().' (entry ids'.($field->get('collections') ? ' from: '.implode(', ', (array) $field->get('collections')) : '').')',
        ], static fn ($v) => $v !== null);
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        return array_values(array_unique(array_map(static fn (string $id) => preg_match('/^[0-9a-z]{26}$/i', $id) ? strtolower($id) : $id, array_filter((array) $value, 'is_string'))));
    }

    /** Every id is an entry, of a collection this field takes. */
    public function check(mixed $value, Field $field, mixed $previous = null): array
    {
        $ids = array_values(array_filter((array) $value, 'is_string'));
        $new = array_diff($ids, array_filter((array) $previous, 'is_string'));

        if ($new === []) {
            return [];
        }

        $found = app(EntryService::class)->known(array_values($new));

        $allowed = $this->collections($field);
        $errors = [];

        foreach ($new as $i => $id) {
            if (! isset($found[$id])) {
                $errors[(string) $i] = __('This entry does not exist.');
            } elseif ($allowed !== [] && ! in_array($found[$id], $allowed, true)) {
                $errors[(string) $i] = __('Must be an entry of: :collections.', ['collections' => implode(', ', $allowed)]);
            }
        }

        return $errors;
    }

    /** @return list<string> The collections this field takes entries of; none means any. */
    public function collections(Field $field): array
    {
        return array_values(array_filter((array) $field->get('collections'), 'is_string'));
    }

    public function defaultValue(Field $field): mixed
    {
        return [];
    }

    public function augment(mixed $value, Field $field): mixed
    {
        $ids = (array) $value;

        if ($ids === []) {
            return [];
        }

        $entries = app(EntryRepository::class)->findMany($ids);
        $gate = app(EntryRepository::class)->gate();
        $hidden = array_flip($gate->hiddenIds());
        $entries = array_map($gate->view(...), array_filter($entries, static fn ($e) => $e->isLive() && ! isset($hidden[$e->id])));

        return (int) $field->get('max') === 1 ? (array_values($entries)[0] ?? null) : array_values($entries);
    }

    public function configFields(): array
    {
        return [
            ['handle' => 'collections', 'type' => 'select', 'label' => 'Collections', 'multiple' => true, 'options' => array_map(
                static fn ($c) => $c->title,
                app(\Cms\Content\Collections\CollectionRepository::class)->all()
            )],
            ['handle' => 'max', 'type' => 'number', 'label' => 'Maximum'],
        ];
    }
}

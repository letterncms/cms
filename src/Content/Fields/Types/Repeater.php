<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;

/** An ordered list of items, each with the same nested fields. */
class Repeater extends Group
{
    public function key(): string { return 'repeater'; }

    public function label(): string { return __('Repeater'); }

    public function description(): string { return __('A list of items that share the same nested fields.'); }

    public function icon(): string { return 'list'; }

    public function schema(Field $field): array
    {
        return array_filter([
            'type' => 'array',
            'items' => $this->blueprint($field)->schema(),
            'maxItems' => $field->get('max'),
            'description' => $field->instructions ?: $field->label,
        ], static fn ($v) => $v !== null);
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        $blueprint = $this->blueprint($field);

        return array_values(array_map(static fn ($item) => $blueprint->normalize((array) $item), array_filter((array) $value, 'is_array')));
    }

    public function defaultValue(Field $field): mixed
    {
        return [];
    }

    /** Rows move, so what any row named before passes in every row. */
    public function check(mixed $value, Field $field, mixed $previous = null): array
    {
        $blueprint = $this->blueprint($field);
        $before = [];

        foreach (array_filter((array) $previous, 'is_array') as $row) {
            foreach ($row as $handle => $stored) {
                $before[$handle] = is_array($stored) && is_array($before[$handle] ?? []) ? [...($before[$handle] ?? []), ...array_values($stored)] : $stored;
            }
        }

        $errors = [];

        foreach (array_values((array) $value) as $i => $row) {
            foreach ($blueprint->violations((array) $row, $before) as $path => $message) {
                $errors[$i.'.'.$path] = $message;
            }
        }

        return $errors;
    }

    public function augment(mixed $value, Field $field): mixed
    {
        $blueprint = $this->blueprint($field);

        return array_map(static fn ($item) => $blueprint->augment((array) $item), (array) $value);
    }

    public function toText(mixed $value, Field $field): string
    {
        $blueprint = $this->blueprint($field);

        return implode(' ', array_map(static fn ($item) => $blueprint->toText((array) $item), (array) $value));
    }

    public function configFields(): array
    {
        return [...parent::configFields(), ['handle' => 'max', 'type' => 'number', 'label' => 'Maximum Items']];
    }
}

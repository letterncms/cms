<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use InvalidArgumentException;
use Cms\Content\Fields\Blueprint;
use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

/**
 * An ordered list of rows of several kinds, each kind with fields of its own:
 *
 *   types:
 *     - { handle: quote, label: Quote, fields: [{ handle: text, type: textarea, required: true }] }
 *     - { handle: gallery, label: Gallery, fields: [{ handle: images, type: media }] }
 *
 * A row is its fields' values and `type`, the handle of its kind: `{type: quote, text: …}`.
 */
class Matrix extends FieldType
{
    public function key(): string { return 'matrix'; }

    public function label(): string { return __('Matrix'); }

    public function description(): string { return __('A list of rows of several kinds, each with fields of its own.'); }

    public function icon(): string { return 'list'; }

    public function group(): string { return __('Structure'); }

    public function schema(Field $field): array
    {
        $kinds = $this->kinds($field);
        // For agents, so in English like every schema.
        $about = 'The kind of row: '.implode(', ', array_map(static fn (string $handle, array $kind) => $handle.' ('.$kind['label'].')', array_keys($kinds), $kinds)).'.';
        $row = [
            'type' => 'object',
            'properties' => ['type' => ['type' => 'string', 'enum' => array_keys($kinds), 'description' => $about]],
            'required' => ['type'],
            // One entry per kind: a row is held against the fields of its own kind, and errors name them (rows.1.text).
            'allOf' => array_values(array_map(static fn (string $handle, array $kind) => [
                'if' => ['properties' => ['type' => ['const' => $handle]], 'required' => ['type']],
                'then' => $kind['blueprint']->schema(),
            ], array_keys($kinds), $kinds)),
        ];

        return array_filter([
            'type' => 'array',
            'items' => $row,
            'maxItems' => $field->get('max'),
            'description' => $field->description(),
        ], static fn ($v) => $v !== null);
    }

    /** Rows of a known kind are cleaned by their fields, `type` first; anything else is left for validation to refuse. */
    public function normalize(mixed $value, Field $field): mixed
    {
        $kinds = $this->kinds($field);

        return array_values(array_map(static function (array $row) use ($kinds): array {
            $kind = is_string($row['type'] ?? null) ? ($kinds[$row['type']] ?? null) : null;

            return $kind ? ['type' => $row['type'], ...$kind['blueprint']->normalize(array_diff_key($row, ['type' => 1]))] : $row;
        }, array_filter((array) $value, 'is_array')));
    }

    public function defaultValue(Field $field): mixed
    {
        return [];
    }

    /** Rows move, so what any row of a kind named before passes in every row of that kind. */
    public function check(mixed $value, Field $field, mixed $previous = null): array
    {
        $kinds = $this->kinds($field);
        $before = [];

        foreach (array_filter((array) $previous, 'is_array') as $row) {
            foreach ($row as $handle => $stored) {
                $known = $before[$row['type'] ?? ''][$handle] ?? [];
                $before[$row['type'] ?? ''][$handle] = is_array($stored) && is_array($known) ? [...$known, ...array_values($stored)] : $stored;
            }
        }

        $errors = [];

        foreach (array_values((array) $value) as $i => $row) {
            $kind = $kinds[$row['type'] ?? ''] ?? null;

            foreach ($kind ? $kind['blueprint']->violations((array) $row, $before[$row['type']] ?? []) : [] as $path => $message) {
                $errors[$i.'.'.$path] = $message;
            }
        }

        return $errors;
    }

    public function augment(mixed $value, Field $field): mixed
    {
        $kinds = $this->kinds($field);

        return array_values(array_map(
            static fn (array $row) => isset($kinds[$row['type'] ?? '']) ? ['type' => $row['type'], ...$kinds[$row['type']]['blueprint']->augment($row)] : $row,
            array_filter((array) $value, 'is_array'),
        ));
    }

    /** Each row through the fields of its kind: a blocks field inside a row has maps that can be empty too. */
    public function export(mixed $value, Field $field): mixed
    {
        if (! is_array($value)) {
            return $value;
        }

        $kinds = $this->kinds($field);

        return array_map(static fn ($row) => is_array($row) && isset($kinds[$row['type'] ?? '']) ? $kinds[$row['type']]['blueprint']->export($row) : $row, $value);
    }

    public function toText(mixed $value, Field $field): string
    {
        $kinds = $this->kinds($field);

        return trim(implode(' ', array_map(
            static fn (array $row) => isset($kinds[$row['type'] ?? '']) ? $kinds[$row['type']]['blueprint']->toText($row) : '',
            array_filter((array) $value, 'is_array'),
        )));
    }

    /**
     * Checked when a definition is saved: every kind has a handle of its own and fields that are valid themselves.
     * `type` is the row's kind, so no field can be called that.
     */
    public function validateDefinition(Field $field, string $name, int $depth): void
    {
        $kinds = $field->get('types');

        if (! is_array($kinds) || ! array_is_list($kinds) || $kinds === []) {
            throw new InvalidArgumentException(__('The row types of :field must be a list with at least one type.', ['field' => $name]));
        }

        $seen = [];

        foreach ($kinds as $kind) {
            $handle = is_array($kind) ? ($kind['handle'] ?? null) : null;

            if (! is_string($handle) || ! preg_match('/^[a-z][a-z0-9_]{0,63}$/', $handle) || isset($seen[$handle])) {
                throw new InvalidArgumentException(__('Every row type of :field needs a handle of its own: lowercase letters, digits and underscores.', ['field' => $name]));
            }

            $seen[$handle] = true;
            $fields = $kind['fields'] ?? [];

            if (! is_array($fields) || ! array_is_list($fields)) {
                throw new InvalidArgumentException(__('The sub-fields of :field must be a list.', ['field' => $name.'.'.$handle]));
            }

            if (in_array('type', array_column(array_filter($fields, 'is_array'), 'handle'), true)) {
                throw new InvalidArgumentException(__('A field of a row type cannot be called “type”: that is the row’s type (:field).', ['field' => $name.'.'.$handle]));
            }

            Blueprint::validate($fields, $name.'.'.$handle.'.', $depth + 1);
        }
    }

    public function configFields(): array
    {
        return [
            ['handle' => 'types', 'type' => 'json', 'component' => 'matrix-types', 'label' => 'Row Types'],
            ['handle' => 'max', 'type' => 'number', 'label' => 'Maximum Items'],
        ];
    }

    /** @return array<string, array{label: string, blueprint: Blueprint}> The kinds of row by handle. */
    private function kinds(Field $field): array
    {
        $out = [];

        foreach (array_filter((array) $field->get('types', []), 'is_array') as $kind) {
            if (is_string($handle = $kind['handle'] ?? null) && $handle !== '') {
                $out[$handle] = ['label' => (string) ($kind['label'] ?? ucfirst(str_replace('_', ' ', $handle))), 'blueprint' => Blueprint::make((array) ($kind['fields'] ?? []))];
            }
        }

        return $out;
    }
}

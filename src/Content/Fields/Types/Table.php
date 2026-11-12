<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

/**
 * Rows of text cells: `[["Plan", "Price"], ["Solo", "€9"]]`, every row as wide as the widest. With `header`
 * (on unless set to false) the first row is the head of the table.
 */
class Table extends FieldType
{
    private const int COLUMNS = 20;

    public function key(): string { return 'table'; }

    public function label(): string { return __('Table'); }

    public function description(): string { return __('Rows and columns of text.'); }

    public function icon(): string { return 'table'; }

    public function group(): string { return __('Structure'); }

    public function schema(Field $field): array
    {
        return [
            'type' => 'array',
            'items' => ['type' => 'array', 'items' => ['type' => 'string', 'maxLength' => 2000], 'maxItems' => self::COLUMNS],
            'maxItems' => (int) $field->get('max', 500),
            'description' => $field->description().' — rows of text cells'.($this->header($field) ? ', the first row is the header' : ''),
        ];
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        if (! is_array($value)) {
            return $value === null || $value === '' ? [] : $value;
        }

        $rows = array_values(array_map(
            static fn (array $row) => array_map(static fn (mixed $cell) => is_scalar($cell) || $cell === null ? trim((string) $cell) : $cell, array_values($row)),
            array_filter($value, 'is_array'),
        ));
        $width = $rows === [] ? 0 : max(array_map('count', $rows));

        return array_map(static fn (array $row) => array_pad($row, $width, ''), $rows);
    }

    public function defaultValue(Field $field): mixed
    {
        return [];
    }

    /** For templates: `{header: [cells], rows: [[cells]]}`. */
    public function augment(mixed $value, Field $field): mixed
    {
        $rows = array_values(array_filter((array) $value, 'is_array'));

        return $this->header($field) ? ['header' => $rows[0] ?? [], 'rows' => array_slice($rows, 1)] : ['header' => [], 'rows' => $rows];
    }

    public function toText(mixed $value, Field $field): string
    {
        return trim(implode(' ', array_filter(array_merge(...array_values(array_filter((array) $value, 'is_array')) ?: [[]]), static fn ($cell) => is_string($cell) && $cell !== '')));
    }

    public function configFields(): array
    {
        return [
            ['handle' => 'header', 'type' => 'toggle', 'label' => 'First Row Is a Header', 'default' => true],
            ['handle' => 'max', 'type' => 'number', 'label' => 'Maximum Rows'],
        ];
    }

    private function header(Field $field): bool
    {
        return (bool) $field->get('header', true);
    }
}

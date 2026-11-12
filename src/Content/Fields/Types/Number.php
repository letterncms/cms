<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

class Number extends FieldType
{
    public function key(): string { return 'number'; }

    public function label(): string { return __('Number'); }

    public function description(): string { return __('A whole or decimal number with optional limits.'); }

    public function icon(): string { return 'number'; }

    public function schema(Field $field): array
    {
        return $this->nullable(array_filter([
            'type' => $field->get('decimals') ? 'number' : 'integer',
            'minimum' => $field->get('min'),
            'maximum' => $field->get('max'),
            'description' => $field->description(),
        ], static fn ($v) => $v !== null), $field);
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        if ($value === '' || $value === null) {
            return null;
        }

        return is_numeric($value) ? ($field->get('decimals') ? (float) $value : (int) $value) : $value;
    }

    public function configFields(): array
    {
        return [
            ['handle' => 'min', 'type' => 'number', 'label' => 'Minimum'],
            ['handle' => 'max', 'type' => 'number', 'label' => 'Maximum'],
            ['handle' => 'decimals', 'type' => 'toggle', 'label' => 'Allow Decimals'],
        ];
    }
}

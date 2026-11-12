<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

class Text extends FieldType
{
    public function key(): string { return 'text'; }

    public function label(): string { return __('Text'); }

    public function icon(): string { return 'text'; }

    public function description(): string { return __('A single line of plain text.'); }

    public function schema(Field $field): array
    {
        return $this->nullable(array_filter([
            'type' => 'string',
            'maxLength' => (int) $field->get('max', 500),
            'minLength' => $field->get('min'),
            'description' => $field->description(),
        ], static fn ($v) => $v !== null), $field);
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        // Plain text is stored verbatim (minus control characters) and escaped when rendered.
        return is_string($value) ? trim((string) preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value)) : $value;
    }

    public function configFields(): array
    {
        return [
            ['handle' => 'placeholder', 'type' => 'text', 'label' => 'Placeholder'],
            ['handle' => 'max', 'type' => 'number', 'label' => 'Max Length', 'default' => 500],
        ];
    }
}

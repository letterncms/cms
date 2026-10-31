<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;

class Textarea extends Text
{
    public function key(): string { return 'textarea'; }

    public function label(): string { return __('Textarea'); }

    public function icon(): string { return 'paragraph'; }

    public function description(): string { return __('Multiple lines of plain text.'); }

    public function schema(Field $field): array
    {
        return $this->nullable(['type' => 'string', 'maxLength' => (int) $field->get('max', 20000), 'description' => $field->instructions ?: $field->label], $field);
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        return is_string($value) ? trim((string) preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', str_replace("\r\n", "\n", $value))) : $value;
    }

    public function configFields(): array
    {
        return [
            ['handle' => 'placeholder', 'type' => 'text', 'label' => 'Placeholder'],
            ['handle' => 'rows', 'type' => 'number', 'label' => 'Rows', 'default' => 4],
            ['handle' => 'max', 'type' => 'number', 'label' => 'Max Length', 'default' => 20000],
        ];
    }
}

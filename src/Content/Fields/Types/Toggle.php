<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

class Toggle extends FieldType
{
    public function key(): string { return 'toggle'; }

    public function label(): string { return __('Toggle'); }

    public function description(): string { return __('An on/off switch stored as true or false.'); }

    public function icon(): string { return 'toggle'; }

    public function schema(Field $field): array
    {
        return ['type' => 'boolean', 'description' => $field->instructions ?: $field->label];
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? (bool) $value;
    }

    public function defaultValue(Field $field): mixed
    {
        return (bool) $field->default;
    }
}

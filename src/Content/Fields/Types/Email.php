<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;

class Email extends Text
{
    public function key(): string { return 'email'; }

    public function label(): string { return __('Email'); }

    public function description(): string { return __('An email address, checked for a valid format.'); }

    public function icon(): string { return 'mail'; }

    public function schema(Field $field): array
    {
        return $this->nullable(['type' => 'string', 'format' => 'email', 'maxLength' => 254, 'description' => $field->instructions ?: $field->label], $field);
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        return is_string($value) ? strtolower(trim($value)) : $value;
    }
}

<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Illuminate\Support\Str;
use Cms\Content\Fields\Field;

class Slug extends Text
{
    public function key(): string { return 'slug'; }

    public function label(): string { return __('Slug'); }

    public function description(): string { return __('A URL-safe identifier; typed text is converted to lowercase-with-dashes.'); }

    public function icon(): string { return 'link'; }

    public function schema(Field $field): array
    {
        return $this->nullable(['type' => 'string', 'format' => 'slug', 'maxLength' => 191, 'description' => $field->instructions ?: 'URL-safe identifier'], $field);
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        return is_string($value) && $value !== '' ? Str::slug($value) : $value;
    }
}

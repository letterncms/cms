<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

class Tags extends FieldType
{
    public function key(): string { return 'tags'; }

    public function label(): string { return __('Tags'); }

    public function description(): string { return __('Free-form labels, separated by Enter or a comma.'); }

    public function icon(): string { return 'tag'; }

    public function schema(Field $field): array
    {
        return ['type' => 'array', 'items' => ['type' => 'string', 'maxLength' => 64], 'maxItems' => 100, 'description' => $field->description()];
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        return array_values(array_unique(array_filter(array_map(static fn ($t) => trim(strip_tags((string) $t)), (array) $value))));
    }

    public function defaultValue(Field $field): mixed
    {
        return [];
    }

    public function toText(mixed $value, Field $field): string
    {
        return implode(' ', (array) $value);
    }
}

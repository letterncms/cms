<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

/**
 * A list of short values typed one after another: addresses, hosts, keywords. Tags that entries are filed under
 * are a taxonomy, picked with a `terms` field.
 */
class ValueList extends FieldType
{
    public function key(): string { return 'list'; }

    public function label(): string { return __('List'); }

    public function description(): string { return __('Short values typed one after another, each ended by Enter or a comma.'); }

    public function icon(): string { return 'list'; }

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

<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Blueprint;
use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

/** A fixed set of nested fields stored as an object. */
class Group extends FieldType
{
    public function key(): string { return 'group'; }

    public function label(): string { return __('Group'); }

    public function description(): string { return __('A fixed set of nested fields stored together.'); }

    public function icon(): string { return 'group'; }

    public function group(): string { return __('Structure'); }

    public function schema(Field $field): array
    {
        return [...$this->blueprint($field)->schema(), 'description' => $field->instructions ?: $field->label];
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        return $this->blueprint($field)->normalize((array) $value);
    }

    public function defaultValue(Field $field): mixed
    {
        return $this->blueprint($field)->defaults();
    }

    public function check(mixed $value, Field $field, mixed $previous = null): array
    {
        return $this->blueprint($field)->violations((array) $value, (array) $previous);
    }

    public function augment(mixed $value, Field $field): mixed
    {
        return $this->blueprint($field)->augment((array) $value);
    }

    public function toText(mixed $value, Field $field): string
    {
        return $this->blueprint($field)->toText((array) $value);
    }

    protected function blueprint(Field $field): Blueprint
    {
        return Blueprint::make((array) $field->get('fields', []));
    }

    public function configFields(): array
    {
        return [['handle' => 'fields', 'type' => 'fields', 'label' => 'Fields']];
    }
}

<?php

declare(strict_types=1);

namespace Cms\Content\Fields;

/**
 * Defines how a kind of value is validated, normalized, stored and rendered.
 * The kernel ships the basics; modules and plugins add more (media, blocks, …).
 */
abstract class FieldType
{
    /** Unique key, e.g. "text". */
    abstract public function key(): string;

    abstract public function label(): string;

    public function icon(): string
    {
        return 'field';
    }

    public function description(): string
    {
        return '';
    }

    /** JSON schema for a stored value (used for validation, REST docs and MCP tools). */
    abstract public function schema(Field $field): array;

    /** Clean/sanitize an incoming value before storage. */
    public function normalize(mixed $value, Field $field): mixed
    {
        return $value;
    }

    public function defaultValue(Field $field): mixed
    {
        return $field->default;
    }

    /** Value as templates see it (e.g. relations resolved, markdown rendered). */
    public function augment(mixed $value, Field $field): mixed
    {
        return $value;
    }

    /** The start of a value, for readers without access (see EntryGate). What is left out never reaches the page. */
    public function teaser(mixed $value, Field $field, int $words): mixed
    {
        if (! is_string($value)) {
            return null;
        }

        return implode(' ', array_slice(preg_split('/\s+/u', trim(strip_tags($value))) ?: [], 0, $words));
    }

    /** Plain text used for search and excerpts. */
    public function toText(mixed $value, Field $field): string
    {
        return is_scalar($value) ? (string) $value : '';
    }

    /** Fields that configure this type in the blueprint builder. */
    public function configFields(): array
    {
        return [];
    }

    /** Whether this type can be the body of a flat-file entry. */
    public function serializesToMarkdown(): bool
    {
        return false;
    }

    public function toMarkdown(mixed $value, Field $field): string
    {
        return is_string($value) ? $value : '';
    }

    public function fromMarkdown(string $markdown, Field $field): mixed
    {
        return $markdown;
    }

    /** Admin component key the admin theme renders this field with. */
    public function component(): string
    {
        return $this->key();
    }

    /** Category in the field picker. */
    public function group(): string
    {
        return __('Basic');
    }

    public function toArray(): array
    {
        return [
            'key' => $this->key(),
            'label' => $this->label(),
            'icon' => $this->icon(),
            'description' => $this->description(),
            'group' => $this->group(),
            'component' => $this->component(),
            'config' => $this->configFields(),
        ];
    }

    /** Make a schema nullable unless the field is required. */
    protected function nullable(array $schema, Field $field): array
    {
        if ($field->required) {
            return $schema;
        }

        $schema['type'] = array_values(array_unique([...(array) $schema['type'], 'null']));

        return $schema;
    }
}

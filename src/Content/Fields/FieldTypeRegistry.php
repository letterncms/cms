<?php

declare(strict_types=1);

namespace Cms\Content\Fields;

use InvalidArgumentException;

final class FieldTypeRegistry
{
    /** @var array<string, FieldType> */
    private array $types = [];

    /** The language of the record whose fields are being read, while an entry is written: a term is looked up in it. */
    public ?string $locale = null;

    public function register(FieldType $type): void
    {
        $this->types[$type->key()] = $type;
    }

    public function has(string $key): bool
    {
        return isset($this->types[$key]);
    }

    public function get(string $key): FieldType
    {
        return $this->types[$key] ?? throw new InvalidArgumentException(__('Unknown field type ":type".', ['type' => $key]));
    }

    /** Like get(), but falls back to a plain JSON type so content survives a removed plugin. */
    public function resolve(string $key): FieldType
    {
        return $this->types[$key] ?? $this->types['json'] ?? throw new InvalidArgumentException(__('Unknown field type ":type".', ['type' => $key]));
    }

    /** @return array<string, FieldType> */
    public function all(): array
    {
        return $this->types;
    }
}

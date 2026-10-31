<?php

declare(strict_types=1);

namespace Cms\Content\Fields;

use InvalidArgumentException;
use Cms\Support\Schema\SchemaException;
use Cms\Support\Schema\Validator;

/**
 * An ordered set of fields. Raw definitions may `import` fieldsets:
 *   - { import: seo }            all fields of the "seo" fieldset
 *   - { import: seo, prefix: x } prefixed handles
 */
final class Blueprint
{
    /** @param list<Field> $fields */
    private function __construct(private array $fields) {}

    public static function make(array $raw): self
    {
        $fields = [];

        foreach (self::expand($raw) as $definition) {
            // A field whose type belongs to a plugin that is off stands in with its `fallback`.
            if (isset($definition['type'], $definition['fallback']) && ! self::types()->has($definition['type'])) {
                $definition = [...$definition, 'type' => $definition['fallback'], 'standsInFor' => $definition['type']];
            }

            $field = Field::fromArray($definition);
            $fields[$field->handle] = $field;
        }

        return new self(array_values($fields));
    }

    /**
     * Check raw definitions before they are saved: valid handles, known
     * types and unique handles on every level, group and repeater
     * sub-fields included.
     *
     * @throws InvalidArgumentException
     */
    public static function validate(array $raw, string $path = '', int $depth = 0): void
    {
        if ($depth > 5) {
            throw new InvalidArgumentException(__('Fields can be nested at most five levels deep.'));
        }

        $types = self::types();
        $seen = [];

        foreach (self::expand($raw) as $definition) {
            $field = Field::fromArray($definition);
            $name = $path.$field->handle;

            if (isset($seen[$field->handle])) {
                throw new InvalidArgumentException(__('Two fields use the handle ":handle".', ['handle' => $name]));
            }
            $seen[$field->handle] = true;

            if (! $types->has($field->type) && ! $types->has((string) $field->get('fallback', ''))) {
                throw new InvalidArgumentException(__('Unknown field type ":type" for field :field.', ['type' => $field->type, 'field' => $name]));
            }

            if (array_key_exists('fields', $field->config)) {
                $sub = $field->config['fields'];

                if (! is_array($sub) || ! array_is_list($sub)) {
                    throw new InvalidArgumentException(__('The sub-fields of :field must be a list.', ['field' => $name]));
                }

                self::validate($sub, $name.'.', $depth + 1);
            }
        }
    }

    /**
     * The same fields minus some: `process()` then keeps their values as they are.
     *
     * @param  list<string>  $handles
     */
    public function without(array $handles): self
    {
        return new self(array_values(array_filter($this->fields, static fn (Field $field) => ! in_array($field->handle, $handles, true))));
    }

    /** @return list<Field> */
    public function fields(): array
    {
        return $this->fields;
    }

    public function field(string $handle): ?Field
    {
        foreach ($this->fields as $field) {
            if ($field->handle === $handle) {
                return $field;
            }
        }

        return null;
    }

    /** JSON schema of the data. Partial schemas (drafts) accept empty required fields. */
    public function schema(bool $partial = false): array
    {
        $properties = [];
        $required = [];
        $types = self::types();

        foreach ($this->fields as $field) {
            if ($partial && $field->required) {
                $field = Field::fromArray([...$field->toArray(), 'required' => false]);
            }

            $schema = $types->resolve($field->type)->schema($field);

            if ($field->get('standsInFor')) {
                $schema = ['anyOf' => [$schema, ['type' => 'array', 'items' => ['type' => 'string']]]];
            }

            $properties[$field->handle] = ['title' => $field->label, ...$schema];

            if ($field->required) {
                $required[] = $field->handle;
            }
        }

        return array_filter(['type' => 'object', 'properties' => $properties, 'required' => $required ?: null]);
    }

    public function defaults(): array
    {
        $types = self::types();
        $out = [];

        foreach ($this->fields as $field) {
            $out[$field->handle] = $types->resolve($field->type)->defaultValue($field);
        }

        return $out;
    }

    /** Normalize values with each field type (no validation) — used by nested group/repeater fields. */
    public function normalize(array $data): array
    {
        $types = self::types();

        foreach ($this->fields as $field) {
            if (array_key_exists($field->handle, $data) && ! $this->standsAside($field, $data[$field->handle])) {
                $data[$field->handle] = $types->resolve($field->type)->normalize($data[$field->handle], $field);
            }
        }

        return $data;
    }

    /**
     * Normalize then validate. Keys not in the blueprint are preserved untouched
     * so content survives removing a field or plugin.
     *
     * @throws SchemaException
     */
    public function process(array $data, bool $partial = false): array
    {
        $types = self::types();

        foreach ($this->fields as $field) {
            if (array_key_exists($field->handle, $data) && ! $this->standsAside($field, $data[$field->handle])) {
                $data[$field->handle] = $types->resolve($field->type)->normalize($data[$field->handle], $field);
            }
        }

        return Validator::validate($data, $this->schema($partial));
    }

    /** What the real type stored (a list of media ids) waits for its plugin to come back. */
    private function standsAside(Field $field, mixed $value): bool
    {
        return $field->get('standsInFor') && is_array($value) && array_is_list($value) && array_all($value, static fn ($v) => is_string($v));
    }

    public function augment(array $data): array
    {
        $types = self::types();

        foreach ($this->fields as $field) {
            $data[$field->handle] = $types->resolve($field->type)->augment($data[$field->handle] ?? null, $field);
        }

        return $data;
    }

    public function toText(array $data): string
    {
        $types = self::types();
        $parts = [];

        foreach ($this->fields as $field) {
            if (isset($data[$field->handle])) {
                $parts[] = $types->resolve($field->type)->toText($data[$field->handle], $field);
            }
        }

        return trim(implode(' ', array_filter($parts)));
    }

    /** @param array<string, mixed> $context The owner supplied by the schema host. */
    public function toArray(array $context = []): array
    {
        return array_map(static fn (Field $f) => self::withOptions($f->toArray(), $context), $this->fields);
    }

    /**
     * Options filled in by plugins: `dynamic: templates` reads the `fields.options.templates`
     * filter — when the options are needed, so they can come from other collections.
     * `fields.definition.<source>` can also supply presentation using explicit owner context.
     */
    public static function withOptions(array $field, array $context = []): array
    {
        if (is_string($field['dynamic'] ?? null) && preg_match('/^[a-z][a-z0-9_-]*$/', $field['dynamic'])) {
            $hooks = app(\Cms\Extend\Hooks::class);
            $field['options'] = [...(array) ($field['options'] ?? []), ...(array) $hooks->filter('fields.options.'.$field['dynamic'], [])];
            $field = $hooks->filter('fields.definition.'.$field['dynamic'], $field, $context);
        }

        return $field;
    }

    private static function expand(array $raw, int $depth = 0): array
    {
        $out = [];

        foreach ($raw as $definition) {
            if (! is_array($definition)) {
                continue;
            }

            if (isset($definition['import']) && $depth < 5) {
                $fieldset = app(Fieldsets::class)->get((string) $definition['import']);
                $prefix = (string) ($definition['prefix'] ?? '');

                foreach (self::expand($fieldset, $depth + 1) as $imported) {
                    $imported['handle'] = $prefix.$imported['handle'];
                    $out[] = $imported;
                }

                continue;
            }

            $out[] = $definition;
        }

        return $out;
    }

    private static function types(): FieldTypeRegistry
    {
        return app(FieldTypeRegistry::class);
    }
}

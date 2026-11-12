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
        $body = null;

        foreach (self::expand($raw) as $definition) {
            $field = Field::fromArray($definition);
            $name = $path.$field->handle;

            if (isset($seen[$field->handle])) {
                throw new InvalidArgumentException(__('Two fields use the handle ":handle".', ['handle' => $name]));
            }
            $seen[$field->handle] = true;

            if (! $types->has($field->type)) {
                throw new InvalidArgumentException(__('Unknown field type ":type" for field :field.', ['type' => $field->type, 'field' => $name]));
            }

            if (array_key_exists('body', $field->config)) {
                if (! is_bool($field->config['body']) || ($field->isBody() && ($depth > 0 || ! $types->get($field->type)->body()))) {
                    throw new InvalidArgumentException(__('Only a blocks, Markdown or rich text field of the blueprint itself can be the body, not :field.', ['field' => $name]));
                }

                if ($field->isBody() && $body !== null) {
                    throw new InvalidArgumentException(__(':field and :other are both the body. Choose one.', ['field' => $name, 'other' => $body]));
                }
                $body = $field->isBody() ? $name : $body;
            }

            if (array_key_exists('fields', $field->config)) {
                $sub = $field->config['fields'];

                if (! is_array($sub) || ! array_is_list($sub)) {
                    throw new InvalidArgumentException(__('The sub-fields of :field must be a list.', ['field' => $name]));
                }

                self::validate($sub, $name.'.', $depth + 1);
            }

            $types->get($field->type)->validateDefinition($field, $name, $depth);
            $conditional[$name] = $field;
        }

        // A condition names fields beside it, each with a value or a list of values.
        foreach ($conditional ?? [] as $name => $field) {
            foreach (['if', 'required_if'] as $key) {
                if (! array_key_exists($key, $field->config)) {
                    continue;
                }

                $rule = $field->config[$key];
                $ok = is_array($rule) && $rule !== [] && ! array_is_list($rule);

                foreach ($ok ? $rule : [] as $handle => $values) {
                    $ok = $ok && isset($seen[$handle]) && $handle !== $field->handle
                        && array_filter(is_array($values) ? $values : [$values], static fn ($v) => ! is_scalar($v) && $v !== null) === []
                        && (! is_array($values) || ($values !== [] && array_is_list($values)));
                }

                if (! $ok) {
                    throw new InvalidArgumentException(__('The condition of :field must name fields beside it, each with a value or a list of values.', ['field' => $name]));
                }

                foreach (array_keys($rule) as $handle) {
                    $depends[$field->handle][(string) $handle] = true;
                }
            }
        }

        // A field that waits for one that waits for it would never show: followed from each field, no condition comes back to it.
        foreach ($depends ?? [] as $start => $_) {
            $seen = [];
            $next = [$start];

            while ($next !== []) {
                $handle = array_pop($next);

                foreach (array_keys($depends[$handle] ?? []) as $on) {
                    if ($on === $start) {
                        throw new InvalidArgumentException(__('The conditions of :field depend on the field itself.', ['field' => $path.$start]));
                    }

                    if (! isset($seen[$on])) {
                        $seen[$on] = true;
                        $next[] = $on;
                    }
                }
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

    /** The field marked `body: true`, of a type that can be one: an entry's main content. Null when it has none. */
    public function body(): ?Field
    {
        foreach ($this->fields as $field) {
            if ($field->isBody() && self::types()->has($field->type) && self::types()->get($field->type)->body()) {
                return $field;
            }
        }

        return null;
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

    /**
     * The fields that hold entries (the `entries` type and types built on it), by their path in the data: fields
     * of a group as `group.field`. These are the ones a query can filter by and an API can expand; rows of a
     * repeater or a matrix are not among them (EntryQuery::references() finds what they name all the same).
     *
     * @return array<string, Field>
     */
    public function relations(string $prefix = ''): array
    {
        $types = self::types();
        $out = [];

        foreach ($this->fields as $field) {
            $type = $types->resolve($field->type);

            if ($type instanceof Types\Entries) {
                $out[$prefix.$field->handle] = $field;
            } elseif ($type instanceof Types\Group && ! $type instanceof Types\Repeater) {
                $out += self::make((array) $field->get('fields', []))->relations($prefix.$field->handle.'.');
            }
        }

        return $out;
    }

    /** @return list<string> Handles of the fields that hold one value for every language (`localizable: false`). */
    public function shared(): array
    {
        return array_values(array_map(static fn (Field $f) => $f->handle, array_filter($this->fields, static fn (Field $f) => ! $f->localizable)));
    }

    /**
     * JSON schema of the data. Partial schemas (drafts) accept empty required fields.
     *
     * A field that is required under a condition (`required` with `if`, or `required_if`) is optional in
     * `properties` and required in an `allOf` entry: `{if: {the fields its condition names}, then: {required,
     * and its schema as a required field}}`.
     */
    public function schema(bool $partial = false): array
    {
        $properties = [];
        $required = [];
        $conditional = [];
        $types = self::types();

        foreach ($this->fields as $field) {
            $when = $field->required ? $field->condition() : $field->requiredWhen();

            if (! $partial && $when !== []) {
                $conditional[] = [
                    'if' => ['properties' => array_map(static fn (array $values) => count($values) === 1 ? ['const' => $values[0]] : ['enum' => $values], $when), 'required' => array_keys($when)],
                    'then' => ['properties' => [$field->handle => $types->resolve($field->type)->schema(Field::fromArray([...$field->toArray(), 'required' => true]))], 'required' => [$field->handle]],
                ];
            }

            if ($field->required && ($partial || $when !== [])) {
                $field = Field::fromArray([...$field->toArray(), 'required' => false]);
            }

            // A draft is told it is one: a type whose value has parts (a date range) lets a draft hold some of them.
            if ($partial) {
                $field = Field::fromArray([...$field->toArray(), 'draft' => true]);
            }

            $schema = $types->resolve($field->type)->schema($field);

            $properties[$field->handle] = ['title' => $field->label, ...$schema];

            if ($field->required) {
                $required[] = $field->handle;
            }
        }

        return array_filter(['type' => 'object', 'properties' => $properties, 'required' => $required ?: null, 'allOf' => $conditional ?: null]);
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
            if (array_key_exists($field->handle, $data)) {
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
            if (array_key_exists($field->handle, $data)) {
                $data[$field->handle] = $types->resolve($field->type)->normalize($data[$field->handle], $field);
            }
        }

        return Validator::validate($data, $this->schema($partial));
    }

    /**
     * What the schema cannot check: that the entries, people and files the values name exist and are of the
     * kind the field allows. What `$previous` already named passes, so stored content with a relation to
     * something since deleted stays editable.
     *
     * @return array<string, string> Path => message.
     */
    public function violations(array $data, array $previous = []): array
    {
        $types = self::types();
        $errors = [];

        foreach ($this->fields as $field) {
            if (! isset($data[$field->handle])) {
                continue;
            }

            foreach ($types->resolve($field->type)->check($data[$field->handle], $field, $previous[$field->handle] ?? null) as $path => $message) {
                $errors[$path === '' ? $field->handle : $field->handle.'.'.$path] = $message;
            }
        }

        return $errors;
    }

    /** @throws SchemaException When a value names something that is not there. */
    public function check(array $data, array $previous = []): void
    {
        // Every entry the record names is looked up in one go, not once per field and row.
        $errors = app(\Cms\Content\Entries\EntryService::class)->primed($data, fn () => $this->violations($data, $previous));

        if ($errors !== []) {
            throw new SchemaException($errors);
        }
    }

    public function augment(array $data): array
    {
        $types = self::types();

        foreach ($this->fields as $field) {
            $data[$field->handle] = $types->resolve($field->type)->augment($data[$field->handle] ?? null, $field);
        }

        return $data;
    }

    /**
     * An entry's data as JSON must carry it (FieldType::export), field by field. Keys this blueprint doesn't
     * know are left as they are, and data without any stays an empty array: whoever sends it knows it is a map.
     */
    public function export(array $data): array
    {
        $types = self::types();

        foreach ($this->fields as $field) {
            if (array_key_exists($field->handle, $data)) {
                $data[$field->handle] = $types->resolve($field->type)->export($data[$field->handle], $field);
            }
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
        $types = self::types();

        return array_map(static fn (Field $f) => self::withOptions($types->resolve($f->type)->definition($f->toArray()), $context), $this->fields);
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
            $field['options'] = self::mergeOptions((array) ($field['options'] ?? []), (array) $hooks->filter('fields.options.'.$field['dynamic'], []));
            $field = $hooks->filter('fields.definition.'.$field['dynamic'], $field, $context);
        }

        return $field;
    }

    /**
     * A field's own options with those a filter added. Two lists of values are one list; otherwise each is
     * a map of value => label, and a value keeps its key, also one that is a number (a list's id): spreading
     * would renumber it and leave the labels as the values. A value both name takes the added label.
     */
    private static function mergeOptions(array $own, array $added): array
    {
        if ($own === [] || $added === []) {
            return $own === [] ? $added : $own;
        }

        if (array_is_list($own) && array_is_list($added)) {
            return [...$own, ...$added];
        }

        $map = static fn (array $options) => array_is_list($options) ? array_combine(array_map('strval', $options), $options) : $options;

        return array_replace($map($own), $map($added));
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

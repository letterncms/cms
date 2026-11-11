<?php

declare(strict_types=1);

namespace Cms\Support\Schema;

/**
 * A JSON Schema written the short way, for what an ability answers with:
 *
 *   Shape::of(['id' => Shape::STRING, 'title' => Shape::STRING_OR_NULL, 'tags?' => [Shape::STRING], 'author?' => ['id' => Shape::STRING]])
 *
 * - a string names the type (the constants below): string, integer, number, boolean, null, object (any map),
 *   array (any list), mixed (anything); `string|null` is either
 * - a list of one shape is a list of it; a map is an object whose keys are required unless they end in `?`
 * - Shape::enum(), Shape::map(), Shape::page(), Shape::nullable(), Shape::either() and Shape::raw() cover the rest
 *
 * It becomes plain JSON Schema (draft 2020-12, the subset Validator reads) when someone asks for it.
 */
final class Shape
{
    // The type names, as constants: a literal after 'label' => or 'description' => reads as a string to translate (see the i18n tool).
    public const string STRING = 'string';

    public const string INTEGER = 'integer';

    public const string NUMBER = 'number';

    public const string BOOLEAN = 'boolean';

    /** Any map. */
    public const string OBJECT = 'object';

    /** Any list. */
    public const string LIST = 'array';

    public const string MIXED = 'mixed';

    public const string NULL = 'null';

    public const string STRING_OR_NULL = 'string|null';

    public const string INTEGER_OR_NULL = 'integer|null';

    public const string NUMBER_OR_NULL = 'number|null';

    public const string BOOLEAN_OR_NULL = 'boolean|null';

    public const string OBJECT_OR_NULL = 'object|null';

    public const string LIST_OR_NULL = 'array|null';

    /** @var array<string, mixed>|null */
    private ?array $schema = null;

    private function __construct(private readonly mixed $short, private readonly bool $compiled = false) {}

    public static function of(mixed $short): self
    {
        return $short instanceof self ? $short : new self($short);
    }

    /** A JSON Schema as it is. */
    public static function raw(array $schema): self
    {
        return new self($schema, compiled: true);
    }

    public static function enum(string|int|bool|null ...$values): self
    {
        return self::raw(['enum' => $values]);
    }

    /** An object with any keys, each value of one shape: a dictionary. */
    public static function map(mixed $value = 'mixed'): self
    {
        return self::raw(['type' => 'object', 'additionalProperties' => self::of($value)->toSchema()]);
    }

    /** This shape, or null. */
    public static function nullable(mixed $shape): self
    {
        return self::either($shape, self::NULL);
    }

    /** Any one of these shapes. */
    public static function either(mixed ...$shapes): self
    {
        return self::raw(['anyOf' => array_map(static fn ($shape) => self::of($shape)->toSchema(), $shapes)]);
    }

    /** One page of a list, as every paged ability answers: `items`, `total`, `page`, `pages`, and what else is named. */
    public static function page(mixed $item, array $more = []): self
    {
        return self::of(['items' => [$item], 'total' => 'integer', 'page' => 'integer', 'pages' => 'integer', ...$more]);
    }

    /** The same object with more keys. */
    public function with(array $more): self
    {
        return self::of([...(array) $this->short, ...$more]);
    }

    /** @return array<string, mixed> */
    public function toSchema(): array
    {
        return $this->schema ??= $this->compiled ? $this->short : self::compile($this->short);
    }

    private static function compile(mixed $short): array
    {
        if ($short instanceof self) {
            return $short->toSchema();
        }

        if (is_string($short)) {
            $types = explode('|', $short);

            if (in_array('mixed', $types, true)) {
                return [];
            }

            return ['type' => count($types) === 1 ? $types[0] : $types];
        }

        if (! is_array($short)) {
            throw new \InvalidArgumentException('A shape is a type name, a list of one shape, or a map of keys to shapes.');
        }

        if ($short !== [] && array_is_list($short)) {
            return ['type' => 'array', 'items' => self::compile($short[0])];
        }

        $properties = [];
        $required = [];

        foreach ($short as $key => $value) {
            $key = (string) $key;
            $optional = str_ends_with($key, '?');
            $name = $optional ? substr($key, 0, -1) : $key;
            $properties[$name] = self::compile($value);

            if (! $optional) {
                $required[] = $name;
            }
        }

        return array_filter(['type' => 'object', 'properties' => $properties, 'required' => $required], static fn ($v) => $v !== []);
    }
}

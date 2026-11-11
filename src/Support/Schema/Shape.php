<?php

declare(strict_types=1);

namespace Cms\Support\Schema;

/**
 * A JSON Schema written the short way, for what an ability answers with:
 *
 *   Shape::of(['id' => Shape::STRING, 'title' => Shape::STRING_OR_NULL, 'tags?' => [Shape::STRING], 'author?' => ['id' => Shape::STRING]])
 *
 * - a string names the type (the constants below): string, integer, number, boolean, null; `string|null` is either
 * - a list of one shape is a list of it; a map is an object whose keys are required unless they end in `?`
 * - Shape::enum(), Shape::map(), Shape::page(), Shape::nullable(), Shape::either() and Shape::raw() cover the rest
 * - every key is named: an object takes no others. Where the keys or the type cannot be known here, Shape::open()
 *   and Shape::any() say so, with a sentence on what decides them
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

    public const string NULL = 'null';

    public const string STRING_OR_NULL = 'string|null';

    public const string INTEGER_OR_NULL = 'integer|null';

    public const string NUMBER_OR_NULL = 'number|null';

    public const string BOOLEAN_OR_NULL = 'boolean|null';

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
    public static function map(mixed $value): self
    {
        return self::raw(['type' => 'object', 'additionalProperties' => self::of($value)->toSchema()]);
    }

    /**
     * An object whose keys cannot be named here, because someone else decides them: a field's values, a
     * plugin's settings, a block's props. `$about` says what decides them and where to read it.
     */
    public static function open(string $about): self
    {
        return self::raw(['type' => 'object', 'additionalProperties' => true, 'description' => $about]);
    }

    /** A value of any type, where that is the truth (a field's value, a setting): `$about` says what it depends on. */
    public static function any(string $about): self
    {
        return self::raw(['description' => $about]);
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

    /**
     * A tree: `$node` with, under `$key`, a list of nodes of the same shape, written out `$depth` levels deep
     * (JSON Schema could refer to itself; a written-out tree reads the same in every client). Below that the
     * list is left open, and says so.
     */
    public static function nested(array $node, string $key, int $depth = 6): self
    {
        $shape = self::of([...$node, $key => [self::any('A node of the same shape, at any depth below this.')]]);

        for ($i = 1; $i < $depth; $i++) {
            $shape = self::of([...$node, $key => [$shape]]);
        }

        return $shape;
    }

    /** The same object, which also takes keys that cannot be named here: `$about` says what decides them. */
    public function andMore(string $about): self
    {
        return self::raw([...$this->toSchema(), 'additionalProperties' => true, 'description' => $about]);
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

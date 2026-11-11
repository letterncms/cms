<?php

declare(strict_types=1);

namespace Cms\Support\Schema;

use stdClass;

/**
 * An answer as JSON carries it, and whether it is exactly what its schema says.
 *
 * PHP has one array for lists and maps, and an empty one is neither: `[]` leaves as a JSON list even where
 * the answer is a map without keys. encode() reads the schema to send `{}` there, so every transport gives
 * a client the type it was told to expect. errors() is the strict reading the tests hold every result to:
 * a map is an object and a list is a list, never one for the other, and a key the schema does not name is
 * an error unless the schema says the map is open (`additionalProperties`).
 */
final class Conform
{
    /** The value decoded from its JSON, maps as objects, with empty arrays made objects where the schema says so. */
    public static function encode(mixed $value, ?array $schema): mixed
    {
        $value = json_decode((string) json_encode($value, JSON_PARTIAL_OUTPUT_ON_ERROR));

        return $schema === null ? $value : self::shape($value, $schema);
    }

    private static function shape(mixed $value, array $schema): mixed
    {
        if (isset($schema['anyOf'])) {
            foreach ($schema['anyOf'] as $option) {
                $shaped = self::shape($value, (array) $option);

                if (self::errors($shaped, (array) $option) === []) {
                    return $shaped;
                }
            }

            return $value;
        }

        $types = (array) ($schema['type'] ?? []);

        if ($value === [] && in_array('object', $types, true) && ! in_array('array', $types, true)) {
            return new stdClass;
        }

        if ($value instanceof stdClass) {
            $additional = $schema['additionalProperties'] ?? null;

            foreach (get_object_vars($value) as $key => $item) {
                $sub = $schema['properties'][$key] ?? (is_array($additional) ? $additional : null);

                if (is_array($sub)) {
                    $value->{$key} = self::shape($item, $sub);
                }
            }
        } elseif (is_array($value) && is_array($schema['items'] ?? null)) {
            foreach ($value as $i => $item) {
                $value[$i] = self::shape($item, $schema['items']);
            }
        }

        return $value;
    }

    /**
     * What an encoded value has that its schema does not describe: path => message, empty when it conforms.
     *
     * @return array<string, string>
     */
    public static function errors(mixed $value, array $schema, string $path = ''): array
    {
        if (isset($schema['anyOf'])) {
            $closest = null;

            foreach ($schema['anyOf'] as $option) {
                $errors = self::errors($value, (array) $option, $path);

                if ($errors === []) {
                    return [];
                }

                $closest = $closest === null || count($errors) < count($closest) ? $errors : $closest;
            }

            return [$path => 'matches none of the shapes it may have'.($closest ? ' (closest: '.implode('; ', array_map(static fn ($p, $m) => "{$p}: {$m}", array_keys($closest), $closest)).')' : '')];
        }

        $types = (array) ($schema['type'] ?? []);

        if ($types !== [] && ! array_filter($types, static fn (string $type) => self::is($value, $type))) {
            return [$path => 'is '.self::name($value).', not '.implode(' | ', $types)];
        }

        if (array_key_exists('const', $schema) && $value !== $schema['const']) {
            return [$path => 'is not '.json_encode($schema['const'])];
        }

        if (isset($schema['enum']) && ! in_array($value, $schema['enum'], true)) {
            return [$path => 'is '.json_encode($value).', not one of '.json_encode($schema['enum'])];
        }

        $errors = [];

        if ($value instanceof stdClass) {
            $properties = (array) ($schema['properties'] ?? []);
            $additional = $schema['additionalProperties'] ?? false;
            $values = get_object_vars($value);

            foreach ((array) ($schema['required'] ?? []) as $key) {
                if (! array_key_exists($key, $values)) {
                    $errors[self::join($path, (string) $key)] = 'is missing';
                }
            }

            foreach ($values as $key => $item) {
                $at = self::join($path, (string) $key);

                if (isset($properties[$key])) {
                    $errors += self::errors($item, (array) $properties[$key], $at);
                } elseif (is_array($additional)) {
                    $errors += self::errors($item, $additional, $at);
                } elseif ($additional !== true && $types !== []) {
                    $errors[$at] = 'is not in the schema';
                }
            }
        } elseif (is_array($value) && is_array($schema['items'] ?? null)) {
            foreach ($value as $i => $item) {
                $errors += self::errors($item, $schema['items'], self::join($path, (string) $i));
            }
        }

        return $errors;
    }

    private static function is(mixed $value, string $type): bool
    {
        return match ($type) {
            'object' => $value instanceof stdClass,
            'array' => is_array($value),
            'string' => is_string($value),
            'integer' => is_int($value),
            'number' => is_int($value) || is_float($value),
            'boolean' => is_bool($value),
            'null' => $value === null,
            default => false,
        };
    }

    private static function name(mixed $value): string
    {
        return match (true) {
            $value instanceof stdClass => 'an object',
            is_array($value) => 'a list',
            default => get_debug_type($value),
        };
    }

    private static function join(string $path, string $key): string
    {
        return $path === '' ? $key : "{$path}.{$key}";
    }
}

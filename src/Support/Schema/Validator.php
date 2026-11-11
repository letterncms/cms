<?php

declare(strict_types=1);

namespace Cms\Support\Schema;

/**
 * JSON Schema (draft 2020-12 subset: types, formats, bounds, anyOf/oneOf, allOf, if/then/else) validator that also normalizes:
 * applies defaults, strips unknown keys when additionalProperties is false
 * (reporting them), and optionally coerces scalar strings (CLI, query strings).
 */
final class Validator
{
    /** @var array<string, string> */
    private array $errors = [];

    private function __construct(private readonly bool $coerce) {}

    /** Validate and normalize; throws SchemaException on failure. */
    public static function validate(mixed $value, array $schema, bool $coerce = false): mixed
    {
        $validator = new self($coerce);
        $result = $validator->check($value, $schema, '');

        if ($validator->errors !== []) {
            throw new SchemaException($validator->errors);
        }

        return $result;
    }

    private function check(mixed $value, array $schema, string $path): mixed
    {
        if (isset($schema['anyOf']) || isset($schema['oneOf'])) {
            return $this->checkAny($value, $schema['anyOf'] ?? $schema['oneOf'], $path);
        }

        $types = (array) ($schema['type'] ?? []);

        if ($this->coerce && $types !== []) {
            $value = $this->coerce($value, $types);
        }

        if ($types !== [] && ! $this->matchesType($value, $types)) {
            $this->errors[$path] = __('Expected :expected, got :actual.', ['expected' => implode(' | ', $types), 'actual' => get_debug_type($value)]);

            return $value;
        }

        if (array_key_exists('const', $schema) && $value !== $schema['const']) {
            $this->errors[$path] = __('Must equal :value.', ['value' => json_encode($schema['const'])]);
        }

        if (isset($schema['enum']) && ! in_array($value, $schema['enum'], true)) {
            $this->errors[$path] = __('Must be one of: :values.', ['values' => implode(', ', array_map('json_encode', $schema['enum']))]);
        }

        $value = match (true) {
            is_string($value) => $this->checkString($value, $schema, $path),
            is_int($value), is_float($value) => $this->checkNumber($value, $schema, $path),
            is_array($value) && array_is_list($value) && ($value !== [] || in_array('array', $types, true)) && ! in_array('object', $types, true) => $this->checkArray($value, $schema, $path),
            is_array($value) => $this->checkObject($value, $schema, $path),
            default => $value,
        };

        foreach ((array) ($schema['allOf'] ?? []) as $every) {
            $value = $this->check($value, (array) $every, $path);
        }

        // if / then / else: the condition is only asked, never reported.
        if (is_array($schema['if'] ?? null)) {
            $probe = new self($this->coerce);
            $probe->check($value, $schema['if'], $path);
            $branch = $schema[$probe->errors === [] ? 'then' : 'else'] ?? null;

            if (is_array($branch)) {
                $value = $this->check($value, $branch, $path);
            }
        }

        return $value;
    }

    private function checkAny(mixed $value, array $options, string $path): mixed
    {
        foreach ($options as $option) {
            $probe = new self($this->coerce);
            $result = $probe->check($value, $option, $path);

            if ($probe->errors === []) {
                return $result;
            }
        }

        $this->errors[$path] = __('Does not match any allowed shape.');

        return $value;
    }

    private function checkString(string $value, array $schema, string $path): string
    {
        $length = mb_strlen($value);

        if (isset($schema['minLength']) && $length < $schema['minLength']) {
            $this->errors[$path] = __('Must be at least :count characters.', ['count' => $schema['minLength']]);
        }

        if (isset($schema['maxLength']) && $length > $schema['maxLength']) {
            $this->errors[$path] = __('Must be at most :count characters.', ['count' => $schema['maxLength']]);
        }

        if (isset($schema['pattern']) && ! preg_match('/'.str_replace('/', '\/', $schema['pattern']).'/u', $value)) {
            $this->errors[$path] = __('Has an invalid format.');
        }

        if (isset($schema['format']) && $value !== '' && ! $this->matchesFormat($value, (string) $schema['format'])) {
            $this->errors[$path] = __('Must be a valid :format.', ['format' => $schema['format']]);
        }

        return $value;
    }

    private function checkNumber(int|float $value, array $schema, string $path): int|float
    {
        if (isset($schema['minimum']) && $value < $schema['minimum']) {
            $this->errors[$path] = __('Must be at least :min.', ['min' => $schema['minimum']]);
        }

        if (isset($schema['maximum']) && $value > $schema['maximum']) {
            $this->errors[$path] = __('Must be at most :max.', ['max' => $schema['maximum']]);
        }

        return $value;
    }

    private function checkArray(array $value, array $schema, string $path): array
    {
        if (isset($schema['minItems']) && count($value) < $schema['minItems']) {
            $this->errors[$path] = __('Needs at least :count items.', ['count' => $schema['minItems']]);
        }

        if (isset($schema['maxItems']) && count($value) > $schema['maxItems']) {
            $this->errors[$path] = __('Allows at most :count items.', ['count' => $schema['maxItems']]);
        }

        if (isset($schema['items']) && is_array($schema['items'])) {
            foreach ($value as $i => $item) {
                $value[$i] = $this->check($item, $schema['items'], $this->join($path, (string) $i));
            }
        }

        if (! empty($schema['uniqueItems']) && count($value) !== count(array_unique(array_map('serialize', $value)))) {
            $this->errors[$path] = __('Items must be unique.');
        }

        return $value;
    }

    private function checkObject(array $value, array $schema, string $path): array
    {
        $properties = (array) ($schema['properties'] ?? []);

        foreach ((array) ($schema['required'] ?? []) as $key) {
            if (! array_key_exists($key, $value) && ! array_key_exists('default', (array) ($properties[$key] ?? []))) {
                $this->errors[$this->join($path, (string) $key)] = __('Is required.');
            }
        }

        foreach ($properties as $key => $propSchema) {
            if (array_key_exists($key, $value)) {
                $value[$key] = $this->check($value[$key], (array) $propSchema, $this->join($path, (string) $key));
            } elseif (array_key_exists('default', (array) $propSchema)) {
                $value[$key] = $propSchema['default'];
            }
        }

        $additional = $schema['additionalProperties'] ?? true;

        foreach ($value as $key => $item) {
            if (array_key_exists($key, $properties)) {
                continue;
            }

            if ($additional === false) {
                $this->errors[$this->join($path, (string) $key)] = __('Is not allowed.');
            } elseif (is_array($additional)) {
                $value[$key] = $this->check($item, $additional, $this->join($path, (string) $key));
            }
        }

        if (isset($schema['maxProperties']) && count($value) > $schema['maxProperties']) {
            $this->errors[$path] = __('Allows at most :count properties.', ['count' => $schema['maxProperties']]);
        }

        return $value;
    }

    private function matchesType(mixed $value, array $types): bool
    {
        foreach ($types as $type) {
            $ok = match ($type) {
                'string' => is_string($value),
                'integer' => is_int($value),
                'number' => is_int($value) || is_float($value),
                'boolean' => is_bool($value),
                'null' => $value === null,
                'array' => is_array($value) && array_is_list($value),
                'object' => is_array($value) && ($value === [] || ! array_is_list($value)),
                default => false,
            };

            if ($ok) {
                return true;
            }
        }

        return false;
    }

    private function coerce(mixed $value, array $types): mixed
    {
        if (! is_string($value) || in_array('string', $types, true)) {
            return $value;
        }

        return match (true) {
            in_array('boolean', $types, true) && in_array(strtolower($value), ['true', '1', 'yes', 'on'], true) => true,
            in_array('boolean', $types, true) && in_array(strtolower($value), ['false', '0', 'no', 'off', ''], true) => false,
            // A number PHP cannot hold stays the text it came as, and is refused as that: never a clamped or rounded one.
            in_array('integer', $types, true) && preg_match('/^-?\d+$/', $value) === 1 && is_int($value + 0) => $value + 0,
            in_array('number', $types, true) && is_numeric($value) && is_finite($value + 0) && ! $this->lossy($value) => $value + 0,
            in_array('null', $types, true) && ($value === '' || $value === 'null') => null,
            (in_array('array', $types, true) || in_array('object', $types, true)) && json_validate($value) => json_decode($value, true),
            default => $value,
        };
    }

    /** Whether a run of digits is too long for an integer, so reading it as a number would round it. */
    private function lossy(string $value): bool
    {
        return preg_match('/^\s*[+-]?\d+\s*$/', $value) === 1 && ! is_int($value + 0);
    }

    private function matchesFormat(string $value, string $format): bool
    {
        return match ($format) {
            'email' => filter_var($value, FILTER_VALIDATE_EMAIL) !== false,
            'uri', 'url' => filter_var($value, FILTER_VALIDATE_URL) !== false && preg_match('#^https?://#i', $value) === 1,
            'uri-reference' => preg_match('#^(https?://|/|\#|mailto:|tel:)#i', $value) === 1,
            'date' => preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) === 1 && strtotime($value) !== false,
            'date-time' => strtotime($value) !== false,
            'ulid' => preg_match('/^[0-9A-HJKMNP-TV-Z]{26}$/i', $value) === 1,
            'slug' => preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $value) === 1,
            'handle' => preg_match('/^[a-z][a-z0-9_]*$/', $value) === 1,
            'color' => preg_match('/^(#[0-9a-f]{3,8}|(rgb|hsl|oklch)a?\([^)]*\))$/i', $value) === 1,
            default => true,
        };
    }

    private function join(string $path, string $key): string
    {
        return $path === '' ? $key : "{$path}.{$key}";
    }
}

/**
 * Messages are written in English and translated by Laravel's `__()` when it runs inside
 * the app; on its own (unit tests, tools) the validator fills in the placeholders itself.
 */
function __(string $text, array $replace = []): string
{
    if (\function_exists('app') && \app()->bound('translator')) {
        return \__($text, $replace);
    }

    return strtr($text, array_combine(array_map(static fn ($key) => ":{$key}", array_keys($replace)), array_map('strval', $replace)) ?: []);
}

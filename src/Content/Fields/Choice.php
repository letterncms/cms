<?php

declare(strict_types=1);

namespace Cms\Content\Fields;

use JsonSerializable;
use Stringable;

/**
 * An option picked in a select field, as a page shows it: its label as text (`entry.kind` reads "Test or
 * scan"), its stored value beside it (`entry.kind.value`), and equal to either (`entry.kind|is:test`), so a
 * class that follows the value keeps working when the label changes. JSON carries the value.
 */
final class Choice implements JsonSerializable, Stringable
{
    public function __construct(public readonly string $value, public readonly string $label) {}

    /** A select field's stored value as choices: one, a list of them for a multiple select, or null when empty. */
    public static function of(mixed $value, Field $field): self|array|null
    {
        $options = (new Types\Select)->options($field);
        $one = static fn (mixed $v) => $v === null || $v === '' || is_array($v) ? null : new self((string) $v, $options[(string) $v] ?? (string) $v);

        return is_array($value) ? array_values(array_filter(array_map($one, $value))) : $one($value);
    }

    /** Is this the option named, by its value or by its label? */
    public function is(string $name): bool
    {
        return $name === $this->value || $name === $this->label;
    }

    public function __toString(): string
    {
        return $this->label;
    }

    public function jsonSerialize(): string
    {
        return $this->value;
    }
}

<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

/** A number picked on a scale: between `min` (0) and `max` (100), in steps of `step` (1) counted from `min`. */
class Range extends FieldType
{
    public function key(): string { return 'range'; }

    public function label(): string { return __('Range'); }

    public function description(): string { return __('A number on a scale, with a minimum, a maximum and a step.'); }

    public function icon(): string { return 'number'; }

    public function schema(Field $field): array
    {
        [$min, $max, $step] = $this->scale($field);

        return $this->nullable([
            'type' => $this->whole($min, $step) ? 'integer' : 'number',
            'minimum' => $min,
            'maximum' => $max,
            'description' => ($field->instructions ?: $field->label)." ({$min} to {$max}, in steps of {$step})",
        ], $field);
    }

    /** A value between two steps moves to the nearest one, as a slider would put it; one off the scale is refused. */
    public function normalize(mixed $value, Field $field): mixed
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (! is_numeric($value)) {
            return $value;
        }

        [$min, $max, $step] = $this->scale($field);
        $number = $value + 0;

        if ($number >= $min && $number <= $max) {
            $number = min($max, $min + round(($number - $min) / $step) * $step);
        }

        return $this->whole($min, $step) && floor($number) == $number ? (int) $number : round((float) $number, 6);
    }

    public function defaultValue(Field $field): mixed
    {
        return $field->default;
    }

    public function configFields(): array
    {
        return [
            ['handle' => 'min', 'type' => 'number', 'label' => 'Minimum', 'decimals' => true, 'default' => 0],
            ['handle' => 'max', 'type' => 'number', 'label' => 'Maximum', 'decimals' => true, 'default' => 100],
            ['handle' => 'step', 'type' => 'number', 'label' => 'Step Size', 'decimals' => true, 'default' => 1],
        ];
    }

    /** @return array{0: int|float, 1: int|float, 2: int|float} */
    private function scale(Field $field): array
    {
        $number = static fn (mixed $value, int|float $default) => is_numeric($value) ? $value + 0 : $default;
        $min = $number($field->get('min'), 0);
        $max = max($min, $number($field->get('max'), 100));
        $step = $number($field->get('step'), 1);

        return [$min, $max, $step > 0 ? $step : 1];
    }

    private function whole(int|float $min, int|float $step): bool
    {
        return floor($min) == $min && floor($step) == $step;
    }
}

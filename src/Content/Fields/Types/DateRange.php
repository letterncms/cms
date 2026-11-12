<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Illuminate\Support\Carbon;
use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

/** From one day to another: `{start, end}`, dates or, with `time`, moments. The end is never before the start. */
class DateRange extends FieldType
{
    public function key(): string { return 'date-range'; }

    public function label(): string { return __('Date Range'); }

    public function description(): string { return __('A start and an end date, optionally with times.'); }

    public function icon(): string { return 'calendar'; }

    public function schema(Field $field): array
    {
        $date = ['type' => 'string', 'format' => $field->get('time') ? 'date-time' : 'date'];

        // A draft may hold half a range (`draft`, see Blueprint::schema()); to be published it has both ends.
        return $this->nullable([
            'type' => 'object',
            'properties' => ['start' => $date, 'end' => $date],
            'required' => $field->get('draft') ? [] : ['start', 'end'],
            'additionalProperties' => false,
            'description' => $field->description(),
        ], $field);
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        if (! is_array($value) || (($value['start'] ?? '') === '' && ($value['end'] ?? '') === '')) {
            return is_array($value) || $value === '' ? null : $value;
        }

        foreach (['start', 'end'] as $key) {
            // An end that is not filled in is not there, rather than nothing.
            if (array_key_exists($key, $value) && ($value[$key] === null || $value[$key] === '')) {
                unset($value[$key]);
            }

            if (is_string($value[$key] ?? null) && $value[$key] !== '') {
                try {
                    $date = Carbon::parse($value[$key]);
                    $value[$key] = $field->get('time') ? $date->toIso8601String() : $date->toDateString();
                } catch (\Throwable) {
                    // Left as it came: validation says it is no date.
                }
            }
        }

        return $value;
    }

    public function check(mixed $value, Field $field, mixed $previous = null): array
    {
        return is_array($value) && isset($value['start'], $value['end']) && strtotime((string) $value['end']) < strtotime((string) $value['start'])
            ? ['end' => __('Must not be before the start.')]
            : [];
    }

    public function augment(mixed $value, Field $field): mixed
    {
        return is_array($value) && isset($value['start'], $value['end']) ? ['start' => Carbon::parse($value['start']), 'end' => Carbon::parse($value['end'])] : null;
    }

    public function toText(mixed $value, Field $field): string
    {
        return is_array($value) ? trim(($value['start'] ?? '').' '.($value['end'] ?? '')) : '';
    }

    public function configFields(): array
    {
        return [['handle' => 'time', 'type' => 'toggle', 'label' => 'Include Time']];
    }
}

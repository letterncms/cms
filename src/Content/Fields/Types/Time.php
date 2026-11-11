<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

/** A time of day on a 24-hour clock: `"09:30"`, or `"09:30:15"` with `seconds`. */
class Time extends FieldType
{
    public function key(): string { return 'time'; }

    public function label(): string { return __('Time'); }

    public function description(): string { return __('A time of day.'); }

    public function icon(): string { return 'clock'; }

    public function schema(Field $field): array
    {
        return $this->nullable([
            'type' => 'string',
            'pattern' => '^([01][0-9]|2[0-3]):[0-5][0-9]'.($field->get('seconds') ? ':[0-5][0-9]' : '').'$',
            'description' => ($field->instructions ?: $field->label).($field->get('seconds') ? ' (HH:MM:SS)' : ' (HH:MM)'),
        ], $field);
    }

    /** `9:5` and `09:05:00` are the same time as `09:05`; anything that is no time is left for validation. */
    public function normalize(mixed $value, Field $field): mixed
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_string($value) && preg_match('/^\s*(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*$/', $value, $m)) {
            return sprintf('%02d:%02d', $m[1], $m[2]).($field->get('seconds') ? sprintf(':%02d', $m[3] ?? 0) : '');
        }

        return $value;
    }

    public function configFields(): array
    {
        return [['handle' => 'seconds', 'type' => 'toggle', 'label' => 'Include Seconds']];
    }
}

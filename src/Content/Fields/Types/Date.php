<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Illuminate\Support\Carbon;
use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

class Date extends FieldType
{
    public function key(): string { return 'date'; }

    public function label(): string { return __('Date'); }

    public function description(): string { return __('A calendar date, optionally with a time.'); }

    public function icon(): string { return 'calendar'; }

    public function schema(Field $field): array
    {
        return $this->nullable(['type' => 'string', 'format' => $field->get('time') ? 'date-time' : 'date', 'description' => $field->description()], $field);
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        if ($value === null || $value === '') {
            return null;
        }

        $date = Carbon::parse((string) $value);

        return $field->get('time') ? $date->toIso8601String() : $date->toDateString();
    }

    public function augment(mixed $value, Field $field): mixed
    {
        return $value ? Carbon::parse($value) : null;
    }

    public function configFields(): array
    {
        return [['handle' => 'time', 'type' => 'toggle', 'label' => 'Include Time']];
    }
}

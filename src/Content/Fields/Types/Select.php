<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

/** Options as `{value: label}` or a list of values. */
class Select extends FieldType
{
    public function key(): string { return 'select'; }

    public function label(): string { return __('Select'); }

    public function icon(): string { return 'select'; }

    public function description(): string { return __('Pick one or more predefined options.'); }

    public function schema(Field $field): array
    {
        $values = array_map('strval', array_keys($this->options($field)));
        $one = $values === [] ? ['type' => 'string'] : ['type' => 'string', 'enum' => $values];
        $description = $field->instructions ?: $field->label;

        if ($field->get('multiple')) {
            return ['type' => 'array', 'items' => $one, 'uniqueItems' => true, 'description' => $description];
        }

        if (! $field->required) {
            $one['type'] = ['string', 'null'];

            if (isset($one['enum'])) {
                $one['enum'][] = null;
            }
        }

        return [...$one, 'description' => $description];
    }

    /** @return array<string, string> */
    public function options(Field $field): array
    {
        $options = (array) (\Cms\Content\Fields\Blueprint::withOptions(['options' => $field->get('options', []), 'dynamic' => $field->get('dynamic')])['options'] ?? []);

        return array_is_list($options) ? array_combine(array_map('strval', $options), array_map('strval', $options)) : array_map('strval', $options);
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        if ($field->get('multiple')) {
            return array_values(array_unique(array_filter((array) $value, static fn ($v) => $v !== null && $v !== '')));
        }

        return $value === '' ? null : $value;
    }

    public function configFields(): array
    {
        return [
            ['handle' => 'options', 'type' => 'json', 'label' => 'Options', 'placeholder' => '{"value": "Label"}'],
            ['handle' => 'multiple', 'type' => 'toggle', 'label' => 'Allow Multiple'],
            ['handle' => 'display', 'type' => 'select', 'label' => 'Display', 'options' => ['dropdown' => 'Dropdown', 'radio' => 'Radio buttons', 'segmented' => 'Segmented']],
        ];
    }
}

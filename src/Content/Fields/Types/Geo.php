<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

/**
 * A place: `{lat, lng, address?}` in decimal degrees. The address is words for people; nothing looks it up, so no
 * map service is called.
 */
class Geo extends FieldType
{
    public function key(): string { return 'geo'; }

    public function label(): string { return __('Location'); }

    public function description(): string { return __('A place by latitude and longitude, with its address.'); }

    public function icon(): string { return 'pin'; }

    public function schema(Field $field): array
    {
        return $this->nullable([
            'type' => 'object',
            'properties' => [
                'lat' => ['type' => 'number', 'minimum' => -90, 'maximum' => 90],
                'lng' => ['type' => 'number', 'minimum' => -180, 'maximum' => 180],
                'address' => ['type' => ['string', 'null'], 'maxLength' => 500],
            ],
            'required' => ['lat', 'lng'],
            'additionalProperties' => false,
            'description' => $field->description().' — decimal degrees, and the address as text',
        ], $field);
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        if (! is_array($value)) {
            return $value === '' ? null : $value;
        }

        $empty = static fn (mixed $v) => $v === null || $v === '';

        if ($empty($value['lat'] ?? null) && $empty($value['lng'] ?? null) && $empty($value['address'] ?? null)) {
            return null;
        }

        foreach (['lat', 'lng'] as $key) {
            if (is_numeric($value[$key] ?? null)) {
                $value[$key] = round((float) $value[$key], 6);
            } elseif ($empty($value[$key] ?? null)) {
                unset($value[$key]);
            }
        }

        if (is_string($value['address'] ?? null)) {
            $value['address'] = trim($value['address']);
        }

        if ($empty($value['address'] ?? null)) {
            unset($value['address']);
        }

        return $value;
    }

    public function toText(mixed $value, Field $field): string
    {
        return is_array($value) ? (string) ($value['address'] ?? '') : '';
    }
}

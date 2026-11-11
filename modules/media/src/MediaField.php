<?php

declare(strict_types=1);

namespace Cms\Modules\Media;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

/** One or more files from the media library (stores ids). */
final class MediaField extends FieldType
{
    public function key(): string { return 'media'; }

    public function label(): string { return 'Media'; }

    public function icon(): string { return 'image'; }

    public function description(): string { return 'Images, documents or videos from the media library.'; }

    public function group(): string { return 'Media'; }

    public function schema(Field $field): array
    {
        return array_filter([
            'type' => 'array',
            'items' => ['type' => 'string', 'description' => 'Media id (see media/list), or an https:// or /path URL'],
            'maxItems' => $field->get('max'),
            'description' => ($field->instructions ?: $field->label).' — media ids from media/list or media/import',
        ], static fn ($v) => $v !== null);
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        if (is_string($value)) {
            $value = $value === '' ? [] : [$value];
        }

        return array_values(array_filter((array) $value, static fn ($v) => is_string($v) && (preg_match('/^[0-9a-z]{26}$/i', $v) || preg_match('#^(https://|/)#', $v))));
    }

    public function defaultValue(Field $field): mixed
    {
        return [];
    }

    /** Every id is a file of the library, of a kind the field takes (`accept`). A URL is not checked. */
    public function check(mixed $value, Field $field, mixed $previous = null): array
    {
        $isId = static fn ($v) => is_string($v) && preg_match('/^[0-9a-z]{26}$/i', $v) === 1;
        $new = array_diff(array_filter((array) $value, $isId), array_filter((array) $previous, 'is_string'));

        if ($new === []) {
            return [];
        }

        $found = MediaItem::query()->whereIn('id', array_map('strtolower', array_values($new)))->pluck('mime', 'id');
        $accept = (string) $field->get('accept', '*');
        $errors = [];

        foreach ($new as $i => $id) {
            $mime = $found[strtolower($id)] ?? null;

            if ($mime === null) {
                $errors[(string) $i] = __('This file does not exist.');
            } elseif (! self::accepts($accept, (string) $mime)) {
                $errors[(string) $i] = __('This kind of file is not allowed here.');
            }
        }

        return $errors;
    }

    /** `image/*`, `application/pdf`, several separated by commas, or `*` for anything. */
    public static function accepts(string $accept, string $mime): bool
    {
        foreach (array_filter(array_map('trim', explode(',', $accept))) ?: ['*'] as $pattern) {
            if ($pattern === '*' || $pattern === '*/*' || $pattern === $mime || (str_ends_with($pattern, '/*') && str_starts_with($mime, substr($pattern, 0, -1)))) {
                return true;
            }
        }

        return false;
    }

    /** Ids become images, in the order given. A URL stays a URL. */
    public function augment(mixed $value, Field $field): mixed
    {
        $values = array_values(array_filter((array) $value, 'is_string'));
        $ids = array_filter($values, static fn ($v) => preg_match('/^[0-9a-z]{26}$/i', $v) === 1);
        $items = $ids === [] ? collect() : MediaItem::query()->whereIn('id', array_map('strtolower', $ids))->get()->keyBy('id');
        $resolved = array_values(array_filter(array_map(static function (string $v) use ($items) {
            if (preg_match('#^(https://|/)#', $v) === 1) {
                return $v;
            }

            return isset($items[strtolower($v)]) ? new Image($items[strtolower($v)]) : null;
        }, $values)));

        return (int) $field->get('max') === 1 ? ($resolved[0] ?? null) : $resolved;
    }

    public function configFields(): array
    {
        return [
            ['handle' => 'max', 'type' => 'number', 'label' => 'Maximum Files', 'min' => 1],
            ['handle' => 'accept', 'type' => 'select', 'label' => 'Allowed', 'options' => ['*' => __('Any file'), 'image/*' => __('Images'), 'video/*' => __('Videos'), 'application/pdf' => __('PDFs')], 'default' => 'image/*'],
        ];
    }
}

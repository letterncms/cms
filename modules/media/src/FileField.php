<?php

declare(strict_types=1);

namespace Cms\Modules\Media;

use Cms\Content\Fields\Field;

/**
 * Files that are not pictures: documents, archives, audio, video. It stores ids of the media library like the
 * media field, takes no image and no bare URL, and gives templates a file ({url, name, size…}) instead of a picture.
 */
final class FileField extends MediaField
{
    public function key(): string { return 'file'; }

    public function label(): string { return 'File'; }

    public function icon(): string { return 'file'; }

    /** Picked from the library like any media. */
    public function component(): string { return 'media'; }

    /** The picker shows what the field takes (check()): every kind of file unless `accept` narrows it, and no image. */
    public function definition(array $definition): array
    {
        return ['accept' => '*', ...$definition, 'except' => 'image/*'];
    }

    public function description(): string { return 'Documents and other files from the media library; images go in a media field.'; }

    public function schema(Field $field): array
    {
        // For agents, so in English like every schema.
        $about = $field->description().' — ids of files that are not images, from media/list or media/import';

        return array_filter([
            'type' => 'array',
            'items' => ['type' => 'string', 'format' => 'ulid'],
            'maxItems' => $field->get('max'),
            'description' => $about,
        ], static fn ($v) => $v !== null);
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        if (is_string($value)) {
            $value = $value === '' ? [] : [$value];
        }

        return array_values(array_unique(array_map(static fn (string $id) => preg_match('/^[0-9a-z]{26}$/i', $id) ? strtolower($id) : $id, array_filter((array) $value, 'is_string'))));
    }

    public function check(mixed $value, Field $field, mixed $previous = null): array
    {
        $errors = parent::check($value, $field, $previous);
        $new = array_diff_key(array_diff(array_filter((array) $value, 'is_string'), array_filter((array) $previous, 'is_string')), $errors);
        $images = $new === [] ? [] : MediaItem::query()->whereIn('id', array_values($new))->where('mime', 'like', 'image/%')->pluck('id')->flip()->all();

        foreach ($new as $i => $id) {
            if (isset($images[$id])) {
                $errors[(string) $i] = __('An image goes in a media field.');
            }
        }

        return $errors;
    }

    /** @return list<array{id: string, url: string, name: string, filename: string, extension: string, mime: string, kind: string, size: int}>|array|null In the order given; one or null with `max: 1`. */
    public function augment(mixed $value, Field $field): mixed
    {
        $ids = array_values(array_filter((array) $value, 'is_string'));
        $items = $ids === [] ? collect() : MediaItem::query()->whereIn('id', $ids)->get()->keyBy('id');
        $files = array_values(array_filter(array_map(static fn (string $id) => isset($items[$id]) ? [
            'id' => $items[$id]->id, 'url' => $items[$id]->url(), 'name' => $items[$id]->name, 'filename' => $items[$id]->filename,
            'extension' => strtolower(pathinfo($items[$id]->filename, PATHINFO_EXTENSION)), 'mime' => $items[$id]->mime, 'kind' => $items[$id]->kind(), 'size' => $items[$id]->size,
        ] : null, $ids)));

        return (int) $field->get('max') === 1 ? ($files[0] ?? null) : $files;
    }

    public function configFields(): array
    {
        return [
            ['handle' => 'max', 'type' => 'number', 'label' => 'Maximum Files', 'min' => 1],
            ['handle' => 'accept', 'type' => 'text', 'label' => 'Allowed', 'placeholder' => 'application/pdf, video/*'],
        ];
    }
}

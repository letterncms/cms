<?php

declare(strict_types=1);

namespace Cms\Content\Globals;

use Cms\Content\Fields\Blueprint;
use Cms\Support\RecordTimestamps;

/** Site-wide values (footer, contact details, social links…) with their own fields. */
final class GlobalSet
{
    private ?Blueprint $blueprint = null;

    /**
     * @param  array<string, mixed>  $data  Default-locale values
     * @param  array<string, array<string, mixed>>  $locales  Per-locale overrides
     */
    public function __construct(
        public readonly string $handle,
        public string $title,
        public string $icon,
        public array $fields,
        public array $data = [],
        public array $locales = [],
        public array $timestamps = [],
    ) {}

    public static function fromArray(string $handle, array $raw): self
    {
        return new self(
            handle: $handle,
            title: (string) ($raw['title'] ?? ucfirst($handle)),
            icon: (string) ($raw['icon'] ?? 'globe'),
            fields: array_values((array) ($raw['fields'] ?? [])),
            data: (array) ($raw['data'] ?? []),
            locales: (array) ($raw['locales'] ?? []),
            timestamps: RecordTimestamps::api($raw),
        );
    }

    public function blueprint(): Blueprint
    {
        return $this->blueprint ??= Blueprint::make($this->fields);
    }

    public function values(?string $locale = null): array
    {
        $values = array_replace($this->blueprint()->defaults(), $this->data);

        if ($locale !== null && $locale !== config('app.locale') && isset($this->locales[$locale])) {
            $values = array_replace($values, (array) $this->locales[$locale]);
        }

        return $values;
    }

    public function toYaml(): array
    {
        return array_filter([
            'title' => $this->title,
            'icon' => $this->icon,
            'fields' => $this->fields,
            'data' => $this->data,
            'locales' => $this->locales ?: null,
            'published_at' => $this->timestamps['publishedAt'] ?? null,
            'updated_at' => $this->timestamps['updatedAt'] ?? null,
        ], static fn ($v) => $v !== null);
    }

    public function toArray(?string $locale = null): array
    {
        return [
            'handle' => $this->handle,
            ...RecordTimestamps::api($this->timestamps),
            'title' => $this->title,
            'icon' => $this->icon,
            'fields' => $this->fields,
            'resolvedFields' => $this->blueprint()->toArray(),
            'data' => $this->values($locale),
        ];
    }
}

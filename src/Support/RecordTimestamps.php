<?php

declare(strict_types=1);

namespace Cms\Support;

use Carbon\CarbonImmutable;
use DateTimeInterface;
use Throwable;

/** Metadata shared by overview records. Unknown history stays null; reads never invent dates. */
final class RecordTimestamps
{
    /** @return array{publishedAt: ?string, updatedAt: ?string} */
    public static function api(array $record): array
    {
        return [
            'publishedAt' => self::date($record['published_at'] ?? $record['publishedAt'] ?? null),
            'updatedAt' => self::date($record['updated_at'] ?? $record['updatedAt'] ?? null),
        ];
    }

    /**
     * Immediately effective configuration is first published on creation.
     * Existing records without publication history keep that date unknown.
     * Always derive dates from storage, never from client-supplied metadata.
     *
     * @return array{published_at: ?string, updated_at: string}
     */
    public static function saved(?array $previous): array
    {
        $now = CarbonImmutable::now()->toIso8601String();

        return [
            'published_at' => $previous === null ? $now : self::api($previous)['publishedAt'],
            'updated_at' => $now,
        ];
    }

    private static function date(mixed $value): ?string
    {
        if ($value instanceof DateTimeInterface) {
            return CarbonImmutable::instance($value)->toIso8601String();
        }

        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        try {
            return CarbonImmutable::parse($value)->toIso8601String();
        } catch (Throwable) {
            return null;
        }
    }
}

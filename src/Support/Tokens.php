<?php

declare(strict_types=1);

namespace Cms\Support;

/**
 * Design-token references — the shared language between themes, blocks and agents.
 *
 *   token:space.8          → var(--space-8)
 *   token:color.primary    → var(--color-primary)
 *   token:color.primary/40 → color-mix(in srgb, var(--color-primary) 40%, transparent)
 *
 * Groups map to CSS custom property prefixes (see Cms\Modules\Site\Design\DesignJson::GROUPS).
 */
final class Tokens
{
    private const array PREFIX = ['weight' => 'font-weight'];

    public static function isRef(mixed $value): bool
    {
        return is_string($value) && str_starts_with($value, 'token:');
    }

    public static function variable(string $group, string $name): string
    {
        return '--'.(self::PREFIX[$group] ?? $group).'-'.$name;
    }

    /** Resolve a value to CSS. Non-token values are sanitized (no braces, semicolons or url()). */
    public static function css(mixed $value): ?string
    {
        if ($value === null || $value === '' || is_array($value) || is_bool($value)) {
            return null;
        }

        $value = trim((string) $value);

        if (self::isRef($value)) {
            if (! preg_match('/^token:([a-z]+)\.([a-z0-9-]+)(?:\/(\d{1,3}))?$/', $value, $m)) {
                return null;
            }

            $var = 'var('.self::variable($m[1], $m[2]).')';

            return isset($m[3]) ? "color-mix(in srgb, {$var} {$m[3]}%, transparent)" : $var;
        }

        return self::safe($value) ? $value : null;
    }

    /** Raw CSS values must not be able to break out of a declaration. */
    public static function safe(string $value): bool
    {
        return strlen($value) <= 200
            && ! preg_match('/[{};<>\\\\]|url\s*\(|expression\s*\(|@import|\/\*|javascript:/i', $value);
    }
}

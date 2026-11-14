<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks;

/**
 * CSS values written by people and agents, made safe to print.
 *
 *   var(--color-primary)        → as written: a theme variable is plain CSS
 *   linear-gradient(…)          → as written
 *   media:01j…                  → url("/media/…") (an uploaded file)
 *
 * Anything that could leave a declaration (braces, semicolons, angle brackets,
 * backslashes, comments, @import, url() written by hand) is refused.
 */
final class Css
{
    private const string MEDIA = '/media:([0-9a-z]{26})/i';

    /**
     * What a `style:<property>` binding may set on an element from data, camelCase => CSS property:
     * the few things that come per item (a colour, a picture, a size, a place). Everything else is a class.
     */
    public const array INLINE = [
        'color' => 'color', 'backgroundColor' => 'background-color', 'backgroundImage' => 'background-image', 'backgroundPosition' => 'background-position',
        'borderColor' => 'border-color', 'accentColor' => 'accent-color', 'fill' => 'fill', 'stroke' => 'stroke', 'maskImage' => 'mask-image',
        'opacity' => 'opacity', 'width' => 'width', 'height' => 'height', 'minHeight' => 'min-height', 'maxWidth' => 'max-width', 'aspectRatio' => 'aspect-ratio',
        'objectPosition' => 'object-position', 'gridColumn' => 'grid-column', 'gridRow' => 'grid-row', 'order' => 'order', 'zIndex' => 'z-index',
        'rotate' => 'rotate', 'scale' => 'scale', 'translate' => 'translate',
    ];

    /** Of INLINE, the ones a bare number is a number for; for the rest it is pixels. */
    private const array UNITLESS = ['opacity', 'aspectRatio', 'order', 'zIndex', 'scale'];

    public static function value(mixed $value): ?string
    {
        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }

        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        if ($value === '' || strlen($value) > 600 || preg_match('/[{};<>\\\\]|url\s*\(|expression\s*\(|@import|\/\*|javascript:/i', $value)) {
            return null;
        }

        if (str_contains($value, 'media:')) {
            $value = preg_replace_callback(self::MEDIA, static function (array $m): string {
                $url = Media::url($m[1]);

                return $url ? 'url("'.str_replace(['"', '\\'], '', $url).'")' : 'none';
            }, $value) ?? $value;
        }

        return $value;
    }

    /** One inline declaration for a `style:<property>` binding ("width:120px"), or null when the property or the value is not allowed. */
    public static function inline(string $property, mixed $value): ?string
    {
        if (! isset(self::INLINE[$property])) {
            return null;
        }

        if (is_int($value) || is_float($value) || (is_string($value) && is_numeric($value) && $value !== '0')) {
            $css = in_array($property, self::UNITLESS, true) ? (string) $value : $value.'px';
        } else {
            $css = self::value($value);
        }

        return $css === null ? null : self::INLINE[$property].':'.$css;
    }
}

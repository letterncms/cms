<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Design;

/**
 * One size scale for everything people click or type in: buttons, form fields, tag fields
 * and chips. Each size (S, M, L) is a height, a horizontal padding and a text size, kept as
 * `control` tokens (control.sm-height, control.md-padding…). A button and a field of the same
 * size line up. `data-size` on an element, or on anything around it, picks the size;
 * --control-height, --control-padding and --control-text are the size in effect.
 */
final class ControlSizes
{
    public const array SIZES = ['sm', 'md', 'lg'];

    /** size => property => default (a value, or a token chain: the first token the site has, else the last value). */
    public const array DEFAULTS = [
        'sm' => ['height' => '2.25rem', 'padding' => '0.75rem', 'text' => ['token:text.sm', '0.875rem']],
        'md' => ['height' => '2.75rem', 'padding' => '1rem', 'text' => ['token:text.base', '1rem']],
        'lg' => ['height' => '3.25rem', 'padding' => '1.25rem', 'text' => ['token:text.lg', '1.125rem']],
    ];

    /** The sizes' custom properties the site's tokens leave out, and the size in effect, by data-size (M by default). */
    public static function css(DesignJson $design): string
    {
        $tokens = $design->tokens();
        $defaults = [];

        foreach (self::DEFAULTS as $size => $properties) {
            foreach ($properties as $property => $default) {
                if (! isset($tokens["control.{$size}-{$property}"])) {
                    $defaults[] = "--control-{$size}-{$property}:".FieldStyles::fallback($default);
                }
            }
        }

        $out = ':root{'.implode(';', [...$defaults, self::pick('md')]).'}';

        foreach (self::SIZES as $size) {
            $out .= "[data-size={$size}]{".self::pick($size).'}';
        }

        return $out;
    }

    /** The declarations that make a size the one in effect. */
    public static function pick(string $size): string
    {
        return "--control-height:var(--control-{$size}-height);--control-padding:var(--control-{$size}-padding);--control-text:var(--control-{$size}-text)";
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Design;

use Cms\Modules\Blocks\Css;

/**
 * How every form field on a site looks: `fields` in tokens.json, part by part. How big a field is
 * comes from the control size scale buttons share (ControlSizes), not from here.
 *
 * Each property becomes a custom property (--field-height, --field-checkbox-size…) that
 * resources/css/fields.css reads, so one value reaches every kind of field: the fill of a
 * text field is the fill of a dropdown, a text area, a tag field and an empty checkbox.
 * A part's properties fall back to the shared ones (`field:part.key`), and those to the
 * site's tokens, so a site that sets nothing still gets finished fields in its own colors.
 */
final class FieldStyles
{
    /**
     * part => [property => [type, default, extra]]. Types: color, length, weight, shadow,
     * opacity, choice (one of `options`). A default is CSS, a token chain (a list: the
     * first token the site has, else the last value) or another property (`field:part.key`).
     */
    public const array PARTS = [
        'field' => [
            'background' => ['color', ['token:color.raised', 'token:color.background', 'transparent']],
            'borderWidth' => ['length', '1px'],
            'borderColor' => ['color', 'color-mix(in srgb, var(--color-border, currentColor) 70%, currentColor)', ['hint' => 'border']],
            'radius' => ['length', ['token:radius.md', '0.5rem'], ['tokens' => 'radius']],
            'color' => ['color', 'currentColor'],
            'placeholder' => ['color', ['token:color.muted', 'color-mix(in srgb, currentColor 50%, transparent)']],
            'shadow' => ['shadow', '0 0 #0000'],
        ],
        'hover' => [
            'background' => ['color', 'field:field.background'],
            'borderColor' => ['color', 'color-mix(in srgb, var(--field-border-color) 55%, currentColor)', ['hint' => 'darker']],
        ],
        'focus' => [
            'background' => ['color', 'field:field.background'],
            'borderColor' => ['color', ['token:color.focus', 'token:color.primary', 'currentColor']],
            'ringWidth' => ['length', '3px'],
            'ringColor' => ['color', 'color-mix(in srgb, var(--field-focus-border-color) 22%, transparent)', ['hint' => 'faint']],
        ],
        'invalid' => [
            'color' => ['color', ['token:color.danger', '#d92d20']],
            'ringColor' => ['color', 'color-mix(in srgb, var(--field-invalid-color) 20%, transparent)', ['hint' => 'faint']],
        ],
        'disabled' => [
            'opacity' => ['opacity', '0.55'],
            'background' => ['color', 'field:field.background'],
        ],
        'label' => [
            'fontSize' => ['length', ['token:text.sm', '0.875rem'], ['tokens' => 'text']],
            'fontWeight' => ['weight', ['token:weight.medium', '500']],
            'color' => ['color', 'currentColor'],
            'required' => ['color', ['token:color.muted', 'currentColor']],
        ],
        'help' => [
            'fontSize' => ['length', ['token:text.xs', '0.8125rem'], ['tokens' => 'text']],
            'color' => ['color', ['token:color.muted', 'currentColor']],
        ],
        'spacing' => [
            'size' => ['choice', 'md', ['options' => ['sm', 'md', 'lg']]],
            'fields' => ['length', '1.25rem', ['tokens' => 'space']],
            'label' => ['length', '0.375rem', ['tokens' => 'space']],
            'list' => ['length', '0.625rem', ['tokens' => 'space']],
            'choice' => ['length', '0.625rem', ['tokens' => 'space']],
        ],
        'select' => [
            'arrowColor' => ['color', 'color-mix(in srgb, currentColor 55%, transparent)', ['hint' => 'faint']],
            'arrowSize' => ['length', '0.3125rem'],
        ],
        'textarea' => [
            'minHeight' => ['length', '6.5rem'],
            'resize' => ['choice', 'vertical', ['options' => ['vertical', 'none']]],
        ],
        'checkbox' => [
            'size' => ['length', '1.125rem'],
            'radius' => ['length', ['token:radius.sm', '0.3125rem'], ['tokens' => 'radius']],
            'background' => ['color', 'field:field.background'],
            'borderColor' => ['color', 'field:field.borderColor'],
            'checked' => ['color', ['token:color.primary', 'currentColor']],
            'markColor' => ['color', ['token:color.primary-foreground', '#ffffff']],
            'mark' => ['choice', 'check', ['options' => ['check', 'square', 'dot']]],
            'markWeight' => ['choice', 'regular', ['options' => ['light', 'regular', 'bold']]],
            'markSize' => ['length', '80%', ['unit' => '%']],
        ],
        'radio' => [
            'size' => ['length', 'field:checkbox.size'],
            'style' => ['choice', 'dot', ['options' => ['dot', 'ring']]],
            'checked' => ['color', 'field:checkbox.checked'],
            'dotColor' => ['color', 'field:checkbox.markColor'],
            'dotSize' => ['length', '40%', ['unit' => '%']],
        ],
        'switch' => [
            'width' => ['length', '2.25rem'],
            'height' => ['length', '1.375rem'],
            'radius' => ['length', '999px', ['tokens' => 'radius']],
            'off' => ['color', 'color-mix(in srgb, currentColor 20%, transparent)', ['hint' => 'faint']],
            'on' => ['color', 'field:checkbox.checked'],
            'knob' => ['color', '#ffffff'],
            'inset' => ['length', '0.1875rem'],
            'knobShadow' => ['shadow', '0 1px 2px rgb(0 0 0 / 0.2)'],
        ],
        'slider' => [
            'trackHeight' => ['length', '0.375rem'],
            'track' => ['color', 'color-mix(in srgb, currentColor 14%, transparent)', ['hint' => 'faint']],
            'fill' => ['color', 'field:checkbox.checked'],
            'radius' => ['length', '999px', ['tokens' => 'radius']],
            'thumbSize' => ['length', '1.25rem'],
            'thumb' => ['color', '#ffffff'],
            'thumbBorder' => ['color', 'field:field.borderColor'],
            'thumbShadow' => ['shadow', '0 1px 3px rgb(0 0 0 / 0.16)'],
        ],
        'tags' => [
            'background' => ['color', 'color-mix(in srgb, currentColor 8%, transparent)', ['hint' => 'faint']],
            'color' => ['color', 'currentColor'],
            'radius' => ['length', ['token:radius.sm', '0.375rem'], ['tokens' => 'radius']],
        ],
        'chips' => [
            'radius' => ['length', '999px', ['tokens' => 'radius']],
            'background' => ['color', 'transparent'],
            'borderColor' => ['color', 'field:field.borderColor'],
            'selected' => ['color', ['token:color.foreground', 'currentColor']],
            'selectedText' => ['color', ['token:color.background', '#ffffff']],
        ],
        'file' => [
            'background' => ['color', 'color-mix(in srgb, currentColor 8%, transparent)', ['hint' => 'faint']],
            'color' => ['color', 'currentColor'],
            'radius' => ['length', ['token:radius.sm', '0.375rem'], ['tokens' => 'radius']],
        ],
    ];

    /** Stroke widths of the checkbox mark, on a 16 × 16 grid. */
    private const array WEIGHTS = ['light' => 1.75, 'regular' => 2.25, 'bold' => 3];

    /** The custom property a property sets: --field-height, --field-checkbox-size. */
    public static function variable(string $part, string $key): string
    {
        $name = strtolower((string) preg_replace('/[A-Z]/', '-$0', $key));

        return $part === 'field' ? "--field-{$name}" : "--field-{$part}-{$name}";
    }

    /** Only the parts and properties there are, with values CSS can take. */
    public static function clean(array $fields): array
    {
        $out = [];

        foreach (self::PARTS as $part => $properties) {
            foreach ((array) ($fields[$part] ?? []) as $key => $value) {
                $definition = $properties[$key] ?? null;

                if ($definition === null || ! (is_string($value) || is_int($value) || is_float($value)) || trim((string) $value) === '') {
                    continue;
                }

                if ($definition[0] === 'choice' && ! in_array($value, $definition[2]['options'], true)) {
                    continue;
                }

                $out[$part][$key] = $value;
            }
        }

        return $out;
    }

    /** Every --field-* property, with the site's values over the defaults: one rule, for the page and each themed section. */
    public static function css(array $fields): string
    {
        $fields = self::clean($fields);
        $vars = [];

        foreach (self::PARTS as $part => $properties) {
            foreach ($properties as $key => [$type, $default]) {
                if ($type === 'choice') {
                    continue;
                }

                $own = $fields[$part][$key] ?? null;
                $value = $own !== null ? self::value($own, $type) : null;
                $vars[] = self::variable($part, $key).':'.($value ?? self::fallback($default));
            }
        }

        $choice = static fn (string $part, string $key): string => (string) ($fields[$part][$key] ?? self::PARTS[$part][$key][1]);
        $weight = self::WEIGHTS[$choice('checkbox', 'markWeight')];
        $vars[] = '--field-textarea-resize:'.$choice('textarea', 'resize');
        $vars[] = '--field-checkbox-mark-icon:'.self::icon($choice('checkbox', 'mark'), $weight);
        $vars[] = '--field-checkbox-dash-icon:'.self::icon('dash', $weight);

        // A ring keeps the radio's fill and colors its border and dot; a dot fills it and dots it in the mark color.
        $ring = $choice('radio', 'style') === 'ring';
        $vars[] = '--field-radio-on-background:'.($ring ? 'var(--field-checkbox-background)' : 'var(--field-radio-checked)');
        $vars[] = '--field-radio-on-dot:'.($ring ? 'var(--field-radio-checked)' : 'var(--field-radio-dot-color)');

        // Fields in a form take the form size the site picks, unless the form names its own.
        $size = $choice('spacing', 'size');

        return ':root,[data-theme]{'.implode(';', $vars).'}'.($size !== 'md' ? '.cms-form:not([data-size]){'.ControlSizes::pick($size).'}' : '');
    }

    /**
     * What the admin draws the editor from: each part's properties with their type,
     * default (as CSS and as words for an empty control) and choices.
     */
    public static function schema(): array
    {
        $out = [];

        foreach (self::PARTS as $part => $properties) {
            foreach ($properties as $key => [$type, $default]) {
                $extra = self::PARTS[$part][$key][2] ?? [];
                $out[$part][$key] = array_filter([
                    'type' => $type,
                    'variable' => self::variable($part, $key),
                    'default' => is_string($default) && str_starts_with($default, 'field:') ? null : $default,
                    'inherits' => is_string($default) && str_starts_with($default, 'field:') ? substr($default, 6) : null,
                    'hint' => $extra['hint'] ?? null,
                    'tokens' => $extra['tokens'] ?? null,
                    'unit' => $extra['unit'] ?? null,
                    'options' => $extra['options'] ?? null,
                ], static fn ($v) => $v !== null);
            }
        }

        return $out;
    }

    private static function value(string|int|float $value, string $type): ?string
    {
        if (is_string($value) && str_starts_with($value, 'field:')) {
            [$part, $key] = explode('.', substr($value, 6), 2) + [1 => ''];

            return isset(self::PARTS[$part][$key]) ? 'var('.self::variable($part, $key).')' : null;
        }

        if (is_numeric($value) && $type === 'length' && (string) $value !== '0') {
            $value .= 'px';
        }

        return Css::value(is_numeric($value) ? (string) $value : $value);
    }

    /** A default as CSS: `field:` references and token chains become var()s with fallbacks. */
    public static function fallback(string|array $default): string
    {
        if (is_string($default)) {
            return self::value($default, '') ?? $default;
        }

        $css = '';

        foreach (array_reverse($default) as $item) {
            $variable = Css::variable((string) $item);
            $css = $variable === null ? (string) $item : ($css === '' ? "var({$variable})" : "var({$variable}, {$css})");
        }

        return $css;
    }

    /** The checkbox mark (or the dash of a mixed checkbox) as a mask image. */
    private static function icon(string $mark, float $weight): string
    {
        $shape = match ($mark) {
            'square' => "<rect x='3.5' y='3.5' width='9' height='9' rx='1.5'/>",
            'dot' => "<circle cx='8' cy='8' r='4'/>",
            'dash' => "<path d='M3.5 8h9' fill='none' stroke='black' stroke-width='{$weight}' stroke-linecap='round'/>",
            default => "<path d='M3 8.5l3.25 3.25L13 4.75' fill='none' stroke='black' stroke-width='{$weight}' stroke-linecap='round' stroke-linejoin='round'/>",
        };

        return 'url("data:image/svg+xml,'.rawurlencode("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'>{$shape}</svg>").'")';
    }
}

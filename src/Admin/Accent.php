<?php

declare(strict_types=1);

namespace Cms\Admin;

use Cms\Users\User;

/**
 * The admin's accent, its theme colour: going live (Publish, Go Live), switches that are on, highlights, focus,
 * selection and the chat's bubble, one colour in all of them. The site chooses it for everyone (Settings →
 * General → Theme Color) and a person may choose their own (Account, the `accent` preference), from a set
 * whose words on each fill reach 4.5:1 (WCAG 2.2, 1.4.3). The focus line is the fill wherever it stands out 3:1
 * from every surface it is drawn on, else the fill made darker (light) or lighter (dark) until it does (1.4.11).
 * Nothing chosen is amber, which the tokens already are, its line among them.
 */
final class Accent
{
    public const string DEFAULT = 'amber';

    /** Each accent: its fill (also its mark, a switch that is on, the washes and its focus line) and the words on it. */
    public const array PRESETS = [
        'amber' => ['label' => 'Amber', 'fill' => '#e9b03c', 'ink' => '#1c1b18', 'wash' => [0.2, 0.16]],
        'orange' => ['label' => 'Orange', 'fill' => '#f76b15', 'ink' => '#1c1b18'],
        'pink' => ['label' => 'Pink', 'fill' => '#e94184', 'ink' => '#1c1b18'],
        'violet' => ['label' => 'Violet', 'fill' => '#6e56cf', 'ink' => '#ffffff'],
        'blue' => ['label' => 'Blue', 'fill' => '#0d74ce', 'ink' => '#ffffff'],
        'green' => ['label' => 'Green', 'fill' => '#30a46c', 'ink' => '#1c1b18'],
        'monochrome' => ['label' => 'Monochrome', 'fill' => '#1c1b18', 'ink' => '#ffffff', 'dark' => ['fill' => '#f5f4f0', 'ink' => '#1a1a18']],
    ];

    /** How much of the accent a selection's wash is, on light and on dark, unless an accent says otherwise. */
    private const array WASH = [0.12, 0.16];

    /** The admin's ink as the accent: the same tokens as a primary button's, in whichever theme. */
    private const string INK = ':root,[data-theme]{--cms-tint:#8a8a8a;--cms-signal:var(--cms-ink);--cms-signal-ink:var(--cms-ink-contrast);--cms-knob:var(--cms-ink-contrast);--cms-signal-hover:var(--cms-ink-hover);--cms-signal-active:var(--cms-ink-active);--cms-focus:var(--cms-ink);--cms-focus-soft:color-mix(in srgb,var(--cms-ink) 8%,transparent);--cms-focus-hover:color-mix(in srgb,var(--cms-ink) 12%,transparent)}';

    /** One of the accents by its name, or null for anything else. */
    public static function normalize(mixed $value): ?string
    {
        return is_string($value) && isset(self::PRESETS[strtolower(trim($value))]) ? strtolower(trim($value)) : null;
    }

    /** What the site chose for everyone, or null for the brand's own. */
    public static function site(): ?string
    {
        return self::normalize(cms()->settingsRegistry()->get('site', 'admin_accent'));
    }

    /** The accent this person sees: their own, else the site's, else null (the brand's own). */
    public static function for(?User $user): ?string
    {
        return self::normalize(((array) ($user?->preferences ?? []))['accent'] ?? null) ?? self::site();
    }

    /**
     * The accents for the admin to offer and to wear, in order, the brand's first.
     *
     * @return list<array{name: string, label: string, fill: string, ink: string, dark: array{fill: string, ink: string}|null, css: string}>
     */
    public static function presets(): array
    {
        return array_map(static fn (string $name, array $preset) => ['name' => $name, 'label' => __($preset['label']), 'fill' => $preset['fill'], 'ink' => $preset['ink'], 'dark' => $preset['dark'] ?? null, 'css' => $name === self::DEFAULT ? '' : self::paint($name)], array_keys(self::PRESETS), self::PRESETS);
    }

    /** The tokens it sets, in every theme and every piece set in the other one: nothing for the brand's own. */
    public static function css(?string $name): string
    {
        $name = self::normalize($name);

        return $name === null || $name === self::DEFAULT ? '' : self::paint($name);
    }

    /** All it paints: the accent, and focus and selection in it, on light and on dark. */
    private static function paint(string $name): string
    {
        $preset = self::PRESETS[$name];
        if (isset($preset['dark'])) {
            return self::INK;
        }
        ['fill' => $fill, 'ink' => $ink] = $preset;
        [$focusLight, $focusDark] = [self::focus($fill, false), self::focus($fill, true)];
        [$washLight, $washDark] = $preset['wash'] ?? self::WASH;
        $rgb = implode(' ', array_map('hexdec', str_split(substr($fill, 1), 2)));
        $theme = static fn (string $focus, float $wash, float $more): string => "--cms-focus:{$focus};--cms-focus-soft:rgb({$rgb} / {$wash});--cms-focus-hover:rgb({$rgb} / ".($wash + $more).')';

        return ":root,[data-theme]{--cms-signal:{$fill};--cms-signal-ink:{$ink};".$theme($focusLight, $washLight, 0.04).'}'
            .'[data-theme="dark"]{'.$theme($focusDark, $washDark, 0.06).'}';
    }

    /**
     * The focus line of a fill in a theme: the fill itself where it stands out 3:1 from every surface a line is
     * drawn on, else the same hue a step darker (light) or lighter (dark) at a time, keeping its chroma where the
     * screen can show it, until it does.
     */
    public static function focus(string $fill, bool $dark): string
    {
        $surfaces = self::surfaces($fill, $dark);
        [$l, $a, $b] = self::oklab($fill);
        [$chroma, $hue] = [hypot($a, $b), atan2($b, $a)];
        $line = $fill;

        for ($step = 0; $step < 200 && $l >= 0 && $l <= 1; $step++) {
            $line = self::inGamut($l, $chroma, $hue);
            if (min(array_map(static fn (string $surface) => self::contrast($line, $surface), $surfaces)) >= 3.0) {
                return $line;
            }
            $l += $dark ? 0.005 : -0.005;
        }

        return $dark ? '#ffffff' : '#000000';
    }

    /**
     * Where a focus line is drawn, as the tokens mix them with this accent: the page, the desk and a row chosen on
     * it (light); the desk, the page, a float and a row chosen on it (dark).
     *
     * @return list<string>
     */
    public static function surfaces(string $fill, bool $dark): array
    {
        if (! $dark) {
            $desk = self::mix('#f4f4f4', $fill, 0.07);

            return ['#ffffff', $desk, self::mix($desk, self::mix('#2a2a2a', $fill, 0.3), 0.07)];
        }
        $float = self::mix('#222222', $fill, 0.07);

        return [self::mix('#121212', $fill, 0.07), self::mix('#1a1a1a', $fill, 0.06), $float, self::mix($float, self::mix('#ffffff', $fill, 0.22), 0.09)];
    }

    /** WCAG's contrast ratio of two colours. */
    public static function contrast(string $a, string $b): float
    {
        [$hi, $lo] = [max(self::luminance($a), self::luminance($b)), min(self::luminance($a), self::luminance($b))];

        return ($hi + 0.05) / ($lo + 0.05);
    }

    /** Two colours mixed in Oklab, `$share` of the second, as CSS's color-mix(in oklab, …) does. */
    private static function mix(string $a, string $b, float $share): string
    {
        [$x, $y] = [self::oklab($a), self::oklab($b)];

        return self::hex(self::fromOklab($x[0] + ($y[0] - $x[0]) * $share, $x[1] + ($y[1] - $x[1]) * $share, $x[2] + ($y[2] - $x[2]) * $share));
    }

    /** A colour of this lightness and hue with as much of the chroma as the screen can show. */
    private static function inGamut(float $l, float $chroma, float $hue): string
    {
        for (; $chroma > 0; $chroma -= 0.002) {
            $rgb = self::fromOklab($l, $chroma * cos($hue), $chroma * sin($hue));
            if (min($rgb) >= -0.0005 && max($rgb) <= 1.0005) {
                return self::hex($rgb);
            }
        }

        return self::hex(self::fromOklab($l, 0, 0));
    }

    /** @return array{float, float, float} */
    private static function oklab(string $hex): array
    {
        [$r, $g, $b] = array_map(static fn (string $pair) => self::linear(hexdec($pair) / 255), str_split(substr($hex, 1), 2));
        $l = (0.4122214708 * $r + 0.5363325363 * $g + 0.0514459929 * $b) ** (1 / 3);
        $m = (0.2119034982 * $r + 0.6806995451 * $g + 0.1073969566 * $b) ** (1 / 3);
        $s = (0.0883024619 * $r + 0.2817188376 * $g + 0.6299787005 * $b) ** (1 / 3);

        return [0.2104542553 * $l + 0.7936177850 * $m - 0.0040720468 * $s, 1.9779984951 * $l - 2.4285922050 * $m + 0.4505937099 * $s, 0.0259040371 * $l + 0.7827717662 * $m - 0.8086757660 * $s];
    }

    /** @return array{float, float, float} linear sRGB */
    private static function fromOklab(float $L, float $a, float $b): array
    {
        $l = ($L + 0.3963377774 * $a + 0.2158037573 * $b) ** 3;
        $m = ($L - 0.1055613458 * $a - 0.0638541728 * $b) ** 3;
        $s = ($L - 0.0894841775 * $a - 1.2914855480 * $b) ** 3;

        return [4.0767416621 * $l - 3.3077115913 * $m + 0.2309699292 * $s, -1.2684380046 * $l + 2.6097574011 * $m - 0.3413193965 * $s, -0.0041960863 * $l - 0.7034186147 * $m + 1.7076147010 * $s];
    }

    /** @param array{float, float, float} $rgb linear sRGB */
    private static function hex(array $rgb): string
    {
        return '#'.implode('', array_map(static function (float $v): string {
            $v = max(0.0, min(1.0, $v));
            $v = $v <= 0.0031308 ? 12.92 * $v : 1.055 * $v ** (1 / 2.4) - 0.055;

            return str_pad(dechex((int) round($v * 255)), 2, '0', STR_PAD_LEFT);
        }, $rgb));
    }

    private static function linear(float $v): float
    {
        return $v <= 0.04045 ? $v / 12.92 : (($v + 0.055) / 1.055) ** 2.4;
    }

    /** The words on a colour: the darker or the lighter ink, whichever stands out more. */
    public static function inkOn(string $hex): string
    {
        $l = self::luminance($hex);

        return 1.05 / ($l + 0.05) > ($l + 0.05) / (self::luminance('#1c1b18') + 0.05) ? '#ffffff' : '#1c1b18';
    }

    public static function luminance(string $hex): float
    {
        $c = array_map(static fn (string $pair): float => self::linear(hexdec($pair) / 255), str_split(substr($hex, 1), 2));

        return 0.2126 * $c[0] + 0.7152 * $c[1] + 0.0722 * $c[2];
    }
}

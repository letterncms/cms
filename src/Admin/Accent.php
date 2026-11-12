<?php

declare(strict_types=1);

namespace Cms\Admin;

use Cms\Users\User;

/**
 * The admin's accent, its theme colour: going live (Publish, Go Live), switches that are on, highlights, focus,
 * selection and the chat's bubble, one colour in all of them. The site chooses it for everyone (Settings →
 * General → Theme Color) and a person may choose their own (Account, the `accent` preference), from a set
 * whose words on each fill reach 4.5:1 and whose focus lines reach 3:1 on the page, in light and in dark
 * (WCAG 2.2, 1.4.3 and 1.4.11), but for amber's on light. Nothing chosen is amber, which the tokens already are.
 */
final class Accent
{
    public const string DEFAULT = 'amber';

    /**
     * Each accent: its fill (also its mark, a switch that is on, the washes), the words on it, and its focus
     * line on light and on dark. Amber's line is amber, 2:1 on white, with its halo: a deeper one is brown.
     */
    public const array PRESETS = [
        'amber' => ['label' => 'Amber', 'fill' => '#e9b03c', 'ink' => '#1c1b18', 'focus' => ['#e9b03c', '#e9b03c'], 'wash' => [0.2, 0.16]],
        'orange' => ['label' => 'Orange', 'fill' => '#f76b15', 'ink' => '#1c1b18', 'focus' => ['#e86515', '#f76b15']],
        'pink' => ['label' => 'Pink', 'fill' => '#e94184', 'ink' => '#1c1b18', 'focus' => ['#e94184', '#e94184']],
        'violet' => ['label' => 'Violet', 'fill' => '#6e56cf', 'ink' => '#ffffff', 'focus' => ['#6e56cf', '#8874d8']],
        'blue' => ['label' => 'Blue', 'fill' => '#0d74ce', 'ink' => '#ffffff', 'focus' => ['#0d74ce', '#2f87d5']],
        'green' => ['label' => 'Green', 'fill' => '#30a46c', 'ink' => '#1c1b18', 'focus' => ['#2f9f69', '#30a46c']],
        'monochrome' => ['label' => 'Monochrome', 'fill' => '#1c1b18', 'ink' => '#ffffff', 'focus' => ['#1c1b18', '#f5f4f0'], 'dark' => ['fill' => '#f5f4f0', 'ink' => '#1a1a18']],
    ];

    /** How much of the accent a selection's wash is, on light and on dark, unless an accent says otherwise. */
    private const array WASH = [0.12, 0.16];

    /** The admin's ink as the accent: the same tokens as a primary button's, in whichever theme. */
    private const string INK = ':root,[data-theme]{--cms-tint:#8a8a8a;--cms-signal:var(--cms-ink);--cms-signal-ink:var(--cms-ink-contrast);--cms-signal-hover:var(--cms-ink-hover);--cms-signal-active:var(--cms-ink-active);--cms-focus:var(--cms-ink);--cms-focus-soft:color-mix(in srgb,var(--cms-ink) 8%,transparent);--cms-focus-hover:color-mix(in srgb,var(--cms-ink) 12%,transparent)}';

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
        ['fill' => $fill, 'ink' => $ink, 'focus' => [$focusLight, $focusDark]] = $preset;
        [$washLight, $washDark] = $preset['wash'] ?? self::WASH;
        $rgb = implode(' ', array_map('hexdec', str_split(substr($fill, 1), 2)));
        $theme = static fn (string $focus, float $wash, float $more): string => "--cms-focus:{$focus};--cms-focus-soft:rgb({$rgb} / {$wash});--cms-focus-hover:rgb({$rgb} / ".($wash + $more).')';

        return ":root,[data-theme]{--cms-signal:{$fill};--cms-signal-ink:{$ink};".$theme($focusLight, $washLight, 0.04).'}'
            .'[data-theme="dark"]{'.$theme($focusDark, $washDark, 0.06).'}';
    }

    /** The words on a colour: the darker or the lighter ink, whichever stands out more. */
    public static function inkOn(string $hex): string
    {
        $l = self::luminance($hex);

        return 1.05 / ($l + 0.05) > ($l + 0.05) / (self::luminance('#1c1b18') + 0.05) ? '#ffffff' : '#1c1b18';
    }

    public static function luminance(string $hex): float
    {
        $c = array_map(static function (string $pair): float {
            $v = hexdec($pair) / 255;

            return $v <= 0.03928 ? $v / 12.92 : (($v + 0.055) / 1.055) ** 2.4;
        }, str_split(substr($hex, 1), 2));

        return 0.2126 * $c[0] + 0.7152 * $c[1] + 0.0722 * $c[2];
    }
}

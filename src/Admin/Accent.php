<?php

declare(strict_types=1);

namespace Cms\Admin;

use Cms\Users\User;

/**
 * The admin's accent: the colour of going live (Publish, Go Live), of highlights and of the chat's button.
 * The site sets it for everyone (Settings → General → Admin Accent) and a person may choose their own
 * (Account, the `accent` preference). One colour is all anyone picks: the words on it and its washes
 * are worked out from it, so it reads in light and dark.
 */
final class Accent
{
    /** The brand's yellow: what the tokens already say, so choosing it writes nothing. */
    public const string DEFAULT = '#ffe100';

    private const string DARK_INK = '#1c1b18';

    private const string LIGHT_INK = '#ffffff';

    /** A colour as the admin keeps it, `#rrggbb` in lowercase, or null for anything else. */
    public static function normalize(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }
        $value = strtolower(trim($value));
        if (preg_match('/^#([0-9a-f]{3})$/', $value, $short) === 1) {
            $value = '#'.implode('', array_map(static fn (string $c) => $c.$c, str_split($short[1])));
        }

        return preg_match('/^#[0-9a-f]{6}$/', $value) === 1 ? $value : null;
    }

    /** What the site set for everyone, or null for the brand's own. */
    public static function site(): ?string
    {
        return self::normalize(cms()->settingsRegistry()->get('site', 'admin_accent'));
    }

    /** The accent this person sees: their own, else the site's, else null (the brand's own). */
    public static function for(?User $user): ?string
    {
        return self::normalize(((array) ($user?->preferences ?? []))['accent'] ?? null) ?? self::site();
    }

    /** The words on the accent: the darker or the lighter ink, whichever stands out more. */
    public static function ink(string $hex): string
    {
        $l = self::luminance($hex);

        return (1.05) / ($l + 0.05) > ($l + 0.05) / (self::luminance(self::DARK_INK) + 0.05) ? self::LIGHT_INK : self::DARK_INK;
    }

    /**
     * The tokens it changes, for every theme and every piece set in the other one: empty for the brand's own.
     * The washes and the hover fills follow from `--cms-signal` in the tokens themselves.
     */
    public static function css(?string $hex): string
    {
        $hex = self::normalize($hex);
        if ($hex === null || $hex === self::DEFAULT) {
            return '';
        }

        return ':root,[data-theme]{--cms-signal:'.$hex.';--cms-signal-ink:'.self::ink($hex).'}';
    }

    private static function luminance(string $hex): float
    {
        $channels = array_map(static function (string $pair): float {
            $c = hexdec($pair) / 255;

            return $c <= 0.03928 ? $c / 12.92 : (($c + 0.055) / 1.055) ** 2.4;
        }, str_split(substr($hex, 1), 2));

        return 0.2126 * $channels[0] + 0.7152 * $channels[1] + 0.0722 * $channels[2];
    }
}

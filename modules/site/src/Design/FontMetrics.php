<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Design;

/**
 * What a font says about itself, read from its own tables (TrueType or OpenType, as a .ttf or .otf holds
 * them), and what a system font must be told to stand in for it without moving the text:
 *
 *   FontMetrics::read($ttf)                →  [unitsPerEm, ascent, descent, lineGap, width]
 *   FontMetrics::fallback($metrics, 'sans')  →  [sizeAdjust, ascentOverride, descentOverride, lineGapOverride]
 *
 * `width` is the average advance of the letters of running text, each counted as often as English uses
 * it, the space included: the same measure the system fonts below were taken by. A browser draws the
 * fallback at `size-adjust`, so its letters are as wide on average as the web font's, and gives it the web
 * font's ascent, descent and line gap (scaled back by that size), so a line is as tall. Lines break where
 * they will, and nothing moves when the web font arrives.
 */
final class FontMetrics
{
    /**
     * The system fonts a family can fall back on, by the kind of family: average letter width over the em.
     * Measured with read() from the fonts themselves; a browser slants them itself for an italic face.
     *
     * @var array<string, array{names: list<string>, width: float}>
     */
    public const array SYSTEM = [
        'sans' => ['names' => ['Arial'], 'width' => 0.4396],
        'serif' => ['names' => ['Times New Roman'], 'width' => 0.3984],
        'mono' => ['names' => ['Courier New'], 'width' => 0.6001],
    ];

    /** How often each letter turns up in English text, per thousand characters, the space included. */
    private const array FREQUENCY = [
        ' ' => 182, 'e' => 102, 't' => 75, 'a' => 65, 'o' => 62, 'i' => 57, 'n' => 57, 's' => 53, 'r' => 50, 'h' => 50,
        'l' => 33, 'd' => 33, 'u' => 23, 'c' => 22, 'm' => 20, 'f' => 20, 'w' => 17, 'g' => 16, 'p' => 15, 'y' => 14,
        'b' => 13, 'v' => 8, 'k' => 6, 'x' => 1, 'j' => 1, 'q' => 1, 'z' => 1,
    ];

    /**
     * @return array{unitsPerEm: int, ascent: int, descent: int, lineGap: int, width: float}|null null when this is no font this can read
     */
    public static function read(string $font): ?array
    {
        $tables = self::tables($font);

        if ($tables === null || ! isset($tables['head'], $tables['hhea'], $tables['hmtx'], $tables['cmap'], $tables['maxp'])) {
            return null;
        }

        $unitsPerEm = self::u16($tables['head'], 18);
        $ascent = self::s16($tables['hhea'], 4);
        $descent = self::s16($tables['hhea'], 6);
        $lineGap = self::s16($tables['hhea'], 8);

        // A font that says so wants its typographic metrics used (OS/2 fsSelection, bit 7), and browsers do.
        if (isset($tables['OS/2']) && strlen($tables['OS/2']) >= 78 && (self::u16($tables['OS/2'], 62) & 0x80)) {
            [$ascent, $descent, $lineGap] = [self::s16($tables['OS/2'], 68), self::s16($tables['OS/2'], 70), self::s16($tables['OS/2'], 72)];
        }

        $glyphs = self::glyphs($tables['cmap'], array_map('mb_ord', array_map('strval', array_keys(self::FREQUENCY))));
        $long = self::u16($tables['hhea'], 34);
        $sum = $weight = 0;

        foreach (self::FREQUENCY as $letter => $often) {
            $glyph = $glyphs[mb_ord((string) $letter)] ?? null;

            if ($glyph === null || $long === 0) {
                continue;
            }

            // Glyphs past the last full record share its advance.
            $sum += $often * self::u16($tables['hmtx'], 4 * min($glyph, $long - 1));
            $weight += $often;
        }

        // No advance widths (an empty or cut-short hmtx) is no width to stand a fallback in for.
        if ($unitsPerEm < 16 || $weight === 0 || $sum <= 0 || $ascent <= 0) {
            return null;
        }

        return ['unitsPerEm' => $unitsPerEm, 'ascent' => $ascent, 'descent' => abs($descent), 'lineGap' => max(0, $lineGap), 'width' => $sum / $weight / $unitsPerEm];
    }

    /**
     * What makes the system font $kind (sans, serif, mono) stand in for a font with these metrics.
     *
     * @param  array{unitsPerEm: int, ascent: int, descent: int, lineGap: int, width: float}  $metrics
     * @return array{fallback: string, sizeAdjust: string, ascentOverride: string, descentOverride: string, lineGapOverride: string}
     */
    public static function fallback(array $metrics, string $kind): array
    {
        $system = self::SYSTEM[$kind] ?? self::SYSTEM['sans'];
        // Between half and twice the system font's size: metrics that say otherwise are not a font's.
        $size = max(0.5, min(2.0, (float) $metrics['width'] / $system['width']));
        $percent = static fn (float $value): string => rtrim(rtrim(number_format($value * 100, 2, '.', ''), '0'), '.').'%';

        return [
            'fallback' => implode(', ', $system['names']),
            'sizeAdjust' => $percent($size),
            'ascentOverride' => $percent($metrics['ascent'] / $metrics['unitsPerEm'] / $size),
            'descentOverride' => $percent($metrics['descent'] / $metrics['unitsPerEm'] / $size),
            'lineGapOverride' => $percent($metrics['lineGap'] / $metrics['unitsPerEm'] / $size),
        ];
    }

    /** @return array<string, string>|null tag => the table's bytes */
    private static function tables(string $font): ?array
    {
        $version = substr($font, 0, 4);

        if (strlen($font) < 12 || ! in_array($version, ["\x00\x01\x00\x00", 'OTTO', 'true'], true)) {
            return null;
        }

        $count = self::u16($font, 4);
        $tables = [];

        for ($i = 0; $i < $count && $i < 64; $i++) {
            $at = 12 + 16 * $i;

            if ($at + 16 > strlen($font)) {
                return null;
            }

            [$offset, $length] = [self::u32($font, $at + 8), self::u32($font, $at + 12)];

            if ($offset + $length > strlen($font)) {
                return null;
            }

            $tables[substr($font, $at, 4)] = substr($font, $offset, $length);
        }

        return $tables;
    }

    /**
     * The glyph of each code point, from the font's Unicode character map (formats 4 and 12, which every
     * font for the web has one of).
     *
     * @param  list<int>  $codes
     * @return array<int, int>
     */
    private static function glyphs(string $cmap, array $codes): array
    {
        $best = null;

        for ($i = 0, $count = self::u16($cmap, 2); $i < $count && 4 + 8 * $i + 8 <= strlen($cmap); $i++) {
            [$platform, $encoding, $offset] = [self::u16($cmap, 4 + 8 * $i), self::u16($cmap, 6 + 8 * $i), self::u32($cmap, 8 + 8 * $i)];
            $format = $offset + 2 <= strlen($cmap) ? self::u16($cmap, $offset) : 0;

            if (($platform === 0 || ($platform === 3 && in_array($encoding, [1, 10], true))) && in_array($format, [4, 12], true)) {
                $best = $best === null || $format === 4 ? [$format, $offset] : $best;
            }
        }

        if ($best === null) {
            return [];
        }

        [$format, $at] = $best;
        $out = [];

        if ($format === 12) {
            for ($g = 0, $groups = self::u32($cmap, $at + 12); $g < $groups && $at + 16 + 12 * $g + 12 <= strlen($cmap); $g++) {
                [$start, $end, $glyph] = [self::u32($cmap, $at + 16 + 12 * $g), self::u32($cmap, $at + 20 + 12 * $g), self::u32($cmap, $at + 24 + 12 * $g)];

                foreach ($codes as $code) {
                    $code >= $start && $code <= $end && $out[$code] = $glyph + $code - $start;
                }
            }

            return $out;
        }

        $segments = intdiv(self::u16($cmap, $at + 6), 2);
        [$ends, $starts] = [$at + 14, $at + 16 + 2 * $segments];
        [$deltas, $ranges] = [$starts + 2 * $segments, $starts + 4 * $segments];

        if ($ranges + 2 * $segments > strlen($cmap)) {
            return [];
        }

        foreach ($codes as $code) {
            for ($s = 0; $s < $segments; $s++) {
                if ($code > self::u16($cmap, $ends + 2 * $s)) {
                    continue;
                }

                $start = self::u16($cmap, $starts + 2 * $s);

                if ($code >= $start) {
                    $range = self::u16($cmap, $ranges + 2 * $s);
                    $glyph = $range === 0 ? $code : (($pointer = $ranges + 2 * $s + $range + 2 * ($code - $start)) + 2 <= strlen($cmap) ? self::u16($cmap, $pointer) : 0);
                    $glyph !== 0 && $out[$code] = ($glyph + self::u16($cmap, $deltas + 2 * $s)) & 0xFFFF;
                }

                break;
            }
        }

        return $out;
    }

    private static function u16(string $bytes, int $at): int
    {
        return $at + 2 <= strlen($bytes) ? (ord($bytes[$at]) << 8) | ord($bytes[$at + 1]) : 0;
    }

    private static function s16(string $bytes, int $at): int
    {
        $value = self::u16($bytes, $at);

        return $value >= 0x8000 ? $value - 0x10000 : $value;
    }

    private static function u32(string $bytes, int $at): int
    {
        return (self::u16($bytes, $at) << 16) | self::u16($bytes, $at + 2);
    }
}

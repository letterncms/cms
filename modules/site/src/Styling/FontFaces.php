<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Styling;

/**
 * The site's fonts as @font-face rules. A face may name a local font to draw until it arrives, at
 * the web font's size, so the text doesn't move when it does:
 *
 *   { family: "Hanken Grotesk", …, fallback: "Arial", sizeAdjust: "102%", ascentOverride: "98%", descentOverride: "26%", lineGapOverride: "0%" }
 *
 * becomes a second face, "Hanken Grotesk Fallback", which the theme names after the family:
 * --font-sans: "Hanken Grotesk", "Hanken Grotesk Fallback", sans-serif.
 */
final class FontFaces
{
    /** A font weight as @font-face takes it: one number from 1 to 1000, or the two ends of a variable axis ("100 1000"). */
    public const string WEIGHT = '/^[1-9]\d{0,3}( [1-9]\d{0,3})?$/D';

    /** A font family's name: letters, digits, spaces and hyphens on one line. */
    private const string FAMILY = '/^[\w -]{1,60}$/uD';

    /** What a font face may say about the fallback drawn until it arrives. */
    public const array FALLBACK = ['fallback', 'sizeAdjust', 'ascentOverride', 'descentOverride', 'lineGapOverride'];

    /**
     * @param  list<array<string, mixed>>  $fonts
     * @param  callable(string): ?string  $url  resolves a font src to a public URL
     */
    public function css(array $fonts, callable $url): string
    {
        $out = [];
        $fallbacks = [];

        foreach ($fonts as $font) {
            $family = (string) ($font['family'] ?? '');
            $style = ($font['style'] ?? 'normal') === 'italic' ? 'italic' : 'normal';
            $locals = array_filter(array_map('trim', is_array($font['fallback'] ?? null) ? $font['fallback'] : explode(',', (string) ($font['fallback'] ?? ''))), static fn ($name) => is_string($name) && preg_match(self::FAMILY, $name));

            if ($locals === [] || ! preg_match(self::FAMILY, $family) || isset($fallbacks[$family.'|'.$style])) {
                continue;
            }

            $fallbacks[$family.'|'.$style] = true;
            $css = ['font-family:"'.$family.' Fallback"', 'src:'.implode(',', array_map(static fn (string $name) => 'local("'.$name.'")', $locals)), 'font-style:'.$style];

            foreach (['sizeAdjust' => 'size-adjust', 'ascentOverride' => 'ascent-override', 'descentOverride' => 'descent-override', 'lineGapOverride' => 'line-gap-override'] as $key => $property) {
                if (is_string($font[$key] ?? null) && preg_match('/^\d{1,3}(\.\d{1,3})?%$/D', $font[$key])) {
                    $css[] = $property.':'.$font[$key];
                }
            }

            $out[] = '@font-face{'.implode(';', $css).'}';
        }

        foreach ($fonts as $font) {
            $src = isset($font['src']) ? $url((string) $font['src']) : null;

            if ($src === null || ! isset($font['family']) || ! preg_match(self::FAMILY, (string) $font['family'])) {
                continue;
            }

            $out[] = sprintf(
                '@font-face{font-family:"%s";src:url("%s") format("woff2");font-weight:%s;font-style:%s;font-display:%s}',
                $font['family'], str_replace('"', '', $src),
                preg_match(self::WEIGHT, (string) ($font['weight'] ?? '400')) ? $font['weight'] ?? '400' : '400',
                ($font['style'] ?? 'normal') === 'italic' ? 'italic' : 'normal',
                // A face the page doesn't preload can arrive late: it must not move text that's already there.
                in_array($font['display'] ?? null, ['swap', 'optional', 'fallback', 'block'], true) ? $font['display'] : (empty($font['preload']) ? 'optional' : 'swap'),
            );
        }

        return $out === [] ? '' : implode("\n", $out)."\n";
    }
}

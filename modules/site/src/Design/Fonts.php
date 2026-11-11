<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Design;

use Illuminate\Support\Str;
use InvalidArgumentException;
use Cms\Support\Files;
use Cms\Support\SafeFetcher;
use RuntimeException;

/**
 * Self-hosted fonts in content/design/fonts: imported from Google Fonts (no
 * requests to Google from the site afterwards) or uploaded as .woff2.
 */
final class Fonts
{
    /** Google serves woff2 only to browsers it recognizes. */
    private const string BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

    /** Tests answer in Google's place: fn (string $url): string, throwing RuntimeException for what isn't there. */
    public ?\Closure $fetcher = null;

    public function __construct(private readonly Design $design) {}

    private function fetch(string $url, int $max): string
    {
        return $this->fetcher ? ($this->fetcher)($url) : SafeFetcher::get($url, $max, 20, 3, self::BROWSER)['body'];
    }

    /**
     * Download a family as it really is: the weights its variable axis spans (or the static weights it has),
     * upright, italic or both, each file once.
     *
     * @param  string  $style  normal, italic or both; italic is left out when the family has none
     * @param  list<int>  $weights  static weights to take when the family has no weight axis; 400 to 700 of what it has otherwise
     * @return list<array> the font entries added to the design system
     */
    public function import(string $family, string $style = 'normal', array $weights = []): array
    {
        $family = trim($family);

        if (! preg_match('/^[A-Za-z0-9 ]{2,60}$/', $family)) {
            throw new InvalidArgumentException(__('Use the family name as Google Fonts shows it, like “Inter Tight”.'));
        }

        // What the family has, from Google's own description of it: asking for more is an error there.
        try {
            $about = json_decode((string) preg_replace('/^\)\]\}\'\s*/', '', $this->fetch('https://fonts.google.com/metadata/fonts/'.rawurlencode($family), 500_000)), true);
        } catch (RuntimeException) {
            $about = null;
        }

        if (! is_array($about) || ! is_array($about['fonts'] ?? null)) {
            throw new InvalidArgumentException(__('Google Fonts has no family called “:family”.', ['family' => $family]));
        }

        $has = array_map('strval', array_keys($about['fonts']));
        $upright = array_values(array_filter($has, 'ctype_digit'));
        $slanted = array_map(static fn (string $key) => substr($key, 0, -1), array_values(array_filter($has, static fn (string $key) => str_ends_with($key, 'i'))));
        $styles = match (true) {
            $style === 'italic' && $slanted !== [] => [1 => $slanted],
            $style === 'both' && $slanted !== [] && $upright !== [] => [0 => $upright, 1 => $slanted],
            $upright !== [] => [0 => $upright],
            default => [1 => $slanted],
        };
        $axis = current(array_filter((array) ($about['axes'] ?? []), static fn ($a) => is_array($a) && ($a['tag'] ?? null) === 'wght')) ?: null;
        $tuples = [];

        foreach ($styles as $ital => $available) {
            if ($axis !== null) {
                $tuples[] = [$ital, ((int) $axis['min']).'..'.((int) $axis['max'])];

                continue;
            }

            $wanted = array_values(array_intersect($available, array_map('strval', $weights ?: [400, 500, 600, 700]))) ?: [in_array('400', $available, true) ? '400' : $available[0]];

            foreach ($wanted as $weight) {
                $tuples[] = [$ital, $weight];
            }
        }

        $ital = count($styles) > 1 || isset($styles[1]);
        $query = ($ital ? 'ital,wght@' : 'wght@').implode(';', array_map(static fn (array $t) => $ital ? "{$t[0]},{$t[1]}" : $t[1], $tuples));

        try {
            $css = $this->fetch('https://fonts.googleapis.com/css2?family='.str_replace(' ', '+', $family).':'.$query.'&display=swap', 500_000);
        } catch (RuntimeException) {
            throw new InvalidArgumentException(__('Google Fonts has no Latin .woff2 files for “:family”.', ['family' => $family]));
        }

        // Only the latin subset of each face.
        preg_match_all('#/\*\s*latin\s*\*/\s*@font-face\s*\{([^}]*)\}#', $css, $faces);
        $slug = Str::slug($family);
        $files = [];

        foreach ($faces[1] as $face) {
            if (! preg_match('#src:\s*url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)#', $face, $src)) {
                continue;
            }

            $italic = (bool) preg_match('/font-style:\s*italic/', $face);
            $weight = preg_match('/font-weight:\s*([\d ]+);/', $face, $w) ? array_map('intval', explode(' ', trim($w[1]))) : [400];
            // One file serves every weight that names it: kept once, for the span of them.
            $files[$src[1]] ??= ['italic' => $italic, 'min' => min($weight), 'max' => max($weight)];
            $files[$src[1]]['min'] = min($files[$src[1]]['min'], ...$weight);
            $files[$src[1]]['max'] = max($files[$src[1]]['max'], ...$weight);
        }

        $added = [];

        foreach ($files as $url => $face) {
            $data = $this->fetch($url, 2_000_000);

            if (! str_starts_with($data, 'wOF2')) {
                continue;
            }

            $weight = $face['min'] === $face['max'] ? (string) $face['min'] : "{$face['min']} {$face['max']}";
            $file = $slug.'-'.str_replace(' ', '-', $weight).($face['italic'] ? '-italic' : '').'.woff2';
            Files::put($this->design->path('fonts/'.$file), $data);
            // The upright face that holds 400 is what a page starts with.
            $added[] = ['family' => $family, 'src' => 'fonts/'.$file, 'weight' => $weight, 'style' => $face['italic'] ? 'italic' : 'normal', 'preload' => ! $face['italic'] && $face['min'] <= 400 && $face['max'] >= 400];
        }

        if ($added === []) {
            throw new InvalidArgumentException(__('Google Fonts has no Latin .woff2 files for “:family”.', ['family' => $family]));
        }

        $this->remember($family, $added);

        return $added;
    }

    public function upload(string $family, string $name, string $base64, string $weight, string $style): array
    {
        $data = base64_decode(preg_replace('#^data:[^,]*,#', '', $base64) ?? '', true);

        if ($data === false || ! str_starts_with($data, 'wOF2')) {
            throw new InvalidArgumentException(__('Upload a .woff2 font file.'));
        }

        if (! preg_match(DesignCompiler::WEIGHT, $weight)) {
            throw new InvalidArgumentException(__('The weight is a number like 400, or a range like 100 900.'));
        }

        $file = Str::slug($name ?: $family).'-'.str_replace(' ', '-', $weight).($style === 'italic' ? '-italic' : '').'.woff2';
        Files::put($this->design->path('fonts/'.$file), $data);
        $font = ['family' => trim($family), 'src' => 'fonts/'.$file, 'weight' => $weight, 'style' => $style === 'italic' ? 'italic' : 'normal'];
        $this->remember(trim($family), [$font], replace: false);

        return $font;
    }

    /** Add font faces to the design system (replacing earlier faces of the family, and their files nothing names any more). */
    private function remember(string $family, array $faces, bool $replace = true): void
    {
        $json = $this->design->json();
        $before = $json->fonts();
        // What the family already says about its fallback stays with it.
        $kept = array_intersect_key((array) (current(array_filter($before, static fn ($f) => ($f['family'] ?? null) === $family && isset($f['fallback']))) ?: []), array_flip(DesignCompiler::FALLBACK));
        $fonts = $replace ? array_values(array_filter($before, static fn ($f) => ($f['family'] ?? null) !== $family)) : $before;
        $fonts = [...$fonts, ...array_map(static fn (array $face) => [...$face, ...$kept], $faces)];
        $json->setFonts($fonts);
        $json->save();

        $named = array_map(static fn ($f) => basename((string) ($f['src'] ?? '')), $fonts);

        foreach ($replace ? $before : [] as $old) {
            $file = basename((string) ($old['src'] ?? ''));

            if (($old['family'] ?? null) === $family && preg_match('/^[\w.-]+\.woff2$/', $file) && ! in_array($file, $named, true)) {
                @unlink($this->design->path('fonts/'.$file));
            }
        }
    }
}

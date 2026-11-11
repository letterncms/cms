<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks;

/**
 * Wraps each word of rendered HTML in spans, so words can animate without a script
 * and before first paint. The text stays real text: no duplicates for screen readers,
 * tags stay where they are, a link stays one tab stop and spaces stay between words.
 *
 *   The <em>CMS</em>  →  <span class="cms-w"><span class="cms-w__i" style="--i:0">The</span></span> <em>…</em>
 *
 * Letters are split inside their word, so a word never breaks across lines. A screen reader would spell
 * a word made of spans, so the block says its text once in aria-label and the split words are hidden from
 * it; there is no second copy of the text for a crawler or a reader mode to find:
 *
 *   <h1 aria-label="The CMS"><span class="cms-w" aria-hidden="true"><span class="cms-w__i" style="--i:0"><span class="cms-c" style="--i:0">T</span>…
 *
 * That needs a block whose text is all there is to it. With a link or a control inside (which hiding
 * would take from the keyboard), or in a script whose letters join or stack (Arabic, Devanagari…), where
 * a letter alone is another shape, the words animate instead.
 *
 * Lines aren't in the HTML: the runtime finds which words share one once the text is laid out.
 */
final class TextSplit
{
    /** Past this many words, animating each one is not worth the markup. */
    public const int LIMIT = 200;

    /** Past this many letters, the words animate instead. */
    public const int CHARS = 600;

    private const array SKIP = ['script', 'style', 'svg', 'pre', 'code', 'textarea', 'select', 'noscript'];

    /** Scripts whose letters change shape next to each other: split apart they are other letters. */
    private const string JOINING = '/[\p{Arabic}\p{Syriac}\p{Nko}\p{Mongolian}\p{Mandaic}\p{Adlam}\p{Devanagari}\p{Bengali}\p{Gurmukhi}\p{Gujarati}\p{Oriya}\p{Tamil}\p{Telugu}\p{Kannada}\p{Malayalam}\p{Sinhala}\p{Khmer}\p{Myanmar}\p{Tibetan}]/u';

    public static function html(string $html, bool $mask = false, bool $chars = false): string
    {
        if (str_contains($html, 'cms-w__i')) {
            return $html;
        }

        // Letters only where they can be split and the block can speak for them (see above).
        if ($chars && (preg_match(self::JOINING, $html) || preg_match('/<(a|button|input|select|textarea|summary|iframe|video|audio)\b/i', $html) || ! preg_match('/^\s*<[a-z][a-z0-9]*\b[^>]*>/i', $html) || preg_match('/^\s*<[^>]*\saria-label(ledby)?=/i', $html))) {
            $chars = false;
        }

        $tokens = preg_split('/(<!--.*?-->|<[^>]*>)/s', $html, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY) ?: [];
        $out = '';
        $skip = 0;
        $words = 0;
        $letters = 0;

        foreach ($tokens as $token) {
            if ($token[0] === '<') {
                if (preg_match('#^<(/?)([a-z0-9-]+)#i', $token, $m) && in_array(strtolower($m[2]), self::SKIP, true)) {
                    $skip += $m[1] === '' ? 1 : -1;
                }

                $out .= $token;

                continue;
            }

            if ($skip > 0) {
                $out .= $token;

                continue;
            }

            foreach (preg_split('/(\s+)/u', $token, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY) ?: [] as $part) {
                if (trim($part) === '') {
                    $out .= $part;

                    continue;
                }

                if (++$words > self::LIMIT) {
                    return $html;
                }

                $class = 'cms-w'.($mask ? ' cms-w--mask' : '');

                if (! $chars) {
                    $out .= '<span class="'.$class.'"><span class="cms-w__i" style="--i:'.($words - 1).'">'.$part.'</span></span>';

                    continue;
                }

                // One span per letter as a reader sees it: an entity or an emoji with its modifiers is one.
                preg_match_all('/&[a-z0-9#]+;|\X/iu', $part, $m);
                $inner = '';

                foreach ($m[0] as $letter) {
                    $inner .= '<span class="cms-c" style="--i:'.$letters++.'">'.$letter.'</span>';
                }

                if ($letters > self::CHARS) {
                    return self::html($html, $mask);
                }

                $out .= '<span class="'.$class.'" aria-hidden="true"><span class="cms-w__i" style="--i:'.($words - 1).'">'.$inner.'</span></span>';
            }
        }

        if ($chars) {
            // The block's text, once, for whoever can't see the letters.
            $label = trim((string) preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags((string) preg_replace('/<br\s*\/?>/i', ' ', $html)), ENT_QUOTES | ENT_HTML5)));
            $out = (string) preg_replace('/^(\s*<[a-z][a-z0-9]*\b)/i', '$1 aria-label="'.str_replace('$', '\\$', e($label)).'"', $out, 1);
        }

        return $out;
    }
}

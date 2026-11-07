<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Design;

use Cms\Modules\Blocks\Css;
use Cms\Modules\Blocks\StyleCompiler;

/**
 * Turns the design system into one stylesheet: a small reset, @font-face rules,
 * tokens as custom properties (+ dark mode), element defaults, prose styles,
 * form fields, button variants and page transitions. custom.css is appended by Design.
 */
final class DesignCompiler
{
    /** Short element-style keys from earlier versions (and handy for agents). */
    private const array SHORT = [
        'font' => 'font-family', 'size' => 'font-size', 'weight' => 'font-weight', 'leading' => 'line-height',
        'tracking' => 'letter-spacing', 'transform' => 'text-transform', 'decoration' => 'text-decoration',
        'underlineOffset' => 'text-underline-offset', 'wrap' => 'text-wrap', 'style' => 'font-style', 'features' => 'font-feature-settings',
        'background' => 'background-color', 'radius' => 'border-radius',
    ];

    public const array ELEMENTS = [
        'html', 'body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'a:hover', 'small', 'strong', 'em', 'mark', 'code', 'kbd', 'pre', 'blockquote',
        'hr', 'ul', 'ol', 'li', 'img', 'figcaption', 'table', 'th', 'td', '::selection', ':focus-visible',
        'h1 em', 'h2 em', 'h3 em', 'h1 strong', 'h2 strong',
    ];

    /** The elements prose styles: every one is in the Design System's prose sample. */
    public const array PROSE_ELEMENTS = [
        'h2', 'h3', 'h4', 'p', 'a', 'a:hover', 'strong', 'em', 'mark', 'small', 'code', 'kbd', 'pre', 'blockquote', 'hr', 'ul', 'ol', 'li', 'img', 'figcaption', 'table', 'th', 'td', '::selection',
    ];

    /** @param callable(string): ?string $fontUrl resolves a font src to a public URL */
    public function css(DesignJson $design, callable $fontUrl): string
    {
        $out = ['@layer theme, base, elements, components, utilities;'];
        $out[] = (string) file_get_contents(dirname(__DIR__, 2).'/resources/css/reset.css');

        foreach ($design->fonts() as $font) {
            $src = isset($font['src']) ? $fontUrl((string) $font['src']) : null;

            if ($src === null || ! isset($font['family']) || ! preg_match('/^[\w\s-]{1,60}$/u', (string) $font['family'])) {
                continue;
            }

            $out[] = sprintf(
                '@font-face{font-family:"%s";src:url("%s") format("woff2");font-weight:%s;font-style:%s;font-display:%s}',
                $font['family'], str_replace('"', '', $src),
                preg_match('/^\d{3}( \d{3})?$/', (string) ($font['weight'] ?? '400')) ? $font['weight'] ?? '400' : '400',
                ($font['style'] ?? 'normal') === 'italic' ? 'italic' : 'normal',
                // A face the page doesn't preload can arrive late: it must not move text that's already there.
                in_array($font['display'] ?? null, ['swap', 'optional', 'fallback', 'block'], true) ? $font['display'] : (empty($font['preload']) ? 'optional' : 'swap'),
            );
        }

        $light = [];
        $dark = [];

        foreach ($design->tokens() as $token) {
            $value = $this->value($token);

            if ($value === null) {
                continue;
            }

            $var = '--'.DesignJson::GROUPS[$token['group']].'-'.$token['name'];
            $light[] = "{$var}:{$value}";

            if ($token['dark'] !== null && ($darkValue = $this->value([...$token, 'value' => $token['dark']])) !== null) {
                $dark[] = "{$var}:{$darkValue}";
            }
        }

        $out[] = ':root{'.implode(';', $light).'}';
        // Buttons and fields share one size scale; fields read their look from these, a themed section works them out again.
        $out[] = ControlSizes::css($design);
        $out[] = FieldStyles::css($design->fields());

        if ($dark !== []) {
            $block = implode(';', $dark);
            $out[] = "@media (prefers-color-scheme:dark){:root:not([data-theme=light]){{$block};color-scheme:dark}}";
            $out[] = "[data-theme=dark]{{$block};color-scheme:dark}";
        }

        $elements = [];

        foreach ($design->styles() as $selector => $declarations) {
            if (in_array($selector, self::ELEMENTS, true) && is_array($declarations) && ($css = $this->declarations($declarations)) !== '') {
                $elements[] = "{$selector}{{$css}}";
            }
        }

        $spacing = [];

        foreach (DesignJson::PROSE_SPACING as $key => $var) {
            $value = $design->proseSpacing()[$key] ?? null;
            $resolved = is_scalar($value) && $value !== '' ? Css::value(is_numeric($value) && (string) $value !== '0' ? $value.'px' : (string) $value) : null;

            if ($resolved !== null) {
                $spacing[] = "--prose-{$var}:{$resolved}";
            }
        }

        if ($spacing !== []) {
            $elements[] = '.cms-prose{'.implode(';', $spacing).'}';
        }

        foreach ($design->prose() as $selector => $declarations) {
            if (! in_array($selector, self::ELEMENTS, true) || ! is_array($declarations)) {
                continue;
            }

            // Space above an element is part of the flow: it opens a gap after the block before, never above the first.
            $above = array_intersect_key($declarations, ['marginTop' => true]);

            $text = self::proseText($selector);

            if (($css = $this->declarations(array_diff_key($declarations, $above))) !== '') {
                $elements[] = ".cms-prose {$text}{{$css}}";
            }

            if ($above !== [] && ! str_contains($selector, ':') && ! str_contains($selector, ' ') && ($css = $this->declarations($above)) !== '') {
                $elements[] = ".cms-prose > * + {$text},.cms-prose > [data-cms-contents] > * + {$text},.cms-prose > * + [data-cms-contents] > {$text}:first-child{{$css}}";
            }
        }

        if ($elements !== []) {
            $out[] = '@layer elements{'.implode('', $elements).'}';
        }

        $out[] = (string) file_get_contents(dirname(__DIR__, 2).'/resources/css/buttons.css');
        $out[] = (string) file_get_contents(dirname(__DIR__, 2).'/resources/css/fields.css');
        $buttons = [];

        foreach ($design->buttons() as $variant => $states) {
            if (! is_string($variant) || ! preg_match('/^[a-z][a-z0-9-]{0,30}$/', $variant) || ! is_array($states)) {
                continue;
            }

            $states = isset($states['base']) || isset($states['hover']) ? $states : ['base' => $states];

            foreach (['base' => '', 'hover' => ':hover', 'active' => ':active', 'focus-visible' => ':focus-visible'] as $state => $pseudo) {
                // A variant is a look: its size is the control size scale's, so it sets no height, padding or text size.
                if (is_array($states[$state] ?? null) && ($css = $this->declarations(array_filter($states[$state], fn ($key) => ! in_array($this->property((string) $key), self::SIZING, true), ARRAY_FILTER_USE_KEY))) !== '') {
                    $selector = ".cms-button[data-variant=\"{$variant}\"]";
                    // The specimen shows a state with data-cms-state, without a pointer.
                    $forced = $state === 'base' ? '' : ",{$selector}[data-cms-state~=".($state === 'focus-visible' ? 'focus' : $state).']';
                    $buttons[] = $state === 'hover' ? "@media (hover:hover){{$selector}{$pseudo}{{$css}}}{$selector}[data-cms-state~=hover]{{$css}}" : "{$selector}{$pseudo}{$forced}{{$css}}";
                }
            }
        }

        if ($buttons !== []) {
            $out[] = '@layer components{@layer button-variants{'.implode('', $buttons).'}}';
        }

        $transition = $design->transition();

        if ($transition['type'] !== 'none') {
            $d = $transition['duration'].'s';
            $out[] = '@view-transition{navigation:auto}';
            $out[] = match ($transition['type']) {
                'slide' => "@keyframes cms-vt-out{to{opacity:0;transform:translateY(-12px)}}@keyframes cms-vt-in{from{opacity:0;transform:translateY(16px)}}::view-transition-old(root){animation:cms-vt-out {$d} cubic-bezier(.4,0,.2,1) both}::view-transition-new(root){animation:cms-vt-in {$d} cubic-bezier(.2,.8,.2,1) both}",
                'scale' => "@keyframes cms-vt-out{to{opacity:0;transform:scale(.98)}}@keyframes cms-vt-in{from{opacity:0;transform:scale(1.02)}}::view-transition-old(root){animation:cms-vt-out {$d} ease both}::view-transition-new(root){animation:cms-vt-in {$d} ease both}",
                default => "::view-transition-old(root),::view-transition-new(root){animation-duration:{$d}}",
            };
            $out[] = '@media (prefers-reduced-motion:reduce){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}';
        }

        return implode("\n", $out)."\n";
    }

    /** What sizes a button: the control size scale's alone. */
    private const array SIZING = ['height', 'min-height', 'max-height', 'width', 'min-width', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'padding-inline', 'padding-block', 'font-size', 'line-height'];

    private function property(string $key): ?string
    {
        return self::SHORT[$key] ?? StyleCompiler::PROPERTIES[StyleCompiler::ALIASES[$key] ?? $key][0] ?? null;
    }

    /** camelCase (or short) keys → declarations. */
    /**
     * An element of prose as text: never a Box or a Repeat drawn as that element (a nav as a list, a card as
     * a link), which are layout; the text inside them still is. `a:hover` → `a:where(:not(.cms-box, .cms-repeat)):hover`.
     */
    private static function proseText(string $selector): string
    {
        if (str_starts_with($selector, ':')) {
            return $selector;
        }

        // A list item belongs to its list: the items of a list that is a Box or a Repeat are its layout too.
        if ($selector === 'li') {
            return ':where(ul:not(.cms-box, .cms-repeat), ol:not(.cms-box, .cms-repeat)) > li';
        }

        return (string) preg_replace('/^(.*?)([a-z][a-z0-9]*)((?::[a-z-]+)*)$/', '$1$2:where(:not(.cms-box, .cms-repeat))$3', $selector);
    }

    public function declarations(array $declarations): string
    {
        $css = [];

        foreach ($declarations as $key => $value) {
            $key = (string) $key;
            $property = self::SHORT[$key] ?? StyleCompiler::PROPERTIES[StyleCompiler::ALIASES[$key] ?? $key][0] ?? null;
            $resolved = is_array($value) ? null : Css::value(is_numeric($value) && ! in_array($key, ['weight', 'fontWeight', 'leading', 'lineHeight', 'opacity', 'zIndex'], true) && (string) $value !== '0' ? $value.'px' : $value);

            if ($property && $resolved !== null) {
                $css[] = "{$property}:{$resolved}";
            }
        }

        return implode(';', $css);
    }

    private function value(array $token): ?string
    {
        $value = $token['value'];

        if (is_array($value) && isset($value['min'], $value['max'])) {
            return $this->fluid((string) $value['min'], (string) $value['max']);
        }

        if ($token['group'] === 'font' && is_array($value)) {
            $families = array_map(static fn ($f) => preg_match('/\s/', (string) $f) && ! str_contains((string) $f, '"') ? "\"{$f}\"" : (string) $f, $value);
            $value = implode(', ', $families);
        }

        if (is_array($value)) {
            return null;
        }

        return Css::value((string) $value);
    }

    /** clamp() between 360px and 1280px viewports. */
    public function fluid(string $min, string $max): ?string
    {
        $toRem = static fn (string $v): ?float => match (true) {
            str_ends_with($v, 'rem') => (float) $v,
            str_ends_with($v, 'px') => (float) $v / 16,
            is_numeric($v) => (float) $v / 16,
            default => null,
        };

        $a = $toRem($min);
        $b = $toRem($max);

        if ($a === null || $b === null) {
            return null;
        }

        $from = 22.5;
        $to = 80;
        $slope = ($b - $a) / ($to - $from);
        $intercept = $a - $slope * $from;

        return sprintf('clamp(%srem, %srem + %svw, %srem)', $this->n(min($a, $b)), $this->n($intercept), $this->n($slope * 100), $this->n(max($a, $b)));
    }

    private function n(float $value): string
    {
        return rtrim(rtrim(number_format($value, 4, '.', ''), '0'), '.') ?: '0';
    }
}

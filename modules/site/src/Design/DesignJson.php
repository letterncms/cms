<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Design;

use InvalidArgumentException;
use Cms\Support\Files;

/**
 * content/design/tokens.json — the design system of a site.
 *
 *   tokens       DTCG design tokens (color, font, text, leading, tracking, weight, space, radius, shadow, container, control, breakpoint, duration, ease);
 *                control holds the size scale of buttons and fields: control.sm-height, control.md-padding, control.lg-text…
 *   fonts        self-hosted fonts: [{family, src: "fonts/Inter.woff2", weight: "100 900", style, preload}]
 *                a face may name what is drawn until it arrives, at its size, so text doesn't move:
 *                {…, fallback: "Arial", sizeAdjust: "102%", ascentOverride: "98%", descentOverride: "26%", lineGapOverride: "0%"}
 *   styles       element defaults: { body: {...}, h1: {...}, a: {...}, "a:hover": {...} } — camelCase CSS, tokens allowed
 *   prose        long-form text, in any block styled as prose: element styles { h2: {...}, p: {...} } (marginTop is the space
 *                above it, after the block before) and `spacing`, the flow between its blocks: { blocks, headings, afterHeadings, items }
 *   buttons      button variants, each a look: { primary: { base: {...}, hover: {...} }, secondary: {...} } (sizes are control tokens)
 *   fields       every form field, part by part: { field: { height, background… }, checkbox: { checked… }, … } (FieldStyles)
 *   transition   page transitions between pages: { type: fade|slide|scale|none, duration: 0.3, navigation: document|client }
 *                navigation "client" swaps pages without a page load (the runtime's `navigate`), so elements with
 *                `persist` live on across pages; "document" (the default) leaves every link to the browser
 */
final class DesignJson
{
    /** Token groups and the CSS custom property prefix each becomes. */
    public const array GROUPS = [
        'color' => 'color',
        'font' => 'font',
        'text' => 'text',
        'leading' => 'leading',
        'tracking' => 'tracking',
        'weight' => 'font-weight',
        'space' => 'space',
        'radius' => 'radius',
        'shadow' => 'shadow',
        'container' => 'container',
        'control' => 'control',
        'breakpoint' => 'breakpoint',
        'duration' => 'duration',
        'ease' => 'ease',
    ];

    private function __construct(private array $data, private readonly ?string $file) {}

    public static function load(string $file, ?string $fallback = null): self
    {
        $source = is_file($file) ? $file : $fallback;

        if ($source === null || ! is_file($source)) {
            return new self(['tokens' => []], $file);
        }

        $data = json_decode((string) file_get_contents($source), true);

        if (! is_array($data)) {
            throw new InvalidArgumentException(__(':file is not valid JSON.', ['file' => $source]));
        }

        return new self($data, $file);
    }

    public static function fromArray(array $data): self
    {
        return new self($data, null);
    }

    public function toArray(): array
    {
        return $this->data;
    }

    public function name(): string
    {
        return (string) ($this->data['name'] ?? 'Design');
    }

    /** Flat token list: ["color.primary" => ["value" => …, "dark" => …, "type" => …, "description" => …]]. */
    public function tokens(): array
    {
        $out = [];

        foreach ((array) ($this->data['tokens'] ?? []) as $group => $items) {
            if (! isset(self::GROUPS[$group]) || ! is_array($items)) {
                continue;
            }

            $type = $items['$type'] ?? null;

            foreach ($items as $name => $token) {
                if (str_starts_with((string) $name, '$')) {
                    continue;
                }

                $token = is_array($token) && array_key_exists('$value', $token) ? $token : ['$value' => $token];

                $out["{$group}.{$name}"] = [
                    'group' => $group,
                    'name' => (string) $name,
                    'value' => $token['$value'],
                    'dark' => $token['$extensions']['cms']['dark'] ?? null,
                    'type' => $token['$type'] ?? $type,
                    'description' => $token['$description'] ?? null,
                ];
            }
        }

        return $out;
    }

    public function token(string $path): mixed
    {
        return $this->tokens()[$path]['value'] ?? null;
    }

    /** Set one token value (DTCG shape preserved). */
    public function setToken(string $path, mixed $value, mixed $dark = null): void
    {
        [$group, $name] = explode('.', $path, 2) + [1 => ''];

        if (! isset(self::GROUPS[$group]) || ! preg_match('/^[a-z0-9][a-z0-9-]*$/', $name)) {
            throw new InvalidArgumentException(__('Invalid token path :path.', ['path' => $path]));
        }

        $current = $this->data['tokens'][$group][$name] ?? null;
        $token = is_array($current) && array_key_exists('$value', $current) ? $current : [];
        $token['$value'] = $value;

        if ($dark !== null) {
            $token['$extensions']['cms']['dark'] = $dark;
        }

        $this->data['tokens'][$group][$name] = $token;
    }

    /** Set or clear (null, '') a token's dark-mode value. */
    public function setDark(string $path, mixed $dark): void
    {
        [$group, $name] = explode('.', $path, 2) + [1 => ''];

        if (! isset($this->data['tokens'][$group][$name])) {
            if ($dark === null || $dark === '') {
                return;
            }

            throw new InvalidArgumentException(__('Unknown token :path.', ['path' => $path]));
        }

        if (! is_array($this->data['tokens'][$group][$name]) || ! array_key_exists('$value', $this->data['tokens'][$group][$name])) {
            $this->setToken($path, $this->token($path));
        }

        if ($dark === null || $dark === '') {
            unset($this->data['tokens'][$group][$name]['$extensions']['cms']['dark']);
            $this->data['tokens'][$group][$name] = $this->prune($this->data['tokens'][$group][$name]);

            return;
        }

        $this->data['tokens'][$group][$name]['$extensions']['cms']['dark'] = $dark;
    }

    public function removeToken(string $path): void
    {
        [$group, $name] = explode('.', $path, 2) + [1 => ''];
        unset($this->data['tokens'][$group][$name]);
    }

    /**
     * Rename a token within its group, keeping its place, and point every
     * reference in the design system (token:old → token:new) at the new name.
     */
    public function renameToken(string $from, string $to): void
    {
        [$group, $old] = explode('.', $from, 2) + [1 => ''];
        [$toGroup, $new] = explode('.', $to, 2) + [1 => ''];

        if ($group !== $toGroup || ! isset($this->data['tokens'][$group][$old]) || ! preg_match('/^[a-z0-9][a-z0-9-]*$/', $new)) {
            throw new InvalidArgumentException(__('Cannot rename :from to :to.', ['from' => $from, 'to' => $to]));
        }

        if ($old === $new) {
            return;
        }

        if (isset($this->data['tokens'][$group][$new])) {
            throw new InvalidArgumentException(__(':path already exists.', ['path' => $to]));
        }

        $items = [];

        foreach ($this->data['tokens'][$group] as $name => $token) {
            $items[$name === $old ? $new : $name] = $token;
        }

        $this->data['tokens'][$group] = $items;

        $json = (string) json_encode($this->data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $json = (string) preg_replace('/token:'.preg_quote($from, '/').'(?![a-z0-9-])/', 'token:'.$to, $json);
        $this->data = json_decode($json, true);
    }

    /**
     * Apply a change set (the design/update input): removals first, then
     * renames, token values, dark values (null clears) and whole sections.
     */
    public function apply(array $in): void
    {
        foreach ((array) ($in['remove'] ?? []) as $path) {
            $this->removeToken((string) $path);
        }

        foreach ((array) ($in['rename'] ?? []) as $from => $to) {
            $this->renameToken((string) $from, (string) $to);
        }

        foreach ((array) ($in['tokens'] ?? []) as $path => $value) {
            $this->setToken((string) $path, $value);
        }

        foreach ((array) ($in['dark'] ?? []) as $path => $value) {
            $this->setDark((string) $path, $value);
        }

        // A key the design can't style would be kept and never show: said now, by name.
        foreach (['styles', 'prose'] as $section) {
            foreach (array_keys((array) ($in[$section] ?? [])) as $selector) {
                if (! DesignCompiler::selectable($selector) && ! ($section === 'prose' && $selector === 'spacing')) {
                    throw new InvalidArgumentException(__('“:selector” is not something the design can style: use a tag, or up to three with a space or “ > ” between them, with one state at the end, like “h1 em” or “nav a:hover”. A class or an id is for custom CSS.', ['selector' => (string) $selector]));
                }
            }
        }

        foreach (['styles', 'prose', 'buttons', 'fields', 'fonts'] as $section) {
            if (isset($in[$section])) {
                $this->set($section, (array) $in[$section]);
            }
        }

        // The transition is one small thing with three settings: naming one keeps the other two.
        if (isset($in['transition'])) {
            $this->set('transition', array_filter([...(array) ($this->data['transition'] ?? []), ...(array) $in['transition']], static fn ($value) => $value !== null));
        }

        // The transition is one small thing with three settings: naming one keeps the other two.
        if (isset($in['transition'])) {
            $this->set('transition', array_filter([...(array) ($this->data['transition'] ?? []), ...(array) $in['transition']], static fn ($value) => $value !== null));
        }
    }

    /** Drop empty $extensions left behind after clearing a value. */
    private function prune(array $token): array
    {
        if (($token['$extensions']['cms'] ?? null) === []) {
            unset($token['$extensions']['cms']);
        }

        if (($token['$extensions'] ?? null) === []) {
            unset($token['$extensions']);
        }

        return $token;
    }

    /** @return list<array{family: string, src: string, weight?: string, style?: string, preload?: bool, display?: string}> */
    public function fonts(): array
    {
        return array_values(array_filter((array) ($this->data['fonts'] ?? []), 'is_array'));
    }

    public function setFonts(array $fonts): void
    {
        $this->data['fonts'] = array_values($fonts);
    }

    /** @return array<string, array<string, mixed>> element => declarations */
    public function styles(): array
    {
        return (array) ($this->data['styles'] ?? []);
    }

    /** The flow between the blocks of prose: key => the custom property it sets (--prose-…). */
    public const array PROSE_SPACING = ['blocks' => 'blocks', 'headings' => 'headings', 'afterHeadings' => 'after-headings', 'items' => 'items'];

    /** @return array<string, array<string, mixed>> element => declarations, inside prose */
    public function prose(): array
    {
        return array_diff_key((array) ($this->data['prose'] ?? []), ['spacing' => true]);
    }

    /** @return array<string, string|int|float> blocks, headings, afterHeadings, items */
    public function proseSpacing(): array
    {
        return array_intersect_key((array) ($this->data['prose']['spacing'] ?? []), self::PROSE_SPACING);
    }

    public function buttons(): array
    {
        return (array) ($this->data['buttons'] ?? []);
    }

    /** @return array<string, array<string, string|int|float>> part => property => value (FieldStyles::PARTS) */
    public function fields(): array
    {
        return FieldStyles::clean((array) ($this->data['fields'] ?? []));
    }

    /** @return array{type: string, duration: float, navigation: string} */
    public function transition(): array
    {
        $t = (array) ($this->data['transition'] ?? []);

        return [
            'type' => in_array($t['type'] ?? 'none', ['none', 'fade', 'slide', 'scale'], true) ? ($t['type'] ?? 'none') : 'none',
            'duration' => max(0.05, min(2, (float) ($t['duration'] ?? 0.3))),
            'navigation' => ($t['navigation'] ?? null) === 'client' ? 'client' : 'document',
        ];
    }

    /** Replace a top-level section (styles, prose, buttons, fields, transition, fonts). */
    public function set(string $section, array $value): void
    {
        if (! in_array($section, ['styles', 'prose', 'buttons', 'fields', 'transition', 'fonts'], true)) {
            throw new InvalidArgumentException(__('Unknown design section :section.', ['section' => $section]));
        }

        $this->data[$section] = $value;
    }

    /** @return array<string, string> e.g. ["sm" => "640px", …] in ascending order */
    public function breakpoints(): array
    {
        $out = [];

        foreach ($this->tokens() as $token) {
            if ($token['group'] === 'breakpoint' && is_string($token['value'])) {
                $out[$token['name']] = $token['value'];
            }
        }

        $out = $out ?: ['sm' => '640px', 'md' => '768px', 'lg' => '1024px', 'xl' => '1280px'];
        uasort($out, static fn ($a, $b) => (float) $a <=> (float) $b);

        return $out;
    }

    /** Is there a dark value for any token (the site supports dark mode)? */
    public function hasDark(): bool
    {
        foreach ($this->tokens() as $token) {
            if ($token['dark'] !== null) {
                return true;
            }
        }

        return false;
    }

    public function save(): void
    {
        if ($this->file === null) {
            throw new InvalidArgumentException(__('This design has no file.'));
        }

        Files::putJson($this->file, $this->data);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks;

use Cms\Extend\Hooks;
use Lettern\Design\Describe;
use Lettern\Design\Spec;
use Lettern\Design\Style;
use Lettern\Design\StyleError;

/**
 * A node's style, in the vocabulary of Lettern Design (https://design.lettern.org):
 *
 *   style: {
 *     base:          { display: "grid", gridTemplateColumns: "3", gap: "lg", scheme: "inverse" },
 *     "max-lg":      { gridTemplateColumns: "2" },      tablets and smaller
 *     "max-md":      { gridTemplateColumns: "1" },      phones
 *     hover:         { translateY: "-2xs" },
 *     "max-md:hover":{ … },
 *     "is-open":     { rotate: "45" },                  a state set by scripts or data
 *     "in-open":     { opacity: "100" },                an ancestor is in that state
 *   }
 *
 * Values are names only: tokens, keywords of the property, or short compositions of
 * tokens. Each declaration becomes one short content-hashed class, shared by every
 * node that uses it; rules reach the page through the `render.style` hook. scheme,
 * flow and texture become attributes.
 */
final class StyleCompiler
{
    /** @var array<string, string> class => CSS (emitted this request) */
    private array $emitted = [];

    private ?Style $style = null;

    public function __construct(private readonly Hooks $hooks) {}

    /** The engine, with the palettes, families and text styles the site's theme adds. */
    public function engine(): Style
    {
        return $this->style ??= new Style($this->hooks->filter('blocks.vocabulary', null));
    }

    /** Forget the theme's vocabulary (it changed). */
    public function forget(): void
    {
        $this->style = null;
    }

    /** Clean a style map: valid conditions and values only, in its normal form. */
    public function sanitize(mixed $style): array
    {
        $out = [];

        foreach (Style::normalize($style) as $key => $declarations) {
            try {
                Style::condition($key);
            } catch (StyleError) {
                continue;
            }

            foreach ($declarations as $property => $value) {
                if ($this->valid($key, (string) $property, $value)) {
                    $out[$key][$property] = trim($value);
                }
            }
        }

        return $out;
    }

    /** The problems of a style, for whoever wrote it: "padding: "13px" is not a space step. Try: sm, md…". */
    public function errors(mixed $style): array
    {
        return array_map(static fn (StyleError $e) => $e->getMessage(), $this->engine()->compile($style, $this->media(...))['errors']);
    }

    private function valid(string $key, string $property, string $value): bool
    {
        $attribute = in_array($property, ['flow', 'scheme', 'texture'], true);

        if ($attribute) {
            return $key === 'base' && in_array($value, $this->engine()->tokens($property), true);
        }

        try {
            $this->engine()->declarations($property, $value, $this->media(...));

            return true;
        } catch (StyleError) {
            return false;
        }
    }

    /**
     * Classes and attributes for a style map; each class's rule is emitted once per request.
     *
     * @return array{class: string, attributes: array<string, string>}
     */
    public function compile(array $style): array
    {
        $compiled = $this->engine()->compile($style, $this->media(...));

        foreach ($compiled['rules'] as $rule) {
            if (! isset($this->emitted[$rule['className']])) {
                $this->emitted[$rule['className']] = $rule['css'];
                $this->hooks->dispatch('render.style', $rule['className'], $rule['css'], $rule['order']);
            }
        }

        return ['class' => implode(' ', array_unique($compiled['classes'])), 'attributes' => $compiled['attributes']];
    }

    /** One property's value as an inline declaration (data bound to a style), or null when it isn't in the vocabulary. */
    public function declaration(string $property, mixed $value): ?string
    {
        if (! is_scalar($value) || in_array($property, ['flow', 'scheme', 'texture'], true)) {
            return null;
        }

        try {
            return implode(';', array_map(static fn ($d) => "{$d[0]}:{$d[1]}", $this->engine()->declarations($property, (string) $value, $this->media(...))));
        } catch (StyleError) {
            return null;
        }
    }

    /** All rules emitted so far (for renderers that don't listen to the hook). */
    public function css(): string
    {
        return implode('', $this->emitted);
    }

    public function reset(): void
    {
        $this->emitted = [];
    }

    /** The inspector group of a property, or null when it isn't one. */
    public static function group(string $property): ?string
    {
        return Spec::PROPERTIES[$property]['group'] ?? null;
    }

    /** Every property, value and condition, for editors and agents. */
    public function catalog(): array
    {
        $catalog = Describe::catalog();
        $catalog['collections'] = $this->engine()->vocabulary();

        foreach ($catalog['properties'] as $name => $p) {
            $catalog['properties'][$name]['tokens'] = $this->engine()->tokens($p['kind']);
        }

        return $catalog;
    }

    private function media(string $ref): ?string
    {
        return preg_match('/^[0-9a-z]{26}$/i', $ref) ? Media::url($ref) : null;
    }
}

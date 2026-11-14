<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Styling;

/**
 * What a Tailwind stylesheet says that PHP needs to know without compiling it: the variables of its
 * @theme blocks, the names of its @utility classes and whether it has dark values.
 *
 * Read as text: `@theme { --color-primary: #1d4ed8; }` is `variables()['--color-primary']`.
 */
final class Theme
{
    /** Tailwind's own breakpoints, which a theme adds to or replaces with --breakpoint-*. */
    public const array BREAKPOINTS = ['sm' => '40rem', 'md' => '48rem', 'lg' => '64rem', 'xl' => '80rem', '2xl' => '96rem'];

    private readonly string $css;

    /** @var array<string, string>|null */
    private ?array $variables = null;

    public function __construct(string $css)
    {
        // Comments say nothing, and may hold a brace or a semicolon.
        $this->css = (string) preg_replace('#/\*.*?\*/#s', '', $css);
    }

    /** @return array<string, string> "--color-primary" => its value, as written; a later @theme block wins */
    public function variables(): array
    {
        if ($this->variables !== null) {
            return $this->variables;
        }

        $out = [];
        preg_match_all('/@theme\b[^{;]*\{/', $this->css, $starts, PREG_OFFSET_CAPTURE);

        foreach ($starts[0] as [$start, $offset]) {
            // Only what the block itself declares: a variable inside its @keyframes is not the theme's.
            preg_match_all('/(?:^|[;{}])\s*(--[A-Za-z0-9_-]+)\s*:\s*([^;{}]+)(?=;|\}|$)/', self::topLevel($this->block($offset + strlen($start))), $found, PREG_SET_ORDER);

            foreach ($found as [, $name, $value]) {
                $out[$name] = trim($value);
            }
        }

        return $this->variables = $out;
    }

    /** A variable's value with the light side of light-dark(light, dark), or null when the theme does not name it. */
    public function variable(string $name): ?string
    {
        $value = $this->variables()[str_starts_with($name, '--') ? $name : '--'.$name] ?? null;

        if ($value === null || $value === 'initial') {
            return null;
        }

        return preg_match('/^light-dark\((.*)\)$/s', $value, $m) ? trim(self::arguments($m[1])[0] ?? '') : $value;
    }

    /** @return array<string, string> the variables of one namespace by their name: group("--ease-") gives "out" => "cubic-bezier(…)" */
    public function group(string $prefix): array
    {
        $out = [];

        foreach (array_keys($this->variables()) as $name) {
            if (str_starts_with($name, $prefix) && ($value = $this->variable($name)) !== null && ! str_contains($short = substr($name, strlen($prefix)), '--')) {
                $out[$short] = $value;
            }
        }

        return $out;
    }

    /** @return list<string> the names of the stylesheet's own classes (`@utility card { … }`), in the order written */
    public function classes(): array
    {
        // A name ending in -* takes a value (tab-4): it is a family of classes, not one to pick.
        preg_match_all('/@utility\s+([a-z][a-z0-9_-]*)\s*\{/', $this->css, $found);

        return array_values(array_unique($found[1]));
    }

    /** The stylesheet has dark values: it says `color-scheme: light dark`, which is what light-dark() follows. */
    public function dark(): bool
    {
        return preg_match('/color-scheme\s*:\s*light\s+dark\b/', $this->css) === 1;
    }

    /** What stands between the brace before $from and the one that closes it. */
    private function block(int $from): string
    {
        $depth = 1;

        for ($i = $from, $length = strlen($this->css); $i < $length; $i++) {
            $depth += match ($this->css[$i]) {
                '{' => 1,
                '}' => -1,
                default => 0,
            };

            if ($depth === 0) {
                break;
            }
        }

        return substr($this->css, $from, $i - $from);
    }

    /** A block's own declarations, without the blocks inside it. */
    private static function topLevel(string $block): string
    {
        do {
            $block = (string) preg_replace('/[^;{}]*\{[^{}]*\}/', ';', $block, -1, $count);
        } while ($count > 0);

        return $block;
    }

    /** @return list<string> a function's arguments: split at the commas that are not inside brackets */
    private static function arguments(string $inside): array
    {
        $out = [''];
        $depth = 0;

        foreach (str_split($inside) as $char) {
            $depth += match ($char) {
                '(' => 1,
                ')' => -1,
                default => 0,
            };

            if ($char === ',' && $depth === 0) {
                $out[] = '';
            } else {
                $out[count($out) - 1] .= $char;
            }
        }

        return $out;
    }
}

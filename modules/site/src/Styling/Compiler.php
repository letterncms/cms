<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Styling;

use Throwable;

use function TailwindPHP\compile;

/**
 * Tailwind on the server, in PHP: TailwindPHP, a port of Tailwind CSS 4 checked against Tailwind's own tests.
 * Every server compiles, so the CSS follows the content whoever changed it: the admin, an agent over the
 * API or MCP, a command, or a file edited by hand before the next build.
 */
class Compiler
{
    /**
     * The CSS of a source ({css, files, candidates}), minified.
     *
     * @throws StylingException when the stylesheet does not compile
     */
    public function compile(array $source): string
    {
        $files = (array) ($source['files'] ?? []);

        try {
            $compiled = compile((string) $source['css'], [
                // The stylesheets a site imports by name ("cms"); Tailwind's own come with the compiler.
                'importResolver' => static fn (string $uri) => isset($files[$uri]) ? (string) $files[$uri] : null,
            ]);
            $css = trim((string) $compiled['build'](array_values(array_map('strval', (array) ($source['candidates'] ?? []))), true));
        } catch (Throwable $e) {
            throw new StylingException($e->getMessage() !== '' ? $e->getMessage() : __('The stylesheet could not be compiled.'), 0, $e);
        }

        $this->checkApplies((string) $source['css'], $compiled['designSystem']);

        return $css;
    }

    /**
     * Tailwind refuses `@apply` of a class it does not know; the port leaves it out without a word. The site's
     * stylesheet is refused as Tailwind would, so a typo is said where it is made.
     */
    private function checkApplies(string $css, object $system): void
    {
        preg_match_all('/@apply\s+([^;{}]+)/', (string) preg_replace('#/\*.*?\*/#s', '', $css), $found);
        $classes = array_values(array_unique(preg_split('/\s+/', implode(' ', $found[1]), -1, PREG_SPLIT_NO_EMPTY) ?: []));

        foreach ($classes === [] ? [] : $system->candidatesToCss($classes) as $i => $out) {
            if ($out === null) {
                throw new StylingException("Cannot apply unknown utility class `{$classes[$i]}`");
            }
        }
    }
}

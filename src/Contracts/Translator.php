<?php

declare(strict_types=1);

namespace Cms\Contracts;

/**
 * Machine translation of website text, for Languages' "translate automatically". Without one
 * bound (NoTranslator), nothing offers it. The Assistant module binds Claude; a plugin may bind another.
 */
interface Translator
{
    /** Whether it translates right now: set up, with its key. */
    public function available(): bool;

    /**
     * Keep Markdown, placeholders, HTML, URLs and names as they are.
     *
     * @param  list<string>  $strings
     * @return list<string> As many as $strings, in their order
     */
    public function translate(array $strings, string $from, string $to): array;
}

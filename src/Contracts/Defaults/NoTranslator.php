<?php

declare(strict_types=1);

namespace Cms\Contracts\Defaults;

use Cms\Contracts\Translator;

/** Used when nothing translates (the Assistant is off or has no key): the strings stay as they are. */
final class NoTranslator implements Translator
{
    public function available(): bool
    {
        return false;
    }

    public function translate(array $strings, string $from, string $to): array
    {
        return $strings;
    }
}

<?php

declare(strict_types=1);

namespace Cms\Support;

use Illuminate\Translation\Translator;

/**
 * Every string may name the product: `__(':brand is already installed.')`, or
 * `{brand}` in labels the admin translates. So no dictionary contains the name.
 *
 * And a string may say which of its meanings it is: `__('Expired||order')`. English is the key, one
 * dictionary is read for every package, and one English word can need two words elsewhere ("Views" of a
 * page and "Views" of a list). What follows `||` is the context: part of the key, never shown. A language
 * without a translation for it, English first of all, shows the words before it.
 */
final class BrandedTranslator extends Translator
{
    public static function from(Translator $translator): self
    {
        $branded = new self($translator->getLoader(), $translator->getLocale());
        $branded->setFallback($translator->getFallback());

        return $branded;
    }

    /** A context: `||` and plain lowercase words at the end of a key. Any other `||` is part of the text. */
    public const string CONTEXT = '/\|\|[a-z][a-z ]*$/';

    /** The words of a key, without its context. */
    public static function words(string $key): string
    {
        return (string) preg_replace(self::CONTEXT, '', $key);
    }

    /**
     * A key with a context is looked up as it is; a language without a translation for it says the words
     * before it as that language translates them (its plain key), and only then in English. Placeholders are
     * filled after the lookup, so a value that holds `||` is never taken for a context.
     */
    public function get($key, array $replace = [], $locale = null, $fallback = true)
    {
        if (! is_string($key) || preg_match(self::CONTEXT, $key) !== 1 || $this->translates($key, $locale ?? $this->locale())) {
            return parent::get($key, $replace, $locale, $fallback);
        }

        return parent::get(self::words($key), $replace, $locale, $fallback);
    }

    /** Whether a language's dictionary has the key itself (not through get(), which would come back here). */
    private function translates(string $key, string $locale): bool
    {
        $this->load('*', '*', $locale);

        return isset($this->loaded['*']['*'][$locale][$key]);
    }

    protected function makeReplacements($line, array $replace)
    {
        return parent::makeReplacements(str_replace('{brand}', Brand::get(), (string) $line), ['brand' => Brand::get(), ...$replace]);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Support;

use Illuminate\Translation\Translator;

/**
 * Every string may name the product: `__(':brand is already installed.')`, or
 * `{brand}` in labels the admin translates. So no dictionary contains the name.
 */
final class BrandedTranslator extends Translator
{
    public static function from(Translator $translator): self
    {
        $branded = new self($translator->getLoader(), $translator->getLocale());
        $branded->setFallback($translator->getFallback());

        return $branded;
    }

    protected function makeReplacements($line, array $replace)
    {
        return parent::makeReplacements(str_replace('{brand}', Brand::get(), (string) $line), ['brand' => Brand::get(), ...$replace]);
    }
}

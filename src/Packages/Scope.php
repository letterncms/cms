<?php

declare(strict_types=1);

namespace Cms\Packages;

use Closure;

/**
 * The package whose code runs right now. While a package registers or boots,
 * the registries (abilities, settings) record it as the owner of what it adds —
 * no package has to name itself.
 */
final class Scope
{
    /** The package in scope, or null for the kernel. */
    public static ?string $current = null;

    public static function run(string $package, Closure $callback): mixed
    {
        $previous = self::$current;
        self::$current = $package;

        try {
            return $callback();
        } finally {
            self::$current = $previous;
        }
    }
}

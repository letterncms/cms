<?php

declare(strict_types=1);

namespace Cms\Packages;

/** Autoloads drop-in packages that were not installed through composer. */
final class Psr4Loader
{
    /** @var array<string, list<string>> prefix => dirs */
    private array $prefixes = [];

    private bool $registered = false;

    public function add(string $prefix, string $dir): void
    {
        $prefix = trim($prefix, '\\').'\\';
        $this->prefixes[$prefix][] = rtrim($dir, '/').'/';

        // Longest prefix first so nested namespaces resolve correctly.
        uksort($this->prefixes, static fn ($a, $b) => strlen($b) <=> strlen($a));

        if (! $this->registered) {
            spl_autoload_register($this->load(...), true, false);
            $this->registered = true;
        }
    }

    private function load(string $class): void
    {
        foreach ($this->prefixes as $prefix => $dirs) {
            if (! str_starts_with($class, $prefix)) {
                continue;
            }

            $relative = str_replace('\\', '/', substr($class, strlen($prefix))).'.php';

            foreach ($dirs as $dir) {
                if (is_file($dir.$relative)) {
                    require $dir.$relative;

                    return;
                }
            }
        }
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\License\Store;

use Cms\Support\Files;
use Throwable;

/**
 * Where a site's token lives, per issuer: the environment, then config/, then the cache of
 * what a refresh brought. Refresh re-signs daily, so it touches config/ only when the licence
 * really changed: that file may be tracked in git. A read-only disk costs a retry, never an error.
 */
final class TokenStore
{
    public function __construct(private readonly string $sitePath, private readonly string $storagePath) {}

    /** @return list<string> Tokens, in source order */
    public function tokens(string $issuer = 'default'): array
    {
        $tokens = [];
        $env = env($this->envName($issuer));

        if (is_string($env) && trim($env) !== '') {
            $tokens[] = trim($env);
        }

        foreach ([$this->configFile($issuer), $this->cacheFile($issuer)] as $file) {
            $text = is_file($file) ? trim((string) @file_get_contents($file)) : '';

            if ($text !== '') {
                $tokens[] = $text;
            }
        }

        return $tokens;
    }

    public function fromEnvironment(string $issuer = 'default'): bool
    {
        return is_string(env($this->envName($issuer))) && trim((string) env($this->envName($issuer))) !== '';
    }

    /** A token someone chose: it goes in config/ and replaces what a refresh cached. */
    public function install(string $token, string $issuer = 'default'): void
    {
        Files::put($this->configFile($issuer), $token."\n");
        @unlink($this->cacheFile($issuer));
    }

    public function clear(string $issuer = 'default'): void
    {
        @unlink($this->configFile($issuer));
        @unlink($this->cacheFile($issuer));
    }

    /** What a refresh brought. A changed licence updates config/ when it can; the daily re-signing only the cache. */
    public function remember(string $token, bool $revChanged, string $issuer = 'default'): void
    {
        $config = $this->configFile($issuer);

        try {
            if ($revChanged && ! $this->fromEnvironment($issuer) && (is_file($config) ? is_writable($config) : is_writable($this->sitePath.'/config'))) {
                Files::put($config, $token."\n");
                @unlink($this->cacheFile($issuer));

                return;
            }

            Files::put($this->cacheFile($issuer), $token."\n");
        } catch (Throwable) {
            // Read-only: the next refresh brings it again.
        }
    }

    /** @return array<string, mixed> */
    public function state(string $issuer = 'default'): array
    {
        return Files::readJson($this->stateFile($issuer));
    }

    /** @param  array<string, mixed>  $changes */
    public function saveState(array $changes, string $issuer = 'default'): void
    {
        try {
            Files::putJson($this->stateFile($issuer), [...$this->state($issuer), ...$changes]);
        } catch (Throwable) {
        }
    }

    private function envName(string $issuer): string
    {
        return $issuer === 'default' ? 'CMS_LICENSE' : 'CMS_LICENSE_'.strtoupper((string) preg_replace('/[^A-Za-z0-9]+/', '_', $issuer));
    }

    private function configFile(string $issuer): string
    {
        return $this->sitePath.'/config/'.($issuer === 'default' ? 'license.key' : 'licenses/'.self::safe($issuer).'.key');
    }

    private function cacheFile(string $issuer): string
    {
        return $this->storagePath.'/license/'.self::safe($issuer).'.cache';
    }

    private function stateFile(string $issuer): string
    {
        return $this->storagePath.'/license/'.self::safe($issuer).'.state.json';
    }

    private static function safe(string $issuer): string
    {
        return (string) preg_replace('/[^a-z0-9_-]+/', '-', strtolower($issuer));
    }
}

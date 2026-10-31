<?php

declare(strict_types=1);

namespace Cms\Trust;

use Cms\Support\Crypto\Base64Url;
use Cms\Support\Crypto\Ed25519;

/**
 * What a release key signs for one version of a package. Name and version stop one signed
 * zip passing for another; the last line stops a store relabelling it as a security fix,
 * as first-party, or with fewer capabilities.
 */
final class PackageSignature
{
    /** @param  array<string, mixed>  $entry  A version from a catalog or feed */
    public static function message(string $package, array $entry): string
    {
        $capabilities = array_map('strval', (array) ($entry['capabilities'] ?? []));
        sort($capabilities);

        return "cms-signature-v1\n{$package}\n".(string) ($entry['version'] ?? '')."\n".strtolower((string) ($entry['sha256'] ?? ''))."\n".(string) ($entry['released_at'] ?? '')."\n"
            .'security='.(int) (bool) ($entry['security'] ?? false).';fixes='.(string) ($entry['fixes'] ?? '').';first_party='.(int) (bool) ($entry['first_party'] ?? false).';capabilities='.implode(',', $capabilities)."\n";
    }

    /** @param  array<string, mixed>  $entry */
    public static function sign(string $package, array $entry, string $rawPrivateKey): string
    {
        return Base64Url::encode(Ed25519::sign(self::message($package, $entry), $rawPrivateKey));
    }

    /** @param  array<string, mixed>  $entry */
    public static function verify(string $package, array $entry, string $rawPublicKey): bool
    {
        $sig = Base64Url::decode((string) ($entry['sig'] ?? ''));

        return $sig !== null && Ed25519::verify(self::message($package, $entry), $sig, $rawPublicKey);
    }
}

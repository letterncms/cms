<?php

declare(strict_types=1);

namespace Cms\Trust;

use Cms\Support\Crypto\Base64Url;

/**
 * DEVELOPMENT KEYS. NOT SECRET, NOT FOR PRODUCTION.
 *
 * Each key is derived from a string anyone can read here, so anyone can sign with it. The
 * trust file they make is marked `"dev": true`, and TrustStore refuses it unless APP_ENV is
 * local or testing. The real keys are made once by the owner, with `./dev keys production` in the workspace.
 */
final class DevKeys
{
    public const string ROOT = 'dev-root';

    public const string RELEASE = 'dev-release';



    /** @return array{0: string, 1: string} [rawPublic, rawPrivate] */
    public static function pair(string $kid): array
    {
        $pair = sodium_crypto_sign_seed_keypair(hash('sha256', 'cms-public-development-key:'.$kid, true));

        return [sodium_crypto_sign_publickey($pair), sodium_crypto_sign_secretkey($pair)];
    }

    public static function public(string $kid): string
    {
        return Base64Url::encode(self::pair($kid)[0]);
    }

    public static function private(string $kid): string
    {
        return self::pair($kid)[1];
    }

    /** @return array<string, mixed> The unsigned development trust file. */
    public static function draft(array $overrides = []): array
    {
        return [
            'type' => 'cms-trust',
            'dev' => true,
            'note' => 'DEVELOPMENT TRUST FILE. Its keys are public. Refused unless APP_ENV is local or testing.',
            'epoch' => 1,
            'version' => 1,
            'issued' => '2026-10-30T00:00:00Z',
            'roots' => [['kid' => self::ROOT, 'pub' => self::public(self::ROOT)]],
            'keys' => [
                ['kid' => self::RELEASE, 'role' => 'release', 'pub' => self::public(self::RELEASE), 'nbf' => '2026-10-30', 'not_after' => null],
            ],
            'revoked' => [],
            'endpoints' => [
                'trust' => 'https://store.invalid/downloads/trust.json',
                'updates' => 'https://store.invalid/downloads/releases.json',
                'catalog' => 'https://store.invalid/api/store/v1/catalog.json',
            ],
            ...$overrides,
        ];
    }

    public static function trust(array $overrides = []): string
    {
        return Envelope::sign('cms-trust', self::draft($overrides), [self::ROOT => self::private(self::ROOT)]);
    }
}

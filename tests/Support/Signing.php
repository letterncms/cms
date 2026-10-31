<?php

declare(strict_types=1);

namespace Cms\Tests\Support;

use Cms\Modules\License\Token\Paseto;
use Cms\Trust\DevKeys;
use Cms\Trust\Envelope;
use Cms\Trust\PackageSignature;

/** Signs the things a real seller, store or release job signs, with the public development keys. */
final class Signing
{
    /** A paid plugin's licence token. Items default to one active item. */
    public static function token(array $claims = [], string $family = DevKeys::FAMILY, string $kid = DevKeys::LICENSE, ?string $private = null): string
    {
        $payload = [
            'lid' => '01JBTESTLICENCE',
            'iat' => '2026-11-02T10:00:00Z',
            'rev' => 1,
            'dom' => ['example.com'],
            'items' => [self::item()],
            ...$claims,
        ];

        return Paseto::sign((string) json_encode($payload), (string) json_encode(['kid' => $kid]), 'cms-license:1:'.$family, $private ?? DevKeys::private($kid));
    }

    public static function item(array $item = []): array
    {
        return ['p' => 'acme/forms', 'ed' => 'pro', 'st' => 'active', 'upd' => '2029-11-02', 'trm' => null, ...$item];
    }

    /** A signed version entry for a catalog or feed. */
    public static function version(string $package, array $entry, string $kid = DevKeys::RELEASE, ?string $private = null): array
    {
        $entry = ['released_at' => '2026-10-01T00:00:00Z', 'security' => false, 'fixes' => null, 'capabilities' => [], 'first_party' => false, 'kid' => $kid, ...$entry];
        $entry['sig'] = PackageSignature::sign($package, $entry, $private ?? DevKeys::private($kid));

        return $entry;
    }

    /** @param  array<string, mixed>  $payload */
    public static function feed(string $type, array $payload, string $kid = DevKeys::RELEASE, ?string $private = null): string
    {
        return Envelope::sign($type, ['type' => $type, 'version' => 1, 'issued' => gmdate('Y-m-d\TH:i:s\Z'), 'expires' => gmdate('Y-m-d\TH:i:s\Z', time() + 30 * 86_400), ...$payload], [$kid => $private ?? DevKeys::private($kid)]);
    }
}

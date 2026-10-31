<?php

declare(strict_types=1);

namespace Cms\Trust;

use Cms\Support\Crypto\Base64Url;
use Cms\Support\Crypto\Ed25519;

/**
 * The one format of a signed document: the exact payload bytes and the signatures over
 * them. Nothing is parsed until a signature checked out, and the type is part of the
 * signed message, so a document can't pass for another kind.
 */
final class Envelope
{
    /** @param  array<string, string>  $keys  kid => raw private key */
    public static function sign(string $type, array $payload, array $keys): string
    {
        $bytes = (string) json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $sigs = [];

        foreach ($keys as $kid => $private) {
            $sigs[] = ['kid' => (string) $kid, 'sig' => Base64Url::encode(Ed25519::sign(self::message($type, $bytes), $private))];
        }

        return (string) json_encode(['payload' => Base64Url::encode($bytes), 'sigs' => $sigs], JSON_UNESCAPED_SLASHES);
    }

    /**
     * The payload when a signature verifies under a key $resolve hands out for its kid.
     *
     * @param  callable(string $kid): (string|null)  $resolve  raw public key, or null for a key that doesn't count
     * @return array{payload: array<string, mixed>, kid: string}|null
     */
    public static function open(string $json, string $type, callable $resolve): ?array
    {
        $envelope = json_decode($json, true);
        $bytes = is_array($envelope) && is_string($envelope['payload'] ?? null) ? Base64Url::decode($envelope['payload']) : null;

        if ($bytes === null || ! is_array($envelope['sigs'] ?? null)) {
            return null;
        }

        foreach ($envelope['sigs'] as $entry) {
            $kid = is_array($entry) && is_string($entry['kid'] ?? null) ? $entry['kid'] : null;
            $sig = $kid !== null && is_string($entry['sig'] ?? null) ? Base64Url::decode($entry['sig']) : null;
            $key = $sig !== null ? $resolve($kid) : null;

            if ($key !== null && Ed25519::verify(self::message($type, $bytes), $sig, $key)) {
                $payload = json_decode($bytes, true);

                return is_array($payload) && ($payload['type'] ?? null) === $type ? ['payload' => $payload, 'kid' => $kid] : null;
            }
        }

        return null;
    }

    private static function message(string $type, string $bytes): string
    {
        return 'cms-signed:1:'.$type."\n".$bytes;
    }
}

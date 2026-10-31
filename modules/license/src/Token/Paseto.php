<?php

declare(strict_types=1);

namespace Cms\Modules\License\Token;

use Cms\Support\Crypto\Base64Url;
use Cms\Support\Crypto\Ed25519;

/**
 * PASETO v4.public, which is the whole licence format: Ed25519 over a pre-authentication
 * encoding of the header, message, footer and implicit assertion. No choice of algorithm
 * to confuse, and anyone can check a token with these few lines.
 */
final class Paseto
{
    private const string HEADER = 'v4.public.';

    public const int MAX_BYTES = 4096;

    public static function sign(string $message, string $footer, string $implicit, string $rawPrivateKey): string
    {
        $signature = Ed25519::sign(self::pae(self::HEADER, $message, $footer, $implicit), $rawPrivateKey);

        return self::HEADER.Base64Url::encode($message.$signature).($footer === '' ? '' : '.'.Base64Url::encode($footer));
    }

    /** @return array{message: string, signature: string, footer: string}|null The parts of a token, unverified. */
    public static function parse(string $token): ?array
    {
        if (strlen($token) > self::MAX_BYTES || ! str_starts_with($token, self::HEADER)) {
            return null;
        }

        $parts = explode('.', substr($token, strlen(self::HEADER)));

        if (count($parts) > 2) {
            return null;
        }

        $body = Base64Url::decode($parts[0]);
        $footer = isset($parts[1]) ? Base64Url::decode($parts[1]) : '';

        if ($body === null || $footer === null || strlen($body) < 64) {
            return null;
        }

        return ['message' => substr($body, 0, -64), 'signature' => substr($body, -64), 'footer' => $footer];
    }

    /** @param  array{message: string, signature: string, footer: string}  $parts */
    public static function verify(array $parts, string $implicit, string $rawPublicKey): bool
    {
        return Ed25519::verify(self::pae(self::HEADER, $parts['message'], $parts['footer'], $implicit), $parts['signature'], $rawPublicKey);
    }

    private static function pae(string ...$pieces): string
    {
        $out = self::le64(count($pieces));

        foreach ($pieces as $piece) {
            $out .= self::le64(strlen($piece)).$piece;
        }

        return $out;
    }

    private static function le64(int $n): string
    {
        return pack('P', $n & PHP_INT_MAX);
    }
}

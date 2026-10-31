<?php

declare(strict_types=1);

namespace Cms\Support\Crypto;

/** URL-safe base64 without padding: what signed tokens and envelopes carry. */
final class Base64Url
{
    public static function encode(string $bytes): string
    {
        return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');
    }

    /** The bytes, or null when the text is not strict base64url. */
    public static function decode(string $text): ?string
    {
        if (preg_match('/^[A-Za-z0-9_-]*$/', $text) !== 1 || strlen($text) % 4 === 1) {
            return null;
        }

        $bytes = base64_decode(strtr($text, '-_', '+/'), true);

        return $bytes === false ? null : $bytes;
    }
}

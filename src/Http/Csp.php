<?php

declare(strict_types=1);

namespace Cms\Http;

/** Per-request CSP nonce. */
final class Csp
{
    private static ?string $nonce = null;

    public static function nonce(): string
    {
        return self::$nonce ??= base64_encode(random_bytes(18));
    }

    public static function reset(): void
    {
        self::$nonce = null;
    }
}

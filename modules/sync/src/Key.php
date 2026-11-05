<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use InvalidArgumentException;

/**
 * A connection key is the other site's address and its secret, `https://example.com#<secret>`:
 * readable at a glance, and a browser never sends the part after `#` anywhere.
 */
final class Key
{
    public static function format(string $url, string $secret): string
    {
        return rtrim($url, '/').'#'.$secret;
    }

    /** @return array{url: string, secret: string} */
    public static function parse(string $key): array
    {
        $key = trim(preg_replace('/\s+/', '', $key) ?? '');
        $hash = strrpos($key, '#');
        $url = $hash === false ? '' : rtrim(substr($key, 0, $hash), '/');
        $secret = $hash === false ? '' : substr($key, $hash + 1);

        if (preg_match('#^https?://[^/\s]+#i', $url) !== 1 || preg_match('/^[A-Za-z0-9_-]{40,}$/', $secret) !== 1) {
            throw new InvalidArgumentException(__('That isn’t a connection key. Copy it from Sync on the other site: it starts with the site’s address.'));
        }

        return ['url' => $url, 'secret' => $secret];
    }
}

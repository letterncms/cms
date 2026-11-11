<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Design;

use Cms\Support\SafeFetcher;
use RuntimeException;

/**
 * The two places libraries come from, and nowhere else: a host that isn't one of them is not asked,
 * a redirect is not followed, and an answer that isn't what was asked for (JavaScript from the CDN,
 * JSON from the registry) is not taken.
 */
final class HttpVendorFetcher implements VendorFetcher
{
    /** Host => the content types it may answer with. */
    private const array HOSTS = [
        'cdn.jsdelivr.net' => ['application/javascript', 'text/javascript'],
        'registry.npmjs.org' => ['application/json'],
    ];

    public function get(string $url): string
    {
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));

        if (! str_starts_with($url, 'https://') || ! isset(self::HOSTS[$host])) {
            throw new RuntimeException(__('Libraries are only fetched from :hosts.', ['hosts' => implode(', ', array_keys(self::HOSTS))]));
        }

        $response = SafeFetcher::get($url, Vendor::MAX_BYTES, 30, 0);
        $type = strtolower(trim(explode(';', $response['type'])[0]));

        if ($response['url'] !== $url || ! in_array($type, self::HOSTS[$host], true)) {
            throw new RuntimeException(__(':url did not answer with the file itself.', ['url' => $url]));
        }

        return $response['body'];
    }
}

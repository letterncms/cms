<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

/**
 * Identifies local and staging hosts for the Sync connection list.
 */
final class HostClassifier
{
    private const array RESERVED = ['localhost', 'test', 'invalid', 'example', 'internal', 'local', 'home.arpa'];

    private const string STAGING_LABEL = '/^(dev|staging|stage|stg|test|testing|uat|qa|preview|sandbox|local)(-[a-z0-9-]+)?$/';

    /** @param  list<string>|null  $previewHosts  Suffixes of preview platforms; the shipped list by default */
    public function __construct(private readonly ?array $previewHosts = null) {}

    /** Lower case, no port, no trailing dot, A-label form when PHP can make it. */
    public static function normalize(string $host): string
    {
        $host = strtolower(trim($host));

        if (str_starts_with($host, '[')) {
            return (string) strstr(substr($host, 1), ']', true);
        }

        if (substr_count($host, ':') === 1) {
            $host = (string) strstr($host, ':', true);
        }

        $host = rtrim($host, '.');

        if (! self::isAscii($host) && function_exists('idn_to_ascii')) {
            $ascii = idn_to_ascii($host, IDNA_NONTRANSITIONAL_TO_ASCII, INTL_IDNA_VARIANT_UTS46);
            $host = is_string($ascii) && $ascii !== '' ? $ascii : $host;
        }

        return $host;
    }

    public static function isAscii(string $host): bool
    {
        return preg_match('/^[\x00-\x7F]*$/', $host) === 1;
    }

    /** @param  int|null  $port  From the configured site URL or the request */
    public function classify(string $host, ?int $port = null): HostClass
    {
        $host = self::normalize($host);

        if ($host === '' || $host === 'localhost' || filter_var($host, FILTER_VALIDATE_IP)) {
            return HostClass::Nonpublic;
        }

        foreach (self::RESERVED as $suffix) {
            if (str_ends_with($host, '.'.$suffix)) {
                return HostClass::Nonpublic;
            }
        }

        $labels = explode('.', $host);

        if (count($labels) === 1 || ($port !== null && ! in_array($port, [80, 443], true))) {
            return HostClass::Nonpublic;
        }

        // Three labels at least: dev.to and test.com are real sites.
        if (count($labels) >= 3 && preg_match(self::STAGING_LABEL, $labels[0]) === 1) {
            return HostClass::Nonpublic;
        }

        foreach ($this->previewHosts ?? self::shippedPreviewHosts() as $suffix) {
            if (str_ends_with($host, '.'.$suffix)) {
                return HostClass::Nonpublic;
            }
        }

        return HostClass::Public;
    }

    /** @return list<string> */
    private static function shippedPreviewHosts(): array
    {
        return array_map('strval', (array) json_decode((string) @file_get_contents(dirname(__DIR__, 2).'/resources/nonpublic-hosts.json'), true));
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\License\Host;

/** `example.com` covers the apex, every subdomain and subfolder; `=host` that host alone. */
final class HostMatcher
{
    /** @param  list<string>  $domains */
    public static function matches(string $host, array $domains): bool
    {
        $host = HostClassifier::normalize($host);

        foreach ($domains as $domain) {
            if (str_starts_with($domain, '=')) {
                if ($host === HostClassifier::normalize(substr($domain, 1))) {
                    return true;
                }

                continue;
            }

            $domain = HostClassifier::normalize($domain);

            if ($host === $domain || str_ends_with($host, '.'.$domain)) {
                return true;
            }
        }

        return false;
    }
}

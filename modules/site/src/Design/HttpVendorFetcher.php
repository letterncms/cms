<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Design;

use Cms\Support\SafeFetcher;

final class HttpVendorFetcher implements VendorFetcher
{
    public function get(string $url): string
    {
        return SafeFetcher::get($url, Vendor::MAX_BYTES, 30)['body'];
    }
}

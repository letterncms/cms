<?php

declare(strict_types=1);

namespace Cms\Packages\Install;

/** What this PHP allows. A class of its own so a test can be any host. */
class HostFacts
{
    public function zip(): bool
    {
        return class_exists(\ZipArchive::class);
    }

    public function curl(): bool
    {
        return function_exists('curl_init');
    }

    public function rename(): bool
    {
        return function_exists('rename');
    }

    public function freeSpace(string $path): ?float
    {
        $free = function_exists('disk_free_space') ? @disk_free_space($path) : false;

        return $free === false ? null : (float) $free;
    }

    /**
     * Whether a swap in place would serve cached old files beside new ones: PHP never looks at the
     * disk again, and this site can't tell it to.
     */
    public function opcacheRisk(): bool
    {
        if (! function_exists('opcache_get_status') || ! filter_var(ini_get('opcache.enable'), FILTER_VALIDATE_BOOLEAN)) {
            return false;
        }

        if (filter_var(ini_get('opcache.validate_timestamps'), FILTER_VALIDATE_BOOLEAN)) {
            return false;
        }

        return ! function_exists('opcache_invalidate') || (string) ini_get('opcache.restrict_api') !== '';
    }
}

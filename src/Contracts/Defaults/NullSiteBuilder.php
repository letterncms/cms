<?php

declare(strict_types=1);

namespace Cms\Contracts\Defaults;

use Cms\Contracts\SiteBuilder;

final class NullSiteBuilder implements SiteBuilder
{
    public function available(): bool
    {
        return false;
    }

    public function queue(?array $uris = null, string $reason = ''): void {}

    public function status(): array
    {
        return ['state' => 'unavailable', 'progress' => 0.0, 'message' => __('No site builder plugin is active.'), 'finishedAt' => null];
    }
}

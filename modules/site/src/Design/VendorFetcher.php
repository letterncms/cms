<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Design;

/** Where vendored libraries come from. Tests put a fake in its place; nothing else reaches the network. */
interface VendorFetcher
{
    /**
     * The body at $url.
     *
     * @throws \RuntimeException when it can't be had
     */
    public function get(string $url): string;
}

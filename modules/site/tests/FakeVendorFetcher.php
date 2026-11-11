<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Modules\Site\Design\VendorFetcher;
use RuntimeException;

/** A CDN and a registry that are an array: tests never reach the network. */
final class FakeVendorFetcher implements VendorFetcher
{
    /** @var list<string> */
    public array $asked = [];

    /** @param array<string, string> $bodies URL => body */
    public function __construct(public array $bodies = []) {}

    public function get(string $url): string
    {
        $this->asked[] = $url;

        return $this->bodies[$url] ?? throw new RuntimeException("Nothing at {$url}.");
    }
}

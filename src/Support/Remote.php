<?php

declare(strict_types=1);

namespace Cms\Support;

/**
 * Everything licensing, the store and the updater fetch, in one seam a test can replace.
 * Each call is one explicit act: nothing here runs on a public request.
 */
class Remote
{
    /** @return string The body */
    public function get(string $url, int $maxBytes = 5_000_000, int $timeout = 3): string
    {
        return SafeFetcher::get($url, $maxBytes, $timeout)['body'];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array{status: int, body: string}
     */
    public function postJson(string $url, array $data, int $timeout = 3): array
    {
        return SafeFetcher::postJson($url, $data, $timeout);
    }

    /** @param  list<string>  $headers */
    public function toFile(string $url, string $path, int $maxBytes, array $headers = []): void
    {
        SafeFetcher::toFile($url, $path, $maxBytes, $headers);
    }
}

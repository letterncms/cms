<?php

declare(strict_types=1);

namespace Cms\Tests\Support;

use Cms\Support\Remote;
use Cms\Support\Files;
use RuntimeException;

/** The outside world as a table: URL => body, or a file to copy, or an exception. Every call is recorded. */
final class FakeRemote extends Remote
{
    /** @var list<array{method: string, url: string, headers?: list<string>, data?: array}> */
    public array $calls = [];

    /** @param  array<string, string|array{status: int, body: string}|\Throwable>  $routes */
    public function __construct(public array $routes = []) {}

    public function get(string $url, int $maxBytes = 5_000_000, int $timeout = 3): string
    {
        $this->calls[] = ['method' => 'GET', 'url' => $url];
        $route = $this->route($url);

        return is_array($route) ? $route['body'] : (string) $route;
    }

    public function postJson(string $url, array $data, int $timeout = 3): array
    {
        $this->calls[] = ['method' => 'POST', 'url' => $url, 'data' => $data];
        $route = $this->route($url);

        return is_array($route) ? $route : ['status' => 200, 'body' => (string) $route];
    }

    public function toFile(string $url, string $path, int $maxBytes, array $headers = []): void
    {
        $this->calls[] = ['method' => 'FILE', 'url' => $url, 'headers' => $headers];
        $route = $this->route($url);

        if (is_array($route) && $route['status'] !== 200) {
            throw new RuntimeException(__('The server answered :status.', ['status' => $route['status']]));
        }

        $body = is_array($route) ? $route['body'] : (string) $route;

        if (strlen($body) > $maxBytes) {
            throw new RuntimeException(__('The file is too large.'));
        }

        Files::put($path, $body);
    }

    public function callsTo(string $needle): array
    {
        return array_values(array_filter($this->calls, static fn (array $call) => str_contains($call['url'], $needle)));
    }

    private function route(string $url): mixed
    {
        $route = $this->routes[$url] ?? throw new RuntimeException('The host could not be resolved: '.$url);

        if ($route instanceof \Throwable) {
            throw $route;
        }

        return $route;
    }
}

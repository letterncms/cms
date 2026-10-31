<?php

declare(strict_types=1);

namespace Cms\Support;

use RuntimeException;

/**
 * Fetch remote URLs without SSRF: https/http only, public IPs only (checked after
 * DNS resolution and on every redirect), size and time limits.
 */
final class SafeFetcher
{
    /** Only for local development and tests: lets a store on a private address through. Never set from a request. */
    public static bool $allowPrivate = false;

    /** @return array{body: string, type: string, url: string} */
    public static function get(string $url, int $maxBytes = 25_000_000, int $timeout = 15, int $redirects = 3, ?string $userAgent = null): array
    {
        $body = '';
        $sink = static function (string $chunk) use (&$body, $maxBytes): bool {
            $body .= $chunk;

            return strlen($body) <= $maxBytes;
        };

        ['type' => $type, 'url' => $final] = self::send('GET', $url, [], null, $sink, static function () use (&$body): void {
            $body = '';
        }, $timeout, $redirects, $userAgent);

        return ['body' => $body, 'type' => $type, 'url' => $final];
    }

    /**
     * Send JSON and read the answer. Refuses to follow a redirect: what was posted stays where it was sent.
     *
     * @param  array<string, mixed>  $data
     * @return array{status: int, body: string}
     */
    public static function postJson(string $url, array $data, int $timeout = 3, int $maxBytes = 65_536): array
    {
        $body = '';
        $sink = static function (string $chunk) use (&$body, $maxBytes): bool {
            $body .= $chunk;

            return strlen($body) <= $maxBytes;
        };

        ['status' => $status] = self::send('POST', $url, ['Content-Type: application/json', 'Accept: application/json'], (string) json_encode($data, JSON_UNESCAPED_SLASHES), $sink, static function () use (&$body): void {
            $body = '';
        }, $timeout, 0, null, anyStatus: true);

        return ['status' => $status, 'body' => $body];
    }

    /**
     * Stream a URL to a file without holding it in memory. A partial file left by an interrupted
     * step is continued when the server allows it. Headers go only to the URL's own origin:
     * a redirect elsewhere drops them, and a redirect from https to http is refused.
     *
     * @param  list<string>  $headers
     */
    public static function toFile(string $url, string $path, int $maxBytes, array $headers = [], int $timeout = 300): void
    {
        Files::ensureDir(dirname($path));
        clearstatcache(true, $path);
        $have = is_file($path) ? (int) filesize($path) : 0;
        $handle = fopen($path, $have > 0 ? 'ab' : 'wb');

        if ($handle === false) {
            throw new RuntimeException(__('Could not write the download to disk.'));
        }

        $written = $have;
        $restart = static function () use ($handle, &$written): void {
            ftruncate($handle, 0);
            rewind($handle);
            $written = 0;
        };
        $sink = static function (string $chunk) use ($handle, &$written, $maxBytes): bool {
            $written += strlen($chunk);

            return $written <= $maxBytes && fwrite($handle, $chunk) === strlen($chunk);
        };

        try {
            $sent = $have > 0 ? [...$headers, "Range: bytes={$have}-"] : $headers;
            self::send('GET', $url, $sent, null, $sink, $restart, $timeout, 3, null, resumed: $have > 0);
        } finally {
            fclose($handle);
        }

        if ($written > $maxBytes) {
            @unlink($path);
            throw new RuntimeException(__('The file is too large.'));
        }
    }

    /**
     * @param  list<string>  $headers
     * @param  callable(string): bool  $sink  false stops the transfer
     * @param  callable(): void  $restart  Forget what the sink has: a redirect's body, or a server that ignored Range
     * @return array{status: int, type: string, url: string}
     */
    private static function send(string $method, string $url, array $headers, ?string $payload, callable $sink, callable $restart, int $timeout, int $redirects, ?string $userAgent, bool $anyStatus = false, bool $resumed = false): array
    {
        $origin = self::origin($url);

        for ($i = 0; $i <= $redirects; $i++) {
            [$host, $ip, $port] = self::target($url);

            $received = [];
            $status = 0;
            $accepted = true;
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => false,
                CURLOPT_FOLLOWLOCATION => false,
                CURLOPT_TIMEOUT => $timeout,
                CURLOPT_CONNECTTIMEOUT => min(5, $timeout),
                CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
                // Pin the vetted IP so DNS cannot change between check and connect.
                CURLOPT_RESOLVE => ["{$host}:{$port}:{$ip}"],
                CURLOPT_USERAGENT => $userAgent ?? Brand::get().'/'.\Cms\Cms::VERSION.' ('.Brand::get('product_url').')',
                CURLOPT_HTTPHEADER => self::origin($url) === $origin ? $headers : array_values(array_filter($headers, static fn (string $h) => str_starts_with($h, 'Range:'))),
                CURLOPT_HEADERFUNCTION => static function ($ch, string $line) use (&$received, &$status): int {
                    if (preg_match('#^HTTP/\S+\s+(\d+)#', $line, $m)) {
                        $status = (int) $m[1];
                        $received = [];
                    } elseif (str_contains($line, ':')) {
                        [$k, $v] = explode(':', $line, 2);
                        $received[strtolower(trim($k))] = trim($v);
                    }

                    return strlen($line);
                },
                CURLOPT_WRITEFUNCTION => static function ($ch, string $chunk) use ($sink, &$status, &$received, &$accepted, &$resumed, $restart, $anyStatus): int {
                    if ($status >= 300 && $status < 400 && isset($received['location'])) {
                        return strlen($chunk);
                    }

                    if (! $anyStatus && ($status < 200 || $status >= 300) && $status !== 416) {
                        return strlen($chunk);
                    }

                    if ($status === 416) {
                        return strlen($chunk);
                    }

                    // A server that ignored Range sends the whole file again.
                    if ($resumed && $status !== 206) {
                        $resumed = false;
                        $restart();
                    }

                    $accepted = $sink($chunk);

                    return $accepted ? strlen($chunk) : 0;
                },
            ]);

            if ($method === 'POST') {
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, (string) $payload);
            }

            $ok = curl_exec($ch);
            $error = curl_error($ch);

            if (! $accepted) {
                throw new RuntimeException(__('The file is too large.'));
            }

            if ($ok === false) {
                throw new RuntimeException(__('Could not download the file: :error', ['error' => $error]));
            }

            if ($status >= 300 && $status < 400 && isset($received['location'])) {
                if ($i === $redirects) {
                    break;
                }

                $next = self::absolute($url, $received['location']);

                if (str_starts_with(strtolower($url), 'https:') && ! str_starts_with(strtolower($next), 'https:')) {
                    throw new RuntimeException(__('The server redirected to an insecure address.'));
                }

                $url = $next;
                continue;
            }

            if (! $anyStatus && $status !== 416 && ($status < 200 || $status >= 300)) {
                throw new RuntimeException(__('The server answered :status.', ['status' => $status]));
            }

            return ['status' => $status, 'type' => (string) ($received['content-type'] ?? ''), 'url' => $url];
        }

        throw new RuntimeException(__('Too many redirects.'));
    }

    private static function origin(string $url): string
    {
        $parts = parse_url($url) ?: [];

        return strtolower(($parts['scheme'] ?? '').'://'.($parts['host'] ?? '').':'.($parts['port'] ?? ''));
    }

    /** @return array{0: string, 1: string, 2: int} host, vetted IP, port */
    private static function target(string $url): array
    {
        $parts = parse_url($url);
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        $host = (string) ($parts['host'] ?? '');

        if (! in_array($scheme, ['http', 'https'], true) || $host === '' || isset($parts['user']) || isset($parts['pass'])) {
            throw new RuntimeException(__('Only plain http(s) URLs are allowed.'));
        }

        $port = (int) ($parts['port'] ?? ($scheme === 'https' ? 443 : 80));

        if (! self::$allowPrivate && ! in_array($port, [80, 443, 8080, 8443], true)) {
            throw new RuntimeException(__('That port is not allowed.'));
        }

        $ips = filter_var($host, FILTER_VALIDATE_IP) ? [$host] : self::resolve($host);

        if ($ips === []) {
            throw new RuntimeException(__('The host could not be resolved.'));
        }

        foreach (self::$allowPrivate ? [] : $ips as $ip) {
            if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) || str_starts_with($ip, '169.254.') || $ip === '0.0.0.0' || str_starts_with(strtolower($ip), 'fe80:') || str_starts_with(strtolower($ip), 'fc') || str_starts_with(strtolower($ip), 'fd')) {
                throw new RuntimeException(__('That address is not allowed.'));
            }
        }

        return [$host, $ips[0], $port];
    }

    /** @return list<string> Some hosts disable dns_get_record; gethostbynamel still answers there. */
    private static function resolve(string $host): array
    {
        if (function_exists('dns_get_record')) {
            $found = array_merge(
                array_column(@dns_get_record($host, DNS_A) ?: [], 'ip'),
                array_column(@dns_get_record($host, DNS_AAAA) ?: [], 'ipv6'),
            );

            if ($found !== []) {
                return $found;
            }
        }

        return gethostbynamel($host) ?: [];
    }

    private static function absolute(string $base, string $location): string
    {
        if (preg_match('#^https?://#i', $location)) {
            return $location;
        }

        $p = parse_url($base);

        return $p['scheme'].'://'.$p['host'].(isset($p['port']) ? ':'.$p['port'] : '').(str_starts_with($location, '/') ? $location : '/'.$location);
    }
}

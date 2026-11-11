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
     * Send a body as it is, with the caller's headers (a signature, a content type), and read the
     * answer whatever its status. Refuses to follow a redirect, like postJson. With `$truncate`
     * an answer longer than `$maxBytes` is cut there instead of refused: for a log that keeps its start.
     *
     * @param  list<string>  $headers  "Name: value"
     * @return array{status: int, body: string}
     */
    public static function post(string $url, string $body, array $headers = [], int $timeout = 3, int $maxBytes = 65_536, bool $truncate = false): array
    {
        foreach ($headers as $header) {
            // One header per line, and never the ones that say where the request goes or how long it is: those are curl's.
            if (! is_string($header) || preg_match('/[\r\n\0]/', $header) || ! preg_match('/^[A-Za-z0-9!#$%&\'*+.^_`|~-]+:/', $header) || preg_match('/^(host|content-length|transfer-encoding)\s*:/i', $header)) {
                throw new RuntimeException(__('That header is not allowed.'));
            }
        }

        $answer = '';
        $read = 0;
        $sink = static function (string $chunk) use (&$answer, &$read, $maxBytes, $truncate): ?bool {
            $read += strlen($chunk);

            if (strlen($answer) < $maxBytes) {
                $answer .= $truncate ? substr($chunk, 0, $maxBytes - strlen($answer)) : $chunk;
            }

            if (! $truncate) {
                return strlen($answer) <= $maxBytes;
            }

            // Cut off, the rest is read and dropped. After a megabyte reading stops: what was posted
            // has arrived and its status is known, so that is the answer, not a failure.
            return $read <= max($maxBytes, 1_000_000) ? true : null;
        };

        ['status' => $status] = self::send('POST', $url, $headers, $body, $sink, static function () use (&$answer, &$read): void {
            $answer = '';
            $read = 0;
        }, $timeout, 0, null, anyStatus: true);

        return ['status' => $status, 'body' => $answer];
    }

    /**
     * Whether an address is on the public internet: not loopback, private, link-local, shared
     * (100.64/10) or reserved, and not an IPv6 form that carries an IPv4 address inside
     * (IPv4-mapped and NAT64's 64:ff9b::/96, which a DNS64 network answers with, are judged as that
     * address; IPv4-compatible, local-use NAT64, 6to4 and Teredo are refused).
     */
    public static function isPublic(string $ip): bool
    {
        $packed = @inet_pton($ip);

        if ($packed === false) {
            return false;
        }

        // Multicast and what lies above it is nobody's server.
        if ((strlen($packed) === 4 && ord($packed[0]) >= 224) || (strlen($packed) === 16 && $packed[0] === "\xff")) {
            return false;
        }

        if (strlen($packed) === 16) {
            // ::ffff:0:0/96 and 64:ff9b::/96 are an IPv4 address by another name.
            if (str_starts_with($packed, "\0\0\0\0\0\0\0\0\0\0\xff\xff") || str_starts_with($packed, "\x00\x64\xff\x9b\0\0\0\0\0\0\0\0")) {
                return self::isPublic((string) inet_ntop(substr($packed, 12)));
            }

            // Site-local, fec0::/10: deprecated, and never public.
            if ($packed[0] === "\xfe" && (ord($packed[1]) & 0xc0) === 0xc0) {
                return false;
            }

            // ::/96, 64:ff9b:1::/48, 2002::/16, 2001::/32
            foreach (["\0\0\0\0\0\0\0\0\0\0\0\0", "\x00\x64\xff\x9b\x00\x01", "\x20\x02", "\x20\x01\x00\x00"] as $prefix) {
                if (str_starts_with($packed, $prefix)) {
                    return false;
                }
            }
        }

        return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_GLOBAL_RANGE) !== false
            && filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false;
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
     * @param  callable(string): ?bool  $sink  false refuses the answer as too large; null stops reading and keeps what there is
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
            $stopped = false;
            $refused = false;
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => false,
                CURLOPT_FOLLOWLOCATION => false,
                CURLOPT_TIMEOUT => $timeout,
                CURLOPT_CONNECTTIMEOUT => min(5, $timeout),
                CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
                // Never through a proxy from the environment: it would connect somewhere nobody vetted.
                CURLOPT_PROXY => '',
                // Pin the vetted IP so DNS cannot change between check and connect.
                CURLOPT_RESOLVE => ["{$host}:{$port}:".(str_contains($ip, ':') ? "[{$ip}]" : $ip)],
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
                CURLOPT_WRITEFUNCTION => static function ($ch, string $chunk) use ($sink, &$status, &$received, &$accepted, &$stopped, &$resumed, $restart, $anyStatus): int {
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

                    $took = $sink($chunk);
                    // Null: enough has been read. The transfer ends there, with the status it has.
                    $stopped = $took === null;
                    $accepted = $took !== false;

                    return $took === true ? strlen($chunk) : 0;
                },
            ]);

            // The address the socket really reached is the one that was vetted, and nothing else.
            if (defined('CURLOPT_PREREQFUNCTION')) {
                curl_setopt($ch, CURLOPT_PREREQFUNCTION, static function ($ch, string $reached) use ($ip, &$refused): int {
                    self::$reached = $reached;
                    $refused = ! self::mayConnect($reached, $ip);

                    return $refused ? CURL_PREREQFUNC_ABORT : CURL_PREREQFUNC_OK;
                });
            }

            if ($method === 'POST') {
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, (string) $payload);
            }

            $ok = curl_exec($ch);
            $error = curl_error($ch);

            if (! $accepted) {
                throw new RuntimeException(__('The file is too large.'));
            }

            if ($stopped && ! $refused) {
                return ['status' => $status, 'type' => (string) ($received['content-type'] ?? ''), 'url' => $url];
            }

            if ($refused) {
                throw new RuntimeException(__('That address is not allowed.'));
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
        $host = trim((string) ($parts['host'] ?? ''), '[]');

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
            if (! self::isPublic($ip)) {
                throw new RuntimeException(__('That address is not allowed.'));
            }
        }

        return [$host, $ips[0], $port];
    }

    /** The address the last request connected to, as curl reports it before anything is sent. */
    public static ?string $reached = null;

    /**
     * Whether a connection may be used: it reached the address that was vetted and pinned, and that
     * address is public. Asked once the socket is open and before the request goes out, so a
     * resolver or a route that led elsewhere after the check gets nothing.
     */
    public static function mayConnect(string $reached, string $vetted): bool
    {
        return self::$allowPrivate || (self::same($reached, $vetted) && self::isPublic($reached));
    }

    /** The same address, however it is written. */
    private static function same(string $a, string $b): bool
    {
        $a = @inet_pton($a);

        return $a !== false && $a === @inet_pton($b);
    }

    /** For tests: answers for a host instead of DNS. */
    public static ?\Closure $resolver = null;

    /** @return list<string> Some hosts disable dns_get_record; gethostbynamel still answers there. */
    private static function resolve(string $host): array
    {
        if (self::$resolver !== null) {
            return array_values((self::$resolver)($host));
        }

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

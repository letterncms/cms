<?php

declare(strict_types=1);

namespace Cms\Trust;

use Cms\Support\Crypto\Base64Url;

/**
 * Who may sign what. A root certifies this file; the file certifies the keys that
 * do the work, each for one role: `release` signs packages and feeds, `preview` the
 * same for 0.x only, and `license` signs licence tokens and nothing else.
 */
final readonly class TrustFile
{
    /** @param  array<string, mixed>  $data */
    private function __construct(public array $data) {}

    /** A file that verifies under one of the given roots (kid => raw public key). */
    public static function verified(string $json, array $roots): ?self
    {
        $opened = Envelope::open($json, 'cms-trust', static fn (string $kid) => $roots[$kid] ?? null);

        return $opened ? new self($opened['payload']) : null;
    }

    /** A file that verifies under its own roots: the shipped file, or one pinned by its fingerprint. */
    public static function selfSigned(string $json): ?self
    {
        $envelope = json_decode($json, true);
        $bytes = is_array($envelope) && is_string($envelope['payload'] ?? null) ? Base64Url::decode($envelope['payload']) : null;
        $payload = $bytes !== null ? json_decode($bytes, true) : null;

        return is_array($payload) ? self::verified($json, self::rootsOf($payload)) : null;
    }

    public function epoch(): int
    {
        return (int) ($this->data['epoch'] ?? 0);
    }

    public function version(): int
    {
        return (int) ($this->data['version'] ?? 0);
    }

    /** Marked as a development file: its keys are public, so only local and test sites accept it. */
    public function dev(): bool
    {
        return ($this->data['dev'] ?? false) === true;
    }

    /** @return array<string, string> kid => raw public key */
    public function roots(): array
    {
        return self::rootsOf($this->data);
    }

    /** Words anyone can compare with what the store's operator published. */
    public function fingerprint(): string
    {
        $roots = $this->roots();
        ksort($roots);

        return implode(' ', str_split(substr(hash('sha256', implode('', $roots)), 0, 32), 4));
    }

    /** @return array{kid: string, role: string, pub: string, nbf: ?string, not_after: ?string}|null A key of the given roles. */
    public function key(string $kid, string ...$roles): ?array
    {
        foreach ((array) ($this->data['keys'] ?? []) as $key) {
            if (($key['kid'] ?? null) === $kid && in_array($key['role'] ?? null, $roles, true)) {
                $raw = Base64Url::decode((string) ($key['pub'] ?? ''));

                return $raw !== null && strlen($raw) === 32 ? ['nbf' => null, 'not_after' => null, ...$key, 'pub' => $raw] : null;
            }
        }

        return null;
    }

    public function knows(string $kid): bool
    {
        return in_array($kid, array_column((array) ($this->data['keys'] ?? []), 'kid'), true);
    }

    /** @return array{kid: string, after: ?string, reason?: string}|null */
    public function revocation(string $kid): ?array
    {
        foreach ((array) ($this->data['revoked'] ?? []) as $revoked) {
            if (($revoked['kid'] ?? null) === $kid) {
                return ['after' => null, ...$revoked];
            }
        }

        return null;
    }

    public function licenseFamily(): string
    {
        return (string) ($this->data['license_family'] ?? '');
    }

    public function endpoint(string $name): ?string
    {
        $url = $this->data['endpoints'][$name] ?? null;

        return is_string($url) && $url !== '' ? $url : null;
    }

    /** @return array<string, string> */
    private static function rootsOf(array $payload): array
    {
        $roots = [];

        foreach ((array) ($payload['roots'] ?? []) as $root) {
            $raw = is_array($root) ? Base64Url::decode((string) ($root['pub'] ?? '')) : null;

            if ($raw !== null && strlen($raw) === 32) {
                $roots[(string) $root['kid']] = $raw;
            }
        }

        return $roots;
    }
}

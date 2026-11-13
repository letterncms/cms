<?php

declare(strict_types=1);

namespace Cms\Trust;

use Cms\Cms;
use Cms\Support\Files;
use Throwable;

/**
 * The trust file in force, and the counters that stop a feed going back in
 * time. The newest verified file wins between the anchor (shipped with the release, or
 * shipped with the release) and the one fetched last. A wiped storage/ falls back to
 * the anchor. A development file counts only on local and test sites.
 */
final class TrustStore
{
    private ?TrustFile $current = null;

    private bool $loaded = false;

    public function __construct(
        private readonly string $anchor,
        private readonly string $directory,
        private readonly string $id = 'default',
        private readonly bool $allowDev = false,
        private readonly string $clientVersion = Cms::VERSION,
    ) {}

    public function id(): string
    {
        return $this->id;
    }

    public function current(): ?TrustFile
    {
        if ($this->loaded) {
            return $this->current;
        }

        $this->loaded = true;
        $anchor = is_file($this->anchor) ? TrustFile::selfSigned((string) @file_get_contents($this->anchor)) : null;
        $this->current = $anchor && ($this->allowDev || ! $anchor->dev()) ? $anchor : null;

        $stored = $this->storedFile();
        $state = $this->state();

        if (is_file($stored) && ($state['trust']['sha256'] ?? null) === hash_file('sha256', $stored)) {
            $file = TrustFile::selfSigned((string) @file_get_contents($stored));

            if ($file && ($this->allowDev || ! $file->dev()) && (! $this->current || self::newer($file, $this->current))) {
                $this->current = $file;
            }
        }

        return $this->current;
    }

    /** The reason no store or update can be trusted here, in a code the admin explains. */
    public function problem(): ?string
    {
        if ($this->current()) {
            return null;
        }

        $anchor = is_file($this->anchor) ? TrustFile::selfSigned((string) @file_get_contents($this->anchor)) : null;

        return $anchor?->dev() ? 'dev_trust' : 'no_trust';
    }

    /** Take a fetched trust file: only one the current roots signed, and only forward. */
    public function accept(string $json): bool
    {
        $current = $this->current();

        if (! $current) {
            return false;
        }

        $file = TrustFile::verified($json, $current->roots());

        if (! $file || (! $this->allowDev && $file->dev()) || ! self::newer($file, $current)) {
            return false;
        }

        try {
            Files::put($this->storedFile(), $json);
            $state = $this->state();

            // A new epoch frees the feeds' counters from a forged high version.
            if ($file->epoch() > $current->epoch()) {
                unset($state['feeds']);
            }

            $state['trust'] = ['sha256' => hash('sha256', $json)];
            $this->writeState($state);
        } catch (Throwable) {
            return false;
        }

        $this->current = $file;

        return true;
    }

    /**
     * Open a signed feed (`cms-updates`, `cms-catalog`): signed by a release key that isn't
     * revoked, and not older than one seen before.
     *
     * @return array{payload: array<string, mixed>, kid: string}|null
     */
    public function openFeed(string $json, string $type, int $now): ?array
    {
        $trust = $this->current();

        if (! $trust) {
            return null;
        }

        // A feed key only keeps the update list fresh. The releases in it carry their own signatures, from a key it isn't.
        $roles = $type === 'cms-updates' ? ['release', 'preview', 'feed'] : ['release', 'preview'];

        $opened = Envelope::open($json, $type, static function (string $kid) use ($trust, $roles) {
            $key = $trust->key($kid, ...$roles);

            return $key && ! $trust->revocation($kid) ? $key['pub'] : null;
        });

        if (! $opened) {
            return null;
        }

        $payload = $opened['payload'];
        $version = (int) ($payload['version'] ?? 0);
        $issued = (int) strtotime((string) ($payload['issued'] ?? ''));
        $state = $this->state();
        $seen = $state['feeds'][$type] ?? ['version' => 0, 'issued' => 0];
        $key = (array) $trust->key($opened['kid'], ...$roles);

        // A preview key can't reach a paying customer: it counts only for a client on 0.x.
        if ($key['role'] === 'preview' && ! str_starts_with($this->clientVersion, '0.')) {
            return null;
        }

        // A leaked old key can only date a document inside its own window.
        if ($issued <= 0 || ($key['not_after'] !== null && $issued > (int) strtotime($key['not_after'].' 23:59:59 UTC'))) {
            return null;
        }

        if ($version < (int) $seen['version'] || $issued < (int) $seen['issued']) {
            return null;
        }

        if ($version > (int) $seen['version'] || $issued > (int) $seen['issued']) {
            $state['feeds'][$type] = ['version' => $version, 'issued' => $issued, 'at' => $now];
            $this->writeState($state);
        }

        return $opened;
    }

    /**
     * Whether a version in a feed verifies: the signature with every field, under a key that
     * is certified and not revoked. A preview key counts only between 0.x and 0.x.
     *
     * @param  array<string, mixed>  $entry
     */
    public function versionVerifies(string $package, array $entry, ?string $clientVersion = null): bool
    {
        $trust = $this->current();
        $kid = (string) ($entry['kid'] ?? '');
        $key = $trust?->key($kid, 'release', 'preview');

        if (! $key || $trust->revocation($kid)) {
            return false;
        }

        if ($key['role'] === 'preview' && (! str_starts_with((string) ($entry['version'] ?? ''), '0.') || ($clientVersion !== null && ! str_starts_with($clientVersion, '0.')))) {
            return false;
        }

        return PackageSignature::verify($package, $entry, $key['pub']);
    }

    private static function newer(TrustFile $a, TrustFile $b): bool
    {
        return [$a->epoch(), $a->version()] > [$b->epoch(), $b->version()];
    }

    private function storedFile(): string
    {
        return $this->directory.'/'.$this->id.'.json';
    }

    /** @return array<string, mixed> */
    private function state(): array
    {
        return Files::readJson($this->directory.'/'.$this->id.'.state.json');
    }

    /** @param  array<string, mixed>  $state */
    private function writeState(array $state): void
    {
        // A read-only disk loses the counters, not the check.
        try {
            Files::putJson($this->directory.'/'.$this->id.'.state.json', $state);
        } catch (Throwable) {
        }
    }
}

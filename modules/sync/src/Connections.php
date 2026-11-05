<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use Cms\Modules\License\Host\HostClass;
use Cms\Modules\License\Host\HostClassifier;
use RuntimeException;

/** Turns a saved connection into the two ends of a sync, and a pasted key into a saved connection. */
final class Connections
{
    public function __construct(private readonly Remotes $remotes, private readonly Site $site, private readonly LocalSite $local, private readonly Receiver $receiver) {}

    /**
     * Checks the key against the other site before keeping it: it has to answer, be another site,
     * and know the key. The name defaults to what the other site is, by its address.
     *
     * @return array{remote: array, hello: array}
     */
    public function connect(string $key, ?string $name = null, ?string $url = null): array
    {
        $parsed = Key::parse($key);
        $address = rtrim(trim((string) $url) ?: $parsed['url'], '/');

        if (preg_match('#^https?://#i', $address) !== 1) {
            throw new RuntimeException(__('The address has to start with http:// or https://.'));
        }

        $hello = (new RemoteEndpoint($address, $parsed['secret'], (string) parse_url($address, PHP_URL_HOST)))->hello();

        if (($hello['site_id'] ?? null) === $this->site->id()) {
            throw new RuntimeException(__('That key belongs to this site. Paste the key of the other site.'));
        }

        $label = $name !== null && trim($name) !== '' ? trim($name) : self::guess((string) $hello['url']);
        $label = preg_match('/^[a-z0-9-]+$/', $label) === 1 ? \Illuminate\Support\Str::headline($label) : $label;
        $handle = Remotes::handle($label);

        foreach ($this->remotes->all() as $existing) {
            if ($existing['name'] === $handle && $existing['site_id'] !== $hello['site_id']) {
                throw new RuntimeException(__('Another site is already called :name here. Choose another name.', ['name' => $label]));
            }
        }

        return ['remote' => $this->remotes->save($handle, $label, $address, $parsed['secret'], ['site_id' => (string) $hello['site_id'], 'label' => $label]), 'hello' => $hello];
    }

    /** @return array{0: Endpoint, 1: Endpoint} source, destination */
    public function ends(string $remote, string $direction): array
    {
        $saved = $this->remotes->get($remote);
        $theirs = new RemoteEndpoint($saved['url'], $saved['secret'], $saved['label']);
        $ours = new LocalEndpoint($this->local, $this->receiver, $this->site->name() ?: __('This site'));

        return match ($direction) {
            'pull' => [$theirs, $ours],
            'push' => [$ours, $theirs],
            default => throw new RuntimeException(__('Choose pull or push.')),
        };
    }

    public function remote(string $remote): RemoteEndpoint
    {
        $saved = $this->remotes->get($remote);

        return new RemoteEndpoint($saved['url'], $saved['secret'], $saved['label']);
    }

    public function remotes(): Remotes
    {
        return $this->remotes;
    }

    public function label(string $remote): string
    {
        return $this->remotes->get($remote)['label'];
    }

    public function touch(string $remote, array $last): void
    {
        $this->remotes->touch($remote, $last);
    }

    /** Production, Staging or Local, from the address: what people call their environments. */
    public static function guess(string $url): string
    {
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));
        $first = explode('.', $host)[0];

        return match (true) {
            preg_match('/^(staging|stage|stg|uat|preview)(-|$)/', $first) === 1 => 'Staging',
            preg_match('/^(dev|test|testing|qa|sandbox)(-|$)/', $first) === 1 => 'Development',
            (new HostClassifier)->classify($host, parse_url($url, PHP_URL_PORT) ?: null) === HostClass::Nonpublic => 'Local',
            default => 'Production',
        };
    }
}

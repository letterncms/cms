<?php

declare(strict_types=1);

namespace Cms\Trust;

use Cms\Foundation\Application;

/** The trust store of the default store, and of each store a site added (its anchor pinned when it was added). */
final class TrustRegistry
{
    /** @var array<string, TrustStore> */
    private array $stores = [];

    public function __construct(private readonly Application $app) {}

    public function default(): TrustStore
    {
        return $this->stores['default'] ??= new TrustStore($this->app->cmsPath('resources/trust/trust.json'), $this->directory(), 'default', $this->allowDev());
    }

    public function store(string $id): TrustStore
    {
        $id = (string) preg_replace('/[^a-z0-9-]/', '', $id);

        return $id === 'default' ? $this->default() : ($this->stores[$id] ??= new TrustStore($this->anchorPath($id), $this->directory(), $id, $this->allowDev()));
    }

    /** @return list<string> Ids of the stores this site added */
    public function added(): array
    {
        $ids = [];

        foreach (glob($this->directory().'/*.anchor.json') ?: [] as $file) {
            $ids[] = basename($file, '.anchor.json');
        }

        return $ids;
    }

    public function anchorPath(string $id): string
    {
        return $this->directory().'/'.preg_replace('/[^a-z0-9-]/', '', $id).'.anchor.json';
    }

    public function forget(string $id): void
    {
        unset($this->stores[$id]);
    }

    private function directory(): string
    {
        return $this->app->storagePath('trust');
    }

    /** Development trust files have public keys: only a local or test site may believe one. */
    private function allowDev(): bool
    {
        return $this->app->environment(['local', 'testing']);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Trust;

use Cms\Foundation\Application;
use Cms\Support\Files;

/** The signing keys trusted for the store and core updates. */
final class TrustRegistry
{
    private ?TrustStore $store = null;

    public function __construct(private readonly Application $app) {}

    public function default(): TrustStore
    {
        return $this->store ??= new TrustStore($this->anchor(), $this->directory(), 'default', $this->allowDev());
    }

    /**
     * What this release trusts. A local or test site can ask for the public development keys instead,
     * to work against a stand-in store: only there, because those keys sign anything for anyone.
     */
    private function anchor(): string
    {
        if (! $this->allowDev() || ! filter_var(env('CMS_DEV_TRUST', false), FILTER_VALIDATE_BOOLEAN)) {
            return $this->app->cmsPath('resources/trust/trust.json');
        }

        $file = $this->directory().'/development.json';

        if (! is_file($file)) {
            Files::put($file, DevKeys::trust());
        }

        return $file;
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

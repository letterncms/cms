<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Modules\Site\Kits\Kits;
use Cms\Support\Files;

/**
 * The kit a new site starts from is the store's, not the CMS's. A test that needs a whole site puts a copy of
 * it in the site's kits/, as Composer or the store would (the real one is letterncms/minimal in kits-public).
 */
trait InstallsMinimalKit
{
    private function installMinimalKit(): void
    {
        Files::copyDirectory(__DIR__.'/fixtures/kits/minimal', site_path('kits/minimal'));
        $this->app->make(Kits::class)->flush();
    }
}

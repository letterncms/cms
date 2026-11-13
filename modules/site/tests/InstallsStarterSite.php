<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Modules\Site\Sites\Sites;
use Cms\Support\Files;

/**
 * The site a new site starts from is the store's, not the CMS's. A test that needs a whole site puts a copy of
 * it in the site's sites/, as Composer or the store would (the real one is letterncms/starter in sites-public).
 */
trait InstallsStarterSite
{
    private function installStarterSite(): void
    {
        Files::copyDirectory(__DIR__.'/fixtures/sites/starter', site_path('sites/starter'));
        $this->app->make(Sites::class)->flush();
    }
}

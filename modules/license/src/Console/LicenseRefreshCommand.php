<?php

declare(strict_types=1);

namespace Cms\Modules\License\Console;

use Cms\Modules\License\LicenseService;
use Cms\Console\Command;

final class LicenseRefreshCommand extends Command
{
    protected $signature = 'license:refresh';

    /** A site with no paid plugin never sees these in the list. They still run: a key can go in before its plugin. */
    protected $hidden = true;

    protected $description = 'Ask the license server for a current token now';

    public function handle(LicenseService $service): int
    {
        $this->components->info('Refresh: '.($outcome = $service->refresh(force: true)).'.');

        // A server that's down changes nothing for the site, so it isn't a failed command either.
        return $this->done(['refresh' => $outcome]);
    }
}

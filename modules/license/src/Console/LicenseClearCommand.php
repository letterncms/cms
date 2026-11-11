<?php

declare(strict_types=1);

namespace Cms\Modules\License\Console;

use Cms\Modules\License\LicenseService;
use Cms\Console\Command;

final class LicenseClearCommand extends Command
{
    protected $signature = 'license:clear';

    /** A site with no paid plugin never sees these in the list. They still run: a key can go in before its plugin. */
    protected $hidden = true;

    protected $description = 'Remove this site\'s license key. The site keeps working';

    public function handle(LicenseService $service): int
    {
        $service->clear();
        $this->components->info('Removed.');

        return $this->done(['cleared' => true]);
    }
}

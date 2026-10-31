<?php

declare(strict_types=1);

namespace Cms\Modules\License\Console;

use Cms\Modules\License\LicenseService;
use Illuminate\Console\Command;
use RuntimeException;

final class LicenseSetCommand extends Command
{
    protected $signature = 'license:set {token : The licence key}';

    /** A site with no paid plugin never sees these in the list. They still run: a key can go in before its plugin. */
    protected $hidden = true;

    protected $description = 'Put a licence key in place for this site';

    public function handle(LicenseService $service): int
    {
        try {
            $report = $service->install((string) $this->argument('token'));
        } catch (RuntimeException $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }

        $this->components->info("Saved. Token: {$report->token}, level {$report->level}.");

        return self::SUCCESS;
    }
}

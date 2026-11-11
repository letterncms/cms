<?php

declare(strict_types=1);

namespace Cms\Console;

use Cms\Update\Upgrader;

/**
 * `cms migrate`: brings the database up to the code. Takes the place of the framework's command of that name,
 * which knows the core's tables only: this one also installs and upgrades the active packages.
 */
final class MigrateCommand extends Command
{
    protected $signature = 'migrate';

    protected $description = 'Run core migrations and install/upgrade active packages';

    public function handle(): int
    {
        $done = Upgrader::run($this->laravel);

        foreach ($done as $name => $what) {
            $this->components->twoColumnDetail($name, $what);
        }

        if ($done === []) {
            $this->components->info('Everything is up to date.');
        }

        return $this->done(['done' => (object) $done]);
    }
}

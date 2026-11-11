<?php

declare(strict_types=1);

namespace Cms\Console;

use Cms\Update\Upgrader;

final class SyncCommand extends Command
{
    protected $signature = 'sync';

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

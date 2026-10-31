<?php

declare(strict_types=1);

namespace Cms\Console;

use Illuminate\Console\Command;

/** Announce scheduled entries whose publish time has passed (e.g. so the site rebuilds). */
final class SchedulePublishCommand extends Command
{
    protected $signature = 'publish:scheduled';

    protected $description = 'Activate scheduled entries that are due';

    public function handle(\Cms\Content\Entries\ScheduledPublisher $publisher): int
    {
        $count = $publisher->run();
        $this->components->info($count.' scheduled entr'.($count === 1 ? 'y' : 'ies').' activated.');

        return self::SUCCESS;
    }
}

<?php

declare(strict_types=1);

namespace Cms\Console;

use Illuminate\Console\Command;
use Cms\Packages\PackageManager;

final class PluginsCommand extends Command
{
    protected $signature = 'plugins';

    protected $description = 'List plugins and themes';

    public function handle(PackageManager $packages): int
    {
        $inactive = $packages->inactive();
        $problems = $packages->problems();
        $rows = [];

        foreach ($packages->repository()->all() as $p) {
            $rows[] = [
                $p->name,
                $p->version,
                $p->core ? 'module' : ($p->firstParty() ? 'first-party' : 'third-party'),
                match (true) {
                    isset($problems[$p->name]) => '<fg=red>invalid</> '.$problems[$p->name],
                    $packages->isActive($p->name) => '<fg=green>active</>',
                    default => $inactive[$p->name] ?? 'off',
                },
            ];
        }

        $this->table(['Package', 'Version', 'Source', 'Status'], $rows);

        foreach ($packages->repository()->errors() as $error) {
            $this->warn($error);
        }

        // Invalid plugins keep running; the exit code lets CI catch them.
        return $problems === [] ? self::SUCCESS : self::FAILURE;
    }
}

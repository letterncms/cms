<?php

declare(strict_types=1);

namespace Cms\Console;

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
        $data = [];

        foreach ($packages->repository()->all() as $p) {
            $source = $p->core ? 'module' : ($p->firstParty() ? 'first-party' : 'third-party');
            $data[] = [
                'name' => $p->name,
                'version' => $p->version,
                'source' => $source,
                'status' => match (true) {
                    isset($problems[$p->name]) => 'invalid',
                    $packages->isActive($p->name) => 'active',
                    default => 'off',
                },
                'reason' => $problems[$p->name] ?? $inactive[$p->name] ?? null,
            ];
            $rows[] = [
                $p->name,
                $p->version,
                $source,
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
        return $problems === []
            ? $this->done(['plugins' => $data, 'errors' => array_values($packages->repository()->errors())])
            : $this->failure(count($problems) === 1 ? 'A plugin is invalid.' : count($problems).' plugins are invalid.', 'failed', $problems);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Console;

use Cms\Packages\PackageManager;

final class PluginsCommand extends Command
{
    protected $signature = 'plugins';

    protected $description = 'List plugins';

    public function handle(PackageManager $packages): int
    {
        $inactive = $packages->inactive();
        $rows = [];
        $data = [];

        foreach ($packages->repository()->all() as $p) {
            $source = $p->core ? 'module' : ($p->firstParty() ? 'first-party' : 'third-party');
            $data[] = [
                'name' => $p->name,
                'version' => $p->version,
                'source' => $source,
                'status' => match (true) {
                    $packages->isActive($p->name) => 'active',
                    default => 'off',
                },
                'reason' => $inactive[$p->name] ?? null,
            ];
            $rows[] = [
                $p->name,
                $p->version,
                $source,
                match (true) {
                    $packages->isActive($p->name) => '<fg=green>active</>',
                    default => $inactive[$p->name] ?? 'off',
                },
            ];
        }

        $this->table(['Package', 'Version', 'Source', 'Status'], $rows);

        foreach ($packages->repository()->errors() as $error) {
            $this->warn($error);
        }

        return $this->done(['plugins' => $data, 'errors' => array_values($packages->repository()->errors())]);
    }
}

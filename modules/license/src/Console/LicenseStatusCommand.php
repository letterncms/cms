<?php

declare(strict_types=1);

namespace Cms\Modules\License\Console;

use Cms\Modules\License\LicenseService;
use Illuminate\Console\Command;

final class LicenseStatusCommand extends Command
{
    protected $signature = 'license:status {--json : Print the whole report as JSON}';

    /** A site with no paid plugin never sees these in the list. They still run: a key can go in before its plugin. */
    protected $hidden = true;

    protected $description = 'Show this site\'s license state';

    public function handle(LicenseService $service): int
    {
        $report = $service->report();

        if ($this->option('json')) {
            $this->line((string) json_encode($report->toArray(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

            return self::SUCCESS;
        }

        $this->components->twoColumnDetail('Host', $report->host.' ('.$report->class->value.')');
        $this->components->twoColumnDetail('Token', $report->token.($report->lid ? " {$report->lid} rev {$report->rev}" : ''));
        $this->components->twoColumnDetail('Level', (string) $report->level);

        foreach ($report->items as $product => $item) {
            $this->components->twoColumnDetail($product, $item['reason'].' (level '.$item['level'].')');
        }

        foreach ($report->notes as $note) {
            $this->components->twoColumnDetail('Note', $note);
        }

        return self::SUCCESS;
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\License\Console;

use Cms\Modules\License\LicenseService;
use Cms\Console\Command;

final class LicenseStatusCommand extends Command
{
    protected $signature = 'license:status ';

    /** A site with no paid plugin never sees these in the list. They still run: a key can go in before its plugin. */
    protected $hidden = true;

    protected $description = 'Show this site\'s license state';

    public function handle(LicenseService $service): int
    {
        $report = $service->report();

        $this->components->twoColumnDetail('Host', $report->host.' ('.$report->class->value.')');
        $this->components->twoColumnDetail('Token', $report->token.($report->lid ? " {$report->lid} rev {$report->rev}" : ''));
        $this->components->twoColumnDetail('Level', (string) $report->level);

        foreach ($report->items as $product => $item) {
            $this->components->twoColumnDetail($product, $item['reason'].' (level '.$item['level'].')');
        }

        foreach ($report->notes as $note) {
            $this->components->twoColumnDetail('Note', $note);
        }

        return $this->done($report->toArray());
    }
}

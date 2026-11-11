<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Console;

use Cms\Abilities\AbilityContext;
use Cms\Cms;
use Cms\Console\Command;

/** The kits this site can start from or take in. */
final class KitListCommand extends Command
{
    protected $signature = 'kit:list';

    protected $description = 'List the site kits this site can apply';

    public function handle(Cms $cms): int
    {
        $result = $cms->abilities()->execute('kits/list', [], AbilityContext::system('cli'));

        foreach ($result['kits'] as $kit) {
            $this->components->twoColumnDetail("<fg=white>{$kit['handle']}</> {$kit['name']} {$kit['version']}", $kit['source'].($kit['missingPlugins'] !== [] ? ' · '.__('needs :plugins', ['plugins' => implode(', ', $kit['missingPlugins'])]) : ''));
        }

        foreach ($result['problems'] as $problem) {
            $this->components->warn($problem['folder'].': '.$problem['problem']);
        }

        return $this->done($result);
    }
}

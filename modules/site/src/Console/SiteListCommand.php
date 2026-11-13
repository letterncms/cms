<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Console;

use Cms\Abilities\AbilityContext;
use Cms\Cms;
use Cms\Console\Command;

/** The sites this site can start from or take in. */
final class SiteListCommand extends Command
{
    protected $signature = 'site:list';

    protected $description = 'List the sites this site can apply';

    public function handle(Cms $cms): int
    {
        $result = $cms->abilities()->execute('sites/list', [], AbilityContext::system('cli'));

        foreach ($result['sites'] as $sitePackage) {
            $this->components->twoColumnDetail("<fg=white>{$sitePackage['handle']}</> {$sitePackage['name']} {$sitePackage['version']}", $sitePackage['source'].($sitePackage['missingPlugins'] !== [] ? ' · '.__('needs :plugins', ['plugins' => implode(', ', $sitePackage['missingPlugins'])]) : ''));
        }

        foreach ($result['problems'] as $problem) {
            $this->components->warn($problem['folder'].': '.$problem['problem']);
        }

        return $this->done($result);
    }
}

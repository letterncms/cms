<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Console;

use Cms\Abilities\AbilityException;
use Cms\Cms;
use Cms\Console\Command;
use Cms\Modules\Site\Sites\SiteExporter;
use Illuminate\Support\Str;

/** This site as a site, in any folder: sites/export for whoever is at the server. */
final class SiteExportCommand extends Command
{
    protected $signature = 'site:export
        {folder : Where the site goes: an empty folder, or one that is not there yet, named after its handle}
        {--name= : Its name (the site’s name when left out)}
        {--description=}
        {--site-version=1.0.0 : Three numbers, like 1.0.0}
        {--license=}
        {--replace : Replace what the folder holds}
        {--drafts : Take drafts along too (only published entries when left out)}';

    protected $description = 'Export this site as a site';

    public function handle(Cms $cms, SiteExporter $exporter): int
    {
        $folder = (string) $this->argument('folder');
        $folder = str_starts_with($folder, '/') ? $folder : getcwd().'/'.$folder;
        $handle = basename(rtrim($folder, '/'));

        try {
            $result = $exporter->export($folder, array_filter([
                'handle' => $handle,
                'name' => (string) ($this->option('name') ?: ($cms->site('name') ?: Str::headline($handle))),
                'description' => $this->option('description'),
                'version' => (string) $this->option('site-version'),
                'license' => $this->option('license'),
            ], static fn ($v) => $v !== null && $v !== ''), (bool) $this->option('replace'), (bool) $this->option('drafts'));
        } catch (AbilityException $e) {
            return $this->failure($e);
        }

        $this->components->info(__('Exported :files files to :folder.', ['files' => $result['files'], 'folder' => $folder]));

        return $this->done(['site' => $result['site']->toArray(), 'path' => $folder, 'files' => $result['files'], 'bytes' => $result['bytes']]);
    }
}

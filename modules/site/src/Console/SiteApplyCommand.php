<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Console;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Cms;
use Cms\Console\Command;
use Cms\Modules\Site\Sites\SiteApplier;
use Cms\Modules\Site\Sites\Sites;
use Cms\Update\Layout;
use Cms\Users\User;
use Symfony\Component\Process\ExecutableFinder;
use Symfony\Component\Process\Process;

/** Copy a site into this site, once. sites/apply for whoever is at the server. */
final class SiteApplyCommand extends Command
{
    protected $signature = 'site:apply
        {handle : The site: site:list has them}
        {--mode=full : design (tokens, fonts, templates, components, code) or full (and collections, entries, globals, menus, media)}
        {--clash=refuse : Where the site has something of the same name: refuse, skip, replace or rename}
        {--dry-run : Say every step, and write nothing}
        {--require-plugins : On a site Composer manages, composer require the plugins the site needs first}
        {--without-plugins : Apply it although it needs plugins this site does not run}
        {--as= : The super administrator it happens as (the first one when left out)}';

    protected $description = 'Apply a site to this site';

    public function handle(Cms $cms, Sites $sites, SiteApplier $applier): int
    {
        $user = $this->option('as')
            ? User::query()->where('email', strtolower((string) $this->option('as')))->first()
            : User::query()->where('super', true)->orderBy('created_at')->first();

        if ($this->option('as') && ! $user?->super) {
            return $this->failure(__('There is no super administrator :email.', ['email' => (string) $this->option('as')]), 'not_found');
        }

        $input = array_filter([
            'handle' => (string) $this->argument('handle'),
            'mode' => (string) $this->option('mode'),
            'clash' => (string) $this->option('clash'),
            'withoutPlugins' => (bool) $this->option('without-plugins') ?: null,
            'dryRun' => (bool) $this->option('dry-run') ?: null,
        ], static fn ($v) => $v !== null);

        try {
            $missing = $applier->missingPlugins($sites->findOrFail($input['handle']));

            if ($missing !== [] && $this->option('require-plugins') && ! $this->option('dry-run')) {
                return $this->requirePlugins($missing);
            }

            $result = $cms->abilities()->execute('sites/apply', $input, $user !== null ? AbilityContext::forUser($user, 'cli') : AbilityContext::system('cli'));
        } catch (AbilityException $e) {
            foreach ((array) ($e->details['clashes'] ?? []) as $clash) {
                $this->line('  '.$clash);
            }

            return $this->failure($e);
        }

        $steps = $this->option('dry-run') ? $result['changes'] : $result['steps'];

        foreach ($steps as $step) {
            $this->components->twoColumnDetail($step['type'].' '.$step['name'].(isset($step['as']) ? ' → '.$step['as'] : ''), $step['action'].(isset($step['note']) ? ' · '.$step['note'] : ''));
        }

        if (! $this->option('dry-run')) {
            $this->components->info(__('Applied :site (:mode).', ['site' => $input['handle'], 'mode' => $input['mode']]).($result['backup'] ? ' '.__('The snapshot is in :path.', ['path' => $result['backup']]) : ''));
        }

        return $this->done($this->option('dry-run') ? ['site' => $input['handle'], 'mode' => $input['mode'], 'steps' => $steps, 'dryRun' => true] : $result);
    }

    /** Composer brings the plugins; the site is applied in a process that boots with them. */
    private function requirePlugins(array $missing): int
    {
        $composer = (new ExecutableFinder)->find('composer');

        if (app(Layout::class)->managed() !== 'composer' || $composer === null) {
            return $this->failure(__('The site needs :plugins. Add them under Plugins, then apply it again.', ['plugins' => implode(', ', $missing)]), 'conflict', ['plugins' => $missing]);
        }

        $require = new Process([$composer, 'require', '--no-interaction', ...$missing], $this->laravel->sitePath(), timeout: 900);
        $require->run(fn ($type, $line) => $this->json() || $this->output->write($line));

        if (! $require->isSuccessful()) {
            return $this->failure(__('Composer could not add :plugins.', ['plugins' => implode(', ', $missing)]), details: ['output' => trim($require->getErrorOutput())]);
        }

        $args = [PHP_BINARY, $this->laravel->sitePath('cms'), 'site:apply', (string) $this->argument('handle'), '--mode='.$this->option('mode'), '--clash='.$this->option('clash')];
        $this->option('as') && $args[] = '--as='.$this->option('as');
        $this->json() && $args[] = '--json';
        $apply = new Process($args, $this->laravel->sitePath(), timeout: 900);
        $apply->run(fn ($type, $line) => $this->output->write($line));

        // The second process has said everything, its document included.
        exit($apply->getExitCode() ?? 1);
    }
}

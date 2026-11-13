<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Console;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Cms;
use Cms\Console\Command;
use Cms\Users\User;

/** Make this site another site, keeping what it was. sites/switch for whoever is at the server. */
final class SiteSwitchCommand extends Command
{
    protected $signature = 'site:switch
        {handle : The site: site:list has them}
        {--fresh : The site as it came, not as this site left it}
        {--as= : The super administrator it happens as (the first one when left out)}';

    protected $description = 'Switch this site to another site, saving what it is now';

    public function handle(Cms $cms): int
    {
        $user = $this->option('as')
            ? User::query()->where('email', strtolower((string) $this->option('as')))->first()
            : User::query()->where('super', true)->orderBy('created_at')->first();

        if ($this->option('as') && ! $user?->super) {
            return $this->failure(__('There is no super administrator :email.', ['email' => (string) $this->option('as')]), 'not_found');
        }

        try {
            $result = $cms->abilities()->execute('sites/switch', array_filter(['handle' => (string) $this->argument('handle'), 'fresh' => (bool) $this->option('fresh') ?: null]), $user !== null ? AbilityContext::forUser($user, 'cli') : AbilityContext::system('cli'));
        } catch (AbilityException $e) {
            return $this->failure($e);
        }

        $this->components->info($result['switched']
            ? __('This site is :site now.', ['site' => $result['site']['name']]).(isset($result['saved']) ? ' '.__(':name is saved as it was.', ['name' => $result['saved']['name']]) : '')
            : __('This site is :site already.', ['site' => $result['site']['name']]));

        return $this->done($result);
    }
}

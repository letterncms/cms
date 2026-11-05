<?php

declare(strict_types=1);

namespace Cms\Modules\Sync\Console;

use Cms\Modules\Sync\Connections;
use Cms\Modules\Sync\Remotes;
use Cms\Modules\Sync\Site;
use Illuminate\Console\Command;
use Throwable;

final class RemoteCommand extends Command
{
    protected $signature = 'remote
        {action? : add, remove, key or allow; nothing lists the connected sites}
        {name? : The site’s short name, like production; for allow: pull or push}
        {key? : For add, the other site’s connection key; for allow: on or off}
        {--url= : For add, the address to reach the other site at, when it isn’t the one in its key}
        {--new : For key, make a new key: sites connected with the old one need the new one}';

    protected $description = 'The sites this one syncs with: list them, add one by its connection key, remove one, or show this site’s key.';

    public function handle(Remotes $remotes, Connections $connections, Site $site): int
    {
        try {
            return match ($this->argument('action')) {
                null, 'list' => $this->list($remotes),
                'add' => $this->add($connections),
                'remove' => $this->remove($remotes),
                'key' => $this->key($site),
                'allow' => $this->allow($site),
                default => $this->fail('Choose add, remove, key or allow.'),
            };
        } catch (Throwable $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }
    }

    private function list(Remotes $remotes): int
    {
        $all = $remotes->all();

        if ($all === []) {
            $this->components->info(__('No sites connected yet. Copy the key from Sync on the other site, then run php cms remote add <name> <key>.'));

            return self::SUCCESS;
        }

        foreach ($all as $remote) {
            $last = $remote['last'] ? ' · '.__('last :direction :ago', ['direction' => $remote['last']['direction'], 'ago' => \Illuminate\Support\Carbon::parse($remote['last']['at'])->diffForHumans()]) : '';
            $this->components->twoColumnDetail('<fg=green>'.$remote['name'].'</>', $remote['url'].$last);
        }

        return self::SUCCESS;
    }

    private function add(Connections $connections): int
    {
        $name = (string) $this->argument('name');
        $key = (string) ($this->argument('key') ?? '');

        if ($key === '') {
            $key = (string) $this->secret(__('Paste the connection key from Sync on the other site'));
        }

        $result = $connections->connect($key, $name !== '' ? $name : null, $this->option('url') ?: null);
        $this->components->info(__('Connected :name: :site at :url, version :version.', ['name' => $result['remote']['name'], 'site' => $result['hello']['name'], 'url' => $result['hello']['url'], 'version' => $result['hello']['cms']]));
        $this->line('  '.__('Next: php cms pull :name, or php cms push :name', ['name' => $result['remote']['name']]));

        return self::SUCCESS;
    }

    private function remove(Remotes $remotes): int
    {
        $name = (string) $this->argument('name');
        $remotes->get($name);
        $remotes->remove($name);
        $this->components->info(__(':name is no longer connected. Nothing changed there.', ['name' => $name]));

        return self::SUCCESS;
    }

    private function key(Site $site): int
    {
        if ($this->option('new')) {
            $site->renew(true);
            $this->components->warn(__('This site has a new key. Connect it again on every site that had the old one.'));
        }

        $settings = $site->settings();
        $this->line($site->key());
        $this->newLine();
        $this->line('  '.__('Pulls :pull, pushes :push.', ['pull' => $settings['allow_pull'] ? __('allowed') : __('turned off'), 'push' => $settings['allow_push'] ? __('allowed') : __('turned off')]));

        return self::SUCCESS;
    }

    private function allow(Site $site): int
    {
        $what = (string) $this->argument('name');
        $on = in_array(strtolower((string) $this->argument('key')), ['on', 'yes', 'true', '1'], true);
        $site->allow($what, $on);
        $this->components->info($what === 'pull' ? ($on ? __('Other sites can pull from this one.') : __('Other sites can no longer pull from this one.')) : ($on ? __('Other sites can push to this one.') : __('Other sites can no longer push to this one.')));

        return self::SUCCESS;
    }
}

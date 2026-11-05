<?php

declare(strict_types=1);

namespace Cms\Modules\Sync\Console;

use Cms\Modules\Sync\Connections;
use Cms\Modules\Sync\Receiver;
use Illuminate\Console\Command;
use Throwable;

final class UndoCommand extends Command
{
    protected $signature = 'sync:undo
        {id? : The sync to undo (php cms sync:history lists them); the latest when left out}
        {--remote= : Undo a push on that connected site instead of something that came into this one}
        {--yes : Don\'t ask}';

    protected $description = 'Put back what a sync replaced, from the backup made just before it.';

    public function handle(Receiver $receiver, Connections $connections): int
    {
        try {
            $remote = (string) $this->option('remote');
            $target = $remote !== '' ? $connections->remote($remote) : null;
            $history = $target ? $target->history() : $receiver->history();
            $id = (string) ($this->argument('id') ?? '');
            $sync = null;

            foreach ($history as $s) {
                if (($id === '' && $s['can_undo']) || $s['id'] === $id) {
                    $sync = $s;

                    break;
                }
            }

            if (! $sync || ! $sync['can_undo']) {
                $this->components->error(__('There’s no sync to undo there.'));

                return self::FAILURE;
            }

            $where = $target ? $target->label() : __('this site');
            $this->line('  '.__(':direction :ago from :site: :tables', ['direction' => $sync['direction'] === 'pull' ? __('Pulled') : __('Pushed'), 'ago' => \Illuminate\Support\Carbon::parse($sync['at'])->diffForHumans(), 'site' => $sync['from']['label'] ?? $sync['from']['name'] ?? '?', 'tables' => implode(', ', $sync['tables'])]));

            if (! $this->option('yes') && ! $this->confirm(__('Put back what :where had before it? Changes made since are replaced too.', ['where' => $where]), false)) {
                return self::SUCCESS;
            }

            do {
                $result = $target ? $target->undo($sync['id']) : $receiver->undo($sync['id'], 30.0);
            } while (! $result['done']);

            if ($target && ($last = $connections->remotes()->get($remote)['last'] ?? null) && ($last['id'] ?? null) === $sync['id']) {
                $connections->remotes()->touch($remote, [...$last, 'undone_at' => now()->toIso8601String()]);
            }

            $this->components->info(__('Undone. :where is as it was before that sync.', ['where' => ucfirst($where)]));

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }
    }
}

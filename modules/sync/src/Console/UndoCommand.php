<?php

declare(strict_types=1);

namespace Cms\Modules\Sync\Console;

use Cms\Modules\Sync\Connections;
use Cms\Modules\Sync\Receiver;
use Cms\Console\Command;
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
                return $this->failure(__('There’s no sync to undo there.'), 'not_found');
            }

            $where = $target ? $target->label() : __('this site');
            $this->line('  '.__(':direction :ago from :site: :tables', ['direction' => $sync['direction'] === 'pull' ? __('Pulled') : __('Pushed'), 'ago' => \Illuminate\Support\Carbon::parse($sync['at'])->diffForHumans(), 'site' => $sync['from']['label'] ?? $sync['from']['name'] ?? '?', 'tables' => implode(', ', $sync['tables'])]));

            if (! $this->agreed(__('Put back what :where had before it? Changes made since are replaced too.', ['where' => $where]))) {
                return $this->done(['status' => 'declined']);
            }

            do {
                $result = $target ? $target->undo($sync['id']) : $receiver->undo($sync['id'], 30.0);
            } while (! $result['done']);

            if ($target && ($last = $connections->remotes()->get($remote)['last'] ?? null) && ($last['id'] ?? null) === $sync['id']) {
                $connections->remotes()->touch($remote, [...$last, 'undone_at' => now()->toIso8601String()]);
            }

            $this->components->info(__('Undone. :where is as it was before that sync.', ['where' => ucfirst($where)]));

            return $this->done(['undone' => $sync['id']]);
        } catch (Throwable $e) {
            return $this->failure($e);
        }
    }
}

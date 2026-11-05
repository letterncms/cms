<?php

declare(strict_types=1);

namespace Cms\Modules\Sync\Console;

use Cms\Modules\Sync\Connections;
use Cms\Modules\Sync\Receiver;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Throwable;

final class HistoryCommand extends Command
{
    protected $signature = 'sync:history {--remote= : What came into that connected site instead}';

    protected $description = 'What came into this site through Sync, newest first, and what can still be undone.';

    public function handle(Receiver $receiver, Connections $connections): int
    {
        try {
            $remote = (string) $this->option('remote');
            $history = $remote !== '' ? $connections->remote($remote)->history() : $receiver->history();
        } catch (Throwable $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }

        if ($history === []) {
            $this->components->info(__('Nothing has come in through Sync yet.'));

            return self::SUCCESS;
        }

        foreach ($history as $s) {
            $state = $s['undone_at'] ? __('undone') : ($s['can_undo'] ? __('can be undone') : '');
            $this->components->twoColumnDetail($s['id'].'  '.Carbon::parse($s['at'])->diffForHumans(), ($s['direction'] === 'pull' ? __('pulled from') : __('pushed from')).' '.($s['from']['label'] ?? $s['from']['name'] ?? '?').' · '.implode(', ', $s['tables']).($state !== '' ? ' · '.$state : ''));
        }

        return self::SUCCESS;
    }
}

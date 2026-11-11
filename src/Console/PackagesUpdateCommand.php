<?php

declare(strict_types=1);

namespace Cms\Console;

use Cms\Update\CoreUpdate;
use Cms\Update\ReleaseFeed;
use RuntimeException;

/** Check and update from the command line. In cron, `--security-only` is what an admin's visit does without one. */
final class PackagesUpdateCommand extends Command
{
    protected $signature = 'packages:update {--security-only : Only what would update by itself} {--check : Only say what is on offer}';

    protected $description = 'Update the core: check the signed list, then download, verify and switch';

    public function handle(CoreUpdate $update, ReleaseFeed $feed): int
    {
        if ($error = $feed->check()) {
            $this->components->warn('Check failed: '.$error);
        }

        $offer = $update->offer();
        $release = $offer['update'];

        if ($this->option('check')) {
            $this->line((string) json_encode($offer, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

            return $this->done($offer);
        }

        try {
            if ($this->option('security-only')) {
                do {
                    $step = $update->auto();
                } while ($step['more']);

                $this->components->info('Security update: '.($step['state'] ?? $step['reason'] ?? 'nothing to do').'.');

                return ($step['state'] ?? '') === 'failed' ? $this->failure('The security update failed.', details: $step) : $this->done($step);
            }

            if (! $release) {
                $this->components->info('Up to date: '.$offer['current'].'.');

                return $this->done(['state' => 'current', 'current' => $offer['current']]);
            }

            $update->start((string) $release['version']);

            do {
                $state = (string) $update->step()['state'];
            } while (in_array($state, ['downloading', 'verifying', 'extracting', 'checking_files', 'ready'], true));

            if ($state === 'migrating') {
                $state = $update->finishFromCli();
            }
        } catch (RuntimeException $e) {
            return $this->failure($e);
        }

        $status = $update->status();
        $this->components->twoColumnDetail('State', $state);
        $this->components->twoColumnDetail('Running', (string) $status['current']);

        if ($state !== 'done') {
            return $this->failure((string) ($status['error'] ?? 'The update stopped.'), details: ['state' => $state, 'current' => (string) $status['current']]);
        }

        return $this->done(['state' => $state, 'current' => (string) $status['current']]);
    }
}

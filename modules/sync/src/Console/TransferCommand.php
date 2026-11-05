<?php

declare(strict_types=1);

namespace Cms\Modules\Sync\Console;

use Cms\Modules\Sync\Connections;
use Cms\Modules\Sync\Preview;
use Cms\Modules\Sync\Receiver;
use Cms\Modules\Sync\Transfer;
use Illuminate\Console\Command;
use Throwable;

/** `php cms pull` and `php cms push`: the same preview, question and progress as the admin. */
abstract class TransferCommand extends Command
{
    abstract protected function direction(): string;

    public function handle(Connections $connections, Transfer $transfer): int
    {
        $direction = $this->direction();
        $remote = (string) $this->argument('remote');
        $what = array_values(array_filter(array_map('strval', (array) $this->argument('what'))));
        $rewrite = array_map(static fn (string $pair) => explode('=>', $pair, 2) + [1 => ''], (array) $this->option('replace'));

        try {
            if ($current = $transfer->current()) {
                if ($current['remote'] !== $remote || $current['direction'] !== $direction) {
                    $this->components->error(__('A :direction with :site is still going. Finish it, or cancel it from the admin, first.', ['direction' => $current['direction'], 'site' => $current['remote_label']]));

                    return self::FAILURE;
                }

                $this->components->warn(__('A :direction with :site stopped at :percent%.', ['direction' => $direction, 'site' => $current['remote_label'], 'percent' => $current['percent']]));

                if (! $this->option('yes') && ! $this->confirm(__('Carry on where it stopped?'), true)) {
                    $transfer->cancel($current['id']);
                    $this->components->info(__('Canceled. Neither site changed.'));

                    return self::SUCCESS;
                }

                return $this->follow($transfer, $transfer->resume($current['id']));
            }

            [$source, $dest] = $connections->ends($remote, $direction);
            $preview = Preview::make($source, $dest, $direction, $rewrite);
            $this->show($preview);

            if ($preview['problems'] !== []) {
                return self::FAILURE;
            }

            $groups = $what === [] ? array_column(array_filter($preview['groups'], static fn (array $g) => $g['selected']), 'id') : $what;
            $known = array_column($preview['groups'], 'id');

            foreach ($groups as $group) {
                if (! in_array($group, $known, true)) {
                    $this->components->error(__('There’s nothing called :what to sync. Choose from: :list.', ['what' => $group, 'list' => implode(', ', $known)]));

                    return self::FAILURE;
                }
            }

            $collections = $this->option('collections') ? array_map('trim', explode(',', (string) $this->option('collections'))) : null;
            $this->line('  '.__('Moves: :groups', ['groups' => implode(', ', array_map(static fn (string $id) => array_column($preview['groups'], 'label', 'id')[$id], $groups))]).($collections ? ' ('.implode(', ', $collections).')' : ''));
            $this->newLine();

            if ($this->option('dry-run')) {
                return self::SUCCESS;
            }

            $question = $direction === 'pull'
                ? __('Replace these on this site with :site’s? A backup is made first.', ['site' => $source->label()])
                : __('Replace these on :site with this site’s? A backup is made there first.', ['site' => $dest->label()]);

            if (! $this->option('yes') && ! $this->confirm($question, false)) {
                return self::SUCCESS;
            }

            return $this->follow($transfer, $transfer->start($remote, $direction, ['groups' => $groups, 'collections' => $collections, 'rewrite' => $rewrite]));
        } catch (Throwable $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }
    }

    private function show(array $preview): void
    {
        $this->newLine();
        $this->line('  <options=bold>'.$preview['from']['label'].'</> ('.$preview['from']['url'].') → <options=bold>'.$preview['to']['label'].'</> ('.$preview['to']['url'].')');
        $this->newLine();

        foreach ($preview['problems'] as $problem) {
            $this->components->error($problem);
        }

        foreach ($preview['groups'] as $g) {
            $parts = [];

            if ($g['tables'] !== []) {
                $from = array_sum(array_column($g['tables'], 'from'));
                $to = array_sum(array_column($g['tables'], 'to'));
                $parts[] = $from === $to && $from === 0 ? __('empty on both') : __(':from rows replace :to', ['from' => number_format($from), 'to' => number_format($to)]);
            }

            if ($g['files']) {
                $f = $g['files'];
                $parts[] = $f['add'] + $f['change'] + $f['remove'] === 0 ? __('files the same') : __('files: :add new, :change changed, :remove removed (:size)', ['add' => $f['add'], 'change' => $f['change'], 'remove' => $f['remove'], 'size' => Receiver::bytes($f['bytes'])]);
            }

            $mark = $g['available'] ? ($g['selected'] ? '<fg=green>✓</>' : '<fg=gray>·</>') : '<fg=red>✗</>';
            $this->components->twoColumnDetail($mark.' '.$g['id'].' <fg=gray>'.$g['label'].'</>', $g['available'] ? implode(' · ', $parts) : '<fg=red>'.$g['reason'].'</>');
        }

        foreach ($preview['notes'] as $note) {
            $this->line('  <fg=gray>'.$note.'</>');
        }

        foreach ($preview['rewrite'] as [$from, $to]) {
            $this->line('  <fg=gray>'.__('Rewrites :from → :to', ['from' => $from, 'to' => $to]).'</>');
        }

        $this->newLine();
    }

    private function follow(Transfer $transfer, array $progress): int
    {
        $bar = $this->output->createProgressBar(100);
        $bar->setFormat('  %bar% %percent:3s%%  %message%');
        $bar->setMessage($progress['label']);
        $bar->start();

        while (in_array($progress['status'], ['running', 'waiting'], true)) {
            if ($progress['status'] === 'waiting') {
                $bar->setMessage('<fg=yellow>'.$progress['message'].'</>');
                sleep(3);
            }

            $progress = $transfer->step($progress['id'], 2.0);
            $bar->setProgress($progress['percent']);
            $bar->setMessage($progress['label'].($progress['eta'] ? ' · '.__('about :time left', ['time' => \Carbon\CarbonInterval::seconds($progress['eta'])->cascade()->forHumans(['short' => true])]) : ''));
        }

        $bar->finish();
        $this->newLine(2);

        return match ($progress['status']) {
            'done' => $this->done($progress),
            'paused' => $this->failWith(__('The other site stopped answering: :message Run the same command again to carry on.', ['message' => $progress['message']])),
            default => $this->failWith((string) ($progress['error'] ?? __('The sync stopped.')).' '.__('Neither site changed.')),
        };
    }

    private function done(array $progress): int
    {
        $this->components->info(__('Done: :rows rows and :files files from :from to :to.', ['rows' => number_format($progress['rows']), 'files' => number_format($progress['files']), 'from' => $progress['from'], 'to' => $progress['to']]));
        $undo = $progress['direction'] === 'pull' ? 'php cms sync:undo' : 'php cms sync:undo --remote='.$progress['remote'];
        $this->line('  '.__('Changed your mind? :command puts back what was there.', ['command' => $undo]));

        return self::SUCCESS;
    }

    private function failWith(string $message): int
    {
        $this->components->error($message);

        return self::FAILURE;
    }
}

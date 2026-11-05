<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

/**
 * Runs a sync from this site, a few seconds at a time, so no request comes near a host's time
 * limit. Everything it needs to carry on is written down after every piece: a request that
 * times out, a closed tab or a dropped connection resumes where it was. The other site keeps
 * its staged copy until this one says to switch, or gives up after ten minutes of quiet.
 */
final class Transfer
{
    /** A text file is rewritten whole, so it travels whole up to this size; bigger ones go byte for byte. */
    private const int TEXT_LIMIT = 20_000_000;

    private const int MAX_RETRIES = 30;

    public function __construct(private readonly Connections $connections) {}

    /**
     * @param  array{groups?: list<string>, collections?: list<string>|null, rewrite?: list<array{0: string, 1: string}>}  $choice
     */
    public function start(string $remote, string $direction, array $choice): array
    {
        if ($current = $this->current()) {
            throw new RuntimeException(__('A sync with :site is still going. Finish or cancel it first.', ['site' => $current['remote_label']]));
        }

        [$source, $dest] = $this->connections->ends($remote, $direction);
        $preview = Preview::make($source, $dest, $direction, (array) ($choice['rewrite'] ?? []));

        if ($preview['problems'] !== []) {
            throw new RuntimeException(implode(' ', $preview['problems']));
        }

        $chosen = array_flip(array_map('strval', (array) ($choice['groups'] ?? array_column(array_filter($preview['groups'], static fn (array $g) => $g['selected']), 'id'))));
        $collections = isset($choice['collections']) && is_array($choice['collections']) ? array_values(array_map('strval', $choice['collections'])) : null;
        $tables = [];
        $areas = [];
        $groups = [];

        foreach ($preview['groups'] as $group) {
            if (! isset($chosen[$group['id']])) {
                continue;
            }

            if (! $group['available']) {
                throw new RuntimeException($group['label'].': '.$group['reason']);
            }

            $groups[] = $group['label'];
            $all = $collections === null || ! isset($group['collections']) || array_diff(array_column($group['collections'], 'handle'), $collections) === [];

            foreach ($group['tables'] as $t) {
                $scope = ! $all && in_array($t['table'], ['entries', 'revisions'], true) ? ['column' => 'collection', 'in' => $collections] : null;
                $tables[] = ['table' => $t['table'], 'scope' => $scope, 'rows' => $scope ? null : $t['from'], 'bytes' => $t['bytes']];
            }

            foreach ($group['areas'] as $area) {
                $diff = Areas::diff((array) ($preview['inventories']['from']['areas'][$area] ?? []), (array) ($preview['inventories']['to']['areas'][$area] ?? []), $preview['rewrite'] !== [], $area);
                $sizes = (array) ($preview['inventories']['from']['areas'][$area] ?? []);
                $areas[$area] = ['send' => array_map(static fn (string $p) => [$p, $sizes[$p][0]], [...$diff['add'], ...$diff['change']]), 'remove' => $diff['remove']];
            }
        }

        if ($groups === []) {
            throw new RuntimeException(__('Choose what to :direction.', ['direction' => $direction === 'pull' ? __('pull') : __('push')]));
        }

        $bytes = array_sum(array_column($tables, 'bytes')) + array_sum(array_map(static fn (array $a) => array_sum(array_column($a['send'], 1)), $areas));
        $id = strtolower((string) Str::ulid());
        $job = [
            'id' => $id, 'remote' => $remote, 'remote_label' => $this->connections->label($remote), 'direction' => $direction, 'groups' => $groups,
            'from' => $preview['from'], 'to' => $preview['to'], 'rewrite' => $preview['rewrite'], 'tables' => $tables, 'areas' => $areas,
            'status' => 'running', 'phase' => 'begin', 'cursor' => ['table' => 0, 'after' => null, 'seq' => 0, 'area' => 0, 'file' => 0, 'offset' => 0],
            'total' => max(1, $bytes), 'done' => 0, 'rows' => 0, 'files' => 0, 'retries' => 0, 'message' => null, 'error' => null, 'result' => null,
            'chunk' => (int) min($preview['from']['chunk'] ?? LocalSite::CHUNK, $preview['to']['chunk'] ?? LocalSite::CHUNK, LocalSite::CHUNK),
            'started_at' => now()->toIso8601String(), 'finished_at' => null,
        ];
        $this->save($job);

        return self::progress($job);
    }

    /** One stretch of work, then where it stands. */
    public function step(string $id, float $budget = 8.0): array
    {
        $job = $this->job($id);

        if (! in_array($job['status'], ['running', 'waiting'], true)) {
            return self::progress($job);
        }

        [$source, $dest] = $this->connections->ends($job['remote'], $job['direction']);
        $rewriter = new Rewriter($job['rewrite']);
        $until = microtime(true) + $budget;
        $job['status'] = 'running';
        $job['message'] = null;

        try {
            do {
                match ($job['phase']) {
                    'begin' => $this->begin($job, $dest),
                    'tables' => $this->tables($job, $source, $dest, $rewriter),
                    'files' => $this->files($job, $source, $dest, $rewriter),
                    'backup' => $this->backup($job, $dest),
                    'finalize' => $this->finalize($job, $dest),
                    default => null,
                };
                $job['retries'] = 0;
                $this->save($job);
            } while ($job['status'] === 'running' && microtime(true) < $until);
        } catch (RemoteUnavailable $e) {
            $job['retries']++;
            $job['status'] = $job['retries'] >= self::MAX_RETRIES ? 'paused' : 'waiting';
            $job['message'] = $e->getMessage();
        } catch (Throwable $e) {
            $job['status'] = 'failed';
            $job['error'] = $e->getMessage();
            $job['finished_at'] = now()->toIso8601String();
            rescue(static fn () => $dest->cancel($job['id']), report: false);
            $e instanceof RemoteRefused || $e instanceof RuntimeException || report($e);
        }

        $this->save($job);

        return self::progress($job);
    }

    /** Picks up a sync that paused after too many failed tries. */
    public function resume(string $id): array
    {
        $job = $this->job($id);

        if ($job['status'] === 'paused') {
            $job['status'] = 'waiting';
            $job['retries'] = 0;
            $this->save($job);
        }

        return self::progress($job);
    }

    public function cancel(string $id): array
    {
        $job = $this->job($id);

        if (in_array($job['status'], ['running', 'waiting', 'paused'], true)) {
            [, $dest] = $this->connections->ends($job['remote'], $job['direction']);
            rescue(static fn () => $dest->cancel($job['id']), report: false);
            $job['status'] = 'cancelled';
            $job['finished_at'] = now()->toIso8601String();
            $this->save($job);
        }

        return self::progress($job);
    }

    /** The sync that hasn't ended, if any: there's one at a time from a site. */
    public function current(): ?array
    {
        foreach (glob(Site::dir('jobs/*.json')) ?: [] as $file) {
            $job = Site::readJson($file);

            if (in_array($job['status'] ?? null, ['running', 'waiting', 'paused'], true)) {
                return self::progress($job);
            }
        }

        return null;
    }

    public function get(string $id): array
    {
        return self::progress($this->job($id));
    }

    private function begin(array &$job, Endpoint $dest): void
    {
        $dest->begin($job['id'], [
            'from' => ['name' => $job['from']['name'], 'url' => $job['from']['url'], 'label' => $job['from']['name']],
            'direction' => $job['direction'],
            'tables' => array_map(static fn (array $t) => ['table' => $t['table'], 'scope' => $t['scope']], $job['tables']),
            'areas' => array_map(static fn (array $a) => ['remove' => $a['remove']], $job['areas']),
            'bytes' => $job['total'],
        ]);
        $job['phase'] = 'tables';
    }

    private function tables(array &$job, Endpoint $source, Endpoint $dest, Rewriter $rewriter): void
    {
        $c = &$job['cursor'];
        $t = $job['tables'][$c['table']] ?? null;

        if ($t === null) {
            $job['phase'] = 'files';

            return;
        }

        $chunk = $source->export($t['table'], $c['after'], $t['scope']);
        $rows = $rewriter->active() ? array_map($rewriter->row(...), $chunk['rows']) : $chunk['rows'];
        $dest->import($job['id'], $t['table'], $c['seq'], $chunk['columns'], $rows);

        $job['rows'] += count($rows);
        $job['done'] = min($job['total'], $job['done'] + (int) $chunk['bytes']);
        $c['seq']++;
        $c['after'] = $chunk['next'];

        if ($chunk['next'] === null) {
            [$c['table'], $c['after'], $c['seq']] = [$c['table'] + 1, null, 0];
        }
    }

    private function files(array &$job, Endpoint $source, Endpoint $dest, Rewriter $rewriter): void
    {
        $c = &$job['cursor'];
        $areas = array_keys($job['areas']);
        $requests = [];
        $room = $job['chunk'];

        // As many whole small files as fit, or one piece of a big one.
        while ($room > 0 && isset($areas[$c['area']])) {
            $area = $areas[$c['area']];
            [$path, $size] = $job['areas'][$area]['send'][$c['file']] ?? [null, 0];

            if ($path === null) {
                [$c['area'], $c['file'], $c['offset']] = [$c['area'] + 1, 0, 0];

                continue;
            }

            $whole = $rewriter->active() && Areas::isText($area, $path) && $size <= self::TEXT_LIMIT;
            $length = $whole ? $size : min($size - $c['offset'], $room);

            if ($requests !== [] && $length > $room) {
                break;
            }

            $requests[] = ['area' => $area, 'path' => $path, 'offset' => $whole ? 0 : $c['offset'], 'length' => $length];
            $room -= max(1, $length);

            if ($whole || $c['offset'] + $length >= $size) {
                [$c['file'], $c['offset']] = [$c['file'] + 1, 0];
                $job['files']++;
            } else {
                $c['offset'] += $length;
            }
        }

        if ($requests === []) {
            $job['phase'] = 'backup';

            return;
        }

        $pieces = [];

        foreach (Pack::decode($source->read($requests)) as [$h, $data]) {
            $complete = $h['offset'] === 0 && strlen($data) === $h['size'];

            if ($complete && $rewriter->active() && Areas::isText($h['area'], $h['path'])) {
                $data = $rewriter->text($data);
                $h['size'] = strlen($data);
            }

            $complete && $h['sha1'] = sha1($data);
            $pieces[] = [$h, $data];
            $job['done'] = min($job['total'], $job['done'] + strlen($data));
        }

        $dest->write($job['id'], Pack::encode($pieces));
    }

    private function backup(array &$job, Endpoint $dest): void
    {
        $result = $dest->backup($job['id']);

        if ($result['done']) {
            $job['phase'] = 'finalize';
        }
    }

    private function finalize(array &$job, Endpoint $dest): void
    {
        // A switch that went through while the answer got lost: the other side's history knows.
        if (! empty($job['finalizing']) && in_array($job['id'], array_column($dest->history(), 'id'), true)) {
            $result = ['ok' => true, 'backup' => $job['id'], 'signed_in' => 0];
        } else {
            $job['finalizing'] = true;
            $this->save($job);
            $result = $dest->finalize($job['id']);
        }

        $job['phase'] = 'done';
        $job['status'] = 'done';
        $job['done'] = $job['total'];
        $job['result'] = $result;
        $job['finished_at'] = now()->toIso8601String();
        $this->connections->touch($job['remote'], ['direction' => $job['direction'], 'at' => $job['finished_at'], 'id' => $job['id'], 'groups' => $job['groups']]);
    }

    private function job(string $id): array
    {
        if (preg_match('/^[0-9a-z]{26}$/', $id) !== 1) {
            throw new RuntimeException('Invalid sync id.');
        }

        $job = Site::readJson(Site::dir('jobs/'.$id.'.json'));

        return $job !== [] ? $job : throw new RuntimeException(__('There’s no such sync.'));
    }

    private function save(array $job): void
    {
        Site::writeJson(Site::dir('jobs/'.$job['id'].'.json'), $job);

        // Finished syncs are kept a while for their summary, then go.
        foreach (glob(Site::dir('jobs/*.json')) ?: [] as $file) {
            if (time() - (int) @filemtime($file) > 7 * 86400) {
                @unlink($file);
            }
        }
    }

    public static function progress(array $job): array
    {
        $phase = $job['phase'];
        $table = $job['tables'][$job['cursor']['table']]['table'] ?? null;
        $label = match ($phase) {
            'begin' => __('Getting :site ready', ['site' => $job['to']['label']]),
            'tables' => __('Copying :table', ['table' => str_replace('_', ' ', (string) $table)]),
            'files' => __('Copying files'),
            'backup' => __('Backing up :site', ['site' => $job['to']['label']]),
            'finalize' => __('Switching over'),
            default => __('Done'),
        };
        $share = match ($phase) {
            'backup' => 0.92,
            'finalize' => 0.97,
            'done' => 1.0,
            default => 0.9 * min(1, $job['done'] / max(1, $job['total'])),
        };
        $elapsed = max(1, time() - strtotime((string) $job['started_at']));

        return [
            'id' => $job['id'], 'remote' => $job['remote'], 'remote_label' => $job['remote_label'], 'direction' => $job['direction'], 'groups' => $job['groups'],
            'from' => $job['from']['label'], 'to' => $job['to']['label'],
            'status' => $job['status'], 'phase' => $phase, 'label' => $label, 'percent' => (int) floor($share * 100),
            'eta' => $share > 0.05 && $share < 1 ? (int) round($elapsed / $share * (1 - $share)) : null,
            'rows' => $job['rows'], 'files' => $job['files'], 'bytes' => $job['done'],
            'message' => $job['message'], 'error' => $job['error'], 'result' => $job['result'],
            'started_at' => $job['started_at'], 'finished_at' => $job['finished_at'],
        ];
    }
}

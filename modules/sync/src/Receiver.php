<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use Cms\Support\Files;
use Illuminate\Support\Facades\Cache;
use RuntimeException;
use Throwable;

/**
 * The receiving side of a sync. Rows go into staging tables and files into a staging folder
 * while the site keeps running as it was. Then a backup of what is about to be replaced, and
 * one switch: the tables in one transaction, the files by renaming. Undo is the same switch,
 * from the backup. One sync at a time: a second one waits until the first ends or has been
 * quiet for ten minutes.
 */
final class Receiver
{
    private const int STALE = 600;

    private const int KEEP_BACKUPS = 3;

    public function __construct(private readonly Database $db, private readonly Areas $areas) {}

    /**
     * @param  array{from: array{name: string, url: string}, direction: string, tables: list<array{table: string, scope: ?array}>, areas: array<string, array{remove: list<string>}>, bytes: int}  $plan
     */
    public function begin(string $job, array $plan): array
    {
        self::validJob($job);
        $this->lock($job, 'sync');
        $this->db->dropStaging();
        $this->prune();

        $tables = [];
        $short = substr(hash('xxh3', $job), 0, 8);

        foreach (array_values($plan['tables'] ?? []) as $i => $t) {
            $table = (string) $t['table'];

            if (! in_array($table, $this->db->tables(), true)) {
                throw new RuntimeException(__('This site has no :table table.', ['table' => $table]));
            }

            $staging = Database::STAGING.$short.'_'.$i;
            $this->db->createStaging($table, $staging);
            $tables[$table] = ['staging' => $staging, 'scope' => self::scope($t['scope'] ?? null), 'seq' => -1];
        }

        $areas = [];

        foreach ((array) ($plan['areas'] ?? []) as $area => $files) {
            if (! in_array($area, Areas::AREAS, true)) {
                throw new RuntimeException("Unknown area {$area}");
            }

            if (! $this->areas->writable($area)) {
                throw new RuntimeException(__('This site can’t write to :folder. Check the folder’s permissions.', ['folder' => Files::relativePath(base_path(), $this->areas->root($area))]));
            }

            $areas[$area] = ['remove' => array_values(array_filter(array_map('strval', (array) ($files['remove'] ?? [])), fn (string $p) => $this->areas->moves($area, $p)))];
        }

        $free = @disk_free_space(storage_path());
        $needed = (int) ($plan['bytes'] ?? 0) * 2 + 50_000_000;

        if (is_float($free) && $free < $needed) {
            $this->unlock($job);
            throw new RuntimeException(__('This site’s disk is too full: a sync this size needs about :need free, for the incoming copy and the backup, and there is :free.', ['need' => self::bytes($needed), 'free' => self::bytes((int) $free)]));
        }

        $this->save($job, ['job' => $job, 'from' => $plan['from'] ?? [], 'direction' => (string) ($plan['direction'] ?? 'push'), 'tables' => $tables, 'areas' => $areas, 'backup' => ['table' => 0, 'cursor' => null, 'seq' => 0, 'done' => false], 'started_at' => now()->toIso8601String()]);

        return ['ok' => true];
    }

    /** @param  list<string>  $columns  @param  list<list<mixed>>  $rows */
    public function import(string $job, string $table, int $seq, array $columns, array $rows): array
    {
        $state = $this->state($job);
        $this->touch($job);
        $t = $state['tables'][$table] ?? throw new RuntimeException(__('The table :table isn’t part of this sync.', ['table' => $table]));

        // A chunk sent again after a timeout is already here.
        if ($seq <= $t['seq']) {
            return ['ok' => true, 'again' => true];
        }

        if ($seq !== $t['seq'] + 1) {
            throw new RuntimeException(__('Rows arrived out of order. Start the sync again.'));
        }

        $this->db->connection()->transaction(fn () => $this->db->insert($t['staging'], $columns, $rows));
        $state['tables'][$table]['seq'] = $seq;
        $this->save($job, $state);

        return ['ok' => true];
    }

    /** Writes files, or pieces of a big one, into the staging folder. */
    public function write(string $job, string $pack): array
    {
        $state = $this->state($job);
        $this->touch($job);

        foreach (Pack::decode($pack) as [$h, $data]) {
            $area = (string) $h['area'];

            if (! isset($state['areas'][$area])) {
                throw new RuntimeException("Unknown area {$area}");
            }

            $this->areas->file($area, (string) $h['path']);
            $file = Files::within($this->dir($job).'/files/'.$area, (string) $h['path']);
            Files::ensureDir(dirname($file));
            $offset = (int) ($h['offset'] ?? 0);
            $handle = fopen($file, $offset === 0 ? 'wb' : 'c+b');

            if ($handle === false || fseek($handle, $offset) !== 0 || fwrite($handle, $data) !== strlen($data)) {
                throw new RuntimeException(__('This site couldn’t write :path. Is the disk full?', ['path' => $h['path']]));
            }

            fclose($handle);

            if ($offset + strlen($data) >= (int) $h['size']) {
                clearstatcache(true, $file);

                if (filesize($file) !== (int) $h['size'] || (isset($h['sha1']) && sha1_file($file) !== $h['sha1'])) {
                    @unlink($file);
                    throw new RuntimeException(__(':path arrived damaged. It’s sent again.', ['path' => $h['path']]));
                }

                @touch($file, (int) $h['mtime']);
            }
        }

        return ['ok' => true];
    }

    /** Copies what's about to be replaced, a piece at a time. Done when it says so. */
    public function backup(string $job, float $budget = 8.0): array
    {
        $state = $this->state($job);
        $this->touch($job);
        $b = $state['backup'];
        $tables = array_keys($state['tables']);
        $dir = Site::dir('backups/'.$job);
        $until = microtime(true) + $budget;

        while (! $b['done'] && microtime(true) < $until) {
            if ($b['table'] >= count($tables)) {
                $b['done'] = true;

                break;
            }

            $table = $tables[$b['table']];
            $chunk = $this->db->export($table, $b['cursor'], $state['tables'][$table]['scope']);
            Files::put($dir.'/tables/'.$table.'/'.$b['seq'].'.json.gz', (string) gzencode((string) json_encode(['columns' => $chunk['columns'], 'rows' => $chunk['rows']], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION), 6));
            $b['seq']++;

            if ($chunk['next'] === null) {
                [$b['table'], $b['cursor'], $b['seq']] = [$b['table'] + 1, null, 0];
            } else {
                $b['cursor'] = $chunk['next'];
            }
        }

        $state['backup'] = $b;
        $this->save($job, $state);

        return ['done' => $b['done'], 'table' => $tables[$b['table']] ?? null, 'tables' => count($tables), 'at' => $b['table']];
    }

    /** The switch: tables in one transaction, then the files. What it replaced is kept for undo. */
    public function finalize(string $job): array
    {
        $state = $this->state($job);
        $this->touch($job);

        if (! $state['backup']['done']) {
            throw new RuntimeException(__('The backup isn’t finished yet.'));
        }

        $meta = ['id' => $job, 'at' => now()->toIso8601String(), 'from' => $state['from'], 'direction' => $state['direction'], 'tables' => array_map(static fn (array $t) => $t['scope'], $state['tables']), 'files' => [], 'restored_at' => null];
        Site::writeJson(Site::dir('backups/'.$job.'/backup.json'), $meta);

        $sessions = isset($state['tables']['users']) ? new Sessions : null;
        $sessions?->before();
        $swaps = [];

        foreach ($state['tables'] as $table => $t) {
            $swaps[] = ['table' => $table, 'staging' => $t['staging'], 'scope' => $t['scope']];
        }

        $this->db->swap($swaps, $sessions ? $sessions->keepAccounts(...) : null);

        try {
            $this->placeFiles($job, $state['areas'], $meta['files']);
        } catch (Throwable $e) {
            // Half the files is worse than none: put back what was there, tables included.
            Site::writeJson(Site::dir('backups/'.$job.'/backup.json'), $meta);
            $this->restoreNow($job);

            throw new RuntimeException(__('The files couldn’t be put in place, so nothing changed: :error', ['error' => $e->getMessage()]), previous: $e);
        }

        Site::writeJson(Site::dir('backups/'.$job.'/backup.json'), $meta);
        $kept = $sessions?->after() ?? 0;

        foreach ($state['tables'] as $t) {
            $this->db->drop($t['staging']);
        }

        Files::deleteDirectory($this->dir($job));
        $this->unlock($job);
        $this->settle();
        $this->history(['id' => $job, 'at' => $meta['at'], 'from' => $state['from'], 'direction' => $state['direction'], 'tables' => array_keys($state['tables']), 'files' => array_sum(array_map(static fn (array $f) => count($f['added']) + count($f['replaced']) + count($f['removed']), $meta['files'])), 'undone_at' => null]);

        return ['ok' => true, 'backup' => $job, 'signed_in' => $kept];
    }

    public function cancel(string $job): array
    {
        self::validJob($job);
        $state = Site::readJson($this->dir($job).'/state.json');

        foreach ((array) ($state['tables'] ?? []) as $t) {
            $this->db->drop((string) $t['staging']);
        }

        Files::deleteDirectory($this->dir($job));

        // A backup that was never used for anything is only taking space.
        if (! is_file(Site::dir('backups/'.$job.'/backup.json'))) {
            Files::deleteDirectory(Site::dir('backups/'.$job));
        }

        $this->unlock($job);

        return ['ok' => true];
    }

    /** @return list<array<string, mixed>> Newest first, with whether each can still be undone. */
    public function history(?array $add = null): array
    {
        $file = Site::dir('history.json');
        $all = (array) (Site::readJson($file)['syncs'] ?? []);

        if ($add !== null) {
            array_unshift($all, $add);
            $all = array_slice($all, 0, 50);
            Site::writeJson($file, ['syncs' => $all]);
        }

        return array_map(static fn (array $s) => [...$s, 'can_undo' => empty($s['undone_at']) && is_file(Site::dir('backups/'.$s['id'].'/backup.json'))], $all);
    }

    /**
     * Puts back what a sync replaced, a piece at a time: the backup's rows into staging tables,
     * then the same switch. Changes made since that sync are replaced too.
     */
    public function undo(string $id, float $budget = 8.0): array
    {
        self::validJob($id);
        $dir = Site::dir('backups/'.$id);
        $meta = Site::readJson($dir.'/backup.json');

        if ($meta === [] || ! empty($meta['restored_at'])) {
            throw new RuntimeException(__('That sync can’t be undone any more.'));
        }

        $this->lock('undo-'.$id, 'undo');
        $u = (array) ($meta['undo'] ?? ['tables' => [], 'table' => 0, 'seq' => 0]);
        $tables = array_keys((array) $meta['tables']);
        $until = microtime(true) + $budget;

        while ($u['table'] < count($tables) && microtime(true) < $until) {
            $table = $tables[$u['table']];
            $staging = $u['tables'][$table] ??= Database::STAGING.'u'.substr(hash('xxh3', $id), 0, 7).'_'.$u['table'];

            if ($u['seq'] === 0) {
                $this->db->createStaging($table, $staging);
            }

            $file = $dir.'/tables/'.$table.'/'.$u['seq'].'.json.gz';

            if (is_file($file)) {
                $chunk = json_decode((string) gzdecode((string) file_get_contents($file)), true);
                $this->db->insert($staging, (array) $chunk['columns'], (array) $chunk['rows']);
                $u['seq']++;
            } else {
                [$u['table'], $u['seq']] = [$u['table'] + 1, 0];
            }
        }

        $meta['undo'] = $u;
        Site::writeJson($dir.'/backup.json', $meta);

        if ($u['table'] < count($tables)) {
            $this->touch('undo-'.$id);

            return ['done' => false, 'at' => $u['table'], 'tables' => count($tables)];
        }

        $this->restoreNow($id);
        $this->unlock('undo-'.$id);

        return ['done' => true];
    }

    /** The lock, for the admin: who holds it and since when. */
    public function busy(): ?array
    {
        $lock = Site::readJson(Site::dir('lock.json'));

        return isset($lock['job']) && time() - (int) ($lock['touched'] ?? 0) < self::STALE ? $lock : null;
    }

    /** From staged undo tables, or for a sync that just failed halfway, from its backup chunks. */
    private function restoreNow(string $id): void
    {
        $dir = Site::dir('backups/'.$id);
        $meta = Site::readJson($dir.'/backup.json');
        $staged = (array) ($meta['undo']['tables'] ?? []);
        $swaps = [];

        foreach ((array) $meta['tables'] as $table => $scope) {
            if (! isset($staged[$table])) {
                $staged[$table] = Database::STAGING.'r'.substr(hash('xxh3', $id), 0, 7).'_'.count($swaps);
                $this->db->createStaging($table, $staged[$table]);

                for ($seq = 0; is_file($file = $dir.'/tables/'.$table.'/'.$seq.'.json.gz'); $seq++) {
                    $chunk = json_decode((string) gzdecode((string) file_get_contents($file)), true);
                    $this->db->insert($staged[$table], (array) $chunk['columns'], (array) $chunk['rows']);
                }
            }

            $swaps[] = ['table' => $table, 'staging' => $staged[$table], 'scope' => $scope];
        }

        $sessions = isset($meta['tables']['users']) ? new Sessions : null;
        $sessions?->before();
        $this->db->swap($swaps, $sessions ? $sessions->keepAccounts(...) : null);
        $sessions?->after();

        foreach ($swaps as $swap) {
            $this->db->drop($swap['staging']);
        }

        foreach ((array) $meta['files'] as $area => $files) {
            $root = $this->areas->root($area);

            foreach ((array) $files['added'] as $path) {
                @unlink(Files::within($root, $path));
            }

            foreach ([...(array) $files['replaced'], ...(array) $files['removed']] as $path) {
                $from = Files::within($dir.'/files/'.$area, $path);

                if (is_file($from)) {
                    Files::ensureDir(dirname($to = Files::within($root, $path)));
                    self::move($from, $to);
                }
            }
        }

        $meta['restored_at'] = now()->toIso8601String();
        Site::writeJson($dir.'/backup.json', $meta);

        $history = (array) (Site::readJson(Site::dir('history.json'))['syncs'] ?? []);

        foreach ($history as $i => $s) {
            if (($s['id'] ?? null) === $id) {
                $history[$i]['undone_at'] = $meta['restored_at'];
            }
        }

        Site::writeJson(Site::dir('history.json'), ['syncs' => $history]);
        $this->settle();
    }

    /**
     * @param  array<string, array{remove: list<string>}>  $areas
     * @param  array<string, array{added: list<string>, replaced: list<string>, removed: list<string>}>  $done  What moved so far, for undo
     */
    private function placeFiles(string $job, array $areas, array &$done): void
    {
        $backup = Site::dir('backups/'.$job.'/files');

        foreach ($areas as $area => $plan) {
            $staged = $this->dir($job).'/files/'.$area;
            $done[$area] = ['added' => [], 'replaced' => [], 'removed' => []];

            foreach (is_dir($staged) ? $this->staged($staged) : [] as $path) {
                $live = $this->areas->file($area, $path);

                if (is_file($live)) {
                    Files::ensureDir(dirname($keep = Files::within($backup.'/'.$area, $path)));
                    self::move($live, $keep);
                    $done[$area]['replaced'][] = $path;
                } else {
                    $done[$area]['added'][] = $path;
                }

                Files::ensureDir(dirname($live));
                self::move($staged.'/'.$path, $live);
            }

            foreach ($plan['remove'] as $path) {
                $live = $this->areas->file($area, $path);

                if (is_file($live)) {
                    Files::ensureDir(dirname($keep = Files::within($backup.'/'.$area, $path)));
                    self::move($live, $keep);
                    $done[$area]['removed'][] = $path;
                }
            }
        }
    }

    /** @return list<string> */
    private function staged(string $dir): array
    {
        $out = [];
        $items = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS));

        foreach ($items as $file) {
            $file->isFile() && $out[] = substr(str_replace('\\', '/', $file->getPathname()), strlen($dir) + 1);
        }

        return $out;
    }

    /** Whatever read the old content should read the new: caches, the media index, built pages. */
    private function settle(): void
    {
        rescue(static fn () => Cache::flush(), report: false);
        Files::deleteDirectory(storage_path('cache/entries'));
        rescue(static fn () => cms()->hooks()->dispatch('cms.sync'), report: true);

        $builder = app(\Cms\Contracts\SiteBuilder::class);

        if ($builder->available()) {
            rescue(static fn () => $builder->queue(null, __('Synced')), report: true);
        }
    }

    private function lock(string $job, string $kind): void
    {
        $held = $this->busy();

        if ($held && $held['job'] !== $job) {
            throw new RuntimeException(__('This site is busy with another sync, started :ago. Try again when it’s done, or in ten minutes if it stopped.', ['ago' => \Illuminate\Support\Carbon::createFromTimestamp((int) $held['since'])->diffForHumans()]));
        }

        Site::writeJson(Site::dir('lock.json'), ['job' => $job, 'kind' => $kind, 'since' => $held['since'] ?? time(), 'touched' => time()]);
    }

    private function touch(string $job): void
    {
        $this->lock($job, 'sync');
    }

    private function unlock(string $job): void
    {
        if ((Site::readJson(Site::dir('lock.json'))['job'] ?? null) === $job) {
            @unlink(Site::dir('lock.json'));
        }
    }

    /** Only the newest backups stay. */
    private function prune(): void
    {
        $dirs = glob(Site::dir('backups/*'), GLOB_ONLYDIR) ?: [];
        rsort($dirs);

        foreach (array_slice($dirs, self::KEEP_BACKUPS) as $dir) {
            Files::deleteDirectory($dir);
        }

        // Staging folders of syncs nobody finished.
        foreach (glob(Site::dir('incoming/*'), GLOB_ONLYDIR) ?: [] as $dir) {
            if (time() - (int) @filemtime($dir.'/state.json') > self::STALE) {
                Files::deleteDirectory($dir);
            }
        }
    }

    private function dir(string $job): string
    {
        return Site::dir('incoming/'.$job);
    }

    private function state(string $job): array
    {
        self::validJob($job);
        $state = Site::readJson($this->dir($job).'/state.json');

        return $state !== [] ? $state : throw new RuntimeException(__('This sync isn’t going on here any more. Start it again.'));
    }

    private function save(string $job, array $state): void
    {
        Site::writeJson($this->dir($job).'/state.json', $state);
    }

    private static function validJob(string $job): void
    {
        if (preg_match('/^[0-9a-z]{26}$/', $job) !== 1) {
            throw new RuntimeException('Invalid sync id.');
        }
    }

    /** @return array{column: string, in: list<string>}|null */
    private static function scope(mixed $scope): ?array
    {
        if (! is_array($scope) || ! in_array($scope['column'] ?? null, ['collection'], true)) {
            return null;
        }

        return ['column' => 'collection', 'in' => array_values(array_map('strval', (array) ($scope['in'] ?? [])))];
    }

    private static function move(string $from, string $to): void
    {
        if (! @rename($from, $to)) {
            if (! @copy($from, $to)) {
                throw new RuntimeException(__('Couldn’t move :file. Check the folder’s permissions.', ['file' => basename($to)]));
            }

            @touch($to, (int) filemtime($from));
            @unlink($from);
        }
    }

    public static function bytes(int $bytes): string
    {
        foreach (['GB' => 1 << 30, 'MB' => 1 << 20, 'KB' => 1 << 10] as $unit => $size) {
            if ($bytes >= $size) {
                return round($bytes / $size, 1).' '.$unit;
            }
        }

        return $bytes.' B';
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use Cms\Cms;
use Cms\Packages\PackageManifest;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

/** What this site says about itself, and what it hands over when it is the one being copied. */
final class LocalSite
{
    public const int PROTOCOL = 1;

    /** Pieces of a big file per request, kept well under a host's upload limit. */
    public const int CHUNK = 2_000_000;

    public function __construct(
        private readonly Site $site,
        private readonly Database $db,
        private readonly Areas $areas,
        private readonly Catalog $catalog,
        private readonly Receiver $receiver,
    ) {}

    public function hello(): array
    {
        $settings = $this->site->settings();
        $packages = ['letterncms/cms' => Cms::VERSION];

        foreach (cms()->packages()->active() as $package) {
            /** @var PackageManifest $package */
            $packages[$package->name] = $package->version;
        }

        $busy = $this->receiver->busy();

        return [
            'protocol' => self::PROTOCOL,
            'site_id' => $settings['id'],
            'name' => $this->site->name(),
            'url' => $this->site->url(),
            'root' => $this->site->root(),
            'cms' => Cms::VERSION,
            'php' => PHP_VERSION,
            'driver' => $this->db->driver(),
            'fingerprint' => $this->db->fingerprint(),
            'packages' => $packages,
            'allow' => ['pull' => $settings['allow_pull'], 'push' => $settings['allow_push']],
            'busy' => $busy ? ['since' => $busy['since'], 'kind' => $busy['kind']] : null,
            'writable' => array_combine(Areas::AREAS, array_map($this->areas->writable(...), Areas::AREAS)),
            'chunk' => min(self::CHUNK, max(256_000, intdiv(self::iniBytes('post_max_size'), 2) ?: self::CHUNK)),
        ];
    }

    /** Every table with its rows and columns, entries per collection, and the files in each folder Sync moves. */
    public function inventory(): array
    {
        $tables = [];
        $catalog = $this->catalog->classify($this->db->tables());

        foreach ($catalog['groups'] as $group) {
            foreach ($group['tables'] as $table) {
                $tables[$table] = ['rows' => $this->db->count($table), 'size' => $this->db->size($table), 'columns' => $this->db->columnDetails($table), 'primary' => $this->db->primary($table)];
            }
        }

        $collections = [];

        try {
            foreach (DB::table('entries')->selectRaw('collection, count(*) as n')->groupBy('collection')->get() as $row) {
                $collections[(string) $row->collection] = (int) $row->n;
            }
        } catch (Throwable) {
        }

        $areas = [];

        foreach (Areas::AREAS as $area) {
            $areas[$area] = $this->areas->manifest($area);
        }

        return ['groups' => $catalog['groups'], 'keep' => $catalog['keep'], 'tables' => $tables, 'collections' => $collections, 'areas' => $areas];
    }

    public function export(string $table, mixed $cursor, ?array $scope): array
    {
        $catalog = $this->catalog->classify($this->db->tables());

        if (in_array($table, $catalog['keep'], true) || ! in_array($table, $this->db->tables(), true)) {
            throw new RuntimeException(__('The table :table doesn’t leave this site.', ['table' => $table]));
        }

        $scope = is_array($scope) && ($scope['column'] ?? null) === 'collection' ? ['column' => 'collection', 'in' => array_map('strval', (array) ($scope['in'] ?? []))] : null;

        return $this->db->export($table, $cursor, $scope);
    }

    /** @param  list<array{area: string, path: string, offset: int, length: int}>  $files */
    public function read(array $files): string
    {
        $pieces = [];

        foreach ($files as $f) {
            $area = (string) $f['area'];
            $path = (string) $f['path'];
            $file = $this->areas->file($area, $path);

            if (! is_file($file)) {
                throw new RuntimeException(__(':path is gone from this site. Start the sync again to compare afresh.', ['path' => $path]));
            }

            $size = (int) filesize($file);
            $offset = max(0, (int) ($f['offset'] ?? 0));
            $length = max(0, min((int) ($f['length'] ?? $size), $size - $offset));
            $data = $length > 0 ? (string) file_get_contents($file, false, null, $offset, $length) : '';
            $pieces[] = [['area' => $area, 'path' => $path, 'offset' => $offset, 'size' => $size, 'mtime' => (int) filemtime($file)], $data];
        }

        return Pack::encode($pieces);
    }

    private static function iniBytes(string $key): int
    {
        $value = trim((string) ini_get($key));

        if ($value === '' || $value === '0' || $value === '-1') {
            return 0;
        }

        $number = (int) $value;

        return match (strtolower(substr($value, -1))) {
            'g' => $number << 30,
            'm' => $number << 20,
            'k' => $number << 10,
            default => $number,
        };
    }
}

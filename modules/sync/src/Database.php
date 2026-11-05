<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use Illuminate\Database\Connection;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use RuntimeException;
use Throwable;

/**
 * The database, by table name without its prefix, the same on both sides whatever each one's
 * DB_PREFIX and driver. Rows travel as lists of plain values; bytes that aren't text travel as
 * base64. Incoming rows go to staging tables first, and only replace the real ones in one
 * transaction at the end, so a sync that stops halfway changes nothing.
 */
final class Database
{
    public const string STAGING = 'cmssync_';

    private ?array $columns = null;

    public function connection(): Connection
    {
        return DB::connection();
    }

    public function driver(): string
    {
        return $this->connection()->getDriverName();
    }

    /** @return list<string> */
    public function tables(): array
    {
        $prefix = $this->connection()->getTablePrefix();
        $tables = [];

        foreach (Schema::getTables() as $table) {
            $name = (string) $table['name'];

            if ($prefix !== '' && ! str_starts_with($name, $prefix)) {
                continue;
            }

            $name = substr($name, strlen($prefix));

            if ($name !== '' && ! str_starts_with($name, self::STAGING) && ! str_starts_with($name, 'sqlite_')) {
                $tables[] = $name;
            }
        }

        sort($tables);

        return $tables;
    }

    /** @return list<string> The columns that hold data: generated ones are worked out again on arrival. */
    public function columns(string $table): array
    {
        $this->columns ??= [];

        return $this->columns[$table] ??= array_values(array_map(static fn (array $c) => (string) $c['name'], array_filter(Schema::getColumns($table), static fn (array $c) => empty($c['generation']))));
    }

    /** @return array<string, array{nullable: bool, default: bool}> */
    public function columnDetails(string $table): array
    {
        $out = [];

        foreach (Schema::getColumns($table) as $c) {
            if (empty($c['generation'])) {
                $out[(string) $c['name']] = ['nullable' => (bool) $c['nullable'], 'default' => $c['default'] !== null || ! empty($c['auto_increment'])];
            }
        }

        return $out;
    }

    /** @return list<string> */
    public function primary(string $table): array
    {
        foreach (Schema::getIndexes($table) as $index) {
            if (! empty($index['primary'])) {
                return array_values(array_map('strval', $index['columns']));
            }
        }

        return [];
    }

    /** @param  array{column: string, in: list<string>}|null  $scope */
    public function count(string $table, ?array $scope = null): int
    {
        return $this->scoped($this->connection()->table($table), $scope)->count();
    }

    /** About how many bytes the table's data takes, where the driver says. */
    public function size(string $table): ?int
    {
        try {
            $prefix = $this->connection()->getTablePrefix();

            foreach (Schema::getTables() as $t) {
                if ($t['name'] === $prefix.$table) {
                    return isset($t['size']) ? (int) $t['size'] : null;
                }
            }
        } catch (Throwable) {
        }

        return null;
    }

    /**
     * One chunk of a table, in primary key order, so the next chunk starts where this one ended
     * even if rows change in between. Tables without a single-column key go by offset.
     *
     * @param  array{column: string, in: list<string>}|null  $scope
     * @return array{columns: list<string>, rows: list<list<mixed>>, next: mixed, bytes: int}
     */
    public function export(string $table, mixed $cursor, ?array $scope, int $maxBytes = 1_500_000, int $maxRows = 5_000): array
    {
        $columns = $this->columns($table);
        $primary = $this->primary($table);
        $key = count($primary) === 1 ? $primary[0] : null;
        $order = $primary !== [] ? $primary : $columns;
        $rows = [];
        $bytes = 0;
        $offset = $key === null ? (int) ($cursor ?? 0) : 0;
        $after = $key !== null ? $cursor : null;
        $page = max(1, min(500, $maxRows));
        $done = false;

        while (! $done && $bytes < $maxBytes && count($rows) < $maxRows) {
            $query = $this->scoped($this->connection()->table($table)->select($columns), $scope);

            if ($key !== null) {
                $after !== null && $query->where($key, '>', $after);
                $query->orderBy($key);
            } else {
                foreach ($order as $column) {
                    $query->orderBy($column);
                }

                $query->offset($offset);
            }

            $batch = $query->limit($page)->get();

            $taken = 0;

            foreach ($batch as $record) {
                $row = [];

                foreach ($columns as $column) {
                    $row[] = self::encode($record->{$column} ?? null);
                }

                $bytes += strlen((string) json_encode($row, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
                $rows[] = $row;
                $taken++;
                $key !== null ? $after = $record->{$key} : $offset++;

                // A chunk ends at its size, mid-page too: the next one starts after this row.
                if ($bytes >= $maxBytes || count($rows) >= $maxRows) {
                    break;
                }
            }

            $done = $taken === count($batch) && count($batch) < $page;
        }

        return ['columns' => $columns, 'rows' => $rows, 'next' => $done ? null : ($key !== null ? $after : $offset), 'bytes' => $bytes];
    }

    /** An empty table shaped exactly like `$table`, with its keys, for incoming rows. */
    public function createStaging(string $table, string $staging): void
    {
        $this->drop($staging);
        $connection = $this->connection();
        $live = $connection->getQueryGrammar()->wrapTable($table);
        $copy = $connection->getQueryGrammar()->wrapTable($staging);

        match ($this->driver()) {
            'mysql', 'mariadb' => $connection->statement("CREATE TABLE {$copy} LIKE {$live}"),
            'pgsql' => $connection->statement("CREATE TABLE {$copy} (LIKE {$live} INCLUDING ALL)"),
            'sqlite' => $connection->statement($this->sqliteCreate($table, $copy)),
            default => throw new RuntimeException(__('Sync works with MySQL, MariaDB, PostgreSQL and SQLite.')),
        };
    }

    /**
     * @param  list<string>  $columns
     * @param  list<list<mixed>>  $rows
     */
    public function insert(string $table, array $columns, array $rows): void
    {
        $keep = array_flip($this->columns($table));
        $batch = max(1, intdiv(20_000, max(1, count($columns))));
        $records = [];

        foreach ($rows as $row) {
            $record = [];

            foreach ($columns as $i => $column) {
                if (isset($keep[$column])) {
                    $record[$column] = self::decode($row[$i] ?? null);
                }
            }

            $records[] = $record;
        }

        foreach (array_chunk($records, $batch) as $chunk) {
            $this->connection()->table($table)->insert($chunk);
        }
    }

    /**
     * Puts staged rows in place of the live ones, every table in one transaction. A scope replaces
     * only the rows it covers, such as one collection's entries.
     *
     * @param  list<array{table: string, staging: string, scope: array{column: string, in: list<string>}|null}>  $swaps
     * @param  (callable(): void)|null  $also  More work inside the same transaction
     */
    public function swap(array $swaps, ?callable $also = null): void
    {
        $connection = $this->connection();
        Schema::disableForeignKeyConstraints();

        try {
            $connection->transaction(function () use ($swaps, $also, $connection): void {
                foreach ($swaps as $swap) {
                    $columns = array_values(array_intersect($this->columns($swap['table']), $this->columns($swap['staging'])));
                    $this->scoped($connection->table($swap['table']), $swap['scope'])->delete();
                    $connection->table($swap['table'])->insertUsing($columns, $connection->table($swap['staging'])->select($columns));
                }

                $also && $also();
            });
        } finally {
            Schema::enableForeignKeyConstraints();
        }
    }

    public function drop(string $staging): void
    {
        if (str_starts_with($staging, self::STAGING)) {
            Schema::dropIfExists($staging);
        }
    }

    /** Staging tables nobody is working on any more: a sync that was abandoned. */
    public function dropStaging(?string $except = null): void
    {
        $prefix = $this->connection()->getTablePrefix();

        foreach (Schema::getTables() as $t) {
            $name = substr((string) $t['name'], strlen($prefix));

            if (str_starts_with($name, self::STAGING) && ($except === null || ! str_starts_with($name, $except))) {
                $this->drop($name);
            }
        }
    }

    /** The same database seen from two sites gives the same answer: syncing it into itself would wipe it. */
    public function fingerprint(): string
    {
        $c = $this->connection();
        $config = $c->getConfig();

        try {
            $server = match ($this->driver()) {
                'mysql', 'mariadb' => (string) ($c->selectOne('select @@server_uuid as id')?->id ?? $c->selectOne('select @@hostname as id')?->id ?? ''),
                'pgsql' => (string) ($c->selectOne('select system_identifier::text as id from pg_control_system()')?->id ?? ''),
                default => gethostname().':'.(realpath((string) ($config['database'] ?? '')) ?: (string) ($config['database'] ?? '')),
            };
        } catch (Throwable) {
            $server = ($config['host'] ?? '').':'.($config['port'] ?? '');
        }

        return hash('sha256', $this->driver().'|'.$server.'|'.($config['database'] ?? '').'|'.$c->getTablePrefix());
    }

    /** @param  array{column: string, in: list<string>}|null  $scope */
    private function scoped(Builder $query, ?array $scope): Builder
    {
        return $scope ? $query->whereIn($scope['column'], $scope['in'] === [] ? [''] : $scope['in']) : $query;
    }

    private function sqliteCreate(string $table, string $copy): string
    {
        $prefix = $this->connection()->getTablePrefix();
        $sql = (string) ($this->connection()->selectOne("select sql from sqlite_master where type = 'table' and name = ?", [$prefix.$table])?->sql ?? '');
        $out = preg_replace('/^CREATE\s+TABLE\s+(?:"[^"]+"|`[^`]+`|\[[^\]]+\]|[^\s(]+)/i', 'CREATE TABLE '.$copy, $sql, 1);

        if ($sql === '' || $out === null || $out === $sql) {
            throw new RuntimeException(__('The table :table couldn’t be copied.', ['table' => $table]));
        }

        return $out;
    }

    public static function encode(mixed $value): mixed
    {
        if (is_string($value) && ! mb_check_encoding($value, 'UTF-8')) {
            return ['b64' => base64_encode($value)];
        }

        return is_resource($value) ? ['b64' => base64_encode((string) stream_get_contents($value))] : $value;
    }

    public static function decode(mixed $value): mixed
    {
        return is_array($value) && isset($value['b64']) ? base64_decode((string) $value['b64'], true) : $value;
    }
}

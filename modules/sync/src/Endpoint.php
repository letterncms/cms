<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

/**
 * One end of a sync: this site, in the same process, or the other one, over HTTP. The same
 * calls either way, so a pull and a push are one piece of code going in two directions.
 */
interface Endpoint
{
    public function label(): string;

    public function hello(): array;

    public function inventory(): array;

    public function export(string $table, mixed $cursor, ?array $scope): array;

    /** @param  list<array{area: string, path: string, offset: int, length: int}>  $files  A pack, see Pack */
    public function read(array $files): string;

    public function begin(string $job, array $plan): array;

    public function import(string $job, string $table, int $seq, array $columns, array $rows): array;

    public function write(string $job, string $pack): array;

    public function backup(string $job): array;

    public function finalize(string $job): array;

    public function cancel(string $job): array;

    public function history(): array;

    public function undo(string $id): array;
}

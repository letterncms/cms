<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

/** This site, called directly. */
final class LocalEndpoint implements Endpoint
{
    public function __construct(private readonly LocalSite $site, private readonly Receiver $receiver, private readonly string $label) {}

    public function label(): string
    {
        return $this->label;
    }

    public function hello(): array
    {
        return $this->site->hello();
    }

    public function inventory(): array
    {
        return $this->site->inventory();
    }

    public function export(string $table, mixed $cursor, ?array $scope): array
    {
        return $this->site->export($table, $cursor, $scope);
    }

    public function read(array $files): string
    {
        return $this->site->read($files);
    }

    public function begin(string $job, array $plan): array
    {
        return $this->receiver->begin($job, $plan);
    }

    public function import(string $job, string $table, int $seq, array $columns, array $rows): array
    {
        return $this->receiver->import($job, $table, $seq, $columns, $rows);
    }

    public function write(string $job, string $pack): array
    {
        return $this->receiver->write($job, $pack);
    }

    public function backup(string $job): array
    {
        return $this->receiver->backup($job);
    }

    public function finalize(string $job): array
    {
        return $this->receiver->finalize($job);
    }

    public function cancel(string $job): array
    {
        return $this->receiver->cancel($job);
    }

    public function history(): array
    {
        return $this->receiver->history();
    }

    public function undo(string $id): array
    {
        return $this->receiver->undo($id);
    }
}

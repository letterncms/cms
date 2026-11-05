<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

/**
 * The other site, over HTTPS. Each request is signed with the key's secret over its time, a
 * nonce and its body, so nobody without the key can read or change anything, and a captured
 * request can't be sent again. Bodies travel gzipped both ways.
 */
final class RemoteEndpoint implements Endpoint
{
    public function __construct(private readonly string $url, private readonly string $secret, private readonly string $label) {}

    public function label(): string
    {
        return $this->label;
    }

    public function url(): string
    {
        return $this->url;
    }

    public function hello(): array
    {
        return $this->json('hello');
    }

    public function inventory(): array
    {
        return $this->json('inventory');
    }

    public function export(string $table, mixed $cursor, ?array $scope): array
    {
        return $this->json('export', ['table' => $table, 'cursor' => $cursor, 'scope' => $scope]);
    }

    public function read(array $files): string
    {
        return $this->send('read', (string) json_encode(['files' => $files]));
    }

    public function begin(string $job, array $plan): array
    {
        return $this->json('begin', ['job' => $job, 'plan' => $plan]);
    }

    public function import(string $job, string $table, int $seq, array $columns, array $rows): array
    {
        return $this->json('import', ['job' => $job, 'table' => $table, 'seq' => $seq, 'columns' => $columns, 'rows' => $rows]);
    }

    public function write(string $job, string $pack): array
    {
        return self::decode($this->send('write', $pack, ['X-Sync-Job' => $job]));
    }

    public function backup(string $job): array
    {
        return $this->json('backup', ['job' => $job]);
    }

    public function finalize(string $job): array
    {
        return $this->json('finalize', ['job' => $job]);
    }

    public function cancel(string $job): array
    {
        return $this->json('cancel', ['job' => $job]);
    }

    public function history(): array
    {
        return $this->json('history');
    }

    public function undo(string $id): array
    {
        return $this->json('undo', ['id' => $id]);
    }

    public static function sign(string $secret, string $op, string $time, string $nonce, string $body): string
    {
        return hash_hmac('sha256', implode("\n", ['cms-sync-1', $op, $time, $nonce, hash('sha256', $body)]), $secret);
    }

    private function json(string $op, array $input = []): array
    {
        return self::decode($this->send($op, (string) json_encode($input, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION)));
    }

    /** @param  array<string, string>  $headers */
    private function send(string $op, string $body, array $headers = []): string
    {
        $body = (string) gzencode($body, 5);
        $time = (string) time();
        $nonce = Str::random(24);
        $host = (string) parse_url($this->url, PHP_URL_HOST);

        try {
            $response = Http::withHeaders([...$headers, 'X-Sync-Time' => $time, 'X-Sync-Nonce' => $nonce, 'X-Sync-Signature' => self::sign($this->secret, $op, $time, $nonce, $body), 'Accept' => 'application/octet-stream'])
                ->withBody($body, 'application/octet-stream')
                ->connectTimeout(10)
                ->timeout(120)
                ->post($this->url.'/api/sync/v1/'.$op);
        } catch (ConnectionException $e) {
            throw new RemoteUnavailable(__('Couldn’t reach :site (:reason). Is the address right, and can this server reach it?', ['site' => $host, 'reason' => self::reason($e)]), previous: $e);
        }

        $status = $response->status();
        $raw = $response->body();
        $decoded = $response->header('X-Sync-Encoding') === 'gzip' ? @gzdecode($raw) : $raw;
        $error = is_string($decoded) ? (json_decode($decoded, true)['error'] ?? null) : null;

        if ($status === 200 && is_string($decoded) && $response->header('X-Sync-Protocol') !== '') {
            return $decoded;
        }

        if ($status === 401) {
            throw new RemoteRefused(__('The key for :site doesn’t match any more: someone made a new one there. Copy it from Sync on :site and connect again.', ['site' => $host]));
        }

        if (is_string($error) && $error !== '' && $status < 500 && $status !== 429) {
            throw new RemoteRefused($error);
        }

        throw match (true) {
            $status === 404 => new RemoteRefused(__(':site doesn’t answer as a site with Sync. Check the address, and that Sync is on there.', ['site' => $host])),
            $status === 413 => new RemoteRefused(__(':site turned down a request for being too big. Raise post_max_size there, or ask its host to.', ['site' => $host])),
            default => new RemoteUnavailable(is_string($error) && $error !== '' ? $error : __(':site answered with an error (:status). It’s tried again.', ['site' => $host, 'status' => $status])),
        };
    }

    private static function decode(string $body): array
    {
        $data = json_decode($body, true);

        return is_array($data) ? $data : throw new RemoteUnavailable(__('The other site’s answer was cut off. It’s tried again.'));
    }

    private static function reason(Throwable $e): string
    {
        $message = $e->getMessage();

        return match (true) {
            str_contains($message, 'timed out') => __('it took too long to answer'),
            str_contains($message, 'resolve') => __('the name doesn’t resolve'),
            str_contains($message, 'refused') => __('the connection was refused'),
            str_contains($message, 'SSL') || str_contains($message, 'certificate') => __('its HTTPS certificate isn’t valid'),
            default => trim(Str::limit($message, 120)),
        };
    }
}

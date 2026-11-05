<?php

declare(strict_types=1);

namespace Cms\Modules\Sync\Http;

use Cms\Modules\Sync\LocalSite;
use Cms\Modules\Sync\Receiver;
use Cms\Modules\Sync\RemoteEndpoint;
use Cms\Modules\Sync\Site;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use RuntimeException;
use Throwable;

/**
 * What another site with this site's key may ask. Every request is signed; a request that isn't,
 * or is older than five minutes, or was seen before, gets nothing. Reading needs pulls allowed,
 * changing anything needs pushes allowed.
 */
final class ApiController
{
    private const array READS = ['export', 'read'];

    private const array WRITES = ['begin', 'import', 'write', 'backup', 'finalize', 'cancel', 'undo'];

    public function __invoke(Request $request, string $op, Site $site, LocalSite $local, Receiver $receiver): Response
    {
        @set_time_limit(0);
        ignore_user_abort(true);

        $body = (string) $request->getContent();
        $time = (string) $request->header('X-Sync-Time', '');
        $nonce = (string) $request->header('X-Sync-Nonce', '');
        $signature = (string) $request->header('X-Sync-Signature', '');
        $settings = $site->settings();

        if (! hash_equals(RemoteEndpoint::sign($settings['secret'], $op, $time, $nonce, $body), $signature) || abs(time() - (int) $time) > 300 || strlen($nonce) < 16) {
            return self::error(__('This request isn’t signed with this site’s current key.'), 401);
        }

        if (! Cache::add('cms-sync-nonce:'.hash('sha256', $nonce), 1, 600)) {
            return self::error(__('This request was already answered.'), 401);
        }

        if (in_array($op, self::READS, true) && ! $settings['allow_pull']) {
            return self::error(__(':site doesn’t allow pulls. Turn them on under Sync there.', ['site' => $site->name()]), 403);
        }

        if (in_array($op, self::WRITES, true) && ! $settings['allow_push']) {
            return self::error(__(':site doesn’t allow pushes. Turn them on under Sync there.', ['site' => $site->name()]), 403);
        }

        $raw = @gzdecode($body);

        if (! is_string($raw)) {
            return self::error(__('The request arrived damaged. It’s sent again.'), 400);
        }

        $in = $op === 'write' ? [] : (array) json_decode($raw, true);

        try {
            $out = match ($op) {
                'hello' => $local->hello(),
                'inventory' => $local->inventory(),
                'export' => $local->export((string) ($in['table'] ?? ''), $in['cursor'] ?? null, isset($in['scope']) ? (array) $in['scope'] : null),
                'read' => $local->read(array_values((array) ($in['files'] ?? []))),
                'begin' => $receiver->begin((string) ($in['job'] ?? ''), (array) ($in['plan'] ?? [])),
                'import' => $receiver->import((string) ($in['job'] ?? ''), (string) ($in['table'] ?? ''), (int) ($in['seq'] ?? -1), array_map('strval', (array) ($in['columns'] ?? [])), array_values((array) ($in['rows'] ?? []))),
                'write' => $receiver->write((string) $request->header('X-Sync-Job', ''), $raw),
                'backup' => $receiver->backup((string) ($in['job'] ?? '')),
                'finalize' => $receiver->finalize((string) ($in['job'] ?? '')),
                'cancel' => $receiver->cancel((string) ($in['job'] ?? '')),
                'history' => $receiver->history(),
                'undo' => $receiver->undo((string) ($in['id'] ?? '')),
                default => null,
            };
        } catch (RuntimeException $e) {
            return self::error($e->getMessage(), 409);
        } catch (Throwable $e) {
            report($e);

            return self::error(__(':site ran into an error: :message', ['site' => $site->name(), 'message' => $e->getMessage()]), 500);
        }

        if ($out === null) {
            return self::error('Unknown request.', 404);
        }

        return self::reply(is_string($out) ? $out : (string) json_encode($out, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION));
    }

    private static function reply(string $body): Response
    {
        return new Response((string) gzencode($body, 5), 200, ['Content-Type' => 'application/octet-stream', 'X-Sync-Encoding' => 'gzip', 'X-Sync-Protocol' => (string) LocalSite::PROTOCOL, 'Cache-Control' => 'no-store']);
    }

    private static function error(string $message, int $status): Response
    {
        return new Response((string) json_encode(['error' => $message]), $status, ['Content-Type' => 'application/json', 'X-Sync-Protocol' => (string) LocalSite::PROTOCOL, 'Cache-Control' => 'no-store']);
    }
}

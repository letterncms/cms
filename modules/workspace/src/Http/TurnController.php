<?php

declare(strict_types=1);

namespace Cms\Modules\Workspace\Http;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Cms\Abilities\AbilityException;
use Cms\Modules\Workspace\Thread;
use Cms\Modules\Workspace\Workspace;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

/**
 * POST /api/admin/workspace/turn — one turn of a thread, streamed to the browser as
 * server-sent events. Send exactly one of: `command` ({ability, input, label}) to run an
 * ability, `search` to look something up, `message` to say something (to the agent when there
 * is one for this person, otherwise it is a search), `approve` (the ids of the calls allowed) to
 * decide on what the agent asked to do, or `action` (identifiers of an interface it answered
 * with) to use it. `edit` ({turn, original}) with a message or search rewrites an earlier turn.
 * `context` is what a message carries, `agent` what the agent's own controls chose.
 *
 * Events: `thread` {id, title, updatedAt}, `turn` {turn} for each turn as stored, then the
 * answer's events (see Cms\Contracts\Agent), and `done` or `error`.
 */
final class TurnController
{
    public function __invoke(Request $request, Workspace $workspace): StreamedResponse|JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'thread' => ['nullable', 'string', 'size:26'],
            'command' => ['nullable', 'array:ability,input,label,detail'],
            'command.ability' => ['required_with:command', 'string', 'max:160'],
            'command.input' => ['nullable', 'array'],
            'command.label' => ['nullable', 'string', 'max:200'],
            'command.detail' => ['nullable', 'string', 'max:400'],
            'search' => ['nullable', 'string', 'max:200'],
            'message' => ['nullable', 'string', 'max:20000'],
            'edit' => ['sometimes', 'array:turn,original'],
            'edit.turn' => ['required_with:edit', 'string', 'max:40'],
            'edit.original' => ['required_with:edit', 'string', 'max:20000'],
            'approve' => ['nullable', 'array', 'max:50'],
            'approve.*' => ['string', 'max:100'],
            'action' => ['nullable', 'array:tool,node,name'],
            'action.tool' => ['required_with:action', 'string', 'max:100'],
            'action.node' => ['required_with:action', 'string', 'max:80'],
            'action.name' => ['required_with:action', 'string', 'max:80'],
            'agent' => ['nullable', 'array', 'max:8'],
            'context' => ['nullable', 'array'],
            'context.path' => ['nullable', 'string', 'max:300'],
            'context.items' => ['nullable', 'array', 'max:24'],
            'context.items.*' => ['array:kind,label,icon,to,content,unchanged'],
            'context.items.*.label' => ['required', 'string', 'max:300'],
            'context.items.*.kind' => ['nullable', 'string', 'max:40'],
            'context.items.*.icon' => ['nullable', 'string', 'max:60'],
            'context.items.*.to' => ['nullable', 'string', 'max:300'],
            'context.items.*.content' => ['nullable', 'string', 'max:40000'],
            'context.items.*.unchanged' => ['nullable', 'boolean'],
            'context.skill' => ['nullable', 'string', 'max:64'],
        ]);

        $command = isset($data['command']['ability']);
        $search = trim((string) ($data['search'] ?? '')) !== '';
        $message = trim((string) ($data['message'] ?? '')) !== '';
        $deciding = array_key_exists('approve', $data) && $data['approve'] !== null;
        $acting = ! empty($data['action']);
        $agent = $workspace->answers($user);

        if ((int) $command + (int) $search + (int) $message + (int) $deciding + (int) $acting !== 1
            || (($deciding || $acting || isset($data['edit'])) && empty($data['thread']))
            || (isset($data['edit']) && ! $message && ! $search)
            || (($deciding || $acting) && ! $agent)) {
            return self::error(__('Send one command, search, message, approval or interface action.'), 'invalid_input', 422);
        }

        $thread = empty($data['thread'])
            ? new Thread(['user_id' => $user->id, 'turns' => [], 'title' => ''])
            : Thread::query()->where('user_id', $user->id)->findOrFail($data['thread']);

        $lock = $thread->exists ? Cache::lock("cms-workspace:{$thread->id}", 900) : null;

        if ($lock && ! $lock->get()) {
            return self::error(__('This chat is still answering.'), 'busy', 409);
        }

        return new StreamedResponse(function () use ($workspace, $thread, $user, $data, $command, $search, $message, $deciding, $agent, $lock): void {
            @set_time_limit(900);
            ignore_user_abort(true); // Finish the step in progress so the thread stays whole; stop before the next.

            // Shared hosts often buffer or compress output; events must reach the browser as they happen.
            if (! app()->runningUnitTests()) {
                @ini_set('zlib.output_compression', '0');
                function_exists('apache_setenv') && @apache_setenv('no-gzip', '1');

                while (ob_get_level() > 0) {
                    ob_end_flush();
                }
            }

            $send = static function (string $event, array $payload): void {
                echo "event: {$event}\ndata: ".json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE)."\n\n";
                @flush();
            };
            $stopped = static fn (): bool => connection_aborted() === 1;
            $edit = $data['edit'] ?? null;

            try {
                if ($command) {
                    $workspace->command($thread, $user, $data['command']['ability'], (array) ($data['command']['input'] ?? []), $data['command']['label'] ?? null, $send, $data['command']['detail'] ?? null);
                } elseif ($search || ($message && ! $agent)) {
                    $workspace->search($thread, $user, trim((string) ($search ? $data['search'] : $data['message'])), $send, $edit ? $this->replaced($workspace, $thread, $edit) : null);
                } else {
                    // An agent's turn takes a while: the thread exists from the start, for the browser to follow.
                    $thread->save();
                    $send('thread', $thread->summary());

                    if ($message) {
                        $workspace->message($thread, $user, trim((string) $data['message']), (array) ($data['context'] ?? []), array_filter((array) ($data['agent'] ?? []), 'is_scalar'), $send, $stopped, $edit);
                    } elseif ($deciding) {
                        $workspace->decide($thread, $user, array_values($data['approve']), $send, $stopped);
                    } else {
                        $workspace->interact($thread, $user, $data['action'], $send, $stopped);
                    }
                }

                $send('done', ['thread' => $thread->summary(), ...array_intersect_key($workspace->show($thread, $user), ['awaiting' => 1, 'agent' => 1, 'usage' => 1])]);
            } catch (AbilityException $e) {
                $send('error', $e->toArray());
            } catch (Throwable $e) {
                report($e);
                $send('error', ['message' => config('app.debug') ? $e->getMessage() : __('Something went wrong. Details are in the server log.'), 'type' => 'failed']);
            } finally {
                $lock?->release();
            }
        }, 200, [
            'Content-Type' => 'text/event-stream; charset=utf-8',
            'Cache-Control' => 'no-cache, no-transform',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /** The search turn an edit rewrites, still as the person saw it. */
    private function replaced(Workspace $workspace, Thread $thread, array $edit): string
    {
        $turn = array_find($thread->turns, static fn ($t) => ($t['id'] ?? null) === $edit['turn'] && ($t['role'] ?? null) === 'user' && in_array($t['kind'] ?? '', ['message', 'search'], true));

        if ($turn === null || $turn['text'] !== $edit['original']) {
            throw AbilityException::invalid(__('This message has changed. Reload the chat and try again.'));
        }

        return $turn['id'];
    }

    private static function error(string $message, string $type, int $status): JsonResponse
    {
        return new JsonResponse(['error' => ['message' => $message, 'type' => $type]], $status);
    }
}

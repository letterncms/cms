<?php

declare(strict_types=1);

namespace Cms\Modules\Workspace;

use Illuminate\Support\Str;

/**
 * The neutral transcript: what a thread shows, the same for every client and every agent.
 * A thread is a list of turns, each the person's or an answer:
 *
 *   {id, role: 'user', kind: 'message'|'command'|'search'|'action', text, command?: {ability, label, input}, attached?: [...], at}
 *   {id, role: 'answer', parts: [...], agent?: string, at}
 *
 * An answer's parts, in order:
 *
 *   {type: 'text', text} · {type: 'thinking', text}
 *   {type: 'tool', id, name, label, ability?, input, status: 'running'|'ok'|'error'|'declined'|'awaiting', output?, surface?, used?}
 *                                  `ability` names what the call ran, for any agent: an ok `admin/open` moves the admin there
 *   {type: 'view', view}           a view tree (Cms\Admin\Views), validated for the person and stored resolved
 *   {type: 'surface', surface}     an interface an agent composed (Cms\Admin\Surface)
 *   {type: 'notice', tone, message}
 *   {type: 'approval', calls, decided?}
 *
 * An answer is built from the events it streams with (see Cms\Contracts\Agent): `apply` here,
 * and the admin's thread does the same as they arrive.
 */
final class Transcript
{
    /** Longest tool output a thread keeps for the person to unfold. */
    public const int OUTPUT = 4000;

    /** What a command or search answered, for an agent that comes after it. */
    public const int RECAP = 1500;

    public static function user(string $kind, string $text, array $extra = []): array
    {
        return ['id' => (string) Str::ulid(), 'role' => 'user', 'kind' => $kind, 'text' => $text, ...$extra, 'at' => now()->toIso8601String()];
    }

    public static function answer(array $parts = [], ?string $agent = null, ?string $recap = null): array
    {
        return array_filter(['id' => (string) Str::ulid(), 'role' => 'answer', 'parts' => $parts, 'agent' => $agent, 'recap' => $recap, 'at' => now()->toIso8601String()], static fn ($v) => $v !== null);
    }

    /**
     * Turns with one event applied: text and thinking grow the last part, a tool call is
     * added and its result fills it in (wherever it is: an approval answers a call of the
     * answer before), an interface used is marked so. Anything else adds a part to the last
     * answer, which is started when the thread ends with the person's turn.
     *
     * @param  list<array>  $turns
     * @return list<array>
     */
    public static function apply(array $turns, string $event, array $data): array
    {
        if (in_array($event, ['tool_result', 'surface_used'], true)) {
            return self::patchTool($turns, (string) ($data['id'] ?? ''), $event === 'surface_used' ? ['used' => true] : array_filter([
                'status' => ! empty($data['declined']) ? 'declined' : (! empty($data['ok']) ? 'ok' : 'error'),
                'output' => isset($data['output']) ? Str::limit((string) $data['output'], self::OUTPUT) : null,
                'input' => $data['input'] ?? null,
                'surface' => $data['surface'] ?? null,
                'ability' => isset($data['ability']) ? (string) $data['ability'] : null,
            ], static fn ($v) => $v !== null));
        }

        $part = match ($event) {
            'text', 'thinking' => ['type' => $event, 'text' => (string) ($data['delta'] ?? '')],
            'tool' => ['type' => 'tool', 'id' => (string) $data['id'], 'name' => (string) ($data['name'] ?? ''), 'label' => (string) ($data['label'] ?? $data['name'] ?? ''), 'status' => 'running', ...(isset($data['ability']) ? ['ability' => (string) $data['ability']] : [])],
            'notice' => ['type' => 'notice', 'tone' => (string) ($data['tone'] ?? 'neutral'), 'message' => (string) ($data['message'] ?? '')],
            'view' => ['type' => 'view', 'view' => $data['view']],
            'surface' => ['type' => 'surface', 'surface' => $data['surface']],
            'approval' => ['type' => 'approval', 'calls' => array_values((array) ($data['calls'] ?? []))],
            default => null,
        };

        if ($part === null) {
            return $turns;
        }

        $last = array_key_last($turns);

        if ($last === null || ($turns[$last]['role'] ?? null) !== 'answer') {
            $turns[] = self::answer();
            $last = array_key_last($turns);
        }

        $parts = $turns[$last]['parts'];
        $tail = array_key_last($parts);

        if (in_array($event, ['text', 'thinking'], true) && $tail !== null && ($parts[$tail]['type'] ?? null) === $event) {
            $parts[$tail]['text'] .= $part['text'];
        } else {
            $parts[] = $part;
        }

        $turns[$last]['parts'] = $parts;

        if ($event === 'approval') {
            foreach ($part['calls'] as $call) {
                $turns = self::patchTool($turns, (string) ($call['id'] ?? ''), ['status' => 'awaiting', 'input' => $call['input'] ?? []]);
            }
        }

        return $turns;
    }

    /** @param list<array> $turns */
    private static function patchTool(array $turns, string $id, array $patch): array
    {
        for ($t = count($turns) - 1; $t >= 0; $t--) {
            foreach ($turns[$t]['parts'] ?? [] as $p => $part) {
                if (($part['type'] ?? null) === 'tool' && $part['id'] === $id) {
                    $turns[$t]['parts'][$p] = [...$part, ...$patch];

                    return $turns;
                }
            }
        }

        return $turns;
    }

    /**
     * The calls waiting for the person's go-ahead: those of the last answer's approval, until decided.
     *
     * @param  list<array>  $turns
     * @return list<array>
     */
    public static function awaiting(array $turns): array
    {
        $last = end($turns);

        foreach (array_reverse($last['parts'] ?? []) as $part) {
            if (($part['type'] ?? null) === 'approval') {
                return empty($part['decided']) ? $part['calls'] : [];
            }
        }

        return [];
    }

    /**
     * The approval decided: its calls go on as the person chose, or (with `$declined`) none of them
     * ran, because they moved on.
     *
     * @param  list<array>  $turns
     */
    public static function decided(array $turns, bool $declined = false): array
    {
        $last = array_key_last($turns);

        foreach (array_reverse(array_keys($turns[$last]['parts'] ?? []), true) as $p) {
            $part = $turns[$last]['parts'][$p];

            if (($part['type'] ?? null) === 'approval' && empty($part['decided'])) {
                $turns[$last]['parts'][$p]['decided'] = true;

                foreach ($declined ? $part['calls'] : [] as $call) {
                    $turns = self::patchTool($turns, (string) $call['id'], ['status' => 'declined']);
                }

                break;
            }
        }

        return $turns;
    }

    /**
     * The turns since `$agent` last answered: what the person did in between, which it has not seen.
     *
     * @param  list<array>  $turns
     * @return list<array>
     */
    public static function since(array $turns, string $agent): array
    {
        for ($i = count($turns) - 1; $i >= 0; $i--) {
            if (($turns[$i]['role'] ?? null) === 'answer' && ($turns[$i]['agent'] ?? null) === $agent) {
                return array_values(array_slice($turns, $i + 1));
            }
        }

        return array_values($turns);
    }

    /**
     * What happened in turns, in a line each, for an agent: "Ran “New Page” (entries/create)
     * with {…}: {…}". Results are what the site holds, words others may have written: data,
     * never instructions.
     *
     * @param  list<array>  $turns
     * @return list<array{did: string, input?: array, result?: string}>
     */
    public static function recap(array $turns): array
    {
        $out = [];

        foreach ($turns as $i => $turn) {
            if (($turn['role'] ?? null) !== 'user' || ! in_array($turn['kind'] ?? '', ['command', 'search'], true)) {
                continue;
            }

            $answer = $turns[$i + 1] ?? null;
            $result = ($answer['role'] ?? null) === 'answer' ? ($answer['recap'] ?? null) : null;
            $out[] = array_filter($turn['kind'] === 'command'
                ? ['did' => 'Ran “'.($turn['command']['label'] ?? $turn['text']).'” ('.($turn['command']['ability'] ?? '').')', 'input' => $turn['command']['input'] ?? null, 'result' => $result]
                : ['did' => 'Searched for “'.$turn['text'].'”', 'result' => $result], static fn ($v) => $v !== null && $v !== []);
        }

        return $out;
    }

    /** The turns as a client draws them: what is kept for agents stays on the server. */
    public static function shown(array $turns): array
    {
        return array_map(static fn (array $turn) => array_diff_key($turn, ['recap' => 1]), $turns);
    }

    /** What was sent, without what must not be written down: passwords, secrets, keys and tokens. */
    public static function redact(array $input): array
    {
        foreach ($input as $key => $value) {
            if (is_string($key) && preg_match('/pass(word)?|secret|token|key$/i', $key)) {
                $input[$key] = '••••';
            } elseif (is_array($value)) {
                $input[$key] = self::redact($value);
            } elseif (is_string($value) && strlen($value) > 2000) {
                $input[$key] = Str::limit($value, 2000);
            }
        }

        return $input;
    }

    /** A result in a few lines, for the recap. */
    public static function brief(mixed $result): string
    {
        $text = is_string($result) ? $result : (string) json_encode(is_array($result) ? self::redact($result) : $result, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);

        return Str::limit($text, self::RECAP);
    }
}

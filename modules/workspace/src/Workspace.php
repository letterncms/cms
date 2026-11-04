<?php

declare(strict_types=1);

namespace Cms\Modules\Workspace;

use Closure;
use Illuminate\Support\Str;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Cms;
use Cms\Contracts\Agent;
use Cms\Contracts\AgentMessage;
use Cms\Users\User;

/**
 * One turn of a thread: a command run for the person, a search, a message for the agent,
 * the person's decision on what an agent asked to do, or a click on what it answered with.
 * The thread is written here, as events stream to the browser (`$send`): the person's turn,
 * then the answer, built from the same events (Transcript::apply).
 */
final class Workspace
{
    public function __construct(
        private readonly Cms $cms,
        private readonly Agent $agent,
        private readonly Answers $answers,
        private readonly Search $search,
    ) {}

    public function agent(): Agent
    {
        return $this->agent;
    }

    /** Whether plain language reaches an agent for this person; otherwise it is a search. */
    public function answers(User $user): bool
    {
        return $this->agent->available($user);
    }

    /**
     * Run an ability as the person, through the same executor as everywhere (permissions,
     * validation, the audit log), and answer with its view. Nothing is written when it fails:
     * the browser keeps the form open with what was wrong.
     */
    public function command(Thread $thread, User $user, string $name, array $input, ?string $label, Closure $send, ?string $detail = null): void
    {
        $ability = $this->cms->abilities()->get($name) ?? throw AbilityException::notFound($name);
        $result = $this->cms->abilities()->execute($name, $input, AbilityContext::forUser($user, 'admin'));
        $label = trim((string) $label) !== '' ? Str::limit(trim((string) $label), 120, '') : __($ability->label);

        // What a read brings back may be words others wrote: an agent later takes no orders from it.
        if ($ability->isReadOnly() && ! ($ability->annotations['trustedOutput'] ?? false)) {
            $thread->untrusted = true;
        }

        // `detail`: what was chosen, in the words the form showed ("Footer", not "footer").
        $turn = Transcript::user('command', $label, ['command' => array_filter(['ability' => $name, 'label' => $label, 'input' => Transcript::redact($input), 'detail' => trim((string) $detail) !== '' ? Str::limit(trim((string) $detail), 160, '…') : null], static fn ($v) => $v !== null)]);
        $this->write($thread, $turn, Transcript::answer([['type' => 'view', 'view' => $this->answers->command($ability, $input, $result, $user)]], recap: Transcript::brief($result)), $send);
    }

    /** Search without AI, answered with what was found. `$replaces` is the turn an edit rewrites. */
    public function search(Thread $thread, User $user, string $query, Closure $send, ?string $replaces = null): void
    {
        $found = $this->search->run($query, $user);
        $thread->untrusted = true;

        if ($replaces !== null) {
            $this->rewind($thread, $replaces);
        }

        $recap = implode('; ', array_map(static fn (array $s) => $s['title'].': '.implode(', ', array_column($s['items'], 'label')), $found['sections'])) ?: 'Nothing found.';
        $this->write($thread, Transcript::user('search', $query), Transcript::answer([['type' => 'view', 'view' => $this->answers->search($found, $user)]], recap: Str::limit($recap, Transcript::RECAP)), $send, $replaces);
    }

    /** A message for the agent. With `$edit`, the person rewrote an earlier one: it and what came after it go. */
    public function message(Thread $thread, User $user, string $text, array $context, array $options, Closure $send, Closure $stopped, ?array $edit = null): void
    {
        $replaces = null;

        if ($edit !== null) {
            $replaces = $this->editable($thread, $edit)['id'];
            $this->rewind($thread, $replaces);
        } elseif (Transcript::awaiting($thread->turns) !== []) {
            // A new message declines what is still waiting; the agent closes its side too.
            $thread->turns = Transcript::decided($thread->turns, declined: true);
        }

        $earlier = Transcript::since($thread->turns, $this->agent->name());
        $attached = $this->attached($context, $user);
        $turn = Transcript::user('message', $text, array_filter(['attached' => $attached ?: null, 'replaces' => $replaces]));
        $this->title($thread, $text);
        $thread->agent = $this->agent->name();
        $thread->addTurn($turn);
        $thread->save();
        $send('turn', ['turn' => $turn]);

        $message = new AgentMessage($text, $turn, $earlier, $context, $options, $replaces);
        $this->answer($thread, $user, $send, fn (Closure $emit) => $replaces !== null && $thread->agent_state !== null
            ? $this->agent->edit($thread, $user, $message, $emit, $stopped)
            : $this->agent->reply($thread, $user, $message, $emit, $stopped));
    }

    /** @param list<string> $approved */
    public function decide(Thread $thread, User $user, array $approved, Closure $send, Closure $stopped): void
    {
        if (Transcript::awaiting($thread->turns) === []) {
            throw AbilityException::invalid(__('Nothing is waiting for approval.'));
        }

        $thread->turns = Transcript::decided($thread->turns);
        $thread->save();
        $this->answer($thread, $user, $send, fn (Closure $emit) => $this->agent->decide($thread, $user, $approved, $emit, $stopped), continued: true);
    }

    /** A click on an interface the agent answered with: identifiers only, never what to run. */
    public function interact(Thread $thread, User $user, array $action, Closure $send, Closure $stopped): void
    {
        if (Transcript::awaiting($thread->turns) !== []) {
            throw AbilityException::invalid(__('Decide on the pending action first.'));
        }

        $title = null;
        foreach ($thread->turns as $turn) {
            foreach ($turn['parts'] ?? [] as $part) {
                if (($part['type'] ?? null) === 'tool' && $part['id'] === $action['tool'] && isset($part['surface']['title'])) {
                    $title = $part['used'] ?? false ? throw AbilityException::invalid(__('This interface has already been used. Ask for a fresh view.')) : (string) $part['surface']['title'];
                }
            }
        }

        $turn = Transcript::user('action', __('Selected an action in “:title”.', ['title' => $title ?? throw AbilityException::invalid(__('This interface is no longer available.'))]));
        $thread->addTurn($turn);
        $thread->save();
        $send('turn', ['turn' => $turn]);
        $this->answer($thread, $user, $send, fn (Closure $emit) => $this->agent->interact($thread, $user, $action, $emit, $stopped));
    }

    /** What the browser draws: the turns, what waits for a decision, the agent's own state. */
    public function show(Thread $thread, User $user): array
    {
        return [
            ...$thread->summary(),
            'turns' => Transcript::shown($thread->turns),
            'awaiting' => Transcript::awaiting($thread->turns),
            'agent' => $thread->agent !== null && $thread->agent === $this->agent->name() ? $this->agent->state($thread, $user) : null,
            'usage' => $thread->usage,
        ];
    }

    /** The answer an agent streams, written into the thread as it comes: on every step it saves, and at the end. */
    private function answer(Thread $thread, User $user, Closure $send, Closure $run, bool $continued = false): void
    {
        if (! $continued) {
            $answer = Transcript::answer(agent: $this->agent->name());
            $thread->addTurn($answer);
            $send('turn', ['turn' => $answer]);
        }

        $emit = function (string $event, array $data) use ($thread, $send): void {
            $thread->turns = Transcript::apply($thread->turns, $event, $data);
            $send($event, $data);
            if (! in_array($event, ['text', 'thinking'], true)) {
                $thread->save();
            }
        };

        try {
            $run($emit);
        } finally {
            $thread->save();
        }
    }

    private function write(Thread $thread, array $turn, array $answer, Closure $send, ?string $replaces = null): void
    {
        $this->title($thread, $turn['text']);
        if ($replaces !== null) {
            $turn['replaces'] = $replaces;
        }
        $thread->addTurn($turn);
        $thread->addTurn($answer);
        $thread->save();
        $send('thread', $thread->summary());
        $send('turn', ['turn' => $turn]);
        $send('turn', ['turn' => Transcript::shown([$answer])[0]]);
    }

    /** A thread is named after how it starts until something names it better. */
    private function title(Thread $thread, string $text): void
    {
        if ($thread->title === '' || ! array_any($thread->turns, static fn ($t) => ($t['role'] ?? null) === 'user')) {
            $thread->title = Str::ucfirst(Str::limit(trim((string) preg_replace('/\s+/', ' ', $text)), 60, '…'));
        }
    }

    /** The turn an edit rewrites, as long as it still says what the person saw. @return array the turn */
    private function editable(Thread $thread, array $edit): array
    {
        $turn = array_find($thread->turns, static fn ($t) => ($t['id'] ?? null) === $edit['turn'] && ($t['role'] ?? null) === 'user' && in_array($t['kind'] ?? '', ['message', 'search'], true));

        if ($turn === null || $turn['text'] !== $edit['original']) {
            throw AbilityException::invalid(__('This message has changed. Reload the chat and try again.'));
        }

        return $turn;
    }

    /** Drop a turn and everything after it. What it did on the site stays done. */
    private function rewind(Thread $thread, string $id): void
    {
        $index = array_search($id, array_column($thread->turns, 'id'), true);

        if ($index !== false) {
            $thread->turns = array_slice($thread->turns, 0, $index);
            if ($index === 0) {
                $thread->title = '';
            }
        }
    }

    /** What a message carried, to show with it: labels and places in the admin, never what they said; and the skill it asks for. */
    private function attached(array $context, User $user): array
    {
        $items = array_values(array_map(static function (array $item): array {
            $shown = array_filter(array_intersect_key($item, ['label' => 1, 'kind' => 1, 'icon' => 1, 'to' => 1]), static fn ($v) => is_string($v) && $v !== '');
            if (isset($shown['to']) && preg_match('~^/[A-Za-z0-9/_.-]{0,199}$~', $shown['to']) !== 1) {
                unset($shown['to']);
            }

            return $shown;
        }, array_filter((array) ($context['items'] ?? []), 'is_array')));

        $items = array_values(array_filter($items, static fn ($i) => isset($i['label'])));
        $skill = $this->cms->skills()->all($user)[(string) ($context['skill'] ?? '')] ?? null;

        return $skill === null ? $items : [...$items, ['kind' => 'skill', 'label' => __($skill['label']), 'icon' => $skill['icon']]];
    }
}

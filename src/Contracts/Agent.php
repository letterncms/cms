<?php

declare(strict_types=1);

namespace Cms\Contracts;

use Closure;
use Cms\Modules\Workspace\Thread;
use Cms\Users\User;

/**
 * What answers plain language in the workspace's threads. Without one bound (NoAgent),
 * a message is a search, and the workspace never mentions AI. The Assistant module binds
 * Claude; a plugin may bind another.
 *
 * The agent never writes the thread's turns: it streams its answer through `$emit`, the
 * same events the workspace sends to the browser (`text` and `thinking` with a `delta`,
 * `tool` {id, name, label}, `tool_result` {id, input, ok, mutated, output, declined?, surface?},
 * `approval` {calls}, `notice` {tone, message}, `surface_used` {id}), and the workspace
 * turns them into the neutral transcript (see Transcript). What it needs to go on — its
 * own history, calls waiting for approval, a model — it keeps in `$thread->agent_state`,
 * and saves with `$thread->save()`. `$stopped()` says the person left: finish the step
 * in progress, then return.
 */
interface Agent
{
    /** A short, stable name, stored with each answer it gives (`assistant`). */
    public function name(): string;

    /** What people call it (`Claude`). */
    public function label(): string;

    /** Whether it answers this person: set up, and theirs to use. */
    public function available(User $user): bool;

    /** What the thread shows of its state, for the browser: a model picked, say. Plain data. */
    public function state(Thread $thread, User $user): array;

    /** Answer a message. */
    public function reply(Thread $thread, User $user, AgentMessage $message, Closure $emit, Closure $stopped): void;

    /** The person changed an earlier message: forget what came from `$message->replaces` on, then answer it. */
    public function edit(Thread $thread, User $user, AgentMessage $message, Closure $emit, Closure $stopped): void;

    /**
     * Go on after the person decided on the calls waiting for approval.
     *
     * @param  list<string>  $approved  the ids of the calls they allowed; the rest are declined
     */
    public function decide(Thread $thread, User $user, array $approved, Closure $emit, Closure $stopped): void;

    /**
     * A click on an interface it answered with: `$action` is what the browser reported,
     * identifiers only ({tool, node, name}); what runs is what the agent stored for it.
     */
    public function interact(Thread $thread, User $user, array $action, Closure $emit, Closure $stopped): void;

    /** A short name for the thread from how it starts, or null to keep the one it has. */
    public function title(Thread $thread, User $user): ?string;
}

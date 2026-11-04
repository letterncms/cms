<?php

declare(strict_types=1);

namespace Cms\Contracts\Defaults;

use Closure;
use Cms\Abilities\AbilityException;
use Cms\Contracts\Agent;
use Cms\Contracts\AgentMessage;
use Cms\Modules\Workspace\Thread;
use Cms\Users\User;

/** Used when no AI plugin answers: the workspace treats every message as a search. */
final class NoAgent implements Agent
{
    public function name(): string
    {
        return 'none';
    }

    public function label(): string
    {
        return '';
    }

    public function available(User $user): bool
    {
        return false;
    }

    public function state(Thread $thread, User $user): array
    {
        return [];
    }

    public function reply(Thread $thread, User $user, AgentMessage $message, Closure $emit, Closure $stopped): void
    {
        throw AbilityException::invalid(__('Nothing answers messages on this site.'));
    }

    public function edit(Thread $thread, User $user, AgentMessage $message, Closure $emit, Closure $stopped): void
    {
        $this->reply($thread, $user, $message, $emit, $stopped);
    }

    public function decide(Thread $thread, User $user, array $approved, Closure $emit, Closure $stopped): void
    {
        throw AbilityException::invalid(__('Nothing is waiting for approval.'));
    }

    public function interact(Thread $thread, User $user, array $action, Closure $emit, Closure $stopped): void
    {
        throw AbilityException::invalid(__('This interface is no longer available.'));
    }

    public function title(Thread $thread, User $user): ?string
    {
        return null;
    }
}

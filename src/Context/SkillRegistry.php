<?php

declare(strict_types=1);

namespace Cms\Context;

use Cms\Users\User;

/**
 * Ready-made ways of working for agents, under a name: "/proofread" in the
 * assistant's chat, a prompt for MCP clients. Plugins register theirs; every
 * agent gets them all, and each person those they may use.
 * A skill has a label, a description, a prompt with {arguments} and optionally an
 * icon and a permission.
 */
final class SkillRegistry
{
    /** @var array<string, array{name: string, label: string, description: string, icon: string, prompt: string, arguments: list<array{name: string, description?: string, required?: bool}>, permission: ?string}> */
    private array $skills = [];

    /** @param array{label: string, description: string, prompt: string, icon?: string, arguments?: list<array>, permission?: ?string} $skill */
    public function register(string $name, array $skill): void
    {
        $this->skills[$name] = ['name' => $name, 'icon' => 'sparkle', 'arguments' => [], 'permission' => 'admin.access', ...$skill];
    }

    /** @return array<string, array> Without a user: all of them, for transports that check permissions at each action. */
    public function all(?User $user = null): array
    {
        return $user ? array_filter($this->skills, static fn ($skill) => $skill['permission'] === null || $user->hasPermission($skill['permission'])) : $this->skills;
    }

    /** What a skill asks for, its {arguments} filled in. */
    public function prompt(string $name, array $arguments = []): ?string
    {
        $skill = $this->skills[$name] ?? null;

        return $skill ? trim((string) preg_replace_callback('/\{(\w+)\}/', static fn ($m) => (string) ($arguments[$m[1]] ?? ''), $skill['prompt'])) : null;
    }
}

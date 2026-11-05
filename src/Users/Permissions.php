<?php

declare(strict_types=1);

namespace Cms\Users;

/**
 * Registry of known permissions, grouped for the roles editor. `trusted` marks one to give only
 * to people you trust (raw HTML, custom code, unsigned packages): the editor shows it with a badge.
 * `roles` names the default roles that hold it (`editor`, `author`) until a site edits its roles.
 */
final class Permissions
{
    /** @var array<string, array{label: string, group: string, description: string, trusted: bool, roles: list<string>}> */
    private array $permissions = [];

    /** @param  list<string>  $roles */
    public function register(string $name, string $label, string $group = 'General', string $description = '', bool $trusted = false, array $roles = []): void
    {
        $roles = array_values(array_map('strval', $roles));
        $this->permissions[$name] = compact('label', 'group', 'description', 'trusted', 'roles');
    }

    /** @return array<string, array{label: string, group: string, description: string, trusted: bool, roles: list<string>}> */
    public function all(): array
    {
        return $this->permissions;
    }

    /** @return list<string> The permissions registered for a default role. */
    public function forRole(string $role): array
    {
        return array_keys(array_filter($this->permissions, static fn (array $p) => in_array($role, $p['roles'], true)));
    }

    /** @return array<string, list<array{name: string, label: string, description: string, trusted: bool}>> */
    public function grouped(): array
    {
        $out = [];

        foreach ($this->permissions as $name => $p) {
            $out[$p['group']][] = ['name' => $name, 'label' => $p['label'], 'description' => $p['description'], 'trusted' => $p['trusted']];
        }

        return $out;
    }
}

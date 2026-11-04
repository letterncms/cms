<?php

declare(strict_types=1);

namespace Cms\Users;

/**
 * Registry of known permissions, grouped for the roles editor. `trusted` marks one to give only
 * to people you trust (raw HTML, custom code, unsigned packages): the editor shows it with a badge.
 */
final class Permissions
{
    /** @var array<string, array{label: string, group: string, description: string, trusted: bool}> */
    private array $permissions = [];

    public function register(string $name, string $label, string $group = 'General', string $description = '', bool $trusted = false): void
    {
        $this->permissions[$name] = compact('label', 'group', 'description', 'trusted');
    }

    /** @return array<string, array{label: string, group: string, description: string, trusted: bool}> */
    public function all(): array
    {
        return $this->permissions;
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

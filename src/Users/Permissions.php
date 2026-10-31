<?php

declare(strict_types=1);

namespace Cms\Users;

/** Registry of known permissions, grouped for the roles editor. */
final class Permissions
{
    /** @var array<string, array{label: string, group: string, description: string}> */
    private array $permissions = [];

    public function register(string $name, string $label, string $group = 'General', string $description = ''): void
    {
        $this->permissions[$name] = compact('label', 'group', 'description');
    }

    /** @return array<string, array{label: string, group: string, description: string}> */
    public function all(): array
    {
        return $this->permissions;
    }

    /** @return array<string, list<array{name: string, label: string, description: string}>> */
    public function grouped(): array
    {
        $out = [];

        foreach ($this->permissions as $name => $p) {
            $out[$p['group']][] = ['name' => $name, 'label' => $p['label'], 'description' => $p['description']];
        }

        return $out;
    }
}

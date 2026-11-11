<?php

declare(strict_types=1);

namespace Cms\Users;

use Cms\Abilities\AbilityException;

/**
 * Roles and their permissions: the `roles` value of the `roles` settings
 * (config/roles.yaml), edited in Settings → Roles like any other setting.
 */
final class Roles
{
    public const string SETTINGS = 'roles';

    /** The kernel's own part of the roles a site starts with: modules and plugins add theirs (see defaults()). */
    private const array BASE = [
        'admin' => [
            'label' => 'Administrator',
            'description' => 'Everything, including users, plugins and settings.',
            'permissions' => ['*'],
        ],
        'editor' => [
            'label' => 'Editor',
            'description' => 'Manage all content, media and the site build.',
            'permissions' => ['admin.access', 'entries.*', 'globals.*', 'media.*', 'navigation.*'],
        ],
        'author' => [
            'label' => 'Author',
            'description' => 'Write and edit content; cannot publish.',
            'permissions' => ['admin.access', 'entries.*.view', 'entries.*.create', 'entries.*.edit', 'media.view', 'media.upload'],
        ],
        'member' => [
            'label' => 'Visitor',
            'description' => 'A site visitor with an account. No access to the admin.',
            'permissions' => [],
        ],
    ];

    public function __construct(private readonly Permissions $permissions) {}

    /** @return array<string, array{label: string, description: string, permissions: list<string>}> */
    public function all(): array
    {
        $roles = cms()->setting(self::SETTINGS, 'roles');

        return self::normalize(is_array($roles) && $roles !== [] ? $roles : $this->defaults());
    }

    /**
     * The roles a site starts with: the kernel's, and each permission registered for one of them
     * (`roles:` in Permissions::register()).
     *
     * @return array<string, array{label: string, description: string, permissions: list<string>}>
     */
    public function defaults(): array
    {
        $roles = self::BASE;

        foreach (array_keys($roles) as $role) {
            if ($role !== 'admin') {
                $roles[$role]['permissions'] = array_values(array_unique([...$roles[$role]['permissions'], ...$this->permissions->forRole($role)]));
            }
        }

        return $roles;
    }

    /** @return list<string> */
    public function permissionsFor(array $roles): array
    {
        $all = $this->all();
        $out = [];

        foreach ($roles as $role) {
            array_push($out, ...($all[$role]['permissions'] ?? []));
        }

        return array_values(array_unique($out));
    }

    /**
     * Clean role definitions before they are stored. The admin role always
     * exists and keeps every permission, so nobody locks the site out.
     */
    public static function normalize(array $roles): array
    {
        $out = [];

        foreach ($roles as $handle => $role) {
            if (! is_string($handle) || ! preg_match('/^[a-z][a-z0-9_-]{0,31}$/', $handle) || ! is_array($role)) {
                throw AbilityException::invalid(__('Invalid role ":handle": use lowercase letters, digits, - and _.', ['handle' => $handle]));
            }

            $out[$handle] = [
                'label' => trim((string) ($role['label'] ?? '')) ?: ucfirst($handle),
                'description' => trim((string) ($role['description'] ?? '')),
                'permissions' => array_values(array_unique(array_map('strval', array_filter((array) ($role['permissions'] ?? []), 'is_string')))),
            ];
        }

        $out['admin'] = ['label' => $out['admin']['label'] ?? self::BASE['admin']['label'], 'description' => $out['admin']['description'] ?? self::BASE['admin']['description'], 'permissions' => ['*']];

        return $out;
    }
}

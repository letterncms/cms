<?php

declare(strict_types=1);

namespace Cms\Abilities\Core;

use Illuminate\Support\Facades\DB;
use Cms\Abilities\Ability;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityRegistry;
use Cms\Cms;
use Cms\Packages\PackageManifest;
use Cms\Users\User;

/** What the kernel itself answers: discovery, system information, the site and its people. */
final class SystemAbilities
{
    public function __construct(private readonly Cms $cms) {}

    public function register(AbilityRegistry $a): void
    {
        $a->register('abilities/list', [
            'label' => 'List Abilities',
            'description' => 'Every action this site supports for you, with input schemas.',
            'permission' => static fn (?User $u) => $u !== null,
            'annotations' => ['readOnly' => true],
            'handler' => fn (array $in, AbilityContext $ctx) => array_values(array_map(static fn (Ability $x) => $x->toArray(), $a->available($ctx))),
        ]);

        // The admin's places as data. For people's screens: agents read and change through the abilities a view binds, not the view.
        $a->register('views/get', [
            'label' => 'Get View',
            'description' => 'One place of the admin as data: its components, and the abilities they load from and act with, for the signed-in person.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'expose' => ['mcp' => false, 'assistant' => false],
            'input' => ['type' => 'object', 'properties' => [
                'id' => ['type' => 'string', 'maxLength' => 120],
                'params' => ['type' => 'object', 'additionalProperties' => ['type' => 'string'], 'default' => []],
            ], 'required' => ['id']],
            'handler' => fn (array $in, AbilityContext $ctx) => $this->cms->views()->resolve($in['id'], $ctx->user, $in['params']),
        ]);

        $a->register('system/info', [
            'label' => 'System Information',
            'description' => 'CMS version, PHP, database, packages and pending upgrades.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'handler' => fn () => [
                'cms' => Cms::VERSION,
                'php' => PHP_VERSION,
                'database' => DB::connection()->getDriverName(),
                'environment' => app()->environment(),
                'packages' => array_map(static fn (PackageManifest $p) => ['name' => $p->name, 'version' => $p->version], array_values($this->cms->packages()->active())),
                'pending' => $this->cms->packages()->pending(),
            ],
        ]);

        $this->site($a);

        $a->register('users/lookup', [
            'label' => 'Look Up People',
            'description' => 'Safe person identities for authors and user relations, without account details.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => [
                'search' => ['type' => 'string', 'maxLength' => 120],
                'ids' => ['type' => 'array', 'items' => ['type' => 'string'], 'maxItems' => 100],
                'page' => ['type' => 'integer', 'minimum' => 1, 'default' => 1],
                'perPage' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100, 'default' => 25],
            ]],
            'handler' => function (array $in) {
                $query = User::query()->orderBy('name')->orderBy('id');
                if (isset($in['ids'])) $query->whereIn('id', $in['ids']);
                if (isset($in['search']) && trim($in['search']) !== '') {
                    $term = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], trim($in['search'])).'%';
                    $query->whereRaw("name like ? escape '!'", [$term]);
                }
                $page = $query->paginate($in['perPage'], ['id', 'name', 'avatar'], 'page', $in['page']);

                return ['items' => array_map(static fn (User $u) => $u->toPerson(), $page->items()), 'total' => $page->total(), 'page' => $page->currentPage(), 'pages' => $page->lastPage(), 'perPage' => $page->perPage()];
            },
        ]);

        // Users are the kernel's (sign-in, authors, pickers); letterncms/users manages them.
        $a->register('users/list', [
            'label' => 'List Users',
            'permission' => 'users.view',
            'description' => 'People with an account on this site: the team (who can open the admin) by default, or the site\'s visitors.',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => [
                'search' => ['type' => 'string', 'maxLength' => 120],
                'role' => ['type' => 'string'],
                'kind' => ['type' => 'string', 'enum' => ['team', 'visitors', 'all'], 'default' => 'team'],
                'page' => ['type' => 'integer', 'minimum' => 1, 'default' => 1],
                'perPage' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100, 'default' => 50],
            ]],
            'handler' => function (array $in, AbilityContext $ctx) {
                $query = User::query()->orderBy('name');

                match ($in['kind']) {
                    'team' => $query->team(),
                    'visitors' => $query->visitors(),
                    default => null,
                };

                if (! empty($in['search'])) {
                    $term = '%'.$in['search'].'%';
                    $query->where(static fn ($q) => $q->where('name', 'like', $term)->orWhere('email', 'like', $term));
                }

                if (! empty($in['role'])) {
                    $query->whereJsonContains('roles', $in['role']);
                }

                $page = $query->paginate($in['perPage'], ['*'], 'page', $in['page']);

                // For whoever lists them: the person as one value, "You" beside the one asking, and what stands out about each (suspended, super admin, their roles, then two-factor when it is on).
                $listed = static fn (User $u) => [
                    ...$u->toPublic(),
                    'person' => $u->toPerson(),
                    'you' => $ctx->user?->is($u) ? app(\Cms\Admin\Translations::class)->label(__('You')) : null,
                    'badges' => [...($u->status === \Cms\Users\Accounts::SUSPENDED ? ['suspended'] : []), ...($u->super ? ['super'] : []), ...($u->roles ?? []), ...($u->hasTwoFactor() ? ['twoFactor'] : [])],
                ];

                return ['items' => array_map($listed, $page->items()), 'total' => $page->total(), 'page' => $page->currentPage(), 'pages' => $page->lastPage()];
            },
        ]);
    }

    private function site(AbilityRegistry $a): void
    {
        $a->register('site/get', [
            'label' => 'Site Settings',
            'description' => 'Name, URL, timezone, locales and themes. Change them with settings/update (namespace "site").',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'handler' => fn () => [
                'name' => config('app.name'),
                'url' => config('app.url'),
                'timezone' => config('app.timezone'),
                'locale' => $this->cms->defaultLocale(),
                'locales' => $this->cms->locales(),
                ...array_diff_key($this->cms->site(), array_flip(['name', 'url', 'timezone', 'locale', 'locales'])),
            ],
        ]);
    }
}

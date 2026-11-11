<?php

declare(strict_types=1);

namespace Cms\Modules\Users;

use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator as LaravelValidator;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Modules\Email\Message;
use Cms\Modules\Email\Mailer;
use Cms\Cms;
use Cms\Modules\Workspace\Answers;
use Cms\Users\Accounts;
use Cms\Users\Passwords;
use Cms\Users\User;
use Cms\Users\UserFields;
use Cms\Abilities\Shapes;
use Cms\Support\Schema\Shape;

/** People, their roles and profile fields. (users/list is the kernel's: pickers need it.) */
final class UserAbilities
{
    public function __construct(private readonly Cms $cms) {}

    public function register(AbilityRegistry $a): void
    {
        $this->users($a);
    }

    private function users(AbilityRegistry $a): void
    {
        // The roles there are, so a form can offer them (assertRoles says so in words when one is not).
        $roles = $this->cms->roles()->all();
        $roleSchema = ['type' => 'array', 'items' => ['type' => 'string', ...($roles ? ['enum' => array_keys($roles), 'x-labels' => array_map(static fn ($role) => (string) ($role['label'] ?? ''), $roles)] : [])], 'uniqueItems' => true];

        $a->register('users/recent', [
            'label' => 'Recent Sign-Ins',
            'description' => 'The people who signed in most recently (never signed in last), with their role names and how many users there are in all.',
            'permission' => 'users.view',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 50, 'default' => 6]]],
            'output' => Shape::of(['items' => [Shapes::user()->with(['role' => Shape::STRING])], 'total' => Shape::INTEGER]),
            'handler' => function (array $in) {
                $roles = $this->cms->roles()->all();
                $label = static fn (User $u) => $u->super ? __('Super Admin') : implode(', ', array_map(static fn (string $r) => __($roles[$r]['label'] ?? $r), $u->roles ?? []));
                $users = User::query()->team()->orderByRaw('last_login_at is null')->orderByDesc('last_login_at')->orderBy('name')->limit($in['limit'])->get();

                return [
                    'items' => $users->map(static fn (User $u) => [...$u->toPublic(), 'role' => $label($u)])->all(),
                    'total' => User::query()->team()->count(),
                ];
            },
        ]);

        $a->register('users/get', [
            'label' => 'Get User',
            'permission' => 'users.view',
            'description' => 'One user.',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string']], 'required' => ['id']],
            'output' => Shapes::user(),
            'handler' => fn (array $in) => User::query()->findOrFail($in['id'])->toPublic(),
        ]);

        $a->register('users/create', [
            'label' => 'Create User',
            'permission' => 'users.manage',
            'description' => 'Add a user. Without a password, an invitation email with a set-password link is sent.',
            'expose' => ['mcp' => false, 'assistant' => false],
            'input' => ['type' => 'object', 'properties' => [
                'name' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 120],
                'email' => ['type' => 'string', 'format' => 'email'],
                'password' => ['type' => 'string'],
                'roles' => $roleSchema,
                'super' => ['type' => 'boolean', 'default' => false, 'title' => __('Super Admin')],
                'data' => ['type' => 'object', 'description' => 'Profile fields (see user-fields/get).'],
            ], 'required' => ['name', 'email', 'roles']],
            // Invited, or added with a password: who they are, with a way to them and a way back.
            'answer' => static fn (array $person, array $in) => Answers::done(
                isset($in['password']) ? __('Added :name', ['name' => $person['name']]) : __('Invited :name', ['name' => $person['name']]),
                $person['email'],
                [
                    ['label' => __('Open'), 'icon' => 'arrow-right', 'variant' => 'primary', 'to' => '/users/'.$person['id']],
                    ...(isset($in['password']) ? [] : [['label' => __('Resend Invitation'), 'icon' => 'mail', 'ability' => 'users/invite', 'input' => ['id' => $person['id']], 'success' => __('Invitation sent')]]),
                    ['label' => __('Delete'), 'icon' => 'trash', 'variant' => 'ghost', 'ability' => 'users/delete', 'input' => ['id' => $person['id']],
                        'confirm' => ['title' => Answers::literal(__('Delete :name?', ['name' => $person['name']])), 'confirm' => __('Delete'), 'danger' => true], 'success' => __('User deleted')],
                ],
            ),
            'output' => Shapes::user(),
            'handler' => function (array $in, AbilityContext $ctx) {
                $email = strtolower($in['email']);

                if (User::query()->where('email', $email)->exists()) {
                    throw AbilityException::conflict('A user with that email already exists.');
                }

                $this->assertRoles($in['roles']);

                if ($in['super'] && ! ($ctx->user?->super ?? $ctx->system)) {
                    throw AbilityException::forbidden('Only super admins can create super admins.');
                }

                if (isset($in['password'])) {
                    LaravelValidator::make($in, ['password' => Passwords::rules()])->validate();
                }

                $user = new User([
                    'name' => $in['name'],
                    'email' => $email,
                    'password' => $in['password'] ?? bin2hex(random_bytes(32)),
                    'roles' => $in['roles'],
                    'super' => $in['super'],
                ]);
                $this->cms->app()->make(UserFields::class)->fill($user, (array) ($in['data'] ?? []));
                $user->save();

                if (! isset($in['password'])) {
                    $this->invite($user, $ctx->user);
                }

                return $user->toPublic();
            },
        ]);

        $a->register('users/update', [
            'label' => 'Update User',
            'permission' => 'users.manage',
            'description' => 'Change a user\'s name, email, roles or profile fields (data).',
            'expose' => ['mcp' => false, 'assistant' => false],
            'input' => ['type' => 'object', 'properties' => [
                'id' => ['type' => 'string'],
                'name' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 120],
                'email' => ['type' => 'string', 'format' => 'email'],
                'roles' => $roleSchema,
                'super' => ['type' => 'boolean', 'title' => __('Super Admin')],
                'data' => ['type' => 'object', 'description' => 'Profile fields (see user-fields/get), merged into the current values.'],
                'suspended' => ['type' => 'boolean', 'description' => 'A suspended account cannot sign in, and is signed out at its next request.'],
            ], 'required' => ['id']],
            'output' => Shapes::user(),
            'handler' => function (array $in, AbilityContext $ctx) {
                $user = User::query()->findOrFail($in['id']);
                $self = $ctx->user && $user->is($ctx->user);

                // Nobody takes away their own way back in: another admin changes these.
                if ($self && ((isset($in['roles']) && array_diff((array) $user->roles, $in['roles']) !== []) || (isset($in['super']) && ! $in['super'] && $user->super))) {
                    throw AbilityException::conflict('You cannot take away your own roles. Ask another administrator.');
                }

                if (isset($in['roles'])) {
                    $this->assertRoles($in['roles']);
                    $user->roles = $in['roles'];
                }

                if (isset($in['super']) && $in['super'] !== $user->super) {
                    if (! ($ctx->user?->super ?? $ctx->system)) {
                        throw AbilityException::forbidden('Only super admins can change super admin status.');
                    }

                    if (! $in['super'] && User::query()->where('super', true)->count() <= 1) {
                        throw AbilityException::conflict('There must be at least one super admin.');
                    }

                    $user->super = $in['super'];
                }

                if (isset($in['email'])) {
                    $email = strtolower($in['email']);

                    if (User::query()->where('email', $email)->where('id', '!=', $user->id)->exists()) {
                        throw AbilityException::conflict('That email address is already used.');
                    }

                    $user->email = $email;
                }

                if (isset($in['name'])) {
                    $user->name = $in['name'];
                }

                if (isset($in['suspended'])) {
                    if ($ctx->user && $user->is($ctx->user)) {
                        throw AbilityException::conflict('You cannot suspend your own account.');
                    }

                    $user->status = $in['suspended'] ? Accounts::SUSPENDED : Accounts::ACTIVE;
                }

                if (isset($in['data'])) {
                    $this->cms->app()->make(UserFields::class)->fill($user, $in['data']);
                }

                $user->save();

                return $user->toPublic();
            },
        ]);

        $a->register('users/access', [
            'label' => 'User Access',
            'description' => 'What someone holds beyond their roles (access names the gate on entries compares), who gave it and until when.',
            'permission' => 'users.view',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string']], 'required' => ['id']],
            'output' => Shape::of([['access' => Shape::STRING, 'source' => Shape::STRING, 'expiresAt' => Shape::STRING_OR_NULL]]),
            'handler' => fn (array $in) => array_map(static fn ($g) => $g->toPublic(), $this->cms->accounts()->grants(User::query()->findOrFail($in['id']))),
        ]);

        $a->register('users/grant', [
            'label' => 'Give Access',
            'description' => 'Give someone an access name, optionally until a date. Entries gated on that name open for them.',
            'permission' => 'users.manage',
            'expose' => ['mcp' => false, 'assistant' => false],
            'input' => ['type' => 'object', 'properties' => [
                'id' => ['type' => 'string'],
                'access' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 120],
                'until' => ['type' => ['string', 'null'], 'format' => 'date-time'],
            ], 'required' => ['id', 'access']],
            'output' => Shape::of(['granted?' => Shape::STRING]),
            'handler' => function (array $in) {
                $user = User::query()->findOrFail($in['id']);
                $this->cms->accounts()->grant($user, $in['access'], 'admin', isset($in['until']) ? new \DateTimeImmutable($in['until']) : null);

                return $this->cms->accounts()->grants($user) ? ['granted' => $in['access']] : [];
            },
        ]);

        $a->register('users/revoke', [
            'label' => 'Take Access Away',
            'description' => 'Remove an access name from someone, whoever gave it.',
            'permission' => 'users.manage',
            'expose' => ['mcp' => false, 'assistant' => false],
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string'], 'access' => ['type' => 'string', 'maxLength' => 120]], 'required' => ['id', 'access']],
            'output' => Shape::of(['revoked' => Shape::STRING]),
            // Taking away what someone does not hold changes nothing.
            'dryRun' => function (array $in): array {
                $user = User::query()->findOrFail($in['id']);
                $held = count(array_filter($this->cms->accounts()->grants($user), static fn ($grant) => $grant->access === $in['access']));

                return $held === 0 ? [] : [['action' => 'revoke', 'type' => 'access', 'access' => $in['access'], 'userId' => $user->id, 'name' => $user->name, 'removes' => ['grants' => $held]]];
            },
            'handler' => function (array $in) {
                $this->cms->accounts()->revoke(User::query()->findOrFail($in['id']), $in['access']);

                return ['revoked' => $in['access']];
            },
        ]);

        $a->register('user-fields/save', [
            'label' => 'Save User Profile Fields',
            'description' => 'Replace the fields of user profiles. Values of removed fields stay stored.',
            'permission' => 'collections.manage',
            'input' => ['type' => 'object', 'properties' => ['fields' => ['type' => 'array', 'items' => ['type' => 'object']]], 'required' => ['fields']],
            'output' => Shape::of(['fields' => [Shapes::field()]]),
            'handler' => function (array $in) {
                $this->cms->app()->make(UserFields::class)->save($in['fields']);

                return ['fields' => $this->cms->app()->make(UserFields::class)->stored()];
            },
        ]);

        // The person a delete is for, refused where the delete is.
        $deletable = function (array $in, AbilityContext $ctx): User {
            $user = User::query()->findOrFail($in['id']);

            if ($ctx->user && $user->is($ctx->user)) {
                throw AbilityException::conflict('You cannot delete your own account here.');
            }

            if ($user->super && User::query()->where('super', true)->count() <= 1) {
                throw AbilityException::conflict('There must be at least one super admin.');
            }

            return $user;
        };

        $a->register('users/delete', [
            'label' => 'Delete User',
            'permission' => 'users.manage',
            'description' => 'Remove a user. Their content stays.',
            'expose' => ['mcp' => false, 'assistant' => false],
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string']], 'required' => ['id']],
            'answer' => static fn (array $gone) => Answers::done(__('Deleted :name', ['name' => $gone['name'] ?? ''])),
            'output' => Shape::of(['deleted' => Shape::STRING, 'name' => Shape::STRING]),
            'dryRun' => function (array $in, AbilityContext $ctx) use ($deletable): array {
                $user = $deletable($in, $ctx);

                return [['action' => 'delete', 'type' => 'user', 'id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'removes' => [
                    'tokens' => $user->tokens()->count(), 'access' => count($this->cms->accounts()->grants($user)),
                ]]];
            },
            'handler' => function (array $in, AbilityContext $ctx) use ($deletable) {
                $user = $deletable($in, $ctx);
                $name = $user->name;
                $this->cms->accounts()->erase($user);

                return ['deleted' => $in['id'], 'name' => $name];
            },
        ]);

        $a->register('users/invite', [
            'label' => 'Resend Invitation',
            'permission' => 'users.manage',
            'description' => 'Email a user a link to set their password.',
            'expose' => ['mcp' => false, 'assistant' => false],
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string']], 'required' => ['id']],
            'answer' => static fn (mixed $sent, array $in) => Answers::done(__('Invitation sent'), User::query()->find($in['id'])?->email, [
                ['label' => __('Open'), 'icon' => 'arrow-right', 'variant' => 'primary', 'to' => '/users/'.$in['id']],
            ]),
            'output' => Shape::of(['sent' => Shape::BOOLEAN]),
            'handler' => function (array $in, AbilityContext $ctx) {
                $this->invite(User::query()->findOrFail($in['id']), $ctx->user);

                return ['sent' => true];
            },
        ]);

        $a->register('roles/list', [
            'label' => 'List Roles',
            'permission' => 'users.view',
            'description' => 'Roles with their permissions, plus every known permission grouped. Change roles with settings/update (namespace "roles").',
            'annotations' => ['readOnly' => true],
            'output' => Shape::of([
                'roles' => Shape::map(['label' => Shape::STRING, 'description' => Shape::STRING, 'permissions' => [Shape::STRING]]),
                'permissions' => Shape::map([['name' => Shape::STRING, 'label' => Shape::STRING, 'description' => Shape::STRING, 'trusted' => Shape::BOOLEAN]]),
                'people' => Shape::map(Shape::INTEGER),
            ]),
            'handler' => function () {
                $t = app(\Cms\Admin\Translations::class);
                $permissions = [];
                $grouped = $this->cms->permissions()->grouped();
                // In the order people look for them: the admin, content and each collection, what the site
                // has, then who and how. Groups no one listed here go before Users, by name.
                $order = ['General', 'Content', 'Media', 'Navigation', 'Forms', 'Comments', 'Site', 'Design', 'Assistant', 'Analytics'];
                $last = ['Users', 'System'];
                $rank = static function (string $group, array $items) use ($order, $last): array {
                    $collection = str_starts_with((string) ($items[0]['name'] ?? ''), 'entries.');

                    return match (true) {
                        $collection => [1, 1, $group],
                        in_array($group, $order, true) => [array_search($group, $order, true) < 2 ? 0 : 2, array_search($group, $order, true), ''],
                        in_array($group, $last, true) => [4, array_search($group, $last, true), ''],
                        default => [3, 0, $group],
                    };
                };
                uksort($grouped, static fn ($a, $b) => $rank((string) $a, $grouped[$a]) <=> $rank((string) $b, $grouped[$b]));

                foreach ($grouped as $group => $items) {
                    $permissions[$t->label($group)] = array_map(static fn ($p) => [...$p, 'label' => $t->label($p['label']), 'description' => $t->label($p['description'])], $items);
                }

                $roles = $this->cms->roles()->all();
                // How many people hold each role, for the roles editor.
                $people = [];

                foreach (array_keys($roles) as $role) {
                    $people[$role] = User::query()->whereJsonContains('roles', $role)->count();
                }

                return ['roles' => $roles, 'permissions' => $permissions, 'people' => $people];
            },
        ]);
    }

    private function assertRoles(array $roles): void
    {
        $known = array_keys($this->cms->roles()->all());

        foreach ($roles as $role) {
            if (! in_array($role, $known, true)) {
                throw AbilityException::invalid(__('Unknown role “:role”.', ['role' => $role]));
            }
        }
    }

    private function invite(User $user, ?User $by): void
    {
        $token = Password::broker('invites')->createToken($user);
        $link = url('/admin/reset?'.http_build_query(['token' => $token, 'email' => $user->email, 'invite' => 1]));
        $site = (string) config('app.name');
        $from = $by?->name ?? $site;

        // In the invitee's language when they have one, else the admin's default.
        $locale = app(\Cms\Admin\Translations::class)->locale($user);
        $invited = __(':name invited you to edit :site.', ['name' => $from, 'site' => $site], $locale);

        app(Mailer::class)->send(new Message(
            to: $user->email,
            subject: __('You’re invited to :site', ['site' => $site], $locale),
            html: '<p>'.e($invited).'</p><p><a href="'.e($link).'">'.e(__('Set your password', [], $locale)).'</a></p><p>'.e(__('The link is valid for 7 days.', [], $locale)).'</p>',
            text: $invited."\n".__('Set your password: :link', ['link' => $link], $locale),
            tag: 'invite',
        ));
    }
}

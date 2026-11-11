<?php

declare(strict_types=1);

namespace Cms\Modules\Account;

use Cms\Abilities\Ability;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator as LaravelValidator;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Cms;
use Cms\Users\ApiToken;
use Cms\Users\Passwords;
use Cms\Users\Totp;
use Cms\Users\User;
use Cms\Users\UserFields;
use Cms\Abilities\Shapes;
use Cms\Support\Schema\Shape;

/** The signed-in person's own account and API tokens. */
final class AccountAbilities
{
    public function __construct(private readonly Cms $cms) {}

    public function register(AbilityRegistry $a): void
    {
        $this->account($a);
        $this->sessions($a);
        $this->tokens($a);

        // Everyone's own account page shows these, with or without the Users module.
        $a->register('user-fields/get', [
            'label' => 'User Profile Fields',
            'description' => 'The fields every user profile has beyond name and email (content/users.yaml), as stored and resolved.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'output' => Shape::of(['title' => Shape::STRING, 'fields' => [Shapes::field()], 'resolvedFields' => [Shapes::field()], 'settings' => [Shapes::field()]]),
            'handler' => fn () => [
                'title' => 'Users',
                'fields' => $this->cms->app()->make(UserFields::class)->stored(),
                'resolvedFields' => $this->cms->app()->make(UserFields::class)->blueprint()->toArray(),
                'settings' => [],
            ],
        ]);
    }

    private function account(AbilityRegistry $a): void
    {
        $signedIn = static fn (?User $user) => $user !== null;

        $a->register('account/get', [
            'label' => 'My Account',
            'description' => 'The signed-in user.',
            'permission' => $signedIn,
            'annotations' => ['readOnly' => true],
            'output' => Shapes::user()->with(['preferences' => Shape::open('What the admin remembers for this person, by key (theme, the arrangement of their home screen, a list\'s columns…): the admin and plugins choose the keys, saved with account/update.')]),
            'handler' => fn (array $in, AbilityContext $ctx) => [...$ctx->user->toPublic(), 'preferences' => $ctx->user->preferences ?? (object) []],
        ]);

        $a->register('account/update', [
            'label' => 'Update My Account',
            'description' => 'Change name, email, locale, preferences, profile fields (data) or password (password changes need the current password).',
            'permission' => $signedIn,
            'expose' => ['mcp' => false, 'assistant' => false],
            'input' => ['type' => 'object', 'properties' => [
                'name' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 120],
                'email' => ['type' => 'string', 'format' => 'email'],
                'locale' => ['type' => ['string', 'null']],
                'avatar' => ['type' => ['string', 'null'], 'maxLength' => 512],
                'preferences' => ['type' => 'object'],
                'data' => ['type' => 'object', 'description' => 'Profile fields (see user-fields/get).'],
                'currentPassword' => ['type' => 'string'],
                'password' => ['type' => 'string'],
            ]],
            'output' => Shapes::user(),
            'handler' => function (array $in, AbilityContext $ctx) {
                $user = $ctx->user;

                if (isset($in['password']) || (isset($in['email']) && strtolower($in['email']) !== $user->email)) {
                    if (! Hash::check((string) ($in['currentPassword'] ?? ''), $user->password)) {
                        throw AbilityException::invalid('Your current password is not correct.', ['currentPassword' => __('Is incorrect.')]);
                    }
                }

                if (isset($in['password'])) {
                    // An empty one is no password.
                    LaravelValidator::make($in, ['password' => ['required', ...Passwords::rules()]])->validate();
                    $user->password = $in['password'];
                }

                if (isset($in['email'])) {
                    $email = strtolower($in['email']);

                    if (User::query()->where('email', $email)->where('id', '!=', $user->id)->exists()) {
                        throw AbilityException::conflict('That email address is already used.');
                    }

                    $user->email = $email;
                }

                foreach (['name', 'locale', 'avatar'] as $key) {
                    if (array_key_exists($key, $in)) {
                        $user->{$key} = $in[$key];
                    }
                }

                if (isset($in['preferences'])) {
                    // Saved views are kept under `views` by their own abilities (saved-views/…), which check them: not written from here.
                    $user->preferences = array_replace((array) ($user->preferences ?? []), array_diff_key($in['preferences'], ['views' => true]));
                }

                if (isset($in['data'])) {
                    $this->cms->app()->make(UserFields::class)->fill($user, $in['data']);
                }

                $user->save();

                return $user->toPublic();
            },
        ]);

        $a->register('account/two-factor-setup', [
            'label' => 'Start Two-Factor Setup',
            'description' => 'Generate a TOTP secret. Confirm with account/two-factor-confirm.',
            'permission' => $signedIn,
            'expose' => Ability::ADMIN_ONLY,
            'output' => Shape::of(['secret' => Shape::STRING, 'uri' => Shape::STRING]),
            'handler' => function (array $in, AbilityContext $ctx) {
                $secret = Totp::secret();
                $ctx->user->forceFill(['two_factor_secret' => $secret, 'two_factor_confirmed_at' => null])->save();

                return ['secret' => $secret, 'uri' => Totp::uri($secret, $ctx->user->email, (string) config('app.name'))];
            },
        ]);

        $a->register('account/two-factor-confirm', [
            'label' => 'Confirm Two-Factor',
            'description' => 'Verify a code from the authenticator app and enable two-factor sign-in.',
            'permission' => $signedIn,
            'expose' => Ability::ADMIN_ONLY,
            'input' => ['type' => 'object', 'properties' => ['code' => ['type' => 'string', 'maxLength' => 12]], 'required' => ['code']],
            'output' => Shape::of(['enabled' => Shape::BOOLEAN, 'recoveryCodes' => [Shape::STRING]]),
            'handler' => function (array $in, AbilityContext $ctx) {
                $user = $ctx->user;

                if (! $user->two_factor_secret || ! Totp::verify($user->two_factor_secret, $in['code'])) {
                    throw AbilityException::invalid('That code is not valid. Check the time on your device and try again.');
                }

                $codes = Totp::recoveryCodes();
                $user->forceFill(['two_factor_confirmed_at' => now(), 'two_factor_recovery_codes' => $codes])->save();

                return ['enabled' => true, 'recoveryCodes' => $codes];
            },
        ]);

        $a->register('account/two-factor-disable', [
            'label' => 'Disable Two-Factor',
            'description' => 'Turn off two-factor sign-in (needs your password).',
            'permission' => $signedIn,
            'expose' => Ability::ADMIN_ONLY,
            'input' => ['type' => 'object', 'properties' => ['password' => ['type' => 'string']], 'required' => ['password']],
            'output' => Shape::of(['enabled' => Shape::BOOLEAN]),
            'handler' => function (array $in, AbilityContext $ctx) {
                if (! Hash::check($in['password'], $ctx->user->password)) {
                    throw AbilityException::invalid('Your password is not correct.', ['password' => 'Is incorrect.']);
                }

                $ctx->user->forceFill(['two_factor_secret' => null, 'two_factor_confirmed_at' => null, 'two_factor_recovery_codes' => null])->save();

                return ['enabled' => false];
            },
        ]);
    }

    /** Where the signed-in person is signed in, and signing out there. Only from the admin: a token has no session to keep. */
    private function sessions(AbilityRegistry $a): void
    {
        $signedIn = static fn (?User $user) => $user !== null;
        $sessions = fn () => $this->cms->app()->make(Sessions::class);

        $a->register('sessions/list', [
            'label' => 'Where I Am Signed In',
            'description' => 'Your sessions: the browser and system each was opened on, where from, when you signed in and when it was last used. `current` is the one this request runs in.',
            'permission' => $signedIn,
            'expose' => Ability::ADMIN_ONLY,
            'annotations' => ['readOnly' => true],
            'output' => Shape::of([['id' => Shape::STRING, 'device' => Shape::STRING, 'ip' => Shape::STRING_OR_NULL, 'signedInAt' => Shape::STRING_OR_NULL, 'lastActiveAt' => Shape::STRING_OR_NULL, 'current' => Shape::BOOLEAN, 'currentLabel' => Shape::STRING_OR_NULL]]),
            'handler' => fn (array $in, AbilityContext $ctx) => $sessions()->of($ctx->user),
        ]);

        $a->register('sessions/delete', [
            'label' => 'Sign Out',
            'description' => 'Sign yourself out of one session (`id`, from sessions/list), or of every one but this (`others: true`), which also ends "keep me signed in" on every browser. The session this request runs in is never ended here.',
            'permission' => $signedIn,
            'expose' => Ability::ADMIN_ONLY,
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string', 'maxLength' => 64], 'others' => ['type' => 'boolean', 'const' => true]]],
            'output' => Shape::of(['ended' => Shape::INTEGER]),
            'dryRun' => function (array $in, AbilityContext $ctx) use ($sessions) {
                $list = array_filter($sessions()->of($ctx->user), static fn ($s) => ! $s['current'] && (isset($in['others']) || $s['id'] === ($in['id'] ?? null)));
                self::oneOrOthers($in, $list);

                return array_values(array_map(static fn ($s) => ['action' => 'delete', 'type' => 'session', 'id' => $s['id'], 'title' => $s['device']], $list));
            },
            'handler' => function (array $in, AbilityContext $ctx) use ($sessions) {
                self::oneOrOthers($in, array_filter($sessions()->of($ctx->user), static fn ($s) => ! $s['current'] && (isset($in['others']) || $s['id'] === ($in['id'] ?? null))));

                return ['ended' => $sessions()->end($ctx->user, isset($in['others']) ? null : [$in['id']])];
            },
        ]);
    }

    /** Exactly one of `id` and `others`, and an `id` that is one of your other sessions, where sessions can be read at all. */
    private static function oneOrOthers(array $in, array $found): void
    {
        if (! Sessions::listable()) {
            throw AbilityException::invalid('This site keeps its sessions where they can’t be listed (its session driver), so you can’t sign out of them here. Changing your password signs you out everywhere.');
        }

        if (isset($in['id']) === isset($in['others'])) {
            throw AbilityException::invalid('Name one session (id) or all the others (others: true).');
        }

        if (isset($in['id']) && $found === []) {
            throw AbilityException::invalid('That is not one of your other sessions.', ['id' => 'Is not one of your other sessions.']);
        }
    }

    private function tokens(AbilityRegistry $a): void
    {
        $a->register('tokens/list', [
            'label' => 'My API Tokens',
            'permission' => 'tokens.manage',
            'description' => 'Personal access tokens for the REST API and MCP.',
            'annotations' => ['readOnly' => true],
            'expose' => ['mcp' => false, 'assistant' => false],
            'output' => Shape::of([self::token()]),
            'handler' => fn (array $in, AbilityContext $ctx) => $ctx->user->tokens()->latest()->get()->map(static fn (ApiToken $t) => $t->toPublic())->all(),
        ]);

        $a->register('tokens/create', [
            'label' => 'Create API Token',
            'permission' => 'tokens.manage',
            'description' => 'Create a personal access token. Scopes are ability patterns (e.g. "entries/*", "read" for all read-only abilities, "*" for everything). The token is shown once.',
            'expose' => Ability::ADMIN_ONLY,
            'input' => ['type' => 'object', 'properties' => [
                'name' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 120],
                'scopes' => ['type' => 'array', 'items' => ['type' => 'string', 'maxLength' => 120], 'default' => ['*']],
                'expiresInDays' => ['type' => ['integer', 'null'], 'minimum' => 1, 'maximum' => 3650],
            ], 'required' => ['name']],
            'output' => self::token()->with(['token' => Shape::STRING]),
            'handler' => function (array $in, AbilityContext $ctx) {
                [$token, $plain] = ApiToken::issue($ctx->user, $in['name'], $in['scopes'], isset($in['expiresInDays']) ? now()->addDays($in['expiresInDays']) : null);

                return [...$token->toPublic(), 'token' => $plain];
            },
        ]);

        // The token a revoke is for, among the person's own.
        $mine = static fn (array $in, AbilityContext $ctx) => $ctx->user->tokens()->whereKey($in['id']);

        $a->register('tokens/delete', [
            'label' => 'Revoke API Token',
            'permission' => 'tokens.manage',
            'description' => 'Delete one of your tokens.',
            'expose' => ['mcp' => false, 'assistant' => false],
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string']], 'required' => ['id']],
            'output' => Shape::of(['revoked' => Shape::STRING]),
            // Only your own tokens: one that is not yours, or is gone, is nothing to revoke.
            'dryRun' => fn (array $in, AbilityContext $ctx): array => $mine($in, $ctx)->get()->map(static fn (ApiToken $token) => ['action' => 'revoke', 'type' => 'token', 'id' => (string) $token->getKey(), 'name' => $token->name])->all(),
            'handler' => function (array $in, AbilityContext $ctx) use ($mine) {
                $mine($in, $ctx)->delete();

                return ['revoked' => $in['id']];
            },
        ]);
    }

    /** ApiToken::toPublic(): a token without its secret. */
    private static function token(): Shape
    {
        return Shape::of([
            'id' => Shape::STRING, 'name' => Shape::STRING, 'scopes' => [Shape::STRING],
            'lastUsedAt' => Shape::STRING_OR_NULL, 'expiresAt' => Shape::STRING_OR_NULL, 'createdAt' => Shape::STRING_OR_NULL,
        ]);
    }
}

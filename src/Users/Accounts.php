<?php

declare(strict_types=1);

namespace Cms\Users;

use DateTimeInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Cms\Cms;
use Cms\Modules\Email\Mailer;
use Cms\Extend\Hooks;

/**
 * Accounts as other plugins use them, through `cms()->accounts()`: who is signed in, what they
 * hold, and how to give them more. A site visitor is a user with no admin access. This is in the
 * core so a plugin needs no other package to use accounts, and it answers sensibly when the
 * site has public accounts off: nobody signs up, and a grant waits until someone can sign in.
 */
final class Accounts
{
    public const string SETTINGS = 'accounts';

    public const string ACTIVE = 'active';

    /** Made by a plugin or an import: no password yet, signs in after proving the mailbox. */
    public const string INVITED = 'invited';

    public const string SUSPENDED = 'suspended';

    private const string SESSION_HASH = 'account.hash';

    /** @var array<string, list<string>> user id => what they hold right now */
    private array $held = [];

    public function __construct(private readonly Cms $cms, private readonly Hooks $hooks) {}

    /** Whether this site has public sign-in and account pages. Off until a site turns it on. */
    public function enabled(): bool
    {
        return (bool) $this->cms->settings(self::SETTINGS, 'enabled', false);
    }

    /** Whether a stranger can create an account right now: it needs a working mailbox. */
    public function signUpOpen(): bool
    {
        return $this->enabled() && $this->cms->settings(self::SETTINGS, 'sign_up', 'open') === 'open' && $this->canMail();
    }

    public function canMail(): bool
    {
        return $this->cms->app()->make(Mailer::class)->configured();
    }

    /**
     * The person this request belongs to, or null. A suspended account, or a session from before
     * the password changed, is signed out here, so everything public goes through this.
     */
    public function current(): ?User
    {
        $user = Auth::user();

        if (! $user instanceof User) {
            return null;
        }

        if (($user->status ?? self::ACTIVE) !== self::ACTIVE) {
            $this->signOut();

            return null;
        }

        if ($this->isVisitor($user) && request()->hasSession()) {
            $session = request()->session();
            $key = self::SESSION_HASH.'.'.$user->getKey();
            $hash = $this->sessionHash($user);

            if ($session->has($key) && ! hash_equals((string) $session->get($key), $hash)) {
                $this->signOut();

                return null;
            }

            $session->put($key, $hash);
        }

        return $user;
    }

    /** Whether this account has no way into the admin: the accounts the public pages are for. */
    public function isVisitor(User $user): bool
    {
        return ! $user->hasPermission('admin.access');
    }

    /** Remember this browser's session as the valid one, after the password or address changed. */
    public function touchSession(User $user): void
    {
        if (request()->hasSession()) {
            request()->session()->put(self::SESSION_HASH.'.'.$user->getKey(), $this->sessionHash($user));
        }
    }

    public function signOut(): void
    {
        Auth::guard('web')->logout();

        if (request()->hasSession()) {
            request()->session()->forget(self::SESSION_HASH);
        }
    }

    public function find(string $email): ?User
    {
        return User::query()->where('email', self::email($email))->first();
    }

    /**
     * The account for this address, made if there is none, with nothing sent. For a plugin that
     * has to attach something to a buyer who has not signed up yet. They get in through sign-up
     * or a password reset, which prove the mailbox.
     */
    public function ensure(string $email, ?string $name = null, ?string $locale = null): User
    {
        $email = self::email($email);

        if ($user = User::query()->where('email', $email)->first()) {
            return $user;
        }

        $user = new User(['name' => self::clean($name ?? '') ?: Str::before($email, '@'), 'email' => $email, 'password' => bin2hex(random_bytes(32)), 'roles' => $this->visitorRoles(), 'locale' => $locale]);
        $user->status = self::INVITED;
        $user->save();
        $this->hooks->dispatch('account.created', $user);

        return $user;
    }

    /** Whether they have this role or a live grant of this name. */
    public function holds(User $user, string $access): bool
    {
        return in_array($access, $this->held($user), true);
    }

    /** @param list<string> $access */
    public function holdsAny(User $user, array $access): bool
    {
        return array_intersect($access, $this->held($user)) !== [];
    }

    /** Give access, optionally until a date. Giving it again from the same source moves the date. */
    public function grant(User $user, string $access, ?string $source = null, ?DateTimeInterface $until = null): void
    {
        $grant = AccountGrant::query()->firstOrNew(['user_id' => $user->getKey(), 'access' => $access, 'source' => (string) $source]);
        $grant->expires_at = $until;
        $grant->save();
        unset($this->held[$user->getKey()]);
        $this->hooks->dispatch('account.granted', $user, $access, (string) $source);
    }

    /** Take it away. With a source, only what that source gave. */
    public function revoke(User $user, string $access, ?string $source = null): void
    {
        AccountGrant::query()->where('user_id', $user->getKey())->where('access', $access)->when($source !== null, static fn ($q) => $q->where('source', $source))->delete();
        unset($this->held[$user->getKey()]);
        $this->hooks->dispatch('account.revoked', $user, $access, (string) $source);
    }

    /** @return list<AccountGrant> */
    public function grants(User $user): array
    {
        return AccountGrant::query()->where('user_id', $user->getKey())->orderBy('access')->get()->all();
    }

    /** The roles a new visitor gets: never one that opens the admin. */
    public function visitorRoles(): array
    {
        $role = (string) $this->cms->settings(self::SETTINGS, 'default_role', 'member');
        $definition = $this->cms->roles()->all()[$role] ?? null;

        return $definition && ! self::opensAdmin($definition['permissions']) ? [$role] : [];
    }

    /** @return list<string> Roles that open the admin. */
    public function teamRoles(): array
    {
        return array_keys(array_filter($this->cms->roles()->all(), static fn (array $role) => self::opensAdmin($role['permissions'])));
    }

    /** Reasons this account can't be deleted now, from the plugins that hold something of theirs. */
    public function deleteBlockers(User $user): array
    {
        return array_values(array_filter((array) $this->hooks->filter('account.delete.blockers', [], $user)));
    }

    /**
     * Erase an account. Plugins delete or anonymise their data on `account.deleting`, inside the
     * transaction: one that throws keeps the account as it was.
     */
    public function erase(User $user): void
    {
        $id = (string) $user->getKey();

        DB::transaction(function () use ($user): void {
            $this->hooks->dispatch('account.deleting', $user);
            AccountGrant::query()->where('user_id', $user->getKey())->delete();
            AccountToken::query()->where('user_id', $user->getKey())->orWhere('email', $user->email)->delete();
            $user->delete();
        });

        unset($this->held[$id]);
        $this->hooks->dispatch('account.deleted', $id);
    }

    /** Where to send someone to sign in, and back here afterwards. Null when accounts are off. */
    public function signInUrl(?string $next = null, ?string $locale = null): ?string
    {
        if (! $this->enabled()) {
            return null;
        }

        return $this->pathOf('sign-in', $locale).($next !== null && self::safePath($next) ? '?next='.rawurlencode($next) : '');
    }

    /** A public account page's path, in the language asked for. Plugins add pages through `account.screens`. */
    public function pathOf(string $screen, ?string $locale = null): string
    {
        return (string) $this->hooks->filter('account.url', '/'.$screen, $screen, $locale);
    }

    /** Only a path on this site: `//evil.example` and `/\evil.example` go somewhere else. */
    public static function safePath(?string $path): bool
    {
        return is_string($path) && preg_match('#^/(?![/\\\\])[^\x00-\x1f\\\\]*$#D', $path) === 1;
    }

    public static function email(string $email): string
    {
        return strtolower(trim($email));
    }

    /** Text a stranger typed: stays plain wherever a design shows it. */
    public static function clean(string $text): string
    {
        return trim(strip_tags($text));
    }

    /** @return list<string> */
    private function held(User $user): array
    {
        return $this->held[$user->getKey()] ??= array_values(array_unique([
            ...array_map('strval', (array) ($user->roles ?? [])),
            ...AccountGrant::query()->where('user_id', $user->getKey())->live()->pluck('access')->all(),
        ]));
    }

    private function sessionHash(User $user): string
    {
        return hash_hmac('sha256', $user->getAuthPassword().'|'.$user->email, (string) config('app.key'));
    }

    /** @param list<string> $permissions */
    private static function opensAdmin(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($permission === '*' || $permission === 'admin.access' || Str::is($permission, 'admin.access')) {
                return true;
            }
        }

        return false;
    }
}

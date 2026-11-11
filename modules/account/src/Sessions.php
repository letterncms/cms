<?php

declare(strict_types=1);

namespace Cms\Modules\Account;

use Illuminate\Auth\SessionGuard;
use Illuminate\Session\EncryptedStore;
use Illuminate\Session\Store;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Cms\Users\User;
use Throwable;

/**
 * Where someone is signed in: every session of theirs, from the session store itself, so it works with the
 * file sessions a site has by default and with database sessions. What a session was opened on (the browser,
 * where from, when) is kept in it at sign-in. Its id never leaves the server: a session is named by a keyed
 * hash of it.
 */
final class Sessions
{
    /** Kept in a session at sign-in: the browser's own words, the address, and when. */
    public const string DEVICE = 'cms_device';

    /** @return list<array{id: string, device: string, ip: ?string, signedInAt: ?string, lastActiveAt: ?string, current: bool, currentLabel: ?string}> this one first, then by last use */
    public function of(User $user): array
    {
        $current = $this->current();
        $list = [];

        foreach ($this->ids() as $id => $active) {
            $store = $this->store($id);

            if ((string) $store?->get(self::key()) !== (string) $user->getKey()) {
                continue;
            }

            $device = (array) $store->get(self::DEVICE, []);

            // Opened before sessions said what they were opened on: nothing to name it by. Sign Out Everywhere Else ends it too.
            if ($device === [] && $id !== $current) {
                continue;
            }
            $list[] = [
                'id' => $this->publicId($id),
                'device' => self::name((string) ($device['agent'] ?? '')),
                'ip' => is_string($device['ip'] ?? null) ? $device['ip'] : null,
                'signedInAt' => is_int($device['since'] ?? null) ? Carbon::createFromTimestamp($device['since'])->toIso8601String() : null,
                'lastActiveAt' => $active ? Carbon::createFromTimestamp($active)->toIso8601String() : null,
                'current' => $id === $current,
                'currentLabel' => $id === $current ? __('This Device') : null,
            ];
        }

        usort($list, static fn ($a, $b) => [$b['current'], $b['lastActiveAt']] <=> [$a['current'], $a['lastActiveAt']]);

        return $list;
    }

    /** Whether the site's sessions can be listed: kept in files or the database, not in redis, a cookie or memory. */
    public static function listable(): bool
    {
        return in_array(config('session.driver'), ['file', 'database'], true);
    }

    /**
     * Signs the person out of the sessions named (their public ids), or of every one but this one. Returns
     * how many went. Every sign-out also gives the account a new "keep me signed in" token, or the browser
     * signed out would come back with the one it kept; this browser gets the new one, if it kept one.
     *
     * @param  list<string>|null  $ids  null: every session but the current one
     */
    public function end(User $user, ?array $ids): int
    {
        $current = $this->current();
        $ended = 0;

        foreach (array_keys($this->ids()) as $id) {
            if ($id === $current || ($ids !== null && ! in_array($this->publicId($id), $ids, true))) {
                continue;
            }

            if ((string) $this->store($id)?->get(self::key()) === (string) $user->getKey()) {
                app('session')->driver()->getHandler()->destroy($id);
                $ended++;
            }
        }

        if ($ended > 0 || $ids === null) {
            $user->forceFill(['remember_token' => Str::random(60)])->saveQuietly();
            $this->rememberHere($user);
        }

        return $ended;
    }

    /** This browser keeps its "keep me signed in", with the account's new token, when it had one. */
    private function rememberHere(User $user): void
    {
        try {
            $guard = Auth::guard('web');
            $request = request();

            if (! $guard instanceof SessionGuard || ! $request->cookies->has($guard->getRecallerName())) {
                return;
            }

            $guard->getCookieJar()->queue($guard->getCookieJar()->forever($guard->getRecallerName(), $user->getAuthIdentifier().'|'.$user->getRememberToken().'|'.$user->getAuthPassword()));
        } catch (Throwable) {
        }
    }

    /** At sign-in: what this session is opened on. */
    public static function remember(Store $session, ?string $agent, ?string $ip): void
    {
        $session->put(self::DEVICE, ['agent' => mb_substr((string) $agent, 0, 300), 'ip' => $ip, 'since' => time()]);
    }

    /** "Chrome on macOS", from what the browser says it is; "Unknown Device" when it says nothing we know. */
    public static function name(string $agent): string
    {
        $browser = match (true) {
            str_contains($agent, 'Edg/') => 'Edge',
            str_contains($agent, 'OPR/') => 'Opera',
            str_contains($agent, 'Firefox/') => 'Firefox',
            str_contains($agent, 'Chrome/') || str_contains($agent, 'CriOS/') => 'Chrome',
            str_contains($agent, 'Safari/') => 'Safari',
            default => null,
        };
        $system = match (true) {
            str_contains($agent, 'iPhone') => 'iPhone',
            str_contains($agent, 'iPad') => 'iPad',
            str_contains($agent, 'Android') => 'Android',
            str_contains($agent, 'CrOS') => 'ChromeOS',
            str_contains($agent, 'Mac OS X') || str_contains($agent, 'Macintosh') => 'macOS',
            str_contains($agent, 'Windows') => 'Windows',
            str_contains($agent, 'Linux') => 'Linux',
            default => null,
        };

        return match (true) {
            $browser !== null && $system !== null => __(':browser on :system', ['browser' => $browser, 'system' => $system]),
            $browser !== null || $system !== null => (string) ($browser ?? $system),
            default => __('Unknown Device'),
        };
    }

    /** The session this request runs in, when it has one (the admin's; not a token's). */
    private function current(): ?string
    {
        try {
            $request = request();

            return $request->hasSession() ? $request->session()->getId() : null;
        } catch (Throwable) {
            return null;
        }
    }

    private function publicId(string $id): string
    {
        return substr(hash_hmac('sha256', $id, (string) config('app.key')), 0, 20);
    }

    private static function key(): string
    {
        return 'login_web_'.sha1(SessionGuard::class);
    }

    /** @return array<string, ?int> session id => when it was last used (a timestamp) */
    private function ids(): array
    {
        try {
            return match (config('session.driver')) {
                'file' => (static function (): array {
                    $dir = (string) config('session.files');
                    $out = [];
                    foreach (scandir($dir) ?: [] as $file) {
                        if (preg_match('/^[A-Za-z0-9]{40}$/', $file) === 1) {
                            $out[$file] = @filemtime($dir.'/'.$file) ?: null;
                        }
                    }

                    return $out;
                })(),
                'database' => Schema::hasTable($table = (string) config('session.table', 'sessions'))
                    ? DB::table($table)->whereNotNull('user_id')->pluck('last_activity', 'id')->map(static fn ($t) => $t === null ? null : (int) $t)->all()
                    : [],
                default => [],
            };
        } catch (Throwable) {
            return [];
        }
    }

    /** A session as its store reads it, without touching the one this request is in. */
    private function store(string $id): ?Store
    {
        try {
            $handler = app('session')->driver()->getHandler();
            $store = config('session.encrypt') ? new EncryptedStore('cms_sessions', $handler, app('encrypter')) : new Store('cms_sessions', $handler);
            $store->setId($id);
            $store->start();

            return $store;
        } catch (Throwable) {
            return null;
        }
    }
}

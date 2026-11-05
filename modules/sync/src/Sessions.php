<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use Illuminate\Auth\SessionGuard;
use Illuminate\Session\EncryptedStore;
use Illuminate\Session\Store;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

/**
 * Keeps whoever is signed in on the receiving site signed in when its people are replaced.
 * Before the swap it notes who each session belongs to, by email. After it, each session points
 * at the account with that email, and someone whose account didn't come across keeps theirs.
 * Works for file and database sessions; other stores sign people out, as a new deploy would.
 */
final class Sessions
{
    /** @var array<string, string> session id => user id, before */
    private array $sessions = [];

    /** @var array<string, array<string, mixed>> user id => their row, before */
    private array $users = [];

    public function before(): void
    {
        foreach ($this->ids() as $id) {
            $user = $this->store($id)?->get(self::key());

            if (is_string($user) && $user !== '') {
                $this->sessions[$id] = $user;
            }
        }

        if ($this->sessions !== []) {
            foreach (DB::table('users')->whereIn('id', array_values(array_unique($this->sessions)))->get() as $row) {
                $this->users[(string) $row->id] = (array) $row;
            }
        }
    }

    /** Inside the swap: put back the signed-in people the other site doesn't have. */
    public function keepAccounts(): void
    {
        $wanted = array_values(array_unique(array_map(static fn ($e) => strtolower((string) $e), array_column($this->users, 'email'))));
        $emails = $wanted === [] ? [] : DB::table('users')->whereRaw('lower(email) in ('.implode(',', array_fill(0, count($wanted), '?')).')', $wanted)->pluck('email')->map(static fn ($e) => strtolower((string) $e))->all();

        foreach ($this->users as $row) {
            if (! in_array(strtolower((string) $row['email']), $emails, true)) {
                $exists = DB::table('users')->where('id', $row['id'])->exists();
                $exists || DB::table('users')->insert($row);
            }
        }
    }

    /** After the swap: every session follows its person to their account here now. */
    public function after(): int
    {
        $kept = 0;

        foreach ($this->sessions as $id => $old) {
            $email = strtolower((string) ($this->users[$old]['email'] ?? ''));
            $user = $email === '' ? null : DB::table('users')->whereRaw('lower(email) = ?', [$email])->first(['id', 'password']);
            $store = $this->store($id);

            if (! $user || ! $store) {
                continue;
            }

            $store->put(self::key(), (string) $user->id);
            $store->has('password_hash_web') && $store->put('password_hash_web', (string) $user->password);
            $store->save();

            if (config('session.driver') === 'database') {
                DB::table((string) config('session.table', 'sessions'))->where('id', $id)->update(['user_id' => (string) $user->id]);
            }

            $kept++;
        }

        return $kept;
    }

    private static function key(): string
    {
        return 'login_web_'.sha1(SessionGuard::class);
    }

    /** @return list<string> */
    private function ids(): array
    {
        try {
            return match (config('session.driver')) {
                'file' => array_values(array_filter(scandir((string) config('session.files')) ?: [], static fn (string $f) => preg_match('/^[A-Za-z0-9]{40}$/', $f) === 1)),
                'database' => Schema::hasTable((string) config('session.table', 'sessions')) ? DB::table((string) config('session.table', 'sessions'))->whereNotNull('user_id')->pluck('id')->map('strval')->all() : [],
                default => [],
            };
        } catch (Throwable) {
            return [];
        }
    }

    private function store(string $id): ?Store
    {
        try {
            $handler = app('session')->driver()->getHandler();
            $store = config('session.encrypt') ? new EncryptedStore('sync', $handler, app('encrypter')) : new Store('sync', $handler);
            $store->setId($id);
            $store->start();

            return $store;
        } catch (Throwable) {
            return null;
        }
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\Collaboration;

use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;
use Cms\Users\User;

/**
 * Who has an entry open, kept in the cache from browser heartbeats (no
 * websockets needed, so it works on shared hosting). People disappear after
 * a missed heartbeat or two.
 *
 * One of them holds the entry: the first who edits it while nobody does, until
 * they leave, stop editing for a while or someone takes it over. The others are
 * told who, so an editor can keep them from writing over each other.
 */
final class Presence
{
    public const int TTL = 45;

    /** A hold lapses once its holder has not edited for this long, though they may still have the entry open. */
    public const int IDLE = 120;

    /** @return list<array{id: string, name: string, initials: string, avatar: ?string, editing: bool, holder: bool, since: int}> Others, not $user */
    public function beat(string $entryId, User $user, bool $editing): array
    {
        return $this->change($entryId, static function (array $people) use ($user, $editing) {
            $now = now()->getTimestamp();
            $me = $people[$user->id] ?? [];
            $edited = $editing ? $now : (int) ($me['edited'] ?? 0);
            $held = array_filter($people, static fn ($p) => $p['id'] !== $user->id && self::holding($p, $now)) !== [];
            $people[$user->id] = [
                ...Comment::person($user), 'editing' => $editing, 'at' => $now, 'since' => $me['since'] ?? $now, 'edited' => $edited,
                // Kept while they go on editing; taken by editing while nobody holds it.
                'holder' => $edited > $now - self::IDLE && (($me['holder'] ?? false) || ($editing && ! $held)),
            ];

            return $people;
        }, $user->id);
    }

    /**
     * $user holds the entry from now on: whoever held it no longer does, and learns so with their next heartbeat.
     *
     * @return list<array{id: string, name: string, initials: string, avatar: ?string, editing: bool, holder: bool, since: int}> Others, not $user
     */
    public function take(string $entryId, User $user): array
    {
        return $this->change($entryId, static function (array $people) use ($user) {
            $now = now()->getTimestamp();
            $people[$user->id] = [...Comment::person($user), 'editing' => $people[$user->id]['editing'] ?? false, 'at' => $now, 'since' => $people[$user->id]['since'] ?? $now, 'edited' => $now, 'holder' => true];

            return array_map(static fn ($p) => [...$p, 'holder' => $p['id'] === $user->id], $people);
        }, $user->id);
    }

    /** Whether $user holds the entry, as of their last heartbeat. */
    public function holds(string $entryId, User $user): bool
    {
        return self::holding($this->present($entryId)[$user->id] ?? [], now()->getTimestamp());
    }

    /** Who holds the entry now, if anyone. */
    public function holder(string $entryId): ?array
    {
        $now = now()->getTimestamp();

        foreach ($this->present($entryId) as $p) {
            if (self::holding($p, $now)) {
                return ['id' => $p['id'], 'name' => $p['name']];
            }
        }

        return null;
    }

    /**
     * Who is editing which of these entries right now: for a list. Someone who only has an entry open, or holds it
     * without having touched it for a while, is not said.
     *
     * @param  list<string>  $entryIds
     * @return array<string, list<array{id: string, name: string}>> by entry id, only entries someone is editing
     */
    public function editing(array $entryIds, ?User $except = null): array
    {
        $out = [];
        $now = now()->getTimestamp();

        foreach ($entryIds === [] ? [] : $this->store()->many(array_map(static fn (string $id) => 'cms-presence:'.$id, $entryIds)) as $key => $people) {
            $editing = array_values(array_filter((array) $people, static fn ($p) => ($p['at'] ?? 0) > $now - self::TTL && ($p['editing'] ?? false) && $p['id'] !== $except?->id));

            if ($editing !== []) {
                $out[substr((string) $key, strlen('cms-presence:'))] = array_map(static fn ($p) => ['id' => $p['id'], 'name' => $p['name']], $editing);
            }
        }

        return $out;
    }

    /** A person's hold stands while they keep editing. */
    private static function holding(array $person, int $now): bool
    {
        return ($person['holder'] ?? false) && ($person['edited'] ?? 0) > $now - self::IDLE;
    }

    /** @return array<string, array<string, mixed>> who is here now, by user id */
    private function present(string $entryId): array
    {
        $now = now()->getTimestamp();

        return array_filter((array) $this->store()->get('cms-presence:'.$entryId, []), static fn ($p) => ($p['at'] ?? 0) > $now - self::TTL);
    }

    public function leave(string $entryId, User $user): void
    {
        $this->change($entryId, static function (array $people) use ($user) {
            unset($people[$user->id]);

            return $people;
        }, $user->id);
    }

    private function change(string $entryId, callable $fn, string $self): array
    {
        $key = 'cms-presence:'.$entryId;
        $people = [];

        // Serialize read-modify-write so simultaneous heartbeats don't drop each other.
        Cache::lock($key.':lock', 5)->block(3, function () use ($key, $fn, &$people) {
            $now = now()->getTimestamp();
            $people = array_filter((array) $this->store()->get($key, []), static fn ($p) => ($p['at'] ?? 0) > $now - self::TTL);
            $people = $fn($people);
            $this->store()->put($key, $people, self::TTL * 2);
        });

        return array_values(array_map(
            static fn ($p) => [...array_diff_key($p, ['at' => 1, 'edited' => 1]), 'holder' => self::holding($p, now()->getTimestamp())],
            array_filter($people, static fn ($p) => $p['id'] !== $self),
        ));
    }

    private function store(): Repository
    {
        return Cache::store();
    }
}

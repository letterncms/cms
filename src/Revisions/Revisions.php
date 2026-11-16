<?php

declare(strict_types=1);

namespace Cms\Revisions;

use Cms\Extend\Hooks;
use Cms\Users\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * The one history of everything that keeps versions: an entry, the site's styling, a file of its code. Each
 * kind of thing registers itself once (`kind()`): who may read its versions, and how one is put back. A version
 * is a snapshot of the whole thing as it was saved, by whom and when.
 *
 * Saves by the same person within ten minutes are one version, so the history stays readable; anything else
 * (a publish, a restore, a save by no one signed in) always adds one. The newest 100 of each thing are kept (the `revisions.keep` filter).
 */
final class Revisions
{
    private const int KEEP = 100;

    private const int COALESCE_SECONDS = 600;

    /** @var array<string, Kind> */
    private array $kinds = [];

    public function __construct(private readonly Hooks $hooks) {}

    /** A kind of thing that keeps versions: `entry`, `styling`, `code`. A plugin adds its own. */
    public function kind(Kind $kind): void
    {
        $this->kinds[$kind->name] = $kind;
    }

    public function kindOf(string $name): ?Kind
    {
        return $this->kinds[$name] ?? null;
    }

    /** @return array<string, Kind> */
    public function kinds(): array
    {
        return $this->kinds;
    }

    /**
     * Keep a version of one thing. `$scope` is what the thing belongs to that a site can be cut by (an entry's
     * collection): sync takes a collection's history with its entries.
     */
    public function record(string $kind, string $subject, string $action, array $snapshot, string $title = '', ?User $user = null, ?string $message = null, ?string $scope = null, ?Carbon $at = null): void
    {
        $json = json_encode($snapshot, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        $title = mb_substr($title, 0, 512);

        if ($action === 'save' && $at === null && $user !== null) {
            $last = $this->query($kind, $subject)->first();

            if ($last && $last->action === 'save' && $last->user_id === $user?->getKey() && $message === null
                && strtotime((string) $last->created_at) > time() - self::COALESCE_SECONDS) {
                DB::table('revisions')->where('id', $last->id)->update(['snapshot' => $json, 'title' => $title, 'created_at' => now()]);

                return;
            }
        }

        DB::table('revisions')->insert([
            'id' => strtolower((string) Str::ulid()),
            'kind' => $kind,
            'subject' => $subject,
            'collection' => $scope,
            'user_id' => $user?->getKey(),
            'action' => $action,
            'title' => $title,
            'snapshot' => $json,
            'message' => $message,
            'created_at' => $at ?? now(),
        ]);

        $this->prune($kind, $subject);
    }

    /** Whether the thing has any version yet. */
    public function has(string $kind, string $subject): bool
    {
        return $this->query($kind, $subject)->exists();
    }

    /** @return list<array{id: string, action: string, title: string, message: ?string, user: ?array, createdAt: string}> newest first */
    public function list(string $kind, string $subject, int $limit = 50): array
    {
        $rows = $this->query($kind, $subject)->limit($limit)->get();
        $users = User::query()->whereIn('id', $rows->pluck('user_id')->filter()->unique())->get()->keyBy('id');

        return $rows->map(static fn ($r) => [
            'id' => $r->id,
            'action' => $r->action,
            'title' => $r->title,
            'message' => $r->message,
            'user' => isset($users[$r->user_id]) ? ['id' => $r->user_id, 'name' => $users[$r->user_id]->name, 'initials' => $users[$r->user_id]->initials()] : null,
            'createdAt' => Carbon::parse($r->created_at)->toIso8601String(),
        ])->values()->all();
    }

    /** @return array{id: string, kind: string, subject: string, action: string, snapshot: mixed, createdAt: string}|null */
    public function find(string $id): ?array
    {
        $row = DB::table('revisions')->where('id', strtolower($id))->first();

        return $row ? [
            'id' => $row->id,
            'kind' => $row->kind,
            'subject' => $row->subject,
            'action' => $row->action,
            'snapshot' => json_decode($row->snapshot, true),
            'createdAt' => Carbon::parse($row->created_at)->toIso8601String(),
        ] : null;
    }

    /** The thing is gone for good: so is its history. */
    public function deleteFor(string $kind, string $subject): void
    {
        DB::table('revisions')->where('kind', $kind)->where('subject', $subject)->delete();
    }

    private function query(string $kind, string $subject): \Illuminate\Database\Query\Builder
    {
        return DB::table('revisions')->where('kind', $kind)->where('subject', $subject)->orderByDesc('created_at')->orderByDesc('id');
    }

    private function prune(string $kind, string $subject): void
    {
        $keep = max(1, (int) $this->hooks->filter('revisions.keep', self::KEEP, $kind));
        $ids = $this->query($kind, $subject)->skip($keep)->take(1000)->pluck('id');

        if ($ids->isNotEmpty()) {
            DB::table('revisions')->whereIn('id', $ids)->delete();
        }
    }
}

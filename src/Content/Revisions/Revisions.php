<?php

declare(strict_types=1);

namespace Cms\Content\Revisions;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Cms\Content\Entries\Entry;
use Cms\Users\User;

/**
 * Entry history. Consecutive saves by the same person within ten minutes are
 * coalesced so history stays readable; publishes and restores always add a row.
 */
final class Revisions
{
    /** Revisions kept per entry unless the `revisions.keep` filter says otherwise. */
    private const int KEEP = 100;

    private const int COALESCE_SECONDS = 600;

    public function record(Entry $entry, string $action, ?User $user = null, ?string $message = null): void
    {
        if (! $entry->collection()->revisions) {
            return;
        }

        $snapshot = json_encode([
            'title' => $entry->title,
            'slug' => $entry->slug,
            'status' => $entry->status,
            'data' => $entry->data,
            'authorId' => $entry->authorId,
            'draft' => $entry->draft,
            'parentId' => $entry->parentId,
            'publishedAt' => $entry->publishedAt?->toIso8601String(),
            'expiresAt' => $entry->expiresAt?->toIso8601String(),
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);

        $title = (string) ($entry->draft['title'] ?? $entry->title);

        if ($action === 'save') {
            $last = DB::table('revisions')->where('entry_id', $entry->id)->orderByDesc('created_at')->orderByDesc('id')->first();

            if ($last && $last->action === 'save' && $last->user_id === $user?->getKey() && $message === null
                && strtotime((string) $last->created_at) > time() - self::COALESCE_SECONDS) {
                DB::table('revisions')->where('id', $last->id)->update(['snapshot' => $snapshot, 'title' => $title, 'created_at' => now()]);

                return;
            }
        }

        DB::table('revisions')->insert([
            'id' => strtolower((string) Str::ulid()),
            'entry_id' => $entry->id,
            'collection' => $entry->collection,
            'user_id' => $user?->getKey(),
            'action' => $action,
            'title' => mb_substr($title, 0, 512),
            'snapshot' => $snapshot,
            'message' => $message,
            'created_at' => now(),
        ]);

        $this->prune($entry->id);
    }

    /** @return list<array> */
    public function list(string $entryId, int $limit = 50): array
    {
        $rows = DB::table('revisions')->where('entry_id', $entryId)->orderByDesc('created_at')->orderByDesc('id')->limit($limit)->get();
        $users = User::query()->whereIn('id', $rows->pluck('user_id')->filter()->unique())->get()->keyBy('id');

        return $rows->map(static fn ($r) => [
            'id' => $r->id,
            'action' => $r->action,
            'title' => $r->title,
            'message' => $r->message,
            'user' => isset($users[$r->user_id]) ? ['id' => $r->user_id, 'name' => $users[$r->user_id]->name, 'initials' => $users[$r->user_id]->initials()] : null,
            'createdAt' => \Illuminate\Support\Carbon::parse($r->created_at)->toIso8601String(),
        ])->all();
    }

    public function find(string $id): ?array
    {
        $row = DB::table('revisions')->where('id', strtolower($id))->first();

        return $row ? ['id' => $row->id, 'entryId' => $row->entry_id, 'action' => $row->action, 'snapshot' => json_decode($row->snapshot, true), 'createdAt' => $row->created_at] : null;
    }

    public function deleteFor(string $entryId): void
    {
        DB::table('revisions')->where('entry_id', $entryId)->delete();
    }

    private function prune(string $entryId): void
    {
        $keep = max(1, (int) app(\Cms\Extend\Hooks::class)->filter('revisions.keep', self::KEEP));
        $ids = DB::table('revisions')->where('entry_id', $entryId)->orderByDesc('created_at')->orderByDesc('id')->skip($keep)->take(1000)->pluck('id');

        if ($ids->isNotEmpty()) {
            DB::table('revisions')->whereIn('id', $ids)->delete();
        }
    }
}

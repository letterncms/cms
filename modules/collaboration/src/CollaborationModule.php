<?php

declare(strict_types=1);

namespace Cms\Modules\Collaboration;

use Cms\Abilities\Ability;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Abilities\Shapes;
use Cms\Content\Entries\Entry;
use Cms\Packages\Plugin;
use Cms\Support\Schema\Shape;
use Cms\Users\User;

final class CollaborationModule extends Plugin
{
    public function register(): void
    {
        $this->app->singleton(Presence::class);
        $this->app->singleton(Comments::class);
    }

    public function boot(): void
    {
        $p = $this->cms()->permissions();
        $p->register('comments.view', 'View Comments', 'Comments', roles: ['editor', 'author']);
        $p->register('comments.create', 'Write and Resolve Comments', 'Comments', roles: ['editor', 'author']);
        $p->register('comments.moderate', 'Edit and Delete Anyone’s Comments', 'Comments', roles: ['editor']);

        $this->abilities();

        $this->cms()->hooks()->on('entry.deleted', static function (Entry $entry): void {
            $ids = Comment::query()->where('entry_id', $entry->id)->pluck('id');
            \Illuminate\Support\Facades\DB::table('comment_mentions')->whereIn('comment_id', $ids)->delete();
            Comment::query()->where('entry_id', $entry->id)->delete();
        });

        // A list of entries says who is editing which of them, beside its title: someone about to open one knows before they do.
        $this->cms()->hooks()->addFilter('ability.result', function (mixed $result, Ability $ability, array $input, AbilityContext $context) {
            if (! in_array($ability->name, ['entries/list', 'entries/tree'], true) || $context->user === null || ! is_array($result)) {
                return $result;
            }

            $listed = $ability->name === 'entries/list';
            $rows = $listed ? ($result['items'] ?? []) : $result;
            // The ids of the rows and of the rows nested under them, nothing else an entry carries.
            $ids = [];
            $collect = static function (array $rows) use (&$collect, &$ids): void {
                foreach ($rows as $row) {
                    if (is_array($row) && is_string($row['id'] ?? null)) {
                        $ids[] = $row['id'];
                        $collect((array) ($row['children'] ?? []));
                    }
                }
            };
            $collect($rows);
            $editing = $this->app->make(Presence::class)->editing($ids, $context->user);

            if ($editing === []) {
                return $result;
            }

            $mark = static function (array $rows) use (&$mark, $editing): array {
                return array_map(static function ($row) use (&$mark, $editing) {
                    if (is_array($row) && isset($row['id'], $editing[$row['id']])) {
                        $people = $editing[$row['id']];
                        $row['editingBy'] = count($people) === 1 ? __(':name is editing', ['name' => $people[0]['name']]) : __(':count people are editing', ['count' => count($people)]);
                    }
                    if (is_array($row) && isset($row['children']) && is_array($row['children'])) {
                        $row['children'] = $mark($row['children']);
                    }

                    return $row;
                }, $rows);
            };

            return $listed ? [...$result, 'items' => $mark($rows)] : $mark($rows);
        });

        $this->cms()->admin()->widget('comments-inbox', ['label' => 'Comments', 'description' => 'Open threads that mention you or sit on your entries.', 'icon' => 'comment', 'column' => 'main', 'order' => 30, 'permission' => 'comments.view']);
        $this->adminModule();
    }

    private function abilities(): void
    {
        $a = $this->cms()->abilities();
        $comments = fn () => $this->app->make(Comments::class);
        $entry = fn (string $id) => $this->cms()->entries()->findOrFail($id);
        // Comment abilities need both the comment permission and access to the entry itself.
        $on = fn (string $permission) => function (?User $user, array $in) use ($permission) {
            $id = $in['entryId'] ?? Comment::query()->find($in['id'] ?? '')?->entry_id;
            $target = $id ? $this->cms()->entries()->find((string) $id) : null;

            return $user !== null && $target !== null && $user->hasPermission($permission) && $user->hasPermission("entries.{$target->collection}.view");
        };
        $id = ['type' => 'string'];

        $others = [Shapes::person()->with(['editing' => Shape::BOOLEAN, 'holder' => Shape::BOOLEAN, 'since' => Shape::INTEGER])];
        // Looking takes the right to see the entry; editing it and holding it, the right to change it.
        $may = fn (string $action) => fn (?User $u, array $in) => $u !== null && ($t = $this->cms()->entries()->find((string) $in['entryId'])) !== null && $u->hasPermission("entries.{$t->collection}.{$action}");

        $a->register('collaboration/presence', [
            'label' => 'Presence Heartbeat',
            'description' => 'Say you have an entry open (and whether you are editing, which counts only for someone who may edit it); returns who else has it open, whether you hold it (the first to edit it does, until they leave, stop editing for two minutes or someone takes it over), who among the others does, and when it was last saved.',
            'permission' => $may('view'),
            'annotations' => ['readOnly' => true],
            'expose' => Ability::ADMIN_ONLY,
            'input' => ['type' => 'object', 'properties' => ['entryId' => $id, 'editing' => ['type' => 'boolean', 'default' => false], 'leave' => ['type' => 'boolean', 'default' => false]], 'required' => ['entryId']],
            'output' => Shape::of([
                'others' => $others,
                'holding?' => Shape::BOOLEAN,
                'updatedAt?' => Shape::STRING_OR_NULL,
                'updatedBy?' => Shape::nullable(['id' => Shape::STRING, 'name' => Shape::STRING, 'initials' => Shape::STRING]),
            ]),
            'handler' => function (array $in, AbilityContext $ctx) use ($entry) {
                $presence = $this->app->make(Presence::class);
                $target = $entry($in['entryId']);

                if ($in['leave']) {
                    $presence->leave($target->id, $ctx->user);

                    return ['others' => []];
                }

                $last = $this->app->make(\Cms\Content\Revisions\Revisions::class)->list($target->id, 1)[0] ?? null;

                return [
                    'others' => $presence->beat($target->id, $ctx->user, $in['editing'] && $ctx->can("entries.{$target->collection}.edit")),
                    'holding' => $presence->holds($target->id, $ctx->user),
                    'updatedAt' => $target->updatedAt?->toIso8601String(),
                    'updatedBy' => $last['user'] ?? null,
                ];
            },
        ]);

        $a->register('collaboration/take-over', [
            'label' => 'Take Over Entry',
            'description' => 'Hold an entry yourself from now on, to edit it. Whoever held it is told with their next heartbeat and can no longer save over you.',
            'permission' => $may('edit'),
            'expose' => Ability::ADMIN_ONLY,
            'input' => ['type' => 'object', 'properties' => ['entryId' => $id], 'required' => ['entryId']],
            'output' => Shape::of(['holding' => Shape::BOOLEAN, 'others' => $others]),
            'dryRun' => function (array $in) use ($entry): array {
                $target = $entry($in['entryId']);

                return [['action' => 'take-over', 'type' => 'entry', 'id' => $target->id, 'title' => $target->title, 'from' => $this->app->make(Presence::class)->holder($target->id)['name'] ?? null]];
            },
            'handler' => function (array $in, AbilityContext $ctx) use ($entry) {
                $target = $entry($in['entryId']);

                return ['others' => $this->app->make(Presence::class)->take($target->id, $ctx->user), 'holding' => true];
            },
        ]);

        $a->register('comments/list', [
            'label' => 'List Comments',
            'description' => 'Comment threads on an entry (open threads first), with replies and mentions.',
            'permission' => $on('comments.view'),
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['entryId' => $id, 'resolved' => ['type' => 'boolean', 'default' => true, 'description' => 'Include resolved threads']], 'required' => ['entryId']],
            'output' => Shape::of([self::comment()]),
            'handler' => fn (array $in, AbilityContext $ctx) => $comments()->threads($entry($in['entryId']), $ctx->user, $in['resolved']),
        ]);

        $a->register('comments/create', [
            'label' => 'Comment',
            'description' => 'Comment on an entry, or reply to a thread with parentId. mentions are user ids (see comments/people); they get an email.',
            'permission' => $on('comments.create'),
            'input' => [
                'type' => 'object',
                'properties' => [
                    'entryId' => $id,
                    'body' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 5000],
                    'parentId' => $id,
                    'blockId' => ['type' => 'string', 'maxLength' => 40],
                    'mentions' => ['type' => 'array', 'items' => $id, 'maxItems' => 20, 'default' => []],
                ],
                'required' => ['entryId', 'body'],
            ],
            'output' => self::comment(),
            'handler' => fn (array $in, AbilityContext $ctx) => $comments()->create($entry($in['entryId']), $ctx->user, $in['body'], $in['mentions'], $in['parentId'] ?? null, $in['blockId'] ?? null)->toPublic($ctx->user),
        ]);

        $a->register('comments/update', [
            'label' => 'Edit Comment',
            'description' => 'Change the text of your comment.',
            'permission' => $on('comments.create'),
            'annotations' => ['idempotent' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => $id, 'body' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 5000]], 'required' => ['id', 'body']],
            'output' => self::comment(),
            'handler' => function (array $in, AbilityContext $ctx) {
                $comment = $this->own(Comment::query()->findOrFail($in['id']), $ctx->user);
                $comment->update(['body' => trim($in['body'])]);

                return $comment->load(['author', 'mentions'])->toPublic($ctx->user);
            },
        ]);

        $a->register('comments/resolve', [
            'label' => 'Resolve Thread',
            'description' => 'Mark a thread as resolved (or reopen it with resolved: false).',
            'permission' => $on('comments.create'),
            'input' => ['type' => 'object', 'properties' => ['id' => $id, 'resolved' => ['type' => 'boolean', 'default' => true]], 'required' => ['id']],
            'output' => Shape::of(['id' => Shape::STRING, 'resolved' => Shape::BOOLEAN]),
            'handler' => function (array $in, AbilityContext $ctx) {
                $comment = Comment::query()->findOrFail($in['id']);
                $thread = $comment->parent_id ? Comment::query()->findOrFail($comment->parent_id) : $comment;
                $thread->update(['resolved_at' => $in['resolved'] ? now() : null, 'resolved_by' => $in['resolved'] ? $ctx->user?->id : null]);

                return ['id' => $thread->id, 'resolved' => (bool) $in['resolved']];
            },
        ]);

        // The comment a delete is for and its replies, refused to anyone but its author or a moderator.
        $thread = function (array $in, AbilityContext $ctx): \Illuminate\Support\Collection {
            $comment = $this->own(Comment::query()->findOrFail($in['id']), $ctx->user);

            return Comment::query()->where('id', $comment->id)->orWhere('parent_id', $comment->id)->pluck('id');
        };

        $a->register('comments/delete', [
            'label' => 'Delete Comment',
            'description' => 'Delete your comment (moderators can delete any). Deleting a thread’s first comment deletes its replies.',
            'permission' => $on('comments.create'),
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => $id], 'required' => ['id']],
            'output' => Shape::of(['deleted' => Shape::INTEGER]),
            'dryRun' => function (array $in, AbilityContext $ctx) use ($thread): array {
                $ids = $thread($in, $ctx);

                return [['action' => 'delete', 'type' => 'comment', 'id' => $in['id'], 'removes' => ['comments' => count($ids), 'replies' => count($ids) - 1]]];
            },
            'handler' => function (array $in, AbilityContext $ctx) use ($thread) {
                $ids = $thread($in, $ctx);
                \Illuminate\Support\Facades\DB::table('comment_mentions')->whereIn('comment_id', $ids)->delete();
                Comment::query()->whereIn('id', $ids)->delete();

                return ['deleted' => count($ids)];
            },
        ]);

        $a->register('comments/people', [
            'label' => 'People to Mention',
            'description' => 'Admin users who can see an entry and can be @mentioned on it.',
            'permission' => $on('comments.create'),
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['entryId' => $id], 'required' => ['entryId']],
            'output' => Shape::of([Shapes::person()]),
            'handler' => fn (array $in) => $comments()->people($entry($in['entryId'])),
        ]);

        $a->register('comments/inbox', [
            'label' => 'Comments for Me',
            'description' => 'Open threads that mention you or sit on entries you created, newest first.',
            'permission' => 'comments.view',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 50, 'default' => 10]]],
            'output' => Shape::of([self::comment()->with([
                'threadId' => Shape::STRING,
                'entry' => ['id' => Shape::STRING, 'title' => Shape::STRING, 'collection' => Shape::STRING],
                'reason' => Shape::enum('mention', 'yours'),
            ])]),
            'handler' => fn (array $in, AbilityContext $ctx) => $this->inbox($ctx->user, $in['limit']),
        ]);
    }

    /** Comment::toPublic(): a comment; a thread's first comment carries its replies when they were loaded. */
    private static function comment(): Shape
    {
        $comment = [
            'id' => Shape::STRING, 'entryId' => Shape::STRING, 'blockId' => Shape::STRING_OR_NULL, 'parentId' => Shape::STRING_OR_NULL, 'body' => Shape::STRING,
            'author' => Shape::nullable(Shapes::person()), 'mentions' => [Shapes::person()], 'resolved' => Shape::BOOLEAN, 'resolvedAt' => Shape::STRING_OR_NULL,
            'mine' => Shape::BOOLEAN, 'createdAt' => Shape::STRING_OR_NULL, 'editedAt' => Shape::STRING_OR_NULL,
        ];

        // Threads are one level deep: a reply has no replies of its own, and says so with an empty list.
        return Shape::of([...$comment, 'replies' => [[...$comment, 'replies' => Shape::raw(['type' => 'array', 'items' => ['type' => 'null'], 'description' => 'Always empty: a reply has no replies.'])]]]);
    }

    private function own(Comment $comment, ?User $user): Comment
    {
        if (! $user || ($comment->user_id !== $user->id && ! $user->hasPermission('comments.moderate'))) {
            throw AbilityException::forbidden(__('Only the author or a moderator can change this comment.'));
        }

        return $comment;
    }

    private function inbox(User $user, int $limit): array
    {
        $mentioned = \Illuminate\Support\Facades\DB::table('comment_mentions')->where('user_id', $user->id)->pluck('comment_id');
        $authored = $this->cms()->entries()->query()->where('author_id', $user->id)->limit(500)->get();
        $entryIds = array_map(static fn (Entry $e) => $e->id, $authored);

        $comments = Comment::query()
            ->with(['author', 'mentions'])
            ->where(fn ($q) => $q->whereIn('id', $mentioned)->orWhereIn('entry_id', $entryIds))
            ->where(fn ($q) => $q->whereNull('user_id')->orWhere('user_id', '!=', $user->id))
            ->latest()
            ->limit($limit * 3)
            ->get();

        $entries = [];
        foreach ($this->cms()->entries()->findMany($comments->pluck('entry_id')->unique()->all()) as $e) {
            $entries[$e->id] = $e;
        }

        $out = [];

        foreach ($comments as $comment) {
            $thread = $comment->parent_id ? Comment::query()->find($comment->parent_id) : $comment;
            $target = $entries[$comment->entry_id] ?? null;

            if (! $thread || $thread->resolved_at || ! $target || ! $user->hasPermission("entries.{$target->collection}.view") || isset($out[$thread->id])) {
                continue;
            }

            $out[$thread->id] = [
                ...$comment->toPublic($user),
                'threadId' => $thread->id,
                'entry' => ['id' => $target->id, 'title' => $target->title, 'collection' => $target->collection],
                'reason' => $comment->mentions->contains('id', $user->id) ? 'mention' : 'yours',
            ];

            if (count($out) >= $limit) {
                break;
            }
        }

        return array_values($out);
    }
}

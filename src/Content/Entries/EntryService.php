<?php

declare(strict_types=1);

namespace Cms\Content\Entries;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Cms\Abilities\AbilityException;
use Cms\Content\Collections\Collection;
use Cms\Content\Collections\CollectionRepository;
use Cms\Content\Revisions\Revisions;
use Cms\Extend\Hooks;
use Cms\Support\Files;
use Cms\Support\Schema\SchemaException;
use Cms\Users\User;

/**
 * All entry writes go through here: validation, slugs, URIs, drafts,
 * publishing, tree moves, revisions and hooks.
 */
final class EntryService
{
    private int $writeDepth = 0;

    /** While dry() runs: every operation takes its usual path and checks, and writes nothing. */
    private bool $dry = false;

    /** @var array<string, ?Entry> What a dry run would have saved (null: deleted), read back in place of what is stored. */
    private array $staged = [];

    public function __construct(
        private readonly EntryRepository $entries,
        private readonly CollectionRepository $collections,
        private readonly UriBuilder $uris,
        private readonly Revisions $revisions,
        private readonly Hooks $hooks,
    ) {}


    /** Serialize content mutations on both storage drivers, including read/version checks. */
    public function write(callable $callback): mixed
    {
        if ($this->writeDepth > 0) {
            return $callback();
        }

        return $this->locked(function () use ($callback): mixed {
            $this->entries->flush();

            return DB::transaction($callback);
        });
    }

    /**
     * Run writes without making them: what `$callback` does through this service (create, update, publish,
     * move, delete…) takes the same path under the same lock, so it is refused exactly where the real run
     * would be (fields, slugs and URLs, parents, authors, versions, permissions), and each call answers with
     * the entry as it would be. Nothing is persisted: no entry is saved or deleted (a file cannot be rolled
     * back, so it is never written), no revision is recorded and no `entry.*` action is dispatched; the
     * `entry.creating` and `entry.saving` filters do run, since they shape and may refuse what is saved.
     * What listeners write to the database meanwhile is rolled back.
     */
    public function dry(callable $callback): mixed
    {
        if ($this->dry) {
            return $callback();
        }
        if ($this->writeDepth > 0) {
            throw new \LogicException('A dry run cannot start inside a write.');
        }

        return $this->locked(function () use ($callback): mixed {
            $this->entries->flush();
            $this->dry = true;
            DB::beginTransaction();
            try {
                return $callback();
            } finally {
                DB::rollBack();
                $this->dry = false;
                $this->staged = [];
                // Entries read from files are the index's own objects: forget the ones this run changed in memory.
                $this->entries->flush();
            }
        });
    }

    public function isDry(): bool
    {
        return $this->dry;
    }

    private function locked(callable $callback): mixed
    {
        Files::ensureDir(storage_path('framework'));
        $lock = fopen(storage_path('framework/content-write.lock'), 'c');
        if (! $lock || ! flock($lock, LOCK_EX)) {
            throw new \RuntimeException('Cannot acquire the content write lock.');
        }
        $this->writeDepth++;
        try {
            return $callback();
        } finally {
            $this->writeDepth--;
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    public function create(string $collectionHandle, array $input, ?User $user = null): Entry
    {
        return $this->write(fn () => $this->createUnlocked($collectionHandle, $input, $user));
    }

    /** A duplicate/translation keeps its source byline, including an unavailable historical identity. */
    public function copyFrom(Entry $source, array $input, ?User $user = null): Entry
    {
        return $this->write(function () use ($source, $input, $user): Entry {
            $input['authorId'] = $source->working()['authorId'];

            return $this->createUnlocked($source->collection, $input, $user, allowMissingAuthor: true, copied: true);
        });
    }

    public function update(string $id, array $input, ?User $user = null, bool $publish = false): Entry
    {
        return $this->write(fn () => $this->updateUnlocked($id, $input, $user, $publish));
    }

    public function publish(string $id, ?User $user = null, ?string $at = null, ?string $expectedVersion = null): Entry
    {
        return $this->write(fn () => $this->publishUnlocked($id, $user, $at, $expectedVersion));
    }

    public function unpublish(string $id, ?User $user = null, ?string $expectedVersion = null): Entry
    {
        return $this->write(fn () => $this->unpublishUnlocked($id, $user, $expectedVersion));
    }

    public function discardDraft(string $id, ?User $user = null, ?string $expectedVersion = null): Entry
    {
        return $this->write(fn () => $this->discardDraftUnlocked($id, $user, $expectedVersion));
    }

    public function delete(string $id, ?User $user = null, ?string $expectedVersion = null): void
    {
        $this->write(fn () => $this->deleteUnlocked($id, $user, $expectedVersion));
    }

    public function move(string $id, ?string $parentId, ?int $position = null, ?User $user = null, ?string $expectedVersion = null): Entry
    {
        return $this->write(function () use ($id, $parentId, $position, $user, $expectedVersion): Entry {
            $entry = $this->findOrFail($id);
            $this->assertVersion($entry, $expectedVersion);
            $this->assertStructuralPermission($entry, $user);
            $this->validateMove($entry, $parentId);

            return $this->moveEntry($entry, $parentId, $position, $user);
        });
    }

    public function reorder(string $collectionHandle, array $ids, ?string $parentId = null, ?User $user = null, array $versions = []): void
    {
        $this->write(fn () => $this->reorderUnlocked($collectionHandle, $ids, $parentId, $user, $versions));
    }

    public function restore(string $revisionId, ?User $user = null, ?string $expectedVersion = null): Entry
    {
        return $this->write(fn () => $this->restoreUnlocked($revisionId, $user, $expectedVersion));
    }

    public function refreshUris(?string $collection = null): int
    {
        return $this->write(fn () => $this->refreshUrisUnlocked($collection));
    }


    /**
     * @param  array{title: string, slug?: ?string, data?: array, locale?: ?string, parentId?: ?string, position?: ?int, status?: ?string, at?: ?string, originId?: ?string, authorId?: ?string}  $input
     */
    private function createUnlocked(string $collectionHandle, array $input, ?User $user = null, bool $allowMissingAuthor = false, bool $copied = false): Entry
    {
        if (array_diff(array_keys($input), ['collection', 'title', 'slug', 'data', 'locale', 'parentId', 'position', 'status', 'at', 'originId', 'authorId']) !== []) {
            throw AbilityException::invalid(__('Unsupported entry properties.'));
        }
        $collection = $this->collections->findOrFail($collectionHandle);
        $input = $this->hooks->filter('entry.creating', $input, $collection, $user);
        $locale = $input['locale'] ?? config('app.locale', 'en');
        $this->assertLocale($locale);

        $title = trim((string) ($input['title'] ?? ''));

        if ($title === '') {
            throw AbilityException::invalid(__('A title is required.'), ['title' => __('Is required.')]);
        }

        $parentId = $collection->isTree() ? ($input['parentId'] ?? null) : null;
        $this->assertParent($parentId, $collection, $locale);

        $data = array_replace($collection->blueprint()->defaults(), (array) ($input['data'] ?? []));
        $publish = ($input['status'] ?? 'draft') === 'published';
        if (isset($input['at']) && ! $publish) {
            throw AbilityException::invalid(__('A publication time requires publishing the entry.'));
        }

        $entry = new Entry(
            id: strtolower((string) Str::ulid()),
            collection: $collection->handle,
            locale: $locale,
            slug: '',
            title: $title,
            status: 'draft',
            // A copy keeps what its source names, also what has since been deleted.
            data: $this->process($collection, $data, full: $publish, previous: $copied ? $data : []),
            originId: $input['originId'] ?? null,
            parentId: $parentId,
            position: $input['position'] ?? $this->nextPosition($collection, $parentId, $locale),
            authorId: $this->authorId(array_key_exists('authorId', $input) ? $input['authorId'] : $user?->getKey(), allowMissing: $allowMissingAuthor),
            publishedAt: isset($input['at']) ? CarbonImmutable::parse($input['at']) : null,
        );

        $entry->slug = $this->uniqueSlug($collection, $entry, $input['slug'] ?? null);

        if ($publish) {
            $entry->status = 'published';
            $entry->publishedAt ??= CarbonImmutable::now();
        }

        $this->persist($entry, $collection);
        $this->record($entry, $publish ? 'publish' : 'create', $user);
        $this->dispatch('entry.saved', $entry, $user, 'create');

        if ($publish) {
            $this->dispatch('entry.published', $entry, $user);
        }

        return $entry;
    }

    /**
     * Update an entry. Published entries keep serving their live content: the
     * change lands in the working draft until published (unless $publish).
     *
     * @param  array{title?: string, slug?: string, data?: array, authorId?: ?string, expectedVersion?: string}  $input
     */
    private function updateUnlocked(string $id, array $input, ?User $user = null, bool $publish = false): Entry
    {
        $unsupported = array_diff(array_keys($input), ['title', 'slug', 'data', 'authorId', 'expectedVersion', 'at']);
        if ($unsupported !== []) {
            throw AbilityException::invalid(__('Use the move or publication action to change structure or publication timing.'));
        }
        if (isset($input['at']) && ! $publish) {
            throw AbilityException::invalid(__('A publication time requires publishing the entry.'));
        }
        $entry = $this->findOrFail($id);
        $this->assertVersion($entry, $input['expectedVersion'] ?? null);
        $collection = $entry->collection();
        $working = $entry->working();
        $working['title'] = array_key_exists('title', $input) ? trim((string) $input['title']) : $working['title'];
        if ($working['title'] === '') {
            throw AbilityException::invalid(__('A title is required.'), ['title' => __('Is required.')]);
        }
        $working['data'] = $this->process($collection, array_replace($working['data'], (array) ($input['data'] ?? [])), full: $publish, previous: $working['data']);
        if (array_key_exists('authorId', $input) && $input['authorId'] !== $working['authorId']) {
            $working['authorId'] = $this->authorId($input['authorId']);
        }
        $probe = clone $entry;
        $probe->title = $working['title'];
        $working['slug'] = $this->uniqueSlug($collection, $probe, (string) ($input['slug'] ?? $working['slug']));
        $when = $publish ? $this->publicationTime($entry, $input['at'] ?? null) : null;
        $previousUri = $entry->uri;
        if ($entry->isPublished()) {
            $entry->draft = $working === $entry->content() ? null : $working;
        } else {
            $entry->applyContent($working);
        }
        if ($publish) {
            $entry->applyContent($working);
            $entry->status = 'published';
            $entry->publishedAt = $when;
        }
        $this->persist($entry, $collection);
        if ($entry->uri !== $previousUri) {
            $this->refreshDescendants($entry, $collection);
        }
        $this->record($entry, $publish ? 'publish' : 'save', $user);
        $this->dispatch('entry.saved', $entry, $user, $publish ? 'publish' : 'save');
        if ($publish) {
            $this->dispatch('entry.published', $entry, $user);
        }

        return $entry;
    }

    private function publishUnlocked(string $id, ?User $user = null, ?string $at = null, ?string $expectedVersion = null): Entry
    {
        $entry = $this->findOrFail($id);
        $this->assertVersion($entry, $expectedVersion);
        $collection = $entry->collection();
        $when = $this->publicationTime($entry, $at);
        $working = $entry->working();
        $working['data'] = $this->process($collection, $working['data'], full: true);
        $previousUri = $entry->uri;
        $entry->applyContent($working);
        $entry->status = 'published';
        $entry->publishedAt = $when;

        $this->persist($entry, $collection);

        if ($entry->uri !== $previousUri) {
            $this->refreshDescendants($entry, $collection);
        }

        $this->record($entry, 'publish', $user);
        $this->dispatch('entry.saved', $entry, $user, 'publish');
        $this->dispatch('entry.published', $entry, $user);

        return $entry;
    }

    private function unpublishUnlocked(string $id, ?User $user = null, ?string $expectedVersion = null): Entry
    {
        $entry = $this->findOrFail($id);
        $this->assertVersion($entry, $expectedVersion);
        $scheduled = $entry->isScheduled();
        $entry = $entry->withWorkingCopy();
        $entry->status = 'draft';
        if ($scheduled) {
            $entry->publishedAt = null;
        }

        $this->persist($entry, $entry->collection());
        $this->record($entry, 'unpublish', $user);
        $this->dispatch('entry.saved', $entry, $user, 'unpublish');
        $this->dispatch('entry.unpublished', $entry, $user);

        return $entry;
    }

    private function discardDraftUnlocked(string $id, ?User $user = null, ?string $expectedVersion = null): Entry
    {
        $entry = $this->findOrFail($id);
        $this->assertVersion($entry, $expectedVersion);
        $entry->draft = null;
        $this->persist($entry, $entry->collection());
        $this->record($entry, 'discard', $user);

        return $entry;
    }

    private function deleteUnlocked(string $id, ?User $user = null, ?string $expectedVersion = null): void
    {
        $entry = $this->findOrFail($id);
        $this->assertVersion($entry, $expectedVersion);
        $collection = $entry->collection();

        if ($collection->isTree()) {
            $children = $this->among($collection, $entry->locale, true, $entry->id);
            foreach ($children as $child) {
                $this->validateMove($child, $entry->parentId);
            }
            foreach ($children as $child) {
                $this->moveEntry($child, $entry->parentId, null, $user);
            }
        }

        $this->dispatch('entry.deleting', $entry, $user);
        if ($this->dry) {
            $this->staged[$entry->id] = null;
        } else {
            $this->entries->delete($entry);
            $this->revisions->deleteFor($entry->id);
        }
        $this->dispatch('entry.deleted', $entry, $user);
    }

    public function duplicate(string $id, ?User $user = null, ?string $expectedVersion = null): Entry
    {
        return $this->write(function () use ($id, $user, $expectedVersion): Entry {
            $entry = $this->findOrFail($id);
            $this->assertVersion($entry, $expectedVersion);
            $working = $entry->working();

            return $this->copyFrom($entry, [
                'title' => $working['title'].' (copy)',
                'data' => $this->freshIds((array) $working['data']),
                'locale' => $entry->locale,
                'parentId' => $entry->parentId,
            ], $user);
        });
    }

    /** Reorder siblings (and optionally reparent) — $ids in their new order. */
    private function reorderUnlocked(string $collectionHandle, array $ids, ?string $parentId = null, ?User $user = null, array $versions = []): void
    {
        $collection = $this->collections->findOrFail($collectionHandle);
        $entries = [];
        $slugs = [];
        foreach (array_values(array_unique($ids)) as $id) {
            $entry = $this->findOrFail($id);
            if ($entry->collection !== $collection->handle) {
                throw AbilityException::invalid(__('Entry :id is not in :collection.', ['id' => $id, 'collection' => $collection->handle]));
            }
            $this->assertVersion($entry, $versions[$id] ?? null);
            $this->assertStructuralPermission($entry, $user);
            $this->validateMove($entry, $collection->isTree() ? $parentId : null);
            foreach (array_unique([$entry->slug, $entry->working()['slug']]) as $slug) {
                if (isset($slugs[$slug]) && $slugs[$slug] !== $id) {
                    throw AbilityException::conflict(__('The slug “:slug” is already in use.', ['slug' => $slug]));
                }
                $slugs[$slug] = $id;
            }
            $entries[] = $entry;
        }
        foreach ($entries as $position => $entry) {
            $this->moveEntry($entry, $collection->isTree() ? $parentId : null, $position, $user);
        }
        $this->dispatch('entries.reordered', $collection, $ids, $user);
    }

    private function restoreUnlocked(string $revisionId, ?User $user = null, ?string $expectedVersion = null): Entry
    {
        $revision = $this->revisions->find($revisionId) ?? throw AbilityException::invalid(__('Revision not found.'));
        $entry = $this->findOrFail($revision['entryId']);
        $this->assertVersion($entry, $expectedVersion);
        $snapshot = $revision['snapshot'];
        $source = array_replace($entry->working(), array_intersect_key($snapshot, array_flip(['title', 'slug', 'data', 'authorId'])), $snapshot['draft'] ?? []);
        // A restore replaces the content snapshot; absent later fields do not leak into it.
        $source['data'] = $this->process($entry->collection(), (array) $source['data'], full: false);
        $source['authorId'] = $this->authorId($source['authorId'], allowMissing: true);
        $probe = clone $entry;
        $probe->title = $source['title'];
        $source['slug'] = $this->uniqueSlug($entry->collection(), $probe, $source['slug']);
        $previousUri = $entry->uri;
        if ($entry->isPublished()) {
            $entry->draft = $source === $entry->content() ? null : $source;
        } else {
            $entry->applyContent($source);
        }
        $this->persist($entry, $entry->collection());
        if ($entry->uri !== $previousUri) {
            $this->refreshDescendants($entry, $entry->collection());
        }
        $this->dispatch('entry.saved', $entry, $user, 'restore');

        $this->record($entry, 'restore', $user, 'Restored revision from '.$revision['createdAt']);

        return $entry;
    }

    /**
     * Recompute stored URIs after something that shapes them changed (a
     * route, the home page, locale prefixes). Old URIs of live entries fire
     * `entry.uri-changed`, so redirects follow. Returns how many changed.
     */
    private function refreshUrisUnlocked(?string $collection = null): int
    {
        $changed = 0;

        foreach ($this->collections->all() as $c) {
            if (($collection !== null && $c->handle !== $collection) || ! $c->routable()) {
                continue;
            }

            foreach ($this->entries->query()->collection($c->handle)->get() as $entry) {
                if ($this->uris->build($entry, $c, fn (string $pid) => $this->find($pid)) !== $entry->uri) {
                    $this->persist($entry, $c);
                    $changed++;
                }
            }
        }

        return $changed;
    }

    private function persist(Entry $entry, Collection $collection): void
    {
        $entry = $this->hooks->filter('entry.saving', $entry, $collection);
        $previousUri = $entry->uri;
        $entry->uri = $this->uris->build($entry, $collection, fn (string $pid) => $this->find($pid));

        if ($entry->uri !== null && ($clash = $this->clash($entry->uri, $entry))) {
            throw AbilityException::conflict(__('The URL :uri is already used by “:title”.', ['uri' => $entry->uri, 'title' => $clash->title]));
        }

        if ($this->dry) {
            $this->staged[$entry->id] = $entry;

            return;
        }

        $this->entries->save($entry);

        if ($previousUri !== null && $entry->uri !== null && $previousUri !== $entry->uri && $entry->isLive()) {
            $this->dispatch('entry.uri-changed', $entry, $previousUri, $entry->uri);
        }
    }

    private function refreshDescendants(Entry $parent, Collection $collection): void
    {
        if (! $collection->isTree() || $collection->driver === 'files') {
            return;
        }

        foreach ($this->among($collection, $parent->locale, true, $parent->id) as $child) {
            $before = $child->uri;
            $this->persist($child, $collection);

            if ($child->uri !== $before) {
                $this->refreshDescendants($child, $collection);
            }
        }
    }

    private function find(string $id): ?Entry
    {
        return array_key_exists($id, $this->staged) ? $this->staged[$id] : $this->entries->find($id);
    }

    private function findOrFail(string $id): Entry
    {
        return $this->find($id) ?? throw (new ModelNotFoundException)->setModel('Entry', [$id]);
    }

    /**
     * The entries of a collection in one language, under one parent when `$under`: as stored, and in a dry run as
     * they would be after what it has done so far.
     *
     * @return list<Entry>
     */
    private function among(Collection $collection, string $locale, bool $under = false, ?string $parentId = null): array
    {
        $query = $this->entries->query()->collection($collection->handle)->locale($locale);
        if ($under) {
            $query->parent($parentId);
        }
        $found = $query->get();
        if ($this->staged === []) {
            return $found;
        }
        $entries = [];
        foreach ($found as $entry) {
            if (! array_key_exists($entry->id, $this->staged)) {
                $entries[$entry->id] = $entry;
            }
        }
        foreach ($this->staged as $id => $entry) {
            if ($entry && $entry->collection === $collection->handle && $entry->locale === $locale && (! $under || $entry->parentId === $parentId)) {
                $entries[$id] = $entry;
            }
        }

        return array_values($entries);
    }

    /** Another entry at this address in the entry's language, if there is one. */
    private function clash(string $uri, Entry $entry): ?Entry
    {
        foreach ($this->staged as $other) {
            if ($other && $other->id !== $entry->id && $other->uri === $uri && $other->locale === $entry->locale) {
                return $other;
            }
        }
        $found = $this->entries->findByUri($uri, $entry->locale);

        // One a dry run has moved or deleted is no longer there.
        return $found && $found->id !== $entry->id && ! array_key_exists($found->id, $this->staged) ? $found : null;
    }

    private function record(Entry $entry, string $action, ?User $user = null, ?string $message = null): void
    {
        if (! $this->dry) {
            $this->revisions->record($entry, $action, $user, $message);
        }
    }

    private function dispatch(string $action, mixed ...$args): void
    {
        if (! $this->dry) {
            $this->hooks->dispatch($action, ...$args);
        }
    }

    /**
     * @param  ?array  $previous  The data stored before, when this is a write of new values: the entries, people and
     *                            files they name must exist, except those the entry already named. Null: not checked
     *                            (publishing or restoring what was stored).
     */
    private function process(Collection $collection, array $data, bool $full, ?array $previous = null): array
    {
        try {
            $data = $collection->blueprint()->process($data, partial: ! $full);
            $previous === null || $collection->blueprint()->check($data, $previous);

            return $data;
        } catch (SchemaException $e) {
            // Paths as the caller sent them: a field's value is under `data`, as the collection's schema says (collections/schema).
            $e = $e->under('data');

            throw AbilityException::invalid($e->getMessage(), $e->errors);
        }
    }

    private function uniqueSlug(Collection $collection, Entry $entry, ?string $requested): string
    {
        $explicit = $requested !== null && trim($requested) !== '';
        // Non-page entries (templates, components…) use code handles, including underscores.
        $base = $explicit && ! $collection->routable() && preg_match('/^[a-z0-9][a-z0-9_-]{0,179}$/', $requested)
            ? $requested
            : (Str::slug($explicit ? $requested : $entry->title) ?: 'entry');
        $base = mb_substr($base, 0, 180);
        $slug = $base;

        for ($i = 2; $this->slugTaken($collection, $entry, $slug); $i++) {
            if ($explicit && $i === 2 && $slug === $requested) {
                throw AbilityException::conflict(__('The slug “:slug” is already in use.', ['slug' => $slug]));
            }

            $slug = "{$base}-{$i}";
        }

        return $slug;
    }

    private function slugTaken(Collection $collection, Entry $entry, string $slug): bool
    {
        foreach ($this->among($collection, $entry->locale, $collection->isTree(), $entry->parentId) as $other) {
            if ($other->id !== $entry->id && in_array($slug, [$other->slug, $other->working()['slug']], true)) {
                return true;
            }
        }

        return false;
    }

    private function nextPosition(Collection $collection, ?string $parentId, string $locale): int
    {
        if ($collection->isDated()) {
            return 0;
        }

        $siblings = $this->among($collection, $locale, $collection->isTree(), $parentId);

        return $siblings === [] ? 0 : max(array_map(static fn (Entry $e) => $e->position, $siblings)) + 1;
    }

    private function assertParent(?string $parentId, Collection $collection, string $locale, ?string $self = null): void
    {
        if ($parentId === null) {
            return;
        }

        $parent = $this->find($parentId);

        if (! $parent || $parent->collection !== $collection->handle || $parent->locale !== $locale) {
            throw AbilityException::invalid(__('The parent must be an entry in the same collection and language.'));
        }

        for ($cursor = $parent, $depth = 0; $cursor && $depth < 32; $depth++) {
            if ($cursor->id === $self) {
                throw AbilityException::invalid(__('An entry cannot be moved inside itself.'));
            }

            $cursor = $cursor->parentId ? $this->find($cursor->parentId) : null;
        }
    }

    private function assertVersion(Entry $entry, ?string $expected): void
    {
        if ($expected === null || hash_equals($entry->version(), $expected)) {
            return;
        }
        $last = $this->revisions->list($entry->id, 1)[0] ?? null;
        $who = $last['user']['name'] ?? __('Someone else');
        throw new AbilityException(__(':name changed this :type while you were editing.', ['name' => $who, 'type' => mb_strtolower($entry->collection()->singular)]), 'conflict', [
            'version' => $entry->version(), 'by' => $who,
        ]);
    }

    private function publicationTime(Entry $entry, ?string $at): CarbonImmutable
    {
        $when = $at ? CarbonImmutable::parse($at) : ($entry->isScheduled() ? CarbonImmutable::now() : ($entry->publishedAt ?? CarbonImmutable::now()));
        if ($entry->isLive() && $when->isFuture()) {
            throw AbilityException::invalid(__('Unpublish this entry before scheduling it for a future date.'), ['at' => __('Live entries cannot be scheduled again.')]);
        }

        return $when;
    }

    private function authorId(?string $id, bool $allowMissing = false): ?string
    {
        if ($id !== null && ! $allowMissing && ! User::query()->whereKey($id)->exists()) {
            throw AbilityException::invalid(__('Choose an existing author.'), ['authorId' => __('This person is unavailable.')]);
        }

        return $id;
    }

    private function assertStructuralPermission(Entry $entry, ?User $user): void
    {
        if ($user && $entry->isPublished() && ! $user->hasPermission("entries.{$entry->collection}.publish")) {
            throw AbilityException::forbidden(__('Publishing permission is required to move published content.'));
        }
    }

    private function validateMove(Entry $entry, ?string $parentId): void
    {
        $collection = $entry->collection();
        if (! $collection->isTree() && $parentId !== null) {
            throw AbilityException::invalid(__('Only tree collections have a parent.'));
        }
        $this->assertParent($parentId, $collection, $entry->locale, $entry->id);
        $probe = clone $entry;
        $probe->parentId = $parentId;
        foreach (array_unique([$entry->slug, $entry->working()['slug']]) as $slug) {
            if ($this->slugTaken($collection, $probe, $slug)) {
                throw AbilityException::conflict(__('The slug “:slug” is already in use.', ['slug' => $slug]));
            }
        }
        // Check cross-collection URL collisions before moving a file or writing a row.
        $uri = $this->uris->build($probe, $collection, fn (string $id) => $this->find($id));
        if ($uri !== null && ($clash = $this->clash($uri, $entry))) {
            throw AbilityException::conflict(__('The URL :uri is already used by “:title”.', ['uri' => $uri, 'title' => $clash->title]));
        }
    }

    private function moveEntry(Entry $entry, ?string $parentId, ?int $position, ?User $user): Entry
    {
        if ($entry->parentId === $parentId && ($position === null || $entry->position === $position)) {
            return $entry;
        }
        $entry->parentId = $parentId;
        $entry->position = $position ?? $this->nextPosition($entry->collection(), $parentId, $entry->locale);
        $this->persist($entry, $entry->collection());
        $this->refreshDescendants($entry, $entry->collection());
        $this->record($entry, 'move', $user);
        $this->dispatch('entry.structure-changed', $entry, $user);
        $this->dispatch('entry.saved', $entry, $user, 'move');

        return $entry;
    }

    private function assertLocale(string $locale): void
    {
        if (! in_array($locale, cms()->locales(), true)) {
            throw AbilityException::invalid(__('The language :locale is not enabled.', ['locale' => $locale]));
        }
    }

    /** Block ids must be unique per document; regenerate them on duplicate. */
    private function freshIds(array $data): array
    {
        array_walk_recursive($data, static function (&$value, $key): void {
            if ($key === 'id' && is_string($value) && preg_match('/^b[0-9a-z]{6,}$/', $value)) {
                $value = 'b'.Str::lower(Str::random(10));
            }
        });

        return $data;
    }
}

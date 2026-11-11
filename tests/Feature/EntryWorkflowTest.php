<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Illuminate\Support\Facades\DB;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Content\Revisions\Revisions;
use Cms\Tests\TestCase;
use Cms\Users\User;

/** Editorial content, publication and structure share one guarded write lifecycle. */
final class EntryWorkflowTest extends TestCase
{
    private function execute(string $ability, array $input, ?User $user = null): array
    {
        return $this->cms()->abilities()->execute($ability, $input, AbilityContext::forUser($user ?? $this->admin(), 'rest'));
    }

    private function fails(callable $action, string $type = 'invalid_input'): void
    {
        try {
            $action();
            $this->fail('The operation must fail.');
        } catch (AbilityException $error) {
            $this->assertSame($type, $error->type);
        }
    }

    public function test_authorship_is_editable_publishable_and_restorable_in_both_drivers(): void
    {
        $writer = $this->admin(['name' => 'Original Writer']);
        $editor = $this->admin(['name' => 'Another Editor']);
        $service = $this->cms()->content();
        foreach (['pages', 'notes'] as $collection) {
            $created = $service->create($collection, ['title' => 'Original', 'status' => 'published'], $writer);
            $this->assertSame($created->version(), $this->cms()->entries()->find($created->id)->version());
            $edited = $service->update($created->id, ['authorId' => $editor->id, 'expectedVersion' => $created->version()], $editor);
            $this->assertSame($writer->id, $edited->authorId, 'A saved draft must not change the public byline.');
            $this->assertSame($editor->id, $edited->working()['authorId']);
            $this->assertSame('Another Editor', $edited->toArray()['author']['name']);
            $this->assertNotSame($created->version(), $edited->version());
            $this->assertSame($edited->version(), $this->cms()->entries()->find($created->id)->version());
            $published = $service->publish($created->id, $editor, expectedVersion: $edited->version());
            $this->assertSame($editor->id, $published->authorId);
            $revision = array_slice(app(Revisions::class)->list($created->id), -1)[0];
            $restored = $service->restore($revision['id'], $editor, $published->version());
            $this->assertSame($editor->id, $restored->authorId);
            $this->assertSame($writer->id, $restored->working()['authorId']);
            $cleared = $service->update($created->id, ['authorId' => null]);
            $this->assertNull($cleared->toArray()['author']);
            $this->assertSame($editor->id, $service->discardDraft($created->id)->authorId);
        }
        $unassigned = $service->create('pages', ['title' => 'Unassigned', 'authorId' => null], $writer);
        $this->assertNull($unassigned->authorId, 'Explicit null must not be replaced by the current actor.');
        $this->fails(fn () => $service->update($unassigned->id, ['authorId' => str_repeat('0', 26)]));
    }

    public function test_unchanged_unavailable_authors_survive_full_autosave_snapshots_and_guarded_duplicates(): void
    {
        $writer = $this->admin();
        $editor = $this->admin();
        $service = $this->cms()->content();
        $entry = $service->create('pages', ['title' => 'Historical', 'status' => 'published'], $writer);
        $writer->delete();
        $saved = $service->update($entry->id, ['title' => 'Edited', 'slug' => $entry->slug, 'data' => $entry->data, 'authorId' => $writer->id, 'expectedVersion' => $entry->version()], $editor);
        $this->assertSame($writer->id, $saved->working()['authorId']);
        $this->assertNull($saved->toArray()['author']);
        $this->fails(fn () => $service->duplicate($entry->id, $editor, $entry->version()), 'conflict');
        $copy = $this->execute('entries/duplicate', ['id' => $entry->id, 'expectedVersion' => $saved->version()], $editor);
        $this->assertSame($writer->id, $copy['authorId']);
    }

    public function test_versions_guard_same_second_saves_and_all_followup_actions(): void
    {
        $this->freezeTime();
        $service = $this->cms()->content();
        foreach (['pages', 'notes'] as $collection) {
            $created = $service->create($collection, ['title' => 'Shared']);
            $fresh = $service->update($created->id, ['title' => 'First save', 'expectedVersion' => $created->version()]);
            $this->assertSame($created->updatedAt->getTimestamp(), $fresh->updatedAt->getTimestamp());
            $this->fails(fn () => $service->update($created->id, ['title' => 'Stale save', 'expectedVersion' => $created->version()]), 'conflict');
            $this->fails(fn () => $service->publish($created->id, expectedVersion: $created->version()), 'conflict');
            $this->fails(fn () => $service->delete($created->id, expectedVersion: $created->version()), 'conflict');
            $this->assertSame('First save', $this->cms()->entries()->find($created->id)->title);
        }
    }

    public function test_moves_and_parent_deletion_preserve_unpublished_content_and_bylines(): void
    {
        $service = $this->cms()->content();
        $writer = $this->admin();
        foreach (['pages', 'notes'] as $collection) {
            $parent = $service->create($collection, ['title' => 'Parent']);
            $child = $service->create($collection, ['title' => 'Public', 'status' => 'published'], $writer);
            $draft = $service->update($child->id, ['title' => 'Secret draft', 'slug' => 'secret', 'authorId' => null]);
            $moved = $service->move($child->id, $parent->id, expectedVersion: $draft->version());
            $this->assertSame('Public', $moved->title);
            $this->assertSame('public', $moved->slug);
            $this->assertSame($draft->draft, $moved->draft);
            $this->assertSame($writer->id, $moved->authorId);
            $service->delete($parent->id);
            $survivor = $this->cms()->entries()->find($child->id);
            $this->assertNull($survivor->parentId);
            $this->assertSame($draft->draft, $survivor->draft);
            $this->assertSame('Public', $survivor->title);
        }
    }

    public function test_structure_requires_publish_permission_and_reorder_checks_every_version_first(): void
    {
        $service = $this->cms()->content();
        $a = $service->create('pages', ['title' => 'A', 'status' => 'published']);
        $b = $service->create('pages', ['title' => 'B']);
        $this->fails(fn () => $this->execute('entries/move', ['id' => $a->id, 'parentId' => $b->id], $this->userWithRole('author')), 'forbidden');
        $versions = [$a->id => $a->version(), $b->id => $b->version()];
        $service->update($b->id, ['title' => 'Changed']);
        $this->fails(fn () => $service->reorder('pages', [$b->id, $a->id], versions: $versions), 'conflict');
        $this->assertSame(0, $this->cms()->entries()->find($a->id)->position);
        $this->fails(fn () => $service->update($a->id, ['parentId' => $b->id]));
    }

    public function test_scheduling_is_explicit_atomic_and_does_not_remove_live_content(): void
    {
        $admin = $this->admin();
        $author = $this->userWithRole('author');
        $at = now()->addDay()->toIso8601String();
        $scheduled = $this->execute('entries/create', ['collection' => 'pages', 'title' => 'Scheduled', 'status' => 'published', 'at' => $at], $admin);
        $this->assertSame('scheduled', $scheduled['displayStatus']);
        $this->fails(fn () => $this->execute('entries/update', ['id' => $scheduled['id'], 'at' => $at], $admin));
        $this->fails(fn () => $this->execute('entries/update', ['id' => $scheduled['id'], 'publishedAt' => $at], $author));
        $this->fails(fn () => $this->execute('entries/update', ['id' => $scheduled['id'], 'publish' => true, 'at' => $at], $author), 'forbidden');
        $rescheduled = $this->execute('entries/update', ['id' => $scheduled['id'], 'title' => 'Scheduled content', 'publish' => true, 'at' => now()->addDays(2)->toIso8601String(), 'expectedVersion' => $scheduled['version']], $admin);
        $this->assertSame('scheduled', $rescheduled['displayStatus']);
        $live = $this->execute('entries/publish', ['id' => $scheduled['id'], 'expectedVersion' => $rescheduled['version']], $admin);
        $this->assertSame('published', $live['displayStatus']);
        $this->fails(fn () => $this->execute('entries/update', ['id' => $live['id'], 'title' => 'Must stay unsaved', 'publish' => true, 'at' => $at], $admin));
        $this->assertSame('Scheduled content', $this->cms()->entries()->find($live['id'])->title);
        $this->assertTrue($this->cms()->entries()->find($live['id'])->isLive());
    }

    public function test_admin_queries_use_working_values_without_leaking_them_to_public_queries(): void
    {
        $service = $this->cms()->content();
        $zoe = $this->admin(['name' => 'Zoe']);
        $ada = $this->admin(['name' => 'Ada']);
        foreach (['posts' => 'excerpt', 'notes' => 'body'] as $collection => $field) {
            $first = $service->create($collection, ['title' => 'Zulu', 'status' => 'published', 'data' => [$field => 'Live']], $zoe);
            $service->create($collection, ['title' => 'Middle', 'status' => 'published', 'data' => [$field => 'Other']], $zoe);
            $service->update($first->id, ['title' => 'Alpha', 'slug' => 'draft-alpha', 'data' => [$field => 'Secret draft'], 'authorId' => $ada->id]);
            $list = $this->execute('entries/list', ['collection' => $collection, 'sort' => 'title'], $ada);
            $this->assertSame(['Alpha', 'Middle'], array_column($list['items'], 'title'));
            $this->assertSame('Ada', $list['items'][0]['author']['name']);
            $this->assertSame([$first->id], array_column($this->execute('entries/list', ['collection' => $collection, 'search' => 'Secret'], $ada)['items'], 'id'));
            $this->assertSame($first->id, $this->execute('entries/list', ['collection' => $collection, 'sort' => 'author_id'], $ada)['items'][0]['id']);
            $this->assertSame(1, $this->execute('entries/list', ['collection' => $collection, 'filters' => [['field' => 'author_id', 'value' => $ada->id]]], $ada)['total']);
            $this->assertSame(0, $this->cms()->entries()->query()->collection($collection)->live()->search('Secret')->count());
            $service->update($first->id, ['authorId' => null]);
            $this->assertSame(1, $this->execute('entries/list', ['collection' => $collection, 'filters' => [['field' => 'author_id', 'operator' => 'null']]], $ada)['total']);
        }
    }

    public function test_people_lookup_is_safe_searchable_and_available_to_editors(): void
    {
        $person = $this->admin(['name' => 'Lookup Person']);
        $editor = $this->userWithRole('editor');
        $result = $this->execute('people/list', ['search' => 'Lookup', 'perPage' => 1], $editor);
        $this->assertSame(1, $result['total']);
        $this->assertSame(['id', 'name', 'initials', 'avatar'], array_keys($result['items'][0]));
        $this->assertSame($person->id, $this->execute('people/list', ['ids' => [$person->id]], $editor)['items'][0]['id']);
        $this->assertSame([], $this->execute('people/list', ['ids' => [str_repeat('0', 26)]], $editor)['items']);
        $this->fails(fn () => $this->execute('users/list', [], $editor), 'forbidden');
    }

    public function test_deletion_removes_history_and_collections_require_explicit_data_deletion(): void
    {
        $admin = $this->admin();
        $service = $this->cms()->content();
        foreach (['posts' => 'excerpt', 'notes' => 'body'] as $collection => $field) {
            $entry = $service->create($collection, ['title' => 'Remove', 'data' => [$field => 'Body'], 'status' => 'published'], $admin);
            $service->update($entry->id, ['title' => 'Draft']);
            $service->create($collection, ['title' => 'German', 'locale' => 'de'], $admin);
            $this->assertSame(2, $this->execute('collections/get', ['handle' => $collection], $admin)['count']);
            $this->fails(fn () => $this->execute('collections/delete', ['handle' => $collection], $admin));
            $this->assertNotNull($this->cms()->entries()->find($entry->id));
            $result = $this->execute('collections/delete', ['handle' => $collection, 'deleteEntries' => true], $admin);
            $this->assertSame(2, $result['deletedEntries']);
            $this->assertNull($this->cms()->collections()->find($collection));
            $this->assertSame(0, DB::table('revisions')->where('collection', $collection)->count());
            $this->assertFileDoesNotExist(storage_path('drafts/'.$entry->id.'.json'));
        }
    }
}

<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityException;
use Cms\Tests\TestCase;

final class EntriesTest extends TestCase
{
    public function test_create_generates_unique_slugs_and_uris(): void
    {
        $content = $this->cms()->entryService();

        $a = $content->create('posts', ['title' => 'Hello World', 'data' => ['excerpt' => 'x']]);
        $b = $content->create('posts', ['title' => 'Hello World', 'data' => ['excerpt' => 'y']]);

        $this->assertSame('hello-world', $a->slug);
        $this->assertSame('hello-world-2', $b->slug);
        $this->assertSame('/blog/hello-world-2', $b->uri);
        $this->assertSame('draft', $b->status);
    }

    public function test_required_fields_are_enforced_on_publish_only(): void
    {
        $content = $this->cms()->entryService();
        $draft = $content->create('posts', ['title' => 'No excerpt']);

        $this->assertSame('draft', $draft->status);

        $this->expectException(AbilityException::class);
        $content->publish($draft->id);
    }

    public function test_published_entries_collect_changes_in_a_draft(): void
    {
        $content = $this->cms()->entryService();
        $entry = $content->create('posts', ['title' => 'Live', 'data' => ['excerpt' => 'one'], 'status' => 'published']);

        $updated = $content->update($entry->id, ['title' => 'Live v2', 'data' => ['excerpt' => 'two']]);

        $this->assertSame('Live', $updated->title);
        $this->assertSame('one', $updated->data['excerpt']);
        $this->assertSame('changed', $updated->displayStatus());
        $this->assertSame('Live v2', $updated->toArray()['title']);

        $published = $content->publish($entry->id);
        $this->assertSame('Live v2', $published->title);
        $this->assertSame('two', $published->data['excerpt']);
        $this->assertFalse($published->hasDraft());

        $discarded = $content->discardDraft($content->update($entry->id, ['title' => 'Nope'])->id);
        $this->assertSame('Live v2', $discarded->toArray()['title']);
    }

    public function test_tree_uris_follow_parents_and_home(): void
    {
        $content = $this->cms()->entryService();
        $home = $content->create('pages', ['title' => 'Home']);
        $about = $content->create('pages', ['title' => 'About']);
        $team = $content->create('pages', ['title' => 'Team', 'parentId' => $about->id]);
        $child = $content->create('pages', ['title' => 'Child of home', 'parentId' => $home->id]);

        $this->assertSame('/', $home->uri);
        $this->assertSame('/about/team', $team->uri);
        $this->assertSame('/child-of-home', $child->uri);

        $content->update($about->id, ['slug' => 'company']);
        $this->assertSame('/company/team', $this->cms()->entries()->find($team->id)->uri);
    }

    public function test_cannot_move_entry_inside_itself(): void
    {
        $content = $this->cms()->entryService();
        $a = $content->create('pages', ['title' => 'A']);
        $b = $content->create('pages', ['title' => 'B', 'parentId' => $a->id]);

        $this->expectException(AbilityException::class);
        $content->move($a->id, $b->id);
    }

    public function test_deleting_a_parent_moves_children_up(): void
    {
        $content = $this->cms()->entryService();
        $a = $content->create('pages', ['title' => 'A']);
        $b = $content->create('pages', ['title' => 'B', 'parentId' => $a->id]);

        $content->delete($a->id);

        $b = $this->cms()->entries()->find($b->id);
        $this->assertNull($b->parentId);
        $this->assertSame('/b', $b->uri);
    }

    public function test_query_filters_sorting_and_pagination(): void
    {
        $content = $this->cms()->entryService();

        foreach (['Zeta' => ['php'], 'Alpha' => ['js'], 'Mid' => ['php', 'js']] as $title => $tags) {
            $content->create('posts', ['title' => $title, 'data' => ['excerpt' => $title, 'tags' => $tags], 'status' => 'published']);
        }

        $q = $this->cms()->entries()->query();
        $titles = array_map(fn ($e) => $e->title, $q->collection('posts')->where('tags', 'contains', 'php')->orderBy('title')->get());
        $this->assertSame(['Mid', 'Zeta'], $titles);

        $page = $this->cms()->entries()->query()->collection('posts')->orderBy('-title')->paginate(2, 2);
        $this->assertSame(3, $page['total']);
        $this->assertSame('Alpha', $page['items'][0]->title);

        $this->assertSame(1, $this->cms()->entries()->query()->collection('posts')->search('zet')->count());
    }

    public function test_revisions_are_recorded_and_restorable(): void
    {
        $content = $this->cms()->entryService();
        $entry = $content->create('pages', ['title' => 'First']);
        $content->update($entry->id, ['title' => 'Second']);
        $content->publish($entry->id);

        $revisions = app(\Cms\Content\Revisions\Revisions::class)->list($entry->id);
        $this->assertSame(['publish', 'save', 'create'], array_column($revisions, 'action'));

        $restored = $content->restore($revisions[2]['id']);
        $this->assertSame('First', $restored->toArray()['title']);
    }

    public function test_uri_conflicts_are_rejected(): void
    {
        $content = $this->cms()->entryService();
        $content->create('pages', ['title' => 'Blog']);
        $content->create('posts', ['title' => 'Post', 'data' => ['excerpt' => 'x']]);

        // "/blog/post" exists; a page "post" under "blog" would collide.
        $blog = $this->cms()->entries()->query()->collection('pages')->where('slug', 'blog')->first();

        $this->expectException(AbilityException::class);
        $content->create('pages', ['title' => 'Post', 'parentId' => $blog->id]);
    }

    public function test_flat_file_driver_round_trip(): void
    {
        $content = $this->cms()->entryService();
        $parent = $content->create('notes', ['title' => 'Guides', 'data' => ['body' => "# Guides\n\nAll guides."], 'status' => 'published']);
        $child = $content->create('notes', ['title' => 'Install', 'parentId' => $parent->id, 'data' => ['body' => 'Upload.']]);

        $file = content_path('collections/notes/guides/install.md');
        $this->assertFileExists($file);
        $this->assertStringContainsString("title: Install", file_get_contents($file));
        $this->assertStringEndsWith("Upload.\n", file_get_contents($file));
        $this->assertSame('/notes/guides/install', $child->uri);

        $found = $this->cms()->entries()->find($child->id);
        $this->assertSame('Upload.', $found->data['body']);
        $this->assertSame($parent->id, $found->parentId);

        $content->update($child->id, ['slug' => 'installation']);
        $this->assertFileExists(content_path('collections/notes/guides/installation.md'));
        $this->assertFileDoesNotExist($file);

        // Two saves in the same second: the next request (a fresh driver, same disk cache) reads the last one.
        $content->update($child->id, ['data' => ['body' => 'First.']]);
        $content->update($child->id, ['data' => ['body' => 'Second.']]);
        $index = app()->build(\Cms\Content\Entries\FileDriver::class)->index($this->cms()->collections()->find('notes'));
        $this->assertStringContainsString('Second.', serialize($index));
        $this->assertStringNotContainsString('First.', serialize($index));
    }

    public function test_group_and_repeater_fields(): void
    {
        $this->cms()->collections()->save(\Cms\Content\Collections\Collection::fromArray('team', ['title' => 'Team', 'fields' => [
            ['handle' => 'contact', 'type' => 'group', 'fields' => [['handle' => 'email', 'type' => 'email'], ['handle' => 'phone', 'type' => 'text']]],
            ['handle' => 'links', 'type' => 'repeater', 'fields' => [['handle' => 'label', 'type' => 'text', 'required' => true], ['handle' => 'url', 'type' => 'url']]],
        ]]));

        $entry = $this->cms()->entryService()->create('team', ['title' => 'Ada', 'status' => 'published', 'data' => [
            'contact' => ['email' => ' ADA@Example.com ', 'phone' => '123'],
            'links' => [['label' => 'Site', 'url' => 'https://ada.dev'], 'not-an-item'],
        ]]);

        $this->assertSame('ada@example.com', $entry->data['contact']['email']);
        $this->assertSame([['label' => 'Site', 'url' => 'https://ada.dev']], $entry->data['links']);

        $this->expectException(\Cms\Abilities\AbilityException::class);
        $this->cms()->entryService()->create('team', ['title' => 'Bad', 'status' => 'published', 'data' => ['contact' => ['email' => 'nope']]]);
    }

    public function test_select_options_from_plugins_are_read_when_needed(): void
    {
        $this->cms()->collections()->save(\Cms\Content\Collections\Collection::fromArray('notes', ['title' => 'Notes', 'fields' => [
            ['handle' => 'layout', 'type' => 'select', 'options' => ['plain' => 'Plain'], 'dynamic' => 'layouts'],
        ]]));

        // Added after the collection loaded, and reading collections itself (like the templates options): no loop, no stale list.
        $this->cms()->hooks()->addFilter('fields.options.layouts', fn (array $options) => [...$options, 'wide' => 'Wide · '.count($this->cms()->collections()->all())]);

        $this->assertSame(['plain', 'wide'], array_keys($this->cms()->collections()->find('notes')->blueprint()->toArray()[0]['options']));
        $this->assertSame('wide', $this->cms()->entryService()->create('notes', ['title' => 'A', 'status' => 'published', 'data' => ['layout' => 'wide']])->data['layout']);

        $this->expectException(AbilityException::class);
        $this->cms()->entryService()->create('notes', ['title' => 'B', 'status' => 'published', 'data' => ['layout' => 'huge']]);
    }

    public function test_globals_values(): void
    {
        $set = new \Cms\Content\Globals\GlobalSet('footer', 'Footer', 'globe', [['handle' => 'tagline', 'type' => 'text'], ['handle' => 'year', 'type' => 'number']]);
        $this->cms()->globals()->save($set);

        $this->cms()->globals()->updateValues('footer', ['tagline' => 'Made with care', 'year' => '2026']);
        $this->cms()->globals()->updateValues('footer', ['tagline' => 'Mit Sorgfalt gemacht'], 'de');

        $this->assertSame(['tagline' => 'Made with care', 'year' => 2026], $this->cms()->globals()->find('footer')->values());
        $this->assertSame('Mit Sorgfalt gemacht', $this->cms()->globals()->find('footer')->values('de')['tagline']);
    }

    public function test_stale_saves_conflict_instead_of_overwriting(): void
    {
        $service = $this->cms()->entryService();
        $entry = $service->create('pages', ['title' => 'Shared']);
        $loaded = $entry->version();

        $this->travel(5)->seconds();
        $service->update($entry->id, ['title' => 'Saved by someone else', 'expectedVersion' => $loaded], $this->admin());

        try {
            $service->update($entry->id, ['title' => 'My stale copy', 'expectedVersion' => $loaded]);
            $this->fail('A stale save must conflict.');
        } catch (\Cms\Abilities\AbilityException $e) {
            $this->assertSame('conflict', $e->type);
            $this->assertStringContainsString('changed this page while you were editing', $e->getMessage());
        }

        $this->assertSame('Saved by someone else', $this->cms()->entries()->find($entry->id)->title);
        $this->assertSame('Forced', $service->update($entry->id, ['title' => 'Forced'])->title, 'without the token the save goes through');
    }
}

<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\Ability;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Tests\TestCase;
use Cms\Users\User;

/** A person's saved views of a collection's list: kept with their account, theirs alone, by saved-views/list, create, update and delete. */
final class SavedViewsTest extends TestCase
{
    private function as(User $user, string $ability, array $input = []): mixed
    {
        return $this->cms()->abilities()->execute($ability, $input, AbilityContext::forUser($user, 'admin'));
    }

    private function refused(User $user, string $ability, array $input): AbilityException
    {
        try {
            $this->as($user, $ability, $input);
        } catch (AbilityException $e) {
            return $e;
        }

        $this->fail("{$ability} was not refused.");
    }

    public function test_a_view_is_saved_listed_changed_and_deleted_for_its_owner_only(): void
    {
        $ada = $this->admin();
        $bob = $this->userWithRole('editor');
        $state = ['query' => ['status' => 'draft', 'search' => 'launch'], 'sort' => '-updated_at', 'columns' => ['uri', 'displayStatus', 'author'], 'view' => 'table'];

        $view = $this->as($ada, 'saved-views/create', ['list' => 'entries.pages', 'name' => ' Drafts to Review ', 'state' => $state]);
        $this->assertSame(['entries.pages', 'Drafts to Review', 'published'], [$view['list'], $view['name'], $view['state']['calendarDate']]);
        $this->assertSame(['status' => 'draft', 'search' => 'launch'], (array) $view['state']['query']);
        $this->as($ada, 'saved-views/create', ['list' => 'entries.posts', 'name' => 'Calendar', 'state' => ['view' => 'calendar']]);

        $this->assertSame(['Drafts to Review'], array_column($this->as($ada, 'saved-views/list', ['list' => 'entries.pages']), 'name'));
        $this->assertCount(2, $this->as($ada, 'saved-views/list'));
        $this->assertSame([], $this->as($bob, 'saved-views/list'), 'Nobody else sees them.');
        $this->assertCount(2, $ada->fresh()->preferences['views'], 'They are kept with the account, beside its other preferences.');

        $renamed = $this->as($ada, 'saved-views/update', ['id' => $view['id'], 'name' => 'Drafts']);
        $this->assertSame(['Drafts', '-updated_at'], [$renamed['name'], $renamed['state']['sort']]);
        $this->assertNull($this->as($ada, 'saved-views/update', ['id' => $view['id'], 'state' => ['view' => 'grid']])['state']['sort']);

        foreach (['saved-views/update' => ['id' => $view['id'], 'name' => 'Mine'], 'saved-views/delete' => ['id' => $view['id']]] as $ability => $input) {
            $this->assertSame('not_found', $this->refused($bob, $ability, $input)->type, "{$ability} reached someone else's view.");
        }

        $this->assertSame(['deleted' => $view['id']], $this->as($ada, 'saved-views/delete', ['id' => $view['id']]));
        $this->assertSame(['Calendar'], array_column($this->as($ada, 'saved-views/list'), 'name'));
    }

    public function test_a_name_is_needed_and_used_once_per_list(): void
    {
        $ada = $this->admin();
        $this->as($ada, 'saved-views/create', ['list' => 'entries.pages', 'name' => 'Drafts', 'state' => ['view' => 'table']]);
        $this->as($ada, 'saved-views/create', ['list' => 'entries.posts', 'name' => 'Drafts', 'state' => ['view' => 'table']]);

        foreach (['drafts', '   '] as $name) {
            $e = $this->refused($ada, 'saved-views/create', ['list' => 'entries.pages', 'name' => $name, 'state' => ['view' => 'table']]);
            $this->assertSame(['invalid_input', ['name']], [$e->type, array_keys($e->details)]);
        }
    }

    public function test_a_view_keeps_only_what_its_list_has(): void
    {
        $ada = $this->admin();
        $author = $this->userWithRole('author');

        foreach ([
            'list' => ['list' => 'entries.nowhere', 'state' => ['view' => 'table']],
            'state.columns' => ['list' => 'entries.pages', 'state' => ['columns' => ['uri', 'secret_column']]],
            'state.query' => ['list' => 'entries.pages', 'state' => ['query' => ['owner' => 'me']]],
            'state.query ' => ['list' => 'entries.pages', 'state' => ['query' => ['status' => 'archived']]],
            'state.view' => ['list' => 'entries.pages', 'state' => ['view' => 'calendar']],
        ] as $about => $input) {
            $e = $this->refused($ada, 'saved-views/create', [...$input, 'name' => 'View']);
            $this->assertSame(['invalid_input', [trim($about)]], [$e->type, array_keys($e->details)], $about);
        }

        // A sort is what entries/list takes; anything else never gets past the input.
        $this->assertSame('invalid_input', $this->refused($ada, 'saved-views/create', ['list' => 'entries.pages', 'name' => 'View', 'state' => ['sort' => 'title; drop table']])->type);
        // Someone who may not see a collection has no views of it.
        $this->cms()->settingsRegistry()->save(\Cms\Users\Roles::SETTINGS, ['roles' => [...$this->cms()->roles()->defaults(), 'reader' => ['label' => 'Reader', 'description' => '', 'permissions' => ['admin.access', 'entries.posts.view']]]]);
        $this->assertSame(['list'], array_keys($this->refused($this->userWithRole('reader'), 'saved-views/create', ['list' => 'entries.pages', 'name' => 'View', 'state' => ['view' => 'table']])->details));
        $this->assertSame('Mine', $this->as($author, 'saved-views/create', ['list' => 'entries.pages', 'name' => 'Mine', 'state' => ['view' => 'table']])['name']);
    }

    public function test_a_view_whose_column_or_filter_is_gone_applies_without_it(): void
    {
        $ada = $this->admin();
        $definition = $this->cms()->collections()->findOrFail('posts')->toArray();
        $this->cms()->abilities()->execute('collections/save', ['handle' => 'posts', 'definition' => [...$definition, 'fields' => [...$definition['fields'], ['handle' => 'mood', 'type' => 'text']]]], AbilityContext::system());

        $view = $this->as($ada, 'saved-views/create', ['list' => 'entries.posts', 'name' => 'By Mood', 'state' => ['columns' => ['values.mood', 'displayStatus'], 'query' => ['status' => 'draft'], 'sort' => 'mood', 'view' => 'calendar']]);
        $this->assertSame(['values.mood', 'displayStatus'], $view['state']['columns']);

        // The field goes, the collection is no longer dated: the view is still there, as far as the list goes.
        $this->cms()->abilities()->execute('collections/save', ['handle' => 'posts', 'definition' => [...$definition, 'structure' => 'list']], AbilityContext::system());
        $listed = $this->as($ada, 'saved-views/list', ['list' => 'entries.posts'])[0];
        $this->assertSame([['displayStatus'], 'table', ['status' => 'draft']], [$listed['state']['columns'], $listed['state']['view'], (array) $listed['state']['query']]);

        // What is stored in a shape of its own (an older version, a hand-edited row) is read into shape, not passed on.
        $ada->preferences = [...$ada->preferences, 'views' => [...$ada->preferences['views'], 'nonsense', ['id' => 'x1', 'list' => 'entries.pages', 'name' => 'Odd', 'state' => ['query' => 'all', 'sort' => ['title'], 'columns' => 'uri', 'view' => 'kanban']]]];
        $ada->save();
        $odd = array_values(array_filter($this->as($ada, 'saved-views/list'), static fn ($v) => $v['id'] === 'x1'))[0];
        $this->assertSame([[], null, null, 'table', 'published'], [(array) $odd['state']['query'], $odd['state']['sort'], $odd['state']['columns'], $odd['state']['view'], $odd['state']['calendarDate']]);
    }

    public function test_a_view_kept_as_published_before_entries_could_end_is_the_published_filter_of_today(): void
    {
        $ada = $this->admin();
        $view = $this->as($ada, 'saved-views/create', ['list' => 'entries.pages', 'name' => 'Live', 'state' => ['query' => ['status' => 'active']]]);

        // As it was stored then.
        $ada = $ada->fresh();
        $ada->preferences = [...$ada->preferences, 'views' => array_map(static fn (array $v) => [...$v, 'state' => [...$v['state'], 'query' => ['status' => 'published']]], $ada->preferences['views'])];
        $ada->save();

        $listed = $this->as($ada, 'saved-views/list', ['list' => 'entries.pages'])[0];
        $this->assertSame([$view['id'], ['status' => 'active']], [$listed['id'], (array) $listed['state']['query']]);
    }

    public function test_views_are_written_by_their_abilities_only_and_lose_nothing_else(): void
    {
        $ada = $this->admin();
        $view = $this->as($ada, 'saved-views/create', ['list' => 'entries.pages', 'name' => 'Drafts', 'state' => ['query' => ['status' => 'draft']]]);

        // account/update keeps every other preference and leaves the views alone.
        $this->as($ada, 'account/update', ['preferences' => ['theme' => 'dark', 'views' => [['id' => 'evil', 'list' => 'entries.pages', 'name' => 'Injected', 'state' => []]]]]);
        $this->assertSame('dark', $ada->fresh()->preferences['theme']);
        $this->assertSame([$view['id']], array_column($ada->fresh()->preferences['views'], 'id'));

        // A preference saved by another request meanwhile is not written over by a stale copy of the account.
        $stale = User::query()->findOrFail($ada->id);
        $this->as(User::query()->findOrFail($ada->id), 'account/update', ['preferences' => ['theme' => 'light']]);
        $this->as($stale, 'saved-views/create', ['list' => 'entries.pages', 'name' => 'Published', 'state' => ['query' => ['status' => 'active']]]);
        $kept = $ada->fresh()->preferences;
        $this->assertSame(['light', ['Drafts', 'Published']], [$kept['theme'], array_column($kept['views'], 'name')]);
    }

    public function test_deleting_a_collection_deletes_its_views(): void
    {
        $ada = $this->admin();
        $bob = $this->userWithRole('editor');
        $this->cms()->abilities()->execute('collections/save', ['handle' => 'things', 'definition' => ['title' => 'Things', 'fields' => []]], AbilityContext::system());
        $this->as($ada, 'saved-views/create', ['list' => 'entries.things', 'name' => 'Things', 'state' => ['view' => 'table']]);
        $this->as($ada, 'saved-views/create', ['list' => 'entries.pages', 'name' => 'Pages', 'state' => ['view' => 'table']]);
        $this->as($bob, 'saved-views/create', ['list' => 'entries.things', 'name' => 'Things', 'state' => ['view' => 'table']]);

        $this->cms()->abilities()->execute('collections/delete', ['handle' => 'things'], AbilityContext::system());

        $this->assertSame(['Pages'], array_column($ada->fresh()->preferences['views'], 'name'));
        $this->assertSame([], $bob->fresh()->preferences['views']);
    }

    public function test_a_dry_run_checks_the_same_and_keeps_nothing(): void
    {
        $ada = $this->admin();
        $view = $this->as($ada, 'saved-views/create', ['list' => 'entries.pages', 'name' => 'Drafts', 'state' => ['view' => 'table']]);

        $report = $this->as($ada, 'saved-views/create', ['list' => 'entries.pages', 'name' => 'Published', 'state' => ['view' => 'table'], 'dryRun' => true]);
        $this->assertTrue(Ability::isDryRun($report));
        $this->assertSame(['full', 'create', 'Published'], [$report['checked'], $report['changes'][0]['action'], $report['changes'][0]['name']]);
        $this->assertSame('delete', $this->as($ada, 'saved-views/delete', ['id' => $view['id'], 'dryRun' => true])['changes'][0]['action']);
        $this->assertSame('Renamed', $this->as($ada, 'saved-views/update', ['id' => $view['id'], 'name' => 'Renamed', 'dryRun' => true])['changes'][0]['name']);
        $this->assertSame(['Drafts'], array_column($this->as($ada, 'saved-views/list'), 'name'));

        foreach ([['name' => 'Drafts', 'state' => ['view' => 'table']], ['name' => 'New', 'state' => ['columns' => ['nope']]]] as $input) {
            $this->assertSame('invalid_input', $this->refused($ada, 'saved-views/create', ['list' => 'entries.pages', ...$input, 'dryRun' => true])->type, 'A dry run is refused where the real run is.');
        }
    }
}

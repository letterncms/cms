<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Modules\Collaboration\Comments;
use Cms\Modules\Email\Mailer;
use Cms\Modules\Email\Message;
use Cms\Modules\Workspace\Thread;
use Cms\Modules\Workspace\Transcript;
use Cms\Modules\Workspace\Workspace;
use Cms\Tests\TestCase;
use Cms\Users\ApiToken;
use Cms\Users\User;

/**
 * What collections, fieldsets, comments, the workspace, the assistant and the agents list answer with:
 * every result here is held against its ability's output schema (see TestCase), filled and empty.
 */
final class OutputCollaborationTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/collaboration', 'letterncms/assistant', 'letterncms/mcp'];
    }

    protected function setUp(): void
    {
        parent::setUp();
        // Mentions and replies send email: none leaves the test.
        $this->app->instance(Mailer::class, new class extends Mailer
        {
            public function __construct() {}

            public function send(Message $message): void {}

            public function configured(): bool
            {
                return true;
            }
        });
        $this->app->forgetInstance(Comments::class);
    }

    private function as(User $user, string $ability, array $input = [], string $transport = 'admin'): mixed
    {
        return $this->cms()->abilities()->execute($ability, $input, AbilityContext::forUser($user, $transport));
    }

    /** The kind of refusal an ability answers with. */
    private function refused(User $user, string $ability, array $input = []): string
    {
        try {
            $this->as($user, $ability, $input);
        } catch (AbilityException $e) {
            return $e->type;
        }

        $this->fail("{$ability} was not refused.");
    }

    private function fieldsetFile(string $handle): string
    {
        return content_path("fieldsets/{$handle}.yaml");
    }

    public function test_comments_answer_as_described(): void
    {
        $ada = $this->admin(['name' => 'Ada Lovelace', 'avatar' => '/media/ada.jpg']);
        $bob = $this->userWithRole('editor');
        $id = $this->as($ada, 'entries/create', ['collection' => 'pages', 'title' => 'Launch plan'])['id'];

        $this->assertSame([], $this->as($ada, 'comments/list', ['entryId' => $id]));
        $this->assertSame([], $this->as($bob, 'comments/inbox'));

        $thread = $this->as($ada, 'comments/create', ['entryId' => $id, 'body' => 'Is this ready?', 'blockId' => 'b1', 'mentions' => [$bob->id]]);
        $this->assertSame('b1', $thread['blockId']);
        $this->assertSame([$bob->id], array_column($thread['mentions'], 'id'));
        $reply = $this->as($bob, 'comments/create', ['entryId' => $id, 'body' => 'Almost.', 'parentId' => $thread['id']]);
        $this->assertSame($thread['id'], $reply['parentId']);

        $this->travel(1)->minutes();
        $edited = $this->as($ada, 'comments/update', ['id' => $thread['id'], 'body' => '  Is this ready to go?  ']);
        $this->assertSame('Is this ready to go?', $edited['body']);
        $this->assertNotNull($edited['editedAt']);
        $this->assertTrue($edited['mine']);
        $this->assertSame('forbidden', $this->refused($this->userWithRole('author'), 'comments/update', ['id' => $thread['id'], 'body' => 'Mine now']));

        $threads = $this->as($bob, 'comments/list', ['entryId' => $id]);
        $this->assertCount(1, $threads);
        $this->assertSame(['Almost.'], array_column($threads[0]['replies'], 'body'));

        $people = $this->as($ada, 'comments/people', ['entryId' => $id]);
        $this->assertContains($bob->id, array_column($people, 'id'));
        $this->assertContains('/media/ada.jpg', array_column($people, 'avatar'));

        $inbox = $this->as($bob, 'comments/inbox');
        $this->assertSame(['mention'], array_column($inbox, 'reason'));
        $this->assertSame('Launch plan', $inbox[0]['entry']['title']);
        $this->assertSame(['yours'], array_column($this->as($ada, 'comments/inbox', ['limit' => 1]), 'reason'));

        // Presence: alone, with someone else, and after leaving; the last save names who made it.
        $alone = $this->as($ada, 'collaboration/presence', ['entryId' => $id, 'editing' => true]);
        $this->assertSame([], $alone['others']);
        $seen = $this->as($bob, 'collaboration/presence', ['entryId' => $id]);
        $this->assertSame(['/media/ada.jpg'], array_column($seen['others'], 'avatar'));
        $this->assertTrue($seen['others'][0]['editing']);
        $this->assertArrayHasKey('updatedBy', $seen);
        $this->assertSame(['others' => []], $this->as($bob, 'collaboration/presence', ['entryId' => $id, 'leave' => true]));

        $this->assertSame(['id' => $thread['id'], 'resolved' => true], $this->as($bob, 'comments/resolve', ['id' => $reply['id']]));
        $this->assertNotNull($this->as($ada, 'comments/list', ['entryId' => $id])[0]['resolvedAt']);
        $this->assertSame([], $this->as($ada, 'comments/list', ['entryId' => $id, 'resolved' => false]));

        $this->assertSame(['deleted' => 2], $this->as($ada, 'comments/delete', ['id' => $thread['id']]), 'a thread goes with its replies');
        $this->assertSame([], $this->as($ada, 'comments/list', ['entryId' => $id]));
    }

    public function test_the_assistant_says_what_it_offers(): void
    {
        $ada = $this->admin();

        $status = $this->as($ada, 'assistant/status');
        $this->assertFalse($status['configured']);
        $this->assertContains($status['model'], array_column($status['models'], 'id'));

        $this->cms()->skills()->register('proofread', ['label' => 'Proofread', 'description' => 'Check the spelling.', 'prompt' => 'Proofread {what}.']);
        $this->cms()->skills()->register('secret', ['label' => 'Secret', 'description' => 'Not for everyone.', 'prompt' => 'Hush.', 'permission' => 'settings.manage']);
        $this->assertContains('proofread', array_column($this->as($ada, 'assistant/skills'), 'name'));
        $this->assertNotContains('secret', array_column($this->as($this->userWithRole('author'), 'assistant/skills'), 'name'));

        $this->cms()->context()->register('cms://test/guide', 'Writing guide', 'How this site writes.', static fn () => 'Short sentences.', 'text/markdown');
        $resources = $this->as($ada, 'assistant/resources');
        $this->assertContains('cms://test/guide', array_column($resources, 'uri'));
        $this->assertSame('Short sentences.', $this->as($ada, 'assistant/resource', ['uri' => 'cms://test/guide']));

        // Every resource the site itself brings reads as text.
        foreach ($resources as $resource) {
            $this->assertIsString($this->as($ada, 'assistant/resource', ['uri' => $resource['uri']]));
        }

        $this->assertSame('not_found', $this->refused($ada, 'assistant/resource', ['uri' => 'cms://nothing/here']));
    }

    public function test_the_workspace_answers_as_described(): void
    {
        $ada = $this->admin();
        $this->as($ada, 'entries/create', ['collection' => 'pages', 'title' => 'Summer Menu']);

        $this->assertSame([], $this->as($ada, 'threads/list'));

        $empty = Thread::query()->create(['user_id' => $ada->id]);
        $chat = Thread::query()->create(['user_id' => $ada->id, 'title' => 'Menu', 'usage' => ['input_tokens' => 12, 'output_tokens' => 3], 'turns' => [
            Transcript::user('message', 'Hello'),
            Transcript::answer([['type' => 'text', 'text' => 'Hi.']], recap: 'Said hi.'),
            Transcript::user('command', 'New Page', ['command' => ['ability' => 'entries/create', 'label' => 'New Page', 'input' => ['collection' => 'pages']]]),
            Transcript::answer([['type' => 'tool', 'id' => 't1', 'name' => 'entries_delete', 'label' => 'Delete Entry', 'status' => 'awaiting', 'input' => ['id' => 'x']], ['type' => 'approval', 'calls' => [['id' => 't1', 'name' => 'entries_delete', 'label' => 'Delete Entry', 'input' => ['id' => 'x'], 'destructive' => true]]]]),
        ]]);

        $this->assertEqualsCanonicalizing([$empty->id, $chat->id], array_column($this->as($ada, 'threads/list', ['limit' => 5]), 'id'));

        $blank = $this->as($ada, 'threads/get', ['id' => $empty->id]);
        $this->assertSame([[], [], null, null], [$blank['turns'], $blank['awaiting'], $blank['agent'], $blank['usage']]);

        $shown = $this->as($ada, 'threads/get', ['id' => $chat->id]);
        $this->assertCount(4, $shown['turns']);
        $this->assertArrayNotHasKey('recap', $shown['turns'][1]);
        $this->assertSame(['t1'], array_column($shown['awaiting'], 'id'));
        $this->assertSame(12, $shown['usage']['input_tokens']);

        // What the workspace writes itself: a command answered with a view, a search with what was found.
        $workspace = $this->app->make(Workspace::class);
        $workspace->command($chat, $ada, 'entries/create', ['collection' => 'pages', 'title' => 'Winter Menu'], 'New Page', static fn () => null, 'Pages');
        $workspace->command($chat, $ada, 'entries/list', ['collection' => 'pages'], null, static fn () => null);
        $workspace->search($chat, $ada, 'Menu', static fn () => null);
        $workspace->search($chat, $ada, 'zzzqqq', static fn () => null);
        $ran = $this->as($ada, 'threads/get', ['id' => $chat->id])['turns'];
        $this->assertSame('Pages', $ran[4]['command']['detail']);
        $this->assertSame(['view', 'view', 'view', 'view'], [$ran[5]['parts'][0]['type'], $ran[7]['parts'][0]['type'], $ran[9]['parts'][0]['type'], $ran[11]['parts'][0]['type']]);
        $this->assertNotEmpty($ran[9]['parts'][0]['view']['children'][0]['children']);

        // What an agent's answer may hold: every kind of part, an interface it composed, and its own state.
        $surface = ['version' => 1, 'id' => 's1', 'title' => 'Pick one', 'spec' => ['root' => 'a', 'elements' => [
            'a' => ['type' => 'ui/stack', 'props' => [], 'children' => ['b']],
            'b' => ['type' => 'ui/action', 'props' => ['label' => 'Go'], 'on' => ['submit' => ['action' => 'entries/create', 'params' => ['collection' => 'pages']]]],
        ]]];
        $agent = Thread::query()->create(['user_id' => $ada->id, 'agent' => 'assistant', 'agent_state' => ['model' => 'some-model'], 'usage' => [], 'turns' => [
            Transcript::user('message', 'Show me', ['attached' => [['label' => 'Summer Menu', 'kind' => 'entry', 'icon' => 'file', 'to' => '/content/pages/x'], ['label' => 'Proofread']], 'replaces' => 'earlier']),
            Transcript::answer([
                ['type' => 'thinking', 'text' => 'Hm.'],
                ['type' => 'tool', 'id' => 't1', 'name' => 'entries_list', 'label' => 'List Entries', 'status' => 'running'],
                ['type' => 'tool', 'id' => 't2', 'name' => 'ui_present', 'label' => 'Show', 'ability' => 'entries/list', 'input' => [], 'status' => 'ok', 'output' => '{}', 'surface' => $surface, 'used' => true],
                ['type' => 'surface', 'surface' => $surface],
                ['type' => 'notice', 'tone' => 'warning', 'message' => 'Paused.'],
                ['type' => 'approval', 'calls' => [['id' => 't3', 'name' => 'entries_delete', 'label' => 'Delete Entry', 'input' => [], 'destructive' => true, 'untrusted' => false, 'ability' => 'entries/delete']], 'decided' => true],
            ], agent: 'assistant'),
            Transcript::user('action', 'Selected an action.'),
        ]]);
        $answered = $this->as($ada, 'threads/get', ['id' => $agent->id]);
        $this->assertSame(['model' => 'some-model'], $answered['agent']);
        $this->assertSame([[], []], [$answered['awaiting'], $answered['usage']]);
        $this->assertSame('assistant', $answered['turns'][1]['agent']);

        $this->assertSame('Lunch', $this->as($ada, 'threads/rename', ['id' => $chat->id, 'title' => ' Lunch '])['title']);
        $this->assertSame('Lunch', $this->as($ada, 'threads/rename', ['id' => $chat->id])['title'], 'without an agent the name stays');
        $this->assertSame('not_found', $this->refused($this->admin(), 'threads/get', ['id' => $chat->id]));

        $this->assertSame(['deleted' => true], $this->as($ada, 'threads/delete', ['id' => $empty->id]));
        $this->assertSame(['deleted' => false], $this->as($ada, 'threads/delete', ['id' => $empty->id]));

        $found = $this->as($ada, 'workspace/search', ['query' => 'Summer']);
        $this->assertSame('Summer', $found['query']);
        $this->assertContains('Summer Menu', array_column(array_merge(...array_column($found['sections'], 'items')), 'label'));
        $this->assertNotEmpty($this->as($ada, 'workspace/search', ['query' => 'pages'])['sections']);
        $this->assertSame([], $this->as($ada, 'workspace/search', ['query' => 'zzzqqq'])['sections']);

        $this->assertSame(['to' => '/content/pages', 'label' => 'Pages'], $this->as($ada, 'admin/open', ['to' => '/admin/content/pages'], 'assistant'));
        $this->assertSame(['to' => '/nowhere?tab=x', 'label' => 'There'], $this->as($ada, 'admin/open', ['to' => '/nowhere?tab=x', 'label' => 'There'], 'assistant'));

        $commands = $this->as($ada, 'workspace/commands');
        $this->assertContains('entries/create', array_column($commands, 'name'));
        $this->assertNotContains('threads/list', array_column($commands, 'name'));
        $this->assertNotEmpty($this->as($this->userWithRole('author'), 'workspace/commands'));
    }

    public function test_agents_are_listed_with_and_without_any(): void
    {
        $ada = $this->admin();

        $none = $this->as($ada, 'mcp/agents');
        $this->assertSame([[], 0], [$none['agents'], $none['connected']]);

        ApiToken::issue($ada, 'MCP: Claude', ['*'], now()->addDay());
        ApiToken::issue($ada, 'MCP: Cursor');
        $this->as($ada, 'entries/create', ['collection' => 'pages', 'title' => 'By an agent'], 'mcp');

        $some = $this->as($ada, 'mcp/agents', ['limit' => 1]);
        $this->assertSame(2, $some['connected']);
        $this->assertCount(1, $some['agents']);
        $this->assertNull($some['agents'][0]['lastUsedAt']);
    }

    public function test_the_overview_counts_what_a_person_may_see(): void
    {
        $ada = $this->admin();

        $empty = array_column($this->as($ada, 'collections/overview'), null, 'handle');
        $this->assertSame([0, 0, null], [$empty['pages']['total'], $empty['pages']['drafts'], $empty['pages']['updatedAt']]);

        $this->as($ada, 'entries/create', ['collection' => 'pages', 'title' => 'Home', 'status' => 'published']);
        $this->as($ada, 'entries/create', ['collection' => 'pages', 'title' => 'Draft']);
        $this->as($ada, 'entries/create', ['collection' => 'notes', 'title' => 'A note']);

        $filled = array_column($this->as($ada, 'collections/overview'), null, 'handle');
        $this->assertSame([2, 1], [$filled['pages']['total'], $filled['pages']['drafts']]);
        $this->assertNotNull($filled['pages']['updatedAt']);
        $this->assertSame(1, $filled['notes']['total']);
        $this->assertSame('Post', $filled['posts']['singular']);

        // Someone else sees the collections their role lets them view, and nothing more.
        $author = $this->userWithRole('author');
        foreach ($this->as($author, 'collections/overview') as $row) {
            $this->assertTrue($author->hasPermission("entries.{$row['handle']}.view"));
        }
        $this->assertSame('forbidden', $this->refused($this->userWithRole('subscriber'), 'collections/overview'));
    }

    public function test_a_fieldset_is_saved_and_listed(): void
    {
        $ada = $this->admin();
        $before = $this->as($ada, 'fieldsets/list');
        $this->assertArrayNotHasKey('seo_bits', $before);

        $fields = [['handle' => 'meta_title', 'type' => 'text', 'label' => 'Meta Title'], ['handle' => 'meta_description', 'type' => 'textarea']];
        $saved = $this->as($ada, 'fieldsets/save', ['handle' => 'seo_bits', 'title' => 'SEO', 'fields' => $fields]);

        $this->assertSame(['title' => 'SEO', 'fields' => $fields, 'source' => 'file'], $saved);
        $this->assertFileExists($this->fieldsetFile('seo_bits'));
        $this->assertSame($fields, $this->cms()->fieldsets()->get('seo_bits'));

        $listed = $this->as($this->userWithRole('author'), 'fieldsets/list');
        $this->assertSame($saved, $listed['seo_bits'], 'anyone in the admin may read fieldsets');
        $this->assertCount(count($before) + 1, $listed);

        // Saving again replaces it, and a second one is listed beside it, by handle.
        $again = $this->as($ada, 'fieldsets/save', ['handle' => 'seo_bits', 'title' => 'Search', 'fields' => [$fields[0]]]);
        $this->assertSame(['title' => 'Search', 'fields' => [$fields[0]], 'source' => 'file'], $again);
        $this->as($ada, 'fieldsets/save', ['handle' => 'address', 'title' => 'Address', 'fields' => []]);

        $listed = $this->as($ada, 'fieldsets/list');
        $this->assertSame(['title' => 'Address', 'fields' => [], 'source' => 'file'], $listed['address']);
        $this->assertSame('Search', $listed['seo_bits']['title']);
        $handles = array_keys($listed);
        $sorted = $handles;
        sort($sorted);
        $this->assertSame($sorted, $handles);
    }

    public function test_a_fieldset_registered_in_code_is_listed_until_a_file_takes_its_place(): void
    {
        $ada = $this->admin();
        $this->cms()->fieldsets()->register('social', 'Social', [['handle' => 'handle_x', 'type' => 'text']], 'acme/social');
        $this->cms()->fieldsets()->register('plain', 'Plain', [['handle' => 'note', 'type' => 'text']]);

        $listed = $this->as($ada, 'fieldsets/list');
        $this->assertSame('acme/social', $listed['social']['source']);
        $this->assertSame('code', $listed['plain']['source']);

        $saved = $this->as($ada, 'fieldsets/save', ['handle' => 'social', 'title' => 'Our Social', 'fields' => [['handle' => 'mastodon', 'type' => 'text']]]);
        $this->assertSame(['Our Social', 'file'], [$saved['title'], $saved['source']]);
        $this->assertSame(['mastodon'], array_column($this->cms()->fieldsets()->get('social'), 'handle'));
    }

    public function test_a_collection_imports_a_fieldset_into_its_blueprint(): void
    {
        $ada = $this->admin();
        $this->as($ada, 'fieldsets/save', ['handle' => 'seo_bits', 'title' => 'SEO', 'fields' => [['handle' => 'meta_title', 'type' => 'text'], ['handle' => 'meta_description', 'type' => 'textarea']]]);

        $collection = $this->as($ada, 'collections/save', ['handle' => 'articles', 'createOnly' => true, 'definition' => [
            'title' => 'Articles', 'singular' => 'Article',
            'fields' => [['handle' => 'intro', 'type' => 'text'], ['import' => 'seo_bits', 'prefix' => 'seo_'], ['import' => 'seo_bits']],
        ]]);

        $this->assertSame(['intro', 'seo_meta_title', 'seo_meta_description', 'meta_title', 'meta_description'], array_column($collection['resolvedFields'], 'handle'));
        $this->assertSame(['import' => 'seo_bits', 'prefix' => 'seo_'], $collection['fields'][1], 'the definition keeps the import as written');

        $entry = $this->as($ada, 'entries/create', ['collection' => 'articles', 'title' => 'First', 'data' => ['intro' => 'Hi', 'seo_meta_title' => 'First article']]);
        $this->assertSame('First article', $entry['data']['seo_meta_title']);

        // The fieldset changes, and the collection follows without being saved again (from the next request on: collections are read once per request).
        $this->as($ada, 'fieldsets/save', ['handle' => 'seo_bits', 'title' => 'SEO', 'fields' => [['handle' => 'meta_title', 'type' => 'text'], ['handle' => 'canonical', 'type' => 'text']]]);
        $this->cms()->collections()->flush();
        $this->assertSame(['intro', 'seo_meta_title', 'seo_canonical', 'meta_title', 'canonical'], array_column($this->cms()->collections()->findOrFail('articles')->toArray()['resolvedFields'], 'handle'));

        // A fieldset may import another; one that is missing adds nothing.
        $this->as($ada, 'fieldsets/save', ['handle' => 'page_meta', 'title' => 'Page Meta', 'fields' => [['import' => 'seo_bits'], ['import' => 'gone'], ['handle' => 'noindex', 'type' => 'toggle']]]);
        $nested = $this->as($ada, 'collections/save', ['handle' => 'landing', 'definition' => ['title' => 'Landing', 'fields' => [['import' => 'page_meta']]]]);
        $this->assertSame(['meta_title', 'canonical', 'noindex'], array_column($nested['resolvedFields'], 'handle'));

        // Importing the same fields twice under one name is refused where the collection is saved.
        $this->assertSame('invalid_input', $this->refused($ada, 'collections/save', ['handle' => 'twice', 'definition' => ['title' => 'Twice', 'fields' => [['import' => 'seo_bits'], ['import' => 'seo_bits']]]]));
        $this->assertNull($this->cms()->collections()->find('twice'));
    }

    public function test_a_collection_answers_with_its_definition_as_written(): void
    {
        $ada = $this->admin();
        $before = array_column($this->as($ada, 'collections/editable'), 'handle');
        $this->assertNotContains('recipes', $before);

        // Only what a definition must have: the rest is left out or at its default.
        $plain = $this->as($ada, 'collections/save', ['handle' => 'plain', 'definition' => ['title' => 'Plain']]);
        $this->assertSame(['table', null, [], []], [$plain['default_view'], $plain['default_columns'], $plain['fields'], $plain['resolvedFields']]);
        $this->assertArrayNotHasKey('route', $plain);

        // Everything a definition may say, and a key of its own.
        $definition = [
            'title' => 'Recipes', 'singular' => 'Recipe', 'icon' => 'file', 'description' => 'What we cook.', 'driver' => 'files', 'structure' => 'tree',
            'route' => '/recipes/{slug}', 'template' => 'recipe', 'sort' => 'title', 'home' => 'start', 'body' => 'steps', 'revisions' => false, 'per_page' => 5,
            'section' => 'kitchen', 'default_view' => 'grid', 'default_columns' => ['status', 'field:steps'], 'nav_order' => 3, 'routes' => ['de' => '/rezepte/{slug}'],
            'fields' => [['handle' => 'steps', 'type' => 'textarea', 'label' => 'Steps', 'required' => true, 'instructions' => 'One per line.', 'width' => 'half']],
        ];
        $saved = $this->as($ada, 'collections/save', ['handle' => 'recipes', 'createOnly' => true, 'definition' => $definition]);
        $this->assertSame([false, 5, 'kitchen', 'grid', ['status', 'field:steps'], 3, ['de' => '/rezepte/{slug}']], [$saved['revisions'], $saved['per_page'], $saved['section'], $saved['default_view'], $saved['default_columns'], $saved['nav_order'], $saved['routes']]);
        $this->assertNotNull($saved['updatedAt']);
        $this->assertSame('invalid_input', $this->refused($ada, 'collections/save', ['handle' => 'recipes', 'createOnly' => true, 'definition' => $definition]));
        $this->assertSame('Dishes', $this->as($ada, 'collections/save', ['handle' => 'recipes', 'definition' => [...$definition, 'title' => 'Dishes']])['title']);

        $this->as($ada, 'entries/create', ['collection' => 'recipes', 'title' => 'Soup']);
        $editable = array_column($this->as($ada, 'collections/editable'), null, 'handle');
        $this->assertSame([1, '/recipes/{slug}', 'tree'], [$editable['recipes']['count'], $editable['recipes']['route'], $editable['recipes']['structure']]);
        $this->assertSame([0, null], [$editable['plain']['count'], $editable['plain']['route']]);

        $this->assertSame('invalid_input', $this->refused($ada, 'collections/delete', ['handle' => 'recipes']));
        $this->assertSame(['deleted' => 'recipes', 'deletedEntries' => 1], $this->as($ada, 'collections/delete', ['handle' => 'recipes', 'deleteEntries' => true]));
        $this->assertSame(['deleted' => 'plain', 'deletedEntries' => 0], $this->as($ada, 'collections/delete', ['handle' => 'plain']));
    }

    public function test_a_fieldset_that_is_not_one_is_refused(): void
    {
        $ada = $this->admin();
        $field = ['handle' => 'meta_title', 'type' => 'text'];

        foreach (['Bad Handle', '../escape', '', '-dash', str_repeat('a', 65)] as $handle) {
            $this->assertSame('invalid_input', $this->refused($ada, 'fieldsets/save', ['handle' => $handle, 'title' => 'X', 'fields' => [$field]]), "handle “{$handle}”");
        }

        $this->assertSame('invalid_input', $this->refused($ada, 'fieldsets/save', ['handle' => 'seo_bits', 'fields' => [$field]]), 'no title');
        $this->assertSame('invalid_input', $this->refused($ada, 'fieldsets/save', ['handle' => 'seo_bits', 'title' => 'SEO']), 'no fields');
        $this->assertSame('invalid_input', $this->refused($ada, 'fieldsets/save', ['handle' => 'seo_bits', 'title' => str_repeat('x', 121), 'fields' => [$field]]), 'a title too long');
        $this->assertSame('invalid_input', $this->refused($ada, 'fieldsets/save', ['handle' => 'seo_bits', 'title' => 'SEO', 'fields' => ['meta_title']]), 'a field that is a word');
        $this->assertSame('invalid_input', $this->refused($ada, 'fieldsets/save', ['handle' => 'seo_bits', 'title' => 'SEO', 'fields' => [['handle' => 'Meta-Title', 'type' => 'text']]]), 'a field handle with a dash');
        $this->assertSame('invalid_input', $this->refused($ada, 'fieldsets/save', ['handle' => 'seo_bits', 'title' => 'SEO', 'fields' => [['type' => 'text']]]), 'a field without a handle');

        $this->assertSame('invalid_input', $this->refused($ada, 'fieldsets/save', ['handle' => 'seo_bits', 'title' => 'SEO', 'fields' => [['handle' => 'meta_title', 'type' => 'no_such_type']]]), 'a field type nobody registered');

        $this->assertSame('forbidden', $this->refused($this->userWithRole('author'), 'fieldsets/save', ['handle' => 'seo_bits', 'title' => 'SEO', 'fields' => [$field]]));

        $this->assertFileDoesNotExist($this->fieldsetFile('seo_bits'));
        $this->assertArrayNotHasKey('seo_bits', $this->as($ada, 'fieldsets/list'));
    }
}

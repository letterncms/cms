<?php

declare(strict_types=1);

namespace Cms\Modules\Workspace\Tests;

use Closure;
use Illuminate\Support\Facades\DB;
use Cms\Abilities\AbilityContext;
use Cms\Contracts\Agent;
use Cms\Contracts\AgentMessage;
use Cms\Contracts\Defaults\NoAgent;
use Cms\Modules\Workspace\Answers;
use Cms\Install\Installer;
use Cms\Modules\Workspace\Thread;
use Cms\Modules\Workspace\Workspace;
use Cms\Tests\TestCase;
use Cms\Users\User;

/** The workspace: a thread that runs commands, searches and, with an agent, answers plain language, as its person and only theirs. */
final class WorkspaceTest extends TestCase
{
    private function turn(array $body): array
    {
        $response = $this->postJson('/api/admin/workspace/turn', $body);
        $response->assertOk()->assertHeader('Content-Type', 'text/event-stream; charset=utf-8');

        return self::events($response->streamedContent());
    }

    /** @return list<array{0: string, 1: array}> */
    private static function events(string $stream): array
    {
        $events = [];
        foreach (array_filter(explode("\n\n", $stream)) as $chunk) {
            preg_match('/^event: (.+)$/m', $chunk, $event);
            preg_match('/^data: (.+)$/m', $chunk, $data);
            $events[] = [$event[1], json_decode($data[1], true)];
        }

        return $events;
    }

    private static function of(array $events, string $name): array
    {
        return array_values(array_map(static fn ($e) => $e[1], array_filter($events, static fn ($e) => $e[0] === $name)));
    }

    /** Every node of a view, depth first, actions' dialogs left out. */
    private static function nodes(array $node): array
    {
        return [$node, ...array_merge([], ...array_map(self::nodes(...), $node['children'] ?? []))];
    }

    private function fake(): FakeAgent
    {
        $agent = new FakeAgent;
        $this->app->instance(Agent::class, $agent);
        $this->app->forgetInstance(Workspace::class);

        return $agent;
    }

    public function test_a_command_runs_as_the_person_and_is_answered_with_a_view_to_act_on(): void
    {
        $admin = $this->admin();
        $this->actingAs($admin);

        $events = $this->turn(['command' => ['ability' => 'entries/create', 'input' => ['collection' => 'pages', 'title' => 'Summer Menu'], 'label' => 'New Page']]);

        $this->assertSame(['thread', 'turn', 'turn', 'done'], array_column($events, 0));
        $thread = Thread::query()->sole();
        $this->assertSame('New Page', $thread->title);
        [$user, $answer] = $thread->turns;
        $this->assertSame(['role' => 'user', 'kind' => 'command', 'text' => 'New Page'], array_intersect_key($user, ['role' => 1, 'kind' => 1, 'text' => 1]));
        $this->assertSame(['ability' => 'entries/create', 'label' => 'New Page', 'input' => ['collection' => 'pages', 'title' => 'Summer Menu']], $user['command']);

        // Through the one executor: the change is made, as the person, and recorded.
        $entry = $this->cms()->entries()->findByUri('/summer-menu');
        $this->assertNotNull($entry);
        $this->assertDatabaseHas('audit_log', ['ability' => 'entries/create', 'transport' => 'admin', 'user_id' => $admin->id]);

        // The entry's own answer: said in a line, with what comes next.
        $view = $answer['parts'][0]['view'];
        $nodes = self::nodes($view);
        $this->assertSame('ui/notice', $nodes[1]['type']);
        $this->assertStringContainsString('Summer Menu', $nodes[1]['props']['title']);
        $actions = array_column($nodes[2]['props']['items'], 'label');
        $this->assertSame(['Open', 'Publish', 'Delete'], $actions);
        $this->assertSame('/content/pages/'.$entry->id, $nodes[2]['props']['items'][0]['to']);
        $this->assertSame(['ability' => 'entries/publish', 'input' => ['id' => $entry->id]], array_intersect_key($nodes[2]['props']['items'][1], ['ability' => 1, 'input' => 1]));
        // What the browser gets, it gets as stored, without what is kept for an agent.
        $this->assertArrayNotHasKey('recap', self::of($events, 'turn')[1]['turn']);
        $this->assertArrayHasKey('recap', $answer);
    }

    public function test_a_failed_command_writes_nothing_and_says_what_was_wrong(): void
    {
        $this->actingAs($this->admin());

        $events = $this->turn(['command' => ['ability' => 'entries/create', 'input' => ['collection' => 'pages']]]);

        $this->assertSame(['error'], array_column($events, 0));
        $this->assertSame('invalid_input', $events[0][1]['type']);
        $this->assertArrayHasKey('title', $events[0][1]['details']);
        $this->assertSame(0, Thread::query()->count());
    }

    public function test_commands_keep_to_what_the_person_may_do(): void
    {
        $author = $this->userWithRole('author');
        $this->actingAs($author);

        $events = $this->turn(['command' => ['ability' => 'users/create', 'input' => ['name' => 'X', 'email' => 'x@example.com', 'roles' => ['editor']]]]);
        $this->assertSame('forbidden', $events[0][1]['type']);

        // What / offers is what they may run, in their language, by what it belongs to.
        $commands = $this->postJson('/api/admin/abilities/workspace/commands')->assertOk()->json('data');
        $names = array_column($commands, 'name');
        $this->assertContains('entries/create', $names);
        $this->assertNotContains('collections/save', $names);
        $this->assertNotContains('threads/delete', $names, 'the workspace’s own plumbing is no command');
        $this->assertNotContains('views/get', $names);
        $create = array_find($commands, static fn ($c) => $c['name'] === 'entries/create');
        $this->assertSame(['Create Entry', 'Content'], [$create['label'], $create['group']]);
        $this->assertSame(['collection', 'title'], $create['input']['required']);
    }

    public function test_generic_and_curated_answers_are_views_the_person_may_see(): void
    {
        $admin = $this->admin();
        $answers = $this->app->make(Answers::class);
        $abilities = $this->cms()->abilities();

        // A list: records, with columns from its first useful values, each opening where it is.
        $abilities->execute('entries/create', ['collection' => 'pages', 'title' => 'About {user.email}'], AbilityContext::system());
        $list = $abilities->execute('entries/list', ['collection' => 'pages'], AbilityContext::system());
        $view = $answers->command($abilities->get('entries/list'), ['collection' => 'pages'], $list, $admin);
        $this->assertSame('ui/records', $view['type']);
        $this->assertSame('title', $view['props']['columns'][0]['key']);
        $this->assertSame('/content/{row.collection}/{row.id}', $view['props']['open']['to']);
        // Values are kept as they were written: a view fills in templates, a title is no template.
        $this->assertSame('About {{user.email}}', $view['props']['rows'][0]['title']);

        // A record: its values, and a way to it.
        $entry = $abilities->execute('entries/get', ['id' => $list['items'][0]['id']], AbilityContext::system());
        $view = $answers->command($abilities->get('entries/get'), [], $entry, $admin);
        $this->assertSame(['ui/stack', 'ui/detail', 'ui/actions'], array_column(self::nodes($view), 'type'));

        // Anything else, in words.
        $this->assertSame(['type' => 'ui/text', 'props' => ['text' => 'Done.']], $answers->command($abilities->get('entries/reorder'), [], true, $admin));

        // Curated answers leave out what the person may not do.
        $author = $this->userWithRole('author');
        $page = $abilities->execute('entries/create', ['collection' => 'pages', 'title' => 'Draft'], AbilityContext::forUser($author, 'admin'));
        $view = $answers->command($abilities->get('entries/create'), ['collection' => 'pages', 'title' => 'Draft'], $page, $author);
        $labels = array_column(self::nodes($view)[2]['props']['items'], 'label');
        $this->assertContains('Open', $labels);
        $this->assertNotContains('Publish', $labels, 'an author may not publish');
    }

    public function test_every_curated_answer_validates(): void
    {
        $admin = $this->admin();
        $abilities = $this->cms()->abilities();
        $as = AbilityContext::forUser($admin, 'admin');
        $answers = $this->app->make(Answers::class);
        $run = function (string $name, array $input) use ($abilities, $as, $answers, $admin): array {
            $result = $abilities->execute($name, $input, $as);
            $this->assertNotNull($abilities->get($name)->answer, "{$name} has an answer of its own");
            $view = $answers->command($abilities->get($name), $input, $result, $admin);
            $this->assertSame('ui/stack', $view['type'], $name);
            $this->assertSame('success', $view['children'][0]['props']['tone'], $name);

            return $result;
        };

        $page = $run('entries/create', ['collection' => 'pages', 'title' => 'Menu']);
        $run('entries/update', ['id' => $page['id'], 'title' => 'Summer Menu']);
        $run('entries/publish', ['id' => $page['id']]);
        $run('entries/unpublish', ['id' => $page['id']]);
        $copy = $run('entries/duplicate', ['id' => $page['id']]);
        $deleted = $answers->command($abilities->get('entries/delete'), [], $abilities->execute('entries/delete', ['id' => $copy['id']], $as), $admin);
        $this->assertSame('Deleted “Summer Menu (copy)”', $deleted['children'][0]['props']['title']);
        $person = $run('users/create', ['name' => 'Grace', 'email' => 'grace@example.com', 'roles' => ['editor']]);
        $run('users/invite', ['id' => $person['id']]);
        $gone = $run('users/delete', ['id' => $person['id']]);
        $this->assertSame('Grace', $gone['name']);
        $run('settings/update', ['namespace' => 'site', 'values' => ['name' => 'Renamed']]);
        // A save says what changed, when it was a few things.
        $saved = $answers->command($abilities->get('settings/update'), ['namespace' => 'site', 'values' => ['name' => 'Renamed']], [], $admin);
        $this->assertSame('Saved General: Name', $saved['children'][0]['props']['title']);
        $run('globals/save', ['title' => 'Opening Hours', 'fields' => [['handle' => 'hours', 'type' => 'text', 'label' => 'Hours']]]);
        $run('globals/set', ['handle' => 'opening_hours', 'values' => ['hours' => '9–5']]);
    }

    public function test_a_button_left_on_view_says_what_it_was_for_is_gone(): void
    {
        $this->actingAs($this->admin());
        $page = $this->cms()->abilities()->execute('entries/create', ['collection' => 'pages', 'title' => 'Gone'], AbilityContext::system());
        $this->cms()->abilities()->execute('entries/delete', ['id' => $page['id']], AbilityContext::system());

        $events = $this->turn(['command' => ['ability' => 'entries/publish', 'input' => ['id' => $page['id']], 'label' => 'Publish']]);
        $this->assertSame(['not_found', 'This entry no longer exists.'], [$events[0][1]['type'], $events[0][1]['message']]);
    }

    public function test_a_command_keeps_what_was_chosen_in_words(): void
    {
        $this->actingAs($this->admin());
        $this->turn(['command' => ['ability' => 'entries/create', 'input' => ['collection' => 'pages', 'title' => 'Menu'], 'label' => 'New Page', 'detail' => 'Menu']]);
        $this->assertSame('Menu', Thread::query()->sole()->turns[0]['command']['detail']);

        // A search names a thread as it was asked, capitalized.
        $this->turn(['search' => 'pricing']);
        $this->assertSame('Pricing', Thread::query()->latest('id')->first()->title);
    }

    public function test_an_agent_opens_places_of_the_admin_the_person_may_see(): void
    {
        $admin = $this->admin();
        $open = fn (array $in, ?User $user = null, string $via = 'assistant') => $this->cms()->abilities()->execute('admin/open', $in, AbilityContext::forUser($user ?? $admin, $via));
        $page = $this->cms()->abilities()->execute('entries/create', ['collection' => 'pages', 'title' => 'Summer Menu'], AbilityContext::system());

        $this->assertSame(['to' => '/content/pages/'.$page['id'], 'label' => 'Summer Menu'], $open(['to' => '/content/pages/'.$page['id'], 'label' => 'Summer Menu']));
        $this->assertSame('/settings/site?field=name', $open(['to' => '/admin/settings/site?field=name'])['to'], 'the admin’s prefix is taken off');
        $this->assertSame(['to' => '/users?tab=visitors', 'label' => 'Users'], $open(['to' => '/users?tab=visitors']));
        $this->assertSame('/forms?do=new-form', $open(['to' => '/forms?do=new-form'])['to'], 'a place it doesn’t know passes: the admin says Not Found');

        foreach (['https://example.com', '//example.com/x', 'javascript:alert(1)', '/content/../../etc', 'content/pages', '/a b'] as $to) {
            try {
                $open(['to' => $to]);
                $this->fail("{$to} was opened");
            } catch (\Cms\Abilities\AbilityException $e) {
                $this->assertSame('invalid_input', $e->type, $to);
            }
        }

        // Only what the person may see: an author has no Users, no settings of the site, and only the collections they may view.
        $author = $this->userWithRole('author');
        foreach (['/users', '/settings/site', '/audit'] as $to) {
            try {
                $open(['to' => $to], $author);
                $this->fail("{$to} opened for an author");
            } catch (\Cms\Abilities\AbilityException $e) {
                $this->assertSame('forbidden', $e->type, $to);
            }
        }
        $this->assertSame('/content/pages', $open(['to' => '/content/pages'], $author)['to']);

        // For an agent beside the admin and the admin itself; no MCP, API or CLI, which have no admin open. And it asks nothing: it changes nothing.
        $ability = $this->cms()->abilities()->get('admin/open');
        $this->assertSame([true, true, false, false, false], array_map($ability->exposedTo(...), ['assistant', 'admin', 'mcp', 'rest', 'cli']));
        $this->assertTrue($ability->isReadOnly() && $ability->annotations['trustedOutput']);
        $this->actingAs($admin);
        $this->assertNotContains('admin/open', array_column($this->postJson('/api/admin/abilities/workspace/commands')->json('data'), 'name'), 'it is no command for /');
    }

    public function test_search_finds_only_what_the_person_may_see(): void
    {
        $admin = $this->admin(['name' => 'Ada Lovelace']);
        $this->cms()->abilities()->execute('entries/create', ['collection' => 'pages', 'title' => 'Lovelace Lab'], AbilityContext::system());
        $this->cms()->abilities()->execute('entries/create', ['collection' => 'posts', 'title' => 'Lovelace News', 'data' => ['excerpt' => 'x']], AbilityContext::system());

        $found = $this->cms()->abilities()->execute('workspace/search', ['query' => 'Lovelace'], AbilityContext::forUser($admin, 'admin'));
        $this->assertSame(['entries', 'people'], array_column($found['sections'], 'id'));
        $this->assertSame('Ada Lovelace', $found['sections'][1]['items'][0]['label']);

        // An author sees no people.
        $found = $this->cms()->abilities()->execute('workspace/search', ['query' => 'Lovelace'], AbilityContext::forUser($this->userWithRole('author'), 'admin'));
        $this->assertSame(['entries'], array_column($found['sections'], 'id'));

        // Places by their names; plugins add sections of their own.
        $this->cms()->hooks()->addFilter('workspace.search', static fn (array $sections, string $query) => [...$sections, ['id' => 'extra', 'title' => 'Extra', 'items' => [['label' => "Found {$query}", 'to' => '/extra'], ['label' => 'Elsewhere', 'to' => 'https://example.com']]]]);
        $found = $this->cms()->abilities()->execute('workspace/search', ['query' => 'Settings'], AbilityContext::forUser($admin, 'admin'));
        $this->assertSame('places', $found['sections'][0]['id']);
        $this->assertSame([['label' => 'Found Settings', 'to' => '/extra']], array_find($found['sections'], static fn ($s) => $s['id'] === 'extra')['items'], 'only places of the admin');
    }

    public function test_without_an_agent_a_message_is_a_search_and_nothing_mentions_ai(): void
    {
        $this->assertInstanceOf(NoAgent::class, $this->app->make(Agent::class));
        $admin = $this->admin();
        $this->actingAs($admin);
        $this->cms()->abilities()->execute('entries/create', ['collection' => 'pages', 'title' => 'Pricing'], AbilityContext::system());

        $this->getJson('/api/admin/manifest')->assertOk()->assertJsonPath('data.config.workspace.agent', null);
        $events = $this->turn(['message' => 'Pricing']);
        $this->assertSame(['thread', 'turn', 'turn', 'done'], array_column($events, 0), json_encode($events));

        $thread = Thread::query()->sole();
        $this->assertSame('search', $thread->turns[0]['kind']);
        // A light list of lines, each with what it is and where it opens.
        $links = array_values(array_filter(self::nodes($thread->turns[1]['parts'][0]['view']), static fn ($n) => $n['type'] === 'ui/links'));
        $this->assertSame('Pricing', $links[0]['props']['items'][0]['label']);
        $this->assertStringStartsWith('Page', $links[0]['props']['items'][0]['detail']);
        $this->assertNull($thread->agent);
        $this->assertSame('done', end($events)[0]);
        // Nothing to approve or click for an agent there is not.
        $this->postJson('/api/admin/workspace/turn', ['thread' => $thread->id, 'approve' => []])->assertStatus(422);
    }

    public function test_threads_are_their_persons_and_encrypted_at_rest(): void
    {
        $owner = $this->admin();
        $this->actingAs($owner);
        $this->turn(['search' => 'Secret plans']);
        $thread = Thread::query()->sole();

        $raw = DB::table('workspace_threads')->where('id', $thread->id)->first();
        $this->assertStringNotContainsString('Secret plans', $raw->title.$raw->turns);
        $this->assertSame('Secret plans', $thread->title);

        $this->actingAs($this->admin(['email' => 'other@example.com']));
        $this->postJson('/api/admin/workspace/turn', ['thread' => $thread->id, 'search' => 'x'])->assertNotFound();
        $this->postJson('/api/admin/abilities/threads/get', ['id' => $thread->id])->assertNotFound();
        $this->assertSame([], $this->postJson('/api/admin/abilities/threads/list')->assertOk()->json('data'));
        $this->postJson('/api/admin/abilities/threads/delete', ['id' => $thread->id])->assertOk()->assertJsonPath('data.deleted', false);
        $this->assertNotNull($thread->fresh());

        // Not for tokens or agents: only the person's admin.
        foreach (['rest', 'mcp', 'cli', 'assistant'] as $transport) {
            $this->assertFalse($this->cms()->abilities()->get('threads/get')->exposedTo($transport));
        }

        $owner->delete();
        $this->assertNull($thread->fresh());
    }

    public function test_history_pages_rename_and_delete(): void
    {
        $owner = $this->admin();
        $this->actingAs($owner);
        $ids = [];
        for ($i = 0; $i < 3; $i++) {
            $ids[] = Thread::query()->create(['user_id' => $owner->id, 'title' => "Chat {$i}", 'updated_at' => now()->subMinutes(10 - $i)])->id;
        }

        $this->assertSame(array_reverse($ids), array_column([...$this->postJson('/api/admin/abilities/threads/list', ['limit' => 2])->json('data'), ...$this->postJson('/api/admin/abilities/threads/list', ['limit' => 2, 'offset' => 2])->json('data')], 'id'));
        $this->postJson('/api/admin/abilities/threads/rename', ['id' => $ids[0], 'title' => 'Renamed'])->assertOk()->assertJsonPath('data.title', 'Renamed');
        // Without an agent, nothing names a chat: it keeps its name.
        $this->postJson('/api/admin/abilities/threads/rename', ['id' => $ids[1]])->assertOk()->assertJsonPath('data.title', 'Chat 1');
        $this->postJson('/api/admin/abilities/threads/delete', ['id' => $ids[2]])->assertOk()->assertJsonPath('data.deleted', true);
        $this->assertSame(2, Thread::query()->count());
    }

    public function test_chats_are_of_the_site_the_site_was(): void
    {
        $owner = $this->admin();
        $this->actingAs($owner);
        $here = Thread::query()->create(['user_id' => $owner->id, 'title' => 'Here']);
        $there = Thread::query()->create(['user_id' => $owner->id, 'title' => 'There', 'site' => 'elsewhere']);

        $this->assertSame(Installer::site(), $here->site);
        $this->assertSame([$here->id], array_column($this->postJson('/api/admin/abilities/threads/list')->json('data'), 'id'));
        $this->postJson('/api/admin/abilities/threads/get', ['id' => $there->id])->assertNotFound();
        $this->postJson('/api/admin/workspace/turn', ['thread' => $there->id, 'search' => 'menu'])->assertNotFound();
    }

    public function test_an_agent_streams_its_answer_into_the_neutral_transcript_and_learns_what_the_person_did(): void
    {
        $agent = $this->fake();
        $this->actingAs($this->admin());
        $this->getJson('/api/admin/manifest')->assertOk()->assertJsonPath('data.config.workspace.agent', ['name' => 'fake', 'label' => 'Fake']);

        $this->turn(['command' => ['ability' => 'entries/create', 'input' => ['collection' => 'pages', 'title' => 'Summer Menu'], 'label' => 'New Page']]);
        $thread = Thread::query()->sole();
        $events = $this->turn(['thread' => $thread->id, 'message' => 'Publish it', 'agent' => ['model' => 'fast'], 'context' => ['path' => '/content/pages', 'items' => [['label' => 'Pages', 'kind' => 'page', 'to' => '/content/pages', 'content' => 'What it says']]]]);

        $this->assertSame(['thread', 'turn', 'turn', 'thinking', 'text', 'text', 'tool', 'tool_result', 'done'], array_column($events, 0));
        // It saw the command the person ran before, what they said, and what the composer chose.
        $this->assertSame('Publish it', $agent->messages[0]->text);
        $this->assertSame(['model' => 'fast'], $agent->messages[0]->options);
        $this->assertSame('New Page', $agent->messages[0]->earlier[0]['text']);
        $this->assertStringContainsString('Summer Menu', \Cms\Modules\Workspace\Transcript::recap($agent->messages[0]->earlier)[0]['result']);

        $thread->refresh();
        [, , $said, $answer] = $thread->turns;
        $this->assertSame(['kind' => 'message', 'text' => 'Publish it', 'attached' => [['label' => 'Pages', 'kind' => 'page', 'to' => '/content/pages']]], array_intersect_key($said, ['kind' => 1, 'text' => 1, 'attached' => 1]));
        $this->assertSame('fake', $answer['agent']);
        $this->assertSame([
            ['type' => 'thinking', 'text' => 'Hmm'],
            ['type' => 'text', 'text' => 'On it.'],
            ['type' => 'tool', 'id' => 'call-1', 'name' => 'entries__publish', 'label' => 'Publish Entry', 'status' => 'ok', 'output' => 'Published', 'input' => ['id' => 'x']],
        ], $answer['parts']);
        $this->assertSame('fake', $thread->agent);
        $this->assertSame(['replies' => 1], $thread->agent_state);

        // The next message sees nothing it already answered.
        $this->turn(['thread' => $thread->id, 'message' => 'Thanks']);
        $this->assertSame([], $agent->messages[1]->earlier);

        // The agent names the chat; the browser sees its state.
        $this->postJson('/api/admin/abilities/threads/rename', ['id' => $thread->id])->assertOk()->assertJsonPath('data.title', 'Named by Fake');
        $this->postJson('/api/admin/abilities/threads/get', ['id' => $thread->id])->assertOk()->assertJsonPath('data.agent', ['replies' => 2]);
    }

    public function test_an_agent_asks_first_and_goes_on_once_the_person_decided(): void
    {
        $agent = $this->fake();
        $this->actingAs($this->admin());

        $events = $this->turn(['message' => 'Delete everything']);
        $thread = Thread::query()->sole();
        $this->assertSame([['id' => 'call-2', 'label' => 'Delete Entry']], array_map(static fn ($c) => array_intersect_key($c, ['id' => 1, 'label' => 1]), end($events)[1]['awaiting']));
        $this->postJson('/api/admin/abilities/threads/get', ['id' => $thread->id])->assertJsonPath('data.awaiting.0.id', 'call-2')->assertJsonPath('data.turns.1.parts.0.status', 'awaiting');

        $this->turn(['thread' => $thread->id, 'approve' => []]);
        $this->assertSame([[]], $agent->decisions);
        $thread->refresh();
        $this->assertSame('declined', $thread->turns[1]['parts'][0]['status']);
        $parts = $thread->turns[1]['parts'];
        $this->assertSame(['type' => 'text', 'text' => 'Kept it.'], end($parts));
        $this->assertSame([], \Cms\Modules\Workspace\Transcript::awaiting($thread->turns));

        // A new message declines what still waits.
        $this->turn(['thread' => $thread->id, 'message' => 'Delete everything']);
        $this->turn(['thread' => $thread->id, 'message' => 'Never mind']);
        $thread->refresh();
        $this->assertSame('declined', $thread->turns[3]['parts'][0]['status']);
    }

    public function test_editing_a_message_rewrites_it_and_what_followed(): void
    {
        $agent = $this->fake();
        $this->actingAs($this->admin());
        $this->turn(['message' => 'First']);
        $thread = Thread::query()->sole();
        $this->turn(['thread' => $thread->id, 'message' => 'Second']);
        $first = $thread->fresh()->turns[0];

        $events = $this->turn(['thread' => $thread->id, 'message' => 'Changed', 'edit' => ['turn' => $first['id'], 'original' => 'First']]);
        $turns = $thread->fresh()->turns;
        $this->assertCount(2, $turns);
        $this->assertSame(['Changed', $first['id']], [$turns[0]['text'], $turns[0]['replaces']]);
        $this->assertSame($first['id'], $agent->messages[2]->replaces);
        $this->assertSame(['edit'], $agent->calls[2] === 'edit' ? ['edit'] : [$agent->calls[2]]);
        $this->assertSame('Changed', $thread->fresh()->title);
        $this->assertSame('done', end($events)[0]);

        // An edit of what no longer says the same changes nothing.
        $events = $this->turn(['thread' => $thread->id, 'message' => 'Again', 'edit' => ['turn' => $first['id'], 'original' => 'First']]);
        $this->assertSame('error', end($events)[0]);
        $this->assertCount(2, $thread->fresh()->turns);
    }
}

/** An agent that answers from a script, and remembers what it was told. */
final class FakeAgent implements Agent
{
    /** @var list<AgentMessage> */
    public array $messages = [];

    /** @var list<string> */
    public array $calls = [];

    /** @var list<list<string>> */
    public array $decisions = [];

    public function name(): string
    {
        return 'fake';
    }

    public function label(): string
    {
        return 'Fake';
    }

    public function available(User $user): bool
    {
        return true;
    }

    public function state(Thread $thread, User $user): array
    {
        return (array) $thread->agent_state;
    }

    public function reply(Thread $thread, User $user, AgentMessage $message, Closure $emit, Closure $stopped): void
    {
        $this->messages[] = $message;
        $this->calls[] = 'reply';
        $thread->setState('replies', (int) $thread->state('replies', 0) + 1);
        $thread->save();

        if ($message->text === 'Delete everything') {
            $emit('tool', ['id' => 'call-2', 'name' => 'entries__delete', 'label' => 'Delete Entry']);
            $emit('approval', ['calls' => [['id' => 'call-2', 'name' => 'entries__delete', 'label' => 'Delete Entry', 'input' => ['id' => 'x'], 'destructive' => true]]]);

            return;
        }

        $emit('thinking', ['delta' => 'Hmm']);
        $emit('text', ['delta' => 'On ']);
        $emit('text', ['delta' => 'it.']);
        $emit('tool', ['id' => 'call-1', 'name' => 'entries__publish', 'label' => 'Publish Entry']);
        $emit('tool_result', ['id' => 'call-1', 'input' => ['id' => 'x'], 'ok' => true, 'mutated' => true, 'output' => 'Published']);
    }

    public function edit(Thread $thread, User $user, AgentMessage $message, Closure $emit, Closure $stopped): void
    {
        $this->reply($thread, $user, $message, $emit, $stopped);
        $this->calls[array_key_last($this->calls)] = 'edit';
    }

    public function decide(Thread $thread, User $user, array $approved, Closure $emit, Closure $stopped): void
    {
        $this->decisions[] = $approved;
        $emit('tool_result', ['id' => 'call-2', 'ok' => false, 'mutated' => false, 'declined' => true, 'output' => 'Declined']);
        $emit('text', ['delta' => 'Kept it.']);
    }

    public function interact(Thread $thread, User $user, array $action, Closure $emit, Closure $stopped): void {}

    public function title(Thread $thread, User $user): ?string
    {
        return 'Named by Fake';
    }
}

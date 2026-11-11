<?php

declare(strict_types=1);

namespace Cms\Modules\Collaboration\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Modules\Collaboration\Comment;
use Cms\Modules\Collaboration\Comments;
use Cms\Modules\Email\Message;
use Cms\Modules\Email\Mailer;
use Cms\Tests\TestCase;
use Cms\Users\User;

final class CollaborationTest extends TestCase
{
    /** @var list<Message> */
    private array $sent = [];

    protected function plugins(): array
    {
        return ['letterncms/collaboration'];
    }

    protected function setUp(): void
    {
        parent::setUp();
        $sent = &$this->sent;
        $this->app->instance(Mailer::class, new class($sent) extends Mailer
        {
            public function __construct(private array &$sent) {}

            public function send(Message $message): void
            {
                $this->sent[] = $message;
            }

            public function configured(): bool
            {
                return true;
            }
        });
        $this->app->forgetInstance(Comments::class);
    }

    private function as(User $user, string $ability, array $input): mixed
    {
        return $this->cms()->abilities()->execute($ability, $input, AbilityContext::forUser($user, 'admin'));
    }

    private function page(): string
    {
        return $this->cms()->entryService()->create('pages', ['title' => 'Launch plan'])->id;
    }

    public function test_presence_shows_who_else_is_here(): void
    {
        $id = $this->page();
        $ada = $this->admin(['name' => 'Ada Lovelace']);
        $bob = $this->userWithRole('editor');

        $this->assertSame([], $this->as($ada, 'collaboration/presence', ['entryId' => $id])['others']);

        $seen = $this->as($bob, 'collaboration/presence', ['entryId' => $id, 'editing' => true]);
        $this->assertSame(['Ada Lovelace'], array_column($seen['others'], 'name'));
        $this->assertNotNull($seen['updatedAt']);

        $others = $this->as($ada, 'collaboration/presence', ['entryId' => $id])['others'];
        $this->assertSame('Editor', $others[0]['name']);
        $this->assertTrue($others[0]['editing']);

        $this->as($bob, 'collaboration/presence', ['entryId' => $id, 'leave' => true]);
        $this->assertSame([], $this->as($ada, 'collaboration/presence', ['entryId' => $id])['others']);

        $this->travel(2)->minutes();
        $this->as($bob, 'collaboration/presence', ['entryId' => $id]);
        $this->travel(1)->minutes();
        $this->assertSame([], $this->as($ada, 'collaboration/presence', ['entryId' => $id])['others'], 'missed heartbeats drop people');
    }

    public function test_the_first_to_edit_holds_an_entry_until_it_is_taken_over(): void
    {
        $id = $this->page();
        $ada = $this->admin(['name' => 'Ada Lovelace']);
        $bob = $this->userWithRole('editor');

        $this->assertFalse($this->as($ada, 'collaboration/presence', ['entryId' => $id])['holding'], 'looking is not holding');
        $this->assertTrue($this->as($bob, 'collaboration/presence', ['entryId' => $id, 'editing' => true])['holding']);

        $seen = $this->as($ada, 'collaboration/presence', ['entryId' => $id, 'editing' => true]);
        $this->assertFalse($seen['holding'], 'a second editor does not take it by typing');
        $this->assertTrue($seen['others'][0]['holder']);

        $report = $this->as($ada, 'collaboration/take-over', ['entryId' => $id, 'dryRun' => true]);
        $this->assertSame(['take-over', 'Editor'], [$report['changes'][0]['action'], $report['changes'][0]['from']]);
        $this->assertTrue($this->as($bob, 'collaboration/presence', ['entryId' => $id, 'editing' => true])['holding'], 'a dry run takes nothing');

        $this->assertTrue($this->as($ada, 'collaboration/take-over', ['entryId' => $id])['holding']);
        $told = $this->as($bob, 'collaboration/presence', ['entryId' => $id, 'editing' => true]);
        $this->assertFalse($told['holding']);
        $this->assertSame(['Ada Lovelace', true], [$told['others'][0]['name'], $told['others'][0]['holder']]);

        $this->as($ada, 'collaboration/presence', ['entryId' => $id, 'leave' => true]);
        $this->assertTrue($this->as($bob, 'collaboration/presence', ['entryId' => $id, 'editing' => true])['holding'], 'free again once its holder left');
    }

    public function test_a_hold_lapses_when_its_holder_stops_editing(): void
    {
        $id = $this->page();
        $ada = $this->admin(['name' => 'Ada Lovelace']);
        $bob = $this->userWithRole('editor');

        $this->assertTrue($this->as($ada, 'collaboration/presence', ['entryId' => $id, 'editing' => true])['holding']);

        // Still there, heartbeat after heartbeat, but not touching it.
        foreach (range(1, 5) as $_) {
            $this->travel(30)->seconds();
            $idle = $this->as($ada, 'collaboration/presence', ['entryId' => $id]);
        }
        $this->assertFalse($idle['holding']);
        $this->assertTrue($this->as($bob, 'collaboration/presence', ['entryId' => $id, 'editing' => true])['holding']);
    }

    public function test_only_someone_who_may_edit_an_entry_edits_or_takes_it(): void
    {
        $id = $this->page();
        $ada = $this->admin(['name' => 'Ada Lovelace']);
        $this->cms()->settingsRegistry()->save(\Cms\Users\Roles::SETTINGS, ['roles' => [...$this->cms()->roles()->defaults(), 'viewer' => ['label' => 'Viewer', 'description' => '', 'permissions' => ['admin.access', 'entries.pages.view']]]]);
        $viewer = $this->userWithRole('viewer');

        $this->assertFalse($this->as($viewer, 'collaboration/presence', ['entryId' => $id, 'editing' => true])['holding'], 'someone who may only look does not hold it by saying they edit');
        $this->assertFalse($this->as($ada, 'collaboration/presence', ['entryId' => $id])['others'][0]['editing']);
        $this->assertArrayNotHasKey('editingBy', array_values(array_filter($this->as($ada, 'entries/list', ['collection' => 'pages'])['items'], static fn ($e) => $e['id'] === $id))[0]);

        $this->expectException(AbilityException::class);
        $this->as($viewer, 'collaboration/take-over', ['entryId' => $id]);
    }

    public function test_a_list_says_who_is_editing_an_entry(): void
    {
        $id = $this->page();
        $ada = $this->admin(['name' => 'Ada Lovelace']);
        $bob = $this->userWithRole('editor');
        $row = fn (User $as, string $ability) => array_values(array_filter(
            ($listed = $this->as($as, $ability, ['collection' => 'pages']))['items'] ?? $listed,
            static fn (array $entry) => $entry['id'] === $id,
        ))[0];

        $this->as($ada, 'collaboration/presence', ['entryId' => $id]);
        $this->assertArrayNotHasKey('editingBy', $row($bob, 'entries/list'), 'someone looking is not said');

        $this->as($ada, 'collaboration/presence', ['entryId' => $id, 'editing' => true]);
        $this->assertSame('Ada Lovelace is editing', $row($bob, 'entries/list')['editingBy']);
        $this->assertSame('Ada Lovelace is editing', $row($bob, 'entries/tree')['editingBy']);
        $this->assertArrayNotHasKey('editingBy', $row($ada, 'entries/list'), 'not said to the one editing');

        // Holding it without touching it is not editing it.
        $this->as($ada, 'collaboration/presence', ['entryId' => $id]);
        $this->assertArrayNotHasKey('editingBy', $row($bob, 'entries/list'));
    }

    public function test_threads_mentions_and_notifications(): void
    {
        $id = $this->page();
        $ada = $this->admin(['name' => 'Ada']);
        $bob = $this->userWithRole('editor');
        $cy = $this->userWithRole('author');

        $people = array_column($this->as($ada, 'comments/people', ['entryId' => $id]), 'id');
        $this->assertContains($bob->id, $people);

        $thread = $this->as($ada, 'comments/create', ['entryId' => $id, 'body' => '@Editor can you check the pricing?', 'mentions' => [$bob->id]]);
        $this->assertSame('Editor', $thread['mentions'][0]['name']);
        $this->assertCount(1, $this->sent);
        $this->assertSame($bob->email, $this->sent[0]->to);
        $this->assertSame('Ada mentioned you on “Launch plan”', $this->sent[0]->subject);

        // Replies attach to the thread (even when answering a reply) and notify everyone in it.
        $reply = $this->as($bob, 'comments/create', ['entryId' => $id, 'body' => 'Done.', 'parentId' => $thread['id']]);
        $this->as($cy, 'comments/create', ['entryId' => $id, 'body' => 'Looks good', 'parentId' => $reply['id']]);
        $this->assertSame([$bob->email, $ada->email, $ada->email, $bob->email], array_map(static fn ($m) => $m->to, $this->sent));

        $this->as($ada, 'comments/resolve', ['id' => $reply['id']]);
        $threads = $this->as($ada, 'comments/list', ['entryId' => $id]);
        $this->assertTrue($threads[0]['resolved']);
        $this->assertCount(2, $threads[0]['replies']);
        $this->assertSame([], $this->as($ada, 'comments/list', ['entryId' => $id, 'resolved' => false]));

        $this->as($bob, 'comments/create', ['entryId' => $id, 'body' => 'One more thing', 'parentId' => $thread['id']]);
        $this->assertFalse($this->as($ada, 'comments/list', ['entryId' => $id])[0]['resolved'], 'a new reply reopens the thread');
    }

    public function test_inbox_lists_open_threads_that_need_me(): void
    {
        $id = $this->page();
        $ada = $this->admin();
        $bob = $this->userWithRole('editor');

        $this->as($ada, 'comments/create', ['entryId' => $id, 'body' => 'Please review', 'mentions' => [$bob->id]]);
        $inbox = $this->as($bob, 'comments/inbox', []);

        $this->assertCount(1, $inbox);
        $this->assertSame('mention', $inbox[0]['reason']);
        $this->assertSame('Launch plan', $inbox[0]['entry']['title']);
        $this->assertSame([], $this->as($ada, 'comments/inbox', []), 'your own comments are not in your inbox');
    }

    public function test_only_people_with_access_can_be_mentioned_or_change_comments(): void
    {
        $id = $this->page();
        $ada = $this->admin();
        $author = $this->userWithRole('author');
        $outsider = User::query()->create(['name' => 'Visitor', 'email' => 'v@example.com', 'password' => 'secret-pass-123', 'roles' => []]);

        try {
            $this->as($ada, 'comments/create', ['entryId' => $id, 'body' => 'Hi', 'mentions' => [$outsider->id]]);
            $this->fail('Mentioning someone without access must fail.');
        } catch (AbilityException $e) {
            $this->assertStringContainsString('can see this entry', $e->getMessage());
        }

        $mine = $this->as($ada, 'comments/create', ['entryId' => $id, 'body' => 'Mine']);

        $this->expectException(AbilityException::class);
        $this->as($author, 'comments/delete', ['id' => $mine['id']]);
    }

    public function test_deleting_an_entry_deletes_its_comments(): void
    {
        $id = $this->page();
        $ada = $this->admin();
        $bob = $this->userWithRole('editor');
        $this->as($ada, 'comments/create', ['entryId' => $id, 'body' => 'Note', 'mentions' => [$bob->id]]);

        $this->cms()->entryService()->delete($id);

        $this->assertSame(0, Comment::query()->count());
        $this->assertDatabaseCount('comment_mentions', 0);
    }
}

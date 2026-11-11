<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Content\Entries\Entry;
use Cms\Content\Entries\EntryGate;
use Cms\Support\Yaml;
use Cms\Tests\TestCase;
use Cms\Users\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

/** `cms migrate` renames the role `member` to `visitor` in what a site has stored. */
final class VisitorRoleMigrationTest extends TestCase
{
    private const string MIGRATION = '2026_11_11_000000_rename_member_role_to_visitor';

    /** Every lesson is for visitors and subscribers, unless it says otherwise. Written here: setting up a test migrates too. */
    private function lessons(): void
    {
        Yaml::write(content_path('collections/lessons.yaml'), ['title' => 'Lessons', 'route' => '/lessons/{slug}', 'gate' => ['mode' => 'locked', 'access' => ['member', 'subscriber'], 'teaser_words' => 20], 'fields' => [['handle' => 'summary', 'type' => 'text']]]);
        Yaml::write(site_path('config/accounts.yaml'), ['enabled' => true]);
        cms()->collections()->flush();
        cms()->settingsRegistry()->forget('accounts');
    }

    private function user(string $email, ?array $roles): User
    {
        return User::query()->create(['name' => $email, 'email' => $email, 'password' => 'secret-secret', 'roles' => $roles]);
    }

    /** As on a site that was installed before the rename: the migration has not run yet. */
    private function migrate(): void
    {
        $this->assertSame(1, DB::table('migrations')->where('migration', self::MIGRATION)->delete());
        $this->assertSame(0, Artisan::call('migrate', ['--force' => true]));
        $this->assertSame(1, DB::table('migrations')->where('migration', self::MIGRATION)->count());
    }

    private function again(): void
    {
        (require database_path('migrations/'.self::MIGRATION.'.php'))->up();
    }

    private function roles(User $user): array
    {
        return $user->fresh()->roles;
    }

    public function test_stored_members_become_visitors_and_a_second_run_changes_nothing(): void
    {
        $both = $this->user('both@example.com', ['member', 'editor']);
        $member = $this->user('member@example.com', ['member']);
        $twice = $this->user('twice@example.com', ['visitor', 'member']);
        $editor = $this->user('editor@example.com', ['editor']);
        $none = $this->user('none@example.com', null);
        Yaml::write(site_path('config/accounts.yaml'), ['enabled' => true, 'default_role' => 'member', 'sign_up' => 'open']);
        $roles = cms()->roles()->defaults();
        $stored = ['admin' => $roles['admin'], 'member' => ['label' => 'Member', 'description' => 'Ours.', 'permissions' => ['media.view']], 'editor' => $roles['editor']];
        Yaml::write(site_path('config/roles.yaml'), ['roles' => $stored]);
        cms()->settingsRegistry()->forget('accounts');
        cms()->settingsRegistry()->forget('roles');
        $this->assertSame('member', cms()->setting('accounts', 'default_role'));
        $this->assertSame(['member'], cms()->accounts()->visitorRoles());

        $this->migrate();

        $check = function () use ($both, $member, $twice, $editor, $none): void {
            $this->assertSame(['visitor', 'editor'], $this->roles($both));
            $this->assertSame(['visitor'], $this->roles($member));
            $this->assertSame(['visitor'], $this->roles($twice));
            $this->assertSame(['editor'], $this->roles($editor));
            $this->assertNull($none->fresh()->roles);
            $this->assertSame([], array_filter(DB::table('users')->pluck('roles')->all(), static fn (?string $roles) => str_contains((string) $roles, 'member')));

            // The setting, in the file and as the running code reads it; what else the file held is as it was.
            $this->assertSame(['enabled' => true, 'default_role' => 'visitor', 'sign_up' => 'open'], Yaml::read(site_path('config/accounts.yaml')));
            $this->assertSame('visitor', cms()->setting('accounts', 'default_role'));
            $this->assertSame(['visitor'], cms()->accounts()->visitorRoles());

            // The site's own role keeps its place and what it was given, under the new id.
            $file = Yaml::read(site_path('config/roles.yaml'))['roles'];
            $this->assertSame(['admin', 'visitor', 'editor'], array_keys($file));
            $this->assertSame(['label' => 'Member', 'description' => 'Ours.', 'permissions' => ['media.view']], $file['visitor']);
            $this->assertSame(['media.view'], cms()->roles()->permissionsFor($this->roles($member)));
        };

        $check();
        $this->again();
        $check();
        $this->migrate();
        $check();
    }

    public function test_a_site_that_never_saved_its_settings_gets_no_files(): void
    {
        $member = $this->user('member@example.com', ['member', 'author']);

        $this->migrate();
        $this->again();

        $this->assertSame(['visitor', 'author'], $this->roles($member));
        $this->assertFileDoesNotExist(site_path('config/accounts.yaml'));
        $this->assertFileDoesNotExist(site_path('config/roles.yaml'));
        $this->assertSame(['visitor'], cms()->accounts()->visitorRoles());
    }

    public function test_a_site_with_a_visitor_role_of_its_own_is_left_alone(): void
    {
        $member = $this->user('member@example.com', ['member']);
        $roles = ['roles' => ['admin' => cms()->roles()->defaults()['admin'], 'member' => ['label' => 'Member', 'description' => '', 'permissions' => []], 'visitor' => ['label' => 'Guest', 'description' => '', 'permissions' => ['media.view']]]];
        Yaml::write(site_path('config/roles.yaml'), $roles);
        Yaml::write(site_path('config/accounts.yaml'), ['default_role' => 'member']);

        $this->migrate();

        $this->assertSame(['member'], $this->roles($member));
        $this->assertSame($roles, Yaml::read(site_path('config/roles.yaml')));
        $this->assertSame(['default_role' => 'member'], Yaml::read(site_path('config/accounts.yaml')));
    }

    private function gated(string $collection, string $title, array $access, array $data = []): Entry
    {
        return cms()->entryService()->create($collection, ['title' => $title, 'status' => 'published', 'data' => [...$data, 'gate' => ['mode' => 'locked', 'access' => $access]]]);
    }

    private function row(Entry $entry, string $column): ?array
    {
        $json = DB::table('entries')->where('id', $entry->id)->value($column);

        return $json === null ? null : json_decode($json, true);
    }

    private function decides(Entry $entry, User $user): string
    {
        $this->actingAs($user);

        return cms()->entries()->gate()->decide(cms()->entries()->find($entry->id));
    }

    /** A visitor reads what a member could: the role follows in every list that says who may read. */
    public function test_who_may_read_a_collection_or_an_entry_follows_the_role(): void
    {
        $this->lessons();
        $visitor = $this->user('visitor@example.com', ['member']);
        $stranger = $this->user('stranger@example.com', ['other']);

        // In the database: an entry of its own, one that already names both, one whose draft differs, one that follows its collection.
        $own = $this->gated('lessons', 'Own', ['member'], ['summary' => 'Kept']);
        $both = $this->gated('lessons', 'Both', ['visitor', 'member', 'patron']);
        $drafted = $this->gated('lessons', 'Drafted', ['patron']);
        cms()->entryService()->update($drafted->id, ['data' => ['summary' => 'Later', 'gate' => ['mode' => 'locked', 'access' => ['patron', 'member']]]]);
        $plain = cms()->entryService()->create('lessons', ['title' => 'Plain', 'status' => 'published', 'data' => ['summary' => 'Open to the collection\'s readers']]);
        $elsewhere = $this->gated('lessons', 'Elsewhere', ['patron']);
        // In a file, with a working copy beside it.
        $note = $this->gated('notes', 'Gated Note', ['member', 'patron'], ['body' => "A note.\n\nWith two paragraphs."]);
        cms()->entryService()->update($note->id, ['data' => ['body' => 'A changed note.', 'gate' => ['mode' => 'locked', 'access' => ['member']]]]);
        $file = content_path('collections/notes/gated-note.md');
        $draft = storage_path('drafts/'.preg_replace('/[^a-z0-9]/', '', strtolower($note->id)).'.json');
        $open = cms()->entryService()->create('notes', ['title' => 'Open Note', 'status' => 'published', 'data' => ['body' => 'Member is a word here, not a role.']]);
        $openFile = content_path('collections/notes/open-note.md');

        // As stored before the rename.
        $before = (string) file_get_contents($file);
        $openBefore = (string) file_get_contents($openFile);
        $this->assertStringContainsString("    - member\n", $before);
        $this->assertSame(['member'], json_decode((string) file_get_contents($draft), true)['data']['gate']['access']);
        $this->assertSame(['member'], $this->row($own, 'data')['gate']['access']);
        $this->assertSame(['patron', 'member'], $this->row($drafted, 'draft')['data']['gate']['access']);
        $this->assertSame(['member', 'subscriber'], Yaml::read(content_path('collections/lessons.yaml'))['gate']['access']);
        $elsewhereBefore = DB::table('entries')->where('id', $elsewhere->id)->first();

        $this->migrate();

        $check = function () use ($own, $both, $drafted, $plain, $elsewhere, $elsewhereBefore, $note, $file, $before, $draft, $openFile, $openBefore, $visitor, $stranger): void {
            // The collection's definition: the list only, everything else as it was.
            $lessons = Yaml::read(content_path('collections/lessons.yaml'));
            $this->assertSame(['mode' => 'locked', 'access' => ['visitor', 'subscriber'], 'teaser_words' => 20], $lessons['gate']);
            $this->assertSame('/lessons/{slug}', $lessons['route']);
            $this->assertSame(['visitor', 'subscriber'], cms()->collections()->find('lessons')->get('gate')['access']);

            // Entries in the database, published and working copy.
            // Equal, not identical: MySQL keeps a JSON object's keys in its own order.
            $this->assertEquals(['summary' => 'Kept', 'gate' => ['mode' => 'locked', 'access' => ['visitor']]], $this->row($own, 'data'));
            $this->assertSame(['visitor', 'patron'], $this->row($both, 'data')['gate']['access']);
            $this->assertSame(['patron'], $this->row($drafted, 'data')['gate']['access']);
            $this->assertSame(['patron', 'visitor'], $this->row($drafted, 'draft')['data']['gate']['access']);
            $this->assertSame('Later', $this->row($drafted, 'draft')['data']['summary']);
            $this->assertEquals($elsewhereBefore, DB::table('entries')->where('id', $elsewhere->id)->first());

            // The file: one line differs. Its working copy too, and a file that only says the word is not touched.
            $this->assertSame(str_replace("    - member\n", "    - visitor\n", $before), (string) file_get_contents($file));
            $this->assertSame(['visitor', 'patron'], cms()->entries()->find($note->id)->data['gate']['access']);
            $working = json_decode((string) file_get_contents($draft), true);
            $this->assertSame(['title', 'slug', 'data', 'authorId'], array_keys($working));
            $this->assertEquals(['body' => 'A changed note.', 'gate' => ['mode' => 'locked', 'access' => ['visitor']]], $working['data']);
            $this->assertSame($openBefore, (string) file_get_contents($openFile));

            // And so the visitor still reads what the role let them read, and nobody else does.
            foreach ([$own, $both, $plain, $note] as $entry) {
                $this->assertSame(EntryGate::FULL, $this->decides($entry, $visitor->fresh()), $entry->title);
                $this->assertSame(EntryGate::DENIED, $this->decides($entry, $stranger), $entry->title);
            }

            $this->assertSame(EntryGate::DENIED, $this->decides($elsewhere, $visitor->fresh()));
        };

        $check();
        $this->again();
        $check();
        $this->migrate();
        $check();
    }

    /** `member` can also be an access name someone was given: those people keep what it opened. */
    public function test_a_list_keeps_member_where_it_is_also_an_access_name(): void
    {
        $this->lessons();
        $visitor = $this->user('visitor@example.com', ['member']);
        $patron = $this->user('patron@example.com', ['other']);
        cms()->accounts()->grant($patron, 'member', 'shop');
        $entry = $this->gated('pages', 'Club', ['member']);

        $this->migrate();
        $this->again();

        $this->assertSame(['member', 'visitor'], $this->row($entry, 'data')['gate']['access']);
        $this->assertSame(['member', 'subscriber', 'visitor'], Yaml::read(content_path('collections/lessons.yaml'))['gate']['access']);
        $this->assertSame(['visitor'], $this->roles($visitor));
        $this->assertSame(EntryGate::FULL, $this->decides($entry, $visitor->fresh()));
        $this->assertSame(EntryGate::FULL, $this->decides($entry, $patron));
    }
}

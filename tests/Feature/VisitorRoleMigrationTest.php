<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Support\Yaml;
use Cms\Tests\TestCase;
use Cms\Users\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

/** `cms migrate` renames the role `member` to `visitor` in what a site has stored. */
final class VisitorRoleMigrationTest extends TestCase
{
    private const string MIGRATION = '2026_11_11_000000_rename_member_role_to_visitor';

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
            $this->assertSame(0, User::query()->where('roles', 'like', '%member%')->count());

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
}

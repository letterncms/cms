<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Support\Files;
use Cms\Support\Remote;
use Cms\Support\Yaml;
use Cms\Tests\Support\FakeRemote;
use Cms\Tests\Support\Signing;
use Cms\Tests\TestCase;
use Cms\Users\Totp;
use Cms\Users\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * What the abilities around people, settings, globals, email, licences and the audit log answer with:
 * each runs here, so its result is held against its output schema (see TestCase::setUp()).
 */
final class OutputAccountsTest extends TestCase
{
    protected function prepareSite(string $site): void
    {
        // A paid plugin, so the licence abilities are there.
        $plugins = Yaml::read($site.'/config/plugins.yaml');
        Yaml::write($site.'/config/plugins.yaml', [...$plugins, 'enabled' => [...($plugins['enabled'] ?? []), 'acme/forms']]);
        Files::put($site.'/plugins/forms/composer.json', (string) json_encode(['name' => 'acme/forms', 'type' => 'cms-plugin', 'version' => '1.0.0', 'extra' => ['cms' => ['license' => ['product' => 'acme/forms', 'paid' => true]]]]));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function run_(string $name, array $input, User $as, string $transport = 'admin'): mixed
    {
        return $this->cms()->abilities()->execute($name, $input, AbilityContext::forUser($as, $transport));
    }

    public function test_the_account_and_its_two_factor_sign_in(): void
    {
        $me = $this->admin();

        // Without preferences, and with some.
        $this->assertSame($me->id, $this->run_('account/get', [], $me)['id']);
        $this->run_('account/update', ['preferences' => ['theme' => 'dark'], 'locale' => 'de', 'name' => 'Ada L.'], $me);
        $account = $this->run_('account/get', [], $me);
        $this->assertSame('dark', ((array) $account['preferences'])['theme']);
        $this->assertFalse($account['twoFactor']);

        $setup = $this->run_('account/two-factor-setup', [], $me);
        $this->assertStringStartsWith('otpauth://', $setup['uri']);

        try {
            $this->run_('account/two-factor-confirm', ['code' => '000000x'], $me);
            $this->fail('A wrong code was accepted.');
        } catch (AbilityException) {
        }

        $confirmed = $this->run_('account/two-factor-confirm', ['code' => Totp::code($setup['secret'], intdiv(time(), 30))], $me);
        $this->assertTrue($confirmed['enabled']);
        $this->assertNotEmpty($confirmed['recoveryCodes']);
        $this->assertTrue($this->run_('account/get', [], $me->refresh())['twoFactor']);

        $this->assertSame(['enabled' => false], $this->run_('account/two-factor-disable', ['password' => 'secret-pass-123'], $me));
    }

    public function test_api_tokens(): void
    {
        $me = $this->admin();

        $this->assertSame([], $this->run_('tokens/list', [], $me));

        $forever = $this->run_('tokens/create', ['name' => 'Deploy'], $me);
        $this->assertNull($forever['expiresAt']);
        $this->assertNotSame('', $forever['token']);
        $brief = $this->run_('tokens/create', ['name' => 'Reader', 'scopes' => ['read', 'entries/*'], 'expiresInDays' => 30], $me);
        $this->assertSame(['read', 'entries/*'], $brief['scopes']);
        $this->assertIsString($brief['expiresAt']);

        $this->assertCount(2, $this->run_('tokens/list', [], $me));
        $this->assertSame(['revoked' => $brief['id']], $this->run_('tokens/revoke', ['id' => $brief['id']], $me));
        $this->assertCount(1, $this->run_('tokens/list', [], $me));
    }

    public function test_people_their_roles_fields_and_access(): void
    {
        $me = $this->admin();
        $editor = $this->userWithRole('editor');
        $editor->forceFill(['last_login_at' => now()])->save();

        // No profile fields yet, then some.
        $this->assertSame([], $this->run_('users/fields', [], $me)['fields']);
        $this->run_('users/fields-save', ['fields' => [['handle' => 'bio', 'type' => 'textarea', 'label' => 'Bio'], ['handle' => 'job', 'type' => 'text', 'required' => false]]], $me);
        $this->assertCount(2, $this->run_('users/fields', [], $me)['resolvedFields']);
        $this->run_('users/update', ['id' => $editor->id, 'data' => ['bio' => 'Writes.']], $me);

        $one = $this->run_('users/get', ['id' => $editor->id], $me);
        $this->assertSame('Writes.', ((array) $one['data'])['bio']);
        $this->assertIsString($one['lastLoginAt']);
        $this->assertNull($this->run_('users/get', ['id' => $me->id], $me)['lastLoginAt']);

        $recent = $this->run_('users/recent', [], $me);
        $this->assertSame(2, $recent['total']);
        $this->assertSame($editor->id, $recent['items'][0]['id']);
        $this->assertSame('Super Admin', $recent['items'][1]['role']);

        $roles = $this->run_('roles/list', [], $me);
        $this->assertSame(['*'], $roles['roles']['admin']['permissions']);
        $this->assertSame(1, $roles['people']['editor']);
        $this->assertNotEmpty($roles['permissions']);

        // Access beyond roles: none, forever, until a day, and gone again.
        $this->assertSame([], $this->run_('users/access', ['id' => $editor->id], $me));
        $this->assertSame(['granted' => 'members'], $this->run_('users/grant', ['id' => $editor->id, 'access' => 'members'], $me));
        $this->run_('users/grant', ['id' => $editor->id, 'access' => 'course', 'until' => '2030-01-01T00:00:00Z'], $me);
        $access = $this->run_('users/access', ['id' => $editor->id], $me);
        $this->assertSame(['course', 'members'], array_column($access, 'access'));
        $this->assertIsString($access[0]['expiresAt']);
        $this->assertNull($access[1]['expiresAt']);
        $this->assertSame(['revoked' => 'course'], $this->run_('users/revoke', ['id' => $editor->id, 'access' => 'course'], $me));
        $this->assertCount(1, $this->run_('users/access', ['id' => $editor->id], $me));
    }

    public function test_settings_pages_and_the_arrangements(): void
    {
        $me = $this->admin();

        $pages = $this->run_('settings/list', [], $me);
        $this->assertContains('site', array_column($pages, 'namespace'));
        // Someone without the permission sees none of them.
        $this->assertNotContains('email', array_column($this->run_('settings/list', [], $this->userWithRole('author')), 'namespace'));

        // Every page there is answers as described, with what it holds.
        foreach ($pages as $page) {
            $this->assertSame($page['namespace'], $this->run_('settings/get', ['namespace' => $page['namespace']], $me)['namespace']);
        }

        foreach (array_keys(\Cms\Admin\Arranged::all()) as $of) {
            $this->assertFalse($this->run_('admin/arrangement', ['of' => $of], $me)['customized']);
            $this->assertTrue($this->run_('admin/arrangement', ['of' => $of, 'layout' => ['sections' => [['id' => 'content', 'label' => 'Content', 'items' => []]], 'hidden' => []]], $me)['customized']);
        }
    }

    public function test_global_sets(): void
    {
        $me = $this->admin();

        $this->assertSame([], $this->run_('globals/list', [], $me));

        $set = $this->run_('globals/save', ['title' => 'Footer', 'fields' => [['handle' => 'text', 'type' => 'text', 'label' => 'Text'], ['handle' => 'hours', 'type' => 'textarea']]], $me);
        $this->assertSame('footer', $set['handle']);
        $this->run_('globals/save', ['title' => 'Empty', 'icon' => 'star', 'fields' => []], $me);
        $this->run_('globals/update', ['handle' => 'footer', 'values' => ['text' => 'Hello']], $me);
        $this->run_('globals/update', ['handle' => 'footer', 'values' => ['text' => 'Hallo'], 'locale' => 'de'], $me);

        $list = $this->run_('globals/list', [], $me);
        $this->assertEqualsCanonicalizing(['empty', 'footer'], array_column($list, 'handle'));

        $this->assertSame('Hello', ((array) $this->run_('globals/get', ['handle' => 'footer'], $me)['data'])['text']);
        $this->assertSame('Hallo', ((array) $this->run_('globals/get', ['handle' => 'footer', 'locale' => 'de'], $me)['data'])['text']);
        $this->assertSame([], $this->run_('globals/get', ['handle' => 'empty'], $me)['fields']);

        $this->assertSame(['deleted' => 'empty'], $this->run_('globals/delete', ['handle' => 'empty'], $me));
        $this->assertCount(1, $this->run_('globals/list', [], $me));
    }

    public function test_email_its_status_and_its_log(): void
    {
        // Kept in the log only, whatever the environment sends with: nothing leaves the tests.
        $before = [getenv('CMS_EMAIL_TRANSPORT'), $_ENV['CMS_EMAIL_TRANSPORT'] ?? null, $_SERVER['CMS_EMAIL_TRANSPORT'] ?? null];
        putenv('CMS_EMAIL_TRANSPORT=log');
        $_ENV['CMS_EMAIL_TRANSPORT'] = $_SERVER['CMS_EMAIL_TRANSPORT'] = 'log';

        try {
            $me = $this->admin();

            // Nothing sent yet.
            $status = $this->run_('email/status', [], $me);
            $this->assertSame(['key' => 'log', 'label' => $status['transport']['label'], 'delivers' => false], $status['transport']);
            $this->assertSame([], $status['latest']);
            $this->assertSame([], $this->run_('email/log', [], $me));

            $this->assertSame(['sent' => true, 'transport' => 'log'], $this->run_('email/test', ['to' => 'someone@example.com'], $me));
            // An invitation is an email with a tag; a failed one has an error.
            $this->run_('users/invite', ['id' => $me->id], $me);
            DB::table('email_log')->insert(['id' => (string) \Illuminate\Support\Str::ulid(), 'to' => 'gone@example.com', 'subject' => 'Lost', 'tag' => null, 'transport' => 'smtp', 'status' => 'failed', 'error' => 'Connection refused', 'created_at' => now()]);
            DB::table('email_log')->insert(['id' => (string) \Illuminate\Support\Str::ulid(), 'to' => 'old@example.com', 'subject' => 'Undated', 'tag' => null, 'transport' => 'log', 'status' => 'sent', 'error' => null, 'created_at' => null]);

            $status = $this->run_('email/status', ['limit' => 20], $me);
            $this->assertSame(1, $status['failed']);
            $this->assertCount(4, $status['latest']);
            $this->assertCount(4, $this->run_('email/log', [], $me));
        } finally {
            putenv($before[0] === false ? 'CMS_EMAIL_TRANSPORT' : "CMS_EMAIL_TRANSPORT={$before[0]}");
            unset($_ENV['CMS_EMAIL_TRANSPORT'], $_SERVER['CMS_EMAIL_TRANSPORT']);
            $before[1] === null || $_ENV['CMS_EMAIL_TRANSPORT'] = $before[1];
            $before[2] === null || $_SERVER['CMS_EMAIL_TRANSPORT'] = $before[2];
        }
    }

    public function test_the_audit_log(): void
    {
        $me = $this->admin();
        $editor = $this->userWithRole('editor');

        // An empty log.
        DB::table('audit_log')->delete();
        $this->assertSame([], $this->run_('audit/recent', [], $me));
        $empty = $this->run_('audit/list', [], $me);
        $this->assertSame(0, $empty['total']);

        // Changes to an entry, a setting, a global set and a person, by people, the system and someone since deleted.
        $entry = $this->run_('entries/create', ['collection' => 'pages', 'title' => 'About'], $editor, 'admin');
        $this->run_('entries/update', ['id' => $entry['id'], 'data' => ['summary' => 'One']], $editor, 'admin');
        $this->run_('entries/update', ['id' => $entry['id'], 'data' => ['summary' => 'Two']], $editor, 'admin');
        $this->run_('settings/update', ['namespace' => 'site', 'values' => ['name' => 'Renamed']], $me, 'rest');
        $this->run_('globals/save', ['title' => 'Footer', 'fields' => []], $me);
        $this->cms()->abilities()->execute('users/update', ['id' => $editor->id, 'name' => 'Edith'], AbilityContext::system('cli'));
        $this->run_('users/delete', ['id' => $editor->id], $me);

        $recent = $this->run_('audit/recent', ['limit' => 30], $me);
        $this->assertNotEmpty($recent);
        $this->assertContains(2, array_column($recent, 'count'));
        $users = array_column($recent, 'user');
        $this->assertContains(null, $users);
        $this->assertContains('Deleted user', array_column(array_filter($users), 'name'));

        $list = $this->run_('audit/list', [], $me);
        $this->assertSame(count($list['items']), $list['total']);
        $this->assertContains('System', array_column($list['items'], 'who'));
        $this->assertNotEmpty($list['filters']['people']);
        $this->assertNotEmpty($list['filters']['actions']);

        $mine = $this->run_('audit/list', ['userId' => $me->id, 'ability' => 'settings/update', 'perPage' => 1], $me);
        $this->assertSame('API', $mine['items'][0]['via']);
        $this->assertSame('/settings/site', $mine['items'][0]['to']);
    }

    public function test_the_license_key_comes_and_goes(): void
    {
        $this->app->instance(Remote::class, new FakeRemote);
        $this->app->make(\Cms\Settings\SettingsRegistry::class)->save('site', ['url' => 'https://example.com']);
        Carbon::setTestNow('2027-02-01 12:00:00');
        $me = $this->admin();

        $before = $this->run_('license/status', [], $me);
        $this->assertSame('none', $before['token']);
        $this->assertSame('acme/forms', $before['list'][0]['product']);

        $installed = $this->run_('license/install', ['token' => Signing::token(['iat' => '2027-01-01T00:00:00Z'])], $me);
        $this->assertSame('valid', $installed['token']);
        $this->assertIsString($installed['lid']);
        $this->assertSame('valid', $this->run_('license/status', [], $me)['token']);

        $this->assertSame('none', $this->run_('license/clear', [], $me)['token']);
    }
}

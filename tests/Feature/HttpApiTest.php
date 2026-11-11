<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Tests\TestCase;
use Cms\Users\ApiToken;
use Cms\Users\Totp;

final class HttpApiTest extends TestCase
{
    public function test_token_api_runs_abilities(): void
    {
        [, $plain] = ApiToken::issue($this->admin(), 'test');

        $this->postJson('/api/v1/abilities/entries/create', ['collection' => 'pages', 'title' => 'From API'], ['Authorization' => "Bearer {$plain}"])
            ->assertOk()
            ->assertJsonPath('data.slug', 'from-api');

        $this->getJson('/api/v1/abilities', ['Authorization' => "Bearer {$plain}"])->assertOk()->assertJsonFragment(['name' => 'entries/list']);
    }

    public function test_api_rejects_missing_and_bad_tokens(): void
    {
        $this->getJson('/api/v1/abilities')->assertUnauthorized();
        $this->getJson('/api/v1/abilities', ['Authorization' => 'Bearer cms_nope'])->assertUnauthorized();
    }

    public function test_get_is_only_for_read_only_abilities(): void
    {
        [, $plain] = ApiToken::issue($this->admin(), 'test');

        $this->getJson('/api/v1/abilities/collections/list', ['Authorization' => "Bearer {$plain}"])->assertOk();
        $this->getJson('/api/v1/abilities/entries/create?collection=pages&title=x', ['Authorization' => "Bearer {$plain}"])->assertStatus(405);
    }

    public function test_expired_token_fails(): void
    {
        [, $plain] = ApiToken::issue($this->admin(), 'old', ['*'], now()->subDay());
        $this->getJson('/api/v1/abilities', ['Authorization' => "Bearer {$plain}"])->assertUnauthorized();
    }

    public function test_admin_session_login_logout(): void
    {
        $admin = $this->admin(['email' => 'grace@example.com']);

        $this->postJson('/api/admin/auth/login', ['email' => 'grace@example.com', 'password' => 'wrong-password-1'])->assertStatus(422);
        $this->postJson('/api/admin/auth/login', ['email' => 'grace@example.com', 'password' => 'secret-pass-123'])->assertOk()->assertJsonPath('user.email', 'grace@example.com');

        $this->getJson('/api/admin/manifest')->assertOk()->assertJsonPath('data.user.id', $admin->id);
        $this->postJson('/api/admin/auth/logout')->assertOk();
        $this->getJson('/api/admin/manifest')->assertUnauthorized();
    }

    public function test_two_factor_challenge(): void
    {
        $secret = Totp::secret();
        $admin = $this->admin(['email' => 'two@example.com']);
        $admin->forceFill(['two_factor_secret' => $secret, 'two_factor_confirmed_at' => now(), 'two_factor_recovery_codes' => ['aaaa-bbbb']])->save();

        $this->postJson('/api/admin/auth/login', ['email' => 'two@example.com', 'password' => 'secret-pass-123'])->assertOk()->assertJsonPath('twoFactor', true);
        $this->getJson('/api/admin/manifest')->assertUnauthorized();

        $this->postJson('/api/admin/auth/two-factor', ['code' => '000000'])->assertStatus(422);
        $this->postJson('/api/admin/auth/two-factor', ['code' => Totp::code($secret, intdiv(time(), 30))])->assertOk();
        $this->getJson('/api/admin/manifest')->assertOk();
    }

    public function test_users_without_admin_access_are_blocked(): void
    {
        $user = \Cms\Users\User::query()->create(['name' => 'Nobody', 'email' => 'n@example.com', 'password' => 'secret-pass-123', 'roles' => []]);

        $this->actingAs($user)->getJson('/api/admin/manifest')->assertForbidden();
    }

    public function test_the_admin_page_brings_the_manifest_for_signed_in_admins(): void
    {
        $this->actingAs($this->admin())->get('/admin')->assertOk()->assertSee('"manifest":{', false);

        $user = \Cms\Users\User::query()->create(['name' => 'Nobody', 'email' => 'n@example.com', 'password' => 'secret-pass-123', 'roles' => []]);
        $this->actingAs($user)->get('/admin')->assertOk()->assertDontSee('"manifest":', false);
    }

    public function test_the_admin_page_opens_in_the_theme_the_account_keeps(): void
    {
        $admin = $this->admin();

        // Nothing chosen: this browser's own choice, else the system's.
        $this->actingAs($admin)->get('/admin')->assertOk()->assertSee('var a=null,p=a||localStorage', false);

        $this->cms()->abilities()->execute('account/update', ['preferences' => ['theme' => 'dark']], \Cms\Abilities\AbilityContext::forUser($admin, 'admin'));
        // Set before the first paint, in a browser that has never seen it, and kept there.
        $this->actingAs($admin->refresh())->get('/admin')->assertOk()->assertSee('var a="dark",p=a||localStorage', false);

        // Only a theme is ever written into the page.
        $this->cms()->abilities()->execute('account/update', ['preferences' => ['theme' => '";alert(1);//']], \Cms\Abilities\AbilityContext::forUser($admin, 'admin'));
        $this->actingAs($admin->refresh())->get('/admin')->assertOk()->assertSee('var a=null,p=a||localStorage', false);
    }

    public function test_delivery_api_serves_only_live_content(): void
    {
        $content = $this->cms()->entryService();
        $content->create('posts', ['title' => 'Public', 'data' => ['excerpt' => 'x'], 'status' => 'published']);
        $content->create('posts', ['title' => 'Secret draft', 'data' => ['excerpt' => 'y']]);
        $content->create('posts', ['title' => 'Future', 'data' => ['excerpt' => 'z'], 'status' => 'published', 'at' => now()->addDay()->toIso8601String()]);

        $this->getJson('/api/v1/content/posts')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'Public');
        $this->getJson('/api/v1/content/posts/secret-draft')->assertNotFound();
        $this->getJson('/api/v1/content/nope')->assertNotFound();
    }

    public function test_json_bodies_keep_whitespace_and_empty_strings(): void
    {
        [, $plain] = ApiToken::issue($this->admin(), 'test');
        $body = "    indented code\n\nText with trailing spaces  ";

        $this->postJson('/api/v1/abilities/entries/create', ['collection' => 'posts', 'title' => 'Raw', 'data' => ['excerpt' => '', 'body' => $body]], ['Authorization' => "Bearer {$plain}"])
            ->assertOk()
            ->assertJsonPath('data.data.excerpt', '')
            ->assertJsonPath('data.data.body', $body);
    }

    public function test_every_route_leads_to_the_installer_until_installed(): void
    {
        unlink(storage_path('installed.json'));

        $this->get('/')->assertRedirect('/install');
        $this->get('/admin')->assertRedirect('/install');
        $this->getJson('/api/v1/abilities')->assertStatus(503)->assertJsonPath('error.type', 'not_installed');
        $this->get('/install')->assertOk();
    }

    public function test_installer_enforces_the_password_rules_from_every_entry_point(): void
    {
        unlink(storage_path('installed.json'));

        try {
            $this->app->make(\Cms\Install\Installer::class)->install([
                'site_name' => 'Site', 'site_url' => 'http://localhost', 'db_driver' => 'sqlite',
                'name' => 'Ada', 'email' => 'ada@example.com', 'password' => 'short',
            ]);
            $this->fail('Installed with a weak password');
        } catch (\Cms\Abilities\AbilityException $e) {
            $this->assertSame('invalid_input', $e->type);
            $this->assertArrayHasKey('password', $e->details);
        }

        $this->assertFileDoesNotExist(storage_path('installed.json'));
    }

    public function test_security_headers(): void
    {
        $this->getJson('/api/v1')->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    }
}

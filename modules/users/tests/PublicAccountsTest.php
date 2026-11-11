<?php

declare(strict_types=1);

namespace Cms\Modules\Users\Tests;

use Cms\Modules\Email\Message;
use Cms\Modules\Email\Mailer;
use Cms\Support\Yaml;
use Cms\Tests\TestCase;
use Cms\Users\AccountInBrowser;
use Cms\Users\AccountToken;
use Cms\Users\Accounts;
use Cms\Users\User;

/** Public accounts through the real routes: a stranger becomes a member, and back again. */
final class PublicAccountsTest extends TestCase
{
    /** @var list<Message> */
    private array $mail = [];

    private bool $acting = false;

    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    protected function prepareSite(string $site): void
    {
        Yaml::write($site.'/config/accounts.yaml', ['enabled' => true]);
    }

    protected function setUp(): void
    {
        parent::setUp();

        $outbox = &$this->mail;
        $this->app->instance(Mailer::class, new class($outbox) extends Mailer
        {
            public function __construct(private array &$outbox) {}

            public function send(Message $message): void
            {
                $this->outbox[] = $message;
            }

            public function configured(): bool
            {
                return true;
            }
        });
    }

    /** A browser: keeps its cookies between requests, and each request starts with what they say. */
    public function call($method, $uri, $parameters = [], $cookies = [], $files = [], $server = [], $content = null)
    {
        if (! $this->acting) {
            $this->app['auth']->forgetGuards();
        }

        $response = parent::call($method, $uri, $parameters, $cookies, $files, $server, $content);

        foreach ($response->headers->getCookies() as $cookie) {
            $this->unencryptedCookies[$cookie->getName()] = $cookie->getValue();
        }

        return $response;
    }

    public function actingAs($user, $guard = null)
    {
        $this->acting = true;

        return parent::actingAs($user, $guard);
    }

    private function signIn(string $email = 'ada@example.com', string $password = 'correct-horse-1'): void
    {
        $this->post('/_cms/account/sign-in', ['email' => $email, 'password' => $password]);
    }

    private function linkIn(Message $message): string
    {
        $this->assertSame(1, preg_match('#https?://[^/]+(/[^\s"<]+)#', $message->text, $m), $message->text);

        return html_entity_decode($m[1]);
    }

    private function member(string $email = 'ada@example.com', string $password = 'correct-horse-1'): User
    {
        $user = new User(['name' => 'Ada', 'email' => $email, 'password' => $password, 'roles' => ['visitor']]);
        $user->save();

        return $user;
    }

    public function test_after_asking_for_a_link_the_form_makes_way_and_the_message_takes_the_focus(): void
    {
        $html = (string) $this->followingRedirects()->post('/_cms/account/sign-up', ['email' => 'new@example.com'])->assertOk()->getContent();

        $this->assertStringNotContainsString('action="/_cms/account/sign-up"', $html);
        $this->assertMatchesRegularExpression('/class="cms-account-status"[^>]*tabindex="-1" autofocus/', $html);
        $this->assertStringContainsString('Use another address', $html);
    }

    public function test_a_mistake_is_at_its_field_with_the_focus_on_it(): void
    {
        $html = (string) $this->followingRedirects()->post('/_cms/account/sign-up', ['email' => 'nope'])->assertOk()->getContent();

        $this->assertMatchesRegularExpression('/id="account-sign-up-email"[^>]*aria-describedby="account-sign-up-email-note"[^>]*aria-invalid="true" autofocus/', $html);
        $this->assertStringContainsString('name@example.com', $html);
    }

    public function test_mail_to_a_visitor_has_one_button_and_the_link_written_out(): void
    {
        $this->post('/_cms/account/sign-up', ['email' => 'new@example.com']);

        $this->assertStringContainsString('role="presentation"', $this->mail[0]->html);
        $this->assertStringContainsString('/sign-up/complete?token=', $this->mail[0]->text);
    }

    public function test_sign_up_proves_the_mailbox_before_any_account_exists(): void
    {
        $this->followingRedirects()->post('/_cms/account/sign-up', ['email' => 'New@Example.com'])->assertOk()->assertSee('Check your email');
        $this->assertSame(0, User::query()->count(), 'Typing an address creates nothing.');
        $this->assertCount(1, $this->mail);
        $this->assertSame('new@example.com', $this->mail[0]->to);

        $link = $this->linkIn($this->mail[0]);
        // Opening the link (a mail scanner does) uses nothing, and leaves the token out of the address.
        $this->get($link)->assertRedirect('/sign-up/complete');
        $this->get($link)->assertRedirect('/sign-up/complete');
        $this->get('/sign-up/complete')->assertOk()->assertSee('name="password"', false);

        $this->post('/_cms/account/complete', ['name' => '<b>Ada</b>', 'password' => 'short'])->assertRedirect('/sign-up/complete');
        $this->assertSame(0, User::query()->count());

        $this->post('/_cms/account/complete', ['name' => '<b>Ada</b>', 'password' => 'correct-horse-1'])->assertRedirect('/account');
        $user = User::query()->where('email', 'new@example.com')->firstOrFail();
        $this->assertSame('Ada', $user->name);
        $this->assertNotNull($user->email_verified_at);
        $this->assertSame(['visitor'], $user->roles);
        $this->assertTrue(cms()->accounts()->isVisitor($user));
        $this->assertAuthenticatedAs($user);
        $this->get('/account')->assertOk()->assertSee('new@example.com');
    }

    public function test_a_used_link_is_dead_and_a_second_account_is_impossible(): void
    {
        $this->post('/_cms/account/sign-up', ['email' => 'two@example.com']);
        $this->get($link = $this->linkIn($this->mail[0]));
        $this->post('/_cms/account/complete', ['name' => 'One', 'password' => 'correct-horse-1']);
        $this->post('/_cms/account/sign-out');

        $this->get($link);
        $this->get('/sign-up/complete')->assertSee('invalid or has expired');
        $this->post('/_cms/account/complete', ['name' => 'Two', 'password' => 'correct-horse-2']);
        $this->assertSame('One', User::query()->where('email', 'two@example.com')->value('name'));
    }

    public function test_answers_do_not_say_whether_an_address_has_an_account(): void
    {
        $this->member('known@example.com');

        $known = $this->post('/_cms/account/sign-up', ['email' => 'known@example.com']);
        $unknown = $this->post('/_cms/account/sign-up', ['email' => 'unknown@example.com']);
        $this->assertSame($known->status(), $unknown->status());
        $this->assertSame($known->headers->get('Location'), $unknown->headers->get('Location'));
        $this->assertStringContainsString('already has one', $this->mail[0]->text);
        $this->assertStringContainsString('finish creating', $this->mail[1]->text);

        $this->mail = [];
        $known = $this->post('/_cms/account/forgot', ['email' => 'known@example.com']);
        $unknown = $this->post('/_cms/account/forgot', ['email' => 'nobody@example.com']);
        $this->assertSame($known->headers->get('Location'), $unknown->headers->get('Location'));
        $this->assertCount(1, $this->mail);
    }

    public function test_sign_in_sign_out_and_where_next_may_lead(): void
    {
        $user = $this->member();

        $this->post('/_cms/account/sign-in', ['email' => 'ada@example.com', 'password' => 'wrong-password-1'])->assertRedirect('/sign-in');
        $this->assertGuest();
        $this->followingRedirects()->post('/_cms/account/sign-in', ['email' => 'ada@example.com', 'password' => 'wrong-password-1'])->assertSee('don’t match');

        $this->post('/_cms/account/sign-in', ['email' => 'ADA@example.com', 'password' => 'correct-horse-1', 'next' => '//evil.example/x'])->assertRedirect('/account');
        $this->assertAuthenticatedAs($user);
        $this->get('/sign-in')->assertRedirect('/account');

        $this->post('/_cms/account/sign-out')->assertRedirect('/');
        $this->assertGuest();

        $this->post('/_cms/account/sign-in', ['email' => 'ada@example.com', 'password' => 'correct-horse-1', 'next' => '/blog/x'])->assertRedirect('/blog/x');
    }

    public function test_sign_in_is_limited(): void
    {
        $this->member();

        foreach (range(1, 5) as $_) {
            $this->post('/_cms/account/sign-in', ['email' => 'ada@example.com', 'password' => 'wrong-password-1']);
        }

        $this->followingRedirects()->post('/_cms/account/sign-in', ['email' => 'ada@example.com', 'password' => 'correct-horse-1'])->assertSee('Too many attempts');
        $this->assertGuest();
    }

    public function test_the_admin_stays_as_it_was(): void
    {
        $member = $this->member();

        // A visitor's password doesn't open the admin's door, and the same answer comes back as for a wrong one.
        $wrong = $this->postJson('/api/admin/auth/login', ['email' => 'ada@example.com', 'password' => 'wrong-password-1']);
        $right = $this->postJson('/api/admin/auth/login', ['email' => 'ada@example.com', 'password' => 'correct-horse-1']);
        $this->assertSame($wrong->status(), $right->status());
        $this->assertSame($wrong->json(), $right->json());
        $this->assertGuest();

        $this->signIn();
        $this->assertAuthenticatedAs($member);
        $this->getJson('/api/admin/manifest')->assertForbidden();
        $this->postJson('/api/admin/abilities/account%2Fget')->assertStatus(403);
        $this->get('/__preview/'.strtolower((string) \Illuminate\Support\Str::ulid()))->assertStatus(403);
        $this->post('/_cms/account/sign-out');

        // The team doesn't get a second door that skips two-factor sign-in.
        $admin = $this->admin();
        $admin->forceFill(['password' => 'admin-password-1', 'two_factor_secret' => 'JBSWY3DPEHPK3PXP', 'two_factor_confirmed_at' => now()])->save();
        $this->followingRedirects()->post('/_cms/account/sign-in', ['email' => $admin->email, 'password' => 'admin-password-1'])->assertSee('signs in at /admin');
        $this->assertGuest();

        // Nor a reset through the public form, and a suspended account can't get in anywhere.
        $this->mail = [];
        $this->post('/_cms/account/forgot', ['email' => $admin->email]);
        $this->assertSame([], $this->mail);

        $admin->forceFill(['status' => Accounts::SUSPENDED, 'two_factor_secret' => null, 'two_factor_confirmed_at' => null])->save();
        $this->acting = false;
        $this->postJson('/api/admin/auth/login', ['email' => $admin->email, 'password' => 'admin-password-1'])->assertStatus(422);
        $this->actingAs($admin)->getJson('/api/admin/manifest')->assertForbidden();
    }

    public function test_reset_changes_the_password_ends_other_sessions_and_keeps_nobody_signed_in(): void
    {
        $user = $this->member();
        $this->post('/_cms/account/forgot', ['email' => 'ada@example.com']);
        $link = $this->linkIn($this->mail[0]);

        $this->get($link)->assertRedirect('/reset/new');
        $this->post('/_cms/account/reset', ['password' => 'a-new-password-2'])->assertRedirect('/sign-in');
        $this->assertGuest();
        $this->assertStringContainsString('changed', $this->mail[1]->text);
        $this->post('/_cms/account/sign-in', ['email' => 'ada@example.com', 'password' => 'correct-horse-1']);
        $this->assertGuest();
        $this->post('/_cms/account/sign-in', ['email' => 'ada@example.com', 'password' => 'a-new-password-2']);
        $this->assertAuthenticatedAs($user->fresh());
        $this->post('/_cms/account/sign-out');

        // The link works once.
        $this->get($link);
        $this->get('/reset/new')->assertSee('invalid or has expired');
    }

    public function test_a_session_from_before_a_password_change_is_over(): void
    {
        $user = $this->member();
        $this->post('/_cms/account/sign-in', ['email' => 'ada@example.com', 'password' => 'correct-horse-1']);
        $this->get('/account')->assertOk();

        // Someone else, in another browser.
        User::query()->whereKey($user->id)->update(['password' => bcrypt('changed-elsewhere-1')]);
        $this->get('/account')->assertRedirect('/sign-in?next=%2Faccount');
    }

    public function test_a_suspended_visitor_is_signed_out_at_the_next_request(): void
    {
        $user = $this->member();
        $this->post('/_cms/account/sign-in', ['email' => 'ada@example.com', 'password' => 'correct-horse-1']);

        User::query()->whereKey($user->id)->update(['status' => Accounts::SUSPENDED]);
        $this->get('/account')->assertRedirect('/sign-in?next=%2Faccount');
        $this->assertGuest();
        $this->post('/_cms/account/sign-in', ['email' => 'ada@example.com', 'password' => 'correct-horse-1'])->assertRedirect('/sign-in');
        $this->assertGuest();
    }

    public function test_profile_edits_only_what_is_allowed(): void
    {
        Yaml::write($this->site.'/content/users.yaml', ['fields' => [
            ['handle' => 'bio', 'type' => 'textarea', 'label' => 'Bio', 'public' => true],
            ['handle' => 'internal_note', 'type' => 'text', 'label' => 'Internal'],
        ]]);
        $user = $this->member();
        $this->signIn();

        $this->get('/account/profile')->assertOk()->assertSee('name="data[bio]"', false)->assertDontSee('internal_note');
        $this->post('/_cms/account/profile', ['name' => 'Ada L', 'email' => 'other@example.com', 'super' => 1, 'roles' => ['admin'], 'data' => ['bio' => '<script>x</script>Hello', 'internal_note' => 'hack']])->assertRedirect('/account/profile');

        $fresh = $user->fresh();
        $this->assertSame('Ada L', $fresh->name);
        $this->assertSame('ada@example.com', $fresh->email);
        $this->assertFalse($fresh->super);
        $this->assertSame(['visitor'], $fresh->roles);
        $this->assertSame('xHello', $fresh->data['bio']);
        $this->assertArrayNotHasKey('internal_note', $fresh->data);
    }

    public function test_changing_email_needs_the_password_and_the_new_mailbox(): void
    {
        $user = $this->member();
        $this->member('taken@example.com');
        $this->signIn();

        $this->post('/_cms/account/email', ['email' => 'new@example.com', 'current' => 'nope'])->assertRedirect('/account/security');
        $this->assertSame([], $this->mail);

        $this->post('/_cms/account/email', ['email' => 'taken@example.com', 'current' => 'correct-horse-1']);
        $this->assertCount(1, $this->mail);
        $this->assertSame('taken@example.com', $this->mail[0]->to);
        $this->assertSame('ada@example.com', $user->fresh()->email);

        $this->mail = [];
        $this->post('/_cms/account/email', ['email' => 'new@example.com', 'current' => 'correct-horse-1']);
        $this->assertSame(['new@example.com', 'ada@example.com'], [$this->mail[0]->to, $this->mail[1]->to]);
        $this->assertSame('ada@example.com', $user->fresh()->email, 'Nothing changes until the new mailbox answers.');

        $this->get($this->linkIn($this->mail[0]))->assertRedirect('/confirm-email');
        $this->post('/_cms/account/confirm-email')->assertRedirect('/account');
        $this->assertSame('new@example.com', $user->fresh()->email);
        $this->assertSame('ada@example.com', end($this->mail)->to);
    }

    public function test_someone_elses_session_cannot_confirm_an_address(): void
    {
        $user = $this->member();
        $other = $this->member('other@example.com');
        $token = AccountToken::issue(AccountToken::EMAIL, 'new@example.com', now()->addDay(), $user);

        $this->signIn('other@example.com');
        $this->get('/confirm-email?token='.$token);
        $this->post('/_cms/account/confirm-email');
        $this->assertSame('other@example.com', $other->fresh()->email);
        $this->assertSame('ada@example.com', $user->fresh()->email);
    }

    public function test_data_export_holds_what_we_hold_and_no_secrets(): void
    {
        $user = $this->member();
        cms()->accounts()->grant($user, 'magazine', 'test');
        cms()->hooks()->addFilter('account.export', static fn (array $sections) => [...$sections, 'orders' => [['id' => 7]]]);
        $this->signIn();

        $this->post('/_cms/account/export', ['current' => 'nope'])->assertRedirect('/account/privacy');

        $response = $this->post('/_cms/account/export', ['current' => 'correct-horse-1'])->assertOk();
        $this->assertStringContainsString('attachment', (string) $response->headers->get('Content-Disposition'));
        $this->assertSame('ada@example.com', $response->json('sections.profile.email'));
        $this->assertSame('magazine', $response->json('sections.access.0.access'));
        $this->assertSame(7, $response->json('sections.orders.0.id'));
        $this->assertStringNotContainsString($user->password, $response->getContent());
        $this->assertStringNotContainsString('two_factor', $response->getContent());
    }

    public function test_deleting_an_account_asks_plugins_and_leaves_nothing_behind(): void
    {
        $user = $this->member();
        $id = $user->id;
        cms()->accounts()->grant($user, 'magazine');
        $blocked = true;
        $seen = [];
        cms()->hooks()->addFilter('account.delete.blockers', static function (array $reasons) use (&$blocked) {
            return $blocked ? [...$reasons, 'Cancel your subscription first.'] : $reasons;
        });
        cms()->hooks()->on('account.deleting', static function (User $u) use (&$seen) { $seen[] = 'deleting:'.$u->email; });
        cms()->hooks()->on('account.deleted', static function (string $gone) use (&$seen) { $seen[] = 'deleted:'.$gone; });
        $this->signIn();

        $this->post('/_cms/account/delete', ['current' => 'correct-horse-1', 'confirm' => 1]);
        $this->assertNotNull($user->fresh());
        $this->get('/account/privacy')->assertSee('Cancel your subscription first.');

        $blocked = false;
        $this->post('/_cms/account/delete', ['current' => 'correct-horse-1'])->assertRedirect('/account/privacy');
        $this->assertNotNull($user->fresh(), 'It takes the tick.');

        $this->post('/_cms/account/delete', ['current' => 'correct-horse-1', 'confirm' => 1])->assertRedirect('/account/deleted');
        $this->assertNull(User::query()->find($id));
        $this->assertSame(0, \Cms\Users\AccountGrant::query()->count());
        $this->assertSame(['deleting:ada@example.com', 'deleted:'.$id], $seen);
        $this->assertSame('ada@example.com', end($this->mail)->to);
        $this->assertGuest();
        $this->get('/account/deleted')->assertOk();
    }

    public function test_a_listener_that_fails_keeps_the_account(): void
    {
        $user = $this->member();
        cms()->hooks()->on('account.deleting', static function () { throw new \RuntimeException('no'); });
        $this->signIn();

        $this->followingRedirects()->post('/_cms/account/delete', ['current' => 'correct-horse-1', 'confirm' => 1])->assertSee('couldn’t delete');
        $this->assertNotNull($user->fresh());
    }

    public function test_the_team_has_the_account_pages_and_keeps_profile_password_and_data_in_the_admin(): void
    {
        $this->actingAs($this->admin());
        $this->get('/account')->assertOk()->assertSee('href="/admin/account"', false)->assertDontSee('href="/account/profile"', false);
        $this->get('/account/profile')->assertRedirect('/admin/account');
        $this->get('/account/privacy')->assertRedirect('/admin/account');
        $this->get('/sign-in')->assertRedirect('/account');
        $this->post('/_cms/account/delete', ['current' => 'x', 'confirm' => 1])->assertRedirect('/admin/account');
    }

    public function test_a_cookie_says_only_that_someone_is_signed_in_for_as_long_as_the_session(): void
    {
        $this->member();
        $cookie = static fn ($response) => collect($response->headers->getCookies())->first(static fn ($c) => $c->getName() === AccountInBrowser::COOKIE);

        $in = $cookie($this->post('/_cms/account/sign-in', ['email' => 'ada@example.com', 'password' => 'correct-horse-1']));
        $this->assertSame(['1', false, 0], [$in->getValue(), $in->isHttpOnly(), $in->getExpiresTime()], 'Readable by the page, gone with the browser session');
        $this->assertNull($cookie($this->get('/account')), 'Set once');

        $out = $cookie($this->post('/_cms/account/sign-out'));
        $this->assertLessThan(time(), $out->getExpiresTime());

        $kept = $cookie($this->post('/_cms/account/sign-in', ['email' => 'ada@example.com', 'password' => 'correct-horse-1', 'remember' => '1']));
        $this->assertGreaterThan(time() + 300 * 86400, $kept->getExpiresTime(), 'As long as "keep me signed in"');
    }

    public function test_a_page_everyone_may_get_the_same_copy_of_leaves_sign_in_or_my_account_to_the_browser(): void
    {
        $id = cms()->abilities()->execute('pages/customize', ['group' => 'accounts', 'handle' => 'deleted'], \Cms\Abilities\AbilityContext::forUser($this->admin()))['id'];
        cms()->entryService()->update($id, ['data' => ['blocks' => [
            ['type' => 'link', 'id' => 'mine', 'props' => ['label' => '', 'url' => '/'], 'bind' => ['label' => 'accounts.account.label', 'url' => 'accounts.account.url', 'visible' => 'account']],
            ['type' => 'link', 'id' => 'door', 'props' => ['label' => '', 'url' => '/'], 'bind' => ['label' => 'accounts.sign_in.label', 'url' => 'accounts.sign_in.url', 'hidden' => 'account']],
        ]]]);
        cms()->entryService()->publish($id);

        $shared = (string) $this->get('/account/deleted')->assertOk()->getContent();
        $this->assertMatchesRegularExpression('#<a [^>]*href="/account"[^>]*data-cms-account="in"|<a [^>]*data-cms-account="in"[^>]*href="/account"#', $shared);
        $this->assertMatchesRegularExpression('#<a [^>]*href="/sign-in"[^>]*data-cms-account="out"|<a [^>]*data-cms-account="out"[^>]*href="/sign-in"#', $shared);
        $this->assertStringContainsString(AccountInBrowser::COOKIE, $shared, 'The page tells them apart before it\'s painted');
        $this->assertStringContainsString('My account', $shared);

        // Signed in, the page is theirs alone, and only what's for them is on it.
        $this->member();
        $this->post('/_cms/account/sign-in', ['email' => 'ada@example.com', 'password' => 'correct-horse-1']);
        $own = (string) $this->get('/account/deleted')->assertOk()->getContent();
        $this->assertStringContainsString('href="/account"', $own);
        $this->assertStringNotContainsString('href="/sign-in"', $own);
        $this->assertStringNotContainsString('data-cms-account', $own);
    }

    public function test_sign_up_closed_or_without_mail(): void
    {
        cms()->settingsRegistry()->save('accounts', ['enabled' => true, 'sign_up' => 'closed']);
        $this->get('/sign-up')->assertOk()->assertSee('not open');
        $this->post('/_cms/account/sign-up', ['email' => 'a@example.com']);
        $this->assertSame([], $this->mail);
    }

    public function test_an_invited_account_comes_alive_through_the_mailbox(): void
    {
        $user = cms()->accounts()->ensure('buyer@example.com', 'Bea');
        $this->assertSame(Accounts::INVITED, $user->status);
        $this->assertSame([], $this->mail, 'Making it sends nothing.');
        $this->assertSame($user->id, cms()->accounts()->ensure('BUYER@example.com')->id);

        $this->post('/_cms/account/sign-in', ['email' => 'buyer@example.com', 'password' => 'anything-at-all-1']);
        $this->assertGuest();

        $this->post('/_cms/account/sign-up', ['email' => 'buyer@example.com']);
        $this->get($this->linkIn($this->mail[0]));
        $this->post('/_cms/account/complete', ['name' => 'Bea B', 'password' => 'correct-horse-1'])->assertRedirect('/account');
        $fresh = $user->fresh();
        $this->assertSame(Accounts::ACTIVE, $fresh->status);
        $this->assertNotNull($fresh->email_verified_at);
        $this->assertSame(1, User::query()->where('email', 'buyer@example.com')->count());
    }

    public function test_a_link_stops_working_when_sign_up_closes(): void
    {
        $this->post('/_cms/account/sign-up', ['email' => 'late@example.com']);
        $this->get($this->linkIn($this->mail[0]));
        cms()->settingsRegistry()->save('accounts', ['enabled' => true, 'sign_up' => 'closed']);
        $this->post('/_cms/account/complete', ['name' => 'Late', 'password' => 'correct-horse-1']);
        $this->assertNull(cms()->accounts()->find('late@example.com'));
    }

    public function test_a_stale_form_says_so_instead_of_an_error_page(): void
    {
        $this->app['env'] = 'local';
        $this->get('/sign-in')->assertOk();
        $this->from('/sign-in')->post('/_cms/account/sign-in', ['email' => 'a@example.com', 'password' => 'x', '_token' => 'old'])->assertStatus(303)->assertRedirect('/sign-in');
    }

    public function test_pages_wear_the_design_and_a_designer_can_replace_them(): void
    {
        $page = $this->get('/sign-in')->assertOk();
        $html = (string) $page->getContent();
        $this->assertStringContainsString('/_cms/site/design-', $html);
        $this->assertStringContainsString('class="cms-form"', $html);
        $this->assertStringContainsString('cms-button', $html);
        $this->assertStringContainsString('noindex', $html);
        $this->assertSame('no-store, private', $page->headers->get('Cache-Control'));
        $this->assertStringNotContainsString('style="', preg_replace('/<div[^>]*data-cms[^>]*>/', '', $html));

        // Customise: a draft of the standard page changes nothing until it is published.
        $id = cms()->abilities()->execute('pages/customize', ['group' => 'accounts', 'handle' => 'sign-in'], \Cms\Abilities\AbilityContext::forUser($this->admin()))['id'];
        $entry = cms()->entries()->find($id);
        $this->assertSame('account/sign-in', $entry->data['blocks'][0]['children'][1]['type']);
        $this->get('/sign-in')->assertOk()->assertDontSee('Members Only Door');

        cms()->entryService()->update($id, ['data' => ['blocks' => [['type' => 'heading', 'props' => ['text' => 'Members Only Door', 'level' => '1']], ['type' => 'account/sign-in', 'props' => ['submit' => 'Come In']]]]]);
        cms()->entryService()->publish($id);
        $this->get('/sign-in')->assertOk()->assertSee('Members Only Door')->assertSee('Come In');
    }

    public function test_german_pages_at_their_own_address(): void
    {
        $this->get('/de/sign-in')->assertOk()->assertSee('lang="de"', false);
        $this->post('/_cms/account/forgot', ['email' => 'nobody@example.com', '_locale' => 'de'])->assertRedirect('/de/reset');
    }
}

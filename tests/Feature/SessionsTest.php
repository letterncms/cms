<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Modules\Account\Sessions;
use Cms\Tests\TestCase;
use Illuminate\Auth\SessionGuard;
use Illuminate\Session\EncryptedStore;
use Illuminate\Support\Str;

/** Account › Signed In: every session of yours, from the file sessions a site has, and signing out of one or all others. */
final class SessionsTest extends TestCase
{
    private string $dir;

    protected function setUp(): void
    {
        parent::setUp();
        $this->dir = sys_get_temp_dir().'/cms-sessions-'.Str::random(8);
        mkdir($this->dir);
        config(['session.driver' => 'file', 'session.files' => $this->dir, 'session.encrypt' => true]);
        app('session')->forgetDrivers();
    }

    protected function tearDown(): void
    {
        array_map(unlink(...), glob($this->dir.'/*') ?: []);
        rmdir($this->dir);
        parent::tearDown();
    }

    /** A session of this person's, as signing in leaves it. */
    private function signedIn(string $user, string $agent, int $ago = 0): string
    {
        $store = new EncryptedStore('cms_session', app('session')->driver()->getHandler(), app('encrypter'));
        $store->start();
        $store->put('login_web_'.sha1(SessionGuard::class), $user);
        Sessions::remember($store, $agent, '203.0.113.7');
        $store->save();
        touch($this->dir.'/'.$store->getId(), time() - $ago);

        return $store->getId();
    }

    public function test_it_lists_your_sessions_and_signs_you_out_of_one_or_every_other(): void
    {
        $me = $this->admin();
        $other = $this->admin(['email' => 'grace@example.com']);
        $here = $this->signedIn((string) $me->id, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Chrome/130.0 Safari/537.36');
        $this->signedIn((string) $me->id, 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', 3600);
        $this->signedIn((string) $me->id, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0', 7200);
        $this->signedIn((string) $other->id, 'Mozilla/5.0 (X11; Linux x86_64) Firefox/131.0');

        // This request runs in the first one.
        $current = new EncryptedStore('cms_session', app('session')->driver()->getHandler(), app('encrypter'));
        $current->setId($here);
        $current->start();
        request()->setLaravelSession($current);
        $ctx = AbilityContext::forUser($me, 'admin');

        $list = $this->cms()->abilities()->execute('sessions/list', [], $ctx);
        $this->assertSame(['Chrome on macOS', 'Safari on iPhone', 'Firefox on Windows'], array_column($list, 'device'));
        $this->assertSame([true, false, false], array_column($list, 'current'));
        $this->assertSame(['This Device', null, null], array_column($list, 'currentLabel'));
        $this->assertSame('203.0.113.7', $list[1]['ip']);
        $this->assertNotContains($here, array_column($list, 'id'), 'a session id never leaves the server');
        // The first so many: this one, then the ones used last.
        $this->assertSame(['Chrome on macOS', 'Safari on iPhone'], array_column($this->cms()->abilities()->execute('sessions/list', ['limit' => 2], $ctx), 'device'));

        // One, after a dry run that names it and ends nothing.
        $dry = $this->cms()->abilities()->execute('sessions/delete', ['id' => $list[1]['id'], 'dryRun' => true], $ctx);
        $this->assertSame(['full', 'Safari on iPhone'], [$dry['checked'], $dry['changes'][0]['title']]);
        $this->assertCount(3, $this->cms()->abilities()->execute('sessions/list', [], $ctx));
        $token = $me->fresh()->remember_token;
        $this->assertSame(['ended' => 1], $this->cms()->abilities()->execute('sessions/delete', ['id' => $list[1]['id']], $ctx));
        $this->assertNotSame($token, $me->fresh()->remember_token, 'a "keep me signed in" cookie can\'t bring the signed-out browser back');

        // Not this one, and not someone else's.
        foreach ([['id' => $list[0]['id']], ['id' => 'nothing-of-yours'], []] as $input) {
            try {
                $this->cms()->abilities()->execute('sessions/delete', $input, $ctx);
                $this->fail('ended '.json_encode($input));
            } catch (AbilityException) {
            }
        }

        // Every other one: the "keep me signed in" token goes too.
        $token = $me->fresh()->remember_token;
        $this->assertSame(['ended' => 1], $this->cms()->abilities()->execute('sessions/delete', ['others' => true], $ctx));
        $this->assertSame(['Chrome on macOS'], array_column($this->cms()->abilities()->execute('sessions/list', [], $ctx), 'device'));
        $this->assertNotSame($token, $me->fresh()->remember_token);
        $this->assertCount(1, $this->cms()->abilities()->execute('sessions/list', [], AbilityContext::forUser($other, 'admin')), 'someone else stays signed in');
    }

    public function test_a_session_from_before_devices_were_kept_is_not_listed_but_is_ended_with_the_rest(): void
    {
        $me = $this->admin();
        $store = new EncryptedStore('cms_session', app('session')->driver()->getHandler(), app('encrypter'));
        $store->start();
        $store->put('login_web_'.sha1(SessionGuard::class), (string) $me->id);
        $store->save();
        $ctx = AbilityContext::forUser($me, 'admin');

        $this->assertSame([], $this->cms()->abilities()->execute('sessions/list', [], $ctx));
        $this->assertSame(['ended' => 1], $this->cms()->abilities()->execute('sessions/delete', ['others' => true], $ctx));
    }

    public function test_this_browser_keeps_its_keep_me_signed_in_with_the_new_token(): void
    {
        $me = $this->admin();
        $this->signedIn((string) $me->id, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0');
        $guard = auth()->guard('web');
        request()->cookies->set($guard->getRecallerName(), 'old');

        $this->cms()->abilities()->execute('sessions/delete', ['others' => true], AbilityContext::forUser($me, 'admin'));

        $queued = $guard->getCookieJar()->queued($guard->getRecallerName());
        $this->assertNotNull($queued);
        $this->assertSame($me->id.'|'.$me->fresh()->remember_token.'|'.$me->fresh()->password, $queued->getValue());
    }

    public function test_a_session_store_that_cant_be_listed_is_not_offered(): void
    {
        config(['session.driver' => 'array']);
        $me = $this->admin();

        $view = json_encode($this->cms()->abilities()->execute('views/get', ['id' => 'account'], AbilityContext::forUser($me, 'admin')));
        $this->assertStringNotContainsString('sessions/list', (string) $view);
        $this->expectException(AbilityException::class);
        $this->cms()->abilities()->execute('sessions/delete', ['others' => true], AbilityContext::forUser($me, 'admin'));
    }

    public function test_a_device_is_named_by_what_its_browser_says(): void
    {
        $this->assertSame('Edge on Windows', Sessions::name('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Edg/130.0'));
        $this->assertSame('Chrome on Android', Sessions::name('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36'));
        $this->assertSame('Unknown Device', Sessions::name(''));
    }
}

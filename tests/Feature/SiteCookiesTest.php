<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Tests\TestCase;
use Symfony\Component\HttpFoundation\Cookie;

/** Browsers share cookies across ports: sites on different localhost ports must not share names. */
final class SiteCookiesTest extends TestCase
{
    /** @return list<string> */
    private function cookieNames(string $url): array
    {
        return array_map(static fn (Cookie $cookie) => $cookie->getName(), $this->get($url)->assertOk()->headers->getCookies());
    }

    public function test_a_site_on_its_own_port_has_cookies_of_its_own(): void
    {
        $names = $this->cookieNames('http://localhost:8003/admin/login');

        $this->assertContains('cms_session-8003', $names);
        $this->assertContains('XSRF-TOKEN-8003', $names);
        $this->assertNotContains('cms_session', $names);
        $this->assertNotContains('XSRF-TOKEN', $names);
    }

    public function test_a_site_on_the_default_port_keeps_the_plain_names(): void
    {
        $names = $this->cookieNames('http://localhost/admin/login');

        $this->assertContains('cms_session', $names);
        $this->assertContains('XSRF-TOKEN', $names);
    }

    public function test_the_admin_is_told_the_name_of_its_cookie(): void
    {
        $this->get('http://localhost:8003/admin/login')->assertOk()->assertSee('"xsrfCookie":"XSRF-TOKEN-8003"', false);
        $this->get('http://localhost/admin/login')->assertOk()->assertSee('"xsrfCookie":"XSRF-TOKEN"', false);
    }
}

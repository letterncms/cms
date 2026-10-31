<?php

declare(strict_types=1);

namespace Cms\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Symfony\Component\HttpFoundation\Cookie;

/** The XSRF cookie under the site's own name; see {@see SiteCookies}. */
final class VerifySiteCsrf extends PreventRequestForgery
{
    protected function newCookie($request, $config)
    {
        $cookie = parent::newCookie($request, $config);

        return new Cookie(SiteCookies::xsrf($request), $cookie->getValue(), $cookie->getExpiresTime(), $cookie->getPath(), $cookie->getDomain(), $cookie->isSecure(), $cookie->isHttpOnly(), $cookie->isRaw(), $cookie->getSameSite());
    }
}

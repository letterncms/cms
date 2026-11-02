<?php

declare(strict_types=1);

namespace Cms\Modules\Account\Site;

use Closure;
use Cms\Users\AccountInBrowser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

/**
 * Keeps the cookie that says only "someone is signed in" in step with the session, for pages
 * built in advance. Set on the first request signed in, gone on the first one signed out, so a
 * sign-in, a sign-out or a session that ran out all correct it. It lasts as long as the session,
 * or as long as "keep me signed in" when that was ticked.
 */
final class SignedInCookie
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $name = AccountInBrowser::cookie($request);
        $guard = Auth::guard('web');
        $signedIn = $guard->check();
        $has = (string) $request->cookies->get($name, '') !== '';

        if ($signedIn && ! $has) {
            $remembered = $request->cookies->has($guard->getRecallerName()) || Cookie::hasQueued($guard->getRecallerName());
            $response->headers->setCookie(cookie($name, '1', $remembered ? 60 * 24 * 400 : 0, '/', null, null, false, false, 'lax'));
        } elseif (! $signedIn && $has) {
            $response->headers->setCookie(Cookie::forget($name, '/'));
        }

        return $response;
    }
}

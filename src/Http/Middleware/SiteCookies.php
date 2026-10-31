<?php

declare(strict_types=1);

namespace Cms\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Browsers don't tell ports apart when they store cookies, so sites on different
 * localhost ports would overwrite each other's session. A site on its own port
 * uses cookie names of its own.
 */
final class SiteCookies
{
    public function handle(Request $request, Closure $next): Response
    {
        if (($suffix = self::suffix($request)) !== '') {
            config(['session.cookie' => 'cms_session'.$suffix]);
            app('session')->driver()->setName('cms_session'.$suffix);
        }

        return $next($request);
    }

    public static function xsrf(Request $request): string
    {
        return 'XSRF-TOKEN'.self::suffix($request);
    }

    private static function suffix(Request $request): string
    {
        $port = (int) $request->getPort();

        return in_array($port, [0, 80, 443], true) ? '' : '-'.$port;
    }
}

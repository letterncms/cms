<?php

declare(strict_types=1);

namespace Cms\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Cms\Install\Installer;
use Symfony\Component\HttpFoundation\Response;

/**
 * Until the CMS is installed every request goes to the installer — the site,
 * admin, APIs and plugin routes would otherwise hit a database that does
 * not exist yet. Runs globally; only the installer passes: /install, the sites it offers
 * (/install/sites) and their pictures (/_cms/sites/…).
 */
final class EnsureInstalled
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->is('install', 'install/sites', '_cms/sites/*') && ! Installer::installed()) {
            return $request->expectsJson() || $request->is('api/*')
                ? response()->json(['error' => ['type' => 'not_installed', 'message' => __(':brand is not installed yet.')]], 503)
                : redirect('/install');
        }

        return $next($request);
    }
}

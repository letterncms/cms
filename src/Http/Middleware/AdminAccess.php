<?php

declare(strict_types=1);

namespace Cms\Http\Middleware;

use Closure;
use Cms\Users\Accounts;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class AdminAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->hasPermission('admin.access') || ($user->status ?? Accounts::ACTIVE) !== Accounts::ACTIVE) {
            return response()->json(['error' => ['type' => 'forbidden', 'message' => __('You do not have access to the admin.')]], 403);
        }

        return $next($request);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Cms\Admin\AdminShell;
use Cms\Admin\Manifest;

/**
 * Serves the active admin theme (decoupled front-end) and the manifest it is
 * built from. The theme only talks to the admin through this manifest and abilities.
 */
final class AdminController
{
    public function shell(AdminShell $shell, Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $accounts = cms()->accounts();

        // Someone with a public account has their own pages; the admin would only say no.
        if ($user && $accounts->enabled() && $accounts->isVisitor($user)) {
            return redirect()->to($accounts->pathOf('account'));
        }

        return $shell->render();
    }

    public function manifest(Request $request, Manifest $manifest): JsonResponse
    {
        return response()->json(['data' => $manifest->build($request->user())]);
    }
}

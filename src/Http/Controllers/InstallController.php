<?php

declare(strict_types=1);

namespace Cms\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Cms\Abilities\AbilityException;
use Cms\Admin\Translations;
use Cms\Http\Csp;
use Cms\Http\Middleware\SiteCookies;
use Cms\Install\Installer;
use Cms\Update\Layout;
use Symfony\Component\HttpFoundation\Response;

final class InstallController
{
    public function show(Request $request, Installer $installer): Response
    {
        if (Installer::installed()) {
            return redirect('/admin');
        }

        $nonce = Csp::nonce();
        $locale = $this->locale($request);

        return response()->view('cms::install', [
            'locale' => $locale,
            'text' => self::text(),
            'requirements' => $installer->requirements(),
            'nonce' => $nonce,
            'drivers' => \PDO::getAvailableDrivers(),
            'url' => $request->getSchemeAndHttpHost(),
            'needsToken' => (string) env('CMS_INSTALL_TOKEN', '') !== '',
        ])->header('Content-Security-Policy', "default-src 'self'; script-src 'nonce-{$nonce}'; style-src 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'");
    }

    public function store(Request $request, Installer $installer): JsonResponse
    {
        $this->locale($request);

        if (Installer::installed()) {
            return response()->json(['error' => ['type' => 'conflict', 'message' => __(':brand is already installed.')]], 409);
        }

        $token = (string) env('CMS_INSTALL_TOKEN', '');

        if ($token !== '' && ! hash_equals($token, (string) $request->input('install_token'))) {
            return response()->json(['error' => ['type' => 'forbidden', 'message' => __('The install token is not correct.')]], 403);
        }

        $input = $request->validate(Installer::rules());

        try {
            $user = $installer->install($input);
        } catch (AbilityException $e) {
            return response()->json(['error' => $e->toArray()], $e->status());
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json([
            'ok' => true,
            'redirect' => '/admin',
            'xsrfCookie' => SiteCookies::xsrf($request),
            'composer' => app(Layout::class)->managed() === 'composer',
            'recommended' => Installer::RECOMMENDED,
        ]);
    }

    /** The setup's last step, on a fresh request: the plugins it pulled have booted. */
    public function finish(Request $request, Installer $installer): JsonResponse
    {
        $installer->finish($request->user());

        return response()->json(['ok' => true]);
    }

    /** There is no account yet: the installer speaks the browser's language when the CMS does. */
    private function locale(Request $request): string
    {
        $languages = app(Translations::class)->languages();
        $locale = Translations::SOURCE;

        foreach ($request->getLanguages() as $preferred) {
            if (isset($languages[$code = strtolower(substr($preferred, 0, 2))])) {
                $locale = $code;
                break;
            }
        }

        app('translator')->setLocale($locale);

        return $locale;
    }

    /** @return array<string, string> The installer page's words, in the request's language. */
    private static function text(): array
    {
        return [
            'title' => __('Install :brand'),
            'heading' => __('Set Up Your Site'),
            'requirements' => __('Requirements'),
            'blocked' => __('This server is missing something :brand needs. Fix what is marked, then check again.'),
            'recheck' => __('Check Again'),
            'site' => __('Site'),
            'siteName' => __('Site Name'),
            'siteUrl' => __('Site URL'),
            'database' => __('Database'),
            'databaseType' => __('Type'),
            'sqlite' => __('SQLite (no server needed)'),
            'host' => __('Host'),
            'port' => __('Port'),
            'databaseName' => __('Database Name'),
            'username' => __('Username'),
            'password' => __('Password'),
            'prefix' => __('Table Prefix'),
            'prefixPlaceholder' => __('Optional, e.g. cms_'),
            'account' => __('Your Account'),
            'name' => __('Name'),
            'email' => __('Email'),
            'passwordHelp' => __('At least 10 characters, with letters and numbers.'),
            'token' => __('Install Token'),
            'install' => __('Install :brand'),
            'installing' => __('Installing…'),
            'failed' => __('The installation didn’t finish. Try again.'),
            'add' => __('Plugins'),
            'addHeading' => __('Add What You Need'),
            'addButton' => __('Install Plugins'),
            'skip' => __('Continue Without Plugins'),
            'continue' => __('Go to Dashboard'),
            'adding' => __('Finishing Your Site'),
            'addingOne' => __('Adding :package…'),
            'finishing' => __('Putting your site together…'),
            'paid' => __('Paid'),
            'composerSite' => __('This site is managed with Composer. Add plugins with: composer require letterncms/seo'),
            'noStore' => __('The store can’t be reached right now. You can add them later, under Plugins in the sidebar.'),
        ];
    }
}

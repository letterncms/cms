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
use Cms\Modules\Packages\StoreClient;
use Cms\Modules\Site\Kits\Kit;
use Cms\Modules\Site\Kits\Kits;
use Cms\Support\Files;
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

        // A store's pictures come from the store: the one place besides this site an image may.
        $store = self::origin((string) (app(StoreClient::class)->catalogUrl() ?? ''));

        return response()->view('cms::install', [
            'locale' => $locale,
            'text' => self::text(),
            'kits' => array_values(array_map(static fn (Kit $kit) => ['handle' => $kit->handle, 'name' => $kit->name(), 'preview' => $kit->toArray()['previews'][0] ?? null], app(Kits::class)->all())),
            'defaultKit' => Kits::DEFAULT,
            'defaultName' => __('Minimal'),
            'defaultPackage' => \Cms\Packages\PackageManifest::VENDOR.'/'.Kits::DEFAULT,
            'requirements' => $installer->requirements(),
            'nonce' => $nonce,
            'drivers' => \PDO::getAvailableDrivers(),
            'url' => $request->getSchemeAndHttpHost(),
            'needsToken' => (string) env('CMS_INSTALL_TOKEN', '') !== '',
        ])->header('Content-Security-Policy', "default-src 'self'; script-src 'nonce-{$nonce}'; style-src 'unsafe-inline'; img-src 'self' data:".($store !== null ? ' '.$store : '')."; frame-ancestors 'none'");
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
            'kit' => $input['kit'] ?? Kits::DEFAULT,
        ]);
    }

    /**
     * The site kits the store has, for a setup that can fetch them (not a site Composer manages: it says
     * `composer require` for a kit, as for a plugin). Free ones only, with their first picture. Asked by the
     * page once it is open, so a store that is slow or down never holds up the installer.
     */
    public function kits(): JsonResponse
    {
        if (Installer::installed() || app(Layout::class)->managed() === 'composer') {
            return response()->json(['kits' => []]);
        }

        try {
            $catalog = app(StoreClient::class)->catalog(refresh: true);
        } catch (\Throwable) {
            return response()->json(['kits' => []]);
        }

        return response()->json(['kits' => self::storeKits($catalog['items'], array_keys(app(Kits::class)->all()))]);
    }

    /**
     * The store's free kits a setup may fetch, once each: a kit this site already has (put in kits/ by
     * Composer or by hand) is the one offered, and the store's copy of it is left out.
     *
     * @param  list<array<string, mixed>>  $items  the catalog as StoreClient describes it
     * @param  list<string>  $here  the handles of the kits this site has
     * @return list<array{handle: string, name: string, package: string, preview: ?string}>
     */
    public static function storeKits(array $items, array $here): array
    {
        $kits = [];

        foreach ($items as $item) {
            [$vendor, $name] = explode('/', (string) ($item['package'] ?? ''), 2) + [1 => ''];
            $handle = $vendor === \Cms\Packages\PackageManifest::VENDOR ? $name : "{$vendor}-{$name}";

            if (($item['type'] ?? null) === 'kit' && ($item['action'] ?? null) === 'install'
                && Files::isHandle($handle) && ! in_array($handle, $here, true) && ! isset($kits[$handle])) {
                $kits[$handle] = ['handle' => $handle, 'name' => (string) $item['title'], 'package' => (string) $item['package'], 'preview' => $item['preview'] ?? $item['icon'] ?? null];
            }
        }

        return array_values($kits);
    }

    private static function origin(string $url): ?string
    {
        $parts = parse_url($url);

        return isset($parts['scheme'], $parts['host']) && in_array($parts['scheme'], ['https', 'http'], true) ? $parts['scheme'].'://'.$parts['host'].(isset($parts['port']) ? ':'.$parts['port'] : '') : null;
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
            'ready' => __('This server has everything :brand needs'),
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
            'showPassword' => __('Show Password'),
            'prefix' => __('Table Prefix'),
            'account' => __('Your Account'),
            'name' => __('Name'),
            'email' => __('Email'),
            'token' => __('Install Token'),
            'install' => __('Install :brand'),
            'installing' => __('Installing…'),
            'failed' => __('The installation didn’t finish. Try again.'),
            'add' => __('Plugins'),
            'addHeading' => __('Add What You Need'),
            'addButton' => __('Install Plugins'),
            'skip' => __('Continue Without Plugins'),
            'continue' => __('Go to Dashboard'),
            'kits' => __('Start From'),
            'addingKit' => __('Adding the kit :name…'),
            'kitFailed' => __('The kit you chose couldn’t be fetched.'),
            'useMinimal' => __('Start Without a Kit'),
            'adding' => __('Finishing Your Site'),
            'addingOne' => __('Adding :package…'),
            'finishing' => __('Putting your site together…'),
            'composerSite' => __('This site is managed with Composer. Add plugins with: composer require letterncms/seo'),
            'noStore' => __('The store can’t be reached right now. You can add them later, under Plugins in the sidebar.'),
        ];
    }
}

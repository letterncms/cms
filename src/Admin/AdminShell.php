<?php

declare(strict_types=1);

namespace Cms\Admin;

use Cms\Http\Middleware\SiteCookies;
use Illuminate\Http\Response;
use Cms\Support\Brand;
use Cms\Http\Csp;
use Cms\Cms;
use Cms\Packages\PackageManifest;
use RuntimeException;

/**
 * Renders the HTML document of the admin module.
 *
 * Contract for admin themes: ship dist/admin.json
 *   { "entry": "main.js", "css": ["main.css"], "imports": { "react": "react.js", "@letterncms/ui": "ui.js", … },
 *     "preload": ["chunk.js", …], "fonts": ["font.woff2", …] }
 * Paths are relative to dist/; preload and fonts are optional. Imports become the import map so plugin
 * modules can share React and the admin's UI kit without bundling them.
 */
final class AdminShell
{
    public function __construct(private readonly Cms $cms, private readonly Translations $translations, private readonly Manifest $manifest) {}

    public function render(): Response
    {
        $admin = $this->admin();
        $build = $this->build($admin);
        $assets = $this->cms->packages()->assets();
        $url = static fn (string $file) => $assets->url($admin, $file);

        $imports = [];

        foreach ((array) ($build['imports'] ?? []) as $specifier => $file) {
            $imports[$specifier] = $url($file);
        }

        $imports = [...$imports, ...$this->cms->admin()->imports()];
        $nonce = Csp::nonce();
        $user = auth()->user();
        $admin = $user !== null && $user->hasPermission('admin.access');

        $boot = [
            'base' => '/admin',
            'api' => '/api/admin',
            'version' => Cms::VERSION,
            'brand' => Brand::all(),
            'site' => ['name' => config('app.name'), 'url' => $this->cms->url()],
            'xsrfCookie' => SiteCookies::xsrf(request()),
            // The admin's language and its strings, so even the sign-in screen speaks it.
            'locale' => $locale = $this->translations->current(),
            'languages' => $this->translations->languages(),
            'messages' => (object) $this->translations->messages($locale),
        ];

        // Signed in, the manifest comes along: the admin draws its first screen without asking for it.
        if ($admin) {
            $boot['manifest'] = $this->manifest->build($user);
        }

        $css = implode("\n", [
            ...array_map(static fn ($f) => '<link rel="stylesheet" href="'.e($url($f)).'">', (array) ($build['css'] ?? [])),
            // Marked, so the admin can link and unlink them as packages are turned on and off.
            ...array_map(static fn ($href) => '<link rel="stylesheet" href="'.e($href).'" data-cms-module>', $this->cms->admin()->styles()),
        ]);
        // Signed in, every module's entry is fetched alongside the admin instead of after the manifest arrives.
        $modules = $admin ? array_column($this->cms->admin()->modules(), 'url') : [];
        $preloads = implode("\n", [
            ...array_map(static fn ($f) => '<link rel="preload" href="'.e($url($f)).'" as="font" type="font/woff2" crossorigin>', (array) ($build['fonts'] ?? [])),
            ...array_map(static fn ($f) => '<link rel="modulepreload" href="'.e($url($f)).'">', (array) ($build['preload'] ?? [])),
            ...array_map(static fn ($href) => '<link rel="modulepreload" href="'.e($href).'">', $modules),
        ]);
        $map = json_encode(['imports' => $imports], JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);
        $bootJson = json_encode($boot, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP);
        $entry = e($url((string) $build['entry']));
        $title = e(config('app.name').' · Admin');
        $favicon = e(Brand::asset('mark.svg'));
        $noscript = e(__('The :brand admin needs JavaScript.'));
        // Light or dark before the first paint, so a dark admin never flashes white: what the person's account says
        // (their choice follows them to a browser that has never seen it), else what this browser kept, else the system's.
        $theirs = $admin ? (((array) ($user->preferences ?? []))['theme'] ?? null) : null;
        $theirs = json_encode(in_array($theirs, ['light', 'dark', 'system'], true) ? $theirs : null);
        $scheme = "try{var a={$theirs},p=a||localStorage.getItem('cms.theme');if(a)localStorage.setItem('cms.theme',a);document.documentElement.dataset.theme=p==='dark'||(p!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}catch(e){}";

        $html = <<<HTML
<!doctype html>
<html lang="{$locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="color-scheme" content="light dark">
<title>{$title}</title>
<script nonce="{$nonce}">{$scheme}</script>
<link rel="icon" href="{$favicon}" type="image/svg+xml">
{$css}
<script type="importmap" nonce="{$nonce}">{$map}</script>
{$preloads}
<script nonce="{$nonce}">window.__CMS__ = {$bootJson};</script>
<script type="module" src="{$entry}" nonce="{$nonce}"></script>
</head>
<body>
<div id="cms"></div>
<noscript>{$noscript}</noscript>
</body>
</html>
HTML;

        $csp = implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'nonce-{$nonce}'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data:",
            "connect-src 'self'",
            "frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com",
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'",
        ]);

        return new Response($html, 200, [
            'Content-Type' => 'text/html; charset=utf-8',
            'Content-Security-Policy' => $csp,
            'X-Frame-Options' => 'SAMEORIGIN',
        ]);
    }

    private function admin(): PackageManifest
    {
        return $this->cms->packages()->repository()->find(PackageManifest::VENDOR.'/admin') ?? throw new RuntimeException('The admin module is missing.');
    }

    private function build(PackageManifest $admin): array
    {
        $file = $admin->path('dist/admin.json');

        if (! is_file($file)) {
            throw new RuntimeException("The admin has not been built (missing {$file}).");
        }

        $build = json_decode((string) file_get_contents($file), true);

        if (! is_array($build) || ! isset($build['entry'])) {
            throw new RuntimeException("Invalid {$file}.");
        }

        return $build;
    }
}

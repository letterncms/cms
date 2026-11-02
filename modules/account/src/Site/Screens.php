<?php

declare(strict_types=1);

namespace Cms\Modules\Account\Site;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Cms\Admin\Translations;
use Cms\Blocks\BlockRenderer;
use Cms\Cms;
use Cms\Content\Entries\Entry;
use Cms\Extend\Hooks;
use Cms\Site\Http\SiteController;
use Cms\Site\Rendering\Renderer;

/**
 * The public account pages. A plugin ships no template: a screen is a block document, so it wears
 * the site's design and a designer can change everything in the builder. Until someone
 * customises one (an entry of the `screens` collection) it renders from its seed, which writes
 * nothing, so read-only sites work and every language comes from lang/*.json.
 *
 * Plugins add screens through the `account.screens` filter:
 *   'invoices' => [path: '/account/invoices', auth: 'user', nav: true, order: 30, seed: fn () => [...nodes]] and a label
 *
 * Everyone signed in has these pages, the team too: what they bought is here, like anyone's. A
 * screen with `admin: true` is one the team has in the admin instead, where it asks for more.
 */
final class Screens
{
    public const string COLLECTION = 'screens';

    /** @var array<string, array>|null */
    private ?array $all = null;

    public function __construct(private readonly Cms $cms, private readonly Hooks $hooks) {}

    /** @return array<string, array{label: string, path: ?string, auth: string, nav?: bool, seed: callable(): array}> */
    public function all(): array
    {
        return $this->all ??= (array) $this->hooks->filter('account.screens', $this->defaults());
    }

    public function get(string $handle): ?array
    {
        return $this->all()[$handle] ?? null;
    }

    /** The page's address in a language: the default language has no prefix unless i18n says so. */
    public function url(string $handle, ?string $locale = null): string
    {
        return $this->prefix($locale ?? $this->cms->defaultLocale()).($this->get($handle)['path'] ?? '/'.$handle);
    }

    /** Pages at a path a live entry already has: the entry wins, and the admin says so. */
    public function conflict(string $handle): bool
    {
        $path = $this->get($handle)['path'] ?? null;

        return $path !== null && ($entry = $this->cms->entries()->findByUri($path)) && $entry->isLive();
    }

    public function routes(): void
    {
        $prefixes = [$this->cms->defaultLocale() => ''];

        foreach ($this->cms->locales() as $locale) {
            $prefixes[$locale] = $this->prefix($locale);
        }

        Route::middleware('web')->group(function () use ($prefixes): void {
            foreach ($this->all() as $handle => $screen) {
                if (($screen['path'] ?? null) === null) {
                    continue;
                }

                foreach (array_unique($prefixes) as $locale => $prefix) {
                    Route::match(['GET', 'HEAD'], $prefix.$screen['path'], fn (Request $request) => $this->show($handle, (string) $locale, $request));
                }
            }

            Route::post('/_cms/account/{form}', [AccountController::class, 'submit'])->where('form', '[a-z-]+');
        });
    }

    private function show(string $handle, string $locale, Request $request): mixed
    {
        if ($this->conflict($handle)) {
            return app(SiteController::class)->show($request);
        }

        $accounts = $this->cms->accounts();
        $user = $accounts->current();
        $auth = $this->get($handle)['auth'] ?? 'any';

        if ($auth === 'guest' && $user) {
            return redirect()->to($this->home($locale));
        }

        if ($auth === 'user' && ! $user) {
            return redirect()->to((string) $accounts->signInUrl($this->prefix($locale).$this->get($handle)['path'], $locale));
        }

        if ($auth === 'user' && ! empty($this->get($handle)['admin']) && ! $accounts->isVisitor($user)) {
            return redirect()->to('/admin/account');
        }

        // Links from an email: into the session and off the address bar, so the token leaves no trail. Nothing is used up yet.
        if ($auth === 'token' && ($token = $request->query('token')) && is_string($token)) {
            $request->session()->put('account.token.'.$handle, $token);

            return redirect()->to($this->url($handle, $locale), 303);
        }

        // A new address is confirmed by the account's own session, so sign in first and come back.
        if ($handle === 'confirm-email' && ! $user) {
            return redirect()->to((string) $accounts->signInUrl($this->url($handle, $locale), $locale));
        }

        return $this->respond($handle, $locale);
    }

    public function respond(string $handle, string $locale, int $status = 200): Response
    {
        $html = app(Renderer::class)->entry($this->document($handle, $locale))['html'];

        return new Response($html, $status, ['Content-Type' => 'text/html; charset=utf-8', 'Cache-Control' => 'no-store, private']);
    }

    /** A fragment of a screen, for inside another page. */
    public function fragment(string $handle, string $locale): string
    {
        return app(BlockRenderer::class)->render($this->seedIn($handle, $locale));
    }

    /** The customised page in this language, in the default language, or else the seed. */
    public function document(string $handle, string $locale): Entry
    {
        foreach (array_unique([$locale, $this->cms->defaultLocale()]) as $language) {
            $entry = $this->cms->entries()->query()->collection(self::COLLECTION)->locale($language)->live()->where('slug', $handle)->first();

            if ($entry) {
                $entry = clone $entry;
                $entry->uri = $this->url($handle, $locale);
                $entry->data['seo']['noindex'] = true;

                return $entry;
            }
        }

        $translations = $this->cms->app()->make(Translations::class);
        $previous = $translations->current();
        $translations->apply($locale);

        try {
            $title = __($this->get($handle)['label'] ?? $handle);
        } finally {
            $translations->apply($previous);
        }

        return new Entry(id: strtolower((string) Str::ulid()), collection: self::COLLECTION, locale: $locale, slug: $handle, title: $title, status: 'published', data: ['blocks' => $this->seedIn($handle, $locale), 'seo' => ['noindex' => true]], uri: $this->url($handle, $locale), publishedAt: CarbonImmutable::now());
    }

    /** The seed, with its text in this language. */
    public function seedIn(string $handle, string $locale): array
    {
        $translations = $this->cms->app()->make(Translations::class);
        $previous = $translations->current();
        $translations->apply($locale);

        try {
            return ($this->get($handle)['seed'] ?? static fn () => [])();
        } finally {
            $translations->apply($previous);
        }
    }

    /** @return array<string, array> The screens in the account's own menu, in order, for this person. */
    public function menu(?\Cms\Users\User $user): array
    {
        $team = $user && ! $this->cms->accounts()->isVisitor($user);
        $screens = array_filter($this->all(), static fn (array $screen) => ! empty($screen['nav']) && ! ($team && ! empty($screen['admin'])));
        uasort($screens, static fn (array $a, array $b) => ($a['order'] ?? 100) <=> ($b['order'] ?? 100));

        return $screens;
    }

    public function home(string $locale): string
    {
        $next = (string) $this->cms->settings('accounts', 'after_sign_in', '/account');

        return $next === '/account' ? $this->url('account', $locale) : $next;
    }

    private function prefix(string $locale): string
    {
        return $locale === $this->cms->defaultLocale() && ! $this->cms->settings('i18n', 'prefix_default', false) ? '' : '/'.strtolower($locale);
    }

    private function defaults(): array
    {
        $screen = static fn (array $screen, array $blocks = []) => [...$screen, 'seed' => static fn () => self::page($screen, $blocks)];

        return [
            'sign-in' => $screen(['label' => 'Sign in', 'path' => '/sign-in', 'auth' => 'guest'], ['sign-in']),
            'sign-up' => $screen(['label' => 'Create an account', 'description' => 'Enter your email address and we’ll send you a link to set up your account.', 'path' => '/sign-up', 'auth' => 'guest'], ['sign-up']),
            'complete' => $screen(['label' => 'Set up your account', 'path' => '/sign-up/complete', 'auth' => 'token'], ['complete']),
            'forgot' => $screen(['label' => 'Reset your password', 'description' => 'Enter your email address and we’ll send you a link.', 'path' => '/reset', 'auth' => 'guest'], ['forgot']),
            'reset' => $screen(['label' => 'Choose a new password', 'path' => '/reset/new', 'auth' => 'token'], ['reset']),
            'confirm-email' => $screen(['label' => 'Confirm your email address', 'path' => '/confirm-email', 'auth' => 'token'], ['confirm-email']),
            'account' => $screen(['label' => 'Your account', 'nav_label' => 'Overview', 'path' => '/account', 'auth' => 'user', 'nav' => true, 'order' => 0], ['overview', 'sign-out']),
            'profile' => $screen(['label' => 'Profile', 'path' => '/account/profile', 'auth' => 'user', 'admin' => true, 'nav' => true, 'order' => 60], ['profile']),
            'security' => $screen(['label' => 'Email and password', 'path' => '/account/security', 'auth' => 'user', 'admin' => true, 'nav' => true, 'order' => 70], [['label' => 'Change your email address'], 'email', ['label' => 'Change your password'], 'password']),
            'privacy' => $screen(['label' => 'Your data', 'path' => '/account/privacy', 'auth' => 'user', 'admin' => true, 'nav' => true, 'order' => 80], [['label' => 'Download your data'], 'export', ['label' => 'Delete your account'], 'delete']),
            'deleted' => $screen(['label' => 'Your account is gone', 'description' => 'We deleted your account and the data that belongs to it.', 'path' => '/account/deleted', 'auth' => 'any']),
            'denied' => $screen(['label' => 'You don’t have access to this page', 'path' => null, 'auth' => 'any'], ['gate-notice']),
            'teaser-notice' => ['label' => 'Teaser Notice', 'path' => null, 'auth' => 'any', 'seed' => static fn () => [['type' => 'account/gate-notice', 'id' => 'teasernotice', 'props' => []]]],
        ];
    }

    /** @param list<string|array{label: string}> $blocks Account blocks by name, and headings between them. */
    private static function page(array $screen, array $blocks): array
    {
        $children = [['id' => 'stitle', 'type' => 'heading', 'props' => ['text' => __($screen['label']), 'level' => '1']]];

        if (isset($screen['description'])) {
            $children[] = ['id' => 'sintro', 'type' => 'paragraph', 'props' => ['text' => __($screen['description'])]];
        }

        if (($screen['auth'] ?? null) === 'user') {
            $children[] = ['id' => 'snav', 'type' => 'account/nav', 'props' => []];
        }

        foreach ($blocks as $i => $block) {
            $children[] = is_array($block)
                ? ['id' => 'sblock'.$i, 'type' => 'heading', 'props' => ['text' => __($block['label']), 'level' => '2']]
                : ['id' => 'sblock'.$i, 'type' => 'account/'.$block, 'props' => []];
        }

        return [['id' => 'smain', 'type' => 'section', 'props' => ['width' => 'prose'], 'children' => $children]];
    }
}

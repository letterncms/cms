<?php

declare(strict_types=1);

namespace Cms;

use Cms\Support\Brand;
use Cms\Support\BrandedTranslator;
use Illuminate\Console\Application as ConsoleApplication;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Abilities\Core\SystemAbilities;
use Cms\Admin\AdminRegistry;
use Cms\Admin\Arranged;
use Cms\Admin\Navigation;
use Cms\Content\Collections\CollectionRepository;
use Cms\Content\Entries\DatabaseDriver;
use Cms\Content\Entries\EntryRepository;
use Cms\Content\Entries\EntryService;
use Cms\Content\Entries\FileDriver;
use Cms\Content\Entries\UriBuilder;
use Cms\Content\Fields\FieldTypeRegistry;
use Cms\Content\Fields\Fieldsets;
use Cms\Content\Fields\Types;
use Cms\Content\Globals\GlobalRepository;
use Cms\Content\Revisions\Revisions;
use Cms\Context\ContextRegistry;
use Cms\Context\SkillRegistry;
use Cms\Contracts;
use Cms\Extend\Hooks;
use Cms\Http\Middleware\AdminAccess;
use Cms\Http\Middleware\AdminLocale;
use Cms\Http\Middleware\EnsureInstalled;
use Cms\Packages\AssetPublisher;
use Cms\Packages\PackageManager;
use Cms\Packages\PackageRepository;
use Cms\Packages\Psr4Loader;
use Cms\Settings\SettingsRegistry;
use Cms\Users\ApiToken;
use Cms\Users\Permissions;
use Cms\Users\Roles;
use Cms\Users\UserFields;

final class CmsServiceProvider extends ServiceProvider
{
    /** Services every plugin can rely on (bound as singletons). */
    private const array SERVICES = [
        Cms::class => Cms::class,
        Hooks::class => Hooks::class,
        AbilityRegistry::class => AbilityRegistry::class,
        Abilities\AgentGuide::class => Abilities\AgentGuide::class,
        FieldTypeRegistry::class => FieldTypeRegistry::class,
        Fieldsets::class => Fieldsets::class,
        CollectionRepository::class => CollectionRepository::class,
        \Cms\Content\Collections\Archives::class => \Cms\Content\Collections\Archives::class,
        DatabaseDriver::class => DatabaseDriver::class,
        FileDriver::class => FileDriver::class,
        EntryRepository::class => EntryRepository::class,
        EntryService::class => EntryService::class,
        UriBuilder::class => UriBuilder::class,
        Revisions::class => Revisions::class,
        GlobalRepository::class => GlobalRepository::class,
        Content\BuiltinPages::class => Content\BuiltinPages::class,
        Permissions::class => Permissions::class,
        Roles::class => Roles::class,
        Users\Accounts::class => Users\Accounts::class,
        Content\Entries\EntryGate::class => Content\Entries\EntryGate::class,
        UserFields::class => UserFields::class,
        AdminRegistry::class => AdminRegistry::class,
        Admin\Translations::class => Admin\Translations::class,
        Navigation::class => Navigation::class,
        Admin\Views::class => Admin\Views::class,
        ContextRegistry::class => ContextRegistry::class,
        SkillRegistry::class => SkillRegistry::class,
        SettingsRegistry::class => SettingsRegistry::class,
        PackageRepository::class => PackageRepository::class,
        Psr4Loader::class => Psr4Loader::class,
        AssetPublisher::class => AssetPublisher::class,
        PackageManager::class => PackageManager::class,
        Support\Remote::class => Support\Remote::class,
        Trust\TrustRegistry::class => Trust\TrustRegistry::class,
        Update\Layout::class => Update\Layout::class,
        Update\ReleaseFeed::class => Update\ReleaseFeed::class,
        Update\CoreUpdate::class => Update\CoreUpdate::class,
        Packages\Install\PackageJobs::class => Packages\Install\PackageJobs::class,
        // Contracts with safe defaults, for when the module that binds them (Site, Assistant) is off.
        Contracts\SiteBuilder::class => Contracts\Defaults\NullSiteBuilder::class,
        Contracts\Agent::class => Contracts\Defaults\NoAgent::class,
        Contracts\Translator::class => Contracts\Defaults\NoTranslator::class,
    ];

    /** Set while an update migrates core tables: nothing a package does may run before that. */
    public static bool $withoutPackages = false;

    public function register(): void
    {
        // Bound here rather than via $singletons: Laravel processes that property after
        // register() returns, which would drop instances plugins resolve below.
        foreach (self::SERVICES as $abstract => $concrete) {
            $this->app->singleton($abstract, $concrete);
        }

        $this->registerFieldTypes();
        // Labels are English unless the admin asks for the user's language (AdminLocale); `app.locale` is the site's content language.
        $this->app->afterResolving('translator', static fn ($translator) => $translator->setLocale(Admin\Translations::SOURCE));
        $this->app->extend('translator', static fn ($translator) => BrandedTranslator::from($translator));
        ConsoleApplication::starting(static function (ConsoleApplication $console): void {
            $console->setName(Brand::get());
            $console->setVersion(Cms::VERSION);
        });

        if (! self::$withoutPackages) {
            $this->app->make(PackageManager::class)->register();
        }
    }

    public function boot(): void
    {
        // A store on a private address exists only on a developer's machine.
        Support\SafeFetcher::$allowPrivate = filter_var(env('CMS_STORE_ALLOW_PRIVATE', false), FILTER_VALIDATE_BOOLEAN) && $this->app->environment(['local', 'testing']);

        $this->loadViewsFrom($this->app->cmsPath('resources/views'), 'cms');
        $this->registerAuth();
        $this->registerPermissions();
        $this->registerAbilities();
        $this->registerSettings();
        $this->registerAdmin();
        $this->registerContext();
        $this->registerRoutes();
        $this->app->make(Content\Entries\EntryGate::class)->listen();
        $this->app->make(Admin\Translations::class)->register();

        // Hosts without cron: let scheduled entries go live after web requests (checked at most once a minute).
        $this->app->terminating(function (): void {
            if (! $this->app->runningInConsole() && Install\Installer::installed()) {
                $this->app->make(Content\Entries\ScheduledPublisher::class)->runIfDue();
            }
        });

        if ($this->app->runningInConsole()) {
            $this->commands([
                Console\InstallCommand::class,
                Console\InstallFinishCommand::class,
                Console\ServeCommand::class,
                Console\RunCommand::class,
                Console\MigrateCommand::class,
                Console\UpdateCommand::class,
                Console\PluginsCommand::class,
                Console\PluginCommand::class,
                Console\UserCommand::class,
                Console\TokenCommand::class,
                Console\SchedulePublishCommand::class,
            ]);
        }
    }

    private function registerFieldTypes(): void
    {
        $this->app->afterResolving(FieldTypeRegistry::class, static function (FieldTypeRegistry $types): void {
            foreach ([
                Types\Text::class, Types\Textarea::class, Types\RichText::class, Types\Markdown::class, Types\Number::class,
                Types\Toggle::class, Types\Select::class, Types\Date::class, Types\Slug::class, Types\Url::class,
                Types\Email::class, Types\Color::class, Types\Entries::class, Types\Terms::class, Types\Users::class, Types\Tags::class,
                Types\Code::class, Types\Json::class, Types\Group::class, Types\Repeater::class, Types\Matrix::class, Types\Icon::class,
                Types\Link::class, Types\DateRange::class, Types\Time::class, Types\Range::class, Types\Table::class, Types\Geo::class,
            ] as $type) {
                $types->register(new $type);
            }
        });
    }

    private function registerAuth(): void
    {
        Auth::viaRequest('cms-token', static function (Request $request) {
            $plain = $request->bearerToken();
            $token = $plain ? ApiToken::findByPlain($plain) : null;

            if (! $token || ! $token->user) {
                return null;
            }

            $token->touchUsage();
            $request->attributes->set('cms.token', $token);

            return $token->user;
        });

        RateLimiter::for('cms-api', static fn (Request $request) => Limit::perMinute(240)->by($request->bearerToken() ? hash('sha256', $request->bearerToken()) : $request->ip()));
        RateLimiter::for('cms-login', static fn (Request $request) => [
            Limit::perMinute(5)->by(strtolower((string) $request->input('email')).'|'.$request->ip()),
            Limit::perMinute(20)->by($request->ip()),
        ]);
        RateLimiter::for('cms-public', static fn (Request $request) => Limit::perMinute(120)->by($request->ip()));
    }

    /** The kernel's own permissions; modules register theirs (entries.*, users.manage, packages.manage…). */
    private function registerPermissions(): void
    {
        $p = $this->app->make(Permissions::class);

        $p->register('admin.access', 'Access the Admin', 'General');
        $p->register('settings.manage', 'Manage Settings', 'System');
        $p->register('users.view', 'View Users', 'Users');
    }

    private function registerAbilities(): void
    {
        $abilities = $this->app->make(AbilityRegistry::class);

        $this->app->make(SystemAbilities::class)->register($abilities);
    }

    /** The core's own settings are namespaces like any plugin's: site.yaml and admin.yaml. */
    private function registerSettings(): void
    {
        $settings = $this->app->make(SettingsRegistry::class);
        $hooks = $this->app->make(Hooks::class);

        $settings->register('site', 'General', [
            ['handle' => 'name', 'type' => 'text', 'label' => 'Name', 'required' => true, 'default' => Brand::get(), 'width' => 'half'],
            ['handle' => 'url', 'type' => 'url', 'label' => 'Public URL', 'width' => 'half'],
            ['handle' => 'description', 'type' => 'textarea', 'label' => 'Description', 'rows' => 2],
            ['handle' => 'timezone', 'type' => 'select', 'label' => 'Timezone', 'dynamic' => 'timezones', 'default' => 'UTC', 'required' => true, 'width' => 'half'],
            ['handle' => 'locale', 'type' => 'text', 'label' => 'Language', 'default' => 'en', 'required' => true, 'width' => 'half', 'placeholder' => 'en'],
            // Empty: each person's browser decides (English when the CMS doesn't speak it); Account → Appearance overrides it.
            ['handle' => 'admin_language', 'type' => 'select', 'label' => 'Admin Language', 'dynamic' => 'admin-languages', 'placeholder' => 'Browser Language', 'width' => 'half'],
        ], icon: 'globe', description: 'Name, address, language and timezone.', order: 0, section: 'site');

        // The defaults everyone's sidebar and home screen start from. Each is saved where it is arranged
        // (Customize Sidebar, the home screen's Customize → Save as Default), so they have no page.
        $settings->register(Arranged::SETTINGS, 'Admin', [
            ['handle' => 'sidebar', 'type' => 'json', 'label' => 'Sidebar'],
        ], icon: 'sidebar', order: 50, section: 'system', page: false);

        $hooks->addFilter('fields.options.admin-languages', fn (array $options) => [...$options, ...$this->app->make(Admin\Translations::class)->languages()]);
        $hooks->addFilter('fields.options.timezones', static fn (array $options) => [...$options, ...timezone_identifiers_list()]);
        // Every collection that holds content of its own, and the system ones whose pages choose a template
        // (account and store pages): not templates or components.
        $hooks->addFilter('fields.options.collections', fn (array $options) => [...$options, ...array_map(static fn ($c) => $c->title, array_filter(
            $this->app->make(CollectionRepository::class)->all(),
            static fn ($c) => ! $c->system || in_array('template', array_column($c->fields, 'handle'), true),
        ))]);

        $hooks->addFilter('settings.saving', function (array $values, string $namespace, array $stored) {
            return match ($namespace) {
                'site' => $this->siteSaving($values),
                Arranged::SETTINGS => array_replace($values, array_map(static fn (Arranged $part) => $part->arrangement()->normalize($values[$part->key()] ?? null, $stored[$part->key()] ?? null), Arranged::all())),
                default => $values,
            };
        });

        $hooks->on('settings.saved', static function (string $namespace, array $values): void {
            if ($namespace === 'site') {
                config([
                    'app.name' => (string) $values['name'],
                    'app.url' => rtrim((string) (($values['url'] ?? null) ?: env('APP_URL') ?: 'http://localhost'), '/'),
                    'app.locale' => $values['locale'],
                    'app.timezone' => $values['timezone'],
                ]);
            }
        });
    }

    /** The default language is always one of the site's languages. */
    private function siteSaving(array $values): array
    {
        $locale = (string) ($values['locale'] ?? '');

        if (! preg_match('/^[a-z]{2,3}(-[A-Z]{2})?$/', $locale)) {
            throw AbilityException::invalid(__('Use a language code like en, de or fr-CA.'), ['locale' => __('Use a language code like en, de or fr-CA.')]);
        }

        if (isset($values['locales'])) {
            $values['locales'] = array_values(array_unique([$locale, ...array_map('strval', (array) $values['locales'])]));
        }

        return $values;
    }

    /**
     * The admin's frame: the sections of the sidebar and of the settings sidebar, and the sidebar as an arranged part.
     * Every screen, sidebar item, widget and command comes from a module (modules/).
     */
    private function registerAdmin(): void
    {
        $admin = $this->app->make(AdminRegistry::class);

        // Where the work is: the home screens (and the plugins), the content, and how the site is built and looks.
        $admin->section('main', '', 0);
        $admin->section('content', __('Content'), 10);
        $admin->section('design', __('Design'), 20);
        // The settings sidebar, the same on every site: your own account, the site's General page and what
        // runs the installation, as one group without a name; then who works on it; then each plugin's page,
        // named by the plugin (see Navigation::PLUGINS).
        $admin->section('account', '', 0, settings: true);
        $admin->section('site', '', 10, settings: true);
        $admin->section('system', '', 12, settings: true);
        $admin->section('people', __('People'), 16, settings: true);
        $admin->section(Navigation::PLUGINS, __('Plugins'), 90, settings: true);
        $admin->arrange('sidebar', Navigation::class);
    }

    private function registerContext(): void
    {
        $context = $this->app->make(ContextRegistry::class);

        $context->register('cms://site', 'Site', 'Site name, URL and locales.', fn () => [
            'name' => config('app.name'),
            'url' => $this->app->make(Cms::class)->url(),
            'locales' => $this->app->make(Cms::class)->locales(),
            'site' => $this->app->make(Cms::class)->site(),
        ]);
    }

    private function registerRoutes(): void
    {
        if ($this->app->routesAreCached()) {
            return;
        }

        $router = $this->app['router'];
        $router->aliasMiddleware('cms.admin', AdminAccess::class);
        $router->aliasMiddleware('cms.installed', EnsureInstalled::class);
        $router->aliasMiddleware('cms.locale', AdminLocale::class);

        // During an update the loader answers this itself; any other time there is nothing to do.
        Route::post('/_cms/update/tick', static fn () => response()->noContent());

        Route::middleware('web')->group(function () {
            Route::get('/install', [Http\Controllers\InstallController::class, 'show']);
            Route::post('/install', [Http\Controllers\InstallController::class, 'store'])->middleware('throttle:cms-login');
            Route::post('/install/finish', [Http\Controllers\InstallController::class, 'finish'])->middleware(['auth:web', 'cms.admin']);
        });

        // Admin SPA + session API (cookie auth, CSRF-protected).
        Route::middleware(['web', 'cms.installed', 'cms.locale'])->group(function () {
            Route::prefix('api/admin')->group(function () {
                Route::post('auth/login', [Http\Controllers\AuthController::class, 'login'])->middleware('throttle:cms-login');
                Route::post('auth/two-factor', [Http\Controllers\AuthController::class, 'twoFactor'])->middleware('throttle:cms-login');
                Route::post('auth/forgot', [Http\Controllers\AuthController::class, 'forgot'])->middleware('throttle:cms-login');
                Route::post('auth/reset', [Http\Controllers\AuthController::class, 'reset'])->middleware('throttle:cms-login');
                Route::get('auth/session', [Http\Controllers\AuthController::class, 'session']);

                Route::middleware(['auth:web', 'cms.admin'])->group(function () {
                    Route::post('auth/logout', [Http\Controllers\AuthController::class, 'logout']);
                    Route::get('manifest', [Http\Controllers\AdminController::class, 'manifest']);
                    Route::get('abilities', [Http\Controllers\AbilityController::class, 'index']);
                    Route::post('abilities/{name}', [Http\Controllers\AbilityController::class, 'run'])->where('name', '[a-z0-9-]+/[a-z0-9.-]+');
                    Route::post('batch', [Http\Controllers\AbilityController::class, 'batch']);
                });
            });

            Route::get('/admin/{path?}', [Http\Controllers\AdminController::class, 'shell'])->where('path', '.*');
        });

        // Stateless API for integrations and agents (Bearer token).
        Route::prefix('api/v1')->middleware(['api', 'throttle:cms-api'])->group(function () {
            Route::get('/', [Http\Controllers\AbilityController::class, 'describe']);
            Route::get('openapi.json', [Http\Controllers\AbilityController::class, 'openapi']);
            Route::middleware('auth:token')->group(function () {
                Route::get('abilities', [Http\Controllers\AbilityController::class, 'index']);
                Route::match(['get', 'post'], 'abilities/{name}', [Http\Controllers\AbilityController::class, 'run'])->where('name', '[a-z0-9-]+/[a-z0-9.-]+');
                Route::post('batch', [Http\Controllers\AbilityController::class, 'batch']);
            });

            // Public delivery API: published content only.
            Route::middleware('throttle:cms-public')->group(function () {
                Route::get('content/{collection}', [Http\Controllers\DeliveryController::class, 'index']);
                Route::get('content/{collection}/{slug}', [Http\Controllers\DeliveryController::class, 'show']);
            });
        });
    }
}

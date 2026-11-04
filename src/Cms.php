<?php

declare(strict_types=1);

namespace Cms;

use Closure;
use Illuminate\Auth\RequestGuard;
use Cms\Abilities\AbilityRegistry;
use Cms\Admin\AdminRegistry;
use Cms\Admin\Navigation;
use Cms\Content\Collections\CollectionRepository;
use Cms\Content\Entries\EntryRepository;
use Cms\Content\Entries\EntryService;
use Cms\Content\Fields\FieldTypeRegistry;
use Cms\Content\Fields\Fieldsets;
use Cms\Content\Globals\GlobalRepository;
use Cms\Context\ContextRegistry;
use Cms\Context\SkillRegistry;
use Cms\Extend\Hooks;
use Cms\Foundation\Application;
use Cms\Packages\PackageManager;
use Cms\Settings\SettingsRegistry;
use Cms\Users\Accounts;
use Cms\Users\Permissions;
use Cms\Users\Roles;
use RuntimeException;

/**
 * The kernel's public API — the single entry point for plugins and themes.
 */
final class Cms
{
    public const string VERSION = '0.3.1';

    public function __construct(private readonly Application $app) {}

    public function version(): string
    {
        return self::VERSION;
    }

    /**
     * Run code as a visitor nobody knows: every guard answers "no one", whatever the
     * current request has signed in. For output that outlives the request, like a
     * static build, which may run inside anybody's request.
     */
    public function asVisitor(Closure $code): mixed
    {
        $auth = $this->app['auth'];
        $guards = (array) config('auth.guards');
        $signedIn = [];

        foreach (array_keys($guards) as $name) {
            $guard = $auth->guard($name);

            if ($guard->hasUser()) {
                $signedIn[$name] = $guard->user();
            }
        }

        $auth->extend('cms-visitor', fn ($app) => new RequestGuard(static fn () => null, $app['request']));
        config(['auth.guards' => array_map(static fn (array $guard) => ['driver' => 'cms-visitor'] + $guard, array_map(static fn (array $guard) => array_diff_key($guard, ['driver' => 1]), $guards))]);
        $auth->forgetGuards();

        try {
            return $code();
        } finally {
            config(['auth.guards' => $guards]);
            $auth->forgetGuards();

            foreach ($signedIn as $name => $user) {
                $auth->guard($name)->setUser($user);
            }
        }
    }

    /** Whether this request belongs to somebody, by any guard: its output is not for anybody else. */
    public function signedIn(): bool
    {
        foreach (array_keys((array) config('auth.guards')) as $name) {
            if ($this->app['auth']->guard($name)->check()) {
                return true;
            }
        }

        return false;
    }

    public function app(): Application
    {
        return $this->app;
    }

    public function abilities(): AbilityRegistry
    {
        return $this->app->make(AbilityRegistry::class);
    }

    public function hooks(): Hooks
    {
        return $this->app->make(Hooks::class);
    }

    public function fields(): FieldTypeRegistry
    {
        return $this->app->make(FieldTypeRegistry::class);
    }

    public function fieldsets(): Fieldsets
    {
        return $this->app->make(Fieldsets::class);
    }

    public function collections(): CollectionRepository
    {
        return $this->app->make(CollectionRepository::class);
    }

    public function entries(): EntryRepository
    {
        return $this->app->make(EntryRepository::class);
    }

    public function content(): EntryService
    {
        return $this->app->make(EntryService::class);
    }

    public function globals(): GlobalRepository
    {
        return $this->app->make(GlobalRepository::class);
    }

    public function packages(): PackageManager
    {
        return $this->app->make(PackageManager::class);
    }

    public function permissions(): Permissions
    {
        return $this->app->make(Permissions::class);
    }

    /** Who is signed in, what they hold, and how to give them more. */
    public function accounts(): Accounts
    {
        return $this->app->make(Accounts::class);
    }

    public function roles(): Roles
    {
        return $this->app->make(Roles::class);
    }

    public function admin(): AdminRegistry
    {
        return $this->app->make(AdminRegistry::class);
    }

    public function navigation(): Navigation
    {
        return $this->app->make(Navigation::class);
    }

    public function context(): ContextRegistry
    {
        return $this->app->make(ContextRegistry::class);
    }

    public function skills(): SkillRegistry
    {
        return $this->app->make(SkillRegistry::class);
    }

    /** Pages features bring at addresses of their own (sign in, checkout), listed with the site's pages. */
    public function builtinPages(): Content\BuiltinPages
    {
        return $this->app->make(Content\BuiltinPages::class);
    }

    public function settingsRegistry(): SettingsRegistry
    {
        return $this->app->make(SettingsRegistry::class);
    }

    /** Settings value(s) for a namespace (core or plugin). */
    public function settings(string $namespace, ?string $key = null, mixed $default = null): mixed
    {
        return $this->settingsRegistry()->get($namespace, $key, $default);
    }

    /** The `site` settings (config/site.yaml): name, url, description, timezone, locale, locales, themes. */
    public function site(?string $key = null, mixed $default = null): mixed
    {
        $site = $this->settings('site');

        return $key === null ? $site : data_get($site, $key, $default);
    }

    public function saveSite(array $values): void
    {
        $this->settingsRegistry()->save('site', $values);
    }

    /** @return list<string> Enabled locales, default first. */
    public function locales(): array
    {
        $default = (string) config('app.locale', 'en');
        $locales = array_map('strval', (array) $this->site('locales', [$default]));

        return array_values(array_unique([$default, ...$locales]));
    }

    public function defaultLocale(): string
    {
        return (string) config('app.locale', 'en');
    }

    /**
     * Run $callback with a service once it exists — the way plugins integrate
     * with optional plugins without hard dependencies.
     */
    public function whenAvailable(string $abstract, Closure $callback): void
    {
        if ($this->app->bound($abstract)) {
            $this->app->resolved($abstract) ? $callback($this->app->make($abstract)) : $this->app->afterResolving($abstract, $callback);

            return;
        }

        $this->app->booted(function () use ($abstract, $callback) {
            if ($this->app->bound($abstract)) {
                $callback($this->app->make($abstract));
            }
        });
    }

    public function isActive(string $package): bool
    {
        return $this->packages()->isActive($package);
    }

    public function guardFileMods(): void
    {
        if (! (bool) env('CMS_ALLOW_FILE_MODS', true) && ! $this->app->runningInConsole()) {
            throw new RuntimeException(__('Installing or removing package files is disabled on this site.'));
        }
    }
}

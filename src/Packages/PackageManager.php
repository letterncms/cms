<?php

declare(strict_types=1);

namespace Cms\Packages;

use Cms\Support\Brand;
use Composer\InstalledVersions;
use Composer\Semver\Semver;
use Illuminate\Database\Migrations\Migrator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Cms\Admin\AdminRegistry;
use Cms\Foundation\Application;
use Cms\Cms;
use Cms\Support\Files;
use Cms\Support\RecordTimestamps;
use Cms\Support\Yaml;
use RuntimeException;
use Throwable;

/**
 * Resolves which packages run, boots them in dependency order and handles
 * their lifecycle. Enabled plugins live in config/plugins.yaml (git-friendly);
 * installed versions live in the `packages` table.
 */
final class PackageManager
{
    /** @var array<string, PackageManifest> name => manifest, in boot order */
    private array $active = [];

    /** @var array<string, string> name => reason */
    private array $inactive = [];

    /** @var array<string, Plugin> */
    private array $providers = [];

    private bool $resolved = false;

    /** A failure caught in PHP is tried again after this long, in case the cause was passing (the database was down). */
    private const int RETRY_AFTER = 300;

    /** @var array<string, array{message: string, file: string, line: int, at: int, fatal: bool, fingerprint: string}>|null */
    private ?array $failures = null;

    /** @var array<string, true> Packages that failed in this process: what they require them must not start either. */
    private array $failedNow = [];

    /** The package whose own code is running, for fatal errors PHP gives no chance to catch. */
    private ?PackageManifest $running = null;

    private bool $watchingFatals = false;

    public function __construct(
        private readonly Application $app,
        private readonly PackageRepository $repository,
        private readonly Psr4Loader $loader,
        private readonly AssetPublisher $assets,
    ) {}

    /** Re-read manifests from disk (after files changed). Already-booted providers stay loaded. */
    public function refresh(): void
    {
        $this->repository->refresh();
        $this->resolved = false;
        $this->enabled = null;
        $this->active = $this->inactive = [];
    }

    public function repository(): PackageRepository
    {
        return $this->repository;
    }

    public function assets(): AssetPublisher
    {
        return $this->assets;
    }

    /** @var list<string>|null */
    private ?array $enabled = null;

    /**
     * Packages switched on. Plugins are on when config/plugins.yaml lists them
     * under `enabled` (every built-in one when the file is missing). Core modules
     * are on unless listed under `disabled`; required ones are always on.
     *
     * @return list<string>
     */
    public function enabled(): array
    {
        if ($this->enabled !== null) {
            return $this->enabled;
        }

        $file = $this->stateFile();
        $state = is_file($file) ? Yaml::read($file) : null;
        $plugins = $state === null
            ? array_keys(array_filter($this->repository->plugins(), static fn (PackageManifest $p) => ! $p->core))
            : array_map('strval', (array) ($state['enabled'] ?? []));
        $disabled = array_map('strval', (array) ($state['disabled'] ?? []));
        $modules = array_keys(array_filter($this->repository->plugins(), static fn (PackageManifest $p) => $p->core && ($p->required || ! in_array($p->name, $disabled, true))));

        return $this->enabled = array_values(array_unique([...$modules, ...$plugins]));
    }

    /** @return array<string, PackageManifest> The modules the admin is made of (on or off). */
    public function modules(): array
    {
        return array_filter($this->repository->plugins(), static fn (PackageManifest $p) => $p->core);
    }

    public function isEnabled(string $name): bool
    {
        return in_array($name, $this->enabled(), true);
    }

    public function isActive(string $name): bool
    {
        $this->resolve();

        return isset($this->active[$name]);
    }

    /** @return array<string, PackageManifest> */
    public function active(): array
    {
        $this->resolve();

        return $this->active;
    }

    /** @return array<string, string> */
    public function inactive(): array
    {
        $this->resolve();

        return $this->inactive;
    }

    /**
     * Active plugins that break a rule every plugin follows. They keep running —
     * nothing is switched off or lost — but **Modules**, `cms plugins` and, in
     * debug mode, the home screen report them.
     *
     * The rule: every plugin registers at least one home-screen widget
     * (AdminRegistry::widget). Modules are exempt — they are the admin itself,
     * and some (settings, packages) have nothing of their own to watch.
     *
     * @return array<string, string> name => what is wrong
     */
    public function problems(): array
    {
        // Widgets are registered while packages boot; before that, nothing can be judged.
        if (! $this->app->isBooted()) {
            return [];
        }

        $widgets = $this->app->make(AdminRegistry::class)->widgetsByPackage();
        $out = [];

        foreach ($this->active() as $name => $package) {
            if (! $package->core && ! isset($widgets[$name])) {
                $out[$name] = __('Registers no home-screen widget. Every plugin needs at least one.');
            }
        }

        return $out;
    }

    public function provider(string $name): ?Plugin
    {
        return $this->providers[$name] ?? null;
    }

    /** Autoload and register every active package's provider. One that fails stays off; the rest run. */
    public function register(): void
    {
        foreach ($this->active() as $package) {
            $this->addAutoload($package);
        }

        foreach ($this->active() as $package) {
            $this->guard($package, function () use ($package): void {
                $this->loadBundled($package);
                $this->registerPackage($package);
            });
        }
    }

    /**
     * Run a package's own code. Whatever it throws is recorded and reported in
     * **Modules** instead of reaching the visitor, and the package stays off until
     * its files change, it is turned on again or (for a caught failure) a retry passes.
     * Required modules are the admin itself: their failures are real errors.
     */
    public function guard(PackageManifest $package, \Closure $code): void
    {
        if ($package->required) {
            $code();

            return;
        }

        foreach (array_keys($package->requires) as $dep) {
            if (isset($this->failedNow[$dep])) {
                $this->failedNow[$package->name] = true;
                $this->deactivate($package->name, "Requires {$dep}, which failed to start.");

                return;
            }
        }

        $this->watchFatals();
        $previous = $this->running;
        $this->running = $package;

        try {
            $code();
        } catch (Throwable $e) {
            $this->fail($package, $e->getMessage(), $e->getFile(), $e->getLine(), fatal: false);
            $this->reportFailure($e);
        } finally {
            $this->running = $previous;
        }
    }

    /** A package that booted cleanly has no failure left to report. */
    public function booted(PackageManifest $package): void
    {
        if (! isset($this->failedNow[$package->name]) && isset($this->failures()[$package->name])) {
            $this->forgetFailure($package->name);
        }
    }

    private function fail(PackageManifest $package, string $message, string $file, int $line, bool $fatal): void
    {
        $message = mb_substr($message, 0, 500);
        $relative = str_starts_with($file, $package->path.'/') ? substr($file, strlen($package->path) + 1) : basename($file);
        $this->failedNow[$package->name] = true;
        $this->failures();
        $this->failures[$package->name] = ['message' => $message, 'file' => $relative, 'line' => $line, 'at' => time(), 'fatal' => $fatal, 'fingerprint' => $this->fingerprint($package)];
        $this->writeFailures();
        $this->deactivate($package->name, $this->reason($this->failures[$package->name]));
    }

    private function deactivate(string $name, string $reason): void
    {
        $this->resolve();
        unset($this->active[$name], $this->providers[$name]);
        $this->inactive[$name] = $reason;
    }

    private function reason(array $failure): string
    {
        return "Failed to start: {$failure['message']} ({$failure['file']}:{$failure['line']})";
    }

    /** The failure that keeps a package off right now: same files as when it failed and not yet due a retry. */
    private function failure(PackageManifest $package): ?array
    {
        $failure = $this->failures()[$package->name] ?? null;

        if (! $failure || $package->required || $failure['fingerprint'] !== $this->fingerprint($package)) {
            return null;
        }

        return $failure['fatal'] || time() - $failure['at'] < self::RETRY_AFTER ? $failure : null;
    }

    /** Changes when the package's code does, so a fixed or updated package simply runs again. */
    private function fingerprint(PackageManifest $package): string
    {
        $latest = (int) @filemtime($package->path('composer.json'));
        $files = new \RecursiveIteratorIterator(new \RecursiveCallbackFilterIterator(
            new \RecursiveDirectoryIterator($package->path(), \FilesystemIterator::SKIP_DOTS),
            static fn (\SplFileInfo $file) => ! in_array($file->getFilename(), ['node_modules', 'dist', 'vendor'], true),
        ));

        foreach ($files as $file) {
            if ($file->getExtension() === 'php') {
                $latest = max($latest, (int) $file->getMTime());
            }
        }

        // The core is part of it: a plugin that failed on a new core runs again after a rollback.
        return Cms::VERSION.'|'.$package->version.'|'.$latest;
    }

    /** @return array<string, array{message: string, file: string, line: int, at: int, fatal: bool, fingerprint: string}> */
    private function failures(): array
    {
        if ($this->failures === null) {
            $file = $this->failuresFile();
            $this->failures = is_file($file) ? (array) json_decode((string) @file_get_contents($file), true) : [];
        }

        return $this->failures;
    }

    private function forgetFailure(string $name): void
    {
        if (isset($this->failures()[$name])) {
            unset($this->failures[$name], $this->failedNow[$name]);
            $this->writeFailures();
        }
    }

    private function writeFailures(): void
    {
        // A site that cannot write here still runs: the failure is simply found again next request.
        try {
            $this->failures === []
                ? @unlink($this->failuresFile())
                : Files::put($this->failuresFile(), (string) json_encode($this->failures, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        } catch (Throwable) {
        }
    }

    private function failuresFile(): string
    {
        return $this->app->storagePath('framework/failed-packages.json');
    }

    private function reportFailure(Throwable $e): void
    {
        try {
            report($e);
        } catch (Throwable) {
        }
    }

    /** Parse errors in included files are catchable; a class that breaks its contract or a redeclared function is not. */
    private function watchFatals(): void
    {
        if ($this->watchingFatals) {
            return;
        }

        $this->watchingFatals = true;

        register_shutdown_function(function (): void {
            $error = error_get_last();

            if (! $this->running || ! $error || ! in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR], true)) {
                return;
            }

            // Running out of memory or time says little about the plugin: that one may try again.
            $passing = str_contains($error['message'], 'Allowed memory size') || str_contains($error['message'], 'Maximum execution time');
            $this->fail($this->running, $error['message'], $error['file'], $error['line'], fatal: ! $passing);
        });
    }

    public function enable(string $name): void
    {
        $package = $this->repository->find($name) ?? throw new RuntimeException(__('Package :name is not installed.', ['name' => $name]));

        $missing = array_filter(
            array_keys($package->requires),
            fn (string $dep) => $this->repository->find($dep) && ! $this->isEnabled($dep)
        );

        if ($missing !== []) {
            throw new RuntimeException(__(':package requires :packages. Enable those first.', ['package' => $package->label, 'packages' => implode(', ', $missing)]));
        }

        $this->forgetFailure($name);
        $this->writeEnabled([...$this->enabled(), $name]);
    }

    /** Disable a plugin or module. Its data is kept; nothing else breaks. Required modules stay on. */
    public function disable(string $name): void
    {
        if ($this->repository->find($name)?->required) {
            throw new RuntimeException(__(':package is part of how :brand works and cannot be disabled.', ['package' => $this->repository->find($name)->label]));
        }

        $dependents = $this->dependents($name);

        if ($dependents !== []) {
            throw new RuntimeException(__('Disable these first: :packages.', ['packages' => implode(', ', $dependents)]));
        }

        $this->forgetFailure($name);
        $this->writeEnabled(array_values(array_diff($this->enabled(), [$name])));
    }

    /** @return list<string> Enabled packages that hard-require $name. */
    public function dependents(string $name): array
    {
        $out = [];

        foreach ($this->enabled() as $enabled) {
            $package = $this->repository->find($enabled);

            if ($package && isset($package->requires[$name])) {
                $out[] = $enabled;
            }
        }

        return $out;
    }

    /** Run migrations + install()/upgrade() for every active package that needs it. */
    public function sync(): array
    {
        $done = [];

        foreach ($this->active() as $package) {
            $installed = $this->installedVersion($package->name);

            if ($installed === $package->version || self::rolledBack($installed, $package)) {
                continue;
            }

            $this->guard($package, function () use ($package, $installed, &$done): void {
                $this->migrate($package);
                $provider = $this->providers[$package->name] ?? $this->lateProvider($package);

                $installed === null ? $provider?->install() : $provider?->upgrade($installed);

                $this->recordVersion($package);
                $this->assets->ensure($package);
                $done[$package->name] = $installed === null ? 'installed' : "upgraded from {$installed}";
            });

            if (isset($this->failedNow[$package->name])) {
                $done[$package->name] = $this->inactive[$package->name] ?? 'failed';
            }
        }

        return $done;
    }

    /**
     * The database is ahead of the files after a rollback. Nothing to run and nothing to record:
     * writing the lower version would run upgrade() again on the next roll forward.
     */
    private static function rolledBack(?string $installed, PackageManifest $package): bool
    {
        return $installed !== null && version_compare($installed, $package->version, '>');
    }

    /** @return array<string, string> Packages whose migrations/upgrades are pending. */
    public function pending(): array
    {
        $out = [];

        foreach ($this->active() as $package) {
            $installed = $this->installedVersion($package->name);

            if ($installed === $package->version || self::rolledBack($installed, $package)) {
                continue;
            }

            // Nothing to run (no migrations, no provider hooks): just record the version.
            if (! $package->provider && ! is_dir($package->path('database/migrations'))) {
                $this->hasStateTable() && $this->recordVersion($package);
                continue;
            }

            $out[$package->name] = $installed ?? 'not installed';
        }

        return $out;
    }

    /**
     * Remove a plugin's data (and files when it is a drop-in under a writable plugins/ folder).
     */
    public function uninstall(string $name, bool $deleteFiles = false): void
    {
        $package = $this->repository->find($name) ?? throw new RuntimeException(__('Package :name is not installed.', ['name' => $name]));

        if ($package->core) {
            throw new RuntimeException(__(':package ships with :brand; disable it instead.', ['package' => $package->label]));
        }

        if ($this->isEnabled($name)) {
            $this->disable($name);
        }

        // A disabled plugin was never added to the autoloader; a broken one must still be removable.
        try {
            $this->addAutoload($package);
            $this->loadBundled($package);
            ($this->providers[$name] ?? $this->makeProvider($package))?->uninstall();
        } catch (Throwable $e) {
            $this->reportFailure($e);
        }

        if (is_dir($package->path('database/migrations'))) {
            $this->migrator()->reset([$package->path('database/migrations')]);
        }

        if ($this->hasStateTable()) {
            DB::table('packages')->where('name', $name)->delete();
        }

        $this->assets->remove($package);
        $this->forgetFailure($name);

        if ($deleteFiles) {
            $this->cms()->guardFileMods();
            Files::deleteDirectory($package->path());
            $this->repository->refresh();
        }
    }

    public function installedVersion(string $name): ?string
    {
        if (! $this->hasStateTable()) {
            return null;
        }

        return DB::table('packages')->where('name', $name)->value('version');
    }

    /** Administrative package state has an update date but no publication lifecycle. */
    public function timestamps(): array
    {
        if (! $this->hasStateTable()) {
            return [];
        }

        return DB::table('packages')->get(['name', 'updated_at'])->mapWithKeys(
            static fn ($row) => [$row->name => RecordTimestamps::api(['updated_at' => $row->updated_at])]
        )->all();
    }

    /** Resolve active set: enabled, discovered, compatible, dependencies satisfied. */
    private function resolve(): void
    {
        if ($this->resolved) {
            return;
        }

        $this->resolved = true;
        $candidates = [];

        foreach ($this->enabled() as $name) {
            $package = $this->repository->find($name);

            if (! $package) {
                $this->inactive[$name] = 'Not found on disk.';
            } else {
                $candidates[$name] = $package;
            }
        }

        foreach ($candidates as $name => $package) {
            if ($failure = $this->failure($package)) {
                $this->inactive[$name] = $this->reason($failure);
                unset($candidates[$name]);
            }
        }

        // Drop incompatible packages, then repeatedly drop those with unmet dependencies.
        foreach ($candidates as $name => $package) {
            if ($package->coreConstraint && ! $this->satisfies(Cms::VERSION, $package->coreConstraint)) {
                $this->inactive[$name] = "Requires ".Brand::get()." {$package->coreConstraint}.";
                unset($candidates[$name]);
            }
        }

        do {
            $changed = false;

            foreach ($candidates as $name => $package) {
                foreach ($package->requires as $dep => $constraint) {
                    $reason = $this->unmet($package, $dep, $constraint, $candidates);

                    if ($reason !== null) {
                        $this->inactive[$name] = $reason;
                        unset($candidates[$name]);
                        $changed = true;
                        continue 2;
                    }
                }
            }
        } while ($changed);

        $this->active = $this->sort($candidates);
    }

    private function unmet(PackageManifest $package, string $dep, string $constraint, array $candidates): ?string
    {
        if ($this->repository->find($dep)) {
            if (! isset($candidates[$dep])) {
                return "Requires {$dep}, which is not active.";
            }

            return $this->satisfies($candidates[$dep]->version, $constraint) ? null : "Requires {$dep} {$constraint}.";
        }

        // A composer library: satisfied when composer installed it, or when the plugin bundles it in its own vendor/.
        if (class_exists(InstalledVersions::class) && InstalledVersions::isInstalled($dep)) {
            return null;
        }

        $bundled = $this->bundledVersions($package);

        if (! isset($bundled[$dep])) {
            return "Requires library {$dep}.";
        }

        return $bundled[$dep] === '' || $this->satisfies($bundled[$dep], $constraint) ? null : "Requires library {$dep} {$constraint}; bundles {$bundled[$dep]}.";
    }

    /** @return array<string, string> The libraries in a plugin's own vendor/: name => version. */
    private function bundledVersions(PackageManifest $package): array
    {
        $file = $package->path('vendor/composer/installed.json');
        $installed = is_file($file) ? (array) json_decode((string) file_get_contents($file), true) : [];
        $out = [];

        // Composer 2 wraps the list in {"packages": [...]}, Composer 1 does not.
        foreach ((array) ($installed['packages'] ?? $installed) as $library) {
            if (is_array($library) && isset($library['name'])) {
                $out[(string) $library['name']] = (string) ($library['version'] ?? '');
            }
        }

        return $out;
    }

    private function addAutoload(PackageManifest $package): void
    {
        foreach ($package->psr4 as $prefix => $dir) {
            if (! $this->autoloadable($prefix)) {
                $this->loader->add($prefix, $package->path($dir));
            }
        }
    }

    /**
     * A drop-in plugin's `autoload.files` and its own vendor/. Nothing here needs
     * Composer on the server: the plugin ships vendor/ as built. The installation's
     * libraries keep priority, so a bundled copy can never replace what the core runs on.
     */
    private function loadBundled(PackageManifest $package): void
    {
        $autoload = $package->path('vendor/autoload.php');

        if (is_file($autoload)) {
            $loaders = \Composer\Autoload\ClassLoader::getRegisteredLoaders();
            require_once $autoload;

            // Oldest first: each one moves to the front, so their order stays as it was.
            foreach (array_reverse($loaders) as $loader) {
                $loader->unregister();
                $loader->register(true);
            }
        }

        foreach ($package->files as $file) {
            require_once $package->path($file);
        }
    }

    /** @param array<string, PackageManifest> $packages */
    private function sort(array $packages): array
    {
        $sorted = [];
        $visiting = [];

        $visit = function (string $name) use (&$visit, &$sorted, &$visiting, $packages): void {
            if (isset($sorted[$name]) || ! isset($packages[$name])) {
                return;
            }

            if (isset($visiting[$name])) {
                throw new RuntimeException("Circular package dependency involving {$name}.");
            }

            $visiting[$name] = true;

            foreach (array_keys($packages[$name]->requires) as $dep) {
                $visit($dep);
            }

            $sorted[$name] = $packages[$name];
        };

        foreach (array_keys($packages) as $name) {
            $visit($name);
        }

        return $sorted;
    }

    private function registerPackage(PackageManifest $package): void
    {
        $provider = $this->makeProvider($package);

        if ($provider) {
            $this->providers[$package->name] = $provider;
            Scope::run($package->name, fn () => $this->app->register($provider));
        }

        $this->app->booting(function () use ($package): void {
            $view = $this->app['view'];

            if (is_dir($views = $package->path('resources/views'))) {
                $view->addNamespace($package->namespace, $views);
            }

            if (is_dir($lang = $package->path('resources/lang'))) {
                $this->app['translator']->addNamespace($package->namespace, $lang);
            }

            if (is_dir($migrations = $package->path('database/migrations'))) {
                $this->app->resolved('migrator')
                    ? $this->app->make('migrator')->path($migrations)
                    : $this->app->afterResolving('migrator', static fn (Migrator $m) => $m->path($migrations));
            }
        });
    }

    /** A package enabled in this very process (CLI, admin): its provider still has to start. */
    private function lateProvider(PackageManifest $package): ?Plugin
    {
        if (! $package->provider) {
            return null;
        }

        $this->addAutoload($package);
        $this->loadBundled($package);
        $this->registerPackage($package);

        return $this->providers[$package->name] ?? null;
    }

    private function makeProvider(PackageManifest $package): ?Plugin
    {
        if (! $package->provider) {
            return null;
        }

        if (! class_exists($package->provider)) {
            throw new RuntimeException("Provider {$package->provider} not found.");
        }

        $provider = new ($package->provider)($this->app);

        if (! $provider instanceof Plugin) {
            throw new RuntimeException("{$package->provider} must extend ".Plugin::class);
        }

        return $provider->setManifest($package);
    }

    private function migrate(PackageManifest $package): void
    {
        $path = $package->path('database/migrations');

        if (is_dir($path)) {
            $migrator = $this->migrator();
            $migrator->run([$path]);
        }
    }

    private function migrator(): Migrator
    {
        $migrator = $this->app->make('migrator');

        if (! $migrator->repositoryExists()) {
            $migrator->getRepository()->createRepository();
        }

        return $migrator;
    }

    private function recordVersion(PackageManifest $package): void
    {
        DB::table('packages')->updateOrInsert(
            ['name' => $package->name],
            ['version' => $package->version, 'updated_at' => now()]
        );
    }

    private function hasStateTable(): bool
    {
        try {
            return Schema::hasTable('packages');
        } catch (Throwable) {
            return false;
        }
    }

    /** Plugins are written as `enabled`, core modules that are off as `disabled`. */
    private function writeEnabled(array $names): void
    {
        $names = array_values(array_unique($names));
        $modules = $this->modules();
        $plugins = array_values(array_filter($names, static fn (string $n) => ! isset($modules[$n])));
        $disabled = array_values(array_diff(array_keys($modules), $names));
        sort($plugins);
        sort($disabled);
        Yaml::write($this->stateFile(), array_filter(['enabled' => $plugins, 'disabled' => $disabled], static fn ($list, $key) => $key === 'enabled' || $list !== [], ARRAY_FILTER_USE_BOTH));
        $this->resolved = false;
        $this->enabled = null;
        $this->active = $this->inactive = [];
    }

    private function satisfies(string $version, string $constraint): bool
    {
        try {
            return Semver::satisfies($version, $constraint);
        } catch (Throwable) {
            return false;
        }
    }

    private function autoloadable(string $prefix): bool
    {
        foreach (\Composer\Autoload\ClassLoader::getRegisteredLoaders() as $loader) {
            if (isset($loader->getPrefixesPsr4()[trim($prefix, '\\').'\\'])) {
                return true;
            }
        }

        return false;
    }

    private function stateFile(): string
    {
        return $this->app->siteConfigPath('plugins.yaml');
    }

    private function cms(): Cms
    {
        return $this->app->make(Cms::class);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Install;

use Illuminate\Encryption\Encrypter;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Cms\Abilities\AbilityException;
use Cms\Foundation\Application;
use Cms\Modules\Site\Kits\Kits;
use Cms\Cms;
use Cms\Content\Schemas\SchemaFiles;
use Cms\Packages\PackageManager;
use Cms\Support\Files;
use Cms\Support\Yaml;
use Cms\Users\Passwords;
use Cms\Users\User;
use Cms\Update\Upgrader;
use PDO;
use Throwable;

/** First-run setup shared by the web installer and `cms install`. */
final class Installer
{
    /** What a new site gets unless someone chooses otherwise. Everything else is a click away in the store. */
    public const array RECOMMENDED = ['letterncms/seo', 'letterncms/forms'];

    /** A setup that asks for no kit starts with an empty site. */
    public const string NO_KIT = 'none';

    public function __construct(private readonly Application $app) {}

    /** The kit this site's setup chose to start from, or null for none. */
    public static function kit(): ?string
    {
        $kit = Files::readJson(storage_path('installed.json'))['kit'] ?? Kits::DEFAULT;

        return is_string($kit) && $kit !== self::NO_KIT && Files::isHandle($kit) ? $kit : null;
    }

    public static function installed(): bool
    {
        return is_file(storage_path('installed.json')) && (string) config('app.key') !== '';
    }

    /**
     * Make sure an app key exists before installation (sessions and CSRF need it).
     * Writes it to .env so it survives requests.
     */
    public static function ensureKey(): string
    {
        $key = 'base64:'.base64_encode(Encrypter::generateKey('AES-256-CBC'));
        $file = site_path('.env');
        $contents = is_file($file) ? (string) file_get_contents($file) : '';

        if (preg_match('/^APP_KEY=(.+)$/m', $contents, $m) && trim($m[1]) !== '') {
            return trim($m[1], " \"'");
        }

        try {
            Files::put($file, rtrim(preg_replace('/^APP_KEY=.*$/m', '', $contents))."\nAPP_KEY={$key}\n");
            @chmod($file, 0o600);
        } catch (Throwable) {
            // Read-only site: the key lasts for this request only; the installer will report the problem.
        }

        return $key;
    }

    /** @return list<array{label: string, ok: bool, detail: string}> */
    public function requirements(): array
    {
        $checks = [
            [__('PHP 8.4 or newer'), version_compare(PHP_VERSION, '8.4.0', '>='), PHP_VERSION],
            // Only the drivers this needs, by the names a host's panel uses.
            ['PDO (MySQL or SQLite)', extension_loaded('pdo_mysql') || extension_loaded('pdo_sqlite'), implode(', ', array_values(array_intersect_key(['mysql' => 'MySQL', 'sqlite' => 'SQLite'], array_flip(PDO::getAvailableDrivers()))))],
            ['mbstring', extension_loaded('mbstring'), ''],
            ['zip', class_exists(\ZipArchive::class), ''],
            ['curl', function_exists('curl_init'), ''],
            ['openssl', extension_loaded('openssl'), ''],
            ['fileinfo', extension_loaded('fileinfo'), ''],
            [__('GD or Imagick (images)'), extension_loaded('gd') || extension_loaded('imagick'), extension_loaded('imagick') ? 'imagick' : (extension_loaded('gd') ? 'gd' : __('missing'))],
        ];

        foreach (['storage', 'config', 'content', 'public', 'plugins'] as $dir) {
            $path = $this->app->sitePath($dir);
            // The folder by its name in the site, which is what a person changes: never the server's whole path.
            $checks[] = [__(':dir/ is writable', ['dir' => $dir]), (is_dir($path) || @mkdir($path, 0o775, true)) && is_writable($path), ''];
        }

        return array_map(static fn ($c) => ['label' => $c[0], 'ok' => (bool) $c[1], 'detail' => (string) $c[2]], $checks);
    }

    /** Validation for install input — the same for the web installer and `cms install`. */
    public static function rules(): array
    {
        return [
            'site_name' => ['required', 'string', 'max:120'],
            'site_url' => ['required', 'url', 'max:255'],
            'db_driver' => ['required', 'in:sqlite,mysql,mariadb,pgsql'],
            'db_host' => ['nullable', 'string', 'max:255'],
            'db_port' => ['nullable', 'string', 'max:6'],
            'db_database' => ['nullable', 'string', 'max:255'],
            'db_username' => ['nullable', 'string', 'max:255'],
            'db_password' => ['nullable', 'string', 'max:1000'],
            'db_prefix' => ['nullable', 'string', 'max:20', 'regex:/^[a-z0-9_]*$/'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:254'],
            'password' => ['required', 'string', ...Passwords::rules()],
            'kit' => ['nullable', 'string', 'max:64', 'regex:/^[a-z0-9][a-z0-9_-]{0,63}$/'],
            'kit_from_store' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @param array{site_name: string, site_url: string, db_driver: string, db_host?: string, db_port?: string, db_database?: string, db_username?: string, db_password?: string, db_prefix?: string, name: string, email: string, password: string} $input
     */
    public function install(array $input): User
    {
        if (self::installed()) {
            throw AbilityException::conflict(__(':brand is already installed.'));
        }

        $validator = Validator::make($input, self::rules());

        if ($validator->fails()) {
            throw AbilityException::invalid($validator->errors()->first(), array_map(static fn ($m) => $m[0], $validator->errors()->messages()));
        }

        foreach ($this->requirements() as $check) {
            if (! $check['ok']) {
                throw AbilityException::invalid(__('Requirement not met: :requirement.', ['requirement' => $check['label']]));
            }
        }

        // The kit is fetched, if it has to be, once the site exists (the one a new site starts from is the store's like any other); one that is here is checked now.
        $kit = (string) ($input['kit'] ?? '') ?: Kits::DEFAULT;
        $store = (bool) ($input['kit_from_store'] ?? false) || $kit === Kits::DEFAULT;

        if ($kit !== self::NO_KIT && ! $store && $this->app->make(Kits::class)->find($kit) === null) {
            throw AbilityException::invalid(__('There is no kit “:handle” here.', ['handle' => $kit]), ['kit' => __('Choose one of: :names.', ['names' => implode(', ', array_keys($this->app->make(Kits::class)->all()))])]);
        }

        $env = $this->databaseEnv($input);
        $this->testConnection($env);

        $key = (string) config('app.key') ?: self::ensureKey();
        $url = rtrim($input['site_url'], '/');
        // A site.yaml that came with the site (it may be in git) keeps its URL: this machine's goes in .env.
        $configured = Yaml::read($this->app->siteConfigPath('site.yaml'))['url'] ?? null;
        $own = is_string($configured) && $configured !== $url ? ['CMS_SITE_URL' => $url] : [];
        $this->writeEnv([
            // Whoever set up a local site on purpose keeps it local.
            'APP_ENV' => preg_match('/^APP_ENV=local$/m', (string) @file_get_contents($this->app->sitePath('.env'))) === 1 ? 'local' : 'production',
            'APP_DEBUG' => 'false',
            'APP_URL' => $url,
            'APP_KEY' => $key,
            ...$env,
            ...$own,
        ]);

        if ($own !== []) {
            putenv('CMS_SITE_URL='.$url);
            $_ENV['CMS_SITE_URL'] = $_SERVER['CMS_SITE_URL'] = $url;
        }

        // Apply to the running process.
        config(['app.key' => $key, 'app.url' => $url]);
        $this->applyDatabaseConfig($env);
        $this->app->forgetInstance('encrypter');
        $this->app->forgetInstance(\Illuminate\Contracts\Encryption\Encrypter::class);

        $this->writeSiteConfig($input['site_name'], $url);

        Upgrader::migrateCore($this->app);
        $this->app->make(PackageManager::class)->sync();

        $user = User::query()->create([
            'name' => $input['name'],
            'email' => strtolower($input['email']),
            'password' => $input['password'],
            'roles' => ['admin'],
            'super' => true,
        ]);

        cms()->hooks()->dispatch('cms.migrated');

        Files::putJson(storage_path('installed.json'), ['version' => Cms::VERSION, 'installedAt' => now()->toIso8601String(), 'kit' => $kit]);

        return $user;
    }

    /**
     * The last step of a setup, on a request that booted with the plugins it pulled: what they
     * start a new site with (the site kit the setup chose), a first build, and the site's `AGENTS.md`.
     */
    public function finish(User $user): void
    {
        $this->app->make(PackageManager::class)->sync();

        // A convenience: a problem with it must never leave the site half-installed.
        try {
            cms()->hooks()->dispatch('cms.installed', $user);
            cms()->hooks()->dispatch('cms.migrated');
        } catch (Throwable $e) {
            report($e);
        }

        // The content model as JSON Schema files, with what the starter kit and the plugins defined (it reports its own failure).
        $this->app->make(SchemaFiles::class)->refresh();

        // Last, so it names what the plugins brought: the site's guide for AI agents, unless it has one.
        // On its own: a kit that failed above must not cost the site its guide, nor the guide the install.
        try {
            $this->app->make(AgentsGuide::class)->write();
        } catch (Throwable $e) {
            report($e);
        }
    }

    private function databaseEnv(array $input): array
    {
        $driver = $input['db_driver'] ?? 'sqlite';

        if ($driver === 'sqlite') {
            $path = storage_path('database/cms.sqlite');

            if (! is_file($path)) {
                Files::put($path, '');
            }

            return ['DB_CONNECTION' => 'sqlite', 'DB_DATABASE' => $path, 'DB_PREFIX' => (string) ($input['db_prefix'] ?? '')];
        }

        if (! in_array($driver, ['mysql', 'mariadb', 'pgsql'], true)) {
            throw AbilityException::invalid(__('Unsupported database driver.'));
        }

        return [
            'DB_CONNECTION' => $driver,
            'DB_HOST' => (string) ($input['db_host'] ?? '127.0.0.1'),
            'DB_PORT' => (string) ($input['db_port'] ?? ($driver === 'pgsql' ? '5432' : '3306')),
            'DB_DATABASE' => (string) ($input['db_database'] ?? ''),
            'DB_USERNAME' => (string) ($input['db_username'] ?? ''),
            'DB_PASSWORD' => (string) ($input['db_password'] ?? ''),
            'DB_PREFIX' => (string) ($input['db_prefix'] ?? ''),
        ];
    }

    private function testConnection(array $env): void
    {
        $this->applyDatabaseConfig($env);

        try {
            DB::connection()->getPdo();
        } catch (Throwable $e) {
            throw AbilityException::invalid(self::connectionHint($env, $e->getMessage()));
        }

        // Never install over another site: ask for an empty database (or a table prefix).
        if (Schema::hasTable('users') && DB::table('users')->exists()) {
            throw AbilityException::invalid(__('This database already holds a :brand site. Use an empty database, or set a table prefix to share it.'));
        }
    }

    /** Turn the common connection failures into advice people can act on. */
    private static function connectionHint(array $env, string $error): string
    {
        $database = $env['DB_DATABASE'] ?? '';
        $server = ($env['DB_HOST'] ?? '').':'.($env['DB_PORT'] ?? '');

        return match (true) {
            (bool) preg_match('/\[1049\]|SQLSTATE\[3D000\]/', $error) => __('The database “:database” does not exist yet. Create it in your hosting control panel (or with CREATE DATABASE), then try again.', ['database' => $database]),
            (bool) preg_match('/\[1045\]|\[1044\]|SQLSTATE\[28P01\]|SQLSTATE\[28000\]/', $error) => __('The database server did not accept this username and password, or the user has no access to this database.'),
            (bool) preg_match('/\[2002\]|\[2005\]|\[2006\]|SQLSTATE\[08006\]/', $error) => __('No database server answered at :server. Check the host and port: on most shared hosting the host is “localhost”.', ['server' => $server]),
            default => __('Could not connect to the database: :error', ['error' => trim((string) preg_replace('/\(Connection:.*$/s', '', $error))]),
        };
    }

    private function applyDatabaseConfig(array $env): void
    {
        $driver = $env['DB_CONNECTION'];
        $map = ['DB_HOST' => 'host', 'DB_PORT' => 'port', 'DB_DATABASE' => 'database', 'DB_USERNAME' => 'username', 'DB_PASSWORD' => 'password', 'DB_PREFIX' => 'prefix'];

        foreach ($map as $envKey => $configKey) {
            if (array_key_exists($envKey, $env)) {
                config(["database.connections.{$driver}.{$configKey}" => $env[$envKey]]);
            }
        }

        config(['database.default' => $driver]);
        DB::purge($driver);
    }

    private function writeEnv(array $values): void
    {
        $file = $this->app->sitePath('.env');
        $existing = is_file($file) ? (string) file_get_contents($file) : '';

        foreach ($values as $key => $value) {
            $line = $key.'='.$this->quote((string) $value);
            $pattern = '/^'.preg_quote($key, '/').'=.*$/m';
            $existing = preg_match($pattern, $existing) ? preg_replace($pattern, str_replace(['\\', '$'], ['\\\\', '\\$'], $line), $existing) : rtrim($existing)."\n".$line;
        }

        Files::put($file, ltrim($existing)."\n");
        @chmod($file, 0o600);
    }

    private function quote(string $value): string
    {
        if ($value === '' || preg_match('/^[A-Za-z0-9_.:\/+=@-]+$/', $value)) {
            return $value;
        }

        return '"'.str_replace(['\\', '"', "\n", '$'], ['\\\\', '\\"', '\\n', '\\$'], $value).'"';
    }

    private function writeSiteConfig(string $name, string $url): void
    {
        $file = $this->app->siteConfigPath('site.yaml');
        $site = Yaml::read($file);

        if (($site['name'] ?? null) !== $name || ! isset($site['url'])) {
            Yaml::write($file, array_replace(['timezone' => 'UTC', 'locale' => 'en', 'locales' => ['en']], ['url' => $url], $site, ['name' => $name]));
        }
    }
}

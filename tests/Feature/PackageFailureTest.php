<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Foundation\Bootstrap;
use Cms\Packages\PackageManager;
use Cms\Support\Files;
use Cms\Tests\TestCase;
use Symfony\Component\Process\Process;

/** A plugin can be as broken as it likes: the site keeps running and Modules says why. */
final class PackageFailureTest extends TestCase
{
    protected function plugins(): array
    {
        return ['acme/throws-boot', 'acme/throws-register', 'acme/no-class', 'acme/parse-error', 'acme/not-a-plugin', 'acme/needs-broken', 'acme/healthy', 'acme/bundled', 'acme/bundled-old', 'acme/files', 'acme/bad-migration'];
    }

    protected function prepareSite(string $site): void
    {
        self::plugin($site, 'throws-boot', 'ThrowsBoot', 'public function boot(): void { throw new \RuntimeException("boom in boot"); }');
        self::plugin($site, 'throws-register', 'ThrowsRegister', 'public function register(): void { throw new \RuntimeException("boom in register"); }');
        self::plugin($site, 'parse-error', 'ParseError', 'public function boot(): void { this is not php }');
        self::plugin($site, 'no-class', 'Missing', '', writeClass: false);
        self::plugin($site, 'healthy', 'Healthy', <<<'PHP'
            public function boot(): void
            {
                $this->cms()->abilities()->register('acme/healthy', ['label' => 'Healthy', 'handler' => fn () => 'yes', 'annotations' => ['readOnly' => true]]);
            }
        PHP);
        self::plugin($site, 'needs-broken', 'NeedsBroken', 'public function boot(): void { throw new \RuntimeException("should not start"); }', ['acme/throws-boot' => '*']);

        self::plugin($site, 'not-a-plugin', 'NotAPlugin', '');
        file_put_contents($site.'/plugins/not-a-plugin/src/NotAPlugin.php', "<?php\nnamespace Acme\\NotAPlugin;\nfinal class NotAPlugin {}\n");

        self::plugin($site, 'bad-migration', 'BadMigration', '');
        Files::put($site.'/plugins/bad-migration/database/migrations/2020_01_01_000000_bad.php', "<?php\nreturn new class extends \\Illuminate\\Database\\Migrations\\Migration { public function up(): void { throw new \\RuntimeException('boom in migration'); } };\n");

        // A library in the plugin's own vendor/, as `composer install` leaves it.
        self::plugin($site, 'bundled', 'Bundled', <<<'PHP'
            public function boot(): void
            {
                $this->cms()->abilities()->register('acme/bundled', ['label' => 'Bundled', 'handler' => fn () => \Vendored\Lib\Greeter::hello(), 'annotations' => ['readOnly' => true]]);
            }
        PHP, ['vendored/lib' => '^2.0']);
        self::vendor($site.'/plugins/bundled', 'vendored/lib', '2.1.0');

        self::plugin($site, 'bundled-old', 'BundledOld', '', ['vendored/other' => '^2.0']);
        self::vendor($site.'/plugins/bundled-old', 'vendored/other', '1.0.0');

        self::plugin($site, 'files', 'FilesPlugin', <<<'PHP'
            public function boot(): void
            {
                $this->cms()->abilities()->register('acme/files', ['label' => 'Files', 'handler' => fn () => \acme_helper(), 'annotations' => ['readOnly' => true]]);
            }
        PHP, autoload: ['files' => ['src/helpers.php']]);
        file_put_contents($site.'/plugins/files/src/helpers.php', "<?php\nif (! function_exists('acme_helper')) { function acme_helper(): string { return 'from a file'; } }\n");
    }

    public function test_the_site_survives_and_says_why(): void
    {
        $this->withoutExceptionHandling();
        $packages = $this->cms()->packages();
        $inactive = $packages->inactive();

        $this->assertStringContainsString('boom in boot', $inactive['acme/throws-boot']);
        $this->assertStringContainsString('boom in register', $inactive['acme/throws-register']);
        $this->assertStringContainsString('ParseError.php', $inactive['acme/parse-error']);
        $this->assertStringContainsString('not found', $inactive['acme/no-class']);
        $this->assertStringContainsString('must extend', $inactive['acme/not-a-plugin']);
        $this->assertStringContainsString('boom in migration', $inactive['acme/bad-migration']);
        $this->assertStringContainsString('failed to start', $inactive['acme/needs-broken']);
        $this->assertFalse($packages->isActive('acme/throws-boot'));

        $this->assertSame('yes', $this->cms()->abilities()->execute('acme/healthy', [], AbilityContext::system()));
    }

    public function test_the_admin_stays_reachable_and_modules_reports_it(): void
    {
        $this->actingAs($this->admin());

        $this->get('/admin')->assertOk();

        $list = $this->cms()->abilities()->execute('packages/list', ['type' => 'plugin'], AbilityContext::forUser($this->admin()));
        $row = collect($list['items'])->firstWhere('name', 'acme/throws-boot');

        $this->assertTrue($row['enabled']);
        $this->assertFalse($row['active']);
        $this->assertStringContainsString('Failed to start: boom in boot', $row['problem']);
    }

    public function test_a_failure_is_remembered_so_the_next_request_skips_it(): void
    {
        $this->assertStringContainsString('boom in boot', (string) file_get_contents(storage_path('framework/failed-packages.json')));

        // The next request: the broken code is not even loaded.
        $next = new PackageManager($this->app, new \Cms\Packages\PackageRepository($this->app), $this->app->make(\Cms\Packages\Psr4Loader::class), $this->app->make(\Cms\Packages\AssetPublisher::class));

        $this->assertStringContainsString('Failed to start', $next->inactive()['acme/throws-boot']);
        $this->assertStringContainsString('Failed to start', $next->inactive()['acme/parse-error']);
        $this->assertArrayNotHasKey('acme/throws-boot', $next->active());
    }

    public function test_fixing_the_file_runs_it_again(): void
    {
        $file = $this->site.'/plugins/throws-boot/src/ThrowsBoot.php';
        file_put_contents($file, "<?php\nnamespace Acme\\ThrowsBoot;\nfinal class ThrowsBoot extends \\Cms\\Packages\\Plugin {}\n");
        touch($file, time() + 5);

        $next = new PackageManager($this->app, new \Cms\Packages\PackageRepository($this->app), $this->app->make(\Cms\Packages\Psr4Loader::class), $this->app->make(\Cms\Packages\AssetPublisher::class));

        $this->assertArrayHasKey('acme/throws-boot', $next->active());
    }

    public function test_a_failure_caught_in_php_is_tried_again_later(): void
    {
        $file = storage_path('framework/failed-packages.json');
        $failures = json_decode((string) file_get_contents($file), true);
        $failures['acme/throws-boot']['at'] -= 3600;
        file_put_contents($file, json_encode($failures));

        $next = new PackageManager($this->app, new \Cms\Packages\PackageRepository($this->app), $this->app->make(\Cms\Packages\Psr4Loader::class), $this->app->make(\Cms\Packages\AssetPublisher::class));

        $this->assertArrayHasKey('acme/throws-boot', $next->active());
    }

    public function test_turning_it_on_again_retries_it(): void
    {
        $packages = $this->cms()->packages();

        $packages->enable('acme/throws-boot');

        $this->assertArrayNotHasKey('acme/throws-boot', (array) json_decode((string) file_get_contents(storage_path('framework/failed-packages.json')), true));
        $this->assertArrayHasKey('acme/throws-boot', $packages->active());
    }

    public function test_a_broken_plugin_can_still_be_uninstalled(): void
    {
        $this->cms()->packages()->uninstall('acme/parse-error', deleteFiles: true);

        $this->assertDirectoryDoesNotExist($this->site.'/plugins/parse-error');
    }

    public function test_a_bundled_library_runs_without_composer_on_the_server(): void
    {
        $packages = $this->cms()->packages();

        $this->assertTrue($packages->isActive('acme/bundled'), (string) ($packages->inactive()['acme/bundled'] ?? ''));
        $this->assertSame('hello from 2.1.0', $this->cms()->abilities()->execute('acme/bundled', [], AbilityContext::system()));
    }

    public function test_a_bundled_library_must_meet_the_constraint(): void
    {
        $this->assertStringContainsString('vendored/other', $this->cms()->packages()->inactive()['acme/bundled-old']);
    }

    public function test_the_installations_own_libraries_keep_priority(): void
    {
        $loaders = \Composer\Autoload\ClassLoader::getRegisteredLoaders();

        $this->assertStringEndsWith("/vendor", array_key_first($loaders));
        $this->assertStringNotContainsString('/plugins/', array_key_first($loaders));
    }

    public function test_autoload_files_are_loaded(): void
    {
        $this->assertSame('from a file', $this->cms()->abilities()->execute('acme/files', [], AbilityContext::system()));
    }

    /** A fatal error cannot be caught: the first request dies, every later one runs without the plugin. */
    public function test_a_fatal_error_stops_only_the_first_request(): void
    {
        $site = sys_get_temp_dir().'/cms-fatal-'.bin2hex(random_bytes(6));
        \Cms\Support\Yaml::write($site.'/config/site.yaml', ['name' => 'Fatal', 'url' => 'http://localhost']);
        \Cms\Support\Yaml::write($site.'/config/plugins.yaml', ['enabled' => ['acme/fatal']]);
        self::plugin($site, 'fatal', 'Fatal', '');
        // Breaks its contract: PHP stops the process when the class is loaded.
        file_put_contents($site.'/plugins/fatal/src/Fatal.php', "<?php\nnamespace Acme\\Fatal;\nfinal class Fatal extends \\Cms\\Packages\\Plugin { abstract public function nope(); }\n");

        $boot = static fn () => new Process([PHP_BINARY, dirname(__DIR__).'/fixtures/boot-probe.php', $site], env: ['DB_DATABASE' => $site.'/db.sqlite']);

        try {
            $first = $boot();
            $first->run();
            $this->assertStringNotContainsString('booted', $first->getOutput());

            $second = $boot();
            $second->run();
            $this->assertStringContainsString('booted', $second->getOutput(), $second->getErrorOutput());
            $this->assertStringContainsString('Failed to start', $second->getOutput());

            // Unlike a caught failure, it does not come back by itself: the same fatal would stop another request.
            $failures = json_decode((string) file_get_contents($site.'/storage/framework/failed-packages.json'), true);
            $failures['acme/fatal']['at'] -= 86400;
            file_put_contents($site.'/storage/framework/failed-packages.json', json_encode($failures));
            $third = $boot();
            $third->run();
            $this->assertStringContainsString('Failed to start', $third->getOutput());
        } finally {
            Files::deleteDirectory($site);
        }
    }

    private static function plugin(string $site, string $name, string $class, string $body, array $requires = [], bool $writeClass = true, array $autoload = []): void
    {
        $dir = $site.'/plugins/'.$name;
        $namespace = str_replace(' ', '', ucwords(str_replace('-', ' ', $name)));

        Files::put($dir.'/composer.json', (string) json_encode([
            'name' => 'acme/'.$name,
            'type' => 'cms-plugin',
            'version' => '1.0.0',
            'require' => $requires,
            'autoload' => ['psr-4' => ["Acme\\{$namespace}\\" => 'src/'], ...$autoload],
            'extra' => ['cms' => ['provider' => "Acme\\{$namespace}\\{$class}"]],
        ]));

        if ($writeClass) {
            Files::put($dir."/src/{$class}.php", "<?php\nnamespace Acme\\{$namespace};\nfinal class {$class} extends \\Cms\\Packages\\Plugin {\n{$body}\n}\n");
        }
    }

    /** What `composer install` leaves behind, reduced to what the manager reads and loads. */
    private static function vendor(string $plugin, string $library, string $version): void
    {
        Files::put($plugin.'/vendor/composer/installed.json', (string) json_encode(['packages' => [['name' => $library, 'version' => $version]]]));
        $class = $library === 'vendored/lib' ? 'Greeter' : 'Other';
        $namespace = $library === 'vendored/lib' ? 'Lib' : 'Other';
        Files::put($plugin."/vendor/{$library}/{$class}.php", "<?php\nnamespace Vendored\\{$namespace};\nfinal class {$class} { public static function hello(): string { return 'hello from {$version}'; } }\n");
        Files::put($plugin.'/vendor/autoload.php', "<?php\nspl_autoload_register(static function (\$class) { if (\$class === 'Vendored\\\\{$namespace}\\\\{$class}' && is_file(__DIR__.'/{$library}/{$class}.php')) { require __DIR__.'/{$library}/{$class}.php'; } });\n");
    }
}

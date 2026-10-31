<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Cms;
use Illuminate\Support\Facades\Schema;
use Cms\Abilities\AbilityContext;
use Cms\Tests\TestCase;
use Cms\Support\Files;
use RuntimeException;

final class PackagesTest extends TestCase
{
    protected function plugins(): array
    {
        return ['acme/base', 'acme/addon', 'acme/broken'];
    }

    protected function prepareSite(string $site): void
    {
        $this->plugin($site, 'base', [], <<<'PHP'
            public function boot(): void
            {
                $this->cms()->abilities()->register('acme/ping', ['label' => 'Ping', 'handler' => fn () => 'pong', 'annotations' => ['readOnly' => true]]);
            }
            public function install(): void { file_put_contents(storage_path('acme-installed'), $this->manifest->version); }
            public function uninstall(): void { @unlink(storage_path('acme-installed')); }
        PHP, migration: true);

        $this->plugin($site, 'addon', ['acme/base' => '^1.0'], <<<'PHP'
            public function boot(): void
            {
                $this->cms()->abilities()->register('acme/addon', ['label' => 'Addon', 'handler' => fn () => 'addon']);
            }
        PHP);

        // Requires a package that does not exist: must be skipped, not break the site.
        $this->plugin($site, 'broken', ['acme/missing' => '^1.0'], '');
    }

    public function test_active_plugins_boot_and_install(): void
    {
        $packages = $this->cms()->packages();

        $this->assertTrue($packages->isActive('acme/base'));
        $this->assertTrue($packages->isActive('acme/addon'));
        $this->assertFalse($packages->isActive('acme/broken'));
        $this->assertStringContainsString('acme/missing', $packages->inactive()['acme/broken']);

        $this->assertSame('pong', $this->cms()->abilities()->execute('acme/ping', [], AbilityContext::system()));
        $this->assertTrue(Schema::hasTable('acme_things'));
        $this->assertSame('1.0.0', file_get_contents(storage_path('acme-installed')));
        $this->assertSame('1.0.0', $packages->installedVersion('acme/base'));

        // Boot order follows dependencies.
        $order = array_keys($packages->active());
        $this->assertLessThan(array_search('acme/addon', $order), array_search('acme/base', $order));
    }

    public function test_cannot_disable_a_dependency(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('acme/addon');
        $this->cms()->packages()->disable('acme/base');
    }

    public function test_disable_then_uninstall_removes_data(): void
    {
        $packages = $this->cms()->packages();
        $packages->disable('acme/addon');
        $packages->uninstall('acme/base', deleteFiles: true);

        $this->assertNotContains('acme/base', $packages->enabled());
        $this->assertFalse(Schema::hasTable('acme_things'));
        $this->assertFileDoesNotExist(storage_path('acme-installed'));
        $this->assertDirectoryDoesNotExist($this->site.'/plugins/base');
    }

    public function test_upgrade_runs_when_version_changes(): void
    {
        $file = $this->site.'/plugins/base/composer.json';
        $composer = json_decode(file_get_contents($file), true);
        $composer['version'] = '1.1.0';
        file_put_contents($file, json_encode($composer));
        touch($file, time() + 5);

        $this->cms()->packages()->refresh();
        $this->assertArrayHasKey('acme/base', $this->cms()->packages()->pending());
    }

    public function test_rebuilt_assets_are_republished(): void
    {
        $manifest = $this->cms()->packages()->active()['acme/base'];
        $dist = $this->site.'/plugins/base/dist';
        Files::put($dist.'/admin.js', 'one');

        $this->assertSame('one', file_get_contents(public_path((new \Cms\Packages\AssetPublisher($this->app))->url($manifest, 'admin.js'))));

        // A rebuild rewrites the file in place; the folder's own mtime does not move.
        $folder = filemtime($dist);
        file_put_contents($dist.'/admin.js', 'two');
        touch($dist.'/admin.js', time() + 5);
        touch($dist, $folder);

        $this->assertSame('two', file_get_contents(public_path((new \Cms\Packages\AssetPublisher($this->app))->url($manifest, 'admin.js'))));
    }

    private function plugin(string $site, string $name, array $requires, string $body, bool $migration = false): void
    {
        $dir = "{$site}/plugins/{$name}";
        $class = ucfirst($name).'Plugin';
        $namespace = 'Acme\\'.ucfirst($name);

        Files::put("{$dir}/composer.json", json_encode([
            'name' => "acme/{$name}",
            'type' => 'cms-plugin',
            'version' => '1.0.0',
            'require' => ['letterncms/cms' => '^'.implode('.', array_slice(explode('.', Cms::VERSION), 0, 2)), ...$requires],
            'autoload' => ['psr-4' => [$namespace.'\\' => 'src/']],
            'extra' => ['cms' => ['provider' => $namespace.'\\'.$class]],
        ], JSON_PRETTY_PRINT));

        Files::put("{$dir}/src/{$class}.php", "<?php\nnamespace {$namespace};\nfinal class {$class} extends \\Cms\\Packages\\Plugin\n{\n{$body}\n}\n");

        if ($migration) {
            Files::put("{$dir}/database/migrations/2026_01_01_000000_create_acme_things.php", <<<'PHP'
                <?php
                use Illuminate\Database\Migrations\Migration;
                use Illuminate\Database\Schema\Blueprint;
                use Illuminate\Support\Facades\Schema;
                return new class extends Migration {
                    public function up(): void { Schema::create('acme_things', fn (Blueprint $t) => $t->id()); }
                    public function down(): void { Schema::dropIfExists('acme_things'); }
                };
                PHP);
        }
    }

    public function test_require_says_what_a_package_needs_from_the_cms_and_others(): void
    {
        $manifest = \Cms\Packages\PackageManifest::fromComposer('/tmp/acme', [
            'name' => 'acme/thing',
            'type' => 'cms-plugin',
            'require' => ['guzzlehttp/guzzle' => '^7.8', 'letterncms/cms' => '>=0.1 <2', 'letterncms/blocks' => '*'],
        ]);

        $this->assertSame('>=0.1 <2', $manifest->coreConstraint);
        $this->assertSame(['guzzlehttp/guzzle' => '^7.8', 'letterncms/blocks' => '*'], $manifest->requires);
    }
}

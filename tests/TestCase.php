<?php

declare(strict_types=1);

namespace Cms\Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Artisan;
use Cms\Foundation\Bootstrap;
use Cms\Cms;
use Cms\Support\Files;
use Cms\Support\Yaml;
use Cms\Users\User;

/**
 * Boots the CMS against a throw-away site folder and an in-memory SQLite database.
 * Override plugins() to enable packages for a test.
 */
abstract class TestCase extends BaseTestCase
{
    protected string $site;

    /** @return list<string> Plugins, and optional modules that are off unless a test names them (see OPT_IN). */
    protected function plugins(): array
    {
        return [];
    }

    /** Optional modules that change what a site holds: a test turns them on by naming them in plugins(). */
    private const array OPT_IN = ['letterncms/blocks', 'letterncms/collaboration', 'letterncms/languages', 'letterncms/mcp'];

    /** @return array<string, array> collection handle => definition */
    protected function collections(): array
    {
        return [
            'pages' => ['title' => 'Pages', 'singular' => 'Page', 'structure' => 'tree', 'route' => '/{parent_uri}/{slug}', 'home' => 'home', 'fields' => [['handle' => 'summary', 'type' => 'textarea']]],
            'posts' => ['title' => 'Posts', 'singular' => 'Post', 'structure' => 'dated', 'route' => '/blog/{slug}', 'fields' => [
                ['handle' => 'excerpt', 'type' => 'textarea', 'required' => true],
                ['handle' => 'body', 'type' => 'markdown'],
                ['handle' => 'tags', 'type' => 'tags'],
            ]],
            'notes' => ['title' => 'Notes', 'singular' => 'Note', 'driver' => 'files', 'structure' => 'tree', 'route' => '/notes/{parent_uri}/{slug}', 'body' => 'body', 'fields' => [['handle' => 'body', 'type' => 'markdown']]],
        ];
    }

    public function createApplication()
    {
        // A stand-in until the admin is built: the tests never run its JavaScript, so they don't need Node.
        if (! is_file($manifest = dirname(__DIR__).'/modules/admin/dist/admin.json')) {
            @mkdir(dirname($manifest), 0o777, true);
            file_put_contents($manifest, '{"entry":"main.js","css":[],"fonts":[],"imports":{},"preload":[]}');
        }

        $this->site = sys_get_temp_dir().'/cms-test-'.bin2hex(random_bytes(6));

        Yaml::write($this->site.'/config/site.yaml', ['name' => 'Test site', 'url' => 'http://localhost', 'locale' => 'en', 'locales' => ['en', 'de']]);
        $modules = array_map(static fn (string $file) => (string) json_decode((string) file_get_contents($file), true)['name'], glob(dirname(__DIR__).'/modules/*/composer.json') ?: []);
        $plugins = getenv('CMS_TEST_PLUGINS') ?: getcwd().'/plugins';
        // What the named plugins build on comes on with them.
        $needed = array_merge($this->plugins(), ...array_map(static fn (string $name) => (array) (json_decode((string) @file_get_contents($plugins.'/'.basename($name).'/composer.json'), true)['extra']['cms']['modules'] ?? []), $this->plugins()));
        $off = array_values(array_diff(self::OPT_IN, $needed));
        Yaml::write($this->site.'/config/plugins.yaml', ['enabled' => array_values(array_diff($this->plugins(), $modules)), ...($off === [] ? [] : ['disabled' => $off])]);

        foreach ($this->collections() as $handle => $definition) {
            Yaml::write($this->site."/content/collections/{$handle}.yaml", $definition);
        }

        // The plugins this test turns on, and only those: a link to the rest would let a test's own files write through it.
        @mkdir($this->site.'/plugins', 0o777, true);

        foreach (array_diff($this->plugins(), $modules) as $name) {
            if (is_dir($plugin = $plugins.'/'.basename($name))) {
                symlink($plugin, $this->site.'/plugins/'.basename($name));
            } elseif (str_starts_with($name, 'letterncms/')) {
                $this->markTestSkipped("Needs {$name}, which isn't installed here.");
            }
        }

        $this->prepareSite($this->site);

        $app = Bootstrap::create(dirname(__DIR__), $this->site);
        $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

        return $app;
    }

    /** Hook for subclasses to add files to the site before boot. */
    protected function prepareSite(string $site): void {}

    protected function setUp(): void
    {
        parent::setUp();

        Artisan::call('migrate', ['--path' => $this->app->databasePath('migrations'), '--realpath' => true]);
        $this->app->make(\Cms\Packages\PackageManager::class)->sync();
        file_put_contents(storage_path('installed.json'), '{}');
    }

    protected function tearDown(): void
    {
        $site = $this->site;
        parent::tearDown();
        Files::deleteDirectory($site);
    }

    protected function cms(): Cms
    {
        return $this->app->make(Cms::class);
    }

    protected function admin(array $attributes = []): User
    {
        return User::query()->create(['name' => 'Ada Admin', 'email' => 'ada'.bin2hex(random_bytes(3)).'@example.com', 'password' => 'secret-pass-123', 'roles' => ['admin'], 'super' => true, ...$attributes]);
    }

    protected function userWithRole(string $role): User
    {
        return User::query()->create(['name' => ucfirst($role), 'email' => $role.bin2hex(random_bytes(3)).'@example.com', 'password' => 'secret-pass-123', 'roles' => [$role]]);
    }
}

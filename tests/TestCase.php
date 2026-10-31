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

    /** @return list<string> */
    protected function plugins(): array
    {
        return [];
    }

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
        $this->site = sys_get_temp_dir().'/cms-test-'.bin2hex(random_bytes(6));

        Yaml::write($this->site.'/config/site.yaml', ['name' => 'Test site', 'url' => 'http://localhost', 'locale' => 'en', 'locales' => ['en', 'de']]);
        Yaml::write($this->site.'/config/plugins.yaml', ['enabled' => $this->plugins()]);

        foreach ($this->collections() as $handle => $definition) {
            Yaml::write($this->site."/content/collections/{$handle}.yaml", $definition);
        }

        // The plugins this test turns on, from the workspace's sandbox. Only those: a link to the rest would let a test's own files write through it.
        @mkdir($this->site.'/plugins', 0o777, true);

        foreach ($this->plugins() as $name) {
            if (is_dir($plugin = getenv('CMS_TEST_PLUGINS').'/'.basename($name))) {
                symlink($plugin, $this->site.'/plugins/'.basename($name));
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

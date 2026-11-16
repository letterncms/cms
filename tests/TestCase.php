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

    /** Optional modules that change what a site holds or who answers in it: a test turns them on by naming them in plugins(). */
    private const array OPT_IN = ['letterncms/assistant', 'letterncms/blocks', 'letterncms/collaboration', 'letterncms/languages', 'letterncms/mcp', 'letterncms/site'];

    /** @return array<string, array> collection handle => definition */
    protected function collections(): array
    {
        return [
            'pages' => ['title' => 'Pages', 'singular' => 'Page', 'structure' => 'tree', 'route' => '/{parent_uri}/{slug}', 'home' => 'home', 'fields' => [['handle' => 'summary', 'type' => 'textarea']]],
            'posts' => ['title' => 'Posts', 'singular' => 'Post', 'structure' => 'dated', 'route' => '/blog/{slug}', 'fields' => [
                ['handle' => 'excerpt', 'type' => 'textarea', 'required' => true],
                ['handle' => 'body', 'type' => 'markdown'],
                ['handle' => 'tags', 'type' => 'list'],
            ]],
            'notes' => ['title' => 'Notes', 'singular' => 'Note', 'driver' => 'files', 'structure' => 'tree', 'route' => '/notes/{parent_uri}/{slug}', 'fields' => [['handle' => 'body', 'type' => 'markdown', 'body' => true]]],
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
        // What the named packages build on comes on with them, and what that builds on (Forms, Site, Blocks).
        $needs = static fn (string $name) => (array) (json_decode((string) @file_get_contents((in_array($name, $modules, true) ? dirname(__DIR__).'/modules' : $plugins).'/'.basename($name).'/composer.json'), true)['extra']['cms']['modules'] ?? []);
        $needed = $this->plugins();

        for ($i = 0; $i < count($needed); $i++) {
            $needed = array_values(array_unique([...$needed, ...$needs($needed[$i])]));
        }

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

        \Cms\Update\Upgrader::migrateCore($this->app);
        $this->app->make(\Cms\Packages\PackageManager::class)->sync();
        file_put_contents(storage_path('installed.json'), '{}');

        // Every result an ability gives in any test is held against its output schema.
        $this->cms()->abilities()->verifyOutput = true;

        // Which abilities there are, and which a test ran: AbilityCoverage fails a whole run that leaves one out.
        foreach ($this->cms()->abilities()->all() as $name => $ability) {
            if ($ability->package === null || str_starts_with($ability->package, 'letterncms/')) {
                Support\AbilityCoverage::$known[$name] = true;
            }
        }

        $this->cms()->hooks()->on('ability.executed', static function ($ability): void {
            Support\AbilityCoverage::$ran[$ability->name] = true;
        });
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

    /** A global (a collection of type `global`) and, with values, its one entry, published. */
    protected function global(string $handle, array $fields, ?array $values = null, ?string $title = null): ?\Cms\Content\Entries\Entry
    {
        $this->cms()->collections()->save(\Cms\Content\Collections\Collection::fromArray($handle, ['type' => 'global', 'title' => $title ?? ucfirst($handle), 'fields' => $fields]));

        return $values === null ? null : $this->cms()->entryService()->create($handle, ['title' => $title ?? ucfirst($handle), 'data' => $values, 'status' => 'published']);
    }

    /** A menu (a collection of type `menu`) of links to pages (an entry id) or addresses, published: [title, link, children?]. */
    protected function menu(string $handle, array $links = [], int $depth = 3): array
    {
        $this->cms()->collections()->save(\Cms\Content\Collections\Collection::fromArray($handle, ['type' => 'menu', 'title' => ucfirst($handle), 'max_depth' => $depth, 'fields' => [['handle' => 'link', 'type' => 'link', 'label' => 'Link', 'required' => true]]]));
        $made = [];
        $add = function (array $links, ?string $parent) use (&$add, &$made, $handle): void {
            foreach ($links as $l) {
                [$title, $to, $children] = [$l[0], $l[1], $l[2] ?? []];
                $link = preg_match('/^[0-9a-z]{26}$/', $to) ? ['type' => 'entry', 'value' => $to] : ['type' => 'url', 'value' => $to];
                $made[] = $entry = $this->cms()->entryService()->create($handle, ['title' => $title, 'data' => ['link' => $link], 'parentId' => $parent, 'status' => 'published']);
                $add($children, $entry->id);
            }
        };
        $add($links, null);

        return $made;
    }

    protected function userWithRole(string $role): User
    {
        return User::query()->create(['name' => ucfirst($role), 'email' => $role.bin2hex(random_bytes(3)).'@example.com', 'password' => 'secret-pass-123', 'roles' => [$role]]);
    }
}

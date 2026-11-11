<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Tests\TestCase;

/**
 * The admin's browser fixtures draw places with the views the server really sends: this
 * resolves them, with every plugin on, and keeps modules/admin/tests/fixtures/views.json
 * in step. Run with CMS_UPDATE_FIXTURES=1 to write it after changing a view.
 */
final class ViewFixturesTest extends TestCase
{
    /** The places the fixtures open, and the params they open them with. */
    private const PLACES = [
        ['audit', []], ['users', []], ['plugins', []], ['globals', []], ['collections', []],
        ['forms', []], ['media', []], ['navigation', []], ['languages', []], ['settings', ['namespace' => 'seo']],
        // A form of its own: "Contact", with the name, email and message every new form starts with.
        ['form', ['handle' => 'contact']],
    ];

    private static function folders(): array
    {
        return array_values(array_filter(glob((getenv('CMS_TEST_PLUGINS') ?: getcwd().'/plugins').'/*', GLOB_ONLYDIR) ?: [], static fn ($dir) => is_file($dir.'/composer.json')));
    }

    public function createApplication()
    {
        $app = parent::createApplication();
        self::folders() === [] && $this->markTestSkipped("Needs every plugin, which aren't installed here.");

        return $app;
    }

    protected function plugins(): array
    {
        // Every optional module too, as a site has them.
        return [...array_map(static fn ($dir) => (string) json_decode((string) file_get_contents($dir.'/composer.json'), true)['name'], self::folders()), 'letterncms/assistant', 'letterncms/blocks', 'letterncms/collaboration', 'letterncms/languages', 'letterncms/mcp', 'letterncms/site'];
    }

    public function test_the_fixtures_draw_the_views_the_server_sends(): void
    {
        $admin = $this->admin();
        $views = [];
        $this->cms()->abilities()->execute('forms/create', ['title' => 'Contact'], AbilityContext::forUser($admin, 'admin'));
        // The Redirects tab is drawn with a redirect in it: without one it is an empty state, and the fixtures open the table.
        if (isset($this->cms()->abilities()->all()['redirects/create'])) {
            $this->cms()->abilities()->execute('redirects/create', ['from' => '/old', 'to' => '/new'], AbilityContext::forUser($admin, 'admin'));
        }

        foreach (self::PLACES as [$id, $params]) {
            if ($this->cms()->views()->has($id)) {
                $views[$id.($params ? ':'.http_build_query($params) : '')] = $this->cms()->abilities()->execute('views/get', ['id' => $id, 'params' => $params], AbilityContext::forUser($admin, 'admin'));
            }
        }

        $file = dirname(__DIR__, 2).'/modules/admin/tests/fixtures/views.json';
        $json = json_encode($views, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)."\n";

        if (getenv('CMS_UPDATE_FIXTURES')) {
            @mkdir(dirname($file), 0o777, true);
            file_put_contents($file, $json);
        }

        $this->assertCount(count(self::PLACES), $views, 'A place the fixtures open is no view.');
        $this->assertFileExists($file, 'Write the fixtures with CMS_UPDATE_FIXTURES=1.');
        $this->assertSame($json, (string) file_get_contents($file), 'A view changed: write the fixtures again with CMS_UPDATE_FIXTURES=1.');
    }
}

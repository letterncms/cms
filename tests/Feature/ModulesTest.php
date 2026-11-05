<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Admin\Manifest;
use Cms\Support\Yaml;
use Cms\Tests\TestCase;
use RuntimeException;

final class ModulesTest extends TestCase
{
    private const array MODULES = ['letterncms/account', 'letterncms/admin', 'letterncms/assistant', 'letterncms/audit', 'letterncms/blocks', 'letterncms/collaboration', 'letterncms/collections', 'letterncms/content', 'letterncms/dashboard', 'letterncms/email', 'letterncms/globals', 'letterncms/languages', 'letterncms/license', 'letterncms/mcp', 'letterncms/media', 'letterncms/navigation', 'letterncms/packages', 'letterncms/settings', 'letterncms/site', 'letterncms/sync', 'letterncms/users', 'letterncms/workspace'];

    /** Every module as a new site has them: the optional ones the test case keeps off are on here. */
    protected function plugins(): array
    {
        return ['letterncms/assistant', 'letterncms/blocks', 'letterncms/collaboration', 'letterncms/languages', 'letterncms/mcp', 'letterncms/site'];
    }

    public function test_the_admin_is_made_of_modules_that_are_on_by_default(): void
    {
        $packages = $this->cms()->packages();

        $this->assertSame(self::MODULES, array_keys($packages->modules()));
        $this->assertSame([], array_values(array_diff(self::MODULES, array_keys($packages->active()))));
        $this->assertSame(['letterncms/account', 'letterncms/admin', 'letterncms/content', 'letterncms/email', 'letterncms/media', 'letterncms/navigation', 'letterncms/packages', 'letterncms/settings', 'letterncms/workspace'], array_keys(array_filter($packages->modules(), static fn ($m) => $m->required)));
    }

    public function test_what_a_module_registers_is_its_own(): void
    {
        $cms = $this->cms();

        $this->assertSame('letterncms/content', $cms->abilities()->get('entries/list')->package);
        $this->assertSame('letterncms/users', $cms->abilities()->get('users/create')->package);
        $this->assertNull($cms->abilities()->get('users/list')->package, 'Pickers need users/list; it stays the kernel’s.');
        $this->assertSame('letterncms/users', $cms->settingsRegistry()->schemas()['roles']['package']);
    }

    public function test_switching_modules_off_is_written_as_disabled_and_required_ones_stay(): void
    {
        $packages = $this->cms()->packages();

        $packages->disable('letterncms/audit');
        $this->assertSame(['letterncms/audit'], Yaml::read(site_path('config/plugins.yaml'))['disabled']);
        $this->assertNotContains('letterncms/audit', $packages->enabled());

        $packages->enable('letterncms/audit');
        $this->assertArrayNotHasKey('disabled', Yaml::read(site_path('config/plugins.yaml')));

        $this->expectException(RuntimeException::class);
        $packages->disable('letterncms/settings');
    }

    public function test_a_module_others_need_cannot_be_disabled_and_none_can_be_uninstalled(): void
    {
        $packages = $this->cms()->packages();

        $this->assertSame(['letterncms/collections'], $packages->dependents('letterncms/content'));

        $this->expectException(RuntimeException::class);
        $packages->uninstall('letterncms/globals');
    }

    public function test_the_modules_list_tells_modules_and_plugins_apart(): void
    {
        $list = $this->cms()->abilities()->execute('packages/list', ['type' => 'module'], AbilityContext::forUser($this->admin(), 'admin'));
        $content = array_column($list['items'], null, 'name')['letterncms/content'];

        $this->assertCount(22, $list['items']);
        $this->assertTrue($content['required']);
        $this->assertSame(['roles'], array_column($list['items'], null, 'name')['letterncms/users']['settings']);
        $this->assertArrayNotHasKey('metrics', $content);
    }

    public function test_audit_records_changes_through_its_module(): void
    {
        $ctx = AbilityContext::forUser($this->admin(), 'admin');
        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'site', 'values' => ['description' => 'Changed']], $ctx);

        $this->assertSame(['settings/update'], \DB::table('audit_log')->pluck('ability')->all());
        $this->assertSame('Changed', $this->cms()->settings('site', 'description'));
    }

    public function test_the_admin_settings_hold_what_modules_add(): void
    {
        $settings = array_column($this->cms()->abilities()->execute('settings/get', ['namespace' => 'admin'], AbilityContext::forUser($this->admin(), 'admin'))['fields'], null, 'handle');

        $this->assertArrayHasKey('dashboard', $settings, 'letterncms/dashboard adds its arrangement to the admin settings.');
        // How the editor works is the same everywhere: no settings.
        $this->assertArrayNotHasKey('per_page', $settings);
        $this->assertSame(['perPage' => 50, 'autosave' => 1200], $this->app->make(Manifest::class)->build($this->admin())['config']['content']);
    }
}

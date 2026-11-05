<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Illuminate\Support\Facades\Schema;
use Cms\Abilities\AbilityContext;
use Cms\Admin\Manifest;
use Cms\Support\Yaml;
use Cms\Tests\TestCase;

/** A site with every optional module off: only what the CMS needs to work. */
final class LightweightTest extends TestCase
{
    protected function prepareSite(string $site): void
    {
        Yaml::write($site.'/config/plugins.yaml', ['enabled' => [], 'disabled' => ['letterncms/assistant', 'letterncms/audit', 'letterncms/blocks', 'letterncms/collaboration', 'letterncms/collections', 'letterncms/dashboard', 'letterncms/globals', 'letterncms/languages', 'letterncms/mcp', 'letterncms/site', 'letterncms/sync', 'letterncms/users']]);
    }

    public function test_only_the_required_modules_run(): void
    {
        $this->assertSame(['letterncms/account', 'letterncms/admin', 'letterncms/content', 'letterncms/email', 'letterncms/license', 'letterncms/media', 'letterncms/navigation', 'letterncms/packages', 'letterncms/settings', 'letterncms/workspace'], array_values(array_filter(array_keys($this->cms()->packages()->active()), static fn ($n) => ! in_array($n, ['cms/admin', 'cms/starter'], true))));
    }

    public function test_what_switched_off_modules_add_is_gone(): void
    {
        $abilities = $this->cms()->abilities();

        foreach (['audit/list', 'collections/save', 'globals/get', 'users/create', 'roles/list'] as $name) {
            $this->assertFalse($abilities->has($name), $name);
        }

        $this->assertTrue($abilities->has('users/list'));
        $this->assertTrue($abilities->has('entries/list'));
        $this->assertFalse(Schema::hasTable('audit_log'), 'letterncms/audit owns its table.');
    }

    public function test_the_admin_still_describes_itself(): void
    {
        $manifest = $this->app->make(Manifest::class)->build($this->admin());

        $this->assertSame([], $manifest['globals']);
        // Widgets belong to the shared component catalog, independently of Home.
        $this->assertContains('recent', array_column($manifest['widgets'], 'id'));
        $this->assertNotContains('shortcuts', array_column($manifest['widgets'], 'id'));
        $this->assertContains('widget/recent', array_column($this->app->make(\Cms\Admin\Surface::class)->catalog($this->admin()), 'id'));
        $this->assertNotContains('dashboard', array_column($manifest['nav'], 'id'));
        $this->assertNotContains('audit', array_column($manifest['nav'], 'id'));
        $this->assertContains('collection.pages', array_column($manifest['nav'], 'id'));
        $this->assertContains('plugins', array_column($manifest['nav'], 'id'));

        // Changes still work; there is just no log of them.
        $entry = $this->cms()->abilities()->execute('entries/create', ['collection' => 'posts', 'title' => 'Light', 'data' => ['excerpt' => 'Small']], AbilityContext::forUser($this->admin(), 'admin'));
        $this->assertSame('Light', $entry['title']);
    }
}

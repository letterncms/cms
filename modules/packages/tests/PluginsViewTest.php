<?php

declare(strict_types=1);

namespace Cms\Modules\Packages\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Tests\TestCase;

/** Plugins is a view: every plugin in one list with updates beside it; Built In is a settings page; each plugin says where it is set up. */
final class PluginsViewTest extends TestCase
{
    public function test_plugins_lists_plugins_only_by_name_with_where_each_is_set_up(): void
    {
        $admin = $this->admin();
        $ctx = AbilityContext::forUser($admin, 'admin');
        $view = $this->cms()->abilities()->execute('views/get', ['id' => 'plugins'], $ctx)['root'];
        $tabs = $view['children'][0]['children'];

        // One list of every plugin (the store's and what is installed here), then updates: Built In is a settings page of its own.
        $this->assertSame(['plugins', 'updates'], array_slice(array_column(array_column($tabs, 'props'), 'id'), 0, 2));
        $this->assertContains('packages/store', array_column($tabs[0]['children'], 'type'));
        $this->assertNotContains('built-in', array_column(array_column($tabs, 'props'), 'id'));

        // Built In: the modules that can be switched off, never a required one, nothing to uninstall.
        $builtIn = $this->cms()->abilities()->execute('views/get', ['id' => 'built-in'], $ctx)['root']['children'][0];
        $this->assertSame(['type' => 'module', 'optional' => true], $builtIn['props']['source']['input']);
        $this->assertSame([], array_filter($builtIn['props']['actions'], static fn ($a) => ($a['ability'] ?? null) === 'packages/uninstall'));
        $this->assertSame('packages/switch', array_column($builtIn['props']['columns'], 'action', 'key')['enabled']['ability']);
        $this->assertSame('system', $this->cms()->admin()->navItems()['built-in']['section']);
        $modules = $this->cms()->abilities()->execute('packages/list', ['type' => 'module', 'optional' => true], $ctx)['items'];
        $this->assertNotContains('letterncms/media', array_column($modules, 'name'));
        $this->assertNotContains('letterncms/license', array_column($modules, 'name'), 'Required, as Modules needs it.');
        $this->assertSame([], array_filter($modules, static fn ($m) => $m['required']));

        $list = $this->cms()->abilities()->execute('packages/list', ['type' => 'plugin'], $ctx);
        $items = $list['items'];
        $this->assertSame(count($items), $list['total']);
        $labels = array_column($items, 'label');
        $sorted = $labels;
        natcasesort($sorted);
        $this->assertSame(array_values($sorted), $labels);

        foreach ($items as $item) {
            $this->assertFalse($item['core']);
            $this->assertIsString($item['note']);
            // Why it stays on, beside its switch: the description is still said.
            $this->assertSame($item['required'] || ($item['enabled'] && $item['dependents'] !== []), $item['keptOn'] !== null);
            // Somewhere to set it up, or nowhere to go.
            $this->assertTrue($item['to'] === null || str_starts_with($item['to'], '/'));
            // What the site requires, or another plugin needs, stays on.
            $this->assertSame($item['required'] || ($item['enabled'] && $item['dependents'] !== []) || ($item['problem'] !== null && ! $item['enabled']), $item['locked']);
        }
    }
}

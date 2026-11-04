<?php

declare(strict_types=1);

namespace Cms\Modules\Packages\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Tests\TestCase;

/** Plugins is a view: the plugins by name, each with a switch, the store and updates, and where each is set up. */
final class PluginsViewTest extends TestCase
{
    public function test_plugins_lists_plugins_only_by_name_with_where_each_is_set_up(): void
    {
        $admin = $this->admin();
        $ctx = AbilityContext::forUser($admin, 'admin');
        $view = $this->cms()->abilities()->execute('views/get', ['id' => 'plugins'], $ctx)['root'];
        $tabs = $view['children'][0]['children'];

        $this->assertSame(['installed', 'built-in', 'store', 'updates'], array_slice(array_column(array_column($tabs, 'props'), 'id'), 0, 4));

        // Built In: the modules that can be switched off, never a required one, nothing to uninstall.
        $builtIn = $tabs[1]['children'][0];
        $this->assertSame(['type' => 'module', 'optional' => true], $builtIn['props']['source']['input']);
        $this->assertSame([], array_filter($builtIn['props']['actions'], static fn ($a) => ($a['ability'] ?? null) === 'packages/uninstall'));
        $modules = $this->cms()->abilities()->execute('packages/list', ['type' => 'module', 'optional' => true], $ctx)['items'];
        $this->assertNotContains('letterncms/media', array_column($modules, 'name'));
        $this->assertNotContains('letterncms/license', array_column($modules, 'name'), 'Held on by the required Modules module.');
        $this->assertSame([], array_filter($modules, static fn ($m) => $m['required']));
        $records = array_values(array_filter($tabs[0]['children'], static fn ($n) => $n['type'] === 'ui/records'))[0];
        $this->assertSame('packages/switch', array_column($records['props']['columns'], 'action', 'key')['enabled']['ability']);

        $columns = array_column($records['props']['columns'], null, 'key');
        $this->assertSame('locked', $columns['enabled']['disabled']);
        $this->assertSame('{row.to}', $records['props']['open']['when']);

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
            // Somewhere to set it up, or nowhere to go.
            $this->assertTrue($item['to'] === null || str_starts_with($item['to'], '/'));
            // What the site requires, or another plugin needs, stays on.
            $this->assertSame($item['required'] || ($item['enabled'] && $item['dependents'] !== []) || ($item['problem'] !== null && ! $item['enabled']), $item['locked']);
        }
    }
}

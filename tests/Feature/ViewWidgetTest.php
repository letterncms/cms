<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Admin\Manifest;
use Cms\Tests\TestCase;
use Cms\Users\User;

/** A widget drawn from a view: no admin build, the same renderer as any place, and no place of its own. */
final class ViewWidgetTest extends TestCase
{
    public function test_a_widget_drawn_from_a_view_is_built_for_whoever_looks(): void
    {
        $this->cms()->admin()->widget('sales', ['label' => 'Sales', 'description' => 'Sales this month.', 'permission' => 'packages.manage',
            'action' => ['label' => 'All Orders', 'to' => '/orders'],
            'view' => static fn (User $user) => ['type' => 'ui/stat', 'props' => ['label' => 'Orders', 'value' => $user->email]]]);
        $admin = $this->admin();

        $widget = array_column($this->app->make(Manifest::class)->build($admin)['widgets'], null, 'id')['sales'];
        $this->assertSame('widget.sales', $widget['view']);
        $this->assertSame(['label' => 'All Orders', 'to' => '/orders'], $widget['action']);

        $view = $this->cms()->abilities()->execute('views/get', ['id' => 'widget.sales'], AbilityContext::forUser($admin, 'admin'));
        $this->assertSame(['type' => 'ui/stat', 'props' => ['label' => 'Orders', 'value' => $admin->email]], $view['root']);

        // Inside the widget only: no route, and not a place the address bar opens.
        $this->assertNotContains('widget.sales', array_column($this->cms()->views()->forUser($admin), 'id'));
        $this->assertNull($this->cms()->views()->opens('/', $admin));

        // Whoever may not see the widget may not load its view either.
        $this->expectException(AbilityException::class);
        $this->cms()->abilities()->execute('views/get', ['id' => 'widget.sales'], AbilityContext::forUser($this->userWithRole('author'), 'admin'));
    }
}

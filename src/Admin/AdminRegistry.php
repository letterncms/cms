<?php

declare(strict_types=1);

namespace Cms\Admin;

use Cms\Support\Brand;
use Cms\Packages\Scope;
use Cms\Cms;
use Cms\Users\User;

/**
 * What the core and plugins add to the admin. The admin theme renders it from the
 * manifest; nothing here knows about React or any particular admin theme.
 *
 * - sections: sidebar sections; `settings` ones make up the settings sidebar
 * - nav:      sidebar items, each in a section; pinned ones show in the sidebar, the rest under More (people pin their own, see Navigation)
 * - modules:  ES modules executed by the admin (register routes, field components, panels…)
 * - widgets:  home-screen widgets with a default column, on or off by default (people arrange their own, see letterncms/dashboard)
 * - commands: command-palette entries that run an ability or navigate
 * - arranged: parts of the admin that admins arrange (the sidebar; the home screen when its module is on)
 */
final class AdminRegistry
{
    public function __construct(private readonly Cms $cms) {}

    /** @var array<string, array{id: string, label: string, order: int, settings: bool}> */
    private array $sections = [];

    /** @var array<string, array> */
    private array $nav = [];

    /** @var array<string, array{url: string, package: ?string}> */
    private array $modules = [];

    /** @var list<string> */
    private array $styles = [];

    /** @var array<string, array> */
    private array $widgets = [];

    /** @var array<string, array> Schema-described components for generated admin surfaces. */
    private array $components = [];

    /** @var array<string, array> */
    private array $commands = [];

    /** @var array<string, string> Import map entries contributed by packages. */
    private array $imports = [];

    /** @var array<string, class-string<Arranged>> settings key => part */
    private array $arranged = [];

    /**
     * A sidebar section. An empty label shows its items without a heading. A
     * `settings` section belongs to the settings sidebar: its items are pages
     * of settings, not something to pin. Registering it twice keeps the first.
     */
    public function section(string $id, string $label, int $order = 50, bool $settings = false): void
    {
        $this->sections[$id] ??= ['id' => $id, 'label' => $label, 'order' => $order, 'settings' => $settings];
    }

    /**
     * A screen people open from the sidebar. `pinned` puts it in everyone's
     * sidebar until they pin their own; every other item waits under More —
     * keep it for screens people open every week. `visible` decides per user
     * beyond the permission (the assistant shows only once it can work).
     *
     * @param  array{label: string, path: string, icon?: string, section?: string, order?: int, pinned?: bool, shortcut?: ?string, placement?: ?string, permission?: ?string, visible?: ?callable(User): bool, badge?: ?callable}  $item
     */
    public function nav(string $id, array $item): void
    {
        $this->nav[$id] = ['id' => $id, 'icon' => 'circle', 'section' => 'content', 'order' => 50, 'pinned' => false, 'shortcut' => null, 'permission' => null, 'visible' => null, ...$item];
    }

    public function removeNav(string $id): void
    {
        unset($this->nav[$id]);
    }

    public function module(string $id, string $url, ?string $package = null): void
    {
        $this->modules[$id] = ['url' => $url, 'package' => $package ?? Scope::$current];
    }

    /** @return array<string, array{url: string, package: ?string}> */
    public function modules(): array
    {
        return $this->modules;
    }

    /**
     * A part of the admin that admins arrange; its arrangement is the `$key`
     * value of the `admin` settings.
     *
     * @param  class-string<Arranged>  $part
     */
    public function arrange(string $key, string $part): void
    {
        $this->arranged[$key] = $part;
    }

    /** @return array<string, Arranged> */
    public function arranged(): array
    {
        return array_map(static fn (string $part) => app($part), $this->arranged);
    }

    public function style(string $url): void
    {
        $this->styles[] = $url;
    }

    /** Expose a module to other modules through the import map (e.g. "@letterncms/blocks"). */
    public function import(string $specifier, string $url): void
    {
        $this->imports[$specifier] = $url;
    }

    /**
     * A home-screen widget; its component is registered in the admin module under the same id
     * (`registry.widgets.set(id, Component)`). Every plugin registers at least one (see
     * PackageManager::problems()). The gallery shows label, icon and description; `enabled`
     * puts it on everyone's home screen until they rearrange it — keep that for the few
     * widgets nearly everyone wants.
     *
     * @param  array{label: string, description: string, icon?: string, column?: 'main'|'side', enabled?: bool, assistant?: bool, permission?: ?string, order?: int}  $widget
     */
    public function widget(string $id, array $widget): void
    {
        $this->widgets[$id] = ['id' => $id, 'description' => '', 'icon' => 'box', 'column' => 'side', 'enabled' => false, 'order' => 50, 'permission' => null, ...$widget, 'package' => $widget['package'] ?? Scope::$current];
    }

    /** @return array<string, array> */
    public function widgets(): array
    {
        return $this->widgets;
    }

    /** Widgets keep their existing permissions wherever they are rendered. */
    public function widgetsForUser(User $user): array
    {
        return array_filter($this->widgets, static fn ($w) => $w['permission'] === null || $user->hasPermission($w['permission'], any: true));
    }

    /** Shared metadata for any widget host, even when the home-screen module is off. */
    public function widgetCatalog(User $user): array
    {
        $packages = $this->cms->packages()->repository()->all();

        return array_values(array_map(static fn ($w) => [
            'id' => $w['id'],
            'label' => $w['label'],
            'description' => $w['description'],
            'icon' => $w['icon'],
            'column' => $w['column'],
            'enabled' => (bool) $w['enabled'],
            'source' => isset($packages[$w['package']]) ? $packages[$w['package']]->label : Brand::get(),
        ], $this->widgetsForUser($user)));
    }

    /**
     * A trusted, schema-described UI component. The admin module registers its
     * renderer with registry.components.set(id, Component); no assistant dependency.
     *
     * @param array{label: string, description?: string, props: array, children?: bool, permission?: ?string} $component
     */
    public function component(string $id, array $component): void
    {
        if (! preg_match('#^[a-z][a-z0-9-]*/[a-z][a-z0-9-]*$#', $id) || str_starts_with($id, 'ui/') || str_starts_with($id, 'widget/')) {
            throw new \InvalidArgumentException('Component ids must be namespaced; ui/ and widget/ are reserved.');
        }

        $this->components[$id] = ['id' => $id, 'description' => '', 'children' => false, 'permission' => null, ...$component, 'package' => Scope::$current];
    }

    public function componentsForUser(User $user): array
    {
        return array_values(array_map(
            static fn ($c) => array_diff_key($c, ['permission' => true]),
            array_filter($this->components, static fn ($c) => $c['permission'] === null || $user->hasPermission($c['permission'])),
        ));
    }

    /** @return array<string, list<string>> package => the ids of the widgets it registered */
    public function widgetsByPackage(): array
    {
        $out = [];

        foreach ($this->widgets as $id => $widget) {
            $out[(string) $widget['package']][] = $id;
        }

        return $out;
    }

    /**
     * @param  array{label: string, icon?: string, group?: string, path?: string, ability?: string, input?: array, keywords?: list<string>, permission?: ?string}  $command
     */
    public function command(string $id, array $command): void
    {
        $this->commands[$id] = ['id' => $id, 'icon' => 'command', 'group' => 'Actions', 'permission' => null, ...$command];
    }

    /** @return array<string, array{id: string, label: string, order: int, settings: bool}> */
    public function sections(): array
    {
        return $this->sections;
    }

    /** @return array<string, array> */
    public function navItems(): array
    {
        return $this->nav;
    }

    /** @return list<string> */
    public function styles(): array
    {
        return array_values(array_unique($this->styles));
    }

    /** @return array<string, string> */
    public function imports(): array
    {
        return $this->imports;
    }

    /** Modules and commands this user may see (the sidebar and dashboard come from Navigation and Dashboard). */
    public function forUser(User $user): array
    {
        $visible = static fn (array $item) => $item['permission'] === null || $user->hasPermission($item['permission'], any: true);

        return [
            'widgets' => $this->widgetCatalog($user),
            'components' => $this->componentsForUser($user),
            'modules' => array_map(static fn ($id, $m) => ['id' => $id, ...$m], array_keys($this->modules), $this->modules),
            'styles' => array_values(array_unique($this->styles)),
            'commands' => array_values(array_filter($this->commands, $visible)),
        ];
    }
}

<?php

declare(strict_types=1);

namespace Cms\Admin;

use Cms\Support\Brand;
use Cms\Packages\PackageRepository;
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
 * - commands: what / in a thread (and ⌘K) offers to run an ability or navigate
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
     * A screen people open from the sidebar. Every item is in everyone's
     * sidebar until they arrange their own: More holds only what a person
     * unpins (or `pinned: false`, for a screen nearly nobody opens). `visible` decides per user
     * beyond the permission (the assistant shows only once it can work).
     *
     * `section` is where it is listed: `main`, `content` or `design`
     * in the sidebar, or a section of the settings sidebar for a screen that is
     * set up once (a plugin's then lands under Plugins, see Navigation).
     *
     * A plugin's main screen is called what the plugin is: leave out `label`
     * and the item takes the plugin's name (`extra.cms.label`). Its other
     * screens (the design system's) name themselves.
     *
     * @param  array{label?: string, path: string, icon?: string, section?: string, order?: int, pinned?: bool, shortcut?: ?string, permission?: ?string, visible?: ?callable(User): bool, badge?: ?callable}  $item
     */
    public function nav(string $id, array $item): void
    {
        $package = $item['package'] ?? Scope::$current;
        $label = $item['label'] ?? PackageRepository::labelOf($package) ?? ucfirst($id);
        $this->nav[$id] = ['id' => $id, 'icon' => 'circle', 'section' => 'content', 'order' => 50, 'pinned' => true, 'shortcut' => null, 'permission' => null, 'visible' => null, ...$item, 'label' => $label, 'package' => $package];
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
     * (`registry.widgets.set(id, Component)`), or it is drawn from a `view`: a tree of catalog
     * components like any place's (see Views), built for whoever looks, with no admin build.
     * `action` is the link in its header ("All Orders"), its label in English like the widget's. A plugin registers one when it has
     * something worth a glance, and none otherwise. The gallery shows label, icon and description; `enabled`
     * puts it on everyone's home screen until they rearrange it — keep that for the few
     * widgets nearly everyone wants.
     *
     * @param  array{label: string, description: string, icon?: string, column?: 'main'|'side', enabled?: bool, assistant?: bool, permission?: ?string, order?: int, view?: array|\Closure(\Cms\Users\User): array, action?: array{label: string, to: string}}  $widget
     */
    public function widget(string $id, array $widget): void
    {
        $package = $widget['package'] ?? Scope::$current;

        if (isset($widget['view'])) {
            $this->cms->views()->register(self::view($id), null, $widget['view'], $widget['permission'] ?? null, $package);
        }

        unset($widget['view']);
        $this->widgets[$id] = ['id' => $id, 'description' => '', 'icon' => 'box', 'column' => 'side', 'enabled' => false, 'order' => 50, 'permission' => null, ...$widget, 'package' => $package];
    }

    /** The id of the view a widget is drawn from. */
    public static function view(string $widget): string
    {
        return 'widget.'.$widget;
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

        $views = $this->cms->views();

        return array_values(array_map(static fn ($w) => [
            'id' => $w['id'],
            'label' => $w['label'],
            'description' => $w['description'],
            'icon' => $w['icon'],
            'column' => $w['column'],
            'enabled' => (bool) $w['enabled'],
            'source' => isset($packages[$w['package']]) ? $packages[$w['package']]->label : Brand::get(),
            ...($views->has(self::view($w['id'])) ? ['view' => self::view($w['id'])] : []),
            ...(isset($w['action']) ? ['action' => ['label' => (string) $w['action']['label'], 'to' => (string) $w['action']['to']]] : []),
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

    /**
     * @param  array{label: string, icon?: string, path?: string, ability?: string, input?: array, keywords?: list<string>, permission?: ?string}  $command
     */
    public function command(string $id, array $command): void
    {
        $this->commands[$id] = ['id' => $id, 'icon' => 'command', 'permission' => null, ...$command];
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
            'modules' => array_map(static fn ($id, $m) => ['id' => $id, ...$m], array_keys($this->modules), $this->modules),
            'styles' => array_values(array_unique($this->styles)),
            'commands' => array_values(array_filter($this->commands, $visible)),
        ];
    }
}

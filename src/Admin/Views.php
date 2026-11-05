<?php

declare(strict_types=1);

namespace Cms\Admin;

use Closure;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Cms;
use Cms\Support\Schema\Validator;
use Cms\Users\User;

/**
 * The admin's places as data. Each view is a tree of catalog components (see Catalog)
 * at a path of the admin: a page with its tabs, lists bound to abilities, forms bound to
 * one ability that loads and one that saves. One renderer draws them all, so every place
 * looks and behaves the same, and a plugin's screens are native by construction.
 *
 *   $cms->views()->register('audit', '/audit', fn (User $user) => [
 *       'type' => 'ui/page', 'props' => ['title' => 'Audit Log', 'icon' => 'activity'],
 *       'children' => [['type' => 'ui/records', 'props' => ['label' => 'Audit Log', 'source' => ['ability' => 'audit/list'], 'columns' => [...]]]],
 *   ], permission: 'audit.view');
 *
 * A plugin can ship a view as a file instead, `views/<id>.json`: `{"path": …, "permission": …, "view": {…}}`.
 * Words are written in English and read in the user's language: in PHP with `__()`, like anywhere
 * else, so a record's own title or a field someone named stays as it was written. A file's words are
 * all words, and are translated for it. A node with `can` shows only
 * to those with that permission (any of a list). The `view.<id>` filter lets other plugins add to one.
 */
final class Views
{
    public const int DEPTH = 12;

    /** @var array<string, array{path: ?string, permission: string|Closure|null, view: array|Closure, package: ?string, private: bool, file?: bool}> */
    private array $views = [];

    public function __construct(private readonly Cms $cms) {}

    /**
     * `private`: what the place shows stays on it, out of what the assistant is told about the screen on view.
     * A null `path`: drawn inside something else (a widget), never a place of its own.
     */
    public function register(string $id, ?string $path, array|Closure $view, string|Closure|null $permission = null, ?string $package = null, bool $private = false): void
    {
        $this->views[$id] = ['path' => $path === null ? null : '/'.trim($path, '/'), 'permission' => $permission, 'view' => $view, 'package' => $package ?? \Cms\Packages\Scope::$current, 'private' => $private];
    }

    /** A view a package ships as `views/<id>.json`. */
    public function registerFile(string $file, ?string $package = null): void
    {
        $data = json_decode((string) file_get_contents($file), true, 64, JSON_THROW_ON_ERROR);
        $id = basename($file, '.json');
        $this->register($id, (string) ($data['path'] ?? ''), (array) ($data['view'] ?? []), $data['permission'] ?? null, $package, (bool) ($data['private'] ?? false));
        $this->views[$id]['file'] = true;
    }

    /**
     * A place that isn't there (a deleted menu, a collection someone may not see): its page says so,
     * with the way back (`to`, and its `label` in the reader's language), or home without one.
     *
     * @param  array{to: string, label: string}|null  $back
     */
    public static function notFound(string $icon, ?array $back = null): array
    {
        $action = $back !== null ? ['label' => $back['label'], 'icon' => 'arrow-left', 'to' => $back['to']] : ['label' => __('Go Home'), 'to' => '/'];

        return ['type' => 'ui/page', 'props' => ['title' => __('Not Found'), 'icon' => $icon, ...($back !== null ? ['back' => $back] : [])], 'children' => [
            ['type' => 'ui/empty', 'props' => ['icon' => $icon, 'title' => __('Not Found'), 'action' => $action]],
        ]];
    }

    public function has(string $id): bool
    {
        return isset($this->views[$id]);
    }

    /** @return list<array{id: string, path: string, package: ?string, private: bool}> the views this user may open, for the manifest. */
    public function forUser(User $user): array
    {
        $out = [];

        foreach ($this->views as $id => $view) {
            if ($view['path'] !== null && $this->allowed($view['permission'], $user)) {
                $out[] = ['id' => $id, 'path' => $view['path'], 'package' => $view['package'], 'private' => $view['private']];
            }
        }

        return $out;
    }

    /**
     * Whether this user may open the place at a path, by the view that draws it: true or false,
     * or null when no view is there (a screen of a module's own, or nothing at all).
     */
    public function opens(string $path, User $user): ?bool
    {
        $path = '/'.trim($path, '/');
        $best = null;

        foreach ($this->views as $view) {
            if ($view['path'] === null) {
                continue;
            }
            $pattern = '~^'.preg_replace('~/:[A-Za-z_][A-Za-z0-9_]*~', '/[^/]+', $view['path']).'$~';
            if (preg_match($pattern, $path) === 1) {
                // An exact place wins over one with params (`/users/fields` over `/users/:id`).
                $exact = ! str_contains($view['path'], ':');
                if ($best === null || ($exact && ! $best['exact'])) {
                    $best = ['view' => $view, 'exact' => $exact];
                }
            }
        }

        return $best === null ? null : $this->allowed($best['view']['permission'], $user);
    }

    /** One view, for this user: checked against the catalog, what they may not see taken out, labels in their language. */
    public function resolve(string $id, User $user, array $params = []): array
    {
        $view = $this->views[$id] ?? throw new AbilityException(__('No view :id.', ['id' => $id]), 'not_found');

        if (! $this->allowed($view['permission'], $user)) {
            throw AbilityException::forbidden();
        }

        $tree = $view['view'] instanceof Closure ? ($view['view'])($user, $params) : $view['view'];
        // A file has no `__()`: its words are translated here. A tree from PHP says its words itself.
        if ($view['file'] ?? false) {
            $tree = $this->translate($tree);
        }
        $tree = $this->cms->hooks()->filter('view.'.$id, $tree, $user, $params);

        return ['id' => $id, 'path' => $view['path'], 'package' => $view['package'], 'root' => $this->validate($tree, $user) ?? throw AbilityException::forbidden()];
    }

    /** A view's tree, checked: every node a catalog component with valid props, nothing deeper than DEPTH. Null when the user may see none of it. */
    public function validate(array $tree, User $user): ?array
    {
        $this->catalog = $this->cms->app()->make(Catalog::class)->definitions($user);
        $this->abilities = $this->cms->abilities()->available(AbilityContext::forUser($user, 'admin'));

        try {
            return $this->node($tree, $user, 1);
        } finally {
            $this->catalog = $this->abilities = [];
        }
    }

    /** @var array<string, array> */
    private array $catalog = [];

    /** @var array<string, mixed> what the user may run in the admin, while a view is resolved */
    private array $abilities = [];

    private function node(array $node, User $user, int $depth): ?array
    {
        if ($depth > self::DEPTH) {
            throw AbilityException::invalid(__('A view is at most :depth levels deep.', ['depth' => self::DEPTH]));
        }

        if (isset($node['can']) && ! $this->may($node['can'], $user)) {
            return null;
        }

        $type = (string) ($node['type'] ?? '');
        $component = $this->catalog[$type] ?? throw AbilityException::invalid(__('Unknown or unavailable component: :type', ['type' => $type]));
        try {
            $props = Validator::validate((array) ($node['props'] ?? []), $component['props']);
        } catch (\Cms\Support\Schema\SchemaException $e) {
            throw AbilityException::invalid($type.': '.$e->getMessage(), $e->errors);
        }
        $props = $this->actions($props, $user, $depth);

        $children = [];
        foreach ((array) ($node['children'] ?? []) as $child) {
            if (! $component['children']) {
                throw AbilityException::invalid(__('This component does not accept children: :type', ['type' => $type]));
            }
            if (is_array($child) && ($resolved = $this->node($child, $user, $depth + 1)) !== null) {
                $children[] = $resolved;
            }
        }

        return ['type' => $type, 'props' => $props, ...($children ? ['children' => $children] : [])];
    }

    /** Actions the user may not take are left out: a button that would only fail is no button. A dialog's nodes are checked like the view's. */
    private function actions(array $props, User $user, int $depth): array
    {
        // A switch column's action, like any other: without the right to it, the column is read-only.
        if (isset($props['columns']) && is_array($props['columns'])) {
            foreach ($props['columns'] as $i => $column) {
                if (is_array($column['action'] ?? null) && $this->action($column['action'], $user, $depth) === null) {
                    unset($props['columns'][$i]['action']);
                }
            }
        }

        foreach (['actions', 'items', 'bulk'] as $key) {
            if (isset($props[$key]) && is_array($props[$key]) && array_is_list($props[$key]) && is_array($props[$key][0] ?? null) && self::isAction($props[$key][0])) {
                $props[$key] = array_values(array_filter(array_map(fn ($a) => $this->action($a, $user, $depth), $props[$key])));
            }
        }

        if (isset($props['empty']['action']) && is_array($props['empty']['action'])) {
            $action = $this->action($props['empty']['action'], $user, $depth);
            if ($action === null) unset($props['empty']['action']); else $props['empty']['action'] = $action;
        }

        // A tree's reordering and the rows under a list are actions like the rest.
        if (is_array($props['tree']['reorder'] ?? null) && $this->action($props['tree']['reorder'], $user, $depth) === null) {
            unset($props['tree']['reorder']);
        }
        if (isset($props['appendix']) && is_array($props['appendix'])) {
            $props['appendix'] = $this->actions($props['appendix'], $user, $depth);
        }

        foreach (['open', 'action'] as $key) {
            if (isset($props[$key]) && is_array($props[$key])) {
                $action = $this->action($props[$key], $user, $depth);
                if ($action === null) unset($props[$key]); else $props[$key] = $action;
            }
        }

        return $props;
    }

    private static function isAction(array $value): bool
    {
        return isset($value['label']) && array_intersect_key($value, array_flip(['ability', 'to', 'href', 'dialog', 'component', 'copy'])) !== [];
    }

    private function action(array $action, User $user, int $depth): ?array
    {
        if (isset($action['can']) && ! $this->may($action['can'], $user)) {
            return null;
        }

        if (isset($action['ability']) && ! isset($this->abilities[(string) $action['ability']])) {
            return null;
        }

        if (isset($action['dialog'])) {
            $action['dialog']['body'] = array_values(array_filter(array_map(fn ($n) => is_array($n) ? $this->node($n, $user, $depth + 1) : null, $action['dialog']['body'] ?? [])));
            $action['dialog']['actions'] = array_values(array_filter(array_map(fn ($a) => is_array($a) ? $this->action($a, $user, $depth) : null, $action['dialog']['actions'] ?? [])));
        }

        return $action;
    }

    private function may(string|array $permission, User $user): bool
    {
        foreach ((array) $permission as $p) {
            if ($user->hasPermission((string) $p)) {
                return true;
            }
        }

        return false;
    }

    private function allowed(string|Closure|null $permission, User $user): bool
    {
        return match (true) {
            $permission === null => $user->hasPermission('admin.access'),
            $permission instanceof Closure => (bool) $permission($user),
            default => $user->hasPermission($permission),
        };
    }

    /** Words people read, in their language: English is the key. Templates (`{row.name}`) and data stay as they are. */
    private function translate(array $props): array
    {
        $t = $this->cms->app()->make(Translations::class);

        foreach ($props as $key => $value) {
            if (is_string($value) && in_array($key, ['label', 'title', 'text', 'placeholder', 'all', 'confirm', 'success', 'rawLabel', 'empty', 'description', 'instructions'], true) && ! str_starts_with($value, '{')) {
                $props[$key] = $t->label($value);
            } elseif (is_array($value)) {
                $props[$key] = $key === 'fields' ? $t->fields($value) : ($key === 'labels' ? array_map(static fn ($v) => is_string($v) ? $t->label($v) : $v, $value) : $this->translate($value));
            }
        }

        return $props;
    }
}

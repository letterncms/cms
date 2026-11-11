<?php

declare(strict_types=1);

namespace Cms\Modules\Dashboard;

use Cms\Admin\Arranged;
use Cms\Admin\Arrangement;
use Cms\Users\User;

/**
 * The Dashboard: widgets registered by modules and plugins, in a main and a
 * side column. Everyone arranges their own (the `dashboard` user preference);
 * until they do, they see the site's default (the `dashboard` value of the
 * `admin` settings), and without one the registrations: widgets that are
 * `enabled` in their column, every other one in the gallery.
 */
final class Dashboard extends Arranged
{
    public const string PREFERENCE = 'dashboard';

    public function key(): string
    {
        return 'dashboard';
    }

    public function arrangement(): Arrangement
    {
        $widgets = $this->cms->admin()->widgets();
        uasort($widgets, static fn ($a, $b) => [$a['order'], $a['label']] <=> [$b['order'], $b['label']]);

        return new Arrangement(
            ['main' => ['id' => 'main', 'label' => 'Main Column', 'order' => 0], 'side' => ['id' => 'side', 'label' => 'Side Column', 'order' => 1]],
            array_map(static fn ($w) => [...$w, 'group' => $w['column'], 'hidden' => ! $w['enabled']], $widgets),
            fixed: true,
        );
    }

    public function catalog(): array
    {
        return array_map(static fn ($w) => ['id' => $w['id'], 'label' => $w['label'], 'icon' => $w['icon'], 'description' => $w['description']], $this->cms->admin()->widgets());
    }

    /** The user's own arrangement, or null when they follow the site's. */
    public function personal(User $user): ?array
    {
        return $this->arrangement()->normalize(($user->preferences ?? [])[self::PREFERENCE] ?? null);
    }

    /**
     * The widgets this user may see — for the gallery too — and how they are arranged.
     *
     * @return array{widgets: list<array>, dashboard: list<array{id: string, label: string, items: list<string>}>, home: array}
     */
    public function forUser(User $user): array
    {
        $personal = $this->personal($user);
        $layout = $this->arrangement()->resolve($personal ?? $this->saved());
        $widgets = $this->cms->admin()->widgetsForUser($user);
        $visible = static fn (array $ids) => array_values(array_filter($ids, static fn ($id) => isset($widgets[$id])));
        $hidden = array_flip($layout['hidden']);

        $sections = array_map(static fn ($column) => [...$column, 'items' => $visible($column['items'])], $layout['sections']);
        $home = ['layout' => ['sections' => $sections, 'hidden' => $visible($layout['hidden'])], 'personal' => $personal !== null];

        return [
            'widgets' => $this->cms->admin()->widgetCatalog($user),
            'dashboard' => array_map(static fn ($column) => [...$column, 'items' => array_values(array_filter($column['items'], static fn ($id) => ! isset($hidden[$id])))], $sections),
            'home' => $home,
        ];
    }
}

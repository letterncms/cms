<?php

declare(strict_types=1);

namespace Cms\Admin;

use Cms\Users\User;

/**
 * The admin sidebar. It has two states, both drawn from registered sections
 * and items (one per collection and one per settings page too):
 *
 * - the main sidebar: items people pin, in the order they put them, section
 *   by section; everything else is under More. Everyone pins their own (the
 *   `sidebar` user preference); until they do, they see the site's default
 *   (the `sidebar` value of the `admin` settings), and without one the
 *   registrations — items registered as `pinned`.
 * - the settings sidebar: the items of `settings` sections, in registered
 *   order. Settings are a place to visit, not something to arrange.
 */
final class Navigation extends Arranged
{
    public const string PREFERENCE = 'sidebar';

    public function key(): string
    {
        return 'sidebar';
    }

    /**
     * Every item in default order: registered ones, and those modules add for
     * things that come and go (`admin.nav` filter — one per collection, one per settings page).
     *
     * @return array<string, array>
     */
    public function items(): array
    {
        $defaults = ['icon' => 'circle', 'section' => 'content', 'order' => 50, 'pinned' => false, 'shortcut' => null, 'permission' => null, 'visible' => null, 'badge' => null];
        $items = array_map(static fn (array $item) => [...$defaults, ...$item], (array) $this->cms->hooks()->filter('admin.nav', $this->cms->admin()->navItems()));

        uasort($items, static fn ($a, $b) => [$a['order'], $a['label']] <=> [$b['order'], $b['label']]);

        return $items;
    }

    public function arrangement(): Arrangement
    {
        $sections = array_filter($this->cms->admin()->sections(), static fn ($s) => ! $s['settings']);
        $items = array_filter($this->items(), fn ($i) => ! $this->inSettings($i));

        return new Arrangement($sections, array_map(static fn ($i) => [...$i, 'group' => $i['section'], 'hidden' => ! $i['pinned']], $items), fixed: true);
    }

    /** The user's own sidebar, or null when they follow the site's. */
    public function personal(User $user): ?array
    {
        return $this->arrangement()->normalize(($user->preferences ?? [])[self::PREFERENCE] ?? null);
    }

    /**
     * The sidebar for one user. `nav` is every item they may open (the command
     * palette offers them all); `sidebar` arranges those of the main sidebar
     * (hidden = under More) and says whether it is their own; `settingsNav`
     * lists the settings sidebar's sections.
     *
     * @return array{nav: list<array>, sidebar: array{sections: list<array>, hidden: list<string>, personal: bool}, settingsNav: list<array{id: string, label: string, items: list<string>}>}
     */
    public function forUser(User $user): array
    {
        $personal = $this->personal($user);
        $layout = $this->arrangement()->resolve($personal ?? $this->saved());
        $items = $this->items();
        $may = static fn (array $item) => ($item['permission'] === null || $user->hasPermission($item['permission'], any: true))
            && ($item['visible'] === null || ($item['visible'])($user));
        $nav = [];
        $sections = [];

        foreach ($layout['sections'] as $section) {
            $ids = [];

            foreach ($section['items'] as $id) {
                if ($may($items[$id])) {
                    $nav[$id] = $this->present($items[$id]);
                    $ids[] = $id;
                }
            }

            $sections[] = [...$section, 'items' => $ids];
        }

        $settings = [];

        foreach ($this->settingsSections() as $section) {
            $ids = [];

            foreach ($items as $id => $item) {
                if ($item['section'] === $section['id'] && $may($item)) {
                    $nav[$id] = $this->present($item);
                    $ids[] = $id;
                }
            }

            if ($ids !== []) {
                $settings[] = ['id' => $section['id'], 'label' => $section['label'], 'items' => $ids];
            }
        }

        return [
            'nav' => array_values($nav),
            'sidebar' => [
                'sections' => array_values(array_filter($sections, static fn ($s) => $s['items'] !== [])),
                'hidden' => array_values(array_filter($layout['hidden'], static fn ($id) => isset($nav[$id]))),
                'personal' => $personal !== null,
            ],
            'settingsNav' => $settings,
        ];
    }

    /** Items of the main sidebar, for the arrangement ability. */
    public function catalog(): array
    {
        return array_map(fn ($item) => $this->present($item, badge: false), array_filter($this->items(), fn ($i) => ! $this->inSettings($i)));
    }

    /** @return list<array{id: string, label: string, order: int, settings: bool}> */
    private function settingsSections(): array
    {
        $sections = array_filter($this->cms->admin()->sections(), static fn ($s) => $s['settings']);
        uasort($sections, static fn ($a, $b) => [$a['order'], $a['label']] <=> [$b['order'], $b['label']]);

        return array_values($sections);
    }

    private function inSettings(array $item): bool
    {
        return $this->cms->admin()->sections()[$item['section']]['settings'] ?? false;
    }

    private function present(array $item, bool $badge = true): array
    {
        $value = null;

        if ($badge && is_callable($item['badge'])) {
            try {
                $value = ($item['badge'])();
            } catch (\Throwable) {
                $value = null;
            }
        }

        return ['id' => $item['id'], 'label' => $item['label'], 'path' => $item['path'], 'icon' => $item['icon'], 'section' => $item['section'], 'shortcut' => $item['shortcut'], 'badge' => $value, 'command' => $item['command'] ?? null];
    }
}

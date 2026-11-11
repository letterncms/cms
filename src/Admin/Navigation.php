<?php

declare(strict_types=1);

namespace Cms\Admin;

use Cms\Users\User;

/**
 * The admin sidebar. It has two states, both drawn from registered sections
 * and items (one per collection and one per settings page too):
 *
 * - the main sidebar: every item, section by section, in the order people
 *   put them; what someone unpins waits under More. Everyone arranges their
 *   own (the `sidebar` user preference); until they do, they see the site's
 *   default (the `sidebar` value of the `admin` settings), and without one the
 *   registrations, where nothing is put away unless registered `pinned: false`.
 * - the settings sidebar: the items of `settings` sections, in registered
 *   order. Settings are a place to visit, not something to arrange. The core's
 *   modules name their section; whatever a plugin puts there (its settings
 *   page, or a screen that lives in settings) is listed under Plugins, by the
 *   plugin's name, so no plugin makes a group of its own or slips into the core's.
 *   Unnamed sections are one group at the top, which a group of one joins.
 *
 * An item with a `home` (another item's id) belongs to that screen, like a
 * plugin's settings page to the plugin's screen (its Settings tab), and is there
 * when its home is. It is in neither sidebar: settings have one home, and what
 * has a screen of its own keeps them there. The settings sidebar lists what has
 * no screen.
 */
final class Navigation extends Arranged
{
    public const string PREFERENCE = 'sidebar';

    /** The settings sidebar's section for what plugins put there. */
    public const string PLUGINS = 'plugins';

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
        $defaults = ['icon' => 'circle', 'section' => 'content', 'order' => 50, 'pinned' => true, 'shortcut' => null, 'permission' => null, 'visible' => null, 'badge' => null, 'home' => null];
        $items = array_map(static fn (array $item) => [...$defaults, ...$item], (array) $this->cms->hooks()->filter('admin.nav', $this->cms->admin()->navItems()));

        foreach ($items as $id => $item) {
            if ($this->inSettings($item) && $this->fromPlugin($item)) {
                $items[$id]['section'] = self::PLUGINS;
            }
        }

        uasort($items, static fn ($a, $b) => [$a['order'], $a['label']] <=> [$b['order'], $b['label']]);

        return $items;
    }

    public function arrangement(): Arrangement
    {
        $sections = array_filter($this->cms->admin()->sections(), static fn ($s) => ! $s['settings']);
        $items = array_filter($this->items(), fn ($i) => $i['home'] === null && ! $this->inSettings($i));

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
                if ($item['section'] === $section['id'] && $item['home'] === null && $may($item)) {
                    $nav[$id] = $this->present($item);
                    $ids[] = $id;
                }
            }

            // Plugins are found by their name.
            if ($section['id'] === self::PLUGINS) {
                usort($ids, static fn ($a, $b) => strnatcasecmp($items[$a]['label'], $items[$b]['label']));
            }

            if ($ids !== []) {
                $settings[] = ['id' => $section['id'], 'label' => $section['label'], 'items' => $ids];
            }
        }

        $settings = $this->ungroupSingles($settings);

        // What belongs to a screen comes with it.
        foreach ($items as $id => $item) {
            if ($item['home'] !== null && isset($nav[$item['home']]) && $may($item)) {
                $nav[$id] = $this->present($item);
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
        return array_map(fn ($item) => $this->present($item, badge: false), array_filter($this->items(), fn ($i) => $i['home'] === null && ! $this->inSettings($i)));
    }

    /** @return list<array{id: string, label: string, order: int, settings: bool}> */
    private function settingsSections(): array
    {
        $sections = array_filter($this->cms->admin()->sections(), static fn ($s) => $s['settings']);
        uasort($sections, static fn ($a, $b) => [$a['order'], $a['label']] <=> [$b['order'], $b['label']]);

        return array_values($sections);
    }

    /**
     * The sections without a name come first, as one group, and a group of one is no group:
     * its row joins them.
     *
     * @param  list<array{id: string, label: string, items: list<string>}>  $sections
     * @return list<array{id: string, label: string, items: list<string>}>
     */
    private function ungroupSingles(array $sections): array
    {
        $grouped = [];
        $top = null;

        foreach ($sections as $section) {
            if ($section['label'] !== '' && count($section['items']) > 1) {
                $grouped[] = $section;
            } elseif ($top === null) {
                $top = [...$section, 'label' => ''];
            } else {
                $top['items'] = [...$top['items'], ...$section['items']];
            }
        }

        return $top === null ? $grouped : [$top, ...$grouped];
    }

    private function inSettings(array $item): bool
    {
        return $this->cms->admin()->sections()[$item['section']]['settings'] ?? false;
    }

    /** Added by a plugin, not by the kernel or one of its modules. */
    private function fromPlugin(array $item): bool
    {
        $package = $item['package'] ?? null;

        return is_string($package) && $this->cms->packages()->repository()->find($package)?->core === false;
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

        return ['id' => $item['id'], 'label' => $item['label'], 'path' => $item['path'], 'icon' => $item['icon'], 'section' => $item['section'], 'shortcut' => $item['shortcut'], 'badge' => $value, 'home' => $item['home'], 'package' => $item['package'] ?? null];
    }
}

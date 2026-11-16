<?php

declare(strict_types=1);

namespace Cms\Admin;

use Cms\Users\User;

/**
 * The admin sidebar, drawn from registered sections and items (one per
 * collection and one per settings page too). It has two kinds of state:
 *
 * - the main sidebar: where the work starts, the same for everyone (the home
 *   screens and a row into each room, the `main` section), then Pinned: what
 *   is listed there (the `pinned` section: the files, what every page shares)
 *   and the screens of the rooms someone keeps a click away, in the order they
 *   put them. Everyone pins their own (the `sidebar` user preference); until
 *   they do, they see the site's default (the `sidebar` value of the `admin`
 *   settings), and without one the `pinned` section and the rooms' screens
 *   registered `pinned: true` (the pages). What is unpinned is a search away.
 * - a room (the content, the design, the structure, settings): its sections' items in registered
 *   order, while one of them is on view; each of them but a settings page can be pinned. One with a
 *   door has a row in the main sidebar that leads to its first screen. The
 *   core's modules name their section of settings; whatever a plugin puts there
 *   (its settings page, or a screen that lives in settings) is listed under
 *   Plugins, by the plugin's name, so no plugin makes a group of its own or
 *   slips into the core's. In every room, unnamed sections are one group at the
 *   top, which a group of one joins; the content's are its types, each named.
 *
 * An item with a `home` (another item's id) belongs to that screen, like a
 * plugin's settings page to the plugin's screen (its Settings tab), and is there
 * when its home is. It is in no sidebar: settings have one home, and what
 * has a screen of its own keeps them there.
 */
final class Navigation extends Arranged
{
    public const string PREFERENCE = 'sidebar';

    /** The room of settings, opened beside who is signed in. */
    public const string SETTINGS = 'settings';

    /** The settings' section for what plugins put there. */
    public const string PLUGINS = 'plugins';

    /** The main sidebar's own rows: the home screens and the rooms' doors. */
    public const string MAIN = 'main';

    /** The main sidebar's group of what is pinned. */
    public const string PINNED = 'pinned';

    public function key(): string
    {
        return 'sidebar';
    }

    /**
     * Every item in default order: registered ones, those modules add for
     * things that come and go (`admin.nav` filter — one per collection, one per
     * settings page), and the door of each room that has one (`room`).
     *
     * @return array<string, array>
     */
    public function items(): array
    {
        $defaults = ['icon' => 'circle', 'section' => self::PINNED, 'order' => 50, 'pinned' => null, 'shortcut' => null, 'permission' => null, 'visible' => null, 'badge' => null, 'home' => null, 'room' => null];
        $items = array_map(static fn (array $item) => [...$defaults, ...$item], (array) $this->cms->hooks()->filter('admin.nav', $this->cms->admin()->navItems()));

        foreach ($items as $id => $item) {
            if ($this->roomOf($item) === self::SETTINGS && $this->fromPlugin($item)) {
                $items[$id]['section'] = self::PLUGINS;
            }
        }

        foreach ($this->cms->admin()->rooms() as $room) {
            if ($room['section'] !== null) {
                $items[$room['id']] = [...$defaults, 'id' => $room['id'], 'label' => $room['label'], 'path' => '', 'icon' => $room['icon'], 'section' => $room['section'], 'order' => $room['order'], 'room' => $room['id'], 'package' => null];
            }
        }

        uasort($items, static fn ($a, $b) => [$a['order'], $a['label']] <=> [$b['order'], $b['label']]);

        return $items;
    }

    /**
     * Two groups: the main sidebar's own rows, always there, and Pinned, which holds the screens listed as pinned
     * and every screen of a room but settings, those not pinned hidden. A screen listed as pinned with `pinned: false`
     * (the site's code, the store) starts under More.
     */
    public function arrangement(): Arrangement
    {
        $groups = [
            self::MAIN => ['id' => self::MAIN, 'label' => '', 'order' => 0],
            self::PINNED => ['id' => self::PINNED, 'label' => __('Pinned'), 'order' => 10],
        ];
        // Settings are set up once: a place to visit, never pinned.
        $items = array_filter($this->items(), fn ($i) => $i['home'] === null && $this->roomOf($i) !== self::SETTINGS);

        // A screen listed as pinned is pinned until someone unpins it; a room's screen once someone pins it.
        return new Arrangement($groups, array_map(fn ($i) => match (true) {
            $i['section'] === self::PINNED => [...$i, 'group' => self::PINNED, 'hidden' => $i['pinned'] === false],
            $this->roomOf($i) === null => [...$i, 'group' => self::MAIN, 'hidden' => false],
            default => [...$i, 'group' => self::PINNED, 'hidden' => $i['pinned'] !== true],
        }, $items), fixed: true);
    }

    /** The user's own sidebar, or null when they follow the site's. */
    public function personal(User $user): ?array
    {
        return $this->arrangement()->normalize(($user->preferences ?? [])[self::PREFERENCE] ?? null);
    }

    /**
     * The sidebar for one user. `nav` is every item they may open (the command
     * palette offers them all); `sidebar` arranges those of the main sidebar
     * (hidden = under More) and says whether it is their own; `rooms` lists each
     * room they may enter, with its sections. A door leads to its room's first
     * screen, and is there only when the room has one for them.
     *
     * @return array{nav: list<array>, sidebar: array{sections: list<array>, hidden: list<string>, personal: bool}, rooms: list<array{id: string, label: string, icon: string, path: string, sections: list<array{id: string, label: string, items: list<string>}>}>}
     */
    public function forUser(User $user): array
    {
        $personal = $this->personal($user);
        $layout = $this->arrangement()->resolve($personal ?? $this->saved());
        $items = $this->items();
        $may = static fn (array $item) => ($item['permission'] === null || $user->hasPermission($item['permission'], any: true))
            && ($item['visible'] === null || ($item['visible'])($user));
        $rooms = $this->rooms($items, $may);
        $homes = array_column($rooms, 'path', 'id');
        $nav = [];
        $sections = [];

        foreach ($layout['sections'] as $section) {
            $ids = [];

            foreach ($section['items'] as $id) {
                $item = $items[$id];

                if ($item['room'] !== null) {
                    $item['path'] = $homes[$item['room']] ?? null;
                }

                // The main sidebar's own rows are always there; what can be pinned only while it is, and opened from anywhere else meanwhile.
                if ($may($item) && ($item['room'] === null || $item['path'] !== null)) {
                    $nav[$id] = $this->present($item);

                    if ($section['id'] !== self::PINNED || ! in_array($id, $layout['hidden'], true)) {
                        $ids[] = $id;
                    }
                }
            }

            $sections[] = [...$section, 'items' => $ids];
        }

        foreach ($rooms as $room) {
            foreach ($room['sections'] as $section) {
                foreach ($section['items'] as $id) {
                    $nav[$id] = $this->present($items[$id]);
                }
            }
        }

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
            'rooms' => $rooms,
        ];
    }

    /** Items of the main sidebar and those that can be pinned to it, for the arrangement ability. */
    public function catalog(): array
    {
        return array_map(fn ($item) => $this->present($item, badge: false), array_filter($this->items(), fn ($i) => $i['home'] === null && $this->roomOf($i) !== self::SETTINGS));
    }

    /**
     * The rooms with something in them for this person, each with its sections in order and where it opens.
     *
     * @param  array<string, array>  $items
     * @return list<array{id: string, label: string, icon: string, path: string, sections: list<array{id: string, label: string, items: list<string>}>}>
     */
    private function rooms(array $items, \Closure $may): array
    {
        $sections = $this->cms->admin()->sections();
        uasort($sections, static fn ($a, $b) => [$a['order'], $a['label']] <=> [$b['order'], $b['label']]);
        $rooms = [];

        foreach ($this->cms->admin()->rooms() as $room) {
            $listed = [];

            foreach ($sections as $section) {
                if ($section['room'] !== $room['id']) {
                    continue;
                }

                $ids = array_keys(array_filter($items, static fn (array $item) => $item['section'] === $section['id'] && $item['home'] === null && $may($item)));

                // Plugins are found by their name.
                if ($section['id'] === self::PLUGINS) {
                    usort($ids, static fn ($a, $b) => strnatcasecmp($items[$a]['label'], $items[$b]['label']));
                }

                if ($ids !== []) {
                    $listed[] = ['id' => $section['id'], 'label' => $section['label'], 'items' => $ids];
                }
            }

            if ($listed !== []) {
                $rooms[] = ['id' => $room['id'], 'label' => $room['label'], 'icon' => $room['icon'], 'path' => $room['path'] ?? $items[$listed[0]['items'][0]]['path'], 'sections' => $this->ungroupSingles($listed)];
            }
        }

        return $rooms;
    }

    /**
     * The sections without a name come first, as one group, and a group of one is no group beside them:
     * its row joins them. In a room whose sections all have a name (the content's types), each keeps it.
     *
     * @param  list<array{id: string, label: string, items: list<string>}>  $sections
     * @return list<array{id: string, label: string, items: list<string>}>
     */
    private function ungroupSingles(array $sections): array
    {
        $grouped = [];
        $top = null;
        $unnamed = in_array('', array_column($sections, 'label'), true);

        foreach ($sections as $section) {
            if ($section['label'] !== '' && (count($section['items']) > 1 || ! $unnamed)) {
                $grouped[] = $section;
            } elseif ($top === null) {
                $top = [...$section, 'label' => ''];
            } else {
                $top['items'] = [...$top['items'], ...$section['items']];
            }
        }

        return $top === null ? $grouped : [$top, ...$grouped];
    }

    /** The room an item is listed in, if any. */
    private function roomOf(array $item): ?string
    {
        return $this->cms->admin()->sections()[$item['section']]['room'] ?? null;
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

        return ['id' => $item['id'], 'label' => $item['label'], 'path' => $item['path'], 'icon' => $item['icon'], 'section' => $item['section'], 'shortcut' => $item['shortcut'], 'badge' => $value, 'home' => $item['home'], 'room' => $item['room'], 'package' => $item['package'] ?? null];
    }
}

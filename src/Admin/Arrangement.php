<?php

declare(strict_types=1);

namespace Cms\Admin;

/**
 * Registered items in registered groups, as an admin arranged them — the
 * sidebar (items in sections) and the dashboard (widgets in columns).
 *
 *   { sections: [{ id, label, items: [item ids] }], hidden: [item ids] }
 *
 * Registrations are the defaults. Items an arrangement does not mention land
 * in their default group (hidden when the item says so — the dashboard's
 * widgets that are off by default); ids it mentions that no longer exist are skipped
 * when resolving and kept when saving, so a plugin turned back on returns to
 * its place. With `fixed` groups admins move items but cannot add, rename or
 * remove groups (the dashboard's columns).
 */
final class Arrangement
{
    private const string ID = '/^[a-z0-9][a-z0-9_.-]{0,63}$/';

    /**
     * @param  array<string, array{id: string, label: string, order: int}>  $groups
     * @param  array<string, array{id: string, label: string, group: string, order: int, hidden?: bool}>  $items  in default order
     */
    public function __construct(private readonly array $groups, private readonly array $items, private readonly bool $fixed = false) {}

    /** Whether admins may add, rename and remove groups. */
    public function fixed(): bool
    {
        return $this->fixed;
    }

    /** What the registrations describe. */
    public function defaults(): array
    {
        $groups = $this->groups;

        foreach ($this->items as $item) {
            // An item may name a group nobody registered: it gets one of its own.
            $groups[$item['group']] ??= ['id' => $item['group'], 'label' => ucfirst($item['group']), 'order' => 50];
            $groups[$item['group']]['items'][] = $item['id'];
        }

        uasort($groups, static fn ($a, $b) => [$a['order'], $a['label']] <=> [$b['order'], $b['label']]);

        return [
            'sections' => array_values(array_map(static fn ($g) => ['id' => $g['id'], 'label' => $g['label'], 'items' => $g['items'] ?? []], $groups)),
            'hidden' => $this->hiddenByDefault(array_keys($this->items)),
        ];
    }

    /** Every existing item placed exactly once; null means the defaults. */
    public function resolve(?array $layout): array
    {
        $defaults = $this->defaults();

        if ($layout === null) {
            return $defaults;
        }

        $placed = [];
        $sections = [];

        foreach ($layout['sections'] ?? [] as $section) {
            $ids = [];

            foreach ($section['items'] ?? [] as $id) {
                if (isset($this->items[$id]) && ! isset($placed[$id])) {
                    $placed[$id] = true;
                    $ids[] = $id;
                }
            }

            $sections[] = ['id' => $section['id'], 'label' => $section['label'], 'items' => $ids];
        }

        foreach ($defaults['sections'] as $index => $default) {
            $new = array_values(array_filter($default['items'], static fn ($id) => ! isset($placed[$id])));
            $at = array_search($default['id'], array_column($sections, 'id'), true);

            // Fixed groups are always there; others only when they have something new to show.
            if ($at === false && ($new !== [] || $this->fixed)) {
                $sections = $this->insertAfterPredecessor($sections, ['id' => $default['id'], 'label' => $default['label'], 'items' => []], array_slice(array_column($defaults['sections'], 'id'), 0, $index));
                $at = array_search($default['id'], array_column($sections, 'id'), true);
            }

            if ($at !== false) {
                array_push($sections[$at]['items'], ...$new);
            }
        }

        $unplaced = array_diff(array_keys($this->items), array_keys($placed));

        return [
            'sections' => $sections,
            'hidden' => array_values(array_unique([...array_filter($layout['hidden'] ?? [], fn ($id) => isset($this->items[$id])), ...$this->hiddenByDefault($unplaced)])),
        ];
    }

    /** @param  list<string>  $ids  @return list<string> those of them registered as hidden by default */
    private function hiddenByDefault(array $ids): array
    {
        return array_values(array_filter($ids, fn ($id) => ! empty($this->items[$id]['hidden'])));
    }

    /**
     * Clean an arrangement before it is stored (or after reading a hand-edited
     * one). Ids that do not exist right now but were placed in $previous keep
     * their place.
     */
    public function normalize(mixed $layout, ?array $previous = null): ?array
    {
        if (! is_array($layout) || ! is_array($layout['sections'] ?? null)) {
            return null;
        }

        $sections = [];
        $seen = [];

        foreach ($layout['sections'] as $section) {
            $id = is_array($section) ? (string) ($section['id'] ?? '') : '';

            if (! preg_match(self::ID, $id) || isset($sections[$id]) || ($this->fixed && ! isset($this->groups[$id]))) {
                continue;
            }

            $ids = [];

            foreach ((array) ($section['items'] ?? []) as $item) {
                if (is_string($item) && preg_match(self::ID, $item) && ! isset($seen[$item])) {
                    $seen[$item] = true;
                    $ids[] = $item;
                }
            }

            $label = $this->fixed ? $this->groups[$id]['label'] : trim(preg_replace('/\s+/', ' ', (string) ($section['label'] ?? '')));
            $sections[$id] = ['id' => $id, 'label' => mb_substr($label, 0, 60), 'items' => $ids];
        }

        $hidden = array_filter((array) ($layout['hidden'] ?? []), static fn ($id) => is_string($id) && isset($seen[$id]));

        foreach ((array) ($previous['sections'] ?? []) as $section) {
            if (! isset($sections[$section['id'] ?? null])) {
                continue;
            }

            foreach ((array) ($section['items'] ?? []) as $item) {
                if (is_string($item) && ! isset($this->items[$item]) && ! isset($seen[$item])) {
                    $seen[$item] = true;
                    $sections[$section['id']]['items'][] = $item;

                    if (in_array($item, (array) ($previous['hidden'] ?? []), true)) {
                        $hidden[] = $item;
                    }
                }
            }
        }

        return ['sections' => array_values($sections), 'hidden' => array_values(array_unique($hidden))];
    }

    /** Insert a section after the nearest of its default predecessors that is present, or first. */
    private function insertAfterPredecessor(array $sections, array $section, array $predecessors): array
    {
        $ids = array_column($sections, 'id');

        foreach (array_reverse($predecessors) as $before) {
            $at = array_search($before, $ids, true);

            if ($at !== false) {
                array_splice($sections, $at + 1, 0, [$section]);

                return $sections;
            }
        }

        array_unshift($sections, $section);

        return $sections;
    }
}

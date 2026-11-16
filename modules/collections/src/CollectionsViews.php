<?php

declare(strict_types=1);

namespace Cms\Modules\Collections;

use Cms\Admin\Views;
use Cms\Cms;
use Cms\Content\Collections\Collection;
use Cms\Users\User;

/**
 * Collections as data, one list for each kind (Collection::KINDS): the collections of entries, the taxonomies
 * (categories and tags) other entries are filed under, the globals and the menus. All are collections with a
 * type, and each is edited in the same blueprint editor (`collections/blueprint`); changing between entries,
 * categories and tags moves one to the other list. A new one is made in its dialog (`collections/new`), which
 * makes the list's kind.
 */
final class CollectionsViews
{
    public static function register(Cms $cms): void
    {
        $kind = ['type' => 'string', 'enum' => array_keys(Collection::KINDS)];
        $admin = $cms->admin();
        $admin->component('collections/new', ['label' => 'New Collection', 'description' => 'Make a collection of entries, a taxonomy, a global or a menu: its name and how it is kept, and for entries and taxonomies its structure, type and address.', 'surface' => false, 'permission' => 'collections.manage', 'props' => [
            'type' => 'object', 'additionalProperties' => false, 'properties' => ['kind' => $kind],
        ]]);
        $admin->component('collections/blueprint', ['label' => 'Collection Fields', 'description' => 'The fields and settings of one collection, taxonomy, global or menu, in the blueprint editor.', 'surface' => false, 'permission' => 'collections.manage', 'props' => [
            'type' => 'object', 'additionalProperties' => false, 'required' => ['handle'], 'properties' => ['handle' => ['type' => 'string', 'maxLength' => 64], 'kind' => $kind],
        ]]);

        $views = $cms->views();

        foreach (array_keys(Collection::KINDS) as $path) {
            $views->register($path, "/{$path}", static fn () => self::list($cms, $path), permission: 'collections.manage');
            // From / in a thread: the list with the new-collection dialog open. Closing it leaves the list.
            $views->register("{$path}-new", "/{$path}/new", static fn () => self::list($cms, $path, ['type' => 'collections/new', 'props' => ['kind' => $path]]), permission: 'collections.manage');
            $views->register("{$path}-collection", "/{$path}/:handle", static fn (User $user, array $params) => self::collection($cms, (string) ($params['handle'] ?? ''), $path), permission: 'collections.manage');
        }
    }

    /** What each kind's list is called, and what its rows are made of. */
    public static function labels(string $kind): array
    {
        return match ($kind) {
            'taxonomies' => ['title' => __('Taxonomies'), 'icon' => 'tag', 'new' => __('New Taxonomy'), 'empty' => __('No taxonomies yet'), 'open' => __('Open Terms')],
            'globals' => ['title' => __('Globals'), 'icon' => 'globe', 'new' => __('New Global'), 'empty' => __('No globals yet'), 'open' => __('Edit Values')],
            'menus' => ['title' => __('Menus'), 'icon' => 'list-tree', 'new' => __('New Menu'), 'empty' => __('No menus yet'), 'open' => __('Open Links')],
            default => ['title' => __('Collections'), 'icon' => 'collection', 'new' => __('New Collection'), 'empty' => __('No collections yet'), 'open' => __('Open Entries')],
        };
    }

    private static function list(Cms $cms, string $kind, ?array $open = null): array
    {
        $labels = self::labels($kind);
        $new = ['label' => $labels['new'], 'icon' => 'plus', 'variant' => 'primary', 'component' => 'collections/new', 'props' => ['kind' => $kind]];
        // With none yet, the way to make one is in the middle of the page, not twice.
        $any = array_filter($cms->collections()->all(), static fn ($c) => ! $c->system && $c->kind() === $kind) !== [];
        $count = static fn (string $label, string $one, string $other) => ['key' => 'count', 'label' => $label, 'width' => '90px', 'align' => 'end', 'format' => 'number', 'unit' => ['one' => $one, 'other' => $other]];

        return ['type' => 'ui/page', 'props' => ['title' => $labels['title'], 'icon' => $labels['icon'], 'actions' => $any ? [$new] : []], 'children' => [
            ['type' => 'ui/records', 'props' => [
                'id' => $kind, 'label' => $labels['title'], 'key' => 'handle',
                'source' => ['ability' => 'collections/editable', 'input' => ['kind' => $kind]],
                // One fact a row beside its name: what tells it apart from the others of its kind.
                'columns' => [
                    ['key' => 'title', 'label' => __('Name'), 'icon' => 'icon'],
                    ...match ($kind) {
                        'taxonomies' => [
                            ['key' => 'route', 'label' => __('URL'), 'width' => 'minmax(200px,1fr)', 'format' => 'code', 'empty' => __('No URL')],
                            ['key' => 'type', 'label' => __('Type'), 'width' => '120px', 'labels' => ['categories' => __('Categories'), 'tags' => __('Tags')]],
                            $count(__('Terms'), __('{count} Term'), __('{count} Terms')),
                        ],
                        'menus' => [$count(__('Links'), __('{count} Link'), __('{count} Links'))],
                        'globals' => [],
                        default => [
                            ['key' => 'route', 'label' => __('URL'), 'width' => 'minmax(200px,1fr)', 'format' => 'code', 'empty' => __('No URL')],
                            ['key' => 'structure', 'label' => __('Structure'), 'width' => '120px', 'labels' => ['list' => __('List'), 'tree' => __('Tree'), 'dated' => __('Dated')]],
                            $count(__('Entries'), __('{count} Entry'), __('{count} Entries')),
                        ],
                    },
                ],
                'open' => ['label' => __('Open'), 'to' => "/{$kind}/{row.handle}"],
                // Deleting stays in the settings, where it says how many entries go with it.
                'actions' => [
                    ['label' => __('Edit Fields'), 'icon' => 'field', 'to' => "/{$kind}/{row.handle}"],
                    // Only for someone who may see its entries.
                    ['label' => $labels['open'], 'icon' => 'arrow-up-right', 'to' => '/content/{row.handle}', 'when' => '{row.viewable}'],
                ],
                'empty' => ['icon' => $labels['icon'], 'title' => $labels['empty'], 'action' => $new],
            ]],
            ...($open ? [$open] : []),
        ]];
    }

    /**
     * A system collection (templates, components, account pages) keeps the schema its code brings: not editable here.
     * One that is listed under another kind is at that kind's address.
     */
    private static function collection(Cms $cms, string $handle, string $kind): array
    {
        $collection = $cms->collections()->find($handle);

        if ($collection === null || $collection->system || $collection->kind() !== $kind) {
            return Views::notFound(self::labels($kind)['icon'], ['to' => "/{$kind}", 'label' => self::labels($kind)['title']]);
        }

        return ['type' => 'collections/blueprint', 'props' => ['handle' => $handle, 'kind' => $kind]];
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\Collections;

use Cms\Admin\Views;
use Cms\Cms;
use Cms\Users\User;

/**
 * Collections as data: the site's own collections, and one collection's fields and settings in the
 * blueprint editor (`collections/blueprint`). A new one is made in its dialog (`collections/new`).
 */
final class CollectionsViews
{
    public static function register(Cms $cms): void
    {
        $none = ['type' => 'object', 'properties' => (object) [], 'additionalProperties' => false];
        $admin = $cms->admin();
        $admin->component('collections/new', ['label' => 'New Collection', 'description' => 'Make a collection: its name, structure, address and storage.', 'surface' => false, 'permission' => 'collections.manage', 'props' => $none]);
        $admin->component('collections/blueprint', ['label' => 'Collection Fields', 'description' => 'The fields and settings of one collection, in the blueprint editor.', 'surface' => false, 'permission' => 'collections.manage', 'props' => [
            'type' => 'object', 'additionalProperties' => false, 'required' => ['handle'], 'properties' => ['handle' => ['type' => 'string', 'maxLength' => 64]],
        ]]);

        $views = $cms->views();
        $views->register('collections', '/collections', static fn () => self::list($cms), permission: 'collections.manage');
        // From / in a thread: the list with the new-collection dialog open. Closing it leaves the list.
        $views->register('collections-new', '/collections/new', static fn () => self::list($cms, ['type' => 'collections/new']), permission: 'collections.manage');
        $views->register('collections-collection', '/collections/:handle', static fn (User $user, array $params) => self::collection($cms, (string) ($params['handle'] ?? '')), permission: 'collections.manage');
    }

    private static function list(Cms $cms, ?array $open = null): array
    {
        $new = ['label' => __('New Collection'), 'icon' => 'plus', 'variant' => 'primary', 'component' => 'collections/new'];
        // With none yet, the way to make one is in the middle of the page, not twice.
        $any = array_filter($cms->collections()->all(), static fn ($c) => ! $c->system) !== [];

        return ['type' => 'ui/page', 'props' => ['title' => __('Collections'), 'icon' => 'collection', 'actions' => $any ? [$new] : []], 'children' => [
            ['type' => 'ui/records', 'props' => [
                'id' => 'collections', 'label' => __('Collections'), 'key' => 'handle',
                'source' => ['ability' => 'collections/editable'],
                'columns' => [
                    ['key' => 'title', 'label' => __('Name'), 'icon' => 'icon'],
                    ['key' => 'route', 'label' => __('URL'), 'width' => 'minmax(200px,1fr)', 'format' => 'code', 'empty' => __('No URL')],
                    ['key' => 'structure', 'label' => __('Structure'), 'width' => '120px', 'labels' => ['list' => __('List'), 'tree' => __('Tree'), 'dated' => __('Dated')]],
                    ['key' => 'count', 'label' => __('Entries'), 'width' => '90px', 'align' => 'end', 'format' => 'number', 'unit' => ['one' => __('{count} Entry'), 'other' => __('{count} Entries')]],
                ],
                'open' => ['label' => __('Open'), 'to' => '/collections/{row.handle}'],
                // A menu in each row, as a global set, a menu and a language have. Deleting stays in the collection's settings, where it says how many entries go with it.
                'actions' => [
                    ['label' => __('Edit Fields'), 'icon' => 'field', 'to' => '/collections/{row.handle}'],
                    // Only for someone who may see that collection's entries.
                    ['label' => __('Open Entries'), 'icon' => 'arrow-up-right', 'to' => '/content/{row.handle}', 'when' => '{row.viewable}'],
                ],
                'empty' => ['icon' => 'collection', 'title' => __('No collections yet')],
            ]],
            ...($open ? [$open] : []),
        ]];
    }

    /** A system collection (templates, components, account pages) keeps the schema its code brings: not editable here. */
    private static function collection(Cms $cms, string $handle): array
    {
        $collection = $cms->collections()->find($handle);

        if ($collection === null || $collection->system) {
            return Views::notFound('collection', ['to' => '/collections', 'label' => __('Collections')]);
        }

        return ['type' => 'collections/blueprint', 'props' => ['handle' => $handle]];
    }
}

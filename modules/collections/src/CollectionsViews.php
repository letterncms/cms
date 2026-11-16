<?php

declare(strict_types=1);

namespace Cms\Modules\Collections;

use Cms\Admin\Views;
use Cms\Cms;
use Cms\Users\User;

/**
 * Collections as data, in two lists: the collections of entries, and the taxonomies (categories and tags) other
 * entries are filed under. Both are collections with a type, and one of either is edited in the same blueprint
 * editor (`collections/blueprint`); changing its type moves it to the other list. A new one is made in its
 * dialog (`collections/new`), which makes the list's kind.
 */
final class CollectionsViews
{
    public static function register(Cms $cms): void
    {
        $none = ['type' => 'object', 'properties' => (object) [], 'additionalProperties' => false];
        $admin = $cms->admin();
        $admin->component('collections/new', ['label' => 'New Collection', 'description' => 'Make a collection of entries or a taxonomy: its name, type, structure, address and storage.', 'surface' => false, 'permission' => 'collections.manage', 'props' => [
            'type' => 'object', 'additionalProperties' => false, 'properties' => ['taxonomy' => ['type' => 'boolean']],
        ]]);
        $admin->component('collections/blueprint', ['label' => 'Collection Fields', 'description' => 'The fields and settings of one collection or taxonomy, in the blueprint editor.', 'surface' => false, 'permission' => 'collections.manage', 'props' => [
            'type' => 'object', 'additionalProperties' => false, 'required' => ['handle'], 'properties' => ['handle' => ['type' => 'string', 'maxLength' => 64], 'taxonomy' => ['type' => 'boolean']],
        ]]);

        $views = $cms->views();

        foreach ([false => 'collections', true => 'taxonomies'] as $taxonomies => $path) {
            $views->register($path, "/{$path}", static fn () => self::list($cms, (bool) $taxonomies), permission: 'collections.manage');
            // From / in a thread: the list with the new-collection dialog open. Closing it leaves the list.
            $views->register("{$path}-new", "/{$path}/new", static fn () => self::list($cms, (bool) $taxonomies, ['type' => 'collections/new', 'props' => ['taxonomy' => (bool) $taxonomies]]), permission: 'collections.manage');
            $views->register("{$path}-collection", "/{$path}/:handle", static fn (User $user, array $params) => self::collection($cms, (string) ($params['handle'] ?? ''), (bool) $taxonomies), permission: 'collections.manage');
        }
    }

    private static function list(Cms $cms, bool $taxonomies, ?array $open = null): array
    {
        $path = $taxonomies ? 'taxonomies' : 'collections';
        $title = $taxonomies ? __('Taxonomies') : __('Collections');
        $new = ['label' => $taxonomies ? __('New Taxonomy') : __('New Collection'), 'icon' => 'plus', 'variant' => 'primary', 'component' => 'collections/new', 'props' => ['taxonomy' => $taxonomies]];
        // With none yet, the way to make one is in the middle of the page, not twice.
        $any = array_filter($cms->collections()->all(), static fn ($c) => ! $c->system && $c->isTaxonomy() === $taxonomies) !== [];

        return ['type' => 'ui/page', 'props' => ['title' => $title, 'icon' => $taxonomies ? 'tag' : 'collection', 'actions' => $any ? [$new] : []], 'children' => [
            ['type' => 'ui/records', 'props' => [
                'id' => $path, 'label' => $title, 'key' => 'handle',
                'source' => ['ability' => 'collections/editable', 'input' => ['taxonomies' => $taxonomies]],
                'columns' => [
                    ['key' => 'title', 'label' => __('Name'), 'icon' => 'icon'],
                    ['key' => 'route', 'label' => __('URL'), 'width' => 'minmax(200px,1fr)', 'format' => 'code', 'empty' => __('No URL')],
                    $taxonomies
                        ? ['key' => 'type', 'label' => __('Type'), 'width' => '120px', 'labels' => ['categories' => __('Categories'), 'tags' => __('Tags')]]
                        : ['key' => 'structure', 'label' => __('Structure'), 'width' => '120px', 'labels' => ['list' => __('List'), 'tree' => __('Tree'), 'dated' => __('Dated')]],
                    $taxonomies
                        ? ['key' => 'count', 'label' => __('Terms'), 'width' => '90px', 'align' => 'end', 'format' => 'number', 'unit' => ['one' => __('{count} Term'), 'other' => __('{count} Terms')]]
                        : ['key' => 'count', 'label' => __('Entries'), 'width' => '90px', 'align' => 'end', 'format' => 'number', 'unit' => ['one' => __('{count} Entry'), 'other' => __('{count} Entries')]],
                ],
                'open' => ['label' => __('Open'), 'to' => "/{$path}/{row.handle}"],
                // A menu in each row, as a global, a menu and a language have. Deleting stays in the settings, where it says how many entries go with it.
                'actions' => [
                    ['label' => __('Edit Fields'), 'icon' => 'field', 'to' => "/{$path}/{row.handle}"],
                    // Only for someone who may see its entries.
                    ['label' => $taxonomies ? __('Open Terms') : __('Open Entries'), 'icon' => 'arrow-up-right', 'to' => '/content/{row.handle}', 'when' => '{row.viewable}'],
                ],
                'empty' => ['icon' => $taxonomies ? 'tag' : 'collection', 'title' => $taxonomies ? __('No taxonomies yet') : __('No collections yet'), 'action' => $new],
            ]],
            ...($open ? [$open] : []),
        ]];
    }

    /**
     * A system collection (templates, components, account pages) keeps the schema its code brings: not editable here.
     * One that is listed under the other kind is at the other address.
     */
    private static function collection(Cms $cms, string $handle, bool $taxonomies): array
    {
        $collection = $cms->collections()->find($handle);

        if ($collection === null || $collection->system || $collection->isTaxonomy() !== $taxonomies) {
            return Views::notFound('collection', $taxonomies ? ['to' => '/taxonomies', 'label' => __('Taxonomies')] : ['to' => '/collections', 'label' => __('Collections')]);
        }

        return ['type' => 'collections/blueprint', 'props' => ['handle' => $handle, 'taxonomy' => $taxonomies]];
    }
}

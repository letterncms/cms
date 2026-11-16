<?php

declare(strict_types=1);

namespace Cms\Modules\Collections;

use Cms\Content\Entries\Entry;
use Cms\Packages\Plugin;

/**
 * Collections and fieldsets edited in the admin. Off, the schema is whatever
 * content/collections/*.yaml says — a site whose structure is fixed in code.
 */
final class CollectionsModule extends Plugin
{
    public function boot(): void
    {
        $cms = $this->cms();

        $cms->permissions()->register('collections.manage', 'Manage Collections and Fields', 'Content');
        $this->app->make(CollectionAbilities::class)->register($cms->abilities());

        // The overview's counts stay cached until an entry of that collection changes.
        foreach (['entry.saved', 'entry.deleted'] as $event) {
            $cms->hooks()->on($event, static fn (Entry $entry) => cache()->forget(CollectionAbilities::overviewKey($entry->collection, $cms->defaultLocale())));
        }

        // One list of each kind of collection, in Structure: the entries' collections, the taxonomies (categories, tags) they
        // are filed under, the globals and the menus. Their entries are in the content room, grouped the same way.
        foreach (['collections' => ['Collections', 'New Collection', ['content type', 'model']], 'taxonomies' => ['Taxonomies', 'New Taxonomy', ['categories', 'tags', 'vocabulary']], 'globals' => ['Globals', 'New Global', ['site-wide', 'settings', 'values']], 'menus' => ['Menus', 'New Menu', ['navigation', 'links', 'header', 'footer']]] as $kind => [$label, $newLabel, $keywords]) {
            $icon = CollectionsViews::labels($kind)['icon'];
            $cms->admin()->nav($kind, ['label' => $label, 'path' => "/{$kind}", 'icon' => $icon, 'section' => 'structure', 'order' => 10 + 2 * array_search($kind, array_keys(\Cms\Content\Collections\Collection::KINDS), true), 'permission' => 'collections.manage']);
            $cms->admin()->command("new-{$kind}", ['label' => $newLabel, 'icon' => 'plus', 'path' => "/{$kind}/new", 'permission' => 'collections.manage', 'keywords' => $keywords]);
        }

        CollectionsViews::register($cms);
        $cms->admin()->widget('collections-overview', ['label' => 'Content Overview', 'description' => 'Every collection with its number of entries and drafts.', 'icon' => 'collection', 'column' => 'side', 'order' => 30]);
        $this->adminModule();
    }
}

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

        $cms->admin()->nav('collections', ['label' => 'Collections', 'path' => '/collections', 'icon' => 'collection', 'section' => 'design', 'order' => 40, 'permission' => 'collections.manage']);
        $cms->admin()->command('new-collection', ['label' => 'New Collection', 'icon' => 'plus', 'path' => '/collections/new', 'permission' => 'collections.manage', 'keywords' => ['content type', 'model']]);
        CollectionsViews::register($cms);
        $cms->admin()->widget('collections-overview', ['label' => 'Content Overview', 'description' => 'Every collection with its number of entries and drafts.', 'icon' => 'collection', 'column' => 'side', 'order' => 30]);
        $this->adminModule();
    }
}

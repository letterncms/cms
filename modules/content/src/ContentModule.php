<?php

declare(strict_types=1);

namespace Cms\Modules\Content;

use Cms\Admin\Translations;
use Cms\Packages\Plugin;
use Cms\Users\User;

/**
 * Entries in every collection. Collections themselves are the kernel's (files
 * in content/collections); this module lists, edits, publishes and searches
 * their entries, and puts one sidebar item per collection.
 */
final class ContentModule extends Plugin
{
    public function boot(): void
    {
        $cms = $this->cms();
        $permissions = $cms->permissions();

        // Once every package is booted: plugins add collections of their own (templates, components).
        $this->app->booted(function () use ($cms, $permissions) {
            foreach ($cms->collections()->all() as $collection) {
                // Grouped by collection, so the labels stay plain words the admin can translate.
                foreach ([
                    ['action' => 'view', 'label' => 'View'],
                    ['action' => 'create', 'label' => 'Create'],
                    ['action' => 'edit', 'label' => 'Edit'],
                    ['action' => 'publish', 'label' => 'Publish'],
                    ['action' => 'delete', 'label' => 'Delete'],
                ] as ['action' => $action, 'label' => $label]) {
                    $permissions->register("entries.{$collection->handle}.{$action}", $label, $collection->title);
                }
            }
        });

        $this->app->make(ContentAbilities::class)->register($cms->abilities());

        $cms->settingsRegistry()->register('content', 'Content', [
            ['handle' => 'per_page', 'type' => 'number', 'label' => 'Entries per Page', 'default' => 50, 'min' => 10, 'max' => 100, 'required' => true, 'width' => 'half'],
            ['handle' => 'autosave', 'type' => 'number', 'label' => 'Autosave After (ms)', 'default' => 1200, 'min' => 0, 'max' => 60000, 'required' => true, 'width' => 'half', 'instructions' => 'Set to 0 to save only with ⌘S.'],
            ['handle' => 'revisions', 'type' => 'number', 'label' => 'Revisions Kept per Entry', 'default' => 100, 'min' => 1, 'max' => 1000, 'required' => true, 'width' => 'half'],
        ], icon: 'file', description: 'Entry lists, the editor and history.', order: 20);

        $cms->hooks()->addFilter('revisions.keep', fn () => (int) $this->settings('revisions', 100));

        // One sidebar item per collection, in the collection's own section; pinned unless it is a system collection (templates, components).
        $cms->hooks()->addFilter('admin.nav', function (array $items) use ($cms) {
            foreach ($cms->collections()->all() as $collection) {
                $items["collection.{$collection->handle}"] ??= [
                    'id' => "collection.{$collection->handle}",
                    'label' => $collection->title,
                    'path' => "/content/{$collection->handle}",
                    'icon' => $collection->icon,
                    'section' => $collection->section,
                    'order' => (int) $collection->get('nav_order', 10),
                    'pinned' => ! $collection->system,
                    'permission' => "entries.{$collection->handle}.view",
                ];
            }

            return $items;
        });

        $cms->hooks()->addFilter('admin.manifest', fn (array $manifest, User $user) => [
            ...$manifest,
            'collections' => $this->collectionsFor($user),
            'config' => [...($manifest['config'] ?? []), 'content' => ['perPage' => (int) $this->settings('per_page', 50), 'autosave' => (int) $this->settings('autosave', 1200)]],
        ]);

        $cms->context()->register('cms://collections', 'Collections', 'Every collection with its fields and JSON schema — use these field handles in entry data.', fn () => array_map(
            static fn ($c) => [...$c->toArray(), 'schema' => $c->blueprint()->schema()],
            array_values($cms->collections()->all())
        ));

        $cms->admin()->widget('recent', ['label' => 'Recently Edited', 'description' => 'Entries you and your team changed last.', 'icon' => 'clock', 'column' => 'main', 'enabled' => true, 'order' => 10]);
        $this->adminModule();
    }

    /** @return list<array> The collections this user may view, with what they may do in each. */
    private function collectionsFor(User $user): array
    {
        $out = [];

        foreach ($this->cms()->collections()->all() as $c) {
            if (! $user->hasPermission("entries.{$c->handle}.view")) {
                continue;
            }

            // Names read like the sidebar's: in the user's language when the dictionaries know them.
            $out[] = [
                'handle' => $c->handle, 'title' => __($c->title), 'singular' => __($c->singular), 'newLabel' => self::newLabel($c->singular), 'icon' => $c->icon,
                'structure' => $c->structure, 'routable' => $c->routable(), 'driver' => $c->driver, 'defaultView' => $c->defaultView,
                'can' => array_combine(['create', 'edit', 'publish', 'delete'], array_map(static fn ($a) => $user->hasPermission("entries.{$c->handle}.{$a}"), ['create', 'edit', 'publish', 'delete'])),
            ];
        }

        return $out;
    }

    /**
     * "New Page" for a collection's create button. Languages agree "new" with the noun
     * (Nieuwe pagina, Nieuw bericht, Nouvel article), so the CMS's own collections have a
     * phrase of their own; any other reads "Pagina toevoegen" / "Ajouter : page".
     */
    private static function newLabel(string $singular): string
    {
        $phrases = ['page' => __('New Page'), 'post' => __('New Post'), 'component' => __('New Component'), 'template' => __('New Template'), 'form' => __('New Form')];

        $item = __($singular);

        return $phrases[strtolower($singular)] ?? __('New :item', ['item' => app(Translations::class)->current() === Translations::SOURCE ? $item : mb_strtolower($item)]);
    }
}

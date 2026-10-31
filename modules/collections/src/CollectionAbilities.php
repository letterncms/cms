<?php

declare(strict_types=1);

namespace Cms\Modules\Collections;

use Illuminate\Support\Facades\DB;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Content\Collections\Collection;
use Cms\Content\Fields\Blueprint;
use Cms\Cms;

/** Creating and changing collections and reusable fieldsets. */
final class CollectionAbilities
{
    private const array HANDLE = ['type' => 'string', 'pattern' => '^[a-z0-9][a-z0-9_-]{0,63}$'];

    public function __construct(private readonly Cms $cms) {}

    public function register(AbilityRegistry $a): void
    {
        $a->register('collections/overview', [
            'label' => 'Content Overview',
            'description' => 'Each content collection you can view with how many entries it has in the default language, how many of them are drafts, and when one last changed.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'handler' => fn (array $in, AbilityContext $ctx) => $this->overview($ctx),
        ]);

        $a->register('collections/save', [
            'label' => 'Save Collection',
            'description' => 'Create or update a collection definition (fields, route, structure). Written to content/collections/<handle>.yaml.',
            'permission' => 'collections.manage',
            'input' => ['type' => 'object', 'properties' => [
                'handle' => self::HANDLE,
                'createOnly' => ['type' => 'boolean', 'default' => false, 'description' => 'Reject an existing handle when creating a collection.'],
                'definition' => ['type' => 'object', 'description' => 'title, singular, icon, driver (database|files), structure (list|tree|dated), default_view (table|grid|calendar), default_columns (null for automatic, [] for title only, or column IDs: uri, status, translations, author, published, updated, field:<handle>), route (e.g. /blog/{slug}), template, sort, body (the main content field handle; empty for fields only), section (default sidebar group), nav_order (default sidebar priority, lower first), fields[]'],
            ], 'required' => ['handle', 'definition']],
            'handler' => function (array $in) {
                if (($in['createOnly'] ?? false) && $this->cms->collections()->find($in['handle'])) {
                    throw AbilityException::invalid(__('A collection with this handle already exists.'));
                }
                $collection = Collection::fromArray($in['handle'], $in['definition']);
                $reserved = ['id', 'title', 'slug', 'status', 'locale', 'uri', 'parent', 'position', 'author', 'origin', 'published_at', 'created_at', 'updated_at', 'blueprint'];

                Blueprint::validate((array) ($in['definition']['fields'] ?? []));

                foreach ($collection->blueprint()->fields() as $field) {
                    if (in_array($field->handle, $reserved, true)) {
                        throw AbilityException::invalid(__('“:handle” is reserved. Choose another field handle.', ['handle' => $field->handle]));
                    }
                }

                $this->cms->collections()->save($collection);

                return $this->cms->collections()->findOrFail($collection->handle)->toArray();
            },
        ]);

        $a->register('collections/delete', [
            'label' => 'Delete Collection',
            'description' => 'Delete a collection definition. Nonempty collections require deleteEntries true; entries, drafts and history are removed.',
            'permission' => 'collections.manage',
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['handle' => self::HANDLE, 'deleteEntries' => ['type' => 'boolean', 'default' => false]], 'required' => ['handle']],
            'handler' => fn (array $in, AbilityContext $ctx) => $this->cms->content()->write(function () use ($in, $ctx) {
                $collection = $this->cms->collections()->findOrFail($in['handle']);

                if (! $collection->deletable()) {
                    throw AbilityException::invalid(__('“:title” comes with a plugin and cannot be deleted.', ['title' => $collection->title]));
                }

                $count = $this->cms->entries()->query()->collection($collection->handle)->count();
                if ($count > 0 && ! $in['deleteEntries']) {
                    throw AbilityException::invalid(__('This collection still has entries. Choose to delete its entries as well.'), ['count' => $count]);
                }
                if ($in['deleteEntries']) {
                    foreach ($this->cms->entries()->query()->collection($collection->handle)->get() as $entry) {
                        $this->cms->content()->delete($entry->id, $ctx->user);
                    }
                }

                // Include history orphaned by older versions of the delete lifecycle.
                DB::table('revisions')->where('collection', $collection->handle)->delete();
                $this->cms->collections()->delete($collection->handle);

                return ['deleted' => $collection->handle, 'deletedEntries' => $count];
            }),
        ]);

        $a->register('fieldsets/list', [
            'label' => 'List Fieldsets',
            'description' => 'Reusable field groups that collections can import.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'handler' => fn () => $this->cms->fieldsets()->all(),
        ]);

        $a->register('fieldsets/save', [
            'label' => 'Save Fieldset',
            'permission' => 'collections.manage',
            'description' => 'Create or update a reusable fieldset (content/fieldsets/<handle>.yaml).',
            'input' => ['type' => 'object', 'properties' => ['handle' => self::HANDLE, 'title' => ['type' => 'string', 'maxLength' => 120], 'fields' => ['type' => 'array', 'items' => ['type' => 'object']]], 'required' => ['handle', 'title', 'fields']],
            'handler' => function (array $in) {
                $this->cms->fieldsets()->save($in['handle'], $in['title'], $in['fields']);

                return $this->cms->fieldsets()->all()[$in['handle']] ?? null;
            },
        ]);
    }

    /** The cache key of a collection's counts; CollectionsModule forgets it when an entry changes. */
    public static function overviewKey(string $collection, string $locale): string
    {
        return "cms.collections.overview.{$collection}.{$locale}";
    }

    /**
     * Counts are cached per collection: flat-file collections count by reading
     * their index, and the home screen asks on every visit.
     *
     * @return list<array<string, mixed>>
     */
    private function overview(AbilityContext $ctx): array
    {
        $locale = $this->cms->defaultLocale();
        $out = [];

        foreach ($this->cms->collections()->all() as $c) {
            if ($c->system || ! ($ctx->system || $ctx->user?->hasPermission("entries.{$c->handle}.view"))) {
                continue;
            }

            $counts = cache()->remember(self::overviewKey($c->handle, $locale), 600, fn () => [
                'total' => $this->cms->entries()->query()->collection($c->handle)->locale($locale)->count(),
                'drafts' => $this->cms->entries()->query()->collection($c->handle)->locale($locale)->status('draft')->count(),
                'updatedAt' => $this->cms->entries()->query()->collection($c->handle)->orderBy('updated_at', 'desc')->first()?->updatedAt?->toIso8601String(),
            ]);

            $out[] = ['handle' => $c->handle, 'title' => $c->title, 'singular' => $c->singular, 'icon' => $c->icon, ...$counts];
        }

        return $out;
    }
}

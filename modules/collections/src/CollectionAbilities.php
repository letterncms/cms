<?php

declare(strict_types=1);

namespace Cms\Modules\Collections;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Abilities\Shapes;
use Cms\Content\Collections\Collection;
use Cms\Content\Fields\Blueprint;
use Cms\Content\Fields\FieldProblems;
use Cms\Cms;
use Cms\Support\Schema\Shape;

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
            'output' => Shape::of([[
                'handle' => Shape::STRING, 'title' => Shape::STRING, 'singular' => Shape::STRING, 'icon' => Shape::STRING,
                'total' => Shape::INTEGER, 'drafts' => Shape::INTEGER, 'updatedAt' => Shape::STRING_OR_NULL,
            ]]),
            'handler' => fn (array $in, AbilityContext $ctx) => $this->overview($ctx),
        ]);

        $a->register('collections/editable', [
            'label' => 'List Editable Collections',
            'description' => 'The site\'s own collections, whose fields and settings are edited in the admin (not the system ones the CMS and its plugins bring), with how many entries each has.',
            'permission' => 'collections.manage',
            'annotations' => ['readOnly' => true],
            'expose' => ['mcp' => false, 'assistant' => false],
            'output' => Shape::of([[
                'publishedAt' => Shape::STRING_OR_NULL, 'updatedAt' => Shape::STRING_OR_NULL, 'handle' => Shape::STRING, 'title' => Shape::STRING, 'icon' => Shape::STRING,
                'structure' => Shape::STRING, 'route' => Shape::STRING_OR_NULL, 'count' => Shape::INTEGER, 'viewable' => Shape::BOOLEAN,
            ]]),
            'handler' => fn (array $in, AbilityContext $ctx) => array_values(array_map(fn ($c) => [
                ...\Cms\Support\RecordTimestamps::api($c->extra),
                'handle' => $c->handle, 'title' => $c->title, 'icon' => $c->icon, 'structure' => $c->structure, 'route' => $c->route,
                'count' => $this->cms->entries()->query()->collection($c->handle)->count(),
                // Whether the person asking may see its entries: managing collections does not give that.
                'viewable' => $ctx->can("entries.{$c->handle}.view"),
            ], array_filter($this->cms->collections()->all(), static fn ($c) => ! $c->system))),
        ]);

        $a->register('collections/save', [
            'label' => 'Save Collection',
            'description' => 'Create or update a collection definition (fields, route, structure). Written to content/collections/<handle>.yaml.',
            'permission' => 'collections.manage',
            'input' => ['type' => 'object', 'properties' => [
                'handle' => self::HANDLE,
                'createOnly' => ['type' => 'boolean', 'default' => false, 'description' => 'Reject an existing handle when creating a collection.'],
                'definition' => ['type' => 'object', 'description' => 'title, singular, icon, driver (database|files), structure (list|tree|dated), default_view (table|grid|calendar), default_columns (null for automatic, [] for title only, or column IDs: uri, status, translations, author, published, updated, field:<handle>), route (e.g. /blog/{slug}), template, sort, body (the main content field handle; empty for fields only), section (default sidebar group), nav_order (default sidebar priority, lower first), fields[], archives (optional: {<taxonomy handle>: "/blog/topics/{slug}"} or {<taxonomy>: {route, routes: {<locale>: pattern}}}: every term of that taxonomy gets a page listing the entries of this collection filed under it, at an address no page has), blueprints (optional: {<handle>: {title, fields[]}} for a collection whose entries come in several kinds with fields of their own; an entry is made with one and keeps it)'],
            ], 'required' => ['handle', 'definition']],
            'output' => self::collection(),
            'handler' => function (array $in) {
                if (($in['createOnly'] ?? false) && $this->cms->collections()->find($in['handle'])) {
                    throw AbilityException::invalid(__('A collection with this handle already exists.'));
                }
                $reserved = ['id', 'title', 'slug', 'status', 'locale', 'uri', 'parent', 'position', 'author', 'origin', 'published_at', 'created_at', 'updated_at', 'blueprint'];
                // What is wrong with a field is said by its path (`fields.2.handle`), for the editor to show beside it.
                FieldProblems::refuse((array) ($in['definition']['fields'] ?? []), $reserved);
                $collection = Collection::fromArray($in['handle'], $in['definition']);

                Blueprint::validate((array) ($in['definition']['fields'] ?? []));
                $named = $in['definition']['blueprints'] ?? [];

                if (! is_array($named) || ($named !== [] && array_is_list($named)) || count($collection->blueprints()) !== count($named)) {
                    throw AbilityException::invalid(__('Blueprints are given by handle, each with a title and its fields.'));
                }

                foreach ($collection->blueprints() as $name => $blueprint) {
                    Blueprint::validate($blueprint['fields'], $name.': ');
                }

                foreach ([null, ...array_keys($collection->blueprints())] as $name) {
                    foreach ($collection->blueprint($name)->fields() as $field) {
                        if (in_array($field->handle, $reserved, true)) {
                            throw AbilityException::invalid(__('“:handle” is reserved. Choose another field handle.', ['handle' => $field->handle]));
                        }
                    }
                }

                // Its term archives: by a taxonomy, at addresses nothing else has.
                if (($problem = app(\Cms\Content\Collections\Archives::class)->problem($collection)) !== null) {
                    throw AbilityException::invalid($problem, ['definition.archives' => $problem]);
                }

                $this->cms->collections()->save($collection);

                return $this->cms->collections()->findOrFail($collection->handle)->toArray();
            },
        ]);

        // Deleting a collection, written once: the handler runs it in a write, a dry run in the entry service's dry mode, where nothing is removed.
        $delete = function (array $in, AbilityContext $ctx): array {
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
                    $this->cms->entryService()->delete($entry->id, $ctx->user);
                }
            }

            if (! $this->cms->entryService()->isDry()) {
                $this->cms->collections()->delete($collection->handle);
            }

            return ['deleted' => $collection->handle, 'deletedEntries' => $count];
        };

        $a->register('collections/delete', [
            'label' => 'Delete Collection',
            'description' => 'Delete a collection definition. Nonempty collections require deleteEntries true; entries, drafts and history are removed.',
            'permission' => 'collections.manage',
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['handle' => self::HANDLE, 'deleteEntries' => ['type' => 'boolean', 'default' => false]], 'required' => ['handle']],
            'output' => Shape::of(['deleted' => Shape::STRING, 'deletedEntries' => Shape::INTEGER]),
            // The same steps in the entry service's dry mode: each entry's delete is checked, none is made, and the collection stays.
            'dryRun' => fn (array $in, AbilityContext $ctx): array => $this->cms->entryService()->dry(function () use ($in, $ctx, $delete): array {
                $collection = $this->cms->collections()->find($in['handle']);
                $gone = $delete($in, $ctx);

                return [['action' => 'delete', 'type' => 'collection', 'handle' => $gone['deleted'], 'title' => $collection?->title, 'removes' => ['entries' => $gone['deletedEntries'], 'history' => true]]];
            }),
            'handler' => fn (array $in, AbilityContext $ctx) => $this->cms->entryService()->write(fn () => $delete($in, $ctx)),
        ]);

        $a->register('fieldsets/list', [
            'label' => 'List Fieldsets',
            'description' => 'Reusable field groups that collections can import.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'output' => Shape::map(self::fieldset()),
            'handler' => fn () => $this->cms->fieldsets()->all(),
        ]);

        $a->register('fieldsets/save', [
            'label' => 'Save Fieldset',
            'permission' => 'collections.manage',
            'description' => 'Create or update a reusable fieldset (content/fieldsets/<handle>.yaml).',
            'input' => ['type' => 'object', 'properties' => ['handle' => self::HANDLE, 'title' => ['type' => 'string', 'maxLength' => 120], 'fields' => ['type' => 'array', 'items' => ['type' => 'object']]], 'required' => ['handle', 'title', 'fields']],
            'output' => Shape::nullable(self::fieldset()),
            'handler' => function (array $in) {
                FieldProblems::refuse($in['fields']);
                $this->cms->fieldsets()->save($in['handle'], $in['title'], $in['fields']);

                return $this->cms->fieldsets()->all()[$in['handle']] ?? null;
            },
        ]);
    }

    /**
     * Collection::toArray(): the definition as content/collections/<handle>.yaml has it (defaults left out), with
     * the handle, the dates, the default view and the fields its imports resolve to. The YAML's other keys come along as written.
     */
    private static function collection(): Shape
    {
        return Shape::of([
            'handle' => Shape::STRING, 'title' => Shape::STRING, 'singular' => Shape::STRING, 'icon' => Shape::STRING, 'description?' => Shape::STRING,
            'driver' => Shape::STRING, 'structure' => Shape::STRING, 'route?' => Shape::STRING, 'template' => Shape::STRING, 'sort' => Shape::STRING,
            'home?' => Shape::STRING, 'body?' => Shape::STRING, 'revisions?' => Shape::BOOLEAN, 'per_page?' => Shape::INTEGER, 'section?' => Shape::STRING,
            'system?' => Shape::BOOLEAN, 'default_view' => Shape::STRING, 'default_columns' => Shape::nullable([Shape::STRING]),
            'fields' => [Shape::open('A field as written (handle, type and what its type takes: fields/types lists each type\'s config) or the import of a fieldset ({import, prefix?}).')],
            'publishedAt' => Shape::STRING_OR_NULL, 'updatedAt' => Shape::STRING_OR_NULL, 'resolvedFields' => [Shapes::field()],
        ])->andMore('Every other key the collection\'s YAML holds, as written: published_at and updated_at as stored, nav_order, routes (a route per language) and what plugins read from a definition.');
    }

    /** Fieldsets::all(): a fieldset's title, its field definitions as written (a field, or an import of another fieldset) and where it comes from: `file`, `code` or a package. */
    private static function fieldset(): Shape
    {
        return Shape::of(['title' => Shape::STRING, 'fields' => [Shape::open('A field as written (handle, type and what its type takes: fields/types lists each type\'s config) or the import of another fieldset ({import, prefix?}).')], 'source' => Shape::STRING]);
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

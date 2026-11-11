<?php

declare(strict_types=1);

namespace Cms\Modules\Content;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Abilities\Shapes;
use Cms\Content\Collections\Collection;
use Cms\Content\Entries\Entry;
use Cms\Cms;
use Cms\Modules\Workspace\Answers;
use Cms\Support\RecordTimestamps;
use Cms\Support\Schema\Shape;
use Cms\Users\User;

/** Collections (read), entries, search and field types. */
final class ContentAbilities
{
    /** What a list is sorted by: a column or a data field, `-` first for descending. Saved views keep one, so they check it the same way. */
    public const string SORT = '^-?[a-z][a-z0-9_]*(\\.[a-z0-9_]+)*$';

    private const array ID = ['type' => 'string', 'format' => 'ulid', 'description' => 'Entry id (ULID).'];

    private const array VERSION = ['type' => 'string', 'pattern' => '^[a-f0-9]{64}$'];

    /** Why collections/schema leaves an ability's input open: it is JSON Schema itself, in whatever keywords the ability and the fields use. */
    private const string INPUT_SCHEMA = 'A JSON Schema, open by nature: the ability\'s own input schema (abilities/list has it), with `data` as this collection\'s draft schema and `collection` fixed to its handle.';

    private const array HANDLE = ['type' => 'string', 'pattern' => '^[a-z0-9][a-z0-9_-]{0,63}$'];

    private const array LIST_FIELDS = ['type' => 'array', 'items' => ['type' => 'string', 'pattern' => '^[a-z][a-z0-9_]{0,63}$'], 'maxItems' => 30, 'description' => 'Data fields to include per entry under `values` (relations come with their titles and names).'];

    public function __construct(private readonly Cms $cms) {}

    public function register(AbilityRegistry $abilities): void
    {
        $this->collections($abilities);
        $this->entries($abilities);
        $this->builtinPages($abilities);
    }

    /**
     * What the workspace answers a change to an entry with: what happened, in a line, and what
     * comes next: open it, publish it, see it live, or take it back.
     */
    private function answer(string $what): \Closure
    {
        return function (mixed $entry) use ($what): array {
            if ($what === 'deleted') {
                return Answers::done(isset($entry['title']) && $entry['title'] !== '' ? __('Deleted “:title”', ['title' => $entry['title']]) : __('Deleted the entry'));
            }

            $title = (string) ($entry['title'] ?? '');
            $collection = $this->cms->collections()->find((string) ($entry['collection'] ?? ''));
            $live = in_array($entry['displayStatus'] ?? '', ['published', 'changed'], true);
            $id = (string) $entry['id'];
            $open = ['label' => __('Open'), 'icon' => 'arrow-right', 'variant' => 'primary', 'to' => '/content/'.$entry['collection'].'/'.$id];
            $may = static fn (string $action) => 'entries.'.$entry['collection'].'.'.$action;
            $publish = ['label' => __('Publish'), 'icon' => 'globe', 'ability' => 'entries/publish', 'input' => ['id' => $id], 'can' => $may('publish'), 'success' => Answers::literal(__('Published “:title”', ['title' => $title]))];
            $unpublish = ['label' => __('Unpublish'), 'icon' => 'eye-off', 'ability' => 'entries/unpublish', 'input' => ['id' => $id], 'can' => $may('publish'), 'success' => Answers::literal(__('Unpublished “:title”', ['title' => $title]))];
            $site = $live && ! empty($entry['uri']) ? ['label' => __('View on Site'), 'icon' => 'external', 'href' => $this->cms->url($entry['uri'])] : null;
            $delete = ['label' => __('Delete'), 'icon' => 'trash', 'variant' => 'ghost', 'ability' => 'entries/delete', 'input' => ['id' => $id], 'can' => $may('delete'),
                'confirm' => ['title' => Answers::literal(__('Delete “:title”?', ['title' => $title])), 'confirm' => __('Delete'), 'danger' => true], 'success' => __('Deleted the entry')];
            $unpublished = ($entry['displayStatus'] ?? '') !== 'published';

            [$said, $actions] = match ($what) {
                'created' => [__('Created “:title”', ['title' => $title]), [$open, $live ? $site : $publish, $delete]],
                'saved' => [__('Saved “:title”', ['title' => $title]), [$open, $unpublished ? $publish : $site]],
                'published' => [__('Published “:title”', ['title' => $title]), [$open, $site, $unpublish]],
                'unpublished' => [__('Unpublished “:title”', ['title' => $title]), [$open, $publish]],
                'discarded' => [__('Discarded the changes to “:title”', ['title' => $title]), [$open]],
                'duplicated' => [__('Duplicated as “:title”', ['title' => $title]), [$open, $publish, $delete]],
                default => [__('Restored “:title”', ['title' => $title]), [$open, $unpublished ? $publish : $site]],
            };
            $where = $collection === null ? null : ($live ? __('Live in :collection', ['collection' => $collection->title]) : __('Draft in :collection', ['collection' => $collection->title]));

            return Answers::done($said, $where, array_values(array_filter($actions)));
        };
    }

    /** Pages features bring with them (sign in, checkout): what each group has, and making one the site's own. */
    private function builtinPages(AbilityRegistry $a): void
    {
        $registry = $this->cms->builtinPages();
        $own = fn (array $group, string $handle) => $this->cms->entries()->query()->collection($group['collection'])->locale($this->cms->defaultLocale())->where('slug', $handle)->first();

        $a->register('pages/builtin', [
            'label' => 'Built-in Pages',
            'description' => 'Pages features bring at addresses of their own (sign in and account pages, checkout), by group (`group` for one): each page\'s path, and whether the site has its own version (an entry of the group\'s collection) or uses the standard one. `displayStatus` says what is live as the site\'s pages do: standard, published, changed (a version waits to be published), scheduled, or conflict (a page of the site has this address).',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['group' => self::HANDLE]],
            'output' => Shape::of([[
                'id' => Shape::STRING, 'label' => Shape::STRING, 'collection' => Shape::STRING, 'canCustomise' => Shape::BOOLEAN, 'total' => Shape::INTEGER,
                'pages' => [[
                    'handle' => Shape::STRING, 'label' => Shape::STRING, 'path' => Shape::STRING_OR_NULL, 'id' => Shape::STRING_OR_NULL, 'version' => Shape::STRING_OR_NULL,
                    'status' => Shape::enum('conflict', 'standard', 'customised', 'draft'), 'displayStatus' => Shape::STRING,
                    'publishedAt' => Shape::STRING_OR_NULL, 'updatedAt' => Shape::STRING_OR_NULL, 'href' => Shape::STRING_OR_NULL, 'group' => Shape::STRING,
                    'collection' => Shape::STRING, 'customisable' => Shape::BOOLEAN, 'opens' => Shape::BOOLEAN, 'restorable' => Shape::BOOLEAN,
                ]],
            ]]),
            'handler' => function (array $in, AbilityContext $ctx) use ($registry, $own) {
                $groups = [];

                foreach ($registry->all() as $group) {
                    if (! $this->allowed($ctx->user, $group['collection'], 'view') || (isset($in['group']) && $in['group'] !== $group['id'])) {
                        continue;
                    }

                    $pages = [];

                    foreach (($group['pages'])() as $handle => $page) {
                        $entry = $own($group, (string) $handle);
                        $status = match (true) {
                            $group['conflict'] !== null && ($group['conflict'])((string) $handle) => 'conflict',
                            $entry === null => 'standard',
                            $entry->isLive() => 'customised',
                            default => 'draft',
                        };
                        // Where it opens once it is the site's own, and whether this person may make it so.
                        // Listed as the site's pages are: what is live, and when it last changed. The standard version is live until the site's own is published.
                        $display = match (true) {
                            $status === 'conflict' || $entry === null => $status,
                            $entry->isLive() => $entry->displayStatus(),
                            default => 'changed',
                        };
                        $pages[] = ['handle' => (string) $handle, 'label' => __($page['label']), 'path' => $page['path'] ?? null, 'id' => $entry?->id, 'version' => $entry?->version(), 'status' => $status, 'displayStatus' => $display,
                            'publishedAt' => $entry?->publishedAt?->toIso8601String(), 'updatedAt' => $entry?->updatedAt?->toIso8601String(),
                            // A page on view at an address of its own; one with a placeholder (`/store/{slug}`) is many.
                            'href' => isset($page['path']) && ! str_contains((string) $page['path'], '{') && $status !== 'conflict' ? $page['path'] : null,
                            'group' => $group['id'], 'collection' => $group['collection'], 'customisable' => $status === 'standard' && $this->allowed($ctx->user, $group['collection'], 'create'),
                            'opens' => $entry !== null || $this->allowed($ctx->user, $group['collection'], 'create'),
                            'restorable' => $entry !== null && $this->allowed($ctx->user, $group['collection'], 'delete')];
                    }

                    // Named after what brought them: a plugin's own name, the way its screen and settings are called.
                    $groups[] = ['id' => $group['id'], 'label' => __(\Cms\Packages\PackageRepository::labelOf($group['package']) ?? $group['label']), 'collection' => $group['collection'], 'canCustomise' => $this->allowed($ctx->user, $group['collection'], 'create'), 'total' => count($pages), 'pages' => $pages];
                }

                return $groups;
            },
        ]);

        // The page's own entry, and whether this call made it. @return array{0: Entry, 1: bool}
        $customise = function (array $in, AbilityContext $ctx) use ($registry, $own): array {
            $group = $registry->get($in['group']) ?? throw AbilityException::notFound($in['group']);
            $page = ($group['pages'])()[$in['handle']] ?? throw AbilityException::notFound($in['handle']);

            if ($existing = $own($group, $in['handle'])) {
                return [$existing, false];
            }

            $locale = $this->cms->defaultLocale();

            return [$this->cms->entryService()->create($group['collection'], ['title' => __($page['label']), 'slug' => $in['handle'], 'locale' => $locale, 'data' => ['blocks' => ($group['seed'])($in['handle'], $locale)]], $ctx->user), true];
        };

        $a->register('pages/customize', [
            'label' => 'Customize a Built-in Page',
            'description' => 'Make a built-in page the site\'s own: creates a draft from its standard version and returns the entry to edit. An already customized page returns its entry, to anyone who may view it.',
            'annotations' => ['draft' => true],
            'permission' => fn (?User $user, array $in) => ($group = $registry->get((string) $in['group'])) !== null
                && ($this->allowed($user, $group['collection'], 'create') || ($this->allowed($user, $group['collection'], 'view') && $own($group, (string) ($in['handle'] ?? '')) !== null)),
            'input' => ['type' => 'object', 'properties' => ['group' => self::HANDLE, 'handle' => ['type' => 'string', 'maxLength' => 64]], 'required' => ['group', 'handle']],
            'output' => Shape::of(['id' => Shape::STRING, 'collection' => Shape::STRING]),
            // Nothing would change when the page is the site's own already.
            'dryRun' => function (array $in, AbilityContext $ctx) use ($customise): array {
                [$entry, $created] = $this->dry(fn () => $customise($in, $ctx));

                return $created ? [$this->change('create', $entry, ['slug' => $entry->slug, 'locale' => $entry->locale, 'status' => $entry->status, 'uri' => $entry->uri], id: false)] : [];
            },
            'handler' => function (array $in, AbilityContext $ctx) use ($customise) {
                [$entry] = $customise($in, $ctx);

                return ['id' => $entry->id, 'collection' => $entry->collection];
            },
        ]);
    }

    private function collections(AbilityRegistry $a): void
    {
        $a->register('collections/list', [
            'label' => 'List Collections',
            'description' => 'All content collections (content types) with their routes and structure. `taxonomy` marks a vocabulary: its entries are the terms that `terms` fields pick from (terms/list has them with their counts). `system` marks the ones the CMS and its plugins bring (templates, components, account and checkout pages): their entries are edited like any other, their schema comes with the code.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'output' => Shape::of([[
                'publishedAt' => Shape::STRING_OR_NULL, 'updatedAt' => Shape::STRING_OR_NULL, 'handle' => Shape::STRING, 'title' => Shape::STRING, 'singular' => Shape::STRING,
                'icon' => Shape::STRING, 'description' => Shape::STRING, 'driver' => Shape::enum(...Collection::DRIVERS), 'structure' => Shape::enum(...Collection::STRUCTURES), 'route' => Shape::STRING_OR_NULL,
                'defaultView' => Shape::enum(...Collection::VIEWS), 'system' => Shape::BOOLEAN, 'taxonomy' => Shape::BOOLEAN, 'count' => Shape::INTEGER,
            ]]),
            'handler' => fn () => array_values(array_map(fn (Collection $c) => [
                ...RecordTimestamps::api($c->extra),
                'handle' => $c->handle, 'title' => $c->title, 'singular' => $c->singular, 'icon' => $c->icon,
                'description' => $c->description, 'driver' => $c->driver, 'structure' => $c->structure, 'route' => $c->route, 'defaultView' => $c->defaultView,
                'system' => $c->system, 'taxonomy' => $c->isTaxonomy(), 'count' => $this->cms->entries()->query()->collection($c->handle)->count(),
            ], $this->cms->collections()->all())),
        ]);

        $a->register('collections/options', [
            'label' => 'Collection Options',
            'description' => 'Initial collection definition defaults and settings from the active plugins. Apply defaults before explicit creation settings; with Blocks off a new collection can contain fields only.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'output' => Shape::of([
                'defaults' => Shape::open('The start of a collection definition, as collections/save takes it (title, fields, body…): what the active plugins give a new collection, empty when none does.'),
                'settings' => [Shapes::field()],
            ]),
            'handler' => fn () => [
                'defaults' => $this->cms->collections()->defaults(),
                'settings' => app(\Cms\Admin\Translations::class)->fields($this->cms->collections()->settingsFields()),
            ],
        ]);

        $a->register('collections/get', [
            'label' => 'Get Collection',
            'description' => 'A collection definition with its fields, the JSON Schema entry data must follow (`schema`; collections/schema has more), and its settings as fields.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['handle' => self::HANDLE], 'required' => ['handle']],
            'output' => Shapes::collection([
                'count' => Shape::INTEGER, 'deletable' => Shape::BOOLEAN,
                'settings' => [Shapes::field()],
            ]),
            'handler' => function (array $in) {
                $c = $this->cms->collections()->find($in['handle']) ?? throw new AbilityException('Collection not found.', 'not_found');

                $t = app(\Cms\Admin\Translations::class);
                $collection = $c->toArray();

                // Field labels in the user's language (built-in collections' blueprints are written in English).
                return [...$collection, 'count' => $this->cms->entries()->query()->collection($c->handle)->count(), 'deletable' => $c->deletable(), 'resolvedFields' => $t->fields($collection['resolvedFields']), 'settings' => $t->fields($this->cms->collections()->settingsFields($c)),
                    // …and those of its other blueprints, with their names.
                    ...(isset($collection['resolvedBlueprints']) ? ['resolvedBlueprints' => array_map(static fn (array $b) => [...$b, 'title' => $t->label($b['title']), 'resolvedFields' => $t->fields($b['resolvedFields'])], $collection['resolvedBlueprints'])] : [])];
            },
        ]);

        $a->register('collections/schema', [
            'label' => 'Collection Schema',
            'description' => 'JSON Schema for the entries of one collection: `data` is what an entry\'s data must follow to be published, `draft` what a draft may be (required fields may be empty), and `create` and `update` are the whole input of entries/create and entries/update for this collection. A collection with several blueprints has the same four per blueprint under `blueprints` (its `create` fixes `blueprint` to its handle); the ones at the top are for an entry made without one. Validation errors name the same paths (data.summary, data.blocks.0.props.text).',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['handle' => self::HANDLE], 'required' => ['handle']],
            'output' => Shape::of([
                'handle' => Shape::STRING, 'title' => Shape::STRING, 'data' => Shapes::dataSchema(), 'draft' => Shapes::dataSchema(),
                'create' => Shape::open(self::INPUT_SCHEMA), 'update' => Shape::open(self::INPUT_SCHEMA),
                'blueprints?' => [Shape::of([
                    'handle' => Shape::STRING, 'title' => Shape::STRING, 'data' => Shapes::dataSchema(), 'draft' => Shapes::dataSchema(),
                    'create' => Shape::open(self::INPUT_SCHEMA), 'update' => Shape::open(self::INPUT_SCHEMA),
                ])],
            ]),
            'handler' => fn (array $in) => self::schemaOf($this->cms, $this->cms->collections()->find($in['handle']) ?? throw new AbilityException('Collection not found.', 'not_found')),
        ]);

        $a->register('fields/types', [
            'label' => 'List Field Types',
            'description' => 'Available field types and their options, for building blueprints.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'output' => Shape::of([[
                'key' => Shape::STRING, 'label' => Shape::STRING, 'icon' => Shape::STRING, 'description' => Shape::STRING, 'group' => Shape::STRING,
                'component' => Shape::STRING, 'config' => [Shapes::field()],
            ]]),
            'handler' => fn () => array_values(array_map(static fn ($t) => $t->toArray(), $this->cms->fields()->all())),
        ]);
    }

    private function entries(AbilityRegistry $a): void
    {
        $collectionPermission = fn (string $action) => fn (?User $user, array $in) => $this->allowed($user, (string) ($in['collection'] ?? ''), $action);
        $entryPermission = fn (string $action) => fn (?User $user, array $in) => $this->allowed($user, $this->collectionOf((string) ($in['id'] ?? '')), $action);

        $a->register('entries/list', [
            'label' => 'List Entries',
            'description' => 'Query entries of a collection with filters, search, sorting and pagination.',
            'permission' => $collectionPermission('view'),
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => [
                'collection' => self::HANDLE,
                'locale' => ['type' => 'string'],
                'status' => ['type' => 'string', 'enum' => ['any', 'published', 'draft', 'live', 'expired', 'active'], 'default' => 'any', 'description' => 'live: published, its time has come and its end date has not. expired: published, and its end date has passed. active: published and not expired (live or scheduled).'],
                'search' => ['type' => 'string', 'maxLength' => 200],
                'parentId' => ['type' => ['string', 'null'], 'description' => 'Tree collections: children of this entry; null for top level.'],
                'sort' => ['type' => 'string', 'pattern' => self::SORT, 'description' => 'Field to sort by: title, slug, uri, status, locale, published_at, updated_at, created_at, position, author_id (by the author’s name) or a data field. Prefix with - for descending, e.g. -published_at. Empty values sort last.'],
                'direction' => ['type' => 'string', 'enum' => ['asc', 'desc'], 'description' => 'Sort direction; overrides a - prefix on sort.'],
                'fields' => self::LIST_FIELDS,
                'filters' => ['type' => 'array', 'items' => ['type' => 'object', 'properties' => [
                    'field' => ['type' => 'string'], 'operator' => ['type' => 'string', 'default' => '='], 'value' => ['description' => 'Value to compare against; any type.'],
                ], 'required' => ['field']]],
                'references' => [...self::ID, 'description' => 'Only entries that name this entry anywhere in their data: relation and terms fields at any depth, link fields, links in blocks (the reverse of a relation). references/list does the same across every collection.'],
                'referencesField' => ['type' => 'string', 'pattern' => '^[a-z][a-z0-9_]*(\\.[a-z0-9_]+)*$', 'description' => 'With `references`: only inside this field (a group\'s as group.field).'],
                'page' => ['type' => 'integer', 'minimum' => 1, 'default' => 1],
                'perPage' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 200, 'default' => 25],
            ], 'required' => ['collection']],
            'output' => Shape::page(self::listed(), ['perPage' => Shape::INTEGER]),
            'handler' => function (array $in) {
                $collection = $this->cms->collections()->find($in['collection']) ?? throw new AbilityException('Collection not found.', 'not_found');
                $query = $this->cms->entries()->query()->working()->ungated()->collection($collection->handle)->status($in['status'])->search($in['search'] ?? null);

                if (isset($in['locale'])) {
                    $query->locale($in['locale']);
                }

                if (array_key_exists('parentId', $in)) {
                    $query->parent($in['parentId']);
                }

                foreach ($in['filters'] ?? [] as $filter) {
                    $query->where($filter['field'], $filter['operator'] ?? '=', $filter['value'] ?? null);
                }

                if (isset($in['references'])) {
                    $query->references($in['references'], $in['referencesField'] ?? null);
                }

                $sort = ($in['sort'] ?? '') !== '' ? $in['sort'] : $collection->sort;
                $query->orderBy(ltrim($sort, '-'), $in['direction'] ?? (str_starts_with($sort, '-') ? 'desc' : 'asc'));

                // Ties (same status, same author, no date) keep a stable, readable order.
                if (ltrim($sort, '-') !== 'title') {
                    $query->orderBy('title');
                }

                $page = $query->paginate($in['perPage'], $in['page']);

                return [...$page, 'items' => $this->listItems($collection, $page['items'], $in['fields'] ?? [])];
            },
        ]);

        $a->register('entries/tree', [
            'label' => 'Entry Tree',
            'description' => 'All entries of a tree collection (e.g. pages) nested by parent.',
            'permission' => $collectionPermission('view'),
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['collection' => self::HANDLE, 'locale' => ['type' => 'string'], 'fields' => self::LIST_FIELDS], 'required' => ['collection']],
            'output' => Shape::of([Shape::nested(self::listedKeys(), 'children')]),
            'handler' => function (array $in) {
                $collection = $this->cms->collections()->find($in['collection']) ?? throw new AbilityException('Collection not found.', 'not_found');
                $entries = $this->cms->entries()->query()->working()->collection($collection->handle)->locale($in['locale'] ?? $this->cms->defaultLocale())->orderBy('position')->get();
                $items = array_combine(array_map(static fn (Entry $e) => $e->id, $entries), $this->listItems($collection, $entries, $in['fields'] ?? []));
                $byParent = [];

                foreach ($entries as $entry) {
                    $byParent[$entry->parentId ?? ''][] = $entry->id;
                }

                $build = function (string $parent) use (&$build, $byParent, $items): array {
                    return array_map(static fn (string $id) => [...$items[$id], 'children' => $build($id)], $byParent[$parent] ?? []);
                };

                return $build('');
            },
        ]);

        $a->register('entries/get', [
            'label' => 'Get Entry',
            'description' => 'One entry with its working copy (draft changes included) and data fields. On a translation, `sharedFields` names the fields that hold one value for every language (`localizable: false`): they follow the original entry (`originId`) and are changed there.',
            'permission' => $entryPermission('view'),
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => self::ID], 'required' => ['id']],
            'output' => Shapes::entry()->with(['translations' => Shape::map(Shape::STRING), 'sharedFields?' => [Shape::STRING]]),
            'handler' => function (array $in) {
                $entry = $this->cms->entries()->findOrFail($in['id']);
                $translations = [];

                if (count($this->cms->locales()) > 1) {
                    $origin = $entry->originId ?? $entry->id;

                    foreach ($this->cms->entries()->query()->collection($entry->collection)->where('origin_id', $origin)->get() as $t) {
                        $translations[$t->locale] = $t->id;
                    }

                    $translations[$entry->locale] = $entry->id;

                    if ($entry->originId && ($o = $this->cms->entries()->find($entry->originId))) {
                        $translations[$o->locale] = $o->id;
                    }
                }

                $shared = $entry->originId === null ? [] : $entry->blueprint()->shared();

                return [...$entry->toArray(), 'translations' => $translations ?: (object) [], ...($shared === [] ? [] : ['sharedFields' => $shared])];
            },
        ]);

        // Each change, written once: the handler runs it, and a dry run runs the same in the service's dry mode
        // (EntryService::dry()), so both are refused in the same place.
        $content = fn () => $this->cms->entryService();
        $create = fn (array $in, AbilityContext $ctx): Entry => $content()->create($in['collection'], $in, $ctx->user);
        $update = fn (array $in, AbilityContext $ctx): Entry => $content()->update($in['id'], array_diff_key($in, ['id' => 1, 'publish' => 1]), $ctx->user, $in['publish']);
        $publish = fn (array $in, AbilityContext $ctx): Entry => $content()->publish($in['id'], $ctx->user, $in['at'] ?? null, $in['expectedVersion'] ?? null, array_key_exists('expiresAt', $in) ? $in['expiresAt'] : false);
        $unpublish = fn (array $in, AbilityContext $ctx): Entry => $content()->unpublish($in['id'], $ctx->user, $in['expectedVersion'] ?? null);
        $discard = fn (array $in, AbilityContext $ctx): Entry => $content()->discardDraft($in['id'], $ctx->user, $in['expectedVersion'] ?? null);
        $duplicate = fn (array $in, AbilityContext $ctx): Entry => $content()->duplicate($in['id'], $ctx->user, $in['expectedVersion'] ?? null);
        $move = fn (array $in, AbilityContext $ctx): Entry => $content()->move($in['id'], $in['parentId'], $in['position'] ?? null, $ctx->user, $in['expectedVersion'] ?? null);
        $restore = fn (array $in, AbilityContext $ctx): Entry => $content()->restore($in['revisionId'], $ctx->user, $in['expectedVersion'] ?? null);
        $delete = function (array $in, AbilityContext $ctx) use ($content): array {
            $title = $this->cms->entries()->find($in['id'])?->title;
            $content()->delete($in['id'], $ctx->user, $in['expectedVersion'] ?? null);

            return ['deleted' => $in['id'], 'title' => $title];
        };
        $reorder = function (array $in, AbilityContext $ctx) use ($content): array {
            $content()->reorder($in['collection'], $in['ids'], $in['parentId'], $ctx->user, $in['versions'] ?? []);

            return ['ok' => true];
        };

        $a->register('entries/create', [
            'label' => 'Create Entry',
            // Unless a call publishes or schedules it, what this changes isn't live and stays in the history.
            'annotations' => ['draft' => true],
            'description' => 'Create an entry. `data` keys are the collection\'s field handles (collections/schema has its JSON Schema, and this input with it in place). Created as a draft unless status is "published".',
            'permission' => function (?User $user, array $in) {
                $ok = $this->allowed($user, (string) $in['collection'], 'create');

                return $ok && (($in['status'] ?? 'draft') !== 'published' || $this->allowed($user, (string) $in['collection'], 'publish'));
            },
            'input' => ['type' => 'object', 'properties' => [
                'collection' => self::HANDLE,
                'blueprint' => [...self::HANDLE, 'description' => 'For a collection with several blueprints (collections/schema lists them): the one this entry is made with and keeps. Left out: the collection\'s own fields.'],
                'title' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 500],
                'slug' => ['type' => 'string', 'maxLength' => 191],
                'data' => ['type' => 'object', 'default' => []],
                'locale' => ['type' => 'string'],
                'parentId' => ['type' => ['string', 'null']],
                'originId' => ['type' => ['string', 'null'], 'description' => 'For translations: the entry this one translates.'],
                'status' => ['type' => 'string', 'enum' => ['draft', 'published'], 'default' => 'draft'],
                'authorId' => ['type' => ['string', 'null'], 'format' => 'ulid'],
                'at' => ['type' => 'string', 'format' => 'date-time', 'description' => 'Publication time; requires status published.'],
                'expiresAt' => ['type' => ['string', 'null'], 'format' => 'date-time', 'description' => 'When it stops being published: from then on it is off the site, and a draft once the scheduler has run. Null takes the date away. Requires status published.'],
            ], 'required' => ['collection', 'title']],
            'answer' => $this->answer('created'),
            'output' => Shapes::entry(),
            'dryRun' => function (array $in, AbilityContext $ctx) use ($create): array {
                $entry = $this->dry(fn () => $create($in, $ctx));

                return [$this->change($entry->status === 'published' ? 'create-published' : 'create', $entry, ['slug' => $entry->slug, 'locale' => $entry->locale, 'status' => $entry->status, 'uri' => $entry->uri], id: false)];
            },
            'handler' => fn (array $in, AbilityContext $ctx) => $create($in, $ctx)->toArray(),
        ]);

        $a->register('entries/update', [
            'label' => 'Update Entry',
            'annotations' => ['draft' => true],
            'description' => 'Change an entry. `data` is merged into existing data and follows the collection\'s schema (collections/schema). For published entries changes are saved as a draft until published (or pass publish: true).',
            'permission' => function (?User $user, array $in) {
                $collection = $this->collectionOf((string) $in['id']);

                return $this->allowed($user, $collection, 'edit') && (! ($in['publish'] ?? false) || $this->allowed($user, $collection, 'publish'));
            },
            'annotations' => ['idempotent' => true],
            'input' => ['type' => 'object', 'properties' => [
                'id' => self::ID,
                'title' => ['type' => 'string', 'maxLength' => 500],
                'slug' => ['type' => 'string', 'maxLength' => 191],
                'data' => ['type' => 'object'],
                'authorId' => ['type' => ['string', 'null'], 'format' => 'ulid'],
                'at' => ['type' => 'string', 'format' => 'date-time', 'description' => 'Publication time; requires publish true.'],
                'expiresAt' => ['type' => ['string', 'null'], 'format' => 'date-time', 'description' => 'When it stops being published: from then on it is off the site, and a draft once the scheduler has run. Null takes the date away. Requires publish true; left out, the date stays as it is.'],
                'publish' => ['type' => 'boolean', 'default' => false],
                'expectedVersion' => self::VERSION,
            ], 'required' => ['id']],
            'answer' => $this->answer('saved'),
            'output' => Shapes::entry(),
            'dryRun' => fn (array $in, AbilityContext $ctx): array => $this->dry(function () use ($in, $ctx, $update): array {
                $before = $this->cms->entries()->find($in['id'])?->working() ?? [];
                $entry = $update($in, $ctx);

                return $this->withTranslations([$this->change($in['publish'] ? 'update-published' : 'update', $entry, ['fields' => self::changed($before, $entry->working(), array_keys($in['data'] ?? []))])]);
            }),
            'handler' => fn (array $in, AbilityContext $ctx) => $update($in, $ctx)->toArray(),
        ]);

        $a->register('entries/publish', [
            'label' => 'Publish Entry',
            'description' => 'Publish an entry (applying its draft). Pass `at` to schedule it, and `expiresAt` for when it comes off the site again: publish a live entry again to set, move or (null) remove that date.',
            'permission' => $entryPermission('publish'),
            'input' => ['type' => 'object', 'properties' => ['id' => self::ID, 'at' => ['type' => 'string', 'format' => 'date-time'], 'expiresAt' => ['type' => ['string', 'null'], 'format' => 'date-time', 'description' => 'When it stops being published: from then on it is off the site, and a draft once the scheduler has run. Null takes the date away. Left out, the date stays as it is.'], 'expectedVersion' => self::VERSION], 'required' => ['id']],
            'answer' => $this->answer('published'),
            'output' => Shapes::entry(),
            'dryRun' => function (array $in, AbilityContext $ctx) use ($publish): array {
                $entry = $this->dry(fn () => $publish($in, $ctx));

                return $this->withTranslations([$this->change($entry->isScheduled() ? 'schedule' : 'publish', $entry, ['at' => $entry->publishedAt?->toIso8601String(), 'expiresAt' => $entry->expiresAt?->toIso8601String(), 'uri' => $entry->uri])]);
            },
            'handler' => fn (array $in, AbilityContext $ctx) => $publish($in, $ctx)->toArray(),
        ]);

        $a->register('entries/unpublish', [
            'label' => 'Unpublish Entry',
            'description' => 'Take an entry offline (it becomes a draft).',
            'permission' => $entryPermission('publish'),
            'input' => ['type' => 'object', 'properties' => ['id' => self::ID, 'expectedVersion' => self::VERSION], 'required' => ['id']],
            'answer' => $this->answer('unpublished'),
            'output' => Shapes::entry(),
            'dryRun' => fn (array $in, AbilityContext $ctx): array => $this->withTranslations([$this->change('unpublish', $this->dry(fn () => $unpublish($in, $ctx)))]),
            'handler' => fn (array $in, AbilityContext $ctx) => $unpublish($in, $ctx)->toArray(),
        ]);

        $a->register('entries/discard-draft', [
            'label' => 'Discard Changes',
            'description' => 'Throw away unpublished changes of a published entry.',
            'permission' => $entryPermission('edit'),
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => self::ID, 'expectedVersion' => self::VERSION], 'required' => ['id']],
            'answer' => $this->answer('discarded'),
            'output' => Shapes::entry(),
            // What is thrown away: the fields whose unpublished value differs from what is live.
            'dryRun' => fn (array $in, AbilityContext $ctx): array => $this->dry(function () use ($in, $ctx, $discard): array {
                $before = $this->cms->entries()->find($in['id'])?->working() ?? [];
                $entry = $discard($in, $ctx);

                return [$this->change('discard-draft', $entry, ['removes' => self::changed($before, $entry->working())])];
            }),
            'handler' => fn (array $in, AbilityContext $ctx) => $discard($in, $ctx)->toArray(),
        ]);

        $a->register('entries/delete', [
            'label' => 'Delete Entry',
            'description' => 'Permanently delete an entry. Children of tree entries move up one level.',
            'permission' => $entryPermission('delete'),
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => self::ID, 'expectedVersion' => self::VERSION], 'required' => ['id']],
            'answer' => $this->answer('deleted'),
            'output' => Shape::of(['deleted' => Shape::STRING, 'title' => Shape::STRING_OR_NULL]),
            // What goes with it: its history, and for a tree how many entries under it move up a level.
            'dryRun' => fn (array $in, AbilityContext $ctx): array => $this->dry(function () use ($in, $ctx, $delete): array {
                $entry = $this->cms->entries()->find($in['id']);
                $children = $entry && $entry->collection()->isTree() ? $this->cms->entries()->query()->collection($entry->collection)->locale($entry->locale)->parent($entry->id)->count() : 0;
                $delete($in, $ctx);

                return [$this->change('delete', $entry, ['uri' => $entry->uri, 'live' => $entry->isLive(), 'revisions' => count(app(\Cms\Content\Revisions\Revisions::class)->list($entry->id, 1000)), 'childrenMovedUp' => $children])];
            }),
            'handler' => $delete,
        ]);

        $a->register('entries/duplicate', [
            'label' => 'Duplicate Entry',
            'description' => 'Copy an entry (as a draft).',
            'permission' => $entryPermission('create'),
            'input' => ['type' => 'object', 'properties' => ['id' => self::ID, 'expectedVersion' => self::VERSION], 'required' => ['id']],
            'answer' => $this->answer('duplicated'),
            'output' => Shapes::entry(),
            'dryRun' => function (array $in, AbilityContext $ctx) use ($duplicate): array {
                $copy = $this->dry(fn () => $duplicate($in, $ctx));

                return [$this->change('duplicate', $copy, ['from' => $in['id'], 'slug' => $copy->slug, 'locale' => $copy->locale, 'status' => $copy->status, 'uri' => $copy->uri], id: false)];
            },
            'handler' => fn (array $in, AbilityContext $ctx) => $duplicate($in, $ctx)->toArray(),
        ]);

        $a->register('entries/move', [
            'label' => 'Move Entry',
            'description' => 'Move an entry immediately without publishing its draft. Moving published content requires publishing permission.',
            'permission' => $entryPermission('edit'),
            'input' => ['type' => 'object', 'properties' => [
                'id' => self::ID, 'parentId' => ['type' => ['string', 'null']],
                'position' => ['type' => 'integer', 'minimum' => 0], 'expectedVersion' => self::VERSION,
            ], 'required' => ['id', 'parentId']],
            'output' => Shapes::entry(),
            'dryRun' => function (array $in, AbilityContext $ctx) use ($move): array {
                $entry = $this->dry(fn () => $move($in, $ctx));

                return [$this->change('move', $entry, ['parentId' => $entry->parentId, 'position' => $entry->position, 'uri' => $entry->uri])];
            },
            'handler' => fn (array $in, AbilityContext $ctx) => $move($in, $ctx)->toArray(),
        ]);

        $a->register('entries/reorder', [
            'label' => 'Reorder Entries',
            'description' => 'Set the order of sibling entries (and move them under parentId for trees).',
            'permission' => $collectionPermission('edit'),
            'annotations' => ['idempotent' => true],
            'input' => ['type' => 'object', 'properties' => [
                'collection' => self::HANDLE,
                'ids' => ['type' => 'array', 'items' => self::ID, 'maxItems' => 1000],
                'parentId' => ['type' => ['string', 'null'], 'default' => null],
                'versions' => ['type' => 'object', 'additionalProperties' => self::VERSION],
            ], 'required' => ['collection', 'ids']],
            'output' => Shapes::ok(),
            'dryRun' => function (array $in, AbilityContext $ctx) use ($reorder): array {
                $this->dry(fn () => $reorder($in, $ctx));

                return [['action' => 'reorder', 'type' => 'entries', 'collection' => $in['collection'], 'parentId' => $in['parentId'], 'ids' => array_values(array_unique($in['ids']))]];
            },
            'handler' => $reorder,
        ]);

        $a->register('revisions/list', [
            'label' => 'Entry History',
            'description' => 'Revisions of an entry (entryId), newest first.',
            'permission' => fn (?User $user, array $in) => $this->allowed($user, $this->collectionOf((string) ($in['entryId'] ?? '')), 'view'),
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['entryId' => self::ID], 'required' => ['entryId']],
            'output' => Shape::of([[
                'id' => Shape::STRING, 'action' => Shape::STRING, 'title' => Shape::STRING_OR_NULL, 'message' => Shape::STRING_OR_NULL,
                'user' => Shape::nullable(['id' => Shape::STRING, 'name' => Shape::STRING, 'initials' => Shape::STRING]), 'createdAt' => Shape::STRING,
            ]]),
            'handler' => fn (array $in) => app(\Cms\Content\Revisions\Revisions::class)->list($in['entryId']),
        ]);

        $a->register('revisions/get', [
            'label' => 'Get Revision',
            'description' => 'A single revision snapshot, by the revision\'s id (revisions/list has them).',
            'permission' => fn (?User $user, array $in) => ($rev = app(\Cms\Content\Revisions\Revisions::class)->find((string) $in['id'])) && $this->allowed($user, $this->collectionOf($rev['entryId']), 'view'),
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => self::ID], 'required' => ['id']],
            'output' => Shape::of(['id' => Shape::STRING, 'entryId' => Shape::STRING, 'action' => Shape::STRING, 'snapshot' => Shape::nullable([
                    'title' => Shape::STRING, 'slug' => Shape::STRING, 'status' => Shape::STRING, 'data' => self::values(), 'authorId' => Shape::STRING_OR_NULL,
                    // The working copy a published entry had beside it: what differed from the above.
                    'draft' => Shape::nullable(['title?' => Shape::STRING, 'slug?' => Shape::STRING, 'data?' => self::values(), 'authorId?' => Shape::STRING_OR_NULL]),
                    'parentId' => Shape::STRING_OR_NULL, 'publishedAt' => Shape::STRING_OR_NULL, 'expiresAt?' => Shape::STRING_OR_NULL,
                ]), 'createdAt' => Shape::STRING]),
            'handler' => fn (array $in) => app(\Cms\Content\Revisions\Revisions::class)->find($in['id']) ?? throw new AbilityException('Revision not found.', 'not_found'),
        ]);

        $a->register('revisions/restore', [
            'label' => 'Restore Revision',
            'description' => 'Restore an entry to a previous revision (as a draft for published entries).',
            'permission' => fn (?User $user, array $in) => ($rev = app(\Cms\Content\Revisions\Revisions::class)->find((string) $in['revisionId'])) && $this->allowed($user, $this->collectionOf($rev['entryId']), 'edit'),
            'input' => ['type' => 'object', 'properties' => ['revisionId' => self::ID, 'expectedVersion' => self::VERSION], 'required' => ['revisionId']],
            'answer' => $this->answer('restored'),
            'output' => Shapes::entry(),
            'dryRun' => fn (array $in, AbilityContext $ctx): array => $this->dry(function () use ($in, $ctx, $restore): array {
                $revision = app(\Cms\Content\Revisions\Revisions::class)->find($in['revisionId']);
                $before = $revision ? ($this->cms->entries()->find($revision['entryId'])?->working() ?? []) : [];
                $entry = $restore($in, $ctx);

                return $this->withTranslations([$this->change('restore', $entry, ['revisionId' => $in['revisionId'], 'fields' => self::changed($before, $entry->working())])]);
            }),
            'handler' => fn (array $in, AbilityContext $ctx) => $restore($in, $ctx)->toArray(),
        ]);

        $a->register('entries/get-many', [
            'label' => 'Look Up Entries',
            'description' => 'Summaries for a list of entry ids (any collection you can view), in the given order.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['ids' => ['type' => 'array', 'items' => ['type' => 'string'], 'maxItems' => 200]], 'required' => ['ids']],
            'output' => Shape::of([Shapes::entrySummary()]),
            'handler' => fn (array $in, AbilityContext $ctx) => array_values(array_map(
                static fn (Entry $e) => $e->toSummary(),
                array_filter($this->cms->entries()->findMany($in['ids']), fn (Entry $e) => $ctx->system || $this->allowed($ctx->user, $e->collection, 'view'))
            )),
        ]);

        $a->register('references/list', [
            'label' => 'List References',
            'description' => 'The entries that name an entry, across the collections you can view: what links to it. An entry names another when its data has the other\'s id anywhere: a relation or terms field at any depth (groups, rows of a repeater or a matrix), a link field, a link or a relation in a block. Read it before deleting an entry others point at. `fields` says in which of its fields each one names it.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => [
                'id' => self::ID,
                'page' => ['type' => 'integer', 'minimum' => 1, 'default' => 1],
                'perPage' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 200, 'default' => 25],
            ], 'required' => ['id']],
            'output' => Shape::page(Shapes::entrySummary()->with(['fields' => [Shape::STRING]]), ['perPage' => Shape::INTEGER]),
            'handler' => function (array $in, AbilityContext $ctx) {
                $target = $this->cms->entries()->find($in['id']) ?? throw new AbilityException(__('This entry no longer exists.'), 'not_found');
                $handles = array_values(array_filter(array_keys($this->cms->collections()->all()), fn ($h) => $ctx->system || $this->allowed($ctx->user, $h, 'view')));

                if ($handles === []) {
                    return ['items' => [], 'total' => 0, 'page' => 1, 'perPage' => $in['perPage'], 'pages' => 1];
                }

                $page = $this->cms->entries()->query()->working()->ungated()->collection(...$handles)->references($target->id)->orderBy('title')->paginate($in['perPage'], $in['page']);
                // The top-level fields whose value has the id somewhere in it.
                $fields = static fn (Entry $e): array => array_values(array_map('strval', array_keys(array_filter(
                    (array) $e->working()['data'],
                    static fn (mixed $value) => str_contains(strtolower((string) json_encode($value)), $target->id),
                ))));

                return [...$page, 'items' => array_map(static fn (Entry $e) => [...$e->toSummary(), 'fields' => $fields($e)], $page['items'])];
            },
        ]);

        $taxonomy = fn (string $handle): Collection => ($c = $this->cms->collections()->find($handle)) && $c->isTaxonomy() ? $c : throw new AbilityException(__('This taxonomy does not exist.'), 'not_found');

        $a->register('terms/list', [
            'label' => 'List Terms',
            'description' => 'The terms of a taxonomy (a collection marked `taxonomy: true`) with how many entries are filed under each: `count` counts the entries of any collection that name the term in a relation field, drafts included. Terms are entries: create, rename, translate, nest and delete them with the entries abilities, in the taxonomy\'s collection.',
            'permission' => fn (?User $user, array $in) => $this->allowed($user, (string) ($in['taxonomy'] ?? ''), 'view'),
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => [
                'taxonomy' => self::HANDLE,
                'locale' => ['type' => 'string'],
                'search' => ['type' => 'string', 'maxLength' => 200],
                'page' => ['type' => 'integer', 'minimum' => 1, 'default' => 1],
                'perPage' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 200, 'default' => 50],
            ], 'required' => ['taxonomy']],
            'output' => Shape::page(Shapes::entrySummary()->with(['count' => Shape::INTEGER]), ['perPage' => Shape::INTEGER]),
            'handler' => function (array $in) use ($taxonomy) {
                $collection = $taxonomy($in['taxonomy']);
                $page = $this->cms->entries()->query()->working()->ungated()->collection($collection->handle)->locale($in['locale'] ?? $this->cms->defaultLocale())
                    ->search($in['search'] ?? null)->orderBy($collection->sort)->orderBy('title')->paginate($in['perPage'], $in['page']);

                // Every term of the page counted in one pass over the entries, not a query per term.
                $counts = $this->cms->entries()->query()->working()->ungated()->referenceCounts(array_map(static fn (Entry $term) => $term->id, $page['items']));

                return [...$page, 'items' => array_map(static fn (Entry $term) => [...$term->toSummary(), 'count' => $counts[$term->id] ?? 0], $page['items'])];
            },
        ]);

        // From free tags to terms, written once: the handler runs it, a dry run runs the same in the entry service's dry mode.
        $import = function (array $in, AbilityContext $ctx) use ($taxonomy, $content): array {
            $collection = $this->cms->collections()->find($in['collection']) ?? throw new AbilityException('Collection not found.', 'not_found');
            $from = $collection->field($in['from']);
            $into = $collection->field($in['into']);

            if ($from?->type !== 'tags' || $into?->type !== 'terms') {
                throw AbilityException::invalid(__('`from` must be a tags field and `into` a terms field of this collection.'));
            }

            $terms = $taxonomy((string) $into->get('taxonomy'));
            // The terms there are, by language: found by their title first, since a title is what a tag is; then by slug.
            $byTitle = [];
            $bySlug = [];

            foreach ($this->cms->entries()->query()->working()->ungated()->collection($terms->handle)->get() as $term) {
                $byTitle[$term->locale][mb_strtolower(trim((string) $term->working()['title']))] ??= $term->id;
                $bySlug[$term->locale][(string) $term->working()['slug']] = (string) $term->working()['title'];
            }

            $created = [];
            $collisions = [];
            $updated = [];

            foreach ($this->cms->entries()->query()->working()->ungated()->collection($collection->handle)->get() as $entry) {
                $data = $entry->working()['data'];
                $ids = [];

                foreach (array_filter((array) ($data[$from->handle] ?? []), static fn ($tag) => is_string($tag) && trim($tag) !== '') as $tag) {
                    $tag = trim($tag);
                    $key = mb_strtolower($tag);

                    if (! isset($byTitle[$entry->locale][$key])) {
                        // A slug of the tag's own letters; one made of its bytes when it has none a slug can keep ("日本").
                        $slug = \Illuminate\Support\Str::slug($tag) ?: 'term-'.substr(hash('sha256', $key), 0, 8);

                        // Another word already has this slug ("C#" beside "C++"): this one gets a slug of its own, and it is said.
                        if (isset($bySlug[$entry->locale][$slug])) {
                            $taken = $slug;
                            $slug .= '-'.substr(hash('sha256', $key), 0, 6);
                            $collisions[] = ['action' => 'collision', 'type' => 'term', 'tag' => $tag, 'slug' => $slug, 'existing' => $bySlug[$entry->locale][$taken], 'locale' => $entry->locale];
                        }

                        $term = $content()->create($terms->handle, ['title' => $tag, 'slug' => $slug, 'locale' => $entry->locale, 'status' => 'published'], $ctx->user);
                        $created[] = ['action' => 'create-published', 'type' => 'entry', 'collection' => $terms->handle, 'title' => $term->title, 'slug' => $term->slug, 'locale' => $term->locale];
                        $byTitle[$entry->locale][$key] = $term->id;
                        $bySlug[$entry->locale][$term->slug] = $tag;
                    }

                    $ids[] = $byTitle[$entry->locale][$key];
                }

                $merged = array_values(array_unique([...array_filter((array) ($data[$into->handle] ?? []), 'is_string'), ...$ids]));
                $change = [$into->handle => $merged, ...($in['clear'] ? [$from->handle => []] : [])];

                if ($ids === [] || ($merged === ($data[$into->handle] ?? []) && ! $in['clear'])) {
                    continue;
                }

                // What is published stays as it is published, on its own date (a scheduled entry stays scheduled); an entry with changes waiting keeps them waiting.
                $republish = $entry->isPublished() && ! $entry->hasDraft();
                $content()->update($entry->id, ['data' => $change, ...($republish && $entry->publishedAt ? ['at' => $entry->publishedAt->toIso8601String()] : [])], $ctx->user, publish: $republish);
                $updated[] = ['action' => 'update', 'type' => 'entry', 'id' => $entry->id, 'collection' => $entry->collection, 'title' => $entry->working()['title'], 'fields' => array_keys($change)];
            }

            return [...$created, ...$collisions, ...$updated];
        };

        $a->register('terms/import', [
            'label' => 'Import Terms from Tags',
            'description' => 'Turn the free tags of a collection into terms of a taxonomy: every tag of the tags field `from` becomes a published term of the taxonomy the terms field `into` picks from (found by its title, whatever its case, and created when it is not there, in the entry\'s language; a tag whose slug another term already has gets a slug of its own and is listed under `collisions`, in a dry run as a change with action `collision`), and each entry gets its terms in `into`, added to those it has. `clear: true` empties the tags afterwards. Published entries without waiting changes stay published with their terms, on the date they had (a scheduled one stays scheduled); others get them in their draft. Running it again changes nothing.',
            'permission' => fn (?User $user, array $in) => $this->allowed($user, (string) ($in['collection'] ?? ''), 'edit') && $this->allowed($user, (string) ($in['collection'] ?? ''), 'publish')
                && $this->allowed($user, (string) ($this->cms->collections()->find((string) ($in['collection'] ?? ''))?->field((string) ($in['into'] ?? ''))?->get('taxonomy') ?? ''), 'publish'),
            'input' => ['type' => 'object', 'properties' => [
                'collection' => self::HANDLE,
                'from' => ['type' => 'string', 'format' => 'handle', 'description' => 'The tags field to read.'],
                'into' => ['type' => 'string', 'format' => 'handle', 'description' => 'The terms field to fill.'],
                'clear' => ['type' => 'boolean', 'default' => false, 'description' => 'Empty the tags field of each entry afterwards.'],
            ], 'required' => ['collection', 'from', 'into']],
            'output' => Shape::of(['terms' => Shape::INTEGER, 'entries' => Shape::INTEGER, 'collisions' => [Shape::of(['tag' => Shape::STRING, 'slug' => Shape::STRING, 'existing' => Shape::STRING, 'locale' => Shape::STRING])]]),
            'dryRun' => fn (array $in, AbilityContext $ctx): array => $this->dry(fn () => $import($in, $ctx)),
            'handler' => function (array $in, AbilityContext $ctx) use ($import, $content): array {
                $changes = $content()->write(fn () => $import($in, $ctx));

                $of = static fn (string $action) => array_values(array_filter($changes, static fn (array $c) => $c['action'] === $action));

                return ['terms' => count($of('create-published')), 'entries' => count($of('update')), 'collisions' => array_map(static fn (array $c) => array_diff_key($c, ['action' => 1, 'type' => 1]), $of('collision'))];
            },
        ]);

        $a->register('content/recent', [
            'label' => 'Recently Edited',
            'description' => 'The most recently changed entries across collections you can view (ones never changed here, like files that came with the site, are not listed).',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 50, 'default' => 10]]],
            'output' => Shape::of([Shapes::entrySummary()]),
            'handler' => function (array $in, AbilityContext $ctx) {
                $handles = array_values(array_filter(array_keys($this->cms->collections()->all()), fn ($h) => $ctx->system || $this->allowed($ctx->user, $h, 'view')));

                return $handles === [] ? [] : array_map(static fn (Entry $e) => $e->toSummary(), $this->cms->entries()->query()->working()->collection(...$handles)->where('updated_at', 'not null', null)->orderBy('-updated_at')->limit($in['limit'])->get());
            },
        ]);

        $a->register('content/search', [
            'label' => 'Search Content',
            'description' => 'Find entries across collections, ranking title and slug matches before content matches.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => [
                'query' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 200],
                'collections' => ['type' => 'array', 'items' => ['type' => 'string']],
                'limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 50, 'default' => 10],
            ], 'required' => ['query']],
            'output' => Shape::of([Shapes::entrySummary()]),
            'handler' => function (array $in, AbilityContext $ctx) {
                $handles = array_values(array_filter(
                    $in['collections'] ?? array_keys($this->cms->collections()->all()),
                    fn ($h) => $this->allowed($ctx->user, $h, 'view') || $ctx->system
                ));

                if ($handles === []) {
                    return [];
                }

                return array_map(static fn (Entry $e) => $e->toSummary(), $this->cms->entries()->query()->working()->collection(...$handles)->search($in['query'])->orderByRelevance()->orderBy('-updated_at')->orderBy('title')->limit($in['limit'])->get());
            },
        ]);
    }

    /**
     * Summaries for list screens: each with its author, the languages it is translated
     * into (multilingual sites) and the requested data `fields` under `values` — entry
     * and user relations resolved to titles and names so a table can show them as is.
     *
     * @param  list<Entry>  $entries
     * @param  list<string>  $fields
     * @return list<array<string, mixed>>
     */
    private function listItems(Collection $collection, array $entries, array $fields): array
    {
        $fields = array_values(array_filter(array_map(static fn (string $handle) => $collection->field($handle), array_unique($fields))));
        $data = array_map(static fn (Entry $e) => (array) ($e->working()['data'] ?? []), $entries);
        $ids = static fn (mixed $value) => array_values(array_filter((array) $value, static fn ($id) => is_string($id) && $id !== ''));

        // Every user and entry the page refers to, in two queries.
        $userIds = array_map(static fn (Entry $e) => $e->working()['authorId'], $entries);
        $entryIds = [];

        foreach ($fields as $field) {
            foreach ($data as $values) {
                if ($field->type === 'users') {
                    array_push($userIds, ...$ids($values[$field->handle] ?? null));
                } elseif ($field->type === 'entries') {
                    array_push($entryIds, ...$ids($values[$field->handle] ?? null));
                }
            }
        }

        $userIds = array_values(array_unique(array_filter($userIds)));
        $users = $userIds === [] ? [] : User::query()->whereIn('id', $userIds)->get()->mapWithKeys(static fn (User $u) => [$u->id => $u->toPerson()])->all();
        $related = [];

        foreach ($this->cms->entries()->findMany(array_values(array_unique($entryIds))) as $entry) {
            $related[$entry->id] = ['id' => $entry->id, 'collection' => $entry->collection, 'title' => (string) ($entry->working()['title'] ?? $entry->title)];
        }

        $translations = [];

        if (count($this->cms->locales()) > 1 && $entries !== []) {
            $origins = array_values(array_unique(array_map(static fn (Entry $e) => $e->originId ?? $e->id, $entries)));
            $siblings = [
                ...$this->cms->entries()->query()->collection($collection->handle)->where('origin_id', 'in', $origins)->get(),
                ...$this->cms->entries()->query()->collection($collection->handle)->where('id', 'in', $origins)->get(),
            ];

            foreach ([...$entries, ...$siblings] as $entry) {
                $translations[$entry->originId ?? $entry->id][$entry->locale] = true;
            }
        }

        return array_map(function (Entry $entry, array $values) use ($fields, $users, $related, $translations, $ids): array {
            $item = [...$entry->toSummary(false), 'author' => $users[$entry->working()['authorId']] ?? null];

            if ($translations !== []) {
                $item['translations'] = array_keys($translations[$entry->originId ?? $entry->id] ?? [$entry->locale => true]);
            }

            if ($fields !== []) {
                $item['values'] = (object) array_combine(
                    array_map(static fn ($f) => $f->handle, $fields),
                    array_map(static fn ($f) => match ($f->type) {
                        'users' => array_values(array_filter(array_map(static fn ($id) => $users[$id] ?? null, $ids($values[$f->handle] ?? null)))),
                        'entries' => array_values(array_filter(array_map(static fn ($id) => $related[strtolower($id)] ?? null, $ids($values[$f->handle] ?? null)))),
                        default => $values[$f->handle] ?? null,
                    }, $fields),
                );
            }

            return $item;
        }, $entries, $data);
    }

    /**
     * What entries of a collection must look like, as JSON Schema: their data, and the input of entries/create
     * and entries/update with that data in place of the free object the abilities declare for every collection.
     */
    public static function schemaOf(Cms $cms, Collection $collection): array
    {
        // One set of schemas per blueprint: the collection's own fields, then each named one.
        $of = static function (?string $name) use ($cms, $collection): array {
            $data = $collection->blueprint($name)->schema();
            $draft = $collection->blueprint($name)->schema(partial: true);
            $input = static function (string $ability) use ($cms, $collection, $draft, $name): array {
                $schema = $cms->abilities()->get($ability)?->input() ?? ['type' => 'object'];
                $schema['properties']['data'] = [...$draft, 'description' => 'Field values by handle. To publish, required fields must be filled (see `data`).'];

                if (isset($schema['properties']['collection'])) {
                    $schema['properties']['collection'] = ['const' => $collection->handle];
                }

                if ($name !== null && isset($schema['properties']['blueprint'])) {
                    $schema['properties']['blueprint'] = ['const' => $name];
                    $schema['required'] = [...(array) ($schema['required'] ?? []), 'blueprint'];
                }

                return $schema;
            };

            return ['data' => $data, 'draft' => $draft, 'create' => $input('entries/create'), 'update' => $input('entries/update')];
        };
        $named = $collection->blueprints();

        return [
            'handle' => $collection->handle, 'title' => $collection->title, ...$of(null),
            ...($named === [] ? [] : ['blueprints' => array_map(static fn (string $name, array $blueprint) => ['handle' => $name, 'title' => $blueprint['title'], ...$of($name)], array_keys($named), $named)]),
        ];
    }

    /** An entry as a list screen has it: its summary, the languages it is in (multilingual sites) and the `fields` asked for. */
    private static function listed(): Shape
    {
        return Shape::of(self::listedKeys());
    }

    /** @return array<string, mixed> */
    private static function listedKeys(): array
    {
        return [
            ...Shapes::entrySummaryKeys(), 'author' => Shape::nullable(Shapes::person()),
            'translations?' => [Shape::STRING],
            'editingBy?' => Shape::STRING,
            'values?' => Shape::open('The data fields asked for with `fields`, by handle: a users field as a list of people ({id, name, initials, avatar}), an entries field as a list of {id, collection, title}, any other as it is stored (the collection\'s schema is in collections/get).'),
        ];
    }

    /** An entry's field values, as a revision keeps them. */
    private static function values(): Shape
    {
        return Shape::open('Field values by field handle; what each may be is the collection\'s schema (collections/get).');
    }

    /** For a dry run: what the handler does, done in the entry service's dry mode — checked the same, nothing written. */
    private function dry(\Closure $run): mixed
    {
        return $this->cms->entryService()->dry($run);
    }

    /**
     * A dry run's changes, with the translations the same run would rewrite: a change to shared fields
     * (`localizable: false`) of an original is a change to every language of it.
     */
    private function withTranslations(array $changes): array
    {
        return [...$changes, ...array_map(fn (Entry $translation) => $this->change('update', $translation, ['locale' => $translation->locale, 'fields' => $translation->blueprint()->shared(), 'because' => 'shared fields of its original']), $this->cms->entryService()->sharedWith())];
    }

    /** One line of a dry run's report: what would happen to which entry, named as it would be afterwards. One not made yet has no id. */
    private function change(string $action, Entry $entry, array $more = [], bool $id = true): array
    {
        return ['action' => $action, 'type' => 'entry', ...($id ? ['id' => $entry->id] : []), 'collection' => $entry->collection, 'title' => $entry->working()['title'], ...$more];
    }

    /**
     * What differs between an entry's working content before and after: `title`, `slug`, `authorId` and the
     * handles of its fields (of `$fields` only, when given: the ones a caller sent).
     *
     * @return list<string>
     */
    private static function changed(array $before, array $after, ?array $fields = null): array
    {
        $same = static fn (mixed $a, mixed $b): bool => json_encode($a) === json_encode($b);
        $changed = array_values(array_filter(['title', 'slug', 'authorId'], static fn (string $key) => ! $same($before[$key] ?? null, $after[$key] ?? null)));
        $was = (array) ($before['data'] ?? []);
        $is = (array) ($after['data'] ?? []);

        foreach ($fields ?? array_unique([...array_keys($was), ...array_keys($is)]) as $handle) {
            if (! $same($was[$handle] ?? null, $is[$handle] ?? null)) {
                $changed[] = (string) $handle;
            }
        }

        return $changed;
    }

    private function allowed(?User $user, string $collection, string $action): bool
    {
        return $user !== null && $collection !== '' && $user->hasPermission("entries.{$collection}.{$action}");
    }

    /** The collection an entry is in. One that is gone is said to be gone, not forbidden: a button left on view finds out. */
    private function collectionOf(string $id): string
    {
        return $this->cms->entries()->find($id)?->collection ?? throw new AbilityException(__('This entry no longer exists.'), 'not_found');
    }
}

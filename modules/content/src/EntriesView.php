<?php

declare(strict_types=1);

namespace Cms\Modules\Content;

use Cms\Admin\Translations;
use Cms\Cms;
use Cms\Content\Collections\Collection;
use Cms\Users\User;

/**
 * A collection's entries as the catalog's `ui/records`: search, status and language, the tree
 * (dragged into order) or a sort, table, grid or calendar, the columns its fields offer, what
 * each row and a selection can do. Drawn by the same renderer as every other list, so a
 * plugin's lists work exactly like these. The pages a feature brings get a list of their own
 * beside the site's pages, in the same columns.
 */
final class EntriesView
{
    /** How wide a field's column is, by its type; a type not listed has no column. */
    private const array WIDTHS = [
        'text' => '180px', 'textarea' => 'minmax(160px,0.8fr)', 'select' => '132px', 'toggle' => '80px', 'date' => '112px', 'number' => '96px', 'entries' => '180px', 'users' => '132px',
        'tags' => '180px', 'media' => '64px', 'url' => '180px', 'email' => '180px', 'slug' => '160px', 'color' => '112px',
    ];

    /** How many of a collection's fields its list offers as columns: with its own ten at most, within the catalog's sixty. */
    private const int FIELD_COLUMNS = 50;

    /** The types entries/list can sort by. */
    private const array SORTABLE = ['text', 'select', 'toggle', 'date', 'number', 'url', 'email', 'slug', 'color'];

    public function __construct(private readonly Cms $cms, private readonly int $perPage) {}

    public function records(Collection $collection, User $user): array
    {
        $handle = $collection->handle;
        $can = fn (string $action) => $user->hasPermission("entries.{$handle}.{$action}");
        $locales = $this->cms->locales();
        $fields = $this->fields($collection);
        $columns = $this->columns($collection, $fields, $locales);
        // The values the field columns show, loaded with each entry.
        $values = array_values(array_map(static fn ($c) => substr($c['key'], 7), array_filter($columns, static fn ($c) => str_starts_with($c['key'], 'values.'))));
        $media = array_values(array_filter($fields, static fn ($f) => $f['type'] === 'media'));
        $dated = $collection->isDated() || $collection->defaultView === 'calendar';
        $entry = ['id' => '{row.id}', 'expectedVersion' => '{row.version}'];
        $open = "/content/{$handle}/{row.id}";
        $plain = ['collection' => $handle, 'locale' => '{query.locale}', 'fields' => $values];

        $records = [
            'id' => "entries.{$handle}", 'label' => __($collection->title), 'key' => 'id', 'address' => true,
            'source' => ['ability' => 'entries/list', 'input' => [...$plain, 'status' => '{query.status}']],
            'columns' => $columns,
            'search' => ['param' => 'search', 'placeholder' => __('Search :items', ['items' => __($collection->title)])],
            'filters' => [
                ['param' => 'status', 'label' => __('Status'), 'display' => 'segmented', 'default' => 'any', 'options' => array_map(static fn ($value, $label) => ['value' => $value, 'label' => $label], ['any', 'active', 'draft', 'expired'], [__('All'), __('Published'), __('Drafts'), __('Expired')])],
                ...(count($locales) > 1 ? [['param' => 'locale', 'label' => __('Language'), 'display' => 'language', 'default' => $this->cms->defaultLocale(), 'options' => array_map(fn (string $code) => ['value' => $code, 'label' => strtoupper($code), 'title' => self::languageName($code)], $locales)]] : []),
            ],
            'paged' => ['perPage' => $this->perPage],
            // The collection's own order while nobody picked one: the tree, for pages.
            'sort' => ['param' => 'sort', ...($collection->isTree() ? [] : ['default' => $collection->sort !== '' ? $collection->sort : ($collection->isDated() ? '-published_at' : 'title')])],
            'dates' => ['published' => 'published_at', 'updated' => 'updated_at'],
            'open' => ['label' => __('Open'), 'to' => $open],
            'actions' => [
                // A page someone can see is a click away.
                ['label' => __('View on Site'), 'icon' => 'external', 'inline' => true, 'href' => '{row.uri}', 'when' => '{row.uri}', 'unless' => '{row.displayStatus} is draft, scheduled, expired'],
                // The row itself opens it; in the menu, beside a pencil, the act has its name, for those who may do it.
                ['label' => __('Edit'), 'icon' => 'edit', 'to' => $open, 'can' => "entries.{$handle}.edit"],
                ['label' => __('Duplicate'), 'icon' => 'copy', 'ability' => 'entries/duplicate', 'input' => $entry, 'then' => 'open', 'to' => "/content/{$handle}/{result.id}", 'can' => "entries.{$handle}.create"],
                ['label' => __('Publish'), 'icon' => 'rocket', 'ability' => 'entries/publish', 'input' => $entry, 'success' => __('Published'), 'when' => '{row.displayStatus} is draft, changed, expired', 'can' => "entries.{$handle}.publish"],
                ['label' => __('Unpublish'), 'icon' => 'eye-off', 'ability' => 'entries/unpublish', 'input' => $entry, 'success' => __('Unpublished'), 'unless' => '{row.displayStatus} is draft', 'can' => "entries.{$handle}.publish"],
                ['label' => __('Copy URL'), 'icon' => 'link', 'copy' => '{origin}{row.uri}', 'success' => __('URL copied'), 'when' => '{row.uri}'],
                ['label' => __('Delete'), 'icon' => 'trash', 'variant' => 'danger', 'ability' => 'entries/delete', 'input' => $entry, 'success' => __('Deleted'), 'can' => "entries.{$handle}.delete",
                    'confirm' => ['title' => str_replace('{title}', '{row.title}', __('Delete “{title}”?')), 'text' => __('This cannot be undone.'), 'confirm' => __('Delete'), 'danger' => true]],
            ],
            'bulk' => [
                ['label' => __('Publish'), 'each' => true, 'ability' => 'entries/publish', 'input' => $entry, 'some' => '{row.displayStatus} is draft, changed, expired', 'can' => "entries.{$handle}.publish",
                    'success' => ['one' => __('Published {count} entry'), 'other' => __('Published {count} entries')]],
                ['label' => __('Unpublish'), 'each' => true, 'ability' => 'entries/unpublish', 'input' => $entry, 'some' => '{row.displayStatus} is not draft', 'can' => "entries.{$handle}.publish",
                    'success' => ['one' => __('Unpublished {count} entry'), 'other' => __('Unpublished {count} entries')]],
                ['label' => __('Delete'), 'each' => true, 'ability' => 'entries/delete', 'input' => $entry, 'can' => "entries.{$handle}.delete",
                    'confirm' => ['title' => ['one' => __('Delete {count} entry?'), 'other' => __('Delete {count} entries?')], 'text' => __('This cannot be undone.'), 'confirm' => __('Delete'), 'danger' => true],
                    'success' => ['one' => __('Deleted {count} entry'), 'other' => __('Deleted {count} entries')]],
            ],
            'empty' => ['icon' => $collection->icon, 'title' => __('No :items yet', ['items' => __($collection->title)])],
            'defaultView' => $defaultView = in_array($collection->defaultView, ['grid', 'calendar'], true) ? $collection->defaultView : 'table',
            // The person's saved views of this list, beside Display: what narrows the list is what a view can keep.
            'controls' => ['component' => 'content/views', 'props' => ['list' => "entries.{$handle}", 'defaultView' => $defaultView, 'params' => ['search', 'status']]],
            ...($dated ? ['calendar' => [
                'dated' => ['sort' => '{field}', 'filters' => [['field' => '{field}', 'operator' => '>=', 'value' => '{start}'], ['field' => '{field}', 'operator' => '<', 'value' => '{end}']]],
                'undated' => ['sort' => '-updated_at', 'filters' => [['field' => '{field}', 'operator' => 'null']]],
            ]] : []),
        ];

        if ($collection->isTree()) {
            // A published page moves only for those who may publish it.
            $records['tree'] = ['source' => ['ability' => 'entries/tree', 'input' => $plain], 'version' => 'version', 'reorder' => [
                'label' => __('Drag to Reorder'), 'ability' => 'entries/reorder', 'can' => "entries.{$handle}.edit",
                'input' => ['collection' => $handle, 'ids' => '{ids}', 'parentId' => '{parent}', 'versions' => '{versions}'],
                ...($can('publish') ? [] : ['when' => '{row.status} is not published']),
            ]];
        }

        // Cards show the first picture.
        if ($media !== []) {
            foreach ($records['columns'] as $i => $column) {
                if ($column['key'] === 'values.'.$media[0]['handle']) {
                    $records['columns'][$i]['image'] = true;
                }
            }
        }

        return $records;
    }

    /**
     * The pages one feature brings (sign in, checkout), as a list beside the site's own pages: the
     * same columns and statuses, where "Standard" is the version the feature ships. A row opens the
     * site's own version, made from the standard one the first time.
     */
    public function builtin(array $group): array
    {
        $page = ['group' => $group['id'], 'handle' => '{row.handle}'];
        $entry = ['id' => '{row.id}', 'expectedVersion' => '{row.version}'];
        $open = ['label' => __('Open'), 'ability' => 'pages/customize', 'input' => $page, 'then' => 'open', 'to' => '/content/{result.collection}/{result.id}', 'when' => '{row.opens}'];

        return [
            'id' => "builtin.{$group['id']}", 'label' => __($group['label']), 'key' => 'handle', 'display' => false,
            'source' => ['ability' => 'pages/builtin', 'input' => ['group' => $group['id']]], 'at' => '0.pages',
            'columns' => [
                ['key' => 'label', 'label' => __('Title'), 'width' => 'minmax(200px,1fr)'],
                ['key' => 'path', 'label' => __('URL'), 'format' => 'address', 'fit' => true, 'empty' => __('Shown inside other pages')],
                // Which version the site shows is one thing, how that version stands another: the standard one is live, so it is Published. A customized
                // version only drafted is not on the site yet: the site still shows the Standard one.
                ['key' => 'status', 'label' => __('Version'), 'width' => '120px',
                    'labels' => ['standard' => __('Standard'), 'conflict' => __('Standard'), 'customised' => __('Customized'), 'draft' => __('Standard')]],
                ['key' => 'displayStatus', 'label' => __('Status'), 'format' => 'status', 'width' => '128px',
                    'tones' => ['conflict' => 'warning'], 'labels' => ['conflict' => __('Address Taken')]],
                ['key' => 'published', 'label' => __('Published')],
                ['key' => 'updated', 'label' => __('Updated')],
            ],
            'open' => $open,
            'actions' => [
                ['label' => __('View on Site'), 'icon' => 'external', 'inline' => true, 'href' => '{row.href}', 'when' => '{row.href}'],
                ['icon' => 'edit', ...$open, 'label' => __('Edit')],
                ['label' => __('Copy URL'), 'icon' => 'link', 'copy' => '{origin}{row.href}', 'success' => __('URL copied'), 'when' => '{row.href}'],
                // Back to what the feature ships: the site's own version goes, with its history.
                ['label' => __('Use Standard Version'), 'icon' => 'undo', 'variant' => 'danger', 'ability' => 'entries/delete', 'input' => $entry, 'success' => __('Back to the standard version'), 'when' => '{row.restorable}',
                    'confirm' => ['title' => str_replace('{title}', '{row.label}', __('Use the standard “{title}”?')), 'text' => __('Your version and its history are deleted. The page shows what comes with the feature.'), 'confirm' => __('Use Standard Version'), 'danger' => true]],
            ],
            'empty' => ['icon' => 'page', 'title' => __('No pages')],
        ];
    }

    /** @return list<array> the collection's fields, named in the user's language */
    private function fields(Collection $collection): array
    {
        return array_values(array_filter(
            app(Translations::class)->fields($collection->blueprint()->toArray(['collection' => $collection])),
            static fn ($f) => is_array($f) && isset($f['handle'], $f['type'])
        ));
    }

    /**
     * Every column the collection's table can show, in their order: the title, its address and
     * state, its fields, its languages and author, its dates. Those the collection shows from the
     * start (its Default Display Fields, or the standard ones) are on; the rest wait in Display.
     */
    private function columns(Collection $collection, array $fields, array $locales): array
    {
        $routable = $collection->routable();
        $excerpt = self::excerpt($fields);
        $media = array_values(array_filter($fields, static fn ($f) => $f['type'] === 'media'))[0] ?? null;
        $shown = [...($collection->defaultColumns ?? [
            ...($routable ? ['uri'] : []), 'status', 'published', 'updated',
        ]), ...($collection->system && ! $routable ? ['used', 'updated'] : [])];
        // Cards show the picture and a few lines too, unless the collection says what to show.
        $cards = $collection->defaultColumns === null ? array_filter([$media ? "field:{$media['handle']}" : null, $excerpt ? "field:{$excerpt['handle']}" : null]) : [];

        // Beside a title, quieter: who is editing that entry right now (`editingBy`), when something that knows says so.
        $columns = [['id' => 'title', 'key' => 'title', 'label' => __('Title'), 'width' => 'minmax(200px,1fr)', 'sort' => 'title', 'empty' => __('Untitled'), 'muted' => 'editingBy', 'mutedWhole' => true]];

        if ($routable) {
            $columns[] = ['id' => 'uri', 'key' => 'uri', 'label' => __('URL'), 'format' => 'address', 'fit' => true, 'sort' => 'uri'];
        }
        // What a site is built from (its templates, its components) is not a page of its own: its list has few columns, so the
        // title keeps to its words and the state stands beside it, and it says where each one is used (`usedBy`, from whoever knows).
        $parts = $collection->system && ! $routable;
        if ($parts) {
            $columns[0]['width'] = 'minmax(200px,420px)';
            $columns[] = ['id' => 'used', 'key' => 'usedBy', 'label' => __('Used By'), 'width' => 'minmax(160px,1fr)', 'empty' => __('Nothing')];
        }
        $columns[] = ['id' => 'status', 'key' => 'displayStatus', 'label' => __('Status'), 'format' => 'status', 'width' => '104px', 'sort' => 'status'];

        $listed = 0;
        foreach ($fields as $field) {
            $type = (string) $field['type'];
            if (! isset(self::WIDTHS[$type]) || in_array($field['handle'], ['title', 'slug'], true) || in_array($field['component'] ?? null, ['title', 'uri'], true)) {
                continue;
            }
            // The first fields that fit, beside the list's own columns, within what `ui/records` takes.
            if (++$listed > self::FIELD_COLUMNS) {
                break;
            }
            $columns[] = [
                'id' => "field:{$field['handle']}", 'key' => "values.{$field['handle']}", 'label' => (string) (($field['label'] ?? '') ?: $field['handle']),
                'format' => 'field', 'field' => ['type' => $type, ...(isset($field['options']) ? ['options' => $field['options']] : [])],
                'width' => self::WIDTHS[$type], ...(in_array($type, self::SORTABLE, true) ? ['sort' => $field['handle']] : []),
                ...($type === 'number' ? ['align' => 'end'] : []), ...($excerpt && $excerpt['handle'] === $field['handle'] ? ['excerpt' => true] : []),
            ];
        }

        if (count($locales) > 1) {
            $columns[] = ['id' => 'translations', 'key' => 'translations', 'label' => __('Languages'), 'format' => 'languages', 'locales' => $locales, 'width' => (24 + count($locales) * 26).'px'];
        }
        $columns[] = ['id' => 'author', 'key' => 'author', 'label' => __('Author'), 'format' => 'person', 'width' => '132px', 'sort' => 'author_id', 'empty' => __('Unassigned')];
        $columns[] = ['id' => 'published', 'key' => 'published', 'label' => __('Published')];
        // When its publication ends, for those it does: a column to show, off until asked for. A date as the
        // dates beside it are written: short, and marked while it is still to come.
        $columns[] = ['id' => 'ends', 'key' => 'expiresAt', 'label' => __('Ends'), 'format' => 'field', 'field' => ['type' => 'date'], 'empty' => '—', 'width' => '112px', 'sort' => 'expires_at'];
        $columns[] = ['id' => 'updated', 'key' => 'updated', 'label' => __('Updated')];

        // Default Display Fields name columns as collection settings do (`field:<handle>`, `uri`, `author`).
        return array_map(static fn ($c) => array_diff_key($c['id'] === 'title' ? $c : [...$c, 'hidden' => ! in_array($c['id'], $shown, true), ...(in_array($c['id'], $cards, true) ? ['card' => true] : [])], ['id' => 0]), $columns);
    }

    /** The first field of words: a card's few lines. */
    private static function excerpt(array $fields): ?array
    {
        foreach ($fields as $field) {
            if ($field['type'] === 'textarea' || ($field['type'] === 'text' && ! in_array($field['handle'], ['title', 'slug'], true))) {
                return $field;
            }
        }

        return null;
    }

    /** "Deutsch" for "de", in the language itself. */
    private static function languageName(string $code): string
    {
        $name = class_exists(\Locale::class) ? (string) \Locale::getDisplayLanguage($code, $code) : '';

        return $name !== '' && $name !== $code ? mb_strtoupper(mb_substr($name, 0, 1)).mb_substr($name, 1) : $code;
    }
}

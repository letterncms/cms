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
 * each row and a selection can do, and, under the site's pages, the built-in pages. Drawn by
 * the same renderer as every other list, so a plugin's lists work exactly like these.
 */
final class EntriesView
{
    /** How wide a field's column is, by its type; a type not listed has no column. */
    private const array WIDTHS = [
        'text' => '180px', 'textarea' => 'minmax(160px,0.8fr)', 'select' => '132px', 'toggle' => '80px', 'date' => '112px', 'number' => '96px', 'entries' => '180px', 'users' => '132px',
        'tags' => '180px', 'media' => '64px', 'url' => '180px', 'email' => '180px', 'slug' => '160px', 'color' => '112px',
    ];

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
            'search' => ['param' => 'search', 'placeholder' => __('Search {items}…', ['items' => mb_strtolower(__($collection->title))])],
            'filters' => [
                ['param' => 'status', 'label' => __('Status'), 'display' => 'segmented', 'default' => 'any', 'options' => array_map(static fn ($value, $label) => ['value' => $value, 'label' => $label], ['any', 'published', 'draft'], [__('All'), __('Published'), __('Drafts')])],
                ...(count($locales) > 1 ? [['param' => 'locale', 'label' => __('Language'), 'display' => 'segmented', 'default' => $this->cms->defaultLocale(), 'options' => array_map(fn (string $code) => ['value' => $code, 'label' => strtoupper($code), 'title' => self::languageName($code)], $locales)]] : []),
            ],
            'paged' => ['perPage' => $this->perPage],
            // The collection's own order while nobody picked one: the tree, for pages.
            'sort' => ['param' => 'sort', ...($collection->isTree() ? [] : ['default' => $collection->sort !== '' ? $collection->sort : ($collection->isDated() ? '-published_at' : 'title')])],
            'dates' => ['published' => 'published_at', 'updated' => 'updated_at'],
            'open' => ['label' => __('Open'), 'to' => $open],
            'actions' => [
                // A page someone can see is a click away.
                ['label' => __('View on Site'), 'icon' => 'external', 'inline' => true, 'href' => '{row.uri}', 'when' => '{row.uri}', 'unless' => '{row.displayStatus} is draft, scheduled'],
                ['label' => __('Open'), 'icon' => 'edit', 'to' => $open],
                ['label' => __('Duplicate'), 'icon' => 'copy', 'ability' => 'entries/duplicate', 'input' => $entry, 'then' => 'open', 'to' => "/content/{$handle}/{result.id}", 'can' => "entries.{$handle}.create"],
                ['label' => __('Publish'), 'icon' => 'rocket', 'ability' => 'entries/publish', 'input' => $entry, 'success' => __('Published'), 'when' => '{row.displayStatus} is draft, changed', 'can' => "entries.{$handle}.publish"],
                ['label' => __('Unpublish'), 'icon' => 'eye-off', 'ability' => 'entries/unpublish', 'input' => $entry, 'success' => __('Unpublished'), 'unless' => '{row.displayStatus} is draft', 'can' => "entries.{$handle}.publish"],
                ['label' => __('Copy URL'), 'icon' => 'link', 'copy' => '{origin}{row.uri}', 'success' => __('URL copied'), 'when' => '{row.uri}'],
                ['label' => __('Delete'), 'icon' => 'trash', 'variant' => 'danger', 'ability' => 'entries/delete', 'input' => $entry, 'success' => __('Deleted'), 'can' => "entries.{$handle}.delete",
                    'confirm' => ['title' => str_replace('{title}', '{row.title}', __('Delete “{title}”?')), 'text' => __('This cannot be undone.'), 'confirm' => __('Delete'), 'danger' => true]],
            ],
            'bulk' => [
                ['label' => __('Publish'), 'each' => true, 'ability' => 'entries/publish', 'input' => $entry, 'some' => '{row.displayStatus} is draft, changed', 'can' => "entries.{$handle}.publish",
                    'success' => ['one' => __('Published {count} entry'), 'other' => __('Published {count} entries')]],
                ['label' => __('Unpublish'), 'each' => true, 'ability' => 'entries/unpublish', 'input' => $entry, 'some' => '{row.displayStatus} is not draft', 'can' => "entries.{$handle}.publish",
                    'success' => ['one' => __('Unpublished {count} entry'), 'other' => __('Unpublished {count} entries')]],
                ['label' => __('Delete'), 'each' => true, 'ability' => 'entries/delete', 'input' => $entry, 'can' => "entries.{$handle}.delete",
                    'confirm' => ['title' => ['one' => __('Delete {count} entry?'), 'other' => __('Delete {count} entries?')], 'text' => __('This cannot be undone.'), 'confirm' => __('Delete'), 'danger' => true],
                    'success' => ['one' => __('Deleted {count} entry'), 'other' => __('Deleted {count} entries')]],
            ],
            'empty' => ['icon' => $collection->icon, 'title' => __('No {items} yet', ['items' => mb_strtolower(__($collection->title))])],
            'defaultView' => in_array($collection->defaultView, ['grid', 'calendar'], true) ? $collection->defaultView : 'table',
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

        if ($handle === 'pages') {
            // Built-in pages under the site's own, in the same columns.
            $records['appendix'] = [
                'label' => __('Built-in Pages'), 'source' => ['ability' => 'pages/builtin'], 'groups' => ['rows' => 'pages'], 'key' => 'handle',
                'open' => ['label' => __('Open'), 'to' => '/content/{row.collection}/{row.id}', 'when' => '{row.id}'],
                'actions' => [['label' => __('Customize'), 'ability' => 'pages/customise', 'input' => ['group' => '{row.group}', 'handle' => '{row.handle}'], 'then' => 'open', 'to' => '/content/{result.collection}/{result.id}', 'when' => '{row.customisable}']],
                'columns' => [
                    'title' => ['key' => 'label'],
                    'uri' => ['key' => 'path', 'empty' => __('Shown inside other pages')],
                    'displayStatus' => ['key' => 'status', 'format' => 'status',
                        'tones' => ['standard' => 'neutral', 'conflict' => 'warning', 'customised' => 'published', 'draft' => 'draft'],
                        'labels' => ['standard' => __('Standard'), 'conflict' => __('A page has this address'), 'customised' => __('Published'), 'draft' => __('Draft')]],
                    ...array_fill_keys(array_values(array_diff(array_column($columns, 'key'), ['title', 'uri', 'displayStatus'])), ['blank' => true]),
                ],
            ];
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
        $shown = $collection->defaultColumns ?? [
            ...($routable ? ['uri'] : []), 'status', 'published', 'updated',
        ];
        // Cards show the picture and a few lines too, unless the collection says what to show.
        $cards = $collection->defaultColumns === null ? array_filter([$media ? "field:{$media['handle']}" : null, $excerpt ? "field:{$excerpt['handle']}" : null]) : [];

        $columns = [['id' => 'title', 'key' => 'title', 'label' => __('Title'), 'width' => 'minmax(200px,1fr)', 'sort' => 'title', 'empty' => __('Untitled')]];

        if ($routable) {
            $columns[] = ['id' => 'uri', 'key' => 'uri', 'label' => __('URL'), 'format' => 'address', 'fit' => true, 'sort' => 'uri'];
        }
        $columns[] = ['id' => 'status', 'key' => 'displayStatus', 'label' => __('Status'), 'format' => 'status', 'width' => '104px', 'sort' => 'status'];

        foreach ($fields as $field) {
            $type = (string) $field['type'];
            if (! isset(self::WIDTHS[$type]) || in_array($field['handle'], ['title', 'slug'], true) || in_array($field['component'] ?? null, ['title', 'uri'], true)) {
                continue;
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

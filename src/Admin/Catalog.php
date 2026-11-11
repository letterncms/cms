<?php

declare(strict_types=1);

namespace Cms\Admin;

use Cms\Cms;
use Cms\Users\User;

/**
 * The components every view is drawn from: the admin's screens (see Views) and what the
 * assistant answers with (see Surface). Each has a props schema; the admin's renderer has
 * one implementation per id. Plugins add their own with `cms()->admin()->component()`, and
 * every home-screen widget is in it as `widget/<id>`.
 *
 * Bound props (`source`, actions) name abilities; the admin calls them as the person
 * looking, so a view can show and do only what they may. Strings in props may hold
 * `{params.x}`, `{query.x}`, `{row.x}` or `{user.x}`: filled in where the view is drawn.
 */
final class Catalog
{
    public function __construct(private readonly Cms $cms) {}

    /** @return array<string, array{label: string, description?: string, children: bool, props: array, surface?: bool}> */
    public function definitions(User $user): array
    {
        $s = ['type' => 'string', 'maxLength' => 2000];
        $id = ['type' => 'string', 'maxLength' => 120];
        $tone = ['type' => 'string', 'enum' => ['neutral', 'info', 'success', 'warning', 'danger']];
        $source = $this->object(['ability' => $id, 'input' => ['type' => 'object', 'default' => []]], ['ability']);
        $action = self::action();
        $empty = $this->object(['icon' => $id, 'title' => $s, 'action' => $action, 'size' => ['type' => 'string', 'enum' => ['sm']]]);
        $column = $this->object([
            'key' => $id, 'label' => $s, 'format' => ['type' => 'string', 'enum' => self::FORMATS],
            'width' => $id, 'align' => ['type' => 'string', 'enum' => ['start', 'end']], 'hidden' => ['type' => 'boolean'],
            'tones' => ['type' => 'object', 'additionalProperties' => $tone], 'labels' => ['type' => 'object', 'additionalProperties' => $s],
            // `sort`: true sorts among what is loaded; a name is what the list's ability sorts by (its `sort.param`).
            'muted' => $id, 'sort' => ['type' => ['boolean', 'string'], 'maxLength' => 120], 'currency' => $id, 'action' => $action, 'image' => ['type' => 'boolean'],
            // A row's own icon, what an empty value reads as, a row's problem in words (drawn as a warning), and a switch's per-row label, lock and why it is locked.
            'icon' => $id, 'empty' => $s, 'warning' => $id, 'ariaLabel' => $s, 'disabled' => $id, 'reason' => $id,
            // As wide as its longest value (an address); a few lines on a card instead of a labeled value; on cards from the start; the field a `field` value belongs to; every language there is, for `languages`.
            'fit' => ['type' => 'boolean'], 'excerpt' => ['type' => 'boolean'], 'card' => ['type' => 'boolean'],
            'field' => ['type' => 'object', 'required' => ['type'], 'properties' => ['type' => $id, 'options' => []]],
            'locales' => ['type' => 'array', 'maxItems' => 40, 'items' => $id],
        ], ['key', 'label']);
        $item = $this->object(['label' => $s, 'key' => $id, 'value' => [], 'format' => ['type' => 'string', 'enum' => self::FORMATS], 'tones' => ['type' => 'object', 'additionalProperties' => $tone], 'labels' => ['type' => 'object', 'additionalProperties' => $s], 'currency' => $id], ['label']);

        $definitions = [
            // Layout. A view's root is a page: the bar that names it, and what can be done there.
            'ui/page' => ['label' => 'Page', 'children' => true, 'props' => $this->object([
                'title' => $s, 'icon' => $id, 'width' => ['type' => 'string', 'enum' => ['narrow', 'default', 'wide', 'full']],
                'back' => $this->object(['to' => $s, 'label' => $s], ['to', 'label']), 'actions' => ['type' => 'array', 'maxItems' => 6, 'items' => $action],
                // How many there are, beside the title: a number in an ability's answer (a list's `total`).
                'count' => $this->object(['source' => $source, 'at' => $id], ['source']),
            ], ['title'])],
            'ui/tabs' => ['label' => 'Tabs (each child a ui/tab); a plugin with settings kept here gets its Settings tab', 'children' => true, 'props' => $this->object([])],
            'ui/tab' => ['label' => 'One tab', 'children' => true, 'props' => $this->object(['id' => $id, 'label' => $s, 'actions' => ['type' => 'array', 'maxItems' => 6, 'items' => $action], 'count' => $this->object(['source' => $source, 'at' => $id], ['source'])], ['id', 'label'])],
            'ui/section' => ['label' => 'Titled group', 'children' => true, 'props' => $this->object(['title' => $s, 'actions' => ['type' => 'array', 'maxItems' => 4, 'items' => $action]])],
            'ui/stack' => ['label' => 'Stack', 'children' => true, 'surface' => true, 'props' => $this->object([])],
            'ui/grid' => ['label' => 'Responsive grid', 'children' => true, 'surface' => true, 'props' => $this->object(['columns' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 4, 'default' => 2]])],

            // Content.
            'ui/text' => ['label' => 'Text', 'children' => false, 'surface' => true, 'props' => $this->object(['text' => $s, 'muted' => ['type' => 'boolean']], ['text'])],
            'ui/notice' => ['label' => 'Notice with an optional action', 'children' => false, 'surface' => true, 'props' => $this->object(['tone' => $tone, 'title' => $s, 'text' => $s, 'action' => $action], ['title'])],
            'ui/stat' => ['label' => 'Metric with optional trend', 'children' => false, 'surface' => true, 'props' => $this->object([
                'label' => $s, 'value' => ['type' => ['string', 'number']], 'delta' => ['type' => 'number'],
                'trend' => ['type' => 'array', 'maxItems' => 60, 'items' => ['type' => 'number', 'minimum' => 0]],
                'source' => $source, 'at' => $id, 'format' => ['type' => 'string', 'enum' => self::FORMATS],
            ], ['label'])],
            'ui/chart' => ['label' => 'Line or bar chart', 'children' => false, 'surface' => true, 'props' => $this->object([
                'label' => $s, 'kind' => ['type' => 'string', 'enum' => ['line', 'bar'], 'default' => 'line'],
                'points' => ['type' => 'array', 'maxItems' => 366, 'items' => $this->object(['x' => ['type' => ['string', 'number']], 'y' => ['type' => 'number']], ['x', 'y'])],
                'source' => $source, 'at' => $id, 'x' => $id, 'y' => $id,
            ], ['label'])],
            'ui/table' => ['label' => 'Data table of literal rows', 'children' => false, 'surface' => true, 'props' => $this->object([
                'columns' => ['type' => 'array', 'minItems' => 1, 'maxItems' => 8, 'items' => $s],
                'rows' => ['type' => 'array', 'maxItems' => 50, 'items' => ['type' => 'array', 'maxItems' => 8, 'items' => ['type' => ['string', 'number', 'boolean', 'null']]]],
            ], ['columns', 'rows'])],
            'ui/detail' => ['label' => 'Labelled values, or every value of a record', 'children' => false, 'surface' => true, 'props' => $this->object([
                'items' => ['type' => 'array', 'maxItems' => 40, 'items' => $item], 'source' => $source,
                'record' => [], 'raw' => [], 'rawLabel' => $s, 'empty' => $s,
            ])],
            'ui/diff' => ['label' => 'Before and after', 'children' => false, 'surface' => true, 'props' => $this->object(['before' => [], 'after' => [], 'label' => $s])],
            'ui/preview' => ['label' => 'Preview of a page of the site', 'children' => false, 'props' => $this->object(['url' => $s, 'title' => $s, 'height' => ['type' => 'integer', 'minimum' => 120, 'maximum' => 1600]], ['url'])],
            'ui/redirect' => ['label' => 'Sends whoever opens the place on to where it is now', 'children' => false, 'props' => $this->object(['to' => $s], ['to'])],
            'ui/empty' => ['label' => 'Nothing here yet', 'children' => false, 'props' => $empty],
            'ui/action' => ['label' => 'Action button (uses its submit action)', 'children' => false, 'surface' => true, 'props' => $this->object(['label' => $s], ['label'])],
            'ui/actions' => ['label' => 'A row of buttons bound to abilities or places', 'children' => false, 'props' => $this->object(['items' => ['type' => 'array', 'minItems' => 1, 'maxItems' => 6, 'items' => $action]], ['items'])],
            'ui/links' => ['label' => 'A short list of places to open, each a line with its icon and detail', 'children' => false, 'surface' => true, 'props' => $this->object([
                'items' => ['type' => 'array', 'maxItems' => 50, 'items' => $this->object(['label' => $s, 'detail' => $s, 'icon' => $id, 'to' => $s], ['label', 'to'])],
            ], ['items'])],

            // Data bound to abilities.
            'ui/records' => ['label' => 'Records from an ability: table, search, filters, pages, row actions', 'children' => false, 'props' => $this->object([
                // Or literal `rows`: what a command or search found, as it was then.
                'id' => $id, 'label' => $s, 'source' => $source, 'rows' => ['type' => 'array', 'maxItems' => 200, 'items' => ['type' => 'object']], 'at' => $id, 'key' => $id,
                'columns' => ['type' => 'array', 'minItems' => 1, 'maxItems' => 12, 'items' => $column],
                'search' => ['anyOf' => [$this->object(['param' => $id, 'placeholder' => $s]), ['type' => 'boolean', 'const' => false]]],
                'filters' => ['type' => 'array', 'maxItems' => 4, 'items' => $this->object([
                    'param' => $id, 'label' => $s, 'all' => $s,
                    'options' => ['type' => 'array', 'items' => $this->object(['value' => ['type' => ['string', 'number', 'boolean']], 'label' => $s, 'title' => $s], ['value', 'label'])],
                    'at' => $id, 'value' => $id, 'text' => $id,
                    // Every choice in view, one always on; `default` stands for none.
                    'display' => ['type' => 'string', 'enum' => ['segmented']], 'default' => $id,
                ], ['param', 'label'])],
                'paged' => $this->object(['perPage' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100]]),
                // Sorted by the ability: the input that takes a column's `sort` name (`-` first for descending), and its order while none is chosen.
                'sort' => $this->object(['param' => $id, 'default' => $id], ['param']),
                // A tree while nothing narrows or sorts the list: where it loads, and what puts siblings in order (`{ids}`, `{parent}`, `{versions}`).
                'tree' => $this->object(['source' => $source, 'at' => $id, 'children' => $id, 'version' => $id, 'reorder' => $action], ['source']),
                'open' => $action, 'actions' => ['type' => 'array', 'maxItems' => 8, 'items' => $action],
                'bulk' => ['type' => 'array', 'maxItems' => 4, 'items' => $action],
                // A calendar; with `dated` (and `undated`), the ability's input for a month, filled with `{field}`, `{start}` and `{end}`.
                'calendar' => ['anyOf' => [['type' => 'boolean'], $this->object(['dated' => ['type' => 'object'], 'undated' => ['type' => 'object']], ['dated'])]],
                'dates' => $this->object(['published' => $id, 'updated' => $id]),
                'defaultView' => ['type' => 'string', 'enum' => ['table', 'grid', 'calendar']],
                'empty' => $empty, 'address' => ['type' => 'boolean'], 'display' => ['type' => 'boolean'],
            ], ['label', 'columns'])],
            'ui/form' => ['label' => 'A form loaded from one ability and saved with another, with the save bar', 'children' => false, 'props' => $this->object([
                'source' => $source, 'fieldsAt' => $id, 'valuesAt' => $id, 'into' => $id,
                'fields' => ['type' => 'array', 'maxItems' => 80, 'items' => ['type' => 'object']],
                'save' => $this->object(['ability' => $id, 'input' => ['type' => 'object', 'default' => []], 'as' => $id], ['ability']),
                'after' => ['type' => 'string', 'enum' => ['refresh', 'manifest']], 'width' => ['type' => 'string', 'enum' => ['narrow', 'wide']],
                // What the fields are told about where they are (a global set's `locale`).
                'context' => ['type' => 'object'],
            ], ['save'])],
            'ui/settings' => ['label' => 'A settings page’s form', 'children' => false, 'props' => $this->object(['namespace' => $s], ['namespace'])],
        ];

        foreach ($this->cms->admin()->widgetsForUser($user) as $widget) {
            // An assistant launcher is useful on Home, but not inside its own reply.
            if (($widget['assistant'] ?? true) === false) {
                continue;
            }
            $definitions['widget/'.$widget['id']] = ['label' => $widget['label'], 'description' => $widget['description'], 'children' => false, 'surface' => true, 'props' => $this->object([])];
        }

        foreach ($this->cms->admin()->componentsForUser($user) as $component) {
            $definitions[$component['id']] = ['children' => false, 'surface' => true, ...$component];
        }

        ksort($definitions);

        return $definitions;
    }

    /** How a value in a column or detail is written. */
    public const array FORMATS = ['text', 'strong', 'muted', 'code', 'badge', 'badges', 'status', 'date', 'datetime', 'ago', 'number', 'money', 'bytes', 'yesno', 'person', 'count', 'image', 'link', 'switch', 'share', 'compact', 'address', 'media', 'languages', 'field'];

    /** A button or row action: an ability to run (with `input`), a place to go (`to`), or a dialog of nodes (`dialog`). */
    public static function action(): array
    {
        $s = ['type' => 'string', 'maxLength' => 2000];
        // Words that depend on how many: `{"one": …, "other": …}`, for what is done with a selection.
        $counted = ['anyOf' => [$s, ['type' => 'object', 'additionalProperties' => false, 'required' => ['one', 'other'], 'properties' => ['one' => $s, 'other' => $s]]]];

        return ['type' => 'object', 'additionalProperties' => false, 'required' => ['label'], 'properties' => [
            'label' => $s, 'icon' => ['type' => 'string', 'maxLength' => 60],
            'variant' => ['type' => 'string', 'enum' => ['primary', 'default', 'ghost', 'danger']],
            'ability' => ['type' => 'string', 'maxLength' => 160], 'input' => ['type' => 'object', 'default' => []],
            'to' => $s, 'href' => $s,
            'confirm' => ['type' => 'object', 'additionalProperties' => false, 'required' => ['title'], 'properties' => ['title' => $counted, 'text' => $s, 'confirm' => $s, 'danger' => ['type' => 'boolean']]],
            'success' => $counted, 'then' => ['anyOf' => [['type' => 'string', 'enum' => ['refresh', 'manifest', 'back', 'open']], ['type' => 'array', 'items' => ['type' => 'string', 'enum' => ['refresh', 'manifest', 'back', 'open']]]]],
            'dialog' => ['type' => 'object', 'additionalProperties' => false, 'required' => ['title', 'body'], 'properties' => [
                'title' => $s, 'text' => $s, 'size' => ['type' => 'string', 'enum' => ['md', 'lg']],
                'body' => ['type' => 'array', 'maxItems' => 12, 'items' => ['type' => 'object']],
                'actions' => ['type' => 'array', 'maxItems' => 4, 'items' => ['type' => 'object']],
            ]],
            // Asks first: these fields in a dialog, their values sent with the ability's input.
            'form' => ['type' => 'object', 'additionalProperties' => false, 'required' => ['title', 'fields'], 'properties' => [
                'title' => $s, 'text' => $s, 'confirm' => $s, 'fields' => ['type' => 'array', 'minItems' => 1, 'maxItems' => 20, 'items' => ['type' => 'object']], 'values' => ['type' => 'object'],
            ]],
            'component' => ['type' => 'string', 'maxLength' => 160], 'props' => ['type' => 'object', 'default' => []],
            'can' => ['type' => ['string', 'array']], 'when' => $s, 'unless' => $s, 'disabled' => $s,
            'copy' => $s, 'name' => ['type' => 'string', 'pattern' => '^[a-z0-9-]{1,40}$'],
            // A row's: an icon button beside its menu. A selection's: run once per row (`{row}`), shown while it holds for `some` row.
            'inline' => ['type' => 'boolean'], 'each' => ['type' => 'boolean'], 'some' => $s,
            // A page's: the key that takes it too.
            'key' => ['type' => 'string', 'pattern' => '^[a-z0-9]$'],
        ]];
    }

    private function object(array $properties, array $required = []): array
    {
        return ['type' => 'object', 'properties' => $properties ?: (object) [], 'required' => $required, 'additionalProperties' => false];
    }
}

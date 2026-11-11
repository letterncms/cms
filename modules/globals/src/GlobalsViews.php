<?php

declare(strict_types=1);

namespace Cms\Modules\Globals;

use Cms\Admin\Views;
use Cms\Cms;
use Cms\Users\User;

/** Global sets as data: the sets, one set's values (one tab per language), and its fields in the blueprint editor (`globals/fields`). */
final class GlobalsViews
{
    public static function register(Cms $cms): void
    {
        $cms->admin()->component('globals/fields', ['label' => 'Global Set Fields', 'description' => 'The fields of one global set, in the blueprint editor.', 'surface' => false, 'permission' => 'globals.manage', 'props' => [
            'type' => 'object', 'additionalProperties' => false, 'required' => ['handle'], 'properties' => ['handle' => ['type' => 'string', 'maxLength' => 64]],
        ]]);

        $views = $cms->views();
        $views->register('globals', '/globals', static fn () => self::list(), permission: 'globals.view');
        $views->register('globals-set', '/globals/:handle', static fn (User $user, array $params) => self::set($cms, (string) ($params['handle'] ?? '')), permission: 'globals.view');
        $views->register('globals-fields', '/globals/:handle/fields', static fn (User $user, array $params) => ['type' => 'globals/fields', 'props' => ['handle' => (string) ($params['handle'] ?? '')]], permission: 'globals.manage');
    }

    private static function list(): array
    {
        return ['type' => 'ui/page', 'props' => ['title' => __('Global Sets'), 'icon' => 'globe', 'actions' => [
            ['label' => __('New Global Set'), 'icon' => 'plus', 'variant' => 'primary', 'ability' => 'globals/save',
                'form' => ['title' => __('New Global Set'), 'confirm' => __('Create Global Set'), 'fields' => [['handle' => 'title', 'type' => 'text', 'label' => __('Name'), 'placeholder' => __('Footer'), 'required' => true, 'autofocus' => true]]],
                // A new set starts with one text field; its fields open next.
                'input' => ['title' => '{values.title}', 'fields' => [['handle' => 'text', 'type' => 'text', 'label' => __('Text')]]],
                // The new set is in the manifest (the sidebar, the field pickers) before its fields open.
                'then' => ['manifest', 'open'], 'to' => '/globals/{result.handle}/fields'],
        ]], 'children' => [
            ['type' => 'ui/records', 'props' => [
                'id' => 'globals', 'label' => __('Global Sets'), 'key' => 'handle',
                'source' => ['ability' => 'globals/list'],
                'columns' => [
                    // One fact a row: its name. The handle is in its address and beside each field, for whoever builds templates.
                    ['key' => 'title', 'label' => __('Name'), 'icon' => 'icon'],
                ],
                'open' => ['label' => __('Edit'), 'to' => '/globals/{row.handle}'],
                'actions' => [
                    ['label' => __('Edit'), 'icon' => 'edit', 'to' => '/globals/{row.handle}', 'can' => 'globals.manage'],
                    ['label' => __('Edit Fields'), 'icon' => 'field', 'to' => '/globals/{row.handle}/fields', 'can' => 'globals.manage'],
                ],
                'empty' => ['icon' => 'globe', 'title' => __('No global sets yet')],
            ]],
        ]];
    }

    /** One set's values, saved from the bar; with more than one language, a tab for each. */
    private static function set(Cms $cms, string $handle): array
    {
        $set = $cms->globals()->find($handle);

        if ($set === null) {
            return Views::notFound('globe', ['to' => '/globals', 'label' => __('Global Sets')]);
        }

        $form = static fn (?string $locale) => ['type' => 'ui/form', 'props' => [
            'source' => ['ability' => 'globals/get', 'input' => ['handle' => $handle, ...($locale ? ['locale' => $locale] : [])]],
            'fieldsAt' => 'resolvedFields', 'valuesAt' => 'data',
            'save' => ['ability' => 'globals/set', 'input' => ['handle' => $handle, ...($locale ? ['locale' => $locale] : [])]],
            // Fields that link to entries pick them in this language.
            'context' => ['locale' => $locale ?? $cms->defaultLocale()],
        ]];
        $locales = $cms->locales();

        return ['type' => 'ui/page', 'props' => ['title' => $set->title, 'icon' => $set->icon ?: 'globe', 'width' => 'narrow', 'back' => ['to' => '/globals', 'label' => __('Global Sets')], 'actions' => [
            // No icon: on a phone a bar's button with one is only its icon, and this is the only thing to do here.
            ['label' => __('Edit Fields'), 'to' => "/globals/{$handle}/fields", 'can' => 'globals.manage'],
        ]], 'children' => count($locales) > 1
            ? [['type' => 'ui/tabs', 'children' => array_map(static fn (string $l) => ['type' => 'ui/tab', 'props' => ['id' => $l, 'label' => self::languageName($l)], 'children' => [$form($l)]], $locales)]]
            : [$form(null)]];
    }

    /** "Deutsch" for "de", in the language itself: a tab says which language it holds, not its code. */
    private static function languageName(string $code): string
    {
        $name = class_exists(\Locale::class) ? (string) \Locale::getDisplayName(str_replace('-', '_', $code), str_replace('-', '_', $code)) : '';

        return $name !== '' && $name !== $code ? mb_strtoupper(mb_substr($name, 0, 1)).mb_substr($name, 1) : strtoupper($code);
    }
}

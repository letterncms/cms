<?php

declare(strict_types=1);

namespace Cms\Modules\Settings;

use Cms\Users\Roles;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Admin\Arranged;
use Cms\Admin\Translations;
use Cms\Content\Fields\Blueprint;
use Cms\Cms;
use Cms\Modules\Workspace\Answers;
use Cms\Users\User;
use Cms\Abilities\Shapes;
use Cms\Support\Schema\Shape;

/** Settings namespaces of the kernel, modules and plugins, and the admin arrangement. */
final class SettingsAbilities
{
    public function __construct(private readonly Cms $cms) {}

    public function register(AbilityRegistry $a): void
    {
        $registry = $this->cms->settingsRegistry();
        $permissionFor = static fn (string $ns) => $registry->schemas()[$ns]['permission'] ?? 'settings.manage';

        $a->register('settings/list', [
            'label' => 'List Settings Pages',
            'description' => 'Settings namespaces registered by the core and plugins.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'output' => Shape::of([['namespace' => Shape::STRING, 'label' => Shape::STRING, 'icon' => Shape::STRING, 'description' => Shape::STRING, 'package' => Shape::STRING_OR_NULL, 'permission' => Shape::STRING]]),
            'handler' => fn (array $in, AbilityContext $ctx) => array_values(array_filter(array_map(
                static fn ($ns, $s) => ['namespace' => $ns, 'label' => $s['label'], 'icon' => $s['icon'], 'description' => $s['description'], 'package' => $s['package'], 'permission' => $s['permission']],
                array_keys($registry->schemas()),
                $registry->schemas()
            ), static fn ($s) => $ctx->can($s['permission']))),
        ]);

        $a->register('settings/get', [
            'label' => 'Get Settings',
            'description' => 'Fields and values for one settings namespace (secrets masked).',
            'permission' => static fn (?User $u, array $in) => $u?->hasPermission($permissionFor((string) $in['namespace'])) ?? false,
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['namespace' => ['type' => 'string']], 'required' => ['namespace']],
            'output' => Shape::of([
                'namespace' => Shape::STRING, 'label' => Shape::STRING, 'icon' => Shape::STRING, 'description' => Shape::STRING, 'fields' => [Shapes::field()],
                'permission' => Shape::STRING, 'package' => Shape::STRING_OR_NULL, 'order' => Shape::INTEGER, 'section' => Shape::STRING,
                'home' => Shape::STRING_OR_NULL, 'page' => Shape::BOOLEAN, 'values' => Shape::OBJECT,
            ]),
            'handler' => function (array $in) use ($registry) {
                $schema = $registry->schemas()[$in['namespace']] ?? throw new AbilityException('Unknown settings.', 'not_found');

                // Fields as the admin renders them: imports expanded, dynamic options filled in.
                $t = app(Translations::class);

                return [...$schema, 'label' => $t->label($schema['label']), 'description' => $t->label($schema['description']), 'fields' => $t->fields(Blueprint::make($schema['fields'])->toArray()), 'namespace' => $in['namespace'], 'values' => $registry->forDisplay($in['namespace'])];
            },
        ]);

        $a->register('admin/arrangement', [
            'label' => 'Admin Arrangement',
            'description' => 'Every item of the sidebar or the home screen and an arrangement of them (the saved one, the given one, or the defaults when layout is null). Save with settings/update (namespace "admin", value "sidebar" or "dashboard").',
            'permission' => 'settings.manage',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['of' => ['type' => 'string', 'description' => 'sidebar, or dashboard when letterncms/dashboard is on'], 'layout' => ['type' => ['object', 'null']]], 'required' => ['of']],
            'output' => Shape::of([
                'items' => [['id' => Shape::STRING, 'label' => Shape::STRING, 'icon?' => Shape::STRING_OR_NULL, 'description?' => Shape::STRING_OR_NULL, 'path?' => Shape::STRING_OR_NULL, 'section?' => Shape::STRING_OR_NULL, 'package?' => Shape::STRING_OR_NULL]],
                'layout' => ['sections' => [['id' => Shape::STRING, 'label' => Shape::STRING, 'items' => [Shape::STRING]]], 'hidden' => [Shape::STRING]],
                'customized' => Shape::BOOLEAN, 'fixed' => Shape::BOOLEAN,
            ]),
            'handler' => function (array $in) {
                // Parts come and go with their modules, so they are looked up when asked.
                $part = Arranged::all()[$in['of']] ?? throw new AbilityException(__('Nothing called “:name” is arranged here.', ['name' => $in['of']]), 'not_found');
                $layout = array_key_exists('layout', $in) ? $part->arrangement()->normalize($in['layout']) : $part->saved();

                $t = app(Translations::class);
                // Labels are registered in English; the person arranging reads them in their language.
                $items = array_map(static fn (array $item) => [
                    ...$item,
                    'label' => $t->label($item['label'] ?? ''),
                    ...(isset($item['description']) ? ['description' => $t->label($item['description'])] : []),
                ], array_values($part->catalog()));

                return ['items' => $items, 'layout' => $part->arrangement()->resolve($layout), 'customized' => $layout !== null, 'fixed' => $part->arrangement()->fixed()];
            },
        ]);

        $a->register('settings/update', [
            'label' => 'Update Settings',
            'description' => 'Save values for a settings namespace.',
            'permission' => static fn (?User $u, array $in) => $u?->hasPermission($permissionFor((string) $in['namespace'])) ?? false,
            'expose' => ['mcp' => false],
            'input' => ['type' => 'object', 'properties' => ['namespace' => ['type' => 'string'], 'values' => ['type' => 'object']], 'required' => ['namespace', 'values']],
            // What was saved, by its fields' names when there are a few, and the way to the page.
            'answer' => static function (mixed $saved, array $in) use ($registry): array {
                $schema = $registry->schemas()[$in['namespace']] ?? [];
                $labels = array_column(array_filter((array) ($schema['fields'] ?? []), static fn ($f) => is_array($f) && isset($f['handle'], $f['label']) && array_key_exists($f['handle'], (array) $in['values'])), 'label');
                $name = __((string) ($schema['label'] ?? $in['namespace']));
                $what = $labels !== [] && count($labels) <= 3 ? $name.': '.implode(', ', array_map(static fn ($l) => __((string) $l), $labels)) : $name;

                return Answers::done(__('Saved :name', ['name' => $what]), null, [
                    ['label' => __('Open'), 'icon' => 'arrow-right', 'variant' => 'primary', 'to' => '/settings/'.$in['namespace']],
                ]);
            },
            'output' => Shape::of(Shape::OBJECT),
            'dryRun' => function (array $in, AbilityContext $ctx) use ($registry): array {
                if (! $registry->has($in['namespace'])) {
                    throw new AbilityException('Unknown settings.', 'not_found');
                }
            
                if ($ctx->transport === 'assistant' && $in['namespace'] === Roles::SETTINGS) {
                    throw AbilityException::forbidden(__('Roles are changed by people, in Settings.'));
                }
            
                return [['action' => 'update', 'type' => 'settings', 'namespace' => $in['namespace'], 'fields' => array_keys($in['values'])]];
            },
            'handler' => function (array $in, AbilityContext $ctx) use ($registry) {
                if (! $registry->has($in['namespace'])) {
                    throw new AbilityException('Unknown settings.', 'not_found');
                }

                // Who may do what is for people to decide: the assistant never changes roles.
                if ($ctx->transport === 'assistant' && $in['namespace'] === Roles::SETTINGS) {
                    throw AbilityException::forbidden(__('Roles are changed by people, in Settings.'));
                }

                $registry->save($in['namespace'], $in['values']);

                return $registry->forDisplay($in['namespace']);
            },
        ]);
    }
}

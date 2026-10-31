<?php

declare(strict_types=1);

namespace Cms\Modules\Settings;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Admin\Arranged;
use Cms\Admin\Translations;
use Cms\Content\Fields\Blueprint;
use Cms\Cms;
use Cms\Users\User;

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
            'handler' => function (array $in) use ($registry) {
                if (! $registry->has($in['namespace'])) {
                    throw new AbilityException('Unknown settings.', 'not_found');
                }

                $registry->save($in['namespace'], $in['values']);

                return $registry->forDisplay($in['namespace']);
            },
        ]);
    }
}

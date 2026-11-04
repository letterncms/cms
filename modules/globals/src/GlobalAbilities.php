<?php

declare(strict_types=1);

namespace Cms\Modules\Globals;

use Illuminate\Support\Str;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Admin\Translations;
use Cms\Content\Fields\Blueprint;
use Cms\Content\Globals\GlobalSet;
use Cms\Cms;

/** Global sets: their values, and their fields. */
final class GlobalAbilities
{
    private const array HANDLE = ['type' => 'string', 'pattern' => '^[a-z0-9][a-z0-9_-]{0,63}$'];

    public function __construct(private readonly Cms $cms) {}

    public function register(AbilityRegistry $a): void
    {
        $a->register('globals/list', [
            'label' => 'List Globals',
            'description' => 'Global sets (site-wide values like footer or contact details), with when each last changed.',
            'permission' => 'globals.view',
            'annotations' => ['readOnly' => true],
            'handler' => fn () => array_values(array_map(static fn (GlobalSet $g) => [
                'handle' => $g->handle, 'title' => $g->title, 'icon' => $g->icon, ...$g->timestamps,
            ], $this->cms->globals()->all())),
        ]);

        $a->register('globals/get', [
            'label' => 'Get Global Set',
            'permission' => 'globals.view',
            'description' => 'A global set with its fields and values.',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['handle' => self::HANDLE, 'locale' => ['type' => 'string']], 'required' => ['handle']],
            'handler' => fn (array $in) => [
                ...$this->cms->globals()->findOrFail($in['handle'])->toArray($in['locale'] ?? null),
                'settings' => app(Translations::class)->fields(Blueprint::make([
                    ['handle' => 'title', 'type' => 'text', 'label' => 'Name', 'required' => true],
                    ['handle' => 'icon', 'type' => 'icon', 'label' => 'Icon'],
                ])->toArray()),
            ],
        ]);

        $a->register('globals/update', [
            'label' => 'Update Global Values',
            'permission' => 'globals.edit',
            'description' => 'Set values of a global set (merged into existing values). Returns the values as stored.',
            'input' => ['type' => 'object', 'properties' => ['handle' => self::HANDLE, 'values' => ['type' => 'object'], 'locale' => ['type' => 'string']], 'required' => ['handle', 'values']],
            'handler' => fn (array $in) => $this->cms->globals()->updateValues($in['handle'], $in['values'], $in['locale'] ?? null)->values($in['locale'] ?? null),
        ]);

        $a->register('globals/save', [
            'label' => 'Save Global Set',
            'permission' => 'globals.manage',
            'description' => 'Create a global set or change its fields. Without a handle, a new set is made with one from its title.',
            'input' => ['type' => 'object', 'properties' => [
                'handle' => self::HANDLE, 'title' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 120], 'icon' => ['type' => 'string'], 'fields' => ['type' => 'array', 'items' => ['type' => 'object']],
            ], 'required' => ['title', 'fields']],
            'handler' => function (array $in) {
                if (! isset($in['handle'])) {
                    $in['handle'] = substr(Str::slug($in['title'], '_'), 0, 64);

                    if ($in['handle'] === '') {
                        throw AbilityException::invalid('Use letters or numbers in the name.', ['title' => 'Use letters or numbers in the name.']);
                    }

                    if ($this->cms->globals()->find($in['handle'])) {
                        throw new AbilityException('A global set with this handle already exists.', 'conflict', ['title' => 'A global set with this handle already exists.']);
                    }
                }

                $set = $this->cms->globals()->find($in['handle']) ?? new GlobalSet($in['handle'], $in['title'], $in['icon'] ?? 'globe', []);
                $set->title = $in['title'];
                $set->icon = $in['icon'] ?? $set->icon;
                Blueprint::validate($in['fields']);
                $set->fields = $in['fields'];
                $this->cms->globals()->save($set);

                return $this->cms->globals()->findOrFail($in['handle'])->toArray();
            },
        ]);

        $a->register('globals/delete', [
            'label' => 'Delete Global Set',
            'permission' => 'globals.manage',
            'annotations' => ['destructive' => true],
            'description' => 'Delete a global set and its values.',
            'input' => ['type' => 'object', 'properties' => ['handle' => self::HANDLE], 'required' => ['handle']],
            'handler' => function (array $in) {
                $this->cms->globals()->delete($in['handle']);

                return ['deleted' => $in['handle']];
            },
        ]);
    }
}

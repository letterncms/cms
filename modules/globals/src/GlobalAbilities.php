<?php

declare(strict_types=1);

namespace Cms\Modules\Globals;

use Illuminate\Support\Str;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Admin\Translations;
use Cms\Content\Fields\Blueprint;
use Cms\Content\Fields\FieldProblems;
use Cms\Content\Globals\GlobalContent;
use Cms\Cms;
use Cms\Modules\Workspace\Answers;
use Cms\Abilities\Shapes;
use Cms\Support\Schema\Shape;

/** Globals: their values, and their fields. */
final class GlobalAbilities
{
    private const array HANDLE = ['type' => 'string', 'pattern' => '^[a-z0-9][a-z0-9_-]{0,63}$'];

    public function __construct(private readonly Cms $cms) {}

    public function register(AbilityRegistry $a): void
    {
        $a->register('globals/list', [
            'label' => 'List Globals',
            'description' => 'Globals (site-wide values like footer or contact details), with when each last changed.',
            'permission' => 'globals.view',
            'annotations' => ['readOnly' => true],
            'output' => Shape::of([['handle' => Shape::STRING, 'title' => Shape::STRING, 'icon' => Shape::STRING, 'publishedAt' => Shape::STRING_OR_NULL, 'updatedAt' => Shape::STRING_OR_NULL]]),
            'handler' => fn () => array_values(array_map(static fn (GlobalContent $g) => [
                'handle' => $g->handle, 'title' => $g->title, 'icon' => $g->icon, ...$g->timestamps,
            ], $this->cms->globals()->all())),
        ]);

        $a->register('globals/get', [
            'label' => 'Get Global',
            'permission' => 'globals.view',
            'description' => 'A global with its fields and values.',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['handle' => self::HANDLE, 'locale' => ['type' => 'string']], 'required' => ['handle']],
            'output' => self::global()->with(['settings' => [Shapes::field()]]),
            'handler' => fn (array $in) => [
                ...$this->cms->globals()->findOrFail($in['handle'])->toArray($in['locale'] ?? null),
                'settings' => app(Translations::class)->fields(Blueprint::make([
                    ['handle' => 'title', 'type' => 'text', 'label' => 'Name', 'required' => true],
                    ['handle' => 'icon', 'type' => 'icon', 'label' => 'Icon'],
                ])->toArray()),
            ],
        ]);

        $a->register('globals/set', [
            'label' => 'Update Global Values',
            'permission' => 'globals.edit',
            'description' => 'Set values of a global (merged into existing values). Returns the values as stored.',
            'input' => ['type' => 'object', 'properties' => ['handle' => self::HANDLE, 'values' => ['type' => 'object'], 'locale' => ['type' => 'string']], 'required' => ['handle', 'values']],
            'answer' => function (mixed $values, array $in) {
                $global = $this->cms->globals()->find($in['handle']);
                $labels = array_column(array_filter((array) ($global?->fields ?? []), static fn ($f) => is_array($f) && isset($f['handle'], $f['label']) && array_key_exists($f['handle'], (array) $in['values'])), 'label');
                $name = ($global?->title ?? $in['handle']).($labels !== [] && count($labels) <= 3 ? ': '.implode(', ', $labels) : '');

                return Answers::done(__('Saved :name', ['name' => $name]), null, [
                    ['label' => __('Open'), 'icon' => 'arrow-right', 'variant' => 'primary', 'to' => '/globals/'.$in['handle']],
                ]);
            },
            'output' => self::values(),
            'handler' => fn (array $in) => $this->cms->globals()->updateValues($in['handle'], $in['values'], $in['locale'] ?? null)->values($in['locale'] ?? null),
        ]);

        $a->register('globals/save', [
            'label' => 'Save Global',
            'permission' => 'globals.manage',
            'description' => 'Create a global or change its fields. Without a handle, a new global is made with one from its title.',
            'input' => ['type' => 'object', 'properties' => [
                'handle' => self::HANDLE, 'title' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 120], 'icon' => ['type' => 'string'], 'fields' => ['type' => 'array', 'items' => ['type' => 'object']],
            ], 'required' => ['title', 'fields']],
            // A new global comes with a way back; a changed one with a way to it.
            'answer' => static fn (array $global, array $in) => Answers::done(isset($in['handle']) ? __('Saved :name', ['name' => $global['title']]) : __('Created :name', ['name' => $global['title']]), null, [
                ['label' => __('Open'), 'icon' => 'arrow-right', 'variant' => 'primary', 'to' => '/globals/'.$global['handle']],
                ...(isset($in['handle']) ? [] : [['label' => __('Delete'), 'icon' => 'trash', 'variant' => 'ghost', 'ability' => 'globals/delete', 'input' => ['handle' => $global['handle']],
                    'confirm' => ['title' => Answers::literal(__('Delete :name?', ['name' => $global['title']])), 'confirm' => __('Delete'), 'danger' => true], 'success' => __('Deleted')]]),
            ]),
            'output' => self::global(),
            'handler' => function (array $in) {
                if (! isset($in['handle'])) {
                    $in['handle'] = substr(Str::slug($in['title'], '_'), 0, 64);

                    if ($in['handle'] === '') {
                        throw AbilityException::invalid('Use letters or numbers in the name.', ['title' => 'Use letters or numbers in the name.']);
                    }

                    if ($this->cms->globals()->find($in['handle'])) {
                        throw new AbilityException('A global with this handle already exists.', 'conflict', ['title' => 'A global with this handle already exists.']);
                    }
                }

                $global = $this->cms->globals()->find($in['handle']) ?? new GlobalContent($in['handle'], $in['title'], $in['icon'] ?? 'globe', []);
                $global->title = $in['title'];
                $global->icon = $in['icon'] ?? $global->icon;
                // What is wrong with a field is said by its path (`fields.2.handle`), for the editor to show beside it.
                FieldProblems::refuse($in['fields']);
                Blueprint::validate($in['fields']);
                $global->fields = $in['fields'];
                $this->cms->globals()->save($global);

                return $this->cms->globals()->findOrFail($in['handle'])->toArray();
            },
        ]);

        $a->register('globals/delete', [
            'label' => 'Delete Global',
            'permission' => 'globals.manage',
            'annotations' => ['destructive' => true],
            'description' => 'Delete a global and its values.',
            'input' => ['type' => 'object', 'properties' => ['handle' => self::HANDLE], 'required' => ['handle']],
            'output' => Shape::of(['deleted' => Shape::STRING]),
            // Deleting never refuses: a global that is not there is nothing to remove.
            'dryRun' => fn (array $in): array => ($global = $this->cms->globals()->find($in['handle'])) === null ? [] : [
                ['action' => 'delete', 'type' => 'global', 'handle' => $global->handle, 'title' => $global->title, 'removes' => ['fields' => count($global->fields), 'values' => true]],
            ],
            'handler' => function (array $in) {
                $this->cms->globals()->delete($in['handle']);

                return ['deleted' => $in['handle']];
            },
        ]);
    }

    /** GlobalContent::toArray(): a global with its fields and its values (`data` follows the fields). */
    private static function global(): Shape
    {
        return Shape::of([
            'handle' => Shape::STRING, 'publishedAt' => Shape::STRING_OR_NULL, 'updatedAt' => Shape::STRING_OR_NULL, 'title' => Shape::STRING, 'icon' => Shape::STRING,
            'fields' => [Shapes::field()], 'resolvedFields' => [Shapes::field()], 'data' => self::values(),
        ]);
    }

    /** GlobalContent::values(): what a global holds, in one language. */
    private static function values(): Shape
    {
        return Shape::open('The global\'s values by field handle, defaults filled in; the global\'s fields are `resolvedFields` of globals/get.');
    }
}

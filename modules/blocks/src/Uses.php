<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks;

use Cms\Cms;

/**
 * Where templates and components are used, in words for their lists: a template by the
 * collections it frames and the entries that chose it themselves, a component by the entries
 * (pages, templates, other components) whose blocks hold it. Read from what is saved and what
 * is still a draft, once per request: deleting one that is in use should not come as a surprise.
 */
final class Uses
{
    /** @var array{templates: array<string, array{collections: list<string>, entries: int}>, components: array<string, int>}|null */
    private ?array $found = null;

    public function __construct(private readonly Cms $cms) {}

    /** @return array<string, string> template slug => who uses it; a template nobody uses is not in it */
    public function templates(): array
    {
        $out = [];

        foreach ($this->found()['templates'] as $slug => $use) {
            $parts = count($use['collections']) > 3 ? [__(':count collections', ['count' => count($use['collections'])])] : $use['collections'];
            $use['entries'] > 0 && $parts[] = self::entries($use['entries']);

            if ((string) $slug === '404') {
                $parts[] = __('Missing pages');
            }

            $parts !== [] && $out[$slug] = implode(', ', $parts);
        }

        return $out;
    }

    /** @return array<string, string> component handle => how many entries hold it; one nobody uses is not in it */
    public function components(): array
    {
        return array_map(self::entries(...), $this->found()['components']);
    }

    /** How many entries (pages, templates, components…) hold a block of this package, saved or in a draft: those it registered, or, while it is off, those named after it. */
    public function package(string $package): int
    {
        $registry = app(BlockRegistry::class);
        $renderer = app(BlockRenderer::class);
        $ours = [];
        $judge = static function (string $type) use (&$ours, $registry, $renderer, $package): bool {
            return $ours[$type] ??= ($registry->get($type)?->package ?? $renderer->pluginOf($type)['name'] ?? null) === $package;
        };
        $count = 0;

        foreach ($this->cms->entries()->query()->get() as $entry) {
            foreach ([$entry->data, ...($entry->hasDraft() ? [(array) ($entry->working()['data'] ?? [])] : [])] as $data) {
                if (self::holds($data, $judge)) {
                    $count++;

                    break;
                }
            }
        }

        return $count;
    }

    /** Whether a document holds, at any depth, a block whose type passes $judge. */
    private static function holds(mixed $value, \Closure $judge): bool
    {
        if (! is_array($value)) {
            return false;
        }

        if (is_string($value['type'] ?? null) && isset($value['id']) && $judge($value['type'])) {
            return true;
        }

        foreach ($value as $inner) {
            if (is_array($inner) && self::holds($inner, $judge)) {
                return true;
            }
        }

        return false;
    }

    private static function entries(int $count): string
    {
        return $count === 1 ? __('1 entry') : __(':count entries', ['count' => $count]);
    }

    private function found(): array
    {
        if ($this->found !== null) {
            return $this->found;
        }

        $templates = ['404' => ['collections' => [], 'entries' => 0]];
        $components = [];
        $collections = $this->cms->collections()->all();

        // A collection names its template; one that has pages and names none is framed by `default`.
        foreach ($collections as $collection) {
            if ($collection->system && ! $collection->routable()) {
                continue;
            }

            $slug = $collection->template !== '' ? $collection->template : ($collection->routable() ? 'default' : null);
            $slug !== null && $templates[$slug]['collections'][] = __($collection->title);
        }

        foreach ($this->cms->entries()->query()->get() as $entry) {
            $held = [];
            $chosen = [];

            foreach ([$entry->data, ...($entry->hasDraft() ? [(array) ($entry->working()['data'] ?? [])] : [])] as $data) {
                // An entry may choose another template than its collection's.
                is_string($data['template'] ?? null) && $data['template'] !== '' && $chosen[$data['template']] = true;
                self::walk($data, $held);
            }

            foreach (array_keys($chosen) as $slug) {
                if ($slug !== ($collections[$entry->collection]->template ?? '')) {
                    $templates[$slug]['entries'] = ($templates[$slug]['entries'] ?? 0) + 1;
                    $templates[$slug]['collections'] ??= [];
                }
            }

            foreach (array_keys($held) as $handle) {
                // A component does not use itself.
                if (! ($entry->collection === Components::COLLECTION && $entry->slug === $handle)) {
                    $components[$handle] = ($components[$handle] ?? 0) + 1;
                }
            }
        }

        foreach ($templates as $slug => $use) {
            $templates[$slug] = ['collections' => array_values(array_unique($use['collections'] ?? [])), 'entries' => (int) ($use['entries'] ?? 0)];
        }

        return $this->found = ['templates' => $templates, 'components' => $components];
    }

    /** Every component a document's blocks hold, at any depth: a block of the component type names it in `props.ref`. */
    private static function walk(mixed $value, array &$held): void
    {
        if (! is_array($value)) {
            return;
        }

        if (in_array($value['type'] ?? null, ['pattern', 'component'], true) && is_string($value['props']['ref'] ?? null) && $value['props']['ref'] !== '') {
            $held[$value['props']['ref']] = true;
        }

        foreach ($value as $inner) {
            self::walk($inner, $held);
        }
    }
}

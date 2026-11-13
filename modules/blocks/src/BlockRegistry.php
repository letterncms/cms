<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks;

use Cms\Content\Fields\Blueprint;
use Cms\Extend\Hooks;
use InvalidArgumentException;
use Throwable;

/**
 * Every block type available on this site: core blocks, plugin blocks
 * (e.g. forms/form) and theme blocks (themes/<theme>/blocks/<name>/block.json).
 */
final class BlockRegistry
{
    /** @var array<string, BlockType> */
    private array $types = [];

    /** @var array<string, string> category => English label, in the inserter's order */
    private array $categories = [];

    private bool $sourcesLoaded = false;

    /** @var array<string, array{script: ?string, style: ?string}> runtime features packages registered, by name */
    private array $features = [];

    /** What the site runtime brings itself (runtime/src/features.ts) and the renderer marks: a package's feature takes another name. */
    public const array RUNTIME = ['motion', 'lines', 'logic', 'ajax', 'code', 'search', 'tabs', 'filter', 'fields', 'behavior', 'navigate', 'scroll', 'forever', 'motion-toggle', 'account'];

    public function __construct(private readonly Hooks $hooks) {}

    public function register(array|BlockType $type): BlockType
    {
        $type = $type instanceof BlockType ? $type : BlockType::make($type);

        return $this->types[$type->name] = $type;
    }

    /**
     * A browser feature of a package, for its blocks: a script (an ES module whose `start()` runs once it has loaded,
     * and again after a page arrives without a page load) and a stylesheet, each a URL on the site (Plugin::asset).
     * A page gets them only when a block on it uses the feature: `uses` in the block's definition, or
     * `$d['renderer']->uses('name')` from its render function. The block workspace always has the stylesheet and
     * never runs the script.
     */
    public function feature(string $name, ?string $script = null, ?string $style = null): void
    {
        if (! preg_match('#^([a-z0-9-]+/)?[a-z0-9-]+$#', $name) || in_array($name, self::RUNTIME, true)) {
            throw new InvalidArgumentException("Invalid feature name {$name}.");
        }

        foreach ([$script, $style] as $url) {
            if ($url !== null && ! preg_match('#^/(?!/)[^\s"\'<>]+$#', $url)) {
                throw new InvalidArgumentException("A feature's files are addresses on the site, like /_cms/assets/…: {$url}.");
            }
        }

        $this->features[$name] = ['script' => $script, 'style' => $style];
    }

    /** @return array<string, array{script: ?string, style: ?string}> */
    public function features(): array
    {
        return $this->features;
    }

    /** Name a category of blocks for the inserter, in English (the admin translates it). Named ones come first, in this order. */
    public function category(string $name, string $label): void
    {
        $this->categories[$name] = $label;
    }

    /**
     * Every category a block uses, in the inserter's order: named ones first, then the
     * rest A–Z, labelled with their handle in title case.
     *
     * @return list<array{name: string, label: string}>
     */
    public function categories(): array
    {
        $used = array_unique(array_map(static fn (BlockType $t) => $t->category, $this->all()));
        $named = array_values(array_intersect(array_keys($this->categories), $used));
        $rest = array_values(array_diff($used, $named));
        sort($rest);

        return [
            ...array_map(fn (string $name) => ['name' => $name, 'label' => $this->categories[$name]], $named),
            ...array_map(static fn (string $name) => ['name' => $name, 'label' => ucwords(str_replace(['-', '_'], ' ', $name))], $rest),
        ];
    }

    public function get(string $name): ?BlockType
    {
        $this->loadSources();

        return $this->types[$name] ?? null;
    }

    /** @return array<string, BlockType> */
    public function all(): array
    {
        $this->loadSources();

        return $this->types;
    }

    /** Catalog for editors and agents, with theme variants applied. */
    public function catalog(): array
    {
        $variants = $this->hooks->filter('blocks.variants', []);

        return array_values(array_map(function (BlockType $t) use ($variants) {
            $data = $t->toArray();

            if (isset($variants[$t->name])) {
                $data['variants'] = $variants[$t->name];
            }

            return $data;
        }, $this->all()));
    }

    /** Resolve field definitions: fill `dynamic` option lists from `fields.options.<name>`, as every field does (Blueprint::withOptions). */
    public function resolveFields(array $fields): array
    {
        foreach ($fields as $i => $field) {
            if (isset($field['dynamic'])) {
                $fields[$i] = Blueprint::withOptions($field);
                unset($fields[$i]['dynamic']);
            }
        }

        return $fields;
    }

    /** Theme/plugin block folders: each <dir>/<name>/block.json (+ view.blade.php). */
    private function loadSources(): void
    {
        if ($this->sourcesLoaded) {
            return;
        }

        $this->sourcesLoaded = true;

        foreach ((array) $this->hooks->filter('blocks.folders', []) as $source) {
            $dir = is_array($source) ? $source['path'] : (string) $source;
            $namespace = is_array($source) ? ($source['namespace'] ?? null) : null;

            foreach (glob(rtrim($dir, '/').'/*/block.json') ?: [] as $file) {
                try {
                    $data = json_decode((string) file_get_contents($file), true, 64, JSON_THROW_ON_ERROR);
                    $name = (string) ($data['name'] ?? basename(dirname($file)));
                    $view = is_file(dirname($file).'/view.blade.php') ? dirname($file).'/view.blade.php' : null;

                    $this->register([...$data, 'name' => $namespace ? "{$namespace}/{$name}" : $name, 'view' => $view ? 'file:'.$view : ($data['view'] ?? null), 'package' => $data['package'] ?? 'theme']);
                } catch (Throwable $e) {
                    report($e);
                }
            }
        }
    }
}

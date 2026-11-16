<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks;

use Cms\Cms;
use Cms\Content\Entries\Frontmatter;
use Cms\Content\Fields\Blueprint;
use Cms\Extend\Hooks;

/**
 * Components are entries of the `components` collection (content/collections/components/*.md), so they
 * have drafts, publishing, history and comments like any entry. Plugins can add read-only ones through
 * the `blocks.component-sources` filter: folders of <handle>.json, or <handle>.md (front matter and
 * Block Markdown).
 *
 * A synced component (the default) is inserted as a reference and changes everywhere it is used; its
 * `props` (fields) let each instance set its own values, and blocks inside bind to them as `props.<handle>`.
 * One that is not synced (`synced: false`) is inserted as a copy of its blocks, to change freely there.
 */
final class Components
{
    public const string COLLECTION = 'components';

    /** The categories offered first, in this order. Any other words make a category too. */
    public const array CATEGORIES = ['Heroes', 'Text', 'Media', 'Features', 'People', 'Lists', 'Calls to Action', 'Pages'];

    /** The category whose components a new page can start from. */
    public const string PAGES = 'Pages';

    /** @var array<string, array<string, array>> */
    private array $cache = [];

    public function __construct(private readonly Cms $cms, private readonly Hooks $hooks, private readonly MarkdownCodec $codec) {}

    /** @return array<string, array{handle: string, id: ?string, title: string, description: string, category: string, keywords: list<string>, synced: bool, props: list<array>, blocks: list<array>, source: string, editable: bool}> */
    public function all(bool $working = false): array
    {
        $key = $working ? 'working' : 'live';

        if (isset($this->cache[$key])) {
            return $this->cache[$key];
        }

        $out = [];

        foreach ((array) $this->hooks->filter('blocks.component-sources', []) as $source) {
            foreach (glob(rtrim((string) ($source['path'] ?? ''), '/').'/*.{json,md}', GLOB_BRACE) ?: [] as $file) {
                $data = $this->read($file);

                if ($data !== null) {
                    $handle = pathinfo($file, PATHINFO_FILENAME);
                    $out[$handle] = self::shape($handle, null, $data, (string) ($source['source'] ?? 'plugin'), false);
                }
            }
        }

        if ($this->cms->collections()->find(self::COLLECTION)) {
            $query = $this->cms->entries()->query()->collection(self::COLLECTION);

            foreach (($working ? $query : $query->live())->get() as $entry) {
                $entry = $working ? $entry->withWorkingCopy() : $entry;
                $out[$entry->slug] = self::shape($entry->slug, $entry->id, ['title' => $entry->title, ...$entry->data], 'site', true);
            }
        }

        uasort($out, static fn (array $a, array $b) => [self::rank($a['category']), $a['category'], $a['title']] <=> [self::rank($b['category']), $b['category'], $b['title']]);

        return $this->cache[$key] = $out;
    }

    /** A component; with $working, its unpublished changes. Rendering one makes the page depend on it. */
    public function find(string $handle, bool $working = false): ?array
    {
        $component = $this->all($working)[$handle] ?? null;

        if ($component && $component['id']) {
            $this->hooks->dispatch('render.depend', 'entry:'.$component['id']);
        }

        return $component;
    }

    /**
     * Property values for one instance: the component's defaults, the instance's
     * own values, and values bound to data (`bind: {"values.title": "item.title"}`).
     * On the canvas ($editor) a link without a value is "#", so linked elements look
     * as they will; empty text and images show the renderer's placeholders.
     */
    public function values(array $component, array $values, Scope $scope, array $bind = [], bool $editor = false): array
    {
        $fields = (array) ($component['props'] ?? []);

        if ($fields === []) {
            return [];
        }

        $out = array_replace(Blueprint::make($fields)->defaults(), array_intersect_key($values, array_flip(array_column($fields, 'handle'))));

        foreach ($bind as $key => $path) {
            if (str_starts_with($key, 'values.')) {
                $out[substr($key, 7)] = $scope->resolve($path);
            }
        }

        if ($editor) {
            foreach ($fields as $field) {
                $handle = (string) ($field['handle'] ?? '');

                if (in_array($field['type'] ?? '', ['url', 'link'], true) && BlockRenderer::blank($out[$handle] ?? null)) {
                    $out[$handle] = '#';
                }
            }
        }

        return $out;
    }

    public function flush(): void
    {
        $this->cache = [];
    }

    /** Where a category goes in lists: the ones offered first in their order, then the rest A–Z. */
    public static function rank(string $category): int
    {
        $at = array_search($category, self::CATEGORIES, true);

        return $at === false ? count(self::CATEGORIES) : (int) $at;
    }

    public static function shape(string $handle, ?string $id, array $data, string $source, bool $editable): array
    {
        $keywords = $data['keywords'] ?? [];
        $synced = filter_var($data['synced'] ?? true, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? true;

        return [
            'handle' => $handle,
            'id' => $id,
            'title' => (string) ($data['title'] ?? $handle),
            'description' => (string) ($data['description'] ?? ''),
            'category' => trim((string) ($data['category'] ?? '')) ?: 'Other',
            'keywords' => array_values(array_filter(array_map('strval', is_array($keywords) ? $keywords : explode(',', (string) $keywords)), static fn (string $k) => trim($k) !== '')),
            'synced' => $synced,
            // Properties are what each place a reference stands fills in: a copy has none.
            'props' => $synced ? array_values(array_filter((array) ($data['props'] ?? []), 'is_array')) : [],
            'blocks' => array_values(array_filter((array) ($data['blocks'] ?? []), 'is_array')),
            'source' => $source,
            'editable' => $editable,
        ];
    }

    /** A plugin's component file: JSON, or front matter and Block Markdown. */
    private function read(string $file): ?array
    {
        $text = (string) @file_get_contents($file);

        if (str_ends_with($file, '.json')) {
            $data = json_decode($text, true);

            return is_array($data) ? $data : null;
        }

        try {
            [$meta, $body] = Frontmatter::parse($text);

            return [...(array) $meta, 'blocks' => app(Document::class)->normalize($this->codec->decode((string) $body))];
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }
}

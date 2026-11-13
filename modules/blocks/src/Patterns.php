<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks;

use Cms\Cms;
use Cms\Content\Entries\Frontmatter;
use Cms\Extend\Hooks;

/**
 * Patterns are arrangements of blocks to start from: inserted as a copy, then edited freely. A pattern is
 * never synced and has no properties (that is a component). They are entries of the `patterns` collection,
 * one file each (content/collections/patterns/<handle>.md: front matter with the title, a category, a
 * description and keywords, and the blocks as Block Markdown), so they have drafts, history and comments.
 *
 * Plugins add read-only ones through the `blocks.pattern-sources` filter: folders of <handle>.md in the
 * same form (or <handle>.json with the blocks as a list).
 */
final class Patterns
{
    public const string COLLECTION = 'patterns';

    /** The categories offered first, in this order. Any other words make a category too. */
    public const array CATEGORIES = ['Heroes', 'Text', 'Media', 'Features', 'People', 'Lists', 'Calls to Action', 'Pages'];

    /** The category whose patterns a new page can start from. */
    public const string PAGES = 'Pages';

    /** @var array<string, array<string, array>> */
    private array $cache = [];

    public function __construct(private readonly Cms $cms, private readonly Hooks $hooks, private readonly MarkdownCodec $codec) {}

    /** @return array<string, array{handle: string, id: ?string, title: string, description: string, category: string, keywords: list<string>, blocks: list<array>, source: string, editable: bool}> */
    public function all(bool $working = false): array
    {
        $key = $working ? 'working' : 'live';

        if (isset($this->cache[$key])) {
            return $this->cache[$key];
        }

        $out = [];

        foreach ((array) $this->hooks->filter('blocks.pattern-sources', []) as $source) {
            foreach (glob(rtrim((string) ($source['path'] ?? ''), '/').'/*.{md,json}', GLOB_BRACE) ?: [] as $file) {
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

    public function find(string $handle, bool $working = false): ?array
    {
        return $this->all($working)[$handle] ?? null;
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

        return [
            'handle' => $handle,
            'id' => $id,
            'title' => (string) ($data['title'] ?? $handle),
            'description' => (string) ($data['description'] ?? ''),
            'category' => trim((string) ($data['category'] ?? '')) ?: 'Other',
            'keywords' => array_values(array_filter(array_map('strval', is_array($keywords) ? $keywords : explode(',', (string) $keywords)), static fn (string $k) => trim($k) !== '')),
            'blocks' => array_values(array_filter((array) ($data['blocks'] ?? []), 'is_array')),
            'source' => $source,
            'editable' => $editable,
        ];
    }

    /** A plugin's pattern file: front matter and Block Markdown, or JSON. */
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

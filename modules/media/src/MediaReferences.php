<?php

declare(strict_types=1);

namespace Cms\Modules\Media;

use Cms\Modules\Blocks\BlockRegistry;
use Cms\Support\Yaml;

/**
 * Where media is used: entries (with their unpublished changes), templates, components,
 * globals, design tokens and settings. It answers what would break: ids and /media/ URLs
 * that point at nothing, records without a file, files without a record, and items
 * nothing uses.
 */
final class MediaReferences
{
    private const string TOKEN = '/media:([0-9a-z]{26})/i';

    /** @var array<string, true> field handles that hold media, at any depth */
    private array $handles = [];

    /** @var list<array>|null every reference, read once per request: a file's details, its delete and its dry run ask in turn */
    private ?array $all = null;

    /** After something that holds references was written: read them again. */
    public function forget(): void
    {
        $this->all = null;
    }

    /** @return list<array{id: string, where: array{kind: string, id: string, title: string, locale?: ?string, path: string}}> */
    public function all(): array
    {
        if ($this->all !== null) {
            return $this->all;
        }

        $this->handles = $this->mediaHandles();
        $found = [];

        foreach (cms()->entries()->query()->get() as $entry) {
            // The collection comes with the entry: whoever lists the uses doesn't look each entry up again.
            $where = ['kind' => 'entry', 'id' => (string) $entry->id, 'title' => (string) $entry->title, 'locale' => $entry->locale, 'collection' => $entry->collection];
            $this->walk($entry->data, $where, '', $found);
            $entry->hasDraft() && $this->walk($entry->working(), $where, '', $found);
        }

        foreach (Yaml::directory(content_path('globals')) as $handle => $data) {
            $this->walk($data, ['kind' => 'global', 'id' => (string) $handle, 'title' => (string) $handle], '', $found);
        }

        $tokens = content_path('design/tokens.json');

        if (is_file($tokens)) {
            $this->walk((array) json_decode((string) file_get_contents($tokens), true), ['kind' => 'design', 'id' => 'tokens', 'title' => 'Design tokens'], '', $found, styles: true);
        }

        return $this->all = $found;
    }

    /**
     * @return array{items: int, dangling: list<array>, missing_files: list<string>, orphan_files: list<string>, unused: list<string>, parse_errors: list<string>}
     */
    public function report(): array
    {
        $references = $this->all();
        $items = MediaItem::query()->get(['id', 'path'])->keyBy('id');
        $paths = $items->pluck('path')->flip();
        $usedIds = [];
        $usedPaths = [];
        $dangling = [];

        foreach ($references as $reference) {
            $id = $reference['id'];

            if (str_starts_with($id, '/')) {
                $path = ltrim((string) parse_url($id, PHP_URL_PATH), '/');
                $usedPaths[$path] = true;

                if (isset($paths[$path])) {
                    $usedIds[$items->firstWhere('path', $path)->id] = true;
                } elseif (! is_file(public_path($path))) {
                    $dangling[] = $reference;
                }
            } elseif (isset($items[strtolower($id)])) {
                $usedIds[strtolower($id)] = true;
            } else {
                $dangling[] = $reference;
            }
        }

        $orphans = [];
        $root = public_path('media');

        if (is_dir($root)) {
            foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS)) as $file) {
                $relative = 'media/'.ltrim(str_replace('\\', '/', substr($file->getPathname(), strlen($root))), '/');

                // The folder's own .htaccess is the CMS's, not somebody's forgotten file.
                if ($file->isFile() && $relative !== 'media/.htaccess' && ! isset($paths[$relative]) && ! isset($usedPaths[$relative])) {
                    $orphans[] = $relative;
                }
            }
        }

        sort($orphans);

        return [
            'items' => $items->count(),
            'dangling' => $dangling,
            'missing_files' => $items->filter(static fn ($item) => ! is_file(public_path($item->path)))->keys()->values()->all(),
            'orphan_files' => $orphans,
            'unused' => $items->keys()->diff(array_keys($usedIds))->values()->all(),
            'parse_errors' => [],
        ];
    }

    /** @return list<array> where one item is used, by id or by its URL */
    public function of(MediaItem $item): array
    {
        return array_values(array_filter($this->all(), static fn (array $r) => strtolower($r['id']) === $item->id || (str_starts_with($r['id'], '/') && ltrim((string) parse_url($r['id'], PHP_URL_PATH), '/') === $item->path)));
    }

    /**
     * What uses one item, each thing once: an entry with its collection (where it opens), a global, the design.
     *
     * @return list<array{kind: string, id: string, title: string, collection: ?string, locale: ?string}>
     */
    public function usedBy(MediaItem $item): array
    {
        $used = [];

        foreach ($this->of($item) as $reference) {
            $where = $reference['where'];
            $used[$where['kind'].':'.$where['id']] ??= [
                'kind' => $where['kind'],
                'id' => $where['id'],
                'title' => $where['title'],
                'collection' => $where['collection'] ?? null,
                'locale' => $where['locale'] ?? null,
            ];
        }

        return array_values($used);
    }

    /**
     * A file got another address (its bytes changed, and files are cached for a year by their address): what
     * names it by that address (`/media/2026/11/photo-ab12.jpg`, with or without a query) names the new one.
     * References by id need nothing. `$write: false` only says what would be rewritten.
     *
     * @return list<array{action: string, type: string, id: string, path: string}> each place rewritten, once
     */
    public function repoint(string $from, string $to, bool $write = true): array
    {
        $changes = [];
        $is = static fn (mixed $value): bool => is_string($value) && str_starts_with($value, '/media/') && ltrim((string) parse_url($value, PHP_URL_PATH), '/') === $from;
        $swap = static function (mixed $value) use (&$swap, $is, $from, $to) {
            if (is_array($value)) {
                return array_map($swap, $value);
            }

            return $is($value) ? '/'.$to.substr($value, strlen('/'.$from)) : $value;
        };
        $uses = array_filter($this->all(), static fn (array $r) => $is($r['id']));

        foreach ($uses as $use) {
            $changes[$use['where']['kind'].':'.$use['where']['id']] ??= ['action' => 'update', 'type' => $use['where']['kind'], 'id' => $use['where']['id'], 'path' => $use['where']['path']];
        }

        if (! $write || $changes === []) {
            return array_values($changes);
        }

        foreach ($changes as $change) {
            if ($change['type'] === 'entry' && ($entry = cms()->entries()->find($change['id']))) {
                $entry->data = $swap($entry->data);
                $entry->draft = $entry->draft === null ? null : $swap($entry->draft);
                cms()->entries()->save($entry);
            } elseif ($change['type'] === 'global' && is_file($file = content_path("globals/{$change['id']}.yaml"))) {
                Yaml::write($file, $swap(Yaml::read($file)));
            } elseif ($change['type'] === 'design' && is_file($file = content_path('design/tokens.json'))) {
                file_put_contents($file, json_encode($swap((array) json_decode((string) file_get_contents($file), true)), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)."\n");
            }
        }

        $this->forget();
        cms()->entries()->flush();

        return array_values($changes);
    }

    private function walk(mixed $value, array $where, string $path, array &$found, bool $styles = false): void
    {
        if (is_string($value)) {
            $key = (string) substr((string) strrchr('.'.$path, '.'), 1);
            $key = is_numeric($key) ? (string) substr((string) strrchr('.'.substr($path, 0, -strlen($key) - 1), '.'), 1) : $key;

            if (preg_match_all(self::TOKEN, $value, $matches)) {
                foreach ($matches[1] as $id) {
                    $found[] = ['id' => strtolower($id), 'where' => [...$where, 'path' => $path]];
                }
            } elseif (isset($this->handles[$key]) && preg_match('/^[0-9a-z]{26}$/i', $value)) {
                $found[] = ['id' => strtolower($value), 'where' => [...$where, 'path' => $path]];
            } elseif (preg_match('#^/media/[^\s"\'<>]+$#', $value)) {
                $found[] = ['id' => $value, 'where' => [...$where, 'path' => $path]];
            }

            return;
        }

        if (is_array($value)) {
            foreach ($value as $key => $child) {
                $this->walk($child, $where, ltrim($path.'.'.$key, '.'), $found, $styles);
            }
        }
    }

    /** Every handle a media field goes by: in blueprints and in block types. */
    private function mediaHandles(): array
    {
        $handles = ['image' => true, 'poster' => true];

        foreach (cms()->collections()->all() as $collection) {
            $this->collect($collection->blueprint()->toArray(), $handles);

            foreach (array_keys($collection->blueprints()) as $name) {
                $this->collect($collection->blueprint($name)->toArray(), $handles);
            }
        }

        // Blocks may be off on this site: blueprints are all there is then.
        if (app()->bound(BlockRegistry::class)) {
            foreach (app(BlockRegistry::class)->all() as $type) {
                foreach ($type->blueprint()->fields() as $field) {
                    in_array($field->type, ['media', 'file'], true) && $handles[$field->handle] = true;
                }
            }
        }

        return $handles;
    }

    private function collect(array $fields, array &$handles): void
    {
        foreach ($fields as $field) {
            if (! is_array($field)) {
                continue;
            }

            in_array($field['type'] ?? null, ['media', 'file'], true) && isset($field['handle']) && $handles[(string) $field['handle']] = true;

            // A group's and a repeater's fields, and the fields of each kind of row of a matrix.
            foreach (['fields', 'sets', 'types'] as $nested) {
                is_array($field[$nested] ?? null) && $this->collect($field[$nested], $handles);
            }
        }
    }
}

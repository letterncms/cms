<?php

declare(strict_types=1);

namespace Cms\Content\Entries;

use Carbon\CarbonImmutable;
use Cms\Content\Collections\Collection;
use Cms\Content\Collections\CollectionRepository;
use Cms\Content\Fields\FieldTypeRegistry;
use Cms\Support\Files;
use RuntimeException;

/**
 * Flat-file entries: content/collections/<handle>/[<locale>/][<parent>/]<slug>.md
 * with YAML frontmatter. The body field of its blueprint is written as the
 * Markdown body. Working-copy drafts live in storage/drafts (not in git).
 */
final class FileDriver implements EntryDriver
{
    private const array RESERVED = ['id', 'title', 'status', 'published_at', 'expires_at', 'author', 'origin', 'position', 'blueprint', 'created_at', 'updated_at'];

    /** @var array<string, array<string, array{entry: Entry, path: string}>> */
    private array $indexes = [];

    public function __construct(
        private readonly CollectionRepository $collections,
        private readonly FieldTypeRegistry $types,
    ) {}

    /** A write lock may have been held by another request since our previous read. */
    public function flush(): void
    {
        $this->indexes = [];
    }

    public function find(string $id): ?Entry
    {
        $id = strtolower($id);

        foreach ($this->fileCollections() as $collection) {
            if (isset($this->index($collection)[$id])) {
                return clone $this->index($collection)[$id]['entry'];
            }
        }

        return null;
    }

    public function findMany(array $ids): array
    {
        return array_values(array_filter(array_map($this->find(...), $ids)));
    }

    public function findByUri(string $uri, ?string $locale): ?Entry
    {
        foreach ($this->fileCollections() as $collection) {
            foreach ($this->index($collection) as $item) {
                if ($item['entry']->uri === $uri && ($locale === null || $item['entry']->locale === $locale)) {
                    return clone $item['entry'];
                }
            }
        }

        return null;
    }

    public function query(EntryQuery $query, array $collections): array
    {
        $entries = $this->filter($query, $collections);
        $entries = EntryFilter::sort($entries, $query->orders ?: [['position', 'asc'], ['title', 'asc']], $query->relevance ? $query->search : null, $query->working);

        return array_slice($entries, $query->offset, $query->limit);
    }

    public function count(EntryQuery $query, array $collections): int
    {
        return count($this->filter($query, $collections));
    }

    public function save(Entry $entry, Collection $collection): void
    {
        $now = CarbonImmutable::now();
        $entry->createdAt ??= $now;
        $entry->updatedAt = $now;

        $index = $this->index($collection);
        $oldPath = $index[$entry->id]['path'] ?? null;
        $newPath = $this->pathFor($entry, $collection);
        $root = $this->root($collection);

        if ($oldPath !== null && $oldPath !== $newPath) {
            $this->move($root, $oldPath, $newPath);
        } elseif ($oldPath === null && is_file(Files::within($root, $newPath))) {
            throw new RuntimeException("A file already exists at {$newPath}.");
        }

        $document = $this->serialize($entry, $collection);
        Files::put(Files::within($root, $newPath), $document);
        $this->writeDraft($entry);
        // API responses and versions must describe the persisted file representation.
        $entry->data = $this->parse($collection, $newPath, $document)->data;
        $this->forget($collection);
    }

    public function delete(Entry $entry, Collection $collection): void
    {
        $path = $this->index($collection)[$entry->id]['path'] ?? null;

        if ($path !== null) {
            @unlink(Files::within($this->root($collection), $path));
        }

        @unlink($this->draftFile($entry->id));
        $this->forget($collection);
    }

    /** @return array<string, array{entry: Entry, path: string}> */
    public function index(Collection $collection): array
    {
        if (isset($this->indexes[$collection->handle])) {
            return $this->indexes[$collection->handle];
        }

        $root = $this->root($collection);
        $files = is_dir($root) ? $this->scan($root) : [];
        $signature = $this->signature($collection, $files);
        $cache = storage_path("cache/entries/{$collection->handle}.ser");

        if (is_file($cache)) {
            $cached = @unserialize((string) file_get_contents($cache), ['allowed_classes' => [Entry::class, CarbonImmutable::class]]);

            if (is_array($cached) && ($cached['signature'] ?? null) === $signature) {
                return $this->indexes[$collection->handle] = $cached['index'];
            }
        }

        $index = [];

        foreach ($files as $relative) {
            $entry = $this->parse($collection, $relative, (string) file_get_contents($root.'/'.$relative));
            $index[$entry->id] = ['entry' => $entry, 'path' => $relative];
        }

        $this->resolveTree($index, $collection);

        try {
            Files::put($cache, serialize(['signature' => $signature, 'index' => $index]));
        } catch (\Throwable) {
            // Cache is optional.
        }

        return $this->indexes[$collection->handle] = $index;
    }

    /** Parsing depends on the files, the collection's fields and the code that reads them. */
    public function signature(Collection $collection, ?array $files = null): string
    {
        $root = $this->root($collection);
        $files ??= is_dir($root) ? $this->scan($root) : [];

        return hash('xxh128', implode('|', array_map(static fn ($f) => $f.':'.filemtime($root.'/'.$f), $files)).'|'.$this->draftSignature().'|'.\Cms\Cms::VERSION.'|'.json_encode($collection->toArray()));
    }

    public function forget(Collection $collection): void
    {
        unset($this->indexes[$collection->handle]);
        // File times have one-second resolution: a save within the same second as the last
        // index (or a draft rewritten in place) would otherwise be served from the cache.
        @unlink(storage_path("cache/entries/{$collection->handle}.ser"));
    }

    private function filter(EntryQuery $query, array $collections): array
    {
        $entries = [];

        foreach ($collections as $handle) {
            $collection = $this->collections->find($handle);

            if ($collection) {
                foreach ($this->index($collection) as $item) {
                    $entries[] = clone $item['entry'];
                }
            }
        }

        return EntryFilter::apply($entries, $query);
    }

    /**
     * The entries a folder holds in this layout, wherever it is: `<root>/[<locale>/][<parent>/]<slug>.md`.
     * What a site carries for a collection, whatever driver the collection it lands in uses. Parents come
     * from the folders, as in a site; there are no working copies and no URLs, and `$locales` says which
     * first folders are languages (the first of them is the one entries without a folder are in).
     *
     * @param  list<string>  $locales
     * @return array<string, Entry> by path without `.md`
     */
    public function read(Collection $collection, string $root, array $locales): array
    {
        $entries = $ids = [];

        foreach (is_dir($root) ? $this->scan($root) : [] as $relative) {
            $entry = $this->parse($collection, $relative, (string) file_get_contents($root.'/'.$relative), $locales);
            $entries[substr($relative, 0, -3)] = $entry;
        }

        foreach ($entries as $path => $entry) {
            // A slug of digits ("404") is an integer key.
            $entry->parentId = ($entries[dirname((string) $path)] ?? null)?->id;
        }

        return $entries;
    }

    /** An entry as the file it would be in this layout: the path under its collection's folder, and the document. */
    public function document(Entry $entry, Collection $collection, array $ancestors = [], ?string $defaultLocale = null): array
    {
        $segments = $entry->locale !== ($defaultLocale ?? (string) config('app.locale', 'en')) ? [$entry->locale] : [];

        return [implode('/', [...$segments, ...$ancestors, $entry->slug.'.md']), $this->serialize($entry, $collection)];
    }

    /** @param  ?list<string>  $locales  The languages of a folder that is not the site's own (read()). */
    private function parse(Collection $collection, string $relative, string $document, ?array $locales = null): Entry
    {
        [$meta, $body] = Frontmatter::parse($document);
        $defaultLocale = $locales[0] ?? (string) config('app.locale', 'en');
        $segments = explode('/', $relative);
        $isLocale = $locales === null ? $this->isLocaleDir($segments[0]) : in_array($segments[0], array_slice($locales, 1), true);
        $locale = count($segments) > 1 && $isLocale ? $segments[0] : $defaultLocale;
        $slug = basename($relative, '.md');

        $data = array_diff_key($meta, array_flip(self::RESERVED));

        if ($field = $collection->body(isset($meta['blueprint']) ? (string) $meta['blueprint'] : null)) {
            $type = $this->types->resolve($field->type);
            $data[$field->handle] = $type->serializesToMarkdown() ? $type->fromMarkdown($body, $field) : ($data[$field->handle] ?? null);
        }

        // A file written by hand for a site may leave its id out: nothing can name it, and it gets a new one anyway.
        $id = strtolower((string) ($meta['id'] ?? ($locales !== null ? \Illuminate\Support\Str::ulid() : throw new RuntimeException("Entry {$relative} in {$collection->handle} has no id."))));
        $draft = $locales === null && is_file($this->draftFile($id)) ? json_decode((string) file_get_contents($this->draftFile($id)), true) : null;

        return new Entry(
            id: $id,
            collection: $collection->handle,
            locale: $locale,
            slug: $slug,
            title: (string) ($meta['title'] ?? $slug),
            status: (string) ($meta['status'] ?? 'published'),
            data: $data,
            draft: is_array($draft) ? $draft : null,
            originId: isset($meta['origin']) ? strtolower((string) $meta['origin']) : null,
            parentId: null,
            position: (int) ($meta['position'] ?? 0),
            authorId: isset($meta['author']) ? (string) $meta['author'] : null,
            blueprint: isset($meta['blueprint']) ? (string) $meta['blueprint'] : null,
            publishedAt: $this->date($meta['published_at'] ?? null),
            expiresAt: $this->date($meta['expires_at'] ?? null),
            createdAt: $this->date($meta['created_at'] ?? null),
            updatedAt: $this->date($meta['updated_at'] ?? null),
        );
    }

    /** Tree parents come from folder nesting: a/b.md is a child of a.md. */
    private function resolveTree(array &$index, Collection $collection): void
    {
        $byPath = [];

        foreach ($index as $id => $item) {
            $byPath[substr($item['path'], 0, -3)] = $id;
        }

        foreach ($index as $id => $item) {
            $dir = dirname($item['path']);

            if ($dir !== '.' && isset($byPath[$dir])) {
                $index[$id]['entry']->parentId = $byPath[$dir];
            }
        }

        foreach ($index as $id => $item) {
            $index[$id]['entry']->uri = app(UriBuilder::class)->build($item['entry'], $collection, static fn (string $pid) => $index[$pid]['entry'] ?? null);
        }
    }

    private function serialize(Entry $entry, Collection $collection): string
    {
        $data = $entry->data;
        $body = '';

        if ($field = $collection->body($entry->blueprint)) {
            $type = $this->types->resolve($field->type);

            if ($type->serializesToMarkdown()) {
                $body = $type->toMarkdown($data[$field->handle] ?? null, $field);
                unset($data[$field->handle]);
            }
        }

        $meta = array_filter([
            'id' => $entry->id,
            'title' => $entry->title,
            'status' => $entry->status,
            'published_at' => $entry->publishedAt?->toIso8601String(),
            'expires_at' => $entry->expiresAt?->toIso8601String(),
            'author' => $entry->authorId,
            'origin' => $entry->originId,
            'position' => $collection->isTree() || $collection->structure === 'list' ? $entry->position : null,
            'blueprint' => $entry->blueprint,
        ], static fn ($v) => $v !== null) + array_filter($data, static fn ($v) => $v !== null && $v !== [] && $v !== '') + array_filter([
            'created_at' => $entry->createdAt?->toIso8601String(),
            'updated_at' => $entry->updatedAt?->toIso8601String(),
        ]);

        return Frontmatter::dump($meta, $body);
    }

    private function pathFor(Entry $entry, Collection $collection): string
    {
        $segments = [];

        if ($entry->locale !== (string) config('app.locale', 'en')) {
            $segments[] = $entry->locale;
        }

        $ancestors = [];
        $index = $this->index($collection);
        $parentId = $entry->parentId;
        $guard = 0;

        while ($parentId !== null && isset($index[$parentId]) && $guard++ < 32) {
            array_unshift($ancestors, $index[$parentId]['entry']->slug);
            $parentId = $index[$parentId]['entry']->parentId;
        }

        return implode('/', [...$segments, ...$ancestors, $entry->slug.'.md']);
    }

    private function move(string $root, string $from, string $to): void
    {
        $fromFile = Files::within($root, $from);
        $toFile = Files::within($root, $to);

        if (is_file($toFile)) {
            throw new RuntimeException("Cannot move entry: {$to} already exists.");
        }

        Files::ensureDir(dirname($toFile));

        rename($fromFile, $toFile);

        $fromDir = substr($fromFile, 0, -3);

        if (is_dir($fromDir)) {
            rename($fromDir, substr($toFile, 0, -3));
        }
    }

    private function writeDraft(Entry $entry): void
    {
        $file = $this->draftFile($entry->id);

        $entry->draft === null
            ? @unlink($file)
            : Files::put($file, json_encode($entry->draft, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
    }

    private function draftFile(string $id): string
    {
        return storage_path('drafts/'.preg_replace('/[^a-z0-9]/', '', strtolower($id)).'.json');
    }

    private function draftSignature(): string
    {
        $dir = storage_path('drafts');

        return is_dir($dir) ? (string) filemtime($dir) : '';
    }

    /** @return list<string> Relative *.md paths. */
    private function scan(string $root): array
    {
        $out = [];
        $iterator = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS));

        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getExtension() === 'md' && ! str_starts_with($file->getFilename(), '.')) {
                $out[] = str_replace('\\', '/', substr($file->getPathname(), strlen($root) + 1));
            }
        }

        sort($out);

        return $out;
    }

    private function isLocaleDir(string $segment): bool
    {
        return in_array($segment, cms()->locales(), true) && $segment !== config('app.locale', 'en');
    }

    private function root(Collection $collection): string
    {
        return content_path('collections/'.$collection->handle);
    }

    /** @return list<Collection> */
    private function fileCollections(): array
    {
        return array_values(array_filter($this->collections->all(), static fn (Collection $c) => $c->driver === 'files'));
    }

    private function date(mixed $value): ?CarbonImmutable
    {
        return match (true) {
            $value instanceof \DateTimeInterface => CarbonImmutable::instance($value),
            is_int($value) => CarbonImmutable::createFromTimestamp($value),
            is_string($value) && $value !== '' => CarbonImmutable::parse($value),
            default => null,
        };
    }
}

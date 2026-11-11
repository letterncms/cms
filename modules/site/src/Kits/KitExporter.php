<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Kits;

use Carbon\CarbonImmutable;
use Cms\Abilities\AbilityException;
use Cms\Cms;
use Cms\Content\Collections\Collection;
use Cms\Content\Entries\Entry;
use Cms\Content\Entries\FileDriver;
use Cms\Modules\Media\MediaManifest;
use Cms\Modules\Site\Design\Design;
use Cms\Support\Files;
use Cms\Support\Yaml;
use Throwable;

/**
 * Turns this site into a kit: what it holds and how it looks, in the layout a kit has (Kit). Only content and
 * design travel: the collections and their published entries (in the file layout, whatever driver they use;
 * drafts only when asked for), the templates and components, but no other collection a plugin owns, the
 * global sets, the menus, the design folder, the media something names, what plugins keep beside the
 * content (`kits.content`), and the settings a kit may carry (`kits.settings`). Never accounts, tokens,
 * secrets, submissions, analytics, the audit log, licences or the rest of config/.
 */
final class KitExporter
{
    /** What a record stamps on itself when it is saved: the kit's copy is the site's, not a moment of it. */
    private const array STAMPS = ['published_at' => 1, 'updated_at' => 1, 'created_at' => 1];

    public function __construct(
        private readonly Cms $cms,
        private readonly FileDriver $driver,
        private readonly Design $design,
        private readonly KitFiles $files,
    ) {}

    /**
     * Every file the kit would hold, by its path inside it, without writing one.
     *
     * @param  array{handle: string, name: string, description?: ?string, version?: ?string, license?: ?string}  $about
     * @return array<string, string> path => contents
     */
    public function files(array $about, bool $drafts = false): array
    {
        $out = [];
        $text = '';

        foreach ($this->collections() as $handle => $collection) {
            $file = content_path("collections/{$handle}.yaml");

            if (is_file($file)) {
                $out["content/collections/{$handle}.yaml"] = Yaml::dump(array_diff_key(Yaml::read($file), self::STAMPS));
            }

            foreach ($this->entries($collection, $drafts) as $path => $document) {
                $out["content/collections/{$handle}/{$path}"] = $document;
            }
        }

        foreach (['globals', 'navigation'] as $folder) {
            foreach (glob(content_path($folder).'/*.yaml') ?: [] as $file) {
                Files::isHandle(basename($file, '.yaml')) && $out["content/{$folder}/".basename($file)] = Yaml::dump(array_diff_key(Yaml::read($file), self::STAMPS));
            }
        }

        foreach ($this->tree($this->design->path()) as $relative) {
            // The design's own build (the compiled stylesheet) is made again from these.
            $out["content/design/{$relative}"] = (string) file_get_contents($this->design->path($relative));
        }

        foreach ((array) $this->cms->hooks()->filter('kits.content', []) as $folder) {
            if (is_string($folder) && Files::isHandle($folder)) {
                foreach ($this->tree(content_path($folder)) as $relative) {
                    preg_match('/\.(yaml|json|md)$/', $relative) && $out["content/{$folder}/{$relative}"] = (string) file_get_contents(content_path("{$folder}/{$relative}"));
                }
            }
        }

        foreach ($this->settings() as $namespace => $values) {
            $out["config/{$namespace}.yaml"] = Yaml::dump($values);
        }

        foreach ($out as $contents) {
            $text .= $contents;
        }

        // The media something here names, by its id or its path, and nothing else of the library.
        foreach (glob(app(MediaManifest::class)->dir().'/*.yaml') ?: [] as $file) {
            $id = basename($file, '.yaml');
            $record = Yaml::read($file);
            $path = (string) ($record['path'] ?? '');

            if (($record['id'] ?? null) !== $id || $path === '' || ! is_file(public_path($path)) || (! str_contains($text, $id) && ! str_contains($text, $path))) {
                continue;
            }

            $out["content/media/{$id}.yaml"] = Yaml::dump(array_diff_key($record, self::STAMPS));
            $out["public/{$path}"] = (string) file_get_contents(public_path($path));
        }

        ksort($out);

        return ['kit.json' => json_encode($this->manifest($about), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)."\n", ...$out];
    }

    /**
     * Write the kit into a folder that is empty or not there yet, then read it back as a kit would be read
     * from anywhere else: what this site holds that a kit may not carry refuses the export.
     *
     * @param  array{handle: string, name: string, description?: ?string, version?: ?string, license?: ?string}  $about
     * @return array{kit: Kit, files: int, bytes: int}
     */
    public function export(string $folder, array $about, bool $replace = false, bool $drafts = false): array
    {
        $folder = rtrim($folder, '/');

        if (basename($folder) !== $about['handle']) {
            throw AbilityException::invalid(__('A kit’s folder is named after its handle: :handle.', ['handle' => $about['handle']]));
        }

        if (is_link($folder) || (is_dir($folder) && ! $replace && array_diff(scandir($folder) ?: [], ['.', '..']) !== [])) {
            throw AbilityException::conflict(__(':folder is not empty. Choose another folder, or replace it.', ['folder' => $folder]));
        }

        $files = $this->files($about, $drafts);
        $stage = dirname($folder).'/.'.basename($folder).'-'.bin2hex(random_bytes(4));

        try {
            foreach ($files as $path => $contents) {
                Files::put(Files::within($stage, $path), $contents);
            }

            $this->files->read(Kit::load($stage, 'site', $about['handle']));
            is_dir($folder) && Files::deleteDirectory($folder);
            Files::ensureDir(dirname($folder));

            if (! @rename($stage, $folder)) {
                throw new \RuntimeException(__('Could not put the kit in :folder.', ['folder' => $folder]));
            }
        } finally {
            is_dir($stage) && Files::deleteDirectory($stage);
        }

        return ['kit' => Kit::load($folder, 'site'), 'files' => count($files), 'bytes' => array_sum(array_map('strlen', $files))];
    }

    /** @return array<string, Collection> the collections whose definitions or entries travel */
    private function collections(): array
    {
        $out = [];

        foreach ($this->cms->collections()->all() as $handle => $collection) {
            // A plugin's own collection (account pages, a store's pages) is the plugin's: only the design's travel.
            if (Files::isHandle($handle) && (! $collection->system || in_array($handle, ['templates', 'components'], true))) {
                $out[$handle] = $collection;
            }
        }

        ksort($out);

        return $out;
    }

    /** @return array<string, string> the collection's entries in the file layout: path => document */
    private function entries(Collection $collection, bool $drafts): array
    {
        /** @var array<string, Entry> $entries */
        $entries = [];

        foreach ($this->cms->entries()->query()->collection($collection->handle)->ungated()->get() as $entry) {
            if ($drafts || $entry->status === 'published') {
                $entries[$entry->id] = $entry;
            }
        }

        $out = [];

        foreach ($entries as $entry) {
            $ancestors = [];

            for ($parent = $entry->parentId, $guard = 0; $parent !== null && isset($entries[$parent]) && $guard++ < 32; $parent = $entries[$parent]->parentId) {
                array_unshift($ancestors, $entries[$parent]->slug);
            }

            $copy = clone $entry;
            // Who wrote it and when it was saved are this site's: the site it goes to says its own.
            $copy->authorId = null;
            $copy->createdAt = $copy->updatedAt = null;
            [$path, $document] = $this->driver->document($copy, $collection, $ancestors, $this->cms->defaultLocale());
            $out[$path] = $document;
        }

        ksort($out);

        return $out;
    }

    /** @return array<string, array<string, mixed>> namespace => the values of the settings a kit carries */
    private function settings(): array
    {
        $out = [];

        foreach (self::carried($this->cms) as $namespace => $keys) {
            $stored = Yaml::read(site_path("config/{$namespace}.yaml"));
            $values = array_intersect_key($stored, array_flip($keys));
            $values = array_filter($values, static fn ($v) => $v !== null && $v !== [] && $v !== '');
            $values !== [] && $out[$namespace] = $values;
        }

        return $out;
    }

    /**
     * The settings a kit may carry, by namespace: what belongs to how a site looks and reads, never what is
     * about the place it runs (its name, address, mail, keys). A plugin adds its own with `kits.settings`;
     * a field that holds a secret is never one of them, whatever a filter says.
     *
     * @return array<string, list<string>>
     */
    public static function carried(Cms $cms): array
    {
        $carried = (array) $cms->hooks()->filter('kits.settings', ['site' => ['description', 'favicon', 'search_index']]);
        $out = [];

        foreach ($carried as $namespace => $keys) {
            if (! is_string($namespace) || ! preg_match('/^[a-z0-9][a-z0-9_-]{0,63}$/D', $namespace) || ! $cms->settingsRegistry()->has($namespace)) {
                continue;
            }

            $secret = [];

            foreach ($cms->settingsRegistry()->schemas()[$namespace]['fields'] ?? [] as $field) {
                (in_array($field['type'] ?? '', ['secret', 'password'], true) || ! empty($field['secret']) || ! empty($field['encrypted'])) && $secret[] = (string) ($field['handle'] ?? '');
            }

            $out[$namespace] = array_values(array_diff(array_filter((array) $keys, 'is_string'), $secret));
        }

        return $out;
    }

    /** @param  array{handle: string, name: string, description?: ?string, version?: ?string, license?: ?string}  $about */
    private function manifest(array $about): array
    {
        $plugins = array_keys(array_filter($this->cms->packages()->active(), static fn ($package) => ! $package->core));
        sort($plugins);
        [$major, $minor] = array_map('intval', explode('.', (string) preg_replace('/[-+].*$/', '', Cms::VERSION).'.0.0'));

        $manifest = array_filter([
            'handle' => $about['handle'],
            'name' => $about['name'],
            'description' => $about['description'] ?? null,
            'version' => $about['version'] ?? '1.0.0',
            'license' => $about['license'] ?? null,
            // What it was made on, and every later release of that line: a kit is content, and content keeps.
            'cms' => '>='.$major.'.'.$minor,
            'plugins' => $plugins,
            'languages' => $this->cms->locales(),
            'exported' => CarbonImmutable::now()->toIso8601String(),
        ], static fn ($v) => $v !== null && $v !== []);

        if (($problem = Kit::problem($about['handle'], $manifest)) !== null) {
            throw AbilityException::invalid(__('The kit can’t be described that way: :problem.', ['problem' => $problem]));
        }

        return $manifest;
    }

    /** @return list<string> every plain file under a folder, as paths inside it, without what is hidden */
    private function tree(string $root): array
    {
        if (! is_dir($root)) {
            return [];
        }

        $out = [];

        try {
            $items = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS));
        } catch (Throwable) {
            return [];
        }

        foreach ($items as $item) {
            $relative = substr($item->getPathname(), strlen($root) + 1);

            if ($item->isFile() && ! $item->isLink() && ! preg_match('#(^|/)\.#', $relative) && ! str_starts_with($relative, 'build/')) {
                $out[] = $relative;
            }
        }

        sort($out);

        return $out;
    }
}

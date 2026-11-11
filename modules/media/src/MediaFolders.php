<?php

declare(strict_types=1);

namespace Cms\Modules\Media;

use Cms\Abilities\AbilityException;
use Cms\Support\Files;

/**
 * The library's folders: a tree of paths such as `press/2026`. A file says which folder it is in; a folder that
 * someone made also stands on its own, empty or not, in content/media/folders.json (beside the records, so it
 * travels with them in git and Sync). The tree is both: every kept folder, every folder a file is in, and
 * what lies above them.
 */
final class MediaFolders
{
    public function __construct(private readonly MediaStore $store, private readonly MediaManifest $manifest) {}

    /** @return list<string> every folder, each after the one it is in */
    public function all(): array
    {
        $folders = [];

        foreach ([...$this->kept(), ...MediaItem::query()->select('folder')->distinct()->pluck('folder')->filter()->all()] as $path) {
            for ($parts = explode('/', (string) $path); $parts !== []; array_pop($parts)) {
                $folders[implode('/', $parts)] = true;
            }
        }

        $folders = array_keys($folders);
        sort($folders, SORT_STRING);

        return $folders;
    }

    public function has(string $path): bool
    {
        return in_array($path, $this->all(), true);
    }

    /** A path as it is stored (MediaStore::folder): each part a slug. Refused when nothing is left of it, or when it is deeper than folders go. */
    public function path(string $path): string
    {
        $clean = $this->store->folder($path);

        if ($clean === '') {
            throw AbilityException::invalid(__('Give the folder a name.'));
        }

        return $clean;
    }

    public function create(string $path): string
    {
        $path = $this->path($path);

        if ($this->has($path)) {
            throw AbilityException::conflict(__('There is already a folder “:name” here.', ['name' => basename($path)]));
        }

        $this->keep(fn (array $kept) => [...$kept, $path]);

        return $path;
    }

    /** The files in a folder and in the folders inside it. */
    public function files(string $path): \Illuminate\Database\Eloquent\Builder
    {
        return MediaItem::query()->where(static fn ($w) => $w->where('folder', $path)->orWhere('folder', 'like', str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $path).'/%'));
    }

    /**
     * Where a rename leads, or why it can't happen: the folder must be there, the new place must be free and
     * not inside the folder itself.
     *
     * @return array{0: string, 1: string} the folder and its new path
     */
    public function renaming(string $from, string $to): array
    {
        $from = $this->existing($from);
        $to = $this->path($to);

        if ($to === $from) {
            return [$from, $to];
        }

        if (str_starts_with($to.'/', $from.'/')) {
            throw AbilityException::invalid(__('A folder can’t move into itself.'));
        }

        if ($this->has($to)) {
            throw AbilityException::conflict(__('There is already a folder “:name” here.', ['name' => basename($to)]));
        }

        // What is inside comes along: the deepest of it must still fit.
        $below = max([0, ...array_map(static fn (string $path) => substr_count(substr($path, strlen($from)), '/'), array_filter($this->all(), static fn (string $path) => str_starts_with($path, $from.'/')))]);

        if (substr_count($to, '/') + 1 + $below > MediaStore::FOLDER_DEPTH) {
            throw AbilityException::invalid(__('Folders go :count deep at most.', ['count' => MediaStore::FOLDER_DEPTH]));
        }

        return [$from, $to];
    }

    /** Rename or move a folder: its files and the folders inside it follow. Returns how many files moved. */
    public function rename(string $from, string $to): int
    {
        [$from, $to] = $this->renaming($from, $to);

        if ($from === $to) {
            return 0;
        }

        $moved = 0;

        foreach ($this->files($from)->get() as $item) {
            $this->store->update($item, ['folder' => $to.substr($item->folder, strlen($from))]);
            $moved++;
        }

        $this->keep(static fn (array $kept) => [...array_map(static fn (string $path) => $path === $from || str_starts_with($path, $from.'/') ? $to.substr($path, strlen($from)) : $path, $kept), $to]);

        return $moved;
    }

    /** Delete a folder and the folders inside it. Its files live on, in the folder above. Returns how many moved there. */
    public function delete(string $path): int
    {
        $path = $this->existing($path);
        $above = str_contains($path, '/') ? dirname($path) : '';
        $moved = 0;

        foreach ($this->files($path)->get() as $item) {
            $this->store->update($item, ['folder' => $above]);
            $moved++;
        }

        $this->keep(static fn (array $kept) => array_filter($kept, static fn (string $kept) => $kept !== $path && ! str_starts_with($kept, $path.'/')));

        return $moved;
    }

    /**
     * Put files in a folder ('' is no folder). A folder that isn't there yet is made, and stays when it empties.
     *
     * @param  list<MediaItem>  $items
     */
    public function move(array $items, string $folder): string
    {
        $folder = $folder === '' ? '' : $this->path($folder);

        foreach ($items as $item) {
            $item->folder === $folder || $this->store->update($item, ['folder' => $folder]);
        }

        $folder === '' || $this->keep(static fn (array $kept) => [...$kept, $folder]);

        return $folder;
    }

    public function existing(string $path): string
    {
        $path = $this->store->folder($path);

        if ($path === '' || ! $this->has($path)) {
            throw new AbilityException(__('This folder is not there.'), 'not_found');
        }

        return $path;
    }

    /** @return list<string> */
    private function kept(): array
    {
        $file = $this->file();
        $kept = is_file($file) ? json_decode((string) file_get_contents($file), true) : null;

        return is_array($kept) ? array_values(array_filter(array_map(fn ($path) => is_string($path) ? $this->store->folder($path) : '', $kept))) : [];
    }

    private function keep(callable $change): void
    {
        $this->manifest->locked(function () use ($change): void {
            $kept = array_values(array_unique($change($this->kept())));
            sort($kept, SORT_STRING);
            Files::putJson($this->file(), $kept);
        });
    }

    private function file(): string
    {
        return content_path('media/folders.json');
    }
}

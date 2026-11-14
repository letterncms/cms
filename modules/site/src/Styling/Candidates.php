<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Styling;

use Cms\Content\Collections\CollectionRepository;
use Cms\Content\Entries\EntryRepository;
use Cms\Extend\Hooks;
use Cms\Support\Files;

/**
 * The classes the site uses, which is what Tailwind builds CSS for: every `class` a block carries and every
 * class attribute in HTML somebody wrote, in all of the site's content. What code renders with classes of
 * its own (a plugin's blocks) is added with the `styling.candidates` filter.
 *
 * A name that is no Tailwind class costs nothing: Tailwind leaves it out.
 */
final class Candidates
{
    /** @var list<string>|null */
    private ?array $all = null;

    public function __construct(
        private readonly Hooks $hooks,
        private readonly CollectionRepository $collections,
        private readonly EntryRepository $entries,
    ) {}

    /** @return list<string> sorted, each once */
    public function all(): array
    {
        if ($this->all !== null) {
            return $this->all;
        }

        $cache = storage_path('cache/styling/candidates.json');

        if (is_file($cache) && is_array($held = json_decode((string) file_get_contents($cache), true))) {
            return $this->all = $held;
        }

        $found = [];

        foreach ($this->texts() as $text) {
            foreach (self::in($text) as $class) {
                $found[$class] = true;
            }
        }

        foreach ((array) $this->hooks->filter('styling.candidates', []) as $class) {
            is_string($class) && $class !== '' && $found[$class] = true;
        }

        $all = array_map('strval', array_keys($found));
        sort($all, SORT_STRING);

        try {
            Files::put($cache, (string) json_encode($all, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        } catch (\Throwable) {
            // The cache is optional.
        }

        return $this->all = $all;
    }

    /** After content changed: look again. */
    public function flush(): void
    {
        $this->all = null;
        @unlink(storage_path('cache/styling/candidates.json'));
    }

    /**
     * The classes in a text: the value of every "class" key of a block ({"class":"flex gap-4"}) and of every
     * class attribute (class="flex gap-4").
     *
     * @return list<string>
     */
    public static function in(string $text): array
    {
        if (! str_contains($text, 'class')) {
            return [];
        }

        $out = [];
        preg_match_all('/"class"\s*:\s*"((?:[^"\\\\]|\\\\.)*)"|\bclass\s*=\s*(?:\\\\?"((?:[^"\\\\]|\\\\[^"])*)\\\\?"|\'([^\']*)\')/', $text, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $value = ($match[1] ?? '') !== '' ? (string) json_decode('"'.$match[1].'"') : html_entity_decode(stripslashes(($match[2] ?? '') !== '' ? $match[2] : ($match[3] ?? '')), ENT_QUOTES | ENT_HTML5);

            foreach (preg_split('/\s+/', $value, -1, PREG_SPLIT_NO_EMPTY) ?: [] as $class) {
                strlen($class) <= 200 && $out[] = $class;
            }
        }

        return $out;
    }

    /** @return iterable<string> everything the site's content says, file by file and entry by entry */
    private function texts(): iterable
    {
        $root = content_path();

        if (is_dir($root)) {
            $files = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS));

            foreach ($files as $file) {
                if ($file->isFile() && in_array($file->getExtension(), ['md', 'json', 'yaml', 'yml', 'html'], true) && $file->getSize() < 4_000_000) {
                    yield (string) file_get_contents($file->getPathname());
                }
            }
        }

        // Entries kept in the database are not among the files.
        foreach ($this->collections->all() as $collection) {
            if ($collection->driver === 'files') {
                continue;
            }

            foreach ($this->entries->query()->collection($collection->handle)->ungated()->get() as $entry) {
                yield (string) json_encode([$entry->data, $entry->draft], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            }
        }
    }
}

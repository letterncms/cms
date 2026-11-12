<?php

declare(strict_types=1);

use Cms\Content\Collections\CollectionRepository;
use Cms\Content\Entries\FileDriver;
use Cms\Content\Entries\Frontmatter;
use Cms\Support\Files;
use Cms\Support\Yaml;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The block that places a component was `pattern` and is `component`. What a site stored follows:
 *
 *   - the entries table (`data` and the working copy in `draft`), the revisions' snapshots and what
 *     people's profiles hold (`users.data`);
 *   - the Markdown files under content/collections: block trees in the front matter and the
 *     `::: pattern` directives of a Block Markdown body (templates, components, pages);
 *   - the working copies of file entries in storage/drafts;
 *   - every YAML and JSON file under content/ (global sets and their values, collections, fieldsets,
 *     the profile's fields, a site's own block and component files).
 *
 * Only three things are renamed, each told by its shape and never by a search through text: a block
 * (`node`), the list of blocks a `blocks` field allows, and a field that offers the components to
 * choose from (`dynamic: patterns`). Nothing to do on a new site, and nothing the second time.
 */
return new class extends Migration
{
    private const string FROM = 'pattern';

    private const string TO = 'component';

    /** The options list a select field fills itself from: `fields.options.<name>`. */
    private const string OPTIONS_FROM = 'patterns';

    private const string OPTIONS_TO = 'components';

    /** Everything a block can carry. A map with any other key is not a block. */
    private const array NODE = ['id', 'type', 'props', 'children', 'label', 'style', 'attrs', 'bind', 'logic', 'motion', 'code', 'behavior', 'persist', 'anchor', 'class', 'hidden'];

    private const int JSON = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR;

    /** @var array<string, bool> Collection => whether its files' body is blocks */
    private array $bodies = [];

    public function up(): void
    {
        $this->bodies = [];
        $this->rows('entries', ['data', 'draft']);
        $this->rows('revisions', ['snapshot']);
        $this->rows('users', ['data']);

        $files = $this->markdown() + $this->drafts() + $this->definitions();

        if ($files > 0) {
            // What was read before is stale, also the file entries' index, which a rewrite within its second would not renew.
            array_map(unlink(...), glob(storage_path('cache/entries/*.ser')) ?: []);
            app(CollectionRepository::class)->flush();
            app(FileDriver::class)->flush();
        }
    }

    /** The old name is not put back: the code no longer reads it. */
    public function down(): void {}

    /**
     * Every row is read and looked at here: a predicate on the JSON column would have to be written per database.
     *
     * @param  list<string>  $columns
     */
    private function rows(string $table, array $columns): void
    {
        foreach (DB::table($table)->select(['id', ...$columns])->lazyById(200) as $row) {
            $changes = [];

            foreach ($columns as $column) {
                if (($json = $this->json($row->{$column})) !== null) {
                    $changes[$column] = $json;
                }
            }

            if ($changes !== []) {
                DB::table($table)->where('id', $row->id)->update($changes);
            }
        }
    }

    /** The JSON with its blocks renamed, or null when it holds none of them. */
    private function json(mixed $json, int $flags = 0): ?string
    {
        if (! is_string($json) || ! str_contains($json, self::FROM)) {
            return null;
        }

        // Maps are read as objects, so an empty one is written back as `{}` and not as a list.
        $value = json_decode($json);

        return $this->walk($value) ? json_encode($value, self::JSON | $flags) : null;
    }

    /** Entries kept as files: `---` front matter, then the collection's body field. */
    private function markdown(): int
    {
        $root = content_path('collections');
        $changed = 0;

        foreach ($this->files($root, ['md']) as $file) {
            $document = (string) file_get_contents($file);

            if (! str_contains($document, self::FROM)) {
                continue;
            }

            try {
                [$meta, $body] = Frontmatter::parse($document);
            } catch (Throwable) {
                // Front matter nobody can read: the site can't read that entry either, and a migration that
                // stopped here would leave the rest half done. It is left as it is, as definitions() does.
                continue;
            }

            $blocks = $this->bodyIsBlocks(explode('/', substr($file, strlen($root) + 1))[0]);

            if ($this->walk($meta)) {
                $rewritten = Frontmatter::dump($meta, $blocks ? $this->directives($body) : $body);
            } elseif ($blocks) {
                // Only the body changes: the front matter stays as it was written, to the letter.
                $end = str_starts_with($document, "---\n") || str_starts_with($document, "---\r\n") ? strpos($document, "\n---", 3) : false;
                $head = $end === false ? '' : substr($document, 0, $end + 4);
                $rewritten = $head.$this->directives(substr($document, strlen($head)));
            } else {
                continue;
            }

            if ($rewritten !== $document) {
                Files::put($file, $rewritten);
                $changed++;
            }
        }

        return $changed;
    }

    /**
     * Whether a collection's files keep blocks as their body. One whose body is another kind of field (plain
     * Markdown) is text that may only talk about a directive. A collection that isn't known here, as the
     * templates and components are where the blocks module isn't running, keeps blocks.
     */
    private function bodyIsBlocks(string $handle): bool
    {
        return $this->bodies[$handle] ??= (function () use ($handle): bool {
            try {
                $collection = app(CollectionRepository::class)->find($handle);
            } catch (Throwable) {
                return true;
            }

            if ($collection === null) {
                return true;
            }

            // Its body as the site wrote it then: `body: <handle>` on the collection, or `body: true` on the field.
            $legacy = is_string($collection->get('body')) ? $collection->get('body') : null;

            foreach ([null, ...array_keys($collection->blueprints())] as $blueprint) {
                $field = $collection->body($blueprint) ?? ($legacy === null ? null : $collection->blueprint($blueprint)->field($legacy));

                if ($field?->type === 'blocks' || ($legacy !== null && $field === null)) {
                    return true;
                }
            }

            return false;
        })();
    }

    /**
     * Block Markdown, with the directives of the old block renamed. A directive is a line as the codec reads
     * it (`::: type {json}`), outside a code fence; whatever its JSON carries is walked like any other tree.
     */
    private function directives(string $markdown): string
    {
        $lines = explode("\n", $markdown);
        $code = null;

        foreach ($lines as $i => $line) {
            if ($code !== null) {
                if (preg_match('/^'.preg_quote($code, '/').'\s*$/', $line)) {
                    $code = null;
                }

                continue;
            }

            if (preg_match('/^(```+|~~~+)/', $line, $m)) {
                $code = $m[1];

                continue;
            }

            if (! str_contains($line, self::FROM) || ! preg_match('/^(:{3,}\s*)([a-z0-9][a-z0-9\/-]*)(\s*)(\{.*\})?(\s*)$/', $line, $m)) {
                continue;
            }

            $lines[$i] = $m[1].($m[2] === self::FROM ? self::TO : $m[2]).$m[3].($this->json($m[4] ?? '') ?? $m[4] ?? '').$m[5];
        }

        return implode("\n", $lines);
    }

    /** The working copies of file entries. */
    private function drafts(): int
    {
        $changed = 0;

        foreach (glob(storage_path('drafts/*.json')) ?: [] as $file) {
            if (($json = $this->json((string) file_get_contents($file), JSON_PRETTY_PRINT)) !== null) {
                Files::put($file, $json);
                $changed++;
            }
        }

        return $changed;
    }

    /**
     * What a site defines and keeps as YAML or JSON under content/: global sets with their values, collections
     * and fieldsets, the profile's fields, block and component files of its own. Not the media library's
     * records and not the libraries the design imports: neither holds blocks.
     */
    private function definitions(): int
    {
        $root = content_path();
        $changed = 0;

        foreach ($this->files($root, ['yaml', 'yml', 'json']) as $file) {
            $relative = substr($file, strlen($root) + 1);

            if (str_starts_with($relative, 'media/') || str_starts_with($relative, 'design/vendor/')) {
                continue;
            }

            $text = (string) file_get_contents($file);

            if (! str_contains($text, self::FROM)) {
                continue;
            }

            try {
                if (str_ends_with($file, '.json')) {
                    $rewritten = $this->json($text, JSON_PRETTY_PRINT);
                    $rewritten = $rewritten === null ? null : $rewritten."\n";
                } else {
                    $data = Yaml::parse($text);
                    $rewritten = $this->walk($data) ? Yaml::dump($data) : null;
                }
            } catch (Throwable) {
                // A file nobody can read holds nothing the site shows.
                continue;
            }

            if ($rewritten !== null) {
                Files::put($file, $rewritten);
                $changed++;
            }
        }

        return $changed;
    }

    /**
     * @param  list<string>  $extensions
     * @return list<string>
     */
    private function files(string $root, array $extensions): array
    {
        $out = [];

        foreach (is_dir($root) ? new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)) : [] as $file) {
            if ($file->isFile() && in_array($file->getExtension(), $extensions, true) && ! str_starts_with($file->getFilename(), '.')) {
                $out[] = str_replace('\\', '/', $file->getPathname());
            }
        }

        sort($out);

        return $out;
    }

    /**
     * Goes through a structure, wherever it nests, and renames in each map what the rules below find. A map
     * is an object (from JSON) or a keyed array (from YAML). Says whether anything changed.
     */
    private function walk(mixed &$value): bool
    {
        if (! is_array($value) && ! $value instanceof stdClass) {
            return false;
        }

        $changed = false;
        $map = $value instanceof stdClass ? get_object_vars($value) : ($value !== [] && ! array_is_list($value) ? $value : null);

        foreach ($map === null ? [] : $this->renamed($map) as $key => $now) {
            $this->put($value, $key, $now);
            $changed = true;
        }

        foreach ($value instanceof stdClass ? get_object_vars($value) : $value as $key => $child) {
            if ($this->walk($child)) {
                $this->put($value, $key, $child);
                $changed = true;
            }
        }

        return $changed;
    }

    private function put(array|stdClass &$holder, int|string $key, mixed $value): void
    {
        if ($holder instanceof stdClass) {
            $holder->{$key} = $value;
        } else {
            $holder[$key] = $value;
        }
    }

    /**
     * What one map has to say now, by key:
     *
     *   - a block of the old type: `type: pattern` with `props` (and in them no `ref` or a handle), and
     *     no key a block doesn't have;
     *   - a `blocks` field that allows the old type by name: `{type: blocks, allowed: [heading, pattern]}`;
     *   - a field that offers the components to choose from: `{handle: …, type: …, dynamic: patterns}`;
     *   - a block definition (`block.json`) that takes the old block as a child or lives in it:
     *     `{name: …, children: [heading, pattern]}`, `{name: …, parent: pattern}`.
     *
     * @param  array<int|string, mixed>  $map
     * @return array<string, mixed>
     */
    private function renamed(array $map): array
    {
        $out = [];
        $type = $map['type'] ?? null;

        if ($type === self::FROM && $this->node($map)) {
            $out['type'] = self::TO;
        }

        $allowed = $map['allowed'] ?? null;

        if ($type === 'blocks' && is_array($allowed) && array_is_list($allowed) && in_array(self::FROM, $allowed, true)) {
            $out['allowed'] = array_values(array_unique(array_map(static fn (mixed $name): mixed => $name === self::FROM ? self::TO : $name, $allowed), SORT_REGULAR));
        }

        if (($map['dynamic'] ?? null) === self::OPTIONS_FROM && is_string($type) && is_string($map['handle'] ?? null)) {
            $out['dynamic'] = self::OPTIONS_TO;
        }

        // A block of the site's own (block.json): the blocks it takes as children, and the one it lives in.
        if (is_string($map['name'] ?? null)) {
            $children = $map['children'] ?? null;

            if (is_array($children) && array_is_list($children) && in_array(self::FROM, $children, true)) {
                $out['children'] = array_values(array_unique(array_map(static fn (mixed $name): mixed => $name === self::FROM ? self::TO : $name, $children), SORT_REGULAR));
            }

            if (($map['parent'] ?? null) === self::FROM) {
                $out['parent'] = self::TO;
            }
        }

        return $out;
    }

    /** @param  array<int|string, mixed>  $map */
    private function node(array $map): bool
    {
        $props = $map['props'] ?? null;

        if (! is_array($props) && ! $props instanceof stdClass) {
            return false;
        }

        $ref = ((array) $props)['ref'] ?? '';

        return is_string($ref) && array_diff(array_keys($map), self::NODE) === [];
    }
};

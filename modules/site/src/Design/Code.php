<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Design;

use Cms\Modules\Blocks\Document;
use Cms\Support\Files;
use InvalidArgumentException;

/**
 * Code beside the design, for what tokens and blocks don't say. It adds to custom.css
 * and custom.js, which stay what they are: one file each, on every page.
 *
 *   content/design/scripts/<name>.js   ES modules; folders allowed: scripts/lib/ease.js is "lib/ease"
 *   content/design/styles/<name>.css   stylesheets
 *   content/design/code.json           which of them load where:
 *     { "scripts": ["smooth"], "styles": ["base"],                          every page
 *       "templates":  { "post":   { "scripts": [...], "styles": [...] } },   pages with this template
 *       "components": { "header": { "scripts": [...], "styles": [...] } } }  pages that show this component
 *
 * A block names its own with `code: { scripts: [...], styles: [...] }`. A file is published once
 * as public/_cms/site/scripts/<name>-<hash>.js (or styles/…css), so it can be cached forever, and a
 * page's import map sends "./ease.js" from one script to the published file of the other.
 */
final class Code
{
    /** Folder under content/design => file extension. */
    public const array KINDS = ['scripts' => 'js', 'styles' => 'css'];

    /** A page's scripts and styles together stay a list somebody can read. */
    private const int MAX = 40;

    /** @var array<string, ?string> "scripts/name" => URL (null: no such file) */
    private array $urls = [];

    private ?array $config = null;

    private ?array $map = null;

    public function path(string $relative = ''): string
    {
        return content_path('design'.($relative !== '' ? '/'.ltrim($relative, '/') : ''));
    }

    /** After a file under content/design changed. */
    public function flush(): void
    {
        $this->urls = [];
        $this->config = $this->map = null;
    }

    /** "scripts/lib/ease.js" => ["scripts", "lib/ease"], or an error naming what a path may be. */
    public static function parse(string $path): array
    {
        if (preg_match('#^(scripts|styles)/(.+)\.(js|css)$#D', $path, $m) && self::KINDS[$m[1]] === $m[3] && preg_match(Document::CODE_NAME, $m[2])) {
            return [$m[1], $m[2]];
        }

        throw new InvalidArgumentException(__('A file is scripts/<name>.js or styles/<name>.css: lowercase letters, digits, - and _, in up to three folders.'));
    }

    /** @return array<string, string> name => file, in name order */
    public function files(string $kind): array
    {
        $ext = self::KINDS[$kind];
        $root = $this->path($kind);
        $out = [];

        if (is_dir($root)) {
            $files = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS));

            foreach ($files as $file) {
                $name = substr(str_replace('\\', '/', substr((string) $file, strlen($root) + 1)), 0, -strlen($ext) - 1);

                if ($file->isFile() && ! $file->isLink() && $file->getExtension() === $ext && preg_match(Document::CODE_NAME, $name)) {
                    $out[$name] = (string) $file;
                }
            }
        }

        ksort($out);

        return $out;
    }

    public function read(string $path): ?string
    {
        [$kind, $name] = self::parse($path);
        $file = $this->files($kind)[$name] ?? null;

        return $file !== null ? (string) file_get_contents($file) : null;
    }

    public function write(string $path, string $contents): void
    {
        [$kind, $name] = self::parse($path);
        Files::put(Files::within($this->path($kind), $name.'.'.self::KINDS[$kind]), rtrim($contents)."\n");
        $this->flush();
    }

    public function delete(string $path): void
    {
        [$kind, $name] = self::parse($path);
        @unlink(Files::within($this->path($kind), $name.'.'.self::KINDS[$kind]));
        $this->flush();
        // What was published of it goes now: a deleted script must not stay reachable.
        $this->sweep();
    }

    /**
     * Take away published files that are no longer what a source holds: older versions, and files whose
     * source is gone. Done when a build has finished, so a page not yet rebuilt still finds the version it names.
     */
    public function sweep(): void
    {
        foreach (self::KINDS as $kind => $ext) {
            $root = public_path("_cms/site/{$kind}");

            if (! is_dir($root)) {
                continue;
            }

            $items = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS), \RecursiveIteratorIterator::CHILD_FIRST);

            foreach ($items as $item) {
                if ($item->isDir() && ! $item->isLink()) {
                    @rmdir((string) $item); // only when empty

                    continue;
                }

                $relative = str_replace('\\', '/', substr((string) $item, strlen($root) + 1));
                $name = preg_match('/^(.+)-[0-9a-f]{10}\.'.$ext.'$/D', $relative, $m) ? $m[1] : null;

                if ($name === null || $this->url($kind, $name) !== "/_cms/site/{$kind}/{$relative}") {
                    @unlink((string) $item);
                }
            }
        }
    }

    /**
     * code.json, with only what it may hold.
     *
     * @return array{scripts: list<string>, styles: list<string>, templates: array<string, array{scripts: list<string>, styles: list<string>}>, components: array<string, array{scripts: list<string>, styles: list<string>}>}
     */
    public function config(): array
    {
        return $this->config ??= self::clean(Files::readJson($this->path('code.json')));
    }

    public function saveConfig(array $config): void
    {
        $clean = self::clean($config);
        $stored = array_filter([
            'scripts' => $clean['scripts'],
            'styles' => $clean['styles'],
            'templates' => array_map(array_filter(...), $clean['templates']),
            'components' => array_map(array_filter(...), $clean['components']),
        ]);

        $stored === [] ? @unlink($this->path('code.json')) : Files::putJson($this->path('code.json'), $stored);
        $this->flush();
    }

    private static function clean(array $config): array
    {
        $names = static fn (mixed $code): array => array_replace(['scripts' => [], 'styles' => []], Document::code($code));
        $out = [...$names($config), 'templates' => [], 'components' => []];

        foreach (['templates', 'components'] as $group) {
            foreach (is_array($config[$group] ?? null) ? array_slice($config[$group], 0, 200, true) : [] as $handle => $code) {
                $code = $names($code);

                if (is_string($handle) && preg_match('/^[a-z0-9][a-z0-9_-]{0,80}$/', $handle) && ($code['scripts'] !== [] || $code['styles'] !== [])) {
                    $out[$group][$handle] = $code;
                }
            }
        }

        return $out;
    }

    /**
     * What loads on every page ("global"), with a template or with a component.
     *
     * @return array{scripts: list<string>, styles: list<string>}
     */
    public function for(string $group, string $handle = ''): array
    {
        $config = $this->config();
        $code = $group === 'global' ? $config : ($config[$group][$handle] ?? []);

        return ['scripts' => $code['scripts'] ?? [], 'styles' => $code['styles'] ?? []];
    }

    /** The URL a file is published at (written when it changed), or null when there is no such file. */
    public function url(string $kind, string $name): ?string
    {
        $key = $kind.'/'.$name;

        if (array_key_exists($key, $this->urls)) {
            return $this->urls[$key];
        }

        $file = preg_match(Document::CODE_NAME, $name) ? ($this->files($kind)[$name] ?? null) : null;

        if ($file === null) {
            return $this->urls[$key] = null;
        }

        $ext = self::KINDS[$kind];
        $contents = (string) file_get_contents($file);
        $relative = "_cms/site/{$kind}/{$name}-".substr(hash('xxh128', $contents), 0, 10).".{$ext}";

        // Earlier versions stay until the build that replaces them has finished (sweep).
        if (! is_file(public_path($relative))) {
            Files::put(public_path($relative), $contents);
        }

        return $this->urls[$key] = '/'.$relative;
    }

    /**
     * The page's import map: one script reaches another by its path ("./ease.js", "../lib/ease.js"),
     * which the map sends to the published file. Publishes every script.
     *
     * @return array{imports?: array<string, string>}
     */
    public function importMap(): array
    {
        if ($this->map !== null) {
            return $this->map;
        }

        $imports = [];

        foreach (array_keys($this->files('scripts')) as $name) {
            $imports["/_cms/site/scripts/{$name}.js"] = (string) $this->url('scripts', $name);
        }

        return $this->map = $imports === [] ? [] : ['imports' => $imports];
    }

    /** The import map as the element a page carries before its first module, or '' when there is nothing to map. */
    public function importMapTag(): string
    {
        $map = $this->importMap();

        // "</script" can't appear: names and URLs are letters, digits, and - _ . / @ only.
        return $map === [] ? '' : '<script type="importmap">'.json_encode($map, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR).'</script>';
    }

    /**
     * What each file holds, to tell what changed since the pages were built:
     * "scripts/hero" and "styles/base" => hash, and "code.json".
     *
     * @return array<string, string>
     */
    public function fingerprints(): array
    {
        $out = [];

        foreach (array_keys(self::KINDS) as $kind) {
            foreach ($this->files($kind) as $name => $file) {
                $out[$kind.'/'.$name] = (string) hash_file('xxh128', $file);
            }
        }

        is_file($config = $this->path('code.json')) && $out['code.json'] = (string) hash_file('xxh128', $config);

        return $out;
    }

    /** Cheap to ask on every request: names, sizes and times, without reading a file. */
    public function stamp(): string
    {
        $parts = [];

        foreach (array_keys(self::KINDS) as $kind) {
            foreach ($this->files($kind) as $name => $file) {
                $parts[] = $kind.'/'.$name.':'.filesize($file).':'.filemtime($file);
            }
        }

        is_file($config = $this->path('code.json')) && $parts[] = 'code.json:'.filesize($config).':'.filemtime($config);

        return md5(implode('|', $parts));
    }

    /** The whole list a page may carry of one kind, without repeats. */
    public static function limit(array $names): array
    {
        return array_slice(array_values(array_unique($names)), 0, self::MAX);
    }
}

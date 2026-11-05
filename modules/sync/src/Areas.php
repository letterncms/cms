<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use Cms\Support\Files;
use FilesystemIterator;
use InvalidArgumentException;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use RuntimeException;
use SplFileInfo;

/**
 * The folders a sync can move, each with what never leaves it. Files are compared by size and
 * time: a file Sync wrote gets the time it had on the other side, so the next sync only moves
 * what changed since. Links are never followed and never read: a path that leaves its folder
 * is refused before any byte is touched.
 */
final class Areas
{
    public const array AREAS = ['media', 'media-records', 'content', 'config'];

    /** What a site keeps, whatever moves: what code runs, its licence, and Sync's own files. */
    private const array NEVER = [
        'content' => ['media/'],
        'config' => ['plugins.yaml', 'license.key', 'licenses/', 'sync.yaml'],
    ];

    public function root(string $area): string
    {
        return rtrim(str_replace('\\', '/', match ($area) {
            'media' => public_path('media'),
            'media-records' => content_path('media'),
            'content' => content_path(),
            'config' => site_path('config'),
            default => throw new InvalidArgumentException("Unknown area {$area}"),
        }), '/');
    }

    /** @return array<string, array{0: int, 1: int}> path => [size, mtime] */
    public function manifest(string $area): array
    {
        $root = $this->root($area);
        $out = [];

        if (! is_dir($root)) {
            return [];
        }

        $items = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::LEAVES_ONLY);

        foreach ($items as $file) {
            /** @var SplFileInfo $file */
            if ($file->isLink() || ! $file->isFile()) {
                continue;
            }

            $path = substr(str_replace('\\', '/', $file->getPathname()), strlen($root) + 1);

            if ($this->moves($area, $path)) {
                $out[$path] = [(int) $file->getSize(), (int) $file->getMTime()];
            }
        }

        ksort($out, SORT_STRING);

        return $out;
    }

    public function moves(string $area, string $path): bool
    {
        foreach (explode('/', $path) as $segment) {
            // Hidden files and folders: .git, .DS_Store, editors' swap files.
            if ($segment === '' || $segment[0] === '.') {
                return false;
            }
        }

        foreach (self::NEVER[$area] ?? [] as $never) {
            if ($path === $never || (str_ends_with($never, '/') && str_starts_with($path, $never))) {
                return false;
            }
        }

        return true;
    }

    /** The real file for a path someone else sent: inside the area, never through a link. */
    public function file(string $area, string $path): string
    {
        if (! $this->moves($area, $path)) {
            throw new RuntimeException(__('The file :path isn’t one Sync moves.', ['path' => $path]));
        }

        $root = $this->root($area);
        $file = Files::within($root, $path);

        for ($dir = dirname($file); strlen($dir) > strlen($root); $dir = dirname($dir)) {
            if (is_link($dir)) {
                throw new RuntimeException(__('The file :path is behind a link, which Sync doesn’t follow.', ['path' => $path]));
            }
        }

        if (is_link($file)) {
            throw new RuntimeException(__('The file :path is a link, which Sync doesn’t follow.', ['path' => $path]));
        }

        return $file;
    }

    public function writable(string $area): bool
    {
        $dir = $this->root($area);

        while (! is_dir($dir) && dirname($dir) !== $dir) {
            $dir = dirname($dir);
        }

        return is_writable($dir);
    }

    /** Text the rewriter may change. Media binaries go across byte for byte. */
    public static function isText(string $area, string $path): bool
    {
        return $area !== 'media' && preg_match('/\.(ya?ml|json|md|markdown|html?|txt|css|js|svg|xml|csv)$/i', $path) === 1;
    }

    /**
     * What has to move to make `$to` look like `$from`.
     *
     * @param  array<string, array{0: int, 1: int}>  $from
     * @param  array<string, array{0: int, 1: int}>  $to
     * @return array{add: list<string>, change: list<string>, remove: list<string>, bytes: int}
     */
    public static function diff(array $from, array $to, bool $rewrites = false, string $area = ''): array
    {
        $add = $change = [];
        $bytes = 0;

        foreach ($from as $path => [$size, $time]) {
            if (! isset($to[$path])) {
                $add[] = $path;
                $bytes += $size;
            } elseif ($to[$path][1] !== $time || ($to[$path][0] !== $size && ! ($rewrites && self::isText($area, $path)))) {
                // A text file whose addresses were rewritten has its own size there: the time says whether it changed.
                $change[] = $path;
                $bytes += $size;
            }
        }

        return ['add' => $add, 'change' => $change, 'remove' => array_values(array_diff(array_keys($to), array_keys($from))), 'bytes' => $bytes];
    }
}

<?php

declare(strict_types=1);

namespace Cms\Support;

use RuntimeException;

/** Filesystem helpers with atomic writes and traversal-safe path joins. */
final class Files
{
    /** Create a directory (and parents). Safe when another request creates it at the same moment. */
    public static function ensureDir(string $dir): void
    {
        if (! is_dir($dir) && ! @mkdir($dir, 0o775, true) && ! is_dir($dir)) {
            throw new RuntimeException("Unable to create directory {$dir}");
        }
    }

    /** Atomically write a file, creating parent directories. */
    public static function put(string $file, string $contents): void
    {
        $dir = dirname($file);
        self::ensureDir($dir);

        $tmp = $dir.'/.'.basename($file).'.'.bin2hex(random_bytes(4)).'.tmp';

        if (file_put_contents($tmp, $contents, LOCK_EX) === false) {
            throw new RuntimeException("Unable to write {$file}");
        }

        @chmod($tmp, 0o664);

        if (! rename($tmp, $file)) {
            @unlink($tmp);
            throw new RuntimeException("Unable to move {$tmp} to {$file}");
        }

        if (function_exists('opcache_invalidate')) {
            @opcache_invalidate($file, true);
        }
    }

    /**
     * Join a relative path onto a root, refusing anything that escapes the root.
     * Segments are normalized without touching the filesystem.
     */
    public static function within(string $root, string $relative): string
    {
        $root = rtrim(str_replace('\\', '/', $root), '/');
        $relative = str_replace('\\', '/', $relative);

        if (str_contains($relative, "\0")) {
            throw new RuntimeException('Invalid path.');
        }

        $parts = [];

        foreach (explode('/', $relative) as $segment) {
            if ($segment === '' || $segment === '.') {
                continue;
            }

            if ($segment === '..') {
                throw new RuntimeException('Path traversal is not allowed.');
            }

            $parts[] = $segment;
        }

        return $parts === [] ? $root : $root.'/'.implode('/', $parts);
    }

    /** A filename-safe handle: lowercase letters, digits, dashes and underscores. */
    /** Relative path from directory $from to $to, e.g. for symlinks that survive moving the tree. */
    public static function relativePath(string $from, string $to): string
    {
        $from = explode('/', trim(str_replace('\\', '/', $from), '/'));
        $to = explode('/', trim(str_replace('\\', '/', $to), '/'));

        while ($from !== [] && $to !== [] && $from[0] === $to[0]) {
            array_shift($from);
            array_shift($to);
        }

        return str_repeat('../', count($from)).implode('/', $to);
    }

    public static function isHandle(string $value): bool
    {
        return (bool) preg_match('/^[a-z0-9][a-z0-9_-]{0,63}$/', $value);
    }

    public static function deleteDirectory(string $dir): void
    {
        // Links first: a dangling one is not a directory but must still go.
        if (is_link($dir)) {
            unlink($dir);

            return;
        }

        if (! is_dir($dir)) {
            return;
        }

        $items = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($items as $item) {
            $item->isDir() && ! $item->isLink() ? rmdir($item->getPathname()) : unlink($item->getPathname());
        }

        rmdir($dir);
    }

    public static function copyDirectory(string $from, string $to): void
    {
        self::ensureDir($to);

        $items = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($from, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($items as $item) {
            $target = $to.'/'.substr($item->getPathname(), strlen($from) + 1);
            $item->isDir() ? self::ensureDir($target) : copy($item->getPathname(), $target);
        }
    }
}

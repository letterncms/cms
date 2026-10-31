<?php

declare(strict_types=1);

namespace Cms\Update;

use Cms\Foundation\Application;

/**
 * Where releases live on this install, and the pointer that picks one. A release sits in
 * runtime/<version>/; going live is one rename of a small text file, so requests in flight finish on
 * the old tree, opcache has new paths to cache, and going back is that same rename.
 */
class Layout
{
    public function __construct(private readonly Application $app) {}

    public function root(): string
    {
        return $this->app->sitePath();
    }

    public function runtime(string $path = ''): string
    {
        return $this->root().'/runtime'.($path === '' ? '' : '/'.$path);
    }

    public function release(string $version): string
    {
        return $this->runtime($version);
    }

    public function pointer(): string
    {
        return $this->runtime('current');
    }

    public function current(): ?string
    {
        $text = @file_get_contents($this->pointer());
        $text = $text !== false ? trim($text) : '';

        return preg_match('/^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/', $text) === 1 ? $text : null;
    }

    /** Write a complete pointer or none at all. */
    public function flip(string $to): bool
    {
        $pointer = $this->pointer();
        $tmp = dirname($pointer).'/.cms-release.'.bin2hex(random_bytes(4));
        $ok = @file_put_contents($tmp, $to."\n") === strlen($to) + 1 && @rename($tmp, $pointer);

        if (! $ok) {
            @unlink($tmp);
        }

        return $ok;
    }

    /**
     * Why this site only gets a notice: it is deployed some other way, or may not change its own files.
     * Null when it can update itself.
     */
    public function managed(): ?string
    {
        return match (true) {
            ! is_file($this->pointer()) => 'composer',
            is_dir($this->root().'/.git') => 'git',
            (bool) env('CMS_LOCKDOWN', false) => 'lockdown',
            ! (bool) env('CMS_ALLOW_FILE_MODS', true) => 'file_mods',
            default => null,
        };
    }
}

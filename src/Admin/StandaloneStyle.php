<?php

declare(strict_types=1);

namespace Cms\Admin;

/**
 * The stylesheet of the pages that stand outside the admin: the installer and an app's request to
 * connect. They cannot load the admin, but they are set in its tokens, typeface, radii and buttons:
 * the admin's build writes them to dist/standalone.css from the same files (modules/admin/scripts/standalone.mjs).
 *
 *   <style>{!! \Cms\Admin\StandaloneStyle::css() !!}</style>
 */
final class StandaloneStyle
{
    /** The stylesheet, to put in a `<style>`: a page that may load nothing else still has it. */
    public static function css(): string
    {
        $admin = dirname(__DIR__, 2).'/modules/admin';
        $css = @file_get_contents($admin.'/dist/standalone.css');

        // Written by the admin's own build from fixed files: nothing in it comes from a request.
        return $css === false ? '' : str_replace('%font%', self::font($admin.'/fonts/InstrumentSans-Latin.woff2'), $css);
    }

    /**
     * One of the admin's icons as inline SVG (`eye`, `eye-off`), from the same build: '' where the admin
     * has not been built, so a control falls back to its words.
     */
    public static function icon(string $name): string
    {
        static $icons = null;
        $icons ??= json_decode((string) @file_get_contents(dirname(__DIR__, 2).'/modules/admin/dist/standalone-icons.json'), true) ?: [];

        return (string) ($icons[$name] ?? '');
    }

    /**
     * The typeface's public address. Copied into this site's public folder the way the brand's
     * mark is, so it is there before anything is installed; where that folder cannot be written,
     * the page falls back to the system's typeface.
     */
    private static function font(string $source): string
    {
        $hash = (string) @md5_file($source);
        $target = public_path('_cms/brand/'.basename($source));

        if ($hash !== '' && @md5_file($target) !== $hash) {
            @mkdir(dirname($target), 0o755, true);
            @copy($source, $target);
        }

        return $hash !== '' && @md5_file($target) === $hash ? '/_cms/brand/'.basename($source).'?v='.substr($hash, 0, 10) : '';
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Design;

use InvalidArgumentException;
use Cms\Support\Files;
use Lettern\Design\Describe;
use Lettern\Design\Stylesheet;
use Lettern\Design\Theme;

/**
 * The site's design: a Lettern Design theme (https://design.lettern.org), kept with
 * its content so it is edited in the CMS, versioned in git and readable by agents.
 *
 *   content/design/theme.json   the theme: a few decisions every token follows from
 *   content/design/custom.js    extra JavaScript (an ES module; people with site.code only)
 *   content/design/fonts/       self-hosted .woff2 files
 *
 * Compiled to public/_cms/site/design-<hash>.css (and custom-<hash>.js);
 * fonts are copied to public/_cms/fonts/.
 */
final class Design
{
    private ?array $theme = null;

    private ?Theme $resolved = null;

    public function path(string $relative = ''): string
    {
        return content_path('design'.($relative !== '' ? '/'.ltrim($relative, '/') : ''));
    }

    /** The theme as saved (or the default one). */
    public function theme(): array
    {
        if ($this->theme !== null) {
            return $this->theme;
        }

        $file = is_file($this->path('theme.json')) ? $this->path('theme.json') : dirname(__DIR__, 2).'/resources/design/theme.json';
        $theme = json_decode((string) file_get_contents($file), true);

        if (! is_array($theme)) {
            throw new InvalidArgumentException(__(':file is not valid JSON.', ['file' => $file]));
        }

        return $this->theme = $theme;
    }

    /** The theme worked out: palettes, schemes, sizes, steps. */
    public function resolved(): Theme
    {
        return $this->resolved ??= Theme::resolve($this->theme());
    }

    public function forget(): void
    {
        $this->theme = null;
        $this->resolved = null;
    }

    /** After a change: forget what was read and tell whoever builds from the design. */
    public function saved(): void
    {
        $this->forget();
        cms()->hooks()->dispatch('design.saved');
    }

    /**
     * Replace the theme: it must resolve (every name in the vocabulary), or nothing is saved.
     *
     * @return list<array> what the contrast check found
     */
    public function save(array $theme): array
    {
        unset($theme['$schema']);
        $resolved = Theme::resolve($theme);
        Files::put($this->path('theme.json'), json_encode(['$schema' => 'https://design.lettern.org/v1/theme.schema.json', ...$theme], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)."\n");
        $this->forget();

        return Describe::check($resolved);
    }

    /** A change to the theme: objects merge into what's there, anything else replaces; null removes. */
    public static function merge(array $theme, array $change): array
    {
        foreach ($change as $key => $value) {
            if ($value === null) {
                unset($theme[$key]);
            } elseif (is_array($value) && ! array_is_list($value) && is_array($theme[$key] ?? null) && ! array_is_list($theme[$key])) {
                $theme[$key] = self::merge($theme[$key], $value);
            } else {
                $theme[$key] = $value;
            }
        }

        return $theme;
    }

    public function customJs(): string
    {
        return is_file($file = $this->path('custom.js')) ? (string) file_get_contents($file) : '';
    }

    public function saveJs(string $code): void
    {
        $file = $this->path('custom.js');

        trim($code) === '' ? @unlink($file) : Files::put($file, rtrim($code)."\n");
    }

    /** The compiled stylesheet URL (written only when it changed). */
    public function stylesheet(): string
    {
        return $this->publish('design', 'css', $this->compile($this->resolved()));
    }

    /** The stylesheet of a theme: the saved one, or a draft for the editor's live preview. */
    public function compile(Theme $theme): string
    {
        return Stylesheet::css($theme, fn (string $src) => $this->fontUrl($src));
    }

    public function script(): ?string
    {
        $js = $this->customJs();

        return trim($js) === '' ? null : $this->publish('custom', 'js', $js);
    }

    /** Does the site have a dark mode? */
    public function hasDark(): bool
    {
        return $this->resolved()->resolved['modes']['dark'] !== null;
    }

    /** @return list<string> font URLs to preload */
    public function preloads(): array
    {
        $out = [];

        foreach ($this->theme()['font']['faces'] ?? [] as $face) {
            if (! empty($face['preload']) && isset($face['src']) && ($url = $this->fontUrl((string) $face['src'])) !== null) {
                $out[] = $url;
            }
        }

        return array_values(array_unique($out));
    }

    /** Fonts in content/design/fonts are served from public/_cms/fonts. */
    public function fontUrl(string $src): ?string
    {
        if (preg_match('#^(https://|/)#', $src)) {
            return $src;
        }

        $name = basename($src);

        if (! preg_match('/^[\w.-]+\.woff2$/', $name) || ! is_file($file = $this->path('fonts/'.$name))) {
            return null;
        }

        $target = public_path('_cms/fonts/'.$name);

        if (! is_file($target) || filemtime($target) < filemtime($file)) {
            Files::put($target, (string) file_get_contents($file));
        }

        return '/_cms/fonts/'.$name;
    }

    /** @return list<string> file names in content/design/fonts */
    public function fontFiles(): array
    {
        return array_map('basename', glob($this->path('fonts/*.woff2')) ?: []);
    }

    private function publish(string $name, string $ext, string $contents): string
    {
        $hash = substr(hash('xxh128', $contents), 0, 10);
        $relative = "_cms/site/{$name}-{$hash}.{$ext}";

        if (! is_file(public_path($relative))) {
            foreach (glob(public_path("_cms/site/{$name}-*.{$ext}")) ?: [] as $old) {
                @unlink($old);
            }

            Files::put(public_path($relative), $contents);
        }

        return '/'.$relative;
    }
}

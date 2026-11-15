<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Styling;

use Cms\Cms;
use Cms\Extend\Hooks;
use Cms\Support\Files;
use InvalidArgumentException;

/**
 * The site's styling, kept with its content so it is edited in the CMS, versioned in git and
 * readable by agents. It is Tailwind CSS:
 *
 *   content/styling/theme.css      the stylesheet: `@import "tailwindcss"`, the theme (@theme), the site's
 *                                  own classes (@utility), element styles (@layer base) and any other CSS
 *   content/styling/settings.json  fonts and the page transition
 *   content/styling/custom.js      extra JavaScript (an ES module; people with site.code only)
 *   content/styling/fonts/         self-hosted .woff2 files
 *
 * Blocks carry Tailwind classes. The server compiles them with Tailwind (Compiler, in PHP) whenever the
 * stylesheet or the content changes, whoever changed it: the admin, an agent, a command. It is a build
 * file, not content (storage/styling/compiled.css), and says what it was compiled from, so it is compiled
 * again only when that changed.
 *
 * Published as public/_cms/site/styles-<hash>.css (and custom-<hash>.js); fonts are copied to public/_cms/fonts/.
 */
final class Styling
{
    /** The stylesheet every theme imports beside Tailwind: what blocks, fields and buttons are built from. */
    public const string KERNEL = 'cms';

    private ?array $settings = null;

    private ?string $url = null;

    private ?Theme $read = null;

    /** Content changed since the CSS was last looked at. */
    private bool $stale = false;

    /** What this request last tried to compile: a stylesheet that does not compile is tried once. */
    private ?string $tried = null;

    public function __construct(
        private readonly Hooks $hooks,
        private readonly Candidates $candidates,
        private readonly Compiler $compiler,
        private readonly FontFaces $faces,
    ) {}

    public function path(string $relative = ''): string
    {
        return content_path('styling'.($relative !== '' ? '/'.ltrim($relative, '/') : ''));
    }

    /** The site's stylesheet, or the one a site starts with. */
    public function theme(): string
    {
        return (string) file_get_contents(is_file($file = $this->path('theme.css')) ? $file : dirname(__DIR__, 2).'/resources/styling/theme.css');
    }

    /**
     * @throws InvalidArgumentException when it is no Tailwind stylesheet
     * @throws StylingException when it does not compile: the one that does stays
     */
    public function saveTheme(string $css): void
    {
        if (! preg_match('/@import\s+["\']tailwindcss["\']/', $css)) {
            throw new InvalidArgumentException(__('The stylesheet starts with @import "tailwindcss";'));
        }

        $css = rtrim($css)."\n";
        $compiled = $this->compiler->compile($source = $this->source($css));

        Files::put($this->path('theme.css'), $css);
        $this->read = null;
        $this->url = null;
        // It was compiled to be checked: that is the site's CSS now.
        $this->store($this->signature($source), $compiled);
    }

    /** @return list<string> the site's own classes: the names of the stylesheet's `@utility` rules */
    public function classes(): array
    {
        return $this->read()->classes();
    }

    /** The site has dark values: a colour of its theme is light-dark(…). */
    public function dark(): bool
    {
        return $this->read()->dark();
    }

    /**
     * A theme variable's value ("--color-primary"), for what cannot read CSS (mail): the site's, else the kernel's
     * default, with the light side of light-dark(). Null when neither names it.
     */
    public function variable(string $name): ?string
    {
        return $this->read()->variable($name) ?? (new Theme((string) file_get_contents(dirname(__DIR__, 2).'/resources/css/theme.css')))->variable($name);
    }

    /** @return array<string, string> the widths `sm:`, `md:` and the rest start at: Tailwind's, with the theme's --breakpoint-* */
    public function breakpoints(): array
    {
        $all = [...Theme::BREAKPOINTS, ...$this->read()->group('--breakpoint-')];
        // Narrowest first, as the classes apply.
        uasort($all, static fn (string $a, string $b) => (float) $a * (str_ends_with($a, 'px') ? 1 : 16) <=> (float) $b * (str_ends_with($b, 'px') ? 1 : 16));

        return $all;
    }

    /** @return array<string, string> the theme's curves by name: --ease-out is "out" */
    public function eases(): array
    {
        return $this->read()->group('--ease-');
    }

    private function read(): Theme
    {
        return $this->read ??= new Theme($this->theme());
    }

    /** @return array{fonts: list<array<string, mixed>>, transition: array{type: string, duration: float, navigation: string}} */
    public function settings(): array
    {
        if ($this->settings !== null) {
            return $this->settings;
        }

        $data = is_file($file = $this->path('settings.json')) ? Files::readJson($file) : [];
        $transition = (array) ($data['transition'] ?? []);

        return $this->settings = [
            'fonts' => array_values(array_filter((array) ($data['fonts'] ?? []), 'is_array')),
            'transition' => [
                'type' => in_array($transition['type'] ?? null, ['none', 'fade', 'slide', 'scale'], true) ? $transition['type'] : 'none',
                'duration' => max(0.05, min(2.0, (float) ($transition['duration'] ?? 0.3))),
                'navigation' => ($transition['navigation'] ?? null) === 'client' ? 'client' : 'document',
            ],
        ];
    }

    /** Change fonts or the page transition; what is not named stays. */
    public function saveSettings(array $changes): void
    {
        $settings = $this->settings();

        if (isset($changes['fonts'])) {
            $settings['fonts'] = array_values(array_filter((array) $changes['fonts'], 'is_array'));
        }

        if (isset($changes['transition'])) {
            $settings['transition'] = array_filter([...$settings['transition'], ...(array) $changes['transition']], static fn ($value) => $value !== null);
        }

        Files::putJson($this->path('settings.json'), $settings);
        $this->settings = null;
    }

    /** @return list<array<string, mixed>> */
    public function fonts(): array
    {
        return $this->settings()['fonts'];
    }

    /** After anything about the styling or the content's classes changed: look again, compile, and tell whoever shows it (`styling.saved`). */
    public function saved(): void
    {
        $this->settings = null;
        $this->url = null;
        $this->read = null;
        $this->candidates->flush();

        try {
            $this->refresh();
        } finally {
            // Whoever shows the site hears of it also when its stylesheet does not compile: the fonts may have changed.
            $this->hooks->dispatch('styling.saved');
        }
    }

    /**
     * Content changed, and with it perhaps the classes in use: look again before the CSS is next asked for
     * (`settle`), once however many entries were saved.
     */
    public function changed(): void
    {
        $this->candidates->flush();
        $this->stale = true;
    }

    /** Compile after content changed. A stylesheet that does not compile is reported, never in the way of saving content. */
    public function settle(): void
    {
        if (! $this->stale) {
            return;
        }

        try {
            $this->refresh();
        } catch (StylingException $e) {
            report($e);
        }
    }

    /**
     * What Tailwind compiles: the stylesheet (a draft of it for a preview), the stylesheets it imports by name
     * and the classes in use.
     *
     * @return array{css: string, files: array<string, string>, candidates: list<string>}
     */
    public function source(?string $theme = null): array
    {
        $css = $theme ?? $this->theme();
        $read = new Theme($css);
        // The stylesheet's own classes are always in its CSS: a block's setting can name one (a button's look is
        // btn-<name>) where no content spells it out.
        $candidates = array_values(array_unique([...$this->candidates->all(), ...$read->classes()]));
        sort($candidates, SORT_STRING);

        return [
            'css' => $css,
            // A theme with dark values follows the visitor's system: light-dark() reads color-scheme. Without any,
            // the browser's own parts (fields, scroll bars) stay light with the page.
            'files' => [self::KERNEL => $this->kernel().($read->dark() ? "
@layer base { :where(:root) { color-scheme: light dark; } }
" : '')],
            'candidates' => $candidates,
        ];
    }

    /** What a compiled stylesheet was made from, in a word. */
    public function signature(?array $source = null): string
    {
        return hash('xxh128', Cms::VERSION.'|'.json_encode($source ?? $this->source(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    }

    /** Is compiled.css what the stylesheet and the content's classes compile to now? */
    public function current(): bool
    {
        return $this->compiledSignature() === $this->signature();
    }

    /**
     * Compile when the CSS is not what the stylesheet and the content's classes make now.
     *
     * @throws StylingException when the stylesheet does not compile
     */
    public function refresh(): void
    {
        $this->stale = false;
        $source = $this->source();
        $signature = $this->signature($source);
        $this->tried = $signature;

        if ($this->compiledSignature() !== $signature) {
            $this->store($signature, $this->compiler->compile($source));
        }
    }

    private function store(string $signature, string $css): void
    {
        Files::put($this->compiledPath(), "/* {$signature} */\n".$css."\n");
        $this->url = null;
    }

    /**
     * What stands before Tailwind's output in the site's CSS and is no part of compiling it: the font faces and
     * the page transition. The admin puts it before the CSS it compiles for the canvas.
     */
    public function faces(): string
    {
        return $this->faces->css($this->fonts(), fn (string $src) => $this->fontUrl($src)).$this->transitionCss();
    }

    /** The site's CSS: the font faces and the page transition, then Tailwind's output. */
    public function css(): string
    {
        $this->settle();

        // Never compiled here (a new server, an update, a site copied in), or made from something else: compiled now.
        if (! $this->current() && $this->tried !== $this->signature()) {
            try {
                $this->refresh();
            } catch (StylingException $e) {
                report($e);
            }
        }

        $compiled = is_file($file = $this->compiledPath()) ? (string) file_get_contents($file) : '';

        return $this->faces().$compiled;
    }

    /** The published stylesheet's URL (written only when it changed). */
    public function stylesheet(): string
    {
        return $this->url ??= $this->publish('styles', 'css', $this->css());
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

    public function script(): ?string
    {
        $js = $this->customJs();

        return trim($js) === '' ? null : $this->publish('custom', 'js', $js);
    }

    /** @return list<string> font URLs to preload */
    public function preloads(): array
    {
        $out = [];

        foreach ($this->fonts() as $font) {
            if (! empty($font['preload']) && isset($font['src']) && ($url = $this->fontUrl((string) $font['src'])) !== null) {
                $out[] = $url;
            }
        }

        return array_values(array_unique($out));
    }

    /** Fonts in content/styling/fonts are served from public/_cms/fonts. */
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

    /** @return list<string> file names in content/styling/fonts */
    public function fontFiles(): array
    {
        return array_map('basename', glob($this->path('fonts/*.woff2')) ?: []);
    }

    /** The kernel's stylesheet: its own CSS, then what modules and plugins add with the `styling.kernel` filter. */
    private function kernel(): string
    {
        $parts = [];

        foreach (['theme', 'base', 'prose', 'buttons', 'fields', 'schemes'] as $name) {
            $parts[] = (string) file_get_contents(dirname(__DIR__, 2)."/resources/css/{$name}.css");
        }

        foreach ((array) $this->hooks->filter('styling.kernel', []) as $css) {
            is_string($css) && $parts[] = $css;
        }

        return implode("\n", $parts);
    }

    /** What Tailwind made of the stylesheet: built here, never carried with the content. */
    public function compiledPath(): string
    {
        return storage_path('styling/compiled.css');
    }

    private function compiledSignature(): ?string
    {
        if (! is_file($file = $this->compiledPath()) || ($handle = fopen($file, 'r')) === false) {
            return null;
        }

        $line = (string) fgets($handle, 64);
        fclose($handle);

        return preg_match('#^/\* ([0-9a-f]{32}) \*/#', $line, $m) ? $m[1] : null;
    }

    private function transitionCss(): string
    {
        $transition = $this->settings()['transition'];

        if ($transition['type'] === 'none') {
            return '';
        }

        $d = $transition['duration'].'s';

        return '@view-transition{navigation:auto}'.match ($transition['type']) {
            'slide' => "@keyframes cms-vt-out{to{opacity:0;transform:translateY(-12px)}}@keyframes cms-vt-in{from{opacity:0;transform:translateY(16px)}}::view-transition-old(root){animation:cms-vt-out {$d} cubic-bezier(.4,0,.2,1) both}::view-transition-new(root){animation:cms-vt-in {$d} cubic-bezier(.2,.8,.2,1) both}",
            'scale' => "@keyframes cms-vt-out{to{opacity:0;transform:scale(.98)}}@keyframes cms-vt-in{from{opacity:0;transform:scale(1.02)}}::view-transition-old(root){animation:cms-vt-out {$d} ease both}::view-transition-new(root){animation:cms-vt-in {$d} ease both}",
            default => "::view-transition-old(root),::view-transition-new(root){animation-duration:{$d}}",
        }.'@media (prefers-reduced-motion:reduce){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}';
    }

    private function publish(string $name, string $ext, string $contents): string
    {
        $hash = substr(hash('xxh128', $contents), 0, 10);
        $relative = "_cms/site/{$name}-{$hash}.{$ext}";

        if (! is_file(public_path($relative))) {
            // Built pages name the stylesheet they were built with, and only some are built again when content
            // brings a new class: the versions before stay until every page was built (sweep).
            $name === 'styles' && is_file(storage_path('build/manifest.json')) || $this->sweep($name, $ext);
            Files::put(public_path($relative), $contents);
        }

        return '/'.$relative;
    }

    /** Take away published versions that are not the current one. */
    public function sweep(string $name = 'styles', string $ext = 'css'): void
    {
        $current = $name === 'styles' && $this->url !== null ? public_path(ltrim($this->url, '/')) : null;

        foreach (glob(public_path("_cms/site/{$name}-*.{$ext}")) ?: [] as $old) {
            $old === $current || @unlink($old);
        }
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Sites;

use Carbon\CarbonImmutable;
use Cms\Abilities\AbilityException;
use Cms\Support\Files;
use Composer\Semver\Semver;
use Throwable;

/**
 * A portable site laid out with `content/` and `config/`,
 * with the files its pictures show under `public/media/`, and `site.json` saying what it is:
 *
 *   site.json                      handle, name, description, version, license, cms, plugins, languages, previews, demo, exported
 *   previews/<name>.png|jpg|webp  the pictures site.json names
 *   content/collections/<handle>.yaml and <handle>/[<locale>/][<parent>/]<slug>.md
 *   content/globals/<handle>.yaml, content/navigation/<handle>.yaml
 *   content/design/tokens.json, custom.css, custom.js, code.json, fonts/, scripts/, styles/, vendor/ (with lock.json)
 *   content/media/<id>.yaml and public/media/<path>
 *   config/<settings>.yaml        only the settings a site may carry
 *
 * Applying a site copies its files into the installation.
 */
final class Site
{
    public const string FILE = 'site.json';

    /** What site.json may say, and nothing else. */
    private const array KEYS = ['handle', 'name', 'description', 'version', 'license', 'cms', 'plugins', 'languages', 'previews', 'demo', 'exported'];

    private const string PACKAGE = '/^[a-z0-9]([a-z0-9._-]{0,60})\/[a-z0-9]([a-z0-9._-]{0,60})$/D';

    private const string PREVIEW = '/^previews\/[a-z0-9][a-z0-9_-]{0,60}\.(png|jpg|webp)$/D';

    /** @param  'site'|'saved'  $source  where it was found: in the site's sites/ folder, or kept aside by a switch (Sites::saved) */
    private function __construct(
        public readonly string $handle,
        public readonly string $path,
        public readonly string $source,
        private readonly array $manifest,
    ) {}

    /** The site a folder holds, or the reason it is not one. */
    public static function load(string $path, string $source, ?string $handle = null): self
    {
        // A site being written is read from a folder of another name before it takes its own.
        $path = rtrim($path, '/');
        $handle ??= basename($path);
        $file = $path.'/'.self::FILE;

        // The folder may be a link (Composer links a site it installs from a path); nothing inside it may be.
        if (! Files::isHandle($handle) || ! is_dir($path) || ! is_file($file) || is_link($file) || filesize($file) > 64_000) {
            throw AbilityException::invalid(__('“:handle” is not a site: a site is a folder with a site.json.', ['handle' => $handle]));
        }

        $manifest = json_decode((string) file_get_contents($file), true);
        $problem = is_array($manifest) ? self::problem($handle, $manifest) : __('it is not JSON');

        if ($problem !== null) {
            throw AbilityException::invalid(__('The site.json of “:handle” can’t be read: :problem.', ['handle' => $handle, 'problem' => $problem]));
        }

        foreach ((array) ($manifest['previews'] ?? []) as $preview) {
            if (! is_file($path.'/'.$preview) || is_link($path.'/'.$preview)) {
                throw AbilityException::invalid(__('The site.json of “:handle” can’t be read: :problem.', ['handle' => $handle, 'problem' => __('it names :file, which is not in it', ['file' => $preview])]));
            }
        }

        return new self($handle, $path, $source, $manifest);
    }

    /** What is wrong with a site.json, in a few words, or null. */
    public static function problem(string $handle, array $manifest): ?string
    {
        $text = static fn (mixed $value, int $max) => is_string($value) && trim($value) !== '' && mb_strlen($value) <= $max;
        $list = static fn (mixed $value, callable $each) => is_array($value) && array_is_list($value) && count($value) <= 40 && array_filter($value, $each) === $value;

        return match (true) {
            array_diff(array_keys($manifest), self::KEYS) !== [] => __('it has “:key”, which a site.json does not say', ['key' => (string) current(array_diff(array_keys($manifest), self::KEYS))]),
            ($manifest['handle'] ?? null) !== $handle => __('its handle is not the name of its folder'),
            ! $text($manifest['name'] ?? null, 80) => __('it has no name'),
            isset($manifest['description']) && ! $text($manifest['description'], 400) => __('its description is not a short text'),
            ! is_string($manifest['version'] ?? null) || ! preg_match('/^\d{1,5}\.\d{1,5}\.\d{1,5}$/D', $manifest['version']) => __('its version is not three numbers, like 1.0.0'),
            isset($manifest['license']) && ! $text($manifest['license'], 60) => __('its license is not a name'),
            isset($manifest['cms']) && ! self::constraint($manifest['cms']) => __('“cms” is not a version constraint, like >=0.24'),
            isset($manifest['plugins']) && ! $list($manifest['plugins'], static fn ($name) => is_string($name) && preg_match(self::PACKAGE, $name) === 1) => __('“plugins” is not a list of package names'),
            isset($manifest['languages']) && (! $list($manifest['languages'], static fn ($code) => is_string($code) && preg_match('/^[a-z]{2,3}(-[a-z0-9]{2,8})?$/D', $code) === 1) || $manifest['languages'] === []) => __('“languages” is not a list of language codes, the main one first'),
            isset($manifest['previews']) && ! $list($manifest['previews'], static fn ($file) => is_string($file) && preg_match(self::PREVIEW, $file) === 1) => __('“previews” is not a list of pictures in previews/, .png, .jpg or .webp'),
            isset($manifest['demo']) && (! is_string($manifest['demo']) || ! preg_match('#^https://[^\s<>"\']{3,300}$#D', $manifest['demo'])) => __('“demo” is not an https address'),
            isset($manifest['exported']) && self::date($manifest['exported']) === null => __('“exported” is not a date'),
            default => null,
        };
    }

    public function name(): string
    {
        return trim((string) $this->manifest['name']);
    }

    public function description(): string
    {
        return trim((string) ($this->manifest['description'] ?? ''));
    }

    public function version(): string
    {
        return (string) $this->manifest['version'];
    }

    public function license(): ?string
    {
        return isset($this->manifest['license']) ? trim((string) $this->manifest['license']) : null;
    }

    /** The CMS versions it was made for, as a constraint, or null for any. */
    public function cms(): ?string
    {
        return $this->manifest['cms'] ?? null;
    }

    /** @return list<string> package names */
    public function plugins(): array
    {
        return array_values((array) ($this->manifest['plugins'] ?? []));
    }

    /** @return list<string> its languages, the main one first */
    public function languages(): array
    {
        return array_values((array) ($this->manifest['languages'] ?? [(string) config('app.locale', 'en')]));
    }

    /** @return list<string> paths inside the site */
    public function previews(): array
    {
        return array_values((array) ($this->manifest['previews'] ?? []));
    }

    public function demo(): ?string
    {
        return $this->manifest['demo'] ?? null;
    }

    /** When it was exported: what dates in the future (a scheduled entry, an expiry) are counted from. */
    public function exported(): ?CarbonImmutable
    {
        return self::date($this->manifest['exported'] ?? null);
    }

    public function suits(string $version): bool
    {
        // A development build is the release it becomes.
        return $this->cms() === null || Semver::satisfies((string) preg_replace('/[-+].*$/', '', $version), $this->cms());
    }

    /** @return array<string, mixed> what a list of sites says of one */
    public function toArray(): array
    {
        return [
            'handle' => $this->handle,
            'name' => $this->name(),
            'description' => $this->description(),
            'version' => $this->version(),
            'license' => $this->license(),
            'source' => $this->source,
            'cms' => $this->cms(),
            'plugins' => $this->plugins(),
            'languages' => $this->languages(),
            'previews' => array_map(fn (string $file) => '/_cms/sites/'.$this->handle.'/'.basename($file), $this->previews()),
            'demo' => $this->demo(),
        ];
    }

    private static function constraint(mixed $value): bool
    {
        try {
            return is_string($value) && mb_strlen($value) <= 60 && Semver::satisfies('1.0.0', $value) !== null;
        } catch (Throwable) {
            return false;
        }
    }

    private static function date(mixed $value): ?CarbonImmutable
    {
        try {
            return is_string($value) && $value !== '' ? CarbonImmutable::parse($value) : null;
        } catch (Throwable) {
            return null;
        }
    }
}

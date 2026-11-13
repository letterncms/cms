<?php

declare(strict_types=1);

namespace Cms\Settings;

use Illuminate\Contracts\Encryption\Encrypter;
use Cms\Abilities\AbilityException;
use Cms\Content\Fields\Blueprint;
use Cms\Support\Files;
use Cms\Support\Schema\SchemaException;
use Cms\Support\Yaml;
use Throwable;

/**
 * Settings pages for the core and plugins. Values live in config/<namespace>.yaml
 * (git-friendly). Fields marked `secret: true` are encrypted into
 * storage/secrets.json instead and can be overridden by env CMS_<NS>_<KEY>.
 */
final class SettingsRegistry
{
    /** @var array<string, array{label: string, icon: string, description: string, fields: list<array>, permission: string, package: ?string, order: int, section: string, home: ?string, page: bool}> */
    private array $schemas = [];

    /** @var array<string, array> */
    private array $cache = [];

    private ?array $secrets = null;

    public function __construct(private readonly Encrypter $encrypter) {}

    /**
     * A settings page. Settings have one home. A plugin or module with a
     * screen of its own names that screen's sidebar item as `home` (`forms`):
     * the page is then that screen's Settings tab (see `ScreenTabs`), it is
     * not repeated in the settings sidebar, and /settings/<namespace> leads
     * to the tab. Without a screen, the page is listed in the settings
     * sidebar: a plugin's under Plugins, by the plugin's name (leave out
     * `label` and `section`); the core's modules name their section, `site`
     * (what the site is), `people` or `system` (how the installation runs).
     *
     * `page: false` keeps values that are set where they are used (the default
     * sidebar, from Customize Sidebar): they are read and saved like any
     * others, but have no page of their own.
     *
     *   $settings->register('seo', fields: [...], icon: 'seo');
     */
    public function register(string $namespace, ?string $label = null, array $fields = [], string $icon = 'settings', string $description = '', ?string $package = null, ?string $permission = null, int $order = 50, ?string $section = null, ?string $home = null, bool $page = true): void
    {
        $package ??= \Cms\Packages\Scope::$current;

        $this->schemas[$namespace] = [
            'label' => $label ?? \Cms\Packages\PackageRepository::labelOf($package) ?? ucfirst($namespace),
            'icon' => $icon,
            'description' => $description,
            'fields' => $fields,
            'permission' => $permission ?? 'settings.manage',
            'package' => $package,
            'order' => $order,
            'section' => $section ?? \Cms\Admin\Navigation::PLUGINS,
            'home' => $home,
            'page' => $page,
        ];

        // Read before its schema existed: read again with the defaults.
        unset($this->cache[$namespace]);
    }

    /** @return array<string, array> With each namespace's fields as plugins left them. */
    public function schemas(): array
    {
        $schemas = $this->schemas;

        foreach ($schemas as $namespace => $schema) {
            $schemas[$namespace]['fields'] = $this->fields($namespace);
        }

        uasort($schemas, static fn ($a, $b) => [$a['order'], $a['label']] <=> [$b['order'], $b['label']]);

        return $schemas;
    }

    /**
     * A namespace's fields; plugins add, change or take over fields with the `settings.fields` filter. A field
     * with `localizable: true` holds one value per language of the site: see localizable().
     */
    private function fields(string $namespace): array
    {
        return self::localizable(array_values((array) cms()->hooks()->filter('settings.fields', $this->schemas[$namespace]['fields'] ?? [], $namespace)));
    }

    /**
     * A field with `localizable: true` is a group of the same field once per language of the site, labelled
     * with the language's name, so its value is a map by language (`{en: …, de: …}`: the key is the language
     * code in lower case, `pt-BR` is `pt_br`). `placeholder` and `default` may be such a map too. A language
     * added to the site gets its field at once; read a value with localized().
     *
     * @param  list<array<string, mixed>>  $fields
     * @return list<array<string, mixed>>
     */
    private static function localizable(array $fields): array
    {
        if (! array_any($fields, static fn ($field) => is_array($field) && ! empty($field['localizable']))) {
            return $fields;
        }

        $locales = cms()->locales();

        return array_map(static function ($field) use ($locales) {
            if (! is_array($field) || empty($field['localizable']) || ($field['type'] ?? null) === 'group') {
                return $field;
            }

            $own = array_diff_key($field, array_flip(['handle', 'label', 'section', 'if', 'width', 'localizable', 'instructions', 'placeholder', 'default']));
            $each = static fn (mixed $value, string $locale): mixed => is_array($value) && ! array_is_list($value) ? ($value[$locale] ?? $value[self::languageKey($locale)] ?? null) : $value;

            return [
                ...array_intersect_key($field, array_flip(['handle', 'label', 'section', 'if', 'width', 'instructions'])),
                'type' => 'group',
                'localizable' => true,
                'fields' => array_map(static fn (string $locale) => array_filter([
                    ...$own,
                    'handle' => self::languageKey($locale),
                    'label' => self::languageName($locale),
                    'placeholder' => $each($field['placeholder'] ?? null, $locale),
                    'default' => $each($field['default'] ?? null, $locale),
                ], static fn ($value) => $value !== null), $locales),
            ];
        }, $fields);
    }

    /** @return array<string, true> The handles of a namespace's fields with a value per language. */
    private function localizableKeys(string $namespace): array
    {
        $keys = [];

        foreach ($this->fields($namespace) as $field) {
            if (is_array($field) && ! empty($field['localizable']) && isset($field['handle'])) {
                $keys[(string) $field['handle']] = true;
            }
        }

        return $keys;
    }

    /** What a language is called inside a localizable value: its code in lower case, `pt-BR` as `pt_br`. */
    public static function languageKey(string $locale): string
    {
        return strtolower((string) preg_replace('/[^A-Za-z0-9]+/', '_', $locale));
    }

    /** A language by its own name ("Deutsch"), as a person who speaks it looks for it. */
    private static function languageName(string $locale): string
    {
        if (class_exists(\Locale::class)) {
            $name = (string) \Locale::getDisplayName(str_replace('-', '_', $locale), str_replace('-', '_', $locale));

            if ($name !== '' && $name !== $locale) {
                return mb_strtoupper(mb_substr($name, 0, 1)).mb_substr($name, 1);
            }
        }

        return strtoupper($locale);
    }

    /**
     * The value of a localizable field in one language (the site's default when none is given). Empty in a
     * language that has none: what to show then is the reader's to decide, as no language stands in for another.
     */
    public function localized(string $namespace, string $key, ?string $locale = null, mixed $default = null): mixed
    {
        $values = $this->get($namespace, $key);
        $value = is_array($values) ? ($values[self::languageKey($locale ?? cms()->defaultLocale())] ?? null) : null;

        return $value === null || $value === '' ? $default : $value;
    }

    public function has(string $namespace): bool
    {
        return isset($this->schemas[$namespace]);
    }

    /** Whether the namespace has a settings page; values set where they are used have none. */
    public function hasPage(string $namespace): bool
    {
        return $this->schemas[$namespace]['page'] ?? false;
    }

    public function get(string $namespace, ?string $key = null, mixed $default = null): mixed
    {
        $values = $this->cache[$namespace] ??= $this->load($namespace);

        return $key === null ? $values : (array_key_exists($key, $values) && $values[$key] !== null ? $values[$key] : $default);
    }

    /**
     * Run with these values over the namespace's, in memory only: what a dry run needs to see the site as a change
     * would leave it (a site's languages, before they are added). Nothing is written and nothing is kept afterwards.
     */
    public function staged(string $namespace, array $values, callable $run): mixed
    {
        $had = array_key_exists($namespace, $this->cache);
        $before = $this->cache[$namespace] ?? null;
        $this->cache[$namespace] = [...$this->get($namespace), ...$values];

        try {
            return $run();
        } finally {
            if ($had) {
                $this->cache[$namespace] = $before;
            } else {
                unset($this->cache[$namespace]);
            }
        }
    }

    /** Read the namespace from its files again next time: for code that changed a file itself, as a migration does. */
    public function forget(string $namespace): void
    {
        unset($this->cache[$namespace]);
    }

    /** Values for the admin form: secrets are masked. */
    public function forDisplay(string $namespace): array
    {
        $values = $this->get($namespace);

        $mask = static fn (mixed $value): string => ($value ?? '') !== '' ? '••••••••' : '';
        $perLanguage = $this->localizableKeys($namespace);

        foreach ($this->secretKeys($namespace) as $key) {
            // A secret with a value per language is masked language by language: which ones are set still shows.
            $values[$key] = isset($perLanguage[$key]) && is_array($values[$key] ?? null) ? array_map($mask, $values[$key]) : $mask($values[$key] ?? null);
        }

        return $values;
    }

    /**
     * Merge values over what is stored, let listeners adjust them (`settings.saving`),
     * validate against the blueprint and write. Environment overrides are never written.
     */
    public function save(string $namespace, array $values): array
    {
        // One save at a time, on what is stored now: secrets.json holds every namespace's secrets, and a request
        // that read it before another one saved would otherwise write the other's secret back as it was.
        $this->exclusively(function () use ($namespace, $values): void {
            $this->secrets = null;
            $merged = $this->prepare($namespace, $values);
            $secretKeys = $this->secretKeys($namespace);
            $public = array_diff_key($merged, array_flip($secretKeys));
            // Refused before anything is written: a file of secrets this key can't open would lose them all.
            $secrets = $secretKeys === [] ? [] : $this->secrets(strict: true);
            Yaml::write(site_path("config/{$namespace}.yaml"), $public);

            if ($secretKeys !== []) {
                $secrets[$namespace] = array_intersect_key($merged, array_flip($secretKeys));
                $this->writeSecrets($secrets);
            }
        });

        $this->cache = [];
        cms()->hooks()->dispatch('settings.saved', $namespace, $this->get($namespace));

        return $this->get($namespace);
    }

    /**
     * What a save of these values would store: merged over what is stored, adjusted by listeners
     * (`settings.saving`) and checked against the fields. Writes nothing: save() stores what this answers,
     * and a dry run stops here.
     */
    public function prepare(string $namespace, array $values): array
    {
        if (! Files::isHandle($namespace)) {
            throw AbilityException::invalid(__('Invalid settings namespace.'));
        }

        $schema = $this->schemas[$namespace] ?? null;
        $secretKeys = $this->secretKeys($namespace);

        // Masked secrets mean "unchanged", also one language of a secret with a value per language.
        foreach ($secretKeys as $key) {
            if (($values[$key] ?? null) === '••••••••') {
                unset($values[$key]);
            } elseif (is_array($values[$key] ?? null)) {
                $values[$key] = array_filter($values[$key], static fn (mixed $value) => $value !== '••••••••');
            }
        }

        $stored = $this->stored($namespace);

        // A value per language is saved language by language: the ones not given keep theirs.
        foreach ($this->fields($namespace) as $field) {
            $handle = $field['handle'] ?? null;

            if (! empty($field['localizable']) && is_string($handle) && is_array($values[$handle] ?? null) && is_array($stored[$handle] ?? null)) {
                $values[$handle] = array_replace($stored[$handle], $values[$handle]);
            }
        }

        $merged = cms()->hooks()->filter('settings.saving', array_replace($stored, $values), $namespace, $stored);

        if ($schema) {
            try {
                $blueprint = Blueprint::make($this->fields($namespace));
                $merged = $blueprint->process($merged);
                $blueprint->check($merged, $stored);
            } catch (SchemaException $e) {
                throw AbilityException::invalid($e->getMessage(), $e->errors);
            }
        }

        return $merged;
    }

    /**
     * The handles whose stored value a save of these values would change, checked as the save checks them.
     *
     * @return list<string>
     */
    public function changed(string $namespace, array $values): array
    {
        $stored = $this->stored($namespace);

        return array_keys(array_filter($this->prepare($namespace, $values), static fn (mixed $value, string|int $key) => ! array_key_exists($key, $stored) || json_encode($stored[$key]) !== json_encode($value), ARRAY_FILTER_USE_BOTH));
    }

    /** Defaults, then config/<namespace>.yaml, then secrets, then CMS_<NAMESPACE>_<KEY>. */
    private function load(string $namespace): array
    {
        $values = $this->stored($namespace);

        foreach (array_keys($values) as $key) {
            $env = env(strtoupper('CMS_'.$namespace.'_'.$key));

            if ($env !== null) {
                $values[$key] = $env;
            }
        }

        return $values;
    }

    /** What the files hold, over the defaults — without environment overrides. */
    private function stored(string $namespace): array
    {
        $defaults = [];

        if (isset($this->schemas[$namespace])) {
            $defaults = Blueprint::make($this->fields($namespace))->defaults();
        }

        $values = array_replace($defaults, Files::isHandle($namespace) ? Yaml::read(site_path("config/{$namespace}.yaml")) : []);

        return array_replace($values, (array) ($this->secrets()[$namespace] ?? []));
    }

    /**
     * What is secret in a namespace: its fields marked `secret`, as registered and as plugins left them, and
     * whatever secrets.json holds for it. A field a plugin took away stays secret: masked, never in the YAML.
     *
     * @return list<string>
     */
    private function secretKeys(string $namespace): array
    {
        $keys = array_keys((array) ($this->secrets()[$namespace] ?? []));

        foreach ([...($this->schemas[$namespace]['fields'] ?? []), ...$this->fields($namespace)] as $field) {
            if (is_array($field) && ! empty($field['secret']) && isset($field['handle'])) {
                $keys[] = (string) $field['handle'];
            }
        }

        return array_values(array_unique(array_map('strval', $keys)));
    }

    /**
     * Every namespace's secrets. A file this key can't open (the app key changed, the file is damaged) reads as
     * none, so the site keeps running; a save refuses it ($strict), since writing would drop every secret in it.
     */
    private function secrets(bool $strict = false): array
    {
        if ($this->secrets !== null && ! $strict) {
            return $this->secrets;
        }

        $file = storage_path('secrets.json');

        if (! is_file($file)) {
            return $this->secrets = [];
        }

        try {
            $secrets = json_decode($this->encrypter->decryptString((string) file_get_contents($file)), true, 64, JSON_THROW_ON_ERROR);
        } catch (Throwable $e) {
            if ($strict) {
                throw AbilityException::conflict(__('The saved secrets can’t be read with this site’s key, so nothing was saved. Restore storage/secrets.json or the APP_KEY it was written with.'));
            }

            return $this->secrets = [];
        }

        return $this->secrets = is_array($secrets) ? $secrets : [];
    }

    /** Runs the callback holding storage/settings.lock, which every save of settings takes. */
    private function exclusively(callable $callback): void
    {
        Files::ensureDir(storage_path());
        $lock = fopen(storage_path('settings.lock'), 'c');

        if ($lock === false) {
            $callback();

            return;
        }

        try {
            flock($lock, LOCK_EX);
            $callback();
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    private function writeSecrets(array $secrets): void
    {
        Files::put(storage_path('secrets.json'), $this->encrypter->encryptString(json_encode($secrets, JSON_THROW_ON_ERROR)));
        @chmod(storage_path('secrets.json'), 0o600);
        $this->secrets = $secrets;
    }
}

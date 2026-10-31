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
    /** @var array<string, array{label: string, icon: string, description: string, fields: list<array>, permission: string, package: ?string, order: int, section: string}> */
    private array $schemas = [];

    /** @var array<string, array> */
    private array $cache = [];

    private ?array $secrets = null;

    public function __construct(private readonly Encrypter $encrypter) {}

    /**
     * A settings page. `section` is where the settings sidebar lists it: `site`
     * (the site's own settings) or `system` (running the installation).
     */
    public function register(string $namespace, string $label, array $fields, string $icon = 'settings', string $description = '', ?string $package = null, ?string $permission = null, int $order = 50, string $section = 'site'): void
    {
        $this->schemas[$namespace] = [
            'label' => $label,
            'icon' => $icon,
            'description' => $description,
            'fields' => $fields,
            'permission' => $permission ?? 'settings.manage',
            'package' => $package ?? \Cms\Packages\Scope::$current,
            'order' => $order,
            'section' => $section,
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

    /** A namespace's fields; plugins add, change or take over fields with the `settings.fields` filter. */
    private function fields(string $namespace): array
    {
        return array_values((array) cms()->hooks()->filter('settings.fields', $this->schemas[$namespace]['fields'] ?? [], $namespace));
    }

    public function has(string $namespace): bool
    {
        return isset($this->schemas[$namespace]);
    }

    public function get(string $namespace, ?string $key = null, mixed $default = null): mixed
    {
        $values = $this->cache[$namespace] ??= $this->load($namespace);

        return $key === null ? $values : (array_key_exists($key, $values) && $values[$key] !== null ? $values[$key] : $default);
    }

    /** Values for the admin form: secrets are masked. */
    public function forDisplay(string $namespace): array
    {
        $values = $this->get($namespace);

        foreach ($this->secretKeys($namespace) as $key) {
            $values[$key] = ($values[$key] ?? '') !== '' ? '••••••••' : '';
        }

        return $values;
    }

    /**
     * Merge values over what is stored, let listeners adjust them (`settings.saving`),
     * validate against the blueprint and write. Environment overrides are never written.
     */
    public function save(string $namespace, array $values): array
    {
        cms()->guardConfigWrites();

        if (! Files::isHandle($namespace)) {
            throw AbilityException::invalid(__('Invalid settings namespace.'));
        }

        $schema = $this->schemas[$namespace] ?? null;
        $secretKeys = $this->secretKeys($namespace);

        // Masked secrets mean "unchanged".
        foreach ($secretKeys as $key) {
            if (($values[$key] ?? null) === '••••••••') {
                unset($values[$key]);
            }
        }

        $stored = $this->stored($namespace);
        $merged = cms()->hooks()->filter('settings.saving', array_replace($stored, $values), $namespace, $stored);

        if ($schema) {
            try {
                $merged = Blueprint::make($this->fields($namespace))->process($merged);
            } catch (SchemaException $e) {
                throw AbilityException::invalid($e->getMessage(), $e->errors);
            }
        }

        $public = array_diff_key($merged, array_flip($secretKeys));
        Yaml::write(site_path("config/{$namespace}.yaml"), $public);

        if ($secretKeys !== []) {
            $secrets = $this->secrets();
            $secrets[$namespace] = array_intersect_key($merged, array_flip($secretKeys));
            $this->writeSecrets($secrets);
        }

        unset($this->cache[$namespace]);
        cms()->hooks()->dispatch('settings.saved', $namespace, $this->get($namespace));

        return $this->get($namespace);
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

    /** @return list<string> */
    private function secretKeys(string $namespace): array
    {
        $keys = [];

        foreach ($this->fields($namespace) as $field) {
            if (! empty($field['secret'])) {
                $keys[] = (string) $field['handle'];
            }
        }

        return $keys;
    }

    private function secrets(): array
    {
        if ($this->secrets !== null) {
            return $this->secrets;
        }

        $file = storage_path('secrets.json');

        if (! is_file($file)) {
            return $this->secrets = [];
        }

        try {
            return $this->secrets = (array) json_decode($this->encrypter->decryptString((string) file_get_contents($file)), true);
        } catch (Throwable) {
            return $this->secrets = [];
        }
    }

    private function writeSecrets(array $secrets): void
    {
        Files::put(storage_path('secrets.json'), $this->encrypter->encryptString(json_encode($secrets, JSON_THROW_ON_ERROR)));
        @chmod(storage_path('secrets.json'), 0o600);
        $this->secrets = $secrets;
    }
}

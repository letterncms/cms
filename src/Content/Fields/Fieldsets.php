<?php

declare(strict_types=1);

namespace Cms\Content\Fields;

use Cms\Support\Files;
use Cms\Support\Yaml;

/**
 * Reusable field groups. Stored in content/fieldsets/<handle>.yaml; plugins may
 * also register fieldsets in code (e.g. "seo").
 */
final class Fieldsets
{
    /** @var array<string, array{title: string, fields: list<array>, package?: string}> */
    private array $registered = [];

    public function register(string $handle, string $title, array $fields, ?string $package = null): void
    {
        $this->registered[$handle] = ['title' => $title, 'fields' => $fields, 'package' => $package];
    }

    /** @return list<array> Raw field definitions (empty when missing — content keeps working). */
    public function get(string $handle): array
    {
        if (! Files::isHandle($handle)) {
            return [];
        }

        $file = content_path("fieldsets/{$handle}.yaml");

        if (is_file($file)) {
            return array_values((array) (Yaml::read($file)['fields'] ?? []));
        }

        return $this->registered[$handle]['fields'] ?? [];
    }

    /** @return array<string, array{title: string, fields: list<array>, source: string}> */
    public function all(): array
    {
        $out = [];

        foreach ($this->registered as $handle => $set) {
            $out[$handle] = ['title' => $set['title'], 'fields' => $set['fields'], 'source' => $set['package'] ?? 'code'];
        }

        foreach (glob(content_path('fieldsets/*.yaml')) ?: [] as $file) {
            $data = Yaml::read($file);
            $out[basename($file, '.yaml')] = ['title' => (string) ($data['title'] ?? basename($file, '.yaml')), 'fields' => (array) ($data['fields'] ?? []), 'source' => 'file'];
        }

        ksort($out);

        return $out;
    }

    public function save(string $handle, string $title, array $fields): void
    {
        Blueprint::validate($fields); // handles, field types and nesting, as a collection's fields are checked
        Yaml::write(Files::within(content_path('fieldsets'), "{$handle}.yaml"), ['title' => $title, 'fields' => array_values($fields)]);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Content\Collections;

use InvalidArgumentException;
use Cms\Content\Fields\Blueprint;
use Cms\Support\Files;
use Cms\Support\RecordTimestamps;

/**
 * A content type, defined in content/collections/<handle>.yaml.
 */
final class Collection
{
    public const array STRUCTURES = ['list', 'tree', 'dated'];

    public const array DRIVERS = ['database', 'files'];

    public const array VIEWS = ['table', 'grid', 'calendar'];

    private ?Blueprint $blueprint = null;

    /** @var array<string, Blueprint> */
    private array $named = [];

    public function __construct(
        public readonly string $handle,
        public readonly string $title,
        public readonly string $singular,
        public readonly string $icon,
        public readonly string $description,
        public readonly string $driver,
        public readonly string $structure,
        public readonly ?string $route,
        public readonly string $template,
        public readonly string $sort,
        public readonly array $fields,
        public readonly ?string $body,
        public readonly ?string $home,
        public readonly bool $revisions,
        public readonly int $perPage,
        public readonly array $extra = [],
        /** The sidebar section it is listed in; pinned there unless it is a system collection. */
        public readonly string $section = 'content',
        public readonly bool $system = false,
        public readonly string $defaultView = 'table',
        /** Visible overview column IDs; null keeps the standard columns. */
        public readonly ?array $defaultColumns = null,
    ) {
        if (! Files::isHandle($handle)) {
            throw new InvalidArgumentException(__('Invalid collection handle :handle.', ['handle' => $handle]));
        }

        if (! in_array($driver, self::DRIVERS, true)) {
            throw new InvalidArgumentException(__('Unknown driver :driver for collection :handle.', ['driver' => $driver, 'handle' => $handle]));
        }

        if (! in_array($structure, self::STRUCTURES, true)) {
            throw new InvalidArgumentException(__('Unknown structure :structure for collection :handle.', ['structure' => $structure, 'handle' => $handle]));
        }

        if (! in_array($defaultView, self::VIEWS, true)) {
            throw new InvalidArgumentException(__('Unknown default view :view for collection :handle.', ['view' => $defaultView, 'handle' => $handle]));
        }

        foreach ($defaultColumns ?? [] as $id) {
            if (! is_string($id) || (! in_array($id, ['uri', 'status', 'translations', 'author', 'published', 'updated'], true) && ! preg_match('/^field:[a-z0-9][a-z0-9_-]{0,63}$/D', $id))) {
                throw new InvalidArgumentException(__('Default display fields must be column IDs or field:handle.'));
            }
        }
    }

    public static function fromArray(string $handle, array $data): self
    {
        $structure = (string) ($data['structure'] ?? 'list');
        $template = (string) ($data['template'] ?? '');
        $known = ['title', 'singular', 'icon', 'description', 'driver', 'structure', 'route', 'template', 'sort', 'fields', 'body', 'home', 'revisions', 'per_page', 'section', 'system', 'default_view', 'default_columns'];

        if (isset($data['default_columns']) && (! is_array($data['default_columns']) || ! array_is_list($data['default_columns']))) {
            throw new InvalidArgumentException(__('Default display fields must be a list of column IDs.'));
        }

        return new self(
            handle: $handle,
            title: (string) ($data['title'] ?? ucfirst($handle)),
            singular: (string) ($data['singular'] ?? $data['title'] ?? ucfirst($handle)),
            icon: (string) ($data['icon'] ?? 'collection'),
            description: (string) ($data['description'] ?? ''),
            driver: (string) ($data['driver'] ?? 'database'),
            structure: $structure,
            route: isset($data['route']) && $data['route'] !== '' ? (string) $data['route'] : null,
            template: $template,
            sort: (string) ($data['sort'] ?? match ($structure) { 'tree' => 'position', 'dated' => '-published_at', default => 'title' }),
            fields: array_values((array) ($data['fields'] ?? [])),
            body: isset($data['body']) ? (string) $data['body'] : null,
            home: isset($data['home']) ? (string) $data['home'] : null,
            revisions: (bool) ($data['revisions'] ?? true),
            perPage: (int) ($data['per_page'] ?? 10),
            extra: array_diff_key($data, array_flip($known)),
            section: is_string($data['section'] ?? null) && Files::isHandle($data['section']) ? $data['section'] : 'content',
            system: (bool) ($data['system'] ?? false),
            defaultView: (string) ($data['default_view'] ?? 'table'),
            defaultColumns: isset($data['default_columns']) ? array_values(array_unique($data['default_columns'], SORT_REGULAR)) : null,
        );
    }

    /**
     * The fields of its entries. A collection can have more than one set, by name:
     *
     *   blueprints:
     *     video: { title: Video, fields: [...] }
     *
     * An entry is made with one (`Entry::$blueprint`) and keeps it. `fields` is the set of an entry that names
     * none, and what an unknown name falls back to, so content survives a blueprint that was removed.
     */
    public function blueprint(?string $name = null): Blueprint
    {
        if ($name !== null && isset($this->blueprints()[$name])) {
            return $this->named[$name] ??= Blueprint::make($this->blueprints()[$name]['fields']);
        }

        return $this->blueprint ??= Blueprint::make($this->fields);
    }

    /** @return array<string, array{title: string, fields: list<array>}> The named blueprints, beside the one in `fields`. */
    public function blueprints(): array
    {
        $out = [];

        foreach ((array) $this->get('blueprints', []) as $name => $blueprint) {
            if (is_string($name) && Files::isHandle($name) && is_array($blueprint)) {
                $out[$name] = ['title' => (string) ($blueprint['title'] ?? ucfirst(str_replace(['-', '_'], ' ', $name))), 'fields' => array_values((array) ($blueprint['fields'] ?? []))];
            }
        }

        return $out;
    }

    /** A field by its handle, in whichever blueprint has it: `fields` first. */
    public function field(string $handle): ?\Cms\Content\Fields\Field
    {
        foreach ([null, ...array_keys($this->blueprints())] as $name) {
            if ($field = $this->blueprint($name)->field($handle)) {
                return $field;
            }
        }

        return null;
    }

    /** @return array<string, \Cms\Content\Fields\Field> The relation fields of every blueprint, by their path in the data. */
    public function relations(): array
    {
        $out = $this->blueprint()->relations();

        foreach (array_keys($this->blueprints()) as $name) {
            $out += $this->blueprint($name)->relations();
        }

        return $out;
    }

    public function deletable(): bool
    {
        return ! $this->system || is_file(content_path("collections/{$this->handle}.yaml"));
    }

    /** The URL pattern in a language: `routes: {de: /neuigkeiten/{slug}}` where it differs from `route`. */
    public function routeFor(string $locale): ?string
    {
        $routes = (array) $this->get('routes', []);

        return is_string($routes[$locale] ?? null) && $routes[$locale] !== '' ? $routes[$locale] : $this->route;
    }

    public function routable(): bool
    {
        return $this->route !== null;
    }

    public function isTree(): bool
    {
        return $this->structure === 'tree';
    }

    /**
     * A vocabulary other entries are filed under (`taxonomy: true`): its entries are the terms, which `terms`
     * fields pick from. Everything else about it is a collection: a tree for nested terms, a route for term pages.
     */
    public function isTaxonomy(): bool
    {
        return (bool) $this->get('taxonomy', false);
    }

    public function isDated(): bool
    {
        return $this->structure === 'dated';
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->extra[$key] ?? $default;
    }

    /** As stored in YAML. */
    public function toYaml(): array
    {
        return array_filter([
            'title' => $this->title,
            'singular' => $this->singular,
            'icon' => $this->icon,
            'description' => $this->description ?: null,
            'driver' => $this->driver,
            'structure' => $this->structure,
            'route' => $this->route,
            'template' => $this->template,
            'sort' => $this->sort,
            'home' => $this->home,
            'body' => $this->body,
            'revisions' => $this->revisions ? null : false,
            'per_page' => $this->perPage !== 10 ? $this->perPage : null,
            'section' => $this->section !== 'content' ? $this->section : null,
            'system' => $this->system ?: null,
            'default_view' => $this->defaultView !== 'table' ? $this->defaultView : null,
            'default_columns' => $this->defaultColumns,
            ...$this->extra,
            'fields' => $this->fields,
        ], static fn ($v) => $v !== null);
    }

    /** For APIs: definition plus the resolved (imports expanded) fields and schema. */
    public function toArray(): array
    {
        return [
            'handle' => $this->handle,
            ...$this->toYaml(),
            ...RecordTimestamps::api($this->extra),
            'default_view' => $this->defaultView,
            'default_columns' => $this->defaultColumns,
            'resolvedFields' => $this->blueprint()->toArray(['collection' => $this]),
            'schema' => $this->blueprint()->schema(),
            ...($this->blueprints() === [] ? [] : ['resolvedBlueprints' => array_map(fn (string $name, array $blueprint) => [
                'handle' => $name, 'title' => $blueprint['title'],
                'resolvedFields' => $this->blueprint($name)->toArray(['collection' => $this]), 'schema' => $this->blueprint($name)->schema(),
            ], array_keys($this->blueprints()), $this->blueprints())]),
        ];
    }
}

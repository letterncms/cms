<?php

declare(strict_types=1);

namespace Cms\Content\Collections;

use InvalidArgumentException;
use Cms\Content\Fields\Blueprint;
use Cms\Extend\Hooks;
use Cms\Support\Files;
use Cms\Support\RecordTimestamps;
use Cms\Support\Yaml;

final class CollectionRepository
{
    /** @var array<string, Collection>|null */
    private ?array $collections = null;

    /** Collections from files while plugins are still adding theirs (for re-entrant lookups). */
    private ?array $building = null;

    public function __construct(private readonly Hooks $hooks) {}

    /** Initial definition supplied by the active plugins, before a creator's explicit settings. */
    public function defaults(): array
    {
        return $this->hooks->filter('collections.defaults', []);
    }

    /** @return array<string, Collection> */
    public function all(): array
    {
        if ($this->collections !== null) {
            return $this->collections;
        }

        if ($this->building !== null) {
            return $this->building;
        }

        $collections = [];

        foreach (Yaml::directory(content_path('collections')) as $handle => $data) {
            $collections[$handle] = Collection::fromArray($handle, $data);
        }

        $this->building = $collections;

        try {
            return $this->collections = $this->hooks->filter('collections', $collections);
        } finally {
            $this->building = null;
        }
    }

    /**
     * The settings of a collection as fields, for the admin and agents: core's,
     * then whatever plugins add through the `collections.settings` filter
     * (for example, the Site module adds its template).
     */
    public function settingsFields(?Collection $collection = null): array
    {
        // One handle for every blueprint: each entry's body is the field of that handle in its own blueprint,
        // of whichever type it has there, and a blueprint without it has none. So any blueprint's field can be it.
        $bodies = [];

        foreach ($collection ? [null, ...array_keys($collection->blueprints())] : [] as $name) {
            foreach ($collection->blueprint($name)->fields() as $field) {
                if (in_array($field->type, ['blocks', 'markdown', 'richtext'], true)) {
                    $bodies[$field->handle] ??= $field->label;
                }
            }
        }

        $fields = [
            ['handle' => 'title', 'type' => 'text', 'label' => 'Name', 'required' => true, 'width' => 'half'],
            ['handle' => 'singular', 'type' => 'text', 'label' => 'Entry Name', 'width' => 'half'],
            ['handle' => 'icon', 'type' => 'icon', 'label' => 'Icon'],
            ['handle' => 'route', 'type' => 'text', 'label' => 'URL Pattern', 'width' => 'half', 'placeholder' => '/blog/{slug}'],
            ['handle' => 'structure', 'type' => 'select', 'label' => 'Structure', 'width' => 'half', 'display' => 'segmented', 'required' => true, 'options' => ['list' => 'List', 'tree' => 'Tree', 'dated' => 'Dated']],
            ['handle' => 'default_view', 'type' => 'select', 'label' => 'Default View', 'display' => 'segmented', 'required' => true, 'default' => 'table', 'options' => ['table' => 'Table', 'grid' => 'Grid', 'calendar' => 'Calendar']],
            ['handle' => 'taxonomy', 'type' => 'toggle', 'label' => 'Taxonomy', 'about' => 'Its entries are terms that other entries are filed under.'],
            ['handle' => 'default_columns', 'type' => 'json', 'component' => 'collection-display-fields', 'label' => 'Default Display Fields'],
        ];

        // A page per term of a taxonomy, listing this collection's entries: offered where there is a taxonomy to archive by.
        $taxonomies = array_map(static fn (Collection $c) => $c->title, array_filter($this->all(), static fn (Collection $c) => $c->isTaxonomy() && $c->handle !== $collection?->handle));

        if ($taxonomies !== [] && $collection?->routable()) {
            $fields[] = ['handle' => 'archives', 'type' => 'json', 'component' => 'collection-archives', 'label' => 'Term Archives', 'options' => $taxonomies];
        }

        if ($bodies !== []) {
            $fields[] = ['handle' => 'body', 'type' => 'select', 'label' => 'Body Field', 'placeholder' => 'None', 'options' => $bodies];
        }

        return Blueprint::make($this->hooks->filter('collections.settings', $fields, $collection))->toArray();
    }

    public function find(string $handle): ?Collection
    {
        return $this->all()[$handle] ?? null;
    }

    public function findOrFail(string $handle): Collection
    {
        return $this->find($handle) ?? throw new InvalidArgumentException(__('Collection ":handle" does not exist.', ['handle' => $handle]));
    }

    public function save(Collection $collection): void
    {
        $existing = $this->find($collection->handle);
        $collection->blueprint()->schema(); // throws on invalid field definitions

        foreach (array_keys($collection->blueprints()) as $name) {
            $collection->blueprint($name)->schema();
        }
        Yaml::write($this->file($collection->handle), [...$collection->toYaml(), ...RecordTimestamps::saved($existing?->toYaml())]);
        $this->collections = null;
        app(Archives::class)->flush();
        $this->hooks->dispatch('collection.saved', $collection);
    }

    public function delete(string $handle): void
    {
        @unlink($this->file($handle));
        $this->collections = null;
        app(Archives::class)->flush();
        $this->hooks->dispatch('collection.deleted', $handle);
    }

    public function flush(): void
    {
        $this->collections = null;
    }

    /**
     * Run with these definitions beside the stored ones, in memory only: what a dry run needs to check the
     * entries of a collection it would make. Nothing is written and no hook hears of them.
     *
     * @param  array<string, Collection>  $collections
     */
    public function staged(array $collections, callable $run): mixed
    {
        $this->collections = [...$this->all(), ...$collections];

        try {
            return $run();
        } finally {
            $this->collections = null;
        }
    }

    private function file(string $handle): string
    {
        if (! Files::isHandle($handle)) {
            throw new InvalidArgumentException(__('Invalid collection handle.'));
        }

        return content_path("collections/{$handle}.yaml");
    }
}

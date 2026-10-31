<?php

declare(strict_types=1);

namespace Cms\Content\Globals;

use InvalidArgumentException;
use Cms\Abilities\AbilityException;
use Cms\Extend\Hooks;
use Cms\Support\Files;
use Cms\Support\RecordTimestamps;
use Cms\Support\Schema\SchemaException;
use Cms\Support\Yaml;

final class GlobalRepository
{
    /** @var array<string, GlobalSet>|null */
    private ?array $sets = null;

    public function __construct(private readonly Hooks $hooks) {}

    /** @return array<string, GlobalSet> */
    public function all(): array
    {
        if ($this->sets === null) {
            $this->sets = [];

            foreach (Yaml::directory(content_path('globals')) as $handle => $raw) {
                $changed = @filemtime(content_path("globals/{$handle}.yaml"));
                $raw['updated_at'] ??= $changed ? date(DATE_ATOM, $changed) : null;
                $this->sets[$handle] = GlobalSet::fromArray($handle, $raw);
            }
        }

        return $this->sets;
    }

    public function find(string $handle): ?GlobalSet
    {
        return $this->all()[$handle] ?? null;
    }

    public function findOrFail(string $handle): GlobalSet
    {
        return $this->find($handle) ?? throw new InvalidArgumentException(__('Global set ":handle" does not exist.', ['handle' => $handle]));
    }

    /** Values of every set, keyed by handle (what templates receive as $globals). */
    public function values(?string $locale = null): array
    {
        $out = [];

        foreach ($this->all() as $handle => $set) {
            $out[$handle] = $set->blueprint()->augment($set->values($locale));
        }

        return $out;
    }

    public function updateValues(string $handle, array $values, ?string $locale = null): GlobalSet
    {
        $set = $this->findOrFail($handle);

        try {
            $values = $set->blueprint()->process(array_replace($set->values($locale), $values));
        } catch (SchemaException $e) {
            throw AbilityException::invalid($e->getMessage(), $e->errors);
        }

        if ($locale === null || $locale === config('app.locale')) {
            $set->data = $values;
        } else {
            $set->locales[$locale] = $values;
        }

        $this->save($set);
        $this->hooks->dispatch('globals.saved', $set);

        return $set;
    }

    public function save(GlobalSet $set): void
    {
        cms()->guardConfigWrites();

        if (! Files::isHandle($set->handle)) {
            throw new InvalidArgumentException(__('Invalid handle.'));
        }

        $set->blueprint()->schema();
        $file = content_path("globals/{$set->handle}.yaml");
        $set->timestamps = RecordTimestamps::api(RecordTimestamps::saved(is_file($file) ? Yaml::read($file) : null));
        Yaml::write(content_path("globals/{$set->handle}.yaml"), $set->toYaml());
        $this->sets = null;
    }

    public function delete(string $handle): void
    {
        cms()->guardConfigWrites();

        if (Files::isHandle($handle)) {
            @unlink(content_path("globals/{$handle}.yaml"));
        }

        $this->sets = null;
    }
}

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
    /** @var array<string, GlobalContent>|null */
    private ?array $globals = null;

    public function __construct(private readonly Hooks $hooks) {}

    /** @return array<string, GlobalContent> */
    public function all(): array
    {
        if ($this->globals === null) {
            $this->globals = [];

            foreach (Yaml::directory(content_path('globals')) as $handle => $raw) {
                $changed = @filemtime(content_path("globals/{$handle}.yaml"));
                $raw['updated_at'] ??= $changed ? date(DATE_ATOM, $changed) : null;
                $this->globals[$handle] = GlobalContent::fromArray($handle, $raw);
            }
        }

        return $this->globals;
    }

    public function find(string $handle): ?GlobalContent
    {
        return $this->all()[$handle] ?? null;
    }

    public function findOrFail(string $handle): GlobalContent
    {
        return $this->find($handle) ?? throw new InvalidArgumentException(__('Global ":handle" does not exist.', ['handle' => $handle]));
    }

    /** Values of every global, keyed by handle (what templates receive as $globals). */
    public function values(?string $locale = null): array
    {
        $out = [];

        foreach ($this->all() as $handle => $global) {
            $out[$handle] = $global->blueprint()->augment($global->values($locale));
        }

        return $out;
    }

    public function updateValues(string $handle, array $values, ?string $locale = null): GlobalContent
    {
        $global = $this->findOrFail($handle);

        try {
            $stored = $global->values($locale);
            $values = $global->blueprint()->process(array_replace($stored, $values));
            $global->blueprint()->check($values, $stored);
        } catch (SchemaException $e) {
            throw AbilityException::invalid($e->getMessage(), $e->errors);
        }

        if ($locale === null || $locale === config('app.locale')) {
            $global->data = $values;
        } else {
            $global->locales[$locale] = $values;
        }

        $this->save($global);
        $this->hooks->dispatch('globals.saved', $global);

        return $global;
    }

    public function save(GlobalContent $global): void
    {
        if (! Files::isHandle($global->handle)) {
            throw new InvalidArgumentException(__('Invalid handle.'));
        }

        $global->blueprint()->schema();
        $file = content_path("globals/{$global->handle}.yaml");
        $global->timestamps = RecordTimestamps::api(RecordTimestamps::saved(is_file($file) ? Yaml::read($file) : null));
        Yaml::write(content_path("globals/{$global->handle}.yaml"), $global->toYaml());
        $this->globals = null;
        // The global's definition, where `globals.saved` is its values.
        $this->hooks->dispatch('global.saved', $global);
    }

    public function delete(string $handle): void
    {
        if (Files::isHandle($handle)) {
            @unlink(content_path("globals/{$handle}.yaml"));
        }

        $this->globals = null;
        $this->hooks->dispatch('global.deleted', $handle);
    }
}

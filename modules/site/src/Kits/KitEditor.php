<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Kits;

use Cms\Abilities\AbilityException;
use Cms\Support\Files;

/**
 * Changes what a kit says of itself: its name, its description and its thumbnail. Only the kit's own kit.json
 * and previews/ are written, in the kit's folder in kits/ and in the copy kept when the site leaves it, so both
 * say the same. A kit that comes with the CMS is not the site's to change.
 */
final class KitEditor
{
    public function __construct(private readonly Kits $kits, private readonly KitExporter $exporter) {}

    /**
     * @param  array{name?: string, description?: string, preview?: string, previewType?: string, removePreview?: bool}  $changes
     */
    public function update(string $handle, array $changes): void
    {
        $folders = array_filter([$this->kits->find($handle)?->source === 'site' ? $this->kits->path($handle) : null, isset($this->kits->saved()[$handle]) ? $this->kits->savedPath($handle) : null]);

        if ($folders === []) {
            throw $this->kits->find($handle) !== null
                ? AbilityException::conflict(__('The kit “:handle” comes with :brand and is not changed here: export the site to make a kit of your own.', ['handle' => $handle]))
                : AbilityException::notFound(__('There is no kit “:handle” here. kits/list has the ones there are.', ['handle' => $handle]));
        }

        $preview = $this->exporter->preview($changes);

        foreach ($folders as $folder) {
            $manifest = json_decode((string) file_get_contents($folder.'/'.Kit::FILE), true);

            if (! is_array($manifest)) {
                continue;
            }

            isset($changes['name']) && $manifest['name'] = trim($changes['name']);

            if (array_key_exists('description', $changes)) {
                trim((string) $changes['description']) !== '' ? $manifest['description'] = trim((string) $changes['description']) : $manifest['description'] = null;
            }

            if ($preview !== null || ! empty($changes['removePreview'])) {
                foreach ((array) ($manifest['previews'] ?? []) as $old) {
                    is_string($old) && is_file($file = $folder.'/'.$old) && ! is_link($file) && @unlink($file);
                }

                $manifest['previews'] = null;

                if ($preview !== null) {
                    Files::put($folder.'/previews/home.'.$preview[0], $preview[1]);
                    $manifest['previews'] = ['previews/home.'.$preview[0]];
                }
            }

            $manifest = array_filter($manifest, static fn ($v) => $v !== null && $v !== []);

            if (($problem = Kit::problem($handle, $manifest)) !== null) {
                throw AbilityException::invalid(__('The kit can’t be described that way: :problem.', ['problem' => $problem]));
            }

            Files::put($folder.'/'.Kit::FILE, json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)."\n");
        }

        $this->kits->flush();
    }

    /**
     * The folders deleting a kit would remove: its folder in kits/ and the copy kept when the site left it.
     * The kit the site is, and a kit that comes with the CMS, are not removed.
     *
     * @return list<string>
     */
    public function removable(string $handle): array
    {
        $kit = $this->kits->find($handle);
        $saved = $this->kits->saved()[$handle] ?? null;

        if ($kit === null && $saved === null) {
            throw AbilityException::notFound(__('There is no kit “:handle” here. kits/list has the ones there are.', ['handle' => $handle]));
        }

        if ($kit?->source === 'builtin') {
            throw AbilityException::conflict(__('The kit “:handle” comes with :brand and is not deleted. Start it over to let go of your changes to it.', ['handle' => $handle]));
        }

        if ($this->kits->active() === $handle) {
            throw AbilityException::conflict(__('The site is the kit “:handle” now. Switch to another kit first.', ['handle' => $handle]));
        }

        return array_values(array_filter([$kit?->path, $saved?->path]));
    }

    public function delete(string $handle): void
    {
        foreach ($this->removable($handle) as $folder) {
            Files::deleteDirectory($folder);
        }

        $this->kits->flush();
    }
}

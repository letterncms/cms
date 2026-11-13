<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Sites;

use Cms\Abilities\AbilityException;
use Cms\Support\Files;

/**
 * Changes what a site says of itself: its name, its description and its thumbnail. Only the site's own site.json
 * and previews/ are written, in the site's folder in sites/ and in the copy kept when the site leaves it, so both
 * say the same.
 */
final class SiteEditor
{
    public function __construct(private readonly Sites $sites, private readonly SiteExporter $exporter) {}

    /**
     * @param  array{name?: string, description?: string, preview?: string, previewType?: string, removePreview?: bool}  $changes
     */
    public function update(string $handle, array $changes): void
    {
        $folders = array_filter([$this->sites->find($handle) !== null ? $this->sites->path($handle) : null, isset($this->sites->saved()[$handle]) ? $this->sites->savedPath($handle) : null]);

        if ($folders === []) {
            throw AbilityException::notFound(__('There is no site “:handle” here. sites/list has the ones there are.', ['handle' => $handle]));
        }

        $preview = $this->exporter->preview($changes);

        foreach ($folders as $folder) {
            $manifest = json_decode((string) file_get_contents($folder.'/'.Site::FILE), true);

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

            if (($problem = Site::problem($handle, $manifest)) !== null) {
                throw AbilityException::invalid(__('The site can’t be described that way: :problem.', ['problem' => $problem]));
            }

            Files::put($folder.'/'.Site::FILE, json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)."\n");
        }

        $this->sites->flush();
    }

    /**
     * The folders deleting a site would remove: its folder in sites/ and the copy kept when the site left it.
     * The site the site is is not removed: a site is one site that is there, or none.
     *
     * @return list<string>
     */
    public function removable(string $handle): array
    {
        $sitePackage = $this->sites->find($handle);
        $saved = $this->sites->saved()[$handle] ?? null;

        if ($sitePackage === null && $saved === null) {
            throw AbilityException::notFound(__('There is no site “:handle” here. sites/list has the ones there are.', ['handle' => $handle]));
        }

        if ($this->sites->active() === $handle) {
            throw AbilityException::conflict(__('The site is the site “:handle” now. Switch to another site first.', ['handle' => $handle]));
        }

        return array_values(array_filter([$sitePackage?->path, $saved?->path]));
    }

    public function delete(string $handle): void
    {
        foreach ($this->removable($handle) as $folder) {
            Files::deleteDirectory($folder);
        }

        $this->sites->flush();
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Sites;

use Cms\Cms;
use Cms\Modules\Site\Design\Code;
use Cms\Modules\Site\Design\Design;
use Cms\Support\Files;
use Cms\Support\Yaml;
use Illuminate\Support\Facades\DB;

/**
 * Takes out of the site exactly what a site carries (SiteExporter says what that is), so that a site can take its
 * place: the collections and their entries, the templates' and components' entries, globals, menus, the
 * design, what plugins keep beside the content and the settings a site may carry. Nothing else is touched:
 * accounts, the media library, submissions, analytics, secrets and the rest of config/ stay.
 *
 * What is cleared is what SiteExporter writes, so a site that was saved first loses nothing.
 */
final class SiteClearer
{
    public function __construct(
        private readonly Cms $cms,
        private readonly SiteExporter $exporter,
        private readonly Design $design,
        private readonly Code $code,
    ) {}

    public function clear(): void
    {
        $this->cms->entryService()->write(function (): void {
            foreach ($this->exporter->collections() as $handle => $collection) {
                if ($collection->driver === 'database') {
                    DB::table('revisions')->where('collection', $handle)->delete();
                    DB::table('entries')->where('collection', $handle)->delete();
                } else {
                    Files::deleteDirectory(content_path("collections/{$handle}"));
                }

                // A plugin's collection is defined by the plugin: only what is in it goes.
                ! $collection->system && @unlink(content_path("collections/{$handle}.yaml"));
            }
        });

        foreach (['globals', 'navigation'] as $folder) {
            foreach (glob(content_path($folder).'/*.yaml') ?: [] as $file) {
                Files::isHandle(basename($file, '.yaml')) && @unlink($file);
            }
        }

        foreach ($this->exporter->tree($this->design->path()) as $relative) {
            @unlink($this->design->path($relative));
        }

        foreach ((array) $this->cms->hooks()->filter('sites.content', []) as $folder) {
            if (is_string($folder) && Files::isHandle($folder)) {
                foreach ($this->exporter->tree(content_path($folder)) as $relative) {
                    preg_match('/\.(yaml|json|md)$/', $relative) && @unlink(content_path("{$folder}/{$relative}"));
                }

                is_file($single = content_path("{$folder}.yaml")) && ! is_link($single) && @unlink($single);
            }
        }

        foreach (SiteExporter::carried($this->cms) as $namespace => $keys) {
            $file = site_path("config/{$namespace}.yaml");
            $stored = Yaml::read($file);

            if (array_intersect_key($stored, array_flip($keys)) !== []) {
                Yaml::write($file, array_diff_key($stored, array_flip($keys)));
                $this->cms->settingsRegistry()->forget($namespace);
            }
        }

        $this->cms->collections()->flush();
        $this->cms->entries()->flush();
        $this->code->flush();
        $this->cms->hooks()->dispatch('site.cleared');
    }
}

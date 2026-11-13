<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Sites;

use Closure;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Cms;
use Cms\Support\Schema\Shape;

/** Sites for agents and the admin: what there is (sites/list, sites/get), taking one in (sites/apply) and making one (sites/export). */
final class SiteAbilities
{
    /** A site as sites/list and sites/get say it. */
    /** @return array<string, mixed> */
    public static function site(): array
    {
        return [
        'handle' => Shape::STRING, 'name' => Shape::STRING, 'description' => Shape::STRING, 'version' => Shape::STRING, 'license' => Shape::STRING_OR_NULL,
        'source' => Shape::enum('site', 'saved'), 'active' => Shape::BOOLEAN, 'edited' => Shape::BOOLEAN, 'cms' => Shape::STRING_OR_NULL, 'plugins' => [Shape::STRING], 'languages' => [Shape::STRING], 'previews' => [Shape::STRING],
        'demo' => Shape::STRING_OR_NULL, 'suits' => Shape::BOOLEAN, 'missingPlugins' => [Shape::STRING], 'code' => Shape::BOOLEAN,
        ];
    }

    /** One step of applying a site: what it does (`clash` stands in the way), to what, from which of the site's files. */
    public static function step(): array
    {
        return ['action' => Shape::enum('create', 'replace', 'rename', 'merge', 'skip', 'clash'), 'type' => Shape::STRING, 'name' => Shape::STRING, 'title?' => Shape::STRING, 'collection?' => Shape::STRING, 'path?' => Shape::STRING, 'as?' => Shape::STRING, 'note?' => Shape::STRING];
    }

    /**
     * @param  Closure(): Sites  $sites
     * @param  Closure(): SiteApplier  $applier
     * @param  Closure(): SiteExporter  $exporter
     * @param  Closure(): SiteImporter  $importer
     * @param  Closure(): SiteEditor  $editor
     */
    public static function register(Cms $cms, Closure $sites, Closure $applier, Closure $exporter, Closure $importer, Closure $editor): void
    {
        $abilities = $cms->abilities();
        $describe = static fn (Site $sitePackage) => [
            ...$sitePackage->toArray(),
            'suits' => $sitePackage->suits(Cms::VERSION),
            'missingPlugins' => $sitePackage->source === 'saved' ? [] : $applier()->missingPlugins($sitePackage),
            'code' => $applier()->carriesCode($sitePackage),
            'active' => $sites()->active() === $sitePackage->handle,
            'edited' => isset($sites()->saved()[$sitePackage->handle]),
        ];
        $modes = ['mode' => ['type' => 'string', 'enum' => SiteApplier::MODES, 'description' => 'design: tokens, fonts, templates, components, patterns, scripts, styles and libraries. full (the default): all that, and the collections, entries, globals, menus, media and languages.'],
            'clash' => ['type' => 'string', 'enum' => SiteApplier::CLASHES, 'description' => 'What happens where the site already has something of the same name: refuse (the default: nothing is applied while there is one), skip (the site keeps its own), replace (the site’s takes its place, after a snapshot in storage/backups), rename (an entry comes in beside the site’s under a new slug; what has no second name is kept).'],
        ];
        $handle = ['handle' => ['type' => 'string', 'pattern' => '^[a-z0-9][a-z0-9_-]{0,63}$']];
        // Scripts, styles and libraries run on every visitor's page: who may bring them is who may write them.
        $mayApply = static function (array $plan, AbilityContext $context): void {
            if ($plan['code'] && ! $context->can('site.code')) {
                throw AbilityException::forbidden(__('The site “:name” brings scripts or styles, and applying it needs the permission to edit custom CSS and JavaScript.', ['name' => $plan['site']->handle]));
            }
        };

        $abilities->register('sites/list', [
            'label' => 'Sites',
            'description' => 'The sites this site can take in: complete sites to start from, copied once (sites/apply), after which the site owns every file. Each is a folder in the site’s sites/ (composer require of a package of type cms-site puts one there, the store installs one, and sites/export makes one); none is part of the CMS. `problems` names folders in sites/ that are not sites.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'output' => Shape::of(['sites' => [self::site()], 'problems' => [['folder' => Shape::STRING, 'problem' => Shape::STRING]]]),
            'handler' => static fn () => [
                // The sites kept aside that are no site here (one that was never a site's, a site that was removed) are listed too: they can be switched back to.
                'sites' => array_values(array_map($describe, [...$sites()->all(), ...array_diff_key($sites()->saved(), $sites()->all())])),
                'problems' => array_map(static fn (string $folder, string $problem) => ['folder' => 'sites/'.$folder, 'problem' => $problem], array_keys($sites()->problems()), array_values($sites()->problems())),
            ],
        ]);

        $abilities->register('sites/get', [
            'label' => 'Site',
            'description' => 'One site, and with `mode` what applying it would do here, step by step: create, replace, rename, merge (code.json), skip (with a note why) or clash (the site has something of that name; sites/apply refuses until `clash` says what happens to it). The same plan sites/apply runs, without writing anything.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => [...$handle, ...$modes], 'required' => ['handle']],
            'output' => Shape::of([...self::site(), 'plan?' => ['mode' => Shape::STRING, 'clash' => Shape::STRING, 'steps' => [self::step()]]]),
            'handler' => static function (array $in) use ($sites, $applier, $describe): array {
                $sitePackage = $sites()->saved()[(string) $in['handle']] ?? $sites()->findOrFail((string) $in['handle']);

                if (! isset($in['mode'])) {
                    return $describe($sitePackage);
                }

                $plan = $applier()->plan($sitePackage, (string) $in['mode'], (string) ($in['clash'] ?? 'refuse'));

                return [...$describe($sitePackage), 'plan' => ['mode' => $plan['mode'], 'clash' => $plan['clash'], 'steps' => SiteApplier::report($plan['steps'])]];
            },
        ]);

        $abilities->register('sites/apply', [
            'label' => 'Apply a Site',
            'description' => 'Copy a site into this site, once: {"handle": "starter", "mode": "design"}. Entries come in through the entry service under new ids, and what names them (relations, parents, translations, menu items, links, components on blocks) follows. Nothing the site has is changed silently: while the site has something of a name the site brings, the apply refuses and names each one, until `clash` says skip, replace or rename. A site that brings scripts or styles needs the site.code permission. A site that needs plugins this site doesn’t run is refused unless `withoutPlugins`: what of it needs them may then not show. Run it with dryRun first: `changes` is every step.',
            'permission' => 'settings.manage',
            'input' => ['type' => 'object', 'properties' => [...$handle, ...$modes, 'withoutPlugins' => ['type' => 'boolean', 'description' => 'Apply it although it needs plugins this site doesn’t run.']], 'required' => ['handle']],
            'output' => Shape::of(['site' => Shape::STRING, 'mode' => Shape::STRING, 'steps' => [self::step()], 'backup' => Shape::STRING_OR_NULL]),
            'dryRun' => static function (array $in, AbilityContext $context) use ($sites, $applier, $mayApply): array {
                $sitePackage = $sites()->findOrFail((string) $in['handle']);
                $mayApply($applier()->plan($sitePackage, (string) ($in['mode'] ?? 'full'), (string) ($in['clash'] ?? 'refuse')), $context);

                return $applier()->apply($sitePackage, (string) ($in['mode'] ?? 'full'), (string) ($in['clash'] ?? 'refuse'), $context->user, dry: true, withoutPlugins: (bool) ($in['withoutPlugins'] ?? false))['steps'];
            },
            'handler' => static function (array $in, AbilityContext $context) use ($sites, $applier, $mayApply): array {
                $sitePackage = $sites()->findOrFail((string) $in['handle']);
                $mayApply($applier()->plan($sitePackage, (string) ($in['mode'] ?? 'full'), (string) ($in['clash'] ?? 'refuse')), $context);

                return $applier()->apply($sitePackage, (string) ($in['mode'] ?? 'full'), (string) ($in['clash'] ?? 'refuse'), $context->user, withoutPlugins: (bool) ($in['withoutPlugins'] ?? false));
            },
        ]);

        $abilities->register('sites/switch', [
            'label' => 'Switch Site',
            'description' => 'Make this site another site: {"handle": "fathomline"}. The site you leave is saved first, drafts and all (a copy per site, in storage/sites), and switching back brings that copy, so nothing is lost by trying a site. What a site carries is replaced (collections, entries, globals, menus, design, what plugins keep beside the content, the settings a site may carry); accounts, media, submissions and every other setting stay. `fresh` brings the site as it came and lets go of the copy that was kept: start over. Answers with `saved`, the site the site left. sites/apply puts a site on top of the site instead, choosing what happens to what clashes.',
            'permission' => 'settings.manage',
            'input' => ['type' => 'object', 'properties' => [...$handle, 'fresh' => ['type' => 'boolean', 'description' => 'The site as it came, not as this site left it.']], 'required' => ['handle']],
            'output' => Shape::of(['switched' => Shape::BOOLEAN, 'site' => self::site(), 'saved?' => ['handle' => Shape::STRING, 'name' => Shape::STRING], 'steps' => [self::step()], 'backup' => Shape::STRING_OR_NULL]),
            'handler' => static function (array $in, AbilityContext $context) use ($sites, $applier, $describe): array {
                $sitePackage = $sites()->saved()[(string) $in['handle']] ?? $sites()->findOrFail((string) $in['handle']);

                if ($applier()->carriesCode($sitePackage) && ! $context->can('site.code')) {
                    throw AbilityException::forbidden(__('The site “:name” brings scripts or styles, and switching to it needs the permission to edit custom CSS and JavaScript.', ['name' => $sitePackage->handle]));
                }

                $result = $applier()->switchTo((string) $in['handle'], (bool) ($in['fresh'] ?? false), $context->user);
                $sites()->flush();

                return [...array_filter($result, static fn ($v, $k) => $k !== 'saved' || $v !== null, ARRAY_FILTER_USE_BOTH), 'site' => $describe($sites()->saved()[$result['site']] ?? $sites()->findOrFail($result['site']))];
            },
        ]);

        $abilities->register('sites/update', [
            'label' => 'Change a Site’s Details',
            'description' => 'Change what a site says of itself: its `name`, its `description` (empty takes it away) and its thumbnail (`preview`, base64, with `previewType` png, jpg or webp; or `removePreview`). {"handle": "studio", "name": "Studio Two"}. Only a site in the site’s sites/ (and the copy kept of it) can be changed. The site’s files are not touched.',
            'permission' => 'settings.manage',
            'input' => ['type' => 'object', 'properties' => [...$handle, 'name' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 80], 'description' => ['type' => 'string', 'maxLength' => 400], 'preview' => ['type' => 'string', 'description' => 'A picture, base64 (at most 5 MB); with previewType.'], 'previewType' => ['type' => 'string', 'enum' => ['png', 'jpg', 'webp']], 'removePreview' => ['type' => 'boolean']], 'required' => ['handle']],
            'output' => Shape::of(['site' => self::site()]),
            'handler' => static function (array $in) use ($sites, $editor, $describe): array {
                $editor()->update((string) $in['handle'], array_diff_key($in, ['handle' => 1]));

                return ['site' => $describe($sites()->find((string) $in['handle']) ?? $sites()->saved()[(string) $in['handle']])];
            },
        ]);

        $abilities->register('sites/delete', [
            'label' => 'Delete a Site',
            'description' => 'Delete a site: its folder in the site’s sites/ and the copy kept of it when the site left it, so what was changed in it is gone too (the site itself is untouched). {"handle": "studio"}. Not the site the site is now (switch first): a site is always one site that is there, or none at all. A site a Composer package put in sites/ comes back with the next composer install.',
            'permission' => 'settings.manage',
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => $handle, 'required' => ['handle']],
            'output' => Shape::of(['handle' => Shape::STRING]),
            'dryRun' => static function (array $in) use ($editor): array {
                return array_map(static fn (string $folder) => ['action' => 'delete', 'type' => 'site', 'name' => basename($folder), 'path' => str_contains($folder, '/storage/') ? 'storage/sites/'.basename($folder) : 'sites/'.basename($folder)], $editor()->removable((string) $in['handle']));
            },
            'handler' => static function (array $in) use ($editor): array {
                $editor()->delete((string) $in['handle']);

                return ['handle' => (string) $in['handle']];
            },
        ]);

        $abilities->register('sites/import', [
            'label' => 'Import a Site',
            'description' => 'Put a site that came as a zip into this site’s sites/, so it can be switched to (sites/switch) or applied (sites/apply): {"content": "<base64 of the zip>", "encoding": "base64"}, the zip Export Site makes or any site’s folder zipped. The zip is read without trust and the site is checked whole before it is kept; nothing of the site changes. A site of a handle that exists is refused unless `replace`.',
            'permission' => 'settings.manage',
            'input' => ['type' => 'object', 'properties' => ['content' => ['type' => 'string', 'description' => 'The zip file, base64.'], 'encoding' => ['type' => 'string', 'enum' => ['base64']], 'replace' => ['type' => 'boolean']], 'required' => ['content', 'encoding']],
            'output' => Shape::of(['site' => self::site()]),
            'handler' => static function (array $in) use ($importer, $describe): array {
                $zip = tempnam(sys_get_temp_dir(), 'site');
                $data = base64_decode((string) $in['content'], true);

                try {
                    $data === false && throw AbilityException::invalid(__('That is not a zip file.'));
                    file_put_contents($zip, $data);

                    return ['site' => $describe($importer()->import($zip, (bool) ($in['replace'] ?? false)))];
                } finally {
                    @unlink($zip);
                }
            },
        ]);

        $about = [
            ...$handle,
            'name' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 80],
            'description' => ['type' => 'string', 'maxLength' => 400, 'description' => 'What the site’s own description says when left out.'],
            'version' => ['type' => 'string', 'pattern' => '^\d{1,5}\.\d{1,5}\.\d{1,5}$', 'description' => '1.0.0 when left out.'],
            'license' => ['type' => 'string', 'maxLength' => 60],
            'preview' => ['type' => 'string', 'description' => 'A picture to choose the site by, base64 (at most 5 MB); with previewType.'],
            'previewType' => ['type' => 'string', 'enum' => ['png', 'jpg', 'webp']],
        ];
        $pick = static fn (array $in) => array_filter(array_intersect_key($in, $about), static fn ($v) => $v !== null && $v !== '');

        $abilities->register('sites/export', [
            'label' => 'Export Site',
            'description' => 'Make this site into a site, in the site’s sites/<handle> or, with `zip`, as a zip file to download (`{name, type, content, encoding: "base64"}`, the site in a folder named <handle>; nothing is written to the site): its collections and published entries (drafts with `drafts`), templates, components and patterns, globals, menus, design (tokens, fonts, scripts, styles, libraries), the media something names and the settings a site carries; never accounts, tokens, secrets, submissions, analytics, the audit log or licences. {"handle": "studio", "name": "Studio"}. sites/apply takes it into another site, and `php cms site:export <folder>` writes one anywhere. An existing site of that handle is refused unless `replace`.',
            'permission' => 'settings.manage',
            'input' => ['type' => 'object', 'properties' => [...$about, 'replace' => ['type' => 'boolean'], 'drafts' => ['type' => 'boolean', 'description' => 'Take drafts along too: without it only published entries go.'], 'zip' => ['type' => 'boolean', 'description' => 'Answer with the site as a zip file instead of putting it in sites/.']], 'required' => ['handle', 'name']],
            'output' => Shape::of(['site' => self::site(), 'path?' => Shape::STRING, 'files' => Shape::INTEGER, 'bytes' => Shape::INTEGER, 'name?' => Shape::STRING, 'type?' => Shape::STRING, 'content?' => Shape::STRING, 'encoding?' => Shape::STRING]),
            'dryRun' => static function (array $in) use ($sites, $exporter, $pick): array {
                if (! empty($in['zip'])) {
                    return array_map(static fn (string $path) => ['action' => 'create', 'type' => 'file', 'path' => $in['handle'].'.zip/'.$in['handle'].'/'.$path], array_keys($exporter()->files($pick($in), (bool) ($in['drafts'] ?? false))));
                }

                $folder = $sites()->path((string) $in['handle']);
                $sitePackage = $sites()->find((string) $in['handle']);

                if (is_dir($folder) && empty($in['replace'])) {
                    throw AbilityException::conflict(__('There is a site “:handle” already. Choose another handle, or replace it.', ['handle' => (string) $in['handle']]));
                }

                return array_map(static fn (string $path) => ['action' => is_file($folder.'/'.$path) ? 'replace' : 'create', 'type' => 'file', 'path' => 'sites/'.$in['handle'].'/'.$path], array_keys($exporter()->files($pick($in), (bool) ($in['drafts'] ?? false))));
            },
            'handler' => static function (array $in) use ($sites, $exporter, $pick, $describe): array {
                // To take away: made beside the site's own files, zipped, and gone again.
                if (! empty($in['zip'])) {
                    $stage = storage_path('app/site-export-'.bin2hex(random_bytes(4)));

                    try {
                        $result = $exporter()->export($stage.'/'.$in['handle'], $pick($in), drafts: (bool) ($in['drafts'] ?? false));
                        $zip = new \ZipArchive;
                        $file = $stage.'/'.$in['handle'].'.zip';
                        $zip->open($file, \ZipArchive::CREATE);

                        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($stage.'/'.$in['handle'], \FilesystemIterator::SKIP_DOTS)) as $item) {
                            $zip->addFile($item->getPathname(), $in['handle'].'/'.substr($item->getPathname(), strlen($stage.'/'.$in['handle']) + 1));
                        }

                        $zip->close();

                        return ['site' => $describe($result['site']), 'files' => $result['files'], 'bytes' => $result['bytes'], 'name' => $in['handle'].'.zip', 'type' => 'application/zip', 'content' => base64_encode((string) file_get_contents($file)), 'encoding' => 'base64'];
                    } finally {
                        \Cms\Support\Files::deleteDirectory($stage);
                    }
                }

                $folder = $sites()->path((string) $in['handle']);

                if (is_dir($folder) && empty($in['replace'])) {
                    throw AbilityException::conflict(__('There is a site “:handle” already. Choose another handle, or replace it.', ['handle' => (string) $in['handle']]));
                }

                $result = $exporter()->export($folder, $pick($in), replace: true, drafts: (bool) ($in['drafts'] ?? false));
                $sites()->flush();

                return ['site' => $describe($result['site']), 'path' => 'sites/'.$in['handle'], 'files' => $result['files'], 'bytes' => $result['bytes']];
            },
        ]);
    }
}

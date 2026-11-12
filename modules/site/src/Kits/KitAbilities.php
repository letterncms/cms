<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Kits;

use Closure;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Cms;
use Cms\Support\Schema\Shape;

/** Site kits for agents and the admin: what there is (kits/list, kits/get), taking one in (kits/apply) and making one (kits/export). */
final class KitAbilities
{
    /** A kit as kits/list and kits/get say it. */
    /** @return array<string, mixed> */
    public static function kit(): array
    {
        return [
        'handle' => Shape::STRING, 'name' => Shape::STRING, 'description' => Shape::STRING, 'version' => Shape::STRING, 'license' => Shape::STRING_OR_NULL,
        'source' => Shape::enum('builtin', 'site'), 'cms' => Shape::STRING_OR_NULL, 'plugins' => [Shape::STRING], 'languages' => [Shape::STRING], 'previews' => [Shape::STRING],
        'demo' => Shape::STRING_OR_NULL, 'suits' => Shape::BOOLEAN, 'missingPlugins' => [Shape::STRING], 'code' => Shape::BOOLEAN,
        ];
    }

    /** One step of applying a kit: what it does (`clash` stands in the way), to what, from which of the kit's files. */
    public static function step(): array
    {
        return ['action' => Shape::enum('create', 'replace', 'rename', 'merge', 'skip', 'clash'), 'type' => Shape::STRING, 'name' => Shape::STRING, 'title?' => Shape::STRING, 'collection?' => Shape::STRING, 'path?' => Shape::STRING, 'as?' => Shape::STRING, 'note?' => Shape::STRING];
    }

    /**
     * @param  Closure(): Kits  $kits
     * @param  Closure(): KitApplier  $applier
     * @param  Closure(): KitExporter  $exporter
     */
    public static function register(Cms $cms, Closure $kits, Closure $applier, Closure $exporter): void
    {
        $abilities = $cms->abilities();
        $describe = static fn (Kit $kit) => [
            ...$kit->toArray(),
            'suits' => $kit->suits(Cms::VERSION),
            'missingPlugins' => $applier()->missingPlugins($kit),
            'code' => $applier()->carriesCode($kit),
        ];
        $modes = ['mode' => ['type' => 'string', 'enum' => KitApplier::MODES, 'description' => 'design: tokens, fonts, templates, components, scripts, styles and libraries. full (the default): all that, and the collections, entries, global sets, menus, media and languages.'],
            'clash' => ['type' => 'string', 'enum' => KitApplier::CLASHES, 'description' => 'What happens where the site already has something of the same name: refuse (the default: nothing is applied while there is one), skip (the site keeps its own), replace (the kit’s takes its place, after a snapshot in storage/backups), rename (an entry comes in beside the site’s under a new slug; what has no second name is kept).'],
        ];
        $handle = ['handle' => ['type' => 'string', 'pattern' => '^[a-z0-9][a-z0-9_-]{0,63}$']];
        // Scripts, styles and libraries run on every visitor's page: who may bring them is who may write them.
        $mayApply = static function (array $plan, AbilityContext $context): void {
            if ($plan['code'] && ! $context->can('site.code')) {
                throw AbilityException::forbidden(__('The kit “:name” brings scripts or styles, and applying it needs the permission to edit custom CSS and JavaScript.', ['name' => $plan['kit']->handle]));
            }
        };

        $abilities->register('kits/list', [
            'label' => 'Site Kits',
            'description' => 'The site kits this site can take in: complete sites to start from, copied once (kits/apply), after which the site owns every file. minimal is part of the CMS; the rest are folders in the site’s kits/ (composer require of a package of type cms-kit puts one there, and kits/export makes one). `problems` names folders in kits/ that are not kits.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'output' => Shape::of(['kits' => [self::kit()], 'problems' => [['folder' => Shape::STRING, 'problem' => Shape::STRING]]]),
            'handler' => static fn () => [
                'kits' => array_values(array_map($describe, $kits()->all())),
                'problems' => array_map(static fn (string $folder, string $problem) => ['folder' => 'kits/'.$folder, 'problem' => $problem], array_keys($kits()->problems()), array_values($kits()->problems())),
            ],
        ]);

        $abilities->register('kits/get', [
            'label' => 'Site Kit',
            'description' => 'One kit, and with `mode` what applying it would do here, step by step: create, replace, rename, merge (code.json), skip (with a note why) or clash (the site has something of that name; kits/apply refuses until `clash` says what happens to it). The same plan kits/apply runs, without writing anything.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => [...$handle, ...$modes], 'required' => ['handle']],
            'output' => Shape::of([...self::kit(), 'plan?' => ['mode' => Shape::STRING, 'clash' => Shape::STRING, 'steps' => [self::step()]]]),
            'handler' => static function (array $in) use ($kits, $applier, $describe): array {
                $kit = $kits()->findOrFail((string) $in['handle']);

                if (! isset($in['mode'])) {
                    return $describe($kit);
                }

                $plan = $applier()->plan($kit, (string) $in['mode'], (string) ($in['clash'] ?? 'refuse'));

                return [...$describe($kit), 'plan' => ['mode' => $plan['mode'], 'clash' => $plan['clash'], 'steps' => KitApplier::report($plan['steps'])]];
            },
        ]);

        $abilities->register('kits/apply', [
            'label' => 'Apply a Site Kit',
            'description' => 'Copy a kit into this site, once: {"handle": "minimal", "mode": "design"}. Entries come in through the entry service under new ids, and what names them (relations, parents, translations, menu items, links, components on blocks) follows. Nothing the site has is changed silently: while the site has something of a name the kit brings, the apply refuses and names each one, until `clash` says skip, replace or rename. A kit that brings scripts or styles needs the site.code permission. A kit that needs plugins this site doesn’t run is refused unless `withoutPlugins`: what of it needs them may then not show. Run it with dryRun first: `changes` is every step.',
            'permission' => 'settings.manage',
            'input' => ['type' => 'object', 'properties' => [...$handle, ...$modes, 'withoutPlugins' => ['type' => 'boolean', 'description' => 'Apply it although it needs plugins this site doesn’t run.']], 'required' => ['handle']],
            'output' => Shape::of(['kit' => Shape::STRING, 'mode' => Shape::STRING, 'steps' => [self::step()], 'backup' => Shape::STRING_OR_NULL]),
            'dryRun' => static function (array $in, AbilityContext $context) use ($kits, $applier, $mayApply): array {
                $kit = $kits()->findOrFail((string) $in['handle']);
                $mayApply($applier()->plan($kit, (string) ($in['mode'] ?? 'full'), (string) ($in['clash'] ?? 'refuse')), $context);

                return $applier()->apply($kit, (string) ($in['mode'] ?? 'full'), (string) ($in['clash'] ?? 'refuse'), $context->user, dry: true, withoutPlugins: (bool) ($in['withoutPlugins'] ?? false))['steps'];
            },
            'handler' => static function (array $in, AbilityContext $context) use ($kits, $applier, $mayApply): array {
                $kit = $kits()->findOrFail((string) $in['handle']);
                $mayApply($applier()->plan($kit, (string) ($in['mode'] ?? 'full'), (string) ($in['clash'] ?? 'refuse')), $context);

                return $applier()->apply($kit, (string) ($in['mode'] ?? 'full'), (string) ($in['clash'] ?? 'refuse'), $context->user, withoutPlugins: (bool) ($in['withoutPlugins'] ?? false));
            },
        ]);

        $about = [
            ...$handle,
            'name' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 80],
            'description' => ['type' => 'string', 'maxLength' => 400],
            'version' => ['type' => 'string', 'pattern' => '^\d{1,5}\.\d{1,5}\.\d{1,5}$', 'description' => '1.0.0 when left out.'],
            'license' => ['type' => 'string', 'maxLength' => 60],
        ];
        $pick = static fn (array $in) => array_filter(array_intersect_key($in, $about), static fn ($v) => $v !== null && $v !== '');

        $abilities->register('kits/export', [
            'label' => 'Export as a Site Kit',
            'description' => 'Make this site into a kit, in the site’s kits/<handle> or, with `zip`, as a zip file to download (`{name, type, content, encoding: "base64"}`, the kit in a folder named <handle>; nothing is written to the site): its collections and published entries (drafts with `drafts`), templates and components, global sets, menus, design (tokens, fonts, scripts, styles, libraries), the media something names and the settings a kit carries; never accounts, tokens, secrets, submissions, analytics, the audit log or licences. {"handle": "studio", "name": "Studio"}. kits/apply takes it into another site, and `php cms kit:export <folder>` writes one anywhere. An existing kit of that handle is refused unless `replace`.',
            'permission' => 'settings.manage',
            'input' => ['type' => 'object', 'properties' => [...$about, 'replace' => ['type' => 'boolean'], 'drafts' => ['type' => 'boolean', 'description' => 'Take drafts along too: without it only published entries go.'], 'zip' => ['type' => 'boolean', 'description' => 'Answer with the kit as a zip file instead of putting it in kits/.']], 'required' => ['handle', 'name']],
            'output' => Shape::of(['kit' => self::kit(), 'path?' => Shape::STRING, 'files' => Shape::INTEGER, 'bytes' => Shape::INTEGER, 'name?' => Shape::STRING, 'type?' => Shape::STRING, 'content?' => Shape::STRING, 'encoding?' => Shape::STRING]),
            'dryRun' => static function (array $in) use ($kits, $exporter, $pick): array {
                if (! empty($in['zip'])) {
                    return array_map(static fn (string $path) => ['action' => 'create', 'type' => 'file', 'path' => $in['handle'].'.zip/'.$in['handle'].'/'.$path], array_keys($exporter()->files($pick($in), (bool) ($in['drafts'] ?? false))));
                }

                $folder = $kits()->path((string) $in['handle']);
                $kit = $kits()->find((string) $in['handle']);

                if ($kit?->source === 'builtin' || (is_dir($folder) && empty($in['replace']))) {
                    throw AbilityException::conflict(__('There is a kit “:handle” already. Choose another handle, or replace it.', ['handle' => (string) $in['handle']]));
                }

                return array_map(static fn (string $path) => ['action' => is_file($folder.'/'.$path) ? 'replace' : 'create', 'type' => 'file', 'path' => 'kits/'.$in['handle'].'/'.$path], array_keys($exporter()->files($pick($in), (bool) ($in['drafts'] ?? false))));
            },
            'handler' => static function (array $in) use ($kits, $exporter, $pick, $describe): array {
                // To take away: made beside the site's own files, zipped, and gone again.
                if (! empty($in['zip'])) {
                    $stage = storage_path('app/kit-export-'.bin2hex(random_bytes(4)));

                    try {
                        $result = $exporter()->export($stage.'/'.$in['handle'], $pick($in), drafts: (bool) ($in['drafts'] ?? false));
                        $zip = new \ZipArchive;
                        $file = $stage.'/'.$in['handle'].'.zip';
                        $zip->open($file, \ZipArchive::CREATE);

                        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($stage.'/'.$in['handle'], \FilesystemIterator::SKIP_DOTS)) as $item) {
                            $zip->addFile($item->getPathname(), $in['handle'].'/'.substr($item->getPathname(), strlen($stage.'/'.$in['handle']) + 1));
                        }

                        $zip->close();

                        return ['kit' => $describe($result['kit']), 'files' => $result['files'], 'bytes' => $result['bytes'], 'name' => $in['handle'].'.zip', 'type' => 'application/zip', 'content' => base64_encode((string) file_get_contents($file)), 'encoding' => 'base64'];
                    } finally {
                        \Cms\Support\Files::deleteDirectory($stage);
                    }
                }

                if ($kits()->find((string) $in['handle'])?->source === 'builtin') {
                    throw AbilityException::conflict(__('There is a kit “:handle” already. Choose another handle, or replace it.', ['handle' => (string) $in['handle']]));
                }

                $folder = $kits()->path((string) $in['handle']);

                if (is_dir($folder) && empty($in['replace'])) {
                    throw AbilityException::conflict(__('There is a kit “:handle” already. Choose another handle, or replace it.', ['handle' => (string) $in['handle']]));
                }

                $result = $exporter()->export($folder, $pick($in), replace: true, drafts: (bool) ($in['drafts'] ?? false));
                $kits()->flush();

                return ['kit' => $describe($result['kit']), 'path' => 'kits/'.$in['handle'], 'files' => $result['files'], 'bytes' => $result['bytes']];
            },
        ]);
    }
}

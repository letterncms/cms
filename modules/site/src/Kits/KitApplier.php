<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Kits;

use Carbon\CarbonImmutable;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Cms;
use Cms\Content\Collections\Collection;
use Cms\Content\Entries\Entry;
use Cms\Content\Entries\FileDriver;
use Cms\Content\Globals\GlobalSet;
use Cms\Modules\Media\MediaItem;
use Cms\Modules\Collections\CollectionAbilities;
use Cms\Modules\Media\MediaManifest;
use Cms\Modules\Navigation\Menus;
use Cms\Modules\Site\Design\Code;
use Cms\Modules\Site\Design\Design;
use Cms\Modules\Site\Design\DesignJson;
use Cms\Modules\Site\Design\Vendor;
use Cms\Support\Files;
use Cms\Support\Yaml;
use Cms\Users\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Throwable;

/**
 * Copies a kit into this site, once. `design` brings what a site looks like: tokens, fonts, templates,
 * components, scripts, styles and libraries. `full` adds what it holds: collections, entries, globals,
 * menus, media, languages and the settings a kit may carry.
 *
 * Nothing the site has is changed without being asked for. plan() names every step, and what already
 * exists under the same name is a clash: the apply refuses while there is one, unless it is told to
 * `skip` (the site's stays), `replace` (the kit's takes its place, after a snapshot) or `rename` (the
 * kit's entry comes in beside it under a new slug; what has no second name stays the site's).
 * Entries go through the entry service like any others, under new ids, and everything that names one
 * (a relation, a parent, a translation, a menu item, a link) follows.
 */
final class KitApplier
{
    public const array MODES = ['design', 'full'];

    public const array CLASHES = ['refuse', 'skip', 'replace', 'rename'];

    /** Collections that are part of the design: their entries come with `design`. */
    private const array DESIGN = ['templates', 'components'];

    /** Block types that name a component by its slug. */
    private const array COMPONENT_BLOCKS = ['pattern', 'component'];

    public function __construct(
        private readonly Cms $cms,
        private readonly KitFiles $files,
        private readonly FileDriver $driver,
        private readonly Design $design,
        private readonly Code $code,
        private readonly Vendor $vendor,
    ) {}

    /** @return list<string> the plugins a kit needs that are not running here */
    public function missingPlugins(Kit $kit): array
    {
        return array_values(array_diff($kit->plugins(), array_keys($this->cms->packages()->active())));
    }

    /** Whether the kit brings scripts, styles or libraries: who applies it then needs site.code. */
    public function carriesCode(Kit $kit): bool
    {
        try {
            return $this->files->read($kit)['code'];
        } catch (AbilityException) {
            return false;
        }
    }

    /**
     * Every step applying the kit would take, in the order it takes them: what would be created, replaced,
     * renamed or left alone, and what stands in the way (`clash`).
     *
     * @return array{kit: Kit, mode: string, clash: string, steps: list<array>, code: bool, plugins: list<string>}
     */
    public function plan(Kit $kit, string $mode = 'full', string $clash = 'refuse'): array
    {
        if (! in_array($mode, self::MODES, true) || ! in_array($clash, self::CLASHES, true)) {
            throw AbilityException::invalid(__('A kit is applied in the mode design or full, and a clash is met with refuse, skip, replace or rename.'));
        }

        if (! $kit->suits(Cms::VERSION)) {
            throw AbilityException::invalid(__('The kit “:name” needs :brand :versions, and this is :version.', ['name' => $kit->handle, 'versions' => (string) $kit->cms(), 'version' => Cms::VERSION]));
        }

        $contents = $this->files->read($kit);
        $run = ['kit' => $kit, 'mode' => $mode, 'clash' => $clash, 'full' => $mode === 'full', 'contents' => $contents, 'steps' => [], 'ids' => [], 'renamed' => ['templates' => [], 'components' => []], 'collections' => [], 'locales' => $this->cms->locales()];

        $run['full'] && $this->planLanguages($run);
        $this->planMedia($run);
        $this->planDesign($run);
        $run['full'] && $this->planCollections($run);
        $this->planEntries($run);

        if ($run['full']) {
            $this->planGlobals($run);
            $this->planMenus($run);
            $this->planSettings($run);
            $this->planOther($run);
        }

        return ['kit' => $kit, 'mode' => $mode, 'clash' => $clash, 'steps' => $run['steps'], 'code' => $this->bringsCode($run['steps']), 'plugins' => $this->missingPlugins($kit), 'run' => $run];
    }

    /** The steps as an ability or a command reports them: without what only the apply needs. */
    public static function report(array $steps): array
    {
        return array_map(static fn (array $step) => array_filter([
            'action' => $step['action'], 'type' => $step['type'], 'name' => $step['name'], 'path' => $step['path'] ?? null, 'as' => $step['as'] ?? null, 'note' => $step['note'] ?? null,
        ], static fn ($v) => $v !== null), $steps);
    }

    /**
     * Apply the kit, or with `$dry` do everything short of writing: the same refusals, the entries through the
     * entry service's own dry run, and the steps it would take.
     *
     * @param  bool  $check  run that dry run before the real one too, so an entry the site refuses leaves every file as it was
     * @return array{kit: string, mode: string, steps: list<array>, backup: ?string}
     */
    public function apply(Kit $kit, string $mode = 'full', string $clash = 'refuse', ?User $user = null, bool $dry = false, bool $withoutPlugins = false, bool $check = true): array
    {
        // What the kit writes, it writes as whoever applies it: the abilities behind each kind of thing ask for theirs.
        $context = $user !== null ? AbilityContext::forUser($user, 'kit') : AbilityContext::system('kit');
        $plan = $this->plan($kit, $mode, $clash);
        $this->mayWrite($plan['steps'], $context);
        $clashes = array_values(array_filter($plan['steps'], static fn (array $step) => $step['action'] === 'clash'));

        if ($plan['plugins'] !== [] && ! $withoutPlugins) {
            throw new AbilityException(__('The kit “:name” needs plugins this site doesn’t run: :plugins. Add them first, or apply it without them.', ['name' => $kit->handle, 'plugins' => implode(', ', $plan['plugins'])]), 'conflict', ['plugins' => $plan['plugins']]);
        }

        if ($clashes !== []) {
            throw new AbilityException(
                trans_choice('{1}The site already has :count thing this kit brings. Choose what happens to it: skip, replace or rename.|[2,*]The site already has :count things this kit brings. Choose what happens to them: skip, replace or rename.', count($clashes), ['count' => count($clashes)]),
                'conflict',
                ['clashes' => array_map(static fn (array $step) => $step['type'].' '.$step['name'], $clashes)],
            );
        }

        $run = $plan['run'];
        $entries = $this->cms->entryService();
        $staged = array_map(static fn (array $c) => $c['collection'], array_filter($run['collections'], static fn (array $c) => $c['staged']));

        // Collections the apply would make are there for the entries to be checked against, in memory only. The
        // real apply runs this first too: an entry the site would refuse stops it before a single file is copied.
        // A new site's first kit leaves it out (`check`): there is nothing of the site's to keep whole yet.
        ($dry || $check) && $this->cms->collections()->staged($staged, fn () => $entries->dry(fn () => $this->writeEntries($run, $user)));

        if ($dry) {
            return ['kit' => $kit->handle, 'mode' => $mode, 'steps' => self::report($plan['steps']), 'backup' => null];
        }

        $backup = array_filter($plan['steps'], static fn (array $step) => $step['action'] === 'replace') !== [] ? $this->snapshot($kit) : null;
        // Everything a kit writes outside the database, as it was: put back whole if anything fails on the way.
        $journal = $this->journal($run);

        try {
            // The database's part is one transaction; the settings go last, once everything else stands.
            $entries->write(function () use ($run, $user, $context): void {
                $this->writeLanguages($run, $context);
                $this->writeMedia($run);
                $this->writeDesign($run);
                $this->writeCollections($run, $context);
                $this->writeEntries($run, $user);
                $this->writeGlobals($run);
                $this->writeMenus($run);
                $this->writeOther($run);
                $this->writeSettings($run);
            });
        } catch (Throwable $e) {
            $this->rollback($journal);

            throw $e;
        } finally {
            Files::deleteDirectory($journal['dir']);
        }

        $this->cms->collections()->flush();
        $this->cms->entries()->flush();
        $this->code->flush();
        $this->design->saved();
        $this->cms->hooks()->dispatch('kit.applied', $kit, $mode, $user);

        return ['kit' => $kit->handle, 'mode' => $mode, 'steps' => self::report($plan['steps']), 'backup' => $backup];
    }

    // Planning: one step per thing the kit carries.

    private function planLanguages(array &$run): void
    {
        foreach ($run['kit']->languages() as $code) {
            if (in_array($code, $run['locales'], true)) {
                continue;
            }

            if ($this->cms->abilities()->has('languages/create')) {
                $run['steps'][] = ['action' => 'create', 'type' => 'language', 'name' => $code];
                $run['locales'][] = $code;
            } else {
                $run['steps'][] = ['action' => 'skip', 'type' => 'language', 'name' => $code, 'note' => __('This site has one language.')];
            }
        }
    }

    private function planMedia(array &$run): void
    {
        $kit = $run['kit'];
        $records = [];

        foreach ($run['contents']['media'] as $id => $path) {
            $records[$id] = $this->files->yaml($kit, $path);
        }

        if (! $run['full']) {
            // The design's own pictures come with it: what its templates, components, tokens and styles name.
            $used = $this->mediaNamedBy($kit, $run['contents'], array_keys($records), array_column($records, 'path', 'id'));
            $records = array_intersect_key($records, array_flip($used));
        }

        foreach ($records as $id => $record) {
            $item = MediaItem::query()->find($id);
            $file = public_path((string) $record['path']);
            $hash = (string) hash_file('sha256', $kit->path.'/public/'.$record['path']);
            $same = $item !== null && $item->hash === $hash && $item->path === $record['path'];
            // The same id with another file, or another file already at that path.
            $taken = $item !== null || (is_file($file) && hash_file('sha256', $file) !== $hash);
            $run['steps'][] = $this->step($run, 'media', (string) $record['path'], $run['contents']['media'][$id], $taken, $same, ['id' => $id, 'record' => $record]);
        }
    }

    private function planDesign(array &$run): void
    {
        $kit = $run['kit'];
        $contents = $run['contents'];
        $differs = static fn (string $site, string $path) => is_file($site) && trim((string) file_get_contents($site)) !== '' ? hash_file('sha256', $site) !== hash_file('sha256', $kit->path.'/'.$path) : null;
        $file = function (string $type, string $name, string $path, string $site) use (&$run, $differs): void {
            $state = $differs($site, $path);
            $run['steps'][] = $this->step($run, $type, $name, $path, $state !== null, $state === false, ['target' => $site]);
        };

        if ($contents['tokens'] !== null) {
            DesignJson::fromArray($this->files->json($kit, $contents['tokens']));
            $file('tokens', 'tokens.json', $contents['tokens'], $this->design->path('tokens.json'));
        }

        foreach ($contents['fonts'] as $name => $path) {
            $file('font', $name, $path, $this->design->path('fonts/'.$name));
        }

        foreach ($contents['custom'] as $kind => $path) {
            $file('custom', 'custom.'.$kind, $path, $this->design->path('custom.'.$kind));
        }

        foreach (Code::KINDS as $kind => $ext) {
            foreach ($contents[$kind] as $name => $path) {
                $file(rtrim($kind, 's'), $kind.'/'.$name, $path, $this->design->path($kind.'/'.$name.'.'.$ext));
            }
        }

        $mine = $this->vendor->all();

        foreach ($contents['lock'] !== null ? Vendor::locked($this->files->json($kit, $contents['lock'])) : [] as $specifier => $entry) {
            $has = $mine[$specifier] ?? null;
            $run['steps'][] = $this->step($run, 'library', $specifier.'@'.$entry['version'], $contents['lock'], $has !== null, $has !== null && $has['files'] == $entry['files'], ['specifier' => $specifier, 'entry' => $entry]);
        }

        // Where code loads is a list: the kit's names are added to the site's, and nothing is taken away.
        if ($contents['load'] !== null) {
            $run['steps'][] = ['action' => is_file($this->design->path('code.json')) ? 'merge' : 'create', 'type' => 'load', 'name' => 'code.json', 'path' => $contents['load']];
        }
    }

    private function planCollections(array &$run): void
    {
        $stamps = ['published_at' => 1, 'updated_at' => 1];

        foreach ($run['contents']['collections'] as $handle => $path) {
            $definition = $this->files->yaml($run['kit'], $path);
            $file = content_path("collections/{$handle}.yaml");
            $exists = is_file($file);

            $theirs = $this->cms->collections()->find($handle);

            // A plugin's own collection (templates, components, a form's pages) is the plugin's: a kit brings its entries, never its definition.
            if (! empty($definition['system']) || ($theirs?->system ?? false) || ! in_array($definition['driver'] ?? 'files', ['files', 'database'], true)) {
                throw AbilityException::invalid(__('The kit’s collection “:handle” can’t be used: :problem', ['handle' => $handle, 'problem' => __('a kit brings no definition of a plugin’s collection, and keeps its entries in files or the database')]));
            }

            try {
                // What collections/save checks, before anything is written.
                $collection = CollectionAbilities::check($handle, array_diff_key($definition, $stamps));
                // The same definition, however each file happens to write it.
                $same = $exists && array_diff_key(Collection::fromArray($handle, Yaml::read($file))->toYaml(), $stamps) == array_diff_key($collection->toYaml(), $stamps);
                $collection->blueprint()->schema();

                foreach (array_keys($collection->blueprints()) as $name) {
                    $collection->blueprint($name)->schema();
                }
            } catch (Throwable $e) {
                throw AbilityException::invalid(__('The kit’s collection “:handle” can’t be used: :problem', ['handle' => $handle, 'problem' => $e->getMessage()]));
            }

            $step = $this->step($run, 'collection', $handle, $path, $exists, $same, ['definition' => array_diff_key($definition, $stamps)]);
            $run['steps'][] = $step;
            // The entries are checked against the definition the site will have once this is done.
            $brings = in_array($step['action'], ['create', 'replace'], true);
            $run['collections'][$handle] = ['collection' => $brings ? $collection : $this->cms->collections()->findOrFail($handle), 'staged' => $brings];
        }
    }

    private function planEntries(array &$run): void
    {
        $kit = $run['kit'];
        $languages = $kit->languages();
        $shift = $kit->exported() !== null ? (int) $kit->exported()->diffInSeconds(CarbonImmutable::now(), false) : 0;
        $planned = [];

        foreach ($run['contents']['entries'] as $handle => $paths) {
            if (! $run['full'] && ! in_array($handle, self::DESIGN, true)) {
                continue;
            }

            $collection = $run['collections'][$handle]['collection'] ?? $this->cms->collections()->find($handle);

            if ($collection === null) {
                $run['steps'][] = ['action' => 'skip', 'type' => 'entry', 'name' => $handle.'/*', 'path' => 'content/collections/'.$handle, 'note' => __('The site has no collection “:handle”, and the kit brings none.', ['handle' => $handle])];

                continue;
            }

            $existing = $this->existing($collection);
            $entries = $this->driver->read($collection, $kit->path.'/content/collections/'.$handle, $languages);
            // Parents before their children, and in the order the kit keeps them: by position, then in the
            // order they were made (an id is a ULID, made in time order), so entries alike in everything else
            // (posts of one moment) stand here as they stood there.
            uksort($entries, static fn (int|string $a, int|string $b) => [substr_count((string) $a, '/'), $entries[$a]->position, $entries[$a]->id] <=> [substr_count((string) $b, '/'), $entries[$b]->position, $entries[$b]->id]);

            foreach ($entries as $path => $entry) {
                $path = (string) $path;
                $file = 'content/collections/'.$handle.'/'.$path.'.md';
                $name = $handle.'/'.$path;

                if (! in_array($entry->locale, $run['locales'], true)) {
                    $run['steps'][] = ['action' => 'skip', 'type' => 'entry', 'name' => $name, 'path' => $file, 'note' => __('The language :locale is not enabled.', ['locale' => $entry->locale])];

                    continue;
                }

                $parent = $entry->parentId !== null ? ($planned[$entry->parentId] ?? null) : null;

                // Under a parent that was left out there is nowhere to go.
                if ($entry->parentId !== null && ($parent === null || $parent['action'] === 'skip' && $parent['id'] === null)) {
                    $run['steps'][] = ['action' => 'skip', 'type' => 'entry', 'name' => $name, 'path' => $file, 'note' => __('Its parent is not brought.')];

                    continue;
                }

                $under = $parent['key'] ?? $entry->locale.'|';
                $key = $under.'/'.$entry->slug;
                $found = $parent !== null && in_array($parent['action'], ['create', 'rename'], true) ? null : ($existing[$key] ?? null);
                $step = $this->step($run, 'entry', $name, $file, $found !== null, false, ['entry' => $entry, 'collection' => $handle, 'slug' => $entry->slug], renamable: true);

                if ($step['action'] === 'rename') {
                    for ($i = 2; isset($existing[$under.'/'.$entry->slug.'-'.$i]) || isset($planned['#'.$under.'/'.$entry->slug.'-'.$i]); $i++);
                    $step['slug'] = $step['as'] = $entry->slug.'-'.$i;
                    $key = $under.'/'.$step['slug'];
                    in_array($handle, self::DESIGN, true) && $run['renamed'][$handle][$entry->slug] = $step['slug'];
                }

                // What the site keeps stands in for the kit's wherever the kit's is named.
                $step['id'] = in_array($step['action'], ['create', 'rename'], true) ? strtolower((string) Str::ulid()) : $found?->id;
                $step['existing'] = $found;
                [$step['status'], $step['at'], $step['expiresAt'], $late] = $this->dates($entry, $shift);
                $late && $step['note'] = __('Its end date has passed: it comes in as a draft.');
                $run['ids'][$entry->id] = $step['id'];
                $planned[$entry->id] = ['action' => $step['action'], 'id' => $step['id'], 'key' => $key];
                $planned['#'.$key] = true;
                $run['steps'][] = $step;
            }
        }
    }

    private function planGlobals(array &$run): void
    {
        foreach ($run['contents']['globals'] as $handle => $path) {
            $raw = $this->files->yaml($run['kit'], $path);
            $mine = $this->cms->globals()->find($handle);
            $same = $mine !== null && [$mine->title, $mine->icon, $mine->fields, $mine->data, $mine->locales] == [(string) ($raw['title'] ?? ucfirst($handle)), (string) ($raw['icon'] ?? 'globe'), array_values((array) ($raw['fields'] ?? [])), (array) ($raw['data'] ?? []), (array) ($raw['locales'] ?? [])];

            try {
                GlobalSet::fromArray($handle, $raw)->blueprint()->schema();
            } catch (Throwable $e) {
                throw AbilityException::invalid(__('The kit’s global set “:handle” can’t be used: :problem', ['handle' => $handle, 'problem' => $e->getMessage()]));
            }

            $run['steps'][] = $this->step($run, 'global', $handle, $path, $mine !== null, $same, ['raw' => $raw]);
        }
    }

    private function planMenus(array &$run): void
    {
        foreach ($run['contents']['menus'] as $handle => $path) {
            $raw = $this->files->yaml($run['kit'], $path);

            try {
                // What saving the menu checks, but whether its entries exist yet: they are the kit's, made as it applies.
                app(Menus::class)->check(['title' => (string) ($raw['title'] ?? ''), 'maxDepth' => (int) ($raw['max_depth'] ?? 3), 'items' => (array) ($raw['items'] ?? [])]);
            } catch (Throwable $e) {
                throw AbilityException::invalid(__('The kit’s menu “:handle” can’t be used: :problem', ['handle' => $handle, 'problem' => $e->getMessage()]));
            }

            $run['steps'][] = $this->step($run, 'menu', $handle, $path, is_file(content_path("navigation/{$handle}.yaml")), false, ['raw' => $raw]);
        }
    }

    private function planSettings(array &$run): void
    {
        $carried = KitExporter::carried($this->cms);

        foreach ($run['contents']['config'] as $namespace => $path) {
            $stored = Yaml::read(site_path("config/{$namespace}.yaml"));

            foreach ($this->files->yaml($run['kit'], $path) as $key => $value) {
                $name = $namespace.'.'.$key;

                if (! in_array($key, $carried[$namespace] ?? [], true)) {
                    $run['steps'][] = ['action' => 'skip', 'type' => 'setting', 'name' => $name, 'path' => $path, 'note' => __('Not a setting a kit carries.')];

                    continue;
                }

                $set = array_key_exists($key, $stored) && $stored[$key] !== null && $stored[$key] !== [] && $stored[$key] !== '';
                $run['steps'][] = $this->step($run, 'setting', $name, $path, $set, $set && $stored[$key] == $value, ['namespace' => $namespace, 'key' => $key, 'value' => $value]);
            }
        }

        // The values as the settings page would save them: checked now, and refused by name before anything is written.
        $values = [];

        foreach ($run['steps'] as $step) {
            $step['type'] === 'setting' && in_array($step['action'], ['create', 'replace'], true) && $values[$step['namespace']][$step['key']] = $step['value'];
        }

        foreach ($values as $namespace => $set) {
            try {
                $this->cms->settingsRegistry()->prepare($namespace, $set);
            } catch (Throwable $e) {
                throw AbilityException::invalid(__('The kit’s settings of “:namespace” can’t be used: :problem', ['namespace' => $namespace, 'problem' => $e->getMessage()]));
            }
        }
    }

    private function planOther(array &$run): void
    {
        // Folders beside the content that a plugin keeps (forms, redirects): the plugin says so with this filter.
        $folders = (array) $this->cms->hooks()->filter('kits.content', []);

        foreach ($run['contents']['other'] as $folder => $paths) {
            foreach ($paths as $path) {
                $name = substr($path, strlen('content/'));

                if (! in_array($folder, $folders, true)) {
                    $run['steps'][] = ['action' => 'skip', 'type' => 'file', 'name' => $name, 'path' => $path, 'note' => __('Nothing on this site keeps content in :folder.', ['folder' => 'content/'.$folder])];

                    continue;
                }

                $site = content_path($name);
                $run['steps'][] = $this->step($run, 'file', $name, $path, is_file($site), is_file($site) && hash_file('sha256', $site) === hash_file('sha256', $run['kit']->path.'/'.$path), ['target' => $site]);
            }
        }
    }

    /** One step: created when the site has nothing by that name, left alone when it has the same, and otherwise what the clash option says. */
    private function step(array $run, string $type, string $name, string $path, bool $exists, bool $same, array $more = [], bool $renamable = false): array
    {
        [$action, $note] = match (true) {
            ! $exists => ['create', null],
            $same => ['skip', __('The site has the same.')],
            $run['clash'] === 'refuse' => ['clash', null],
            $run['clash'] === 'replace' => ['replace', null],
            $run['clash'] === 'rename' && $renamable => ['rename', null],
            default => ['skip', __('The site keeps its own.')],
        };

        return ['action' => $action, 'type' => $type, 'name' => $name, 'path' => $path, ...($note !== null ? ['note' => $note] : []), ...$more];
    }

    /** @return array<string, Entry> the collection's entries by where they are: "<locale>|/<parent slug>/<slug>" */
    private function existing(Collection $collection): array
    {
        $entries = [];

        foreach ($this->cms->entries()->query()->collection($collection->handle)->working()->ungated()->get() as $entry) {
            $entries[$entry->id] = $entry;
        }

        $out = [];

        foreach ($entries as $entry) {
            $slugs = [$entry->slug];

            for ($parent = $entry->parentId, $guard = 0; $parent !== null && isset($entries[$parent]) && $guard++ < 32; $parent = $entries[$parent]->parentId) {
                array_unshift($slugs, $entries[$parent]->slug);
            }

            $out[$entry->locale.'|/'.implode('/', $slugs)] = $entry;
        }

        return $out;
    }

    /**
     * When an entry is published and until when, here and now. A date after the kit was exported was in the
     * future then, and is as far in the future now; an end date that had passed makes a draft.
     *
     * @return array{0: string, 1: ?string, 2: ?string, 3: bool} status, publication date, end date, whether it ran out
     */
    private function dates(Entry $entry, int $shift): array
    {
        if ($entry->status !== 'published') {
            return ['draft', null, null, false];
        }

        $exported = $run = $shift !== 0 ? CarbonImmutable::now()->subSeconds($shift) : null;
        $move = static fn (?CarbonImmutable $date) => $date !== null && $exported !== null && $date->greaterThan($exported) ? $date->addSeconds($shift) : $date;
        $at = $move($entry->publishedAt);
        $expires = $move($entry->expiresAt);

        if ($expires !== null && (! $expires->isFuture() || ($at !== null && $expires->lessThanOrEqualTo($at)))) {
            return ['draft', null, null, true];
        }

        return ['published', $at?->toIso8601String(), $expires?->toIso8601String(), false];
    }

    /** @return list<string> ids of the kit's media that its design names, by id or by path */
    private function mediaNamedBy(Kit $kit, array $contents, array $ids, array $paths): array
    {
        $text = '';

        foreach (['tokens', 'load'] as $one) {
            $contents[$one] !== null && $text .= file_get_contents($kit->path.'/'.$contents[$one]);
        }

        foreach ([...$contents['custom'], ...$contents['styles'], ...$contents['scripts']] as $path) {
            $text .= file_get_contents($kit->path.'/'.$path);
        }

        foreach (self::DESIGN as $handle) {
            foreach ($contents['entries'][$handle] ?? [] as $path) {
                $text .= file_get_contents($kit->path.'/content/collections/'.$handle.'/'.$path);
            }
        }

        return array_values(array_filter($ids, static fn (string $id) => str_contains($text, $id) || str_contains($text, (string) ($paths[$id] ?? "\0"))));
    }

    private function bringsCode(array $steps): bool
    {
        return array_filter($steps, static fn (array $step) => in_array($step['type'], ['script', 'style', 'library', 'custom', 'load'], true) && $step['action'] !== 'skip') !== [];
    }

    // Writing: each step that is not skipped.

    private function doing(array $run, string ...$types): array
    {
        return array_filter($run['steps'], static fn (array $step) => in_array($step['type'], $types, true) && in_array($step['action'], ['create', 'replace', 'rename', 'merge'], true));
    }

    private function writeLanguages(array $run, AbilityContext $context): void
    {
        foreach ($this->doing($run, 'language') as $step) {
            $this->cms->abilities()->execute('languages/create', ['code' => $step['name']], $context);
        }
    }

    private function writeMedia(array $run): void
    {
        $steps = $this->doing($run, 'media');

        if ($steps === []) {
            return;
        }

        $manifest = app(MediaManifest::class);

        $manifest->locked(function () use ($steps, $run, $manifest): void {
            foreach ($steps as $step) {
                $record = $step['record'];
                Files::put(Files::within(public_path(), (string) $record['path']), (string) file_get_contents($run['kit']->path.'/public/'.$record['path']));
                // The record as the kit has it, without the dates of the site it came from.
                Yaml::write($manifest->dir().'/'.$step['id'].'.yaml', array_diff_key($record, ['created_at' => 1, 'updated_at' => 1]));
            }
        });

        $manifest->import();
    }

    private function writeDesign(array $run): void
    {
        $kit = $run['kit'];

        foreach ($this->doing($run, 'tokens', 'font', 'custom', 'script', 'style') as $step) {
            Files::put($step['target'], (string) file_get_contents($kit->path.'/'.$step['path']));
        }

        $libraries = [];

        foreach ($this->doing($run, 'library') as $step) {
            $libraries[$step['specifier']] = $step['entry'];
        }

        $libraries !== [] && $this->vendor->adopt($libraries, $kit->path.'/content/design/vendor');

        foreach ($this->doing($run, 'load') as $step) {
            $theirs = $this->files->json($kit, $step['path']);
            $mine = $this->code->config();
            $join = static fn (array $a, array $b): array => ['scripts' => array_values(array_unique([...($a['scripts'] ?? []), ...($b['scripts'] ?? [])])), 'styles' => array_values(array_unique([...($a['styles'] ?? []), ...($b['styles'] ?? [])]))];
            $merged = $join($mine, $theirs);

            foreach (['templates', 'components'] as $group) {
                $merged[$group] = $mine[$group];

                foreach ((array) ($theirs[$group] ?? []) as $handle => $code) {
                    // A template or component that came in under a new name loads its code under that name.
                    $handle = $run['renamed'][$group][$handle] ?? $handle;
                    $merged[$group][$handle] = $join($merged[$group][$handle] ?? [], (array) $code);
                }
            }

            $this->code->saveConfig($merged);
        }

        $this->code->flush();
    }

    private function writeCollections(array $run, AbilityContext $context): void
    {
        foreach ($this->doing($run, 'collection') as $step) {
            $definition = $step['definition'];

            if (isset($definition['template'], $run['renamed']['templates'][$definition['template']])) {
                $definition['template'] = $run['renamed']['templates'][$definition['template']];
            }

            // As collections/save takes any other: its checks, and the permission of whoever applies the kit.
            $this->cms->abilities()->execute('collections/save', ['handle' => $step['name'], 'definition' => $definition], $context);
        }

        $this->cms->collections()->flush();
        $this->cms->entries()->flush();
    }

    /** Entries the site lacks are created first, originals before their translations; then the ones that take another's place. */
    private function writeEntries(array $run, ?User $user): void
    {
        $steps = $this->doing($run, 'entry');
        $service = $this->cms->entryService();
        $translation = static fn (array $step) => $step['entry']->originId !== null;
        $order = [
            ...array_filter($steps, static fn (array $step) => $step['action'] !== 'replace' && ! $translation($step)),
            ...array_filter($steps, static fn (array $step) => $step['action'] !== 'replace' && $translation($step)),
            ...array_filter($steps, static fn (array $step) => $step['action'] === 'replace'),
        ];

        foreach ($order as $step) {
            /** @var Entry $entry */
            $entry = $step['entry'];
            $data = $this->remap($entry->data, $run);

            // A template or component offered for collections names only those the site has once this is done.
            if (in_array($step['collection'], self::DESIGN, true) && is_array($data['collections'] ?? null)) {
                $data['collections'] = array_values(array_filter($data['collections'], fn ($handle) => is_string($handle) && $this->cms->collections()->find($handle) !== null));
            }
            $published = $step['status'] === 'published';

            try {
                if ($step['action'] === 'replace') {
                    /** @var Entry $mine */
                    $mine = $step['existing'];
                    // What the site's entry holds and the kit's doesn't goes: the kit's takes its place whole.
                    $data = [...array_fill_keys(array_keys($mine->working()['data']), null), ...$data];
                    $service->update($mine->id, ['title' => $entry->title, 'data' => $data, ...($published && $step['expiresAt'] !== null ? ['expiresAt' => $step['expiresAt']] : [])], $user, publish: $published);

                    continue;
                }

                $service->createAs($step['id'], $step['collection'], array_filter([
                    'title' => $entry->title,
                    'slug' => $step['slug'],
                    'data' => $data,
                    'locale' => $entry->locale,
                    'blueprint' => $entry->blueprint,
                    'parentId' => $entry->parentId !== null ? $run['ids'][$entry->parentId] : null,
                    'originId' => $entry->originId !== null ? ($run['ids'][$entry->originId] ?? null) : null,
                    'position' => $entry->position > 0 ? $entry->position : null,
                    'status' => $step['status'],
                    'at' => $step['at'],
                    'expiresAt' => $step['expiresAt'],
                ], static fn ($v) => $v !== null), $user);
            } catch (AbilityException $e) {
                throw new AbilityException(__(':file of the kit can’t be brought in: :problem', ['file' => $step['path'], 'problem' => __($e->getMessage())]), $e->type, $e->details, $e);
            }
        }
    }

    private function writeGlobals(array $run): void
    {
        foreach ($this->doing($run, 'global') as $step) {
            $raw = $step['raw'];
            $raw['data'] = $this->remap((array) ($raw['data'] ?? []), $run);
            $raw['locales'] = array_intersect_key($this->remap((array) ($raw['locales'] ?? []), $run), array_flip($run['locales']));
            $set = GlobalSet::fromArray($step['name'], array_diff_key($raw, ['published_at' => 1, 'updated_at' => 1]));
            $this->cms->globals()->save($set);
            $this->cms->hooks()->dispatch('globals.saved', $set);
        }
    }

    private function writeMenus(array $run): void
    {
        $menus = app(Menus::class);

        foreach ($this->doing($run, 'menu') as $step) {
            $raw = $step['raw'];
            $items = $this->remap((array) ($raw['items'] ?? []), $run);
            $known = array_keys($menus->entriesById($items));
            // A link to an entry that was not brought (its language is off, its collection missing) has nowhere to go.
            $keep = static function (array $items) use (&$keep, $known): array {
                $out = [];

                foreach ($items as $item) {
                    if (is_array($item) && (empty($item['entry']) || in_array(strtolower((string) $item['entry']), $known, true))) {
                        $out[] = [...$item, 'newTab' => ! empty($item['new_tab']) || ! empty($item['newTab']), 'children' => $keep((array) ($item['children'] ?? []))];
                    }
                }

                return $out;
            };

            $menus->save($step['name'], ['title' => (string) ($raw['title'] ?? ''), 'maxDepth' => (int) ($raw['max_depth'] ?? 3), 'items' => $keep($items)]);
        }
    }

    private function writeSettings(array $run): void
    {
        $values = [];

        foreach ($this->doing($run, 'setting') as $step) {
            $values[$step['namespace']][$step['key']] = $this->remap(['v' => $step['value']], $run)['v'];
        }

        foreach ($values as $namespace => $set) {
            $this->cms->settingsRegistry()->save($namespace, $set);
        }
    }

    private function writeOther(array $run): void
    {
        foreach ($this->doing($run, 'file') as $step) {
            Files::put($step['target'], (string) file_get_contents($run['kit']->path.'/'.$step['path']));
        }
    }

    /**
     * Data as it is on this site: every id of a kit's entry, wherever it stands (a relation, a link, a block's
     * prop, a menu item), is the id that entry has here, and a block that shows a component, or an entry that
     * names a template, follows one that came in under a new name.
     */
    private function remap(array $data, array $run): array
    {
        $ids = array_filter($run['ids']);
        $renamed = $run['renamed'];

        $walk = static function (mixed $value, int|string|null $key = null) use (&$walk, $ids, $renamed): mixed {
            if (is_string($value)) {
                if ($key === 'template' && isset($renamed['templates'][$value])) {
                    return $renamed['templates'][$value];
                }

                return $ids === [] || strlen($value) < 26 ? $value : (string) preg_replace_callback('/(?<![0-9a-z])[0-9a-z]{26}(?![0-9a-z])/', static fn (array $m) => $ids[$m[0]] ?? $m[0], $value);
            }

            if (! is_array($value)) {
                return $value;
            }

            if (isset($value['type'], $value['props']['ref']) && in_array($value['type'], self::COMPONENT_BLOCKS, true) && is_string($value['props']['ref']) && isset($renamed['components'][$value['props']['ref']])) {
                $value['props']['ref'] = $renamed['components'][$value['props']['ref']];
            }

            foreach ($value as $k => $v) {
                $value[$k] = $walk($v, $k);
            }

            return $value;
        };

        return $walk($data);
    }

    /**
     * Whoever applies a kit may do what it does: each kind of thing it writes asks for the permission the
     * ability that writes it asks for (collections/save, entries of each collection, globals, menus, media,
     * languages). Refused before anything is written, naming what is missing.
     */
    private function mayWrite(array $steps, AbilityContext $context): void
    {
        $abilities = ['language' => 'languages/create', 'collection' => 'collections/save', 'global' => 'globals/save', 'menu' => 'navigation/create', 'media' => 'media/import'];
        $missing = [];

        foreach ($steps as $step) {
            if (! in_array($step['action'], ['create', 'replace', 'rename', 'merge'], true)) {
                continue;
            }

            $permission = isset($abilities[$step['type']]) ? $this->cms->abilities()->get($abilities[$step['type']])?->permission : null;
            $step['type'] === 'entry' && $permission = 'entries.'.$step['collection'].'.create';

            if (is_string($permission) && ! $context->can($permission)) {
                $missing[$permission] = true;
            }
        }

        if ($missing !== []) {
            throw AbilityException::forbidden(__('Applying this kit needs permissions you don’t have: :permissions.', ['permissions' => implode(', ', array_keys($missing))]));
        }
    }

    /**
     * What the apply is about to change outside the database, kept aside: content/ and config/ whole, and each
     * media file it writes as it is now (or that it isn't there).
     *
     * @return array{dir: string, media: array<string, bool>}
     */
    private function journal(array $run): array
    {
        $dir = storage_path('framework/kit-apply-'.bin2hex(random_bytes(6)));
        is_dir(content_path()) && Files::copyDirectory(content_path(), $dir.'/content');
        is_dir(site_path('config')) && Files::copyDirectory(site_path('config'), $dir.'/config');
        $media = [];

        foreach ($this->doing($run, 'media') as $step) {
            $path = (string) $step['record']['path'];
            $file = Files::within(public_path(), $path);
            $media[$path] = is_file($file);
            $media[$path] && Files::put($dir.'/public/'.$path, (string) file_get_contents($file));
        }

        return ['dir' => $dir, 'media' => $media];
    }

    /** The files as they were before the apply began: what it wrote is taken away, what it replaced comes back. */
    private function rollback(array $journal): void
    {
        foreach (['content' => content_path(), 'config' => site_path('config')] as $part => $target) {
            Files::deleteDirectory($target);
            is_dir($journal['dir'].'/'.$part) ? Files::copyDirectory($journal['dir'].'/'.$part, $target) : Files::ensureDir($target);
        }

        foreach ($journal['media'] as $path => $was) {
            $file = Files::within(public_path(), $path);
            $was ? Files::put($file, (string) file_get_contents($journal['dir'].'/public/'.$path)) : @unlink($file);
        }

        $this->cms->collections()->flush();
        $this->cms->entries()->flush();
        $this->code->flush();
        app(MediaManifest::class)->import();

        foreach (array_keys($this->cms->settingsRegistry()->schemas()) as $namespace) {
            $this->cms->settingsRegistry()->forget($namespace);
        }
    }

    /** What the site held before something of it was replaced: content, settings, media files and the rows of entries and media, in storage/backups. */
    private function snapshot(Kit $kit): string
    {
        $backup = storage_path('backups/kit-'.$kit->handle.'-'.gmdate('Ymd-His').'-'.bin2hex(random_bytes(3)));
        Files::copyDirectory(content_path(), $backup.'/content');
        Files::copyDirectory(site_path('config'), $backup.'/config');
        is_dir(public_path('media')) && Files::copyDirectory(public_path('media'), $backup.'/public/media');
        $database = [];

        foreach (['entries', 'revisions', 'media'] as $table) {
            if (Schema::hasTable($table)) {
                $database[$table] = DB::table($table)->get()->all();
            }
        }

        Files::put($backup.'/content-database.json', json_encode($database, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR));

        return $backup;
    }
}

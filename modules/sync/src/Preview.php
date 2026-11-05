<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

/**
 * What a sync would do, before it does anything: per group, how many rows and files change on
 * the receiving side, and anything that stands in the way, said in a way that tells you what
 * to do about it. The same comparison decides what the sync then moves.
 */
final class Preview
{
    /**
     * @return array{direction: string, from: array, to: array, problems: list<string>, notes: list<string>, groups: list<array<string, mixed>>, rewrite: list<array{0: string, 1: string}>, inventories: array{from: array, to: array}}
     */
    public static function make(Endpoint $source, Endpoint $dest, string $direction, array $extraRewrites = []): array
    {
        $from = $source->hello();
        $to = $dest->hello();
        $problems = self::problems($from, $to, $source, $dest, $direction);
        $notes = self::notes($from, $to, $source, $dest);

        if ($problems !== []) {
            return ['direction' => $direction, 'from' => self::side($from, $source), 'to' => self::side($to, $dest), 'problems' => $problems, 'notes' => $notes, 'groups' => [], 'rewrite' => [], 'inventories' => ['from' => [], 'to' => []]];
        }

        $fromInv = $source->inventory();
        $toInv = $dest->inventory();
        $rewrite = self::rewrites($from, $to, $extraRewrites);
        $groups = [];

        foreach ($fromInv['groups'] as $id => $group) {
            $theirs = $toInv['groups'][$id] ?? ['tables' => [], 'areas' => $group['areas']];
            $tables = [];
            $reason = null;

            foreach (array_values(array_unique([...$group['tables'], ...$theirs['tables']])) as $table) {
                $a = $fromInv['tables'][$table] ?? null;
                $b = $toInv['tables'][$table] ?? null;

                if ($a === null || $b === null) {
                    continue;
                }

                $reason ??= self::incompatible($table, $a['columns'], $b['columns'], $source->label(), $dest->label());
                $tables[] = ['table' => $table, 'from' => $a['rows'], 'to' => $b['rows'], 'bytes' => (int) ($a['size'] ?? 0) ?: $a['rows'] * 400];
            }

            $missing = array_values(array_diff($group['tables'], array_column($tables, 'table')));
            $files = ['add' => 0, 'change' => 0, 'remove' => 0, 'bytes' => 0];

            foreach ($group['areas'] as $area) {
                $diff = Areas::diff((array) ($fromInv['areas'][$area] ?? []), (array) ($toInv['areas'][$area] ?? []), $rewrite !== [], $area);
                $files = ['add' => $files['add'] + count($diff['add']), 'change' => $files['change'] + count($diff['change']), 'remove' => $files['remove'] + count($diff['remove']), 'bytes' => $files['bytes'] + $diff['bytes']];

                if (! ($to['writable'][$area] ?? true)) {
                    $reason ??= __(':site can’t write to its :folder folder. Check the folder’s permissions there.', ['site' => $dest->label(), 'folder' => $area === 'media' ? 'public/media' : ($area === 'config' ? 'config' : 'content')]);
                }
            }

            if ($tables === [] && $group['areas'] === []) {
                if ($missing !== [] && $group['tables'] !== []) {
                    $notes[] = __(':group stays as it is: :site doesn’t have it.', ['group' => $group['label'], 'site' => $dest->label()]);
                }

                continue;
            }

            $entry = [
                'id' => $id,
                'label' => $group['label'],
                'description' => $group['description'],
                'selected' => $reason === null && (bool) $group[$direction === 'push' ? 'push' : 'pull'],
                'available' => $reason === null,
                'reason' => $reason,
                'tables' => $tables,
                'areas' => $group['areas'],
                'files' => $group['areas'] === [] ? null : $files,
                'bytes' => array_sum(array_column($tables, 'bytes')) + $files['bytes'],
            ];

            if ($id === 'content') {
                $entry['collections'] = self::collections((array) ($fromInv['collections'] ?? []), (array) ($toInv['collections'] ?? []));
            }

            $groups[] = $entry;
        }

        return ['direction' => $direction, 'from' => self::side($from, $source), 'to' => self::side($to, $dest), 'problems' => [], 'notes' => $notes, 'groups' => $groups, 'rewrite' => $rewrite, 'inventories' => ['from' => $fromInv, 'to' => $toInv]];
    }

    /** The preview without the inventories, which are only for working out the plan. */
    public static function public(array $preview): array
    {
        unset($preview['inventories']);

        return $preview;
    }

    /** @return list<string> */
    private static function problems(array $from, array $to, Endpoint $source, Endpoint $dest, string $direction): array
    {
        $problems = [];
        $remote = $direction === 'pull' ? $from : $to;
        $remoteLabel = $direction === 'pull' ? $source->label() : $dest->label();

        if (($from['protocol'] ?? 0) !== ($to['protocol'] ?? 0)) {
            $problems[] = __('The two sites run different versions of Sync. Update it on both.');
        }

        if ($from['site_id'] === $to['site_id']) {
            $problems[] = $from['url'] === $to['url']
                ? __('That key belongs to this site. Paste the key of the other site.')
                : __(':site is a copy of this site’s folder and has its identity. Run php cms remote key --new there, then connect it again.', ['site' => $remoteLabel]);
        } elseif ($from['fingerprint'] === $to['fingerprint']) {
            $problems[] = __('Both sites use the same database: syncing one into the other would wipe it. Give each its own database.');
        }

        if (! ($remote['allow'][$direction] ?? false)) {
            $problems[] = $direction === 'pull'
                ? __(':site doesn’t allow pulls. Turn them on under Sync there.', ['site' => $remoteLabel])
                : __(':site doesn’t allow pushes. Turn them on under Sync there.', ['site' => $remoteLabel]);
        }

        if ($to['busy'] ?? null) {
            $problems[] = __(':site is busy with another sync. Try again when it’s done.', ['site' => $dest->label()]);
        }

        return $problems;
    }

    /** @return list<string> */
    private static function notes(array $from, array $to, Endpoint $source, Endpoint $dest): array
    {
        $notes = [];
        $names = ['mysql' => 'MySQL', 'mariadb' => 'MariaDB', 'sqlite' => 'SQLite', 'pgsql' => 'PostgreSQL'];

        if ($from['driver'] !== $to['driver']) {
            $notes[] = __(':from on :source, :to on :dest: rows are converted on the way.', ['from' => $names[$from['driver']] ?? $from['driver'], 'source' => $source->label(), 'to' => $names[$to['driver']] ?? $to['driver'], 'dest' => $dest->label()]);
        }

        $differ = [];

        foreach ($from['packages'] as $package => $version) {
            if (isset($to['packages'][$package]) && $to['packages'][$package] !== $version) {
                $differ[] = $package.' '.$version.' → '.$to['packages'][$package];
            }
        }

        if ($differ !== []) {
            $notes[] = __('Different versions: :list. What both understand moves; anything that doesn’t fit is named below.', ['list' => implode(', ', $differ)]);
        }

        return $notes;
    }

    /**
     * A column that can't land is a reason not to move the group: rows would lose data, or fail.
     * Usually one site runs a newer version; sometimes a database kept a column its code dropped.
     *
     * @param  array<string, array{nullable: bool, default: bool}>  $a
     * @param  array<string, array{nullable: bool, default: bool}>  $b
     */
    private static function incompatible(string $table, array $a, array $b, string $source, string $dest): ?string
    {
        $extra = array_diff(array_keys($a), array_keys($b));
        $missing = array_filter(array_diff_key($b, $a), static fn (array $c) => ! $c['nullable'] && ! $c['default']);
        [$column, $has, $lacks] = $extra !== [] ? [reset($extra), $source, $dest] : ($missing !== [] ? [array_key_first($missing), $dest, $source] : [null, '', '']);

        return $column === null ? null : __('The :table table has a :column column on :has but not on :lacks. Bring both sites to the same versions and run php cms sync on each, then sync.', ['table' => $table, 'column' => $column, 'has' => $has, 'lacks' => $lacks]);
    }

    /** @return list<array{handle: string, from: int, to: int}> */
    private static function collections(array $from, array $to): array
    {
        $out = [];

        foreach (array_unique([...array_keys($from), ...array_keys($to)]) as $handle) {
            $out[] = ['handle' => (string) $handle, 'from' => (int) ($from[$handle] ?? 0), 'to' => (int) ($to[$handle] ?? 0)];
        }

        usort($out, static fn (array $x, array $y) => strcmp($x['handle'], $y['handle']));

        return $out;
    }

    /** @return list<array{0: string, 1: string}> */
    private static function rewrites(array $from, array $to, array $extra): array
    {
        $pairs = [];

        if (rtrim($from['url'], '/') !== rtrim($to['url'], '/')) {
            $pairs[] = [$from['url'], $to['url']];
        }

        if ($from['root'] !== $to['root']) {
            $pairs[] = [$from['root'], $to['root']];
        }

        foreach ($extra as $pair) {
            if (is_array($pair) && trim((string) ($pair[0] ?? '')) !== '') {
                $pairs[] = [trim((string) $pair[0]), trim((string) ($pair[1] ?? ''))];
            }
        }

        return $pairs;
    }

    private static function side(array $hello, Endpoint $end): array
    {
        return ['label' => $end->label(), 'name' => $hello['name'], 'url' => $hello['url'], 'cms' => $hello['cms'], 'driver' => $hello['driver']];
    }
}

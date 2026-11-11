<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use Cms\Packages\PackageManifest;

/**
 * What can move, in the words people choose by: content, media, people, each plugin's data,
 * files and settings. A table no group claims and that no plugin declares is shown as another
 * application's, and only moves when someone ticks it. Some tables never move: they are how
 * this site runs, or hold its own keys and sessions.
 *
 * A plugin of anyone's can say what its tables are, in its composer.json:
 *
 *   "extra": { "cms": { "sync": {
 *     "keep": ["acme_tokens"],
 *     "groups": { "acme": { "label": "Bookings", "description": "…", "tables": ["acme_*"], "push": false } }
 *   } } }
 */
final class Catalog
{
    /** This site's own: how it runs, who is signed in, its keys and its queues. */
    private const array KEEP = [
        'migrations', 'packages', 'cache', 'cache_locks', 'sessions', 'password_reset_tokens', 'api_tokens', 'account_tokens',
        'oauth_*',
    ];

    /**
     * Pushing is for what a team makes; pulling brings everything, the way a developer wants
     * production on their machine. What visitors leave behind doesn't get pushed over by default.
     */
    private const array GROUPS = [
        'content' => ['label' => 'Content', 'description' => 'Entries in the database, with their history.', 'tables' => ['entries', 'revisions'], 'push' => true, 'pull' => true],
        'media' => ['label' => 'Media', 'description' => 'Uploaded files and their details.', 'tables' => ['media'], 'areas' => ['media', 'media-records'], 'push' => true, 'pull' => true],
        'people' => ['label' => 'People', 'description' => 'Accounts, their roles and what they have access to.', 'tables' => ['users', 'account_grants'], 'push' => false, 'pull' => true],
        'comments' => ['label' => 'Comments', 'description' => 'Comments and mentions in the admin.', 'tables' => ['comments', 'comment_mentions'], 'push' => false, 'pull' => true],
        'chats' => ['label' => 'Chats', 'description' => 'Each person’s threads in the workspace, with the assistant’s answers.', 'tables' => ['workspace_threads'], 'push' => false, 'pull' => true],
        'logs' => ['label' => 'Logs', 'description' => 'Sent email and the audit log.', 'tables' => ['email_log', 'audit_log'], 'push' => false, 'pull' => true],
        'files' => ['label' => 'Site Files', 'description' => 'Everything in content/: templates, components, collections kept in files, global sets, forms and menus.', 'areas' => ['content'], 'push' => false, 'pull' => false],
        'settings' => ['label' => 'Settings', 'description' => 'Everything in config/, except the plugins that are on and the license key. Secrets stay with each site.', 'areas' => ['config'], 'push' => false, 'pull' => false],
    ];

    /**
     * @param  list<string>  $tables
     * @return array{groups: array<string, array{label: string, description: string, tables: list<string>, areas: list<string>, push: bool, pull: bool}>, keep: list<string>}
     */
    public function classify(array $tables): array
    {
        [$keep, $definitions] = $this->definitions();
        $groups = [];
        $kept = [];

        foreach ($definitions as $id => $group) {
            $groups[$id] = ['label' => __($group['label']), 'description' => __($group['description'] ?? ''), 'tables' => [], 'areas' => array_values($group['areas'] ?? []), 'push' => (bool) ($group['push'] ?? false), 'pull' => (bool) ($group['pull'] ?? true)];
        }

        $groups['other'] = ['label' => __('Other Tables'), 'description' => __('Tables no plugin claims, such as another application’s in the same database.'), 'tables' => [], 'areas' => [], 'push' => false, 'pull' => false];

        foreach ($tables as $table) {
            if (self::matches($table, $keep)) {
                $kept[] = $table;

                continue;
            }

            $owner = 'other';

            foreach ($definitions as $id => $group) {
                if (self::matches($table, (array) ($group['tables'] ?? []))) {
                    $owner = $id;

                    break;
                }
            }

            $groups[$owner]['tables'][] = $table;
        }

        return ['groups' => $groups, 'keep' => $kept];
    }

    /** @param  list<string>  $patterns */
    public static function matches(string $table, array $patterns): bool
    {
        foreach ($patterns as $pattern) {
            if ($pattern === $table || (str_ends_with($pattern, '*') && str_starts_with($table, substr($pattern, 0, -1)))) {
                return true;
            }
        }

        return false;
    }

    /** @return array{0: list<string>, 1: array<string, array<string, mixed>>} */
    private function definitions(): array
    {
        $keep = self::KEEP;
        $groups = self::GROUPS;

        foreach (cms()->packages()->active() as $package) {
            /** @var PackageManifest $package */
            $sync = (array) ($package->extra['sync'] ?? []);
            array_push($keep, ...array_map('strval', (array) ($sync['keep'] ?? [])));

            foreach ((array) ($sync['groups'] ?? []) as $id => $group) {
                if (is_array($group) && preg_match('/^[a-z0-9-]+$/', (string) $id) === 1 && ! isset(self::GROUPS[$id])) {
                    $groups[$id] = ['label' => (string) ($group['label'] ?? $package->label), 'description' => (string) ($group['description'] ?? ''), 'tables' => array_map('strval', (array) ($group['tables'] ?? [])), 'push' => (bool) ($group['push'] ?? false), 'pull' => (bool) ($group['pull'] ?? true)];
                }
            }
        }

        // Each package's own tables by its name, when it says nothing: acme/bookings owns bookings_*.
        foreach (cms()->packages()->active() as $package) {
            $short = str_replace('-', '_', (string) substr(strrchr('/'.$package->name, '/') ?: '', 1));

            if ($short !== '' && ! isset($groups[$short]) && ! array_key_exists('groups', (array) ($package->extra['sync'] ?? []))) {
                $groups['pkg-'.$short] = ['label' => $package->label, 'description' => '', 'tables' => [$short.'_*'], 'push' => false, 'pull' => true];
            }
        }

        return [$keep, $groups];
    }
}

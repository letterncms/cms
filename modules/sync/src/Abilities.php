<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use Cms\Abilities\Ability;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Illuminate\Support\Carbon;
use InvalidArgumentException;
use RuntimeException;

/**
 * Everything the Sync screen does. Kept away from the assistant and MCP: replacing a site's
 * database is a person's decision, made looking at the preview.
 */
final class Abilities
{
    public function register(AbilityRegistry $a): void
    {
        $guard = static function (callable $fn) {
            try {
                return $fn();
            } catch (InvalidArgumentException|RuntimeException $e) {
                throw $e instanceof AbilityException ? $e : AbilityException::conflict($e->getMessage());
            }
        };
        $remote = ['type' => 'string', 'maxLength' => 40];
        $direction = ['type' => 'string', 'enum' => ['pull', 'push']];
        $id = ['type' => 'object', 'properties' => ['id' => ['type' => 'string', 'maxLength' => 26]], 'required' => ['id']];
        $pairs = ['type' => 'array', 'maxItems' => 20, 'items' => ['type' => 'array', 'maxItems' => 2, 'items' => ['type' => 'string', 'maxLength' => 500]]];
        $base = ['permission' => 'sync.manage', 'expose' => Ability::ADMIN_ONLY];

        $a->register('sync/overview', [...$base,
            'label' => 'Sync Overview',
            'description' => 'This site’s connection key, the sites it is connected to, a sync that is going on, and what came in lately.',
            'annotations' => ['readOnly' => true],
            'handler' => static function () {
                $remotes = app(Remotes::class)->all();

                return [
                    'site' => self::site(),
                    'remotes' => $remotes,
                    'current' => app(Transfer::class)->current(),
                    'busy' => app(Receiver::class)->busy(),
                    'history' => array_map(static fn (array $s) => self::synced($s, $remotes), array_slice(app(Receiver::class)->history(), 0, 10)),
                ];
            },
        ]);

        $a->register('sync/connect', [...$base,
            'label' => 'Connect a Site',
            'description' => 'Connects another site by its connection key, after checking it answers.',
            'input' => ['type' => 'object', 'properties' => ['key' => ['type' => 'string', 'maxLength' => 600], 'name' => ['type' => 'string', 'maxLength' => 40], 'url' => ['type' => 'string', 'maxLength' => 500], 'other' => ['type' => 'boolean', 'description' => 'False: this server reaches it at the key’s own address, and url is left out.']], 'required' => ['key']],
            'handler' => static fn (array $in) => $guard(static fn () => app(Connections::class)->connect(self::key((string) $in['key']), isset($in['name']) && trim((string) $in['name']) !== '' ? trim((string) $in['name']) : null, isset($in['url']) && ($in['other'] ?? true) !== false && trim((string) $in['url']) !== '' ? trim((string) $in['url']) : null)['remote']),
        ]);

        $a->register('sync/disconnect', [...$base,
            'label' => 'Disconnect a Site',
            'description' => 'Forgets a connected site. The other site is not changed.',
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['name' => $remote], 'required' => ['name']],
            'handler' => static function (array $in) {
                app(Remotes::class)->remove((string) $in['name']);

                return ['ok' => true];
            },
        ]);

        $a->register('sync/allow', [...$base,
            'label' => 'Allow Pulls or Pushes',
            'description' => 'Whether sites with this site’s key may pull from it, or push to it.',
            'input' => ['type' => 'object', 'properties' => ['what' => $direction, 'on' => ['type' => 'boolean'], 'allow_pull' => ['type' => 'boolean'], 'allow_push' => ['type' => 'boolean']], 'description' => 'One of them by `what` and `on`, or both as allow_pull and allow_push.'],
            'handler' => static fn (array $in) => $guard(static function () use ($in) {
                $changes = isset($in['what']) ? [(string) $in['what'] => (bool) ($in['on'] ?? false)] : array_filter(['pull' => $in['allow_pull'] ?? null, 'push' => $in['allow_push'] ?? null], static fn ($v) => $v !== null);

                foreach ($changes as $what => $on) {
                    app(Site::class)->allow($what, (bool) $on);
                }

                return self::site();
            }),
        ]);

        $a->register('sync/renew-key', [...$base,
            'label' => 'New Connection Key',
            'description' => 'Replaces this site’s key. Sites connected with the old one stop reaching it until they get the new one.',
            'annotations' => ['destructive' => true],
            'handler' => static function () {
                app(Site::class)->renew();

                return ['key' => app(Site::class)->key()];
            },
        ]);

        $a->register('sync/preview', [...$base,
            'label' => 'Preview a Sync',
            'description' => 'What a pull or push would change on the receiving site, and anything in its way. Changes nothing.',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['remote' => $remote, 'direction' => $direction, 'rewrite' => $pairs], 'required' => ['remote', 'direction']],
            'handler' => static fn (array $in) => $guard(static function () use ($in) {
                [$source, $dest] = app(Connections::class)->ends((string) $in['remote'], (string) $in['direction']);

                return Preview::public(Preview::make($source, $dest, (string) $in['direction'], (array) ($in['rewrite'] ?? [])));
            }),
        ]);

        $a->register('sync/start', [...$base,
            'label' => 'Start a Sync',
            'description' => 'Starts a pull or push of the chosen groups. Then call sync/step until it is done.',
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => [
                'remote' => $remote, 'direction' => $direction,
                'groups' => ['type' => 'array', 'maxItems' => 50, 'items' => ['type' => 'string', 'maxLength' => 60]],
                'collections' => ['type' => ['array', 'null'], 'maxItems' => 500, 'items' => ['type' => 'string', 'maxLength' => 64]],
                'rewrite' => $pairs,
            ], 'required' => ['remote', 'direction', 'groups']],
            'handler' => static fn (array $in) => $guard(static fn () => app(Transfer::class)->start((string) $in['remote'], (string) $in['direction'], $in)),
        ]);

        $a->register('sync/step', [...$base,
            'label' => 'Continue a Sync',
            'description' => 'Does the next few seconds of a sync and says where it stands.',
            'input' => $id,
            'handler' => static fn (array $in) => $guard(static fn () => app(Transfer::class)->step((string) $in['id'], 2.5)),
        ]);

        $a->register('sync/resume', [...$base,
            'label' => 'Resume a Sync',
            'description' => 'Carries on with a sync that paused after the other site stopped answering.',
            'input' => $id,
            'handler' => static fn (array $in) => $guard(static fn () => app(Transfer::class)->resume((string) $in['id'])),
        ]);

        $a->register('sync/cancel', [...$base,
            'label' => 'Cancel a Sync',
            'description' => 'Stops a sync before it switches anything over. Neither site changes.',
            'input' => $id,
            'handler' => static fn (array $in) => $guard(static fn () => app(Transfer::class)->cancel((string) $in['id'])),
        ]);

        $a->register('sync/history', [...$base,
            'label' => 'Sync History',
            'description' => 'What came into this site, or into a connected one, and which of it can be undone.',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['remote' => $remote]],
            'handler' => static fn (array $in) => $guard(static fn () => isset($in['remote']) && $in['remote'] !== '' ? app(Connections::class)->remote((string) $in['remote'])->history() : array_map(static fn (array $s) => self::synced($s, app(Remotes::class)->all()), app(Receiver::class)->history())),
        ]);

        $a->register('sync/undo', [...$base,
            'label' => 'Undo a Sync',
            'description' => 'Puts back what a sync replaced, from its backup, on this site or a connected one. Call again until done.',
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string', 'maxLength' => 26], 'remote' => $remote], 'required' => ['id']],
            'handler' => static fn (array $in) => $guard(static function () use ($in) {
                if (! isset($in['remote']) || $in['remote'] === '') {
                    return app(Receiver::class)->undo((string) $in['id']);
                }

                $result = app(Connections::class)->remote((string) $in['remote'])->undo((string) $in['id']);
                $last = app(Remotes::class)->get((string) $in['remote'])['last'] ?? null;

                if ($result['done'] && is_array($last) && ($last['id'] ?? null) === $in['id']) {
                    app(Remotes::class)->touch((string) $in['remote'], [...$last, 'undone_at' => now()->toIso8601String()]);
                }

                return $result;
            }),
        ]);
    }

    /** A pasted key, checked for its shape before the other site is asked: what's wrong shows on the field. */
    private static function key(string $key): string
    {
        try {
            Key::parse($key);
        } catch (InvalidArgumentException $e) {
            throw AbilityException::invalid($e->getMessage(), ['key' => $e->getMessage()]);
        }

        return trim($key);
    }

    /** This site: its name and address, its key, and who may reach it. */
    private static function site(): array
    {
        $site = app(Site::class);
        $settings = $site->settings();

        return ['name' => $site->name(), 'url' => $site->url(), 'key' => $site->key(), 'allow_pull' => $settings['allow_pull'], 'allow_push' => $settings['allow_push']];
    }

    /** A sync this site received, as the list reads it: from where (named as this site calls it), when, and how much. */
    private static function synced(array $s, array $remotes): array
    {
        $host = static fn (?string $url) => strtolower(rtrim((string) preg_replace('#^https?://#', '', (string) $url), '/'));
        $site = '';

        foreach ($remotes as $r) {
            if ($host($r['url']) === $host($s['from']['url'] ?? null)) {
                $site = $r['label'];
            }
        }

        $site = $site ?: (string) ($s['from']['label'] ?? $s['from']['name'] ?? '');
        $at = Carbon::parse($s['at'])->locale((string) app('translator')->getLocale());
        $tables = count((array) ($s['tables'] ?? []));
        $files = (int) ($s['files'] ?? 0);

        return [...$s,
            'title' => ($s['direction'] ?? '') === 'pull' ? __('Pulled from :site', ['site' => $site]) : __(':site pushed to this site', ['site' => $site]),
            'summary' => implode(' · ', array_filter([
                $at->diffForHumans(),
                $tables ? trans_choice(__(':count table|:count tables'), $tables, ['count' => $tables]) : null,
                $files ? trans_choice(__(':count file|:count files'), $files, ['count' => $files]) : null,
            ])),
            'undone' => ! empty($s['undone_at']) ? 'undone' : null,
            'undoable' => empty($s['undone_at']) && ! empty($s['can_undo']),
        ];
    }
}

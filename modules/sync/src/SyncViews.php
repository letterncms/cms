<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use Cms\Users\User;
use Illuminate\Support\Carbon;

/**
 * Sync's place in the admin, as a view: the sites this one is connected to, each with its pull,
 * push and undo; this site's key and who may reach it; and what came in lately. A sync's
 * progress and the preview before one are components of their own.
 */
final class SyncViews
{
    public static function sync(User $user): array
    {
        $remotes = app(Remotes::class)->all();
        $current = app(Transfer::class)->current();
        // While a sync runs, nothing else starts: its progress is at the top, with its own way to stop.
        $running = $current !== null && in_array($current['status'] ?? null, ['running', 'waiting'], true);
        $history = app(Receiver::class)->history();
        $overview = ['ability' => 'sync/overview'];
        $connect = ['label' => __('Connect a Site'), 'icon' => 'plus', 'variant' => 'primary', 'name' => 'connect', 'ability' => 'sync/connect', 'success' => __('Connected to {result.label}.'),
            'input' => ['key' => '{values.key}', 'name' => '{values.name}', 'other' => '{values.other}', 'url' => '{values.url}'],
            'form' => ['title' => __('Connect a Site'), 'text' => __('On the other site, open Sync and copy its key. It starts with that site’s address.'), 'confirm' => __('Connect'), 'fields' => [
                ['handle' => 'key', 'type' => 'text', 'label' => __('Connection Key'), 'required' => true, 'placeholder' => 'https://example.com#…'],
                ['handle' => 'name', 'type' => 'text', 'label' => __('Name'), 'placeholder' => __('Production'), 'instructions' => __('Guessed from its address if empty.')],
                ['handle' => 'other', 'type' => 'toggle', 'label' => __('This Server Reaches It at Another Address')],
                ['handle' => 'url', 'type' => 'text', 'label' => __('Address'), 'placeholder' => 'http://host.docker.internal:8000', 'instructions' => __('Only for local setups, like Docker.'), 'if' => ['other' => true]],
            ]]];

        // With no site yet, the way to connect one is in the words that say so; after that, in the bar.
        return ['type' => 'ui/page', 'props' => ['title' => __('Sync'), 'icon' => 'sync', 'width' => 'narrow', 'actions' => $remotes === [] ? [] : [$connect]], 'children' => [
            ['type' => 'sync/progress'],
            ...($remotes === [] ? [['type' => 'ui/section', 'props' => ['title' => __('Sites')], 'children' => [
                ['type' => 'ui/empty', 'props' => ['icon' => 'sync', 'title' => __('No sites connected'), 'action' => $connect]],
            ]]] : array_map(static fn (array $r) => self::remote($r, $running), $remotes)),
            ['type' => 'ui/section', 'props' => ['title' => __('This Site’s Key'), 'actions' => [
                ['label' => __('Make a New Key'), 'icon' => 'refresh', 'variant' => 'ghost', 'ability' => 'sync/renew-key', 'success' => __('This site has a new key.'),
                    'confirm' => ['title' => __('Make a new key?'), 'text' => __('Sites connected with the current key can’t reach this one until they’re given the new key.'), 'confirm' => __('New Key'), 'danger' => true]],
            ]], 'children' => [['type' => 'ui/stack', 'children' => [
                ['type' => 'sync/key'],
                // Who may reach this site waits for the save bar, like every other setting.
                ['type' => 'ui/form', 'props' => [
                    'source' => $overview, 'valuesAt' => 'site',
                    'fields' => [
                        ['handle' => 'allow_pull', 'type' => 'toggle', 'label' => __('Allow Pull From Other Sites')],
                        ['handle' => 'allow_push', 'type' => 'toggle', 'label' => __('Allow Push From Other Sites')],
                    ],
                    'save' => ['ability' => 'sync/allow', 'as' => '*'],
                ]],
            ]]]],
            ...($history === [] ? [] : [['type' => 'ui/section', 'props' => ['title' => __('History')], 'children' => [
                ['type' => 'ui/records', 'props' => [
                    'id' => 'sync-history', 'label' => __('History'), 'source' => $overview, 'at' => 'history',
                    'columns' => [
                        ['key' => 'title', 'label' => __('Sync'), 'muted' => 'summary'],
                        ['key' => 'undone', 'label' => __('Status'), 'width' => '150px', 'align' => 'end', 'format' => 'badge', 'labels' => ['undone' => __('Undone')]],
                    ],
                    'actions' => [['label' => __('Undo'), 'icon' => 'undo', 'component' => 'sync/undo', 'props' => ['id' => '{row.id}'], 'when' => '{row.undoable}', ...($running ? ['disabled' => '1'] : [])]],
                ]],
            ]]]),
        ]];
    }

    /** A connected site: where it is and when it was last synced, and everything a connection can do, in view: what can't start while a sync runs shows so. */
    private static function remote(array $r, bool $running): array
    {
        $last = $r['last'] ?? null;
        $ago = $last ? Carbon::parse($last['at'])->locale((string) app('translator')->getLocale())->diffForHumans() : null;
        $when = match (true) {
            $last === null => null,
            ! empty($last['undone_at']) => __('last sync undone'),
            $last['direction'] === 'pull' => __('pulled :ago', ['ago' => $ago]),
            default => __('pushed :ago', ['ago' => $ago]),
        };
        $site = (string) $r['label'];
        $busy = $running ? ['disabled' => '1'] : [];

        // Letting go of the site is apart from what is done with it, by its name.
        return ['type' => 'ui/section', 'props' => ['title' => self::literal($site), 'actions' => [
            ['label' => __('Disconnect :site', ['site' => $site]), 'icon' => 'unlink', 'variant' => 'danger', 'ability' => 'sync/disconnect', 'input' => ['name' => $r['name']],
                'confirm' => ['title' => self::literal(__('Disconnect :site?', ['site' => $site])), 'text' => self::literal(__('This site forgets its key. Nothing changes on :site.', ['site' => $site])), 'confirm' => __('Disconnect'), 'danger' => true]],
        ]], 'children' => [['type' => 'ui/stack', 'children' => [
            ['type' => 'ui/text', 'props' => ['muted' => true, 'text' => self::literal(implode(' · ', array_filter([preg_replace('#^https?://#', '', (string) $r['url']), $when])))]],
            ['type' => 'ui/actions', 'props' => ['items' => [
                ['label' => __('Pull'), 'icon' => 'arrow-down', 'component' => 'sync/sync', 'props' => ['remote' => $r['name'], 'label' => $site, 'direction' => 'pull'], ...$busy],
                ['label' => __('Push'), 'icon' => 'arrow-up', 'component' => 'sync/sync', 'props' => ['remote' => $r['name'], 'label' => $site, 'direction' => 'push'], ...$busy],
                ...($last && $last['direction'] === 'push' && empty($last['undone_at']) ? [
                    ['label' => __('Undo Last Push'), 'icon' => 'undo', 'variant' => 'ghost', 'component' => 'sync/undo', 'props' => ['id' => $last['id'], 'remote' => $r['name'], 'site' => $site], ...$busy],
                ] : []),
            ]]],
        ]]]];
    }

    /** Words from a record, written as they are: a `{` in a site's name is no template. */
    private static function literal(string $text): string
    {
        return (string) preg_replace('/\{([^{}]*)\}/', '{{$1}}', $text);
    }
}

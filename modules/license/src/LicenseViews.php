<?php

declare(strict_types=1);

namespace Cms\Modules\License;

use Carbon\Carbon;
use Cms\Admin\Translations;
use Cms\Users\User;
use Throwable;

/** The Licenses tab of Plugins, beside the plugins it covers: each paid plugin's state, and the key. */
final class LicenseViews
{
    /** Plugins' view with the Licenses tab, for whoever may see it. */
    public static function withTab(array $view, User $user): array
    {
        if (! $user->hasPermission('license.view')) {
            return $view;
        }

        try {
            $keyed = app(LicenseService::class)->report()->token !== 'none';
        } catch (Throwable) {
            $keyed = false;
        }

        $view['children'][0]['children'][] = ['type' => 'ui/tab', 'props' => ['id' => 'licenses', 'label' => __('Licenses')], 'children' => [['type' => 'ui/stack', 'children' => [
            ['type' => 'ui/records', 'props' => [
                'id' => 'licenses', 'label' => __('Licenses'), 'key' => 'product',
                'source' => ['ability' => 'license/status'], 'at' => 'list',
                'columns' => [
                    ['key' => 'label', 'label' => __('Plugin'), 'format' => 'strong', 'width' => 'minmax(160px,0.6fr)'],
                    ['key' => 'state', 'label' => __('License'), 'format' => 'muted', 'width' => 'minmax(200px,1fr)'],
                    ['key' => 'standing', 'label' => __('Status'), 'format' => 'badge', 'width' => '140px', 'align' => 'end',
                        'labels' => ['active' => __('Active'), 'limited' => __('Limited'), 'attention' => __('Needs Attention')],
                        'tones' => ['active' => 'success', 'limited' => 'neutral', 'attention' => 'warning']],
                ],
                'empty' => ['icon' => 'key', 'title' => __('No paid plugins yet')],
            ]],
            ['type' => 'ui/stack', 'can' => 'license.manage', 'children' => [
                ['type' => 'ui/form', 'props' => [
                    'fields' => [['handle' => 'token', 'type' => 'text', 'label' => __('License Key'), 'placeholder' => 'v4.public.', 'mono' => true]],
                    'save' => ['ability' => 'license/install', 'as' => '*'], 'after' => 'manifest', 'width' => 'wide',
                ]],
                ...($keyed ? [['type' => 'ui/actions', 'props' => ['items' => [
                    ['label' => __('Remove Key'), 'icon' => 'trash', 'ability' => 'license/clear', 'success' => __('License key removed'), 'then' => 'manifest',
                        'confirm' => ['title' => __('Remove the license key?'), 'text' => __('The site keeps working.'), 'confirm' => __('Remove Key'), 'danger' => true]],
                ]]]] : []),
            ]],
        ]]]];

        return $view;
    }

    /**
     * The report's plugins as rows: each by its name, its state in words and how it stands.
     *
     * @param  array<string, array{label?: string, level: int, reason: string, upd: ?string, trm: ?string}>  $items
     * @return list<array{product: string, label: string, state: string, standing: string, level: int}>
     */
    public static function rows(array $items): array
    {
        app(Translations::class)->register();
        $day = static fn (string $date) => Carbon::parse($date.'T12:00:00Z')->locale(app()->getLocale())->isoFormat('ll');
        $rows = [];

        foreach ($items as $product => $item) {
            $rows[] = [
                'product' => (string) $product,
                'label' => $item['label'] ?? (string) $product,
                'state' => match (true) {
                    $item['reason'] !== 'ok' => self::reason($item['reason']),
                    ! empty($item['trm']) => __('Licensed until :date', ['date' => $day($item['trm'])]),
                    ! empty($item['upd']) => __('Licensed, updates until :date', ['date' => $day($item['upd'])]),
                    default => self::reason('ok'),
                },
                // It works, it works with less (updates ended), or something needs doing.
                'standing' => match ($item['level']) { 0 => 'active', 1 => 'limited', default => 'attention' },
                'level' => $item['level'],
            ];
        }

        return $rows;
    }

    /** One short state for each reason. Never reads as a threat: the site keeps working. */
    private static function reason(string $reason): string
    {
        return match ($reason) {
            'ok' => __('Licensed'),
            'nonpublic' => __('No license needed here'),
            'unlicensed' => __('No license'),
            'invalid' => __('Key not valid'),
            'wrong_family' => __('Test key'),
            'unknown_key' => __('Update :brand to check this key'),
            'key_revoked' => __('Key withdrawn'),
            'unverifiable' => __('This server can’t check keys'),
            'idn_unconvertible' => __('Use the xn-- form of the domain'),
            'domain_mismatch' => __('Not licensed for this domain'),
            'refunded' => __('Refunded'),
            'charged_back' => __('Charged back'),
            'revoked' => __('License revoked'),
            'term_ended' => __('Plan ended'),
            'major_not_covered' => __('This major version isn’t covered'),
            'window_over' => __('Updates ended'),
            default => $reason,
        };
    }
}

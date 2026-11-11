<?php

declare(strict_types=1);

namespace Cms\Modules\Account;

use Cms\Cms;
use Cms\Users\User;

/**
 * Each person's own account as data: their profile, how they sign in (Security), and the tokens that
 * reach the admin as them. Plugins add sections with `view.account` (letterncms/mcp: Agents).
 */
final class AccountViews
{
    public static function register(Cms $cms): void
    {
        $none = ['type' => 'object', 'properties' => (object) [], 'additionalProperties' => false];
        $admin = $cms->admin();
        $admin->component('account/profile', ['label' => 'Profile', 'description' => 'Your name, email, profile fields and language, saved from the bar.', 'surface' => false, 'props' => $none]);
        $admin->component('account/two-factor', ['label' => 'Set Up Two-Factor Authentication', 'description' => 'A QR code to scan, the code it shows, then the recovery codes.', 'surface' => false, 'props' => $none]);
        $admin->component('account/new-token', ['label' => 'New Token', 'description' => 'Create a personal API token and copy it once.', 'surface' => false, 'permission' => 'tokens.manage', 'props' => $none]);
        $admin->component('account/security', ['label' => 'Security', 'description' => 'Your password and two-factor sign-in, each with the one thing to do about it.', 'surface' => false, 'props' => $none]);

        $cms->views()->register('account', '/account', static fn (User $user) => self::view($user), private: true);
    }

    private static function view(User $user): array
    {
        return ['type' => 'ui/page', 'props' => ['title' => __('Account'), 'icon' => 'user', 'width' => 'narrow'], 'children' => [
            ['type' => 'ui/section', 'props' => ['title' => __('Profile')], 'children' => [['type' => 'account/profile']]],
            ['type' => 'ui/section', 'props' => ['title' => __('Security')], 'children' => [['type' => 'account/security']]],
            ['type' => 'ui/section', 'can' => 'tokens.manage', 'props' => ['title' => __('API Tokens'), 'actions' => [
                ['label' => __('New Token'), 'icon' => 'plus', 'component' => 'account/new-token'],
            ]], 'children' => [
                ['type' => 'ui/records', 'props' => [
                    'id' => 'tokens', 'label' => __('Tokens'), 'search' => false,
                    'source' => ['ability' => 'tokens/list'],
                    'columns' => [
                        ['key' => 'name', 'label' => __('Name'), 'format' => 'strong', 'width' => 'minmax(120px,1fr)'],
                        // What a token may do, by its scope. All four fit the narrow page.
                        ['key' => 'scopes', 'label' => __('Access'), 'width' => 'minmax(120px,1fr)', 'format' => 'badges', 'labels' => ['*' => __('Full Access'), 'read' => __('Read Only'), 'entries/*' => __('Content Only')]],
                        ['key' => 'lastUsedAt', 'label' => __('Last Used'), 'format' => 'ago', 'width' => '120px', 'empty' => __('Never used')],
                        ['key' => 'expiresAt', 'label' => __('Expires'), 'format' => 'date', 'width' => '110px', 'empty' => __('Never')],
                    ],
                    'actions' => [
                        ['label' => __('Revoke'), 'icon' => 'trash', 'variant' => 'danger', 'ability' => 'tokens/delete', 'input' => ['id' => '{row.id}'], 'success' => __('Token revoked'),
                            'confirm' => ['title' => __('Revoke “{row.name}”?'), 'text' => __('Anything using it stops working immediately.'), 'confirm' => __('Revoke'), 'danger' => true]],
                    ],
                    'empty' => ['size' => 'sm', 'title' => __('No tokens yet')],
                ]],
            ]],
        ]];
    }
}

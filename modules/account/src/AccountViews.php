<?php

declare(strict_types=1);

namespace Cms\Modules\Account;

use Cms\Cms;
use Cms\Users\User;

/**
 * Each person's own account as data: their profile, how they sign in, and what reaches the admin
 * as them (tokens, and what plugins put in the `account.api` slot). Plugins add with `view.account`.
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
        $admin->component('account/connect', ['label' => 'Connect', 'description' => 'What plugins show about connecting to the admin as you, such as the MCP server.', 'surface' => false, 'permission' => 'tokens.manage', 'props' => $none]);

        $cms->views()->register('account', '/account', static fn (User $user) => self::view($user), private: true);
    }

    private static function view(User $user): array
    {
        $on = $user->hasTwoFactor();

        return ['type' => 'ui/page', 'props' => ['title' => __('Account'), 'icon' => 'user', 'width' => 'narrow'], 'children' => [
            ['type' => 'ui/section', 'props' => ['title' => __('Profile')], 'children' => [['type' => 'account/profile']]],
            ['type' => 'ui/section', 'props' => ['title' => __('Security')], 'children' => [['type' => 'ui/stack', 'children' => [
                ['type' => 'ui/detail', 'props' => ['items' => [['label' => __('Two-Factor Authentication'), 'value' => $on ? __('On') : __('Off')]]]],
                ['type' => 'ui/actions', 'props' => ['items' => [
                ['label' => __('Change Password'), 'ability' => 'account/update', 'success' => __('Password changed'),
                    // Both always sent, empty or not, so an empty one is refused on its field rather than left out.
                    'form' => ['title' => __('Change Password'), 'confirm' => __('Change Password'), 'values' => ['currentPassword' => '', 'password' => ''], 'fields' => [
                        ['handle' => 'currentPassword', 'type' => 'text', 'label' => __('Current Password'), 'secret' => true, 'required' => true, 'autofocus' => true, 'autocomplete' => 'current-password'],
                        ['handle' => 'password', 'type' => 'text', 'label' => __('New Password'), 'secret' => true, 'required' => true, 'autocomplete' => 'new-password', 'instructions' => __('At least 10 characters, with letters and numbers.')],
                    ]]],
                $on
                    // Red, like what it takes away.
                    ? ['label' => __('Turn Off Two-Factor'), 'variant' => 'danger', 'ability' => 'account/two-factor-disable', 'success' => __('Two-factor authentication is off'), 'then' => 'manifest',
                        'form' => ['title' => __('Turn Off Two-Factor Authentication?'), 'confirm' => __('Turn Off'), 'values' => ['password' => ''], 'fields' => [
                            ['handle' => 'password', 'type' => 'text', 'label' => __('Your Password'), 'secret' => true, 'required' => true, 'autofocus' => true, 'autocomplete' => 'current-password'],
                        ]]]
                    : ['label' => __('Set Up Two-Factor'), 'component' => 'account/two-factor'],
                ]]],
            ]]]],
            ['type' => 'ui/section', 'can' => 'tokens.manage', 'props' => ['title' => __('API & Agents'), 'actions' => [
                ['label' => __('New Token'), 'icon' => 'plus', 'component' => 'account/new-token'],
            ]], 'children' => [
                ['type' => 'account/connect'],
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
                        ['label' => __('Revoke'), 'icon' => 'trash', 'variant' => 'danger', 'ability' => 'tokens/revoke', 'input' => ['id' => '{row.id}'], 'success' => __('Token revoked'),
                            'confirm' => ['title' => __('Revoke “{row.name}”?'), 'text' => __('Anything using it stops working immediately.'), 'confirm' => __('Revoke'), 'danger' => true]],
                    ],
                    'empty' => ['size' => 'sm', 'title' => __('No tokens yet')],
                ]],
            ]],
        ]];
    }
}

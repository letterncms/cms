<?php

declare(strict_types=1);

namespace Cms\Modules\Users;

use Cms\Cms;
use Cms\Users\User;

/**
 * Users as data: the team and the site's visitors and the fields every profile has, as the tabs
 * of one page, with the Visitor Accounts settings as its Settings tab (their `home`). A person opens in the dialog that edits them (`users/person`).
 */
final class UsersViews
{
    public static function register(Cms $cms): void
    {
        $admin = $cms->admin();
        $admin->component('users/person', ['label' => 'Person', 'description' => 'Edit or invite one person: roles, profile fields, access, suspend and remove.', 'surface' => false, 'props' => [
            'type' => 'object', 'additionalProperties' => false,
            'properties' => ['id' => ['type' => 'string', 'maxLength' => 64], 'user' => ['type' => 'object']],
        ]]);
        $admin->component('users/profile-fields', ['label' => 'Profile Fields', 'description' => 'The fields every profile has, in the fields editor.', 'surface' => false, 'permission' => 'collections.manage', 'props' => ['type' => 'object', 'properties' => (object) [], 'additionalProperties' => false]]);

        $views = $cms->views();
        $views->register('users', '/users', static fn (User $user) => self::page($cms), permission: 'users.view', private: true);
        // One person, or `new`: the page with their dialog open. Closing it leads back to the list.
        $views->register('users-person', '/users/:id', static fn (User $user, array $params) => self::page($cms, (string) ($params['id'] ?? '')), permission: 'users.view', private: true);
    }

    private static function page(Cms $cms, ?string $open = null): array
    {
        $person = ['type' => 'users/person', 'props' => ['id' => $open], 'can' => 'users.manage'];
        $invite = ['label' => __('Invite User'), 'icon' => 'user-plus', 'variant' => 'primary', 'component' => 'users/person', 'can' => 'users.manage'];

        // Nobody can sign up until the site allows it: the empty list offers that, to whoever may change it.
        $allow = $cms->accounts()->enabled() ? [] : ['action' => ['label' => __('Allow Visitor Accounts'), 'to' => '/users?tab=settings', 'can' => 'settings.manage']];

        return ['type' => 'ui/page', 'props' => ['title' => __('Users'), 'icon' => 'users'], 'children' => [
            ['type' => 'ui/tabs', 'children' => [
                ['type' => 'ui/tab', 'props' => ['id' => 'team', 'label' => __('Team'), 'actions' => [$invite]], 'children' => [self::people($cms, 'team', ['icon' => 'users', 'title' => __('No users yet')]), ...($open ? [$person] : [])]],
                ['type' => 'ui/tab', 'props' => ['id' => 'visitors', 'label' => __('Visitors')], 'children' => [self::people($cms, 'visitors', ['icon' => 'users', 'title' => __('No visitors yet'), ...$allow])]],
                ['type' => 'ui/tab', 'can' => 'collections.manage', 'props' => ['id' => 'fields', 'label' => __('Profile Fields')], 'children' => [['type' => 'users/profile-fields']]],
            ]],
        ]];
    }

    /** The team or the visitors: each with their roles (and whether they are suspended, a super admin, or sign in with two-factor) and last sign-in. */
    private static function people(Cms $cms, string $kind, array $empty): array
    {
        // Role names are written in English by default (Admin, Editor) and read in the person's language; custom ones show as typed.
        $roles = array_map(static fn (array $role) => (string) ($role['label'] ?? ''), $cms->roles()->all());
        $roles = array_combine(array_keys($roles), array_map(static fn (string $label, string $handle) => $label === '' ? $handle : __($label), $roles, array_keys($roles)));

        return ['type' => 'ui/records', 'props' => [
            'id' => 'users', 'label' => __('Users'),
            'source' => ['ability' => 'users/list', 'input' => ['kind' => $kind]],
            'search' => ['param' => 'search', 'placeholder' => __('Search People')],
            'paged' => ['perPage' => 100],
            'columns' => [
                ['key' => 'person', 'label' => __('Name'), 'format' => 'person', 'muted' => 'you'],
                ['key' => 'email', 'label' => __('Email'), 'width' => 'minmax(200px,1fr)'],
                // Two-factor is a badge among the roles when it is on, not a column of dashes: on a phone, every cell is read without its heading.
                ['key' => 'badges', 'label' => __('Roles'), 'width' => 'minmax(200px,1fr)', 'format' => 'badges', 'labels' => [...$roles, 'suspended' => __('Suspended'), 'super' => __('Super Admin'), 'twoFactor' => __('Two-Factor')], 'tones' => ['suspended' => 'danger', 'twoFactor' => 'success']],
                ['key' => 'lastLoginAt', 'label' => __('Last Sign-In'), 'width' => '140px', 'format' => 'ago', 'empty' => __('Never signed in')],
            ],
            'open' => ['label' => __('Edit User'), 'component' => 'users/person', 'props' => ['user' => '{row}'], 'can' => 'users.manage'],
            'empty' => $empty,
        ]];
    }
}

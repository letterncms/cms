<?php

declare(strict_types=1);

namespace Cms\Modules\Users;

use Cms\Content\Collections\Collection;
use Cms\Packages\Plugin;
use Cms\Users\Roles;

/**
 * Managing people: the Users screen, invitations, roles and profile fields, and who may read what.
 * Off, accounts and roles still work as config/roles.yaml and the CLI leave them.
 */
final class UsersModule extends Plugin
{
    public function boot(): void
    {
        $cms = $this->cms();

        $cms->permissions()->register('users.manage', 'Manage Users and Roles', 'Users');
        $this->app->make(UserAbilities::class)->register($cms->abilities());

        $cms->settingsRegistry()->register(Roles::SETTINGS, 'Roles', [
            // The page is titled Roles already; the editor needs no label of its own.
            ['handle' => 'roles', 'type' => 'json', 'label' => '', 'component' => 'roles', 'default' => Roles::DEFAULTS],
        ], icon: 'shield', permission: 'users.manage', order: 20, section: 'people');

        $cms->hooks()->addFilter('settings.saving', static fn (array $values, string $namespace) => $namespace === Roles::SETTINGS
            ? [...$values, 'roles' => Roles::normalize((array) ($values['roles'] ?? []))]
            : $values);

        $this->gating();

        $cms->admin()->nav('users', ['label' => 'Users', 'path' => '/users', 'icon' => 'users', 'section' => 'people', 'order' => 10, 'permission' => 'users.view']);
        // In a thread it asks right there (users/create without a password invites); in ⌘K it opens the form.
        $cms->admin()->command('new-user', ['label' => 'Invite User', 'icon' => 'user-plus', 'path' => '/users/new', 'ability' => 'users/create', 'permission' => 'users.manage']);
        UsersViews::register($cms);
        $cms->admin()->widget('users-team', ['label' => 'Team', 'description' => 'The people on this site, their roles and when they were last here.', 'icon' => 'users', 'column' => 'side', 'order' => 50, 'permission' => 'users.view']);
        $this->adminModule();
    }

    /**
     * Who may read what: a Who Can Read This group on every routable collection and in its
     * settings. The core enforces the rule (see EntryGate), so with this module off a gated
     * entry stays closed.
     */
    private function gating(): void
    {
        $cms = $this->cms();
        $hooks = $cms->hooks();

        if (! $cms->accounts()->enabled()) {
            return;
        }

        $fields = self::gateFields();

        $hooks->addFilter('collections', static function (array $collections) use ($fields) {
            foreach ($collections as $handle => $collection) {
                /** @var Collection $collection */
                if (! $collection->routable() || $collection->blueprint()->field('gate')) {
                    continue;
                }

                $definition = $collection->toYaml();
                $definition['fields'][] = ['handle' => 'gate', 'type' => 'group', 'label' => 'Who Can Read This', 'section' => 'sidebar', 'fields' => $fields];
                $collections[$handle] = Collection::fromArray($handle, $definition);
            }

            return $collections;
        });

        // The injected field stays out of what collections/save writes.
        $hooks->addFilter('ability.input', static function (array $input, $ability) {
            if ($ability->name === 'collections/save' && isset($input['definition']['fields'])) {
                $input['definition']['fields'] = array_values(array_filter($input['definition']['fields'], static fn ($f) => ($f['handle'] ?? null) !== 'gate' || ($f['section'] ?? null) !== 'sidebar'));
            }

            return $input;
        });

        $hooks->addFilter('collections.settings', static function (array $settings, ?Collection $collection = null) use ($fields) {
            return $collection?->system ? $settings : [...$settings, ['handle' => 'gate', 'type' => 'group', 'label' => 'Who Can Read This', 'instructions' => 'For every entry that does not say otherwise.', 'fields' => $fields]];
        });
    }

    private static function gateFields(): array
    {
        return [
            ['handle' => 'mode', 'type' => 'select', 'label' => 'Access', 'default' => 'inherit', 'options' => ['inherit' => 'Same as Above', 'public' => 'Everyone', 'teaser' => 'Everyone Reads the Start', 'locked' => 'Only People with Access']],
            ['handle' => 'access', 'type' => 'tags', 'label' => 'Who Has Access', 'instructions' => 'Roles or access names. Empty: any account.'],
            ['handle' => 'teaser_words', 'type' => 'number', 'label' => 'Words in the Teaser', 'min' => 0, 'placeholder' => '120'],
            ['handle' => 'teaser_fields', 'type' => 'tags', 'label' => 'Fields in the Teaser', 'instructions' => 'Field names everyone may see, like excerpt.'],
        ];
    }
}

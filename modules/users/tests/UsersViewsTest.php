<?php

declare(strict_types=1);

namespace Cms\Modules\Users\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Tests\TestCase;
use Cms\Users\User;

/** Users, Account, Globals and Collections are views: each resolves for who looks, with what they may do and nothing more. */
final class UsersViewsTest extends TestCase
{
    private function resolved(string $id, User $user, array $params = []): array
    {
        return $this->cms()->abilities()->execute('views/get', ['id' => $id, 'params' => $params], AbilityContext::forUser($user, 'admin'))['root'];
    }

    /** @return list<array> every node of a tree, depth first */
    private static function nodes(array $node): array
    {
        return [$node, ...array_merge([], ...array_map(self::nodes(...), $node['children'] ?? []))];
    }

    private static function types(array $root): array
    {
        return array_column(self::nodes($root), 'type');
    }

    public function test_users_has_its_tabs_and_a_person_opens_by_address(): void
    {
        $admin = $this->admin();
        $tabs = array_column(array_column(array_filter(self::nodes($this->resolved('users', $admin)), static fn ($n) => $n['type'] === 'ui/tab'), 'props'), 'id');
        $this->assertSame(['team', 'visitors', 'fields'], $tabs);
        $this->assertContains('users/person', self::types($this->resolved('users-person', $admin, ['id' => $admin->id])));
        $this->assertNotContains('users/person', self::types($this->resolved('users', $admin)));
        $this->assertSame('/users?tab=settings', $this->cms()->hooks()->filter('admin.nav', $this->cms()->admin()->navItems())['settings.accounts']['path'], 'Visitor Accounts are its Settings tab');
    }

    public function test_the_list_says_who_is_asking_and_what_stands_out(): void
    {
        $admin = $this->admin();
        $other = $this->userWithRole('editor');
        $other->forceFill(['status' => \Cms\Users\Accounts::SUSPENDED])->save();
        $items = array_column($this->cms()->abilities()->execute('users/list', ['kind' => 'all', 'perPage' => 100], AbilityContext::forUser($admin, 'admin'))['items'], null, 'id');

        $this->assertSame('You', $items[$admin->id]['you']);
        $this->assertSame(['super', 'admin'], $items[$admin->id]['badges']);
        $this->assertNull($items[$other->id]['you']);
        $this->assertSame(['suspended', 'editor'], $items[$other->id]['badges']);
        $this->assertSame($other->name, $items[$other->id]['person']['name']);

        $other->forceFill(['two_factor_secret' => 'JBSWY3DPEHPK3PXP', 'two_factor_confirmed_at' => now()])->save();
        $items = array_column($this->cms()->abilities()->execute('users/list', ['kind' => 'all', 'perPage' => 100], AbilityContext::forUser($admin, 'admin'))['items'], null, 'id');
        $this->assertSame(['suspended', 'editor', 'twoFactor'], $items[$other->id]['badges']);
    }

    public function test_account_offers_two_factor_set_up_or_off_as_it_stands(): void
    {
        $admin = $this->admin();
        $labels = static fn (array $root) => array_column(array_merge([], ...array_map(static fn ($n) => $n['props']['items'] ?? [], array_filter(self::nodes($root), static fn ($n) => $n['type'] === 'ui/actions'))), 'label');

        $this->assertContains('Set Up Two-Factor', $labels($this->resolved('account', $admin)));
        $admin->forceFill(['two_factor_secret' => 'JBSWY3DPEHPK3PXP', 'two_factor_confirmed_at' => now()])->save();
        $this->assertContains('Turn Off Two-Factor', $labels($this->resolved('account', $admin->refresh())));
        $this->assertContains('ui/records', self::types($this->resolved('account', $admin)));
    }

    public function test_globals_and_collections_are_views(): void
    {
        $admin = $this->admin();
        $ctx = AbilityContext::forUser($admin, 'admin');
        $set = $this->cms()->abilities()->execute('globals/save', ['title' => 'Opening Hours', 'fields' => [['handle' => 'text', 'type' => 'text', 'label' => 'Text']]], $ctx);
        $this->assertSame('opening_hours', $set['handle']);
        $this->assertSame(['text' => 'Mon–Fri'], array_intersect_key($this->cms()->abilities()->execute('globals/set', ['handle' => 'opening_hours', 'values' => ['text' => 'Mon–Fri']], $ctx), ['text' => true]));

        $this->assertSame('Opening Hours', $this->resolved('globals-set', $admin, ['handle' => 'opening_hours'])['props']['title']);
        $this->assertSame('globals/fields', $this->resolved('globals-fields', $admin, ['handle' => 'opening_hours'])['type']);
        $this->assertContains('ui/records', self::types($this->resolved('globals', $admin)));
        $this->assertContains('collections/new', self::types($this->resolved('collections-new', $admin)));

        foreach ($this->cms()->collections()->all() as $handle => $collection) {
            $this->assertSame($collection->system ? 'ui/page' : 'collections/blueprint', $this->resolved('collections-collection', $admin, ['handle' => $handle])['type']);
        }

        $this->assertSame([], array_filter($this->cms()->abilities()->execute('collections/editable', [], $ctx), fn ($c) => $this->cms()->collections()->find($c['handle'])->system));
    }
}

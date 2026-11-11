<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Admin\Manifest;
use Cms\Content\Collections\Collection;
use Cms\Support\Yaml;
use Cms\Tests\TestCase;

final class AdminTest extends TestCase
{
    public function test_the_sidebar_shows_every_item_from_the_start(): void
    {
        $sidebar = $this->cms()->navigation()->forUser($this->admin())['sidebar'];

        // Sections without items are left out; the settings sidebar is separate.
        $this->assertSame(['main', 'content', 'design'], array_column($sidebar['sections'], 'id'));
        $this->assertSame('', $sidebar['sections'][0]['label']);
        // Plugins sits with the home screens, Collections with how the site is built and looks.
        $this->assertContains('plugins', $sidebar['sections'][0]['items']);
        $this->assertSame(['collection.notes', 'collection.pages', 'collection.posts', 'media', 'navigation', 'globals'], $sidebar['sections'][1]['items']);
        $this->assertSame(['collections'], $sidebar['sections'][2]['items']);
        // Nothing is put away: More holds only what someone unpins.
        $this->assertSame([], $sidebar['hidden']);
        $this->assertFalse($sidebar['personal']);
    }

    public function test_a_collection_names_its_section_and_is_shown_there(): void
    {
        $this->cms()->collections()->save(Collection::fromArray('layouts', ['title' => 'Layouts', 'section' => 'shop', 'fields' => []]));
        $this->cms()->collections()->save(Collection::fromArray('parts', ['title' => 'Parts', 'section' => 'shop', 'system' => true, 'fields' => []]));
        $this->cms()->admin()->section('shop', 'Shop', 25);

        $sidebar = $this->cms()->navigation()->forUser($this->admin())['sidebar'];

        $this->assertSame(['main', 'content', 'design', 'shop'], array_column($sidebar['sections'], 'id'));
        $this->assertSame(['collection.layouts', 'collection.parts'], $sidebar['sections'][3]['items']);
        $this->assertSame([], $sidebar['hidden']);
    }

    public function test_collection_navigation_priority_is_explicit_and_saved_arrangements_still_win(): void
    {
        $admin = $this->admin();
        $pages = $this->cms()->collections()->findOrFail('pages')->toYaml();
        $this->cms()->collections()->save(Collection::fromArray('pages', [...$pages, 'title' => 'Z pages', 'nav_order' => 5]));
        $this->cms()->collections()->save(Collection::fromArray('journal', ['title' => 'A blog', 'nav_order' => 20, 'fields' => []]));
        $this->assertSame(20, $this->cms()->collections()->findOrFail('journal')->get('nav_order'));
        $ids = $this->section($admin, 'content')['items'];
        $this->assertLessThan(array_search('collection.journal', $ids, true), array_search('collection.pages', $ids, true));

        $this->pin($admin, ['sections' => [['id' => 'content', 'items' => ['collection.journal', 'collection.pages']]], 'hidden' => []]);
        $this->assertSame(['collection.journal', 'collection.pages'], array_slice($this->section($admin, 'content')['items'], 0, 2));
    }

    public function test_people_pin_their_own_sidebar_and_new_items_find_their_place(): void
    {
        $admin = $this->admin();
        $this->pin($admin, [
            'sections' => [
                ['id' => 'content', 'label' => 'Renamed', 'items' => ['globals', 'collection.pages', 'collection.notes']],
                ['id' => 'invented', 'label' => 'Mine', 'items' => ['collection.posts']],
            ],
            'hidden' => ['collection.pages'],
        ]);

        // A collection created later is pinned in its default section, after what is there.
        $this->cms()->collections()->save(Collection::fromArray('products', ['title' => 'Products', 'fields' => []]));
        $result = $this->cms()->navigation()->forUser($admin);

        // Sections are the registered ones: people pin and order items, they do not invent or rename sections.
        $this->assertSame(['main', 'content', 'design'], array_column($result['sidebar']['sections'], 'id'));
        $this->assertSame('Content', $result['sidebar']['sections'][1]['label']);
        $this->assertSame(['globals', 'collection.pages', 'collection.notes', 'collection.posts', 'collection.products', 'media', 'navigation'], $result['sidebar']['sections'][1]['items']);
        $this->assertSame(['collection.pages'], $result['sidebar']['hidden']);
        $this->assertTrue($result['sidebar']['personal']);
        // Under More, still in the list the command palette offers.
        $this->assertContains('collection.pages', array_column($result['nav'], 'id'));

        // Someone else still sees the site's sidebar.
        $other = $this->admin();
        $this->assertFalse($this->cms()->navigation()->forUser($other)['sidebar']['personal']);
    }

    public function test_the_site_default_applies_until_people_pin_their_own_and_after_they_reset(): void
    {
        $admin = $this->admin();
        $this->settle($admin, ['sections' => [['id' => 'content', 'items' => ['collection.posts', 'collection.pages', 'collection.notes']]], 'hidden' => ['collection.notes']]);
        $this->assertSame(['collection.posts', 'collection.pages', 'collection.notes', 'media', 'navigation', 'globals'], $this->section($admin, 'content')['items']);
        $this->assertSame(['collection.notes'], $this->cms()->navigation()->forUser($admin)['sidebar']['hidden']);

        $this->pin($admin, ['sections' => [['id' => 'content', 'items' => ['collection.pages']]], 'hidden' => []]);
        $this->assertSame('collection.pages', $this->section($admin, 'content')['items'][0]);

        $this->pin($admin, null);
        $this->assertSame('collection.posts', $this->section($admin, 'content')['items'][0]);
    }

    public function test_items_that_disappear_keep_their_place(): void
    {
        $admin = $this->admin();
        $this->settle($admin, ['sections' => [['id' => 'content', 'items' => ['collection.posts', 'collection.pages']]], 'hidden' => []]);

        $this->cms()->collections()->delete('posts');
        $this->cms()->collections()->flush();

        // Saved while posts was gone: the editor never saw it, but its place is kept.
        $this->settle($admin, ['sections' => [['id' => 'content', 'items' => ['collection.pages']]], 'hidden' => []]);
        $this->assertContains('collection.posts', $this->cms()->navigation()->saved()['sections'][0]['items']);

        $this->cms()->collections()->save(Collection::fromArray('posts', ['title' => 'Posts', 'fields' => []]));
        $this->assertSame(['collection.pages', 'collection.posts', 'collection.notes', 'media', 'navigation', 'globals'], $this->section($admin, 'content')['items']);
    }

    public function test_a_hand_edited_arrangement_is_read_forgivingly(): void
    {
        Yaml::write(site_path('config/admin.yaml'), ['sidebar' => ['sections' => [
            ['id' => 'content', 'items' => ['collection.pages', 'collection.pages', 42]],
            'not a section',
            ['id' => 'Bad Id!', 'items' => ['users']],
        ], 'hidden' => 'users']]);

        $content = $this->section($this->admin(), 'content');

        $this->assertSame('Content', $content['label']);
        $this->assertSame('collection.pages', $content['items'][0]);
    }

    public function test_the_core_names_the_sections_of_both_sidebars(): void
    {
        $this->cms()->admin()->nav('links', ['label' => 'Links', 'path' => '/links', 'section' => 'design']);
        $this->cms()->settingsRegistry()->register('shop', 'Shop', [['handle' => 'currency', 'type' => 'text', 'label' => 'Currency']]);
        $this->cms()->settingsRegistry()->register('newsletter', 'Newsletter', [['handle' => 'from', 'type' => 'text', 'label' => 'From']]);

        $result = $this->cms()->navigation()->forUser($this->admin());

        $this->assertSame(['collections', 'links'], array_column($result['sidebar']['sections'], 'items', 'id')['design']);
        // The unnamed group, People, then a settings page without a section of its own: a plugin's, under Plugins by name.
        $this->assertSame(['account', 'people', 'plugins'], array_column($result['settingsNav'], 'id'));
        $this->assertSame(['', 'People', 'Plugins'], array_column($result['settingsNav'], 'label'));
        $this->assertSame(['settings.newsletter', 'settings.shop'], array_column($result['settingsNav'], 'items', 'id')['plugins']);
    }

    public function test_a_group_of_one_in_settings_joins_the_unnamed_group(): void
    {
        $this->cms()->settingsRegistry()->register('shop', 'Shop', [['handle' => 'currency', 'type' => 'text', 'label' => 'Currency']]);

        $settings = array_column($this->cms()->navigation()->forUser($this->admin())['settingsNav'], null, 'id');

        $this->assertArrayNotHasKey('plugins', $settings);
        $this->assertSame(['account', 'settings.site', 'settings.media', 'settings.email', 'audit', 'sync', 'settings.shop'], $settings['account']['items']);
    }

    public function test_a_page_with_a_home_is_that_screens_settings_tab_and_listed_in_settings(): void
    {
        $this->cms()->admin()->nav('shop', ['label' => 'Shop', 'path' => '/shop', 'pinned' => true]);
        $this->cms()->settingsRegistry()->register('shop', 'Shop', [['handle' => 'currency', 'type' => 'text', 'label' => 'Currency']], home: 'shop');

        $result = $this->cms()->navigation()->forUser($this->admin());
        $nav = array_column($result['nav'], null, 'id');

        $this->assertSame('shop', $nav['settings.shop']['home']);
        $this->assertSame('/shop?tab=settings', $nav['settings.shop']['path']);
        // Found in settings with every other page, and never pinned on its own.
        $this->assertContains('settings.shop', array_merge(...array_column($result['settingsNav'], 'items')));
        $this->assertNotContains('settings.shop', array_merge(...array_column($result['sidebar']['sections'], 'items')));
        $this->assertSame('shop', array_column($this->app->make(Manifest::class)->build($this->admin())['settings'], 'home', 'namespace')['shop']);
    }

    public function test_built_in_pages_are_listed_with_the_pages_and_customised_from_their_standard_version(): void
    {
        $this->cms()->collections()->save(Collection::fromArray('shop-pages', ['title' => 'Shop Pages', 'section' => 'design', 'system' => true, 'fields' => [['handle' => 'blocks', 'type' => 'json', 'label' => 'Page']]]));
        $this->cms()->builtinPages()->register('shop', 'Shop', 'shop-pages',
            pages: static fn () => ['basket' => ['label' => 'Basket', 'path' => '/basket']],
            seed: static fn (string $handle, string $locale) => [['id' => 'b1', 'type' => 'heading', 'props' => ['text' => "Standard {$handle} {$locale}"]]],
        );
        $ctx = AbilityContext::forUser($this->admin(), 'admin');

        // Not an item of its own: it belongs to the pages, and the editor goes back there.
        $nav = array_column($this->cms()->navigation()->forUser($this->admin())['nav'], null, 'id');
        $this->assertSame('collection.pages', $nav['collection.shop-pages']['home']);
        $collections = array_column($this->app->make(Manifest::class)->build($this->admin())['collections'], null, 'handle');
        $this->assertSame(['pages', 'shop'], [$collections['shop-pages']['within'], $collections['shop-pages']['tab']]);

        $groups = array_column($this->cms()->abilities()->execute('pages/builtin', [], $ctx), null, 'id');
        $this->assertSame([['handle' => 'basket', 'label' => 'Basket', 'path' => '/basket', 'id' => null, 'version' => null, 'status' => 'standard', 'displayStatus' => 'standard', 'publishedAt' => null, 'updatedAt' => null,
            'href' => '/basket', 'group' => 'shop', 'collection' => 'shop-pages', 'customisable' => true, 'opens' => true, 'restorable' => false]], $groups['shop']['pages']);
        $this->assertSame(1, $groups['shop']['total']);
        $this->assertSame(['shop'], array_column($this->cms()->abilities()->execute('pages/builtin', ['group' => 'shop'], $ctx), 'id'), 'One group, asked by its id');

        $made = $this->cms()->abilities()->execute('pages/customize', ['group' => 'shop', 'handle' => 'basket'], $ctx);
        $entry = $this->cms()->entries()->find($made['id']);
        $this->assertSame(['shop-pages', 'basket', 'Standard basket en'], [$entry->collection, $entry->slug, $entry->data['blocks'][0]['props']['text']]);
        $this->assertSame($made['id'], $this->cms()->abilities()->execute('pages/customize', ['group' => 'shop', 'handle' => 'basket'], $ctx)['id'], 'Once is enough');
        // The standard version is live until the site's own is published: a version waits, as on a page with changes.
        $page = array_column($this->cms()->abilities()->execute('pages/builtin', [], $ctx), null, 'id')['shop']['pages'][0];
        $this->assertSame(['draft', 'changed', true], [$page['status'], $page['displayStatus'], $page['restorable']]);
    }

    public function test_settings_have_a_sidebar_of_their_own(): void
    {
        $result = $this->cms()->navigation()->forUser($this->admin());
        $settings = array_column($result['settingsNav'], null, 'id');

        // Your account, General, the Audit Log and Sync without a group name; then People.
        $this->assertSame(['account', 'people'], array_keys($settings));
        $this->assertSame(['account', 'settings.site', 'settings.media', 'settings.email', 'audit', 'sync'], $settings['account']['items']);
        $this->assertSame(['users', 'settings.roles'], $settings['people']['items']);
        // Settings kept with a screen are its Settings tab, reached through the screen's row when that is in settings.
        $this->assertSame('/audit?tab=settings', array_column($result['nav'], 'path', 'id')['settings.audit']);
        $this->assertNotContains('settings.audit', array_merge(...array_column($result['settingsNav'], 'items')));
        // The default sidebar and home screen are saved where they are arranged: no page of their own.
        $this->assertNotContains('settings.admin', array_column($result['nav'], 'id'));
        $this->assertNotContains('admin', array_column($this->app->make(Manifest::class)->build($this->admin())['settings'], 'namespace'));
        // Settings pages are not something to pin, but the command palette finds them.
        $this->assertNotContains('users', array_merge(...array_column($result['sidebar']['sections'], 'items')));
        $this->assertContains('settings.site', array_column($result['nav'], 'id'));
    }

    public function test_people_only_see_what_they_may_open(): void
    {
        $result = $this->cms()->navigation()->forUser($this->userWithRole('author'));
        $ids = array_column($result['nav'], 'id');

        $this->assertNotContains('users', $ids);
        $this->assertNotContains('settings.site', $ids);
        // Everyone has an account to look after.
        $this->assertSame(['account'], array_column($result['settingsNav'], 'id'));
    }

    public function test_items_can_decide_per_person_whether_they_show(): void
    {
        $this->cms()->admin()->nav('reviews', ['label' => 'Reviews', 'path' => '/reviews', 'pinned' => true, 'visible' => static fn ($user) => $user->hasPermission('settings.manage')]);

        $this->assertContains('reviews', array_column($this->cms()->navigation()->forUser($this->admin())['nav'], 'id'));
        $this->assertNotContains('reviews', array_column($this->cms()->navigation()->forUser($this->userWithRole('author'))['nav'], 'id'));
    }

    public function test_the_arrangement_ability_describes_the_sidebar(): void
    {
        $result = $this->cms()->abilities()->execute('admin/arrangement', ['of' => 'sidebar', 'layout' => null], AbilityContext::forUser($this->admin(), 'admin'));

        $this->assertFalse($result['customized']);
        $this->assertTrue($result['fixed']);
        $this->assertContains('collection.pages', array_column($result['items'], 'id'));
        $this->assertNotContains('users', array_column($result['items'], 'id'));
        $this->assertSame(['main', 'content', 'design'], array_column($result['layout']['sections'], 'id'));

        $this->expectException(AbilityException::class);
        $this->cms()->abilities()->execute('admin/arrangement', ['of' => 'sidebar'], AbilityContext::forUser($this->userWithRole('author'), 'admin'));
    }

    public function test_the_home_screen_shows_widgets_that_are_on_by_default_until_people_arrange_their_own(): void
    {
        $admin = $this->admin();
        $dashboard = $this->app->make(\Cms\Modules\Dashboard\Dashboard::class);
        $home = $dashboard->forUser($admin);

        // Only widgets registered as enabled show; every other one waits in the gallery.
        $this->assertSame(['main' => ['recent'], 'side' => []], array_column($home['dashboard'], 'items', 'id'));
        $this->assertContains('shortcuts', $home['home']['layout']['hidden']);
        $this->assertFalse($home['home']['personal']);
        $gallery = array_column($home['widgets'], null, 'id');
        $this->assertSame('Content', $gallery['recent']['source']);
        $this->assertNotSame('', $gallery['shortcuts']['description']);

        // An admin's default for everyone: columns are fixed, an unknown one is dropped, labels stay.
        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'admin', 'values' => ['dashboard' => [
            'sections' => [['id' => 'side', 'label' => 'Mine', 'items' => ['recent', 'shortcuts']], ['id' => 'extra', 'items' => []]],
            'hidden' => [],
        ]]], AbilityContext::forUser($admin, 'admin'));

        $saved = $dashboard->saved();
        $this->assertSame(['side'], array_column($saved['sections'], 'id'));
        $this->assertSame('Side Column', $saved['sections'][0]['label']);

        $editor = $this->userWithRole('editor');
        // The missing main column comes back; widgets the default does not mention stay in the gallery.
        $this->assertSame(['main' => [], 'side' => ['recent', 'shortcuts']], array_column($dashboard->forUser($editor)['dashboard'], 'items', 'id'));

        // Their own arrangement wins over the default, and is theirs alone.
        $this->cms()->abilities()->execute('account/update', ['preferences' => ['dashboard' => ['sections' => [['id' => 'main', 'items' => ['shortcuts', 'recent']]], 'hidden' => ['recent']]]], AbilityContext::forUser($editor, 'admin'));
        $mine = $dashboard->forUser($editor->refresh());
        $this->assertTrue($mine['home']['personal']);
        $this->assertSame(['main' => ['shortcuts'], 'side' => []], array_column($mine['dashboard'], 'items', 'id'));
        $this->assertSame(['recent', 'shortcuts'], array_column($dashboard->forUser($admin)['dashboard'], 'items', 'id')['side']);

        // Back to the default.
        $this->cms()->abilities()->execute('account/update', ['preferences' => ['dashboard' => null]], AbilityContext::forUser($editor, 'admin'));
        $this->assertFalse($dashboard->forUser($editor->refresh())['home']['personal']);
    }

    public function test_user_profiles_have_fields_like_any_content(): void
    {
        $admin = $this->admin();
        $ctx = AbilityContext::forUser($admin, 'admin');
        $this->cms()->abilities()->execute('users/fields-save', ['fields' => [
            ['handle' => 'bio', 'type' => 'textarea', 'label' => 'Bio'],
            ['handle' => 'role_title', 'type' => 'text', 'label' => 'Job title', 'required' => true],
        ]], $ctx);

        // Invited before the profile is complete; filled in later.
        $user = $this->cms()->abilities()->execute('users/create', ['name' => 'Bo', 'email' => 'bo@example.com', 'roles' => ['editor'], 'password' => 'a-long-enough-password-1', 'data' => ['bio' => 'Writes.']], $ctx);
        $this->assertSame('Writes.', $user['data']->bio);

        $user = $this->cms()->abilities()->execute('users/update', ['id' => $user['id'], 'data' => ['role_title' => 'Editor-in-chief']], $ctx);
        $this->assertSame('Writes.', $user['data']->bio);
        $this->assertSame('Editor-in-chief', $user['data']->role_title);

        $this->expectException(AbilityException::class);
        $this->cms()->abilities()->execute('users/fields-save', ['fields' => [['handle' => 'email', 'type' => 'text']]], $ctx);
    }

    public function test_roles_are_settings_and_the_admin_role_stays(): void
    {
        $ctx = AbilityContext::forUser($this->admin(), 'admin');
        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'roles', 'values' => ['roles' => [
            'client' => ['label' => ' Client ', 'permissions' => ['admin.access', 'entries.pages.edit', 42]],
        ]]], $ctx);

        $roles = $this->cms()->roles()->all();
        $this->assertSame(['client', 'admin'], array_keys($roles));
        $this->assertSame('Client', $roles['client']['label']);
        $this->assertSame(['admin.access', 'entries.pages.edit'], $roles['client']['permissions']);
        $this->assertSame(['*'], $roles['admin']['permissions']);

        $this->expectException(AbilityException::class);
        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'roles', 'values' => ['roles' => ['Bad Role' => ['label' => 'x']]]], $ctx);
    }

    public function test_collection_settings_are_fields(): void
    {
        $settings = array_column($this->cms()->collections()->settingsFields($this->cms()->collections()->find('posts')), null, 'handle');

        $this->assertSame(['title', 'singular', 'icon', 'route', 'structure', 'default_view', 'default_columns', 'body'], array_keys($settings));
        $this->assertSame(['body' => 'Body'], $settings['body']['options']);
        $this->assertSame('icon', $settings['icon']['type']);
    }

    public function test_site_settings_are_a_settings_namespace(): void
    {
        $ctx = AbilityContext::forUser($this->admin(), 'admin');
        Yaml::write(site_path('config/site.yaml'), [...Yaml::read(site_path('config/site.yaml')), 'theme' => 'cms/starter']);

        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'site', 'values' => ['name' => 'Renamed', 'locale' => 'fr']], $ctx);
        $stored = Yaml::read(site_path('config/site.yaml'));

        $this->assertSame('Renamed', $stored['name']);
        $this->assertSame(['fr', 'en', 'de'], $stored['locales']);
        $this->assertSame('cms/starter', $stored['theme']);
        $this->assertSame('Renamed', config('app.name'));
        $this->assertSame('Renamed', $this->cms()->site('name'));

        try {
            $this->cms()->abilities()->execute('settings/update', ['namespace' => 'site', 'values' => ['locale' => 'French']], $ctx);
            $this->fail('Accepted an invalid language code.');
        } catch (AbilityException $e) {
            $this->assertArrayHasKey('locale', $e->details);
        }
    }

    public function test_environment_overrides_are_never_written(): void
    {
        putenv('CMS_SITE_URL=https://staging.example.com');

        try {
            $this->assertSame('https://staging.example.com', $this->cms()->site('url'));
            $this->cms()->saveSite(['name' => 'Again']);
            $this->assertSame('http://localhost', Yaml::read(site_path('config/site.yaml'))['url']);
        } finally {
            putenv('CMS_SITE_URL');
        }
    }

    /** The section of someone's sidebar. */
    private function section(\Cms\Users\User $user, string $id): array
    {
        return array_column($this->cms()->navigation()->forUser($user)['sidebar']['sections'], null, 'id')[$id];
    }

    /** Someone's own sidebar (the `sidebar` preference). */
    private function pin(\Cms\Users\User $user, ?array $layout): void
    {
        $this->cms()->abilities()->execute('account/update', ['preferences' => ['sidebar' => $layout]], AbilityContext::forUser($user, 'admin'));
        $user->refresh();
    }

    /** The site's default sidebar (the `sidebar` value of the admin settings). */
    private function settle(\Cms\Users\User $admin, ?array $layout): void
    {
        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'admin', 'values' => ['sidebar' => $layout]], AbilityContext::forUser($admin, 'admin'));
    }
}

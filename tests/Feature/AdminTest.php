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
    public function test_the_main_sidebar_is_where_work_starts_then_what_is_pinned(): void
    {
        // A screen of the design, as the site's module has: the design's row leads to its first.
        $this->cms()->admin()->nav('links', ['label' => 'Links', 'path' => '/links', 'section' => 'design']);
        $nav = $this->cms()->adminNav()->forUser($this->admin());
        $sidebar = array_column($nav['sidebar']['sections'], null, 'id');

        // The home screen and a row into each room, without a heading; then Pinned: the pages and the files.
        $this->assertSame(['main', 'pinned'], array_keys($sidebar));
        $this->assertSame('', $sidebar['main']['label']);
        $this->assertSame(['dashboard', 'content', 'design', 'structure'], $sidebar['main']['items']);
        $this->assertSame('Pinned', $sidebar['pinned']['label']);
        $this->assertSame(['collection.pages', 'media'], $sidebar['pinned']['items']);
        // The rest of a room is in its room, a pin away; settings have no row of their own.
        $this->assertContains('collection.posts', $nav['sidebar']['hidden']);
        $this->assertSame(['collection.notes', 'collection.pages', 'collection.posts'], $this->room($nav, 'content')['entries']['items']);
        $this->assertSame(['collections', 'taxonomies', 'globals', 'menus'], $this->room($nav, 'structure')['structure']['items']);
        $this->assertSame('Content', array_column($nav['rooms'], 'label', 'id')['content']);
        $this->assertSame('design', array_column($nav['nav'], 'room', 'id')['design']);
        $this->assertFalse($nav['sidebar']['personal']);
    }

    public function test_the_content_room_groups_collections_by_their_kind(): void
    {
        $this->cms()->collections()->save(Collection::fromArray('topics', ['title' => 'Topics', 'type' => 'categories', 'fields' => []]));
        $this->cms()->collections()->save(Collection::fromArray('labels', ['title' => 'Labels', 'type' => 'tags', 'fields' => []]));
        $this->global('studio', [['handle' => 'phone', 'type' => 'text']]);
        $this->menu('main');

        $sections = $this->room($this->cms()->adminNav()->forUser($this->admin()), 'content');
        $this->assertSame(['entries', 'taxonomies', 'globals', 'menus'], array_keys($sections));
        $this->assertSame(['Entries', 'Taxonomies', 'Globals', 'Menus'], array_column($sections, 'label'));
        $this->assertSame(['collection.labels', 'collection.topics'], $sections['taxonomies']['items']);
        $this->assertSame(['collection.studio'], $sections['globals']['items']);
        $this->assertSame(['collection.main'], $sections['menus']['items']);
        $this->assertNotContains('collection.topics', $sections['entries']['items']);

        // A kind with one collection keeps its heading: it is not mistaken for another.
        $this->cms()->collections()->delete('labels');
        $sections = $this->room($this->cms()->adminNav()->forUser($this->admin()), 'content');
        $this->assertSame(['Entries', 'Taxonomies', 'Globals', 'Menus'], array_column($sections, 'label'));
        $this->assertSame(['collection.topics'], $sections['taxonomies']['items']);
    }

    public function test_what_is_seldom_needed_is_pinned_under_more(): void
    {
        $this->cms()->admin()->nav('rarely', ['label' => 'Rarely', 'path' => '/rarely', 'section' => 'pinned', 'pinned' => false]);
        $nav = $this->cms()->adminNav()->forUser($admin = $this->admin());

        // Listed with what is pinned, under More until someone shows it.
        $this->assertContains('rarely', $nav['sidebar']['hidden']);
        $this->assertNotContains('rarely', array_merge(...array_column($nav['sidebar']['sections'], 'items')));
        $this->assertContains('rarely', array_column($nav['nav'], 'id'));

        $this->pin($admin, ['sections' => [['id' => 'pinned', 'items' => ['rarely', 'collection.pages']]], 'hidden' => []]);
        $this->assertSame(['rarely', 'collection.pages'], array_slice($this->section($admin, 'pinned')['items'], 0, 2));
    }

    public function test_a_collection_names_its_section_and_is_shown_there(): void
    {
        $this->cms()->collections()->save(Collection::fromArray('parts', ['title' => 'Parts', 'section' => 'structure', 'system' => true, 'fields' => []]));

        $nav = $this->cms()->adminNav()->forUser($this->admin());

        $this->assertContains('collection.parts', $this->room($nav, 'structure')['structure']['items']);
        $this->assertNotContains('collection.parts', $this->room($nav, 'content')['entries']['items']);
    }

    public function test_collection_navigation_priority_is_explicit_and_saved_arrangements_still_win(): void
    {
        $admin = $this->admin();
        $pages = $this->cms()->collections()->findOrFail('pages')->toYaml();
        $this->cms()->collections()->save(Collection::fromArray('pages', [...$pages, 'title' => 'Z pages', 'nav_order' => 5]));
        $this->cms()->collections()->save(Collection::fromArray('journal', ['title' => 'A blog', 'nav_order' => 20, 'fields' => []]));
        $this->assertSame(20, $this->cms()->collections()->findOrFail('journal')->get('nav_order'));
        $ids = $this->room($this->cms()->adminNav()->forUser($admin), 'content')['entries']['items'];
        $this->assertLessThan(array_search('collection.journal', $ids, true), array_search('collection.pages', $ids, true));

        $this->pin($admin, ['sections' => [['id' => 'pinned', 'items' => ['collection.journal', 'collection.pages']]], 'hidden' => []]);
        $this->assertSame(['collection.journal', 'collection.pages'], array_slice($this->section($admin, 'pinned')['items'], 0, 2));
    }

    public function test_people_pin_their_own_sidebar_and_new_items_find_their_place(): void
    {
        $admin = $this->admin();
        $this->pin($admin, [
            'sections' => [
                ['id' => 'pinned', 'label' => 'Renamed', 'items' => ['media', 'collection.posts', 'collection.pages']],
                ['id' => 'invented', 'label' => 'Mine', 'items' => ['collection.notes']],
            ],
            'hidden' => ['collection.pages'],
        ]);

        // A collection created later is in its room, not pinned until someone pins it.
        $this->cms()->collections()->save(Collection::fromArray('products', ['title' => 'Products', 'fields' => []]));
        $result = $this->cms()->adminNav()->forUser($admin);

        // The groups are the registered ones: people pin and order items, they do not invent or rename groups.
        $this->assertSame(['main', 'pinned'], array_column($result['sidebar']['sections'], 'id'));
        $this->assertSame('Pinned', $result['sidebar']['sections'][1]['label']);
        $this->assertSame(['media', 'collection.posts'], $result['sidebar']['sections'][1]['items']);
        $this->assertContains('collection.pages', $result['sidebar']['hidden']);
        $this->assertContains('collection.products', $result['sidebar']['hidden']);
        $this->assertTrue($result['sidebar']['personal']);
        // Unpinned, still among the places / in a thread offers.
        $this->assertContains('collection.pages', array_column($result['nav'], 'id'));

        // Someone else still sees the site's sidebar.
        $other = $this->admin();
        $this->assertFalse($this->cms()->adminNav()->forUser($other)['sidebar']['personal']);
    }

    public function test_the_site_default_applies_until_people_pin_their_own_and_after_they_reset(): void
    {
        $admin = $this->admin();
        $this->settle($admin, ['sections' => [['id' => 'pinned', 'items' => ['collection.posts', 'collection.pages', 'media']]], 'hidden' => ['media']]);
        $this->assertSame(['collection.posts', 'collection.pages'], $this->section($admin, 'pinned')['items']);
        $this->assertContains('media', $this->cms()->adminNav()->forUser($admin)['sidebar']['hidden']);

        $this->pin($admin, ['sections' => [['id' => 'pinned', 'items' => ['collection.pages']]], 'hidden' => []]);
        $this->assertSame('collection.pages', $this->section($admin, 'pinned')['items'][0]);

        $this->pin($admin, null);
        $this->assertSame('collection.posts', $this->section($admin, 'pinned')['items'][0]);
    }

    public function test_items_that_disappear_keep_their_place(): void
    {
        $admin = $this->admin();
        $this->settle($admin, ['sections' => [['id' => 'pinned', 'items' => ['collection.posts', 'collection.pages']]], 'hidden' => []]);

        $this->cms()->collections()->delete('posts');
        $this->cms()->collections()->flush();

        // Saved while posts was gone: the editor never saw it, but its place is kept.
        $this->settle($admin, ['sections' => [['id' => 'pinned', 'items' => ['collection.pages']]], 'hidden' => []]);
        $this->assertContains('collection.posts', $this->cms()->adminNav()->saved()['sections'][0]['items']);

        $this->cms()->collections()->save(Collection::fromArray('posts', ['title' => 'Posts', 'fields' => []]));
        $this->assertSame(['collection.pages', 'collection.posts', 'media'], $this->section($admin, 'pinned')['items']);
    }

    public function test_a_hand_edited_arrangement_is_read_forgivingly(): void
    {
        Yaml::write(site_path('config/admin.yaml'), ['sidebar' => ['sections' => [
            ['id' => 'pinned', 'items' => ['collection.pages', 'collection.pages', 42]],
            'not a section',
            ['id' => 'Bad Id!', 'items' => ['users']],
        ], 'hidden' => 'users']]);

        $pinned = $this->section($this->admin(), 'pinned');
        $this->assertSame('Pinned', $pinned['label']);
        $this->assertSame('collection.pages', $pinned['items'][0]);
    }

    public function test_the_core_names_the_sections_of_the_sidebar_and_its_rooms(): void
    {
        $this->cms()->admin()->nav('links', ['label' => 'Links', 'path' => '/links', 'section' => 'design']);
        $this->cms()->settingsRegistry()->register('shop', 'Shop', [['handle' => 'currency', 'type' => 'text', 'label' => 'Currency']]);
        $this->cms()->settingsRegistry()->register('newsletter', 'Newsletter', [['handle' => 'from', 'type' => 'text', 'label' => 'From']]);

        $result = $this->cms()->adminNav()->forUser($this->admin());

        // A screen in the design's section is in the design's room, not the main sidebar.
        $this->assertContains('links', array_merge(...array_column($this->room($result, 'design'), 'items')));
        $this->assertNotContains('links', array_merge(...array_column($result['sidebar']['sections'], 'items')));
        // The unnamed group, People, then a settings page without a section of its own: a plugin's, under Plugins by name.
        $settings = $this->room($result, 'settings');
        $this->assertSame(['system', 'people', 'plugins'], array_keys($settings));
        $this->assertSame(['', 'People', 'Plugins'], array_column($settings, 'label'));
        $this->assertSame(['settings.newsletter', 'settings.shop'], $settings['plugins']['items']);
    }

    public function test_a_group_of_one_in_settings_joins_the_unnamed_group(): void
    {
        $this->cms()->settingsRegistry()->register('shop', 'Shop', [['handle' => 'currency', 'type' => 'text', 'label' => 'Currency']]);

        $settings = $this->room($this->cms()->adminNav()->forUser($this->admin()), 'settings');

        $this->assertArrayNotHasKey('plugins', $settings);
        $this->assertSame(['settings.site', 'account', 'plugins', 'settings.email', 'built-in', 'audit', 'sync', 'settings.shop'], $settings['system']['items']);
    }

    public function test_a_page_with_a_home_is_that_screens_settings_tab_and_in_no_sidebar(): void
    {
        $this->cms()->admin()->nav('shop', ['label' => 'Shop', 'path' => '/shop', 'pinned' => true]);
        $this->cms()->settingsRegistry()->register('shop', 'Shop', [['handle' => 'currency', 'type' => 'text', 'label' => 'Currency']], home: 'shop');

        $result = $this->cms()->adminNav()->forUser($this->admin());
        $nav = array_column($result['nav'], null, 'id');

        $this->assertSame('shop', $nav['settings.shop']['home']);
        $this->assertSame('/shop?tab=settings', $nav['settings.shop']['path']);
        // One home: the screen's tab. The settings sidebar doesn't repeat it, and it is never pinned on its own.
        $this->assertNotContains('settings.shop', array_merge(...array_column($this->room($result, 'settings'), 'items')));
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
        $nav = array_column($this->cms()->adminNav()->forUser($this->admin())['nav'], null, 'id');
        $this->assertSame('collection.pages', $nav['collection.shop-pages']['home']);
        $collections = array_column($this->app->make(Manifest::class)->build($this->admin())['collections'], null, 'handle');
        $this->assertSame('pages', $collections['shop-pages']['within']);

        $groups = array_column($this->cms()->abilities()->execute('pages/builtin', [], $ctx), null, 'id');
        $this->assertSame([['handle' => 'basket', 'label' => 'Basket', 'path' => '/basket', 'id' => null, 'version' => null, 'status' => 'standard', 'displayStatus' => 'published', 'publishedAt' => null, 'updatedAt' => null,
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

    public function test_settings_are_a_room_of_their_own(): void
    {
        $result = $this->cms()->adminNav()->forUser($this->admin());
        $settings = $this->room($result, 'settings');

        // General, your account, Plugins, the Audit Log and Sync without a group name; then People.
        $this->assertSame(['system', 'people'], array_keys($settings));
        $this->assertSame(['settings.site', 'account', 'plugins', 'settings.email', 'built-in', 'audit', 'sync'], $settings['system']['items']);
        $this->assertSame(['users', 'settings.roles'], $settings['people']['items']);
        // Settings kept with a screen are its Settings tab, reached through the screen's row when that is in settings.
        $this->assertSame('/audit?tab=settings', array_column($result['nav'], 'path', 'id')['settings.audit']);
        $this->assertNotContains('settings.audit', array_merge(...array_column($settings, 'items')));
        // The default sidebar and home screen are saved where they are arranged: no page of their own.
        $this->assertNotContains('settings.admin', array_column($result['nav'], 'id'));
        $this->assertNotContains('admin', array_column($this->app->make(Manifest::class)->build($this->admin())['settings'], 'namespace'));
        // Settings pages are not something to pin, but / in a thread finds them.
        $this->assertNotContains('users', array_merge(...array_column($result['sidebar']['sections'], 'items')));
        $this->assertContains('settings.site', array_column($result['nav'], 'id'));
    }

    public function test_people_only_see_what_they_may_open(): void
    {
        $result = $this->cms()->adminNav()->forUser($this->userWithRole('author'));
        $ids = array_column($result['nav'], 'id');

        $this->assertNotContains('users', $ids);
        $this->assertNotContains('settings.site', $ids);
        // Everyone has an account to look after and an author entries to write; the design's room and its door are for those who may change it.
        $this->assertSame(['content', 'settings'], array_column($result['rooms'], 'id'));
        $this->assertSame(['system'], array_keys($this->room($result, 'settings')));
        $this->assertNotContains('design', $ids);
    }

    public function test_items_can_decide_per_person_whether_they_show(): void
    {
        $this->cms()->admin()->nav('reviews', ['label' => 'Reviews', 'path' => '/reviews', 'pinned' => true, 'visible' => static fn ($user) => $user->hasPermission('settings.manage')]);

        $this->assertContains('reviews', array_column($this->cms()->adminNav()->forUser($this->admin())['nav'], 'id'));
        $this->assertNotContains('reviews', array_column($this->cms()->adminNav()->forUser($this->userWithRole('author'))['nav'], 'id'));
    }

    public function test_the_arrangement_ability_describes_the_sidebar(): void
    {
        $result = $this->cms()->abilities()->execute('admin/arrangement', ['of' => 'sidebar', 'layout' => null], AbilityContext::forUser($this->admin(), 'admin'));

        $this->assertFalse($result['customized']);
        $this->assertTrue($result['fixed']);
        // Every screen of a room can be pinned but a settings page: the ability offers them.
        $this->assertContains('collection.pages', array_column($result['items'], 'id'));
        $this->assertContains('collections', array_column($result['items'], 'id'));
        $this->assertNotContains('users', array_column($result['items'], 'id'));
        $this->assertSame(['main', 'pinned'], array_column($result['layout']['sections'], 'id'));

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
        $this->cms()->abilities()->execute('user-fields/save', ['fields' => [
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
        $this->cms()->abilities()->execute('user-fields/save', ['fields' => [['handle' => 'email', 'type' => 'text']]], $ctx);
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

        $this->assertSame(['title', 'singular', 'icon', 'route', 'type', 'structure', 'default_view', 'default_columns'], array_keys($settings));
        $this->assertSame('icon', $settings['icon']['type']);

        // What its entries are, and their structure only for entries: a taxonomy's is its type's.
        $this->assertSame(['entries', 'categories', 'tags'], array_keys($settings['type']['options']));
        $this->assertSame(['type' => 'entries'], $settings['structure']['if']);
    }

    public function test_structure_lists_each_kind_apart(): void
    {
        $this->cms()->collections()->save(Collection::fromArray('topics', ['title' => 'Topics', 'type' => 'categories', 'fields' => []]));
        $this->menu('main');
        $nav = $this->cms()->adminNav()->forUser($admin = $this->admin());
        // Structure in named groups: content types, then the layout.
        $structure = $this->room($nav, 'structure');
        // (The layout's group comes with Blocks: SitesTest has both.)
        $this->assertSame(['Content Types'], array_column($structure, 'label'));
        $this->assertSame(['collections', 'taxonomies', 'globals', 'menus'], $structure['structure']['items']);

        $ctx = \Cms\Abilities\AbilityContext::forUser($admin, 'admin');
        $editable = fn (array $in) => array_column($this->cms()->abilities()->execute('collections/editable', $in, $ctx), 'handle');
        $this->assertNotContains('topics', $editable([]));
        $this->assertSame(['topics'], $editable(['kind' => 'taxonomies']));
        $this->assertSame(['main'], $editable(['kind' => 'menus']));

        // Each is edited at its own list's address; another's leads nowhere.
        $views = $this->cms()->views();
        $this->assertSame(['type' => 'collections/blueprint', 'props' => ['handle' => 'topics', 'kind' => 'taxonomies']], $views->resolve('taxonomies-collection', $admin, ['handle' => 'topics'])['root']);
        $this->assertSame(['type' => 'collections/blueprint', 'props' => ['handle' => 'main', 'kind' => 'menus']], $views->resolve('menus-collection', $admin, ['handle' => 'main'])['root']);
        $this->assertSame('Not Found', $views->resolve('collections-collection', $admin, ['handle' => 'topics'])['root']['props']['title']);
        $this->assertSame(['kind' => 'taxonomies'], $views->resolve('taxonomies', $admin)['root']['children'][0]['props']['source']['input']);
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
    /** A room's sections by id, as this result lists them. */
    private function room(array $result, string $id): array
    {
        return array_column(current(array_filter($result['rooms'], static fn (array $room) => $room['id'] === $id))['sections'] ?? [], null, 'id');
    }

    private function section(\Cms\Users\User $user, string $id): array
    {
        return array_column($this->cms()->adminNav()->forUser($user)['sidebar']['sections'], null, 'id')[$id];
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

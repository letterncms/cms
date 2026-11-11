<?php

declare(strict_types=1);

namespace Cms\Modules\Navigation\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Modules\Navigation\MenuResolver;
use Cms\Tests\TestCase;

final class NavigationTest extends TestCase
{
    private function ability(string $ability, array $input = []): mixed
    {
        return $this->cms()->abilities()->execute($ability, $input, AbilityContext::system());
    }

    private function page(string $title, bool $live = true, ?string $parent = null): array
    {
        return $this->ability('entries/create', array_filter(['collection' => 'pages', 'title' => $title, 'status' => $live ? 'published' : 'draft', 'parentId' => $parent]));
    }

    public function test_menus_link_entries_and_urls_and_render_live_items_only(): void
    {
        $about = $this->page('About');
        $team = $this->page('Team', parent: $about['id']);
        $draft = $this->page('Secret', live: false);

        $saved = $this->ability('navigation/create', ['handle' => 'main', 'title' => 'Main', 'items' => [
            ['entry' => $about['id'], 'children' => [['entry' => $team['id'], 'label' => 'Our team']]],
            ['entry' => $draft['id']],
            ['url' => 'https://example.com/docs', 'label' => 'Docs', 'newTab' => true],
        ]]);

        $this->assertSame('About', $saved['items'][0]['target']['title']);
        $this->assertSame('draft', $saved['items'][1]['target']['status']);
        $this->assertFileExists(content_path('navigation/main.yaml'));
        $this->assertStringContainsString('new_tab: true', (string) file_get_contents(content_path('navigation/main.yaml')));

        $links = cms_menu('main');
        $this->assertSame(['About', 'Docs'], array_column($links, 'label'), 'draft entries stay hidden');
        $this->assertSame('/about', $links[0]['url']);
        $this->assertSame('Our team', $links[0]['children'][0]['label']);
        $this->assertSame('/about/team', $links[0]['children'][0]['url']);
        $this->assertTrue($links[1]['newTab']);

        $marked = $this->app->make(MenuResolver::class)->resolve('main', '/about/team/');
        $this->assertTrue($marked[0]['active']);
        $this->assertFalse($marked[0]['current']);
        $this->assertTrue($marked[0]['children'][0]['current']);
        $this->assertFalse($marked[1]['active']);

        $this->assertNull(cms_menu('missing'));
    }

    public function test_ids_are_kept_so_edits_are_stable(): void
    {
        $saved = $this->ability('navigation/create', ['handle' => 'footer', 'title' => 'Footer', 'items' => [['url' => '/contact', 'label' => 'Contact']]]);
        $id = $saved['items'][0]['id'];

        $again = $this->ability('navigation/update', ['handle' => 'footer', 'items' => [['id' => $id, 'url' => '/contact', 'label' => 'Get in touch'], ['url' => '#top', 'label' => 'Top']]]);

        $this->assertSame($id, $again['items'][0]['id']);
        $this->assertSame('Footer', $again['title']);
        $this->assertSame(2, $this->ability('navigation/list')[0]['count']);
    }

    /** @return iterable<string, array{array, string}> */
    public static function invalid(): iterable
    {
        yield 'both targets' => [[['url' => '/a', 'entry' => 'x', 'label' => 'A']], 'either'];
        yield 'no target' => [[['label' => 'A']], 'either'];
        yield 'script url' => [[['url' => 'javascript:alert(1)', 'label' => 'A']], 'not a link'];
        yield 'protocol-relative' => [[['url' => '//evil.example', 'label' => 'A']], 'not a link'];
        yield 'url without label' => [[['url' => '/a']], 'label'];
        yield 'too deep' => [[['url' => '/a', 'label' => 'A', 'children' => [['url' => '/b', 'label' => 'B', 'children' => [['url' => '/c', 'label' => 'C']]]]]], 'levels'];
        yield 'unknown entry' => [[['entry' => '01aaaaaaaaaaaaaaaaaaaaaaaa']], 'do not exist'];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('invalid')]
    public function test_rejects_invalid_items(array $items, string $message): void
    {
        try {
            $this->ability('navigation/create', ['handle' => 'main', 'title' => 'Main', 'maxDepth' => 2, 'items' => $items]);
            $this->fail('Expected the menu to be rejected.');
        } catch (AbilityException $e) {
            $this->assertStringContainsString($message, $e->getMessage());
        }
    }

    public function test_deleting_an_entry_removes_its_items_and_lifts_children(): void
    {
        $about = $this->page('About');
        $this->ability('navigation/create', ['handle' => 'main', 'title' => 'Main', 'items' => [
            ['entry' => $about['id'], 'children' => [['url' => '/jobs', 'label' => 'Jobs']]],
            ['url' => '/blog', 'label' => 'Blog'],
        ]]);

        $this->ability('entries/delete', ['id' => $about['id']]);

        $this->assertSame(['Jobs', 'Blog'], array_column($this->ability('navigation/get', ['handle' => 'main'])['items'], 'label'));
    }

    public function test_update_changes_a_menu_that_is_there_and_create_makes_one(): void
    {
        // A menu that is not there is not made by changing it.
        try {
            $this->ability('navigation/update', ['handle' => 'main', 'title' => 'Main', 'items' => [['url' => '/a', 'label' => 'A']]]);
            $this->fail('Expected the menu not to be found.');
        } catch (AbilityException $e) {
            $this->assertSame('not_found', $e->type);
            $this->assertArrayHasKey('handle', $e->details);
        }
        $this->assertSame([], $this->ability('navigation/list'));
        $this->assertFileDoesNotExist(content_path('navigation/main.yaml'));

        // Made with its handle, depth and items in one call; the handle comes from the title when none is given.
        $menu = $this->ability('navigation/create', ['title' => 'Main Menu', 'handle' => 'main', 'maxDepth' => 2, 'items' => [['url' => '/a', 'label' => 'A', 'children' => [['url' => '/b', 'label' => 'B']]]]]);
        $this->assertSame(['main', 'Main Menu', 2], [$menu['handle'], $menu['title'], $menu['maxDepth']]);
        $this->assertSame('B', $menu['items'][0]['children'][0]['label']);
        $this->assertSame('side-links', $this->ability('navigation/create', ['title' => 'Side Links'])['handle']);

        // A handle that is taken is refused, whichever way it was named, and the menu stays as it was.
        foreach ([['title' => 'Other', 'handle' => 'main', 'items' => []], ['title' => 'Main']] as $input) {
            try {
                $this->ability('navigation/create', $input);
                $this->fail('Expected a conflict.');
            } catch (AbilityException $e) {
                $this->assertSame('conflict', $e->type);
                $this->assertArrayHasKey(isset($input['handle']) ? 'handle' : 'title', $e->details);
            }
        }
        $this->assertSame('Main Menu', $this->ability('navigation/get', ['handle' => 'main'])['title']);

        // What a change leaves out stays.
        $changed = $this->ability('navigation/update', ['handle' => 'main', 'title' => 'Main']);
        $this->assertSame(['Main', 2, 'A'], [$changed['title'], $changed['maxDepth'], $changed['items'][0]['label']]);
    }

    public function test_permissions(): void
    {
        $this->actingAs($this->userWithRole('author'));
        $this->postJson('/api/admin/abilities/navigation/create', ['title' => 'Main'])->assertForbidden();
        $this->postJson('/api/admin/abilities/navigation/update', ['handle' => 'main', 'items' => []])->assertForbidden();

        $this->actingAs($this->userWithRole('editor'));
        $this->postJson('/api/admin/abilities/navigation/update', ['handle' => 'main', 'items' => []])->assertNotFound();
        $this->postJson('/api/admin/abilities/navigation/create', ['title' => 'Main'])->assertOk();
        $this->postJson('/api/admin/abilities/navigation/update', ['handle' => 'main', 'items' => []])->assertOk();
        $this->postJson('/api/admin/abilities/navigation/delete', ['handle' => 'main'])->assertOk()->assertJsonPath('data.deleted', true);
    }

    /** @return array the view as the admin draws it for this person */
    private function place(string $id, array $params = []): array
    {
        return $this->cms()->abilities()->execute('views/get', ['id' => $id, 'params' => $params], AbilityContext::forUser($this->admin(), 'admin'))['root'];
    }

    public function test_menus_are_views_and_made_renamed_and_deleted_from_them(): void
    {
        $this->assertSame('ui/records', $this->place('navigation')['children'][0]['type']);
        $this->assertSame('ui/empty', $this->place('menu', ['handle' => 'gone'])['children'][0]['type']);

        $menu = $this->ability('navigation/create', ['title' => 'Footer Links']);
        $this->assertSame('footer-links', $menu['handle']);
        $this->ability('navigation/update', ['handle' => 'footer-links', 'items' => [['url' => '/contact', 'label' => 'Contact']]]);
        $this->ability('navigation/update', ['handle' => 'footer-links', 'title' => 'Footer']);

        $saved = $this->ability('navigation/get', ['handle' => 'footer-links']);
        $this->assertSame('Footer', $saved['title']);
        $this->assertCount(1, $saved['items']);
        $this->assertSame('navigation/menu', $this->place('menu', ['handle' => 'footer-links'])['children'][0]['type']);
        $this->assertSame('1 link', $this->ability('navigation/list')[0]['links']);

        // Said on the name in the New Menu dialog.
        try {
            $this->ability('navigation/create', ['title' => 'Footer links']);
            $this->fail('A second footer-links menu was made.');
        } catch (AbilityException $e) {
            $this->assertSame(['conflict', 'title'], [$e->type, array_key_first($e->details)]);
        }
    }

    public function test_a_link_is_added_at_the_end_and_a_new_page_offers_its_menu_in_the_workspace(): void
    {
        $admin = $this->admin();
        $this->ability('navigation/create', ['title' => 'Main']);
        $page = $this->page('Summer Menu');

        $menu = $this->cms()->abilities()->execute('navigation/add-item', ['menu' => 'main', 'entry' => $page['id']], AbilityContext::forUser($admin, 'admin'));
        $this->assertSame($page['id'], end($menu['items'])['entry']);
        $menu = $this->ability('navigation/add-item', ['menu' => 'main', 'url' => 'https://example.com', 'label' => 'Elsewhere']);
        $this->assertSame(['Summer Menu', 'Elsewhere'], array_map(static fn ($i) => $i['label'] ?? $i['target']['title'], $menu['items']));

        try {
            $this->ability('navigation/add-item', ['menu' => 'main']);
            $this->fail('a link needs a page or an address');
        } catch (AbilityException $e) {
            $this->assertArrayHasKey('url', $e->details);
        }

        // In the workspace, a page just made gets Add to Menu, with the menus to choose from; every answer of the plugin validates.
        $answers = $this->app->make(\Cms\Modules\Workspace\Answers::class);
        $view = $answers->command($this->cms()->abilities()->get('entries/create'), ['collection' => 'pages', 'title' => 'Summer Menu'], $page, $admin);
        $add = array_values(array_filter($view['children'][1]['props']['items'], static fn ($a) => ($a['ability'] ?? null) === 'navigation/add-item'))[0];
        $this->assertSame(['main' => 'Main'], $add['form']['fields'][0]['options']);
        foreach (['navigation/create' => ['title' => 'Footer'], 'navigation/update' => ['handle' => 'main', 'title' => 'Main'], 'navigation/add-item' => ['menu' => 'main', 'url' => '/x', 'label' => 'X']] as $name => $input) {
            $result = $this->cms()->abilities()->execute($name, $input, AbilityContext::forUser($admin, 'admin'));
            $this->assertSame('success', $answers->command($this->cms()->abilities()->get($name), $input, $result, $admin)['children'][0]['props']['tone'], $name);
        }
    }

    public function test_one_item_is_removed_by_its_id_with_what_is_under_it(): void
    {
        $page = $this->page('About');
        $menu = $this->ability('navigation/create', ['handle' => 'main', 'title' => 'Main', 'items' => [
            ['entry' => $page['id'], 'children' => [['url' => '/team', 'label' => 'Team'], ['url' => '/jobs', 'label' => 'Jobs']]],
            ['url' => '/contact', 'label' => 'Contact'],
        ]]);
        [$about, $contact] = $menu['items'];
        $team = $about['children'][0];

        // A dry run names the item and writes nothing; it is refused where the real run is.
        $report = $this->ability('navigation/remove-item', ['menu' => 'main', 'id' => $about['id'], 'dryRun' => true]);
        $this->assertSame('full', $report['checked']);
        $this->assertSame([[
            'action' => 'remove-item', 'type' => 'menu', 'handle' => 'main', 'title' => 'Main',
            'item' => ['id' => $about['id'], 'label' => 'About', 'entry' => $page['id']],
            'removes' => ['items' => 3],
        ]], $report['changes']);
        $this->assertCount(2, $this->ability('navigation/get', ['handle' => 'main'])['items']);

        foreach ([['menu' => 'nothing', 'id' => $team['id']], ['menu' => 'main', 'id' => 'nothing']] as $input) {
            foreach ([false, true] as $dry) {
                try {
                    $this->ability('navigation/remove-item', [...$input, 'dryRun' => $dry]);
                    $this->fail('Removed an item that is not there.');
                } catch (AbilityException $e) {
                    $this->assertSame('not_found', $e->type);
                }
            }
        }

        // A nested item goes alone; one with children takes them along.
        $menu = $this->ability('navigation/remove-item', ['menu' => 'main', 'id' => $team['id']]);
        $this->assertSame(['Jobs'], array_column($menu['items'][0]['children'], 'label'));
        $this->assertSame('About', $menu['items'][0]['target']['title']);
        $menu = $this->ability('navigation/remove-item', ['menu' => 'main', 'id' => $about['id']]);
        $this->assertSame([$contact['id']], array_column($menu['items'], 'id'));
        $this->assertSame([$contact['id']], array_column($this->ability('navigation/get', ['handle' => 'main'])['items'], 'id'));

        // Only for those who manage menus, and answered in the workspace like its sibling.
        $this->assertSame('navigation.manage', $this->cms()->abilities()->get('navigation/remove-item')->permission);
        $admin = $this->admin();
        $input = ['menu' => 'main', 'id' => $contact['id']];
        $result = $this->cms()->abilities()->execute('navigation/remove-item', $input, AbilityContext::forUser($admin, 'admin'));
        $this->assertSame([], $result['items']);
        $this->assertSame('success', $this->app->make(\Cms\Modules\Workspace\Answers::class)->command($this->cms()->abilities()->get('navigation/remove-item'), $input, $result, $admin)['children'][0]['props']['tone']);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Content\Collections\Collection;
use Cms\Tests\TestCase;
use Cms\Users\User;

/** A collection's place is data like every other: its entries are the catalog's `ui/records`, checked against it. */
final class EntriesViewTest extends TestCase
{
    private function place(string $collection, User $user): array
    {
        $view = $this->cms()->abilities()->execute('views/get', ['id' => 'content', 'params' => ['collection' => $collection]], AbilityContext::forUser($user, 'admin'));
        $this->assertSame('ui/page', $view['root']['type']);

        return $view['root'];
    }

    private function records(string $collection, User $user): array
    {
        $root = $this->place($collection, $user);
        $this->assertSame('ui/records', $root['children'][0]['type']);

        return $root['children'][0]['props'];
    }

    private function shop(): void
    {
        $this->cms()->collections()->save(Collection::fromArray('shop-pages', ['title' => 'Shop Pages', 'section' => 'design', 'system' => true, 'fields' => [['handle' => 'blocks', 'type' => 'json', 'label' => 'Page']]]));
        $this->cms()->builtinPages()->register('shop', 'Shop', 'shop-pages',
            pages: static fn () => ['basket' => ['label' => 'Basket', 'path' => '/basket'], 'item' => ['label' => 'Item', 'path' => '/shop/{slug}']],
            seed: static fn () => [],
        );
    }

    public function test_the_pages_are_a_tree(): void
    {
        $records = $this->records('pages', $this->admin());

        $this->assertSame('entries/tree', $records['tree']['source']['ability']);
        $this->assertSame('entries/reorder', $records['tree']['reorder']['ability']);
        $this->assertArrayNotHasKey('when', $records['tree']['reorder'], 'Who may publish moves published pages too');
        // While nobody picks a sort, the tree is the order.
        $this->assertSame(['param' => 'sort'], $records['sort']);
        $this->assertSame(['Publish', 'Unpublish', 'Delete'], array_column($records['bulk'], 'label'));
        $this->assertTrue($records['bulk'][0]['each']);

        $columns = array_column($records['columns'], null, 'key');
        $this->assertSame(['title', 'uri', 'displayStatus', 'values.summary', 'translations', 'author', 'published', 'expiresAt', 'updated'], array_keys($columns));
        $this->assertSame(['en', 'de'], $columns['translations']['locales']);
        $this->assertSame(['type' => 'textarea'], $columns['values.summary']['field']);
        $this->assertSame(['summary'], $records['source']['input']['fields']);
        // The standard columns: the address, the state and the dates; the rest wait in Display, a card's excerpt shows on cards.
        $this->assertSame(['uri', 'displayStatus', 'published', 'updated'], array_keys(array_filter($columns, static fn ($c) => ($c['hidden'] ?? false) === false && $c['key'] !== 'title')));
        $this->assertTrue($columns['values.summary']['card'] ?? false);
        $this->assertSame(['en', 'de'], array_column($records['filters'][1]['options'], 'value'));
    }

    public function test_a_collection_with_many_fields_lists_them_all(): void
    {
        $fields = array_map(static fn (int $i) => ['handle' => "reading{$i}", 'type' => 'text', 'label' => "Reading {$i}"], range(1, 16));
        $this->cms()->collections()->save(Collection::fromArray('surveys', ['title' => 'Surveys', 'fields' => $fields]));

        $records = $this->records('surveys', $this->admin());

        $this->assertContains('values.reading16', array_column($records['columns'], 'key'));

        // However many there are, the list offers what the catalog takes, the first fields first.
        $fields = array_map(static fn (int $i) => ['handle' => "reading{$i}", 'type' => 'text', 'label' => "Reading {$i}"], range(1, 80));
        $this->cms()->collections()->save(Collection::fromArray('surveys', ['title' => 'Surveys', 'fields' => $fields]));
        $keys = array_column($this->records('surveys', $this->admin())['columns'], 'key');

        $this->assertLessThanOrEqual(60, count($keys));
        $this->assertContains('values.reading50', $keys);
        $this->assertNotContains('values.reading51', $keys);
        $this->assertContains('updated', $keys);
    }

    public function test_a_dated_collection_sorts_newest_first_and_offers_a_calendar(): void
    {
        $records = $this->records('posts', $this->admin());

        $this->assertArrayNotHasKey('tree', $records);
        $this->assertSame('-published_at', $records['sort']['default']);
        $this->assertSame('{field}', $records['calendar']['dated']['sort']);
        // It opens as a table, like every list: the calendar is offered, and a collection's Default View can choose it.
        $this->assertSame('table', $records['defaultView']);
        // Tags are a column, but not one entries/list sorts by.
        $this->assertArrayNotHasKey('sort', array_column($records['columns'], null, 'key')['values.tags']);
    }

    public function test_someone_who_may_not_publish_or_delete_is_offered_neither(): void
    {
        $records = $this->records('pages', $this->userWithRole('author'));

        $this->assertSame([], $records['bulk']);
        $this->assertSame(['View on Site', 'Edit', 'Duplicate', 'Copy URL'], array_column($records['actions'], 'label'));
        // A published page stays where it is for them.
        $this->assertSame('{row.status} is not published', $records['tree']['reorder']['when']);
    }

    public function test_someone_who_may_only_look_is_not_offered_edit(): void
    {
        $this->cms()->settingsRegistry()->save(\Cms\Users\Roles::SETTINGS, ['roles' => [...$this->cms()->roles()->defaults(), 'reader' => ['label' => 'Reader', 'description' => '', 'permissions' => ['admin.access', 'entries.pages.view']]]]);

        $this->assertSame(['View on Site', 'Copy URL'], array_column($this->records('pages', $this->userWithRole('reader'))['actions'], 'label'));
    }

    public function test_the_count_beside_a_collections_name_ignores_what_narrows_the_list(): void
    {
        $count = $this->place('posts', $this->admin())['props']['count'];

        // Its language only: not the status filter, not the search.
        $this->assertSame(['collection' => 'posts', 'locale' => '{query.locale}', 'perPage' => 1, 'fields' => []], $count['source']['input']);
        $this->assertSame(['entries/list', 'total'], [$count['source']['ability'], $count['at']]);
    }

    public function test_pages_without_features_that_bring_pages_are_one_list(): void
    {
        $root = $this->place('pages', $this->admin());

        $this->assertSame('ui/records', $root['children'][0]['type']);
        $this->assertSame(['New Page'], array_column($root['props']['actions'], 'label'));
        // The person's saved views are a control of the list, beside Display, and keep what narrows it.
        $this->assertSame(['component' => 'content/views', 'props' => ['list' => 'entries.pages', 'defaultView' => 'table', 'params' => ['search', 'status']]], $root['children'][0]['props']['controls']);
        $this->assertSame('total', $root['props']['count']['at']);
    }

    public function test_the_pages_features_bring_are_rows_of_the_sites_pages(): void
    {
        $this->shop();
        $root = $this->place('pages', $this->admin());

        // One list: no tabs, the page counts and makes pages as any collection does.
        $this->assertSame('ui/records', $root['children'][0]['type']);
        $this->assertSame(['New Page'], array_column($root['props']['actions'], 'label'));
        $this->assertTrue($root['props']['count']['source']['input']['builtin']);
        $records = $root['children'][0]['props'];
        $this->assertTrue($records['source']['input']['builtin']);
        $this->assertTrue($records['tree']['source']['input']['builtin']);
        $this->assertSame('{row.group}', $records['tree']['fixed'], 'A feature\'s page stays where its address puts it');
        $this->assertSame('{row.version}', $records['selectable'], 'Only an entry is picked for what is done to many');
        // A page of the site's opens; a standard version becomes the site's own when it opens.
        $this->assertSame(['/content/{row.collection}/{row.id}', 'pages/customize'], [$records['open'][0]['to'], $records['open'][1]['ability']]);
        $this->assertSame(['View on Site', 'Edit', 'Edit', 'Duplicate', 'Publish', 'Unpublish', 'Copy URL', 'Delete', 'Use Standard Version'], array_column($records['actions'], 'label'));
        $columns = array_column($records['columns'], null, 'key');
        $this->assertSame('pattern', $columns['uri']['muted']);
        $this->assertSame(['conflict' => 'Address Taken'], $columns['displayStatus']['labels']);

        // Without a feature's pages, the list is the collection's own.
        $this->assertArrayNotHasKey('builtin', $this->records('posts', $this->admin())['source']['input']);
    }

    public function test_the_tree_puts_a_features_page_under_the_page_its_address_is_inside(): void
    {
        $this->shop();
        $ctx = AbilityContext::forUser($this->admin(), 'admin');
        $shop = $this->cms()->entryService()->create('pages', ['title' => 'Shop', 'slug' => 'shop', 'status' => 'published'], $this->admin());

        $tree = $this->cms()->abilities()->execute('entries/tree', ['collection' => 'pages', 'builtin' => true], $ctx);
        $top = array_column($tree, null, 'title');
        $this->assertSame(['shop/basket', '/basket', null, 'published'], [$top['Basket']['id'], $top['Basket']['uri'], $top['Basket']['pattern'], $top['Basket']['displayStatus']]);
        $item = array_column($top['Shop']['children'], null, 'title')['Item'];
        $this->assertSame([null, '/shop/{slug}', $shop->id, 'shop'], [$item['uri'], $item['pattern'], $item['parentId'], $item['group']]);
        $this->assertNotContains('Basket', array_column($this->cms()->abilities()->execute('entries/tree', ['collection' => 'pages'], $ctx), 'title'), 'Only when asked');

        // In a list they come after the site's own, found by name or address, and counted.
        $list = $this->cms()->abilities()->execute('entries/list', ['collection' => 'pages', 'builtin' => true, 'perPage' => 200], $ctx);
        $this->assertSame(['Basket', 'Item'], array_slice(array_column($list['items'], 'title'), -2));
        $this->assertSame(count($list['items']), $list['total']);
        $this->assertSame(['Item'], array_column($this->cms()->abilities()->execute('entries/list', ['collection' => 'pages', 'builtin' => true, 'search' => '/shop/'], $ctx)['items'], 'title'));
        $this->assertSame([], array_column($this->cms()->abilities()->execute('entries/list', ['collection' => 'pages', 'builtin' => true, 'status' => 'draft'], $ctx)['items'], 'group'));

        // Paged, they follow the last of the site's own.
        $own = $this->cms()->abilities()->execute('entries/list', ['collection' => 'pages', 'perPage' => 1], $ctx)['total'];
        $page = fn (int $n) => $this->cms()->abilities()->execute('entries/list', ['collection' => 'pages', 'builtin' => true, 'perPage' => $own + 1, 'page' => $n], $ctx);
        $this->assertSame('Basket', array_column($page(1)['items'], 'title')[$own]);
        $this->assertSame(['Item'], array_column($page(2)['items'], 'title'));
        $this->assertSame([$own + 2, 2], [$page(2)['total'], $page(2)['pages']]);

        // Made the site's own, a row is its entry.
        $made = $this->cms()->abilities()->execute('pages/customize', ['group' => 'shop', 'handle' => 'basket'], $ctx);
        $basket = array_column($this->cms()->abilities()->execute('entries/tree', ['collection' => 'pages', 'builtin' => true], $ctx), null, 'title')['Basket'];
        $this->assertSame([$made['id'], 'shop-pages', 'changed', true], [$basket['id'], $basket['collection'], $basket['displayStatus'], $basket['restorable']]);
    }
}

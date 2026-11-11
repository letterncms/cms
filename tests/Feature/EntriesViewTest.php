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
        $this->assertSame(['title', 'uri', 'displayStatus', 'values.summary', 'translations', 'author', 'published', 'updated'], array_keys($columns));
        $this->assertSame(['en', 'de'], $columns['translations']['locales']);
        $this->assertSame(['type' => 'textarea'], $columns['values.summary']['field']);
        $this->assertSame(['summary'], $records['source']['input']['fields']);
        // The standard columns: the address, the state and the dates; the rest wait in Display, a card's excerpt shows on cards.
        $this->assertSame(['uri', 'displayStatus', 'published', 'updated'], array_keys(array_filter($columns, static fn ($c) => ($c['hidden'] ?? false) === false && $c['key'] !== 'title')));
        $this->assertTrue($columns['values.summary']['card'] ?? false);
        $this->assertSame(['en', 'de'], array_column($records['filters'][1]['options'], 'value'));
    }

    public function test_a_dated_collection_sorts_newest_first_and_offers_a_calendar(): void
    {
        $records = $this->records('posts', $this->admin());

        $this->assertArrayNotHasKey('tree', $records);
        $this->assertSame('-published_at', $records['sort']['default']);
        $this->assertSame('{field}', $records['calendar']['dated']['sort']);
        // Tags are a column, but not one entries/list sorts by.
        $this->assertArrayNotHasKey('sort', array_column($records['columns'], null, 'key')['values.tags']);
    }

    public function test_someone_who_may_not_publish_or_delete_is_offered_neither(): void
    {
        $records = $this->records('pages', $this->userWithRole('author'));

        $this->assertSame([], $records['bulk']);
        $this->assertSame(['View on Site', 'Open', 'Duplicate', 'Copy URL'], array_column($records['actions'], 'label'));
        // A published page stays where it is for them.
        $this->assertSame('{row.status} is not published', $records['tree']['reorder']['when']);
    }

    public function test_pages_without_features_that_bring_pages_are_one_list(): void
    {
        $root = $this->place('pages', $this->admin());

        $this->assertSame('ui/records', $root['children'][0]['type']);
        $this->assertSame(['New Page'], array_column($root['props']['actions'], 'label'));
        // The person's saved views are a control of the list, beside Display, and keep what narrows it.
        $this->assertSame(['component' => 'content/views', 'props' => ['list' => 'entries.pages', 'defaultView' => 'table', 'params' => ['search', 'status', 'locale']]], $root['children'][0]['props']['controls']);
        $this->assertSame('total', $root['props']['count']['at']);
    }

    public function test_each_feature_that_brings_pages_has_a_tab_beside_the_sites_pages(): void
    {
        $this->shop();
        $root = $this->place('pages', $this->admin());

        // The page names the place; what is made and counted is the tab's.
        $this->assertArrayNotHasKey('actions', $root['props']);
        $this->assertArrayNotHasKey('count', $root['props']);
        $tabs = array_combine(array_map(static fn ($t) => $t['props']['id'], $root['children'][0]['children']), $root['children'][0]['children']);
        $this->assertSame(['site', 'shop'], array_keys($tabs));
        $this->assertSame(['Site', 'Shop'], [$tabs['site']['props']['label'], $tabs['shop']['props']['label']]);
        $this->assertSame(['New Page'], array_column($tabs['site']['props']['actions'], 'label'));
        $this->assertSame('entries/tree', $tabs['site']['children'][0]['props']['tree']['source']['ability']);

        $shop = $tabs['shop']['children'][0]['props'];
        $this->assertSame(['ability' => 'pages/builtin', 'input' => ['group' => 'shop']], $shop['source']);
        $this->assertSame('0.total', $tabs['shop']['props']['count']['at']);
        // The site's pages' columns and statuses, opened as the site's own version.
        $this->assertSame(['label', 'path', 'displayStatus', 'published', 'updated'], array_column($shop['columns'], 'key'));
        $this->assertSame('pages/customize', $shop['open']['ability']);
        $this->assertSame(['View on Site', 'Open', 'Copy URL', 'Use Standard Version'], array_column($shop['actions'], 'label'));
    }
}

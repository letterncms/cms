<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Tests\TestCase;
use Cms\Users\User;

/** A collection's place is data like every other: its entries are the catalog's `ui/records`, checked against it. */
final class EntriesViewTest extends TestCase
{
    private function records(string $collection, User $user): array
    {
        $view = $this->cms()->abilities()->execute('views/get', ['id' => 'content', 'params' => ['collection' => $collection]], AbilityContext::forUser($user, 'admin'));
        $this->assertSame('ui/page', $view['root']['type']);
        $this->assertSame('ui/records', $view['root']['children'][0]['type']);

        return $view['root']['children'][0]['props'];
    }

    public function test_the_pages_are_a_tree_with_the_built_in_pages_under_them(): void
    {
        $records = $this->records('pages', $this->admin());

        $this->assertSame('entries/tree', $records['tree']['source']['ability']);
        $this->assertSame('entries/reorder', $records['tree']['reorder']['ability']);
        $this->assertArrayNotHasKey('when', $records['tree']['reorder'], 'Who may publish moves published pages too');
        // While nobody picks a sort, the tree is the order.
        $this->assertSame(['param' => 'sort'], $records['sort']);
        $this->assertSame('pages/builtin', $records['appendix']['source']['ability']);
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
        $this->assertArrayNotHasKey('appendix', $records);
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

    public function test_the_built_in_pages_say_where_they_open_and_who_may_customize_them(): void
    {
        $records = $this->records('pages', $this->admin());

        $this->assertSame('/content/{row.collection}/{row.id}', $records['appendix']['open']['to']);
        $this->assertSame('{row.customisable}', $records['appendix']['actions'][0]['when']);
        $this->assertSame(['blank' => true], $records['appendix']['columns']['author']);
    }
}

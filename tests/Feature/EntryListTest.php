<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Tests\TestCase;
use Cms\Users\User;

/** The entries table: sorting in both drivers and the values list screens show. */
final class EntryListTest extends TestCase
{
    protected function collections(): array
    {
        return [...parent::collections(), 'people' => ['title' => 'People', 'fields' => [
            ['handle' => 'role', 'type' => 'select', 'options' => ['lead' => 'Lead', 'dev' => 'Developer']],
            ['handle' => 'owner', 'type' => 'users'],
            ['handle' => 'posts', 'type' => 'entries'],
            ['handle' => 'tags', 'type' => 'tags'],
        ]]];
    }

    private function list(User $user, array $input): array
    {
        return $this->cms()->abilities()->execute('entries/list', $input, AbilityContext::forUser($user, 'rest'));
    }

    private function titles(array $page): array
    {
        return array_column($page['items'], 'title');
    }

    public function test_sorting_is_the_same_in_the_database_and_files_drivers(): void
    {
        $admin = $this->admin();
        $zoe = User::query()->create(['name' => 'Zoe', 'email' => 'zoe@example.com', 'password' => 'secret-pass-123']);
        $adam = User::query()->create(['name' => 'adam', 'email' => 'adam@example.com', 'password' => 'secret-pass-123']);
        $content = $this->cms()->content();

        foreach (['posts' => 'excerpt', 'notes' => 'body'] as $collection => $field) {
            $content->create($collection, ['title' => 'banana', 'data' => [$field => 'b'], 'authorId' => $zoe->id, 'status' => 'published', 'at' => '2026-01-02 10:00:00']);
            $content->create($collection, ['title' => 'Apple', 'data' => [$field => 'c'], 'authorId' => $adam->id, 'status' => 'published', 'at' => '2026-01-03 10:00:00']);
            $content->create($collection, ['title' => 'cherry', 'data' => [$field => 'a']]);

            $sorted = fn (string $sort, ?string $direction = null) => $this->titles($this->list($admin, ['collection' => $collection, 'sort' => $sort, ...($direction ? ['direction' => $direction] : [])]));

            $this->assertSame(['Apple', 'banana', 'cherry'], $sorted('title'), "{$collection}: text ignores case");
            $this->assertSame(['cherry', 'banana', 'Apple'], $sorted('title', 'desc'));
            $this->assertSame(['cherry', 'banana', 'Apple'], $sorted('-title'));
            $this->assertSame(['Apple', 'banana', 'cherry'], $sorted('-title', 'asc'), "{$collection}: direction wins over the prefix");
            $this->assertSame(['banana', 'Apple', 'cherry'], $sorted('published_at'), "{$collection}: undated entries last");
            $this->assertSame(['Apple', 'banana', 'cherry'], $sorted('published_at', 'desc'), "{$collection}: undated entries last, descending too");
            $this->assertSame(['Apple', 'banana', 'cherry'], $sorted('author_id'), "{$collection}: authors by name");
            $this->assertSame(['banana', 'Apple', 'cherry'], $sorted('author_id', 'desc'));
            $this->assertSame(['cherry', 'banana', 'Apple'], $sorted($field), "{$collection}: data fields");
            $this->assertSame(['Apple', 'banana', 'cherry'], $sorted('status', 'desc'), "{$collection}: ties by title");

            $page = $this->list($admin, ['collection' => $collection, 'sort' => 'title', 'perPage' => 2, 'page' => 2]);
            $this->assertSame(['cherry'], $this->titles($page));
            $this->assertSame(3, $page['total']);
        }
    }

    public function test_items_carry_authors_translations_and_requested_values(): void
    {
        $admin = $this->admin();
        $content = $this->cms()->content();
        $post = $content->create('posts', ['title' => 'Launch', 'data' => ['excerpt' => 'x']]);
        $person = $content->create('people', ['title' => 'Ada', 'data' => ['role' => 'lead', 'owner' => [$admin->id], 'posts' => [$post->id], 'tags' => ['math']]], $admin);
        $content->create('people', ['title' => 'Ada (de)', 'locale' => 'de', 'originId' => $person->id]);

        $item = $this->list($admin, ['collection' => 'people', 'locale' => 'en', 'fields' => ['role', 'owner', 'posts', 'tags', 'unknown']])['items'][0];
        $values = (array) $item['values'];

        $this->assertSame('Ada Admin', $item['author']['name']);
        $this->assertSame('AA', $item['author']['initials']);
        $this->assertEqualsCanonicalizing(['en', 'de'], $item['translations']);
        $this->assertSame(['role', 'owner', 'posts', 'tags'], array_keys($values));
        $this->assertSame('lead', $values['role']);
        $this->assertSame('Ada Admin', $values['owner'][0]['name']);
        $this->assertSame(['id' => $post->id, 'collection' => 'posts', 'title' => 'Launch'], $values['posts'][0]);
        $this->assertSame(['math'], $values['tags']);

        $translated = $this->list($admin, ['collection' => 'people', 'locale' => 'de'])['items'][0];
        $this->assertEqualsCanonicalizing(['en', 'de'], $translated['translations']);
        $this->assertArrayNotHasKey('values', $translated);
    }

    public function test_tree_items_carry_values_too(): void
    {
        $admin = $this->admin();
        $content = $this->cms()->content();
        $home = $content->create('pages', ['title' => 'Home', 'data' => ['summary' => 'Start here']], $admin);
        $content->create('pages', ['title' => 'Team', 'parentId' => $home->id, 'data' => ['summary' => 'Who we are']]);

        $tree = $this->cms()->abilities()->execute('entries/tree', ['collection' => 'pages', 'fields' => ['summary']], AbilityContext::forUser($admin, 'rest'));

        $this->assertSame('Start here', ((array) $tree[0]['values'])['summary']);
        $this->assertSame('Ada Admin', $tree[0]['author']['name']);
        $this->assertSame('Who we are', ((array) $tree[0]['children'][0]['values'])['summary']);
    }
}

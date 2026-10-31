<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Tests\TestCase;

final class ContentSearchTest extends TestCase
{
    public function test_search_ranks_titles_and_slugs_before_recent_body_matches_in_both_drivers(): void
    {
        $admin = $this->admin();
        $context = AbilityContext::forUser($admin, 'rest');
        $content = $this->cms()->content();

        foreach (['posts' => 'excerpt', 'notes' => 'body'] as $collection => $field) {
            $this->travelTo(now()->subDay());
            $exact = $content->create($collection, ['title' => 'Agents', 'slug' => 'bots', 'data' => [$field => '']]);
            $slug = $content->create($collection, ['title' => 'Overview', 'slug' => 'agents', 'data' => [$field => '']]);
            $prefix = $content->create($collection, ['title' => 'Agents guide', 'data' => [$field => '']]);
            $substring = $content->create($collection, ['title' => 'Connect agents', 'data' => [$field => '']]);
            $this->travelBack();

            // Enough newer body matches to push the exact title outside the old limit.
            for ($i = 0; $i < 10; $i++) {
                $content->create($collection, ['title' => "Recent page {$i}", 'data' => [$field => 'Learn about agents here.']]);
            }

            $search = fn (int $limit) => $this->cms()->abilities()->execute('content/search', ['query' => 'AGENTS', 'collections' => [$collection], 'limit' => $limit], $context);

            $this->assertSame([$exact->id, $slug->id, $prefix->id], array_column($search(3), 'id'), $collection);
            $all = $search(50);
            $this->assertSame([$exact->id, $slug->id, $prefix->id, $substring->id], array_slice(array_column($all, 'id'), 0, 4), $collection);
            $this->assertCount(14, $all, 'Body-only results must still be available.');
            $this->assertSame(array_column($all, 'id'), array_column($search(50), 'id'), 'Ties must have a stable order.');
        }
    }

    public function test_search_keeps_relevance_when_merging_database_and_file_results(): void
    {
        $context = AbilityContext::forUser($this->admin(), 'rest');
        $content = $this->cms()->content();
        $this->travelTo(now()->subDay());
        $exact = $content->create('notes', ['title' => 'Agents', 'data' => ['body' => '']]);
        $this->travelBack();

        for ($i = 0; $i < 10; $i++) {
            $content->create('posts', ['title' => "Recent page {$i}", 'data' => ['excerpt' => 'agents']]);
        }

        $results = $this->cms()->abilities()->execute('content/search', ['query' => 'agents', 'limit' => 1], $context);
        $this->assertSame([$exact->id], array_column($results, 'id'));
    }

    public function test_search_treats_sql_wildcards_as_literal_characters(): void
    {
        $context = AbilityContext::forUser($this->admin(), 'rest');
        $content = $this->cms()->content();

        foreach (['posts' => 'excerpt', 'notes' => 'body'] as $collection => $field) {
            $expected = $content->create($collection, ['title' => '100% ready_now!', 'data' => [$field => '']]);
            $content->create($collection, ['title' => '100x ready now!', 'data' => [$field => '']]);
            $results = $this->cms()->abilities()->execute('content/search', ['query' => '% ready_', 'collections' => [$collection]], $context);
            $this->assertSame([$expected->id], array_column($results, 'id'), $collection);
        }
    }
}

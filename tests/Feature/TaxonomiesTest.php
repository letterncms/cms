<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Content\Fields\Blueprint;
use Cms\Tests\TestCase;

/** A taxonomy is a collection whose entries are terms; a terms field files entries under them. */
final class TaxonomiesTest extends TestCase
{
    protected function collections(): array
    {
        return [
            ...parent::collections(),
            'topics' => ['title' => 'Topics', 'singular' => 'Topic', 'taxonomy' => true, 'structure' => 'tree', 'route' => '/topics/{parent_uri}/{slug}', 'fields' => [['handle' => 'description', 'type' => 'textarea']]],
            'articles' => ['title' => 'Articles', 'route' => '/articles/{slug}', 'fields' => [
                ['handle' => 'topics', 'type' => 'terms', 'taxonomy' => 'topics'],
                ['handle' => 'tags', 'type' => 'tags'],
            ]],
            'memos' => ['title' => 'Memos', 'driver' => 'files', 'route' => '/memos/{slug}', 'fields' => [
                ['handle' => 'topics', 'type' => 'terms', 'taxonomy' => 'topics', 'max' => 2],
                ['handle' => 'tags', 'type' => 'tags'],
            ]],
        ];
    }

    private function ability(string $name, array $input = []): mixed
    {
        return $this->cms()->abilities()->execute($name, $input, AbilityContext::system());
    }

    public function test_terms_are_entries_of_a_taxonomy_picked_by_id_slug_or_title(): void
    {
        $content = $this->cms()->entryService();
        $news = $content->create('topics', ['title' => 'News', 'status' => 'published', 'data' => ['description' => 'What happened.']]);
        $local = $content->create('topics', ['title' => 'Local News', 'parentId' => $news->id, 'status' => 'published']);
        $page = $content->create('pages', ['title' => 'A page']);

        $this->assertTrue($this->cms()->collections()->find('topics')->isTaxonomy());
        $this->assertSame('/topics/news/local-news', $local->uri);
        $this->assertSame(['topics' => true], array_filter(array_column($this->ability('collections/list'), 'taxonomy', 'handle')));

        foreach (['articles', 'memos'] as $collection) {
            $entry = $content->create($collection, ['title' => 'Flood', 'status' => 'published', 'data' => ['topics' => ['news', 'Local News']]]);
            $this->cms()->entries()->flush();
            $this->assertSame([$news->id, $local->id], $this->cms()->entries()->find($entry->id)->data['topics'], $collection);

            foreach ([['nowhere'], [$page->id]] as $bad) {
                try {
                    $content->update($entry->id, ['data' => ['topics' => $bad]]);
                    $this->fail('Took '.json_encode($bad));
                } catch (AbilityException $e) {
                    $this->assertSame(['data.topics.0'], array_keys($e->details));
                }
            }
        }

        // The picker and agents are told where terms come from.
        $field = array_column($this->ability('collections/get', ['handle' => 'articles'])['resolvedFields'], null, 'handle')['topics'];
        $this->assertSame(['topics'], $field['collections']);
        $schema = $this->ability('collections/schema', ['handle' => 'memos'])['data']['properties']['topics'];
        $this->assertSame(['array', 'string', 2], [$schema['type'], $schema['items']['type'], $schema['maxItems']]);
        $this->assertSame('entries', array_column($this->ability('fields/types'), null, 'key')['terms']['component']);

        // A terms field names a taxonomy.
        Blueprint::validate([['handle' => 'topics', 'type' => 'terms', 'taxonomy' => 'topics']]);

        foreach ([[], ['taxonomy' => 'pages'], ['taxonomy' => 'nope']] as $config) {
            try {
                Blueprint::validate([['handle' => 'topics', 'type' => 'terms', ...$config]]);
                $this->fail('Took '.json_encode($config));
            } catch (\InvalidArgumentException $e) {
                $this->assertStringContainsString('topics', $e->getMessage());
            }
        }
    }

    public function test_terms_are_listed_with_their_counts_and_filter_the_content_api(): void
    {
        $content = $this->cms()->entryService();
        $news = $content->create('topics', ['title' => 'News', 'status' => 'published']);
        $sport = $content->create('topics', ['title' => 'Sport', 'status' => 'published']);
        $content->create('topics', ['title' => 'Unused', 'status' => 'published']);
        $content->create('articles', ['title' => 'One', 'status' => 'published', 'data' => ['topics' => [$news->id]]]);
        $content->create('articles', ['title' => 'Two', 'status' => 'published', 'data' => ['topics' => [$news->id, $sport->id]]]);
        $content->create('articles', ['title' => 'Draft', 'data' => ['topics' => [$sport->id]]]);
        $content->create('memos', ['title' => 'Memo', 'status' => 'published', 'data' => ['topics' => [$news->id]]]);

        $terms = $this->ability('terms/list', ['taxonomy' => 'topics']);
        $this->assertSame(['News' => 3, 'Sport' => 2, 'Unused' => 0], array_column($terms['items'], 'count', 'title'));
        $this->assertSame(3, $terms['total']);
        $this->assertSame(['Sport'], array_column($this->ability('terms/list', ['taxonomy' => 'topics', 'search' => 'spo'])['items'], 'title'));

        try {
            $this->ability('terms/list', ['taxonomy' => 'pages']);
            $this->fail('Pages are no taxonomy.');
        } catch (AbilityException $e) {
            $this->assertSame('not_found', $e->type);
        }

        // By slug or by id; only what is published.
        $this->getJson('/api/v1/content/articles?filter[topics]=news&sort=title')->assertOk()->assertJsonCount(2, 'data')->assertJsonPath('data.1.title', 'Two');
        $this->getJson('/api/v1/content/articles?filter[topics]='.$sport->id)->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'Two');
        $this->getJson('/api/v1/content/memos?filter[topics]=news')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/content/articles?filter[topics]=nope')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/content/topics/news')->assertOk()->assertJsonPath('data.title', 'News');
        $this->getJson('/api/v1/content/articles?references='.$news->id)->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_free_tags_become_terms(): void
    {
        $content = $this->cms()->entryService();
        $existing = $content->create('topics', ['title' => 'Local news', 'slug' => 'local-news', 'status' => 'published']);
        $live = $content->create('articles', ['title' => 'Live', 'status' => 'published', 'data' => ['tags' => ['Local News', 'Weather']]]);
        $draft = $content->create('articles', ['title' => 'Draft', 'data' => ['tags' => ['Weather'], 'topics' => [$existing->id]]]);
        $changed = $content->create('articles', ['title' => 'Changed', 'status' => 'published', 'data' => ['tags' => ['Weather']]]);
        $content->update($changed->id, ['title' => 'Changed again']);
        $content->create('articles', ['title' => 'Plain']);

        $dry = $this->ability('terms/import', ['collection' => 'articles', 'from' => 'tags', 'into' => 'topics', 'dryRun' => true]);
        $this->assertSame('full', $dry['checked']);
        $this->assertSame(['create-published', 'update', 'update', 'update'], array_column($dry['changes'], 'action'));
        $this->assertSame(1, $this->cms()->entries()->query()->collection('topics')->count(), 'A dry run makes nothing.');

        $this->assertSame(['terms' => 1, 'entries' => 3, 'collisions' => []], $this->ability('terms/import', ['collection' => 'articles', 'from' => 'tags', 'into' => 'topics']));
        $weather = $this->cms()->entries()->query()->collection('topics')->where('slug', 'weather')->first();
        $this->assertTrue($weather->isLive());

        $entries = $this->cms()->entries();
        $this->assertSame([$existing->id, $weather->id], $entries->find($live->id)->data['topics']);
        $this->assertFalse($entries->find($live->id)->hasDraft());
        $this->assertSame([$existing->id, $weather->id], $entries->find($draft->id)->data['topics']);
        $this->assertSame([], $entries->find($changed->id)->data['topics'] ?? [], 'What is live keeps waiting for its changes.');
        $this->assertSame([$weather->id], $entries->find($changed->id)->working()['data']['topics']);
        $this->assertSame(['Local News', 'Weather'], $entries->find($live->id)->data['tags']);

        // Again changes nothing; clearing empties the tags.
        $this->assertSame(['terms' => 0, 'entries' => 0, 'collisions' => []], $this->ability('terms/import', ['collection' => 'articles', 'from' => 'tags', 'into' => 'topics']));
        $this->assertSame(['terms' => 0, 'entries' => 3, 'collisions' => []], $this->ability('terms/import', ['collection' => 'articles', 'from' => 'tags', 'into' => 'topics', 'clear' => true]));
        $this->assertSame([], $entries->find($live->id)->data['tags']);

        try {
            $this->ability('terms/import', ['collection' => 'articles', 'from' => 'topics', 'into' => 'tags']);
            $this->fail('Took a terms field for tags.');
        } catch (AbilityException $e) {
            $this->assertSame('invalid_input', $e->type);
        }
    }

    public function test_tags_a_slug_cannot_keep_become_terms_once_and_a_scheduled_entry_stays_scheduled(): void
    {
        $content = $this->cms()->entryService();
        $import = ['collection' => 'articles', 'from' => 'tags', 'into' => 'topics'];
        $one = $content->create('articles', ['title' => 'One', 'status' => 'published', 'data' => ['tags' => ['日本', 'C++', 'C#', 'c++']]]);
        $later = $content->create('articles', ['title' => 'Later', 'status' => 'published', 'at' => '2031-01-01T10:00:00+00:00', 'data' => ['tags' => ['日本']]]);
        $this->assertTrue($later->isScheduled());

        $dry = $this->ability('terms/import', [...$import, 'dryRun' => true]);
        $this->assertSame(['create-published', 'create-published', 'create-published', 'collision', 'update', 'update'], array_column($dry['changes'], 'action'));
        $this->assertSame(['C#', 'C++'], [$dry['changes'][3]['tag'], $dry['changes'][3]['existing']]);

        $result = $this->ability('terms/import', $import);
        $this->assertSame([3, 2], [$result['terms'], $result['entries']]);
        $this->assertSame([['tag' => 'C#', 'existing' => 'C++', 'locale' => 'en']], array_map(static fn (array $c) => array_diff_key($c, ['slug' => 1]), $result['collisions']));

        $terms = $this->cms()->entries()->query()->collection('topics')->orderBy('title')->get();
        $this->assertSame(['C#', 'C++', '日本'], array_map(static fn ($t) => $t->title, $terms));
        $this->assertCount(3, array_unique(array_map(static fn ($t) => $t->slug, $terms)));
        $this->assertSame('c', $terms[1]->slug);
        $this->assertStringStartsWith('term-', $terms[2]->slug);
        // "c++" is "C++": three terms on the entry, not four.
        $this->assertCount(3, $this->cms()->entries()->find($one->id)->data['topics']);

        $scheduled = $this->cms()->entries()->find($later->id);
        $this->assertTrue($scheduled->isScheduled(), 'An import does not publish what waits for its date.');
        $this->assertSame('2031-01-01T10:00:00+00:00', $scheduled->publishedAt->toIso8601String());
        $this->assertSame([$terms[2]->id], $scheduled->data['topics']);

        // Again: nothing to make, nothing to change.
        $this->assertSame(['terms' => 0, 'entries' => 0, 'collisions' => []], $this->ability('terms/import', $import));
        $this->assertSame([], $this->ability('terms/import', [...$import, 'dryRun' => true])['changes']);
        $this->assertSame(3, $this->cms()->entries()->query()->collection('topics')->count());
    }

    public function test_a_term_is_named_in_the_entrys_language_and_an_ambiguous_name_is_refused(): void
    {
        $content = $this->cms()->entryService();
        $news = $content->create('topics', ['title' => 'News', 'status' => 'published']);
        $nieuws = $content->create('topics', ['title' => 'Nachrichten', 'slug' => 'news', 'locale' => 'de', 'originId' => $news->id, 'status' => 'published']);
        $europe = $content->create('topics', ['title' => 'Europe', 'status' => 'published']);
        $asia = $content->create('topics', ['title' => 'Asia', 'status' => 'published']);
        $content->create('topics', ['title' => 'Cities', 'parentId' => $europe->id, 'status' => 'published']);
        $content->create('topics', ['title' => 'Cities', 'parentId' => $asia->id, 'status' => 'published']);

        $this->assertSame([$news->id], $content->create('articles', ['title' => 'English', 'data' => ['topics' => ['news']]])->data['topics']);
        $this->assertSame([$nieuws->id], $content->create('articles', ['title' => 'Deutsch', 'locale' => 'de', 'data' => ['topics' => ['news']]])->data['topics']);
        $this->assertSame([$nieuws->id], $content->create('articles', ['title' => 'Deutsch 2', 'locale' => 'de', 'data' => ['topics' => ['nachrichten']]])->data['topics']);

        foreach ([['locale' => 'en', 'topics' => ['cities'], 'says' => 'Several'], ['locale' => 'de', 'topics' => ['Europe'], 'says' => 'no term'], ['locale' => 'en', 'topics' => ['Nachrichten'], 'says' => 'no term']] as $case) {
            try {
                $content->create('articles', ['title' => 'Bad', 'locale' => $case['locale'], 'data' => ['topics' => $case['topics']]]);
                $this->fail('Took '.json_encode($case));
            } catch (AbilityException $e) {
                $this->assertSame(['data.topics.0'], array_keys($e->details));
                $this->assertStringContainsString($case['says'], $e->details['data.topics.0']);
            }
        }
    }
}

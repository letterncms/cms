<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Content\Fields\Blueprint;
use Cms\Tests\TestCase;

/** A taxonomy is a collection of categories or tags whose entries are terms; a terms field files entries under them. */
final class TaxonomiesTest extends TestCase
{
    protected function collections(): array
    {
        return [
            ...parent::collections(),
            'topics' => ['title' => 'Topics', 'singular' => 'Topic', 'type' => 'categories', 'route' => '/topics/{parent_uri}/{slug}', 'fields' => [['handle' => 'description', 'type' => 'textarea']]],
            'labels' => ['title' => 'Labels', 'singular' => 'Label', 'type' => 'tags', 'route' => '/labels/{slug}', 'fields' => []],
            'articles' => ['title' => 'Articles', 'route' => '/articles/{slug}', 'fields' => [
                ['handle' => 'topics', 'type' => 'terms', 'taxonomy' => 'topics'],
                ['handle' => 'labels', 'type' => 'terms', 'taxonomy' => 'labels', 'max' => 3],
                ['handle' => 'rows', 'type' => 'repeater', 'fields' => [['handle' => 'labels', 'type' => 'terms', 'taxonomy' => 'labels']]],
                ['handle' => 'tags', 'type' => 'list'],
            ]],
            'memos' => ['title' => 'Memos', 'driver' => 'files', 'route' => '/memos/{slug}', 'fields' => [
                ['handle' => 'topics', 'type' => 'terms', 'taxonomy' => 'topics', 'max' => 2],
                ['handle' => 'tags', 'type' => 'list'],
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
        $this->assertEquals(['topics' => 'categories', 'labels' => 'tags'], array_filter(array_column($this->ability('collections/list'), 'type', 'handle'), static fn ($type) => $type !== 'entries'));

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
        $this->assertSame('terms', array_column($this->ability('fields/types'), null, 'key')['terms']['component']);
        $this->assertFalse($field['tags']);

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

    public function test_a_collections_type_decides_what_its_entries_are(): void
    {
        $topics = $this->cms()->collections()->find('topics');
        $labels = $this->cms()->collections()->find('labels');
        $this->assertSame(['categories', 'tree', 'position', 'taxonomies', 'folder'], [$topics->type, $topics->structure, $topics->sort, $topics->section, $topics->icon]);
        $this->assertSame(['tags', 'list', 'title', 'taxonomies', 'tag'], [$labels->type, $labels->structure, $labels->sort, $labels->section, $labels->icon]);
        $this->assertSame(['entries', 'entries'], [$this->cms()->collections()->find('articles')->type, $this->cms()->collections()->find('articles')->section]);
        // A taxonomy's structure is its type's: it is not written down.
        $this->assertArrayNotHasKey('structure', $topics->toYaml());
        $this->assertSame('categories', $topics->toYaml()['type']);
        $this->assertArrayNotHasKey('type', $this->cms()->collections()->find('articles')->toYaml());

        // A taxonomy's structure is its type's, whatever the definition says.
        $this->ability('collections/save', ['handle' => 'odd', 'definition' => ['title' => 'Odd', 'type' => 'tags', 'structure' => 'tree']]);
        $this->assertSame('list', $this->cms()->collections()->find('odd')->structure);

        try {
            $this->ability('collections/save', ['handle' => 'odd', 'definition' => ['title' => 'Odd', 'type' => 'folders']]);
            $this->fail('Took an unknown type.');
        } catch (AbilityException $e) {
            $this->assertSame('invalid_input', $e->type);
        }

        // The type can change: entries become tags, and tags categories.
        $this->ability('collections/save', ['handle' => 'notes', 'definition' => ['title' => 'Notes']]);
        $this->ability('collections/save', ['handle' => 'notes', 'definition' => ['title' => 'Notes', 'type' => 'tags']]);
        $this->assertSame(['tags', 'list', 'taxonomies'], [$this->cms()->collections()->find('notes')->type, $this->cms()->collections()->find('notes')->structure, $this->cms()->collections()->find('notes')->section]);
        $this->ability('collections/save', ['handle' => 'notes', 'definition' => ['title' => 'Notes', 'type' => 'categories']]);
        $this->assertSame('tree', $this->cms()->collections()->find('notes')->structure);

        // Nested terms cannot be laid out flat, and a taxonomy in use stays one.
        $content = $this->cms()->entryService();
        $content->create('notes', ['title' => 'Child', 'parentId' => $content->create('notes', ['title' => 'Parent'])->id]);
        foreach ([['handle' => 'notes', 'type' => 'tags', 'says' => 'nested'], ['handle' => 'topics', 'type' => 'entries', 'says' => 'Articles']] as $case) {
            try {
                $this->ability('collections/save', ['handle' => $case['handle'], 'definition' => ['title' => 'Changed', 'type' => $case['type'], 'fields' => []]]);
                $this->fail('Changed '.$case['handle']);
            } catch (AbilityException $e) {
                $this->assertStringContainsString($case['says'], $e->getMessage());
                $this->assertArrayHasKey('definition.type', $e->details);
            }
        }
        $this->assertSame(['categories', 'categories'], [$this->cms()->collections()->find('notes')->type, $this->cms()->collections()->find('topics')->type]);

        // A nested one can become entries of a tree.
        $this->ability('collections/save', ['handle' => 'notes', 'definition' => ['title' => 'Notes', 'structure' => 'tree']]);
        $this->assertSame(['entries', 'tree'], [$this->cms()->collections()->find('notes')->type, $this->cms()->collections()->find('notes')->structure]);

        // A taxonomy that fields pick from cannot be deleted from under them.
        try {
            $this->ability('collections/delete', ['handle' => 'labels']);
            $this->fail('Deleted a taxonomy in use.');
        } catch (AbilityException $e) {
            $this->assertStringContainsString('Articles', $e->getMessage());
        }
        $this->ability('collections/save', ['handle' => 'unused', 'definition' => ['title' => 'Unused', 'type' => 'tags']]);
        $this->assertSame('unused', $this->ability('collections/delete', ['handle' => 'unused'])['deleted']);
    }

    public function test_a_tag_typed_into_an_entry_is_made_once(): void
    {
        $content = $this->cms()->entryService();
        $coast = $content->create('labels', ['title' => 'Coast', 'status' => 'published']);

        // An existing tag by its name in any case, a new one by its name; the same name twice is one tag.
        $entry = $content->create('articles', ['title' => 'Walk', 'data' => ['labels' => ['coast', 'Sea', 'sea '], 'rows' => [['labels' => ['Sea', 'Sand']]]]]);
        $tags = $this->cms()->entries()->query()->collection('labels')->orderBy('title')->get();
        $this->assertSame(['Coast', 'Sand', 'Sea'], array_map(static fn ($t) => $t->title, $tags));
        $this->assertTrue($tags[2]->isLive(), 'A tag is published as it is made.');
        $this->assertSame([$coast->id, $tags[2]->id], $entry->data['labels']);
        $this->assertSame([$tags[2]->id, $tags[1]->id], $entry->data['rows'][0]['labels'], 'A tag in a repeater row is made like any other.');

        // Saving the name again finds the tag it made.
        $this->assertSame([$tags[2]->id], $content->update($entry->id, ['data' => ['labels' => ['Sea']]])->working()['data']['labels']);
        $this->assertSame(3, $this->cms()->entries()->query()->collection('labels')->count());

        // A save that is refused makes no tag, not even those it could hold.
        try {
            $content->update($entry->id, ['data' => ['labels' => ['One', 'Two', 'Three', 'Four']]]);
            $this->fail('Took four tags in a field of three.');
        } catch (AbilityException $e) {
            $this->assertArrayHasKey('data.labels', $e->details);
        }
        $this->assertSame(3, $this->cms()->entries()->query()->collection('labels')->count());

        // Categories are picked, never made by a name.
        try {
            $content->create('articles', ['title' => 'Bad', 'data' => ['topics' => ['Weather']]]);
            $this->fail('Made a category.');
        } catch (AbilityException $e) {
            $this->assertStringContainsString('no term', $e->details['data.topics.0']);
        }
    }

    public function test_a_tag_is_made_in_a_dry_run_only_as_the_entry_is_and_by_who_may(): void
    {
        $dry = $this->cms()->abilities()->execute('entries/create', ['collection' => 'articles', 'title' => 'Walk', 'data' => ['labels' => ['Sea', 'sea']], 'dryRun' => true], AbilityContext::system());
        $this->assertSame('full', $dry['checked']);
        $this->assertSame(0, $this->cms()->entries()->query()->collection('labels')->count(), 'A dry run makes nothing.');

        // Who may make entries of the taxonomy may make a tag: a draft until someone publishes it when they may not
        // publish; who may not make them is told the tag is not there.
        $author = $this->userWithRole('author');
        $made = $this->cms()->entryService()->create('articles', ['title' => 'By an author', 'data' => ['labels' => ['Sea']]], $author);
        $this->assertSame('draft', $this->cms()->entries()->find($made->data['labels'][0])->status);
        $this->assertSame($made->data['labels'], $this->cms()->entryService()->create('articles', ['title' => 'Again', 'data' => ['labels' => ['sea']]], $author)->data['labels'], 'The draft is the tag of that name.');
        $edited = $this->cms()->entryService()->create('articles', ['title' => 'By an editor', 'data' => ['labels' => ['Sand']]], $this->userWithRole('editor'));
        $this->assertTrue($this->cms()->entries()->find($edited->data['labels'][0])->isLive());

        $this->ability('settings/update', ['namespace' => 'roles', 'values' => ['roles' => [...$this->cms()->roles()->all(), 'writer' => ['label' => 'Writer', 'description' => '', 'permissions' => ['admin.access', 'entries.articles.*', 'entries.labels.view']]]]]);
        try {
            $this->cms()->entryService()->create('articles', ['title' => 'By a writer', 'data' => ['labels' => ['Shell']]], $this->userWithRole('writer'));
            $this->fail('Made a tag without the right to.');
        } catch (AbilityException $e) {
            $this->assertStringContainsString('may not add tags', $e->details['data.labels.0']);
        }
        $this->assertNull($this->cms()->entries()->query()->collection('labels')->where('slug', 'shell')->first());
    }

    public function test_a_list_field_holds_short_values_that_file_nothing(): void
    {
        $entry = $this->cms()->entryService()->create('articles', ['title' => 'Listed', 'data' => ['tags' => [' sea ', 'sea', '<b>sand</b>', '']]]);
        $this->assertSame(['sea', 'sand'], $entry->data['tags']);
        $this->assertSame(0, $this->cms()->entries()->query()->collection('labels')->count());
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

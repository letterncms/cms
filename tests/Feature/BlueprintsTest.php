<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Support\Schema\Validator;
use Cms\Tests\TestCase;

/** A collection can have several sets of fields; an entry is made with one and keeps it. */
final class BlueprintsTest extends TestCase
{
    private const array DEFINITION = [
        'route' => '/news/{slug}', 'body' => 'body',
        'fields' => [['handle' => 'body', 'type' => 'markdown'], ['handle' => 'summary', 'type' => 'textarea', 'default' => 'None yet.']],
        'blueprints' => [
            'video' => ['title' => 'Video', 'fields' => [['handle' => 'body', 'type' => 'markdown'], ['handle' => 'source', 'type' => 'url', 'required' => true], ['handle' => 'length', 'type' => 'number', 'default' => 60, 'localizable' => false]]],
            'gallery' => ['fields' => [['handle' => 'about', 'type' => 'entries', 'collections' => ['pages']]]],
        ],
    ];

    protected function collections(): array
    {
        return [
            ...parent::collections(),
            'news' => ['title' => 'News', ...self::DEFINITION],
            'clips' => ['title' => 'Clips', 'driver' => 'files', ...self::DEFINITION, 'route' => '/clips/{slug}'],
        ];
    }

    private function ability(string $name, array $input = []): mixed
    {
        return $this->cms()->abilities()->execute($name, $input, AbilityContext::system());
    }

    public function test_an_entry_follows_the_blueprint_it_was_made_with_on_both_drivers(): void
    {
        $content = $this->cms()->entryService();

        foreach (['news', 'clips'] as $collection) {
            $plain = $this->ability('entries/create', ['collection' => $collection, 'title' => 'Plain', 'data' => ['body' => 'Words.']]);
            $this->assertNull($plain['blueprint']);
            $this->assertSame('None yet.', $plain['data']['summary']);

            $video = $this->ability('entries/create', ['collection' => $collection, 'blueprint' => 'video', 'title' => 'Clip', 'data' => ['body' => 'Watch **this**.']]);
            $this->assertSame('video', $video['blueprint']);
            $this->assertSame(60, $video['data']['length']);
            $this->assertArrayNotHasKey('summary', $video['data']);

            // Its own required field, not the collection's.
            try {
                $content->publish($video['id']);
                $this->fail('Published a video without its source.');
            } catch (AbilityException $e) {
                $this->assertSame(['data.source'], array_keys($e->details));
            }

            $this->assertTrue($content->publish($plain['id'])->isPublished());
            $content->update($video['id'], ['data' => ['source' => 'https://example.com/clip.mp4']], publish: true);

            $this->cms()->entries()->flush();
            $read = $this->cms()->entries()->find($video['id']);
            $this->assertSame(['video', 'https://example.com/clip.mp4', 'Watch **this**.'], [$read->blueprint, $read->data['source'], trim($read->data['body'])], $collection);
            $this->assertSame(['body', 'source', 'length'], array_map(static fn ($f) => $f->handle, $read->blueprint()->fields()));

            // A copy and a translation have the blueprint of their source; the shared field follows the original.
            $this->assertSame('video', $content->duplicate($video['id'])->blueprint);
            $german = $content->create($collection, ['title' => 'Clip de', 'locale' => 'de', 'originId' => $video['id'], 'data' => ['length' => 1]]);
            $this->assertSame(['video', 60], [$german->blueprint, $german->data['length']]);

            foreach ([['blueprint' => 'audio'], ['blueprint' => 'video', 'data' => ['source' => 'no address']]] as $bad) {
                try {
                    $this->ability('entries/create', ['collection' => $collection, 'title' => 'Bad', ...$bad]);
                    $this->fail('Took '.json_encode($bad));
                } catch (AbilityException $e) {
                    $this->assertSame('invalid_input', $e->type);
                }
            }
        }

        $this->assertStringContainsString("blueprint: video\n", (string) file_get_contents($this->site.'/content/collections/clips/clip.md'));

        // Relations of every blueprint are found from the other side, and a list reads fields of any of them.
        $page = $content->create('pages', ['title' => 'About']);
        $content->create('news', ['title' => 'Pictures', 'blueprint' => 'gallery', 'data' => ['about' => [$page->id]]]);
        $this->assertSame(['Pictures'], array_column($this->ability('references/list', ['id' => $page->id])['items'], 'title'));
        // One handle, a text in one blueprint and a list in another: each is asked as what it is.
        $this->cms()->collections()->save(\Cms\Content\Collections\Collection::fromArray('news', ['title' => 'News', ...self::DEFINITION, 'blueprints' => [...self::DEFINITION['blueprints'], 'gallery' => ['fields' => [['handle' => 'about', 'type' => 'entries', 'collections' => ['pages']], ['handle' => 'summary', 'type' => 'tags']]]]]));
        $content->create('news', ['title' => 'Tagged', 'blueprint' => 'gallery', 'data' => ['summary' => ['None yet.', 'x']]]);
        $this->assertSame(['Tagged'], array_column($this->ability('entries/list', ['collection' => 'news', 'filters' => [['field' => 'summary', 'operator' => 'contains', 'value' => 'x']]])['items'], 'title'));
        $this->assertSame(['Plain', 'Tagged'], array_column($this->ability('entries/list', ['collection' => 'news', 'sort' => 'title', 'filters' => [['field' => 'summary', 'operator' => 'contains', 'value' => 'None yet.']]])['items'], 'title'));
        $this->assertSame(['Plain'], array_column($this->ability('entries/list', ['collection' => 'news', 'filters' => [['field' => 'summary', 'operator' => 'contains', 'value' => 'none']]])['items'], 'title'));

        $listed = $this->ability('entries/list', ['collection' => 'news', 'fields' => ['source', 'about'], 'sort' => 'title']);
        $this->assertSame('About', array_column($listed['items'], 'values', 'title')['Pictures']->about[0]['title']);
    }

    public function test_the_schema_has_a_set_per_blueprint(): void
    {
        $schema = $this->ability('collections/schema', ['handle' => 'news']);

        $this->assertSame(['body', 'summary'], array_keys($schema['data']['properties']));
        $this->assertSame(['video', 'gallery'], array_column($schema['blueprints'], 'handle'));
        $this->assertSame(['Video', 'Gallery'], array_column($schema['blueprints'], 'title'));
        $video = $schema['blueprints'][0];
        $this->assertSame(['source'], $video['data']['required']);
        $this->assertArrayNotHasKey('required', $video['draft']);
        $this->assertSame(['const' => 'video'], $video['create']['properties']['blueprint']);
        $this->assertSame(['collection', 'title', 'blueprint'], $video['create']['required']);
        Validator::validate(['collection' => 'news', 'blueprint' => 'video', 'title' => 'Fine', 'data' => ['source' => 'https://example.com/a.mp4']], $video['create']);
        $this->assertArrayNotHasKey('blueprints', $this->ability('collections/schema', ['handle' => 'posts']));

        $collection = $this->ability('collections/get', ['handle' => 'news']);
        $this->assertSame(['body', 'source', 'length'], array_column($collection['resolvedBlueprints'][0]['resolvedFields'], 'handle'));
        $this->assertArrayNotHasKey('resolvedBlueprints', $this->ability('collections/get', ['handle' => 'posts']));
    }

    public function test_blueprints_are_checked_when_a_collection_is_saved(): void
    {
        $saved = $this->ability('collections/save', ['handle' => 'events', 'definition' => ['title' => 'Events', 'fields' => [], 'blueprints' => ['talk' => ['title' => 'Talk', 'fields' => [['handle' => 'speaker', 'type' => 'text']]]]]]);
        $this->assertSame('Talk', $saved['blueprints']['talk']['title']);
        $this->assertSame(['talk'], array_keys($this->cms()->collections()->find('events')->blueprints()));

        foreach ([
            [['title' => 'A list']],
            ['Bad Handle' => ['fields' => []]],
            ['talk' => ['fields' => [['handle' => 'x', 'type' => 'nope']]]],
            ['talk' => ['fields' => [['handle' => 'slug', 'type' => 'text']]]],
        ] as $blueprints) {
            try {
                $this->ability('collections/save', ['handle' => 'events', 'definition' => ['title' => 'Events', 'fields' => [], 'blueprints' => $blueprints]]);
                $this->fail('Took '.json_encode($blueprints));
            } catch (AbilityException $e) {
                $this->assertSame('invalid_input', $e->type);
            }
        }
    }
}

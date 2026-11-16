<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Modules\Blocks\Document;
use Cms\Modules\Site\Rendering\Renderer;
use Cms\Tests\TestCase;

/** A term has a page that lists what is filed under it, and pages list terms with their counts. */
final class TaxonomyPagesTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    protected function collections(): array
    {
        return [
            'pages' => ['title' => 'Pages', 'route' => '/{slug}', 'fields' => [['handle' => 'content', 'type' => 'blocks', 'body' => true]]],
            'topics' => ['title' => 'Topics', 'type' => 'tags', 'route' => '/topics/{slug}', 'fields' => [['handle' => 'content', 'type' => 'blocks', 'body' => true]]],
            'posts' => ['title' => 'Posts', 'route' => '/blog/{slug}', 'fields' => [['handle' => 'content', 'type' => 'blocks', 'body' => true], ['handle' => 'topics', 'type' => 'terms', 'taxonomy' => 'topics']]],
        ];
    }

    private function text(string $id): string
    {
        $entry = $this->cms()->entries()->find($id);

        return $this->app->make(Document::class)->text($this->app->make(Renderer::class)->materialize($entry, $entry->data['content']));
    }

    public function test_term_pages_and_term_lists(): void
    {
        $content = $this->cms()->entryService();
        $filed = [['type' => 'repeat', 'props' => ['source' => 'entries', 'collection' => 'posts', 'sort' => 'title', 'references' => 'current'], 'children' => [['type' => 'paragraph', 'bind' => ['text' => 'item.title']]]]];
        $news = $content->create('topics', ['title' => 'News', 'status' => 'published', 'data' => ['content' => $filed]]);
        $sport = $content->create('topics', ['title' => 'Sport', 'status' => 'published', 'data' => ['content' => $filed]]);
        $content->create('topics', ['title' => 'Unused', 'status' => 'published']);
        $term = static fn (string $what) => ['type' => 'paragraph', 'bind' => ['text' => 'item.'.$what]];
        $term = [$term('title'), $term('count')];
        $post = $content->create('posts', ['title' => 'Flood', 'status' => 'published', 'data' => ['topics' => [$news->id], 'content' => [
            ['type' => 'repeat', 'props' => ['source' => 'terms', 'taxonomy' => 'topics', 'of' => 'current'], 'children' => $term],
        ]]]);
        $content->create('posts', ['title' => 'Cup final', 'status' => 'published', 'data' => ['topics' => [$news->id, $sport->id]]]);
        $content->create('posts', ['title' => 'Not yet', 'data' => ['topics' => [$sport->id]]]);
        $index = $content->create('pages', ['title' => 'Topics', 'status' => 'published', 'data' => ['content' => [
            ['type' => 'repeat', 'props' => ['source' => 'terms', 'taxonomy' => 'topics', 'sort' => '-count', 'hideEmpty' => true], 'children' => $term],
        ]]]);

        $this->assertSame('Cup final Flood', $this->text($news->id));
        $this->assertSame('Cup final', $this->text($sport->id));
        $this->assertSame('News 2 Sport 1', $this->text($index->id));
        $this->assertSame('News 2', $this->text($post->id));
        $this->get('/topics/news')->assertOk()->assertSee('Cup final');

        // A list of the entries filed under a tag, named by its slug or its title; a name that is no tag lists none.
        $tagged = static fn (string $tag) => ['type' => 'repeat', 'props' => ['source' => 'entries', 'collection' => 'posts', 'sort' => 'title', 'hasTag' => $tag], 'children' => [['type' => 'paragraph', 'bind' => ['text' => 'item.title']]]];
        $lists = $content->create('pages', ['title' => 'Tagged', 'status' => 'published', 'data' => ['content' => [$tagged('sport'), $tagged('News'), $tagged('nothing')]]]);
        $this->assertSame('Cup final Cup final Flood', $this->text($lists->id));

        // A related entry is a page's entry too: its fields and its address.
        $related = $content->create('pages', ['title' => 'Related', 'status' => 'published', 'data' => ['content' => [
            ['type' => 'repeat', 'props' => ['source' => 'entries', 'collection' => 'posts', 'sort' => 'title'], 'children' => [
                ['type' => 'repeat', 'props' => ['source' => 'list', 'path' => 'item.topics', 'as' => 'topic'], 'children' => [['type' => 'paragraph', 'bind' => ['text' => '{topic.title} at {topic.url}']]]],
            ]],
        ]]]);
        $this->assertSame('News at /topics/news Sport at /topics/sport News at /topics/news', $this->text($related->id));

        // So is one in a repeater's row.
        $this->cms()->collections()->save(\Cms\Content\Collections\Collection::fromArray('pages', ['title' => 'Pages', 'route' => '/{slug}', 'fields' => [['handle' => 'content', 'type' => 'blocks', 'body' => true], ['handle' => 'rows', 'type' => 'repeater', 'fields' => [['handle' => 'topic', 'type' => 'terms', 'taxonomy' => 'topics', 'max' => 1]]]]]));
        $rows = $content->create('pages', ['title' => 'Rows', 'status' => 'published', 'data' => ['rows' => [['topic' => [$sport->id]]], 'content' => [
            ['type' => 'repeat', 'props' => ['source' => 'list', 'path' => 'entry.rows', 'as' => 'row'], 'children' => [['type' => 'paragraph', 'bind' => ['text' => '{row.topic.title} at {row.topic.url}']]]],
        ]]]);
        $this->assertSame('Sport at /topics/sport', $this->text($rows->id));
    }
}

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
            'pages' => ['title' => 'Pages', 'route' => '/{slug}', 'body' => 'content', 'fields' => [['handle' => 'content', 'type' => 'blocks']]],
            'topics' => ['title' => 'Topics', 'taxonomy' => true, 'route' => '/topics/{slug}', 'body' => 'content', 'fields' => [['handle' => 'content', 'type' => 'blocks']]],
            'posts' => ['title' => 'Posts', 'route' => '/blog/{slug}', 'body' => 'content', 'fields' => [['handle' => 'content', 'type' => 'blocks'], ['handle' => 'topics', 'type' => 'terms', 'taxonomy' => 'topics']]],
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
    }
}

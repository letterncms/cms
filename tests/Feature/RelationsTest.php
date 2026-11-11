<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Tests\TestCase;
use Cms\Users\User;

/** A relation names something that is there, and can be read from the other side. */
final class RelationsTest extends TestCase
{
    protected function collections(): array
    {
        return [
            ...parent::collections(),
            'authors' => ['title' => 'Authors', 'route' => '/authors/{slug}', 'fields' => []],
            'articles' => ['title' => 'Articles', 'route' => '/articles/{slug}', 'fields' => [
                ['handle' => 'author', 'type' => 'entries', 'collections' => ['authors'], 'max' => 1],
                ['handle' => 'meta', 'type' => 'group', 'fields' => [['handle' => 'related', 'type' => 'entries']]],
                ['handle' => 'credits', 'type' => 'repeater', 'fields' => [['handle' => 'who', 'type' => 'entries', 'collections' => ['authors']]]],
                ['handle' => 'editors', 'type' => 'users'],
            ]],
            'memos' => ['title' => 'Memos', 'driver' => 'files', 'route' => '/memos/{slug}', 'fields' => [
                ['handle' => 'about', 'type' => 'entries'],
            ]],
        ];
    }

    private function ability(string $name, array $input = []): mixed
    {
        return $this->cms()->abilities()->execute($name, $input, AbilityContext::system());
    }

    private function refused(callable $run): array
    {
        try {
            $run();
        } catch (AbilityException $e) {
            $this->assertSame('invalid_input', $e->type);

            return $e->details;
        }

        $this->fail('The write went through.');
    }

    public function test_a_relation_takes_only_entries_that_exist_in_its_collections(): void
    {
        $content = $this->cms()->entryService();
        $ada = $content->create('authors', ['title' => 'Ada']);
        $page = $content->create('pages', ['title' => 'A page']);

        $errors = $this->refused(fn () => $content->create('articles', ['title' => 'One', 'data' => ['author' => ['01hzzzzzzzzzzzzzzzzzzzzzzz']]]));
        $this->assertSame(['data.author.0'], array_keys($errors));

        $errors = $this->refused(fn () => $content->create('articles', ['title' => 'One', 'data' => ['author' => [$page->id]]]));
        $this->assertStringContainsString('authors', $errors['data.author.0']);

        // Groups and repeater rows are checked where they are, and an id is stored in lower case.
        $errors = $this->refused(fn () => $content->create('articles', ['title' => 'One', 'data' => [
            'meta' => ['related' => [$page->id, '01hzzzzzzzzzzzzzzzzzzzzzzz']],
            'credits' => [['who' => [$ada->id]], ['who' => [$page->id]]],
        ]]));
        $this->assertSame(['data.meta.related.1', 'data.credits.1.who.0'], array_keys($errors));

        $article = $content->create('articles', ['title' => 'One', 'data' => ['author' => [strtoupper($ada->id)], 'meta' => ['related' => [$page->id]]]]);
        $this->assertSame([$ada->id], $article->data['author']);

        // A dry run is refused in the same place.
        $this->refused(fn () => $this->ability('entries/update', ['id' => $article->id, 'data' => ['author' => [$page->id]], 'dryRun' => true]));
    }

    public function test_what_was_deleted_since_does_not_block_a_save(): void
    {
        $content = $this->cms()->entryService();
        $ada = $content->create('authors', ['title' => 'Ada']);
        $article = $content->create('articles', ['title' => 'One', 'data' => ['author' => [$ada->id]]]);
        $content->delete($ada->id);

        $saved = $content->update($article->id, ['title' => 'One, again']);
        $this->assertSame([$ada->id], $saved->data['author']);
        $this->assertSame('one-again-copy', $content->duplicate($article->id)->slug);
        $this->assertTrue($content->publish($article->id)->isPublished());

        // Naming it anew is refused: it is no longer there.
        $content->update($article->id, ['data' => ['author' => []]]);
        $this->refused(fn () => $content->update($article->id, ['data' => ['author' => [$ada->id]]]));
    }

    public function test_people_are_checked_too(): void
    {
        $user = User::query()->create(['name' => 'Ed', 'email' => 'ed@example.com', 'password' => 'secret-secret', 'role' => 'editor']);
        $content = $this->cms()->entryService();

        $this->assertSame([$user->id], $content->create('articles', ['title' => 'One', 'data' => ['editors' => [$user->id]]])->data['editors']);
        $this->assertSame(['data.editors.0'], array_keys($this->refused(fn () => $content->create('articles', ['title' => 'Two', 'data' => ['editors' => ['nobody']]]))));
    }

    public function test_entries_are_found_by_what_they_name_on_both_drivers(): void
    {
        $content = $this->cms()->entryService();
        $ada = $content->create('authors', ['title' => 'Ada', 'status' => 'published']);
        $bob = $content->create('authors', ['title' => 'Bob', 'status' => 'published']);
        $one = $content->create('articles', ['title' => 'One', 'data' => ['author' => [$ada->id]], 'status' => 'published']);
        $two = $content->create('articles', ['title' => 'Two', 'data' => ['author' => [$bob->id], 'meta' => ['related' => [$ada->id]]], 'status' => 'published']);
        $content->create('articles', ['title' => 'Three', 'data' => ['author' => [$bob->id], 'credits' => [['who' => [$ada->id]]]], 'status' => 'published']);
        $memo = $content->create('memos', ['title' => 'Memo', 'data' => ['about' => [$ada->id]], 'status' => 'published']);

        $titles = static fn (array $entries) => array_map(static fn ($e) => is_array($e) ? $e['title'] : $e->title, $entries);
        $query = fn () => $this->cms()->entries()->query();

        // Wherever it is named: a field, a field of a group, a row of a repeater.
        $this->assertSame(['One', 'Three', 'Two'], $titles($query()->collection('articles')->references($ada->id)->orderBy('title')->get()));
        $this->assertSame(3, $query()->collection('articles')->references($ada->id)->count());
        $this->assertSame(['Three'], $titles($query()->collection('articles')->references($ada->id, 'credits')->get()));
        $this->assertSame([], $query()->collection('authors')->references($ada->id)->get(), 'An entry does not name itself.');
        $this->assertSame([$ada->id => 4, $bob->id => 2, 'nothing' => 0], $query()->referenceCounts([$ada->id, $bob->id, 'nothing']));
        $this->assertSame(['One'], $titles($query()->collection('articles')->references($ada->id, 'author')->get()));
        $this->assertSame(['Two'], $titles($query()->collection('articles')->references($ada->id, 'meta.related')->get()));
        $this->assertSame(['Memo'], $titles($query()->collection('memos')->references($ada->id)->get()));
        // Both drivers in one query, and an id that is no entry.
        $this->assertSame(['Memo', 'One', 'Three', 'Two'], $titles($query()->references($ada->id)->orderBy('title')->get()));
        $this->assertSame([], $query()->references('01hzzzzzzzzzzzzzzzzzzzzzzz')->get());

        // The working copy is what editors query: a draft that drops the relation no longer names it.
        $content->update($one->id, ['data' => ['author' => [$bob->id]]]);
        $this->assertSame(['One', 'Three', 'Two'], $titles($query()->collection('articles')->references($ada->id)->orderBy('title')->get()));
        $this->assertSame(['Three', 'Two'], $titles($query()->working()->collection('articles')->references($ada->id)->orderBy('title')->get()));

        $listed = $this->ability('entries/list', ['collection' => 'articles', 'references' => $bob->id, 'sort' => 'title']);
        $this->assertSame(['One', 'Three', 'Two'], $titles($listed['items']));
        $this->assertSame(['Two'], $titles($this->ability('entries/list', ['collection' => 'articles', 'references' => $ada->id, 'referencesField' => 'meta.related'])['items']));

        $references = $this->ability('references/list', ['id' => $ada->id]);
        $this->assertSame(['Memo', 'Three', 'Two'], $titles($references['items']));
        $this->assertSame([['about'], ['credits'], ['meta']], array_column($references['items'], 'fields'));
        $this->assertSame(3, $references['total']);

        // The content API: what is published, by the published relation.
        $this->getJson('/api/v1/content/articles?references='.$ada->id.'&sort=title')->assertOk()->assertJsonCount(3, 'data')->assertJsonPath('data.0.title', 'One');
        $this->getJson('/api/v1/content/articles?references='.$ada->id.'&references_field=meta.related')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $two->id);
        $this->getJson('/api/v1/content/memos?references='.$ada->id)->assertOk()->assertJsonPath('data.0.id', $memo->id);

        // A draft is not there to be named.
        $draft = $content->create('authors', ['title' => 'Draft']);
        $content->update($two->id, ['data' => ['meta' => ['related' => [$draft->id]]]], publish: true);
        $this->getJson('/api/v1/content/articles?references='.$draft->id)->assertOk()->assertJsonCount(0, 'data');
    }
}

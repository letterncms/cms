<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks\Tests;

use Cms\Modules\Blocks\Document;
use Cms\Tests\TestCase;

/** What is a map stays a map on the way out: `{}` when empty, never the `[]` PHP's empty array becomes. */
final class JsonShapeTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    protected function collections(): array
    {
        return [
            'pages' => ['title' => 'Pages', 'route' => '/{slug}', 'api' => true, 'fields' => [['handle' => 'content', 'type' => 'blocks', 'body' => true], ['handle' => 'related', 'type' => 'entries', 'collections' => ['notes']]]],
            'notes' => ['title' => 'Notes', 'api' => true, 'fields' => []],
            'layouts' => ['title' => 'Layouts', 'fields' => [
                ['handle' => 'rows', 'type' => 'matrix', 'types' => [['handle' => 'band', 'label' => 'Band', 'fields' => [['handle' => 'body', 'type' => 'blocks']]]]],
                ['handle' => 'steps', 'type' => 'repeater', 'fields' => [['handle' => 'body', 'type' => 'blocks']]],
            ]],
        ];
    }

    public function test_a_blocks_props_are_an_object_also_when_empty(): void
    {
        $nodes = app(Document::class)->normalize([
            ['type' => 'box', 'children' => [['type' => 'divider'], ['type' => 'heading', 'props' => ['text' => 'Hi']]]],
            ['type' => 'component', 'props' => ['ref' => 'card']],
        ]);
        $json = (string) json_encode(Document::jsonable($nodes));

        $this->assertStringContainsString('"type":"box","props":{}', $json);
        $this->assertStringContainsString('"type":"divider","props":{}', $json, 'at any depth');
        $this->assertStringContainsString('"text":"Hi"', $json);
        $this->assertStringNotContainsString('"props":[]', $json);
        $this->assertStringContainsString('"props":[]', (string) json_encode($nodes), 'what is stored and rendered stays PHP’s own');
    }

    public function test_the_content_api_sends_objects_for_empty_props_and_empty_data(): void
    {
        $note = $this->cms()->entryService()->create('notes', ['title' => 'A note', 'status' => 'published', 'data' => []]);
        $this->cms()->entryService()->create('pages', ['title' => 'Page', 'status' => 'published', 'data' => ['related' => [$note->id], 'content' => [['type' => 'box', 'children' => [['type' => 'divider']]]]]]);

        $list = $this->getJson('/api/v1/content/pages?expand=related')->assertOk()->getContent();
        $this->assertStringNotContainsString('"props":[]', $list);
        $this->assertStringNotContainsString('"data":[]', $list);
        $this->assertStringContainsString('"type":"divider","props":{}', $list);
        $this->assertStringContainsString('"title":"A note","slug":"a-note","uri":null,"data":{}', $list, 'an expanded entry without fields');

        $this->assertStringContainsString('"data":{}', $this->getJson('/api/v1/content/notes')->assertOk()->getContent(), 'a listed one');
        $this->assertStringContainsString('"data":{}', $this->getJson('/api/v1/content/notes/a-note')->assertOk()->getContent(), 'one by slug');

        $some = $this->getJson('/api/v1/content/pages?fields=title,content')->assertOk()->getContent();
        $this->assertStringContainsString('"props":{}', $some, 'with only some fields asked for');
        $this->assertStringNotContainsString('"props":[]', $some);
    }

    /** An ability's answer as a transport sends it. */
    private function sent(string $name, array $input): string
    {
        $abilities = $this->cms()->abilities();

        return (string) json_encode($abilities->get($name)->encode($abilities->execute($name, $input, \Cms\Abilities\AbilityContext::system('test'))));
    }

    public function test_every_ability_that_answers_with_an_entry_sends_objects_for_empty_props(): void
    {
        $blocks = [['type' => 'box', 'children' => [['type' => 'divider']]]];
        $made = json_decode($this->sent('entries/create', ['collection' => 'pages', 'title' => 'Page', 'status' => 'published', 'data' => ['content' => $blocks]]), true);
        $id = $made['id'];
        $version = fn () => $this->cms()->entries()->find($id)->version();
        $answers = [
            'entries/create' => $this->sent('entries/create', ['collection' => 'pages', 'title' => 'Another', 'data' => ['content' => $blocks]]),
            'entries/get' => $this->sent('entries/get', ['id' => $id]),
            'entries/update' => $this->sent('entries/update', ['id' => $id, 'title' => 'Page, edited']),
            'entries/discard-draft' => $this->sent('entries/discard-draft', ['id' => $id]),
            'entries/unpublish' => $this->sent('entries/unpublish', ['id' => $id]),
            'entries/publish' => $this->sent('entries/publish', ['id' => $id]),
            'entries/duplicate' => $this->sent('entries/duplicate', ['id' => $id]),
            'entries/move' => $this->sent('entries/move', ['id' => $id, 'parentId' => null]),
        ];
        $revision = \Illuminate\Support\Facades\DB::table('revisions')->where('entry_id', $id)->orderBy('created_at')->value('id');
        $revision && $answers['revisions/restore'] = $this->sent('revisions/restore', ['revisionId' => $revision]);

        foreach ($answers as $name => $json) {
            $this->assertStringContainsString('"type":"divider","props":{}', $json, $name);
            $this->assertStringNotContainsString('"props":[]', $json, $name);
        }

        $this->assertCount(9, $answers, 'all nine that answer with an entry');
        $this->assertStringContainsString('"data":{}', $this->sent('entries/create', ['collection' => 'notes', 'title' => 'Bare']), 'and an entry without fields, from the ability’s schema');
    }

    public function test_blocks_inside_matrix_rows_and_repeater_items_are_sent_the_same_way(): void
    {
        $blocks = [['type' => 'box', 'children' => [['type' => 'divider']]]];
        $json = $this->sent('entries/create', ['collection' => 'layouts', 'title' => 'Layout', 'data' => [
            'rows' => [['type' => 'band', 'body' => $blocks]],
            'steps' => [['body' => $blocks], ['body' => []]],
        ]]);

        $this->assertSame(4, substr_count($json, '"props":{}'), 'two blocks in the row, two in the first item');
        $this->assertStringNotContainsString('"props":[]', $json);
        $this->assertStringContainsString('"type":"band"', $json);
    }

    public function test_block_abilities_send_objects_too(): void
    {
        $markdown = $this->sent('blocks/from-markdown', ['markdown' => "::: box\n---\n:::"]);
        $this->assertStringContainsString('"props":{}', $markdown);
        $this->assertStringNotContainsString('"props":[]', $markdown);

        $this->cms()->entryService()->create('components', ['title' => 'Rule', 'slug' => 'rule', 'status' => 'published', 'data' => ['blocks' => [['type' => 'box', 'children' => [['type' => 'divider']]]]]]);
        app(\Cms\Modules\Blocks\Components::class)->flush();
        $list = $this->sent('components/list', []);
        $this->assertStringContainsString('"type":"divider","props":{}', $list);
        // A component's own `props` is the list of its properties, and stays one.
        $this->assertStringContainsString('"props":[],"blocks":[{"type":"box","props":{}', $list);
    }
}

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
            'pages' => ['title' => 'Pages', 'route' => '/{slug}', 'body' => 'content', 'api' => true, 'fields' => [['handle' => 'content', 'type' => 'blocks'], ['handle' => 'related', 'type' => 'entries', 'collections' => ['notes']]]],
            'notes' => ['title' => 'Notes', 'api' => true, 'fields' => []],
        ];
    }

    public function test_a_blocks_props_are_an_object_also_when_empty(): void
    {
        $nodes = app(Document::class)->normalize([
            ['type' => 'box', 'children' => [['type' => 'divider'], ['type' => 'heading', 'props' => ['text' => 'Hi']]]],
            ['type' => 'pattern', 'props' => ['ref' => 'card']],
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
}

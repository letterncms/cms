<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Content\Fields\Blueprint;
use Cms\Support\Schema\SchemaException;
use Cms\Support\Schema\Validator;
use Cms\Tests\TestCase;

/** A field can depend on the fields beside it: on view, and required, only while they hold a value. */
final class ConditionalFieldsTest extends TestCase
{
    private const array FIELDS = [
        ['handle' => 'kind', 'type' => 'select', 'options' => ['text' => 'Text', 'video' => 'Video', 'audio' => 'Audio'], 'default' => 'text'],
        ['handle' => 'featured', 'type' => 'toggle'],
        ['handle' => 'source', 'type' => 'url', 'required' => true, 'if' => ['kind' => ['video', 'audio']]],
        ['handle' => 'teaser', 'type' => 'textarea', 'required_if' => ['featured' => true]],
        ['handle' => 'body', 'type' => 'markdown'],
    ];

    protected function collections(): array
    {
        return [
            ...parent::collections(),
            'clips' => ['title' => 'Clips', 'fields' => self::FIELDS],
            'memos' => ['title' => 'Memos', 'driver' => 'files', 'body' => 'body', 'fields' => self::FIELDS],
        ];
    }

    private function ability(string $name, array $input = []): mixed
    {
        return $this->cms()->abilities()->execute($name, $input, AbilityContext::system());
    }

    public function test_the_validator_follows_all_of_and_if_then_else(): void
    {
        $schema = ['type' => 'object', 'properties' => ['kind' => ['type' => 'string']], 'allOf' => [
            ['if' => ['properties' => ['kind' => ['const' => 'video']], 'required' => ['kind']], 'then' => ['required' => ['url']], 'else' => ['properties' => ['url' => ['type' => 'null']]]],
            ['properties' => ['kind' => ['minLength' => 2]]],
        ]];

        $this->assertSame(['kind' => 'video', 'url' => 'x'], Validator::validate(['kind' => 'video', 'url' => 'x'], $schema));
        $this->assertSame(['kind' => 'text'], Validator::validate(['kind' => 'text'], $schema));

        foreach ([[['kind' => 'video'], 'url'], [['kind' => 'text', 'url' => 'x'], 'url'], [['kind' => 'v'], 'kind']] as [$value, $path]) {
            try {
                Validator::validate($value, $schema);
                $this->fail('Accepted '.json_encode($value));
            } catch (SchemaException $e) {
                $this->assertSame([$path], array_keys($e->errors));
            }
        }
    }

    public function test_the_schema_says_the_condition_as_if_then(): void
    {
        $schema = $this->ability('collections/schema', ['handle' => 'clips']);

        $this->assertArrayNotHasKey('required', $schema['data']);
        $this->assertSame(['string', 'null'], $schema['data']['properties']['source']['type']);
        $this->assertSame([
            ['if' => ['properties' => ['kind' => ['enum' => ['video', 'audio']]], 'required' => ['kind']], 'then' => ['properties' => ['source' => ['type' => 'string', 'format' => 'uri-reference', 'maxLength' => 2048, 'description' => 'Source']], 'required' => ['source']]],
            ['if' => ['properties' => ['featured' => ['const' => true]], 'required' => ['featured']], 'then' => ['properties' => ['teaser' => $schema['data']['allOf'][1]['then']['properties']['teaser']], 'required' => ['teaser']]],
        ], $schema['data']['allOf']);
        $this->assertNotContains('null', (array) $schema['data']['allOf'][1]['then']['properties']['teaser']['type']);
        // A draft may leave them empty, as any required field.
        $this->assertArrayNotHasKey('allOf', $schema['draft']);
        $this->assertSame(['kind' => ['video', 'audio']], array_column($this->ability('collections/get', ['handle' => 'clips'])['resolvedFields'], 'if', 'handle')['source']);
    }

    public function test_a_conditional_field_is_required_only_while_its_condition_holds_on_both_drivers(): void
    {
        $content = $this->cms()->entryService();

        foreach (['clips', 'memos'] as $collection) {
            $text = $content->create($collection, ['title' => 'Text', 'status' => 'published', 'data' => ['body' => 'Words.']]);
            $this->assertTrue($text->isPublished());

            $draft = $content->create($collection, ['title' => 'Video', 'data' => ['kind' => 'video', 'featured' => true]]);

            try {
                $content->publish($draft->id);
                $this->fail('Published without its source and teaser.');
            } catch (AbilityException $e) {
                $this->assertSame(['data.source', 'data.teaser'], array_keys($e->details));
            }

            $content->update($draft->id, ['data' => ['source' => 'https://example.com/clip.mp4', 'teaser' => 'Watch this.']]);
            $live = $content->publish($draft->id);
            $this->assertSame('https://example.com/clip.mp4', $this->cms()->entries()->find($live->id)->data['source']);

            // Back to text: the source is no longer asked for, and what it held stays until it is cleared.
            $back = $content->update($live->id, ['data' => ['kind' => 'text', 'featured' => false, 'teaser' => null]], publish: true);
            $this->assertSame('https://example.com/clip.mp4', $back->data['source']);
            $this->assertTrue($content->update($live->id, ['data' => ['source' => null]], publish: true)->isPublished());
        }
    }

    public function test_a_condition_names_fields_beside_it(): void
    {
        Blueprint::validate(self::FIELDS);
        Blueprint::validate([['handle' => 'box', 'type' => 'group', 'fields' => [['handle' => 'on', 'type' => 'toggle'], ['handle' => 'label', 'type' => 'text', 'if' => ['on' => true]]]]]);

        foreach ([['nowhere' => 1], ['label' => 'x'], ['kind' => ['a' => 'b']], ['kind' => []], 'kind', []] as $rule) {
            try {
                Blueprint::validate([['handle' => 'kind', 'type' => 'text'], ['handle' => 'label', 'type' => 'text', 'if' => $rule]]);
                $this->fail('Took the condition '.json_encode($rule));
            } catch (\InvalidArgumentException $e) {
                $this->assertStringContainsString('label', $e->getMessage());
            }
        }

        // Two fields that wait for each other, directly or through a third.
        foreach ([[['a' => ['b' => 1]], ['b' => ['a' => 1]]], [['a' => ['b' => 1]], ['b' => ['c' => 1]], ['c' => ['a' => 1]]]] as $rules) {
            try {
                Blueprint::validate(array_map(static fn (array $rule, string $key) => ['handle' => array_key_first($rule), 'type' => 'text', $key => $rule[array_key_first($rule)]], $rules, array_slice(['if', 'required_if', 'if'], 0, count($rules))));
                $this->fail('Took a circle of conditions.');
            } catch (\InvalidArgumentException $e) {
                $this->assertStringContainsString('depend on the field itself', $e->getMessage());
            }
        }

        try {
            $this->ability('collections/save', ['handle' => 'clips', 'definition' => ['title' => 'Clips', 'fields' => [['handle' => 'a', 'type' => 'text', 'required_if' => ['b' => 1]]]]]);
            $this->fail('Saved a condition on a field that is not there.');
        } catch (AbilityException $e) {
            $this->assertSame('invalid_input', $e->type);
        }
    }
}

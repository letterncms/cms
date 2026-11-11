<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Support\Schema\SchemaException;
use Cms\Support\Schema\Validator;
use Cms\Tests\TestCase;
use Cms\Users\ApiToken;

/** What entries of a collection must look like is said as JSON Schema, and errors point into it. */
final class CollectionSchemaTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/mcp'];
    }

    private function ability(string $name, array $input = []): mixed
    {
        return $this->cms()->abilities()->execute($name, $input, AbilityContext::system());
    }

    public function test_the_schema_describes_data_drafts_and_the_inputs(): void
    {
        $schema = $this->ability('collections/schema', ['handle' => 'posts']);

        $this->assertSame('posts', $schema['handle']);
        $this->assertSame(['excerpt'], $schema['data']['required']);
        $this->assertArrayNotHasKey('required', $schema['draft']);
        $this->assertSame(['excerpt', 'body', 'tags'], array_keys($schema['data']['properties']));

        // The inputs are the abilities' own, with the collection's data in place of the free object.
        $this->assertSame(['const' => 'posts'], $schema['create']['properties']['collection']);
        $this->assertSame(['collection', 'title'], $schema['create']['required']);
        $this->assertSame(array_keys($schema['draft']['properties']), array_keys($schema['create']['properties']['data']['properties']));
        $this->assertSame(['id'], $schema['update']['required']);
        $this->assertArrayHasKey('excerpt', $schema['update']['properties']['data']['properties']);

        // An input the schema accepts is one the ability accepts, and the other way round.
        Validator::validate(['collection' => 'posts', 'title' => 'Fine', 'data' => ['excerpt' => 'Short', 'tags' => ['a']]], $schema['create']);
        $this->assertSame('fine', $this->ability('entries/create', ['collection' => 'posts', 'title' => 'Fine', 'data' => ['excerpt' => 'Short', 'tags' => ['a']]])['slug']);

        try {
            Validator::validate(['collection' => 'pages', 'title' => 'Wrong', 'data' => ['excerpt' => ['no']]], $schema['create']);
            $this->fail('The schema took another collection and a list for text.');
        } catch (SchemaException $e) {
            $this->assertSame(['collection', 'data.excerpt'], array_keys($e->errors));
        }

        // collections/get and the collections resource carry the data schema too.
        $this->assertSame($schema['data'], $this->ability('collections/get', ['handle' => 'posts'])['schema']);

        $this->expectException(AbilityException::class);
        $this->ability('collections/schema', ['handle' => 'nothing']);
    }

    public function test_validation_errors_carry_the_schema_path(): void
    {
        $paths = function (string $ability, array $input): array {
            try {
                $this->ability($ability, $input);
            } catch (AbilityException $e) {
                $this->assertSame('invalid_input', $e->type);

                return array_keys($e->details);
            }

            $this->fail("{$ability} was not refused");
        };

        $this->assertSame(['data.excerpt'], $paths('entries/create', ['collection' => 'posts', 'title' => 'Live', 'status' => 'published']));
        $this->assertSame(['data.excerpt'], $paths('entries/create', ['collection' => 'posts', 'title' => 'Draft', 'data' => ['excerpt' => ['no']]]));
        $this->assertSame(['data.excerpt'], $paths('entries/create', ['collection' => 'posts', 'title' => 'Dry', 'data' => ['excerpt' => ['no']], 'dryRun' => true]));

        $draft = $this->ability('entries/create', ['collection' => 'posts', 'title' => 'Draft']);
        $this->assertSame(['data.excerpt'], $paths('entries/publish', ['id' => $draft['id']]));
        $this->assertSame(['data.body'], $paths('entries/update', ['id' => $draft['id'], 'data' => ['body' => 12]]));
        $this->assertSame(['data.body'], $paths('entries/update', ['id' => $draft['id'], 'data' => ['body' => 12], 'dryRun' => true]));

        // What the ability's own input schema refuses is named from the root of the input, as before.
        $this->assertSame(['title'], $paths('entries/create', ['collection' => 'posts']));
    }

    public function test_mcp_offers_each_collection_schema_as_a_resource(): void
    {
        [, $token] = ApiToken::issue($this->admin(), 'a');
        $rpc = fn (string $method, array $params = []) => $this->postJson('/mcp', ['jsonrpc' => '2.0', 'id' => 1, 'method' => $method, 'params' => [...$params, '_meta' => ['io.modelcontextprotocol/protocolVersion' => '2026-07-28']]], ['Authorization' => "Bearer {$token}"]);

        $templates = $rpc('resources/templates/list')->assertOk()->json('result.resourceTemplates');
        $this->assertContains('cms://collections/{handle}/schema', array_column($templates, 'uriTemplate'));

        $listed = array_column($rpc('resources/list')->json('result.resources'), 'uri');
        $this->assertContains('cms://collections/posts/schema', $listed);
        $this->assertContains('cms://collections', $listed);

        $read = $rpc('resources/read', ['uri' => 'cms://collections/posts/schema'])->assertOk()->json('result.contents.0');
        $this->assertSame('cms://collections/posts/schema', $read['uri']);
        $this->assertSame($this->ability('collections/schema', ['handle' => 'posts']), json_decode($read['text'], true));

        $rpc('resources/read', ['uri' => 'cms://collections/nothing/schema'])->assertJsonPath('error.code', -32602);

        // Without the permission the family is not there at all.
        $this->assertNull($this->cms()->context()->read('cms://collections/posts/schema', null));
        $this->assertSame([], $this->cms()->context()->templates(null));
    }
}

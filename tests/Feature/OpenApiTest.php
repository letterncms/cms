<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\Ability;
use Cms\Cms;
use Cms\Support\Schema\Validator;
use Cms\Tests\TestCase;
use Cms\Users\ApiToken;

/** /api/v1/openapi.json is made from the abilities, and says what the API does. */
final class OpenApiTest extends TestCase
{
    public function test_the_document_describes_every_ability_exposed_to_rest(): void
    {
        $response = $this->getJson('/api/v1/openapi.json')->assertOk();
        $doc = $response->json();

        $this->assertSame('3.1.0', $doc['openapi']);
        $this->assertSame(Cms::VERSION, $doc['info']['version']);
        $this->assertSame('http://localhost/api/v1', $doc['servers'][0]['url']);
        $this->assertSame([['bearer' => []]], $doc['security']);
        $this->assertSame('bearer', $doc['components']['securitySchemes']['bearer']['scheme']);
        $this->assertSame($this->getJson('/api/v1')->json('endpoints.openapi'), 'http://localhost/api/v1/openapi.json');

        $rest = $this->cms()->abilities()->all('rest');
        $this->assertSame(count($rest) + 2, count($doc['paths']));
        $ids = [];

        foreach ($rest as $name => $ability) {
            $path = $doc['paths']["/abilities/{$name}"] ?? null;
            $this->assertNotNull($path, "{$name} has no path");
            $this->assertSame(! $ability->isReadOnly() ? ['post'] : ['get', 'post'], array_keys($path), $name);
            $this->assertSame($ability->label, $path['post']['summary']);
            $this->assertSame('object', $path['post']['requestBody']['content']['application/json']['schema']['type']);
            $this->assertArrayHasKey('data', $path['post']['responses']['200']['content']['application/json']['schema']['properties']);
            $this->assertSame('#/components/responses/Error', $path['post']['responses']['default']['$ref']);

            foreach ($path as $operation) {
                $ids[] = $operation['operationId'];
            }
        }

        $this->assertSame($ids, array_unique($ids), 'operation ids are unique');
        $this->assertArrayNotHasKey('/abilities/tokens/create', $doc['paths'], 'what REST cannot run is not in the document');

        // In JSON a schema and a map of schemas are objects, also when empty.
        $this->assertStringNotContainsString('"properties":[]', $response->getContent());
        $this->assertStringNotContainsString('"schema":[]', $response->getContent());
        $this->assertStringNotContainsString('"items":[]', $response->getContent());
        $this->assertStringNotContainsString('"additionalProperties":[]', $response->getContent());
    }

    public function test_what_it_says_is_what_the_api_does(): void
    {
        $doc = $this->getJson('/api/v1/openapi.json')->json();
        [, $token] = ApiToken::issue($this->admin(), 'a');
        $headers = ['Authorization' => "Bearer {$token}"];

        // A read: the query parameters it lists, and an answer its response schema accepts.
        $list = $doc['paths']['/abilities/entries/list'];
        $parameters = array_column($list['get']['parameters'], null, 'name');
        $this->assertTrue($parameters['collection']['required']);
        $this->assertSame('integer', $parameters['perPage']['schema']['type']);
        $this->assertSame('deepObject', $parameters['filters']['style']);
        $answer = $this->getJson('/api/v1/abilities/entries/list?collection=pages&perPage=5', $headers)->assertOk()->json();
        Validator::validate($answer, $list['get']['responses']['200']['content']['application/json']['schema']);

        // A write: its request body is the ability's input with dryRun, and its answer is the result or the dry-run report.
        $create = $doc['paths']['/abilities/entries/create']['post'];
        $this->assertSame('entries.create', $create['operationId']);
        $this->assertTrue($create['requestBody']['required']);
        $body = $create['requestBody']['content']['application/json']['schema'];
        $this->assertSame(['collection', 'title'], $body['required']);
        $this->assertSame('boolean', $body['properties']['dryRun']['type']);
        $data = $create['responses']['200']['content']['application/json']['schema']['properties']['data'];
        $this->assertSame('#/components/schemas/DryRun', $data['oneOf'][1]['$ref']);

        $made = $this->postJson('/api/v1/abilities/entries/create', ['collection' => 'pages', 'title' => 'Hello'], $headers)->assertOk()->json('data');
        Validator::validate($made, $data['oneOf'][0]);
        $dry = $this->postJson('/api/v1/abilities/entries/create', ['collection' => 'pages', 'title' => 'Hello', 'dryRun' => true], $headers)->assertOk()->json('data');
        Validator::validate($dry, $doc['components']['schemas']['DryRun']);
        $this->assertSame(json_decode((string) json_encode(Ability::DRY_RUN_OUTPUT), true), $doc['components']['schemas']['DryRun']);

        // A failure is the Error schema.
        $error = $this->postJson('/api/v1/abilities/entries/create', ['collection' => 'pages'], $headers)->assertStatus(422)->json();
        Validator::validate($error, $doc['components']['schemas']['Error']);
        $this->assertContains($error['error']['type'], $doc['components']['schemas']['Error']['properties']['error']['properties']['type']['enum']);
    }

    public function test_an_ability_a_plugin_registers_is_in_it(): void
    {
        $this->cms()->abilities()->register('example/ping', ['label' => 'Ping', 'annotations' => ['readOnly' => true], 'handler' => static fn () => 'pong']);
        $this->cms()->abilities()->register('example/secret', ['label' => 'Secret', 'expose' => ['rest' => false], 'handler' => static fn () => null]);

        $paths = $this->getJson('/api/v1/openapi.json')->json('paths');

        $this->assertSame('example.ping', $paths['/abilities/example/ping']['post']['operationId']);
        $this->assertSame([], $paths['/abilities/example/ping']['get']['parameters']);
        $this->assertArrayNotHasKey('/abilities/example/secret', $paths);
    }
}

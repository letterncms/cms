<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\Ability;
use Cms\Cms;
use Cms\Support\Schema\Conform;
use Cms\Tests\TestCase;
use Cms\Users\ApiToken;
use Illuminate\Testing\TestResponse;

/** /api/v1/openapi.json is made from the abilities, and says what the API does. */
final class OpenApiTest extends TestCase
{
    private const array PUBLIC_PATHS = ['/abilities', '/batch', '/abilities/{name}', '/content/{collection}', '/content/{collection}/{slug}'];

    public function test_without_a_token_it_says_how_the_api_works_and_not_what_the_site_runs(): void
    {
        $this->cms()->abilities()->register('example/ping', ['label' => 'Ping', 'package' => 'acme/example', 'category' => 'example', 'annotations' => ['readOnly' => true], 'handler' => static fn () => 'pong']);

        foreach ([[], ['Authorization' => 'Bearer not-a-token']] as $headers) {
            $response = $this->getJson('/api/v1/openapi.json', $headers)->assertOk();
            $doc = $response->json();

            $this->assertSame('3.1.0', $doc['openapi']);
            $this->assertSame(Cms::VERSION, $doc['info']['version']);
            $this->assertSame('http://localhost/api/v1', $doc['servers'][0]['url']);
            $this->assertSame([['bearer' => []]], $doc['security']);
            $this->assertSame('bearer', $doc['components']['securitySchemes']['bearer']['scheme']);
            $this->assertSame(self::PUBLIC_PATHS, array_keys($doc['paths']));
            $this->assertSame(['Error', 'Entry'], array_keys($doc['components']['schemas']));
            $this->assertSame([['name' => 'abilities'], ['name' => 'content']], $doc['tags']);
            $this->assertSame(['get', 'post'], array_values(array_diff(array_keys($doc['paths']['/abilities/{name}']), ['parameters'])));

            // Nothing in it names an ability, a package or a plugin's category.
            foreach (['x-package', 'acme', 'example', 'entries\/create', 'entries.create', '"entries"'] as $told) {
                $this->assertStringNotContainsString($told, str_replace('entries/list', '', $response->getContent()), $told);
            }

            $this->assertValid($response);
        }

        $this->assertSame('http://localhost/api/v1/openapi.json', $this->getJson('/api/v1')->json('endpoints.openapi'));
    }

    public function test_with_a_token_it_describes_every_ability_the_token_may_run(): void
    {
        $this->cms()->abilities()->register('example/ping', ['label' => 'Ping', 'package' => 'acme/example', 'category' => 'example', 'annotations' => ['readOnly' => true], 'handler' => static fn () => 'pong']);
        $this->cms()->abilities()->register('example/secret', ['label' => 'Secret', 'expose' => ['rest' => false], 'handler' => static fn () => null]);

        $admin = $this->admin();
        [, $token] = ApiToken::issue($admin, 'a');
        $response = $this->getJson('/api/v1/openapi.json', ['Authorization' => "Bearer {$token}"])->assertOk();
        $doc = $response->json();
        $this->assertValid($response);

        $may = $this->cms()->abilities()->available(\Cms\Abilities\AbilityContext::forUser($admin, 'rest'));
        $this->assertGreaterThan(100, count($may));
        $this->assertSame(count($may) + 4, count($doc['paths']), 'a path per ability, /abilities, /batch and the two of the content API');
        $this->assertArrayNotHasKey('/abilities/{name}', $doc['paths'], 'each ability has its own path instead');

        foreach ($may as $name => $ability) {
            $path = $doc['paths']["/abilities/{$name}"] ?? null;
            $this->assertNotNull($path, "{$name} has no path");
            $this->assertSame(! $ability->isReadOnly() ? ['post'] : ['get', 'post'], array_keys($path), $name);
            $this->assertSame($ability->label, $path['post']['summary']);
            $this->assertSame('object', $path['post']['requestBody']['content']['application/json']['schema']['type']);
            $this->assertArrayHasKey('data', $path['post']['responses']['200']['content']['application/json']['schema']['properties']);
            $this->assertSame('#/components/responses/Error', $path['post']['responses']['default']['$ref']);
        }

        // A plugin's ability is in it because it is in the registry, and says whose it is.
        $this->assertSame('example.ping', $doc['paths']['/abilities/example/ping']['post']['operationId']);
        $this->assertSame('acme/example', $doc['paths']['/abilities/example/ping']['post']['x-package']);
        $this->assertSame([], $doc['paths']['/abilities/example/ping']['get']['parameters']);
        $this->assertContains(['name' => 'example'], $doc['tags']);
        $this->assertArrayNotHasKey('/abilities/example/secret', $doc['paths']);
        $this->assertArrayNotHasKey('/abilities/tokens/create', $doc['paths'], 'what REST cannot run is not in the document');

        // A token that may do less is told less: by its scopes, and by what its user may do.
        [, $scoped] = ApiToken::issue($admin, 'b', ['entries/*']);
        $paths = array_keys($this->getJson('/api/v1/openapi.json', ['Authorization' => "Bearer {$scoped}"])->assertOk()->json('paths'));
        $this->assertContains('/abilities/entries/list', $paths);
        $this->assertSame([], array_values(array_filter($paths, static fn (string $path) => str_starts_with($path, '/abilities/') && ! str_starts_with($path, '/abilities/entries/'))));

        [, $author] = ApiToken::issue($this->userWithRole('author'), 'c');
        $paths = $this->getJson('/api/v1/openapi.json', ['Authorization' => "Bearer {$author}"])->assertOk()->json('paths');
        $this->assertArrayHasKey('/abilities/entries/create', $paths);
        $this->assertArrayNotHasKey('/abilities/collections/save', $paths);
    }

    public function test_what_it_says_is_what_the_api_does(): void
    {
        [, $token] = ApiToken::issue($this->admin(), 'a');
        $headers = ['Authorization' => "Bearer {$token}"];
        $doc = $this->resolved($this->getJson('/api/v1/openapi.json', $headers)->json());
        $ok = static fn (array $operation): array => $operation['responses']['200']['content']['application/json']['schema'];

        // A read: the query parameters it lists, and an answer its response schema accepts.
        $list = $doc['paths']['/abilities/entries/list']['get'];
        $parameters = array_column($list['parameters'], null, 'name');
        $this->assertTrue($parameters['collection']['required']);
        $this->assertSame('integer', $parameters['perPage']['schema']['type']);
        // A list of maps is one value, as JSON.
        $this->assertArrayNotHasKey('schema', $parameters['filters']);
        $this->assertSame('array', $parameters['filters']['content']['application/json']['schema']['type']);
        $this->cms()->entryService()->create('pages', ['title' => 'Findable']);
        $found = $this->getJson('/api/v1/abilities/entries/list?collection=pages&perPage=5&filters='.rawurlencode('[{"field":"title","value":"Findable"}]'), $headers)->assertOk()->assertJsonPath('data.perPage', 5)->assertJsonPath('data.total', 1);
        $this->assertConforms($found, $ok($list));

        // A write: its request body is the ability's input with dryRun, and its answer is the result or the dry-run report.
        $create = $doc['paths']['/abilities/entries/create']['post'];
        $this->assertSame('entries.create', $create['operationId']);
        $this->assertTrue($create['requestBody']['required']);
        $body = $create['requestBody']['content']['application/json']['schema'];
        $this->assertSame(['collection', 'title'], $body['required']);
        $this->assertSame('boolean', $body['properties']['dryRun']['type']);
        $data = $ok($create)['properties']['data'];
        $this->assertSame(['anyOf'], array_keys($data));
        $this->assertSame(json_decode((string) json_encode(Ability::DRY_RUN_OUTPUT), true), $data['anyOf'][1]);

        $made = $this->postJson('/api/v1/abilities/entries/create', ['collection' => 'pages', 'title' => 'Hello', 'status' => 'published'], $headers)->assertOk();
        $this->assertConforms($made, $ok($create));
        $this->assertSame([], Conform::errors(json_decode($made->getContent())->data, $data['anyOf'][0]));
        $dry = $this->postJson('/api/v1/abilities/entries/create', ['collection' => 'pages', 'title' => 'Hello', 'dryRun' => true], $headers)->assertOk();
        $this->assertConforms($dry, $ok($create));
        $this->assertSame([], Conform::errors(json_decode($dry->getContent())->data, $doc['components']['schemas']['DryRun']));

        // A failure is the Error schema.
        $error = $this->postJson('/api/v1/abilities/entries/create', ['collection' => 'pages'], $headers)->assertStatus(422);
        $this->assertConforms($error, $doc['components']['schemas']['Error']);
        $this->assertContains($error->json('error.type'), $doc['components']['schemas']['Error']['properties']['error']['properties']['type']['enum']);
    }

    public function test_a_list_in_the_query_string_is_given_as_the_document_says(): void
    {
        $admin = $this->admin();
        [, $token] = ApiToken::issue($admin, 'a');
        $headers = ['Authorization' => "Bearer {$token}"];
        $doc = $this->resolved($this->getJson('/api/v1/openapi.json', $headers)->json());

        $get = $doc['paths']['/abilities/entries/get-many']['get'];
        $this->assertSame([[
            'name' => 'ids[]', 'in' => 'query', 'required' => true,
            'schema' => ['type' => 'array', 'items' => ['type' => 'string'], 'maxItems' => 200],
            'style' => 'form', 'explode' => true,
        ]], $get['parameters']);

        $content = $this->cms()->entryService();
        $one = $content->create('pages', ['title' => 'One'])->id;
        $two = $content->create('pages', ['title' => 'Two'])->id;

        // style: form with explode, under the name ids[]: ids[]=…&ids[]=…
        $answer = $this->getJson("/api/v1/abilities/entries/get-many?ids[]={$two}&ids[]={$one}", $headers)->assertOk();
        $this->assertSame([$two, $one], array_column($answer->json('data'), 'id'));
        $this->assertConforms($answer, $get['responses']['200']['content']['application/json']['schema']);

        // The same with the brackets percent-encoded, as a generated client sends them.
        $this->assertSame([$one], array_column($this->getJson('/api/v1/abilities/entries/get-many?ids%5B%5D='.$one, $headers)->assertOk()->json('data'), 'id'));

        // Not as one value: ids=a,b is text, and is refused as that.
        $this->getJson("/api/v1/abilities/entries/get-many?ids={$one},{$two}", $headers)->assertStatus(422)->assertJsonPath('error.type', 'invalid_input');

        // A number in a query string is the number, and one too large to be one is refused, not cut to size.
        $this->getJson('/api/v1/abilities/entries/list?collection=pages&perPage=5', $headers)->assertOk()->assertJsonPath('data.perPage', 5);
        $this->getJson('/api/v1/abilities/entries/list?collection=pages&page=99999999999999999999', $headers)->assertStatus(422)->assertJsonStructure(['error' => ['details' => ['page']]]);
    }

    public function test_the_content_api_is_in_it_as_it_answers(): void
    {
        $response = $this->getJson('/api/v1/openapi.json')->assertOk();
        $doc = $this->resolved($response->json());
        $list = $doc['paths']['/content/{collection}']['get'];
        $show = $doc['paths']['/content/{collection}/{slug}']['get'];

        // Public: no token, said per operation.
        $this->assertSame([], $list['security']);
        $this->assertSame([], $show['security']);
        $this->assertSame(['collection', 'locale', 'q', 'sort', 'filter', 'limit', 'page'], array_column($list['parameters'], 'name'));
        $this->assertSame(['collection', 'slug', 'locale'], array_column($show['parameters'], 'name'));

        $content = $this->cms()->entryService();
        $content->create('posts', ['title' => 'Public', 'data' => ['excerpt' => 'x'], 'status' => 'published']);
        $content->create('posts', ['title' => 'Second', 'data' => ['excerpt' => 'y'], 'status' => 'published']);
        $content->create('posts', ['title' => 'Draft', 'data' => ['excerpt' => 'z']]);

        $page = $this->getJson('/api/v1/content/posts?limit=1&page=2&sort=title&locale=en')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'Second');
        $this->assertSame(['total' => 2, 'page' => 2, 'perPage' => 1, 'pages' => 2], $page->json('meta'));
        $this->assertConforms($page, $list['responses']['200']['content']['application/json']['schema']);
        $this->assertConforms($this->getJson('/api/v1/content/posts?q=Public')->assertOk()->assertJsonCount(1, 'data'), $list['responses']['200']['content']['application/json']['schema']);
        $this->getJson('/api/v1/content/posts?filter[slug]=second')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.slug', 'second');

        $this->assertConforms($this->getJson('/api/v1/content/posts/public')->assertOk(), $show['responses']['200']['content']['application/json']['schema']);

        foreach (['/api/v1/content/posts/draft', '/api/v1/content/nope'] as $missing) {
            $this->assertConforms($this->getJson($missing)->assertNotFound(), $show['responses']['404']['content']['application/json']['schema']);
        }
    }

    /** The answer is exactly what the schema says: every key named, maps as objects, lists as lists. */
    private function assertConforms(TestResponse $response, array $schema): void
    {
        $this->assertSame([], Conform::errors(json_decode((string) $response->getContent()), $schema));
    }

    /** What the document claims of itself: its references lead somewhere, its ids are unique, and what is an object in JSON is one. */
    private function assertValid(TestResponse $response): void
    {
        $json = (string) $response->getContent();
        $doc = $response->json();

        // In JSON a schema, a map of schemas and an object's default are objects, also when empty.
        foreach (['properties', 'schema', 'items', 'additionalProperties', '$defs', 'data'] as $key) {
            $this->assertStringNotContainsString('"'.$key.'":[]', $json);
        }

        $ids = [];

        foreach ($doc['paths'] as $path => $item) {
            preg_match_all('/\{(\w+)\}/', $path, $named);

            foreach (array_intersect_key($item, array_flip(['get', 'post', 'put', 'patch', 'delete'])) as $method => $operation) {
                $ids[] = $operation['operationId'];
                $this->assertArrayHasKey('200', $operation['responses'], "{$method} {$path}");
                $parameters = [...($item['parameters'] ?? []), ...($operation['parameters'] ?? [])];
                $inPath = array_column(array_filter($parameters, static fn (array $p) => $p['in'] === 'path'), 'name');
                $this->assertEqualsCanonicalizing($named[1], $inPath, "{$method} {$path} declares the parameters of its path");
                $this->assertSame(count($parameters), count(array_unique(array_map(static fn (array $p) => $p['in'].' '.$p['name'], $parameters))), "{$method} {$path} names a parameter twice");

                foreach ($operation['tags'] as $tag) {
                    $this->assertContains(['name' => $tag], $doc['tags'], "{$method} {$path}");
                }
            }
        }

        $this->assertSame($ids, array_values(array_unique($ids)), 'operation ids are unique');

        $refs = 0;
        $this->walk($doc, function (array $node, string $at) use ($doc, &$refs): void {
            // A map of properties has names for keys, not keywords.
            if (str_ends_with($at, '/properties')) {
                return;
            }

            if (isset($node['$ref'])) {
                $refs++;
                $this->assertIsString($node['$ref'], $at);
                $this->assertNotNull($this->target($doc, $node['$ref']), "{$at}: {$node['$ref']} leads nowhere");
            }

            foreach ((array) ($node['required'] ?? []) as $key) {
                if (is_string($key) && isset($node['properties'])) {
                    $this->assertArrayHasKey($key, $node['properties'], "{$at}: requires {$key}, which it does not describe");
                }
            }
        });

        $this->assertGreaterThan(0, $refs);
        $this->assertSame([], $this->listsForObjects(json_decode($json)), 'an object\'s default is {}, not []');
    }

    /** Where the JSON itself has an empty list as the default of something that is not a list. */
    private function listsForObjects(mixed $node, string $at = '#'): array
    {
        $found = [];

        if ($node instanceof \stdClass && ! str_ends_with($at, '/properties') && ($node->default ?? null) === [] && isset($node->type) && ! in_array('array', (array) $node->type, true)) {
            $found[] = $at;
        }

        foreach (is_array($node) || $node instanceof \stdClass ? (array) $node : [] as $key => $child) {
            $found = [...$found, ...$this->listsForObjects($child, "{$at}/{$key}")];
        }

        return $found;
    }

    private function walk(array $node, callable $visit, string $at = '#'): void
    {
        $visit($node, $at);

        foreach ($node as $key => $child) {
            if (is_array($child)) {
                $this->walk($child, $visit, "{$at}/{$key}");
            }
        }
    }

    private function target(array $doc, string $ref): ?array
    {
        if (! str_starts_with($ref, '#/')) {
            return null;
        }

        foreach (explode('/', substr($ref, 2)) as $key) {
            $doc = is_array($doc) ? ($doc[str_replace(['~1', '~0'], ['/', '~'], $key)] ?? null) : null;
        }

        return is_array($doc) ? $doc : null;
    }

    /** The document with every reference replaced by what it leads to, so a schema in it can be held against an answer. */
    private function resolved(array $doc, ?array $node = null): array
    {
        $node ??= $doc;

        if (isset($node['$ref']) && is_string($node['$ref'])) {
            return $this->resolved($doc, $this->target($doc, $node['$ref']) ?? $this->fail("{$node['$ref']} leads nowhere"));
        }

        foreach ($node as $key => $child) {
            if (is_array($child)) {
                $node[$key] = $this->resolved($doc, $child);
            }
        }

        return $node;
    }
}

<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Modules\Mcp\Server;
use Cms\Support\Schema\SchemaException;
use Cms\Support\Schema\Validator;
use Cms\Tests\TestCase;
use Cms\Users\ApiToken;

/**
 * Every ability says what it answers with. The schemas are held true by every test there is: TestCase turns on
 * AbilityRegistry::$verifyOutput, so a result its schema does not describe fails the test that got it.
 */
final class AbilityOutputTest extends TestCase
{
    private const array KEYWORDS = ['type', 'properties', 'required', 'items', 'additionalProperties', 'enum', 'anyOf', 'description', 'const'];

    protected function plugins(): array
    {
        return ['letterncms/assistant', 'letterncms/blocks', 'letterncms/collaboration', 'letterncms/languages', 'letterncms/mcp', 'letterncms/site'];
    }

    public function test_every_ability_declares_what_it_answers_with(): void
    {
        $abilities = $this->cms()->abilities()->all();
        $this->assertGreaterThan(150, count($abilities));

        foreach ($abilities as $name => $ability) {
            $schema = $ability->output();
            $this->assertNotNull($schema, "{$name} has no output schema");
            $this->assertSame($schema, $ability->toArray()['output'] ?? null);
            $this->assertSame([], $this->vague($schema), "{$name}: its output schema leaves something unsaid");
        }
    }

    /**
     * Where a schema says less than it could, by path. Every node has a type (or is one of several shapes, or a
     * fixed value); a list says what it holds; an object names its keys. Where a value or a map's keys depend on
     * something else (a field's type, a plugin's settings) the node says so in a description.
     *
     * @return list<string>
     */
    private function vague(array $schema, string $path = '$'): array
    {
        $unknown = array_diff(array_keys($schema), self::KEYWORDS);

        if ($unknown !== []) {
            // A short form handed over without Shape::of() would be read as JSON Schema, and describe nothing.
            return ["{$path}: not JSON Schema (".implode(', ', $unknown).')'];
        }

        if (isset($schema['anyOf'])) {
            return array_merge(...array_map(fn ($option, $i) => $this->vague((array) $option, "{$path}|{$i}"), $schema['anyOf'], array_keys($schema['anyOf'])));
        }

        $types = (array) ($schema['type'] ?? []);
        $explained = trim((string) ($schema['description'] ?? '')) !== '';
        $found = [];

        if ($types === [] && ! isset($schema['enum']) && ! array_key_exists('const', $schema) && ! $explained) {
            $found[] = "{$path}: any type, without saying what decides it";
        }

        if (in_array('array', $types, true)) {
            $found = isset($schema['items']) ? [...$found, ...$this->vague((array) $schema['items'], "{$path}[]")] : [...$found, "{$path}: a list of what?"];
        }

        if (in_array('object', $types, true)) {
            $additional = $schema['additionalProperties'] ?? false;

            if ($additional === true && ! $explained) {
                $found[] = "{$path}: takes any keys, without saying what decides them";
            } elseif ($additional === false && ! isset($schema['properties'])) {
                $found[] = "{$path}: an object with no keys";
            }

            foreach ((array) ($schema['properties'] ?? []) as $key => $sub) {
                $found = [...$found, ...$this->vague((array) $sub, "{$path}.{$key}")];
            }

            if (is_array($additional)) {
                $found = [...$found, ...$this->vague($additional, "{$path}.*")];
            }
        }

        return $found;
    }

    public function test_every_ability_is_named_in_a_test(): void
    {
        $tests = '';

        foreach ([dirname(__DIR__), ...(glob(dirname(__DIR__, 2).'/modules/*/tests') ?: [])] as $dir) {
            foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS)) as $file) {
                if ($file->getExtension() === 'php') {
                    $tests .= file_get_contents($file->getPathname());
                }
            }
        }

        // The whole suite also checks that each one actually ran (Support\AbilityCoverage); this holds in any run.
        foreach (array_keys($this->cms()->abilities()->all()) as $name) {
            $this->assertStringContainsString("'{$name}'", $tests, "No test names {$name}: run it in one, so its output schema is held against a real result.");
        }
    }

    public function test_a_result_its_schema_does_not_describe_is_caught(): void
    {
        $abilities = $this->cms()->abilities();
        $shape = \Cms\Support\Schema\Shape::class;
        $refused = function (mixed $output, mixed $result) use ($abilities): string {
            $abilities->register('example/drift', ['output' => $output, 'handler' => static fn () => $result]);

            try {
                $abilities->execute('example/drift', [], AbilityContext::system());
            } catch (\LogicException $e) {
                return $e->getMessage();
            }

            return '';
        };

        $this->assertStringContainsString('count is string, not integer', $refused($shape::of(['count' => $shape::INTEGER]), ['count' => 'three']));
        // A key the schema does not name, a list where a map is said, a map where a list is said.
        $this->assertStringContainsString('extra is not in the schema', $refused($shape::of(['count' => $shape::INTEGER]), ['count' => 3, 'extra' => true]));
        $this->assertStringContainsString('tags is an object, not array', $refused($shape::of(['tags' => [$shape::STRING]]), ['tags' => ['a' => 'b']]));
        $this->assertStringContainsString('meta is a list, not object', $refused($shape::of(['meta' => ['a?' => $shape::STRING]]), ['meta' => ['x', 'y']]));
        $this->assertStringContainsString('count is missing', $refused($shape::of(['count' => $shape::INTEGER]), []));

        // What is right passes: an empty map where a map is said, keys of an open map, an optional key left out.
        $this->assertSame('', $refused($shape::of(['meta' => ['a?' => $shape::STRING], 'data' => $shape::open('Anything a plugin stores.'), 'tags' => [$shape::STRING]]), ['meta' => [], 'data' => ['x' => [1, 2]], 'tags' => []]));
    }

    public function test_maps_are_objects_on_every_transport_also_when_empty(): void
    {
        [, $token] = ApiToken::issue($this->admin(), 'a');
        $headers = ['Authorization' => "Bearer {$token}"];

        // An entry of a collection without fields has no values: `data` is {} and never [].
        \Cms\Support\Yaml::write($this->site.'/content/collections/bare.yaml', ['title' => 'Bare', 'singular' => 'Bare', 'fields' => []]);
        $this->cms()->collections()->flush();

        $rest = $this->postJson('/api/v1/abilities/entries/create', ['collection' => 'bare', 'title' => 'Nothing in it'], $headers)->assertOk();
        $this->assertStringContainsString('"data":{}', $rest->getContent());

        $id = $rest->json('data.id');
        $this->assertStringContainsString('"data":{}', $this->postJson('/api/v1/batch', ['calls' => [['ability' => 'entries/get', 'input' => ['id' => $id]]]], $headers)->getContent());

        $rpc = fn (string $method, array $params = []) => $this->postJson('/mcp', ['jsonrpc' => '2.0', 'id' => 1, 'method' => $method, 'params' => [...$params, '_meta' => ['io.modelcontextprotocol/protocolVersion' => Server::MODERN]]], $headers);
        $this->assertStringContainsString('"data":{}', $rpc('tools/call', ['name' => 'entries.get', 'arguments' => ['id' => $id]])->getContent());

        // A list that is empty is still a list under `items`, as the tool's output schema requires.
        $empty = $rpc('tools/call', ['name' => 'entries.lookup', 'arguments' => ['ids' => []]]);
        $this->assertStringContainsString('"structuredContent":{"items":[]}', $empty->getContent());

        \Illuminate\Support\Facades\Artisan::call('run', ['ability' => 'entries/get', 'input' => ["id={$id}"]], $buffer = new \Symfony\Component\Console\Output\BufferedOutput);
        $this->assertMatchesRegularExpression('/"data": \{\}/', $buffer->fetch());

        // In PHP the result stays the array the handler returned.
        $this->assertSame([], $this->cms()->abilities()->execute('entries/get', ['id' => $id], AbilityContext::system())['data']);
    }

    public function test_entries_answer_as_described(): void
    {
        $admin = $this->admin();
        $ctx = AbilityContext::forUser($admin, 'rest');
        $run = fn (string $name, array $input = []) => $this->cms()->abilities()->execute($name, $input, $ctx);

        $parent = $run('entries/create', ['collection' => 'pages', 'title' => 'Parent', 'status' => 'published']);
        $child = $run('entries/create', ['collection' => 'pages', 'title' => 'Child']);
        $other = $run('entries/create', ['collection' => 'pages', 'title' => 'Other']);

        $moved = $run('entries/move', ['id' => $child['id'], 'parentId' => $parent['id']]);
        $this->assertSame($parent['id'], $moved['parentId']);
        $this->assertSame(['ok' => true], $run('entries/reorder', ['collection' => 'pages', 'ids' => [$other['id'], $parent['id']]]));

        $run('entries/update', ['id' => $parent['id'], 'title' => 'Parent, changed']);
        $this->assertFalse($run('entries/discard-draft', ['id' => $parent['id']])['hasDraft']);

        $revisions = $run('entries/revisions', ['id' => $parent['id']]);
        $this->assertNotSame([], $revisions);
        $this->assertSame($parent['id'], $run('entries/revision', ['id' => $revisions[0]['id']])['entryId']);
        $this->assertSame($parent['id'], $run('entries/restore', ['revisionId' => $revisions[count($revisions) - 1]['id']])['id']);

        $this->assertSame([$child['id'], $parent['id']], array_column($run('entries/lookup', ['ids' => [$child['id'], $parent['id']]]), 'id'));
        $this->assertNotSame([], $run('content/recent'));
        $this->assertNotSame([], $run('content/search', ['query' => 'Child']));
        $this->assertNotSame([], $run('fields/types'));
        $this->assertNotSame([], $run('entries/tree', ['collection' => 'pages', 'fields' => ['summary']]));
        $this->assertSame('pages', $run('collections/get', ['handle' => 'pages'])['handle']);
        $this->assertSame('Test site', $run('site/get')['name']);
        $this->assertSame(PHP_VERSION, $run('system/info')['php']);
        $this->assertNotSame([], $run('users/lookup', ['search' => 'Ada'])['items']);
        $this->assertContains('entries/create', array_column($run('abilities/list'), 'name'));

        // A list with the fields asked for and without, a revision that kept a working copy, and the rest of what describes the site.
        $listed = $run('entries/list', ['collection' => 'pages', 'fields' => ['summary']]);
        $this->assertArrayHasKey('values', $listed['items'][0]);
        $this->assertArrayNotHasKey('values', $run('entries/list', ['collection' => 'pages', 'status' => 'published'])['items'][0]);
        $this->assertContains($child['id'], array_column(array_merge(...array_column($run('entries/tree', ['collection' => 'pages']), 'children')), 'id'));

        $run('entries/update', ['id' => $parent['id'], 'title' => 'Parent, changed again', 'data' => ['summary' => 'Kept beside it']]);
        $run('entries/publish', ['id' => $parent['id']]);
        $snapshots = array_map(fn (array $revision) => $run('entries/revision', ['id' => $revision['id']])['snapshot'], $run('entries/revisions', ['id' => $parent['id']]));
        $this->assertNotSame([], array_filter(array_column($snapshots, 'draft')), 'A revision that kept the working copy');
        $this->assertSame('draft', $run('entries/unpublish', ['id' => $parent['id']])['status']);
        $this->assertSame('draft', $run('entries/duplicate', ['id' => $child['id']])['status']);
        $this->assertSame($other['id'], $run('entries/delete', ['id' => $other['id']])['deleted']);

        $this->assertContains('pages', array_column($run('collections/list'), 'handle'));
        $this->assertNotSame([], $run('collections/options')['settings']);
        $this->assertSame('ui/page', $run('views/get', ['id' => 'content', 'params' => ['collection' => 'pages']])['root']['type']);
        $this->assertSame([$admin->id], array_column($run('users/list')['items'], 'id'));
        $this->assertIsArray($run('system/info')['pending']);
        $this->assertSame([], $run('pages/builtin', ['group' => 'none']));
    }

    public function test_rest_and_mcp_list_the_output_schema(): void
    {
        [, $token] = ApiToken::issue($this->admin(), 'a');
        $headers = ['Authorization' => "Bearer {$token}"];

        $listed = array_column($this->getJson('/api/v1/abilities', $headers)->assertOk()->json('data'), null, 'name');
        $this->assertSame('object', $listed['entries/create']['output']['type']);
        $this->assertContains('slug', $listed['entries/create']['output']['required']);

        $rpc = fn (string $method, array $params = []) => $this->postJson('/mcp', ['jsonrpc' => '2.0', 'id' => 1, 'method' => $method, 'params' => [...$params, '_meta' => ['io.modelcontextprotocol/protocolVersion' => Server::MODERN]]], $headers);
        $tools = array_column($rpc('tools/list')->assertOk()->json('result.tools'), null, 'name');

        foreach ($tools as $name => $tool) {
            $this->assertSame('object', $tool['outputSchema']['type'] ?? null, "{$name}: a tool's output schema is an object");
        }

        // An object is given as it is, a list under `items`: the schema says the same, and the content follows it.
        $this->assertContains('slug', $tools['entries.create']['outputSchema']['required']);
        $this->assertSame('array', $tools['collections.list']['outputSchema']['properties']['items']['type']);

        foreach (['collections.list' => [], 'entries.create' => ['collection' => 'pages', 'title' => 'Hello'], 'entries.list' => ['collection' => 'pages']] as $name => $arguments) {
            $content = $rpc('tools/call', ['name' => $name, 'arguments' => $arguments])->assertOk()->assertJsonPath('result.isError', false)->json('result.structuredContent');

            $this->assertSame([], \Cms\Support\Schema\Conform::errors(json_decode((string) json_encode($content)), $tools[$name]['outputSchema']), $name);
        }

        $this->assertSame(['items' => [1, 2]], Server::structured([1, 2]));
        $this->assertSame(['items' => []], Server::structured([]));
        $this->assertEquals(new \stdClass, Server::structured(new \stdClass));
        $this->assertSame(['result' => 'text'], Server::structured('text'));
        $this->assertSame(['result' => null], Server::structured(null));
    }
}

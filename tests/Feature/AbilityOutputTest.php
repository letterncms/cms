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
    private const array KEYWORDS = ['type', 'properties', 'required', 'items', 'additionalProperties', 'enum', 'anyOf'];

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
            // A short form handed over without Shape::of() would be read as JSON Schema, and describe nothing.
            $this->assertSame([], array_diff(array_keys($schema), self::KEYWORDS), "{$name}: its output is not JSON Schema");
            $this->assertSame($schema, $ability->toArray()['output'] ?? null);
        }
    }

    public function test_a_result_its_schema_does_not_describe_is_caught(): void
    {
        $this->cms()->abilities()->register('example/drift', [
            'output' => \Cms\Support\Schema\Shape::of(['count' => \Cms\Support\Schema\Shape::INTEGER]),
            'handler' => static fn () => ['count' => 'three'],
        ]);

        $this->expectException(\LogicException::class);
        $this->expectExceptionMessage('example/drift answered with something its output schema does not describe: count');
        $this->cms()->abilities()->execute('example/drift', [], AbilityContext::system());
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

        $this->assertSame([$child['id'], $parent['id']], array_column($run('entries/get-many', ['ids' => [$child['id'], $parent['id']]]), 'id'));
        $this->assertNotSame([], $run('content/recent'));
        $this->assertNotSame([], $run('content/search', ['query' => 'Child']));
        $this->assertNotSame([], $run('fields/types'));
        $this->assertNotSame([], $run('entries/tree', ['collection' => 'pages', 'fields' => ['summary']]));
        $this->assertSame('pages', $run('collections/get', ['handle' => 'pages'])['handle']);
        $this->assertSame('Test site', $run('settings/get', ['namespace' => 'site'])['values']['name']);
        $this->assertSame(PHP_VERSION, $run('system/info')['php']);
        $this->assertNotSame([], $run('people/list', ['search' => 'Ada'])['items']);
        $this->assertContains('entries/create', array_column($run('abilities/list'), 'name'));
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
        // One that changes something answers a dry run with its report instead.
        $this->assertContains('slug', $tools['entries.create']['outputSchema']['anyOf'][0]['required']);
        $this->assertContains('dryRun', $tools['entries.create']['outputSchema']['anyOf'][1]['required']);
        $this->assertSame('array', $tools['collections.list']['outputSchema']['properties']['items']['type']);

        foreach (['collections.list' => [], 'entries.create' => ['collection' => 'pages', 'title' => 'Hello'], 'entries.list' => ['collection' => 'pages']] as $name => $arguments) {
            $content = $rpc('tools/call', ['name' => $name, 'arguments' => $arguments])->assertOk()->assertJsonPath('result.isError', false)->json('result.structuredContent');

            try {
                Validator::validate($content, $tools[$name]['outputSchema']);
            } catch (SchemaException $e) {
                $this->fail("{$name}: ".$e->getMessage());
            }
        }

        $this->assertSame(['items' => [1, 2]], Server::structured([1, 2]));
        $this->assertSame(['result' => 'text'], Server::structured('text'));
        $this->assertSame(['result' => null], Server::structured(null));
    }
}

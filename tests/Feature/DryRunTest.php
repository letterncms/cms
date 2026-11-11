<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\Ability;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Support\Schema\Validator;
use Cms\Tests\TestCase;
use Cms\Users\ApiToken;
use Cms\Users\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Console\Output\BufferedOutput;

/** `dryRun: true` on anything that changes something: checked as usual, nothing written, and a report of what would change. */
final class DryRunTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/mcp'];
    }

    private function run_(string $name, array $input, ?User $as = null): mixed
    {
        return $this->cms()->abilities()->execute($name, $input, AbilityContext::forUser($as ?? $this->admin, 'rest'));
    }

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->admin();
    }

    public function test_every_ability_that_changes_something_takes_it_and_no_other_does(): void
    {
        foreach ($this->cms()->abilities()->all() as $name => $ability) {
            $properties = (array) ($ability->toArray()['input']['properties'] ?? []);
            $this->assertSame(! $ability->isReadOnly(), isset($properties['dryRun']), $name);
        }

        // Asking an ability that only reads is not a way around its input schema.
        $this->assertArrayNotHasKey('dryRun', (array) $this->run_('entries/list', ['collection' => 'pages', 'dryRun' => true]));
    }

    public function test_nothing_is_written_run_or_recorded(): void
    {
        $executed = 0;
        $this->cms()->hooks()->on('ability.executing', static function () use (&$executed): void { $executed++; });
        $this->cms()->hooks()->on('ability.executed', static function () use (&$executed): void { $executed++; });

        $report = $this->run_('entries/create', ['collection' => 'posts', 'title' => 'Not yet', 'data' => ['excerpt' => 'Soon'], 'dryRun' => true]);

        $this->assertTrue($report['dryRun']);
        $this->assertSame('entries/create', $report['ability']);
        $this->assertSame('Not yet', $report['input']->title);
        $this->assertSame('draft', $report['input']->status, 'the input is reported as it was understood, defaults included');
        $this->assertSame([['action' => 'create', 'type' => 'entry', 'collection' => 'posts', 'title' => 'Not yet', 'locale' => 'en']], $report['changes']);
        Validator::validate(json_decode((string) json_encode($report), true), Ability::DRY_RUN_OUTPUT);

        $this->assertSame(0, $executed);
        $this->assertSame(0, $this->cms()->entries()->query()->collection('posts')->count());
        $this->assertSame(0, DB::table('audit_log')->count());
        $this->assertSame(0, DB::table('revisions')->count());
    }

    public function test_it_refuses_what_the_real_run_refuses(): void
    {
        $refused = function (string $name, array $input, ?User $as = null): AbilityException {
            try {
                $this->run_($name, ['dryRun' => true, ...$input], $as);
            } catch (AbilityException $e) {
                return $e;
            }

            $this->fail("{$name} was not refused");
        };

        // The input schema, then the fields of the collection.
        $this->assertArrayHasKey('title', $refused('entries/create', ['collection' => 'pages'])->details);
        $this->assertSame('invalid_input', $refused('entries/create', ['collection' => 'posts', 'title' => 'Live', 'status' => 'published'])->type);
        $this->assertSame('invalid_input', $refused('entries/create', ['collection' => 'posts', 'title' => 'Tags', 'data' => ['excerpt' => ['not', 'text']]])->type);
        $this->assertSame('not_found', $refused('entries/create', ['collection' => 'nothing', 'title' => 'x'])->type);
        $this->assertSame('invalid_input', $refused('entries/create', ['collection' => 'pages', 'title' => 'x', 'dryRun' => 'perhaps'])->type);

        // Permissions.
        $author = $this->userWithRole('author');
        $this->assertSame('forbidden', $refused('entries/create', ['collection' => 'pages', 'title' => 'Sneaky', 'status' => 'published'], $author)->type);
        $this->assertSame('forbidden', $refused('collections/delete', ['handle' => 'pages'], $author)->type);

        // What only the handler knows: a record that is gone, one that changed, one that is in use.
        $entry = $this->run_('entries/create', ['collection' => 'pages', 'title' => 'Here']);
        $this->assertSame('not_found', $refused('entries/delete', ['id' => '01jc8w6m3x9k2h4v5t7r0p1q3s'])->type);
        $this->assertSame('conflict', $refused('entries/update', ['id' => $entry['id'], 'title' => 'x', 'expectedVersion' => str_repeat('0', 64)])->type);
        $this->assertSame('invalid_input', $refused('collections/delete', ['handle' => 'pages'])->type);
        $this->assertSame('conflict', $refused('users/delete', ['id' => $this->admin->id])->type);
        $this->assertSame('not_found', $refused('settings/update', ['namespace' => 'nothing', 'values' => []])->type);
    }

    public function test_changes_to_an_entry_are_named_and_not_made(): void
    {
        $entry = $this->run_('entries/create', ['collection' => 'pages', 'title' => 'Before', 'data' => ['summary' => 'Same'], 'status' => 'published']);

        $update = $this->run_('entries/update', ['id' => $entry['id'], 'title' => 'After', 'data' => ['summary' => 'Same'], 'dryRun' => true]);
        $this->assertSame([['action' => 'update', 'type' => 'entry', 'id' => $entry['id'], 'collection' => 'pages', 'title' => 'Before', 'fields' => ['title']]], $update['changes']);

        $update = $this->run_('entries/update', ['id' => $entry['id'], 'data' => ['summary' => 'Other'], 'publish' => true, 'dryRun' => true]);
        $this->assertSame('update-published', $update['changes'][0]['action']);
        $this->assertSame(['summary'], $update['changes'][0]['fields']);

        foreach (['entries/unpublish' => 'unpublish', 'entries/publish' => 'publish', 'entries/discard-draft' => 'discard-draft', 'entries/duplicate' => 'duplicate', 'entries/delete' => 'delete'] as $ability => $action) {
            $report = $this->run_($ability, ['id' => $entry['id'], 'expectedVersion' => $entry['version'], 'dryRun' => true]);
            $this->assertSame($action, $report['changes'][0]['action']);
            $this->assertSame($entry['id'], $report['changes'][0]['id']);
        }

        $this->assertSame('move', $this->run_('entries/move', ['id' => $entry['id'], 'parentId' => null, 'dryRun' => true])['changes'][0]['action']);

        $same = $this->run_('entries/get', ['id' => $entry['id']]);
        $this->assertSame($entry['version'], $same['version']);
        $this->assertSame('Before', $same['title']);
        $this->assertSame('published', $same['status']);
        $this->assertSame(1, $this->cms()->entries()->query()->collection('pages')->count());

        $delete = $this->run_('collections/delete', ['handle' => 'pages', 'deleteEntries' => true, 'dryRun' => true]);
        $this->assertSame(1, $delete['changes'][0]['entries']);
        $this->assertNotNull($this->cms()->collections()->find('pages'));
    }

    public function test_an_ability_that_cannot_say_what_changes_still_checks_and_writes_nothing(): void
    {
        $report = $this->run_('users/create', ['name' => 'New', 'email' => 'new@example.com', 'password' => 'a-long-secret-123', 'roles' => ['editor'], 'dryRun' => true]);

        $this->assertTrue($report['dryRun']);
        $this->assertNull($report['changes']);
        $this->assertFalse(User::query()->where('email', 'new@example.com')->exists());

        $this->expectException(AbilityException::class);
        $this->run_('users/create', ['name' => 'New', 'dryRun' => true]);
    }

    public function test_rest_mcp_and_the_command_line_take_it(): void
    {
        [, $token] = ApiToken::issue($this->admin, 'a');
        $headers = ['Authorization' => "Bearer {$token}"];
        $input = ['collection' => 'pages', 'title' => 'Dry', 'dryRun' => true];

        $this->postJson('/api/v1/abilities/entries/create', $input, $headers)->assertOk()
            ->assertJsonPath('data.dryRun', true)->assertJsonPath('data.changes.0.action', 'create');

        $rpc = fn (string $method, array $params = []) => $this->postJson('/mcp', ['jsonrpc' => '2.0', 'id' => 1, 'method' => $method, 'params' => [...$params, '_meta' => ['io.modelcontextprotocol/protocolVersion' => '2026-07-28']]], $headers);
        $tools = array_column($rpc('tools/list')->json('result.tools'), null, 'name');
        $this->assertSame('boolean', $tools['entries.create']['inputSchema']['properties']['dryRun']['type']);
        $this->assertArrayNotHasKey('dryRun', $tools['entries.list']['inputSchema']['properties']);

        $content = $rpc('tools/call', ['name' => 'entries.create', 'arguments' => $input])->assertJsonPath('result.isError', false)->json('result.structuredContent');
        $this->assertTrue($content['dryRun']);
        Validator::validate($content, $tools['entries.create']['outputSchema']);

        $code = Artisan::call('run', ['ability' => 'entries/create', 'input' => ['collection=pages', 'title=Dry'], '--dry-run' => true], $buffer = new BufferedOutput);
        $this->assertSame(0, $code);
        $this->assertTrue(json_decode($buffer->fetch(), true)['data']['dryRun']);

        $this->assertSame(0, $this->cms()->entries()->query()->collection('pages')->count());
    }
}

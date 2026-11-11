<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Console\Command;
use Cms\Tests\TestCase;
use Cms\Users\ApiToken;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\Console\Output\BufferedOutput;

/** The command line as a contract: `cms run`, `token:create`, and `--json` on every command. */
final class ConsoleTest extends TestCase
{
    /** @return array{0: int, 1: mixed, 2: string} exit code, the decoded document, the raw output */
    private function cli(string $command, array $params = []): array
    {
        // Its own buffer: a command that calls another (sync runs migrate) would leave only that one's output behind.
        $code = Artisan::call($command, $params, $buffer = new BufferedOutput);
        $output = $buffer->fetch();

        return [$code, json_decode($output, true), $output];
    }

    public function test_run_prints_the_result_as_one_document(): void
    {
        [$code, $document] = $this->cli('run', ['ability' => 'entries/create', 'input' => ['collection=pages', 'title=From the shell', 'data={"summary":"Hi"}']]);

        $this->assertSame(0, $code);
        $this->assertSame(['data'], array_keys($document));
        $this->assertSame('from-the-shell', $document['data']['slug']);
        $this->assertSame('Hi', $document['data']['data']['summary']);

        [$code, $document] = $this->cli('run', ['ability' => 'entries/get', '--input' => json_encode(['id' => $document['data']['id']])]);

        $this->assertSame(0, $code);
        $this->assertSame('From the shell', $document['data']['title']);
    }

    public function test_run_coerces_values_from_the_shell(): void
    {
        [$code, $document] = $this->cli('run', ['ability' => 'entries/list', 'input' => ['collection=pages', 'perPage=5']]);

        $this->assertSame(0, $code);
        $this->assertSame(5, $document['data']['perPage']);
    }

    public function test_run_fails_with_the_error_document_and_a_non_zero_exit(): void
    {
        [$code, $document, $output] = $this->cli('run', ['ability' => 'entries/create', 'input' => ['collection=pages']]);

        $this->assertSame(1, $code);
        $this->assertSame(['error'], array_keys($document));
        $this->assertSame('invalid_input', $document['error']['type']);
        $this->assertIsString($document['error']['message']);
        $this->assertArrayHasKey('title', $document['error']['details']);
        $this->assertStringStartsWith('{', $output);

        [$code, $document] = $this->cli('run', ['ability' => 'nothing/here']);
        $this->assertSame(1, $code);
        $this->assertSame('not_found', $document['error']['type']);

        [$code, $document] = $this->cli('run', ['ability' => 'entries/list', '--input' => '[1, 2]']);
        $this->assertSame(1, $code);
        $this->assertSame('invalid_input', $document['error']['type']);

        [$code, $document] = $this->cli('run', ['ability' => 'entries/list', '--as' => 'nobody@example.com']);
        $this->assertSame(1, $code);
        $this->assertSame('not_found', $document['error']['type']);
    }

    public function test_run_as_a_person_keeps_to_their_permissions(): void
    {
        $author = $this->userWithRole('author');
        [, $created] = $this->cli('run', ['ability' => 'entries/create', 'input' => ['collection=pages', 'title=Mine'], '--as' => $author->email]);

        [$code, $document] = $this->cli('run', ['ability' => 'entries/publish', 'input' => ['id='.$created['data']['id']], '--as' => $author->email]);

        $this->assertSame(1, $code);
        $this->assertSame('forbidden', $document['error']['type']);
    }

    public function test_run_lists_abilities_as_a_table_or_a_document(): void
    {
        [$code, $document, $output] = $this->cli('run', ['--list' => true]);
        $this->assertSame(0, $code);
        $this->assertNull($document);
        $this->assertStringContainsString('entries/create', $output);

        [$code, $document] = $this->cli('run', ['--list' => true, '--json' => true]);
        $this->assertSame(0, $code);
        $this->assertContains('entries/create', array_column($document['data'], 'name'));
    }

    public function test_token_create_issues_a_working_token(): void
    {
        $admin = $this->admin();

        [$code, $document] = $this->cli('token:create', ['email' => $admin->email, '--name' => 'Deploy', '--scope' => ['entries/*'], '--days' => '7', '--json' => true]);

        $this->assertSame(0, $code);
        $this->assertSame('Deploy', $document['data']['name']);
        $this->assertSame(['entries/*'], $document['data']['scopes']);
        $this->assertNotNull($document['data']['expiresAt']);

        $token = ApiToken::findByPlain($document['data']['token']);
        $this->assertNotNull($token);
        $this->assertTrue($token->user->is($admin));

        $this->getJson('/api/v1/abilities/entries/list?collection=pages', ['Authorization' => 'Bearer '.$document['data']['token']])->assertOk();
        $this->app['auth']->forgetGuards(); // a new request, as it would be outside a test
        $this->getJson('/api/v1/abilities/users/list', ['Authorization' => 'Bearer '.$document['data']['token']])->assertForbidden();
    }

    public function test_token_create_prints_the_token_for_a_person_and_fails_for_a_stranger(): void
    {
        $admin = $this->admin();

        [$code, , $output] = $this->cli('token:create', ['email' => $admin->email]);
        $this->assertSame(0, $code);
        $this->assertNotNull(ApiToken::findByPlain(trim(strtok($output, "\n"))));

        [$code, $document] = $this->cli('token:create', ['email' => 'nobody@example.com', '--json' => true]);
        $this->assertSame(1, $code);
        $this->assertSame('not_found', $document['error']['type']);
    }

    public function test_what_fails_before_a_command_runs_is_the_error_document_too(): void
    {
        $kernel = $this->app->make(\Illuminate\Contracts\Console\Kernel::class);
        $run = static function (array $argv) use ($kernel): array {
            $code = $kernel->handle(new \Symfony\Component\Console\Input\ArgvInput(['cms', ...$argv]), $buffer = new BufferedOutput);
            $output = $buffer->fetch();

            return [$code, json_decode($output, true), $output];
        };

        [$code, $document, $output] = $run(['no-such-command', '--json']);
        $this->assertSame(1, $code);
        $this->assertSame('not_found', $document['error']['type']);
        $this->assertStringContainsString('no-such-command', $document['error']['message']);
        $this->assertStringStartsWith('{', $output);

        [$code, $document] = $run(['token:create', '--json']);
        $this->assertSame(1, $code);
        $this->assertSame('invalid_input', $document['error']['type']);

        [$code, $document] = $run(['plugins', '--no-such-option', '--json']);
        $this->assertSame(1, $code);
        $this->assertSame('invalid_input', $document['error']['type']);

        // Without --json the console answers as it always did.
        [$code, $document, $output] = $run(['no-such-command']);
        $this->assertSame(1, $code);
        $this->assertNull($document);
        $this->assertStringContainsString('no-such-command', $output);
    }

    public function test_every_command_takes_json_and_prints_one_document(): void
    {
        $ours = array_filter(Artisan::all(), static fn ($command) => $command instanceof Command);
        $this->assertArrayHasKey('run', $ours);
        $this->assertArrayHasKey('plugins', $ours);
        $this->assertArrayHasKey('sync', $ours);

        foreach ($ours as $name => $command) {
            $this->assertTrue($command->getDefinition()->hasOption('json'), "{$name} has no --json");
        }

        // Every command the CMS adds is one of ours: none is left on the framework's base class.
        foreach (Artisan::all() as $name => $command) {
            if (str_starts_with($command::class, 'Cms\\')) {
                $this->assertInstanceOf(Command::class, $command, "{$name} does not extend ".Command::class);
            }
        }

        [$code, $document, $output] = $this->cli('plugins', ['--json' => true]);
        $this->assertSame(0, $code);
        $this->assertContains('letterncms/content', array_column($document['data']['plugins'], 'name'));
        $this->assertStringStartsWith('{', $output);

        [$code, $document] = $this->cli('sync', ['--json' => true]);
        $this->assertSame(0, $code);
        $this->assertArrayHasKey('done', $document['data']);

        [$code, $document] = $this->cli('publish:scheduled', ['--json' => true]);
        $this->assertSame(0, $code);
        $this->assertSame(0, $document['data']['activated']);
    }

    public function test_a_failing_command_prints_the_error_document(): void
    {
        [$code, $document, $output] = $this->cli('plugin', ['action' => 'enable', 'name' => 'nobody/nothing', '--json' => true]);

        $this->assertSame(1, $code);
        $this->assertSame(['error'], array_keys($document));
        $this->assertSame(['type', 'message'], array_keys($document['error']));
        $this->assertStringStartsWith('{', $output);

        // Something thrown on the way is the same document, not a stack trace.
        [$code, $document] = $this->cli('install:finish', ['email' => 'nobody@example.com', '--json' => true]);
        $this->assertSame(1, $code);
        $this->assertSame('not_found', $document['error']['type']);

        // What nobody caught is logged, and said without its internals.
        \Illuminate\Support\Facades\Schema::drop('packages');
        $reported = [];
        $this->app->make(\Illuminate\Contracts\Debug\ExceptionHandler::class)->reportable(static function (\Throwable $e) use (&$reported): bool {
            $reported[] = $e;

            return false;
        });
        [$code, $document, $output] = $this->cli('sync', ['--json' => true]);
        $this->assertCount(1, $reported);
        $this->assertInstanceOf(\Illuminate\Database\QueryException::class, $reported[0]);
        $this->assertSame(1, $code);
        $this->assertSame(['type' => 'failed', 'message' => 'The command failed.'], $document['error']);
        $this->assertStringNotContainsStringIgnoringCase('select', $output);
        $this->assertStringNotContainsString('packages', $output);

        // Without --json a person reads a line, and the exit code says the same.
        [$code, $document, $output] = $this->cli('plugin', ['action' => 'enable', 'name' => 'nobody/nothing']);
        $this->assertSame(1, $code);
        $this->assertNull($document);
        $this->assertNotSame('', trim($output));
    }
}

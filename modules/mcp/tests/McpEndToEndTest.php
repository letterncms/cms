<?php

declare(strict_types=1);

namespace Cms\Modules\Mcp\Tests;

use Cms\Support\Files;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Process\Process;

/**
 * An agent's whole errand over MCP, against a site installed as a person installs one and served over real
 * HTTP: the handshake with an API token, every ability as a tool with its schemas, a collection's schema read
 * as a resource, a page made from that schema alone (first as a dry run that writes nothing), published, built
 * and fetched as HTML, then deleted, again after a dry run. Nothing is faked between the client and the site.
 */
final class McpEndToEndTest extends TestCase
{
    private const array ENV = ['APP_ENV' => 'production', 'APP_DEBUG' => 'false', 'APP_KEY' => 'base64:2fl+Ktvkfl+Fuz4Qp/A75G2RTiWVA/ZoKZvp6fiiM10=', 'DB_CONNECTION' => 'sqlite', 'CACHE_STORE' => 'file', 'SESSION_DRIVER' => 'file', 'BCRYPT_ROUNDS' => '4', 'MAIL_MAILER' => 'array', 'DB_PREFIX' => ''];

    private string $site;

    private int $port;

    private ?Process $server = null;

    private string $token = '';

    private int $id = 0;

    protected function setUp(): void
    {
        // A port nothing answers on: another test, or a site left running, would answer for this one.
        do {
            $this->port = random_int(18_901, 19_700);
        } while (is_resource($probe = @fsockopen('127.0.0.1', $this->port, $code, $message, 0.1)) && fclose($probe));

        $this->site = sys_get_temp_dir().'/cms-mcp-'.bin2hex(random_bytes(6));
        Files::ensureDir($this->site.'/storage/database');
        touch($this->site.'/storage/database/cms.sqlite');
        $this->token = (string) $this->step('install', ['url' => $this->url()]);
        $this->server = new Process([PHP_BINARY, '-S', '127.0.0.1:'.$this->port, __DIR__.'/fixtures/router.php'], $this->site, $this->env());
        $this->server->setTimeout(null);
        $this->server->start();

        for ($i = 0; $i < 200 && ! is_resource($up = @fsockopen('127.0.0.1', $this->port, $code, $message, 0.1)); $i++) {
            $this->assertTrue($this->server->isRunning(), 'The site did not start: '.$this->server->getErrorOutput().$this->server->getOutput());
            usleep(50_000);
        }

        $this->assertTrue(isset($up) && is_resource($up), "The site does not answer on port {$this->port}.");
        fclose($up);
    }

    protected function tearDown(): void
    {
        $this->server?->stop(1);
        Files::deleteDirectory($this->site);
    }

    public function test_an_agent_reads_the_schema_makes_a_page_publishes_it_and_deletes_it(): void
    {
        // The handshake, as an MCP client opens it.
        $hello = $this->rpc('initialize', ['protocolVersion' => '2025-11-25', 'capabilities' => (object) [], 'clientInfo' => ['name' => 'end-to-end', 'version' => '1']]);
        $this->assertSame('2025-11-25', $hello['result']['protocolVersion']);
        $this->assertSame('cms', $hello['result']['serverInfo']['name']);
        $this->assertSame(202, $this->post(['jsonrpc' => '2.0', 'method' => 'notifications/initialized'])[0]);

        // Every ability its owner may run is a tool, each with the schema of what it takes and of what it answers.
        $tools = array_column($this->rpc('tools/list')['result']['tools'], null, 'name');
        $expected = array_map(static fn (string $ability) => str_replace('/', '.', $ability), (array) $this->step('abilities'));
        sort($expected);
        $this->assertSame($expected, array_keys($tools));
        $this->assertGreaterThan(50, count($tools));

        foreach ($tools as $name => $tool) {
            $this->assertSame('object', $tool['inputSchema']['type'] ?? null, "{$name} has no input schema");
            $this->assertIsArray($tool['outputSchema'] ?? null, "{$name} has no output schema");
        }

        // What a page is, read from the site itself.
        $schema = json_decode($this->rpc('resources/read', ['uri' => 'cms://collections/pages/schema'])['result']['contents'][0]['text'], true);
        $fields = $schema['data']['properties'] ?? null;
        $this->assertIsArray($fields, 'The schema says what `data` of a page holds.');
        $blocks = array_key_first(array_filter($fields, static fn (array $field) => ($field['type'] ?? null) === 'array' && isset($field['items']['properties']['type'])));
        $this->assertIsString($blocks, 'The pages schema names a field of blocks.');
        $this->assertContains('dryRun', array_keys($schema['create']['properties']));

        // The blocks it may hold, and what each takes, from the catalog the schema points at.
        $catalog = json_decode($this->rpc('resources/read', ['uri' => 'cms://blocks'])['result']['contents'][0]['text'], true);
        $catalog = array_column($catalog['blocks'], null, 'name');
        $field = static function (string $block, string $handle) use ($catalog): array {
            $found = array_column($catalog[$block]['fields'] ?? [], null, 'handle')[$handle] ?? null;
            self::assertIsArray($found, "The catalog has no {$handle} for {$block}.");

            return $found;
        };
        $this->assertArrayHasKey('2', $field('heading', 'level')['options']);
        $field('heading', 'text');
        $field('paragraph', 'text');

        $page = [
            'collection' => 'pages',
            'title' => 'Made Over MCP',
            'status' => 'published',
            'data' => [$blocks => [
                ['type' => 'heading', 'props' => ['text' => 'Hello from an agent', 'level' => '2']],
                ['type' => 'paragraph', 'props' => ['text' => 'Written from the schema alone.']],
            ]],
        ];

        // A dry run checks it all and writes nothing.
        $dry = $this->call('entries.create', [...$page, 'dryRun' => true]);
        $this->assertTrue($dry['dryRun']);
        $this->assertSame('full', $dry['checked']);
        $this->assertSame('create-published', $dry['changes'][0]['action']);
        $this->assertSame([], array_values(array_filter((array) $this->step('entries', ['collection' => 'pages']), static fn (array $e) => $e['title'] === 'Made Over MCP')));

        $made = $this->call('entries.create', $page);
        $this->assertSame('made-over-mcp', $made['slug']);
        $this->assertSame('published', $made['status']);

        // Published and built: the page is a file, and what the agent wrote is on it.
        $this->call('site.build');

        // The build goes on in steps, each call to its status advancing it, as the admin's progress does.
        for ($i = 0; $i < 60 && ! is_file($this->site.'/public/made-over-mcp/index.html'); $i++) {
            $this->call('site.build-status');
        }

        $this->assertFileExists($this->site.'/public/made-over-mcp/index.html');
        [$status, $html] = $this->get('/made-over-mcp');
        $this->assertSame(200, $status);
        $this->assertStringContainsString('Hello from an agent', $html);
        $this->assertStringContainsString('Written from the schema alone.', $html);
        $this->assertMatchesRegularExpression('#<h2[^>]*>\s*Hello from an agent#', $html);

        // Deleting it: first what it would do, then for real.
        $dry = $this->call('entries.delete', ['id' => $made['id'], 'dryRun' => true]);
        $this->assertSame('full', $dry['checked']);
        $this->assertSame('delete', $dry['changes'][0]['action']);
        $this->assertCount(1, array_filter((array) $this->step('entries', ['collection' => 'pages']), static fn (array $e) => $e['id'] === $made['id']));

        $this->call('entries.delete', ['id' => $made['id']]);
        $this->assertCount(0, array_filter((array) $this->step('entries', ['collection' => 'pages']), static fn (array $e) => $e['id'] === $made['id']));
        $this->assertTrue($this->rpc('tools/call', ['name' => 'entries.get', 'arguments' => ['id' => $made['id']]])['result']['isError']);
    }

    private function url(): string
    {
        return 'http://127.0.0.1:'.$this->port;
    }

    /** A tool's structured answer; a failed call fails the test with what the site said. */
    private function call(string $tool, array $arguments = []): array
    {
        $result = $this->rpc('tools/call', ['name' => $tool, 'arguments' => (object) $arguments])['result'];
        $this->assertFalse($result['isError'], "{$tool}: ".($result['content'][0]['text'] ?? ''));

        return (array) $result['structuredContent'];
    }

    private function rpc(string $method, array $params = []): array
    {
        [$status, $body] = $this->post(['jsonrpc' => '2.0', 'id' => ++$this->id, 'method' => $method, 'params' => (object) $params]);
        $this->assertSame(200, $status, "{$method}: {$body}");
        $message = json_decode($body, true);
        $this->assertArrayNotHasKey('error', $message, "{$method}: {$body}");

        return $message;
    }

    /** @return array{int, string} */
    private function post(array $message): array
    {
        return $this->request('POST', '/mcp', (string) json_encode($message), ['Content-Type: application/json', 'Accept: application/json, text/event-stream', 'MCP-Protocol-Version: 2025-11-25', 'Authorization: Bearer '.$this->token]);
    }

    /** @return array{int, string} */
    private function get(string $path): array
    {
        return $this->request('GET', $path, null, ['Accept: text/html']);
    }

    /** @return array{int, string} */
    private function request(string $method, string $path, ?string $body, array $headers): array
    {
        $curl = curl_init($this->url().$path);
        // Options by their number: added with +, as spreading would renumber them.
        curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $headers, CURLOPT_TIMEOUT => 120] + ($body === null ? [] : [CURLOPT_POSTFIELDS => $body]));
        $answer = (string) curl_exec($curl);

        return [(int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE), $answer];
    }

    /** @return array<string, string> */
    private function env(): array
    {
        return [...self::ENV, 'DB_DATABASE' => $this->site.'/storage/database/cms.sqlite', 'FIXTURE_SITE' => $this->site];
    }

    private function step(string $command, array $args = []): mixed
    {
        $process = new Process([PHP_BINARY, __DIR__.'/fixtures/site.php', $this->site, $command, (string) json_encode($args)], null, $this->env());
        $process->setTimeout(300);
        $process->run();
        $line = array_values(array_filter(explode("\n", $process->getOutput()), static fn (string $l) => str_starts_with($l, 'RESULT:')))[0] ?? null;
        $this->assertNotNull($line, $process->getOutput().$process->getErrorOutput());

        return json_decode(substr($line, 7), true);
    }
}

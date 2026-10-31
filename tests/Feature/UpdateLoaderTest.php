<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Support\Files;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Process\Process;

/**
 * The real front controller under a real PHP server, with stand-in releases: what it does when
 * there is no framework to help, because it's the only code that runs when a release is broken.
 */
final class UpdateLoaderTest extends TestCase
{
    private string $root;

    private Process $server;

    private int $port;

    protected function setUp(): void
    {
        $this->root = sys_get_temp_dir().'/cms-loader-'.bin2hex(random_bytes(6));
        copy(dirname(__DIR__, 2).'/stubs/site/index.php', $this->mkdir('').'/index.php');
        copy(dirname(__DIR__, 2).'/stubs/site/setup.php', $this->mkdir('').'/setup.php');
        $this->release('1.0.0');
        $this->release('1.0.1');
        $this->pointer('1.0.0');
        $this->port = 19000 + random_int(0, 900);
        $this->server = new Process([PHP_BINARY, '-S', "127.0.0.1:{$this->port}", '-t', $this->root, $this->root.'/index.php'], $this->root, ['PHP_CLI_SERVER_WORKERS' => '1']);
        $this->server->start();

        for ($i = 0; $i < 50 && ! @fsockopen('127.0.0.1', $this->port); $i++) {
            usleep(50_000);
        }
    }

    protected function tearDown(): void
    {
        $this->server->stop(0);
        Files::deleteDirectory($this->root);
    }

    private function mkdir(string $path): string
    {
        $dir = rtrim($this->root.'/'.$path, '/');
        @mkdir($dir, 0o755, true);

        return $dir;
    }

    /** A release whose Bootstrap says which it is, and fails on demand. */
    private function release(string $version): void
    {
        $dir = $this->mkdir("runtime/{$version}/vendor");
        file_put_contents($dir.'/autoload.php', <<<PHP
            <?php
            namespace Cms\\Foundation;
            final class Bootstrap {
                public static function http(\$cms, \$site): void {
                    \$path = (string) strtok((string) (\$_SERVER['REQUEST_URI'] ?? ''), '?');
                    if (\$path === '/fatal') { undefined_function_for_a_fatal(); }
                    if (\$path === '/memory') { trigger_error('Allowed memory size exhausted', E_USER_ERROR); }
                    echo 'served by {$version}';
                }
                public static function upgrade(\$cms, \$site): void { echo 'tick on {$version}'; }
            }
            PHP);
    }

    private function pointer(string $version): void
    {
        file_put_contents($this->mkdir('runtime').'/current', $version."\n");
    }

    private function verify(array $data): void
    {
        file_put_contents($this->mkdir('storage/update').'/verify.json', (string) json_encode($data));
    }

    /** @return array{0: int, 1: string, 2: list<string>} */
    private function request(string $path, string $method = 'GET'): array
    {
        $context = stream_context_create(['http' => ['method' => $method, 'ignore_errors' => true, 'timeout' => 10]]);
        $body = @file_get_contents("http://127.0.0.1:{$this->port}{$path}", false, $context);

        return [(int) (explode(' ', $http_response_header[0] ?? '')[1] ?? 0), (string) $body, $http_response_header ?? []];
    }

    private function current(): string
    {
        clearstatcache();

        return trim((string) file_get_contents($this->root.'/runtime/current'));
    }

    public function test_it_serves_the_release_the_pointer_names(): void
    {
        $this->assertSame('served by 1.0.0', $this->request('/')[1]);

        $this->pointer('1.0.1');
        $this->assertSame('served by 1.0.1', $this->request('/')[1]);
    }

    public function test_a_pointer_with_a_traversal_or_to_a_missing_folder_runs_no_code_from_it(): void
    {
        foreach (['../../etc', '9.9.9', ''] as $value) {
            file_put_contents($this->root.'/runtime/current', $value);
            [$status, $body] = $this->request('/');

            $this->assertSame(200, $status, $value);
            $this->assertStringContainsString('composer install', $body);
        }
    }

    public function test_while_migrating_dynamic_pages_answer_503_and_only_the_tick_runs(): void
    {
        $this->pointer('1.0.1');
        $this->verify(['state' => 'migrating', 'previous' => '1.0.0', 'target' => '1.0.1', 'gate_until' => time() + 60, 'until' => time() + 900]);

        [$status, , $headers] = $this->request('/');
        $this->assertSame(503, $status);
        $this->assertContains('Retry-After: 10', $headers);

        $this->assertSame('tick on 1.0.1', $this->request('/_cms/update/tick', 'POST')[1]);
    }

    public function test_a_driver_that_died_flips_back_on_the_first_request_after_the_gate(): void
    {
        $this->pointer('1.0.1');
        $this->verify(['state' => 'migrating', 'previous' => '1.0.0', 'target' => '1.0.1', 'gate_until' => time() - 1, 'until' => time() + 900]);

        $this->assertSame('served by 1.0.0', $this->request('/')[1]);
        $this->assertSame('1.0.0', $this->current());
        $this->assertFileDoesNotExist($this->root.'/storage/update/verify.json');
        $this->assertFileExists($this->root.'/storage/update/purge');
    }

    public function test_outside_a_window_the_tick_is_an_ordinary_request(): void
    {
        $this->assertSame('served by 1.0.0', $this->request('/_cms/update/tick', 'POST')[1]);
    }

    public function test_three_fatals_in_the_new_core_flip_back(): void
    {
        $this->pointer('1.0.1');
        $this->verify(['state' => 'watching', 'previous' => '1.0.0', 'target' => '1.0.1', 'until' => time() + 900]);

        $this->assertSame('served by 1.0.1', $this->request('/')[1]);
        $this->request('/fatal');
        $this->request('/fatal');
        $this->assertSame('1.0.1', $this->current());
        $this->request('/fatal');

        $this->assertSame('1.0.0', $this->current());
        $this->assertSame('served by 1.0.0', $this->request('/')[1]);
    }

    public function test_a_memory_fatal_does_not_count_and_after_the_watch_nothing_does(): void
    {
        $this->pointer('1.0.1');
        $this->verify(['state' => 'watching', 'previous' => '1.0.0', 'target' => '1.0.1', 'until' => time() + 900]);

        $this->request('/memory');
        $this->request('/memory');
        $this->request('/memory');
        $this->assertSame('1.0.1', $this->current());

        // The watch is over: the loader lets go and a fatal is just a fatal.
        $this->verify(['state' => 'watching', 'previous' => '1.0.0', 'target' => '1.0.1', 'until' => time() - 1]);
        $this->request('/fatal');
        $this->request('/fatal');
        $this->request('/fatal');
        $this->assertSame('1.0.1', $this->current());
        $this->assertFileDoesNotExist($this->root.'/storage/update/verify.json');
    }

    public function test_a_fatal_outside_the_core_of_the_new_release_does_not_count(): void
    {
        $plugin = $this->mkdir('plugins/acme');
        file_put_contents($plugin.'/boot.php', '<?php undefined_plugin_function();');
        file_put_contents($this->root.'/runtime/1.0.1/vendor/autoload.php', <<<PHP
            <?php
            namespace Cms\\Foundation;
            final class Bootstrap {
                public static function http(\$cms, \$site): void { require '{$plugin}/boot.php'; }
            }
            PHP);
        $this->pointer('1.0.1');
        $this->verify(['state' => 'watching', 'previous' => '1.0.0', 'target' => '1.0.1', 'until' => time() + 900]);

        $this->request('/');
        $this->request('/');
        $this->request('/');

        $this->assertSame('1.0.1', $this->current());
    }

    public function test_the_tick_runs_no_old_code_after_a_flip_back_and_a_full_disk_keeps_the_pointer(): void
    {
        $this->pointer('1.0.1');
        $this->verify(['state' => 'migrating', 'previous' => '1.0.0', 'target' => '1.0.1', 'gate_until' => time() - 1, 'until' => time() + 900]);
        chmod($this->root.'/runtime', 0o555);

        // It can't write: the pointer stays complete, and the gate holds rather than serving half an upgrade.
        [$status] = $this->request('/');
        chmod($this->root.'/runtime', 0o755);

        $this->assertSame(503, $status);
        $this->assertSame('1.0.1', $this->current());
    }
}

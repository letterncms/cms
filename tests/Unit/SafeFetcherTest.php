<?php

declare(strict_types=1);

namespace Cms\Tests\Unit;

use Cms\Support\SafeFetcher;
use Cms\Tests\TestCase;
use RuntimeException;

final class SafeFetcherTest extends TestCase
{
    /** @var resource|null */
    private $server = null;

    protected function tearDown(): void
    {
        SafeFetcher::$allowPrivate = false;
        SafeFetcher::$resolver = null;
        SafeFetcher::$reached = null;

        if ($this->server) {
            proc_terminate($this->server);
            proc_close($this->server);
        }

        parent::tearDown();
    }

    public function test_only_addresses_on_the_public_internet_are_public(): void
    {
        // The last two carry 93.184.216.34: IPv4-mapped, and NAT64 as a DNS64 network answers.
        foreach (['93.184.216.34', '8.8.8.8', '2606:2800:220:1:248:1893:25c8:1946', '::ffff:93.184.216.34', '64:ff9b::5db8:d822'] as $ip) {
            $this->assertTrue(SafeFetcher::isPublic($ip), $ip);
        }

        foreach ([
            '127.0.0.1', '10.1.2.3', '172.16.0.1', '192.168.0.10', '169.254.169.254', '100.64.0.1', '0.0.0.0', '224.0.0.1', '255.255.255.255',
            '::1', '::', 'fe80::1', 'fc00::1', 'fd12::1', 'ff02::1', 'fec0::1', 'feff::1',
            // IPv6 forms that carry an IPv4 address: mapped, compatible, NAT64, 6to4, Teredo.
            '::ffff:127.0.0.1', '::ffff:10.0.0.1', '::10.0.0.1', '64:ff9b::a00:1', '64:ff9b::7f00:1', '64:ff9b:1::a00:1', '2002:a00:1::1', '2002:7f00:1::1', '2001:0:a00:1::1',
            'not-an-ip', '',
        ] as $ip) {
            $this->assertFalse(SafeFetcher::isPublic($ip), $ip);
        }
    }

    public function test_a_host_is_refused_when_any_address_it_resolves_to_is_not_public(): void
    {
        $refused = static function (string $url, string $because): void {
            try {
                SafeFetcher::post($url, '{}');
                self::fail('Let through: '.$url);
            } catch (RuntimeException $e) {
                // The refusal itself, not a connection that happened to fail.
                self::assertSame($because, $e->getMessage(), $url);
            }
        };

        foreach ([['127.0.0.1'], ['93.184.216.34', '10.0.0.1'], ['64:ff9b::a00:1'], ['64:ff9b:1::5db8:d822'], ['2002:a00:1::1'], ['::ffff:192.168.1.1'], ['fec0::1']] as $answers) {
            SafeFetcher::$resolver = static fn (string $host): array => $answers;
            $refused('https://rebind.example.com/in', 'That address is not allowed.');
        }

        SafeFetcher::$resolver = static fn (string $host): array => [];
        $refused('https://nowhere.example.com/in', 'The host could not be resolved.');

        SafeFetcher::$resolver = static fn (string $host): array => self::fail('Looked up '.$host.' before refusing.');
        $refused('https://127.0.0.1/in', 'That address is not allowed.');
        $refused('https://[::1]/in', 'That address is not allowed.');
        $refused('https://[::ffff:10.0.0.1]/in', 'That address is not allowed.');
        $refused('https://169.254.169.254/latest', 'That address is not allowed.');
        $refused('https://user:pass@example.com/in', 'Only plain http(s) URLs are allowed.');
        $refused('ftp://example.com/in', 'Only plain http(s) URLs are allowed.');
        $refused('https://example.com:6379/in', 'That port is not allowed.');
    }

    public function test_a_connection_is_only_used_when_it_reached_the_vetted_address(): void
    {
        $this->assertTrue(SafeFetcher::mayConnect('93.184.216.34', '93.184.216.34'));
        $this->assertTrue(SafeFetcher::mayConnect('2606:2800:220:1:248:1893:25c8:1946', '2606:2800:0220:0001:0248:1893:25c8:1946'), 'The same address, written differently.');
        $this->assertFalse(SafeFetcher::mayConnect('10.0.0.7', '93.184.216.34'), 'Led somewhere else after the check.');
        $this->assertFalse(SafeFetcher::mayConnect('8.8.8.8', '93.184.216.34'), 'Another public address is still not the vetted one.');
        $this->assertFalse(SafeFetcher::mayConnect('127.0.0.1', '127.0.0.1'), 'The vetted address itself has to be public.');

        // It is asked on every real connection, before anything is sent: here, with the local-development
        // switch, it lets the loopback server through and says where the socket went.
        $base = $this->serve();
        SafeFetcher::$allowPrivate = true;
        SafeFetcher::$reached = null;
        SafeFetcher::post($base.'/in', '{}');
        $this->assertSame('127.0.0.1', SafeFetcher::$reached);
        $this->assertTrue(SafeFetcher::mayConnect('127.0.0.1', '127.0.0.1'));
    }

    public function test_a_header_cannot_smuggle_another_or_say_where_the_request_goes(): void
    {
        SafeFetcher::$allowPrivate = true;

        foreach (["X-A: 1\r\nX-B: 2", 'no colon', ': empty name', "X-A: 1\0", 'Host: internal.example.com', 'host:internal', 'Content-Length: 0', 'Transfer-Encoding: chunked', 'TRANSFER-ENCODING : chunked'] as $header) {
            try {
                SafeFetcher::post('http://127.0.0.1:1/in', '{}', [$header]);
                $this->fail('Sent: '.json_encode($header));
            } catch (RuntimeException $e) {
                $this->assertSame('That header is not allowed.', $e->getMessage(), json_encode($header));
            }
        }
    }

    public function test_a_post_carries_its_headers_and_body_and_reads_any_answer(): void
    {
        $base = $this->serve();
        SafeFetcher::$allowPrivate = true;

        $answer = SafeFetcher::post($base.'/in', '{"a":1}', ['Content-Type: application/json', 'X-Signature: t=1,v1=abc']);
        $this->assertSame(200, $answer['status']);
        $this->assertSame(['method' => 'POST', 'signature' => 't=1,v1=abc', 'type' => 'application/json', 'body' => '{"a":1}'], json_decode($answer['body'], true));

        // Cut at the limit, with its status, instead of refused.
        $long = SafeFetcher::post($base.'/long', '', [], 5, 2000, truncate: true);
        $this->assertSame([500, 2000], [$long['status'], strlen($long['body'])]);

        // Four megabytes that keep coming: reading stops after one, and what was posted has still arrived, with its status.
        @unlink(sys_get_temp_dir().'/cms-echo-arrived');
        $endless = SafeFetcher::post($base.'/endless', 'delivered', [], 10, 2000, truncate: true);
        $this->assertSame([202, 2000], [$endless['status'], strlen($endless['body'])]);
        $this->assertSame('delivered', file_get_contents(sys_get_temp_dir().'/cms-echo-arrived'));

        // A redirect is not followed, and an answer over the limit is refused unless it may be cut.
        foreach (['/moved' => 'Too many redirects.', '/long' => 'The file is too large.'] as $path => $because) {
            try {
                SafeFetcher::post($base.$path, '', [], 5, 2000);
                $this->fail($path.' was accepted.');
            } catch (RuntimeException $e) {
                $this->assertSame($because, $e->getMessage());
            }
        }

        // What a site runs with: the same address is refused before anything is sent.
        SafeFetcher::$allowPrivate = false;
        $this->expectExceptionMessage('That port is not allowed.');
        SafeFetcher::post($base.'/in', '{}');
    }

    private function serve(): string
    {
        $port = random_int(20000, 40000);
        $this->server = proc_open([PHP_BINARY, '-S', "127.0.0.1:{$port}", '-t', dirname(__DIR__).'/fixtures/echo'], [['pipe', 'r'], ['file', '/dev/null', 'w'], ['file', '/dev/null', 'w']], $pipes);

        for ($i = 0; $i < 50; $i++) {
            if ($socket = @fsockopen('127.0.0.1', $port, $errno, $error, 0.1)) {
                fclose($socket);

                return "http://127.0.0.1:{$port}";
            }

            usleep(50_000);
        }

        $this->markTestSkipped('No local server to post to.');
    }
}

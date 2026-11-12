<?php

declare(strict_types=1);

namespace Cms\Modules\Sync\Tests;

use Cms\Support\Files;
use Cms\Support\Yaml;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Process\Process;

/**
 * Two sites, each with its own folder and database, and nothing faked in between. One is served
 * over real HTTP, with another table prefix; the other drives every sync from the command line,
 * as a developer would: push, undo, pull, a refusal, a sync cut off halfway that carries on.
 */
final class TwoSitesTest extends TestCase
{
    private const array ENV = ['APP_ENV' => 'testing', 'APP_KEY' => 'base64:2fl+Ktvkfl+Fuz4Qp/A75G2RTiWVA/ZoKZvp6fiiM10=', 'DB_CONNECTION' => 'sqlite', 'CACHE_STORE' => 'file', 'SESSION_DRIVER' => 'file', 'BCRYPT_ROUNDS' => '4', 'MAIL_MAILER' => 'array'];

    private string $local;

    private string $remote;

    private int $port;

    private ?Process $server = null;

    protected function setUp(): void
    {
        $this->port = random_int(18_100, 18_900);
        $this->local = $this->makeSite('Local', 'http://acme.test');
        $this->remote = $this->makeSite('Production', 'http://127.0.0.1:'.$this->port);
        $this->serve();
    }

    protected function tearDown(): void
    {
        $this->server?->stop(1);
        Files::deleteDirectory($this->local);
        Files::deleteDirectory($this->remote);
    }

    public function test_a_site_is_pushed_undone_and_pulled_between_two_sites(): void
    {
        $remoteUrl = 'http://127.0.0.1:'.$this->port;
        $this->step('local', 'seed', ['entries' => 1200, 'url' => 'http://acme.test', 'files' => ['big.bin' => 'random:5000000', 'logo.svg' => '<svg><a href="http://acme.test/"/></svg>']]);
        $this->step('remote', 'seed', ['entries' => 3, 'title' => 'Live', 'url' => $remoteUrl, 'files' => ['only-there.jpg' => 'live']]);
        $before = $this->step('remote', 'files');

        $key = $this->step('remote', 'key');
        $added = $this->artisan('local', 'remote', ['action' => 'add', 'name' => 'production', 'key' => $key]);
        $this->assertSame(0, $added['code'], $added['output']);

        $preview = $this->artisan('local', 'push', ['remote' => 'production', '--dry-run' => true]);
        $this->assertStringContainsString('1,200 rows replace 3', $preview['output']);
        $this->assertStringContainsString('Rewrites http://acme.test → '.$remoteUrl, $preview['output']);

        $push = $this->artisan('local', 'push', ['remote' => 'production', '--yes' => true]);
        $this->assertSame(0, $push['code'], $push['output']);
        $this->assertStringContainsString('Done: 1,200 rows', $push['output']);

        // On the other site: every row, under its own prefix, with its own address, and the same files.
        $rows = $this->step('remote', 'query', ['sql' => "select count(*) as n, sum(data like '%acme.test%') as old, sum(data like '%127.0.0.1:{$this->port}%') as new from p_entries"])[0];
        $this->assertSame([1200, 0, 1200], [(int) $rows['n'], (int) $rows['old'], (int) $rows['new']]);
        $meta = json_decode((string) $this->step('remote', 'query', ['sql' => 'select data from p_entries limit 1'])[0]['data'], true)['meta'];
        $this->assertSame(['home' => $remoteUrl.'/'], unserialize($meta));
        $files = array_column($this->step('remote', 'files'), 1, 0);
        $ours = array_column($this->step('local', 'files'), 1, 0);
        $this->assertSame($ours['big.bin'], $files['big.bin']);
        $this->assertSame($ours['logo.svg'], $files['logo.svg'], 'Media goes across byte for byte.');
        $this->assertArrayNotHasKey('only-there.jpg', $files);

        // Undo, from this side, puts the other site back as it was.
        $undo = $this->artisan('local', 'sync:undo', ['--remote' => 'production', '--yes' => true]);
        $this->assertSame(0, $undo['code'], $undo['output']);
        $this->assertSame(3, (int) $this->step('remote', 'query', ['sql' => 'select count(*) as n from p_entries'])[0]['n']);
        $this->assertEqualsCanonicalizing($before, $this->step('remote', 'files'));

        // Pulling brings the other site's content here, with this site's address.
        $pull = $this->artisan('local', 'pull', ['remote' => 'production', 'what' => ['content'], '--yes' => true]);
        $this->assertSame(0, $pull['code'], $pull['output']);
        $here = $this->step('local', 'query', ['sql' => "select count(*) as n, sum(data like '%acme.test%') as ours, sum(data like '%127.0.0.1%') as theirs from entries"])[0];
        $this->assertSame([3, 3, 0], [(int) $here['n'], (int) $here['ours'], (int) $here['theirs']]);

        // The other site can say no to pushes, and it's told plainly.
        $this->artisan('remote', 'remote', ['action' => 'allow', 'name' => 'push', 'key' => 'off']);
        $refused = $this->artisan('local', 'push', ['remote' => 'production', '--yes' => true]);
        $this->assertSame(1, $refused['code']);
        $this->assertStringContainsString('doesn’t allow pushes', $refused['output']);
    }

    public function test_a_sync_cut_off_halfway_carries_on_where_it_stopped(): void
    {
        $this->step('local', 'seed', ['entries' => 3000, 'url' => 'http://acme.test']);
        $this->artisan('local', 'remote', ['action' => 'add', 'name' => 'production', 'key' => $this->step('remote', 'key')]);

        $started = $this->step('local', 'start', ['remote' => 'production', 'direction' => 'push', 'groups' => ['content']]);
        $this->assertSame('running', $started['status']);

        $this->server->stop(1);
        $cut = $this->step('local', 'step', ['id' => $started['id'], 'budget' => 1]);
        $this->assertSame('waiting', $cut['status']);
        $this->assertStringContainsString('Couldn’t reach', (string) $cut['message']);

        $this->serve();
        $done = $this->step('local', 'finish', ['id' => $started['id']]);
        $this->assertSame('done', $done['status'], (string) $done['error']);
        $this->assertSame(3000, (int) $this->step('remote', 'query', ['sql' => 'select count(*) as n from p_entries'])[0]['n']);
    }

    public function test_a_public_site_takes_part_without_a_license(): void
    {
        $key = $this->step('remote', 'key');
        Yaml::write($this->remote.'/config/site.yaml', ['name' => 'Production', 'url' => 'https://www.acme-production.com', 'locale' => 'en', 'locales' => ['en']]);
        $this->artisan('local', 'remote', ['action' => 'add', 'name' => 'production', 'key' => $key, '--url' => 'http://127.0.0.1:'.$this->port]);

        $push = $this->artisan('local', 'push', ['remote' => 'production', '--yes' => true]);

        $this->assertSame(0, $push['code'], $push['output']);
    }

    public function test_a_site_is_never_synced_into_itself(): void
    {
        $this->step('remote', 'key');
        $add = $this->artisan('local', 'remote', ['action' => 'add', 'name' => 'me', 'key' => $this->step('local', 'key'), '--url' => 'http://127.0.0.1:'.$this->port]);

        // The key names this site: it reaches the other one's server, which doesn't know that key.
        $this->assertSame(1, $add['code']);
        $this->assertStringContainsString('doesn’t match', $add['output']);
    }

    private function serve(): void
    {
        $this->server = new Process([PHP_BINARY, '-S', '127.0.0.1:'.$this->port, __DIR__.'/fixtures/router.php'], null, $this->env($this->remote));
        $this->server->setTimeout(null);
        $this->server->start();

        for ($i = 0; $i < 100 && ! @fsockopen('127.0.0.1', $this->port, $code, $message, 0.1); $i++) {
            usleep(50_000);
        }
    }

    private function makeSite(string $name, string $url): string
    {
        $site = sys_get_temp_dir().'/cms-sync-'.bin2hex(random_bytes(6));
        Files::ensureDir($site.'/storage/database');
        touch($site.'/storage/database/test.sqlite');
        Yaml::write($site.'/config/site.yaml', ['name' => $name, 'url' => $url, 'locale' => 'en', 'locales' => ['en']]);

        return $site;
    }

    /** @return array<string, string> */
    private function env(string $site): array
    {
        return [...self::ENV, 'DB_DATABASE' => $site.'/storage/database/test.sqlite', 'DB_PREFIX' => $site === $this->remote ? 'p_' : '', 'FIXTURE_SITE' => $site, 'CMS_AUTOLOAD' => dirname((string) (new \ReflectionClass(\Composer\Autoload\ClassLoader::class))->getFileName(), 2).'/autoload.php'];
    }

    private function artisan(string $role, string $command, array $params): array
    {
        return $this->step($role, 'artisan', ['command' => $command, 'params' => $params]);
    }

    private function step(string $role, string $command, array $args = []): mixed
    {
        $site = $role === 'local' ? $this->local : $this->remote;
        $process = new Process([PHP_BINARY, __DIR__.'/fixtures/site.php', $site, $command, (string) json_encode($args)], null, $this->env($site));
        $process->setTimeout(300);
        $process->run();
        $line = array_values(array_filter(explode("\n", $process->getOutput()), static fn (string $l) => str_starts_with($l, 'RESULT:')))[0] ?? null;
        $this->assertNotNull($line, $process->getOutput().$process->getErrorOutput());

        return json_decode(substr($line, 7), true);
    }
}

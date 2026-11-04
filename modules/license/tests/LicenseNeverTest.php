<?php

declare(strict_types=1);

namespace Cms\Modules\License\Tests;

use Cms\Support\Files;
use Cms\Support\Yaml;
use Cms\Tests\Support\Signing;
use Cms\Trust\DevKeys;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Process\Process;

/**
 * A public site never goes down over a paid plugin's licence. Each configuration runs in a process
 * of its own, as a request would: the public page, the API and the sign-in are byte-identical to
 * a site with no licence on localhost, and no licence class is ever loaded for them.
 */
final class LicenseNeverTest extends TestCase
{
    /** @return array<string, array{0: array<string, string>, 1: string}> */
    public static function states(): array
    {
        return [
            'case_20 no token' => [[], ''],
            'case_34 corrupt token' => [[], 'v4.public.corrupt'],
            'no sodium' => [['PROBE_BACKENDS' => 'openssl'], 'valid'],
            'no openssl' => [['PROBE_BACKENDS' => 'sodium'], 'valid'],
            'case_31 neither' => [['PROBE_BACKENDS' => 'none'], 'valid'],
            'case_42 no network' => [['CMS_LICENSE_URL' => 'https://127.0.0.1:1/nothing'], 'valid'],
            'case_45 clock 1970' => [['PROBE_NOW' => '1970-01-02'], 'valid'],
            'case_45 clock 2099' => [['PROBE_NOW' => '2099-01-01'], 'valid'],
            'case_38 revoked' => [[], 'revoked'],
            'case_50 refunded' => [[], 'refunded'],
            'case_53 charged back' => [[], 'charged_back'],
            'case_68 revoked item' => [[], 'revoked-item'],
            'case_27 another domain' => [[], 'other-domain'],
            'case_80 term ended' => [[], 'term-ended'],
            'case_58 major not covered' => [[], 'major'],
            'unwritable storage' => [['PROBE_READONLY' => '1'], 'valid'],
            'case_18 spoofed host' => [['PROBE_HOST' => 'evil.example'], 'valid'],
        ];
    }

    /** @param  array<string, string>  $env */
    private function probe(string $site, array $env = []): array
    {
        $process = new Process([PHP_BINARY, __DIR__.'/fixtures/never-probe.php', $site], null, ['APP_ENV' => 'testing', 'APP_KEY' => 'base64:2fl+Ktvkfl+Fuz4Qp/A75G2RTiWVA/ZoKZvp6fiiM10=', 'DB_CONNECTION' => 'sqlite', 'DB_DATABASE' => $site.'/storage/database/test.sqlite', 'CACHE_STORE' => 'array', 'SESSION_DRIVER' => 'array', 'BCRYPT_ROUNDS' => '4', ...$env]);
        $process->setTimeout(60);
        $process->run();
        $line = array_values(array_filter(explode("\n", $process->getOutput()), static fn (string $l) => str_starts_with($l, 'RESULT:')))[0] ?? null;
        $this->assertNotNull($line, $process->getOutput().$process->getErrorOutput());

        return json_decode(substr($line, 7), true);
    }

    private function makeSite(string $url, string $token): string
    {
        $site = sys_get_temp_dir().'/cms-never-'.bin2hex(random_bytes(6));
        Files::ensureDir($site.'/storage/database');
        touch($site.'/storage/database/test.sqlite');
        Yaml::write($site.'/config/site.yaml', ['name' => 'Never', 'url' => $url, 'locale' => 'en', 'locales' => ['en']]);
        Yaml::write($site.'/config/plugins.yaml', ['enabled' => ['acme/forms']]);
        Files::put($site.'/plugins/forms/composer.json', (string) json_encode(['name' => 'acme/forms', 'type' => 'cms-plugin', 'version' => '1.0.0', 'extra' => ['cms' => ['license' => ['paid' => true, 'major_released' => '2028-01-01']]]]));
        Yaml::write($site.'/content/collections/notes.yaml', ['title' => 'Notes', 'singular' => 'Note', 'structure' => 'tree', 'route' => '/notes/{slug}', 'fields' => []]);

        if ($token !== '') {
            Files::put($site.'/config/license.key', $token);
        }

        return $site;
    }

    /** @return array<string, string> */
    private static function tokens(): array
    {
        $item = static fn (array $i) => ['items' => [Signing::item($i)]];

        return [
            'valid' => Signing::token(),
            'refunded' => Signing::token($item(['st' => 'refunded'])),
            'charged_back' => Signing::token($item(['st' => 'charged_back'])),
            'revoked-item' => Signing::token($item(['st' => 'revoked'])),
            'revoked' => Signing::token(['iat' => '2027-01-01T00:00:00Z'], DevKeys::FAMILY, 'lic-gone'),
            'other-domain' => Signing::token(['dom' => ['other.example']]),
            'term-ended' => Signing::token($item(['trm' => '2020-01-01'])),
            'major' => Signing::token($item(['upd' => '2020-01-01'])),
        ];
    }

    #[DataProvider('states')]
    public function test_nothing_public_changes(array $env, string $token): void
    {
        $baseline = $this->probe($this->makeSite('http://localhost', ''));
        $site = $this->makeSite('https://example.com', self::tokens()[$token] ?? $token);

        $result = $this->probe($site, $env);

        $this->assertFalse($result['loaded'], 'A license class was loaded for a public request: '.implode(', ', $result['classes']));
        $this->assertSame(0, $baseline['problems']);
        $this->assertSame($baseline['home'], str_replace('https://example.com', 'http://localhost', $result['home']));
        $this->assertSame($result['home'], $result['after']);
        $this->assertLessThanOrEqual(3, $result['level']);
        $this->assertSame($baseline['status'], $result['status']);
        $this->assertSame($baseline['login'], $result['login']);
        $this->assertSame($baseline['editor'], $result['editor']);
        $this->assertSame('UNKNOWN', $result['state']);

        chmod($site.'/config', 0o755);
        @chmod($site.'/storage/license', 0o755);
        Files::deleteDirectory($site);
    }

    public function test_case_40_there_is_no_integrity_check_or_tamper_trap(): void
    {
        foreach (glob(dirname(__DIR__).'/src/*.php') ?: [] as $file) {
            $this->assertDoesNotMatchRegularExpression('/\b(exit|die)\s*[;(]|http_response_code|abort\(/', (string) file_get_contents($file), $file);
        }

        foreach (glob(dirname(__DIR__).'/src/*/*.php') ?: [] as $file) {
            $this->assertDoesNotMatchRegularExpression('/\b(exit|die)\s*[;(]|http_response_code|abort\(/', (string) file_get_contents($file), $file);
        }
    }

    public function test_case_15_nothing_handles_redirect_domains(): void
    {
        foreach (glob(dirname(__DIR__).'/src/*/*.php') ?: [] as $file) {
            $this->assertStringNotContainsString('redirect(', (string) file_get_contents($file), $file);
        }
    }
}

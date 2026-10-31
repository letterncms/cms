<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use PHPUnit\Framework\TestCase;

/**
 * Changing the one brand file changes the product's own strings: the admin, the
 * command line and generated files. A scratch installation gets its own
 * brand/brand.json with another name, next to an empty site built with the real
 * CLI. Content names the product in plain text, so it isn't part of this. The
 * repository's own brand file is never touched, so other work on this checkout
 * can't catch a half-way name.
 */
final class BrandProofTest extends TestCase
{
    private const string NAME = 'Zorblax';

    private string $scratch;

    private string $realName;

    protected function setUp(): void
    {
        if (! is_file(self::root().'/website/cms')) {
            $this->markTestSkipped("This proof borrows the website's CLI file, and it has moved to its own repository.");
        }

        $real = self::root().'/cms';
        $this->realName = (string) json_decode((string) file_get_contents($real.'/brand/brand.json'), true)['name'];
        $this->scratch = sys_get_temp_dir().'/cms-brand-proof-'.bin2hex(random_bytes(6));

        mkdir($this->scratch.'/cms/brand', 0o755, true);

        foreach (['core', 'modules', 'plugins', 'themes', 'vendor'] as $part) {
            symlink("{$real}/{$part}", "{$this->scratch}/cms/{$part}");
        }

        foreach (['mark.svg', 'wordmark.svg'] as $file) {
            copy("{$real}/brand/{$file}", "{$this->scratch}/cms/brand/{$file}");
        }

        $brand = json_decode((string) file_get_contents($real.'/brand/brand.json'), true);
        file_put_contents($this->scratch.'/cms/brand/brand.json', json_encode(['name' => self::NAME, 'domain' => 'zorblax.test', 'product_url' => 'https://zorblax.test', 'docs_url' => 'https://docs.zorblax.test', 'support_email' => 'support@zorblax.test'] + $brand));
        copy($real.'/cms', $this->scratch.'/cms/cms');

        mkdir("{$this->scratch}/site/public", 0o755, true);
        mkdir("{$this->scratch}/site/storage", 0o755, true);
        copy(self::root().'/website/cms', "{$this->scratch}/site/cms");

        $this->cli('install --no-interaction --db=sqlite --site-name=Proof --site-url=http://localhost --name=Proof --email=proof@example.com --password=proof-password-1');
    }

    protected function tearDown(): void
    {
        if (isset($this->scratch)) {
            exec('rm -rf '.escapeshellarg($this->scratch));
        }
    }

    public function test_one_file_renames_the_product_in_its_own_strings(): void
    {
        $probe = json_decode($this->shell('php '.escapeshellarg(__DIR__.'/../fixtures/brand-probe.php').' '.escapeshellarg($this->scratch.'/cms').' '.escapeshellarg($this->scratch.'/site')), true);

        $this->assertSame(self::NAME, $probe['manifest']['brand']['name']);
        $this->assertNamed('manifest', (string) json_encode($probe['manifest']));
        $this->assertNamed('robots.txt', $probe['robots']);
        $this->assertNamed('CLI banner', $this->cli('--version'));
    }

    private function assertNamed(string $what, string $text): void
    {
        $this->assertStringContainsString(self::NAME, $text, "{$what} should use the name in the brand file");
        $this->assertDoesNotMatchRegularExpression('/\b'.preg_quote($this->realName, '/').'\b/i', $text, "{$what} still says the real name");
    }

    private function cli(string $arguments): string
    {
        return $this->shell('php '.escapeshellarg("{$this->scratch}/site/cms").' '.$arguments);
    }

    private function shell(string $command): string
    {
        // A clean environment: PHPUnit's in-memory database and the stack's mail settings stay out of it.
        exec('env -i PATH='.escapeshellarg((string) getenv('PATH')).' HOME='.escapeshellarg(sys_get_temp_dir()).' '.$command.' 2>&1', $output, $code);
        $text = implode("\n", $output);
        $this->assertSame(0, $code, "{$command}\n{$text}");

        return $text;
    }

    private static function root(): string
    {
        return dirname(__DIR__, 4);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Install\Installer;
use Cms\Support\Yaml;
use Cms\Tests\TestCase;

/** A site.yaml in git stays as it is, whatever the machine installing it looks like. */
final class InstallSiteConfigTest extends TestCase
{
    protected function tearDown(): void
    {
        putenv('CMS_SITE_URL');
        unset($_ENV['CMS_SITE_URL'], $_SERVER['CMS_SITE_URL']);
        parent::tearDown();
    }

    private function install(string $name, string $url): void
    {
        unlink(storage_path('installed.json'));

        $this->app->make(Installer::class)->install([
            'site_name' => $name, 'site_url' => $url, 'db_driver' => 'sqlite',
            'name' => 'Ada', 'email' => 'ada@example.com', 'password' => 'correct-horse-9-battery',
        ]);
    }

    public function test_an_existing_site_config_is_left_alone_and_the_machines_url_goes_in_env(): void
    {
        $file = $this->site.'/config/site.yaml';
        Yaml::write($file, ['name' => 'Tracked', 'url' => 'http://localhost:8002', 'locale' => 'en']);
        $before = file_get_contents($file);

        $this->install('Tracked', 'http://localhost:9102');

        $this->assertSame($before, file_get_contents($file));
        $env = (string) file_get_contents($this->site.'/.env');
        $this->assertStringContainsString('CMS_SITE_URL=http://localhost:9102', $env);
        $this->assertStringContainsString('APP_URL=http://localhost:9102', $env);
        $this->assertSame('http://localhost:9102', $this->cms()->site('url'));
    }

    public function test_the_same_url_needs_no_override(): void
    {
        $file = $this->site.'/config/site.yaml';
        Yaml::write($file, ['name' => 'Tracked', 'url' => 'http://localhost:8002']);

        $this->install('Tracked', 'http://localhost:8002');

        $this->assertStringNotContainsString('CMS_SITE_URL', (string) file_get_contents($this->site.'/.env'));
    }

    public function test_a_new_site_gets_its_config(): void
    {
        $file = $this->site.'/config/site.yaml';
        unlink($file);

        $this->install('New', 'https://example.com/');

        $site = Yaml::read($file);
        $this->assertSame('New', $site['name']);
        $this->assertSame('https://example.com', $site['url']);
        $this->assertStringNotContainsString('CMS_SITE_URL', (string) file_get_contents($this->site.'/.env'));
    }
}

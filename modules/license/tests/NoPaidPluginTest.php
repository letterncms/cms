<?php

declare(strict_types=1);

namespace Cms\Modules\License\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Admin\Manifest;
use Cms\Modules\License\LicenseService;
use Cms\Support\Remote;
use Cms\Support\Yaml;
use Cms\Tests\Support\FakeRemote;
use Cms\Tests\Support\Signing;
use Cms\Tests\TestCase;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\Console\Output\BufferedOutput;

/** A site with no paid plugin never hears about licences: not in the admin, not to an agent, not on the command line. */
final class NoPaidPluginTest extends TestCase
{
    private const string WORD = '/licen[cs]/i';

    protected function setUp(): void
    {
        parent::setUp();

        Yaml::write($this->site.'/config/site.yaml', ['name' => 'Test site', 'url' => 'https://example.com', 'locale' => 'en', 'locales' => ['en']]);
        $this->app->make(\Cms\Settings\SettingsRegistry::class)->save('site', ['url' => 'https://example.com']);
    }

    /** The admin's bootstrap lists active packages by id, and an id is permanent: that isn't anything a person reads. */
    private function manifest(): string
    {
        return str_replace('cms\\/license', '', (string) json_encode($this->app->make(Manifest::class)->build($this->admin())));
    }

    /** The failure shows where the word is, not a screen of JSON. */
    private static function context(string $text): string
    {
        preg_match_all('/.{0,60}licen[cs].{0,60}/i', $text, $found);

        return implode("\n", $found[0]);
    }

    public function test_the_admin_says_nothing(): void
    {
        $manifest = $this->manifest();

        $this->assertDoesNotMatchRegularExpression(self::WORD, $manifest, self::context($manifest));
    }

    public function test_abilities_and_permissions_say_nothing(): void
    {
        $abilities = $this->cms()->abilities();
        $listed = $abilities->execute('abilities/list', [], AbilityContext::forUser($this->admin()));

        $this->assertDoesNotMatchRegularExpression(self::WORD, (string) json_encode($listed));
        $this->assertDoesNotMatchRegularExpression(self::WORD, (string) json_encode($this->cms()->permissions()->all()));
    }

    public function test_the_modules_screen_says_nothing_it_needs_no_turning_off_and_it_is_ordinary(): void
    {
        $list = $this->cms()->abilities()->execute('packages/list', ['type' => 'module'], AbilityContext::forUser($this->admin()));
        $row = array_values(array_filter($list['items'], static fn (array $p) => $p['name'] === 'letterncms/license'))[0];

        $this->assertDoesNotMatchRegularExpression(self::WORD, $row['label'].' '.$row['description']);
        $this->assertTrue($row['required'], 'required like every module the admin needs: Modules checks keys with it');
    }

    public function test_the_command_list_says_nothing(): void
    {
        $output = new BufferedOutput;
        Artisan::call('list', [], $output);

        $this->assertDoesNotMatchRegularExpression(self::WORD, $output->fetch());
    }

    public function test_a_key_kept_for_later_costs_nothing_and_sends_nothing(): void
    {
        $remote = new FakeRemote;
        $this->app->instance(Remote::class, $remote);
        $service = $this->app->make(LicenseService::class);

        $service->install(Signing::token());

        $this->assertSame(0, $service->report(fresh: true)->level);
        $this->assertSame([], $service->report()->items);
        $this->assertDoesNotMatchRegularExpression(self::WORD, $this->manifest());
        $this->assertSame([], $remote->calls);
    }
}

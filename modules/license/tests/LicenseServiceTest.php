<?php

declare(strict_types=1);

namespace Cms\Modules\License\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Admin\Manifest;
use Cms\Modules\License\LicenseService;
use Cms\Support\Files;
use Cms\Support\Remote;
use Cms\Support\Yaml;
use Cms\Tests\Support\FakeRemote;
use Cms\Tests\Support\Signing;
use Cms\Tests\TestCase;
use Cms\Trust\DevKeys;
use Cms\Trust\TrustRegistry;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use RuntimeException;

/** Where a paid plugin's tokens live, the refresh, the permissions, and what the admin is told. */
final class LicenseServiceTest extends TestCase
{
    private const string REFRESH = 'https://store.invalid/api/license/v1/refresh';

    private FakeRemote $remote;

    protected function prepareSite(string $site): void
    {
        Yaml::write($site.'/config/plugins.yaml', ['enabled' => ['acme/forms']]);
        Files::put($site.'/plugins/forms/composer.json', (string) json_encode(['name' => 'acme/forms', 'type' => 'cms-plugin', 'version' => '1.0.0', 'extra' => ['cms' => ['license' => ['product' => 'acme/forms', 'paid' => true]]]]));
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->remote = new FakeRemote;
        $this->app->instance(Remote::class, $this->remote);
        Yaml::write($this->site.'/config/site.yaml', ['name' => 'Test site', 'url' => 'https://example.com', 'locale' => 'en', 'locales' => ['en', 'de']]);
        $this->app->make(\Cms\Settings\SettingsRegistry::class)->save('site', ['url' => 'https://example.com']);
        Carbon::setTestNow('2027-02-01 12:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        putenv('CMS_LICENSE');
        unset($_ENV['CMS_LICENSE'], $_SERVER['CMS_LICENSE']);
        putenv('CMS_LICENSE_OFFLINE');
        unset($_ENV['CMS_LICENSE_OFFLINE'], $_SERVER['CMS_LICENSE_OFFLINE']);
        parent::tearDown();
    }

    private function service(): LicenseService
    {
        return $this->app->make(LicenseService::class);
    }

    private function env(string $name, string $value): void
    {
        putenv("{$name}={$value}");
        $_ENV[$name] = $_SERVER[$name] = $value;
    }

    public function test_case_24_a_fresh_site_makes_no_call_and_a_banner_is_all_it_gets(): void
    {
        $report = $this->service()->report();

        $this->assertSame(2, $report->level);
        $this->assertSame([], $this->remote->calls);
        $this->assertArrayNotHasKey('first_public_seen', $this->service()->tokens()->state());

        Carbon::setTestNow('2028-02-20 12:00:00');
        $this->assertSame(2, $this->service()->report(fresh: true)->level);
    }

    public function test_case_29_env_token_works_with_nothing_writable(): void
    {
        $this->env('CMS_LICENSE', Signing::token(['iat' => '2027-01-01T00:00:00Z']));

        $this->assertSame(0, $this->service()->report()->level);
        $this->assertTrue($this->service()->tokens()->fromEnvironment());
    }

    public function test_case_16_each_site_folder_has_its_own_token(): void
    {
        $this->service()->install(Signing::token(['iat' => '2027-01-01T00:00:00Z']));

        $this->assertFileExists($this->site.'/config/license.key');
        $this->assertSame(0, $this->service()->report(fresh: true)->level);
    }

    public function test_case_32_token_sources_keep_the_newest_revision(): void
    {
        $tokens = $this->service()->tokens();
        $tokens->install(Signing::token(['iat' => '2027-01-01T00:00:00Z', 'rev' => 2]));
        Files::put(storage_path('license/default.cache'), Signing::token(['iat' => '2027-01-01T00:00:00Z', 'rev' => 9]));

        $this->assertSame(9, $this->service()->report(fresh: true)->rev);
    }

    public function test_install_refuses_garbage_and_forgeries_and_keeps_a_key_it_cannot_check_yet(): void
    {
        $service = $this->service();

        try {
            $service->install('not a token');
            $this->fail('Garbage was accepted.');
        } catch (RuntimeException) {
        }

        try {
            $service->install(Signing::token([], DevKeys::FAMILY, DevKeys::LICENSE, DevKeys::private('forger')));
            $this->fail('A forgery was accepted.');
        } catch (RuntimeException) {
        }

        $this->assertFileDoesNotExist($this->site.'/config/license.key');
        $this->assertSame('unknown_key', $service->install(Signing::token([], DevKeys::FAMILY, 'lic-future'))->token);
    }

    public function test_case_42_server_down_changes_nothing_and_retries_in_a_day(): void
    {
        $service = $this->service();
        $service->install(Signing::token(['iat' => '2027-01-01T00:00:00Z']));

        $this->assertTrue($service->refreshDue());
        $this->assertSame('failed', $service->refresh());
        $this->assertSame(0, $service->report(fresh: true)->level);
        $this->assertFalse($service->refreshDue());
        $this->assertSame('skipped', $service->refresh());
        $this->assertCount(1, $this->remote->callsTo('/refresh'));

        Carbon::setTestNow('2027-02-02 12:00:01');
        $this->assertTrue($service->refreshDue());
    }

    public function test_case_43_a_month_of_failures_is_a_line(): void
    {
        $service = $this->service();
        $service->install(Signing::token(['iat' => '2027-01-01T00:00:00Z']));
        $service->refresh();

        Carbon::setTestNow('2027-03-05 12:00:00');
        $service->refresh();
        $report = $service->report(fresh: true);

        $this->assertSame(['refresh_failing'], $report->notes);
        $this->assertSame(1, $report->level);
    }

    public function test_case_44_offline_mode_makes_no_call(): void
    {
        $this->env('CMS_LICENSE_OFFLINE', 'true');
        $service = $this->service();
        $service->install(Signing::token(['iat' => '2027-01-01T00:00:00Z']));

        $this->assertFalse($service->refreshDue());
        $this->assertSame('skipped', $service->refresh(force: true));
        $this->assertSame([], $this->remote->calls);
    }

    public function test_no_refresh_on_a_non_public_host_or_without_a_token(): void
    {
        $this->assertFalse($this->service()->refreshDue());

        $this->app->make(\Cms\Settings\SettingsRegistry::class)->save('site', ['url' => 'http://staging.example.com']);
        $this->service()->tokens()->install(Signing::token());
        $this->assertFalse($this->service()->refreshDue());
    }

    public function test_case_48_a_good_answer_replaces_the_token_and_a_new_revision_updates_config(): void
    {
        $service = $this->service();
        $service->install(Signing::token(['iat' => '2027-01-01T00:00:00Z', 'rev' => 1]));
        $original = (string) file_get_contents($this->site.'/config/license.key');

        // The daily re-signing: same revision, cache only, so a tracked file stays clean.
        $this->remote->routes[self::REFRESH] = (string) json_encode(['token' => Signing::token(['iat' => '2027-02-01T12:00:00Z', 'rev' => 1])]);
        $this->assertSame('unchanged', $service->refresh());
        $this->assertSame($original, file_get_contents($this->site.'/config/license.key'));
        $this->assertFileExists(storage_path('license/default.cache'));

        // A new domain: rev went up, config follows.
        Carbon::setTestNow('2027-02-03 12:00:00');
        $new = Signing::token(['iat' => '2027-02-03T12:00:00Z', 'rev' => 2, 'dom' => ['example.com', 'example.de']]);
        $this->remote->routes[self::REFRESH] = (string) json_encode(['token' => $new]);
        $this->assertSame('updated', $service->refresh());
        $this->assertSame($new, trim((string) file_get_contents($this->site.'/config/license.key')));
        $this->assertFileDoesNotExist(storage_path('license/default.cache'));
        $this->assertSame(['example.com', 'example.de'], $service->report(fresh: true)->domains);

        $call = $this->remote->callsTo('/refresh')[1]['data'];
        $this->assertSame('01JBTESTLICENCE', $call['lid']);
        $this->assertSame('https://example.com', $call['url']);
        $this->assertSame(['cms_version', 'php_version'], array_keys($call['client']));
    }

    public function test_case_41_unsigned_forged_foreign_or_older_answers_are_discarded(): void
    {
        $service = $this->service();
        $token = Signing::token(['iat' => '2027-01-01T00:00:00Z', 'rev' => 5]);
        $service->install($token);

        $bad = [
            '{"token":"nonsense"}',
            'not json',
            (string) json_encode(['token' => Signing::token(['rev' => 6], DevKeys::FAMILY, DevKeys::LICENSE, DevKeys::private('forger'))]),
            (string) json_encode(['token' => Signing::token(['lid' => 'OTHER', 'rev' => 6])]),
            (string) json_encode(['token' => Signing::token(['rev' => 4])]),
            (string) json_encode(['token' => Signing::token(['rev' => 6], DevKeys::FAMILY.'-test')]),
        ];

        foreach ($bad as $i => $body) {
            Carbon::setTestNow(Carbon::parse('2027-02-01 12:00:00')->addDays($i + 1));
            $this->remote->routes[self::REFRESH] = $body;
            $this->assertSame('failed', $service->refresh(), $body);
            $this->assertSame($token, trim((string) file_get_contents($this->site.'/config/license.key')));
        }
    }

    public function test_case_102_a_rate_limit_means_stale_never_invalid(): void
    {
        $service = $this->service();
        $service->install(Signing::token(['iat' => '2027-01-01T00:00:00Z']));
        $this->remote->routes[self::REFRESH] = ['status' => 429, 'body' => ''];

        $this->assertSame('failed', $service->refresh());
        $this->assertSame(0, $service->report(fresh: true)->level);
    }

    public function test_case_36_an_unknown_key_fetches_the_trust_file_at_refresh(): void
    {
        $service = $this->service();
        $token = Signing::token(['iat' => '2027-01-01T00:00:00Z'], DevKeys::FAMILY, 'lic-next');
        $service->install($token);
        $this->assertSame(1, $service->report(fresh: true)->level);

        // The trust endpoint is down: still only a line.
        $this->assertSame('failed', $service->refresh());
        $this->assertSame(1, $service->report(fresh: true)->level);

        // It comes back with the key in it.
        Carbon::setTestNow('2027-02-03 12:00:00');
        $this->remote->routes['https://store.invalid/downloads/trust.json'] = DevKeys::trust(['version' => 2, 'keys' => [
            ['kid' => DevKeys::RELEASE, 'role' => 'release', 'pub' => DevKeys::public(DevKeys::RELEASE)],
            ['kid' => 'lic-next', 'role' => 'license', 'pub' => DevKeys::public('lic-next')],
        ]]);
        $this->remote->routes[self::REFRESH] = (string) json_encode(['token' => $token]);
        $this->assertSame('unchanged', $service->refresh());
        $this->assertSame(0, $service->report(fresh: true)->level);
    }

    public function test_a_new_trust_version_moves_the_licence_endpoint(): void
    {
        $service = $this->service();
        $service->install(Signing::token(['iat' => '2027-01-01T00:00:00Z']));

        $this->assertTrue($this->app->make(TrustRegistry::class)->default()->accept(DevKeys::trust(['version' => 2, 'endpoints' => ['license' => 'https://new.invalid/api/license/v1']])));
        $service->refresh();

        $this->assertCount(1, $this->remote->callsTo('https://new.invalid/api/license/v1/refresh'));
    }

    public function test_a_broken_filesystem_or_anything_else_comes_out_as_unknown(): void
    {
        $service = $this->service();
        Files::put(storage_path('license/default.state.json'), '{broken');
        $this->assertSame(2, $service->report()->level);
    }

    public function test_abilities_have_their_permissions(): void
    {
        $abilities = $this->cms()->abilities();
        $editor = AbilityContext::forUser($this->userWithRole('editor'));
        $admin = AbilityContext::forUser($this->admin());

        $this->assertIsArray($abilities->execute('license/status', [], $admin));

        foreach (['license/status' => [], 'license/install' => ['token' => 'x'], 'license/clear' => []] as $name => $input) {
            try {
                $abilities->execute($name, $input, $editor);
                $this->fail("An editor ran {$name}.");
            } catch (AbilityException) {
                $this->addToAssertionCount(1);
            }
        }

        // Any signed-in person's visit may keep it current.
        $this->assertSame(['result' => 'skipped'], $abilities->execute('license/refresh', [], $editor));

        try {
            $abilities->execute('license/install', ['token' => 'garbage'], $admin);
            $this->fail('Garbage was accepted.');
        } catch (AbilityException $e) {
            $this->assertStringContainsString('v4.public', $e->getMessage());
        }
    }

    public function test_the_manifest_tells_managers_and_nobody_else(): void
    {
        $manifest = $this->app->make(Manifest::class);

        $this->assertArrayHasKey('level', $manifest->build($this->admin())['config']['license']);
        $this->assertSame(['refreshDue' => false], $manifest->build($this->userWithRole('editor'))['config']['license']);
    }

    public function test_commands(): void
    {
        $this->assertSame(0, Artisan::call('license:status'));
        $this->assertSame(1, Artisan::call('license:set', ['token' => 'garbage']));
        $this->assertSame(0, Artisan::call('license:set', ['token' => Signing::token()]));
        $this->assertFileExists($this->site.'/config/license.key');
        $this->assertSame(0, Artisan::call('license:refresh'));
        $this->assertSame(0, Artisan::call('license:clear'));
        $this->assertFileDoesNotExist($this->site.'/config/license.key');
    }

    public function test_case_19_a_static_build_prints_nothing_about_a_licence(): void
    {
        $output = new \Symfony\Component\Console\Output\BufferedOutput;

        $this->app['events']->dispatch(new \Illuminate\Console\Events\CommandFinished('build', new \Symfony\Component\Console\Input\ArrayInput([]), $output, 0));

        $this->assertSame('', $output->fetch());
    }

    public function test_case_92_a_paid_plugin_reads_its_manifest_however_it_arrived(): void
    {
        $service = $this->service();
        $service->install(Signing::token(['iat' => '2027-01-01T00:00:00Z', 'items' => [Signing::item(['p' => 'acme/else'])]]));

        $report = $service->report(fresh: true);
        $this->assertSame('unlicensed', $report->items['acme/forms']['reason']);
        $this->assertSame(2, $report->level);
        $this->assertSame('unlicensed', $service->state('acme/forms'));
    }

    public function test_a_paid_plugin_that_is_switched_off_earns_nothing(): void
    {
        Files::put($this->site.'/plugins/other/composer.json', (string) json_encode(['name' => 'acme/other', 'type' => 'cms-plugin', 'version' => '1.0.0', 'extra' => ['cms' => ['license' => ['paid' => true]]]]));
        $this->cms()->packages()->refresh();

        $this->assertArrayNotHasKey('acme/other', $this->service()->report(fresh: true)->items);
    }

    public function test_third_party_issuer_has_its_own_key_family_and_token(): void
    {
        [$public, $private] = \Cms\Support\Crypto\Ed25519::generate();
        $root = \Cms\Support\Crypto\Ed25519::generate();
        Files::put($this->site.'/plugins/forms/resources/trust.json', \Cms\Trust\Envelope::sign('cms-trust', [
            'type' => 'cms-trust', 'epoch' => 1, 'version' => 1,
            'roots' => [['kid' => 'acme-root', 'pub' => \Cms\Support\Crypto\Base64Url::encode($root[0])]],
            'keys' => [['kid' => 'acme-1', 'role' => 'license', 'pub' => \Cms\Support\Crypto\Base64Url::encode($public)]],
        ], ['acme-root' => $root[1]]));
        Files::put($this->site.'/plugins/forms/composer.json', (string) json_encode([
            'name' => 'acme/forms', 'type' => 'cms-plugin', 'version' => '1.0.0',
            'extra' => ['cms' => ['license' => ['product' => 'acme/forms', 'paid' => true, 'issuer' => ['id' => 'acme', 'family' => 'acme-plugins', 'trust' => 'resources/trust.json', 'refresh' => 'https://acme.invalid/api/license/v1']]]],
        ]));
        $this->cms()->packages()->refresh();
        $service = $this->service();

        // Pasted on the screen, its key finds its own issuer and doesn't land with the store's.
        $token = Signing::token(['iat' => '2027-01-01T00:00:00Z', 'items' => [Signing::item()]], 'acme-plugins', 'acme-1', $private);
        $this->assertSame('ok', $service->install($token)->items['acme/forms']['reason']);
        $this->assertFileExists($this->site.'/config/licenses/acme.key');
        $this->assertFileDoesNotExist($this->site.'/config/license.key');

        // The seller's own server keeps it current.
        $this->remote->routes['https://acme.invalid/api/license/v1/refresh'] = (string) json_encode(['token' => $token]);
        $this->assertSame('unchanged', $service->refresh());
        $this->assertCount(1, $this->remote->callsTo('https://acme.invalid/api/license/v1/refresh'));
    }
}

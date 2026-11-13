<?php

declare(strict_types=1);

namespace Cms\Modules\Packages\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Modules\Packages\StoreClient;
use Cms\Packages\Install\HostFacts;
use Cms\Packages\Install\PackageJobs;
use Cms\Support\Files;
use Cms\Support\Remote;
use Cms\Support\Yaml;
use Cms\Tests\Support\FakeRemote;
use Cms\Tests\Support\Signing;
use Cms\Tests\TestCase;
use Cms\Trust\DevKeys;
use Cms\Trust\TrustRegistry;
use Illuminate\Support\Carbon;
use ZipArchive;

/** A site with no store plugin on it, installing from a store that's nothing but signed files. */
final class StoreTest extends TestCase
{
    private const string CATALOG = 'https://store.invalid/api/store/v1/catalog.json';

    private const string STORE = 'https://store.invalid';

    private FakeRemote $remote;

    private StoreClient $client;

    private PackageJobs $jobs;

    /** @var list<array<string, mixed>> */
    private array $items = [];

    private int $catalogVersion = 1;

    protected function setUp(): void
    {
        parent::setUp();

        // A site that updates itself: one with Composer takes its plugins from Composer.
        Files::put($this->site.'/runtime/current', "1.0.0\n");
        $this->remote = new FakeRemote;
        $this->app->instance(Remote::class, $this->remote);
        $this->app->forgetInstance(PackageJobs::class);
        $this->client = $this->app->make(StoreClient::class);
        $this->jobs = $this->app->make(PackageJobs::class);
        $this->app->make(\Cms\Settings\SettingsRegistry::class)->save('site', ['url' => 'https://example.com']);
        $this->remote->routes['https://store.invalid/downloads/trust.json'] = DevKeys::trust();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function zipOf(string $name, string $version, array $extra = [], array $composer = []): string
    {
        $top = str_replace('/', '-', $name);
        $path = $this->site.'/dist/'.$top.'-'.$version.'-'.bin2hex(random_bytes(3)).'.zip';
        Files::ensureDir(dirname($path));
        $zip = new ZipArchive;
        $zip->open($path, ZipArchive::CREATE);
        $zip->addFromString($top.'/composer.json', (string) json_encode(['name' => $name, 'type' => 'cms-plugin', 'version' => $version, ...$composer]));

        foreach ($extra as $file => $body) {
            $zip->addFromString($top.'/'.$file, $body);
        }

        $zip->close();

        return $path;
    }

    /** List a version of a package in the store. @param  array<string, mixed>  $fields */
    private function list(string $package, string $version, array $fields = [], array $item = [], array $files = [], array $composer = []): array
    {
        $zip = $this->zipOf($package, $version, $files, $composer);
        $url = self::STORE.'/api/store/v1/download/'.$package.'/'.$version;
        $firstParty = ($item['first_party'] ?? false) === true;
        $entry = Signing::version($package, [
            'version' => $version,
            'sha256' => hash_file('sha256', $zip),
            'size' => filesize($zip),
            'url' => $url,
            'first_party' => $firstParty,
            'requires' => ['core' => '*', 'php' => '>=8.4'],
            ...$fields,
        ]);
        $this->remote->routes[$url] = (string) file_get_contents($zip);
        $this->remote->routes[$url.'?site_host=example.com'] = (string) file_get_contents($zip);

        foreach ($this->items as $i => $existing) {
            if ($existing['package'] === $package) {
                $this->items[$i]['versions'][] = $entry;
                $this->publishCatalog();

                return $entry;
            }
        }

        $this->items[] = ['package' => $package, 'type' => 'plugin', 'title' => ucfirst(explode('/', $package)[1]), 'summary' => 'Does a thing.', 'icon' => self::STORE.'/icon.png', 'categories' => ['tools'], 'pricing' => 'free', 'first_party' => $firstParty, 'author' => ['name' => 'Acme', 'url' => 'https://acme.example'], 'listing_url' => self::STORE.'/store/'.str_replace('/', '-', $package), 'versions' => [$entry], ...$item];
        $this->publishCatalog();

        return $entry;
    }

    private function publishCatalog(array $fields = []): void
    {
        $this->remote->routes[self::CATALOG] = Signing::feed('cms-catalog', ['version' => $this->catalogVersion++, 'store' => self::STORE, 'items' => $this->items, 'blocked' => [], 'yanked' => [], ...$fields]);
        $this->client->refresh();
    }

    private function finish(array $job): array
    {
        for ($i = 0; $i < 20 && $job['state'] === 'running'; $i++) {
            $job = $this->jobs->step($job['id']);
        }

        return $job;
    }

    private function install(string $package, ?string $version = null): array
    {
        return $this->finish($this->client->install($package, $version));
    }

    private function itemIn(array $catalog, string $package): array
    {
        return array_values(array_filter($catalog['items'], static fn (array $i) => $i['package'] === $package))[0];
    }

    public function test_a_site_composer_manages_installs_from_the_admin_and_names_it_in_composer_json(): void
    {
        @unlink($this->site.'/runtime/current');
        Files::putJson($this->site.'/composer.json', ['name' => 'acme/site', 'require' => ['letterncms/cms' => '>=0.26 <1']]);
        Files::put($this->site.'/composer.lock', '{}');
        $this->list('acme/forms', '1.2.0');

        $job = $this->install('acme/forms');

        $this->assertSame('done', $job['state'], (string) ($job['error'] ?? ''));
        $this->assertTrue($this->cms()->packages()->isActive('acme/forms'));
        $this->assertSame(['acme/forms' => '^1.2', 'letterncms/cms' => '>=0.26 <1'], Files::readJson($this->site.'/composer.json')['require']);
        // The lock still says what is in vendor/: composer update brings it level.
        $this->assertFileExists($this->site.'/composer.lock');

        $this->cms()->abilities()->execute('packages/uninstall', ['name' => 'acme/forms', 'deleteFiles' => true], \Cms\Abilities\AbilityContext::system());

        $this->assertDirectoryDoesNotExist($this->site.'/plugins/acme-forms');
        $this->assertSame(['letterncms/cms' => '>=0.26 <1'], Files::readJson($this->site.'/composer.json')['require']);
        $this->assertFileExists($this->site.'/composer.lock');
    }

    public function test_browse_and_install_a_free_plugin_in_one_go(): void
    {
        $this->list('acme/forms', '1.0.0', [], [], ['src/Forms.php' => "<?php\n"]);

        $catalog = $this->client->catalog();
        $item = $this->itemIn($catalog, 'acme/forms');
        $this->assertSame('ok', $catalog['freshness']);
        $this->assertSame('install', $item['action']);
        $this->assertSame('1.0.0', $item['latest']);

        $job = $this->install('acme/forms');

        $this->assertSame('done', $job['state'], (string) ($job['error'] ?? ''));
        $this->assertFileExists($this->site.'/plugins/acme-forms/composer.json');
        $this->assertTrue($this->cms()->packages()->isActive('acme/forms'));
        $this->assertSame('1.0.0', $this->jobs->sources()['acme/forms']['version']);
        $this->assertSame('installed', $this->itemIn($this->client->catalog(), 'acme/forms')['action']);

        // Anonymous: the download carried no licence, and no site name.
        $this->assertSame([], $this->remote->callsTo('/download/acme/forms/1.0.0')[0]['headers']);
    }

    public function test_a_site_kit_from_the_store_lands_in_kits_and_never_runs(): void
    {
        $kit = ['kit.json' => json_encode(['handle' => 'studio', 'name' => 'Studio', 'version' => '1.2.0']), 'content/design/tokens.json' => '{"tokens":{}}'];
        $this->list('letterncms/studio', '1.2.0', [], ['type' => 'kit', 'first_party' => true], $kit, ['type' => 'cms-kit']);
        $this->assertSame('kit', $this->itemIn($this->client->catalog(), 'letterncms/studio')['type']);

        $job = $this->install('letterncms/studio');

        $this->assertSame('done', $job['state'], (string) ($job['error'] ?? ''));
        $this->assertFileExists($this->site.'/kits/studio/kit.json');
        // Marked as Composer marks the same tree, so composer update may take it over.
        $this->assertFileExists($this->site.'/kits/studio/.composer-kit');
        $this->assertDirectoryDoesNotExist($this->site.'/plugins/studio');
        $this->assertFalse($this->cms()->packages()->isEnabled('letterncms/studio'), 'a kit is not a plugin to switch on');
        $this->assertSame('installed', $this->itemIn($this->client->catalog(), 'letterncms/studio')['action']);
        // Its demo is the store's own page; one elsewhere is not shown.
        $this->remote->routes[self::STORE.'/api/store/v1/items/letterncms/studio.json'] = (string) json_encode(['demo_url' => self::STORE.'/kits/studio/']);
        $this->assertSame(self::STORE.'/kits/studio/', $this->client->item('letterncms/studio')['demo_url']);
        $this->remote->routes[self::STORE.'/api/store/v1/items/letterncms/studio.json'] = (string) json_encode(['demo_url' => 'https://evil.example/kits/studio/']);
        $this->assertNull($this->client->item('letterncms/studio')['demo_url']);

        // A kit that carries something a server would run is refused before it is unpacked.
        $this->list('letterncms/sneaky', '1.0.0', [], ['type' => 'kit', 'first_party' => true], [...$kit, 'public/media/x.php' => '<?php'], ['type' => 'cms-kit']);
        $job = $this->install('letterncms/sneaky');
        $this->assertSame('failed', $job['state']);
        $this->assertStringContainsString('x.php', (string) $job['error']);
        $this->assertDirectoryDoesNotExist($this->site.'/kits/sneaky');
    }

    public function test_the_store_tab_is_there_with_no_store_plugin_in_sight(): void
    {
        $abilities = $this->cms()->abilities();
        $admin = AbilityContext::forUser($this->admin());
        $this->list('acme/forms', '1.0.0');

        $this->assertSame('acme/forms', $abilities->execute('packages/catalog', [], $admin)['items'][0]['package']);
        $this->assertIsArray($abilities->execute('packages/updates', [], $admin));
    }

    public function test_an_update_keeps_a_backup_and_a_broken_one_puts_it_back(): void
    {
        $this->list('acme/forms', '1.0.0');
        $this->install('acme/forms');
        $this->list('acme/forms', '1.1.0', [], [], ['broken.php' => "<?php\nthis is not php"]);

        // A syntax error never gets past the inspection.
        $failed = $this->install('acme/forms', '1.1.0');
        $this->assertSame('failed', $failed['state']);
        $this->assertStringContainsString('does not parse', $failed['error']);
        $this->assertStringContainsString('"version":"1.0.0"', (string) file_get_contents($this->site.'/plugins/acme-forms/composer.json'));

        $this->list('acme/forms', '1.2.0', [], [], ['composer-note.txt' => 'fine']);
        $done = $this->install('acme/forms', '1.2.0');
        $this->assertSame('done', $done['state']);
        $this->assertDirectoryExists($this->site.'/plugins/.backup-acme-forms-1.0.0');
        $this->assertSame('1.2.0', $this->jobs->sources()['acme/forms']['version']);

        $this->jobs->rollback('acme/forms');
        $this->assertStringContainsString('"version":"1.0.0"', (string) file_get_contents($this->site.'/plugins/acme-forms/composer.json'));
        $this->assertSame('1.0.0', $this->jobs->sources()['acme/forms']['version']);
    }

    public function test_a_plugin_that_fails_to_start_is_taken_back_out(): void
    {
        $provider = <<<'PHP'
            <?php
            namespace Acme\Boom;
            final class BoomPlugin extends \Cms\Packages\Plugin {
                public function boot(): void { throw new \RuntimeException('Boom at boot'); }
                public function install(): void { throw new \RuntimeException('Boom at install'); }
            }
            PHP;
        $this->list('acme/boom', '1.0.0', [], [], ['src/BoomPlugin.php' => $provider], ['autoload' => ['psr-4' => ['Acme\\Boom\\' => 'src/']], 'extra' => ['cms' => ['provider' => 'Acme\\Boom\\BoomPlugin']]]);

        $job = $this->install('acme/boom');

        $this->assertSame('failed', $job['state']);
        $this->assertStringContainsString('put back', $job['error']);
        $this->assertDirectoryDoesNotExist($this->site.'/plugins/acme-boom');
        $this->assertFalse($this->cms()->packages()->isEnabled('acme/boom'));
        $this->assertLessThan(500, $this->get('/')->getStatusCode());
    }

    public function test_a_tampered_download_or_relabelled_version_is_a_hard_stop(): void
    {
        $this->list('acme/forms', '1.0.0');
        $url = self::STORE.'/api/store/v1/download/acme/forms/1.0.0';
        $this->remote->routes[$url] = (string) file_get_contents($this->zipOf('acme/forms', '1.0.0', ['evil.php' => "<?php\n"]));
        $this->assertStringContainsString('damaged', $this->install('acme/forms')['error']);

        // A store that says a signed version is a security fix.
        $this->items = [];
        $entry = $this->list('acme/other', '1.0.0');
        $this->items[0]['versions'][0] = ['security' => true] + $entry;
        $this->publishCatalog();
        $this->assertStringContainsString('signature', $this->install('acme/other')['error']);
    }

    public function test_a_key_of_the_wrong_role_or_a_revoked_one_is_refused(): void
    {
        $entry = $this->list('acme/forms', '1.0.0');

        $this->items[0]['versions'][0] = Signing::version('acme/forms', ['kid' => 'wrong-role'] + $entry, 'wrong-role');
        $this->publishCatalog();
        $this->assertStringContainsString('signature', $this->install('acme/forms')['error']);

        $this->items[0]['versions'][0] = $entry;
        $this->publishCatalog();
        $this->assertTrue($this->app->make(TrustRegistry::class)->default()->accept(DevKeys::trust(['version' => 2, 'revoked' => [['kid' => DevKeys::RELEASE, 'after' => null, 'reason' => 'leak']]])));

        // A revoked release key is dead, whatever date it claims: the catalog itself no longer opens.
        $this->assertSame([], $this->client->catalog()['items']);
    }

    public function test_an_expired_snapshot_browses_but_does_not_install(): void
    {
        $this->list('acme/forms', '1.0.0');

        Carbon::setTestNow(Carbon::now()->addDays(31));
        $this->assertSame('stale', $this->client->catalog()['freshness']);

        Carbon::setTestNow(Carbon::now()->addDays(15));
        $this->assertSame('expired', $this->client->catalog()['freshness']);
        $this->assertNotSame([], $this->client->catalog()['items']);
        $this->expectExceptionMessage('current');
        $this->client->install('acme/forms', null);
    }

    public function test_an_older_catalog_is_refused(): void
    {
        $this->list('acme/forms', '1.0.0');
        $this->catalogVersion = 0;
        $this->remote->routes[self::CATALOG] = Signing::feed('cms-catalog', ['version' => 0, 'store' => self::STORE, 'items' => []]);

        $this->assertStringContainsString('older', (string) $this->client->refresh());
        $this->assertNotSame([], $this->client->catalog()['items']);
    }

    public function test_a_store_down_leaves_everything_alone(): void
    {
        $this->list('acme/forms', '1.0.0');
        $this->install('acme/forms');
        $this->remote->routes = [];

        $this->assertNotNull($this->client->refresh());
        $this->assertNotSame([], $this->client->catalog()['items']);
        $this->assertTrue($this->cms()->packages()->isActive('acme/forms'));
        $this->assertLessThan(500, $this->get('/')->getStatusCode());
    }

    public function test_production_never_believes_the_development_keys(): void
    {
        $this->app['env'] = 'production';

        // Asking for them changes nothing: the switch only counts on a local or test site.
        $default = (new \Cms\Trust\TrustRegistry($this->app))->default()->current();
        $this->assertNotNull($default);
        $this->assertFalse($default->dev());

        Files::put($this->site.'/dev-anchor.json', DevKeys::trust());
        $store = new \Cms\Trust\TrustStore($this->site.'/dev-anchor.json', $this->site.'/storage/other-trust', 'other', allowDev: false);
        $this->assertNull($store->current());
        $this->assertSame('dev_trust', $store->problem());
    }

    public function test_case_61_a_core_style_security_fix_on_a_free_package_needs_nothing(): void
    {
        $this->list('acme/forms', '1.0.0');
        $this->install('acme/forms');
        $this->list('acme/forms', '1.0.1', ['security' => true, 'fixes' => '<1.0.1']);

        $this->assertSame(['package' => 'acme/forms', 'version' => '1.0.1'], $this->client->nextSecurityUpdate());
    }

    public function test_a_security_update_that_wants_more_capabilities_needs_a_person(): void
    {
        $this->list('acme/forms', '1.0.0', ['capabilities' => ['admin-ui']]);
        $this->install('acme/forms');
        $this->list('acme/forms', '1.0.1', ['security' => true, 'capabilities' => ['admin-ui', 'network']]);

        $this->assertNull($this->client->nextSecurityUpdate());
    }

    public function test_the_tick_advances_a_security_update_for_anyone_signed_in_and_says_nothing_secret(): void
    {
        $this->list('acme/forms', '1.0.0');
        $this->install('acme/forms');
        $this->list('acme/forms', '1.0.1', ['security' => true]);
        Files::put($this->site.'/runtime/current', "0.1.0\n");
        $this->app->instance(\Cms\Update\Layout::class, new \Cms\Update\Layout($this->app, $this->site));
        $this->app->forgetInstance(\Cms\Update\CoreUpdate::class);
        $editor = AbilityContext::forUser($this->userWithRole('editor'));
        $abilities = $this->cms()->abilities();

        for ($i = 0; $i < 15; $i++) {
            $answer = $abilities->execute('packages/update-tick', [], $editor);
            $this->assertSame(['more', 'drive', 'acted'], array_keys($answer));
            $this->assertTrue($answer['acted'], 'every tick of an update that runs did something');

            if (! $answer['more']) {
                break;
            }
        }

        $this->assertStringContainsString('"version":"1.0.1"', (string) file_get_contents($this->site.'/plugins/acme-forms/composer.json'));
    }

    public function test_only_a_manager_may_install(): void
    {
        $this->list('acme/forms', '1.0.0');
        $editor = AbilityContext::forUser($this->userWithRole('editor'));

        foreach (['packages/install' => ['package' => 'acme/forms'], 'packages/catalog' => [], 'packages/update-start' => ['version' => '9.0.0'], 'packages/plan-install' => ['package' => 'acme/forms']] as $name => $input) {
            try {
                $this->cms()->abilities()->execute($name, $input, $editor);
                $this->fail("An editor ran {$name}.");
            } catch (AbilityException) {
                $this->addToAssertionCount(1);
            }
        }
    }

    /** @return array<string, array{0: list<string>}> */
    public static function hostProblems(): array
    {
        return [
            'no zip' => [['zip']],
            'no curl' => [['curl']],
            'no rename' => [['rename']],
            'opcache that never looks' => [['opcache']],
        ];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('hostProblems')]
    public function test_a_host_without_what_it_takes_gets_the_manual_path(array $without): void
    {
        $this->list('acme/forms', '1.0.0');
        $this->jobs->host = new class($without) extends HostFacts {
            public function __construct(private array $without) {}

            public function zip(): bool { return ! in_array('zip', $this->without, true); }

            public function curl(): bool { return ! in_array('curl', $this->without, true); }

            public function rename(): bool { return ! in_array('rename', $this->without, true); }

            public function opcacheRisk(): bool { return in_array('opcache', $this->without, true); }
        };

        $job = $this->install('acme/forms');

        $this->assertSame('failed', $job['state']);
        $this->assertDirectoryDoesNotExist($this->site.'/plugins/acme-forms');
        $this->assertSame([], $this->remote->callsTo('/download/'));
    }

    public function test_not_enough_disk_stops_before_the_download(): void
    {
        $this->list('acme/forms', '1.0.0');
        $this->jobs->host = new class extends HostFacts {
            public function freeSpace(string $path): ?float { return 10.0; }
        };

        $this->assertStringContainsString('disk space', $this->install('acme/forms')['error']);
    }

    /** @return array<string, array{0: callable(ZipArchive): void, 1: string}> */
    public static function badZips(): array
    {
        return [
            'traversal' => [static fn (ZipArchive $z) => $z->addFromString('forms/../../evil.php', '<?php'), 'unsafe'],
            'absolute' => [static fn (ZipArchive $z) => $z->addFromString('/evil.php', '<?php'), 'unsafe'],
            'hidden file' => [static fn (ZipArchive $z) => $z->addFromString('forms/.user.ini', 'x=1'), 'hidden'],
            'phar' => [static fn (ZipArchive $z) => $z->addFromString('forms/tool.phar', 'x'), 'phar'],
            'case duplicate' => [static function (ZipArchive $z) {
                $z->addFromString('forms/a.txt', '1');
                $z->addFromString('forms/A.TXT', '2');
            }, 'case'],
            'two top folders' => [static fn (ZipArchive $z) => $z->addFromString('other/a.txt', '1'), 'one folder'],
            'bomb' => [static fn (ZipArchive $z) => $z->addFromString('forms/big.txt', str_repeat('0', 5_000_000)), 'size'],
            'symlink' => [static function (ZipArchive $z) {
                $z->addFromString('forms/link', '/etc/passwd');
                $z->setExternalAttributesName('forms/link', ZipArchive::OPSYS_UNIX, 0o120777 << 16);
            }, 'symbolic'],
            'syntax error' => [static fn (ZipArchive $z) => $z->addFromString('forms/x.php', "<?php\nnope nope"), 'parse'],
        ];
    }

    /** @param  callable(ZipArchive): void  $mutate */
    #[\PHPUnit\Framework\Attributes\DataProvider('badZips')]
    public function test_a_bad_zip_is_refused_whoever_signed_it(callable $mutate, string $expected): void
    {
        $path = $this->site.'/dist/bad.zip';
        Files::ensureDir(dirname($path));
        $zip = new ZipArchive;
        $zip->open($path, ZipArchive::CREATE);
        $zip->addFromString('forms/composer.json', (string) json_encode(['name' => 'acme/forms', 'type' => 'cms-plugin', 'version' => '1.0.0']));
        $mutate($zip);
        $zip->close();

        $job = $this->finish($this->client->installUpload($path, null, allowUnsigned: true));

        $this->assertSame('failed', $job['state']);
        $this->assertStringContainsString($expected, $job['error']);
        $this->assertDirectoryDoesNotExist($this->site.'/plugins/acme-forms');
    }

    public function test_wrong_name_in_a_signed_zip_is_refused(): void
    {
        // The catalog's signature is on acme/forms, and the zip holds something else with the same hash.
        $zip = $this->zipOf('acme/evil', '1.0.0');
        $url = self::STORE.'/api/store/v1/download/acme/forms/1.0.0';
        $entry = Signing::version('acme/forms', ['version' => '1.0.0', 'sha256' => hash_file('sha256', $zip), 'size' => filesize($zip), 'url' => $url, 'requires' => []]);
        $this->remote->routes[$url] = (string) file_get_contents($zip);
        $this->items[] = ['package' => 'acme/forms', 'type' => 'plugin', 'title' => 'Forms', 'pricing' => 'free', 'versions' => [$entry]];
        $this->publishCatalog();

        $this->assertStringContainsString('holds acme/evil', $this->install('acme/forms')['error']);
    }

    public function test_unsigned_uploads_need_a_super_admin_and_cannot_claim_a_built_in(): void
    {
        $zip = $this->zipOf('acme/forms', '1.0.0');

        // Plain manager: refused.
        $job = $this->finish($this->client->installUpload($zip, null, allowUnsigned: false));
        $this->assertStringContainsString('not signed', $job['error']);

        // Confirmed: in it goes, marked as what it is, with no update offers.
        $job = $this->finish($this->client->installUpload($zip, null, allowUnsigned: true));
        $this->assertSame('done', $job['state'], (string) ($job['error'] ?? ''));
        $this->assertFalse($this->jobs->sources()['acme/forms']['signed']);
        $this->assertContains('acme/forms', $this->client->updates()['unverified']);

        // A site package with a built-in's name would replace it.
        $job = $this->finish($this->client->installUpload($this->zipOf('letterncms/seo', '9.0.0'), null, allowUnsigned: true));
        $this->assertStringContainsString('default store', $job['error']);

        $job = $this->finish($this->client->installUpload($this->zipOf('acme/sneaky', '1.0.0', [], ['autoload' => ['psr-4' => ['Cms\\Sneaky\\' => 'src/']]]), null, allowUnsigned: true));
        $this->assertStringContainsString('Cms namespace', $job['error']);
    }

    public function test_an_upload_the_catalog_knows_or_with_a_good_sidecar_counts_as_signed(): void
    {
        $this->list('acme/forms', '1.0.0');
        $zip = $this->site.'/dist/up.zip';
        file_put_contents($zip, $this->remote->routes[self::STORE.'/api/store/v1/download/acme/forms/1.0.0']);
        $job = $this->finish($this->client->installUpload($zip, null, allowUnsigned: false));
        $this->assertSame('done', $job['state'], (string) ($job['error'] ?? ''));
        $this->assertTrue($this->jobs->sources()['acme/forms']['signed']);

        $other = $this->zipOf('acme/other', '1.0.0');
        $sig = Signing::version('acme/other', ['package' => 'acme/other', 'version' => '1.0.0', 'sha256' => hash_file('sha256', $other), 'key' => DevKeys::RELEASE]);
        $job = $this->finish($this->client->installUpload($other, $sig, allowUnsigned: false));
        $this->assertSame('done', $job['state'], (string) ($job['error'] ?? ''));

        // Valid sidecar, wrong zip: the bytes aren't what was signed.
        $third = $this->zipOf('acme/third', '1.0.0');
        $this->assertStringContainsString('not signed', $this->finish($this->client->installUpload($third, $sig, allowUnsigned: false))['error']);

        // An expired key's standalone signature counts for nothing.
        $this->assertTrue($this->app->make(TrustRegistry::class)->default()->accept(DevKeys::trust(['version' => 2, 'keys' => [['kid' => DevKeys::RELEASE, 'role' => 'release', 'pub' => DevKeys::public(DevKeys::RELEASE), 'not_after' => '2020-01-01']]])));
        $fourth = $this->zipOf('acme/fourth', '1.0.0');
        $late = Signing::version('acme/fourth', ['package' => 'acme/fourth', 'version' => '1.0.0', 'sha256' => hash_file('sha256', $fourth), 'key' => DevKeys::RELEASE]);
        $this->assertStringContainsString('not signed', $this->finish($this->client->installUpload($fourth, $late, allowUnsigned: false))['error']);
    }

    public function test_a_blocked_version_is_refused_on_every_path_and_warned_about_but_never_disabled(): void
    {
        $this->list('acme/forms', '1.0.0');
        $this->install('acme/forms');

        $this->publishCatalog(['blocked' => [['package' => 'acme/forms', 'versions' => '<1.4.2', 'severity' => 'critical', 'advisory' => 'https://store.invalid/a']]]);

        // Case 94: an advisory, and it keeps running.
        $advisories = $this->client->updates()['advisories'];
        $this->assertSame('critical', $advisories[0]['severity']);
        $this->assertTrue($this->cms()->packages()->isActive('acme/forms'));
        $this->assertSame('blocked', $this->itemIn($this->client->catalog(), 'acme/forms')['action']);

        // By zip too, signed or not.
        $job = $this->finish($this->client->installUpload($this->zipOf('acme/forms', '1.0.0'), null, allowUnsigned: true));
        $this->assertStringContainsString('blocked', $job['error']);

        $this->expectExceptionMessage('blocked');
        $this->client->install('acme/forms', '1.0.0');
    }

    public function test_a_yanked_version_is_not_offered(): void
    {
        $this->list('acme/forms', '1.0.0');
        $this->list('acme/forms', '1.0.1');
        $this->publishCatalog(['yanked' => [['package' => 'acme/forms', 'version' => '1.0.1', 'reason' => 'Breaks saving']]]);

        $this->assertSame('1.0.0', $this->itemIn($this->client->catalog(), 'acme/forms')['latest']);
    }

    public function test_a_version_for_another_core_is_not_offered(): void
    {
        $this->list('acme/forms', '1.0.0', ['requires' => ['core' => '^99.0']]);

        $this->assertSame('incompatible', $this->itemIn($this->client->catalog(), 'acme/forms')['action']);
    }

    public function test_the_plan_orders_dependencies_and_refuses_what_cannot_work(): void
    {
        $this->list('acme/base', '1.2.0');
        $this->list('acme/addon', '1.0.0', ['requires' => ['packages' => ['acme/base' => '^1.0'], 'core' => '*'], 'capabilities' => ['network']]);

        $plan = $this->client->plan('acme/addon');
        $this->assertSame(['acme/base', 'acme/addon'], array_column($plan['steps'], 'package'));
        $this->assertSame(['network'], $plan['capabilities']);

        $this->list('acme/a', '1.0.0', ['requires' => ['packages' => ['acme/b' => '*']]]);
        $this->list('acme/b', '1.0.0', ['requires' => ['packages' => ['acme/a' => '*']]]);

        try {
            $this->client->plan('acme/a');
            $this->fail('A circle was planned.');
        } catch (\RuntimeException $e) {
            $this->assertStringContainsString('circle', $e->getMessage());
        }

        $this->list('acme/lost', '1.0.0', ['requires' => ['packages' => ['acme/nowhere' => '^1.0']]]);
        $this->expectExceptionMessage('acme/nowhere');
        $this->client->plan('acme/lost');
    }

    public function test_detail_html_from_a_hostile_store_is_cleaned_here(): void
    {
        $this->list('acme/forms', '1.0.0');
        $this->remote->routes[self::STORE.'/api/store/v1/items/acme/forms.json'] = (string) json_encode([
            'description_html' => '<p>Fine</p><script>alert(1)</script><form action="https://evil"><input></form><img src="https://evil.example/x.png"><img src="https://store.invalid/ok.png">',
            'screenshots' => ['https://store.invalid/1.png', 'https://evil.example/2.png'],
        ]);

        $item = $this->client->item('acme/forms');

        $this->assertStringContainsString('<p>Fine</p>', $item['description_html']);
        $this->assertStringNotContainsString('script', $item['description_html']);
        $this->assertStringNotContainsString('form', $item['description_html']);
        $this->assertStringNotContainsString('evil.example', $item['description_html']);
        $this->assertSame(['https://store.invalid/1.png'], $item['screenshots']);
    }

    public function test_a_listing_brings_its_icon_gallery_releases_and_links(): void
    {
        $this->list('acme/maps', '1.0.0', item: ['glyph' => 'map-pin', 'featured' => true]);
        $this->list('acme/odd', '1.0.0', item: ['glyph' => '<svg onload=x>']);
        $this->remote->routes[self::STORE.'/api/store/v1/items/acme/maps.json'] = (string) json_encode([
            'gallery' => [['url' => 'https://store.invalid/1.png', 'alt' => 'The map editor.'], ['url' => 'https://evil.example/2.png', 'alt' => 'x']],
            'requirements' => ['A map key'], 'docs_url' => 'https://acme.example/docs', 'repository_url' => 'javascript:alert(1)',
            'releases' => [['version' => '1.0.0', 'released_at' => '2026-11-01T10:00:00Z', 'notes' => "Added\n• Maps", 'security' => false]],
        ]);

        $items = array_column($this->client->catalog()['items'], null, 'package');
        $this->assertSame(['map-pin', true], [$items['acme/maps']['glyph'], $items['acme/maps']['featured']]);
        $this->assertSame([null, false], [$items['acme/odd']['glyph'], $items['acme/odd']['featured']]);

        $item = $this->client->item('acme/maps');
        $this->assertSame([['url' => 'https://store.invalid/1.png', 'alt' => 'The map editor.']], $item['gallery']);
        $this->assertSame(['A map key'], $item['requirements']);
        $this->assertSame(['https://acme.example/docs', null], [$item['docs_url'], $item['repository_url']]);
        $this->assertSame("Added\n• Maps", $item['releases'][0]['notes']);
    }

    public function test_a_download_off_the_stores_own_origin_is_refused(): void
    {
        $entry = $this->list('acme/forms', '1.0.0');
        $this->items[0]['versions'][0] = Signing::version('acme/forms', ['url' => 'https://elsewhere.example/x.zip'] + $entry);
        $this->publishCatalog();

        $this->expectExceptionMessage('own address');
        $this->client->install('acme/forms', null);
    }

    public function test_a_developer_checkout_is_never_swapped(): void
    {
        Files::put($this->site.'/plugins/acme-forms/composer.json', (string) json_encode(['name' => 'acme/forms', 'type' => 'cms-plugin', 'version' => '0.9.0']));
        mkdir($this->site.'/plugins/acme-forms/.git');
        $this->cms()->packages()->refresh();
        $this->list('acme/forms', '1.0.0');

        $this->assertStringContainsString('checkout', $this->install('acme/forms')['error']);
        $this->assertStringContainsString('0.9.0', (string) file_get_contents($this->site.'/plugins/acme-forms/composer.json'));
    }

    public function test_two_jobs_cannot_run_at_once_and_a_second_click_sees_the_first(): void
    {
        $this->list('acme/forms', '1.0.0');
        $this->list('acme/other', '1.0.0');
        $this->client->install('acme/forms', null);

        $this->expectExceptionMessage('acme/forms');
        $this->client->install('acme/other', null);
    }

    public function test_the_upload_ability_takes_chunks_and_respects_who_may_skip_the_signature(): void
    {
        $zip = (string) file_get_contents($this->zipOf('acme/forms', '1.0.0'));
        // Each chunk stands alone: base64 of a slice of the bytes.
        $slices = str_split($zip, 300);
        $abilities = $this->cms()->abilities();
        $manager = AbilityContext::forUser($this->userWithRole('admin'));

        foreach ($slices as $i => $slice) {
            $last = $i === count($slices) - 1;
            $answer = $abilities->execute('packages/upload', ['id' => 'abc123', 'index' => $i, 'last' => $last, 'data' => base64_encode($slice), 'allowUnsigned' => true], $manager);
        }

        $this->assertSame(['id', 'step', 'state'], array_keys(array_intersect_key($answer, ['id' => 1, 'step' => 1, 'state' => 1])));
        $job = $this->jobs->status($answer['id']);
        $this->assertSame((bool) $this->userWithRole('admin')->hasPermission('packages.install_unsigned'), $job['context']['allow_unsigned']);
    }
}

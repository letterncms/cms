<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Support\Files;
use Cms\Support\Remote;
use Cms\Tests\Support\FakeRemote;
use Cms\Tests\Support\Releases;
use Cms\Tests\Support\Signing;
use Cms\Tests\TestCase;
use Cms\Trust\DevKeys;
use Cms\Trust\TrustRegistry;
use Cms\Trust\TrustStore;
use Cms\Update\CoreUpdate;
use Cms\Update\Layout;
use Cms\Update\ReleaseFeed;
use Illuminate\Support\Carbon;

/** The state machine, on a scratch site in the real layout: every way it can fail leaves the live site alone or puts it back. */
final class CoreUpdateTest extends TestCase
{
    private const string FEED = 'https://store.invalid/downloads/releases.json';

    private FakeRemote $remote;

    private CoreUpdate $update;

    private ReleaseFeed $feed;

    private Layout $layout;

    private string $dist;

    protected function setUp(): void
    {
        parent::setUp();

        $this->dist = $this->site.'/dist';
        $this->remote = new FakeRemote;
        $this->app->instance(Remote::class, $this->remote);
        Files::put($this->site.'/runtime/current', "1.0.0\n");
        Files::put($this->site.'/runtime/1.0.0/vendor/autoload.php', "<?php\n");
        Files::put($this->site.'/runtime/1.0.0/release.json', (string) json_encode(['version' => '1.0.0', 'root_files' => ['index.php' => hash('sha256', "<?php // old loader\n"), '.htaccess' => hash('sha256', "# old\n")]]));
        Files::put($this->site.'/index.php', "<?php // old loader\n");
        Files::put($this->site.'/.htaccess', "# changed by hand\n");

        $this->layout = new Layout($this->app);
        $this->feed = new ReleaseFeed($this->app, $this->app->make(TrustRegistry::class), $this->remote);
        $this->update = new CoreUpdate($this->app, $this->layout, $this->feed, $this->app->make(TrustRegistry::class), $this->remote);
        $this->update->runningVersion = '1.0.0';
        $this->update->loopback = false;
        $this->update->healthCheck = static fn () => [];
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    /** @param  array<string, mixed>  $fields */
    private function publish(string $version = '1.0.1', array $files = [], array $fields = [], array $feedFields = []): array
    {
        $zip = Releases::zip($this->dist, $version, $files);
        $entry = Releases::entry($zip, $version, $fields);
        $this->remote->routes[$entry['url']] = (string) file_get_contents($zip);
        $this->remote->routes[self::FEED] = Releases::feed([$entry], $feedFields);
        $this->assertNull($this->feed->check());

        return $entry;
    }

    /** Steps until nothing more happens before the switch, or it stops. */
    private function runToSwitch(): array
    {
        for ($i = 0; $i < 20; $i++) {
            $status = $this->update->step();

            if (! in_array($status['state'], ['downloading', 'verifying', 'extracting', 'checking_files', 'ready'], true)) {
                return $status;
            }
        }

        $this->fail('The update never reached the switch.');
    }

    public function test_a_good_update_switches_migrates_checks_and_settles(): void
    {
        $this->publish();
        $this->assertSame('1.0.1', $this->update->offer()['update']['version']);

        $this->update->start('1.0.1');
        $status = $this->runToSwitch();

        $this->assertSame('migrating', $status['state']);
        $this->assertTrue($status['drive']);
        $this->assertSame('1.0.1', $this->layout->current());
        $this->assertFileExists($this->site.'/runtime/1.0.1/vendor/letterncms/cms/src/Cms.php');
        $verify = json_decode((string) file_get_contents($this->site.'/storage/update/verify.json'), true);
        $this->assertSame('migrating', $verify['state']);
        $this->assertSame('1.0.0', $verify['previous']);

        $this->assertSame(['state' => 'done'], $this->update->drive());
        $this->assertSame('1.0.1', $this->layout->current());
        $this->assertSame([], glob($this->site.'/runtime/.incoming-*'));
        $this->assertFileDoesNotExist($this->site.'/storage/update/cms-1.0.1.zip');

        // The new release watches itself for a while, then the loader lets go.
        $this->assertSame('watching', json_decode((string) file_get_contents($this->site.'/storage/update/verify.json'), true)['state']);

        // The unchanged loader was replaced; the file someone edited stayed, with the new one beside it.
        $this->assertStringContainsString('1.0.1', (string) file_get_contents($this->site.'/index.php'));
        $this->assertSame("# changed by hand\n", file_get_contents($this->site.'/.htaccess'));
        $this->assertStringContainsString('1.0.1', (string) file_get_contents($this->site.'/.htaccess.new'));
    }

    public function test_store_plugins_and_site_files_survive(): void
    {
        Files::put($this->site.'/plugins/acme/composer.json', '{}');
        Files::put($this->site.'/config/keep.yaml', 'a: 1');
        $this->publish();
        $this->update->start('1.0.1');
        $this->runToSwitch();
        $this->update->drive();

        $this->assertFileExists($this->site.'/plugins/acme/composer.json');
        $this->assertFileExists($this->site.'/config/keep.yaml');
    }

    public function test_a_damaged_download_stops_before_anything_live(): void
    {
        $entry = $this->publish();
        $this->remote->routes[$entry['url']] = 'truncated';

        $this->update->start('1.0.1');
        $status = $this->runToSwitch();

        $this->assertSame('failed', $status['state']);
        $this->assertSame('1.0.0', $this->layout->current());
        $this->assertDirectoryDoesNotExist($this->site.'/runtime/1.0.1');
        $this->assertFileDoesNotExist($this->site.'/storage/update/verify.json');
    }

    public function test_a_signature_that_does_not_match_any_field_is_refused(): void
    {
        // The store relabels a signed version as a security fix.
        $zip = Releases::zip($this->dist, '1.0.1');
        $entry = [...Releases::entry($zip, '1.0.1'), 'security' => true];
        $this->remote->routes[$entry['url']] = (string) file_get_contents($zip);
        $this->remote->routes[self::FEED] = Releases::feed([$entry]);
        $this->feed->check();

        $this->assertNull($this->update->offer()['update']);
        $this->assertSame([], $this->feed->releases());
    }

    public function test_a_feed_signed_by_the_wrong_key_or_role_is_refused(): void
    {
        $this->remote->routes[self::FEED] = Signing::feed('cms-updates', ['product' => 'letterncms/cms', 'releases' => []], 'stranger', DevKeys::private('stranger'));
        $this->assertNotNull($this->feed->check());

        // A licence key may sign tokens, never a feed or a package.
        $this->remote->routes[self::FEED] = Signing::feed('cms-updates', ['product' => 'letterncms/cms', 'releases' => []], 'wrong-role');
        $this->assertNotNull($this->feed->check());
        $this->assertNull($this->feed->feed());
    }

    public function test_an_old_feed_is_refused_and_a_new_epoch_frees_a_forged_version(): void
    {
        $entry = $this->publish('1.0.1', [], [], ['version' => 5]);
        $this->assertSame('1.0.1', $this->update->offer()['update']['version']);

        $this->remote->routes[self::FEED] = Releases::feed([], ['version' => 4]);
        $this->assertNotNull($this->feed->check());
        $this->assertSame('1.0.1', $this->update->offer()['update']['version']);

        // A leaked key signs an impossible version once.
        $this->remote->routes[self::FEED] = Releases::feed([], ['version' => 2 ** 53]);
        $this->assertNull($this->feed->check());
        $this->remote->routes[self::FEED] = Releases::feed([$entry], ['version' => 6]);
        $this->assertNotNull($this->feed->check());

        // The owner signs a new epoch.
        $this->assertTrue($this->app->make(TrustRegistry::class)->default()->accept(DevKeys::trust(['epoch' => 2])));
        $this->assertNull($this->feed->check());
    }

    public function test_an_expired_feed_stops_installs_a_slightly_stale_one_warns(): void
    {
        $this->publish();

        Carbon::setTestNow(Carbon::now()->addDays(31));
        $this->assertSame('stale', $this->feed->freshness());

        Carbon::setTestNow(Carbon::now()->addDays(15));
        $this->assertSame('expired', $this->feed->freshness());
        $this->expectExceptionMessage('current');
        $this->update->start('1.0.1');
    }

    public function test_a_clock_far_behind_the_feed_pauses_updates_and_nothing_else(): void
    {
        $this->publish();
        Carbon::setTestNow(Carbon::now()->subDays(5));

        $this->assertSame('clock', $this->feed->freshness());
        $this->expectExceptionMessage('clock');
        $this->update->start('1.0.1');
    }

    public function test_a_yanked_release_is_never_offered(): void
    {
        $zip = Releases::zip($this->dist, '1.0.2');
        $good = Releases::entry(Releases::zip($this->dist, '1.0.1'), '1.0.1');
        $this->remote->routes[self::FEED] = Releases::feed([$good, Releases::entry($zip, '1.0.2')], ['yanked' => [['version' => '1.0.2', 'reason' => 'Breaks saving']]]);
        $this->feed->check();

        $this->assertSame('1.0.1', $this->update->offer()['update']['version']);

        // A site already on it hears about it.
        $this->assertSame('Breaks saving', $this->feed->yankedReason('1.0.2'));
    }

    public function test_case_62_a_major_whose_support_ended_is_noticed(): void
    {
        $this->publish('1.0.1', [], [], ['support' => [['major' => 1, 'until' => '2020-01']]]);

        $this->assertSame(1, $this->update->offer()['support_ended']['major']);
    }

    public function test_a_major_is_offered_apart_from_patches(): void
    {
        $patch = Releases::entry(Releases::zip($this->dist, '1.0.1'), '1.0.1');
        $major = Releases::entry(Releases::zip($this->dist, '2.0.0'), '2.0.0');
        $this->remote->routes[self::FEED] = Releases::feed([$patch, $major]);
        $this->feed->check();
        $offer = $this->update->offer();

        $this->assertSame('1.0.1', $offer['update']['version']);
        $this->assertSame('2.0.0', $offer['major']['version']);
        $this->assertTrue($offer['major']['major']);
    }

    public function test_a_failing_migration_or_check_flips_back_and_stays_on_the_old_code(): void
    {
        $this->publish();
        $this->update->start('1.0.1');
        $this->runToSwitch();

        $this->update->healthCheck = static fn () => ['The home page answers 500.'];
        $this->assertSame(['state' => 'rolled_back'], $this->update->drive());

        $this->assertSame('1.0.0', $this->layout->current());
        $this->assertFileDoesNotExist($this->site.'/storage/update/verify.json');
        $this->assertFileExists($this->site.'/storage/update/purge');
        $status = $this->update->status();
        $this->assertSame('rolled_back', $status['state']);
        $this->assertStringContainsString('500', $status['error']);
    }

    public function test_a_retry_after_a_rollback_reuses_the_unpacked_release(): void
    {
        $this->publish();
        $this->update->start('1.0.1');
        $this->runToSwitch();
        $this->update->healthCheck = static fn () => ['No.'];
        $this->update->drive();
        $downloads = count($this->remote->callsTo('cms-1.0.1.zip'));

        $this->update->healthCheck = static fn () => [];
        $this->update->start('1.0.1');
        $this->runToSwitch();
        $this->assertSame(['state' => 'done'], $this->update->drive());

        $this->assertCount($downloads, $this->remote->callsTo('cms-1.0.1.zip'));
    }

    public function test_a_damaged_release_folder_is_downloaded_again(): void
    {
        $this->publish();
        $this->update->start('1.0.1');
        $this->runToSwitch();
        $this->update->healthCheck = static fn () => ['No.'];
        $this->update->drive();
        file_put_contents($this->site.'/runtime/1.0.1/vendor/letterncms/cms/src/Cms.php', '<?php // tampered');

        $this->update->healthCheck = static fn () => [];
        $this->update->start('1.0.1');
        $this->assertSame('migrating', $this->runToSwitch()['state']);
        $this->assertStringContainsString('// 1.0.1', (string) file_get_contents($this->site.'/runtime/1.0.1/vendor/letterncms/cms/src/Cms.php'));
    }

    public function test_the_button_goes_back_while_the_previous_release_is_there(): void
    {
        $this->publish();
        $this->update->start('1.0.1');
        $this->runToSwitch();
        $this->update->drive();

        $this->assertSame('rolled_back', $this->update->rollback()['state']);
        $this->assertSame('1.0.0', $this->layout->current());
    }

    public function test_a_flip_the_loader_did_by_itself_shows_as_rolled_back(): void
    {
        $this->publish();
        $this->update->start('1.0.1');
        $this->runToSwitch();

        // Three fatals, or a driver that died: the loader wrote the pointer back.
        $this->layout->flip('1.0.0');
        @unlink($this->site.'/storage/update/verify.json');

        $this->assertSame('rolled_back', $this->update->status()['state']);
    }

    public function test_managed_installs_only_get_a_notice(): void
    {
        $this->publish();

        mkdir($this->site.'/.git');
        $this->assertSame('git', $this->update->offer()['managed']);

        $this->expectExceptionMessage('Composer');
        $this->update->start('1.0.1');
    }

    public function test_managed_when_there_is_no_runtime_or_a_setting(): void
    {
        @unlink($this->site.'/runtime/current');
        $this->assertSame('composer', $this->layout->managed());

        Files::put($this->site.'/runtime/current', "1.0.0\n");
        $this->assertNull($this->layout->managed());

        putenv('CMS_ALLOW_FILE_MODS=false');
        $_ENV['CMS_ALLOW_FILE_MODS'] = $_SERVER['CMS_ALLOW_FILE_MODS'] = 'false';
        $this->assertSame('file_mods', $this->layout->managed());
        putenv('CMS_ALLOW_FILE_MODS');
        unset($_ENV['CMS_ALLOW_FILE_MODS'], $_SERVER['CMS_ALLOW_FILE_MODS']);
    }

    public function test_an_unwritable_runtime_shows_the_manual_path_and_a_switch_finishes_it(): void
    {
        $entry = $this->publish();
        chmod($this->site.'/runtime', 0o555);

        try {
            $this->update->start('1.0.1');
            $this->fail('It started with nowhere to write.');
        } catch (\RuntimeException $e) {
            $this->assertStringContainsString('FTP', $e->getMessage());
        } finally {
            chmod($this->site.'/runtime', 0o755);
        }

        // Uploaded by FTP, then one click.
        Files::put($this->site.'/runtime/1.0.1/vendor/autoload.php', '<?php');
        $this->assertSame('migrating', $this->update->switchTo('1.0.1')['state']);
        $this->assertSame('1.0.1', $this->layout->current());
        $this->assertNotEmpty($entry);
    }

    public function test_the_pointer_write_is_all_or_nothing(): void
    {
        chmod($this->site.'/runtime', 0o555);
        $flipped = $this->layout->flip('9.9.9');
        chmod($this->site.'/runtime', 0o755);

        $this->assertFalse($flipped);
        $this->assertSame('1.0.0', $this->layout->current());
    }

    public function test_a_missing_php_extension_refuses_early(): void
    {
        $this->publish('1.0.1', [], ['requires' => ['php' => '>=8.4', 'ext' => ['nothing_like_this']]]);

        $this->expectExceptionMessage('ext-nothing_like_this');
        $this->update->start('1.0.1');
    }

    public function test_security_updates_go_by_themselves_when_nothing_stands_in_the_way(): void
    {
        $this->publish('1.0.1', [], ['security' => true, 'fixes' => '>=1.0.0 <1.0.1']);

        $this->assertNull($this->update->autoBlocker());
        $this->assertTrue($this->update->auto()['more']);

        for ($i = 0; $i < 20 && $this->update->status()['state'] !== 'migrating'; $i++) {
            $this->update->auto();
        }

        $this->assertSame('1.0.1', $this->layout->current());
        $this->assertTrue($this->update->status()['auto']);
    }

    public function test_a_plain_update_does_not_go_by_itself(): void
    {
        $this->publish();

        $this->assertSame('none', $this->update->autoBlocker());
        $this->assertFalse($this->update->auto()['more']);
    }

    public function test_opt_out_postpone_and_failed_twice_each_stop_it(): void
    {
        $this->publish('1.0.1', [], ['security' => true, 'fixes' => '>=1.0.0 <1.0.1']);

        $this->update->setAuto(false);
        $this->assertSame('off', $this->update->autoBlocker());
        $this->update->setAuto(true);

        $this->update->postpone(3);
        $this->assertSame('postponed', $this->update->autoBlocker());
        Carbon::setTestNow(Carbon::now()->addDays(4));
        $this->assertNull($this->update->autoBlocker());

        // First failure: once more after a day. Second: stops until a higher version.
        $this->update->healthCheck = static fn () => ['No.'];
        $this->update->start('1.0.1', auto: true);
        $this->runToSwitch();
        $this->update->drive();
        $this->assertSame('retry_later', $this->update->autoBlocker());

        Carbon::setTestNow(Carbon::now()->addDays(2));
        $this->assertNull($this->update->autoBlocker());
        $this->update->start('1.0.1', auto: true);
        $this->runToSwitch();
        $this->update->drive();

        Carbon::setTestNow(Carbon::now()->addDays(2));
        $this->assertSame('failed_twice', $this->update->autoBlocker());
    }

    public function test_an_incompatible_plugin_stops_it(): void
    {
        Files::put($this->site.'/plugins/old/composer.json', (string) json_encode(['name' => 'acme/old', 'type' => 'cms-plugin', 'version' => '1.0.0', 'require' => ['letterncms/cms' => '*']]));
        Files::put($this->site.'/config/plugins.yaml', "enabled:\n  - acme/old\n");
        $this->cms()->packages()->refresh();
        $this->assertTrue($this->cms()->packages()->isActive('acme/old'));

        $this->assertSame([], $this->update->incompatible('1.0.1'));

        Files::put($this->site.'/plugins/old/composer.json', (string) json_encode(['name' => 'acme/old', 'type' => 'cms-plugin', 'version' => '1.0.0', 'require' => ['letterncms/cms' => '>=0.1 <1.0.1']]));
        $this->cms()->packages()->refresh();
        $this->publish('1.0.1', [], ['security' => true]);

        $this->assertSame(['acme/old'], $this->update->incompatible('1.0.1'));
        $this->assertSame('incompatible', $this->update->autoBlocker());
    }

    public function test_a_tick_outside_the_window_does_nothing(): void
    {
        $this->assertFalse(CoreUpdate::due($this->app));

        $this->post('/_cms/update/tick')->assertNoContent();
        $this->assertSame('idle', $this->update->status()['state']);
    }

    public function test_no_public_request_starts_or_advances_an_update(): void
    {
        $this->publish('1.0.1', [], ['security' => true, 'fixes' => '>=1.0.0 <1.0.1']);
        $this->remote->calls = [];

        $this->get('/');
        $this->post('/_cms/update/tick');

        $this->assertSame([], $this->remote->calls);
        $this->assertFalse(is_file($this->site.'/storage/update/state.json'));
    }

    public function test_a_preview_key_never_reaches_a_released_client(): void
    {
        $trust = DevKeys::trust(['keys' => [['kid' => 'preview-1', 'role' => 'preview', 'pub' => DevKeys::public('preview-1')]]]);
        $anchor = $this->site.'/anchor.json';
        file_put_contents($anchor, $trust);
        $feed = Signing::feed('cms-updates', ['product' => 'letterncms/cms', 'releases' => []], 'preview-1');
        $entry = Signing::version('letterncms/cms', ['version' => '0.2.0', 'sha256' => str_repeat('a', 64)], 'preview-1');
        $higher = Signing::version('letterncms/cms', ['version' => '1.0.0', 'sha256' => str_repeat('a', 64)], 'preview-1');

        $preview = new TrustStore($anchor, $this->site.'/t1', 'default', true, '0.1.0');
        $this->assertNotNull($preview->openFeed($feed, 'cms-updates', time()));
        $this->assertTrue($preview->versionVerifies('letterncms/cms', $entry, '0.1.0'));
        $this->assertFalse($preview->versionVerifies('letterncms/cms', $higher, '0.1.0'));

        $released = new TrustStore($anchor, $this->site.'/t2', 'default', true, '1.0.0');
        $this->assertNull($released->openFeed($feed, 'cms-updates', time()));
        $this->assertFalse($released->versionVerifies('letterncms/cms', $entry, '1.0.0'));
    }
}

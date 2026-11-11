<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Cms;
use Cms\Modules\Packages\StoreClient;
use Cms\Modules\Sync\LocalSite;
use Cms\Modules\Sync\Receiver;
use Cms\Packages\Install\PackageJobs;
use Cms\Support\Crypto\Base64Url;
use Cms\Support\Files;
use Cms\Support\Remote;
use Cms\Tests\Support\FakeRemote;
use Cms\Tests\Support\Releases;
use Cms\Tests\Support\Signing;
use Cms\Tests\TestCase;
use Cms\Trust\Envelope;
use Cms\Trust\TrustRegistry;
use Cms\Update\CoreUpdate;
use Cms\Update\Layout;
use Cms\Update\ReleaseFeed;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use ZipArchive;

/**
 * Plugins, the store, the updater and Sync, each run through its abilities, so that what they
 * answer with is held against their output schemas. The store and the release list are signed
 * files behind a fake remote; the other site of a sync is this one under another identity.
 */
final class OutputPackagesTest extends TestCase
{
    private const string STORE = 'https://store.invalid';

    private const string CATALOG = 'https://store.invalid/api/store/v1/catalog.json';

    private const string FEED = 'https://store.invalid/downloads/releases.json';

    private FakeRemote $remote;

    /** @var list<array<string, mixed>> */
    private array $items = [];

    private int $catalogVersion = 1;

    private ?AbilityContext $context = null;

    protected function plugins(): array
    {
        return ['acme/extra'];
    }

    protected function prepareSite(string $site): void
    {
        Files::put("{$site}/plugins/extra/composer.json", (string) json_encode([
            'name' => 'acme/extra',
            'type' => 'cms-plugin',
            'version' => '1.0.0',
            'description' => 'Something extra: for the tests.',
            'require' => ['letterncms/cms' => '^'.implode('.', array_slice(explode('.', Cms::VERSION), 0, 2))],
            'autoload' => ['psr-4' => ['Acme\\Extra\\' => 'src/']],
            'extra' => ['cms' => ['provider' => 'Acme\\Extra\\ExtraPlugin']],
        ]));
        Files::put("{$site}/plugins/extra/src/ExtraPlugin.php", "<?php\nnamespace Acme\\Extra;\nfinal class ExtraPlugin extends \\Cms\\Packages\\Plugin\n{\n}\n");
    }

    protected function setUp(): void
    {
        parent::setUp();

        // A site that updates itself: one with Composer takes its plugins and its core from Composer.
        Files::put($this->site.'/runtime/current', "1.0.0\n");
        $this->remote = new FakeRemote;
        $this->app->instance(Remote::class, $this->remote);

        foreach ([PackageJobs::class, StoreClient::class, CoreUpdate::class, ReleaseFeed::class] as $class) {
            $this->app->forgetInstance($class);
        }

        $this->app->make(\Cms\Settings\SettingsRegistry::class)->save('site', ['url' => 'https://example.com']);
    }

    private function ability(string $ability, array $input = []): mixed
    {
        return $this->cms()->abilities()->execute($ability, $input, $this->context ??= AbilityContext::forUser($this->admin(), 'admin'));
    }

    public function test_a_plugin_is_switched_synced_and_uninstalled(): void
    {
        $this->assertSame(['disabled' => 'acme/extra'], $this->ability('packages/disable', ['name' => 'acme/extra']));
        $this->assertSame(['enabled' => 'acme/extra'], $this->ability('packages/enable', ['name' => 'acme/extra']));

        $off = $this->ability('packages/switch', ['name' => 'acme/extra', 'on' => false]);
        $this->assertFalse($off['on']);
        $on = $this->ability('packages/switch', ['name' => 'acme/extra', 'on' => true]);
        $this->assertTrue($on['on']);

        $this->assertIsArray($this->ability('packages/sync')['done']);

        $list = array_column($this->ability('packages/list', ['type' => 'plugin'])['items'], null, 'name');
        $this->assertTrue($list['acme/extra']['enabled']);
        $this->assertNotEmpty($this->ability('packages/list', ['type' => 'module', 'optional' => true])['items']);

        $this->assertSame('acme/extra', $this->ability('packages/uninstall', ['name' => 'acme/extra'])['uninstalled']);
    }

    public function test_the_store_is_browsed_and_a_package_installed_updated_and_rolled_back(): void
    {
        // Before anything was fetched: no catalog, and saying so.
        $this->assertSame('none', $this->ability('packages/catalog')['freshness']);
        $this->assertCount(1, $this->ability('packages/stores')['items']);

        // Another store, pinned only once its fingerprint is repeated.
        $base = 'https://other.example';
        $root = sodium_crypto_sign_seed_keypair(hash('sha256', 'other-root', true));
        $release = sodium_crypto_sign_seed_keypair(hash('sha256', 'other-release', true));
        $this->remote->routes[$base.'/api/store/v1/index.json'] = (string) json_encode(['name' => 'Other', 'api' => 1, 'trust_url' => $base.'/api/store/v1/trust.json', 'catalog_url' => $base.'/api/store/v1/catalog.json']);
        $this->remote->routes[$base.'/api/store/v1/trust.json'] = Envelope::sign('cms-trust', ['type' => 'cms-trust', 'epoch' => 1, 'version' => 1, 'roots' => [['kid' => 'o-root', 'pub' => Base64Url::encode(sodium_crypto_sign_publickey($root))]], 'keys' => [['kid' => 'o-rel', 'role' => 'release', 'pub' => Base64Url::encode(sodium_crypto_sign_publickey($release))]]], ['o-root' => sodium_crypto_sign_secretkey($root)]);
        $asked = $this->ability('packages/store-add', ['url' => $base]);
        $this->assertFalse($asked['added']);
        $this->assertTrue($this->ability('packages/store-add', ['url' => $base, 'confirm' => $asked['fingerprint']])['added']);
        $this->assertCount(2, $this->ability('packages/stores')['items']);
        $this->assertSame(['removed' => $asked['id']], $this->ability('packages/store-remove', ['id' => $asked['id']]));

        // The default store, with a listing that says everything a listing can.
        $this->list('acme/forms', '1.0.0', item: ['glyph' => 'map-pin', 'featured' => true]);
        $this->list('acme/paid', '1.0.0', item: ['pricing' => 'paid']);
        $this->remote->routes[self::STORE.'/api/store/v1/items/acme/forms.json'] = (string) json_encode([
            'description_html' => '<p>Fine</p>', 'screenshots' => [self::STORE.'/1.png'],
            'gallery' => [['url' => self::STORE.'/1.png', 'alt' => 'The form editor.']],
            'requirements' => ['A form'], 'docs_url' => 'https://acme.example/docs', 'repository_url' => 'javascript:alert(1)',
            'releases' => [['version' => '1.0.0', 'released_at' => '2026-11-01T10:00:00Z', 'notes' => 'Added', 'security' => false]],
        ]);

        $catalog = $this->ability('packages/catalog', ['refresh' => true]);
        $this->assertNull($catalog['error']);
        $this->assertCount(2, $catalog['items']);
        $this->assertSame('A form', $this->ability('packages/item', ['package' => 'acme/forms'])['requirements'][0]);
        // A listing the store says nothing more about.
        $this->assertSame('', $this->ability('packages/item', ['package' => 'acme/paid'])['description_html']);

        $plan = $this->ability('packages/plan-install', ['package' => 'acme/forms']);
        $this->assertSame('install', $plan['steps'][0]['action']);
        $this->assertFalse($this->ability('packages/plan-install', ['package' => 'acme/paid'])['access']['allowed']);

        $job = $this->install('acme/forms');
        $this->assertSame('done', $job['state'], (string) ($job['error'] ?? ''));
        $this->assertSame('done', $this->ability('packages/job-status', ['id' => $job['id']])['state']);

        // One that doesn't parse stops, and says why.
        $this->list('acme/bad', '1.0.0', files: ['broken.php' => "<?php\nthis is not php"]);
        $failed = $this->install('acme/bad');
        $this->assertSame('failed', $failed['state']);
        $this->assertSame('failed', $this->ability('packages/job-status', ['id' => $failed['id']])['state']);

        // A newer version shows as an update; installed, the one before can come back.
        $this->list('acme/forms', '1.1.0');
        $updates = $this->ability('packages/updates');
        $this->assertSame('1.1.0', $updates['packages'][0]['version']);
        $this->assertSame('done', $this->install('acme/forms', '1.1.0')['state']);
        $this->assertSame(['rolledBack' => 'acme/forms'], $this->ability('packages/rollback', ['package' => 'acme/forms']));

        $this->assertSame(['postponed' => 3], $this->ability('packages/update-postpone', ['days' => 3]));
        $this->assertSame(['on' => false], $this->ability('packages/update-auto', ['on' => false]));
        $this->assertIsInt($this->ability('packages/updates')['core']['postponed_until']);
    }

    public function test_the_core_is_updated_rolled_back_and_switched_by_hand(): void
    {
        Files::put($this->site.'/runtime/1.0.0/vendor/autoload.php', "<?php\n");
        Files::put($this->site.'/runtime/1.0.0/release.json', (string) json_encode(['version' => '1.0.0', 'root_files' => []]));
        $feed = new ReleaseFeed($this->app, $this->app->make(TrustRegistry::class), $this->remote);
        $update = new CoreUpdate($this->app, new Layout($this->app), $feed, $this->app->make(TrustRegistry::class), $this->remote);
        $update->runningVersion = '1.0.0';
        $update->loopback = false;
        $update->healthCheck = static fn () => [];
        $this->app->instance(ReleaseFeed::class, $feed);
        $this->app->instance(CoreUpdate::class, $update);

        // Nothing to fetch yet: the check says what went wrong.
        $this->assertIsString($this->ability('packages/update-check')['error']);

        $zip = Releases::zip($this->site.'/dist', '1.0.1');
        $entry = Releases::entry($zip, '1.0.1', ['released_at' => '2026-11-01T10:00:00Z', 'security' => true, 'notes_url' => 'https://store.invalid/notes']);
        $this->remote->routes[$entry['url']] = (string) file_get_contents($zip);
        $this->remote->routes[self::FEED] = Releases::feed([$entry]);
        $this->publishCatalog();

        $checked = $this->ability('packages/update-check');
        $this->assertNull($checked['error']);
        $this->assertSame('1.0.1', $checked['core']['update']['version']);
        $this->assertSame('1.0.1', $this->ability('packages/updates')['core']['update']['version']);

        $this->assertSame('downloading', $this->ability('packages/update-start', ['version' => '1.0.1'])['state']);

        for ($i = 0, $status = ['state' => 'downloading']; $i < 20 && in_array($status['state'], ['downloading', 'verifying', 'extracting', 'checking_files', 'ready'], true); $i++) {
            $status = $this->ability('packages/update-step');
        }

        $this->assertSame('migrating', $status['state'], (string) ($status['error'] ?? ''));
        $this->assertTrue($status['drive']);
        $this->assertSame(['state' => 'done'], $update->drive());
        $this->assertSame('done', $this->ability('packages/updates')['status']['state']);

        $back = $this->ability('packages/update-rollback');
        $this->assertSame('1.0.0', $back['current']);
        $this->assertSame('rolled_back', $back['state']);

        // A release put into runtime/ by hand.
        Files::put($this->site.'/runtime/1.0.2/vendor/autoload.php', "<?php\n");
        Files::put($this->site.'/runtime/1.0.2/release.json', (string) json_encode(['version' => '1.0.2', 'root_files' => []]));
        $this->assertSame('1.0.2', $this->ability('packages/update-switch', ['version' => '1.0.2'])['target']);
    }

    public function test_a_site_is_connected_synced_and_put_back(): void
    {
        DB::table('entries')->insert(['id' => strtolower((string) Str::ulid()), 'collection' => 'posts', 'slug' => 'hello', 'title' => 'Hello', 'status' => 'published', 'data' => json_encode(['body' => 'https://production.test/hello']), 'created_at' => now(), 'updated_at' => now()]);
        $this->otherSite('https://production.test');

        $empty = $this->ability('sync/overview');
        $this->assertSame([[], null, null, []], [$empty['remotes'], $empty['current'], $empty['busy'], $empty['history']]);

        $remote = $this->ability('sync/connect', ['key' => 'https://production.test#'.str_repeat('k', 48), 'name' => 'Production']);
        $this->assertSame(['production', null], [$remote['name'], $remote['last']]);

        $preview = $this->ability('sync/preview', ['remote' => 'production', 'direction' => 'pull']);
        $this->assertSame([], $preview['problems']);
        $this->assertContains('content', array_column($preview['groups'], 'id'));
        $this->assertNotEmpty($this->ability('sync/preview', ['remote' => 'production', 'direction' => 'push', 'rewrite' => [['/old', '/new']]])['rewrite']);

        // Started, looked at, and given up before anything switched.
        $started = $this->ability('sync/start', ['remote' => 'production', 'direction' => 'pull', 'groups' => ['content']]);
        $this->assertSame('running', $started['status']);
        $this->assertSame($started['id'], $this->ability('sync/overview')['current']['id']);
        $this->assertSame('running', $this->ability('sync/resume', ['id' => $started['id']])['status']);
        $this->assertSame('cancelled', $this->ability('sync/cancel', ['id' => $started['id']])['status']);

        // A pull all the way, undone here.
        $pulled = $this->sync('pull');
        $this->assertSame('done', $pulled['status'], (string) $pulled['error']);
        $history = $this->ability('sync/history');
        $this->assertSame([$pulled['id'], true], [$history[0]['id'], $history[0]['undoable']]);
        $overview = $this->ability('sync/overview');
        $this->assertSame($pulled['id'], $overview['remotes'][0]['last']['id']);
        $this->assertCount(1, $overview['history']);
        $this->assertTrue($this->undo(['id' => $pulled['id']])['done']);
        $this->assertSame('undone', $this->ability('sync/history')[0]['undone']);

        // A push, and what the other site says of it; undone from here.
        $pushed = $this->sync('push');
        $this->assertSame('done', $pushed['status'], (string) $pushed['error']);
        $theirs = $this->ability('sync/history', ['remote' => 'production']);
        $this->assertSame($pushed['id'], $theirs[0]['id']);
        $this->assertTrue($this->undo(['id' => $pushed['id'], 'remote' => 'production'])['done']);

        $key = $this->ability('sync/renew-key')['key'];
        $this->assertSame($key, $this->ability('sync/allow', ['what' => 'push', 'on' => false])['key']);
        $this->assertSame(['ok' => true], $this->ability('sync/disconnect', ['name' => 'production']));
    }

    /** Starts a sync of the content and steps it until it ends. */
    private function sync(string $direction): array
    {
        $job = $this->ability('sync/start', ['remote' => 'production', 'direction' => $direction, 'groups' => ['content']]);

        for ($i = 0; $i < 20 && in_array($job['status'], ['running', 'waiting'], true); $i++) {
            $job = $this->ability('sync/step', ['id' => $job['id']]);
        }

        return $job;
    }

    private function undo(array $input): array
    {
        for ($i = 0, $result = ['done' => false]; $i < 20 && ! $result['done']; $i++) {
            $result = $this->ability('sync/undo', $input);
        }

        return $result;
    }

    /** The other site: this one, answering over HTTP under another identity, address and database. */
    private function otherSite(string $url): void
    {
        Http::fake(function (Request $request) use ($url) {
            $op = basename((string) parse_url($request->url(), PHP_URL_PATH));
            $raw = (string) gzdecode($request->body());
            $in = $op === 'write' ? [] : (array) json_decode($raw, true);
            $local = app(LocalSite::class);
            $receiver = app(Receiver::class);
            $out = match ($op) {
                'hello' => [...$local->hello(), 'site_id' => 'the-other-site', 'fingerprint' => 'another-database', 'name' => 'Production', 'url' => $url],
                'inventory' => $local->inventory(),
                'export' => $local->export((string) $in['table'], $in['cursor'] ?? null, isset($in['scope']) ? (array) $in['scope'] : null),
                'read' => $local->read(array_values((array) $in['files'])),
                'begin' => $receiver->begin((string) $in['job'], (array) $in['plan']),
                'import' => $receiver->import((string) $in['job'], (string) $in['table'], (int) $in['seq'], array_map('strval', (array) $in['columns']), array_values((array) $in['rows'])),
                'write' => $receiver->write($request->header('X-Sync-Job')[0] ?? '', $raw),
                'backup' => $receiver->backup((string) $in['job']),
                'finalize' => $receiver->finalize((string) $in['job']),
                'cancel' => $receiver->cancel((string) $in['job']),
                'history' => $receiver->history(),
                'undo' => $receiver->undo((string) $in['id']),
            };

            return Http::response(is_string($out) ? $out : (string) json_encode($out, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION), 200, ['X-Sync-Protocol' => (string) LocalSite::PROTOCOL]);
        });
    }

    /** Installs from the default store, a step at a time, as the admin does. */
    private function install(string $package, ?string $version = null): array
    {
        $job = $this->ability('packages/install', ['package' => $package, ...($version ? ['version' => $version] : [])]);

        for ($i = 0; $i < 20 && $job['state'] === 'running'; $i++) {
            $job = $this->ability('packages/job-step', ['id' => $job['id']]);
        }

        return $job;
    }

    /** Lists a version of a package in the default store. */
    private function list(string $package, string $version, array $item = [], array $files = []): void
    {
        $top = str_replace('/', '-', $package);
        $path = $this->site.'/dist/'.$top.'-'.$version.'.zip';
        Files::ensureDir(dirname($path));
        $zip = new ZipArchive;
        $zip->open($path, ZipArchive::CREATE);
        $zip->addFromString($top.'/composer.json', (string) json_encode(['name' => $package, 'type' => 'cms-plugin', 'version' => $version]));

        foreach ($files as $file => $body) {
            $zip->addFromString($top.'/'.$file, $body);
        }

        $zip->close();
        $url = self::STORE.'/api/store/v1/download/'.$package.'/'.$version;
        $entry = Signing::version($package, ['version' => $version, 'sha256' => hash_file('sha256', $path), 'size' => filesize($path), 'url' => $url, 'first_party' => false, 'requires' => ['core' => '*', 'php' => '>=8.4']]);
        $this->remote->routes[$url] = (string) file_get_contents($path);
        $known = array_search($package, array_column($this->items, 'package'), true);

        if ($known !== false) {
            $this->items[$known]['versions'][] = $entry;
        } else {
            $this->items[] = ['package' => $package, 'type' => 'plugin', 'title' => ucfirst(explode('/', $package)[1]), 'summary' => 'Does a thing.', 'icon' => self::STORE.'/icon.png', 'categories' => ['tools'], 'pricing' => 'free', 'first_party' => false, 'author' => ['name' => 'Acme', 'url' => 'https://acme.example'], 'listing_url' => self::STORE.'/store/'.$top, 'versions' => [$entry], ...$item];
        }

        $this->publishCatalog();
    }

    private function publishCatalog(): void
    {
        $this->remote->routes[self::CATALOG] = Signing::feed('cms-catalog', ['version' => $this->catalogVersion++, 'store' => self::STORE, 'items' => $this->items, 'blocked' => [], 'yanked' => []]);
        $this->assertNull($this->app->make(StoreClient::class)->refresh());
    }
}

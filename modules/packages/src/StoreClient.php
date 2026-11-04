<?php

declare(strict_types=1);

namespace Cms\Modules\Packages;

use Cms\Cms;
use Cms\Foundation\Application;
use Cms\Modules\License\LicenseService;
use Cms\Packages\PackageManifest;
use Cms\Packages\Install\PackageJobs;
use Cms\Support\Files;
use Cms\Support\Html\Sanitizer;
use Cms\Support\Remote;
use Cms\Support\Yaml;
use Cms\Trust\PackageSignature;
use Cms\Trust\TrustFile;
use Cms\Trust\TrustRegistry;
use Composer\Semver\Semver;
use Illuminate\Support\Carbon;
use RuntimeException;
use Throwable;

/**
 * Browses and installs from a store endpoint, on any site, with no commerce plugin in sight. A
 * store is a few static signed files: nothing here trusts the server, only the signatures.
 * A paid package needs a licence that names it; the store decides, this offers a way to buy.
 */
final class StoreClient
{
    public const string DEFAULT = 'default';

    private const int STALE_LIMIT = 14 * 86_400;

    private const int FUTURE_TOLERANCE = 48 * 3600;

    /** @var list<array<string, mixed>> What the catalog read last withdrew */
    private array $yanked = [];

    public function __construct(
        private readonly Application $app,
        private readonly Cms $cms,
        private readonly TrustRegistry $trust,
        private readonly Remote $remote,
        private readonly PackageJobs $jobs,
    ) {}

    /** @return list<array{id: string, url: ?string, name: string, default: bool, fingerprint: ?string, problem: ?string}> */
    public function stores(): array
    {
        $default = $this->trust->default();
        $out = [['id' => self::DEFAULT, 'url' => $this->catalogUrl(self::DEFAULT), 'name' => cms_brand(), 'default' => true, 'fingerprint' => $default->current()?->fingerprint(), 'problem' => $default->problem()]];

        foreach ($this->added() as $id => $store) {
            $trust = $this->trust->store($id);
            $out[] = ['id' => $id, 'url' => (string) $store['url'], 'name' => (string) ($store['name'] ?? $id), 'default' => false, 'fingerprint' => $trust->current()?->fingerprint(), 'problem' => $trust->problem()];
        }

        return $out;
    }

    /**
     * Add a store: read what it says about itself, and pin its root only once the admin has
     * confirmed the fingerprint from the store's own documentation.
     *
     * @return array{name: string, fingerprint: string, added: bool, id: string}
     */
    public function addStore(string $url, ?string $confirm = null): array
    {
        $base = rtrim($url, '/');

        if (! preg_match('#^https?://#i', $base)) {
            throw new RuntimeException(__('A store address starts with https://.'));
        }

        $index = json_decode($this->remote->get($base.'/api/store/v1/index.json', 200_000, 5), true);

        if (! is_array($index) || (int) ($index['api'] ?? 0) !== 1 || ! is_string($index['trust_url'] ?? null) || ! is_string($index['catalog_url'] ?? null)) {
            throw new RuntimeException(__('That address does not answer like a store.'));
        }

        $json = $this->remote->get((string) $index['trust_url'], 1_000_000, 5);
        $trust = TrustFile::selfSigned($json);

        if (! $trust || $trust->roots() === []) {
            throw new RuntimeException(__('The store has no valid trust file.'));
        }

        $fingerprint = $trust->fingerprint();
        $id = substr(sha1($base), 0, 12);
        $name = mb_substr((string) ($index['name'] ?? parse_url($base, PHP_URL_HOST)), 0, 80);

        if ($confirm === null || trim(strtolower($confirm)) !== $fingerprint) {
            return ['name' => $name, 'fingerprint' => $fingerprint, 'added' => false, 'id' => $id];
        }

        Files::put($this->trust->anchorPath($id), $json);
        $this->trust->forget($id);
        $stores = $this->added();
        $stores[$id] = ['url' => $base, 'catalog' => (string) $index['catalog_url'], 'name' => $name];
        Yaml::write($this->storesFile(), ['stores' => $stores]);

        return ['name' => $name, 'fingerprint' => $fingerprint, 'added' => true, 'id' => $id];
    }

    public function removeStore(string $id): void
    {
        $stores = $this->added();

        if (! isset($stores[$id])) {
            throw new RuntimeException(__('That store is not on this site.'));
        }

        unset($stores[$id]);
        Yaml::write($this->storesFile(), ['stores' => $stores]);
        @unlink($this->catalogFile($id));
        @unlink($this->trust->anchorPath($id));
        $this->trust->forget($id);
    }

    /** Fetch trust and the catalog. Anonymous: nothing about this site is sent. @return string|null What went wrong */
    public function refresh(string $id = self::DEFAULT): ?string
    {
        $store = $this->trust->store($id);

        try {
            $trust = $store->current();

            if (! $trust) {
                throw new RuntimeException($store->problem() === 'dev_trust' ? __('This build has no production signing keys yet, so it can’t trust a store.') : __('No trust file counts on this site.'));
            }

            $trustUrl = $id === self::DEFAULT ? $trust->endpoint('trust') : (json_decode($this->remote->get(rtrim((string) $this->added()[$id]['url'], '/').'/api/store/v1/index.json', 200_000, 3), true)['trust_url'] ?? null);

            if (is_string($trustUrl) && $trustUrl !== '') {
                try {
                    $store->accept($this->remote->get($trustUrl, 1_000_000, 3));
                    $store->checkedNow();
                } catch (Throwable) {
                    // The catalog may still verify under the keys already known.
                }
            }

            $url = $this->catalogUrl($id);

            if (! $url) {
                throw new RuntimeException(__('No store address is known.'));
            }

            $json = $this->remote->get($url, 20_000_000, 5);

            if (! $store->openFeed($json, 'cms-catalog', $this->now())) {
                throw new RuntimeException(__('The catalog did not verify, or it is older than one seen before.'));
            }

            Files::put($this->catalogFile($id), $json);

            return null;
        } catch (Throwable $e) {
            return mb_substr($e->getMessage(), 0, 300);
        }
    }

    /** @return array{store: string, items: list<array<string, mixed>>, freshness: string, problem: ?string, error: ?string} The catalog as this site sees it */
    public function catalog(string $id = self::DEFAULT, bool $refresh = false): array
    {
        $error = null;

        if ($refresh || ! is_file($this->catalogFile($id))) {
            $error = $this->refresh($id);
        }

        $payload = $this->payload($id);
        $items = [];

        foreach ((array) ($payload['items'] ?? []) as $item) {
            // Delisted: no new sales, though whoever has it still gets its updates.
            if (is_array($item) && $this->nameAllowed($id, (string) ($item['package'] ?? '')) && (empty($item['delisted']) || $this->cms->packages()->repository()->find((string) ($item['package'] ?? '')))) {
                $items[] = $this->describe($id, $item, $payload);
            }
        }

        return ['store' => $id, 'items' => $items, 'freshness' => $this->freshness($payload), 'problem' => $this->trust->store($id)->problem(), 'error' => $error];
    }

    /** The listing's detail. Unsigned and from another server: its HTML is cleaned here, and only the store's own images survive. */
    public function item(string $id, string $package): array
    {
        $payload = $this->payload($id);
        $item = $this->find($payload, $package);

        if (! $item) {
            throw new RuntimeException(__('That package is not in this store.'));
        }

        $described = $this->describe($id, $item, $payload);
        $origin = self::origin((string) ($payload['store'] ?? ''));
        $detail = [];

        try {
            $detail = (array) json_decode($this->remote->get(rtrim((string) $payload['store'], '/').'/api/store/v1/items/'.$package.'.json', 2_000_000, 5), true);
        } catch (Throwable) {
            // The catalog alone is enough to install from.
        }

        $html = Sanitizer::clean((string) ($detail['description_html'] ?? ''));
        $html = (string) preg_replace_callback('/<img\b[^>]*>/i', static function (array $m) use ($origin) {
            preg_match('/\bsrc\s*=\s*"([^"]*)"/i', $m[0], $src);

            return isset($src[1]) && self::origin($src[1]) === $origin ? $m[0] : '';
        }, $html);

        return [
            ...$described,
            'description_html' => $html,
            'screenshots' => array_values(array_filter(array_map('strval', (array) ($detail['screenshots'] ?? [])), static fn (string $u) => self::origin($u) === $origin)),
            'operator' => (string) ($detail['operator'] ?? parse_url((string) $payload['store'], PHP_URL_HOST)),
            'capabilities' => array_values(array_map('strval', (array) ($described['entry']['capabilities'] ?? []))),
            'requires' => (array) ($described['entry']['requires'] ?? []),
        ];
    }

    /**
     * What installing a package means: its dependencies in order, what it may do, what it needs.
     * Refused with the reason when it can't work out.
     *
     * @return array{steps: list<array{package: string, version: string, title: string, enable_only: bool, action: string}>, capabilities: list<string>, access: array<string, mixed>}
     */
    public function plan(string $id, string $package, ?string $version = null): array
    {
        $payload = $this->payload($id);
        $steps = [];
        $this->resolve($id, $payload, $package, $version, $steps, []);

        $main = $this->find($payload, $package);
        $entry = $main ? $this->entry($main, $version) : null;

        return [
            'steps' => array_values($steps),
            'capabilities' => array_values(array_map('strval', (array) ($entry['capabilities'] ?? []))),
            'access' => $main && $entry ? $this->gate($main, $entry, $id) : ['allowed' => true],
        ];
    }

    /** Start an install from the store. @return array<string, mixed> The job */
    public function install(string $id, string $package, ?string $version, bool $turnOn = true): array
    {
        $payload = $this->payload($id);
        $this->requireFresh($payload);
        $item = $this->find($payload, $package);
        $entry = $item ? $this->entry($item, $version) : null;

        if (! $item || ! $entry) {
            throw new RuntimeException(__('That version is not in this store.'));
        }

        $this->refuseBlocked($payload, $package, (string) $entry['version']);

        if (! $this->nameAllowed($id, $package)) {
            throw new RuntimeException(__('Only the default store may provide :package.', ['package' => $package]));
        }

        $gate = $this->gate($item, $entry, $id);

        if (! $gate['allowed']) {
            throw new RuntimeException($gate['message']);
        }

        return $this->jobs->start([
            'package' => $package,
            'version' => (string) $entry['version'],
            'url' => $this->requireSameOrigin($payload, (string) $entry['url']).(string) ($gate['query'] ?? ''),
            'size' => (int) ($entry['size'] ?? 0),
            'sha256' => (string) $entry['sha256'],
            'headers' => (array) ($gate['headers'] ?? []),
            'verifier' => 'store',
            'turn_on' => $turnOn,
            'context' => ['store' => $id, 'entry' => $entry],
            'source' => ['store' => $id, 'signed' => true],
        ]);
    }

    /**
     * The check that makes a download trustworthy: its bytes, the signature with every field,
     * and a catalog that still lists it. No "install anyway" on this path.
     *
     * @param  array<string, mixed>  $job
     */
    public function verifyDownload(array $job): void
    {
        $id = (string) $job['context']['store'];
        $entry = (array) $job['context']['entry'];
        $package = (string) $job['package'];
        $hash = @hash_file('sha256', (string) $job['zip']);

        if (! $hash || ! hash_equals(strtolower((string) $entry['sha256']), $hash)) {
            throw new RuntimeException(__('The download is damaged, or not what the store listed. Nothing was changed.'));
        }

        $payload = $this->payload($id);
        $current = $this->find($payload, $package);
        $listed = $current ? $this->entry($current, (string) $entry['version'], allowYanked: true) : null;

        if (! $listed || ($listed['sig'] ?? null) !== ($entry['sig'] ?? null)) {
            throw new RuntimeException(__('The store no longer lists this version. Nothing was changed.'));
        }

        $this->refuseBlocked($payload, $package, (string) $entry['version']);

        $core = Cms::VERSION;

        if (! $this->trust->store($id)->versionVerifies($package, $entry, $core)) {
            throw new RuntimeException(__('The signature on this package does not verify. Nothing was changed.'));
        }
    }

    /** @param  array<string, mixed>  $job */
    public function verifyInspected(array $job): void
    {
        if (! $this->nameAllowed((string) ($job['context']['store'] ?? ''), (string) $job['package'], (array) ($job['psr4'] ?? []))) {
            throw new RuntimeException(__('Only the default store may provide :package.', ['package' => (string) $job['package']]));
        }
    }

    /**
     * A zip someone uploaded. Recognised when a current catalog lists its hash or a sidecar
     * signature checks out today; otherwise it's unsigned, and allowed only when a super admin said so.
     *
     * @param  array<string, mixed>  $job
     */
    public function verifyUpload(array $job): void
    {
        $hash = (string) hash_file('sha256', (string) $job['zip']);
        $signed = false;
        $claims = null;

        foreach ($this->stores() as $store) {
            $payload = $this->payload($store['id']);

            foreach ((array) ($payload['items'] ?? []) as $item) {
                foreach ((array) ($item['versions'] ?? []) as $entry) {
                    if (strtolower((string) ($entry['sha256'] ?? '')) === $hash && $this->freshness($payload) !== 'expired' && $this->trust->store($store['id'])->versionVerifies((string) $item['package'], $entry, Cms::VERSION)) {
                        $this->refuseBlocked($payload, (string) $item['package'], (string) $entry['version']);
                        $signed = $store['id'];
                        $claims = ['package' => (string) $item['package'], 'version' => (string) $entry['version']];
                    }
                }
            }
        }

        if (! $signed && ! empty($job['context']['sig'])) {
            $sig = (array) $job['context']['sig'];
            $signed = $this->sidecarVerifies($sig, $hash) ? self::DEFAULT : false;
            $claims = $signed ? ['package' => (string) ($sig['package'] ?? ''), 'version' => (string) ($sig['version'] ?? '')] : null;
        }

        if (! $signed && empty($job['context']['allow_unsigned'])) {
            throw new RuntimeException(__('This package is not signed. Only a super admin can install it, and has to confirm.'), PackageJobs::UNSIGNED);
        }

        $saved = $this->jobs->status((string) $job['id']);
        $saved['source'] = ['store' => $signed ?: null, 'signed' => (bool) $signed];
        $saved['context']['signed'] = $signed;
        $saved['context']['claims'] = $claims;
        $this->jobs->saveJob($saved);
    }

    /** @param  array<string, mixed>  $job */
    public function verifyUploadInspected(array $job): void
    {
        $signed = $job['context']['signed'] ?? false;
        $store = $signed === self::DEFAULT ? self::DEFAULT : ($signed ?: '');
        $claims = $job['context']['claims'] ?? null;

        // What was signed is one name and version: a zip may not claim to be another.
        if (is_array($claims) && ($claims['package'] !== $job['package'] || $claims['version'] !== ($job['package_version'] ?? null))) {
            throw new RuntimeException(__('This zip is not the package its signature is for.'));
        }

        if (! $this->nameAllowed((string) $store, (string) $job['package'], (array) ($job['psr4'] ?? []))) {
            throw new RuntimeException(__('Only a signed package from the default store may use the name :package or the Cms namespace.', ['package' => (string) $job['package']]));
        }

        foreach ($this->stores() as $entry) {
            $this->refuseBlocked($this->payload($entry['id']), (string) $job['package'], (string) ($job['package_version'] ?? '0.0.0'));
        }
    }

    /**
     * Updates for packages this site got from a store, from that store and no other, and what the
     * store's blocklist says about what's installed. Never switches anything off.
     *
     * @return array{packages: list<array<string, mixed>>, advisories: list<array<string, mixed>>, unverified: list<string>}
     */
    public function updates(): array
    {
        $sources = $this->jobs->sources();
        $manager = $this->cms->packages();
        $packages = [];
        $advisories = [];
        $unverified = [];

        foreach ($manager->repository()->all() as $name => $manifest) {
            if ($manifest->core) {
                continue;
            }

            $record = $sources[$name] ?? null;
            $store = is_array($record) ? ($record['store'] ?? null) : null;

            if (! is_string($store) || ($store !== self::DEFAULT && ! isset($this->added()[$store]))) {
                $unverified[] = $name;
                $store = self::DEFAULT;
            }

            $payload = $this->payload($store);

            foreach ((array) ($payload['blocked'] ?? []) as $block) {
                if (($block['package'] ?? null) === $name && self::matches($manifest->version, (string) ($block['versions'] ?? ''))) {
                    $advisories[] = ['package' => $name, 'label' => $manifest->label, 'version' => $manifest->version, 'severity' => $block['severity'] ?? 'high', 'advisory' => $block['advisory'] ?? null];
                }
            }

            if (in_array($name, $unverified, true)) {
                continue;
            }

            $item = $this->find($payload, $name);
            $entry = $item ? $this->latestCompatible($item, $manifest->version) : null;

            if (! $item || ! $entry) {
                continue;
            }

            $gate = $this->gate($item, $entry, $store);
            $packages[] = [
                'package' => $name,
                'label' => $manifest->label,
                'installed' => $manifest->version,
                'version' => $entry['version'],
                'security' => (bool) ($entry['security'] ?? false),
                'store' => $store,
                'allowed' => $gate['allowed'],
                'message' => $gate['message'] ?? null,
                'buy_url' => $item['listing_url'] ?? null,
                'backup' => is_array($record) && ! empty($record['backup']) && is_dir((string) $record['backup']),
            ];
        }

        return ['packages' => $packages, 'advisories' => $advisories, 'unverified' => $unverified];
    }

    /**
     * Security versions of store packages update by themselves when that changes nothing else
     * about them. The next package to do that, if any.
     *
     * @return array{store: string, package: string, version: string}|null
     */
    public function nextSecurityUpdate(): ?array
    {
        if ($this->jobs->hostProblems() !== []) {
            return null;
        }

        foreach ($this->updates()['packages'] as $update) {
            if (! $update['security'] || ! $update['allowed'] || (int) explode('.', (string) $update['installed'])[0] !== (int) explode('.', (string) $update['version'])[0]) {
                continue;
            }

            $payload = $this->payload((string) $update['store']);
            $item = $this->find($payload, (string) $update['package']);
            $entry = $item ? $this->entry($item, (string) $update['version']) : null;
            $current = $item ? $this->entry($item, (string) $update['installed'], allowYanked: true) : null;
            $grew = array_diff((array) ($entry['capabilities'] ?? []), (array) ($current['capabilities'] ?? []));

            if ($this->freshness($payload) === 'ok' && $grew === []) {
                return ['store' => (string) $update['store'], 'package' => (string) $update['package'], 'version' => (string) $update['version']];
            }
        }

        return null;
    }

    /** @param  array<string, mixed>  $item  @param  array<string, mixed>  $entry  @return array<string, mixed> Whether this licence opens this version, and what to tell the store */
    public function gate(array $item, array $entry, string $store = self::DEFAULT): array
    {
        if (($item['pricing'] ?? 'free') === 'free') {
            return ['allowed' => true];
        }

        $license = app(LicenseService::class);
        $product = (string) $item['package'];
        $state = $license->itemFor($product, $store);
        $token = $license->token($store);
        $headers = $token ? ['X-Cms-License: '.$token] : [];
        $host = rawurlencode((string) $license->host()[0]);
        $security = (bool) ($entry['security'] ?? false);
        $buy = ['allowed' => false, 'reason' => $state['reason'], 'buy_url' => $item['listing_url'] ?? null];

        if ($state['reason'] === 'nonpublic') {
            // Paid plugins run free on a local or staging host, if its author lets them be fetched for that.
            return ($item['dev_download'] ?? false) === true
                ? ['allowed' => true, 'reason' => 'nonpublic', 'headers' => $headers, 'query' => "?use=nonpublic&site_host={$host}"]
                : [...$buy, 'message' => __('This paid package has no free download for local sites. Buy it, or upload a copy you own.')];
        }

        if (in_array($state['reason'], ['ok', 'window_over'], true)) {
            $covered = $state['upd'] === null || substr((string) ($entry['released_at'] ?? ''), 0, 10) <= $state['upd'];

            if ($covered || $security) {
                return ['allowed' => true, 'reason' => $state['reason'], 'headers' => $headers, 'query' => "?site_host={$host}"];
            }

            return [...$buy, 'reason' => 'updates_lapsed', 'message' => __('Updates for this package have lapsed. Extend the license to get this version.')];
        }

        // A security fix goes to anyone whose token ever named it; the store checks that.
        if ($security && $token) {
            return ['allowed' => true, 'reason' => 'security', 'headers' => $headers, 'query' => "?site_host={$host}"];
        }

        return [...$buy, 'message' => $security ? __('A security fix for this package needs its key. Add the key, or buy it.') : __('This is a paid plugin. Buy it, then add its key here.')];
    }

    /** Start an install from an uploaded zip. @return array<string, mixed> The job */
    public function installUpload(string $zip, ?array $sig, bool $allowUnsigned, bool $turnOn = true): array
    {
        return $this->jobs->start([
            'zip' => $zip,
            'verifier' => 'upload',
            'turn_on' => $turnOn,
            'context' => ['sig' => $sig, 'allow_unsigned' => $allowUnsigned],
        ]);
    }

    /** @param  array<string, mixed>  $payload  @return 'ok'|'stale'|'expired'|'clock'|'none' */
    public function freshness(array $payload): string
    {
        if ($payload === []) {
            return 'none';
        }

        $issued = (int) strtotime((string) ($payload['issued'] ?? ''));
        $expires = (int) strtotime((string) ($payload['expires'] ?? ''));

        return match (true) {
            $issued - $this->now() > self::FUTURE_TOLERANCE => 'clock',
            $this->now() - $expires > self::STALE_LIMIT => 'expired',
            $this->now() > $expires => 'stale',
            default => 'ok',
        };
    }

    /** @return array<string, mixed> */
    private function describe(string $id, array $item, array $payload): array
    {
        $installed = $this->cms->packages()->repository()->find((string) ($item['package'] ?? ''));
        $entry = $this->latestCompatible($item, null);
        $origin = self::origin((string) ($payload['store'] ?? ''));
        $icon = (string) ($item['icon'] ?? '');
        $gate = $entry ? $this->gate($item, $entry, $id) : ['allowed' => false];
        $blocked = $entry ? $this->blocked($payload, (string) $item['package'], (string) $entry['version']) : false;

        $action = match (true) {
            $blocked => 'blocked',
            ! $entry => 'incompatible',
            $installed && version_compare($installed->version, (string) $entry['version'], '>=') => 'installed',
            ! $gate['allowed'] => 'buy',
            $installed !== null => 'update',
            default => 'install',
        };

        return [
            'store' => $id,
            'package' => (string) $item['package'],
            'type' => (string) ($item['type'] ?? 'plugin'),
            'title' => mb_substr((string) ($item['title'] ?? $item['package']), 0, 120),
            'summary' => mb_substr((string) ($item['summary'] ?? ''), 0, 300),
            'icon' => self::origin($icon) === $origin ? $icon : null,
            'categories' => array_values(array_map('strval', (array) ($item['categories'] ?? []))),
            'pricing' => (string) ($item['pricing'] ?? 'free'),
            'first_party' => (bool) ($item['first_party'] ?? false),
            'author' => ['name' => (string) ($item['author']['name'] ?? ''), 'url' => (string) ($item['author']['url'] ?? '')],
            'listing_url' => self::origin((string) ($item['listing_url'] ?? '')) === $origin ? $item['listing_url'] : null,
            'latest' => $entry['version'] ?? null,
            'installed' => $installed?->version,
            'action' => $action,
            'access' => array_intersect_key($gate, array_flip(['allowed', 'reason', 'message', 'buy_url'])),
            'entry' => $entry,
        ];
    }

    /** @param  array<string, array<string, mixed>>  $steps  @param  list<string>  $path */
    private function resolve(string $id, array $payload, string $package, ?string $version, array &$steps, array $path): void
    {
        if (in_array($package, $path, true)) {
            throw new RuntimeException(__('These packages depend on each other in a circle: :packages.', ['packages' => implode(', ', [...$path, $package])]));
        }

        if (isset($steps[$package])) {
            return;
        }

        $item = $this->find($payload, $package);
        $entry = $item ? $this->entry($item, $version) : null;

        if (! $item || ! $entry) {
            throw new RuntimeException(__(':package is not in this store, or has no version for this site.', ['package' => $package]));
        }

        if (! $this->nameAllowed($id, $package)) {
            throw new RuntimeException(__('Only the default store may provide :package.', ['package' => $package]));
        }

        foreach ((array) ($entry['requires']['packages'] ?? []) as $dep => $constraint) {
            $have = $this->cms->packages()->repository()->find((string) $dep);

            if ($have) {
                if (! Semver::satisfies($have->version, (string) $constraint)) {
                    throw new RuntimeException(__(':package needs :dep :constraint, and this site has :have.', ['package' => $package, 'dep' => (string) $dep, 'constraint' => (string) $constraint, 'have' => $have->version]));
                }

                if (! $this->cms->packages()->isEnabled((string) $dep)) {
                    $steps[(string) $dep] = ['package' => (string) $dep, 'version' => $have->version, 'title' => $have->label, 'enable_only' => true, 'action' => 'enable'];
                }

                continue;
            }

            $depItem = $this->find($payload, (string) $dep);
            $match = $depItem ? $this->entryFor($depItem, (string) $constraint) : null;
            $this->resolve($id, $payload, (string) $dep, $match['version'] ?? null, $steps, [...$path, $package]);
        }

        $steps[$package] = ['package' => $package, 'version' => (string) $entry['version'], 'title' => (string) ($item['title'] ?? $package), 'enable_only' => false, 'action' => $this->cms->packages()->repository()->find($package) ? 'update' : 'install'];
    }

    /** @return array<string, mixed>|null */
    private function latestCompatible(array $item, ?string $above): ?array
    {
        $best = null;

        foreach ((array) ($item['versions'] ?? []) as $entry) {
            if (! is_array($entry) || ! $this->suitsHere($entry) || ($above !== null && version_compare((string) ($entry['version'] ?? '0'), $above, '<='))) {
                continue;
            }

            if ($this->isYanked($item, (string) ($entry['version'] ?? ''))) {
                continue;
            }

            if ($best === null || version_compare((string) $entry['version'], (string) $best['version'], '>')) {
                $best = $entry;
            }
        }

        return $best;
    }

    /** @return array<string, mixed>|null A version, or the newest that suits this site */
    private function entry(array $item, ?string $version, bool $allowYanked = false): ?array
    {
        if ($version === null) {
            return $this->latestCompatible($item, null);
        }

        foreach ((array) ($item['versions'] ?? []) as $entry) {
            if (($entry['version'] ?? null) === $version && ($allowYanked || (! $this->isYanked($item, $version) && $this->suitsHere($entry)))) {
                return $entry;
            }
        }

        return null;
    }

    /** @return array<string, mixed>|null The newest version meeting a constraint */
    private function entryFor(array $item, string $constraint): ?array
    {
        $best = null;

        foreach ((array) ($item['versions'] ?? []) as $entry) {
            if (self::matches((string) ($entry['version'] ?? ''), $constraint) && $this->suitsHere($entry) && ! $this->isYanked($item, (string) $entry['version']) && ($best === null || version_compare((string) $entry['version'], (string) $best['version'], '>'))) {
                $best = $entry;
            }
        }

        return $best;
    }

    /** @param  array<string, mixed>  $entry */
    private function suitsHere(array $entry): bool
    {
        $requires = (array) ($entry['requires'] ?? []);

        foreach ((array) ($requires['ext'] ?? []) as $ext) {
            if (! extension_loaded((string) $ext)) {
                return false;
            }
        }

        return (! isset($requires['core']) || self::matches(Cms::VERSION, (string) $requires['core']))
            && (! isset($requires['php']) || self::matches(PHP_VERSION, (string) $requires['php']));
    }

    private function isYanked(array $item, string $version): bool
    {
        foreach ($this->yanked as $yanked) {
            if (($yanked['package'] ?? null) === ($item['package'] ?? '') && ($yanked['version'] ?? null) === $version) {
                return true;
            }
        }

        return false;
    }

    private function blocked(array $payload, string $package, string $version): bool
    {
        foreach ((array) ($payload['blocked'] ?? []) as $block) {
            if (($block['package'] ?? null) === $package && self::matches($version, (string) ($block['versions'] ?? ''))) {
                return true;
            }
        }

        return false;
    }

    private function refuseBlocked(array $payload, string $package, string $version): void
    {
        if ($this->blocked($payload, $package, $version)) {
            throw new RuntimeException(__('This version of :package is blocked by the store for security reasons.', ['package' => $package]));
        }
    }

    /** The default store alone may provide the `cms/` vendor or the `Cms\` namespace: nothing else can replace a built-in. */
    private function nameAllowed(string $store, string $package, array $psr4 = []): bool
    {
        if ($store === self::DEFAULT) {
            return true;
        }

        if (str_starts_with($package, PackageManifest::VENDOR.'/')) {
            return false;
        }

        foreach ($psr4 as $prefix) {
            if (str_starts_with((string) $prefix, 'Cms\\')) {
                return false;
            }
        }

        return true;
    }

    /** @param  array<string, mixed>  $sig */
    private function sidecarVerifies(array $sig, string $hash): bool
    {
        $store = $this->trust->default();
        $trust = $store->current();
        $kid = (string) ($sig['key'] ?? '');
        $key = $trust?->key($kid, 'release');

        // Standalone it has no catalog vouching for it, so the key must be good today.
        if (! $key || $trust->revocation($kid) || ($key['not_after'] !== null && $this->now() > (int) strtotime($key['not_after'].' 23:59:59 UTC'))) {
            return false;
        }

        return strtolower((string) ($sig['sha256'] ?? '')) === $hash && PackageSignature::verify((string) ($sig['package'] ?? ''), $sig, $key['pub']);
    }

    private function requireFresh(array $payload): void
    {
        $freshness = $this->freshness($payload);

        if ($freshness === 'clock') {
            throw new RuntimeException(__("This server’s clock looks wrong. Installs are paused. The public site is not affected."));
        }

        if ($freshness === 'expired' || $freshness === 'none') {
            throw new RuntimeException(__("Can’t confirm this catalog is current. Refresh it, or upload the package by hand."));
        }
    }

    private function requireSameOrigin(array $payload, string $url): string
    {
        if (self::origin($url) !== self::origin((string) ($payload['store'] ?? ''))) {
            throw new RuntimeException(__('This download is not on the store’s own address.'));
        }

        return $url;
    }

    /** @return array<string, mixed> The verified catalog, or nothing */
    private function payload(string $id): array
    {
        $file = $this->catalogFile($id);

        if (! is_file($file)) {
            return [];
        }

        $payload = $this->trust->store($id)->openFeed((string) @file_get_contents($file), 'cms-catalog', $this->now())['payload'] ?? [];
        $this->yanked = (array) ($payload['yanked'] ?? []);

        return $payload;
    }

    /** @return array<string, mixed>|null */
    private function find(array $payload, string $package): ?array
    {
        foreach ((array) ($payload['items'] ?? []) as $item) {
            if (($item['package'] ?? null) === $package) {
                return $item;
            }
        }

        return null;
    }

    private function catalogUrl(string $id): ?string
    {
        if ($id !== self::DEFAULT) {
            return isset($this->added()[$id]) ? (string) $this->added()[$id]['catalog'] : null;
        }

        $override = trim(explode(',', (string) env('CMS_STORE_URLS', ''))[0]);

        if ($override !== '') {
            return str_ends_with($override, '.json') ? $override : rtrim($override, '/').'/api/store/v1/catalog.json';
        }

        return $this->trust->default()->current()?->endpoint('catalog');
    }

    /** @return array<string, array<string, string>> */
    private function added(): array
    {
        $file = $this->storesFile();

        return is_file($file) ? (array) (Yaml::read($file)['stores'] ?? []) : [];
    }

    private function storesFile(): string
    {
        return $this->app->siteConfigPath('stores.yaml');
    }

    private function catalogFile(string $id): string
    {
        return $this->app->storagePath('packages/catalog-'.preg_replace('/[^a-z0-9-]/', '', $id).'.json');
    }

    private static function matches(string $version, string $constraint): bool
    {
        try {
            return $constraint !== '' && Semver::satisfies($version, $constraint);
        } catch (Throwable) {
            return false;
        }
    }

    private static function origin(string $url): ?string
    {
        $parts = parse_url($url);

        return is_array($parts) && isset($parts['scheme'], $parts['host']) ? strtolower($parts['scheme'].'://'.$parts['host'].':'.($parts['port'] ?? '')) : null;
    }

    private function now(): int
    {
        return Carbon::now()->getTimestamp();
    }
}

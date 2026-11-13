<?php

declare(strict_types=1);

namespace Cms\Modules\Packages;

use Cms\Cms;
use Cms\Foundation\Application;
use Cms\Packages\PackageManifest;
use Cms\Packages\Install\PackageJobs;
use Cms\Support\Files;
use Cms\Support\Html\Sanitizer;
use Cms\Support\Remote;
use Cms\Trust\PackageSignature;
use Cms\Trust\TrustRegistry;
use Composer\Semver\Semver;
use Illuminate\Support\Carbon;
use RuntimeException;
use Throwable;

/**
 * Browses and installs from a store endpoint, on any site, with no store plugin in sight. A
 * store is a few static signed files: nothing here trusts the server, only the signatures.
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

    /** Fetch trust and the catalog. Anonymous: nothing about this site is sent. @return string|null What went wrong */
    public function refresh(): ?string
    {
        $store = $this->trust->default();

        try {
            $trust = $store->current();

            if (! $trust) {
                throw new RuntimeException($store->problem() === 'dev_trust' ? __('This build has no production signing keys yet, so it can’t trust a store.') : __('No trust file counts on this site.'));
            }

            $trustUrl = $trust->endpoint('trust');

            if (is_string($trustUrl) && $trustUrl !== '') {
                try {
                    $store->accept($this->remote->get($trustUrl, 1_000_000, 3));
                } catch (Throwable) {
                    // The catalog may still verify under the keys already known.
                }
            }

            $url = $this->catalogUrl();

            if (! $url) {
                throw new RuntimeException(__('No store address is known.'));
            }

            $json = $this->remote->get($url, 20_000_000, 5);

            if (! $store->openFeed($json, 'cms-catalog', $this->now())) {
                throw new RuntimeException(__('The catalog did not verify, or it is older than one seen before.'));
            }

            Files::put($this->catalogFile(), $json);

            return null;
        } catch (Throwable $e) {
            return mb_substr($e->getMessage(), 0, 300);
        }
    }

    /** @return array{items: list<array<string, mixed>>, freshness: string, problem: ?string, error: ?string} The catalog as this site sees it */
    public function catalog(bool $refresh = false): array
    {
        $error = null;

        if ($refresh || ! is_file($this->catalogFile())) {
            $error = $this->refresh();
        }

        $payload = $this->payload();
        $items = [];

        foreach ((array) ($payload['items'] ?? []) as $item) {
            // Delisted: no new installs, though whoever has it still gets its updates.
            if (empty($item['delisted']) || $this->cms->packages()->repository()->find((string) $item['package'])) {
                $items[] = $this->describe($item, $payload);
            }
        }

        return ['items' => $items, 'freshness' => $this->freshness($payload), 'problem' => $this->trust->default()->problem(), 'error' => $error];
    }

    /** The listing's detail. Unsigned and from another server: its HTML is cleaned here, and only the store's own images survive. */
    public function item(string $package): array
    {
        $payload = $this->payload();
        $item = $this->find($payload, $package);

        if (! $item) {
            throw new RuntimeException(__('That package is not in this store.'));
        }

        $described = $this->describe($item, $payload);
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
            // What each picture shows, from stores that say; older ones send addresses alone.
            'gallery' => array_values(array_filter(array_map(static fn ($s) => is_array($s) ? ['url' => (string) ($s['url'] ?? ''), 'alt' => mb_substr((string) ($s['alt'] ?? ''), 0, 300)] : ['url' => (string) $s, 'alt' => ''], (array) ($detail['gallery'] ?? $detail['screenshots'] ?? [])), static fn (array $s) => self::origin($s['url']) === $origin)),
            'requirements' => array_values(array_map(static fn ($r) => mb_substr((string) $r, 0, 200), array_slice((array) ($detail['requirements'] ?? []), 0, 20))),
            'docs_url' => self::link($detail['docs_url'] ?? null),
            // A site kit's live demo, on the store's own origin.
            'demo_url' => self::origin((string) ($detail['demo_url'] ?? '')) === $origin ? self::link($detail['demo_url']) : null,
            'repository_url' => self::link($detail['repository_url'] ?? null),
            'releases' => array_values(array_map(static fn ($r) => ['version' => mb_substr((string) ($r['version'] ?? ''), 0, 40), 'released_at' => mb_substr((string) ($r['released_at'] ?? ''), 0, 32), 'notes' => mb_substr((string) ($r['notes'] ?? ''), 0, 4000), 'security' => (bool) ($r['security'] ?? false)], array_filter(array_slice((array) ($detail['releases'] ?? []), 0, 20), 'is_array'))),
            'capabilities' => array_values(array_map('strval', (array) ($described['entry']['capabilities'] ?? []))),
            'requires' => (array) ($described['entry']['requires'] ?? []),
        ];
    }

    /**
     * What installing a package means: its dependencies in order, what it may do, what it needs.
     * Refused with the reason when it can't work out.
     *
     * @return array{steps: list<array{package: string, version: string, title: string, enable_only: bool, action: string}>, capabilities: list<string>}
     */
    public function plan(string $package, ?string $version = null): array
    {
        $payload = $this->payload();
        $steps = [];
        $this->resolve($payload, $package, $version, $steps, []);

        $main = $this->find($payload, $package);
        $entry = $main ? $this->entry($main, $version) : null;

        return [
            'steps' => array_values($steps),
            'capabilities' => array_values(array_map('strval', (array) ($entry['capabilities'] ?? []))),
        ];
    }

    /** Start an install from the store. @return array<string, mixed> The job */
    public function install(string $package, ?string $version, bool $turnOn = true): array
    {
        $payload = $this->payload();
        $this->requireFresh($payload);
        $item = $this->find($payload, $package);
        $entry = $item ? $this->entry($item, $version) : null;

        if (! $item || ! $entry) {
            throw new RuntimeException(__('That version is not in this store.'));
        }

        $this->refuseBlocked($payload, $package, (string) $entry['version']);

        return $this->jobs->start([
            'package' => $package,
            'version' => (string) $entry['version'],
            'url' => $this->requireSameOrigin($payload, (string) $entry['url']),
            'size' => (int) ($entry['size'] ?? 0),
            'sha256' => (string) $entry['sha256'],
            'verifier' => 'store',
            'turn_on' => $turnOn,
            'context' => ['entry' => $entry],
            'source' => ['store' => self::DEFAULT, 'signed' => true],
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
        $entry = (array) $job['context']['entry'];
        $package = (string) $job['package'];
        $hash = @hash_file('sha256', (string) $job['zip']);

        if (! $hash || ! hash_equals(strtolower((string) $entry['sha256']), $hash)) {
            throw new RuntimeException(__('The download is damaged, or not what the store listed. Nothing was changed.'));
        }

        $payload = $this->payload();
        $current = $this->find($payload, $package);
        $listed = $current ? $this->entry($current, (string) $entry['version'], allowYanked: true) : null;

        if (! $listed || ($listed['sig'] ?? null) !== ($entry['sig'] ?? null)) {
            throw new RuntimeException(__('The store no longer lists this version. Nothing was changed.'));
        }

        $this->refuseBlocked($payload, $package, (string) $entry['version']);

        $core = Cms::VERSION;

        if (! $this->trust->default()->versionVerifies($package, $entry, $core)) {
            throw new RuntimeException(__('The signature on this package does not verify. Nothing was changed.'));
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

        $payload = $this->payload();

        foreach ((array) ($payload['items'] ?? []) as $item) {
            foreach ((array) ($item['versions'] ?? []) as $entry) {
                if (strtolower((string) ($entry['sha256'] ?? '')) === $hash && $this->freshness($payload) !== 'expired' && $this->trust->default()->versionVerifies((string) $item['package'], $entry, Cms::VERSION)) {
                    $this->refuseBlocked($payload, (string) $item['package'], (string) $entry['version']);
                    $signed = self::DEFAULT;
                    $claims = ['package' => (string) $item['package'], 'version' => (string) $entry['version']];
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
        $signed = ($job['context']['signed'] ?? false) === self::DEFAULT;
        $claims = $job['context']['claims'] ?? null;

        // What was signed is one name and version: a zip may not claim to be another.
        if (is_array($claims) && ($claims['package'] !== $job['package'] || $claims['version'] !== ($job['package_version'] ?? null))) {
            throw new RuntimeException(__('This zip is not the package its signature is for.'));
        }

        if (! $this->nameAllowed($signed, (string) $job['package'], (array) ($job['psr4'] ?? []))) {
            throw new RuntimeException(__('Only a signed package from the default store may use the name :package or the Cms namespace.', ['package' => (string) $job['package']]));
        }

        $this->refuseBlocked($this->payload(), (string) $job['package'], (string) ($job['package_version'] ?? '0.0.0'));
    }

    /**
     * Updates for packages this site got from a store, from that store and no other, and what the
     * store's blocklist says about what's installed. Never switches anything off.
     *
     * @return array{packages: list<array<string, mixed>>, advisories: list<array<string, mixed>>, unverified: list<string>}
     */
    public function updates(): array
    {
        $payload = $this->payload();
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

            if ($store !== self::DEFAULT) {
                $unverified[] = $name;
            }

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

            $packages[] = [
                'package' => $name,
                'label' => $manifest->label,
                'installed' => $manifest->version,
                'version' => $entry['version'],
                'security' => (bool) ($entry['security'] ?? false),
                'backup' => is_array($record) && ! empty($record['backup']) && is_dir((string) $record['backup']),
            ];
        }

        return ['packages' => $packages, 'advisories' => $advisories, 'unverified' => $unverified];
    }

    /**
     * Security versions of store packages update by themselves when that changes nothing else
     * about them. The next package to do that, if any.
     *
     * @return array{package: string, version: string}|null
     */
    public function nextSecurityUpdate(): ?array
    {
        if ($this->jobs->hostProblems() !== []) {
            return null;
        }

        foreach ($this->updates()['packages'] as $update) {
            if (! $update['security'] || (int) explode('.', (string) $update['installed'])[0] !== (int) explode('.', (string) $update['version'])[0]) {
                continue;
            }

            $payload = $this->payload();
            $item = $this->find($payload, (string) $update['package']);
            $entry = $item ? $this->entry($item, (string) $update['version']) : null;
            $current = $item ? $this->entry($item, (string) $update['installed'], allowYanked: true) : null;
            $grew = array_diff((array) ($entry['capabilities'] ?? []), (array) ($current['capabilities'] ?? []));

            if ($this->freshness($payload) === 'ok' && $grew === []) {
                return ['package' => (string) $update['package'], 'version' => (string) $update['version']];
            }
        }

        return null;
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
    private function describe(array $item, array $payload): array
    {
        $installed = $this->installedVersion($item);
        $local = $installed !== null ? $this->cms->packages()->repository()->find((string) ($item['package'] ?? '')) : null;
        $own = $local !== null ? PackageAbilities::words($local) : null;
        $entry = $this->latestCompatible($item, null);
        $origin = self::origin((string) ($payload['store'] ?? ''));
        $icon = (string) ($item['icon'] ?? '');
        $blocked = $entry ? $this->blocked($payload, (string) $item['package'], (string) $entry['version']) : false;

        $action = match (true) {
            $blocked => 'blocked',
            ! $entry => 'incompatible',
            $installed !== null && version_compare($installed, (string) $entry['version'], '>=') => 'installed',
            $installed !== null => 'update',
            default => 'install',
        };

        return [
            'package' => (string) $item['package'],
            'type' => (string) ($item['type'] ?? 'plugin'),
            // A plugin this site has is named and described as Installed names it: its own words, in the admin's language.
            'title' => mb_substr($own['label'] ?? (string) ($item['title'] ?? $item['package']), 0, 120),
            'summary' => mb_substr($own['description'] ?? (string) ($item['summary'] ?? ''), 0, 300),
            'icon' => self::origin($icon) === $origin ? $icon : null,
            // A site kit's picture of itself, from the store's own origin like the icon.
            'preview' => is_string($item['preview'] ?? null) && self::origin($item['preview']) === $origin ? $item['preview'] : null,
            // A name from the icon set the admin draws, not a picture: nothing to fetch.
            'glyph' => preg_match('/^[a-z0-9-]{1,60}$/', (string) ($item['glyph'] ?? '')) === 1 ? (string) $item['glyph'] : null,
            'featured' => (bool) ($item['featured'] ?? false),
            'categories' => array_values(array_map('strval', (array) ($item['categories'] ?? []))),
            'first_party' => (bool) ($item['first_party'] ?? false),
            'author' => ['name' => (string) ($item['author']['name'] ?? ''), 'url' => (string) ($item['author']['url'] ?? '')],
            'listing_url' => self::origin((string) ($item['listing_url'] ?? '')) === $origin ? $item['listing_url'] : null,
            'latest' => $entry['version'] ?? null,
            'installed' => $installed,
            'action' => $action,
            'entry' => $entry,
        ];
    }

    /** The version of a listed package this site has: a plugin's, or a site kit's in kits/ (the store lists both). */
    private function installedVersion(array $item): ?string
    {
        $package = (string) ($item['package'] ?? '');

        if (($item['type'] ?? 'plugin') !== 'kit') {
            return $this->cms->packages()->repository()->find($package)?->version;
        }

        $kit = Files::readJson($this->jobs->targetFor($package, PackageManifest::KIT).'/kit.json');

        return is_string($kit['version'] ?? null) ? $kit['version'] : null;
    }

    /** @param  array<string, array<string, mixed>>  $steps  @param  list<string>  $path */
    private function resolve(array $payload, string $package, ?string $version, array &$steps, array $path): void
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
            $this->resolve($payload, (string) $dep, $match['version'] ?? null, $steps, [...$path, $package]);
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

    /** The default store alone may provide the `letterncms/` vendor or the `Cms\` namespace: nothing else can pass for first-party. */
    private function nameAllowed(bool $signed, string $package, array $psr4 = []): bool
    {
        if ($signed) {
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

    /** Whether a store's catalog, as last fetched, lists this package. Never asks the store: a list of plugins can't wait on it. */
    public function lists(string $package): bool
    {
        try {
            return $this->find($this->payload(), $package) !== null;
        } catch (\Throwable) {
            return false;
        }
    }

    private function payload(): array
    {
        $file = $this->catalogFile();

        if (! is_file($file)) {
            return [];
        }

        $payload = $this->trust->default()->openFeed((string) @file_get_contents($file), 'cms-catalog', $this->now())['payload'] ?? [];
        $this->yanked = (array) ($payload['yanked'] ?? []);

        if (isset($payload['items'])) {
            // Catalogs cached before the store became free-only may still include paid listings.
            $payload['items'] = array_values(array_filter((array) $payload['items'], static fn ($item) => is_array($item) && ($item['pricing'] ?? 'free') === 'free'));
        }

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

    public function catalogUrl(): ?string
    {
        $override = $this->app->environment(['local', 'testing']) ? trim((string) env('CMS_STORE_URL', '')) : '';

        if ($override !== '') {
            return str_ends_with($override, '.json') ? $override : rtrim($override, '/').'/api/store/v1/catalog.json';
        }

        return $this->trust->default()->current()?->endpoint('catalog');
    }

    private function catalogFile(): string
    {
        return $this->app->storagePath('packages/catalog-default.json');
    }

    private static function matches(string $version, string $constraint): bool
    {
        try {
            return $constraint !== '' && Semver::satisfies($version, $constraint);
        } catch (Throwable) {
            return false;
        }
    }

    /** A web address to open in a new tab, or nothing. */
    private static function link(mixed $url): ?string
    {
        $url = (string) $url;

        return preg_match('#^https?://[^\s"<>]+$#', $url) === 1 ? mb_substr($url, 0, 500) : null;
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

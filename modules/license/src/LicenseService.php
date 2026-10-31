<?php

declare(strict_types=1);

namespace Cms\Modules\License;

use Cms\Cms;
use Cms\Foundation\Application;
use Cms\Modules\License\Host\HostClass;
use Cms\Modules\License\Host\HostClassifier;
use Cms\Modules\License\Report\Evaluator;
use Cms\Modules\License\Report\LicenseReport;
use Cms\Modules\License\Store\TokenStore;
use Cms\Modules\License\Token\Claims;
use Cms\Modules\License\Token\Paseto;
use Cms\Packages\Install\PackageJobs;
use Cms\Packages\PackageManifest;
use Cms\Support\Remote;
use Cms\Trust\TrustFile;
use Cms\Trust\TrustRegistry;
use Illuminate\Support\Carbon;
use RuntimeException;
use Throwable;

/**
 * The licence state of this site's paid plugins, computed only where it is shown: the admin
 * manifest, the `license/*` abilities and the `license:*` commands. A public request never loads
 * this class, and every failure in here comes out as "unknown", which does nothing.
 */
final class LicenseService
{
    private ?LicenseReport $report = null;

    public function __construct(
        private readonly Application $app,
        private readonly Cms $cms,
        private readonly TrustRegistry $trust,
        private readonly Remote $remote,
    ) {}

    public function tokens(): TokenStore
    {
        return new TokenStore($this->app->sitePath(), $this->app->storagePath());
    }

    public function report(bool $fresh = false): LicenseReport
    {
        if ($this->report && ! $fresh) {
            return $this->report;
        }

        try {
            return $this->report = $this->compute();
        } catch (Throwable $e) {
            report($e);

            return $this->report = LicenseReport::unknown();
        }
    }

    /**
     * A package's licence state, for admin code. On any other path it answers UNKNOWN without
     * touching a file: there is nothing a plugin could branch its public output on.
     */
    public function state(string $package): string
    {
        $admin = $this->app->runningInConsole() || request()->is('admin', 'admin/*', 'api/admin/*');

        return $admin && $this->report ? ($this->report->items[$package]['reason'] ?? 'UNKNOWN') : 'UNKNOWN';
    }

    /**
     * What this site's licence says about a product that may not be installed yet: the store asks
     * before it offers a paid package. Same rules, same evaluator.
     *
     * @return array{edition: ?string, status: ?string, level: int, reason: string, upd: ?string, trm: ?string}
     */
    public function itemFor(string $product, string $issuer = 'default'): array
    {
        return $this->evaluate($issuer, [$product => ['major_released' => null]])->items[$product];
    }

    /** The current token, sent to a store when it asks for proof of a paid download. */
    public function token(string $issuer = 'default'): ?string
    {
        $best = null;
        $rev = -1;

        foreach ($this->tokens()->tokens($issuer) as $token) {
            $claims = $this->verified($token, $issuer);

            if ($claims && $claims->rev > $rev) {
                [$best, $rev] = [$token, $claims->rev];
            }
        }

        return $best;
    }

    /** Whether the admin should ask for a refresh in the background. */
    public function refreshDue(): bool
    {
        try {
            [$host, $port] = $this->host();

            if (filter_var(env('CMS_LICENSE_OFFLINE', false), FILTER_VALIDATE_BOOLEAN) || (new HostClassifier)->classify($host, $port) === HostClass::Nonpublic) {
                return false;
            }

            $store = $this->tokens();

            foreach (array_keys($this->issuers()) as $issuer) {
                if ($store->tokens($issuer) !== [] && Carbon::now()->getTimestamp() - (int) ($store->state($issuer)['last_attempt'] ?? 0) >= 86_400) {
                    return true;
                }
            }

            return false;
        } catch (Throwable) {
            return false;
        }
    }

    /**
     * Ask each issuer for a current token. Slow, down or gone changes nothing but a line in the
     * state file, and what comes back counts only if it verifies for the same licence.
     *
     * @return 'skipped'|'failed'|'unchanged'|'updated'
     */
    public function refresh(bool $force = false): string
    {
        if (! $force && ! $this->refreshDue()) {
            return 'skipped';
        }

        if (filter_var(env('CMS_LICENSE_OFFLINE', false), FILTER_VALIDATE_BOOLEAN)) {
            return 'skipped';
        }

        $result = 'skipped';

        foreach (array_keys($this->issuers()) as $issuer) {
            $answer = $this->refreshIssuer($issuer);
            $result = $result === 'skipped' ? $answer : $result;
        }

        return $result;
    }

    /** @return 'skipped'|'failed'|'unchanged'|'updated' */
    private function refreshIssuer(string $issuer): string
    {
        $store = $this->tokens();
        $now = Carbon::now()->getTimestamp();
        $tokens = $store->tokens($issuer);
        $current = $this->currentClaims($tokens);

        if (! $current) {
            return 'skipped';
        }

        $store->saveState(['last_attempt' => $now], $issuer);

        try {
            $this->fetchTrustIfNeeded($tokens, $issuer);
            $url = (string) (($issuer === 'default' ? env('CMS_LICENSE_URL') : null) ?: $this->issuers()[$issuer]['url']);

            if ($url === '') {
                throw new RuntimeException('No licence server is known.');
            }

            [$host] = $this->host();
            $site = (string) ($this->cms->site('url') ?: 'https://'.$host);
            $answer = $this->remote->postJson(rtrim($url, '/').'/refresh', [
                'lid' => $current->lid,
                'rev' => $current->rev,
                'url' => $site,
                'client' => ['cms_version' => Cms::VERSION, 'php_version' => PHP_VERSION],
                // Proof this site holds the licence: an id alone gets nobody a key.
                'token' => $this->token($issuer) ?? $tokens[0],
            ], 3);

            $token = $answer['status'] === 200 ? (json_decode($answer['body'], true)['token'] ?? null) : null;
            $claims = is_string($token) ? $this->verified($token, $issuer) : null;

            if (! $claims || $claims->lid !== $current->lid || $claims->rev < $current->rev) {
                throw new RuntimeException($answer['status'] === 200 ? 'The answer did not verify.' : 'The licence server answered '.$answer['status'].'.');
            }
        } catch (Throwable $e) {
            $state = $store->state($issuer);
            $store->saveState(['failing_since' => $state['failing_since'] ?? $now, 'error' => mb_substr($e->getMessage(), 0, 200)], $issuer);

            return 'failed';
        }

        $store->remember($token, $claims->rev > $current->rev, $issuer);
        // The signing time is trusted server time: a term's end uses it over a wrong local clock.
        $store->saveState(['offset' => $claims->iat - $now, 'failing_since' => null, 'error' => null, 'last_success' => $now], $issuer);
        $this->report = null;

        return $claims->rev > $current->rev ? 'updated' : 'unchanged';
    }

    /** Put a token in place. Refuses what is plainly not a key; a key this copy can't check yet is accepted and shown as such. */
    public function install(string $token): LicenseReport
    {
        $token = trim($token);
        $parts = Paseto::parse($token);
        $footer = $parts ? json_decode($parts['footer'], true) : null;
        $kid = is_array($footer) ? ($footer['kid'] ?? null) : null;

        if (! is_string($kid)) {
            throw new RuntimeException(__('That is not a valid key. It starts with v4.public.'));
        }

        $issuers = $this->issuers();
        $issuer = 'default';

        // A key from another issuer belongs with that issuer, under its own trust.
        foreach ($issuers as $id => $candidate) {
            if ($candidate['trust']?->key($kid, 'license')) {
                $issuer = $id;

                break;
            }
        }

        if ($issuers[$issuer]['trust']?->key($kid, 'license') && ! $this->verified($token, $issuer)) {
            throw new RuntimeException(__('This key does not verify. Copy it again from your account.'));
        }

        $this->tokens()->install($token, $issuer);
        $this->report = null;

        return $this->report();
    }

    public function clear(): LicenseReport
    {
        foreach (array_keys($this->issuers()) as $issuer) {
            $this->tokens()->clear($issuer);
        }

        $this->report = null;

        return $this->report();
    }

    /** @return array{0: string, 1: ?int} The configured URL decides: spoofing Host can only change a banner. */
    public function host(): array
    {
        $configured = (string) ($this->cms->site('url') ?? '');
        $parts = $configured !== '' ? parse_url($configured) : null;

        if (is_array($parts) && isset($parts['host'])) {
            return [(string) $parts['host'], isset($parts['port']) ? (int) $parts['port'] : null];
        }

        $request = request();
        $port = $request->getPort();

        return [(string) $request->getHost(), in_array($port, [80, 443], true) ? null : $port];
    }

    private function compute(): LicenseReport
    {
        $sources = app(PackageJobs::class)->sources();
        $groups = [];

        foreach (LicenseModule::paidPlugins($this->cms) as $package) {
            $license = (array) $package->extra['license'];
            $source = $sources[$package->name]['store'] ?? null;
            // Bought from a store this site added: that store's licence and that store's keys.
            $added = is_string($source) && in_array($source, $this->trust->added(), true) ? $source : 'default';
            $id = is_array($license['issuer'] ?? null) ? self::issuerId($package) : $added;
            $groups[$id][(string) ($license['product'] ?? $package->name)] = ['major_released' => isset($license['major_released']) ? (string) $license['major_released'] : null];
        }

        if ($groups === []) {
            [$host, $port] = $this->host();

            return new LicenseReport(HostClassifier::normalize($host), (new HostClassifier)->classify($host, $port), 'none', null, 0, []);
        }

        $reports = array_map(fn (string $id) => $this->evaluate($id, $groups[$id]), array_keys($groups));

        // Each issuer's token stands alone, so what the screen says about "this licence" is the first one that exists.
        $main = array_values(array_filter($reports, static fn (LicenseReport $r) => $r->token !== 'none'))[0] ?? $reports[0];

        return new LicenseReport($main->host, $main->class, $main->token, $main->lid, max(array_map(static fn (LicenseReport $r) => $r->level, $reports)), array_merge(...array_map(static fn (LicenseReport $r) => $r->items, $reports)), array_values(array_unique(array_merge(...array_map(static fn (LicenseReport $r) => $r->notes, $reports)))), $main->domains, $main->rev);
    }

    /** @param  array<string, array{major_released: ?string}>  $packages */
    private function evaluate(string $issuer, array $packages): LicenseReport
    {
        [$host, $port] = $this->host();
        $store = $this->tokens();
        $state = $store->state($issuer);
        $from = $this->issuers()[$issuer] ?? ['trust' => null, 'family' => '', 'checked' => null];

        return (new Evaluator)->evaluate([
            'host' => $host,
            'port' => $port,
            'packages' => $packages,
            'tokens' => $store->tokens($issuer),
            'trust' => $from['trust'],
            'family' => $from['family'],
            'trust_checked_at' => $from['checked'],
            'now' => Carbon::now()->getTimestamp(),
            'offset' => (int) ($state['offset'] ?? 0),
            'refresh_failing_since' => isset($state['failing_since']) ? (int) $state['failing_since'] : null,
        ]);
    }

    /**
     * Who can sign a licence here: the store, any store this site added, and any seller a paid
     * plugin names in its own manifest, which ships its own trust file and needs no store at all.
     *
     * @return array<string, array{trust: ?TrustFile, family: string, url: string, checked: ?int}>
     */
    private function issuers(): array
    {
        $issuers = [];

        foreach (['default', ...$this->trust->added()] as $id) {
            $store = $this->trust->store($id);
            $trust = $store->current();
            $issuers[$id] = ['trust' => $trust, 'family' => $trust?->licenseFamily() ?? '', 'url' => (string) $trust?->endpoint('license'), 'checked' => $store->lastChecked()];
        }

        foreach (LicenseModule::paidPlugins($this->cms) as $package) {
            $issuer = ((array) $package->extra['license'])['issuer'] ?? null;

            if (is_array($issuer)) {
                $issuers[self::issuerId($package)] = ['trust' => self::issuerTrust($package, (string) ($issuer['trust'] ?? '')), 'family' => (string) ($issuer['family'] ?? ''), 'url' => (string) ($issuer['refresh'] ?? ''), 'checked' => Carbon::now()->getTimestamp()];
            }
        }

        return $issuers;
    }

    private static function issuerId(PackageManifest $package): string
    {
        return (string) (((array) $package->extra['license'])['issuer']['id'] ?? $package->name);
    }

    private static function issuerTrust(PackageManifest $package, string $file): ?TrustFile
    {
        $path = $file !== '' ? $package->path($file) : null;

        return $path && is_file($path) ? TrustFile::selfSigned((string) @file_get_contents($path)) : null;
    }

    /** @param  list<string>  $tokens  The licence and revision to ask about, signature aside: the answer gets checked. */
    private function currentClaims(array $tokens): ?Claims
    {
        $best = null;

        foreach ($tokens as $token) {
            $parts = Paseto::parse($token);
            $claims = $parts ? Claims::parse($parts['message']) : null;

            if ($claims && (! $best || ($claims->lid === $best->lid && $claims->rev > $best->rev))) {
                $best = $claims;
            }
        }

        return $best;
    }

    private function verified(string $token, string $issuer = 'default'): ?Claims
    {
        $from = $this->issuers()[$issuer] ?? null;
        $parts = Paseto::parse($token);
        $footer = $parts ? json_decode($parts['footer'], true) : null;
        $key = is_array($footer) && is_string($footer['kid'] ?? null) ? $from['trust']?->key($footer['kid'], 'license') : null;

        if (! $key || ! Paseto::verify($parts, 'cms-license:1:'.$from['family'], $key['pub'])) {
            return null;
        }

        return Claims::parse($parts['message']);
    }

    /** @param  list<string>  $tokens  A token naming a key this copy doesn't know: perhaps the store's trust file has moved on. */
    private function fetchTrustIfNeeded(array $tokens, string $issuer = 'default'): void
    {
        // A seller named in a plugin's manifest ships its trust file with the plugin.
        if ($issuer !== 'default' && ! in_array($issuer, $this->trust->added(), true)) {
            return;
        }

        $store = $this->trust->store($issuer);
        $trust = $store->current();

        foreach ($tokens as $token) {
            $parts = Paseto::parse($token);
            $footer = $parts ? json_decode($parts['footer'], true) : null;

            if (is_array($footer) && is_string($footer['kid'] ?? null) && ! $trust?->knows($footer['kid'])) {
                $url = $trust?->endpoint('trust');

                if ($url) {
                    $store->accept($this->remote->get($url, 1_000_000, 3));
                    $store->checkedNow();
                }

                return;
            }
        }
    }
}

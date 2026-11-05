<?php

declare(strict_types=1);

namespace Cms\Update;

use Cms\Cms;
use Cms\Foundation\Application;
use Cms\Support\Files;
use Cms\Support\Remote;
use Cms\Trust\TrustRegistry;
use Composer\Semver\Semver;
use Illuminate\Support\Carbon;
use Throwable;

/**
 * The signed list of releases. Checking is an anonymous GET of a static file that sends nothing
 * but a User-Agent; everything is decided here, on this site. What was fetched last is kept
 * and verified again each time it's read.
 */
class ReleaseFeed
{
    public const string PRODUCT = 'letterncms/cms';

    private const int CHECK_EVERY = 12 * 3600;

    private const int FUTURE_TOLERANCE = 48 * 3600;

    private const int STALE_LIMIT = 14 * 86_400;

    public function __construct(
        private readonly Application $app,
        private readonly TrustRegistry $trust,
        private readonly Remote $remote,
    ) {}

    public function due(): bool
    {
        return filter_var(env('CMS_UPDATE_CHECK', true), FILTER_VALIDATE_BOOLEAN)
            && $this->now() - (int) (self::read($this->stateFile())['checked_at'] ?? 0) >= self::CHECK_EVERY;
    }

    /** Fetch trust and the feed. Fails quietly: the last good feed still stands. */
    public function check(): ?string
    {
        $store = $this->trust->default();
        $state = self::read($this->stateFile());
        $state['checked_at'] = $this->now();

        try {
            $trust = $store->current();

            if (! $trust) {
                throw new \RuntimeException('No trust file counts on this site.');
            }

            if ($url = $trust->endpoint('trust')) {
                try {
                    $store->accept($this->remote->get($url, 1_000_000, 3));
                    $store->checkedNow();
                } catch (Throwable) {
                    // The feed may still be reachable, and signed under keys we know.
                }
            }

            $url = (string) (env('CMS_UPDATE_URL') ?: $store->current()?->endpoint('updates'));

            if ($url === '') {
                throw new \RuntimeException('No update address is known.');
            }

            $json = $this->remote->get($url, 5_000_000, 3);

            if (! $store->openFeed($json, 'cms-updates', $this->now())) {
                throw new \RuntimeException('The update list did not verify, or it is older than one seen before.');
            }

            Files::put($this->feedFile(), $json);
            unset($state['error']);
            $this->save($state);

            return null;
        } catch (Throwable $e) {
            $state['error'] = mb_substr($e->getMessage(), 0, 200);
            $this->save($state);

            return $state['error'];
        }
    }

    /** @return array<string, mixed>|null The verified feed */
    public function feed(): ?array
    {
        $file = $this->feedFile();

        if (! is_file($file)) {
            return null;
        }

        return $this->trust->default()->openFeed((string) @file_get_contents($file), 'cms-updates', $this->now())['payload'] ?? null;
    }

    /** @return 'ok'|'stale'|'expired'|'clock'|'none' Whether the feed is current enough to install from */
    public function freshness(): string
    {
        $feed = $this->feed();

        if (! $feed) {
            return 'none';
        }

        $issued = (int) strtotime((string) ($feed['issued'] ?? ''));
        $expires = (int) strtotime((string) ($feed['expires'] ?? ''));

        return match (true) {
            $issued - $this->now() > self::FUTURE_TOLERANCE => 'clock',
            $this->now() - $expires > self::STALE_LIMIT => 'expired',
            $this->now() > $expires => 'stale',
            default => 'ok',
        };
    }

    /**
     * The release to offer: the highest in this major that isn't yanked, or the same for the next
     * major. Never lower than what runs.
     *
     * @return array<string, mixed>|null
     */
    public function latest(string $current, bool $sameMajor = true): ?array
    {
        $major = (int) explode('.', $current)[0];
        $best = null;

        foreach ($this->releases() as $release) {
            $version = (string) ($release['version'] ?? '');

            if (version_compare($version, $current, '<=') || ($sameMajor && (int) explode('.', $version)[0] !== $major)) {
                continue;
            }

            if ($best === null || version_compare($version, (string) $best['version'], '>')) {
                $best = $release;
            }
        }

        return $best;
    }

    /** @return array<string, mixed>|null */
    public function find(string $version): ?array
    {
        foreach ($this->releases() as $release) {
            if (($release['version'] ?? null) === $version) {
                return $release;
            }
        }

        return null;
    }

    /** @return list<array<string, mixed>> Releases that verify and aren't yanked */
    public function releases(): array
    {
        $feed = $this->feed();

        if (! $feed || ($feed['product'] ?? null) !== self::PRODUCT) {
            return [];
        }

        $yanked = array_column((array) ($feed['yanked'] ?? []), 'version');
        $store = $this->trust->default();

        return array_values(array_filter((array) ($feed['releases'] ?? []), fn ($release) => is_array($release)
            && ! in_array($release['version'] ?? null, $yanked, true)
            && $store->versionVerifies(self::PRODUCT, ['first_party' => true, ...$release], Cms::VERSION)));
    }

    /** @return string|null Why the installed version was withdrawn */
    public function yankedReason(string $version): ?string
    {
        foreach ((array) ($this->feed()['yanked'] ?? []) as $yanked) {
            if (($yanked['version'] ?? null) === $version) {
                return (string) ($yanked['reason'] ?? '');
            }
        }

        return null;
    }

    /** @return array{major: int, until: string, latest?: string}|null This major's support, when it has ended */
    public function supportEnded(string $version): ?array
    {
        $major = (int) explode('.', $version)[0];

        foreach ((array) ($this->feed()['support'] ?? []) as $support) {
            if ((int) ($support['major'] ?? -1) === $major && isset($support['until']) && gmdate('Y-m') > (string) $support['until']) {
                return $support;
            }
        }

        return null;
    }

    /** @param  array<string, mixed>  $release  @return list<string> What this host lacks */
    public function hostProblems(array $release): array
    {
        $problems = [];
        $php = (string) ($release['requires']['php'] ?? '');

        if ($php !== '' && ! Semver::satisfies(PHP_VERSION, $php)) {
            $problems[] = "PHP {$php}";
        }

        foreach ((array) ($release['requires']['ext'] ?? []) as $ext) {
            if (! extension_loaded((string) $ext)) {
                $problems[] = "ext-{$ext}";
            }
        }

        return $problems;
    }

    /** @return array<string, mixed> */
    public function state(): array
    {
        return self::read($this->stateFile());
    }

    private function now(): int
    {
        return Carbon::now()->getTimestamp();
    }

    private function feedFile(): string
    {
        return $this->app->storagePath('update/releases.json');
    }

    private function stateFile(): string
    {
        return $this->app->storagePath('update/check.json');
    }

    /** @param  array<string, mixed>  $state */
    private function save(array $state): void
    {
        try {
            Files::putJson($this->stateFile(), $state, JSON_UNESCAPED_SLASHES);
        } catch (Throwable) {
        }
    }

    /** @return array<string, mixed> */
    private static function read(string $file): array
    {
        return Files::readJson($file);
    }
}

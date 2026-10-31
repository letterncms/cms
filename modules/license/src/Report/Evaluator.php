<?php

declare(strict_types=1);

namespace Cms\Modules\License\Report;

use Cms\Modules\License\Host\HostClass;
use Cms\Modules\License\Host\HostClassifier;
use Cms\Modules\License\Host\HostMatcher;
use Cms\Modules\License\Token\Claims;
use Cms\Modules\License\Token\Paseto;
use Cms\Support\Crypto\Ed25519;
use Cms\Trust\TrustFile;

/**
 * Turns a host, a token and the trust file into a report on some paid plugins: pure, with every
 * outside fact passed in. Levels are all this produces, and the most a level does is a banner
 * in the admin.
 *
 * No clock decides a use right: whether a major is covered compares two fixed dates. Only
 * "window over" and a term's end read the time, and those only change a line or a banner.
 */
final class Evaluator
{
    private const int FUTURE_TOLERANCE = 172_800; // 48 hours

    private const int TRUST_FRESH = 14 * 86_400;

    public function __construct(private readonly HostClassifier $classifier = new HostClassifier) {}

    /**
     * @param  array{
     *   host: string, port: ?int,
     *   packages: array<string, array{major_released: ?string}>,
     *   tokens: list<string>, trust: ?TrustFile, family: string, trust_checked_at: ?int,
     *   now: int, offset: int, refresh_failing_since: ?int,
     * }  $in
     */
    public function evaluate(array $in): LicenseReport
    {
        $host = HostClassifier::normalize($in['host']);
        $class = $this->classifier->classify($in['host'], $in['port']);
        $products = $in['packages'];

        // A non-public host needs nothing, whatever its token says.
        if ($class === HostClass::Nonpublic) {
            return new LicenseReport($host, $class, 'none', null, 0, array_map(static fn () => self::item('nonpublic'), $products));
        }

        if (! Ed25519::available()) {
            return new LicenseReport($host, $class, 'unverifiable', null, 1, array_map(static fn () => self::item('unverifiable', 1), $products));
        }

        $tokens = array_values(array_filter($in['tokens'], static fn (string $t) => $t !== ''));

        if ($tokens === []) {
            return $this->finish($in, $host, $class, 'none', null, array_map(static fn () => self::item('unlicensed', 2), $products));
        }

        $best = $this->pick(array_map(fn (string $t) => $this->check($t, $in), $tokens));

        if ($best['status'] !== 'valid') {
            return $this->finish($in, $host, $class, $best['status'], null, array_map(static fn () => self::item($best['reason'], $best['level']), $products));
        }

        /** @var Claims $claims */
        $claims = $best['claims'];

        if (! HostMatcher::matches($host, $claims->domains)) {
            $reason = HostClassifier::isAscii($host) ? ['domain_mismatch', 2] : ['idn_unconvertible', 1];

            return $this->finish($in, $host, $class, 'valid', $claims, array_map(static fn () => self::item($reason[0], $reason[1]), $products));
        }

        $items = [];

        foreach ($products as $product => $package) {
            $item = $claims->items[$product] ?? null;
            $items[$product] = $item ? $this->itemState($item, $package['major_released'] ?? null, $in) : self::item('unlicensed', 2);
        }

        return $this->finish($in, $host, $class, 'valid', $claims, $items);
    }

    /** @return array{status: string, reason: string, level: int, claims: ?Claims} */
    private function check(string $token, array $in): array
    {
        $fail = static fn (string $status, string $reason, int $level) => ['status' => $status, 'reason' => $reason, 'level' => $level, 'claims' => null];
        $parts = Paseto::parse($token);
        $footer = $parts ? json_decode($parts['footer'], true) : null;
        $kid = is_array($footer) && is_string($footer['kid'] ?? null) ? $footer['kid'] : null;

        if (! $parts || $kid === null) {
            return $fail('invalid', 'invalid', 2);
        }

        $trust = $in['trust'];
        $key = $trust?->key($kid, 'license');

        if (! $key) {
            // Nothing says this key is bad until a fresh trust file leaves it out.
            $fresh = $in['trust_checked_at'] !== null && $in['now'] - $in['trust_checked_at'] < self::TRUST_FRESH;

            return $fresh && $trust ? $fail('invalid', 'invalid', 2) : $fail('unknown_key', 'unknown_key', 1);
        }

        $implicit = 'cms-license:1:'.$in['family'];

        if (! Paseto::verify($parts, $implicit, $key['pub'])) {
            return Paseto::verify($parts, $implicit.'-test', $key['pub']) ? $fail('wrong_family', 'wrong_family', 2) : $fail('invalid', 'invalid', 2);
        }

        $claims = Claims::parse($parts['message']);

        if (! $claims) {
            return $fail('invalid', 'invalid', 2);
        }

        $revoked = $trust->revocation($kid);

        if ($revoked && ($revoked['after'] === null || $claims->iat > (int) strtotime((string) $revoked['after']))) {
            return $fail('key_revoked', 'key_revoked', 1);
        }

        return ['status' => 'valid', 'reason' => 'ok', 'level' => 0, 'claims' => $claims];
    }

    /**
     * A restored backup can bring back an older token: for the same licence the highest
     * revision wins; between licences, the first source.
     *
     * @param  list<array{status: string, reason: string, level: int, claims: ?Claims}>  $checked
     */
    private function pick(array $checked): array
    {
        $first = null;

        foreach ($checked as $entry) {
            if ($entry['status'] === 'valid') {
                $first = $first === null || ($entry['claims']->lid === $first['claims']->lid && $entry['claims']->rev > $first['claims']->rev) ? $entry : $first;
            }
        }

        return $first ?? $checked[0];
    }

    /** @param  array{p: string, ed: string, st: string, upd: ?string, trm: ?string, tgr: int}  $item */
    private function itemState(array $item, ?string $majorReleased, array $in): array
    {
        $state = static fn (string $reason, int $level) => ['edition' => $item['ed'], 'status' => $item['st'], 'level' => $level, 'reason' => $reason, 'upd' => $item['upd'], 'trm' => $item['trm']];
        $now = $in['now'] + $in['offset'];

        if ($item['st'] === 'refunded') {
            return $state('refunded', 2);
        }

        if ($item['st'] !== 'active') {
            return $state($item['st'], 3);
        }

        if ($item['trm'] !== null) {
            $end = (int) strtotime($item['trm'].' 23:59:59 UTC');

            if ($now > $end + self::FUTURE_TOLERANCE) {
                return $state('term_ended', $now > $end + self::FUTURE_TOLERANCE + $item['tgr'] * 86_400 ? 3 : 2);
            }
        }

        if ($item['upd'] !== null) {
            if ($majorReleased !== null && $majorReleased > $item['upd']) {
                return $state('major_not_covered', 2);
            }

            if ($now > (int) strtotime($item['upd'].' 23:59:59 UTC')) {
                return $state('window_over', 1);
            }
        }

        return $state('ok', 0);
    }

    private static function item(string $reason, int $level = 0): array
    {
        return ['edition' => null, 'status' => null, 'level' => $level, 'reason' => $reason, 'upd' => null, 'trm' => null];
    }

    private function finish(array $in, string $host, HostClass $class, string $token, ?Claims $claims, array $items): LicenseReport
    {
        $notes = [];

        if ($in['refresh_failing_since'] !== null && $in['now'] - $in['refresh_failing_since'] >= 30 * 86_400) {
            $notes[] = 'refresh_failing';
        }

        // A wrong clock never changes a right, it only earns a line on the screen.
        if ($claims && ($in['now'] < $claims->iat - self::FUTURE_TOLERANCE || $in['now'] > $claims->iat + 20 * 365 * 86_400)) {
            $notes[] = 'clock';
        }

        $level = max([0, ...array_column($items, 'level')]);

        return new LicenseReport($host, $class, $token, $claims?->lid, max($level, $notes !== [] ? 1 : 0), $items, $notes, $claims?->domains ?? [], $claims?->rev);
    }
}

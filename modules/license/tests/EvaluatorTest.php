<?php

declare(strict_types=1);

namespace Cms\Modules\License\Tests;

use Cms\Modules\License\Host\HostClassifier;
use Cms\Modules\License\Host\HostMatcher;
use Cms\Modules\License\Report\Evaluator;
use Cms\Modules\License\Report\LicenseReport;
use Cms\Support\Crypto\Ed25519;
use Cms\Tests\Support\Signing;
use Cms\Tests\TestCase;
use Cms\Trust\DevKeys;
use Cms\Trust\TrustFile;
use PHPUnit\Framework\Attributes\After;
use PHPUnit\Framework\Attributes\DataProvider;

/** The edge cases of research/pricing.md, section 7, that a site decides by itself. Named after their numbers. */
final class EvaluatorTest extends TestCase
{
    private const int NOW = 1_801_353_600; // 2027-02-01

    #[After]
    public function resetBackends(): void
    {
        Ed25519::$backends = null;
    }

    private function trust(array $overrides = []): TrustFile
    {
        return TrustFile::selfSigned(DevKeys::trust($overrides));
    }

    private function report(array $in = []): LicenseReport
    {
        return (new Evaluator)->evaluate([
            'host' => 'example.com',
            'port' => null,
            'packages' => ['acme/forms' => ['major_released' => null]],
            'tokens' => [],
            'family' => DevKeys::FAMILY,
            'trust_checked_at' => self::NOW,
            'now' => self::NOW,
            'offset' => 0,
            'refresh_failing_since' => null,
            ...$in,
            'trust' => array_key_exists('trust', $in) ? $in['trust'] : $this->trust(),
        ]);
    }

    private function item(LicenseReport $report): array
    {
        return $report->items['acme/forms'];
    }

    /** @return array<string, array{0: string, 1: ?int, 2: string}> */
    public static function hosts(): array
    {
        return [
            'case_01 localhost' => ['localhost', null, 'nonpublic'],
            'case_01 subdomain of localhost' => ['site.localhost', null, 'nonpublic'],
            'case_01 .test' => ['client.test', null, 'nonpublic'],
            'case_01 .local' => ['client.local', null, 'nonpublic'],
            'case_01 .internal' => ['cms.corp.internal', null, 'nonpublic'],
            'case_01 .home.arpa' => ['nas.home.arpa', null, 'nonpublic'],
            'case_01 ip v4' => ['203.0.113.7', null, 'nonpublic'],
            'case_01 ip v6' => ['[2001:db8::1]', null, 'nonpublic'],
            'case_01 single label' => ['intranet', null, 'nonpublic'],
            'case_01 other port' => ['example.com', 8080, 'nonpublic'],
            'case_02 staging label' => ['staging.client.com', null, 'nonpublic'],
            'case_02 dev label' => ['dev.client.com', null, 'nonpublic'],
            'case_02 suffixed label' => ['staging-2.client.com', null, 'nonpublic'],
            'case_02 preview platform' => ['client.ddev.site', null, 'nonpublic'],
            'case_02 tunnel' => ['abc.ngrok-free.app', null, 'nonpublic'],
            'case_02 two labels are real sites' => ['dev.to', null, 'public'],
            'case_02 test.com is real' => ['test.com', null, 'public'],
            'case_03 production on staging is undetected' => ['staging.client.com', 443, 'nonpublic'],
            'case_04 staging on an agency subdomain is public' => ['client.agency.com', null, 'public'],
            'case_06 upper case, trailing dot, port 443' => ['WWW.Example.COM.:443', 443, 'public'],
            'case_07 .dev' => ['example.dev', null, 'public'],
            'case_07 .app' => ['example.app', null, 'public'],
            'case_17 normal host' => ['www.example.com', null, 'public'],
        ];
    }

    #[DataProvider('hosts')]
    public function test_hosts_are_classified(string $host, ?int $port, string $class): void
    {
        $this->assertSame($class, (new HostClassifier)->classify($host, $port)->value);
    }

    public function test_case_01_no_licence_needed_even_with_a_paid_plugin(): void
    {
        $report = $this->report(['host' => 'localhost', 'packages' => ['acme/forms' => ['major_released' => null]]]);

        $this->assertSame(0, $report->level);
        $this->assertSame('nonpublic', $report->items['acme/forms']['reason']); // case_85
    }

    public function test_case_05_subfolders_are_the_same_host_and_case_06_normalised_matches(): void
    {
        $this->assertTrue(HostMatcher::matches('example.com', ['example.com']));
        $this->assertTrue(HostMatcher::matches('WWW.EXAMPLE.COM.', ['example.com']));
        $this->assertTrue(HostMatcher::matches('shop.example.com', ['example.com']));
        $this->assertFalse(HostMatcher::matches('notexample.com', ['example.com']));
        $this->assertFalse(HostMatcher::matches('example.com.evil.org', ['example.com']));
    }

    public function test_case_08_idn_forms_match_case_09_without_intl_case_10_sharp_s(): void
    {
        if (function_exists('idn_to_ascii')) {
            $this->assertTrue(HostMatcher::matches('münchen.de', ['xn--mnchen-3ya.de']));
            $this->assertTrue(HostMatcher::matches('xn--mnchen-3ya.de', ['münchen.de']));
            $this->assertFalse(HostMatcher::matches('faß.de', ['fass.de'])); // case_10
        }

        // A host that couldn't be converted stays non-ASCII: a line with a hint, never more.
        $report = (new Evaluator(new HostClassifier([])))->evaluate([
            'host' => 'xn--mnchen-3ya.de', 'port' => null, 'packages' => ['acme/forms' => ['major_released' => null]],
            'tokens' => [Signing::token(['dom' => ['example.com']])], 'trust' => $this->trust(), 'family' => DevKeys::FAMILY, 'trust_checked_at' => self::NOW,
            'now' => self::NOW, 'offset' => 0, 'refresh_failing_since' => null,
        ]);
        $this->assertSame('domain_mismatch', $this->item($report)['reason']);
    }

    public function test_case_13_exact_host_claim(): void
    {
        $this->assertTrue(HostMatcher::matches('acme.sharedhost.com', ['=acme.sharedhost.com']));
        $this->assertFalse(HostMatcher::matches('other.acme.sharedhost.com', ['=acme.sharedhost.com']));
        $this->assertFalse(HostMatcher::matches('sharedhost.com', ['=acme.sharedhost.com']));
    }

    public function test_case_14_translations_on_listed_domains(): void
    {
        $token = Signing::token(['dom' => ['example.com', 'example.de', 'example.fr']]);

        foreach (['example.com', 'www.example.de', 'example.fr'] as $host) {
            $this->assertSame(0, $this->report(['host' => $host, 'tokens' => [$token]])->level, $host);
        }
    }

    public function test_case_04_listed_as_non_production_host_gets_no_banner(): void
    {
        $this->assertSame(2, $this->report(['host' => 'client.agency.com'])->level);
        $this->assertSame(0, $this->report(['host' => 'client.agency.com', 'tokens' => [Signing::token(['dom' => ['example.com', '=client.agency.com']])]])->level);
    }

    public function test_case_20_a_paid_plugin_with_no_licence_gets_a_banner_and_it_never_grows(): void
    {
        $this->assertSame(2, $this->report()->level);
        $this->assertSame('unlicensed', $this->item($this->report())['reason']);
        $this->assertSame(2, $this->report(['now' => self::NOW + 400 * 86_400])->level);
    }

    public function test_the_cms_itself_is_not_a_product_here(): void
    {
        $report = $this->report(['packages' => []]);

        $this->assertSame(0, $report->level);
        $this->assertSame([], $report->items);
        $this->assertSame(0, $this->report(['tokens' => [Signing::token()]])->level);
        $this->assertArrayNotHasKey('letterncms/cms', $this->report(['tokens' => [Signing::token()]])->items);

        // An old token naming the CMS grants and asks nothing: the plugin is what's unlicensed.
        $old = Signing::token(['items' => [Signing::item(['p' => 'letterncms/cms'])]]);
        $this->assertSame('unlicensed', $this->item($this->report(['tokens' => [$old]]))['reason']);
    }

    public function test_a_token_marked_for_one_domain_is_treated_like_any_other(): void
    {
        $token = Signing::token(['dom' => ['first.example'], 'items' => [Signing::item(['sd' => true])]]);

        $this->assertSame(0, $this->report(['host' => 'first.example', 'tokens' => [$token]])->level);
        $elsewhere = $this->report(['host' => 'example.com', 'tokens' => [$token]]);
        $this->assertSame(2, $elsewhere->level);
        $this->assertSame('domain_mismatch', $this->item($elsewhere)['reason']);
    }

    public function test_case_26_token_cloned_to_staging_case_27_copied_elsewhere(): void
    {
        $token = Signing::token();

        $this->assertSame(0, $this->report(['host' => 'staging.example.com', 'tokens' => [$token]])->level);
        $this->assertSame(0, $this->report(['host' => 'localhost', 'tokens' => [$token]])->level);

        $copied = $this->report(['host' => 'unrelated.org', 'tokens' => [$token]]);
        $this->assertSame(2, $copied->level);
        $this->assertSame('domain_mismatch', $this->item($copied)['reason']);
    }

    public function test_case_28_removed_or_corrupt(): void
    {
        $this->assertSame('unlicensed', $this->item($this->report(['tokens' => []]))['reason']);

        $corrupt = $this->report(['tokens' => ['v4.public.corrupt']]);
        $this->assertSame('invalid', $corrupt->token);
        $this->assertSame(2, $corrupt->level);
    }

    public function test_case_30_no_sodium_case_31_neither(): void
    {
        $token = Signing::token();
        $trust = $this->trust();

        Ed25519::$backends = ['openssl'];
        $this->assertSame(0, $this->report(['tokens' => [$token], 'trust' => $trust])->level);

        Ed25519::$backends = [];
        $report = $this->report(['tokens' => [$token], 'trust' => $trust]);
        $this->assertSame('unverifiable', $report->token);
        $this->assertSame(1, $report->level);
    }

    public function test_case_32_an_older_token_from_a_backup_loses_to_the_newest_revision(): void
    {
        $old = Signing::token(['rev' => 3, 'dom' => ['other.example']]);
        $new = Signing::token(['rev' => 12]);

        $this->assertSame(12, $this->report(['tokens' => [$old, $new]])->rev);
        $this->assertSame(12, $this->report(['tokens' => [$new, $old]])->rev);

        // Another licence: the first source stands.
        $other = Signing::token(['lid' => 'OTHER', 'rev' => 99]);
        $this->assertSame('01JBTESTLICENCE', $this->report(['tokens' => [$old, $other]])->lid);
    }

    public function test_case_34_bad_signature(): void
    {
        $forged = Signing::token([], DevKeys::FAMILY, DevKeys::LICENSE, DevKeys::private('someone-else'));
        $report = $this->report(['tokens' => [$forged]]);

        $this->assertSame('invalid', $report->token);
        $this->assertSame(2, $report->level);
    }

    public function test_case_35_other_product_and_test_mode_token(): void
    {
        $this->assertSame('invalid', $this->report(['tokens' => [Signing::token([], 'some-other-family')]])->token);

        $test = $this->report(['tokens' => [Signing::token([], DevKeys::FAMILY.'-test')]]);
        $this->assertSame('wrong_family', $test->token);
        $this->assertSame(2, $test->level);
    }

    public function test_case_36_unknown_key(): void
    {
        $token = Signing::token([], DevKeys::FAMILY, 'lic-future');

        $stale = $this->report(['tokens' => [$token], 'trust_checked_at' => null]);
        $this->assertSame('unknown_key', $stale->token);
        $this->assertSame(1, $stale->level);
        $this->assertSame(1, $this->report(['tokens' => [$token], 'trust_checked_at' => self::NOW - 15 * 86_400])->level);

        // A trust file fetched lately leaves it out: it isn't a key of ours.
        $fresh = $this->report(['tokens' => [$token]]);
        $this->assertSame('invalid', $fresh->token);
        $this->assertSame(2, $fresh->level);
    }

    public function test_case_37_rotation_keeps_old_tokens_valid(): void
    {
        $trust = $this->trust(['keys' => [
            ['kid' => DevKeys::LICENSE, 'role' => 'license', 'pub' => DevKeys::public(DevKeys::LICENSE)],
            ['kid' => 'lic-new', 'role' => 'license', 'pub' => DevKeys::public('lic-new')],
        ]]);

        $this->assertSame(0, $this->report(['trust' => $trust, 'tokens' => [Signing::token()]])->level);
        $this->assertSame(0, $this->report(['trust' => $trust, 'tokens' => [Signing::token([], DevKeys::FAMILY, 'lic-new')]])->level);
    }

    public function test_case_38_a_compromised_key_is_cut_off_by_date(): void
    {
        $trust = $this->trust(['revoked' => [['kid' => DevKeys::LICENSE, 'after' => '2026-06-01T00:00:00Z', 'reason' => 'compromised']]]);

        $this->assertSame(0, $this->report(['trust' => $trust, 'tokens' => [Signing::token(['iat' => '2026-01-01T00:00:00Z'])]])->level);

        $late = $this->report(['trust' => $trust, 'tokens' => [Signing::token(['iat' => '2026-07-01T00:00:00Z'])]]);
        $this->assertSame('key_revoked', $late->token);
        $this->assertSame(1, $late->level);
    }

    public function test_a_release_key_cannot_sign_a_licence(): void
    {
        // Roles are enforced: the signature is good, the role is wrong.
        $report = $this->report(['tokens' => [Signing::token([], DevKeys::FAMILY, DevKeys::RELEASE)]]);

        $this->assertSame('invalid', $report->token);
        $this->assertSame(2, $report->level);
    }

    public function test_case_43_refresh_failing_for_a_month_is_a_line_not_a_banner(): void
    {
        $this->assertSame(0, $this->report(['tokens' => [Signing::token()], 'refresh_failing_since' => self::NOW - 29 * 86_400])->level);

        $report = $this->report(['tokens' => [Signing::token()], 'refresh_failing_since' => self::NOW - 30 * 86_400]);
        $this->assertSame(1, $report->level);
        $this->assertSame(['refresh_failing'], $report->notes);
    }

    public function test_case_45_a_wrong_clock_changes_no_right(): void
    {
        $token = Signing::token();

        $past = $this->report(['tokens' => [$token], 'now' => 0]);
        $this->assertSame(['clock'], $past->notes);
        $this->assertSame(1, $past->level);
        $this->assertSame('ok', $this->item($past)['reason']);

        $future = $this->report(['tokens' => [$token], 'now' => strtotime('2099-01-01')]);
        $this->assertContains('clock', $future->notes);
        $this->assertLessThanOrEqual(1, $future->level);
    }

    public function test_case_46_iat_slightly_in_the_future(): void
    {
        $token = Signing::token(['iat' => gmdate('Y-m-d\TH:i:s\Z', self::NOW + 3600)]);
        $this->assertSame(0, $this->report(['tokens' => [$token]])->level);

        $far = Signing::token(['iat' => gmdate('Y-m-d\TH:i:s\Z', self::NOW + 3 * 86_400)]);
        $report = $this->report(['tokens' => [$far]]);
        $this->assertSame(['clock'], $report->notes);
        $this->assertSame(1, $report->level);
    }

    public function test_case_47_term_end_trusts_the_signed_time_over_a_skewed_clock(): void
    {
        $term = gmdate('Y-m-d', self::NOW + 5 * 86_400);
        $token = Signing::token(['items' => [Signing::item(['trm' => $term, 'tgr' => 60])]]);

        // The local clock runs ten days fast, and a refresh measured it.
        $this->assertSame(0, $this->report(['tokens' => [$token], 'now' => self::NOW + 10 * 86_400, 'offset' => -10 * 86_400])->level);
        $this->assertSame(2, $this->report(['tokens' => [$token], 'now' => self::NOW + 10 * 86_400])->level);
    }

    public function test_case_50_refund_case_53_chargeback_case_68_breach(): void
    {
        $status = fn (string $st) => $this->report(['tokens' => [Signing::token(['items' => [Signing::item(['st' => $st])]])]]);

        $this->assertSame(2, $status('refunded')->level);
        $this->assertSame('refunded', $this->item($status('refunded'))['reason']);
        $this->assertSame(3, $status('charged_back')->level);
        $this->assertSame(3, $status('revoked')->level);
    }

    public function test_case_56_window_over_case_57_major_in_window_case_58_major_outside(): void
    {
        $over = $this->report(['tokens' => [Signing::token(['items' => [Signing::item(['upd' => '2026-07-01'])]])]]);
        $this->assertSame('window_over', $this->item($over)['reason']);
        $this->assertSame(1, $over->level);

        $this->assertSame(0, $this->report(['tokens' => [Signing::token()], 'packages' => ['acme/forms' => ['major_released' => '2029-11-01']]])->level);

        $outside = $this->report(['tokens' => [Signing::token()], 'packages' => ['acme/forms' => ['major_released' => '2029-11-03']]]);
        $this->assertSame('major_not_covered', $this->item($outside)['reason']);
        $this->assertSame(2, $outside->level);
    }

    public function test_no_clock_decides_whether_a_major_is_covered(): void
    {
        $token = Signing::token(['items' => [Signing::item(['upd' => '2027-01-01'])]]);

        foreach ([0, self::NOW, strtotime('2099-01-01')] as $now) {
            $this->assertSame('major_not_covered', $this->item($this->report(['tokens' => [$token], 'packages' => ['acme/forms' => ['major_released' => '2028-01-01']], 'now' => $now]))['reason']);
        }
    }

    public function test_case_80_term_ended_banner_then_lasting(): void
    {
        $term = gmdate('Y-m-d', self::NOW - 10 * 86_400);
        $token = Signing::token(['items' => [Signing::item(['trm' => $term, 'tgr' => 60])]]);

        $grace = $this->report(['tokens' => [$token]]);
        $this->assertSame('term_ended', $this->item($grace)['reason']);
        $this->assertSame(2, $grace->level);

        $this->assertSame(3, $this->report(['tokens' => [$token], 'now' => self::NOW + 60 * 86_400])->level);
    }

    public function test_case_86_paid_plugin_case_88_its_own_refund_case_89_independent_items(): void
    {
        $paid = ['acme/forms' => ['major_released' => '2026-01-01'], 'acme/shop' => ['major_released' => '2026-01-01']];

        $one = $this->report(['packages' => $paid, 'tokens' => [Signing::token()]]);
        $this->assertSame('ok', $this->item($one)['reason']);
        $this->assertSame('unlicensed', $one->items['acme/shop']['reason']);
        $this->assertSame(2, $one->items['acme/shop']['level']);

        $refunded = $this->report(['packages' => $paid, 'tokens' => [Signing::token(['items' => [Signing::item(), Signing::item(['p' => 'acme/shop', 'st' => 'refunded'])]])]]);
        $this->assertSame('ok', $this->item($refunded)['reason']);
        $this->assertSame('refunded', $refunded->items['acme/shop']['reason']);
    }

    public function test_case_87_plugin_window_lapsed(): void
    {
        $token = Signing::token(['items' => [Signing::item(['upd' => '2026-01-01'])]]);
        $report = $this->report(['packages' => ['acme/forms' => ['major_released' => '2025-01-01']], 'tokens' => [$token]]);

        $this->assertSame('window_over', $report->items['acme/forms']['reason']);
        $this->assertSame(1, $report->level);
    }

    public function test_a_token_with_no_domains_is_invalid_here(): void
    {
        $this->assertSame('invalid', $this->report(['tokens' => [Signing::token(['dom' => []])]])->token);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Admin\Accent;
use Cms\Tests\TestCase;

final class AdminAccentTest extends TestCase
{
    public function test_amber_paints_nothing_of_its_own(): void
    {
        $this->actingAs($this->admin());

        $this->get('/admin')->assertOk()->assertSee('<style id="cms-accent"></style>', false);
        $this->getJson('/api/admin/manifest')->assertOk()->assertJsonPath('data.site.accent', null)->assertJsonPath('data.accents.0.name', 'amber');
    }

    public function test_the_site_accents_everyones_admin_before_the_first_paint(): void
    {
        $admin = $this->admin();
        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'site', 'values' => ['admin_accent' => 'blue']], AbilityContext::forUser($admin, 'admin'));
        $this->actingAs($admin);

        $this->get('/admin')->assertOk()
            ->assertSee('<style id="cms-accent">:root,[data-theme]{--cms-signal:#0d74ce;--cms-signal-ink:#ffffff;--cms-focus:#0d74ce;--cms-focus-soft:rgb(13 116 206 / 0.12);--cms-focus-hover:rgb(13 116 206 / 0.16)}', false)
            ->assertSee('[data-theme="dark"]{--cms-focus:#2f87d5;', false);
        $this->getJson('/api/admin/manifest')->assertOk()->assertJsonPath('data.site.accent', 'blue');
    }

    public function test_a_person_wears_their_own_until_they_follow_the_sites_again(): void
    {
        $admin = $this->admin();
        $ctx = AbilityContext::forUser($admin, 'admin');
        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'site', 'values' => ['admin_accent' => 'blue']], $ctx);

        $this->cms()->abilities()->execute('account/update', ['preferences' => ['accent' => 'green']], $ctx);
        $this->actingAs($admin->fresh());
        $this->get('/admin')->assertOk()->assertSee('--cms-signal:#30a46c;--cms-signal-ink:#1c1b18', false);

        $this->cms()->abilities()->execute('account/update', ['preferences' => ['accent' => null]], AbilityContext::forUser($admin->fresh(), 'admin'));
        $this->assertArrayNotHasKey('accent', (array) $admin->fresh()->preferences);
        $this->actingAs($admin->fresh());
        $this->get('/admin')->assertOk()->assertSee('--cms-signal:#0d74ce', false);
    }

    public function test_monochrome_is_the_admins_own_ink_in_either_theme(): void
    {
        $this->assertStringStartsWith(':root,[data-theme]{--cms-tint:#8a8a8a;--cms-signal:var(--cms-ink);--cms-signal-ink:var(--cms-ink-contrast);', Accent::css('monochrome'));
        $this->assertStringContainsString('--cms-focus:var(--cms-ink);', Accent::css('monochrome'));
    }

    public function test_an_accent_is_one_of_the_set_and_the_brands_own_is_kept_as_nothing(): void
    {
        $ctx = AbilityContext::forUser($this->admin(), 'admin');

        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'site', 'values' => ['admin_accent' => 'amber']], $ctx);
        $this->assertNull($this->cms()->settingsRegistry()->get('site', 'admin_accent'));

        $this->expectException(AbilityException::class);
        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'site', 'values' => ['admin_accent' => '#123456']], $ctx);
    }

    /** WCAG 2.2: the words on each fill 4.5:1 (1.4.3) and its focus line 3:1 on the page, the desk and a float (1.4.11), light and dark. */
    public function test_every_accent_reads_in_light_and_in_dark(): void
    {
        foreach (Accent::PRESETS as $name => $preset) {
            $this->assertGreaterThanOrEqual(4.5, $this->contrast($preset['fill'], $preset['ink']), "{$name}: words on the fill");
            if (isset($preset['dark'])) {
                $this->assertGreaterThanOrEqual(4.5, $this->contrast($preset['dark']['fill'], $preset['dark']['ink']), "{$name}: words on the fill on dark");
            }
            // Amber's line on light is amber itself, haloed: any deeper is brown.
            foreach ([...($name === 'amber' ? [] : [[$preset['focus'][0], ['#ffffff', '#f4f3ef']]]), [$preset['focus'][1], ['#1a1a18', '#222220']]] as [$line, $pages]) {
                foreach ($pages as $page) {
                    $this->assertGreaterThanOrEqual(3.0, $this->contrast($line, $page), "{$name}: focus {$line} on {$page}");
                }
            }
        }
    }

    private function contrast(string $a, string $b): float
    {
        $lum = static function (string $hex): float {
            $c = array_map(static function (string $pair): float {
                $v = hexdec($pair) / 255;

                return $v <= 0.03928 ? $v / 12.92 : (($v + 0.055) / 1.055) ** 2.4;
            }, str_split(substr($hex, 1), 2));

            return 0.2126 * $c[0] + 0.7152 * $c[1] + 0.0722 * $c[2];
        };
        [$hi, $lo] = [max($lum($a), $lum($b)), min($lum($a), $lum($b))];

        return ($hi + 0.05) / ($lo + 0.05);
    }
}

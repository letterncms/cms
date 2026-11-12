<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Admin\Accent;
use Cms\Tests\TestCase;

final class AdminAccentTest extends TestCase
{
    public function test_the_brands_yellow_paints_nothing_of_its_own(): void
    {
        $this->actingAs($this->admin());

        $this->get('/admin')->assertOk()->assertSee('<style id="cms-accent"></style>', false);
        $this->getJson('/api/admin/manifest')->assertOk()->assertJsonPath('data.site.accent', null);
    }

    public function test_the_site_accents_everyones_admin_before_the_first_paint(): void
    {
        $admin = $this->admin();
        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'site', 'values' => ['admin_accent' => '#2F6BFF']], AbilityContext::forUser($admin, 'admin'));
        $this->actingAs($admin);

        $this->get('/admin')->assertOk()->assertSee('<style id="cms-accent">:root,[data-theme]{--cms-signal:#2f6bff;--cms-signal-ink:#ffffff}</style>', false);
        $this->getJson('/api/admin/manifest')->assertOk()->assertJsonPath('data.site.accent', '#2f6bff');
    }

    public function test_a_person_wears_their_own_until_they_follow_the_sites_again(): void
    {
        $admin = $this->admin();
        $ctx = AbilityContext::forUser($admin, 'admin');
        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'site', 'values' => ['admin_accent' => '#2f6bff']], $ctx);

        $this->cms()->abilities()->execute('account/update', ['preferences' => ['accent' => '#16B364']], $ctx);
        $this->actingAs($admin->fresh());
        $this->get('/admin')->assertOk()->assertSee('--cms-signal:#16b364;--cms-signal-ink:#1c1b18', false);

        $this->cms()->abilities()->execute('account/update', ['preferences' => ['accent' => null]], AbilityContext::forUser($admin->fresh(), 'admin'));
        $this->assertArrayNotHasKey('accent', (array) $admin->fresh()->preferences);
        $this->actingAs($admin->fresh());
        $this->get('/admin')->assertOk()->assertSee('--cms-signal:#2f6bff', false);
    }

    public function test_an_accent_is_one_colour_and_the_brands_own_is_kept_as_nothing(): void
    {
        $ctx = AbilityContext::forUser($this->admin(), 'admin');

        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'site', 'values' => ['admin_accent' => '#FFE100']], $ctx);
        $this->assertNull($this->cms()->settingsRegistry()->get('site', 'admin_accent'));

        $this->expectException(AbilityException::class);
        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'site', 'values' => ['admin_accent' => 'rgb(1 2 3)']], $ctx);
    }

    public function test_the_words_on_the_accent_are_the_ink_that_stands_out_more(): void
    {
        $this->assertSame('#1c1b18', Accent::ink('#ffe100'));
        $this->assertSame('#1c1b18', Accent::ink('#16b364'));
        $this->assertSame('#ffffff', Accent::ink('#7c5cff'));
        $this->assertSame('#ffffff', Accent::ink('#2f6bff'));
        $this->assertSame('#aabbcc', Accent::normalize(' #ABC '));
        $this->assertNull(Accent::normalize('blue'));
    }
}

<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Admin\Translations;
use Cms\Tests\TestCase;

final class AdminLanguageTest extends TestCase
{
    public function test_the_admin_speaks_the_users_language_without_touching_the_sites(): void
    {
        $admin = $this->admin();
        $admin->locale = 'nl';
        $admin->save();
        $this->actingAs($admin);

        $this->getJson('/api/admin/manifest')->assertOk()->assertJsonPath('data.locale', 'nl');
        // The admin's language is the translator's; the site's content language stays.
        $this->assertSame('en', config('app.locale'));
        $this->assertSame('nl', app(Translations::class)->current());
    }

    public function test_a_language_cms_does_not_speak_falls_back_to_english(): void
    {
        $admin = $this->admin();
        $admin->locale = 'xx';
        $admin->save();
        $this->actingAs($admin);

        $this->getJson('/api/admin/manifest', ['Accept-Language' => 'ja'])->assertOk()->assertJsonPath('data.locale', 'en');
    }

    public function test_labels_and_field_definitions_are_translated(): void
    {
        $translations = app(Translations::class);
        $translations->apply('nl');
        app('translator')->addLines(['*.Name' => 'Naam', '*.Both' => 'Beide'], 'nl');

        $fields = $translations->fields([['handle' => 'name', 'type' => 'text', 'label' => 'Name', 'options' => ['a' => 'Both'], 'fields' => [['handle' => 'x', 'label' => 'Name']]]]);

        $this->assertSame('Naam', $fields[0]['label']);
        $this->assertSame('Beide', $fields[0]['options']['a']);
        $this->assertSame('Naam', $fields[0]['fields'][0]['label']);
        $this->assertArrayHasKey('nl', $translations->languages());
    }

    /** The sign-in screen speaks the browser's language before anyone is signed in. */
    public function test_the_sign_in_screen_and_its_errors_follow_the_browsers_language(): void
    {
        foreach (['nl' => ['Inloggen', 'Deze gegevens kloppen niet.'], 'fr' => ['Se connecter', 'Ces identifiants ne correspondent à aucun compte.']] as $code => [$signIn, $wrong]) {
            $this->flushSession();
            $page = $this->get('/admin', ['Accept-Language' => $code])->assertOk()->getContent();

            $this->assertStringContainsString('<html lang="'.$code.'">', $page);
            preg_match('/window\.__CMS__ = (\{.*?\});<\/script>/s', $page, $boot);
            $boot = json_decode($boot[1], true);
            $this->assertSame($code, $boot['locale']);
            $this->assertSame($signIn, $boot['messages']['Sign In']);

            $this->postJson('/api/admin/auth/login', ['email' => "nobody-{$code}@example.test", 'password' => 'wrong-password-1'], ['Accept-Language' => $code])
                ->assertStatus(422)
                ->assertJsonPath('error.message', $wrong);
        }
    }

    /** `?lang=` shows one page in another language; its requests carry it as X-Cms-Locale. */
    public function test_a_page_can_be_opened_in_another_language_without_changing_the_account(): void
    {
        $admin = $this->admin();
        $this->actingAs($admin);

        $page = $this->get('/admin?lang=fr')->assertOk()->getContent();
        $this->assertStringContainsString('<html lang="fr">', $page);
        $this->getJson('/api/admin/manifest', ['X-Cms-Locale' => 'nl'])->assertOk()->assertJsonPath('data.locale', 'nl');
        $this->assertNull($admin->fresh()->locale);
    }
}

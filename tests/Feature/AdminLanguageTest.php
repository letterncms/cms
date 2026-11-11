<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
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

    public function test_the_general_settings_set_the_admin_language_for_people_without_one(): void
    {
        $admin = $this->admin();
        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'site', 'values' => ['admin_language' => 'nl']], AbilityContext::forUser($admin, 'admin'));
        $this->actingAs($admin);

        $this->getJson('/api/admin/manifest', ['Accept-Language' => 'fr'])->assertOk()->assertJsonPath('data.locale', 'nl');
        $this->assertSame('Admin Language', array_column($this->cms()->settingsRegistry()->schemas()['site']['fields'], 'label', 'handle')['admin_language']);
    }

    public function test_german_is_offered_and_translates_the_core_and_its_modules(): void
    {
        $translations = app(Translations::class);

        $this->assertSame('Deutsch', $translations->languages()['de'] ?? null);
        $this->assertSame('Speichern', $translations->messages('de')['Save'] ?? null);
        $this->assertNotContains('', $translations->messages('de'));
    }

    public function test_one_english_word_has_a_translation_per_meaning_and_its_context_is_never_shown(): void
    {
        $translations = app(Translations::class);

        // English, and any language that has no word for it: the words before the context.
        $this->assertSame('Views', __('Views||page views'));
        $this->assertSame('Phone', $translations->label('Phone||number'));
        $this->assertSame('Delete “About”?', __('Delete “:title”?||entry', ['title' => 'About']));
        $this->assertSame('a || b', \Cms\Support\BrandedTranslator::words('a || b||where'));

        $translations->apply('nl');
        app('translator')->addLines(['*.Views' => 'Weergaven', '*.Views||page views' => 'Paginaweergaven'], 'nl');

        $this->assertSame('Weergaven', __('Views'));
        $this->assertSame('Paginaweergaven', __('Views||page views'));
        $this->assertSame('Expired', __('Expired||nobody translated this'));
        // A meaning this language lacks: its word for the plain key, before the English.
        $this->assertSame('Weergaven', __('Views||list views'));

        // Only a trailing `||` with plain lowercase words is a context: a label someone writes keeps its `||`,
        // and a value filled in that holds one is never cut.
        $this->assertSame('A || B', __('A || B'));
        $this->assertSame('Yes||No', $translations->label('Yes||No'));
        $this->assertSame('Delete “a||b”?', __('Delete “:title”?||entry', ['title' => 'a||b']));
        $this->assertSame('Kept “x||y”', __('Kept “:title”', ['title' => 'x||y']));

        // The dictionaries the core ships: a field's telephone number and a screen's phone are two words in German.
        $translations->apply('de');
        $this->assertSame('Telefon', __('Phone||number'));
        $this->assertSame('Ohne', $translations->messages('de')['None']);

        $options = $translations->fields([['handle' => 'kind', 'type' => 'select', 'label' => 'This || That', 'options' => ['phone' => 'Phone||number', 'other' => 'Other||nobody translated this', 'or' => 'Red||Blue']]])[0];
        $this->assertSame(['phone' => 'Telefon', 'other' => 'Andere', 'or' => 'Red||Blue'], $options['options'], 'A meaning German lacks reads as German says the word.');
        $this->assertSame('This || That', $options['label']);
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
        app('translator')->addLines(['*.Name' => 'Naam', '*.Both' => 'Beide', '*.Nothing yet' => 'Nog niets', '*.New Thing' => 'Nieuw ding', '*.Who You Are' => 'Wie je bent'], 'nl');

        $fields = $translations->fields([['handle' => 'name', 'type' => 'select', 'label' => 'Name', 'section' => 'Who You Are', 'options' => ['a' => 'Both'], 'empty' => 'Nothing yet', 'action' => ['label' => 'New Thing', 'to' => '/things'], 'fields' => [['handle' => 'x', 'label' => 'Name']]]]);

        $this->assertSame('Naam', $fields[0]['label']);
        $this->assertSame('Wie je bent', $fields[0]['section']);
        $this->assertSame('Beide', $fields[0]['options']['a']);
        $this->assertSame('Nog niets', $fields[0]['empty']);
        $this->assertSame(['label' => 'Nieuw ding', 'to' => '/things'], $fields[0]['action']);
        $this->assertSame('Naam', $fields[0]['fields'][0]['label']);
        $this->assertArrayHasKey('nl', $translations->languages());
    }

    public function test_field_definitions_name_the_product_in_english_too(): void
    {
        $translations = app(Translations::class);
        $translations->apply('en');

        $fields = $translations->fields([['handle' => 'url', 'type' => 'url', 'label' => '{brand} URL', 'instructions' => 'Where :brand lives.', 'options' => ['a' => '{brand}']]]);

        $this->assertSame(\Cms\Support\Brand::get().' URL', $fields[0]['label']);
        $this->assertSame('Where '.\Cms\Support\Brand::get().' lives.', $fields[0]['instructions']);
        $this->assertSame(\Cms\Support\Brand::get(), $fields[0]['options']['a']);
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

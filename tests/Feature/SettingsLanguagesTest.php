<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Tests\TestCase;

/** A settings field with `localizable: true` holds one value per language of the site. */
final class SettingsLanguagesTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->cms()->saveSite(['locales' => ['en', 'de', 'pt-BR']]);
        $this->cms()->settingsRegistry()->register('banner', 'Banner', [
            ['handle' => 'enabled', 'type' => 'toggle', 'label' => 'Show the Banner', 'default' => true],
            ['handle' => 'title', 'type' => 'text', 'label' => 'Title', 'max' => 20, 'localizable' => true, 'placeholder' => ['en' => 'Cookies', 'de' => 'Kekse'], 'if' => ['enabled' => true]],
            ['handle' => 'note', 'type' => 'textarea', 'label' => 'Note', 'localizable' => true, 'default' => 'Hello'],
        ]);
    }

    public function test_the_field_is_the_same_field_once_per_language(): void
    {
        $fields = array_column($this->cms()->settingsRegistry()->schemas()['banner']['fields'], null, 'handle');

        $this->assertSame('group', $fields['title']['type']);
        $this->assertSame(['enabled' => true], $fields['title']['if']);
        $this->assertSame(['en', 'de', 'pt_br'], array_column($fields['title']['fields'], 'handle'));
        $this->assertSame(['English', 'Deutsch', 'Português (Brasil)'], array_column($fields['title']['fields'], 'label'));
        $this->assertSame(['text', 'text', 'text'], array_column($fields['title']['fields'], 'type'));
        $this->assertSame([20, 20, 20], array_column($fields['title']['fields'], 'max'));
        $this->assertSame(['Cookies', 'Kekse'], array_column($fields['title']['fields'], 'placeholder'));

        // The defaults are a value per language as well.
        $this->assertSame(['en' => 'Hello', 'de' => 'Hello', 'pt_br' => 'Hello'], $this->cms()->setting('banner', 'note'));
    }

    public function test_a_value_is_saved_and_read_per_language(): void
    {
        $context = AbilityContext::system('test');
        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'banner', 'values' => ['title' => ['en' => 'Cookies?', 'de' => 'Kekse?']]], $context);

        $registry = $this->cms()->settingsRegistry();
        $this->assertSame('Kekse?', $registry->localized('banner', 'title', 'de'));
        $this->assertSame('Cookies?', $registry->localized('banner', 'title'), 'Without a language: the site\'s default.');
        $this->assertSame('—', $registry->localized('banner', 'title', 'pt-BR', '—'), 'A language without a value has none: no other stands in.');

        $read = $this->cms()->abilities()->execute('settings/get', ['namespace' => 'banner'], $context)['values'];
        $this->assertSame(['en' => 'Cookies?', 'de' => 'Kekse?'], array_filter($read['title']));

        // Each language is checked as the field is.
        try {
            $this->cms()->abilities()->execute('settings/update', ['namespace' => 'banner', 'values' => ['title' => ['de' => str_repeat('K', 21)]]], $context);
            $this->fail('A value longer than the field takes is refused in every language.');
        } catch (AbilityException $e) {
            $this->assertSame('invalid_input', $e->type);
        }

        // One language at a time: the others keep theirs.
        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'banner', 'values' => ['title' => ['pt_br' => 'Biscoitos']]], $context);
        $this->assertSame(['en' => 'Cookies?', 'de' => 'Kekse?', 'pt_br' => 'Biscoitos'], $this->cms()->setting('banner', 'title'));

        // A language added later gets its field, and the values of the others stay.
        $this->cms()->saveSite(['locales' => ['en', 'de', 'pt-BR', 'fr']]);
        $fields = array_column($registry->schemas()['banner']['fields'], null, 'handle');
        $this->assertSame(['en', 'de', 'pt_br', 'fr'], array_column($fields['title']['fields'], 'handle'));
        $this->assertSame('Kekse?', $registry->localized('banner', 'title', 'de'));
    }

    public function test_a_secret_with_a_value_per_language_is_masked_language_by_language(): void
    {
        $registry = $this->cms()->settingsRegistry();
        $registry->register('feeds', 'Feeds', [['handle' => 'token', 'type' => 'text', 'secret' => true, 'localizable' => true]]);
        $context = AbilityContext::system('test');

        $saved = $this->cms()->abilities()->execute('settings/update', ['namespace' => 'feeds', 'values' => ['token' => ['en' => 'tok-en', 'de' => 'tok-de']]], $context);
        $this->assertSame(['en' => '••••••••', 'de' => '••••••••', 'pt_br' => ''], $saved['token'] + ['pt_br' => '']);
        $this->assertStringNotContainsString('tok-', (string) file_get_contents(site_path('config/feeds.yaml')));

        // The mask sent back keeps that language's secret; a new value replaces only its own.
        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'feeds', 'values' => ['token' => ['en' => '••••••••', 'de' => 'tok-de-2']]], $context);
        $this->assertSame('tok-en', $registry->localized('feeds', 'token', 'en'));
        $this->assertSame('tok-de-2', $registry->localized('feeds', 'token', 'de'));
    }
}

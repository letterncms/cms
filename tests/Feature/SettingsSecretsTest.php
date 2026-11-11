<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Settings\SettingsRegistry;
use Cms\Tests\TestCase;
use Illuminate\Contracts\Encryption\Encrypter;

/** Secrets are kept in storage/secrets.json, whoever saves what when, and never handed back. */
final class SettingsSecretsTest extends TestCase
{
    private function registry(): SettingsRegistry
    {
        $registry = new SettingsRegistry(app(Encrypter::class));
        $registry->register('mail', 'Mail', [['handle' => 'host', 'type' => 'text'], ['handle' => 'password', 'type' => 'text', 'secret' => true]]);
        $registry->register('shop', 'Shop', [['handle' => 'currency', 'type' => 'text'], ['handle' => 'api_key', 'type' => 'text', 'secret' => true]]);

        return $registry;
    }

    public function test_a_secret_saved_meanwhile_by_another_request_is_kept(): void
    {
        // Two requests at once: each has read the secrets before the other one saves.
        $first = $this->registry();
        $second = $this->registry();
        $this->assertSame('', (string) $first->get('mail', 'password'));
        $this->assertSame('', (string) $second->get('shop', 'api_key'));

        $second->save('shop', ['api_key' => 'sk-shop']);
        $first->save('mail', ['password' => 'mail-pass']);

        $fresh = $this->registry();
        $this->assertSame('mail-pass', $fresh->get('mail', 'password'));
        $this->assertSame('sk-shop', $fresh->get('shop', 'api_key'), 'The save of another namespace must not drop a secret it never read.');

        // The one that saved last also sees what the other saved.
        $this->assertSame('sk-shop', $first->get('shop', 'api_key'));
    }

    public function test_the_same_secret_saved_twice_keeps_the_last(): void
    {
        $first = $this->registry();
        $second = $this->registry();
        $first->get('mail');
        $second->get('mail');

        $first->save('mail', ['password' => 'one']);
        $second->save('mail', ['host' => 'smtp.example.com']);

        $fresh = $this->registry();
        $this->assertSame('one', $fresh->get('mail', 'password'), 'Leaving a secret out of a save keeps what is stored now, not what was read before.');
        $this->assertSame('smtp.example.com', $fresh->get('mail', 'host'));
    }

    public function test_a_file_of_secrets_this_key_cannot_read_is_never_written_over(): void
    {
        $this->registry()->save('shop', ['api_key' => 'sk-shop']);
        $file = storage_path('secrets.json');
        file_put_contents($file, $other = (new \Illuminate\Encryption\Encrypter(random_bytes(32), 'aes-256-cbc'))->encryptString('{"shop":{"api_key":"sk-old"}}'));

        // Read with this key it holds nothing, and the site goes on.
        $this->assertSame('', (string) $this->registry()->get('shop', 'api_key'));

        try {
            $this->registry()->save('mail', ['password' => 'new']);
            $this->fail('A save would have dropped every secret in the file.');
        } catch (\Cms\Abilities\AbilityException $e) {
            $this->assertSame('conflict', $e->type);
        }

        $this->assertSame($other, file_get_contents($file));
    }

    public function test_settings_update_and_get_never_answer_with_a_secret(): void
    {
        $registry = $this->cms()->settingsRegistry();
        $registry->register('shop', 'Shop', [['handle' => 'currency', 'type' => 'text'], ['handle' => 'api_key', 'type' => 'text', 'secret' => true], ['handle' => 'keys', 'type' => 'json', 'secret' => true]]);
        $context = AbilityContext::system('test');
        $abilities = $this->cms()->abilities();

        $saved = $abilities->execute('settings/update', ['namespace' => 'shop', 'values' => ['currency' => 'EUR', 'api_key' => 'sk-live-1', 'keys' => ['a' => 'sk-2']]], $context);
        $this->assertSame(['EUR', '••••••••', '••••••••'], [$saved['currency'], $saved['api_key'], $saved['keys']]);

        // A plugin may take a secret's field away (Brevo does while another key serves): what was saved stays hidden.
        $this->cms()->hooks()->addFilter('settings.fields', static fn (array $fields, string $namespace) => $namespace === 'shop' ? array_values(array_filter($fields, static fn (array $f) => $f['handle'] === 'currency')) : $fields);
        $registry->forget('shop');

        $saved = $abilities->execute('settings/update', ['namespace' => 'shop', 'values' => ['currency' => 'USD']], $context);
        $read = $abilities->execute('settings/get', ['namespace' => 'shop'], $context)['values'];

        foreach ([$saved, $read] as $values) {
            $this->assertStringNotContainsString('sk-', (string) json_encode($values));
        }
        $this->assertSame('USD', $saved['currency']);
        $this->assertSame('sk-live-1', $registry->get('shop', 'api_key'), 'The secret itself is kept.');
        $this->assertStringNotContainsString('sk-', (string) file_get_contents(site_path('config/shop.yaml')), 'A secret is never written to the settings file.');
    }
}

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
}

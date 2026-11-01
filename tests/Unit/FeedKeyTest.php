<?php

declare(strict_types=1);

namespace Cms\Tests\Unit;

use Cms\Support\Crypto\Base64Url;
use Cms\Support\Files;
use Cms\Trust\Envelope;
use Cms\Trust\PackageSignature;
use Cms\Trust\TrustStore;
use PHPUnit\Framework\TestCase;

/** The key a schedule re-signs the update feed with is worth little to whoever steals it. */
final class FeedKeyTest extends TestCase
{
    private string $dir;

    private string $root;

    private string $feed;

    private TrustStore $store;

    protected function setUp(): void
    {
        $this->dir = sys_get_temp_dir().'/cms-feed-key-'.bin2hex(random_bytes(6));
        mkdir($this->dir);
        $this->root = sodium_crypto_sign_keypair();
        $this->feed = sodium_crypto_sign_keypair();

        file_put_contents($this->dir.'/trust.json', Envelope::sign('cms-trust', [
            'type' => 'cms-trust', 'epoch' => 1, 'version' => 1, 'issued' => gmdate('Y-m-d\TH:i:s\Z'),
            'roots' => [['kid' => 'root', 'pub' => Base64Url::encode(sodium_crypto_sign_publickey($this->root))]],
            'keys' => [['kid' => 'feed', 'role' => 'feed', 'pub' => Base64Url::encode(sodium_crypto_sign_publickey($this->feed)), 'nbf' => '2026-01-01', 'not_after' => null]],
            'revoked' => [], 'license_family' => 'test', 'endpoints' => [],
        ], ['root' => sodium_crypto_sign_secretkey($this->root)]));

        $this->store = new TrustStore($this->dir.'/trust.json', $this->dir.'/state', 'default');
    }

    protected function tearDown(): void
    {
        Files::deleteDirectory($this->dir);
    }

    private function signed(string $type): string
    {
        return Envelope::sign($type, ['type' => $type, 'version' => 2, 'issued' => gmdate('Y-m-d\TH:i:s\Z')], ['feed' => sodium_crypto_sign_secretkey($this->feed)]);
    }

    public function test_it_keeps_the_update_list_fresh(): void
    {
        $this->assertNotNull($this->store->openFeed($this->signed('cms-updates'), 'cms-updates', time()));
    }

    public function test_it_cannot_sign_a_store_catalog(): void
    {
        $this->assertNull($this->store->openFeed($this->signed('cms-catalog'), 'cms-catalog', time()));
    }

    public function test_it_cannot_sign_a_release(): void
    {
        $entry = ['version' => '9.9.9', 'sha256' => str_repeat('a', 64), 'released_at' => '2026-11-01T00:00:00Z', 'kid' => 'feed'];
        $entry['sig'] = PackageSignature::sign('letterncms/cms', $entry, sodium_crypto_sign_secretkey($this->feed));

        $this->assertFalse($this->store->versionVerifies('letterncms/cms', $entry));
    }
}

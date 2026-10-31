<?php

declare(strict_types=1);

namespace Cms\Tests\Unit;

use Cms\Users\Totp;
use PHPUnit\Framework\TestCase;

final class TotpTest extends TestCase
{
    public function test_rfc6238_vector(): void
    {
        // RFC 6238 SHA-1 secret "12345678901234567890" in base32.
        $secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

        $this->assertSame('287082', Totp::code($secret, intdiv(59, 30)));
        $this->assertTrue(Totp::verify($secret, '287082', 0, 59));
        $this->assertFalse(Totp::verify($secret, '287083', 0, 59));
    }

    public function test_generated_secret_round_trips(): void
    {
        $secret = Totp::secret();
        $code = Totp::code($secret, intdiv(time(), 30));

        $this->assertTrue(Totp::verify($secret, $code));
        $this->assertCount(8, Totp::recoveryCodes());
    }
}

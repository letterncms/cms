<?php

declare(strict_types=1);

namespace Cms\Modules\License\Tests;

use Cms\Modules\License\Token\Paseto;
use Cms\Support\Crypto\Ed25519;
use Cms\Tests\TestCase;
use PHPUnit\Framework\Attributes\After;

/** PASETO v4.public against the published vectors, under each backend. */
final class TokenTest extends TestCase
{
    private const string SECRET = 'b4cbfb43df4ce210727d953e4a713307fa19bb7d9f85041438d9e11b942a37741eb9dbbbbc047c03fd70604e0071f0987e16b28b757225c11f00415d0e20b1a2';

    private const string PUBLIC = '1eb9dbbbbc047c03fd70604e0071f0987e16b28b757225c11f00415d0e20b1a2';

    private const string MESSAGE = '{"data":"this is a signed message","exp":"2022-01-01T00:00:00+00:00"}';

    private const string VECTOR_1 = 'v4.public.eyJkYXRhIjoidGhpcyBpcyBhIHNpZ25lZCBtZXNzYWdlIiwiZXhwIjoiMjAyMi0wMS0wMVQwMDowMDowMCswMDowMCJ9bg_XBBzds8lTZShVlwwKSgeKpLT3yukTw6JUz3W4h_ExsQV-P0V54zemZDcAxFaSeef1QlXEFtkqxT1ciiQEDA';

    private const string VECTOR_2 = 'v4.public.eyJkYXRhIjoidGhpcyBpcyBhIHNpZ25lZCBtZXNzYWdlIiwiZXhwIjoiMjAyMi0wMS0wMVQwMDowMDowMCswMDowMCJ9v3Jt8mx_TdM2ceTGoqwrh4yDFn0XsHvvV_D0DtwQxVrJEBMl0F2caAdgnpKlt4p7xBnx1HcO-SPo8FPp214HDw.eyJraWQiOiJ6VmhNaVBCUDlmUmYyc25FY1Q3Z0ZUaW9lQTlDT2NOeTlEZmdMMVc2MGhhTiJ9';

    private const string FOOTER = '{"kid":"zVhMiPBP9fRf2snEcT7gFTioeA9COcNy9DfgL1W60haN"}';

    #[After]
    public function resetBackends(): void
    {
        Ed25519::$backends = null;
    }

    /** @return array<string, array{0: list<string>}> */
    public static function backends(): array
    {
        return ['sodium' => [['sodium']], 'openssl' => [['openssl']]];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('backends')]
    public function test_the_published_vectors_verify(array $backend): void
    {
        Ed25519::$backends = $backend;
        $public = hex2bin(self::PUBLIC);

        $parts = Paseto::parse(self::VECTOR_1);
        $this->assertSame(self::MESSAGE, $parts['message']);
        $this->assertTrue(Paseto::verify($parts, '', $public));

        $parts = Paseto::parse(self::VECTOR_2);
        $this->assertSame(self::FOOTER, $parts['footer']);
        $this->assertTrue(Paseto::verify($parts, '', $public));
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('backends')]
    public function test_signing_reproduces_the_vectors_byte_for_byte(array $backend): void
    {
        Ed25519::$backends = $backend;

        $this->assertSame(self::VECTOR_1, Paseto::sign(self::MESSAGE, '', '', hex2bin(self::SECRET)));
        $this->assertSame(self::VECTOR_2, Paseto::sign(self::MESSAGE, self::FOOTER, '', hex2bin(self::SECRET)));
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('backends')]
    public function test_anything_changed_fails(array $backend): void
    {
        Ed25519::$backends = $backend;
        $public = hex2bin(self::PUBLIC);
        $parts = Paseto::parse(self::VECTOR_2);

        $this->assertFalse(Paseto::verify($parts, 'wrong implicit', $public));
        $this->assertFalse(Paseto::verify([...$parts, 'footer' => '{"kid":"other"}'], '', $public));
        $this->assertFalse(Paseto::verify([...$parts, 'message' => $parts['message'].' '], '', $public));
        $this->assertFalse(Paseto::verify($parts, '', str_repeat("\0", 32)));
    }

    public function test_malformed_or_oversized_tokens_are_not_parsed(): void
    {
        $this->assertNull(Paseto::parse('v3.public.abc'));
        $this->assertNull(Paseto::parse('v4.public.'));
        $this->assertNull(Paseto::parse('v4.public.!!!'));
        $this->assertNull(Paseto::parse('v4.public.'.str_repeat('a', 5000)));
        $this->assertNull(Paseto::parse('v4.public.a.b.c'));
    }

    public function test_openssl_error_is_not_read_as_valid(): void
    {
        Ed25519::$backends = ['openssl'];

        // openssl_verify answers -1 on error, and -1 is truthy.
        $this->assertFalse(Ed25519::verify('message', str_repeat('x', 64), str_repeat('y', 32)));
        $this->assertFalse(Ed25519::verify('message', 'short', str_repeat('y', 32)));
    }

    public function test_keys_generated_under_one_backend_verify_under_the_other(): void
    {
        foreach ([['sodium', 'openssl'], ['openssl', 'sodium']] as [$a, $b]) {
            Ed25519::$backends = [$a];
            [$public, $private] = Ed25519::generate();
            $signature = Ed25519::sign('hello', $private);

            Ed25519::$backends = [$b];
            $this->assertTrue(Ed25519::verify('hello', $signature, $public), "{$a} to {$b}");
            $this->assertFalse(Ed25519::verify('hello!', $signature, $public));
        }

        Ed25519::$backends = [];
        $this->assertFalse(Ed25519::available());
        $this->assertFalse(Ed25519::verify('hello', str_repeat('x', 64), str_repeat('y', 32)));
    }
}

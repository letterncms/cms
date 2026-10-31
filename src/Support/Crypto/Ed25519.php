<?php

declare(strict_types=1);

namespace Cms\Support\Crypto;

use RuntimeException;
use Throwable;

/**
 * Ed25519 on any host: sodium when PHP has it, else OpenSSL, which PHP 8.4 (the minimum)
 * supports. Raw keys: 32 public bytes; 64 private bytes (seed followed by the public key).
 */
final class Ed25519
{
    private const string SPKI_PREFIX = '302a300506032b6570032100';

    private const string PKCS8_PREFIX = '302e020100300506032b657004220420';

    /** @var list<'sodium'|'openssl'>|null Tests narrow this to force a backend, or pass [] for a host with neither. */
    public static ?array $backends = null;

    public static function available(): bool
    {
        return self::backends() !== [];
    }

    /** Never throws: anything but a good signature is false. */
    public static function verify(string $message, string $signature, string $rawPublicKey): bool
    {
        if (strlen($signature) !== 64 || strlen($rawPublicKey) !== 32) {
            return false;
        }

        foreach (self::backends() as $backend) {
            try {
                return $backend === 'sodium'
                    ? sodium_crypto_sign_verify_detached($signature, $message, $rawPublicKey)
                    // Algorithm 0 is the only one Ed25519 accepts, and -1 (an error) is truthy: only 1 counts.
                    : openssl_verify($message, $signature, self::publicPem($rawPublicKey), 0) === 1;
            } catch (Throwable) {
                return false;
            }
        }

        return false;
    }

    /** @return array{0: string, 1: string} [rawPublic, rawPrivate] */
    public static function generate(): array
    {
        foreach (self::backends() as $backend) {
            if ($backend === 'sodium') {
                $pair = sodium_crypto_sign_keypair();

                return [sodium_crypto_sign_publickey($pair), sodium_crypto_sign_secretkey($pair)];
            }

            $key = openssl_pkey_new(['private_key_type' => OPENSSL_KEYTYPE_ED25519]);
            $details = $key ? openssl_pkey_get_details($key) : false;

            if ($details && isset($details['ed25519'])) {
                return [$details['ed25519']['pub_key'], $details['ed25519']['priv_key'].$details['ed25519']['pub_key']];
            }
        }

        throw new RuntimeException('This PHP has no Ed25519: install the sodium or openssl extension.');
    }

    public static function sign(string $message, string $rawPrivateKey): string
    {
        foreach (self::backends() as $backend) {
            if ($backend === 'sodium') {
                return sodium_crypto_sign_detached($message, $rawPrivateKey);
            }

            $pem = "-----BEGIN PRIVATE KEY-----\n".chunk_split(base64_encode(hex2bin(self::PKCS8_PREFIX).substr($rawPrivateKey, 0, 32)), 64, "\n")."-----END PRIVATE KEY-----\n";

            if (openssl_sign($message, $signature, $pem, 0)) {
                return $signature;
            }
        }

        throw new RuntimeException('This PHP has no Ed25519: install the sodium or openssl extension.');
    }

    /** @return list<'sodium'|'openssl'> */
    private static function backends(): array
    {
        return array_values(array_filter(self::$backends ?? ['sodium', 'openssl'], static fn (string $backend) => match ($backend) {
            'sodium' => function_exists('sodium_crypto_sign_verify_detached'),
            'openssl' => function_exists('openssl_verify') && defined('OPENSSL_KEYTYPE_ED25519'),
            default => false,
        }));
    }

    private static function publicPem(string $rawPublicKey): string
    {
        return "-----BEGIN PUBLIC KEY-----\n".chunk_split(base64_encode(hex2bin(self::SPKI_PREFIX).$rawPublicKey), 64, "\n")."-----END PUBLIC KEY-----\n";
    }
}

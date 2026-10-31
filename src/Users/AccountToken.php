<?php

declare(strict_types=1);

namespace Cms\Users;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

/**
 * A link we mailed: the mailbox's proof for one sign-up, reset or address change. Only a hash
 * is stored, opening the link consumes nothing (mail scanners open links), and a token works once.
 *
 * @property ?string $user_id
 * @property string $email
 * @property string $type
 * @property string $hash
 * @property ?array $payload
 * @property \Illuminate\Support\Carbon $expires_at
 * @property ?\Illuminate\Support\Carbon $used_at
 */
final class AccountToken extends Model
{
    use HasUlids;

    public const string SIGN_UP = 'signup';

    public const string RESET = 'reset';

    public const string EMAIL = 'email';

    public const null UPDATED_AT = null;

    protected $table = 'account_tokens';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['payload' => 'array', 'expires_at' => 'datetime', 'used_at' => 'datetime'];
    }

    /** @return string the token for the link, shown only here */
    public static function issue(string $type, string $email, DateTimeInterface $expires, ?User $user = null, array $payload = []): string
    {
        // A new link replaces the last one of its kind.
        self::query()->where('type', $type)->where('email', $email)->whereNull('used_at')->update(['used_at' => now()]);

        $plain = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');

        self::query()->create(['type' => $type, 'email' => $email, 'user_id' => $user?->getKey(), 'hash' => self::hashOf($plain), 'payload' => $payload ?: null, 'expires_at' => $expires]);

        return $plain;
    }

    /** A token of this type that can still be used. */
    public static function live(?string $plain, string $type): ?self
    {
        if (! is_string($plain) || $plain === '') {
            return null;
        }

        return self::query()->where('hash', self::hashOf($plain))->where('type', $type)->whereNull('used_at')->where('expires_at', '>', now())->first();
    }

    /** Use it. Only the first caller gets true, even in parallel. */
    public function consume(): bool
    {
        return self::query()->whereKey($this->getKey())->whereNull('used_at')->update(['used_at' => now()]) === 1;
    }

    public static function prune(): void
    {
        self::query()->where('expires_at', '<', now()->subDays(7))->delete();
    }

    private static function hashOf(string $plain): string
    {
        return hash('sha256', $plain);
    }
}

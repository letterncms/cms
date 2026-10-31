<?php

declare(strict_types=1);

namespace Cms\Users;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * Personal access token. Only a SHA-256 hash is stored; the plain token is
 * shown once. Format: cms_<40 random chars>.
 */
class ApiToken extends Model
{
    use HasUlids;

    public const string PREFIX = 'cms_';

    protected $table = 'api_tokens';

    protected $fillable = ['name', 'token_hash', 'scopes', 'expires_at'];

    protected $hidden = ['token_hash'];

    protected function casts(): array
    {
        return ['scopes' => 'array', 'last_used_at' => 'datetime', 'expires_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return array{0: self, 1: string} [token, plainText] */
    public static function issue(User $user, string $name, array $scopes = ['*'], ?\DateTimeInterface $expires = null): array
    {
        $plain = self::PREFIX.Str::random(40);

        $token = $user->tokens()->create([
            'name' => $name,
            'token_hash' => hash('sha256', $plain),
            'scopes' => array_values($scopes),
            'expires_at' => $expires,
        ]);

        return [$token, $plain];
    }

    public static function findByPlain(string $plain): ?self
    {
        if (! str_starts_with($plain, self::PREFIX) || strlen($plain) !== strlen(self::PREFIX) + 40) {
            return null;
        }

        $token = static::query()->where('token_hash', hash('sha256', $plain))->first();

        if (! $token || ($token->expires_at && $token->expires_at->isPast())) {
            return null;
        }

        return $token;
    }

    public function touchUsage(): void
    {
        if (! $this->last_used_at || $this->last_used_at->lt(now()->subMinute())) {
            $this->forceFill(['last_used_at' => now()])->saveQuietly();
        }
    }

    public function toPublic(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'scopes' => $this->scopes,
            'lastUsedAt' => $this->last_used_at?->toIso8601String(),
            'expiresAt' => $this->expires_at?->toIso8601String(),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}

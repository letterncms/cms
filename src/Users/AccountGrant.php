<?php

declare(strict_types=1);

namespace Cms\Users;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

/**
 * Something a person holds: "course-php", "magazine". The word means whatever the site or a
 * plugin says it means; the gate only compares it. `source` says who gave it, so a plugin
 * removes only what it gave.
 *
 * @property string $user_id
 * @property string $access
 * @property string $source
 * @property ?\Illuminate\Support\Carbon $expires_at
 */
final class AccountGrant extends Model
{
    use HasUlids;

    protected $table = 'account_grants';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime'];
    }

    /** @param Builder<self> $query */
    public function scopeLive(Builder $query): void
    {
        $query->where(static fn (Builder $q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()));
    }

    public function toPublic(): array
    {
        return ['access' => $this->access, 'source' => $this->source, 'expiresAt' => $this->expires_at?->toIso8601String()];
    }
}

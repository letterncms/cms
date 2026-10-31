<?php

declare(strict_types=1);

namespace Cms\Users;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Str;
use Cms\Support\RecordTimestamps;

/**
 * @property string $id
 * @property string $name
 * @property string $email
 * @property list<string> $roles
 * @property bool $super
 * @property array $preferences
 * @property array|null $data  Profile values for the fields in content/users.yaml (see UserFields)
 * @property ?string $two_factor_secret
 * @property ?\Illuminate\Support\Carbon $two_factor_confirmed_at
 */
class User extends Authenticatable
{
    use HasUlids;

    protected $table = 'users';

    protected $fillable = ['name', 'email', 'password', 'roles', 'super', 'locale', 'preferences', 'avatar', 'data'];

    protected $hidden = ['password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes'];

    /** @var array<string, list<string>>|null */
    private ?array $grantCache = null;

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'roles' => 'array',
            'preferences' => 'array',
            'data' => 'array',
            'super' => 'boolean',
            'two_factor_secret' => 'encrypted',
            'two_factor_recovery_codes' => 'encrypted:array',
            'two_factor_confirmed_at' => 'datetime',
            'last_login_at' => 'datetime',
            'email_verified_at' => 'datetime',
        ];
    }

    /** @param Builder<self> $query People with a way into the admin. */
    public function scopeTeam(Builder $query): void
    {
        $query->where(static function (Builder $q): void {
            $q->where('super', true);

            foreach (app(Accounts::class)->teamRoles() as $role) {
                $q->orWhereJsonContains('roles', $role);
            }
        });
    }

    /** @param Builder<self> $query Site visitors: everyone else. */
    public function scopeVisitors(Builder $query): void
    {
        $query->where('super', false)->where(static function (Builder $q): void {
            $q->whereNull('roles')->orWhere(static function (Builder $q): void {
                foreach (app(Accounts::class)->teamRoles() as $role) {
                    $q->whereJsonDoesntContain('roles', $role);
                }
            });
        });
    }

    public function tokens(): HasMany
    {
        return $this->hasMany(ApiToken::class);
    }

    /**
     * Wildcard-aware permission check. With $any, a pattern like "entries.*.edit"
     * is granted when the user holds it for at least one collection.
     */
    public function hasPermission(string $permission, bool $any = false): bool
    {
        if ($this->super) {
            return true;
        }

        foreach ($this->grants() as $grant) {
            if ($grant === '*' || $grant === $permission || Str::is($grant, $permission) || ($any && Str::is($permission, $grant))) {
                return true;
            }
        }

        return false;
    }

    /** @return list<string> */
    public function grants(): array
    {
        return $this->grantCache ??= app(Roles::class)->permissionsFor((array) ($this->roles ?? []));
    }

    public function hasTwoFactor(): bool
    {
        return $this->two_factor_confirmed_at !== null && $this->two_factor_secret !== null;
    }

    public function initials(): string
    {
        $parts = preg_split('/\s+/', trim($this->name)) ?: [];

        return mb_strtoupper(mb_substr($parts[0] ?? '?', 0, 1).mb_substr($parts[count($parts) - 1] ?? '', 0, count($parts) > 1 ? 1 : 0));
    }

    /** Safe identity for authors, relations and mentions; no account details. */
    public function toPerson(): array
    {
        return ['id' => $this->id, 'name' => $this->name, 'initials' => $this->initials(), 'avatar' => $this->avatar];
    }

    public function toPublic(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'initials' => $this->initials(),
            'roles' => $this->roles ?? [],
            'super' => (bool) $this->super,
            'locale' => $this->locale,
            'status' => $this->status ?? Accounts::ACTIVE,
            'visitor' => ! $this->hasPermission('admin.access'),
            'twoFactor' => $this->hasTwoFactor(),
            'lastLoginAt' => $this->last_login_at?->toIso8601String(),
            'createdAt' => $this->created_at?->toIso8601String(),
            ...RecordTimestamps::api(['published_at' => null, 'updated_at' => $this->updated_at]),
            'data' => (object) app(UserFields::class)->values($this),
        ];
    }
}

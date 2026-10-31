<?php

declare(strict_types=1);

namespace Cms\Abilities;

use Cms\Users\User;

/** Who is executing an ability, and through which transport. */
final readonly class AbilityContext
{
    /**
     * @param  list<string>|null  $scopes  Token scopes (ability name patterns); null = unrestricted
     */
    public function __construct(
        public ?User $user,
        public string $transport,
        public bool $system = false,
        public ?array $scopes = null,
        public ?string $requestId = null,
    ) {}

    public static function system(string $transport = 'internal'): self
    {
        return new self(null, $transport, system: true);
    }

    public static function forUser(?User $user, string $transport = 'internal', ?array $scopes = null): self
    {
        return new self($user, $transport, scopes: $scopes);
    }

    public function can(string $permission): bool
    {
        return $this->system || ($this->user?->hasPermission($permission) ?? false);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Abilities;

use Cms\Users\User;

/** Who is executing an ability, and through which transport. */
final readonly class AbilityContext
{
    /**
     * @param  list<string>|null  $scopes  Token scopes (ability name patterns); null = unrestricted
     * @param  bool  $strings  The input came as text (a query string, a shell): "5" is read as 5 and "true" as true where the schema asks for it
     */
    public function __construct(
        public ?User $user,
        public string $transport,
        public bool $system = false,
        public ?array $scopes = null,
        public ?string $requestId = null,
        public bool $strings = false,
    ) {}

    public static function system(string $transport = 'internal'): self
    {
        return new self(null, $transport, system: true);
    }

    public static function forUser(?User $user, string $transport = 'internal', ?array $scopes = null, bool $strings = false): self
    {
        return new self($user, $transport, scopes: $scopes, strings: $strings);
    }

    public function can(string $permission): bool
    {
        return $this->system || ($this->user?->hasPermission($permission) ?? false);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Abilities;

use RuntimeException;
use Throwable;

final class AbilityException extends RuntimeException
{
    /** @param array<string, string> $details */
    public function __construct(
        string $message,
        public readonly string $type = 'failed',
        public readonly array $details = [],
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }

    public static function notFound(string $name): self
    {
        return new self(__('Unknown ability :name.', ['name' => $name]), 'not_found');
    }

    public static function forbidden(?string $message = null): self
    {
        return new self($message ?? __('You are not allowed to do this.'), 'forbidden');
    }

    public static function invalid(string $message, array $details = []): self
    {
        return new self($message, 'invalid_input', $details);
    }

    public static function conflict(string $message): self
    {
        return new self($message, 'conflict');
    }

    public function status(): int
    {
        return match ($this->type) {
            'not_found' => 404,
            'forbidden' => 403,
            'unauthenticated' => 401,
            'invalid_input' => 422,
            'conflict' => 409,
            'rate_limited' => 429,
            default => 500,
        };
    }

    public function toArray(): array
    {
        return array_filter([
            'type' => $this->type,
            // Written in English; the admin reads them in the user's language (see Cms\Admin\Translations).
            'message' => __($this->getMessage()),
            'details' => array_map(static fn ($detail) => is_string($detail) ? __($detail) : $detail, $this->details) ?: null,
        ]);
    }
}

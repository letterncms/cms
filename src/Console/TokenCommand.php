<?php

declare(strict_types=1);

namespace Cms\Console;

use Cms\Users\ApiToken;
use Cms\Users\User;

final class TokenCommand extends Command
{
    protected $signature = 'token:create {email} {--name=CLI token} {--scope=* : Ability patterns, default *} {--days= : Expire after N days}';

    protected $description = 'Create an API token for a user (REST API and MCP)';

    public function handle(): int
    {
        $user = User::query()->where('email', strtolower((string) $this->argument('email')))->first();

        if (! $user) {
            return $this->failure('User not found.', 'not_found');
        }

        [$token, $plain] = ApiToken::issue($user, (string) $this->option('name'), $this->option('scope') ?: ['*'], $this->option('days') ? now()->addDays((int) $this->option('days')) : null);

        $this->line($plain);
        $this->components->warn('Store this token now — it is not shown again.');

        return $this->done(['token' => $plain, 'name' => $token->name, 'scopes' => $token->scopes, 'expiresAt' => $token->expires_at?->toIso8601String()]);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Context;

use Closure;
use Cms\Users\User;

/**
 * Read-only knowledge for agents (MCP resources, assistant context): design
 * tokens, block catalog, collections, writing guidelines… Each resource
 * has a stable URI like cms://site/tokens.
 */
final class ContextRegistry
{
    /** @var array<string, array{uri: string, name: string, description: string, mimeType: string, resolver: Closure, permission: ?string}> */
    private array $resources = [];

    public function register(string $uri, string $name, string $description, Closure $resolver, string $mimeType = 'application/json', ?string $permission = 'admin.access'): void
    {
        $this->resources[$uri] = compact('uri', 'name', 'description', 'mimeType', 'resolver', 'permission');
    }

    /** @return list<array{uri: string, name: string, description: string, mimeType: string}> */
    public function list(?User $user): array
    {
        $out = [];

        foreach ($this->resources as $resource) {
            if ($this->allowed($resource, $user)) {
                $out[] = array_diff_key($resource, ['resolver' => 1, 'permission' => 1]);
            }
        }

        return $out;
    }

    /** @return array{uri: string, mimeType: string, text: string}|null */
    public function read(string $uri, ?User $user): ?array
    {
        $resource = $this->resources[$uri] ?? null;

        if (! $resource || ! $this->allowed($resource, $user)) {
            return null;
        }

        $content = ($resource['resolver'])();
        $text = is_string($content) ? $content : json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return ['uri' => $uri, 'mimeType' => $resource['mimeType'], 'text' => (string) $text];
    }

    private function allowed(array $resource, ?User $user): bool
    {
        return $resource['permission'] === null || ($user?->hasPermission($resource['permission']) ?? false);
    }
}

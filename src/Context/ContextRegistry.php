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

    /** @var array<string, array{uriTemplate: string, name: string, description: string, mimeType: string, resolver: Closure, values: ?Closure, permission: ?string}> */
    private array $templates = [];

    /**
     * A family of resources, one per value of the `{placeholders}` in its URI (cms://collections/{handle}/schema).
     * The resolver gets the values and answers null when there is no such resource; `values` lists the ones
     * there are, each as its placeholders and a `name`, so a client can see them without guessing.
     */
    public function template(string $uriTemplate, string $name, string $description, Closure $resolver, ?Closure $values = null, string $mimeType = 'application/json', ?string $permission = 'admin.access'): void
    {
        $this->templates[$uriTemplate] = compact('uriTemplate', 'name', 'description', 'mimeType', 'resolver', 'values', 'permission');
    }

    /** @return list<array{uriTemplate: string, name: string, description: string, mimeType: string}> */
    public function templates(?User $user): array
    {
        return array_values(array_map(
            static fn (array $template) => array_diff_key($template, ['resolver' => 1, 'values' => 1, 'permission' => 1]),
            array_filter($this->templates, fn (array $template) => $this->allowed($template, $user)),
        ));
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

        foreach ($this->templates as $template) {
            if (! $template['values'] || ! $this->allowed($template, $user)) {
                continue;
            }

            foreach (($template['values'])() as $values) {
                $out[] = [
                    'uri' => strtr($template['uriTemplate'], array_combine(array_map(static fn ($key) => '{'.$key.'}', array_keys($values)), array_map('strval', $values)) ?: []),
                    'name' => $template['name'].': '.($values['name'] ?? implode(' ', $values)),
                    'description' => $template['description'],
                    'mimeType' => $template['mimeType'],
                ];
            }
        }

        return $out;
    }

    /** @return array{uri: string, mimeType: string, text: string}|null */
    public function read(string $uri, ?User $user): ?array
    {
        $resource = $this->resources[$uri] ?? null;
        $content = null;

        if ($resource && $this->allowed($resource, $user)) {
            $content = ($resource['resolver'])();
        } elseif (! $resource) {
            foreach ($this->templates as $template) {
                $pattern = '#^'.preg_replace('/\\\{(\w+)\\\}/', '(?<$1>[^/]+)', preg_quote($template['uriTemplate'], '#')).'$#';

                if ($this->allowed($template, $user) && preg_match($pattern, $uri, $match)) {
                    $resource = $template;
                    $content = ($template['resolver'])(array_filter($match, 'is_string', ARRAY_FILTER_USE_KEY));

                    break;
                }
            }
        }

        if ($content === null) {
            return null;
        }

        $text = is_string($content) ? $content : json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return ['uri' => $uri, 'mimeType' => $resource['mimeType'], 'text' => (string) $text];
    }

    private function allowed(array $resource, ?User $user): bool
    {
        return $resource['permission'] === null || ($user?->hasPermission($resource['permission']) ?? false);
    }
}

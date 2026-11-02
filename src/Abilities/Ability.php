<?php

declare(strict_types=1);

namespace Cms\Abilities;

use Closure;
use InvalidArgumentException;

/**
 * A named, schema-described unit of work. Every transport (REST, MCP, CLI,
 * admin, assistant) executes abilities through the same executor.
 */
final class Ability
{
    /**
     * @param  array<string, mixed>  $input  JSON schema for the input object
     * @param  array<string, mixed>|null  $output  JSON schema for the result
     * @param  string|Closure|null  $permission  Permission name (supports {placeholders} from input) or fn(?User, array $input): bool
     * @param  Closure|string|array  $handler  fn(array $input, AbilityContext $ctx): mixed, "Class@method", invokable class, or [Class, method]
     * @param  array{readOnly?: bool, destructive?: bool, idempotent?: bool, openWorld?: bool, trustedOutput?: bool, draft?: bool}  $annotations
     * @param  array{rest?: bool, mcp?: bool, cli?: bool, assistant?: bool}  $expose
     */
    public function __construct(
        public readonly string $name,
        public readonly string $label,
        public readonly string $description,
        public readonly Closure|string|array $handler,
        public readonly array $input = ['type' => 'object', 'properties' => []],
        public readonly ?array $output = null,
        public readonly string|Closure|null $permission = null,
        public readonly string $category = 'general',
        public readonly array $annotations = [],
        public readonly array $expose = [],
        public readonly ?string $package = null,
    ) {
        if (! preg_match('#^[a-z0-9-]+/[a-z0-9-]+(\.[a-z0-9-]+)*$#', $name)) {
            throw new InvalidArgumentException("Ability name must look like namespace/name, got {$name}.");
        }
    }

    public static function make(string $name, array $config): self
    {
        return new self(
            name: $name,
            label: $config['label'] ?? $name,
            description: $config['description'] ?? '',
            handler: $config['handler'] ?? throw new InvalidArgumentException("Ability {$name} needs a handler."),
            input: $config['input'] ?? ['type' => 'object', 'properties' => []],
            output: $config['output'] ?? null,
            permission: $config['permission'] ?? null,
            category: $config['category'] ?? explode('/', $name)[0],
            annotations: $config['annotations'] ?? [],
            expose: $config['expose'] ?? [],
            package: $config['package'] ?? \Cms\Packages\Scope::$current,
        );
    }

    public function exposedTo(string $transport): bool
    {
        return (bool) ($this->expose[$transport] ?? true);
    }

    public function isReadOnly(): bool
    {
        return (bool) ($this->annotations['readOnly'] ?? false);
    }

    public function isDestructive(): bool
    {
        return (bool) ($this->annotations['destructive'] ?? false);
    }

    /** Public description used by REST discovery, MCP tools/list and the assistant. */
    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'label' => $this->label,
            'description' => $this->description,
            'category' => $this->category,
            'input' => $this->input === [] ? ['type' => 'object'] : $this->input,
            'output' => $this->output,
            'annotations' => $this->annotations ?: null,
            'package' => $this->package,
        ], static fn ($v) => $v !== null);
    }
}

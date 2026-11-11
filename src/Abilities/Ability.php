<?php

declare(strict_types=1);

namespace Cms\Abilities;

use Closure;
use Cms\Support\Schema\Shape;
use InvalidArgumentException;

/**
 * A named, schema-described unit of work. Every transport (REST, MCP, CLI,
 * admin, assistant) executes abilities through the same executor.
 */
final class Ability
{
    /**
     * @param  array<string, mixed>  $input  JSON schema for the input object
     * @param  array<string, mixed>|Shape|null  $output  JSON schema for the result, or its short form (see Shape). Read it with output()
     * @param  string|Closure|null  $permission  Permission name (supports {placeholders} from input) or fn(?User, array $input): bool
     * @param  Closure|string|array  $handler  fn(array $input, AbilityContext $ctx): mixed, "Class@method", invokable class, or [Class, method]
     * @param  array{readOnly?: bool, destructive?: bool, idempotent?: bool, openWorld?: bool, trustedOutput?: bool, draft?: bool}  $annotations
     * @param  array{rest?: bool, mcp?: bool, cli?: bool, assistant?: bool}  $expose
     * @param  Closure|null  $dryRun  fn(array $input, AbilityContext $ctx): list<array> — what running it would change, having checked what the handler would check and written nothing (see AbilityRegistry::execute)
     * @param  Closure|null  $answer  fn(mixed $result, array $input, User $user): array — the view a person sees in the workspace after running it (see Cms\Modules\Workspace\Answers)
     */
    /** For `expose`: only the admin's own client runs it, as the person signed in. No tokens, agents or CLI. */
    public const array ADMIN_ONLY = ['rest' => false, 'mcp' => false, 'cli' => false, 'assistant' => false];

    public function __construct(
        public readonly string $name,
        public readonly string $label,
        public readonly string $description,
        public readonly Closure|string|array $handler,
        public readonly array $input = ['type' => 'object', 'properties' => []],
        private readonly array|Shape|null $output = null,
        public readonly string|Closure|null $permission = null,
        public readonly string $category = 'general',
        public readonly array $annotations = [],
        public readonly array $expose = [],
        public readonly ?string $package = null,
        public readonly ?Closure $answer = null,
        public readonly ?Closure $dryRun = null,
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
            answer: $config['answer'] ?? null,
            dryRun: $config['dryRun'] ?? null,
        );
    }

    private const string DRY_RUN_HELP = 'Check only: the input is validated and you are authorized as usual, nothing is written, and the answer is {dryRun: true, ability, input, changes} instead of the usual result. `changes` lists what would change when the ability can say, and is null otherwise.';

    /** What every ability that changes something also takes. For agents, so not a string to translate. */
    public const array DRY_RUN = ['type' => 'boolean', 'default' => false, 'description' => self::DRY_RUN_HELP];

    /** What a dry run answers with. */
    public const array DRY_RUN_OUTPUT = ['type' => 'object', 'properties' => [
        'dryRun' => ['const' => true],
        'ability' => ['type' => 'string'],
        'input' => ['type' => 'object'],
        'changes' => ['type' => ['array', 'null'], 'items' => ['type' => 'object', 'properties' => ['action' => ['type' => 'string'], 'type' => ['type' => 'string']], 'required' => ['action', 'type']]],
    ], 'required' => ['dryRun', 'ability', 'input', 'changes']];

    /** JSON Schema of the input as callers see it: an ability that changes something also takes `dryRun`. */
    public function input(): array
    {
        $schema = $this->input === [] ? ['type' => 'object'] : $this->input;

        if (! $this->isReadOnly()) {
            $schema['properties'] = [...(array) ($schema['properties'] ?? []), 'dryRun' => self::DRY_RUN];
        }

        return $schema;
    }

    /** JSON Schema of what the ability answers with, as it is serialized to JSON; null when it does not say. */
    public function output(): ?array
    {
        return $this->output instanceof Shape ? $this->output->toSchema() : $this->output;
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

    /** Whether an agent asks a person before running it: anything destructive, and changes marked `confirm`, such as turning a plugin off. */
    public function asksFirst(): bool
    {
        return $this->isDestructive() || (bool) ($this->annotations['confirm'] ?? false);
    }

    /** Public description used by REST discovery, MCP tools/list and the assistant. */
    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'label' => $this->label,
            'description' => $this->description,
            'category' => $this->category,
            'input' => $this->input(),
            'output' => $this->output(),
            'annotations' => $this->annotations ?: null,
            'package' => $this->package,
        ], static fn ($v) => $v !== null);
    }
}

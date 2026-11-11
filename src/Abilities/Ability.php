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
     * @param  Closure|null  $dryRun  fn(array $input, AbilityContext $ctx): list<array{action: string, type: string, ...}> — what running it would change or remove, having refused what the handler would refuse (through the same code, not a copy of it) and written nothing (see AbilityRegistry::execute). Required when the ability is `destructive` or `confirm`
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

    private const string DRY_RUN_HELP = 'Check only: the input is validated and you are authorized as usual, nothing is written, and the answer is {dryRun: true, ability, checked, input, changes} instead of the usual result. `checked` is "full" when the ability also refused what the real run would refuse (a missing or changed record, invalid field data, something still in use) and lists in `changes` what would change or be removed; it is "input" when only the input and your permission were checked, and `changes` is null: the real run may still refuse.';

    private const string DRY_RUN_CHECKED = '"full": the ability checked what the real run would refuse, and `changes` lists what it would do. "input": only the input schema and the permission were checked; `changes` is null and the real run may still refuse.';

    private const string DRY_RUN_INPUT = 'The input as it was understood, defaults applied: the keys are those of the ability\'s input schema.';

    private const string DRY_RUN_CHANGE = 'One thing the real run would do: `action` (create, update, delete, publish…) to a `type` of thing (entry, collection, user…), with what identifies it and what would change; the other keys depend on the ability.';

    /** What every ability that changes something also takes. For agents, so not a string to translate. */
    public const array DRY_RUN = ['type' => 'boolean', 'default' => false, self::ABOUT => self::DRY_RUN_HELP];

    /** What a dry run answers with, on every ability. */
    public const array DRY_RUN_OUTPUT = ['type' => 'object', 'properties' => [
        'dryRun' => ['type' => 'boolean', 'const' => true],
        'ability' => ['type' => 'string'],
        'checked' => ['enum' => ['full', 'input'], self::ABOUT => self::DRY_RUN_CHECKED],
        'input' => ['type' => 'object', 'additionalProperties' => true, self::ABOUT => self::DRY_RUN_INPUT],
        'changes' => ['type' => ['array', 'null'], 'items' => [
            'type' => 'object', 'properties' => ['action' => ['type' => 'string'], 'type' => ['type' => 'string']], 'required' => ['action', 'type'],
            'additionalProperties' => true, self::ABOUT => self::DRY_RUN_CHANGE,
        ]],
    ], 'required' => ['dryRun', 'ability', 'checked', 'input', 'changes']];

    // The schema keyword, named: a literal after 'description' => reads as a string to translate (see the i18n tool).
    private const string ABOUT = 'description';

    /**
     * Whether this call asks for a dry run: `dryRun` true (or "true", "1" from a query string or the shell) on an
     * ability that changes something. Null when it is neither true nor false.
     */
    public function dryRunAsked(array $input): ?bool
    {
        if ($this->isReadOnly() || ! array_key_exists('dryRun', $input)) {
            return false;
        }

        return filter_var($input['dryRun'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    }

    /** Whether a result is a dry run's report rather than what the ability answers with. */
    public static function isDryRun(mixed $result): bool
    {
        return is_array($result) && ($result['dryRun'] ?? null) === true && array_keys($result) === self::DRY_RUN_OUTPUT['required'];
    }

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

    /**
     * A result as a transport sends it: JSON's own types, with maps as objects also when they are empty
     * (PHP's `[]` would leave as a list). In PHP a result stays the array the handler returned. A dry run's
     * report is sent as DRY_RUN_OUTPUT says, whatever the ability's own output is.
     */
    public function encode(mixed $result): mixed
    {
        return \Cms\Support\Schema\Conform::encode($result, self::isDryRun($result) ? self::DRY_RUN_OUTPUT : $this->output());
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

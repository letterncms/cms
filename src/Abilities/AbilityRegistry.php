<?php

declare(strict_types=1);

namespace Cms\Abilities;

use Closure;
use Illuminate\Contracts\Container\Container;
use Illuminate\Support\Str;
use Cms\Extend\Hooks;
use Cms\Support\Schema\SchemaException;
use Cms\Support\Schema\Validator;
use Throwable;

final class AbilityRegistry
{
    /** @var array<string, Ability> */
    private array $abilities = [];

    /** Check every result against its ability's output schema, key for key (see Conform), and fail when it differs. On in the tests, so the schemas stay true. */
    public bool $verifyOutput = false;

    public function __construct(
        private readonly Container $container,
        private readonly Hooks $hooks,
    ) {}

    public function register(string|Ability $ability, array $config = []): Ability
    {
        $ability = $ability instanceof Ability ? $ability : Ability::make($ability, $config);
        $this->abilities[$ability->name] = $ability;

        return $ability;
    }

    public function has(string $name): bool
    {
        return isset($this->abilities[$name]);
    }

    public function get(string $name): ?Ability
    {
        return $this->abilities[$name] ?? null;
    }

    /** @return array<string, Ability> */
    public function all(?string $transport = null): array
    {
        $all = $this->abilities;
        ksort($all);

        return $transport === null ? $all : array_filter($all, static fn (Ability $a) => $a->exposedTo($transport));
    }

    /** Abilities the context may run (permission check without input placeholders). */
    public function available(AbilityContext $context): array
    {
        return array_filter(
            $this->all($context->transport),
            fn (Ability $a) => $this->inScope($a, $context) && $this->allowed($a, $context, [], strict: false)
        );
    }

    /**
     * Validate, authorize and execute an ability. Listeners of `ability.executed` see every
     * successful run (letterncms/audit records the changes).
     *
     * With `dryRun: true` in the input of an ability that changes something, everything up to the handler
     * happens as usual (validation, the `ability.input` filter, authorization) and then nothing is run:
     * no handler, no `ability.executing`, `ability.executed` or `ability.result`, so nothing is written or
     * recorded. The answer is the report (Ability::DRY_RUN_OUTPUT). An ability with a `dryRun` callback is
     * checked in full: the callback refuses what the handler would refuse, by running the handler's own
     * guard, and lists what would change (`checked: "full"`). Without one only the input and the permission
     * were checked (`checked: "input"`, `changes: null`).
     *
     * @throws AbilityException
     */
    public function execute(string $name, array $input, AbilityContext $context): mixed
    {
        $ability = $this->get($name) ?? throw AbilityException::notFound($name);

        if (! $ability->exposedTo($context->transport)) {
            throw AbilityException::notFound($name);
        }

        if (! $this->inScope($ability, $context)) {
            throw AbilityException::forbidden(__('This token is not scoped for :ability.', ['ability' => $name]));
        }

        $dryRun = $ability->dryRunAsked($input)
            ?? throw AbilityException::invalid(__('Invalid input: :errors', ['errors' => 'dryRun']), ['dryRun' => __('Expected :expected, got :actual.', ['expected' => 'boolean', 'actual' => get_debug_type($input['dryRun'])])]);

        if (! $ability->isReadOnly()) {
            unset($input['dryRun']);
        }

        try {
            $input = Validator::validate($input, $ability->input, coerce: $context->transport === 'cli' || $context->strings);
        } catch (SchemaException $e) {
            throw AbilityException::invalid($e->getMessage(), $e->errors);
        }

        $input = $this->hooks->filter('ability.input', $input, $ability, $context);

        if (! $this->allowed($ability, $context, $input, strict: true)) {
            throw $context->user === null && ! $context->system
                ? new AbilityException(__('Authentication required.'), 'unauthenticated')
                : AbilityException::forbidden();
        }

        if ($dryRun) {
            $report = [
                'dryRun' => true,
                'ability' => $ability->name,
                'checked' => $ability->dryRun ? 'full' : 'input',
                'input' => $input,
                'changes' => $ability->dryRun ? array_values((array) $this->guarded($ability->dryRun, $input, $context)) : null,
            ];

            if ($this->verifyOutput) {
                $this->verify($ability, $report);
            }

            return $report;
        }

        $this->hooks->dispatch('ability.executing', $ability, $input, $context);
        $result = $this->guarded($ability->handler, $input, $context);
        $this->hooks->dispatch('ability.executed', $ability, $input, $result, $context);

        $result = $this->hooks->filter('ability.result', $result, $ability, $input, $context);

        if ($this->verifyOutput) {
            $this->verify($ability, $result);
        }

        return $result;
    }

    /** Run a handler, with whatever it throws said as an AbilityException. */
    private function guarded(Closure|string|array $handler, array $input, AbilityContext $context): mixed
    {
        try {
            return $this->call($handler, $input, $context);
        } catch (AbilityException $e) {
            throw $e;
        } catch (SchemaException $e) {
            throw AbilityException::invalid($e->getMessage(), $e->errors);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw AbilityException::invalid($e->getMessage(), array_map(static fn ($m) => $m[0], $e->errors()));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            throw new AbilityException(__('Not found.'), 'not_found', previous: $e);
        } catch (\InvalidArgumentException $e) {
            // Domain validation errors carry messages written for people.
            throw AbilityException::invalid($e->getMessage());
        } catch (Throwable $e) {
            report($e);
            throw new AbilityException(config('app.debug') ? $e->getMessage() : __('The action failed.'), 'failed', previous: $e);
        }
    }

    /** The result as its JSON, against the schema the ability declares. */
    private function verify(Ability $ability, mixed $result): void
    {
        if (($schema = Ability::isDryRun($result) ? Ability::DRY_RUN_OUTPUT : $ability->output()) === null) {
            return;
        }

        $errors = \Cms\Support\Schema\Conform::errors($ability->encode($result), $schema);

        if ($errors !== []) {
            throw new \LogicException("{$ability->name} answered with something its output schema does not describe: ".implode('; ', array_map(static fn ($path, $message) => ($path === '' ? 'it' : $path)." {$message}", array_keys($errors), $errors)));
        }
    }

    private function allowed(Ability $ability, AbilityContext $context, array $input, bool $strict): bool
    {
        if ($context->system) {
            return true;
        }

        $permission = $ability->permission;

        if ($permission === null) {
            return true;
        }

        if ($permission instanceof Closure) {
            return $strict ? (bool) $permission($context->user, $input, $context) : $context->user !== null;
        }

        if ($context->user === null) {
            return false;
        }

        if (str_contains($permission, '{')) {
            if (! $strict) {
                // Discovery: allowed if the user holds the permission for any value.
                return $context->user->hasPermission(preg_replace('/\{[^}]+\}/', '*', $permission), any: true);
            }

            $permission = preg_replace_callback('/\{([^}]+)\}/', static fn ($m) => (string) data_get($input, $m[1], '_'), $permission);
        }

        return $context->user->hasPermission($permission);
    }

    private function inScope(Ability $ability, AbilityContext $context): bool
    {
        if ($context->scopes === null) {
            return true;
        }

        foreach ($context->scopes as $scope) {
            if ($scope === '*' || Str::is($scope, $ability->name) || ($scope === 'read' && $ability->isReadOnly())) {
                return true;
            }
        }

        return false;
    }

    private function call(Closure|string|array $handler, array $input, AbilityContext $context): mixed
    {
        if (is_string($handler) && str_contains($handler, '@')) {
            $handler = explode('@', $handler, 2);
        }

        if (is_array($handler) && is_string($handler[0])) {
            $handler = [$this->container->make($handler[0]), $handler[1]];
        } elseif (is_string($handler)) {
            $handler = $this->container->make($handler);
        }

        return $handler($input, $context);
    }
}

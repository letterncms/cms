<?php

declare(strict_types=1);

namespace Cms\Extend;

/**
 * Actions (fire-and-forget) and filters (transform a value), ordered by priority.
 * Names are dotted: "entry.saved", "render.html", "admin.manifest".
 */
final class Hooks
{
    /** @var array<string, array<int, list<callable>>> */
    private array $actions = [];

    /** @var array<string, array<int, list<callable>>> */
    private array $filters = [];

    public function on(string $action, callable $callback, int $priority = 10): void
    {
        $this->actions[$action][$priority][] = $callback;
    }

    public function dispatch(string $action, mixed ...$args): void
    {
        foreach ($this->ordered($this->actions[$action] ?? []) as $callback) {
            $callback(...$args);
        }
    }

    public function addFilter(string $filter, callable $callback, int $priority = 10): void
    {
        $this->filters[$filter][$priority][] = $callback;
    }

    public function filter(string $filter, mixed $value, mixed ...$args): mixed
    {
        foreach ($this->ordered($this->filters[$filter] ?? []) as $callback) {
            $value = $callback($value, ...$args);
        }

        return $value;
    }

    public function has(string $name): bool
    {
        return isset($this->actions[$name]) || isset($this->filters[$name]);
    }

    /** @return iterable<callable> */
    private function ordered(array $byPriority): iterable
    {
        ksort($byPriority);

        foreach ($byPriority as $callbacks) {
            yield from $callbacks;
        }
    }
}

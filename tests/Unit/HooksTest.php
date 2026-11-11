<?php

declare(strict_types=1);

namespace Cms\Tests\Unit;

use Cms\Extend\Hooks;
use PHPUnit\Framework\TestCase;
use RuntimeException;

/** Actions and filters: what plugins hang their code on. */
final class HooksTest extends TestCase
{
    public function test_an_action_calls_every_listener_with_the_arguments(): void
    {
        $hooks = new Hooks;
        $seen = [];

        $hooks->on('entry.saved', static function (string $id, string $action) use (&$seen): void { $seen[] = "a:{$id}:{$action}"; });
        $hooks->on('entry.saved', static function (string $id) use (&$seen): void { $seen[] = "b:{$id}"; });
        $hooks->on('entry.deleted', static function () use (&$seen): void { $seen[] = 'other'; });

        $hooks->dispatch('entry.saved', 'e1', 'create');

        $this->assertSame(['a:e1:create', 'b:e1'], $seen);
    }

    public function test_listeners_run_by_priority_then_in_the_order_they_were_added(): void
    {
        $hooks = new Hooks;
        $order = [];
        $add = static function (string $name) use (&$order): callable {
            return static function () use (&$order, $name): void { $order[] = $name; };
        };

        $hooks->on('boot', $add('default-1'));
        $hooks->on('boot', $add('late'), 20);
        $hooks->on('boot', $add('early'), 5);
        $hooks->on('boot', $add('default-2'));
        $hooks->on('boot', $add('first'), -1);

        $hooks->dispatch('boot');

        $this->assertSame(['first', 'early', 'default-1', 'default-2', 'late'], $order);
    }

    public function test_a_filter_passes_the_value_through_each_callback_in_order(): void
    {
        $hooks = new Hooks;

        $hooks->addFilter('title', static fn (string $value) => $value.'!', 20);
        $hooks->addFilter('title', static fn (string $value, string $suffix) => $value.$suffix);
        $hooks->addFilter('title', static fn (string $value) => strtoupper($value), 1);

        $this->assertSame('HELLO there!', $hooks->filter('title', 'hello', ' there'));
    }

    public function test_a_filter_nobody_listens_to_returns_the_value_and_an_action_does_nothing(): void
    {
        $hooks = new Hooks;

        $this->assertSame(['a' => 1], $hooks->filter('nothing.here', ['a' => 1], 'extra'));
        $this->assertNull($hooks->filter('nothing.here', null));

        $hooks->dispatch('nothing.here', 1, 2);
        $this->addToAssertionCount(1);
    }

    public function test_a_filter_may_change_the_type_and_the_next_one_gets_what_it_returned(): void
    {
        $hooks = new Hooks;

        $hooks->addFilter('items', static fn (array $items) => count($items));
        $hooks->addFilter('items', static fn (int $count) => $count * 2);

        $this->assertSame(6, $hooks->filter('items', ['a', 'b', 'c']));
    }

    public function test_actions_and_filters_of_one_name_are_kept_apart(): void
    {
        $hooks = new Hooks;
        $called = 0;

        $hooks->on('render', static function () use (&$called): void { $called++; });
        $hooks->addFilter('render', static fn (string $html) => "<main>{$html}</main>");

        $this->assertSame('<main>x</main>', $hooks->filter('render', 'x'));
        $this->assertSame(0, $called, 'filtering does not run the action');

        $hooks->dispatch('render');
        $this->assertSame(1, $called);
    }

    public function test_has_knows_actions_and_filters(): void
    {
        $hooks = new Hooks;

        $this->assertFalse($hooks->has('entry.saved'));

        $hooks->on('entry.saved', static fn () => null);
        $hooks->addFilter('agent.guide', static fn (string $guide) => $guide);

        $this->assertTrue($hooks->has('entry.saved'));
        $this->assertTrue($hooks->has('agent.guide'));
        $this->assertFalse($hooks->has('entry'));
    }

    public function test_a_listener_that_throws_stops_the_ones_after_it(): void
    {
        $hooks = new Hooks;
        $reached = false;

        $hooks->on('save', static fn () => throw new RuntimeException('No.'));
        $hooks->on('save', static function () use (&$reached): void { $reached = true; });

        try {
            $hooks->dispatch('save');
            $this->fail('The exception was swallowed.');
        } catch (RuntimeException $e) {
            $this->assertSame('No.', $e->getMessage());
        }

        $this->assertFalse($reached);
    }

    public function test_a_listener_added_while_dispatching_waits_for_the_next_dispatch(): void
    {
        $hooks = new Hooks;
        $calls = [];

        $hooks->on('tick', static function () use ($hooks, &$calls): void {
            $calls[] = 'first';
            $hooks->on('tick', static function () use (&$calls): void { $calls[] = 'added'; }, 20);
        });

        $hooks->dispatch('tick');
        $this->assertSame(['first'], $calls);

        $calls = [];
        $hooks->dispatch('tick');
        $this->assertSame(['first', 'added'], $calls);
    }

    public function test_callables_of_every_kind_are_taken(): void
    {
        $hooks = new Hooks;

        $hooks->addFilter('text', 'strtoupper');
        $hooks->addFilter('text', [$this, 'exclaim']);
        $hooks->addFilter('text', new class
        {
            public function __invoke(string $value): string
            {
                return "({$value})";
            }
        });

        $this->assertSame('(HI!)', $hooks->filter('text', 'hi'));
    }

    public function exclaim(string $value): string
    {
        return $value.'!';
    }
}

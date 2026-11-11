<?php

declare(strict_types=1);

namespace Cms\Tests\Support;

use PHPUnit\Event\TestRunner\ExecutionFinished;
use PHPUnit\Event\TestRunner\ExecutionFinishedSubscriber;
use PHPUnit\Runner\Extension\Extension;
use PHPUnit\Runner\Extension\Facade;
use PHPUnit\Runner\Extension\ParameterCollection;
use PHPUnit\TextUI\Configuration\Configuration;

/**
 * Every ability the kernel and its modules register is run by some test, so its output schema is held against
 * a real result. TestCase notes what each test's site registers and the registry notes what was run; when the
 * whole suite has finished in one process, an ability nothing ran fails the run. A filtered run checks nothing.
 */
final class AbilityCoverage implements Extension
{
    /** @var array<string, true> */
    public static array $known = [];

    /** @var array<string, true> */
    public static array $ran = [];

    /** @return list<string> */
    public static function missing(): array
    {
        $missing = array_keys(array_diff_key(self::$known, self::$ran));
        sort($missing);

        return $missing;
    }

    public function bootstrap(Configuration $configuration, Facade $facade, ParameterCollection $parameters): void
    {
        $whole = ! $configuration->hasFilter() && ! $configuration->hasCliArguments() && ! $configuration->hasGroups();

        $facade->registerSubscriber(new class($whole) implements ExecutionFinishedSubscriber
        {
            public function __construct(private readonly bool $whole) {}

            public function notify(ExecutionFinished $event): void
            {
                $missing = AbilityCoverage::missing();

                if (! $this->whole || $missing === []) {
                    return;
                }

                fwrite(STDERR, "\nNo test ran these abilities, so nothing holds their output schema true:\n  ".implode("\n  ", $missing)."\n");
                register_shutdown_function(static fn () => exit(1));
            }
        });
    }
}

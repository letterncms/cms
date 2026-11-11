<?php

declare(strict_types=1);

namespace Cms\Foundation;

use Cms\Console\Command;
use Illuminate\Foundation\Console\Kernel;
use Symfony\Component\Console\Output\OutputInterface;
use Throwable;

/**
 * The console, with one difference from the framework's: when the arguments have `--json`, whatever goes wrong
 * before a command runs (no such command, a missing argument, a provider that cannot boot, a database that is
 * not there) is printed as the same `{"error": {…}}` document a command prints, not as a rendered exception.
 */
final class ConsoleKernel extends Kernel
{
    private bool $json = false;

    public function handle($input, $output = null)
    {
        $this->json = $input->hasParameterOption('--json', true);

        return parent::handle($input, $output);
    }

    protected function renderException($output, Throwable $e)
    {
        if (! $this->json) {
            parent::renderException($output, $e);

            return;
        }

        $output->writeln(Command::errorDocument(Command::said($e, report: false)), OutputInterface::OUTPUT_RAW);
    }
}

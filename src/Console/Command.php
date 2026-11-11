<?php

declare(strict_types=1);

namespace Cms\Console;

use Cms\Abilities\AbilityException;
use Illuminate\Console\Command as BaseCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\NullOutput;
use Symfony\Component\Console\Output\OutputInterface;
use Throwable;

/**
 * What every command of the CMS shares: `--json`. With it a command prints exactly one JSON document
 * and nothing else, `{"data": …}` when it worked and `{"error": {"type", "message", "details"}}` with
 * a non-zero exit when it didn't (the shape REST answers with, see AbilityException), and never asks
 * a question. Without it a command talks to a person as before.
 */
abstract class Command extends BaseCommand
{
    private ?OutputInterface $document = null;

    private bool $printed = false;

    public function __construct()
    {
        parent::__construct();

        if (! $this->getDefinition()->hasOption('json')) {
            $this->addOption('json', null, InputOption::VALUE_NONE, 'Print one JSON document: {"data": …}, or {"error": {…}} with a non-zero exit');
        }
    }

    public function run(InputInterface $input, OutputInterface $output): int
    {
        // One instance runs many times in a long process (tests, a queue): each run starts over.
        $this->document = null;
        $this->printed = false;

        if (! $this->wantsJson($input)) {
            return parent::run($input, $output);
        }

        $this->document = $output;
        $input->setInteractive(false);

        try {
            // What the command says to a person goes nowhere: the document is the whole output.
            $code = parent::run($input, new NullOutput);
        } catch (Throwable $e) {
            return $this->failure(self::said($e));
        }

        if (! $this->printed) {
            return $code === self::SUCCESS ? $this->done(null) : $this->failure('The command failed.');
        }

        return $code;
    }

    /** Whether this run prints a JSON document. Asked before the input is bound, so from the raw arguments. */
    protected function wantsJson(InputInterface $input): bool
    {
        return $input->hasParameterOption('--json', true);
    }

    protected function json(): bool
    {
        return $this->document !== null;
    }

    /** The command's result. A person has read it already; `--json` prints it as `{"data": …}`. */
    protected function done(mixed $data = null, int $code = self::SUCCESS): int
    {
        $this->document(['data' => $data]);

        return $code;
    }

    /**
     * The command failed: a line for a person, `{"error": {…}}` for `--json`, and a non-zero exit.
     *
     * @param  array<string, mixed>  $details
     */
    protected function failure(Throwable|string $error, string $type = 'failed', array $details = []): int
    {
        $error = match (true) {
            $error instanceof AbilityException => $error,
            // What a command caught and hands over is written for whoever ran it.
            $error instanceof Throwable => new AbilityException($error->getMessage(), $type, $details, $error),
            default => new AbilityException($error, $type, $details),
        };

        if ($this->json()) {
            if (! $this->printed) {
                $this->printed = true;
                $this->document?->writeln(self::errorDocument($error), OutputInterface::OUTPUT_RAW);
            }

            return self::FAILURE;
        }

        $this->components->error($error->getMessage());

        // Lists and reports among the details are for --json: a person has seen them as the command went.
        foreach (array_filter($error->details, 'is_string') as $path => $message) {
            $this->line("  {$path}: {$message}");
        }

        return self::FAILURE;
    }

    /**
     * Something nobody caught, as the error to print. What the console itself refuses (an unknown command or
     * option, a missing argument, a question nobody can answer) is said as it is. Anything else is logged and
     * said in general terms: its message may be SQL or a path, and is for the log.
     */
    public static function said(Throwable $e, bool $report = true): AbilityException
    {
        if ($e instanceof AbilityException) {
            return $e;
        }

        if ($e instanceof \Symfony\Component\Console\Exception\CommandNotFoundException) {
            return new AbilityException($e->getMessage(), 'not_found', previous: $e);
        }

        if ($e instanceof \Symfony\Component\Console\Exception\ExceptionInterface || $e instanceof \Laravel\Prompts\Exceptions\NonInteractiveValidationException) {
            return AbilityException::invalid($e->getMessage());
        }

        if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
            return new AbilityException('Not found.', 'not_found', previous: $e);
        }

        try {
            $report && report($e);
        } catch (Throwable) {
            // A site that cannot boot may have nowhere to log to.
        }

        return new AbilityException('The command failed.', 'failed', previous: $e);
    }

    /** The one document a failed `--json` run prints. */
    public static function errorDocument(AbilityException $e): string
    {
        try {
            $error = $e->toArray();
        } catch (Throwable) {
            // Before the application is up there is no translator.
            $error = array_filter(['type' => $e->type, 'message' => $e->getMessage(), 'details' => $e->details ?: null]);
        }

        return (string) json_encode(['error' => $error], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PARTIAL_OUTPUT_ON_ERROR);
    }

    /** A yes before something is replaced: `--yes` answers it, and `--json` never asks, so it needs `--yes`. */
    protected function agreed(string $question, bool $default = false): bool
    {
        if ($this->hasOption('yes') && $this->option('yes')) {
            return true;
        }

        if ($this->json()) {
            throw AbilityException::invalid('Pass --yes: with --json nothing is asked.');
        }

        return $this->confirm($question, $default);
    }

    private function document(array $document): void
    {
        if ($this->document === null || $this->printed) {
            return;
        }

        $this->printed = true;
        $this->document->writeln(
            (string) json_encode($document, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PARTIAL_OUTPUT_ON_ERROR),
            OutputInterface::OUTPUT_RAW,
        );
    }
}

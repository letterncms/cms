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
            return $this->failure($e);
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
            $error instanceof \Symfony\Component\Console\Exception\ExceptionInterface,
            $error instanceof \Laravel\Prompts\Exceptions\NonInteractiveValidationException => AbilityException::invalid($error->getMessage()),
            $error instanceof \Illuminate\Database\Eloquent\ModelNotFoundException => new AbilityException(__('Not found.'), 'not_found', previous: $error),
            $error instanceof Throwable => new AbilityException($error->getMessage(), $type, $details, $error),
            default => new AbilityException($error, $type, $details),
        };

        if ($this->json()) {
            $this->document(['error' => $error->toArray()]);

            return self::FAILURE;
        }

        $this->components->error($error->getMessage());

        // Lists and reports among the details are for --json: a person has seen them as the command went.
        foreach (array_filter($error->details, 'is_string') as $path => $message) {
            $this->line("  {$path}: {$message}");
        }

        return self::FAILURE;
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

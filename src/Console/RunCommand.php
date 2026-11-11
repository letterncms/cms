<?php

declare(strict_types=1);

namespace Cms\Console;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Users\User;
use Symfony\Component\Console\Input\InputInterface;

/**
 * Runs an ability. Always answers as `--json` does, one document on stdout: `{"data": …}`, or
 * `{"error": {"type", "message", "details"}}` and a non-zero exit. Only `--list` is a table for people.
 */
final class RunCommand extends Command
{
    protected $signature = 'run {ability? : e.g. entries/list}
        {input?* : key=value pairs (values may be JSON)}
        {--input= : The whole input as a JSON object}
        {--as= : Run as this user (email) instead of the system}
        {--list : List abilities}';

    protected $description = 'Run any ability from the command line';

    protected function wantsJson(InputInterface $input): bool
    {
        return parent::wantsJson($input) || ! $input->hasParameterOption('--list', true);
    }

    public function handle(AbilityRegistry $abilities): int
    {
        if ($this->option('list') || ! $this->argument('ability')) {
            $this->table(['Ability', 'Description'], array_map(
                static fn ($a) => [$a->name, mb_strimwidth($a->description, 0, 90, '…')],
                array_values($abilities->all('cli'))
            ));

            return $this->done(array_values(array_map(static fn ($a) => $a->toArray(), $abilities->all('cli'))));
        }

        $input = [];

        if ($this->option('input') !== null) {
            $input = json_decode((string) $this->option('input'), true, 64);

            if (! is_array($input) || ($input !== [] && array_is_list($input))) {
                return $this->failure('--input takes a JSON object.', 'invalid_input');
            }
        }

        foreach ((array) $this->argument('input') as $pair) {
            [$key, $value] = array_pad(explode('=', (string) $pair, 2), 2, '');
            data_set($input, $key, json_validate($value) && ! is_numeric($value) ? json_decode($value, true) : $value);
        }

        $context = AbilityContext::system('cli');

        if ($email = $this->option('as')) {
            $user = User::query()->where('email', strtolower((string) $email))->first();

            if (! $user) {
                return $this->failure("No user {$email}.", 'not_found');
            }

            $context = AbilityContext::forUser($user, 'cli');
        }

        try {
            $name = (string) $this->argument('ability');
            $result = $abilities->execute($name, $input, $context);

            return $this->done($abilities->get($name)?->encode($result) ?? $result);
        } catch (AbilityException $e) {
            return $this->failure($e);
        }
    }
}

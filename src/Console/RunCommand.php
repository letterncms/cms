<?php

declare(strict_types=1);

namespace Cms\Console;

use Illuminate\Console\Command;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Users\User;

final class RunCommand extends Command
{
    protected $signature = 'run {ability? : e.g. entries/list}
        {input?* : key=value pairs (values may be JSON)}
        {--json= : Input as a JSON object}
        {--as= : Run as this user (email) instead of the system}
        {--list : List abilities}';

    protected $description = 'Run any ability from the command line';

    public function handle(AbilityRegistry $abilities): int
    {
        if ($this->option('list') || ! $this->argument('ability')) {
            $this->table(['Ability', 'Description'], array_map(
                static fn ($a) => [$a->name, mb_strimwidth($a->description, 0, 90, '…')],
                array_values($abilities->all('cli'))
            ));

            return self::SUCCESS;
        }

        $input = $this->option('json') ? (array) json_decode((string) $this->option('json'), true, 64, JSON_THROW_ON_ERROR) : [];

        foreach ((array) $this->argument('input') as $pair) {
            [$key, $value] = array_pad(explode('=', (string) $pair, 2), 2, '');
            data_set($input, $key, json_validate($value) && ! is_numeric($value) ? json_decode($value, true) : $value);
        }

        $context = AbilityContext::system('cli');

        if ($email = $this->option('as')) {
            $user = User::query()->where('email', strtolower((string) $email))->first();

            if (! $user) {
                $this->error("No user {$email}.");

                return self::FAILURE;
            }

            $context = AbilityContext::forUser($user, 'cli');
        }

        try {
            $result = $abilities->execute((string) $this->argument('ability'), $input, $context);
        } catch (AbilityException $e) {
            $this->error($e->getMessage());

            foreach ($e->details as $path => $message) {
                $this->line("  {$path}: {$message}");
            }

            return self::FAILURE;
        }

        $this->line(json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

        return self::SUCCESS;
    }
}

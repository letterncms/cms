<?php

declare(strict_types=1);

namespace Cms\Console;

use Cms\Update\Upgrader;
use Illuminate\Database\Migrations\Migrator;

/**
 * `cms migrate`: brings the database up to the code. Takes the place of the framework's command of that name,
 * which knows the tables only: this one also installs and upgrades the active packages.
 *
 * The framework's other migration commands stay, and two of them end by calling this one: `migrate:fresh`
 * and `migrate:refresh` pass it `--force` and whatever of `--database`, `--path`, `--realpath`, `--schema-path`
 * and `--step` they were given. So it takes those options and means by them what they mean there.
 */
final class MigrateCommand extends Command
{
    protected $signature = 'migrate
        {--force : Accepted for deploy scripts: this command never asks before it runs}
        {--database= : The database connection to migrate instead of the default one}
        {--path=* : Run only the migrations in these files or folders, and leave the packages alone}
        {--realpath : The given paths are absolute}
        {--schema-path= : Accepted for migrate:fresh: there is no schema dump to load}
        {--step : Record each migration as a batch of its own, to roll back one at a time}';

    protected $description = 'Run core migrations and install/upgrade active packages';

    public function handle(): int
    {
        /** @var Migrator $migrator */
        $migrator = $this->laravel->make('migrator');
        $done = $migrator->usingConnection($this->option('database'), fn (): array => $this->option('path') === []
            ? Upgrader::run($this->laravel, (bool) $this->option('step'))
            : $this->only($migrator));

        foreach ($done as $name => $what) {
            $this->components->twoColumnDetail($name, $what);
        }

        if ($done === []) {
            $this->components->info('Everything is up to date.');
        }

        return $this->done(['done' => (object) $done]);
    }

    /**
     * `--path`: those migrations and nothing else, as the framework's command does it.
     *
     * @return array<string, string> Each migration that ran
     */
    private function only(Migrator $migrator): array
    {
        Upgrader::prepare($this->laravel);

        $paths = array_map(fn (string $path): string => $this->option('realpath') ? $path : $this->laravel->basePath($path), $this->option('path'));
        $ran = $migrator->run($paths, ['step' => (bool) $this->option('step')]);

        return array_fill_keys(array_map($migrator->getMigrationName(...), $ran), 'migrated');
    }
}

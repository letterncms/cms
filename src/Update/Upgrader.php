<?php

declare(strict_types=1);

namespace Cms\Update;

use Cms\Cms;
use Cms\Foundation\Application;
use Cms\Support\Files;
use Illuminate\Database\Migrations\Migrator;

/** The one upgrade routine: core tables, then every package, then what the old code cached. */
final class Upgrader
{
    /** What the migrator needs before it runs anything: the SQLite file, and the table it keeps its own record in. */
    public static function prepare(Application $app): Migrator
    {
        if (config('database.default') === 'sqlite' && ($file = (string) config('database.connections.sqlite.database')) !== ':memory:' && $file !== '' && ! is_file($file)) {
            Files::ensureDir(dirname($file));
            touch($file);
        }

        $migrator = $app->make('migrator');

        if (! $migrator->repositoryExists()) {
            $migrator->getRepository()->createRepository();
        }

        return $migrator;
    }

    /** The migrator itself, not the framework's `migrate` command: `cms migrate` is this routine's own command. */
    public static function migrateCore(Application $app, bool $step = false): void
    {
        self::prepare($app)->run([$app->databasePath('migrations')], ['step' => $step]);
    }

    /** @return array<string, string> What each package did */
    public static function run(Application $app, bool $step = false): array
    {
        self::migrateCore($app, $step);
        $done = $app->make(Cms::class)->packages()->sync($step);
        $app->make(Cms::class)->hooks()->dispatch('cms.migrated');
        self::purgeCaches($app);

        return $done;
    }

    /**
     * New code may read these differently, and a rollback must not read what new code wrote.
     * Everything under storage/cache is a cache: a module keeps its own there to have it purged too.
     */
    public static function purgeCaches(Application $app): void
    {
        foreach (['cache', 'framework/cache', 'framework/views'] as $dir) {
            Files::deleteDirectory($app->storagePath($dir));
            @mkdir($app->storagePath($dir), 0o775, true);
        }

        @mkdir($app->storagePath('cache/data'), 0o775, true);
        @unlink($app->storagePath('update/purge'));
    }
}

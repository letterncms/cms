<?php

declare(strict_types=1);

namespace Cms\Update;

use Cms\Cms;
use Cms\Foundation\Application;
use Cms\Support\Files;
use Illuminate\Support\Facades\Artisan;

/** The one upgrade routine: core tables, then every package, then what the old code cached. */
final class Upgrader
{
    public static function migrateCore(Application $app): void
    {
        Artisan::call('migrate', ['--force' => true, '--path' => $app->databasePath('migrations'), '--realpath' => true]);
    }

    /** @return array<string, string> What each package did */
    public static function run(Application $app): array
    {
        self::migrateCore($app);
        $done = $app->make(Cms::class)->packages()->sync();
        $app->make(Cms::class)->hooks()->dispatch('cms.sync');
        self::purgeCaches($app);

        return $done;
    }

    /** New code may read these differently, and a rollback must not read what new code wrote. */
    public static function purgeCaches(Application $app): void
    {
        foreach (['cache/entries', 'cache/data', 'framework/cache', 'framework/views'] as $dir) {
            Files::deleteDirectory($app->storagePath($dir));
            @mkdir($app->storagePath($dir), 0o775, true);
        }

        @unlink($app->storagePath('i18n.json'));
        @unlink($app->storagePath('cache/packages.php'));
        @unlink($app->storagePath('update/purge'));
    }
}

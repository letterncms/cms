<?php

declare(strict_types=1);

namespace Cms\Console;

use Illuminate\Console\Command;
use Cms\Packages\PackageManager;

final class SyncCommand extends Command
{
    protected $signature = 'sync';

    protected $description = 'Run core migrations and install/upgrade active packages';

    public function handle(PackageManager $packages): int
    {
        $this->call('migrate', ['--force' => true, '--path' => app()->databasePath('migrations'), '--realpath' => true]);

        $done = $packages->sync();
        cms()->hooks()->dispatch('cms.sync');

        // New code may read content differently: drop parsed caches of flat-file entries.
        \Cms\Support\Files::deleteDirectory(storage_path('cache/entries'));

        foreach ($done as $name => $what) {
            $this->components->twoColumnDetail($name, $what);
        }

        if ($done === []) {
            $this->components->info('Everything is up to date.');
        }

        return self::SUCCESS;
    }
}

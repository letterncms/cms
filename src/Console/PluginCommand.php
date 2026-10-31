<?php

declare(strict_types=1);

namespace Cms\Console;

use Illuminate\Console\Command;
use Cms\Packages\PackageManager;
use RuntimeException;

final class PluginCommand extends Command
{
    protected $signature = 'plugin {action : enable|disable|uninstall} {name : e.g. letterncms/seo} {--delete-files}';

    protected $description = 'Enable, disable or uninstall a plugin';

    public function handle(PackageManager $packages): int
    {
        $name = (string) $this->argument('name');

        try {
            match ($this->argument('action')) {
                'enable' => $packages->enable($name),
                'disable' => $packages->disable($name),
                'uninstall' => $packages->uninstall($name, (bool) $this->option('delete-files')),
                default => throw new RuntimeException('Unknown action. Use enable, disable or uninstall.'),
            };
        } catch (RuntimeException $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $this->components->info("{$name}: {$this->argument('action')} done.");

        if ($this->argument('action') === 'enable') {
            $this->call('sync');
        }

        return self::SUCCESS;
    }
}

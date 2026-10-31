<?php

declare(strict_types=1);

namespace Cms\Console;

use Cms\Install\Installer;
use Cms\Users\User;
use Illuminate\Console\Command;

/** The setup's last step, in a process that booted with the plugins it pulled. */
final class InstallFinishCommand extends Command
{
    protected $signature = 'install:finish {email : The admin who installed the site}';

    protected $description = 'Finish a setup: what the plugins start a new site with';

    protected $hidden = true;

    public function handle(Installer $installer): int
    {
        $user = User::query()->where('email', strtolower((string) $this->argument('email')))->firstOrFail();
        $installer->finish($user);

        return self::SUCCESS;
    }
}

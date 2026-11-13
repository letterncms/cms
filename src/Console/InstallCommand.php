<?php

declare(strict_types=1);

namespace Cms\Console;

use Symfony\Component\Process\ExecutableFinder;
use Symfony\Component\Process\Process;
use Cms\Abilities\AbilityException;
use Cms\Install\Installer;
use Cms\Modules\Site\Sites\Sites;
use Cms\Modules\Packages\StoreClient;
use Cms\Packages\Install\PackageJobs;
use Cms\Packages\PackageManager;
use Cms\Packages\PackageManifest;
use Cms\Update\Layout;

use function Laravel\Prompts\password;
use function Laravel\Prompts\select;
use function Laravel\Prompts\text;

final class InstallCommand extends Command
{
    protected $signature = 'install
        {--site-name=} {--site-url=}
        {--db=} {--db-host=127.0.0.1} {--db-port=} {--db-database=} {--db-username=} {--db-password=} {--db-prefix=}
        {--name=} {--email=} {--password=}
        {--plugins= : Comma-separated plugin names to add, "recommended" (the default) or "none"}
        {--site= : The site to start from: minimal (the default), one in sites/, a site package to fetch (letterncms/<name>), or none}';

    protected $description = 'Install the CMS (database, first admin)';

    public function handle(Installer $installer): int
    {
        if (Installer::installed()) {
            $this->components->info(__(':brand is already installed.'));

            return $this->done(['installed' => false]);
        }

        foreach ($installer->requirements() as $check) {
            $this->components->twoColumnDetail($check['label'], $check['ok'] ? '<fg=green>ok</>' : '<fg=red>missing</>');
        }

        $db = $this->option('db') ?: select('Database', ['sqlite' => 'SQLite (no setup needed)', 'mysql' => 'MySQL / MariaDB'], 'sqlite');
        $input = [
            'site_name' => $this->option('site-name') ?: text('Site Name', default: 'My site', required: true),
            'site_url' => $this->option('site-url') ?: text('Site URL', default: 'http://127.0.0.1:8000', required: true),
            'db_driver' => $db,
            'name' => $this->option('name') ?: text('Your Name', required: true),
            'email' => $this->option('email') ?: text('Your email', required: true),
            'password' => $this->option('password') ?: password('Password (10+ characters, letters and numbers)', required: true),
        ];

        [$input['site'], $sitePackage] = $this->site();
        $input['site_from_store'] = $sitePackage !== null;

        if ($db !== 'sqlite') {
            $input += [
                'db_host' => $this->option('db-host'),
                'db_port' => $this->option('db-port') ?: ($db === 'pgsql' ? '5432' : '3306'),
                'db_database' => $this->option('db-database') ?: text('Database name', default: 'cms', required: true),
                'db_username' => $this->option('db-username') ?? text('Database user', default: 'root'),
                'db_password' => $this->option('db-password') ?? password('Database password'),
                'db_prefix' => $this->option('db-prefix') ?? '',
            ];
        }

        try {
            $user = $installer->install($input);
        } catch (AbilityException $e) {
            return $this->failure($e);
        }

        $packages = app(PackageManager::class);
        $wanted = [...$this->wanted(), ...($sitePackage !== null ? [$sitePackage] : [])];
        $missing = array_values(array_filter($wanted, static fn (string $name) => ! $packages->repository()->find($name)));

        if ($missing !== [] && ! $this->pull($missing)) {
            $this->warn('Add them later with: composer require '.implode(' ', $missing));
        }

        // A new process: this one booted before the plugins were here.
        $finish = new Process([PHP_BINARY, $this->laravel->sitePath('cms'), 'install:finish', $user->email], $this->laravel->sitePath(), timeout: 600);
        $finish->run(fn ($type, $line) => $this->output->write($line));

        $this->components->info("Installed. Sign in at {$input['site_url']}/admin as {$user->email}.");

        return $finish->isSuccessful()
            ? $this->done(['installed' => true, 'email' => $user->email, 'admin' => $input['site_url'].'/admin', 'missing' => $missing])
            : $this->failure('The site is installed, but its plugins could not finish setting it up.', details: ['output' => trim($finish->getOutput().$finish->getErrorOutput())]);
    }

    /**
     * The site to start from, and the package to fetch it from when it isn't here: a name alone is one of
     * ours, as Composer and the store name it (letterncms/<name> lands in sites/<name>).
     *
     * @return array{0: string, 1: ?string}
     */
    private function site(): array
    {
        $sitePackage = trim((string) ($this->option('site') ?? '')) ?: Sites::DEFAULT;

        if ($sitePackage === Installer::NO_SITE) {
            return [$sitePackage, null];
        }

        [$vendor, $name] = str_contains($sitePackage, '/') ? explode('/', strtolower($sitePackage), 2) : [PackageManifest::VENDOR, $sitePackage];
        $handle = $vendor === PackageManifest::VENDOR ? $name : "{$vendor}-{$name}";

        return [$handle, app(Sites::class)->find($handle) !== null ? null : "{$vendor}/{$name}"];
    }

    /** @return list<string> */
    private function wanted(): array
    {
        $option = (string) ($this->option('plugins') ?? 'recommended');

        return match ($option) {
            'none', '' => [],
            'recommended' => Installer::RECOMMENDED,
            default => array_map(static fn (string $name) => str_contains($name, '/') ? trim($name) : PackageManifest::VENDOR.'/'.trim($name), explode(',', $option)),
        };
    }

    /** A site with Composer asks Composer; one that updates itself asks the store, as the web setup does. */
    private function pull(array $names): bool
    {
        if (app(Layout::class)->managed() === 'composer') {
            $composer = (new ExecutableFinder)->find('composer');

            if ($composer === null) {
                return false;
            }

            $process = new Process([$composer, 'require', '--no-interaction', ...$names], $this->laravel->sitePath(), timeout: 900);
            $process->run(fn ($type, $line) => $this->output->write($line));

            return $process->isSuccessful();
        }

        $store = app(StoreClient::class);
        $jobs = app(PackageJobs::class);
        $store->refresh();

        foreach ($names as $name) {
            foreach ($store->plan($name)['steps'] as $step) {
                $this->components->task("Adding {$step['title']}", function () use ($store, $jobs, $step) {
                    if ($step['enable_only']) {
                        return true;
                    }

                    $job = $store->install($step['package'], $step['version']);

                    while ($job['state'] === 'running') {
                        $job = $jobs->step($job['id']);
                    }

                    return $job['state'] === 'done';
                });
            }
        }

        return true;
    }
}

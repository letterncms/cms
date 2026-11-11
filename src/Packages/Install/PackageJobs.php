<?php

declare(strict_types=1);

namespace Cms\Packages\Install;

use Cms\Cms;
use Cms\Foundation\Application;
use Cms\Packages\PackageManager;
use Cms\Packages\PackageManifest;
use Cms\Packages\SiteComposer;
use Cms\Support\Crypto\Ed25519;
use Cms\Support\Files;
use Cms\Support\Remote;
use Cms\Update\Layout;
use Illuminate\Support\Carbon;
use RuntimeException;
use Throwable;
use ZipArchive;

/**
 * Installs one package in steps, each its own request, so a time limit or a closed browser only
 * pauses it. Everything is prepared beside the target and goes live with a rename. A package
 * that breaks is put back, and the site stays up: the same guard that runs every plugin reports it.
 *
 *   preflight > fetch > verify > inspect > stage > swap > migrate > health > done
 *
 * Verification itself is the caller's: the store client passes a closure's result as the `check`,
 * so this engine knows nothing about stores, catalogs or licences.
 */
class PackageJobs
{
    public const array STEPS = ['preflight', 'fetch', 'verify', 'inspect', 'stage', 'swap', 'migrate', 'health', 'done'];

    /** The exception code of a verifier refusing a package only because no one signed it. */
    public const int UNSIGNED = 4011;

    private const int KEEP_BACKUPS = 7 * 86_400;

    /** @var array<string, callable(array<string, mixed>): void> Verifiers by name, registered by whoever starts jobs */
    private array $verifiers = [];

    /** Overridable so tests can stand in for a plain host, or one that blocks a function. */
    public ?HostFacts $host = null;

    public function __construct(
        private readonly Application $app,
        private readonly Cms $cms,
        private readonly Remote $remote,
        private readonly ZipInspector $inspector = new ZipInspector,
    ) {}

    /** @param  callable(array<string, mixed>): void  $verifier  Throws to refuse the download */
    public function verifier(string $name, callable $verifier): void
    {
        $this->verifiers[$name] = $verifier;
    }

    /**
     * @param  array{package?: ?string, version?: ?string, url?: ?string, zip?: ?string, headers?: list<string>, size?: ?int, sha256?: ?string, verifier: string, context?: array<string, mixed>, turn_on?: bool, source?: array<string, mixed>}  $spec
     * @return array<string, mixed> The job
     */
    public function start(array $spec): array
    {
        return $this->locked(function () use ($spec) {
            $this->cms->guardFileMods();

            // A site Composer manages has one source of truth: its composer.json.
            if ($this->app->make(Layout::class)->managed() === 'composer') {
                throw new RuntimeException(__('This site is managed with Composer. Run: composer require :package', ['package' => (string) ($spec['package'] ?? '<package>')]));
            }

            if ($running = $this->running()) {
                throw new RuntimeException(__('Another install is running: :package.', ['package' => (string) ($running['package'] ?? '')]));
            }

            $job = [
                'id' => bin2hex(random_bytes(8)),
                'step' => 'preflight',
                'state' => 'running',
                'created_at' => $this->now(),
                'touched_at' => $this->now(),
                'turn_on' => $spec['turn_on'] ?? true,
                'context' => $spec['context'] ?? [],
                'source' => $spec['source'] ?? [],
                ...array_intersect_key($spec, array_flip(['package', 'version', 'url', 'zip', 'headers', 'size', 'sha256', 'verifier'])),
            ];
            $this->save($job);

            return $job;
        });
    }

    /** Runs the next step. Each failure stops the job and says why; after the swap it also puts things back. */
    public function step(string $id): array
    {
        return $this->locked(function () use ($id) {
            $job = $this->load($id);

            if (($job['state'] ?? '') !== 'running') {
                return $job;
            }

            try {
                $next = $this->{'run'.ucfirst((string) $job['step'])}($job);
                $job = $this->load($id);
                $job['step'] = $next;
                $job['state'] = $next === 'done' ? 'done' : 'running';
                $job['touched_at'] = $this->now();
                $this->save($job);

                if ($next === 'done') {
                    $this->finish($job);
                }
            } catch (Throwable $e) {
                $job = $this->load($id);
                $this->failed($job, $e->getMessage(), $e->getCode() === self::UNSIGNED ? 'unsigned' : null);
                $job = $this->load($id);
            }

            return $job;
        });
    }

    /** @return array<string, mixed> */
    public function status(string $id): array
    {
        return $this->load($id);
    }

    /** @return array<string, mixed>|null The job still going, if any. One that has sat too long has died. */
    public function running(): ?array
    {
        foreach (glob($this->dir('jobs/*.json')) ?: [] as $file) {
            $job = Files::readJson($file);

            if (($job['state'] ?? '') === 'running') {
                return $job;
            }
        }

        return null;
    }

    /** Put the previous version back. Its database stays as it is: migrations in a non-major only add. */
    public function rollback(string $package): void
    {
        $this->locked(function () use ($package) {
            $this->cms->guardFileMods();
            $record = $this->sources()[$package] ?? null;
            $target = $this->cms->packages()->repository()->find($package)?->path ?? null;
            $backup = is_array($record) ? (string) ($record['backup'] ?? '') : '';

            if (! $target || $backup === '' || ! is_dir($backup)) {
                throw new RuntimeException(__('There is no earlier version of :package to go back to.', ['package' => $package]));
            }

            $this->restore($target, $backup);
            $this->record($package, ['version' => $record['previous_version'] ?? null, 'backup' => null, 'previous_version' => null] + $record);
            $this->cms->packages()->refresh();
        });
    }

    /** @return array<string, array<string, mixed>> package => where it came from */
    public function sources(): array
    {
        return Files::readJson($this->dir('sources.json'));
    }

    /** @return list<string> What would make any install fail right now, as codes the admin explains */
    public function hostProblems(): array
    {
        $host = $this->host ?? new HostFacts;
        $problems = [];

        if (! $host->zip()) {
            $problems[] = 'no_zip';
        }

        if (! $host->curl()) {
            $problems[] = 'no_curl';
        }

        if (! $host->rename()) {
            $problems[] = 'no_rename';
        }

        if (! is_dir($this->packagesDir()) ? ! is_writable($this->app->sitePath()) : ! is_writable($this->packagesDir())) {
            $problems[] = 'not_writable';
        }

        if ($host->opcacheRisk()) {
            $problems[] = 'opcache';
        }

        return $problems;
    }

    /**
     * Where a package goes on this site: the same folder Composer puts it in (see letterncms/composer-plugin),
     * plugins/ for a plugin and kits/ for a site kit.
     */
    public function targetFor(string $name, string $type = PackageManifest::PLUGIN): string
    {
        $existing = $type === PackageManifest::PLUGIN ? $this->cms->packages()->repository()->find($name) : null;

        if ($existing) {
            return $existing->path;
        }

        [$vendor, $short] = explode('/', $name, 2);

        return ($type === PackageManifest::KIT ? $this->app->sitePath('kits') : $this->packagesDir()).'/'.($vendor === PackageManifest::VENDOR ? $short : "{$vendor}-{$short}");
    }

    private function packagesDir(): string
    {
        return $this->app->sitePath('plugins');
    }

    private function runPreflight(array $job): string
    {
        $this->cms->guardFileMods();
        $problems = $this->hostProblems();

        if ($problems !== []) {
            throw new RuntimeException(self::explain($problems[0]));
        }

        if (! empty($job['url']) && ! Ed25519::available()) {
            throw new RuntimeException(__('PHP on this server has no Ed25519, so a signed package cannot be checked. Upload it by hand instead.'));
        }

        $size = (int) ($job['size'] ?? 0);
        $free = ($this->host ?? new HostFacts)->freeSpace($this->app->sitePath());

        if ($size > 0 && $free !== null && $free < 3 * $size) {
            throw new RuntimeException(__('Not enough disk space: this needs :mb MB free.', ['mb' => (int) ceil(3 * $size / 1048576)]));
        }

        return 'fetch';
    }

    private function runFetch(array $job): string
    {
        if (! empty($job['zip'])) {
            return 'verify';
        }

        $path = $this->incoming($job);
        $this->remote->toFile((string) $job['url'], $path, (int) ceil((int) $job['size'] * 1.01) + 1024, (array) ($job['headers'] ?? []));
        $job['zip'] = $path;
        $this->save($job);

        return 'verify';
    }

    private function runVerify(array $job): string
    {
        $verifier = $this->verifiers[(string) ($job['verifier'] ?? '')] ?? null;

        if (! $verifier) {
            throw new RuntimeException('No one can verify this package.');
        }

        $verifier($job);

        return 'inspect';
    }

    private function runInspect(array $job): string
    {
        $result = $this->inspector->inspect((string) $job['zip'], $job['package'] ?? null, (string) (($job['core_version'] ?? null) ?: Cms::VERSION));
        $job['top'] = $result['top'];
        $job['package'] = $result['composer']['name'];
        $job['type'] = $result['composer']['type'];
        $job['package_version'] = (string) ($result['composer']['version'] ?? '0.0.0');
        $job['psr4'] = array_keys((array) ($result['composer']['autoload']['psr-4'] ?? []));
        $this->save($job);

        // Who may claim a package's name is the verifier's call (no package may take a module's: see PackageRepository).
        ($this->verifiers[(string) $job['verifier'].':inspected'] ?? static fn () => null)($job);

        return 'stage';
    }

    private function runStage(array $job): string
    {
        $target = $this->targetFor((string) $job['package'], (string) ($job['type'] ?? PackageManifest::PLUGIN));
        $parent = dirname($target);
        Files::ensureDir($parent);
        // Beside the target: same filesystem, so the rename can't cross a mount.
        $stage = $parent.'/.incoming-'.$job['id'];
        Files::deleteDirectory($stage);
        $zip = new ZipArchive;

        if ($zip->open((string) $job['zip']) !== true || ! @$zip->extractTo($stage)) {
            Files::deleteDirectory($stage);
            throw new RuntimeException(__('Could not unpack the package. Check the disk space. Nothing was changed.'));
        }

        $zip->close();

        // A kit is read as the CMS reads any kit before it is kept: every file one its layout names, of a kind
        // and a size a site takes. One that isn't stays in the stage, which goes.
        if (($job['type'] ?? null) === PackageManifest::KIT) {
            try {
                $this->cms->hooks()->dispatch('packages.kit.staged', $stage.'/'.$job['top'], basename($target));
            } catch (Throwable $e) {
                Files::deleteDirectory($stage);
                throw new RuntimeException($e->getMessage(), 0, $e);
            }
        }

        // Hosts running PHP as the user refuse group-writable scripts.
        self::setModes($stage);
        $job['stage'] = $stage;
        $job['target'] = $target;
        $this->save($job);

        return 'swap';
    }

    private function runSwap(array $job): string
    {
        $target = (string) $job['target'];
        $stage = $job['stage'].'/'.$job['top'];

        if (is_link($target) || is_dir($target.'/.git')) {
            Files::deleteDirectory((string) $job['stage']);
            throw new RuntimeException(__('This package is a developer checkout. Update it with your own tools.'));
        }

        $backup = null;
        $old = null;

        if (is_dir($target)) {
            $composer = json_decode((string) @file_get_contents($target.'/composer.json'), true);
            $old = is_array($composer) ? (string) ($composer['version'] ?? '0.0.0') : '0.0.0';
            $backup = dirname($target).'/.backup-'.basename($target).'-'.$old;
            Files::deleteDirectory($backup);

            if (! @rename($target, $backup)) {
                throw new RuntimeException(__('Could not move the old version aside. Nothing was changed.'));
            }
        }

        if (! @rename($stage, $target)) {
            if ($backup) {
                @rename($backup, $target);
            }

            throw new RuntimeException(__('Could not put the new version in place. Nothing was changed.'));
        }

        Files::deleteDirectory((string) $job['stage']);

        if (function_exists('opcache_invalidate')) {
            foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($target, \FilesystemIterator::SKIP_DOTS)) as $file) {
                if ($file->getExtension() === 'php') {
                    @opcache_invalidate($file->getPathname(), true);
                }
            }
        }

        $job['backup'] = $backup;
        $job['old_version'] = $old;
        $job['swapped'] = true;
        $this->save($job);
        $this->record((string) $job['package'], [
            ...((array) $job['source']),
            'version' => $job['package_version'],
            'sha256' => hash_file('sha256', (string) $job['zip']),
            'installed_at' => $this->now(),
            'backup' => $backup,
            'previous_version' => $old,
        ]);
        $this->cms->packages()->refresh();

        return 'migrate';
    }

    private function runMigrate(array $job): string
    {
        // A kit is files to copy from, later: nothing to switch on or migrate.
        if (($job['type'] ?? null) === PackageManifest::KIT) {
            return 'health';
        }

        $packages = $this->packages();
        $package = (string) $job['package'];
        $manifest = $packages->repository()->find($package);

        if (! $manifest) {
            throw new RuntimeException(__('The package is not there after the swap.'));
        }

        // A plugin already on stays on; a new one goes on unless the admin said otherwise.
        if ($job['turn_on'] && ! $packages->isEnabled($package)) {
            $packages->enable($package);
            $packages->refresh();
        }

        $packages->sync();

        return 'health';
    }

    private function runHealth(array $job): string
    {
        if (($job['type'] ?? null) === PackageManifest::KIT) {
            return 'done';
        }

        $packages = $this->packages();
        $packages->refresh();
        $package = (string) $job['package'];

        if ($packages->isEnabled($package) && ! $packages->isActive($package)) {
            throw new RuntimeException((string) ($packages->inactive()[$package] ?? __('It did not start.')));
        }

        return 'done';
    }

    private function finish(array $job): void
    {
        (new SiteComposer($this->app))->requires((string) $job['package'], (string) ($job['package_version'] ?? '0.0.0'));
        @unlink($this->incoming($job));

        if (! empty($job['zip']) && str_starts_with((string) $job['zip'], $this->dir('incoming'))) {
            @unlink((string) $job['zip']);
        }

        // A job done is forgotten after a day; a backup after a week.
        foreach (glob($this->dir('jobs/*.json')) ?: [] as $file) {
            if ($this->now() - (int) filemtime($file) > 86_400) {
                @unlink($file);
            }
        }

        foreach (glob($this->packagesDir().'/.backup-*', GLOB_ONLYDIR) ?: [] as $dir) {
            if ($this->now() - (int) filemtime($dir) > self::KEEP_BACKUPS) {
                Files::deleteDirectory($dir);
            }
        }
    }

    private function failed(array $job, string $message, ?string $code = null): void
    {
        if (! empty($job['stage'])) {
            Files::deleteDirectory((string) $job['stage']);
        }

        if (! empty($job['swapped'])) {
            $this->undo($job);
            $message = __(':message The previous state was put back.', ['message' => $message]);
        }

        if (! empty($job['zip']) && str_starts_with((string) $job['zip'], $this->dir('incoming'))) {
            @unlink((string) $job['zip']);
        }

        $job['state'] = 'failed';
        $job['code'] = $code;
        $job['error'] = mb_substr($message, 0, 500);
        $this->save($job);
    }

    private function undo(array $job): void
    {
        $target = (string) $job['target'];
        $package = (string) $job['package'];

        if (! empty($job['backup']) && is_dir((string) $job['backup'])) {
            $this->restore($target, (string) $job['backup']);
            $sources = $this->sources();

            if (isset($sources[$package])) {
                $this->record($package, ['version' => $job['old_version'], 'backup' => null, 'previous_version' => null] + $sources[$package]);
            }
        } else {
            // There was nothing before: it leaves no trace.
            try {
                if ($this->packages()->isEnabled($package)) {
                    $this->packages()->disable($package);
                }
            } catch (Throwable) {
            }

            Files::deleteDirectory($target);
            $sources = $this->sources();
            unset($sources[$package]);
            Files::putJson($this->dir('sources.json'), $sources);
        }

        $this->packages()->refresh();
    }

    private function restore(string $target, string $backup): void
    {
        $failed = dirname($target).'/.failed-'.basename($target).'-'.bin2hex(random_bytes(3));

        if (is_dir($target) && ! @rename($target, $failed)) {
            throw new RuntimeException(__('Could not move the current version aside.'));
        }

        if (! @rename($backup, $target)) {
            @rename($failed, $target);
            throw new RuntimeException(__('Could not put the earlier version back.'));
        }

        Files::deleteDirectory($failed);
    }

    /** @param  array<string, mixed>  $record */
    private function record(string $package, array $record): void
    {
        Files::putJson($this->dir('sources.json'), [...$this->sources(), $package => $record]);
    }

    private static function setModes(string $dir): void
    {
        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS), \RecursiveIteratorIterator::SELF_FIRST) as $item) {
            @chmod($item->getPathname(), $item->isDir() ? 0o755 : 0o644);
        }
    }

    public static function explain(string $problem): string
    {
        return match ($problem) {
            'no_zip' => __('This host has no ZipArchive. Download the package, unpack it and upload its folder to plugins/ by FTP.'),
            'no_curl' => __('This host has no curl. Download the package and upload it here by hand.'),
            'no_rename' => __('This host disables rename(). Upload the package folder to plugins/ by FTP.'),
            'not_writable' => __("Can’t write to plugins/. Download the package and upload its folder by FTP."),
            'opcache' => __('This host caches PHP without noticing changed files, and :brand cannot clear that cache. Upload the files, then restart PHP in your host’s panel.'),
            default => $problem,
        };
    }

    private function packages(): PackageManager
    {
        return $this->cms->packages();
    }

    private function incoming(array $job): string
    {
        return $this->dir('incoming/'.$job['id'].'.zip');
    }

    private function dir(string $path = ''): string
    {
        return $this->app->storagePath('packages'.($path === '' ? '' : '/'.$path));
    }

    private function now(): int
    {
        return Carbon::now()->getTimestamp();
    }

    /** @return array<string, mixed> */
    private function load(string $id): array
    {
        $job = Files::readJson($this->dir('jobs/'.preg_replace('/[^a-f0-9]/', '', $id).'.json'));

        if ($job === []) {
            throw new RuntimeException(__('That install is not known here.'));
        }

        return $job;
    }

    /** For a verifier that learned where a package came from. @param  array<string, mixed>  $job */
    public function saveJob(array $job): void
    {
        $this->save($job);
    }

    /** @param  array<string, mixed>  $job */
    private function save(array $job): void
    {
        Files::putJson($this->dir('jobs/'.$job['id'].'.json'), $job);
    }

    /**
     * @template T
     * @param  callable(): T  $work
     * @return T
     */
    private function locked(callable $work): mixed
    {
        return Files::locked($this->dir('lock'), $work, static fn () => throw new RuntimeException(__('Another install step is running. Try again in a moment.')));
    }
}

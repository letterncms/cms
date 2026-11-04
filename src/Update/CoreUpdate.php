<?php

declare(strict_types=1);

namespace Cms\Update;

use Cms\Admin\Manifest;
use Cms\Cms;
use Cms\Contracts\MailMessage;
use Cms\Contracts\Mailer;
use Cms\Contracts\SiteBuilder;
use Cms\Foundation\Application;
use Cms\Packages\PackageManifest;
use Cms\Packages\SiteComposer;
use Cms\Support\Files;
use Cms\Support\Remote;
use Cms\Trust\TrustRegistry;
use Cms\Users\User;
use Composer\Semver\Semver;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;
use ZipArchive;

/**
 * Updates the core in steps small enough for any shared host: each call does one step inside its
 * budget, and whatever dies between calls resumes on the next. Everything up to the switch
 * happens beside the live site, so a failure there changes nothing. The switch is one rename;
 * then the new code migrates and checks itself, and any failure renames back.
 *
 *   idle > downloading > verifying > extracting > checking_files > ready > switching
 *        > migrating > checking > done
 *   before the switch, any failure: failed. After it: rolled_back.
 */
class CoreUpdate
{
    public const int GATE_SECONDS = 120;

    public const int WATCH_SECONDS = 900;

    private const int KEEP_RELEASES = 7 * 86_400;

    private const int RETRY_AFTER = 86_400;

    /** @var (callable(): list<string>)|null Replaces the real checks in tests */
    public $healthCheck = null;

    /** Set in tests, which have no web server to reach. */
    public bool $loopback = true;

    /** Overridable so an update can be proved from any checkout's version. */
    public string $runningVersion = Cms::VERSION;

    public function __construct(
        private readonly Application $app,
        private readonly Layout $layout,
        private readonly ReleaseFeed $feed,
        private readonly TrustRegistry $trust,
        private readonly Remote $remote,
    ) {}

    /** Whether a tick has anything to do: only inside the window an admin's switch opened. */
    public static function due(Application $app): bool
    {
        $file = $app->storagePath('update/verify.json');
        $verify = is_file($file) ? json_decode((string) @file_get_contents($file), true) : null;

        return is_array($verify) && in_array($verify['state'] ?? '', ['migrating', 'checking'], true);
    }

    /** @return array<string, mixed> The state, with what the admin needs to explain it */
    public function status(): array
    {
        $state = $this->reconcile();
        $current = $this->layout->current() ?? $this->runningVersion;

        return [
            ...array_intersect_key($state, array_flip(['state', 'target', 'previous', 'error', 'auto'])),
            'state' => $state['state'] ?? 'idle',
            'current' => $current,
            'managed' => $this->layout->managed(),
            'drive' => in_array($state['state'] ?? '', ['migrating', 'checking'], true),
        ];
    }

    /** The update on offer, and everything that stands in its way. */
    public function offer(): array
    {
        $current = $this->layout->current() ?? $this->runningVersion;
        $same = $this->feed->latest($current);
        $next = $this->feed->latest($current, sameMajor: false);
        $describe = fn (?array $release) => $release ? [
            'version' => $release['version'],
            'released_at' => $release['released_at'] ?? null,
            'security' => (bool) ($release['security'] ?? false),
            'notes_url' => $release['notes_url'] ?? null,
            'major' => (int) explode('.', (string) $release['version'])[0] !== (int) explode('.', $current)[0],
            'host_problems' => $this->feed->hostProblems($release),
            'incompatible' => $this->incompatible((string) $release['version']),
        ] : null;

        return [
            'current' => $current,
            'managed' => $this->layout->managed(),
            'freshness' => $this->feed->freshness(),
            'trust' => $this->trust->default()->problem(),
            'check' => $this->feed->state(),
            'update' => $describe($same),
            'major' => $next && ($same === null || $next['version'] !== $same['version']) ? $describe($next) : null,
            'yanked' => $this->feed->yankedReason($current),
            'support_ended' => $this->feed->supportEnded($current),
            'auto' => $this->autoEnabled(),
            'postponed_until' => $this->settings()['postpone_until'] ?? null,
        ];
    }

    /** @return list<string> Active packages of this site that the target doesn't suit */
    public function incompatible(string $version): array
    {
        $out = [];

        foreach ($this->app->make(Cms::class)->packages()->active() as $package) {
            if ($package->coreConstraint && ! Semver::satisfies($version, $package->coreConstraint)) {
                $out[] = $package->name;
            }
        }

        return $out;
    }

    /** @return array<string, mixed> */
    public function start(string $version, bool $auto = false): array
    {
        return $this->locked(function () use ($version, $auto) {
            $state = $this->reconcile();

            if (! in_array($state['state'] ?? 'idle', ['idle', 'failed', 'done', 'rolled_back'], true)) {
                throw new RuntimeException(__('An update is already running.'));
            }

            if ($reason = $this->layout->managed()) {
                throw new RuntimeException($reason === 'composer' || $reason === 'git'
                    ? __('This site is managed with Composer. Update it with composer update.')
                    : __('This site does not change its own files. Update it through your deploy.'));
            }

            $freshness = $this->feed->freshness();

            if ($freshness === 'clock') {
                throw new RuntimeException(__("This server’s clock looks wrong. Updates are paused. The public site is not affected."));
            }

            if ($freshness === 'expired' || $freshness === 'none') {
                throw new RuntimeException(__("Can’t confirm this update list is current. Check for updates again."));
            }

            $release = $this->feed->find($version);
            $current = $this->layout->current() ?? $this->runningVersion;

            if (! $release || version_compare($version, $current, '<=')) {
                throw new RuntimeException(__('That version is not on offer.'));
            }

            $this->preflight($release);

            $state = ['state' => 'downloading', 'target' => $version, 'previous' => $current, 'release' => $release, 'auto' => $auto, 'started_at' => $this->now()] + array_intersect_key($state, ['failures' => 1]);
            $this->save($state);

            return $this->status();
        });
    }

    /** One step. Before the switch; after it, the new code carries on (see drive). */
    public function step(): array
    {
        $status = $this->locked(function () {
            $state = $this->reconcile();

            try {
                $this->run($state);
            } catch (Throwable $e) {
                $this->fail($state, $e->getMessage());
            }

            return $this->status();
        });

        // Outside the lock: the tick this wakes needs it.
        if ($status['drive'] && $this->loopback) {
            $this->ping();
        }

        return $status;
    }

    /**
     * Runs on the new release, from the tick. Migrates, lifts the gate, checks that the site really
     * works, and either settles or goes back.
     *
     * @return array{state: string}
     */
    public function drive(): array
    {
        return $this->locked(function () {
            $state = $this->state();
            $verify = $this->verify();

            if (! $verify) {
                return ['state' => $state['state'] ?? 'idle'];
            }

            try {
                if (($verify['state'] ?? '') === 'migrating') {
                    // Each tick buys the migrations more time before the loader gives up.
                    $this->writeVerify(['gate_until' => $this->now() + self::GATE_SECONDS] + $verify);
                    Upgrader::run($this->app);
                    $this->writeVerify(['state' => 'checking'] + $this->verify());
                    $this->save(['state' => 'checking'] + $state);
                    $state = $this->state();
                }

                $problems = $this->healthCheck ? ($this->healthCheck)() : $this->checks((string) ($state['target'] ?? ''));

                if ($problems !== []) {
                    throw new RuntimeException(implode(' ', $problems));
                }

                $this->settle($state);
            } catch (Throwable $e) {
                $this->flipBack($state, $e->getMessage());
            }

            return ['state' => $this->state()['state'] ?? 'idle'];
        }, busy: static fn () => ['state' => 'migrating']);
    }

    /** The whole upgrade failed before its own code could run: put the pointer back without it. */
    public static function abandon(string $sitePath, string $error): array
    {
        $vf = $sitePath.'/storage/update/verify.json';
        $verify = is_file($vf) ? json_decode((string) @file_get_contents($vf), true) : null;

        if (! is_array($verify)) {
            return ['state' => 'idle'];
        }

        $pointer = $sitePath.'/runtime/current';
        $tmp = dirname($pointer).'/.cms-release.'.bin2hex(random_bytes(4));
        $previous = (string) ($verify['previous'] ?? '');

        if ($previous !== '' && @file_put_contents($tmp, $previous."\n") === strlen($previous) + 1 && @rename($tmp, $pointer)) {
            @unlink($vf);
            @touch($sitePath.'/storage/update/purge');
        } else {
            @unlink($tmp);
        }

        $file = $sitePath.'/storage/update/state.json';
        $state = is_file($file) ? (array) json_decode((string) @file_get_contents($file), true) : [];
        $state = ['state' => 'rolled_back', 'error' => mb_substr($error, 0, 500), 'failures' => ['version' => $state['target'] ?? null, 'count' => (int) ($state['failures']['count'] ?? 0) + 1, 'at' => time()]] + $state;
        @file_put_contents($file, (string) json_encode($state, JSON_UNESCAPED_SLASHES));

        return ['state' => 'rolled_back'];
    }

    /** Back to the release before this one: the admin's button, while it's still on disk. */
    public function rollback(): array
    {
        return $this->locked(function () {
            $state = $this->reconcile();
            $previous = (string) ($state['previous'] ?? '');

            if (($state['state'] ?? '') !== 'done' || $previous === '' || ! is_dir($this->layout->release($previous))) {
                throw new RuntimeException(__('There is no earlier release to go back to.'));
            }

            $this->flipBack($state, 'Rolled back by hand.', countsAsFailure: false);

            return $this->status();
        });
    }

    /** Switch to a release someone uploaded by FTP into runtime/<version>/. */
    public function switchTo(string $version): array
    {
        return $this->locked(function () use ($version) {
            $state = $this->reconcile();

            if (! preg_match('/^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/', $version) || ! is_file($this->layout->release($version).'/vendor/autoload.php')) {
                throw new RuntimeException(__('That release is not in runtime/ yet.'));
            }

            $current = $this->layout->current() ?? $this->runningVersion;
            $state = ['state' => 'ready', 'target' => $version, 'previous' => $current, 'manual' => true, 'started_at' => $this->now()] + array_intersect_key($state, ['failures' => 1]);
            $this->save($state);
            $this->run($state);

            return $this->status();
        });
    }

    public function postpone(int $days): void
    {
        $this->saveSettings(['postpone_until' => $this->now() + min(14, max(1, $days)) * 86_400]);
    }

    public function setAuto(bool $on): void
    {
        $this->saveSettings(['security_auto' => $on]);
    }

    public function autoEnabled(): bool
    {
        $env = env('CMS_UPDATE_AUTO');

        return $env !== null ? filter_var($env, FILTER_VALIDATE_BOOLEAN) : (bool) ($this->settings()['security_auto'] ?? true);
    }

    /**
     * An automatic security update, one step per call. Never decided on a public request: this
     * runs only for a signed-in admin's visit or from the command line. Whatever stands in its way
     * turns it into a notice.
     *
     * @return array{more: bool, reason?: string, state?: string}
     */
    public function auto(): array
    {
        $state = $this->reconcile();
        $running = $state['state'] ?? 'idle';

        if (! in_array($running, ['idle', 'failed', 'done', 'rolled_back'], true)) {
            if (! ($state['auto'] ?? false)) {
                return ['more' => false, 'reason' => 'manual_running'];
            }

            return $this->advance();
        }

        $reason = $this->autoBlocker();

        if ($reason !== null) {
            return ['more' => false, 'reason' => $reason];
        }

        $current = $this->layout->current() ?? $this->runningVersion;
        $this->start((string) $this->feed->latest($current)['version'], auto: true);

        return $this->advance();
    }

    /** @return array{more: bool, state: string} */
    private function advance(): array
    {
        $status = $this->step();
        $state = (string) $status['state'];

        if ($state === 'migrating' && PHP_SAPI === 'cli' && $this->loopback) {
            $state = $this->finishFromCli();
        }

        return ['more' => ! in_array($state, ['idle', 'failed', 'done', 'rolled_back'], true), 'state' => $state];
    }

    /** Why no automatic update starts now, in a code. Null when one may. */
    public function autoBlocker(): ?string
    {
        if (! $this->autoEnabled()) {
            return 'off';
        }

        if ($this->layout->managed()) {
            return 'managed';
        }

        if (($this->settings()['postpone_until'] ?? 0) > $this->now()) {
            return 'postponed';
        }

        if ($this->feed->freshness() !== 'ok') {
            return 'feed';
        }

        $current = $this->layout->current() ?? $this->runningVersion;
        $release = $this->feed->latest($current);

        if (! $release) {
            return 'none';
        }

        // A plain update doesn't go by itself. A security one does, when the running version is what it fixes.
        $security = $this->securityFix($current);

        if (! $security) {
            return 'none';
        }

        if ($this->feed->hostProblems($release) !== []) {
            return 'host';
        }

        if ($this->incompatible((string) $release['version']) !== []) {
            return 'incompatible';
        }

        $failures = $this->state()['failures'] ?? null;

        if (is_array($failures) && ($failures['version'] ?? null) === $release['version']) {
            if ((int) $failures['count'] >= 2) {
                return 'failed_twice';
            }

            if ($this->now() - (int) ($failures['at'] ?? 0) < self::RETRY_AFTER) {
                return 'retry_later';
            }
        }

        try {
            $this->preflight($release);
        } catch (Throwable) {
            return 'preflight';
        }

        return null;
    }

    /** Whether some release marked security fixes the running version. */
    public function securityFix(string $current): bool
    {
        foreach ($this->feed->releases() as $release) {
            if (($release['security'] ?? false) === true && version_compare((string) $release['version'], $current, '>') && (int) explode('.', (string) $release['version'])[0] === (int) explode('.', $current)[0]) {
                $fixes = (string) ($release['fixes'] ?? '');

                if ($fixes === '' || Semver::satisfies($current, $fixes)) {
                    return true;
                }
            }
        }

        return false;
    }

    /** @param  array<string, mixed>  $release */
    private function preflight(array $release): void
    {
        if (! class_exists(ZipArchive::class) || ! function_exists('curl_init')) {
            throw new RuntimeException(__('This host has no ZipArchive or curl. Download the release and upload runtime/:version/ by FTP.', ['version' => $release['version']]));
        }

        if (! function_exists('rename')) {
            throw new RuntimeException(__('This host disables rename(), so an update cannot go live. Upload the release by FTP.'));
        }

        if ($problems = $this->feed->hostProblems($release)) {
            throw new RuntimeException(__('This release needs :what on this host.', ['what' => implode(', ', $problems)]));
        }

        $runtime = $this->layout->runtime();

        if (! is_writable($runtime) || ! is_writable(dirname($this->layout->pointer()))) {
            throw new RuntimeException(__("Can’t write to runtime/. Download the release, upload runtime/:version/ by FTP, then switch to it here.", ['version' => $release['version']]));
        }

        $needed = 3 * (int) ($release['size'] ?? 0);
        $free = function_exists('disk_free_space') ? @disk_free_space($runtime) : false;

        if ($free !== false && $free < $needed) {
            throw new RuntimeException(__('Not enough disk space: an update needs :mb MB free.', ['mb' => (int) ceil($needed / 1048576)]));
        }
    }

    /** @param  array<string, mixed>  $state */
    private function run(array $state): void
    {
        $target = (string) ($state['target'] ?? '');

        match ($state['state'] ?? 'idle') {
            'downloading' => $this->download($state, $target),
            'verifying' => $this->verifyDownload($state, $target),
            'extracting' => $this->extract($state, $target),
            'checking_files' => $this->checkFiles($state, $target),
            'ready' => $this->switchOver($state, $target),
            default => null,
        };
    }

    private function download(array $state, string $target): void
    {
        $release = (array) $state['release'];

        // An earlier try already unpacked it.
        if (is_dir($this->layout->release($target))) {
            $this->save(['state' => 'checking_files', 'dir' => $this->layout->release($target), 'cursor' => 0] + $state);

            return;
        }

        $this->remote->toFile((string) $release['url'], $this->zip($target), (int) ceil((int) $release['size'] * 1.01) + 1024);
        $this->save(['state' => 'verifying'] + $state);
    }

    private function verifyDownload(array $state, string $target): void
    {
        $release = (array) $state['release'];
        $zip = $this->zip($target);

        if (! hash_equals(strtolower((string) $release['sha256']), (string) @hash_file('sha256', $zip))) {
            @unlink($zip);
            throw new RuntimeException(__('The download is damaged. Nothing was changed. Try again.'));
        }

        if (! $this->trust->default()->versionVerifies(ReleaseFeed::PRODUCT, ['first_party' => true, ...$release], $this->runningVersion)) {
            @unlink($zip);
            throw new RuntimeException(__('The signature on this release does not verify. Nothing was changed.'));
        }

        $this->save(['state' => 'extracting', 'cursor' => 0, 'dir' => $this->layout->runtime('.incoming-'.$target.'-'.bin2hex(random_bytes(4)))] + $state);
    }

    private function extract(array $state, string $target): void
    {
        $zip = new ZipArchive;

        if ($zip->open($this->zip($target)) !== true) {
            throw new RuntimeException(__('The download is damaged. Nothing was changed. Try again.'));
        }

        $prefix = 'runtime/'.$target.'/';
        $dir = (string) $state['dir'];
        $cursor = (int) $state['cursor'];
        $deadline = $this->deadline();
        $total = $zip->numFiles;

        for ($i = $cursor; $i < $total && microtime(true) < $deadline;) {
            $batch = [];

            for (; $i < $total && count($batch) < 200; $i++) {
                $name = (string) $zip->getNameIndex($i);

                if (str_starts_with($name, $prefix)) {
                    if (str_contains($name, '..') || str_contains($name, '\\')) {
                        throw new RuntimeException('Unsafe path in the release: '.$name);
                    }

                    $batch[] = $name;
                }
            }

            if ($batch !== [] && ! $zip->extractTo($dir, $batch)) {
                throw new RuntimeException(__('Could not unpack the release. Check the disk space. Nothing was changed.'));
            }
        }

        $zip->close();

        if ($i < $total) {
            $this->save(['cursor' => $i] + $state);

            return;
        }

        $this->save(['state' => 'checking_files', 'cursor' => 0, 'dir' => $dir.'/'.$prefix] + $state);
    }

    /** Every file against the release's own list: a truncated or partly blocked unpacking stops here. */
    private function checkFiles(array $state, string $target): void
    {
        $dir = rtrim((string) $state['dir'], '/');
        $list = @file($dir.'/release.files', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        if ($list === false) {
            $this->repairOrFail($state, $target, 'release.files is missing.');

            return;
        }

        $cursor = (int) $state['cursor'];
        $deadline = $this->deadline();

        for (; $cursor < count($list) && microtime(true) < $deadline; $cursor++) {
            [$hash, $path] = explode('  ', $list[$cursor], 2);

            if (! is_file($dir.'/'.$path) || hash_file('sha256', $dir.'/'.$path) !== $hash) {
                $this->repairOrFail($state, $target, "{$path} does not match.");

                return;
            }
        }

        if ($cursor < count($list)) {
            $this->save(['cursor' => $cursor] + $state);

            return;
        }

        $final = $this->layout->release($target);

        if ($dir !== $final) {
            if (is_dir($final) && ! @rename($final, $this->layout->runtime('.trash-'.$target.'-'.bin2hex(random_bytes(4))))) {
                throw new RuntimeException(__('Could not put the release in place. Nothing was changed.'));
            }

            if (! @rename($dir, $final)) {
                throw new RuntimeException(__('Could not put the release in place. Nothing was changed.'));
            }

            Files::deleteDirectory($this->layout->runtime(explode('/', substr($dir, strlen($this->layout->runtime()) + 1))[0]));
        }

        $this->save(['state' => 'ready', 'dir' => $final] + $state);
    }

    /** A damaged folder from an earlier try goes aside, and the release is downloaded again. A fresh one failing is a real failure. */
    private function repairOrFail(array $state, string $target, string $problem): void
    {
        if (rtrim((string) $state['dir'], '/') === $this->layout->release($target) && ! ($state['repaired'] ?? false) && isset($state['release'])) {
            @rename($this->layout->release($target), $this->layout->runtime('.trash-'.$target.'-'.bin2hex(random_bytes(4))));
            $this->save(['state' => 'downloading', 'repaired' => true] + $state);

            return;
        }

        throw new RuntimeException(__('The unpacked release is not complete: :problem Nothing was changed.', ['problem' => $problem]));
    }

    private function switchOver(array $state, string $target): void
    {
        $pointer = $this->layout->pointer();

        if (! is_writable(dirname($pointer)) || (is_file($pointer) && ! is_writable($pointer) && ! is_writable(dirname($pointer)))) {
            throw new RuntimeException(__("Can’t write the release pointer. Edit :file by FTP and run the update from Modules.", ['file' => basename($pointer)]));
        }

        $this->backupSqlite();

        $previous = (string) $state['previous'];

        Files::put($this->app->storagePath('update/verify.json'), (string) json_encode(['state' => 'migrating', 'previous' => $previous, 'target' => $target, 'gate_until' => $this->now() + self::GATE_SECONDS, 'until' => $this->now() + self::WATCH_SECONDS]));
        @unlink($this->app->storagePath('update/fatals'));

        if (! $this->layout->flip($target)) {
            @unlink($this->app->storagePath('update/verify.json'));

            throw new RuntimeException(__('Could not write the release pointer. Nothing was changed.'));
        }

        $this->save(['state' => 'migrating'] + $state);
    }

    /** Best effort, a second at most: the browser or the CLI keeps ticking if this doesn't land. */
    private function ping(): void
    {
        $url = rtrim((string) ($this->app->make(Cms::class)->site('url') ?: config('app.url')), '/').'/_cms/update/tick';

        try {
            $ch = curl_init($url);
            curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_TIMEOUT => 1, CURLOPT_CONNECTTIMEOUT => 1, CURLOPT_RETURNTRANSFER => true, CURLOPT_POSTFIELDS => '', CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS]);
            curl_exec($ch);
        } catch (Throwable) {
        }
    }

    /** After a switch from the command line: each new process reads the pointer, so this one's code is the old code. */
    public function finishFromCli(): string
    {
        $this->finishInNewProcess();

        return (string) $this->status()['state'];
    }

    private function finishInNewProcess(): void
    {
        $cli = $this->layout->root().'/cms';

        if (! is_file($cli) || ! function_exists('proc_open')) {
            return;
        }

        for ($try = 0; $try < 5 && static::due($this->app); $try++) {
            $process = new \Symfony\Component\Process\Process([PHP_BINARY, $cli, 'update:finish']);
            $process->setTimeout(300);
            $process->run();
        }
    }

    /** @return list<string> What doesn't work on the new release */
    private function checks(string $target): array
    {
        $problems = [];
        $cms = $this->app->make(Cms::class);

        if ($this->runningVersion !== $target) {
            $problems[] = "The running version is {$this->runningVersion}, not {$target}.";
        }

        try {
            DB::connection()->getPdo();
        } catch (Throwable $e) {
            $problems[] = 'The database is not reachable: '.$e->getMessage();
        }

        foreach ($cms->packages()->enabled() as $name) {
            $package = $cms->packages()->repository()->find($name);

            if ($package?->core && ! $cms->packages()->isActive($name)) {
                $problems[] = "{$name} did not start: ".($cms->packages()->inactive()[$name] ?? 'unknown reason');
            }
        }

        try {
            $user = User::query()->first();

            if ($user) {
                $this->app->make(Manifest::class)->build($user);
            }
        } catch (Throwable $e) {
            $problems[] = 'The admin does not build: '.$e->getMessage();
        }

        if ($cms->isActive(PackageManifest::VENDOR.'/site')) {
            try {
                $response = $this->app->make(Kernel::class)->handle(Request::create('/'));

                if ($response->getStatusCode() >= 500) {
                    $problems[] = 'The home page answers '.$response->getStatusCode().'.';
                }
            } catch (Throwable $e) {
                $problems[] = 'The home page fails: '.$e->getMessage();
            }
        }

        return $problems;
    }

    private function settle(array $state): void
    {
        $target = (string) ($state['target'] ?? '');
        $previous = (string) ($state['previous'] ?? '');

        (new SiteComposer($this->app))->requires(PackageManifest::CORE, $target);

        try {
            $this->replaceRootFiles($target, $previous);
        } catch (Throwable $e) {
            report($e);
        }

        @unlink($this->zip($target));

        foreach (glob($this->layout->runtime('.trash-*')) ?: [] as $trash) {
            Files::deleteDirectory($trash);
        }

        $this->writeVerify(['state' => 'watching'] + (array) $this->verify());
        $this->save(['state' => 'done', 'finished_at' => $this->now()] + array_diff_key($state, ['failures' => 1, 'release' => 1, 'error' => 1, 'cursor' => 1, 'dir' => 1]));
        $this->pruneReleases($target, $previous);

        try {
            $this->app->make(Cms::class)->hooks()->dispatch('cms.updated', $previous, $target);
            $builder = $this->app->make(SiteBuilder::class);

            if ($builder->available()) {
                $builder->queue(null, 'update');
            }
        } catch (Throwable $e) {
            report($e);
        }

        $this->notify(__(':brand updated to :version', ['version' => $target]), __('This site now runs :version, and it checked itself after the switch. Nothing else is needed.', ['version' => $target]));
    }

    private function flipBack(array $state, string $error, bool $countsAsFailure = true): void
    {
        $previous = (string) ($state['previous'] ?? '');
        $target = (string) ($state['target'] ?? '');

        if ($previous !== '' && ! $this->layout->flip($previous)) {
            $error .= ' Could not write the pointer back.';
        }

        @unlink($this->app->storagePath('update/verify.json'));
        @unlink($this->app->storagePath('update/fatals'));
        @touch($this->app->storagePath('update/purge'));

        $failures = $state['failures'] ?? null;
        $count = is_array($failures) && ($failures['version'] ?? null) === $target ? (int) $failures['count'] : 0;

        $this->save(['state' => 'rolled_back', 'error' => mb_substr($error, 0, 500), 'failures' => $countsAsFailure ? ['version' => $target, 'count' => $count + 1, 'at' => $this->now()] : $failures] + $state);

        if ($countsAsFailure) {
            $this->notify(__('An update of :brand was rolled back'), __('The update to :version failed its own checks, so this site went back to :previous. Your content is safe. :error', ['version' => $target, 'previous' => $previous, 'error' => $error]));
        }
    }

    /** Unchanged root files are replaced; a file someone edited stays, with the new one beside it. */
    private function replaceRootFiles(string $target, string $previous): void
    {
        $meta = fn (string $version) => (array) (json_decode((string) @file_get_contents($this->layout->release($version).'/release.json'), true)['root_files'] ?? []);
        $new = $meta($target);
        $old = $meta($previous);
        $conflicts = [];

        foreach ($new as $file => $hash) {
            $source = $this->layout->release($target).'/root/'.$file;
            $dest = $this->layout->root().'/'.$file;

            if (! is_file($source)) {
                continue;
            }

            $have = is_file($dest) ? hash_file('sha256', $dest) : null;

            if ($have === $hash) {
                continue;
            }

            if ($have === null || $have === ($old[$file] ?? null)) {
                Files::put($dest, (string) file_get_contents($source));
            } else {
                Files::put($dest.'.new', (string) file_get_contents($source));
                $conflicts[] = $file;
            }
        }

        if ($conflicts !== []) {
            $this->save(['root_conflicts' => $conflicts] + $this->state());
        }
    }

    private function backupSqlite(): void
    {
        try {
            if (config('database.default') === 'sqlite') {
                $database = (string) config('database.connections.sqlite.database');

                if (is_file($database)) {
                    Files::ensureDir($this->app->storagePath('update/backup'));
                    @copy($database, $this->app->storagePath('update/backup/'.basename($database)));
                }
            }
        } catch (Throwable) {
        }
    }

    private function pruneReleases(string $target, string $previous): void
    {
        $keep = [$target, $previous];

        foreach (glob($this->layout->runtime('*'), GLOB_ONLYDIR) ?: [] as $dir) {
            $name = basename($dir);

            if (preg_match('/^\d+\.\d+\.\d+/', $name) === 1 && ! in_array($name, $keep, true) && $this->now() - (int) filemtime($dir) > self::KEEP_RELEASES) {
                Files::deleteDirectory($dir);
            }
        }
    }

    private function notify(string $subject, string $body): void
    {
        try {
            $mailer = $this->app->make(Mailer::class);

            if (! $mailer->configured()) {
                return;
            }

            foreach (User::query()->get() as $user) {
                if ($user->hasPermission('packages.manage')) {
                    $mailer->send(new MailMessage(to: (string) $user->email, subject: $subject, text: $body));
                }
            }
        } catch (Throwable $e) {
            report($e);
        }
    }

    /** The loader may have flipped back by itself: bring the state in line with the pointer. */
    private function reconcile(): array
    {
        $state = $this->state();
        $phase = $state['state'] ?? 'idle';

        if (in_array($phase, ['migrating', 'checking', 'done'], true)) {
            $current = $this->layout->current();

            if ($current !== null && $current !== ($state['target'] ?? null) && is_file($this->layout->runtime('current'))) {
                if ($phase !== 'done' || $current === ($state['previous'] ?? null)) {
                    $failures = $state['failures'] ?? null;
                    $count = is_array($failures) && ($failures['version'] ?? null) === ($state['target'] ?? null) ? (int) $failures['count'] : 0;
                    $state = ['state' => 'rolled_back', 'error' => $state['error'] ?? 'The new release failed on this host, so the site went back.', 'failures' => ['version' => $state['target'] ?? null, 'count' => $count + 1, 'at' => $this->now()]] + $state;
                    $this->save($state);
                }
            }
        }

        return $state;
    }

    private function fail(array $state, string $error): void
    {
        foreach (glob($this->layout->runtime('.incoming-*')) ?: [] as $dir) {
            Files::deleteDirectory($dir);
        }

        @unlink($this->zip((string) ($state['target'] ?? '')));
        $this->save(['state' => 'failed', 'error' => mb_substr($error, 0, 500)] + array_diff_key($state, ['cursor' => 1, 'dir' => 1]));
    }

    /**
     * @template T
     * @param  callable(): T  $work
     * @param  (callable(): T)|null  $busy  Instead of an error, when someone else is at it
     * @return T
     */
    private function locked(callable $work, ?callable $busy = null): mixed
    {
        Files::ensureDir($this->app->storagePath('update'));
        $handle = fopen($this->app->storagePath('update/lock'), 'c');

        if ($handle === false || ! flock($handle, LOCK_EX | LOCK_NB)) {
            return $busy ? $busy() : throw new RuntimeException(__('An update step is already running. Try again in a moment.'));
        }

        try {
            return $work();
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    }

    /** Half the time PHP allows here, ten seconds at most: a step always ends before the host ends it. */
    private function deadline(): float
    {
        $limit = (int) ini_get('max_execution_time');

        return microtime(true) + ($limit > 0 ? min(10, $limit / 2) : 10);
    }

    private function now(): int
    {
        return Carbon::now()->getTimestamp();
    }

    private function zip(string $target): string
    {
        return $this->app->storagePath('update/cms-'.$target.'.zip');
    }

    /** @return array<string, mixed> */
    private function state(): array
    {
        $file = $this->app->storagePath('update/state.json');

        return is_file($file) ? (array) json_decode((string) @file_get_contents($file), true) : [];
    }

    /** @param  array<string, mixed>  $state */
    private function save(array $state): void
    {
        Files::put($this->app->storagePath('update/state.json'), (string) json_encode($state, JSON_UNESCAPED_SLASHES));
    }

    private function verify(): ?array
    {
        $file = $this->app->storagePath('update/verify.json');
        $verify = is_file($file) ? json_decode((string) @file_get_contents($file), true) : null;

        return is_array($verify) ? $verify : null;
    }

    /** @param  array<string, mixed>  $verify */
    private function writeVerify(array $verify): void
    {
        Files::put($this->app->storagePath('update/verify.json'), (string) json_encode($verify));
    }

    /** @return array<string, mixed> */
    private function settings(): array
    {
        $file = $this->app->storagePath('update/settings.json');

        return is_file($file) ? (array) json_decode((string) @file_get_contents($file), true) : [];
    }

    /** @param  array<string, mixed>  $changes */
    private function saveSettings(array $changes): void
    {
        Files::put($this->app->storagePath('update/settings.json'), (string) json_encode([...$this->settings(), ...$changes]));
    }
}

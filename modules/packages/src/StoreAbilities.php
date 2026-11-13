<?php

declare(strict_types=1);

namespace Cms\Modules\Packages;

use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Cms;
use Cms\Packages\Install\PackageJobs;
use Cms\Support\Files;
use Cms\Support\Schema\Shape;
use Cms\Update\CoreUpdate;
use Cms\Update\ReleaseFeed;
use RuntimeException;
use Throwable;

/** The store and the updater, as the admin and the CLI use them. Whatever installs code stays out of agents' reach. */
final class StoreAbilities
{
    /** Chunks keep a big zip under any host's upload limit. */
    private const int MAX_UPLOAD = 200_000_000;

    public function __construct(private readonly Cms $cms) {}

    public function register(AbilityRegistry $a): void
    {
        $client = static fn (): StoreClient => app(StoreClient::class);
        $jobs = static fn (): PackageJobs => app(PackageJobs::class);
        $core = static fn (): CoreUpdate => app(CoreUpdate::class);
        $feed = static fn (): ReleaseFeed => app(ReleaseFeed::class);
        $guard = static function (callable $fn) {
            try {
                return $fn();
            } catch (RuntimeException $e) {
                throw AbilityException::conflict($e->getMessage());
            }
        };
        $install = ['expose' => ['mcp' => false, 'assistant' => false], 'permission' => 'packages.manage'];
        $read = ['annotations' => ['readOnly' => true], 'permission' => 'packages.manage'];

        $a->register('packages/catalog', [...$read,
            'label' => 'Browse Store',
            'description' => 'The signed catalog of packages and what can be done with each on this site.',
            'input' => ['type' => 'object', 'properties' => ['refresh' => ['type' => 'boolean', 'default' => false]]],
            'output' => Shape::of(['items' => [self::listing()], 'freshness' => Shape::enum('ok', 'stale', 'expired', 'clock', 'none'), 'problem' => Shape::STRING_OR_NULL, 'error' => Shape::STRING_OR_NULL]),
            'handler' => static fn (array $in) => $client()->catalog($in['refresh']),
        ]);

        $a->register('packages/item', [...$read,
            'label' => 'Store Package',
            'description' => 'One package\'s listing, its description cleaned on this site.',
            'input' => ['type' => 'object', 'properties' => ['package' => ['type' => 'string', 'maxLength' => 200]], 'required' => ['package']],
            'output' => self::listing()->with([
                'description_html' => Shape::STRING, 'screenshots' => [Shape::STRING], 'gallery' => [['url' => Shape::STRING, 'alt' => Shape::STRING]],
                'requirements' => [Shape::STRING], 'docs_url' => Shape::STRING_OR_NULL, 'demo_url' => Shape::STRING_OR_NULL, 'repository_url' => Shape::STRING_OR_NULL,
                'releases' => [['version' => Shape::STRING, 'released_at' => Shape::STRING, 'notes' => Shape::STRING, 'security' => Shape::BOOLEAN]],
                'capabilities' => [Shape::STRING], 'requires' => self::requires(),
            ]),
            'handler' => static fn (array $in) => $guard(static fn () => $client()->item($in['package'])),
        ]);

        $a->register('packages/plan-install', [...$read,
            'label' => 'Plan Install',
            'description' => 'What installing a package means here: dependencies in order, and capabilities. Refused with the reason when it can\'t work.',
            'input' => ['type' => 'object', 'properties' => ['package' => ['type' => 'string', 'maxLength' => 200], 'version' => ['type' => 'string', 'maxLength' => 40]], 'required' => ['package']],
            'output' => Shape::of([
                'steps' => [['package' => Shape::STRING, 'version' => Shape::STRING, 'title' => Shape::STRING, 'enable_only' => Shape::BOOLEAN, 'action' => Shape::enum('enable', 'install', 'update')]],
                'capabilities' => [Shape::STRING],
            ]),
            'handler' => static fn (array $in) => $guard(static fn () => $client()->plan($in['package'], $in['version'] ?? null)),
        ]);

        $a->register('packages/install', [...$install,
            'label' => 'Install Package',
            'description' => 'Start installing a package from a store. Drive it with packages/job-step until it\'s done.',
            'input' => ['type' => 'object', 'properties' => ['package' => ['type' => 'string', 'maxLength' => 200], 'version' => ['type' => 'string', 'maxLength' => 40], 'turnOn' => ['type' => 'boolean', 'default' => true]], 'required' => ['package']],
            'output' => self::jobShape(),
            'handler' => static fn (array $in) => $guard(static fn () => self::job($client()->install($in['package'], $in['version'] ?? null, $in['turnOn']))),
        ]);

        $a->register('packages/upload', [...$install,
            'label' => 'Upload Package',
            'description' => 'Upload a package zip in chunks of base64. The last chunk starts the install. Unsigned packages need a super admin and allowUnsigned.',
            'input' => ['type' => 'object', 'properties' => [
                'id' => ['type' => 'string', 'maxLength' => 32],
                'index' => ['type' => 'integer', 'minimum' => 0],
                'last' => ['type' => 'boolean', 'default' => false],
                'data' => ['type' => 'string'],
                'sig' => ['type' => 'object'],
                'allowUnsigned' => ['type' => 'boolean', 'default' => false],
                'turnOn' => ['type' => 'boolean', 'default' => true],
            ], 'required' => ['id', 'index', 'data']],
            'output' => Shape::either(['received' => Shape::INTEGER], self::jobShape()),
            'handler' => function (array $in, $context) use ($guard, $client) {
                return $guard(function () use ($in, $context, $client) {
                    $this->cms->guardFileMods();
                    $id = preg_replace('/[^a-f0-9]/', '', strtolower((string) $in['id']));

                    if ($id === '') {
                        throw new RuntimeException(__('That upload is not known here.'));
                    }

                    $path = storage_path("packages/incoming/upload-{$id}.zip");
                    Files::ensureDir(dirname($path));
                    $bytes = base64_decode((string) $in['data'], true);

                    if ($bytes === false) {
                        throw new RuntimeException(__('That chunk arrived damaged. Try again.'));
                    }

                    clearstatcache(true, $path);
                    $have = is_file($path) ? (int) filesize($path) : 0;

                    if ((int) $in['index'] === 0) {
                        $have = 0;
                        @unlink($path);
                    }

                    if ($have + strlen($bytes) > self::MAX_UPLOAD) {
                        @unlink($path);
                        throw new RuntimeException(__('The file is too large.'));
                    }

                    file_put_contents($path, $bytes, FILE_APPEND);

                    if (! $in['last']) {
                        return ['received' => $have + strlen($bytes)];
                    }

                    // Installing unsigned code is the one thing here a plain manager can't do.
                    $allow = $in['allowUnsigned'] && ($context->system || $context->can('packages.install_unsigned'));

                    return self::job($client()->installUpload($path, isset($in['sig']) ? (array) $in['sig'] : null, $allow, $in['turnOn']));
                });
            },
        ]);

        $a->register('packages/job-step', [...$install,
            'label' => 'Advance Install',
            'description' => 'Run the next step of an install. Each step is its own request, so nothing runs into a time limit.',
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string', 'maxLength' => 32]], 'required' => ['id']],
            'output' => self::jobShape(),
            'handler' => static fn (array $in) => $guard(static fn () => self::job($jobs()->step($in['id']))),
        ]);

        $a->register('packages/job-status', [...$read,
            'label' => 'Install Status',
            'description' => 'Where an install stands.',
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string', 'maxLength' => 32]], 'required' => ['id']],
            'output' => self::jobShape(),
            'handler' => static fn (array $in) => $guard(static fn () => self::job($jobs()->status($in['id']))),
        ]);

        $a->register('packages/rollback', [...$install,
            'label' => 'Roll Back Package',
            'description' => 'Put the previous version of a package back.',
            'input' => ['type' => 'object', 'properties' => ['package' => ['type' => 'string', 'maxLength' => 200]], 'required' => ['package']],
            'output' => Shape::of(['rolledBack' => Shape::STRING]),
            'handler' => static fn (array $in) => $guard(static function () use ($in, $jobs) {
                $jobs()->rollback($in['package']);

                return ['rolledBack' => $in['package']];
            }),
        ]);

        $a->register('packages/updates', [...$read,
            'label' => 'List Updates',
            'description' => 'The core update on offer and everything in its way, updates for store packages, and advisories about what\'s installed.',
            'output' => self::updates()->with(['core' => self::offer(), 'status' => self::status()]),
            'handler' => static fn () => [
                'core' => $core()->offer(),
                'status' => $core()->status(),
                ...$client()->updates(),
            ],
        ]);

        $a->register('packages/update-check', [...$read,
            'label' => 'Check for Updates',
            'description' => 'Fetch the signed release list and the store catalog now. Sends nothing but a User-Agent with the version.',
            'annotations' => [],
            'output' => self::updates()->with(['error' => Shape::STRING_OR_NULL, 'core' => self::offer()]),
            'handler' => static function () use ($client, $core, $feed) {
                $error = $feed()->check();
                $store = $client()->refresh();

                return ['error' => $error ?? $store, 'core' => $core()->offer(), ...$client()->updates()];
            },
        ]);

        $a->register('packages/update-start', [...$install,
            'label' => 'Start Update',
            'description' => 'Start updating the core to a version on offer. Drive it with packages/update-step.',
            'input' => ['type' => 'object', 'properties' => ['version' => ['type' => 'string', 'maxLength' => 40]], 'required' => ['version']],
            'output' => self::status(),
            'handler' => static fn (array $in) => $guard(static fn () => $core()->start($in['version'])),
        ]);

        $a->register('packages/update-step', [...$install,
            'label' => 'Advance Update',
            'description' => 'Run the next step of the core update. After the switch, the answer says drive: the new release finishes through /_cms/update/tick.',
            'output' => self::status(),
            'handler' => static fn () => $guard(static fn () => $core()->step()),
        ]);

        $a->register('packages/update-switch', [...$install,
            'label' => 'Switch Release',
            'description' => 'Switch to a release someone uploaded into runtime/<version>/ by FTP.',
            'input' => ['type' => 'object', 'properties' => ['version' => ['type' => 'string', 'maxLength' => 40]], 'required' => ['version']],
            'output' => self::status(),
            'handler' => static fn (array $in) => $guard(static fn () => $core()->switchTo($in['version'])),
        ]);

        $a->register('packages/update-rollback', [...$install,
            'label' => 'Roll Back Update',
            'description' => 'Go back to the release before this one, while it\'s still on disk.',
            'output' => self::status(),
            'handler' => static fn () => $guard(static fn () => $core()->rollback()),
        ]);

        $a->register('packages/update-postpone', [...$install,
            'label' => 'Postpone Security Update',
            'description' => 'Hold automatic security updates back for up to 14 days.',
            'input' => ['type' => 'object', 'properties' => ['days' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 14, 'default' => 7]]],
            'output' => Shape::of(['postponed' => Shape::INTEGER]),
            'handler' => static function (array $in) use ($core) {
                $core()->postpone($in['days']);

                return ['postponed' => $in['days']];
            },
        ]);

        $a->register('packages/update-auto', [...$install,
            'label' => 'Automatic Security Updates',
            'description' => 'Turn automatic security updates on or off.',
            'input' => ['type' => 'object', 'properties' => ['on' => ['type' => 'boolean']], 'required' => ['on']],
            'output' => Shape::of(['on' => Shape::BOOLEAN]),
            'handler' => static function (array $in) use ($core) {
                $core()->setAuto($in['on']);

                return ['on' => $in['on']];
            },
        ]);

        // Any signed-in person's visit moves an automatic security update along. It takes no input, runs
        // only what the rules already decided, and its answer holds no secret. `acted` says whether it did
        // anything: ran a step of a core update, of an automatic plugin update, started one, or failed. A
        // tick that did none of that changed nothing, and the Audit Log leaves it out (PackagesModule).
        $a->register('packages/update-tick', [
            'label' => 'Automatic Updates',
            'description' => 'Advance automatic security updates by one step.',
            'permission' => static fn ($user) => $user !== null,
            'expose' => ['mcp' => false, 'assistant' => false],
            'output' => Shape::of(['more' => Shape::BOOLEAN, 'drive' => Shape::BOOLEAN, 'acted' => Shape::BOOLEAN]),
            'handler' => static function () use ($client, $core, $feed, $jobs) {
                $acted = false;

                try {
                    if ($feed()->due()) {
                        $feed()->check();
                        $client()->refresh();
                    }

                    $step = $core()->auto();
                    // A step of a core update ran: it has a state (done, failed…), where one that is blocked has a reason.
                    $acted = isset($step['state']);

                    if ($step['more'] || ($step['state'] ?? '') === 'done') {
                        return ['more' => $step['more'], 'drive' => $core()->status()['drive'], 'acted' => true];
                    }

                    $running = $jobs()->running();

                    if ($running && ($running['context']['auto'] ?? false)) {
                        $job = $jobs()->step((string) $running['id']);

                        return ['more' => $job['state'] === 'running', 'drive' => false, 'acted' => true];
                    }

                    if (! $running && ! ($core()->status()['managed'] ?? null) && $next = $client()->nextSecurityUpdate()) {
                        $client()->install($next['package'], $next['version'], true);
                        $running = $jobs()->running();
                        $running['context']['auto'] = true;
                        $jobs()->saveJob($running);

                        return ['more' => true, 'drive' => false, 'acted' => true];
                    }
                } catch (Throwable $e) {
                    report($e);

                    return ['more' => false, 'drive' => false, 'acted' => true];
                }

                return ['more' => false, 'drive' => false, 'acted' => $acted];
            },
        ]);
    }

    /** StoreClient::describe(): a store's package as this site sees it. `entry` is the signed version this site would get. */
    private static function listing(): Shape
    {
        return Shape::of([
            'package' => Shape::STRING, 'type' => Shape::STRING, 'title' => Shape::STRING, 'summary' => Shape::STRING,
            'icon' => Shape::STRING_OR_NULL, 'preview' => Shape::STRING_OR_NULL, 'glyph' => Shape::STRING_OR_NULL, 'featured' => Shape::BOOLEAN, 'categories' => [Shape::STRING],
            'first_party' => Shape::BOOLEAN, 'author' => ['name' => Shape::STRING, 'url' => Shape::STRING],
            'listing_url' => Shape::STRING_OR_NULL, 'latest' => Shape::STRING_OR_NULL, 'installed' => Shape::STRING_OR_NULL,
            'action' => Shape::enum('blocked', 'incompatible', 'installed', 'update', 'install'),
            'entry' => Shape::nullable(Shape::of([
                'version' => Shape::STRING, 'url?' => Shape::STRING, 'sha256?' => Shape::STRING, 'size?' => Shape::INTEGER, 'released_at?' => Shape::STRING, 'security?' => Shape::BOOLEAN,
                'fixes?' => Shape::STRING_OR_NULL, 'first_party?' => Shape::BOOLEAN, 'capabilities?' => [Shape::STRING], 'requires?' => self::requires(), 'kid?' => Shape::STRING, 'sig?' => Shape::STRING,
            ])->andMore('A version as the store\'s signed catalog lists it: the store writes it, so a newer store may say more than these keys.')),
        ]);
    }

    /** What a version needs, as its store wrote it: of the core, of PHP, of its extensions and of other packages. */
    private static function requires(): Shape
    {
        return Shape::of(['core?' => Shape::STRING, 'php?' => Shape::STRING, 'ext?' => [Shape::STRING], 'packages?' => Shape::map(Shape::STRING)])
            ->andMore('Version constraints as the store\'s signed catalog writes them: the store decides the keys, and these are the ones this site reads.');
    }

    /** StoreClient::gate(): whether this site may have a version, and why not. */
    /** What job() lets through of an install. */
    private static function jobShape(): Shape
    {
        return Shape::of([
            'id' => Shape::STRING, 'step' => Shape::STRING, 'state' => Shape::enum('running', 'done', 'failed'), 'error?' => Shape::STRING_OR_NULL, 'code?' => Shape::STRING_OR_NULL,
            'package?' => Shape::STRING_OR_NULL, 'version?' => Shape::STRING_OR_NULL, 'package_version?' => Shape::STRING,
        ]);
    }

    /** CoreUpdate::status(): where the core update stands. */
    private static function status(): Shape
    {
        return Shape::of([
            'state' => Shape::STRING, 'current' => Shape::STRING, 'managed' => Shape::STRING_OR_NULL, 'drive' => Shape::BOOLEAN,
            'target?' => Shape::STRING_OR_NULL, 'previous?' => Shape::STRING_OR_NULL, 'error?' => Shape::STRING_OR_NULL, 'auto?' => Shape::BOOLEAN_OR_NULL,
        ]);
    }

    /** CoreUpdate::offer(): the core update on offer and what stands in its way. */
    private static function offer(): Shape
    {
        $release = Shape::nullable([
            'version' => Shape::STRING, 'released_at' => Shape::STRING_OR_NULL, 'security' => Shape::BOOLEAN, 'notes_url' => Shape::STRING_OR_NULL,
            'major' => Shape::BOOLEAN, 'host_problems' => [Shape::STRING], 'incompatible' => [Shape::STRING],
        ]);

        return Shape::of([
            'current' => Shape::STRING, 'managed' => Shape::STRING_OR_NULL, 'freshness' => Shape::enum('ok', 'stale', 'expired', 'clock', 'none'),
            'trust' => Shape::STRING_OR_NULL, 'check' => ['checked_at?' => Shape::INTEGER, 'error?' => Shape::STRING], 'update' => $release, 'major' => $release, 'yanked' => Shape::STRING_OR_NULL,
            'support_ended' => Shape::nullable(Shape::of(['major' => Shape::INTEGER, 'until' => Shape::STRING, 'latest?' => Shape::STRING])->andMore('The entry of the signed release list that says when support for this major version ended: whoever publishes the list writes it.')), 'auto' => Shape::BOOLEAN, 'postponed_until' => Shape::INTEGER_OR_NULL,
        ]);
    }

    /** StoreClient::updates(): updates for store packages, advisories about what's installed, and what no store vouches for. */
    private static function updates(): Shape
    {
        return Shape::of([
            'packages' => [[
                'package' => Shape::STRING, 'label' => Shape::STRING, 'installed' => Shape::STRING, 'version' => Shape::STRING, 'security' => Shape::BOOLEAN,
                'backup' => Shape::BOOLEAN,
            ]],
            'advisories' => [['package' => Shape::STRING, 'label' => Shape::STRING, 'version' => Shape::STRING, 'severity' => Shape::STRING, 'advisory' => Shape::STRING_OR_NULL]],
            'unverified' => [Shape::STRING],
        ]);
    }

    /** @param  array<string, mixed>  $job  @return array<string, mixed> What the admin may see of a job: nothing of its download's headers */
    private static function job(array $job): array
    {
        return array_intersect_key($job, array_flip(['id', 'step', 'state', 'error', 'code', 'package', 'version', 'package_version']));
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\Packages;

use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Cms;
use Cms\Modules\License\LicenseService;
use Cms\Packages\Install\PackageJobs;
use Cms\Support\Files;
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

        $a->register('packages/stores', [...$read,
            'label' => 'List Stores',
            'description' => 'The stores this site installs from, each with the fingerprint of its root key.',
            'handler' => static fn () => ['items' => $client()->stores()],
        ]);

        $a->register('packages/store-add', [...$install,
            'label' => 'Add Store',
            'description' => 'Read a store\'s name and root key fingerprint. Pinned only when confirm repeats that fingerprint. Code from a store runs with full access to this site.',
            'input' => ['type' => 'object', 'properties' => ['url' => ['type' => 'string', 'maxLength' => 500], 'confirm' => ['type' => 'string', 'maxLength' => 100]], 'required' => ['url']],
            'handler' => static fn (array $in) => $guard(static fn () => $client()->addStore($in['url'], $in['confirm'] ?? null)),
        ]);

        $a->register('packages/store-remove', [...$install,
            'label' => 'Remove Store',
            'description' => 'Forget a store. What it installed stays.',
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string', 'maxLength' => 40]], 'required' => ['id']],
            'handler' => static fn (array $in) => $guard(static function () use ($in, $client) {
                $client()->removeStore($in['id']);

                return ['removed' => $in['id']];
            }),
        ]);

        $a->register('packages/catalog', [...$read,
            'label' => 'Browse Store',
            'description' => 'A store\'s signed catalog as this site sees it: for each package what can be done with it here, and whether this site has access to it.',
            'input' => ['type' => 'object', 'properties' => ['store' => ['type' => 'string', 'default' => StoreClient::DEFAULT], 'refresh' => ['type' => 'boolean', 'default' => false]]],
            'handler' => static fn (array $in) => $client()->catalog($in['store'], $in['refresh']),
        ]);

        $a->register('packages/item', [...$read,
            'label' => 'Store Package',
            'description' => 'One package\'s listing, its description cleaned on this site.',
            'input' => ['type' => 'object', 'properties' => ['store' => ['type' => 'string', 'default' => StoreClient::DEFAULT], 'package' => ['type' => 'string', 'maxLength' => 200]], 'required' => ['package']],
            'handler' => static fn (array $in) => $guard(static fn () => $client()->item($in['store'], $in['package'])),
        ]);

        $a->register('packages/add-key', [...$install,
            'label' => 'Add Paid Plugin Key',
            'description' => 'Put the key for a paid plugin in place, so the store offers it here.',
            'input' => ['type' => 'object', 'properties' => ['key' => ['type' => 'string', 'maxLength' => 8192]], 'required' => ['key']],
            'handler' => static fn (array $in) => $guard(static function () use ($in) {
                app(LicenseService::class)->install($in['key']);

                return ['added' => true];
            }),
        ]);

        $a->register('packages/plan-install', [...$read,
            'label' => 'Plan Install',
            'description' => 'What installing a package means here: dependencies in order, capabilities, access. Refused with the reason when it can\'t work.',
            'input' => ['type' => 'object', 'properties' => ['store' => ['type' => 'string', 'default' => StoreClient::DEFAULT], 'package' => ['type' => 'string', 'maxLength' => 200], 'version' => ['type' => 'string', 'maxLength' => 40]], 'required' => ['package']],
            // The gate also holds what the download is fetched with (the license token as a header, the query): never part of an answer.
            'handler' => static fn (array $in) => $guard(static function () use ($client, $in): array {
                $plan = $client()->plan($in['store'], $in['package'], $in['version'] ?? null);
                $plan['access'] = array_intersect_key((array) ($plan['access'] ?? []), array_flip(['allowed', 'reason', 'message', 'buy_url']));

                return $plan;
            }),
        ]);

        $a->register('packages/install', [...$install,
            'label' => 'Install Package',
            'description' => 'Start installing a package from a store. Drive it with packages/job-step until it\'s done.',
            'input' => ['type' => 'object', 'properties' => ['store' => ['type' => 'string', 'default' => StoreClient::DEFAULT], 'package' => ['type' => 'string', 'maxLength' => 200], 'version' => ['type' => 'string', 'maxLength' => 40], 'turnOn' => ['type' => 'boolean', 'default' => true]], 'required' => ['package']],
            'handler' => static fn (array $in) => $guard(static fn () => self::job($client()->install($in['store'], $in['package'], $in['version'] ?? null, $in['turnOn']))),
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
            'handler' => static fn (array $in) => $guard(static fn () => self::job($jobs()->step($in['id']))),
        ]);

        $a->register('packages/job-status', [...$read,
            'label' => 'Install Status',
            'description' => 'Where an install stands.',
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string', 'maxLength' => 32]], 'required' => ['id']],
            'handler' => static fn (array $in) => $guard(static fn () => self::job($jobs()->status($in['id']))),
        ]);

        $a->register('packages/rollback', [...$install,
            'label' => 'Roll Back Package',
            'description' => 'Put the previous version of a package back.',
            'input' => ['type' => 'object', 'properties' => ['package' => ['type' => 'string', 'maxLength' => 200]], 'required' => ['package']],
            'handler' => static fn (array $in) => $guard(static function () use ($in, $jobs) {
                $jobs()->rollback($in['package']);

                return ['rolledBack' => $in['package']];
            }),
        ]);

        $a->register('packages/updates', [...$read,
            'label' => 'List Updates',
            'description' => 'The core update on offer and everything in its way, updates for store packages, and advisories about what\'s installed.',
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
            'handler' => static fn (array $in) => $guard(static fn () => $core()->start($in['version'])),
        ]);

        $a->register('packages/update-step', [...$install,
            'label' => 'Advance Update',
            'description' => 'Run the next step of the core update. After the switch, the answer says drive: the new release finishes through /_cms/update/tick.',
            'handler' => static fn () => $guard(static fn () => $core()->step()),
        ]);

        $a->register('packages/update-switch', [...$install,
            'label' => 'Switch Release',
            'description' => 'Switch to a release someone uploaded into runtime/<version>/ by FTP.',
            'input' => ['type' => 'object', 'properties' => ['version' => ['type' => 'string', 'maxLength' => 40]], 'required' => ['version']],
            'handler' => static fn (array $in) => $guard(static fn () => $core()->switchTo($in['version'])),
        ]);

        $a->register('packages/update-rollback', [...$install,
            'label' => 'Roll Back Update',
            'description' => 'Go back to the release before this one, while it\'s still on disk.',
            'handler' => static fn () => $guard(static fn () => $core()->rollback()),
        ]);

        $a->register('packages/update-postpone', [...$install,
            'label' => 'Postpone Security Update',
            'description' => 'Hold automatic security updates back for up to 14 days.',
            'input' => ['type' => 'object', 'properties' => ['days' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 14, 'default' => 7]]],
            'handler' => static function (array $in) use ($core) {
                $core()->postpone($in['days']);

                return ['postponed' => $in['days']];
            },
        ]);

        $a->register('packages/update-auto', [...$install,
            'label' => 'Automatic Security Updates',
            'description' => 'Turn automatic security updates on or off.',
            'input' => ['type' => 'object', 'properties' => ['on' => ['type' => 'boolean']], 'required' => ['on']],
            'handler' => static function (array $in) use ($core) {
                $core()->setAuto($in['on']);

                return ['on' => $in['on']];
            },
        ]);

        // Any signed-in person's visit moves an automatic security update along. It takes no input, runs
        // only what the rules already decided, and its answer holds no secret.
        $a->register('packages/update-tick', [
            'label' => 'Automatic Updates',
            'description' => 'Advance automatic security updates by one step.',
            'permission' => static fn ($user) => $user !== null,
            'expose' => ['mcp' => false, 'assistant' => false],
            'handler' => static function () use ($client, $core, $feed, $jobs) {
                try {
                    if ($feed()->due()) {
                        $feed()->check();
                        $client()->refresh();
                    }

                    $step = $core()->auto();

                    if ($step['more'] || ($step['state'] ?? '') === 'done') {
                        return ['more' => $step['more'], 'drive' => $core()->status()['drive']];
                    }

                    $running = $jobs()->running();

                    if ($running && ($running['context']['auto'] ?? false)) {
                        $job = $jobs()->step((string) $running['id']);

                        return ['more' => $job['state'] === 'running', 'drive' => false];
                    }

                    if (! $running && ! ($core()->status()['managed'] ?? null) && $next = $client()->nextSecurityUpdate()) {
                        $client()->install($next['store'], $next['package'], $next['version'], true);
                        $running = $jobs()->running();
                        $running['context']['auto'] = true;
                        $jobs()->saveJob($running);

                        return ['more' => true, 'drive' => false];
                    }
                } catch (Throwable $e) {
                    report($e);
                }

                return ['more' => false, 'drive' => false];
            },
        ]);
    }

    /** @param  array<string, mixed>  $job  @return array<string, mixed> What the admin may see of a job: nothing of its download's headers */
    private static function job(array $job): array
    {
        return array_intersect_key($job, array_flip(['id', 'step', 'state', 'error', 'code', 'package', 'version', 'package_version']));
    }
}

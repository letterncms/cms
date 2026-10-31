<?php

declare(strict_types=1);

namespace Cms\Modules\Packages;

use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Admin\Translations;
use Cms\Cms;
use Cms\Packages\PackageManifest;
use Cms\Support\RecordTimestamps;
use RuntimeException;

/** Modules and plugins: on, off, upgrades. */
final class PackageAbilities
{
    public function __construct(private readonly Cms $cms) {}

    public function register(AbilityRegistry $a): void
    {
        $guard = static function (callable $fn) {
            try {
                return $fn();
            } catch (RuntimeException $e) {
                throw AbilityException::conflict($e->getMessage());
            }
        };

        $a->register('packages/list', [
            'label' => 'List Modules and Plugins',
            'description' => 'Installed packages with status and their settings namespaces. core marks the modules the admin is made of; required ones cannot be disabled.',
            'permission' => 'packages.manage',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['type' => ['type' => 'string', 'enum' => ['module', 'plugin', 'all'], 'default' => 'all']]],
            'handler' => function (array $in) {
                $manager = $this->cms->packages();
                $timestamps = $manager->timestamps();
                $settings = $this->cms->settingsRegistry()->schemas();
                $inactive = $manager->inactive();
                $problems = $manager->problems();
                $locale = app(Translations::class)->current();
                $out = [];

                foreach ($manager->repository()->all() as $package) {
                    $type = $package->core ? 'module' : 'plugin';

                    if ($in['type'] !== 'all' && $in['type'] !== $type) {
                        continue;
                    }

                    $out[] = [
                        ...$package->toArray(),
                        ...($timestamps[$package->name] ?? RecordTimestamps::api([])),
                        ...self::translated($package, $locale),
                        'enabled' => $manager->isEnabled($package->name),
                        'active' => $manager->isActive($package->name),
                        'problem' => $inactive[$package->name] ?? $problems[$package->name] ?? null,
                        'installedVersion' => $manager->installedVersion($package->name),
                        'dependents' => $manager->dependents($package->name),
                        'settings' => array_keys(array_filter($settings, static fn ($s) => $s['package'] === $package->name)),
                    ];
                }

                return ['items' => $out, 'errors' => $manager->repository()->errors()];
            },
        ]);

        $a->register('packages/enable', [
            'label' => 'Enable Module or Plugin',
            'description' => 'Turn a module or plugin on and run its install/upgrade steps.',
            'permission' => 'packages.manage',
            'expose' => ['mcp' => false, 'assistant' => false],
            'input' => ['type' => 'object', 'properties' => ['name' => ['type' => 'string']], 'required' => ['name']],
            'handler' => fn (array $in) => $guard(function () use ($in) {
                $this->cms->packages()->enable($in['name']);

                return ['enabled' => $in['name']];
            }),
        ]);

        $a->register('packages/disable', [
            'label' => 'Disable Module or Plugin',
            'description' => 'Turn a module or plugin off. Its data is kept. Required modules cannot be turned off.',
            'permission' => 'packages.manage',
            'expose' => ['mcp' => false, 'assistant' => false],
            'input' => ['type' => 'object', 'properties' => ['name' => ['type' => 'string']], 'required' => ['name']],
            'handler' => fn (array $in) => $guard(function () use ($in) {
                $this->cms->packages()->disable($in['name']);

                return ['disabled' => $in['name']];
            }),
        ]);

        $a->register('packages/uninstall', [
            'label' => 'Uninstall Plugin',
            'description' => 'Disable a plugin and remove its data (and its files when deleteFiles is true).',
            'permission' => 'packages.manage',
            'expose' => ['mcp' => false, 'assistant' => false],
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['name' => ['type' => 'string'], 'deleteFiles' => ['type' => 'boolean', 'default' => false]], 'required' => ['name']],
            'handler' => fn (array $in) => $guard(function () use ($in) {
                if ($in['deleteFiles'] && app(\Cms\Update\Layout::class)->managed() === 'composer') {
                    throw new AbilityException(__('This site is managed with Composer. Run: composer remove :package', ['package' => $in['name']]), 'invalid');
                }

                $this->cms->packages()->uninstall($in['name'], $in['deleteFiles']);

                if ($in['deleteFiles']) {
                    app(\Cms\Packages\SiteComposer::class)->removes($in['name']);
                }

                return ['uninstalled' => $in['name']];
            }),
        ]);

        $a->register('packages/sync', [
            'label' => 'Run Pending Upgrades',
            'description' => 'Run database migrations and install/upgrade steps for active packages.',
            'permission' => 'packages.manage',
            'expose' => ['mcp' => false, 'assistant' => false],
            'handler' => fn () => $guard(fn () => ['done' => $this->cms->packages()->sync()]),
        ]);

    }

    /**
     * A package's name and description in the user's language, from the package's own
     * dictionary — read directly, so packages that are off read the same.
     *
     * @return array{label?: string, description?: string}
     */
    private static function translated(PackageManifest $package, string $locale): array
    {
        $file = $package->path("lang/{$locale}.json");
        $words = $locale !== Translations::SOURCE && is_file($file) ? (array) json_decode((string) file_get_contents($file), true) : [];

        return array_filter(
            ['label' => $words[$package->label] ?? null, 'description' => $words[$package->description] ?? null],
            static fn ($text) => is_string($text) && $text !== '',
        );
    }
}

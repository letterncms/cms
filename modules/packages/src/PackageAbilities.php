<?php

declare(strict_types=1);

namespace Cms\Modules\Packages;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Admin\Translations;
use Cms\Cms;
use Cms\Packages\PackageManifest;
use Cms\Support\RecordTimestamps;
use Cms\Users\User;
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
            'input' => ['type' => 'object', 'properties' => ['type' => ['type' => 'string', 'enum' => ['module', 'plugin', 'all'], 'default' => 'all'], 'optional' => ['type' => 'boolean', 'default' => false, 'description' => 'Only what can be switched off: no required modules.']]],
            'handler' => function (array $in, AbilityContext $ctx) {
                $manager = $this->cms->packages();
                $timestamps = $manager->timestamps();
                $settings = $this->cms->settingsRegistry()->schemas();
                $inactive = $manager->inactive();
                $problems = $manager->problems();
                $locale = app(Translations::class)->current();
                $out = [];

                app(Translations::class)->register();
                $place = $ctx->user ? $this->places($ctx->user) : static fn () => [null, null];
                $labels = array_map(static fn (PackageManifest $p) => self::translated($p, $locale)['label'] ?? $p->label, $manager->repository()->all());

                foreach ($manager->repository()->all() as $package) {
                    $type = $package->core ? 'module' : 'plugin';

                    if ($in['type'] !== 'all' && $in['type'] !== $type) {
                        continue;
                    }

                    // Only what can be switched off.
                    if (($in['optional'] ?? false) && $package->required) {
                        continue;
                    }

                    $translated = self::translated($package, $locale);
                    $problem = $inactive[$package->name] ?? $problems[$package->name] ?? null;
                    $dependents = $manager->dependents($package->name);
                    $enabled = $manager->isEnabled($package->name);
                    $settingsOf = array_keys(array_filter($settings, static fn ($s) => $s['package'] === $package->name));
                    [$to, $settingsTo] = $manager->isActive($package->name) ? $place($package->name, $settingsOf) : [null, null];

                    $out[] = [
                        ...$package->toArray(),
                        ...($timestamps[$package->name] ?? RecordTimestamps::api([])),
                        ...$translated,
                        'enabled' => $enabled,
                        'active' => $manager->isActive($package->name),
                        'problem' => $problem,
                        'installedVersion' => $manager->installedVersion($package->name),
                        'dependents' => $dependents,
                        'settings' => $settingsOf,
                        // In words, for a list: what it is (its description's first clause), and why its switch stays on. A problem is said instead of the first, by `problem`.
                        'note' => self::gist($translated['description'] ?? $package->description),
                        'keptOn' => match (true) {
                            $package->required => __('Required'),
                            $enabled && $dependents !== [] => __('Needed by :names', ['names' => implode(', ', array_map(static fn ($d) => $labels[$d] ?? $d, $dependents))]),
                            default => null,
                        },
                        // Its switch stays as it is: what is required or needed by another stays on, and one with a problem can't come on.
                        'locked' => $package->required || ($enabled && $dependents !== []) || ($problem !== null && ! $enabled),
                        // Where it is set up for whoever asks: its settings, else its screen, else nowhere. `settingsTo` only for settings.
                        'to' => $to,
                        'settingsTo' => $settingsTo,
                    ];
                }

                // Found by their names.
                usort($out, static fn (array $a, array $b) => strnatcasecmp((string) $a['label'], (string) $b['label']));

                return ['items' => $out, 'total' => count($out), 'errors' => $manager->repository()->errors()];
            },
        ]);

        $a->register('packages/enable', [
            'label' => 'Enable Module or Plugin',
            'description' => 'Turn a module or plugin on and run its install/upgrade steps.',
            'permission' => 'packages.manage',
            'annotations' => ['confirm' => true],
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
            'annotations' => ['confirm' => true],
            'input' => ['type' => 'object', 'properties' => ['name' => ['type' => 'string']], 'required' => ['name']],
            'handler' => fn (array $in) => $guard(function () use ($in) {
                $this->cms->packages()->disable($in['name']);

                return ['disabled' => $in['name']];
            }),
        ]);

        $a->register('packages/switch', [
            'label' => 'Turn Module or Plugin On or Off',
            'description' => 'Turn a module or plugin on (and run its install and upgrade steps) or off. Its data is kept.',
            'permission' => 'packages.manage',
            'annotations' => ['confirm' => true],
            'input' => ['type' => 'object', 'properties' => ['name' => ['type' => 'string'], 'on' => ['type' => 'boolean']], 'required' => ['name', 'on']],
            'handler' => fn (array $in) => $guard(function () use ($in) {
                $packages = $this->cms->packages();
                $label = $this->label($in['name']);

                if ($in['on']) {
                    $packages->enable($in['name']);
                    rescue(static fn () => $packages->sync(), report: false);
                } else {
                    $packages->disable($in['name']);
                }

                return ['name' => $in['name'], 'on' => $in['on'], 'message' => $in['on'] ? __(':name enabled', ['name' => $label]) : __(':name disabled', ['name' => $label])];
            }),
        ]);

        $a->register('packages/uninstall', [
            'label' => 'Uninstall Plugin',
            'description' => 'Disable a plugin and remove its data (and its files when deleteFiles is true).',
            'permission' => 'packages.manage',
            
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['name' => ['type' => 'string'], 'deleteFiles' => ['type' => 'boolean', 'default' => false]], 'required' => ['name']],
            'handler' => fn (array $in) => $guard(function () use ($in) {
                if ($in['deleteFiles'] && app(\Cms\Update\Layout::class)->managed() === 'composer') {
                    throw new AbilityException(__('This site is managed with Composer. Run: composer remove :package', ['package' => $in['name']]), 'invalid');
                }

                $label = $this->label($in['name']);
                $this->cms->packages()->uninstall($in['name'], $in['deleteFiles']);

                if ($in['deleteFiles']) {
                    app(\Cms\Packages\SiteComposer::class)->removes($in['name']);
                }

                return ['uninstalled' => $in['name'], 'message' => __(':name uninstalled', ['name' => $label])];
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
     * Where each package is set up, for this person: its settings page (or the Settings tab of its
     * screen), else its screen in settings (Languages), else its screen.
     *
     * @return \Closure(string, list<string>): array{0: ?string, 1: ?string} the place, and that place again when it is settings
     */
    private function places(User $user): \Closure
    {
        $menu = $this->cms->navigation()->forUser($user);
        $nav = array_column($menu['nav'], null, 'id');
        $inSettings = array_merge(...array_map(static fn (array $s) => $s['items'], $menu['settingsNav'] ?: [['items' => []]]));

        return static function (string $package, array $namespaces) use ($nav, $inSettings): array {
            foreach ($namespaces as $namespace) {
                if (isset($nav["settings.{$namespace}"])) {
                    return [$nav["settings.{$namespace}"]['path'], $nav["settings.{$namespace}"]['path']];
                }
            }

            $screens = array_filter($nav, static fn (array $n) => $n['package'] === $package && $n['home'] === null);
            $screen = current(array_filter($screens, static fn (array $n) => in_array($n['id'], $inSettings, true))) ?: current($screens);

            return $screen ? [$screen['path'], in_array($screen['id'], $inSettings, true) ? $screen['path'] : null] : [null, null];
        };
    }

    /** A package's name in the language of whoever asks, for what an ability says back. */
    private function label(string $name): string
    {
        $package = $this->cms->packages()->repository()->find($name);

        return $package ? self::translated($package, app(Translations::class)->current())['label'] ?? $package->label : $name;
    }

    /** A description's first clause ("Media library", "Sell anything from a site"): one short line in a list. */
    private static function gist(string $description): string
    {
        return trim((string) preg_split('/[:;,]\s|\.(\s|$)/', $description, 2)[0]);
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

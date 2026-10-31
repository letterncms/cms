<?php

declare(strict_types=1);

namespace Cms\Admin;

use Cms\Cms;
use Cms\Support\Brand;
use Cms\Users\User;

/** Everything the admin theme needs to render the UI for this user. Modules add their parts with the `admin.manifest` filter. */
final class Manifest
{
    public function __construct(private readonly Cms $cms) {}

    public function build(User $user): array
    {
        $admin = $this->cms->admin()->forUser($user);

        $settings = [];

        foreach ($this->cms->settingsRegistry()->schemas() as $namespace => $schema) {
            if ($user->hasPermission($schema['permission'])) {
                $settings[] = ['namespace' => $namespace, 'label' => $schema['label'], 'icon' => $schema['icon'], 'description' => $schema['description'], 'package' => $schema['package']];
            }
        }

        $manifest = [
            'cms' => ['version' => Cms::VERSION, 'lockedDown' => $this->cms->lockedDown(), 'debug' => (bool) config('app.debug')],
            'brand' => Brand::all(),
            'site' => [
                'name' => config('app.name'),
                'url' => config('app.url'),
                'locales' => $this->cms->locales(),
                'defaultLocale' => $this->cms->defaultLocale(),
                'timezone' => config('app.timezone'),
            ],
            'user' => [...$user->toPublic(), 'grants' => $user->super ? ['*'] : $user->grants(), 'preferences' => $user->preferences ?? (object) []],
            // Filled in by their modules; empty when those are off. The shared widget catalog comes from $admin.
            'collections' => [],
            'globals' => [],
            'dashboard' => [],
            'fieldTypes' => array_values(array_map(static fn ($t) => $t->toArray(), $this->cms->fields()->all())),
            'settings' => $settings,
            'packages' => [
                'active' => array_keys($this->cms->packages()->active()),
                'pending' => $user->hasPermission('packages.manage') ? $this->cms->packages()->pending() : [],
            ],
            ...$this->cms->navigation()->forUser($user),
            ...$admin,
        ];

        return $this->translated($this->cms->hooks()->filter('admin.manifest', $manifest, $user));
    }

    /** Labels are registered in English; the user reads them in their language. */
    private function translated(array $manifest): array
    {
        $t = $this->cms->app()->make(Translations::class);
        $label = static fn (array $item, string ...$keys) => array_replace($item, array_map($t->label(...), array_intersect_key($item, array_flip($keys))));

        foreach (['nav', 'widgets', 'components', 'commands', 'settings', 'fieldTypes', 'settingsNav', 'dashboard'] as $part) {
            $manifest[$part] = array_map(static fn ($item) => is_array($item) ? $label($item, 'label', 'group', 'description') : $item, $manifest[$part] ?? []);
        }

        if (isset($manifest['sidebar']['sections'])) {
            $manifest['sidebar']['sections'] = array_map(static fn ($section) => $label($section, 'label'), $manifest['sidebar']['sections']);
        }

        $manifest['fieldTypes'] = array_map(static fn ($type) => [...$type, 'config' => $t->fields($type['config'] ?? [])], $manifest['fieldTypes']);
        $manifest['locale'] = $t->current();

        return $manifest;
    }
}

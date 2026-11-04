<?php

declare(strict_types=1);

namespace Cms\Modules\Globals;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Cms\Packages\Plugin;
use Cms\Users\User;

/** Global sets: their values, their fields, and their public delivery endpoint. */
final class GlobalsModule extends Plugin
{
    public function boot(): void
    {
        $cms = $this->cms();
        $p = $cms->permissions();
        $p->register('globals.view', 'View Globals', 'Content');
        $p->register('globals.edit', 'Edit Globals', 'Content');
        $p->register('globals.manage', 'Manage Global Sets and Fields', 'Content');

        $this->app->make(GlobalAbilities::class)->register($cms->abilities());

        $cms->context()->register('cms://globals', 'Globals', 'Global sets and their current values.', static fn () => array_map(
            static fn ($g) => $g->toArray(),
            array_values($cms->globals()->all())
        ), permission: 'globals.view');

        $cms->hooks()->addFilter('admin.manifest', static fn (array $manifest, User $user) => [
            ...$manifest,
            'globals' => $user->hasPermission('globals.view')
                ? array_values(array_map(static fn ($g) => ['handle' => $g->handle, 'title' => $g->title, 'icon' => $g->icon, ...$g->timestamps], $cms->globals()->all()))
                : [],
        ]);

        $cms->admin()->nav('globals', ['label' => 'Globals', 'path' => '/globals', 'icon' => 'globe', 'section' => 'content', 'order' => 80, 'permission' => 'globals.view']);
        $cms->admin()->widget('globals-sets', ['label' => 'Globals', 'description' => 'Quick links to your global sets.', 'icon' => 'globe', 'column' => 'side', 'order' => 80, 'permission' => 'globals.view']);
        GlobalsViews::register($cms);
        $this->routes();
        $this->adminModule();
    }

    /** Public values of sets marked `api: true`. */
    private function routes(): void
    {
        if ($this->app->routesAreCached()) {
            return;
        }

        Route::prefix('api/v1')->middleware(['api', 'throttle:cms-public'])->get('globals/{handle}', function (Request $request, string $handle) {
            $cms = $this->cms();
            $set = $cms->globals()->find($handle);

            abort_if($set === null || ! ($set->toYaml()['api'] ?? false), 404);

            $locale = (string) $request->query('locale', $cms->defaultLocale());
            $locale = in_array($locale, $cms->locales(), true) ? $locale : $cms->defaultLocale();

            return response()->json(['data' => $set->values($locale)])->setPublic()->setMaxAge(60);
        });
    }
}

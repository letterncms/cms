<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use Cms\Packages\Plugin;
use Cms\Modules\Sync\Http\ApiController;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

/**
 * Moves a site between environments: the database, media and files, pushed or pulled between
 * two sites that hold each other's key. Nothing here is stored in the database it moves: keys,
 * connections, backups and the history live in storage/sync, which never leaves a site.
 */
final class SyncModule extends Plugin
{
    public function register(): void
    {
        foreach ([Site::class, Remotes::class, Database::class, Areas::class, Catalog::class, Receiver::class, LocalSite::class, Connections::class, Transfer::class] as $service) {
            $this->app->singleton($service);
        }
    }

    public function boot(): void
    {
        $cms = $this->cms();
        $cms->permissions()->register('sync.manage', 'Push and Pull Content Between Sites', 'Sync');
        (new Abilities)->register($cms->abilities());

        $cms->admin()->nav('sync', ['path' => '/sync', 'icon' => 'sync', 'section' => 'system', 'order' => 90, 'permission' => 'sync.manage']);
        // What can be seen stays on the screen: keys, sites and history are out of what the assistant is told.
        $cms->views()->register('sync', '/sync', SyncViews::sync(...), permission: 'sync.manage', private: true);
        $none = ['type' => 'object', 'additionalProperties' => false, 'properties' => (object) []];
        $cms->admin()->component('sync/progress', ['label' => 'Sync in Progress', 'description' => 'The sync going on, step by step, with its way to stop, carry on or undo. Nothing while none is.', 'surface' => false, 'permission' => 'sync.manage', 'props' => $none]);
        $cms->admin()->component('sync/key', ['label' => 'Connection Key', 'description' => 'This site’s key, hidden until shown, with a button that copies it.', 'surface' => false, 'permission' => 'sync.manage', 'props' => $none]);
        $cms->admin()->component('sync/sync', ['label' => 'Pull or Push', 'description' => 'What a pull or push would change, to choose from, before it starts.', 'surface' => false, 'permission' => 'sync.manage', 'props' => ['type' => 'object', 'additionalProperties' => false, 'required' => ['remote', 'direction'], 'properties' => [
            'remote' => ['type' => 'string', 'maxLength' => 40], 'label' => ['type' => 'string', 'maxLength' => 200], 'direction' => ['type' => 'string', 'enum' => ['pull', 'push']],
        ]]]);
        $cms->admin()->component('sync/undo', ['label' => 'Undo a Sync', 'description' => 'Asks, then puts back what a sync replaced, from its backup: here, or on a connected site.', 'surface' => false, 'permission' => 'sync.manage', 'props' => ['type' => 'object', 'additionalProperties' => false, 'required' => ['id'], 'properties' => [
            'id' => ['type' => 'string', 'maxLength' => 26], 'remote' => ['type' => 'string', 'maxLength' => 40], 'site' => ['type' => 'string', 'maxLength' => 200],
        ]]]);
        $cms->admin()->widget('sync-sites', ['label' => 'Sync', 'description' => 'The sites this one syncs with, and when each was last pulled or pushed.', 'icon' => 'sync', 'column' => 'side', 'order' => 75, 'permission' => 'sync.manage']);
        $cms->admin()->command('sync',['label' => 'Sync With Another Site', 'icon' => 'sync', 'path' => '/sync', 'permission' => 'sync.manage', 'keywords' => ['push', 'pull', 'migrate', 'staging', 'production', 'local', 'copy', 'deploy']]);
        $this->adminModule();

        // A big sync makes many requests in a row; a wrong key gets nowhere either way.
        RateLimiter::for('cms-sync', static fn (Request $r) => [Limit::perMinute(1200)->by($r->ip())]);
        Route::middleware('throttle:cms-sync')->post('/api/sync/v1/{op}', ApiController::class)->where('op', '[a-z]{2,20}');

        if ($this->app->runningInConsole()) {
            $this->commands([Console\RemoteCommand::class, Console\PullCommand::class, Console\PushCommand::class, Console\UndoCommand::class, Console\HistoryCommand::class]);
        }
    }
}

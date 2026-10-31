<?php

// One public request and one editor's save, in a process of their own, as a site would see them.
//
//   never-probe.php <site>

declare(strict_types=1);

use Cms\Abilities\AbilityContext;
use Cms\Cms;
use Cms\Foundation\Bootstrap;
use Cms\Support\Crypto\Ed25519;
use Cms\Users\User;
use Illuminate\Contracts\Console\Kernel as Console;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;

require (getenv('CMS_TEST_VENDOR') ?: dirname(__DIR__, 6).'/sandbox/vendor').'/autoload.php';

[, $site] = $argv;

$backends = getenv('PROBE_BACKENDS');
if ($backends !== false) {
    Ed25519::$backends = $backends === 'none' ? [] : [$backends];
}
if ($now = getenv('PROBE_NOW')) {
    Carbon::setTestNow($now);
}

$app = Bootstrap::create(dirname(__DIR__, 4), $site);
$app->make(Console::class)->bootstrap();
Artisan::call('migrate', ['--path' => $app->databasePath('migrations'), '--realpath' => true, '--force' => true]);
$app->make(\Cms\Packages\PackageManager::class)->sync();
file_put_contents($site.'/storage/installed.json', '{}');

if (getenv('PROBE_READONLY')) {
    @mkdir($site.'/storage/license', 0o755, true);
    chmod($site.'/storage/license', 0o555);
    chmod($site.'/config', 0o555);
}

$cms = $app->make(Cms::class);
$user = User::query()->create(['name' => 'Ed Itor', 'email' => 'ed@example.com', 'password' => 'secret-pass-123', 'roles' => ['admin'], 'super' => true]);

$kernel = $app->make(Kernel::class);
$server = ['HTTP_HOST' => getenv('PROBE_HOST') ?: 'localhost'];
$home = $kernel->handle(Request::create('/', 'GET', [], [], [], $server));
$api = $kernel->handle(Request::create('/api/v1/', 'GET', [], [], [], $server));
$login = $kernel->handle(Request::create('/admin/login', 'GET', [], [], [], $server));

// Commands exist only because this process is a CLI one: `license:*` are registered, not run.
$loaded = array_values(array_filter(get_declared_classes(), static fn (string $c) => str_starts_with($c, 'Cms\\Modules\\License\\') && ! str_starts_with($c, 'Cms\\Modules\\License\\Console\\') && ! in_array($c, ['Cms\\Modules\\License\\LicenseModule', 'Cms\\Modules\\License\\LicenseAbilities'], true)));

// Before anything in the admin asked, a plugin gets nothing to branch on.
$service = $app->make(\Cms\Modules\License\LicenseService::class);
$state = $service->state('acme/forms');

// Whatever the state, computing it throws nothing, and a page is the same after it.
$report = $service->report();
$after = $kernel->handle(Request::create('/', 'GET', [], [], [], $server));

// An editor keeps working: the same abilities answer, and a save goes through.
$context = AbilityContext::forUser($user);
$created = $cms->abilities()->execute('entries/create', ['collection' => 'notes', 'title' => 'Note', 'slug' => 'note', 'data' => []], $context);
$editor = ['saved' => is_array($created), 'list' => is_array($cms->abilities()->execute('packages/list', ['type' => 'module'], $context))];

echo 'RESULT:', json_encode([
    'loaded' => $loaded !== [],
    'classes' => $loaded,
    'problems' => 0,
    'home' => $home->getStatusCode().':'.(string) $home->getContent(),
    'after' => $after->getStatusCode().':'.(string) $after->getContent(),
    'level' => $report->level,
    'status' => [$home->getStatusCode(), $api->getStatusCode(), $login->getStatusCode()],
    'login' => array_keys(array_filter($login->headers->all(), static fn ($v, $k) => $k === 'location', ARRAY_FILTER_USE_BOTH)),
    'editor' => $editor,
    'state' => $state,
], JSON_UNESCAPED_SLASHES), "\n";

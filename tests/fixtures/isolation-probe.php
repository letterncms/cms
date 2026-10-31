<?php

// One configuration of plugins, in its own process, as one request would see it. A class
// loaded by an earlier configuration would hide a missing plugin in a shared PHPUnit process.
//
//   isolation-probe.php <site> seed      with everything on, write content that uses every plugin
//   isolation-probe.php <site> check     walk the site and the admin, edit the entry, build
//   isolation-probe.php <site> compare   the content has come back whole

declare(strict_types=1);

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Cms;
use Cms\Contracts\SiteBuilder;
use Cms\Foundation\Bootstrap;
use Cms\Packages\PackageManager;
use Cms\Support\Schema\SchemaException;
use Cms\Users\User;
use Illuminate\Contracts\Console\Kernel as Console;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

require (getenv('CMS_TEST_VENDOR') ?: dirname(__DIR__, 4).'/sandbox/vendor').'/autoload.php';

[, $site, $action] = $argv;
$app = Bootstrap::create(dirname(__DIR__, 2), $site);
$app->make(Console::class)->bootstrap();

$cms = $app->make(Cms::class);
$packages = $app->make(PackageManager::class);
$problems = [];

$try = static function (string $what, Closure $code) use (&$problems): void {
    try {
        $code();
    } catch (Throwable $e) {
        $problems[] = "{$what}: ".get_class($e).': '.$e->getMessage().' at '.$e->getFile().':'.$e->getLine();
    }
};

$finish = static function () use (&$problems, $packages): never {
    echo 'RESULT:', json_encode(['problems' => $problems, 'active' => array_keys($packages->active()), 'inactive' => $packages->inactive()], JSON_UNESCAPED_SLASHES), "\n";
    exit(0);
};

if ($action === 'seed') {
    Artisan::call('migrate', ['--path' => $app->databasePath('migrations'), '--realpath' => true]);
    $packages->sync();
    file_put_contents(storage_path('installed.json'), '{}');
    User::query()->create(['name' => 'Ada Admin', 'email' => 'ada@example.com', 'password' => 'secret-pass-123', 'roles' => ['admin'], 'super' => true]);

    $image = ['01m5wn8ra7gs5ph45nagmkawqn'];
    $blocks = [
        ['id' => 'seed-heading', 'type' => 'heading', 'props' => ['text' => 'Every plugin', 'level' => '1']],
        ['id' => 'seed-image', 'type' => 'image', 'props' => ['image' => $image, 'alt' => 'A picture']],
        ['id' => 'seed-section', 'type' => 'section', 'props' => ['background_image' => $image], 'children' => [
            ['id' => 'seed-para', 'type' => 'paragraph', 'props' => ['text' => 'Inside']],
        ]],
        ['id' => 'seed-menu', 'type' => 'repeat', 'props' => ['source' => 'menu', 'menu' => 'main'], 'children' => [
            ['id' => 'seed-link', 'type' => 'link', 'props' => ['label' => 'A link', 'url' => '/']],
        ]],
        ['id' => 'seed-languages', 'type' => 'repeat', 'props' => ['source' => 'languages'], 'children' => [
            ['id' => 'seed-lang', 'type' => 'paragraph', 'props' => ['text' => 'A language']],
        ]],
        ['id' => 'seed-form', 'type' => 'forms/form', 'props' => ['form' => 'contact']],
    ];

    $service = $cms->content();
    $service->create('pages', ['title' => 'Home', 'slug' => 'home', 'status' => 'published', 'data' => ['content' => [$blocks[0]]]]);
    $rich = $service->create('pages', ['title' => 'Rich', 'slug' => 'rich', 'status' => 'published', 'data' => ['content' => $blocks]]);
    file_put_contents($site.'/seed.json', json_encode(['id' => $rich->id, 'blocks' => $rich->working()['data']['content']]));

    $finish();
}

$seed = json_decode((string) file_get_contents($site.'/seed.json'), true);

if ($action === 'compare') {
    $try('compare', static function () use ($cms, $seed): void {
        $now = $cms->entries()->find($seed['id'])->working()['data']['content'];

        if ($now != $seed['blocks']) {
            throw new RuntimeException('content changed: '.json_encode($now));
        }
    });

    $finish();
}

$admin = User::query()->where('email', 'ada@example.com')->firstOrFail();
$kernel = $app->make(Kernel::class);

$get = static function (string $uri, array $allowed, string $method = 'GET', array $body = []) use ($kernel): void {
    $response = $kernel->handle(Request::create($uri, $method, $body, server: ['HTTP_ACCEPT' => str_contains($uri, '/api/') ? 'application/json' : 'text/html']));

    if (! in_array($response->getStatusCode(), $allowed, true)) {
        $cause = $response->exception ?? null;

        throw new RuntimeException("{$method} {$uri} gave {$response->getStatusCode()}".($cause ? ': '.get_class($cause).': '.$cause->getMessage().' at '.$cause->getFile().':'.$cause->getLine() : ''));
    }
};

foreach ($packages->inactive() as $name => $reason) {
    if (str_starts_with($reason, 'Failed to start')) {
        $problems[] = "{$name}: {$reason}";
    }
}

$site_on = $packages->isActive('letterncms/site');
$page = $site_on ? [200] : [404];

$try('visitor /', static fn () => $get('/', $page));
$try('visitor /rich', static fn () => $get('/rich', $page));
$try('visitor /nope', static fn () => $get('/nope', [404]));
$try('visitor /sitemap.xml', static fn () => $get('/sitemap.xml', [200, 404]));
$try('visitor /search.json', static fn () => $get('/search.json', [200, 404]));
$try('visitor delivery', static fn () => $get('/api/v1/content/pages', [200]));
$try('visitor login page', static fn () => $get('/admin/login', [200]));
$try('visitor sign-in', static fn () => $get('/sign-in', [200, 404]));
$try('visitor sign-up', static fn () => $get('/sign-up', [200, 404]));
$try('visitor account', static fn () => $get('/account', [302, 404]));
$try('visitor checkout', static fn () => $get('/checkout', [200, 302, 404]));
$try('password reset', static fn () => $get('/api/admin/auth/forgot', [200, 201, 202, 204], 'POST', ['email' => 'ada@example.com']));

$app['auth']->guard('web')->setUser($admin);

$try('admin shell', static fn () => $get('/admin', [200]));
$try('admin manifest', static fn () => $get('/api/admin/manifest', [200]));
$try('admin session', static fn () => $get('/api/admin/auth/session', [200]));

// Everything an agent or the admin may read: it can fail on its input, never on a missing class.
foreach ($cms->abilities()->all() as $name => $ability) {
    if (! (($ability->annotations['readOnly'] ?? false) === true)) {
        continue;
    }

    try {
        $cms->abilities()->execute($name, [], AbilityContext::forUser($admin));
    } catch (AbilityException | SchemaException | InvalidArgumentException | Illuminate\Database\Eloquent\ModelNotFoundException | Illuminate\Validation\ValidationException) {
        // Asked for something that isn't there, which is an answer.
    } catch (Throwable $e) {
        $problems[] = "ability {$name}: ".get_class($e).': '.$e->getMessage().' at '.$e->getFile().':'.$e->getLine();
    }
}

$try('edit the entry', static function () use ($cms, $seed): void {
    $entry = $cms->entries()->find($seed['id']);
    $saved = $cms->content()->update($seed['id'], ['title' => 'Rich, edited', 'data' => $entry->working()['data']]);
    $cms->content()->publish($saved->id);
});

$try('build', static function () use ($app, $seed): void {
    if ($app->bound(SiteBuilder::class) && $app->make(SiteBuilder::class)->available()) {
        $errors = $app->make(SiteBuilder::class)->buildAll()['errors'] ?? [];

        if ($errors !== []) {
            throw new RuntimeException(implode('; ', $errors));
        }
    }
});

$finish();

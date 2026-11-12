<?php

// One step of the two-site story, in a process of its own, on one site's folder and database.
//
//   site.php <site> <command> [json arguments]
//
// Prints one line: RESULT:{json}.

declare(strict_types=1);

use Cms\Foundation\Bootstrap;
use Cms\Support\Files;
use Cms\Modules\Sync\Site;
use Cms\Modules\Sync\Transfer;
use Illuminate\Contracts\Console\Kernel as Console;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

$cms = dirname(__DIR__, 4);

// The test run's own autoloader (a workspace keeps it outside this repository), or this clone's.
require getenv('CMS_AUTOLOAD') ?: $cms.'/vendor/autoload.php';

[, $site, $command] = $argv;
$args = json_decode($argv[3] ?? '{}', true) ?: [];

$app = Bootstrap::create($cms, $site);
$app->make(Console::class)->bootstrap();

if (! is_file($site.'/storage/installed.json')) {
    \Cms\Update\Upgrader::migrateCore($app);
    $app->make(\Cms\Packages\PackageManager::class)->sync();
    file_put_contents($site.'/storage/installed.json', '{}');
}

$result = match ($command) {
    'artisan' => (static function () use ($args) {
        $code = Artisan::call($args['command'], $args['params'] ?? []);

        return ['code' => $code, 'output' => Artisan::output()];
    })(),
    'key' => app(Site::class)->key(),
    'seed' => (static function () use ($args) {
        $rows = [];

        foreach (range(1, (int) $args['entries']) as $i) {
            $rows[] = ['id' => strtolower((string) Str::ulid()), 'collection' => $args['collection'] ?? 'posts', 'slug' => 'post-'.$i, 'title' => ($args['title'] ?? 'Post').' '.$i, 'status' => 'published', 'data' => json_encode(['link' => $args['url'].'/post-'.$i, 'meta' => serialize(['home' => $args['url'].'/']), 'body' => str_repeat('Lorem ipsum ', 40)]), 'created_at' => now(), 'updated_at' => now()];
        }

        foreach (array_chunk($rows, 200) as $chunk) {
            DB::table('entries')->insert($chunk);
        }

        foreach ($args['files'] ?? [] as $path => $contents) {
            Files::put(public_path('media/'.$path), str_starts_with($contents, 'random:') ? random_bytes((int) substr($contents, 7)) : $contents);
        }

        return true;
    })(),
    'query' => array_map(static fn ($r) => (array) $r, DB::select($args['sql'])),
    'files' => array_map(static fn (string $f) => [substr($f, strlen(public_path('media')) + 1), sha1_file($f)], array_values(array_filter(glob(public_path('media').'/*') ?: [], 'is_file'))),
    'start' => (static function () use ($args) {
        $t = app(Transfer::class);
        $p = $t->start($args['remote'], $args['direction'], ['groups' => $args['groups']]);

        return $t->step($p['id'], 0.01);
    })(),
    'step' => app(Transfer::class)->step($args['id'], (float) ($args['budget'] ?? 30)),
    'finish' => (static function () use ($args) {
        $t = app(Transfer::class);

        do {
            $p = $t->step($args['id'], 30);
        } while (in_array($p['status'], ['running', 'waiting'], true) && ($p['status'] !== 'waiting' || ! sleep(1)));

        return $p;
    })(),
    default => throw new RuntimeException("Unknown command {$command}"),
};

echo 'RESULT:'.json_encode($result)."\n";

<?php

// One step on the throwaway site, in a process of its own:  site.php <site> <command> [json arguments]
// Prints one line: RESULT:{json}.

declare(strict_types=1);

use Cms\Foundation\Bootstrap;
use Cms\Install\Installer;
use Cms\Users\ApiToken;
use Illuminate\Contracts\Console\Kernel as Console;

$cms = dirname(__DIR__, 4);

// The test run's own autoloader (a workspace keeps it outside this repository), or this clone's.
require getenv('CMS_AUTOLOAD') ?: $cms.'/vendor/autoload.php';

[, $site, $command] = $argv;
$args = json_decode($argv[3] ?? '{}', true) ?: [];

$app = Bootstrap::create($cms, $site);
$app->make(Console::class)->bootstrap();

$result = match ($command) {
    // What a person does in the browser's setup, then a token as Settings › API Tokens gives one.
    'install' => (static function () use ($app, $args) {
        $installer = $app->make(Installer::class);
        $user = $installer->install(['site_name' => 'End to End', 'site_url' => $args['url'], 'db_driver' => 'sqlite', 'name' => 'Ada', 'email' => 'ada@example.test', 'password' => 'end-to-End-1']);
        $installer->finish($user);

        return ApiToken::issue($user, 'MCP end to end')[1];
    })(),
    'entries' => array_values(array_map(static fn ($e) => ['id' => $e->id, 'title' => $e->title, 'status' => $e->status], cms()->entries()->query()->collection($args['collection'])->get())),
    // What the token's owner may run over MCP, by the registry's own reckoning.
    'abilities' => array_values(array_map(static fn ($a) => $a->name, cms()->abilities()->available(\Cms\Abilities\AbilityContext::forUser(\Cms\Users\User::query()->where('email', 'ada@example.test')->firstOrFail(), 'mcp')))),
    default => throw new RuntimeException("Unknown command {$command}"),
};

echo 'RESULT:'.json_encode($result, JSON_UNESCAPED_SLASHES)."\n";

<?php

// Run by BrandProofTest in its own process, on a scratch installation: php brand-probe.php <installation> <site>

declare(strict_types=1);

[, $installation, $site] = $argv;

require $installation.'/vendor/autoload.php';

$app = Cms\Foundation\Bootstrap::create($installation, $site);
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = Cms\Users\User::query()->firstOrFail();

echo json_encode([
    'manifest' => $app->make(Cms\Admin\Manifest::class)->build($user),
    'guide' => $app->make(Cms\Abilities\AgentGuide::class)->text(),
], JSON_UNESCAPED_SLASHES);

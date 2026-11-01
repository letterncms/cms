<?php

// Boots a site in its own process, as one request would, and prints how the packages came out.
// Used by tests that need what a shared PHPUnit process cannot give: a fatal error, or classes not yet loaded.

declare(strict_types=1);

require (getenv('CMS_TEST_VENDOR') ?: dirname(__DIR__, 2).'/vendor').'/autoload.php';

$app = Cms\Foundation\Bootstrap::create(dirname(__DIR__, 2), $argv[1]);
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "booted\n";
echo json_encode($app->make(Cms\Packages\PackageManager::class)->inactive(), JSON_UNESCAPED_SLASHES), "\n";

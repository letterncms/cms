<?php

// The other site, served for real: every request boots the CMS, as a shared host would.

declare(strict_types=1);

use Cms\Foundation\Bootstrap;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

$cms = dirname(__DIR__, 4);

// The test run's own autoloader (a workspace keeps it outside this repository), or this clone's.
require getenv('CMS_AUTOLOAD') ?: $cms.'/vendor/autoload.php';

$app = Bootstrap::create($cms, (string) getenv('FIXTURE_SITE'));
$kernel = $app->make(Kernel::class);
$request = Request::capture();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);

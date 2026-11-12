<?php

// The site served for real: every request boots the CMS, as a shared host would, and a built page is a file.

declare(strict_types=1);

use Cms\Foundation\Bootstrap;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

$site = (string) getenv('FIXTURE_SITE');
$file = $site.'/public'.parse_url((string) $_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (is_file($file.'/index.html')) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($file.'/index.html');

    return;
}

// The test run's own autoloader (a workspace keeps it outside this repository), or this clone's.
require getenv('CMS_AUTOLOAD') ?: dirname(__DIR__, 4).'/vendor/autoload.php';

$app = Bootstrap::create(dirname(__DIR__, 4), $site);
$kernel = $app->make(Kernel::class);
$request = Request::capture();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);

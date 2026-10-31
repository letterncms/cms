<?php

// Router for `cms serve`: same rules as the production .htaccess.
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
$public = getcwd();

if (str_contains($uri, '..') || str_contains($uri, "\0")) {
    http_response_code(400);

    return true;
}

$file = $public.$uri;

if ($uri !== '/' && is_file($file) && ! str_ends_with($file, '.php')) {
    return false;
}

foreach ([rtrim($file, '/').'/index.html', $file.'.html'] as $candidate) {
    if (is_file($candidate) && ! str_starts_with($uri, '/admin') && ! str_starts_with($uri, '/api/') && empty($_GET['preview'])) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($candidate);

        return true;
    }
}

$site = getenv('CMS_SITE_PATH') ?: dirname($public);
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = $site.'/index.php';

require $site.'/index.php';

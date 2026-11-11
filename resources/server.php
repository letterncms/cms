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
    // What a site's Apache says for media (public/media/.htaccess): the type a loader expects, and no sniffing.
    // PHP's own server knows none of these types and takes no header for a file it serves itself.
    $types = ['glb' => 'model/gltf-binary', 'gltf' => 'model/gltf+json', 'hdr' => 'image/vnd.radiance', 'ktx2' => 'image/ktx2', 'riv' => 'application/vnd.rive', 'json' => 'application/json'];
    $type = $types[strtolower(pathinfo($file, PATHINFO_EXTENSION))] ?? null;

    if ($type !== null && str_starts_with($uri, '/media/')) {
        header('Content-Type: '.$type);
        header('Content-Length: '.filesize($file));
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: public, max-age=31536000, immutable');
        readfile($file);

        return true;
    }

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

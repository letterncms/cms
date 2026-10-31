<?php

// The `site` settings, read before any service exists (CMS_SITE_<KEY> overrides, as for every setting).
$site = Cms\Support\Yaml::read(site_path('config/site.yaml'));

return [
    'name' => (string) env('CMS_SITE_NAME', $site['name'] ?? env('APP_NAME', Cms\Support\Brand::get())),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('CMS_SITE_URL', env('APP_URL', $site['url'] ?? 'http://localhost')),
    'timezone' => env('CMS_SITE_TIMEZONE', $site['timezone'] ?? 'UTC'),
    'locale' => env('CMS_SITE_LOCALE', $site['locale'] ?? 'en'),
    'fallback_locale' => 'en',
    'cipher' => 'AES-256-CBC',
    'key' => env('APP_KEY') ?: Cms\Install\Installer::ensureKey(),
    'previous_keys' => array_filter(explode(',', (string) env('APP_PREVIOUS_KEYS', ''))),
    'maintenance' => ['driver' => 'file'],
];

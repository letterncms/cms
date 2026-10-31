<?php

return [
    'default' => env('CACHE_STORE', 'file'),
    'stores' => [
        'file' => ['driver' => 'file', 'path' => storage_path('cache/data'), 'lock_path' => storage_path('cache/data')],
        'database' => ['driver' => 'database', 'connection' => null, 'table' => 'cache', 'lock_connection' => null, 'lock_table' => 'cache_locks'],
        'array' => ['driver' => 'array', 'serialize' => false],
        'apc' => ['driver' => 'apc'],
    ],
    'prefix' => env('CACHE_PREFIX', 'cms_'),
];

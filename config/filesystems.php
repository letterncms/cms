<?php

return [
    'default' => 'local',
    'disks' => [
        'local' => ['driver' => 'local', 'root' => storage_path('app'), 'throw' => false],
        'public' => ['driver' => 'local', 'root' => public_path(), 'url' => env('APP_URL', ''), 'visibility' => 'public', 'throw' => false],
    ],
    'links' => [],
];

<?php

return [
    'default' => env('LOG_CHANNEL', 'daily'),
    'deprecations' => ['channel' => 'null', 'trace' => false],
    'channels' => [
        'daily' => ['driver' => 'daily', 'path' => storage_path('logs/cms.log'), 'level' => env('LOG_LEVEL', 'warning'), 'days' => 14, 'replace_placeholders' => true],
        'stderr' => ['driver' => 'monolog', 'handler' => Monolog\Handler\StreamHandler::class, 'with' => ['stream' => 'php://stderr'], 'level' => 'debug'],
        'null' => ['driver' => 'monolog', 'handler' => Monolog\Handler\NullHandler::class],
    ],
];

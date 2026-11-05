<?php

// Nothing is queued: work that can wait runs after the response, so no worker or cron is needed.
return [
    'default' => 'sync',
    'connections' => [
        'sync' => ['driver' => 'sync'],
    ],
    'failed' => ['driver' => 'null'],
];

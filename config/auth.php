<?php

return [
    'defaults' => ['guard' => 'web', 'passwords' => 'users'],
    'guards' => [
        'web' => ['driver' => 'session', 'provider' => 'users'],
        'token' => ['driver' => 'cms-token', 'provider' => 'users'],
    ],
    'providers' => [
        'users' => ['driver' => 'eloquent', 'model' => Cms\Users\User::class],
    ],
    'passwords' => [
        'users' => ['provider' => 'users', 'table' => 'password_reset_tokens', 'expire' => 30, 'throttle' => 60],
        'invites' => ['provider' => 'users', 'table' => 'password_reset_tokens', 'expire' => 10080, 'throttle' => 0],
    ],
    'password_timeout' => 3600,
];

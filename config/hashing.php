<?php

return [
    'driver' => defined('PASSWORD_ARGON2ID') ? 'argon2id' : 'bcrypt',
    'bcrypt' => ['rounds' => 12, 'verify' => true],
    'argon' => ['memory' => 65536, 'threads' => 1, 'time' => 4, 'verify' => true],
    'rehash_on_login' => true,
];

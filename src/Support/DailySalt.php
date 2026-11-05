<?php

declare(strict_types=1);

namespace Cms\Support;

/**
 * A random salt that is replaced every day, with the old one thrown away. What is
 * hashed with it (an IP address) can be compared within a day and never after.
 */
final class DailySalt
{
    public static function today(string $purpose): string
    {
        return self::for($purpose, now()->toDateString());
    }

    public static function for(string $purpose, string $day): string
    {
        $file = storage_path("app/salts/{$purpose}.json");
        $stored = Files::readJson($file);

        if (($stored['day'] ?? null) === $day && is_string($stored['salt'] ?? null)) {
            return $stored['salt'];
        }

        $salt = bin2hex(random_bytes(32));
        Files::putJson($file, ['day' => $day, 'salt' => $salt], 0);

        return $salt;
    }
}

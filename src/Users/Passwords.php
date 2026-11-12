<?php

declare(strict_types=1);

namespace Cms\Users;

use Closure;

final class Passwords
{
    /**
     * What a password must be, as one rule with one message that says all of it: a form says nothing about a
     * password until one falls short, and then what it takes.
     *
     * @return list<mixed>
     */
    public static function rules(): array
    {
        return [static function (string $attribute, mixed $value, Closure $fail): void {
            if (! self::strong($value)) {
                $fail(self::message());
            }
        }];
    }

    /** At least 10 characters and at most 256, with a letter and a digit in them. */
    public static function strong(mixed $password): bool
    {
        return is_string($password) && mb_strlen($password) >= 10 && mb_strlen($password) <= 256
            && preg_match('/\pL/u', $password) === 1 && preg_match('/\pN/u', $password) === 1;
    }

    public static function message(): string
    {
        return __('Use at least 10 characters, with letters and numbers.');
    }
}

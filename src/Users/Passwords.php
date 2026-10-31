<?php

declare(strict_types=1);

namespace Cms\Users;

use Illuminate\Validation\Rules\Password;

final class Passwords
{
    /** @return list<mixed> */
    public static function rules(): array
    {
        return [Password::min(10)->letters()->numbers()->max(256)];
    }
}

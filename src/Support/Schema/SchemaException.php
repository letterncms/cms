<?php

declare(strict_types=1);

namespace Cms\Support\Schema;

use InvalidArgumentException;

final class SchemaException extends InvalidArgumentException
{
    /** @param array<string, string> $errors path => message */
    public function __construct(public readonly array $errors)
    {
        parent::__construct(__('Invalid input: :errors', ['errors' => implode('; ', array_map(
            static fn ($path, $msg) => ($path === '' ? '' : "{$path}: ").$msg,
            array_keys($errors),
            $errors
        ))]));
    }
}

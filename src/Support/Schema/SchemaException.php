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

    /** The same errors, each path under a key of the document they belong to: `summary` becomes `data.summary`. */
    public function under(string $key): self
    {
        $errors = [];

        foreach ($this->errors as $path => $message) {
            $errors[$path === '' ? $key : "{$key}.{$path}"] = $message;
        }

        return new self($errors);
    }
}

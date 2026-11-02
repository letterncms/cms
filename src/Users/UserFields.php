<?php

declare(strict_types=1);

namespace Cms\Users;

use InvalidArgumentException;
use Cms\Abilities\AbilityException;
use Cms\Content\Fields\Blueprint;
use Cms\Extend\Hooks;
use Cms\Support\Schema\SchemaException;
use Cms\Support\Yaml;

/**
 * The fields every user profile has beyond name and email (a bio, a job
 * title, a photo…), defined in content/users.yaml like a collection's and
 * edited with the same blueprint editor. Plugins add theirs with the
 * `users.fields` filter.
 */
final class UserFields
{
    /** Handles the account itself uses. */
    public const array RESERVED = ['id', 'name', 'email', 'password', 'roles', 'super', 'avatar', 'locale', 'preferences', 'data'];

    private ?Blueprint $blueprint = null;

    public function __construct(private readonly Hooks $hooks) {}

    /** As stored (no plugin fields): what the blueprint editor edits. */
    public function stored(): array
    {
        return array_values((array) (Yaml::read($this->file())['fields'] ?? []));
    }

    public function blueprint(): Blueprint
    {
        return $this->blueprint ??= Blueprint::make($this->hooks->filter('users.fields', $this->stored()));
    }

    public function save(array $fields): void
    {
        try {
            Blueprint::validate($fields);
        } catch (InvalidArgumentException $e) {
            throw AbilityException::invalid($e->getMessage());
        }

        foreach ($fields as $field) {
            if (in_array($field['handle'] ?? null, self::RESERVED, true)) {
                throw AbilityException::invalid(__('":handle" is part of every account; choose another field handle.', ['handle' => $field['handle']]));
            }
        }

        Yaml::write($this->file(), ['fields' => array_values($fields)]);
        $this->blueprint = null;
        $this->hooks->dispatch('users.fields.saved');
    }

    /** A user's values over the defaults. */
    public function values(User $user): array
    {
        return array_replace($this->blueprint()->defaults(), (array) ($user->data ?? []));
    }

    /**
     * Merge new values into a user's, validated against the blueprint. Required
     * fields may stay empty: people are invited before their profile is complete.
     */
    public function fill(User $user, array $values): void
    {
        try {
            $user->data = $this->blueprint()->process(array_replace((array) ($user->data ?? []), $values), partial: true);
        } catch (SchemaException $e) {
            throw AbilityException::invalid($e->getMessage(), $e->errors);
        }
    }

    private function file(): string
    {
        return content_path('users.yaml');
    }
}

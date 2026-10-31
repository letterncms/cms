<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;
use Cms\Users\User;

class Users extends FieldType
{
    public function key(): string { return 'users'; }

    public function label(): string { return __('Users'); }

    public function description(): string { return __('Link to one or more users.'); }

    public function icon(): string { return 'users'; }

    public function group(): string { return __('Relations'); }

    public function schema(Field $field): array
    {
        return array_filter(['type' => 'array', 'items' => ['type' => 'string'], 'maxItems' => $field->get('max'), 'description' => $field->instructions ?: $field->label], static fn ($v) => $v !== null);
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        return array_values(array_unique(array_filter((array) $value, 'is_string')));
    }

    public function defaultValue(Field $field): mixed
    {
        return [];
    }

    public function augment(mixed $value, Field $field): mixed
    {
        $users = User::query()->whereIn('id', (array) $value)->get(['id', 'name', 'avatar'])->map(fn (User $u) => ['id' => $u->id, 'name' => $u->name, 'avatar' => $u->avatar])->all();

        return (int) $field->get('max') === 1 ? ($users[0] ?? null) : $users;
    }
}

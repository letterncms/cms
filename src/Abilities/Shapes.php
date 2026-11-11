<?php

declare(strict_types=1);

namespace Cms\Abilities;

use Cms\Support\Schema\Shape;

/** What several abilities answer with, described once: a person, a user, an entry. */
final class Shapes
{
    /** `{ok: true}`: it worked, and there is nothing else to say. */
    public static function ok(): Shape
    {
        return Shape::of(['ok' => Shape::BOOLEAN]);
    }

    /** User::toPerson(): who someone is, without account details. */
    public static function person(): Shape
    {
        return Shape::of(['id' => Shape::STRING, 'name' => Shape::STRING, 'initials' => Shape::STRING, 'avatar' => Shape::STRING_OR_NULL]);
    }

    /** User::toPublic(): an account. */
    public static function user(): Shape
    {
        return Shape::of([
            'id' => Shape::STRING, 'name' => Shape::STRING, 'email' => Shape::STRING, 'avatar' => Shape::STRING_OR_NULL, 'initials' => Shape::STRING,
            'roles' => [Shape::STRING], 'super' => Shape::BOOLEAN, 'locale' => Shape::STRING_OR_NULL, 'status' => Shape::STRING, 'visitor' => Shape::BOOLEAN,
            'twoFactor' => Shape::BOOLEAN, 'lastLoginAt' => Shape::STRING_OR_NULL, 'createdAt' => Shape::STRING_OR_NULL,
            'publishedAt' => Shape::STRING_OR_NULL, 'updatedAt' => Shape::STRING_OR_NULL, 'data' => Shape::OBJECT,
        ]);
    }

    /** Entry::toArray(): an entry with its working copy. `data` follows the collection's schema (collections/get). */
    public static function entry(): Shape
    {
        return Shape::of([
            'id' => Shape::STRING, 'collection' => Shape::STRING, 'locale' => Shape::STRING, 'title' => Shape::STRING, 'slug' => Shape::STRING,
            'uri' => Shape::STRING_OR_NULL, 'status' => Shape::STRING, 'displayStatus' => Shape::STRING, 'hasDraft' => Shape::BOOLEAN, 'data' => Shape::OBJECT,
            'originId' => Shape::STRING_OR_NULL, 'parentId' => Shape::STRING_OR_NULL, 'position' => Shape::INTEGER, 'authorId' => Shape::STRING_OR_NULL,
            'author' => Shape::nullable(self::person()), 'version' => Shape::STRING, 'publishedAt' => Shape::STRING_OR_NULL,
            'createdAt' => Shape::STRING_OR_NULL, 'updatedAt' => Shape::STRING_OR_NULL,
        ]);
    }

    /** Entry::toSummary(): an entry in a list, without its data. */
    public static function entrySummary(): Shape
    {
        return Shape::of([
            'id' => Shape::STRING, 'collection' => Shape::STRING, 'locale' => Shape::STRING, 'title' => Shape::STRING, 'slug' => Shape::STRING,
            'uri' => Shape::STRING_OR_NULL, 'status' => Shape::STRING, 'displayStatus' => Shape::STRING, 'parentId' => Shape::STRING_OR_NULL,
            'position' => Shape::INTEGER, 'authorId' => Shape::STRING_OR_NULL, 'author?' => Shape::nullable(self::person()), 'version' => Shape::STRING,
            'publishedAt' => Shape::STRING_OR_NULL, 'updatedAt' => Shape::STRING_OR_NULL,
        ]);
    }

    /** A field of a blueprint: its handle and type, and whatever its type takes (label, required, options…). */
    public static function field(): Shape
    {
        return Shape::of(['handle' => Shape::STRING, 'type' => Shape::STRING, 'label?' => Shape::STRING_OR_NULL, 'required?' => Shape::BOOLEAN]);
    }

    /** Collection::toArray(): a collection's definition as its YAML has it, with the fields its imports resolve to. */
    public static function collection(): Shape
    {
        return Shape::of([
            'handle' => Shape::STRING, 'title' => Shape::STRING, 'singular' => Shape::STRING, 'icon?' => Shape::STRING, 'description?' => Shape::STRING,
            'driver' => Shape::STRING, 'structure' => Shape::STRING, 'route?' => Shape::STRING, 'template?' => Shape::STRING, 'sort?' => Shape::STRING,
            'home?' => Shape::STRING, 'body?' => Shape::STRING, 'system?' => Shape::BOOLEAN,
            // As written: a field, or the import of a fieldset ({import, prefix?}).
            'fields' => [Shape::OBJECT],
            'publishedAt' => Shape::STRING_OR_NULL, 'updatedAt' => Shape::STRING_OR_NULL, 'default_view' => Shape::STRING,
            'default_columns' => Shape::nullable([Shape::STRING]), 'resolvedFields' => [self::field()],
        ]);
    }
}

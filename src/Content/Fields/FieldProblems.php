<?php

declare(strict_types=1);

namespace Cms\Content\Fields;

use Cms\Abilities\AbilityException;

/**
 * What is wrong with field definitions as they were written, and where: each problem under the
 * path of the option it is about (`fields.2.handle`, `fields.0.fields.1.type`), so a form can
 * say it beside that field. An ability that saves a blueprint hands them on as the `details` of
 * its refusal; Blueprint::validate() stays the check nothing gets past.
 */
final class FieldProblems
{
    /**
     * @param  list<string>  $reserved  handles the top level may not use (an entry's own columns)
     * @return array<string, string> path of the option => what is wrong with it, in the order the fields are written
     */
    public static function of(array $raw, array $reserved = [], string $path = 'fields', int $depth = 0): array
    {
        $types = app(FieldTypeRegistry::class);
        $problems = [];
        $seen = [];
        $body = false;

        foreach (array_values($raw) as $i => $definition) {
            // An import brings a fieldset's fields, checked where the fieldset is saved.
            if (! is_array($definition) || isset($definition['import'])) {
                continue;
            }

            $at = "{$path}.{$i}";
            $handle = (string) ($definition['handle'] ?? '');
            $type = (string) ($definition['type'] ?? 'text');

            if ($handle === '') {
                $problems["{$at}.handle"] = __('A field needs a handle.');
            } elseif (! preg_match('/^[a-z][a-z0-9_]{0,63}$/', $handle)) {
                $problems["{$at}.handle"] = __('Use lowercase letters, digits and underscores, starting with a letter.');
            } elseif (isset($seen[$handle])) {
                $problems["{$at}.handle"] = __('Another field uses this handle.');
            } elseif ($depth === 0 && in_array($handle, $reserved, true)) {
                $problems["{$at}.handle"] = __('“:handle” is reserved. Choose another field handle.', ['handle' => $handle]);
            }
            $seen[$handle] = true;

            if (! $types->has($type)) {
                $problems["{$at}.type"] = __('The field type “:type” is not available.', ['type' => $type]);
            }

            // One field of a blueprint is its body, and only of a type that can be.
            if (array_key_exists('body', $definition)) {
                if (! is_bool($definition['body']) || ($definition['body'] && ($depth > 0 || ($types->has($type) && ! $types->get($type)->body())))) {
                    $problems["{$at}.body"] = __('Only a blocks, Markdown or rich text field can be the body.');
                } elseif ($definition['body'] && $body) {
                    $problems["{$at}.body"] = __('Another field is the body.');
                }
                $body = $body || $definition['body'] === true;
            }

            if (array_key_exists('fields', $definition)) {
                $sub = $definition['fields'];

                if (! is_array($sub) || ! array_is_list($sub)) {
                    $problems["{$at}.fields"] = __('Sub-fields must be a list.');
                } elseif ($depth >= 5) {
                    $problems["{$at}.fields"] = __('Fields can be nested at most five levels deep.');
                } else {
                    $problems += self::of($sub, [], "{$at}.fields", $depth + 1);
                }
            }
        }

        return $problems;
    }

    /** Refuse the definitions when something is wrong with them: one problem in words, all of them by path. */
    public static function refuse(array $raw, array $reserved = [], string $path = 'fields'): void
    {
        $problems = self::of($raw, $reserved, $path);

        if ($problems === []) {
            return;
        }

        // In words, the refusal names the field (`people.name`), for whoever reads it without a form: Blueprint::validate() says it that way.
        try {
            Blueprint::validate($raw);
            $message = (string) reset($problems);
        } catch (\InvalidArgumentException $e) {
            $message = $e->getMessage();
        }

        throw AbilityException::invalid($message, $problems);
    }
}

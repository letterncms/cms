<?php

declare(strict_types=1);

namespace Cms\Modules\Workspace;

use Cms\Abilities\Ability;
use Cms\Cms;
use Cms\Users\User;
use Throwable;

/**
 * What a thread answers a command and a search with: a view. An ability may say its own
 * (`answer` in its config: fn (mixed $result, array $input, User $user): array, a view tree,
 * usually `Answers::done()` with the next obvious actions); otherwise one is drawn from what
 * it returned. Either way the `workspace.answer` filter may add to it, and it is checked for
 * the person like any view (Cms\Admin\Views) and stored as checked. Its buttons run their
 * abilities live, as the person, like any view's.
 */
final class Answers
{
    /** Rows of a list an answer shows. */
    public const int ROWS = 50;

    public function __construct(private readonly Cms $cms) {}

    public function command(Ability $ability, array $input, mixed $result, User $user): array
    {
        if ($ability->answer !== null) {
            try {
                if ($view = $this->checked(($ability->answer)($result, $input, $user), $ability, $input, $result, $user)) {
                    return $view;
                }
            } catch (Throwable $e) {
                report($e);
            }
        }

        try {
            if ($view = $this->checked($this->drawn($ability, $result), $ability, $input, $result, $user)) {
                return $view;
            }
        } catch (Throwable $e) {
            report($e);
        }

        return self::text(__('Done.'));
    }

    /** Sections of what was found, each a list that opens where its line leads. */
    public function search(array $found, User $user): array
    {
        $sections = [];

        foreach ($found['sections'] ?? [] as $section) {
            // A light list of lines, each opening where it is.
            $sections[] = ['type' => 'ui/section', 'props' => ['title' => self::literal($section['title'])], 'children' => [
                ['type' => 'ui/links', 'props' => ['items' => array_map(self::literal(...), $section['items'])]],
            ]];
        }

        $view = $sections === []
            ? ['type' => 'ui/empty', 'props' => ['size' => 'sm', 'title' => self::literal(__('Nothing found for “:query”', ['query' => (string) ($found['query'] ?? '')]))]]
            : ['type' => 'ui/stack', 'children' => $sections];

        return $this->cms->views()->validate($view, $user) ?? self::text(__('Nothing found.'));
    }

    /**
     * A change done, said in a line, with what to do next: open it, publish it, undo it.
     * For an ability's own `answer`.
     *
     * @param  list<array>  $actions  view actions (Cms\Admin\Catalog::action())
     */
    public static function done(string $title, ?string $text = null, array $actions = [], string $tone = 'success'): array
    {
        return ['type' => 'ui/stack', 'children' => array_values(array_filter([
            ['type' => 'ui/notice', 'props' => array_filter(['tone' => $tone, 'title' => self::literal($title), 'text' => $text === null ? null : self::literal($text)], static fn ($v) => $v !== null && $v !== '')],
            $actions !== [] ? ['type' => 'ui/actions', 'props' => ['items' => array_values($actions)]] : null,
        ]))];
    }

    /** A line of words. */
    public static function text(string $text): array
    {
        return ['type' => 'ui/text', 'props' => ['text' => self::literal($text)]];
    }

    /**
     * Values written into an answer as they are: a view fills in `{row.x}` and the like where it is
     * drawn, so a title that happens to hold braces is kept from reading as one.
     */
    public static function literal(mixed $value): mixed
    {
        return match (true) {
            is_string($value) => (string) preg_replace('/\{([a-zA-Z_][\w.]*)\}/', '{{$1}}', $value),
            is_array($value) => array_map(self::literal(...), $value),
            default => $value,
        };
    }

    /** An admin path an answer may lead to, or null: another site's address is no place of the admin. */
    public static function place(mixed $to): ?string
    {
        return is_string($to) && preg_match('~^/(?!/)[^\s]{0,300}$~', $to) === 1 ? $to : null;
    }

    private function checked(array $view, Ability $ability, array $input, mixed $result, User $user): ?array
    {
        $view = $this->cms->hooks()->filter('workspace.answer', $view, $ability->name, $result, $input, $user);

        return $this->cms->views()->validate($view, $user);
    }

    /** From what an ability returned: a list as records, a record as its values, anything else in words. */
    private function drawn(Ability $ability, mixed $result): array
    {
        $list = is_array($result) && array_is_list($result) ? $result : (is_array($result) && isset($result['items']) && is_array($result['items']) && array_is_list($result['items']) ? $result['items'] : null);

        if ($list !== null && array_filter($list, 'is_array') === $list) {
            return $this->records(__($ability->label), array_slice($list, 0, self::ROWS));
        }

        if (is_array($result) && $result !== []) {
            $open = self::opens($result);

            return ['type' => 'ui/stack', 'children' => array_values(array_filter([
                ['type' => 'ui/detail', 'props' => ['record' => self::literal($result), 'raw' => self::literal($result)]],
                $open ? ['type' => 'ui/actions', 'props' => ['items' => [['label' => __('Open'), 'icon' => 'arrow-right', 'variant' => 'primary', 'to' => $open]]]] : null,
            ]))];
        }

        return self::text(match (true) {
            is_string($result) && $result !== '' => $result,
            is_int($result), is_float($result) => (string) $result,
            default => __('Done.'),
        });
    }

    private function records(string $label, array $rows): array
    {
        $first = $rows[0] ?? [];
        $columns = [];
        $preferred = ['title', 'name', 'label', 'email', 'code', 'handle', 'displayStatus', 'status', 'uri', 'collection', 'updatedAt', 'createdAt'];
        $keys = [...array_intersect($preferred, array_keys($first)), ...array_diff(array_keys($first), $preferred)];

        foreach ($keys as $key) {
            $value = $first[$key];
            if (count($columns) === 4 || ! is_string($key) || self::isId($key) || ($key === 'status' && isset($first['displayStatus'])) || ! (is_scalar($value) || $value === null)) {
                continue;
            }
            $columns[] = array_filter(['key' => $key, 'label' => self::label($key), 'format' => self::format($key, $value)]);
        }

        $open = isset($first['collection'], $first['id']) && is_string($first['collection']) ? '/content/{row.collection}/{row.id}' : (self::place($first['to'] ?? null) !== null ? '{row.to}' : null);
        $key = isset($first['id']) ? 'id' : (isset($first['handle']) ? 'handle' : null);

        return ['type' => 'ui/records', 'props' => array_filter([
            'label' => $label,
            'rows' => self::literal($key === null ? array_map(static fn (array $row, int $i) => ['id' => $i, ...$row], $rows, array_keys($rows)) : $rows),
            'key' => $key ?? 'id',
            'columns' => $columns ?: [['key' => 'id', 'label' => __('Name')]],
            'open' => $open ? ['label' => __('Open'), 'to' => $open] : null,
            'search' => false,
            'display' => false,
            'empty' => ['size' => 'sm', 'title' => __('Nothing found.')],
        ], static fn ($v) => $v !== null)];
    }

    /** Where a record is in the admin: its own `to`, or the entry it is. */
    private static function opens(array $record): ?string
    {
        if ($to = self::place($record['to'] ?? null)) {
            return $to;
        }

        return isset($record['collection'], $record['id']) && is_string($record['collection']) && is_string($record['id']) && preg_match('/^[a-z0-9_-]+$/', $record['collection']) === 1
            ? '/content/'.$record['collection'].'/'.rawurlencode($record['id'])
            : null;
    }

    private static function isId(string $key): bool
    {
        return $key === 'id' || preg_match('/(Id|_id)$/', $key) === 1;
    }

    private static function label(string $key): string
    {
        return match ($key) {
            'title' => __('Title'), 'name' => __('Name'), 'label' => __('Name'), 'email' => __('Email'), 'status', 'displayStatus' => __('Status'),
            'updatedAt' => __('Updated'), 'createdAt' => __('Created'), 'publishedAt' => __('Published'), 'uri' => __('Address'), 'collection' => __('Collection'),
            'handle' => __('Handle'), 'code' => __('Code'),
            default => ucfirst(trim((string) preg_replace('/(?<=[a-z])(?=[A-Z])|_/', ' ', $key))),
        };
    }

    private static function format(string $key, mixed $value): ?string
    {
        return match (true) {
            in_array($key, ['updatedAt', 'createdAt', 'publishedAt', 'lastLoginAt'], true) => 'ago',
            $key === 'displayStatus' => 'status',
            $key === 'status' => 'badge',
            in_array($key, ['handle', 'code', 'uri'], true) => 'code',
            is_bool($value) => 'yesno',
            is_int($value) || is_float($value) => 'number',
            default => null,
        };
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\Content;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Cms;
use Cms\Support\Schema\Shape;
use Cms\Users\User;
use Illuminate\Support\Facades\Cache;

/**
 * A person's saved views: a collection's list as they like to come back to it (what it is narrowed
 * to, its order, its columns and whether it is a table, cards or a calendar), under a name of
 * their own. Kept with the person, in their preferences under `views`, so they are the same in
 * every browser and nobody else's. `list` is the list's id as its view names it
 * (`entries.<collection>`), and a view holds only what that list has: its filters, its columns.
 */
final class SavedViews
{
    /** Per person, over all lists: a menu, not an archive. */
    public const int LIMIT = 50;

    public function __construct(private readonly Cms $cms) {}

    public function register(AbilityRegistry $a): void
    {
        $list = ['type' => 'string', 'minLength' => 1, 'maxLength' => 120, 'pattern' => '^entries\\.[a-z0-9][a-z0-9_-]{0,63}$', 'description' => 'The list\'s id, as its view names it: entries.<collection>.'];
        $name = ['type' => 'string', 'minLength' => 1, 'maxLength' => 60];
        $state = ['type' => 'object', 'additionalProperties' => false, 'description' => 'The list as it is kept: what narrows it, its order, its columns and how it is drawn.', 'properties' => [
            'query' => ['type' => 'object', 'maxProperties' => 20, 'additionalProperties' => ['type' => 'string', 'maxLength' => 200], 'description' => 'The list\'s search and filters, by the name each has in the address: {"status": "draft", "search": "launch"}. Only filters the list has, with a value each offers.'],
            'sort' => ['type' => ['string', 'null'], 'maxLength' => 120, 'pattern' => ContentAbilities::SORT, 'description' => 'What it is sorted by, as entries/list takes it (- first for descending); null for the list\'s own order.'],
            'columns' => ['type' => ['array', 'null'], 'maxItems' => 60, 'items' => ['type' => 'string', 'maxLength' => 120], 'description' => 'The columns shown, by their key in the list (uri, displayStatus, values.<field>, published, updated…); null for the list\'s own.'],
            'view' => ['type' => 'string', 'enum' => ['table', 'grid', 'calendar']],
            'calendarDate' => ['type' => 'string', 'enum' => ['published', 'updated']],
        ]];
        $signedIn = static fn (?User $user) => $user !== null && $user->hasPermission('admin.access');

        $a->register('saved-views/list', [
            'label' => 'List Saved Views',
            'description' => 'Your saved views of a list, or of every list when none is named, in the order they were saved. A view comes back as its list is now: a column or a filter the list no longer has is left out.',
            'permission' => $signedIn,
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['list' => $list]],
            'output' => Shape::of([self::shape()]),
            'handler' => fn (array $in, AbilityContext $ctx) => array_map(self::public(...), array_values(array_filter($this->of($ctx->user), static fn (array $v) => ! isset($in['list']) || $v['list'] === $in['list']))),
        ]);

        $a->register('saved-views/create', [
            'label' => 'Save View',
            'description' => 'Keep a collection\'s list as it is now under a name of your own. A name already used for that list is refused: change that view with saved-views/update.',
            'permission' => $signedIn,
            'input' => ['type' => 'object', 'properties' => ['list' => $list, 'name' => $name, 'state' => $state], 'required' => ['list', 'name', 'state']],
            'output' => self::shape(),
            'dryRun' => fn (array $in, AbilityContext $ctx): array => [['action' => 'create', 'type' => 'saved-view', 'list' => $in['list'], 'name' => $this->made($ctx->user, $this->of($ctx->user), $in)['name']]],
            'handler' => fn (array $in, AbilityContext $ctx) => self::public($this->change($ctx->user, function (array $views) use ($in, $ctx) {
                $view = $this->made($ctx->user, $views, $in);

                return [[...$views, $view], $view];
            })),
        ]);

        $a->register('saved-views/update', [
            'label' => 'Update Saved View',
            'description' => 'Rename one of your saved views, or replace what it keeps. What is left out stays as it is.',
            'permission' => $signedIn,
            'annotations' => ['idempotent' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string'], 'name' => $name, 'state' => $state], 'required' => ['id']],
            'output' => self::shape(),
            'dryRun' => fn (array $in, AbilityContext $ctx): array => [['action' => 'update', 'type' => 'saved-view', 'id' => $in['id'], 'name' => $this->changed($ctx->user, $this->of($ctx->user), $in)['name']]],
            'handler' => fn (array $in, AbilityContext $ctx) => self::public($this->change($ctx->user, function (array $views) use ($in, $ctx) {
                $view = $this->changed($ctx->user, $views, $in);

                return [array_map(static fn (array $v) => $v['id'] === $view['id'] ? $view : $v, $views), $view];
            })),
        ]);

        $a->register('saved-views/delete', [
            'label' => 'Delete Saved View',
            'description' => 'Delete one of your saved views. The list itself is not touched.',
            'permission' => $signedIn,
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string']], 'required' => ['id']],
            'output' => Shape::of(['deleted' => Shape::STRING]),
            'dryRun' => fn (array $in, AbilityContext $ctx): array => [['action' => 'delete', 'type' => 'saved-view', 'id' => $in['id'], 'name' => self::find($this->of($ctx->user), $in['id'])['name']]],
            'handler' => fn (array $in, AbilityContext $ctx) => ['deleted' => $this->change($ctx->user, static function (array $views) use ($in) {
                $view = self::find($views, $in['id']);

                return [array_filter($views, static fn (array $v) => $v['id'] !== $view['id']), $view];
            })['id']],
        ]);
    }

    /** A collection that is deleted takes everyone's views of its list with it. */
    public function forget(string $collection): void
    {
        User::query()->whereNotNull('preferences')->get()->each(function (User $user) use ($collection): void {
            if (array_filter((array) (($user->preferences ?? [])['views'] ?? []), static fn ($v) => ($v['list'] ?? null) === "entries.{$collection}") !== []) {
                $this->change($user, static fn (array $views) => [array_filter($views, static fn (array $v) => $v['list'] !== "entries.{$collection}"), null], prune: false);
            }
        });
    }

    private static function shape(): Shape
    {
        return Shape::of(['id' => Shape::STRING, 'list' => Shape::STRING, 'name' => Shape::STRING, 'state' => Shape::of([
            'query' => Shape::map(Shape::STRING), 'sort' => Shape::STRING_OR_NULL, 'columns' => Shape::nullable([Shape::STRING]), 'view' => Shape::STRING, 'calendarDate' => Shape::STRING,
        ])]);
    }

    /**
     * A person's views as their lists are now: what is stored is read loosely (anything not a view is skipped, a
     * view's state is brought into shape) and held against its list, so a column or a filter that went is left
     * out and a view of a list that is gone, or that they may no longer see, is not given.
     *
     * @return list<array{id: string, list: string, name: string, state: array}>
     */
    private function of(User $user, bool $prune = true): array
    {
        $views = [];

        foreach ((array) (($user->preferences ?? [])['views'] ?? []) as $view) {
            if (! is_array($view) || ! is_string($view['id'] ?? null) || ! is_string($view['list'] ?? null) || ! is_string($view['name'] ?? null)) {
                continue;
            }

            $offers = $prune ? $this->offers($view['list'], $user) : null;

            if ($prune && $offers === null) {
                continue;
            }

            $views[] = ['id' => $view['id'], 'list' => $view['list'], 'name' => $view['name'], 'state' => self::state((array) ($view['state'] ?? []), $offers)];
        }

        return $views;
    }

    /**
     * Change a person's views and nothing else of theirs: read again from the database under a lock, so two
     * requests at once (or a preference saved meanwhile) lose nothing.
     *
     * @param  callable(list<array>): array{0: array, 1: mixed}  $fn  the views as they are => [the views as they will be, what to answer with]
     */
    private function change(User $user, callable $fn, bool $prune = true): mixed
    {
        return Cache::lock("cms-saved-views:{$user->id}", 10)->block(5, function () use ($user, $fn, $prune) {
            $fresh = $user->fresh() ?? $user;
            $stored = array_column($this->of($fresh, false), null, 'id');
            [$views, $answer] = $fn($this->of($fresh, $prune));
            $views = array_column($views, null, 'id');
            $shown = array_column($this->of($fresh, $prune), 'id');
            $next = [];

            // What is stored stays as stored and in its order: a view not given here (its list is not there for now) is kept,
            // one that was given and is gone is deleted, and only the one made or changed is written anew.
            foreach ($stored as $id => $view) {
                if (! in_array($id, $shown, true)) {
                    $next[] = $view;
                } elseif (isset($views[$id])) {
                    $next[] = is_array($answer) && ($answer['id'] ?? null) === $id ? $views[$id] : $view;
                }
            }

            $fresh->preferences = [...(array) ($fresh->preferences ?? []), 'views' => [...$next, ...array_values(array_diff_key($views, $stored))]];
            $fresh->save();
            $user->preferences = $fresh->preferences;
            $user->syncOriginalAttribute('preferences');

            return $answer;
        });
    }

    private static function find(array $views, string $id): array
    {
        foreach ($views as $view) {
            if ($view['id'] === $id) {
                return $view;
            }
        }

        throw new AbilityException(__('This saved view is gone.'), 'not_found');
    }

    /** The view a create would add, refused as the create is. */
    private function made(User $user, array $views, array $in): array
    {
        if (count($views) >= self::LIMIT) {
            throw AbilityException::invalid(__('You have :count saved views. Delete one to save another.', ['count' => self::LIMIT]));
        }

        return ['id' => bin2hex(random_bytes(8)), 'list' => $in['list'], 'name' => self::name($views, $in['list'], $in['name']), 'state' => $this->checked($in['list'], $user, $in['state'])];
    }

    /** The view an update would leave, refused as the update is. */
    private function changed(User $user, array $views, array $in): array
    {
        $view = self::find($views, $in['id']);

        return [
            ...$view,
            ...(isset($in['name']) ? ['name' => self::name($views, $view['list'], $in['name'], $view['id'])] : []),
            ...(isset($in['state']) ? ['state' => $this->checked($view['list'], $user, $in['state'])] : []),
        ];
    }

    /** A name as it is kept: trimmed, and no other view of that list has it. */
    private static function name(array $views, string $list, string $name, ?string $except = null): string
    {
        $name = trim($name);

        if ($name === '') {
            throw AbilityException::invalid($error = __('Give the view a name.'), ['name' => $error]);
        }

        foreach ($views as $view) {
            if ($view['list'] === $list && $view['id'] !== $except && mb_strtolower($view['name']) === mb_strtolower($name)) {
                throw AbilityException::invalid($error = __('You already have a view with this name.'), ['name' => $error]);
            }
        }

        return $name;
    }

    /**
     * What a list has that a view can keep: its filters with the values each offers (null: any, for the search)
     * and its columns. Null when the list is not there, or not for this person.
     *
     * @return array{query: array<string, list<string>|null>, columns: list<string>, views: list<string>}|null
     */
    private function offers(string $list, User $user): ?array
    {
        $collection = $this->cms->collections()->find(substr($list, strlen('entries.')));

        if (! str_starts_with($list, 'entries.') || $collection === null || ! $user->hasPermission("entries.{$collection->handle}.view")) {
            return null;
        }

        $records = (new EntriesView($this->cms, ContentModule::PER_PAGE))->records($collection, $user);
        $query = [$records['search']['param'] => null];

        foreach ($records['filters'] as $filter) {
            $query[$filter['param']] = array_map(static fn (array $o) => (string) $o['value'], $filter['options'] ?? []);
        }

        return [
            'query' => $query,
            // The first column is the title: always there, never chosen.
            'columns' => array_column(array_slice($records['columns'], 1), 'key'),
            'views' => ['table', 'grid', ...(isset($records['calendar']) ? ['calendar'] : [])],
        ];
    }

    /** A state someone hands in, held against its list: something the list does not have is refused, by name. */
    private function checked(string $list, User $user, array $state): array
    {
        $offers = $this->offers($list, $user) ?? throw AbilityException::invalid($error = __('There is no list “:list”.', ['list' => $list]), ['list' => $error]);

        foreach ((array) ($state['query'] ?? []) as $param => $value) {
            if (! array_key_exists($param, $offers['query']) || ($offers['query'][$param] !== null && ! in_array((string) $value, $offers['query'][$param], true))) {
                throw AbilityException::invalid($error = __('This list has no filter “:filter” with that value.', ['filter' => $param]), ['state.query' => $error]);
            }
        }

        foreach ((array) ($state['columns'] ?? []) as $column) {
            if (! in_array($column, $offers['columns'], true)) {
                throw AbilityException::invalid($error = __('This list has no column “:column”.', ['column' => $column]), ['state.columns' => $error]);
            }
        }

        if (($state['view'] ?? 'table') === 'calendar' && ! in_array('calendar', $offers['views'], true)) {
            throw AbilityException::invalid($error = __('This list has no calendar.'), ['state.view' => $error]);
        }

        return self::state($state, $offers);
    }

    /**
     * What is kept of a list, whole and in shape: what was left out is the list's own, and with `$offers`,
     * what the list does not have (any more) is left out rather than kept.
     */
    private static function state(array $state, ?array $offers = null): array
    {
        $query = array_filter((array) ($state['query'] ?? []), static fn ($v) => is_string($v) && $v !== '');
        $columns = is_array($state['columns'] ?? null) ? array_values(array_filter($state['columns'], 'is_string')) : null;
        $sort = is_string($state['sort'] ?? null) && preg_match('/'.ContentAbilities::SORT.'/', $state['sort']) ? $state['sort'] : null;
        $view = in_array($state['view'] ?? null, ['table', 'grid', 'calendar'], true) ? $state['view'] : 'table';

        if ($offers !== null) {
            $query = array_filter($query, static fn (string $v, string $param) => array_key_exists($param, $offers['query']) && ($offers['query'][$param] === null || in_array($v, $offers['query'][$param], true)), ARRAY_FILTER_USE_BOTH);
            $columns = $columns === null ? null : array_values(array_intersect($columns, $offers['columns']));
            $view = in_array($view, $offers['views'], true) ? $view : 'table';
        }

        return ['query' => $query, 'sort' => $sort, 'columns' => $columns, 'view' => $view, 'calendarDate' => ($state['calendarDate'] ?? null) === 'updated' ? 'updated' : 'published'];
    }

    /** As it is answered: with nothing narrowing the list, `query` is still an object. */
    private static function public(array $view): array
    {
        return [...$view, 'state' => [...$view['state'], 'query' => (object) $view['state']['query']]];
    }
}

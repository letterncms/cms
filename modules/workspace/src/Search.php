<?php

declare(strict_types=1);

namespace Cms\Modules\Workspace;

use Cms\Abilities\AbilityContext;
use Cms\Admin\Translations;
use Cms\Cms;
use Cms\Users\User;
use Throwable;

/**
 * Search without AI: the places, entries and people a person may see that match what they
 * typed, and whatever plugins add through the `workspace.search` filter
 * (fn (array $sections, string $query, User $user): array, each section
 * {id, title, items: list<{label, detail?, icon?, to}>}). Fast, and no tokens.
 */
final class Search
{
    public const int PER_SECTION = 8;

    public function __construct(private readonly Cms $cms) {}

    /** @return array{query: string, sections: list<array{id: string, title: string, items: list<array>}>} */
    public function run(string $query, User $user): array
    {
        $query = trim($query);
        $sections = [];
        $context = AbilityContext::forUser($user, 'admin');

        $sections[] = ['id' => 'places', 'title' => __('Places'), 'items' => $this->places($query, $user)];

        $sections[] = ['id' => 'entries', 'title' => __('Content'), 'items' => $this->quietly(function () use ($query, $context) {
            if (mb_strlen($query) < 2 || ! $this->cms->abilities()->has('content/search')) {
                return [];
            }
            $collections = $this->cms->collections()->all();

            return array_map(static fn (array $entry) => [
                'label' => (string) $entry['title'],
                'detail' => trim(($collections[$entry['collection']]->singular ?? $entry['collection']).(isset($entry['uri']) ? ' · '.$entry['uri'] : '')),
                'icon' => $collections[$entry['collection']]->icon ?? 'file',
                'to' => '/content/'.$entry['collection'].'/'.rawurlencode((string) $entry['id']),
            ], (array) $this->cms->abilities()->execute('content/search', ['query' => $query, 'limit' => self::PER_SECTION], $context));
        })];

        $sections[] = ['id' => 'people', 'title' => __('People'), 'items' => $this->quietly(function () use ($query, $user, $context) {
            if (mb_strlen($query) < 2 || ! $user->hasPermission('users.view') || ! $this->cms->abilities()->has('users/list')) {
                return [];
            }

            return array_map(static fn (array $person) => [
                'label' => (string) $person['name'], 'detail' => (string) ($person['email'] ?? ''), 'icon' => 'user', 'to' => '/users/'.rawurlencode((string) $person['id']),
            ], (array) ($this->cms->abilities()->execute('users/list', ['search' => $query, 'kind' => 'all', 'perPage' => self::PER_SECTION], $context)['items'] ?? []));
        })];

        $sections = $this->quietly(fn () => $this->cms->hooks()->filter('workspace.search', $sections, $query, $user), $sections);

        return ['query' => $query, 'sections' => array_values(array_filter(array_map(self::section(...), array_filter($sections, 'is_array')), static fn (array $s) => $s['items'] !== []))];
    }

    /** Screens and settings pages by their names, best match first. */
    private function places(string $query, User $user): array
    {
        if ($query === '') {
            return [];
        }

        $t = $this->cms->app()->make(Translations::class);
        $nav = $this->cms->adminNav()->forUser($user)['nav'];
        $names = array_column(array_map(static fn ($n) => [$n['id'], $t->label($n['label'])], $nav), 1, 0);
        $term = mb_strtolower($query);
        $found = [];

        foreach ($nav as $item) {
            $label = $names[$item['id']];
            // A screen's own settings go by the screen's name.
            if (! empty($item['home']) && str_starts_with((string) $item['id'], 'settings.')) {
                $label = __(':name Settings', ['name' => $names[$item['home']] ?? $label]);
            }
            $name = mb_strtolower($label);
            $score = match (true) {
                $name === $term => 3,
                str_starts_with($name, $term) => 2,
                str_contains($name, $term) => 1,
                default => 0,
            };
            if ($score > 0 && ($to = Answers::place($item['path'] ?? null))) {
                $found[] = ['score' => $score, 'label' => $label, 'icon' => $item['icon'] ?? 'file', 'to' => $to];
            }
        }

        usort($found, static fn ($a, $b) => $b['score'] <=> $a['score'] ?: strnatcasecmp($a['label'], $b['label']));

        return array_map(static fn ($p) => array_diff_key($p, ['score' => 1]), array_slice($found, 0, 6));
    }

    /** A section as the answer draws it: lines that each lead to a place of the admin. */
    private static function section(array $section): array
    {
        $items = [];

        foreach (array_filter((array) ($section['items'] ?? []), 'is_array') as $item) {
            if (($to = Answers::place($item['to'] ?? null)) !== null && trim((string) ($item['label'] ?? '')) !== '') {
                $items[] = array_filter(['label' => (string) $item['label'], 'detail' => isset($item['detail']) ? (string) $item['detail'] : null, 'icon' => isset($item['icon']) ? (string) $item['icon'] : null, 'to' => $to], static fn ($v) => $v !== null && $v !== '');
            }
        }

        return ['id' => (string) ($section['id'] ?? 'more'), 'title' => (string) ($section['title'] ?? ''), 'items' => array_slice($items, 0, self::PER_SECTION)];
    }

    /** One section that fails leaves the rest. */
    private function quietly(\Closure $find, array $otherwise = []): array
    {
        try {
            return (array) $find();
        } catch (Throwable $e) {
            report($e);

            return $otherwise;
        }
    }
}

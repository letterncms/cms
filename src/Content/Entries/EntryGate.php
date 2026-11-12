<?php

declare(strict_types=1);

namespace Cms\Content\Entries;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Cms\Cms;
use Cms\Content\Collections\Collection;
use Cms\Content\Fields\FieldTypeRegistry;
use Cms\Extend\Hooks;
use Cms\Support\Files;
use Cms\Users\Accounts;
use Cms\Users\User;

/**
 * Who may read an entry. The rule is the `gate` key of an entry's data, or of its collection's
 * YAML: `{mode: teaser, access: [magazine], teaser_words: 120, teaser_fields: [excerpt]}`.
 * An entry without one follows its translation's origin, then its parent, then its collection.
 *
 *   public  everyone
 *   teaser  everyone reads the start; holders read everything
 *   locked  holders only; left out of every list, and never in a static build
 *
 * `access` empty means any signed-in account. It lives in the core and in the query path, not at
 * each surface, so a list, feed, API or plugin that reads `live()` entries can't leak, and with
 * the users module off a gated entry stays closed.
 */
final class EntryGate
{
    public const string FULL = 'full';

    public const string TEASER = 'teaser';

    public const string SIGN_IN = 'sign-in';

    public const string DENIED = 'denied';

    public const string MISSING = 'missing';

    public const array MODES = ['inherit', 'public', 'teaser', 'locked'];

    private const array ALWAYS_PUBLIC = ['seo', 'template'];

    /** @var array<string, array{mode: string, access: list<string>, words: int, fields: list<string>}>|null */
    private ?array $index = null;

    /** @var array<string, list<string>> viewer id => hidden entry ids */
    private array $hidden = [];

    public function __construct(private readonly Cms $cms, private readonly Hooks $hooks, private readonly FileDriver $files) {}

    public function listen(): void
    {
        foreach (['entry.saved', 'entry.published', 'entry.unpublished', 'entry.deleted', 'entry.structure-changed', 'collection.saved', 'collection.deleted'] as $event) {
            $this->hooks->on($event, fn () => $this->forget());
        }

        // A change in who may read what changes which pages may exist as files: the next PHP request rebuilds.
        $this->hooks->addFilter('site.build.signature', fn (array $parts) => [...$parts, 'gate' => md5((string) json_encode($this->index()))]);
    }

    public function forget(): void
    {
        $this->index = null;
        $this->hidden = [];
        @unlink($this->file());
    }

    /** The rule this entry falls under, or null when it is public. */
    public function rule(Entry $entry): ?array
    {
        return $this->index()[$entry->id] ?? null;
    }

    public function isGated(Entry $entry): bool
    {
        return $this->rule($entry) !== null;
    }

    /** What this request gets to see of an entry. */
    public function decide(Entry $entry): string
    {
        $rule = $this->rule($entry);

        return match (true) {
            $rule === null, $this->allows($entry, $rule) => self::FULL,
            $rule['mode'] === 'teaser' => self::TEASER,
            ! $this->accounts()->enabled() => self::MISSING,
            $this->viewer() === null => self::SIGN_IN,
            default => self::DENIED,
        };
    }

    /**
     * The entry as this request may read it: unchanged when public, the start of it for a teaser,
     * nothing but its title when locked. The copy can't be saved: see {@see EntryRepository::save()}.
     */
    public function view(Entry $entry): Entry
    {
        if ($entry->gated !== null || ($rule = $this->rule($entry)) === null) {
            return $entry;
        }

        $view = clone $entry;
        $view->draft = null;
        unset($view->data['gate']);

        if ($this->allows($entry, $rule)) {
            $view->gated = self::FULL;

            return $view;
        }

        $view->data = $rule['mode'] === 'teaser' ? $this->teaser($entry, $rule) : [];
        $view->gated = $rule['mode'] === 'teaser' ? self::TEASER : 'locked';

        return $view;
    }

    /** @return list<string> Entries this request may not even list. */
    public function hiddenIds(): array
    {
        $key = (string) Auth::id();

        return $this->hidden[$key] ??= array_keys(array_filter($this->lockedEntries(), fn (array $pair) => ! $this->allows($pair[0], $pair[1])));
    }

    /** @return list<string> Entries that read differently for those who hold access. */
    public function teaserIds(): array
    {
        return array_keys(array_filter($this->index(), static fn (array $rule) => $rule['mode'] === 'teaser'));
    }

    private function allows(Entry $entry, array $rule): bool
    {
        $user = $this->viewer();

        if ($user === null) {
            return false;
        }

        $allowed = $user->hasPermission("entries.{$entry->collection}.view") || $rule['access'] === [] || $this->accounts()->holdsAny($user, $rule['access']);

        return (bool) $this->hooks->filter('gate.allows', $allowed, $user, $entry, $rule);
    }

    private function viewer(): ?User
    {
        return $this->accounts()->current();
    }

    private function accounts(): Accounts
    {
        return $this->cms->accounts();
    }

    /** Only what is meant to be public: an allow-list, so a new field is never out in the open by accident. */
    private function teaser(Entry $entry, array $rule): array
    {
        $data = array_intersect_key($entry->data, array_flip([...self::ALWAYS_PUBLIC, ...$rule['fields']]));
        $field = $entry->body();

        if ($field && array_key_exists($field->handle, $entry->data)) {
            $data[$field->handle] = $this->cms->app()->make(FieldTypeRegistry::class)->resolve($field->type)->teaser($entry->data[$field->handle], $field, $rule['words']);
        }

        return $data;
    }

    /** @return array<string, array{0: Entry, 1: array}> */
    private function lockedEntries(): array
    {
        $locked = array_filter($this->index(), static fn (array $rule) => $rule['mode'] === 'locked');
        $out = [];

        foreach ($locked === [] ? [] : $this->cms->entries()->findMany(array_keys($locked)) as $entry) {
            $out[$entry->id] = [$entry, $locked[$entry->id]];
        }

        return $out;
    }

    /** @return array<string, array> Every gated entry, whatever its date, so a scheduled one is closed before it goes live. */
    private function index(): array
    {
        if ($this->index !== null) {
            return $this->index;
        }

        $signature = $this->signature();
        $cached = Files::readJson($this->file());

        if (($cached['signature'] ?? null) === $signature) {
            return $this->index = (array) $cached['entries'];
        }

        $entries = [];

        foreach ($this->collections() as $collection) {
            $entries += $this->collectionRules($collection);
        }

        try {
            Files::putJson($this->file(), ['signature' => $signature, 'entries' => $entries], 0);
        } catch (\Throwable) {
            // The file only saves work.
        }

        return $this->index = $entries;
    }

    /** @return array<string, Collection> */
    private function collections(): array
    {
        return array_filter($this->cms->collections()->all(), static fn (Collection $c) => $c->routable());
    }

    private function collectionRules(Collection $collection): array
    {
        $fallback = self::normalize($collection->get('gate'));
        $query = fn () => $this->cms->entries()->query()->collection($collection->handle)->ungated();

        // Nearly every site gates nothing, and it should cost nearly nothing.
        if ($fallback === null && $query()->where('gate.mode', 'not null', null)->where('gate.mode', '!=', 'inherit')->count() === 0) {
            return [];
        }

        $all = [];

        foreach ($query()->get() as $entry) {
            $all[$entry->id] = $entry;
        }

        $resolved = [];
        $resolve = function (string $id, int $depth = 0) use (&$resolve, &$resolved, $all, $fallback): ?array {
            if (array_key_exists($id, $resolved)) {
                return $resolved[$id];
            }

            $entry = $all[$id] ?? null;
            $own = $entry ? self::normalize($entry->data['gate'] ?? null) : null;

            if ($own !== null) {
                return $resolved[$id] = $own;
            }

            foreach ($entry && $depth < 32 ? [$entry->originId, $entry->parentId] : [] as $next) {
                if ($next !== null && isset($all[$next]) && ($rule = $resolve($next, $depth + 1)) !== null) {
                    return $resolved[$id] = $rule;
                }
            }

            return $resolved[$id] = $fallback;
        };

        $out = [];

        foreach ($all as $id => $entry) {
            $rule = $resolve($id);

            if ($entry->status === 'published' && $rule !== null && $rule['mode'] !== 'public') {
                $out[$id] = $rule;
            }
        }

        return $out;
    }

    /** A stored rule in full, or null when it says nothing (`inherit`, or not a rule at all). */
    private static function normalize(mixed $gate): ?array
    {
        if (! is_array($gate) || ! in_array($gate['mode'] ?? null, self::MODES, true) || $gate['mode'] === 'inherit') {
            return null;
        }

        return [
            'mode' => $gate['mode'],
            'access' => array_values(array_filter(array_map('strval', (array) ($gate['access'] ?? [])), static fn (string $a) => $a !== '')),
            'words' => max(0, (int) ($gate['teaser_words'] ?? 120)),
            'fields' => array_values(array_map('strval', (array) ($gate['teaser_fields'] ?? []))),
        ];
    }

    /** Changes when a deploy changes files or YAML, which fires no event. */
    private function signature(): string
    {
        $parts = [];

        foreach ($this->collections() as $collection) {
            $parts[] = [$collection->handle, $collection->get('gate'), $collection->driver === 'files' ? $this->files->signature($collection) : null];
        }

        $database = DB::table('entries')->selectRaw('count(*) as n, max(updated_at) as t')->first();

        return md5((string) json_encode([$parts, $database?->n, $database?->t]));
    }

    private function file(): string
    {
        return storage_path('cache/gate-index.json');
    }
}

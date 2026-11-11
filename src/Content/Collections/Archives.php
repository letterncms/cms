<?php

declare(strict_types=1);

namespace Cms\Content\Collections;

use Cms\Content\Entries\Entry;
use Cms\Content\Entries\EntryQuery;
use Cms\Content\Entries\EntryRepository;
use Cms\Extend\Hooks;

/**
 * Term archives: the pages that list a collection's entries filed under one term of a taxonomy.
 * A collection says which taxonomies get one, and at which address:
 *
 *   archives:
 *     topics: /blog/topics/{slug}
 *     places: { route: /blog/places/{slug}, routes: { de: /blog/orte/{slug} } }
 *
 * `{slug}` is the term's slug, `{id}` its id. Every term of the taxonomy has such an address in its
 * own language, with the language's prefix like any page. This class knows the addresses: which there
 * are, what is at one, and what they would collide with. The site module draws and builds the pages.
 */
final class Archives
{
    /** @var array<string, array{collection: string, taxonomy: string, term: string, locale: string, uri: string}>|null by "locale uri" */
    private ?array $index = null;

    /** @var array<string, string> uri => the first "locale uri" key at it */
    private array $byUri = [];

    /** @var array<string, Entry> the terms the index was made from, by id */
    private array $terms = [];

    /** Addresses that belong to the CMS itself: no archive goes there. */
    private const array RESERVED = ['/api', '/admin', '/media', '/_cms'];

    public function __construct(
        private readonly CollectionRepository $collections,
        private readonly EntryRepository $entries,
        private readonly Hooks $hooks,
    ) {}

    /** Something an address is made of changed (a term, a collection). */
    public function flush(): void
    {
        $this->index = null;
        $this->byUri = $this->terms = [];
    }

    /** A term the archives were worked out from, without asking the repository again; null when it has none. */
    public function term(string $id): ?Entry
    {
        $this->index();

        return $this->terms[strtolower($id)] ?? null;
    }

    /**
     * The fields of a collection that file its entries under terms of this taxonomy: its terms fields for it, in
     * every blueprint, by their path in the data. A link in a body names a term but files nothing.
     *
     * @return list<string>
     */
    public function fields(Collection $collection, string $taxonomy): array
    {
        $out = [];

        foreach ([null, ...array_keys($collection->blueprints())] as $name) {
            foreach ($collection->blueprint($name)->relations() as $path => $field) {
                $field->type === 'terms' && $field->get('taxonomy') === $taxonomy && $out[] = $path;
            }
        }

        return array_values(array_unique($out));
    }

    /**
     * The entries of these collections filed under a term, live, in the term's language: only through their
     * terms fields for its taxonomy.
     *
     * @param  list<string>  $collections
     */
    public function filed(Entry $term, array $collections): EntryQuery
    {
        $fields = [];

        foreach ($collections as $handle) {
            ($collection = $this->collections->find($handle)) && array_push($fields, ...$this->fields($collection, $term->collection));
        }

        return $this->entries->query()->collection(...$collections)->locale($term->locale)->live()->references($term->id, array_values(array_unique($fields)));
    }

    /** The address of a term's archive in a collection, or null when that collection has none for the term's taxonomy. */
    public function uri(Collection $collection, Entry $term): ?string
    {
        $pattern = $collection->archiveRoute($term->collection, $term->locale);

        if ($pattern === null) {
            return null;
        }

        $uri = strtr($pattern, ['{slug}' => $term->slug, '{id}' => $term->id]);
        $uri = '/'.trim((string) preg_replace('#/+#', '/', $uri), '/');

        // The language's prefix, as every page of that language has it.
        return (string) $this->hooks->filter('entry.uri', $uri, $term, $collection);
    }

    /**
     * Every archive of one term: one per collection that archives its taxonomy.
     *
     * @return list<array{collection: string, taxonomy: string, term: string, locale: string, uri: string}>
     */
    public function of(Entry $term): array
    {
        $out = [];

        foreach ($this->collections->all() as $collection) {
            if (($uri = $this->uri($collection, $term)) !== null) {
                $out[] = ['collection' => $collection->handle, 'taxonomy' => $term->collection, 'term' => $term->id, 'locale' => $term->locale, 'uri' => $uri];
            }
        }

        return $out;
    }

    /**
     * Every archive address there is, whatever the term's status: who asks decides what a draft is worth.
     *
     * @return list<array{collection: string, taxonomy: string, term: string, locale: string, uri: string}>
     */
    public function all(): array
    {
        return array_values($this->index());
    }

    /** @return array{collection: string, taxonomy: string, term: string, locale: string, uri: string}|null What is at this address, in this language when one is given. */
    public function at(string $uri, ?string $locale = null): ?array
    {
        $uri = '/'.trim($uri, '/');
        $index = $this->index();

        return $index[$locale !== null ? $locale.' '.$uri : ($this->byUri[$uri] ?? '')] ?? null;
    }

    /**
     * Why a collection's archives cannot be as its definition has them, or null when they can: a taxonomy that
     * is none, a pattern without the term in it, or an address an entry or another archive already has.
     */
    public function problem(Collection $candidate): ?string
    {
        foreach ($candidate->archives() as $taxonomy => $archive) {
            $terms = $this->collections->find($taxonomy);

            if (! $terms?->isTaxonomy() || $taxonomy === $candidate->handle) {
                return __('“:taxonomy” is not a taxonomy to archive by.', ['taxonomy' => $taxonomy]);
            }

            foreach ([$archive['route'], ...array_values($archive['routes'])] as $pattern) {
                if (! str_starts_with($pattern, '/') || (! str_contains($pattern, '{slug}') && ! str_contains($pattern, '{id}')) || preg_match('/\{(?!slug\}|id\})/', $pattern)) {
                    return __('An archive’s URL starts with / and has the term in it: /blog/topics/{slug}.');
                }

                // Nothing a browser reads as something else, and no address of the CMS's own.
                $reserved = array_filter(self::RESERVED, static fn (string $prefix) => strtolower(rtrim($pattern, '/')) === $prefix || str_starts_with(strtolower($pattern), $prefix.'/'));

                if (str_contains($pattern, '..') || str_contains($pattern, '#') || str_contains($pattern, '?') || str_contains($pattern, '\\') || $reserved !== []) {
                    return __('The archive URL :uri is not one an archive can have: it may not start with :reserved, nor hold .., # or ?.', ['uri' => $pattern, 'reserved' => implode(', ', self::RESERVED)]);
                }
            }

            foreach ($this->entries->query()->ungated()->collection($taxonomy)->get() as $term) {
                $uri = $this->uri($candidate, $term);

                if ($uri === null) {
                    continue;
                }

                if ($clash = $this->entries->findByUri($uri, $term->locale)) {
                    return __('The archive URL :uri is already used by “:title”.', ['uri' => $uri, 'title' => $clash->title]);
                }

                foreach ($this->index() as $other) {
                    if ($other['uri'] === $uri && $other['locale'] === $term->locale && ($other['collection'] !== $candidate->handle || $other['term'] !== $term->id)) {
                        return __('The archive URL :uri is already used by another archive.', ['uri' => $uri]);
                    }
                }
            }
        }

        return null;
    }

    /** @return array<string, array{collection: string, taxonomy: string, term: string, locale: string, uri: string}> */
    private function index(): array
    {
        if ($this->index !== null) {
            return $this->index;
        }

        $index = [];
        $terms = [];

        foreach ($this->collections->all() as $collection) {
            foreach (array_keys($collection->archives()) as $taxonomy) {
                $terms[$taxonomy] ??= $this->collections->find($taxonomy)?->isTaxonomy() ? $this->entries->query()->ungated()->collection($taxonomy)->get() : [];

                foreach ($terms[$taxonomy] as $term) {
                    $this->terms[strtolower($term->id)] = $term;

                    if (($uri = $this->uri($collection, $term)) !== null) {
                        $index[$term->locale.' '.$uri] ??= ['collection' => $collection->handle, 'taxonomy' => $taxonomy, 'term' => $term->id, 'locale' => $term->locale, 'uri' => $uri];
                        $this->byUri[$uri] ??= $term->locale.' '.$uri;
                    }
                }
            }
        }

        return $this->index = $index;
    }
}

<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use InvalidArgumentException;
use Cms\Content\Collections\Collection;
use Cms\Content\Collections\CollectionRepository;
use Cms\Content\Entries\EntryRepository;
use Cms\Content\Entries\EntryService;
use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldTypeRegistry;

/**
 * Terms of a taxonomy (`taxonomy: topics`): a relation to the entries of a collection of categories or tags. It
 * stores ids like any relation, so a term can be renamed, translated, nested and given a page. A term can also
 * be given by its slug or title, in the language of the entry being written: it is stored as its id. A name no
 * tag has yet becomes a new tag as the entry is saved, when the person writing may make tags (EntryService::tag()).
 */
class Terms extends Entries
{
    public function key(): string { return 'terms'; }

    public function label(): string { return __('Terms'); }

    public function icon(): string { return 'tag'; }

    public function description(): string { return __('Categories or tags of a taxonomy.'); }

    public function component(): string { return 'terms'; }

    public function schema(Field $field): array
    {
        $taxonomy = $this->taxonomy($field);
        // For agents, so in English like every schema.
        $about = $field->description().' (ids of terms of the taxonomy '.$field->get('taxonomy').', see terms/list; a slug or title of an existing term is taken too'
            .($taxonomy?->isTags() ? ', and a name no tag has yet makes a new tag' : '').')';

        return array_filter([
            'type' => 'array',
            // No format: a slug or a title is taken too, and what names no term is refused by name (check()).
            'items' => ['type' => 'string', 'minLength' => 1],
            'maxItems' => $field->get('max'),
            'description' => $about,
        ], static fn ($v) => $v !== null);
    }

    /**
     * A term given by its slug or title becomes its id when exactly one term of the record's language has it. A name
     * that no tag has becomes the id of the tag the entry's save makes (EntryService::tag()).
     */
    public function normalize(mixed $value, Field $field): mixed
    {
        $values = parent::normalize(is_string($value) ? [$value] : $value, $field);
        $taxonomy = $this->taxonomy($field);
        $max = $field->get('max');
        $out = [];

        foreach ($values as $term) {
            if (! is_string($term) || preg_match('/^[0-9a-z]{26}$/', $term)) {
                $out[] = $term;

                continue;
            }

            $term = trim(strip_tags($term));
            $found = $term === '' ? [] : $this->named($term, $taxonomy);
            $locale = app(FieldTypeRegistry::class)->locale;

            $term === '' || $out[] = match (true) {
                count($found) === 1 => $found[0],
                // No tag is made that the field could not hold.
                $found === [] && $taxonomy?->isTags() && $locale !== null && ($max === null || count($out) < (int) $max) => app(EntryService::class)->tag($taxonomy, $term, $locale) ?? $term,
                default => $term,
            };
        }

        return array_values(array_unique($out));
    }

    /** What is left that is no id names no term, or more than one: nested terms can share a name. */
    public function check(mixed $value, Field $field, mixed $previous = null): array
    {
        $errors = parent::check($value, $field, $previous);
        $taxonomy = $this->taxonomy($field);

        foreach (array_filter((array) $value, 'is_string') as $i => $term) {
            if (! preg_match('/^[0-9a-z]{26}$/', $term) && isset($errors[(string) $i])) {
                $errors[(string) $i] = match (true) {
                    count($this->named($term, $taxonomy)) > 1 => __('Several terms are called “:term”. Give the id of the one you mean.', ['term' => $term]),
                    (bool) $taxonomy?->isTags() => __('There is no tag “:term”, and you may not add tags.', ['term' => $term]),
                    default => __('There is no term “:term” in this language.', ['term' => $term]),
                };
            }
        }

        return $errors;
    }

    /** @return list<string> The ids of the terms with this slug, or else this title, in the language of the record being written. */
    private function named(string $term, ?Collection $taxonomy): array
    {
        if ($taxonomy === null || $term === '' || preg_match('/^[0-9a-z]{26}$/', $term)) {
            return [];
        }

        $locale = app(FieldTypeRegistry::class)->locale ?? (string) config('app.locale', 'en');
        $terms = app(EntryRepository::class)->query()->working()->ungated()->collection($taxonomy->handle)->locale($locale)->get();
        $ids = static fn (callable $is): array => array_values(array_map(static fn ($e) => $e->id, array_filter($terms, $is)));
        $lower = mb_strtolower($term);

        return $ids(static fn ($e) => $e->working()['slug'] === $term) ?: $ids(static fn ($e) => mb_strtolower((string) $e->working()['title']) === $lower);
    }

    /** The taxonomy the field picks from, when it names one. */
    private function taxonomy(Field $field): ?Collection
    {
        $handle = $field->get('taxonomy');
        $collection = is_string($handle) && $handle !== '' ? app(CollectionRepository::class)->find($handle) : null;

        return $collection?->isTaxonomy() ? $collection : null;
    }

    public function collections(Field $field): array
    {
        return is_string($taxonomy = $field->get('taxonomy')) && $taxonomy !== '' ? [$taxonomy] : [];
    }

    /** What the admin's picker needs to know: the taxonomy to pick from, and whether a typed name makes a new tag. */
    public function definition(array $definition): array
    {
        $taxonomy = app(CollectionRepository::class)->find((string) ($definition['taxonomy'] ?? ''));

        return [...$definition, 'collections' => array_values(array_filter([(string) ($definition['taxonomy'] ?? '')])), 'tags' => (bool) $taxonomy?->isTags()];
    }

    public function validateDefinition(Field $field, string $name, int $depth): void
    {
        if ($this->taxonomy($field) === null) {
            throw new InvalidArgumentException(__('The taxonomy of :field must be a collection of categories or tags.', ['field' => $name]));
        }
    }

    public function configFields(): array
    {
        return [
            ['handle' => 'taxonomy', 'type' => 'select', 'label' => 'Taxonomy', 'required' => true, 'options' => array_map(
                static fn ($c) => $c->title,
                array_filter(app(CollectionRepository::class)->all(), static fn ($c) => $c->isTaxonomy())
            )],
            ['handle' => 'max', 'type' => 'number', 'label' => 'Maximum'],
        ];
    }
}

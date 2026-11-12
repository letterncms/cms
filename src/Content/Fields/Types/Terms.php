<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use InvalidArgumentException;
use Cms\Content\Collections\CollectionRepository;
use Cms\Content\Entries\EntryRepository;
use Cms\Content\Fields\Field;

/**
 * Terms of a taxonomy: a relation to the entries of one collection that is marked `taxonomy: true`
 * (`taxonomy: topics`). It stores ids like any relation, so a term can be renamed, translated, nested and
 * given a page. A term can also be given by its slug or title: it is stored as its id.
 *
 * `tags` stays for free words that are nothing but words.
 */
class Terms extends Entries
{
    public function key(): string { return 'terms'; }

    public function label(): string { return __('Terms'); }

    public function icon(): string { return 'tag'; }

    public function description(): string { return __('Terms of a taxonomy: categories, topics, places.'); }

    /** The admin picks terms as it picks entries. */
    public function component(): string { return 'entries'; }

    public function schema(Field $field): array
    {
        // For agents, so in English like every schema.
        $about = $field->description().' (ids of terms of the taxonomy '.$field->get('taxonomy').', see terms/list; a slug or title of an existing term is taken too)';

        return array_filter([
            'type' => 'array',
            // No format: a slug or a title is taken too, and what names no term is refused by name (check()).
            'items' => ['type' => 'string', 'minLength' => 1],
            'maxItems' => $field->get('max'),
            'description' => $about,
        ], static fn ($v) => $v !== null);
    }

    /** A term given by its slug or title becomes its id when exactly one term of the record's language has it. */
    public function normalize(mixed $value, Field $field): mixed
    {
        return array_values(array_unique(array_map(
            fn (string $term): string => count($found = $this->named($term, $field)) === 1 ? $found[0] : $term,
            parent::normalize(is_string($value) ? [$value] : $value, $field),
        )));
    }

    /** What is left that is no id names no term, or more than one: nested terms can share a name. */
    public function check(mixed $value, Field $field, mixed $previous = null): array
    {
        $errors = parent::check($value, $field, $previous);

        foreach (array_filter((array) $value, 'is_string') as $i => $term) {
            if (! preg_match('/^[0-9a-z]{26}$/', $term) && isset($errors[(string) $i])) {
                $errors[(string) $i] = count($this->named($term, $field)) > 1
                    ? __('Several terms are called “:term”. Give the id of the one you mean.', ['term' => $term])
                    : __('There is no term “:term” in this language.', ['term' => $term]);
            }
        }

        return $errors;
    }

    /** @return list<string> The ids of the terms with this slug, or else this title, in the language of the record being written. */
    private function named(string $term, Field $field): array
    {
        $taxonomy = (string) $field->get('taxonomy');

        if ($taxonomy === '' || $term === '' || preg_match('/^[0-9a-z]{26}$/', $term)) {
            return [];
        }

        $locale = app(\Cms\Content\Fields\FieldTypeRegistry::class)->locale ?? (string) config('app.locale', 'en');
        $terms = app(EntryRepository::class)->query()->working()->ungated()->collection($taxonomy)->locale($locale)->get();
        $ids = static fn (callable $is): array => array_values(array_map(static fn ($e) => $e->id, array_filter($terms, $is)));
        $lower = mb_strtolower($term);

        return $ids(static fn ($e) => $e->working()['slug'] === $term) ?: $ids(static fn ($e) => mb_strtolower((string) $e->working()['title']) === $lower);
    }

    public function collections(Field $field): array
    {
        return is_string($taxonomy = $field->get('taxonomy')) && $taxonomy !== '' ? [$taxonomy] : [];
    }

    /** What the admin's entry picker needs to know: the collection to pick from. */
    public function definition(array $definition): array
    {
        return [...$definition, 'collections' => array_values(array_filter([(string) ($definition['taxonomy'] ?? '')]))];
    }

    public function validateDefinition(Field $field, string $name, int $depth): void
    {
        $taxonomy = $field->get('taxonomy');
        $collection = is_string($taxonomy) ? app(CollectionRepository::class)->find($taxonomy) : null;

        if (! $collection?->isTaxonomy()) {
            throw new InvalidArgumentException(__('The taxonomy of :field must be a collection that is a taxonomy.', ['field' => $name]));
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

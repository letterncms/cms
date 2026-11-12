<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Entries\EntryRepository;
use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;
use Cms\Extend\Hooks;

/**
 * A link to one of five things, with its words: `{type, value, label?, new_tab?}`.
 *
 *   entry  value: an entry's id — follows the page when it moves
 *   url    value: an address, a path or an anchor
 *   email  value: an address — becomes mailto:
 *   phone  value: a number — becomes tel:
 *   media  value: a file's id — its download address
 *
 * `url` (the plain text type) stays for a bare address.
 */
class Link extends FieldType
{
    public const array KINDS = ['entry', 'url', 'email', 'phone', 'media'];

    private const string PHONE = '^\\+?[0-9][0-9 ().\\-/]{2,39}$';

    public function key(): string { return 'link'; }

    public function label(): string { return __('Link'); }

    public function description(): string { return __('A link to a page, an address, an email, a phone number or a file, with its label.'); }

    public function icon(): string { return 'link'; }

    /** `link` is the admin's picker for an address kept as text (`url` fields); this value has an editor of its own. */
    public function component(): string { return 'link-value'; }

    public function schema(Field $field): array
    {
        $value = static fn (array $rule) => ['properties' => ['value' => $rule]];
        $formats = [
            'entry' => $value(['format' => 'ulid']),
            'url' => $value(['format' => 'uri-reference']),
            'email' => $value(['format' => 'email']),
            'phone' => $value(['pattern' => self::PHONE]),
            'media' => $value(['format' => 'ulid']),
        ];
        $kinds = $this->kinds($field);
        // For agents, so in English like every schema.
        $about = $field->description().' — {type, value}: entry (value: an entry id'.($field->get('collections') ? ' from '.implode(', ', (array) $field->get('collections')) : '').'), url (an address, /path or #anchor), email, phone, media (a media id). A string is read as one: https://…, /path, entry:<id>, mailto:…, tel:….';

        return $this->nullable([
            'type' => 'object',
            'properties' => [
                'type' => ['type' => 'string', 'enum' => $kinds],
                'value' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 2048],
                'label' => ['type' => ['string', 'null'], 'maxLength' => 500],
                'new_tab' => ['type' => 'boolean'],
            ],
            'required' => ['type', 'value'],
            'additionalProperties' => false,
            'allOf' => array_values(array_map(static fn (string $kind) => ['if' => ['properties' => ['type' => ['const' => $kind]], 'required' => ['type']], 'then' => $formats[$kind]], $kinds)),
            'description' => $about,
        ], $field);
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        if (is_string($value)) {
            $value = trim($value);
            $value = match (true) {
                $value === '' => null,
                str_starts_with($value, 'entry:') => ['type' => 'entry', 'value' => substr($value, 6)],
                str_starts_with($value, 'mailto:') => ['type' => 'email', 'value' => substr($value, 7)],
                str_starts_with($value, 'tel:') => ['type' => 'phone', 'value' => substr($value, 4)],
                default => ['type' => 'url', 'value' => $value],
            };
        }

        if (! is_array($value)) {
            return $value;
        }

        if (! is_scalar($value['value'] ?? '')) {
            return $value; // Not a link: validation says so.
        }

        if (trim((string) ($value['value'] ?? '')) === '') {
            return null;
        }

        $kind = $value['type'] ?? 'url';
        $target = trim((string) $value['value']);
        $target = match ($kind) {
            'entry', 'media' => preg_match('/^[0-9a-z]{26}$/i', $target) ? strtolower($target) : $target,
            'email' => strtolower($target),
            default => $target,
        };
        $label = is_string($value['label'] ?? null) ? trim($value['label']) : '';

        // Whatever else was sent stays, for validation to name.
        return array_filter(['type' => $kind, 'value' => $target, 'label' => $label !== '' ? $label : null, 'new_tab' => ! empty($value['new_tab']) ?: null, ...array_diff_key($value, array_flip(['type', 'value', 'label', 'new_tab']))], static fn ($v) => $v !== null);
    }

    /** An entry or a file that is named must be there. */
    public function check(mixed $value, Field $field, mixed $previous = null): array
    {
        // The same link as before is not judged again.
        if (! is_array($value) || (is_array($previous) && ($previous['type'] ?? null) === ($value['type'] ?? null) && ($previous['value'] ?? null) === ($value['value'] ?? null))) {
            return [];
        }

        if (($value['type'] ?? '') === 'entry') {
            $collection = app(\Cms\Content\Entries\EntryService::class)->known([(string) $value['value']])[(string) $value['value']] ?? null;
            $takes = array_values(array_filter((array) $field->get('collections'), 'is_string'));

            return match (true) {
                $collection === null => ['value' => __('This entry does not exist.')],
                $takes !== [] && ! in_array($collection, $takes, true) => ['value' => __('Must be an entry of: :collections.', ['collections' => implode(', ', $takes)])],
                default => [],
            };
        }

        if (($value['type'] ?? '') === 'media' && $this->file((string) $value['value']) === null) {
            return ['value' => __('This file does not exist.')];
        }

        return [];
    }

    /**
     * For templates: the link with where it leads (`url`, null when the page is not published or the file is gone)
     * and a `label` that falls back to the page's title, the file's name or the address (empty when the page is a draft or gone and the link has no label of its own).
     */
    public function augment(mixed $value, Field $field): mixed
    {
        if (! is_array($value) || ! isset($value['type'], $value['value'])) {
            return null;
        }

        $target = (string) $value['value'];
        $url = null;
        // An entry or a file is called by its name, never by its id: nothing when it is a draft or gone.
        $title = in_array($value['type'], ['entry', 'media'], true) ? '' : $target;

        switch ($value['type']) {
            case 'entry':
                $repository = app(EntryRepository::class);
                $entry = $repository->find($target);

                if ($entry && $entry->isLive() && ! in_array($entry->id, $repository->gate()->hiddenIds(), true)) {
                    [$url, $title] = [$entry->uri, $entry->title];
                }
                break;
            case 'media':
                $file = $this->file($target);
                [$url, $title] = [$file['url'] ?? null, (string) ($file['name'] ?? '')];
                break;
            case 'email':
                $url = 'mailto:'.$target;
                break;
            case 'phone':
                $url = 'tel:'.preg_replace('/[^0-9+]/', '', $target);
                break;
            default:
                $url = $target;
        }

        return ['type' => $value['type'], 'value' => $target, 'url' => $url, 'label' => (string) ($value['label'] ?? '') !== '' ? $value['label'] : $title, 'new_tab' => ! empty($value['new_tab'])];
    }

    public function toText(mixed $value, Field $field): string
    {
        return is_array($value) ? (string) ($value['label'] ?? '') : '';
    }

    public function configFields(): array
    {
        return [
            ['handle' => 'types', 'type' => 'select', 'label' => 'Link To', 'multiple' => true, 'options' => ['entry' => __('Page'), 'url' => __('Address'), 'email' => __('Email'), 'phone' => __('Phone||number'), 'media' => __('File')]],
            ['handle' => 'collections', 'type' => 'select', 'label' => 'Collections', 'multiple' => true, 'options' => array_map(
                static fn ($c) => $c->title,
                app(\Cms\Content\Collections\CollectionRepository::class)->all()
            )],
        ];
    }

    /** @return list<string> */
    private function kinds(Field $field): array
    {
        return array_values(array_intersect(self::KINDS, (array) $field->get('types', self::KINDS))) ?: self::KINDS;
    }

    /** The media library answers for its files (`fields.link.media`): {url, name}, or null when there is none. */
    private function file(string $id): ?array
    {
        $file = app(Hooks::class)->filter('fields.link.media', null, $id);

        return is_array($file) ? $file : null;
    }
}

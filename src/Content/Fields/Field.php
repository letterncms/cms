<?php

declare(strict_types=1);

namespace Cms\Content\Fields;

use InvalidArgumentException;

/** A configured field inside a blueprint. */
final readonly class Field
{
    /** @param array<string, mixed> $config Type-specific options */
    public function __construct(
        public string $handle,
        public string $type,
        public string $label,
        public string $instructions = '',
        public bool $required = false,
        public mixed $default = null,
        public array $config = [],
        public string $width = 'full',
        public string $section = 'main',
        /**
         * False: one value for every language. The original entry holds it and its translations follow
         * (see EntryService): for a price, a date, a picture. Read on the fields of a collection, not on nested ones.
         */
        public bool $localizable = true,
    ) {
        if (! preg_match('/^[a-z][a-z0-9_]{0,63}$/', $handle)) {
            throw new InvalidArgumentException(__('Invalid field handle ":handle": use lowercase letters, digits and underscores.', ['handle' => $handle]));
        }
    }

    public static function fromArray(array $data): self
    {
        $known = ['handle', 'type', 'label', 'instructions', 'required', 'default', 'width', 'section', 'localizable'];

        return new self(
            handle: (string) ($data['handle'] ?? ''),
            type: (string) ($data['type'] ?? 'text'),
            label: (string) ($data['label'] ?? ucfirst(str_replace('_', ' ', (string) ($data['handle'] ?? '')))),
            instructions: (string) ($data['instructions'] ?? ''),
            required: (bool) ($data['required'] ?? false),
            default: $data['default'] ?? null,
            config: array_diff_key($data, array_flip($known)),
            width: (string) ($data['width'] ?? 'full'),
            section: (string) ($data['section'] ?? 'main'),
            localizable: (bool) ($data['localizable'] ?? true),
        );
    }

    /**
     * When the field is on view: `if: {type: video}` or `if: {type: [video, audio], featured: true}`. Every field
     * named must hold the value, or one of the values listed. A required field with a condition is only required
     * while it holds.
     *
     * @return array<string, list<mixed>> Sibling handle => the values that count; empty: always.
     */
    public function condition(string $key = 'if'): array
    {
        $rule = $this->config[$key] ?? null;

        return is_array($rule) ? array_map(static fn (mixed $values) => is_array($values) ? array_values($values) : [$values], $rule) : [];
    }

    /** `required_if: {…}`: always on view, required while the condition holds. */
    public function requiredWhen(): array
    {
        return $this->condition('required_if');
    }

    /** Marked as its blueprint's body (`body: true`); Blueprint::body() says whether it is one. */
    public function isBody(): bool
    {
        return ($this->config['body'] ?? false) === true;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->config[$key] ?? $default;
    }

    /**
     * What the field is for, in the site's JSON Schemas, the API and to agents: its instructions, else its `about`
     * (said only there, where the admin's label and placeholder carry it), else its label.
     */
    public function description(): string
    {
        return $this->instructions ?: (is_string($this->config['about'] ?? null) && $this->config['about'] !== '' ? $this->config['about'] : $this->label);
    }

    public function toArray(): array
    {
        return array_filter([
            'handle' => $this->handle,
            'type' => $this->type,
            'label' => $this->label,
            'instructions' => $this->instructions ?: null,
            'required' => $this->required ?: null,
            'default' => $this->default,
            'width' => $this->width !== 'full' ? $this->width : null,
            'section' => $this->section !== 'main' ? $this->section : null,
            'localizable' => $this->localizable ? null : false,
            ...$this->config,
        ], static fn ($v) => $v !== null);
    }
}

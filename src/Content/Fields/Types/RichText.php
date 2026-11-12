<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;
use Cms\Support\Html\Sanitizer;

class RichText extends FieldType
{
    public function key(): string { return 'richtext'; }

    public function label(): string { return __('Rich Text'); }

    public function icon(): string { return 'richtext'; }

    public function description(): string { return __('Formatted text with headings, lists and links.'); }

    public function schema(Field $field): array
    {
        return $this->nullable(['type' => 'string', 'description' => $field->description().' (HTML: p, h2-h4, ul, ol, li, a, strong, em, code, blockquote)'], $field);
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        if (! is_string($value)) {
            return $value;
        }

        return $field->get('inline', false) ? Sanitizer::inline($value) : Sanitizer::clean($value);
    }

    public function toText(mixed $value, Field $field): string
    {
        return is_string($value) ? Sanitizer::text($value) : '';
    }

    public function configFields(): array
    {
        return [['handle' => 'inline', 'type' => 'toggle', 'label' => 'Inline Only', 'about' => 'No paragraphs, headings or lists.']];
    }
}

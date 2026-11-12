<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;
use Cms\Support\Markdown as MarkdownRenderer;

class Markdown extends FieldType
{
    public function key(): string { return 'markdown'; }

    public function body(): bool { return true; }

    public function label(): string { return __('Markdown'); }

    public function icon(): string { return 'markdown'; }

    public function description(): string { return __('Long-form text written in Markdown.'); }

    public function schema(Field $field): array
    {
        return $this->nullable(['type' => 'string', 'description' => $field->description().' (GitHub-flavored Markdown)'], $field);
    }

    public function normalize(mixed $value, Field $field): mixed
    {
        return is_string($value) ? str_replace("\r\n", "\n", $value) : $value;
    }

    public function augment(mixed $value, Field $field): mixed
    {
        return is_string($value) ? MarkdownRenderer::toHtml($value) : '';
    }

    public function toText(mixed $value, Field $field): string
    {
        return is_string($value) ? trim(strip_tags(MarkdownRenderer::toHtml($value))) : '';
    }

    public function serializesToMarkdown(): bool { return true; }

    public function group(): string { return __('Text'); }
}

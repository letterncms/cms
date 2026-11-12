<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

class Code extends FieldType
{
    public function key(): string { return 'code'; }

    public function label(): string { return __('Code'); }

    public function description(): string { return __('Source code or embed snippets in a monospaced editor.'); }

    public function icon(): string { return 'code'; }

    public function group(): string { return __('Text'); }

    public function schema(Field $field): array
    {
        return $this->nullable(['type' => 'string', 'maxLength' => 200000, 'description' => $field->description().' ('.$field->get('language', 'plain').')'], $field);
    }

    public function configFields(): array
    {
        return [['handle' => 'language', 'type' => 'select', 'label' => 'Language', 'options' => ['plain', 'html', 'css', 'javascript', 'json', 'php', 'yaml', 'bash', 'markdown']]];
    }
}

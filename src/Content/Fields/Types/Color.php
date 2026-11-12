<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

/** A color: a design token reference ("token:primary") or a CSS color. */
class Color extends FieldType
{
    public function key(): string { return 'color'; }

    public function label(): string { return __('Color'); }

    public function description(): string { return __('A color: a design token, hex value or CSS color function.'); }

    public function icon(): string { return 'palette'; }

    public function schema(Field $field): array
    {
        return $this->nullable([
            'type' => 'string',
            'pattern' => '^(token:[a-z0-9.-]+|#[0-9a-fA-F]{3,8}|(rgb|hsl|oklch)a?\([^)]*\))$',
            'description' => $field->description().' — prefer design tokens like token:primary',
        ], $field);
    }
}

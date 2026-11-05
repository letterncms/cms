<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

/** A color of the design vocabulary: a role or palette ("accent", "primary-text", "lime-300"), optionally with an opacity ("primary/20"). */
class Color extends FieldType
{
    public function key(): string { return 'color'; }

    public function label(): string { return __('Color'); }

    public function description(): string { return __('A color from the design system.'); }

    public function icon(): string { return 'palette'; }

    public function schema(Field $field): array
    {
        return $this->nullable([
            'type' => 'string',
            'pattern' => '^[a-z][a-z0-9-]*(/[0-9]{1,2})?$',
            'description' => ($field->instructions ?: $field->label).' — a color name of the design system, like accent, primary-text or lime-300',
        ], $field);
    }
}

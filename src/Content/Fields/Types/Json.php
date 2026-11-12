<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

/** Arbitrary structured data. Also the fallback when a field's plugin is missing. */
class Json extends FieldType
{
    public function key(): string { return 'json'; }

    public function label(): string { return __('JSON'); }

    public function description(): string { return __('Structured data edited as JSON.'); }

    public function icon(): string { return 'braces'; }

    public function group(): string { return __('Advanced'); }

    public function schema(Field $field): array
    {
        return ['description' => $field->description()];
    }
}

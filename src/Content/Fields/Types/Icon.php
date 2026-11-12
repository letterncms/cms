<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\FieldType;

/** The name of an admin icon (collections, global sets, cards on a site…). `options` narrows the choice. */
class Icon extends FieldType
{
    public function key(): string { return 'icon'; }

    public function label(): string { return __('Icon'); }

    public function description(): string { return __('Pick an icon.'); }

    public function icon(): string { return 'star'; }

    public function schema(Field $field): array
    {
        return $this->nullable(['type' => 'string', 'pattern' => '^[a-z0-9-]{1,40}$', 'description' => $field->description()], $field);
    }
}

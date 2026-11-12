<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;

/** A link: absolute URL, root-relative path, anchor, mailto: or tel:. */
class Url extends Text
{
    public function key(): string { return 'url'; }

    public function label(): string { return __('URL'); }

    public function description(): string { return __('A web address or a relative link.'); }

    public function icon(): string { return 'link'; }

    public function schema(Field $field): array
    {
        // `reference: true` also takes a page by id (entry:<id>, optionally #section), which follows the page when it moves.
        $format = $field->get('reference') ? ['pattern' => '^(https?://|/|#|\\?|mailto:|tel:|entry:[a-z0-9]+(#[\\w-]+)?$)'] : ['format' => 'uri-reference'];

        return $this->nullable(['type' => 'string', ...$format, 'maxLength' => 2048, 'description' => $field->description()], $field);
    }

    /** A cleared link is no link: null, not an empty string. */
    public function normalize(mixed $value, Field $field): mixed
    {
        $value = parent::normalize($value, $field);

        return $value === '' ? null : $value;
    }
}

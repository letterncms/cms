<?php

declare(strict_types=1);

namespace Cms\Content\Fields\Types;

use Cms\Content\Fields\Field;

/** A link: absolute URL, root-relative path, anchor, mailto: or tel:. */
class Url extends Text
{
    public function key(): string { return 'url'; }

    public function label(): string { return __('Link'); }

    public function description(): string { return __('A web address or a relative link.'); }

    public function icon(): string { return 'link'; }

    public function schema(Field $field): array
    {
        // `reference: true` also takes a page by id (entry:<id>, optionally #section), which follows the page when it moves.
        // An optional one may be empty, as with `format` (older drafts store a cleared link as '').
        $empty = $field->required ? '' : '$|';
        $format = $field->get('reference') ? ['pattern' => "^({$empty}https?://|/|#|\\?|mailto:|tel:|entry:[a-z0-9]+(#[\\w-]+)?$)"] : ['format' => 'uri-reference'];

        return $this->nullable(['type' => 'string', ...$format, 'maxLength' => 2048, 'description' => $field->instructions ?: $field->label], $field);
    }
}

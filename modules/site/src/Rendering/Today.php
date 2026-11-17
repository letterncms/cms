<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Rendering;

use JsonSerializable;
use Stringable;

/**
 * `site.today`: the date the page is built on, as `2026-11-17`, for a list of what is still to come (an event
 * whose start is on or after today) or what has been. A page that reads it is rebuilt when the day turns.
 */
final class Today implements JsonSerializable, Stringable
{
    public function __toString(): string
    {
        PageContext::depend('day');

        return date('Y-m-d');
    }

    public function jsonSerialize(): string
    {
        return (string) $this;
    }
}

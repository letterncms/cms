<?php

declare(strict_types=1);

use Cms\Modules\Site\Rendering\PageContext;

if (! function_exists('cms_global')) {
    /** A global value by dot path: cms_global('footer.tagline'). */
    function cms_global(string $path, mixed $default = null): mixed
    {
        PageContext::depend('globals');
        [$handle, $key] = array_pad(explode('.', $path, 2), 2, null);
        $set = cms()->globals()->find((string) $handle);

        if (! $set) {
            return $default;
        }

        $values = $set->blueprint()->augment($set->values(PageContext::current()?->locale()));

        return $key === null ? $values : data_get($values, $key, $default);
    }
}

<?php

declare(strict_types=1);

use Cms\Modules\Site\Rendering\PageContext;

if (! function_exists('cms_global')) {
    /** A global value by dot path: cms_global('footer.tagline'). */
    function cms_global(string $path, mixed $default = null): mixed
    {
        [$handle, $key] = array_pad(explode('.', $path, 2), 2, null);
        $values = cms()->globals()->find((string) $handle, PageContext::current()?->locale());

        if ($values === null) {
            return $default;
        }

        return $key === null ? $values : data_get($values, $key, $default);
    }
}

if (! function_exists('cms_menu')) {
    /**
     * A menu's links for templates: [{label, url, newTab, current, active, children}, and each link’s own fields]. Only live links show;
     * `current` marks the page being rendered and `active` the links above it. Null when there is no such menu,
     * so a theme can fall back: `cms_menu('main') ?? [...]`.
     */
    function cms_menu(string $handle): ?array
    {
        $page = PageContext::current();

        return cms()->menus()->resolve($handle, $page?->uri, $page?->locale());
    }
}

<?php

declare(strict_types=1);

use Cms\Modules\Navigation\MenuResolver;
use Cms\Modules\Site\Rendering\PageContext;

if (! function_exists('cms_menu')) {
    /**
     * Links of a menu for templates: [{label, url, newTab, current, active, children}].
     * Only live entries appear; `current` marks the page being rendered and
     * `active` its ancestors. Null when the menu does not exist, so themes can
     * fall back: `cms_menu('main') ?? [...]`.
     */
    function cms_menu(string $handle): ?array
    {
        // The page Site is rendering, if any.
        $page = PageContext::current();

        return app(MenuResolver::class)->resolve($handle, $page?->uri, $page?->locale());
    }
}

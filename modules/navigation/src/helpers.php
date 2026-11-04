<?php

declare(strict_types=1);

use Cms\Modules\Navigation\MenuResolver;

if (! function_exists('cms_menu')) {
    /**
     * Links of a menu for templates: [{label, url, newTab, current, active, children}].
     * Only live entries appear; `current` marks the page being rendered and
     * `active` its ancestors. Null when the menu does not exist, so themes can
     * fall back: `cms_menu('main') ?? [...]`.
     */
    function cms_menu(string $handle): ?array
    {
        // The page being rendered, when a site plugin renders one: {entry, uri, locale}.
        $page = cms()->hooks()->filter('render.page', null);

        return app(MenuResolver::class)->resolve($handle, $page['uri'] ?? null, $page['locale'] ?? null);
    }
}

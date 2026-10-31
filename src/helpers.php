<?php

declare(strict_types=1);

use Cms\Cms;

if (! function_exists('cms')) {
    /** Kernel facade, or a resolved service from the container. */
    function cms(?string $abstract = null): mixed
    {
        return $abstract === null ? app(Cms::class) : app($abstract);
    }
}

if (! function_exists('cms_brand')) {
    /** The product's display name, or another value of brand/brand.json. */
    function cms_brand(string $key = 'name'): string
    {
        return \Cms\Support\Brand::get($key);
    }
}

if (! function_exists('cms_path')) {
    function cms_path(string $path = ''): string
    {
        return app()->cmsPath($path);
    }
}

if (! function_exists('site_path')) {
    function site_path(string $path = ''): string
    {
        return app()->sitePath($path);
    }
}

if (! function_exists('content_path')) {
    function content_path(string $path = ''): string
    {
        return app()->contentPath($path);
    }
}

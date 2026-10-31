<?php

declare(strict_types=1);

namespace Cms\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Cms\Admin\Translations;
use Symfony\Component\HttpFoundation\Response;

/**
 * The admin answers in the user's language: labels, messages and validation errors.
 * `?lang=nl` on an admin page shows that page in another language without changing
 * the account (for checking translations); its requests carry it as `X-Cms-Locale`.
 */
final class AdminLocale
{
    public function __construct(private readonly Translations $translations) {}

    public function handle(Request $request, Closure $next): Response
    {
        $asked = (string) ($request->query('lang') ?? $request->header('X-Cms-Locale', ''));
        $locale = isset($this->translations->languages()[$asked]) ? $asked : $this->translations->locale($request->user(), $request);

        $this->translations->apply($locale);

        return $next($request);
    }
}

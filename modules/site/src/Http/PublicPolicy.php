<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Http;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * A public page PHP answers carries the site's security policy, as the built ones do from public/.htaccess.
 * Only an answer for which a public page was rendered: never the admin, the builder's canvas or a preview.
 */
final class PublicPolicy
{
    public function __construct(private readonly ContentPolicy $policy) {}

    public function handle(Request $request, Closure $next): Response
    {
        $this->policy->begin();
        $response = $next($request);

        if (($policy = $this->policy->forResponse()) !== null && ! $response->headers->has('Content-Security-Policy') && str_starts_with((string) $response->headers->get('Content-Type', 'text/html'), 'text/html')) {
            $response->headers->set($this->policy->header(), $policy);
            $response->headers->set('X-Content-Type-Options', 'nosniff');
        }

        $this->policy->begin();

        return $response;
    }
}

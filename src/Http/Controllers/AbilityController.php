<?php

declare(strict_types=1);

namespace Cms\Http\Controllers;

use Cms\Support\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Cms;
use Cms\Http\OpenApi;
use Cms\Users\ApiToken;

/**
 * One endpoint for everything: the admin SPA (/api/admin) and integrations
 * (/api/v1, Bearer token) execute the same abilities.
 */
final class AbilityController
{
    public function __construct(private readonly AbilityRegistry $abilities) {}

    public function describe(): JsonResponse
    {
        return response()->json([
            'name' => Brand::get(),
            'version' => Cms::VERSION,
            'api' => 'v1',
            'endpoints' => [
                'abilities' => url('/api/v1/abilities'),
                'run' => url('/api/v1/abilities/{name}'),
                'batch' => url('/api/v1/batch'),
                'content' => url('/api/v1/content/{collection}'),
                'openapi' => url('/api/v1/openapi.json'),
            ],
            'auth' => 'Bearer token (create one under Account → API tokens).',
        ]);
    }

    /**
     * The API as OpenAPI 3.1, for tools that generate clients and for agents that read it. Anyone gets how the
     * API works; which abilities there are says which plugins a site runs, so those are only for a token, and
     * then the ones that token may run.
     */
    public function openapi(Request $request, OpenApi $openapi): JsonResponse
    {
        // The route takes no token, so it is read here: the document is public, a token only adds to it.
        $token = ($plain = $request->bearerToken()) ? ApiToken::findByPlain($plain) : null;
        $user = $token?->user;

        return response()
            ->json($user === null ? $openapi->public() : $openapi->document(AbilityContext::forUser($user, 'rest', $token?->scopes)), 200, [], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
            ->setVary('Authorization');
    }

    public function index(Request $request): JsonResponse
    {
        $context = $this->context($request);

        return response()->json([
            'data' => array_values(array_map(static fn ($a) => $a->toArray(), $this->abilities->available($context))),
        ]);
    }

    public function run(Request $request, string $name): JsonResponse
    {
        $ability = $this->abilities->get($name);

        if ($request->isMethod('GET') && $ability && ! $ability->isReadOnly()) {
            return $this->error(new AbilityException(__('Use POST for abilities that change data.'), 'invalid_input'), 405);
        }

        $input = $request->isMethod('GET') ? $request->query() : $request->json()->all();

        try {
            $result = $this->abilities->execute($name, is_array($input) ? $input : [], $this->context($request));
        } catch (AbilityException $e) {
            return $this->error($e);
        }

        return response()->json(['data' => $ability ? $ability->encode($result) : $result]);
    }

    public function batch(Request $request): JsonResponse
    {
        $calls = $request->json('calls');

        if (! is_array($calls) || $calls === [] || count($calls) > 25) {
            return $this->error(AbilityException::invalid('Send 1–25 calls as {"calls": [{"ability": "…", "input": {}}]}.'));
        }

        $context = $this->context($request);
        $results = [];

        foreach ($calls as $i => $call) {
            try {
                $name = (string) ($call['ability'] ?? '');
                $result = $this->abilities->execute($name, (array) ($call['input'] ?? []), $context);
                $results[$i] = ['data' => $this->abilities->get($name)?->encode($result) ?? $result];
            } catch (AbilityException $e) {
                $results[$i] = ['error' => $e->toArray()];

                if ($request->json('stopOnError', true)) {
                    break;
                }
            }
        }

        return response()->json(['data' => $results]);
    }

    private function context(Request $request): AbilityContext
    {
        $token = $request->attributes->get('cms.token');

        return AbilityContext::forUser(
            $request->user(),
            $request->is('api/admin/*') ? 'admin' : 'rest',
            $token?->scopes,
            // A query string has only text: ?perPage=5 is the number the schema asks for.
            strings: $request->isMethod('GET'),
        );
    }

    private function error(AbilityException $e, ?int $status = null): JsonResponse
    {
        return response()->json(['error' => $e->toArray()], $status ?? $e->status());
    }
}

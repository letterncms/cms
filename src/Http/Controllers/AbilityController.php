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
            ],
            'auth' => 'Bearer token (create one under Account → API tokens).',
        ]);
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

        return response()->json(['data' => $result]);
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
                $results[$i] = ['data' => $this->abilities->execute((string) ($call['ability'] ?? ''), (array) ($call['input'] ?? []), $context)];
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
        );
    }

    private function error(AbilityException $e, ?int $status = null): JsonResponse
    {
        return response()->json(['error' => $e->toArray()], $status ?? $e->status());
    }
}

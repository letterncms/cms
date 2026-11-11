<?php

declare(strict_types=1);

namespace Cms\Http;

use Cms\Abilities\Ability;
use Cms\Abilities\AbilityRegistry;
use Cms\Cms;
use Cms\Support\Brand;
use stdClass;

/**
 * The REST API as an OpenAPI 3.1 document, made from the ability registry: one path per ability,
 * with the input and output schemas the abilities declare. Nothing in it is written by hand, so it
 * cannot drift from what the site runs, plugins included.
 */
final class OpenApi
{
    /** The document's descriptions are for agents and tools, like the abilities' own: English, and not strings to translate. */
    private const string ABOUT = 'description';

    public function __construct(private readonly AbilityRegistry $abilities) {}

    public function document(): array
    {
        $paths = [
            '/abilities' => ['get' => [
                'operationId' => 'abilities',
                'summary' => 'List Abilities',
                self::ABOUT => 'The abilities this token may run, each with its input and output schema.',
                'tags' => ['abilities'],
                'responses' => ['200' => $this->json(['type' => 'object', 'properties' => ['data' => ['type' => 'array', 'items' => ['type' => 'object']]], 'required' => ['data']]), 'default' => ['$ref' => '#/components/responses/Error']],
            ]],
            '/batch' => ['post' => [
                'operationId' => 'batch',
                'summary' => 'Run Several Abilities',
                self::ABOUT => 'Runs up to 25 calls in order. Each answer is {data} or {error}; the batch stops at the first error unless stopOnError is false.',
                'tags' => ['abilities'],
                'requestBody' => ['required' => true, 'content' => ['application/json' => ['schema' => ['type' => 'object', 'properties' => [
                    'calls' => ['type' => 'array', 'minItems' => 1, 'maxItems' => 25, 'items' => ['type' => 'object', 'properties' => ['ability' => ['type' => 'string'], 'input' => ['type' => 'object']], 'required' => ['ability']]],
                    'stopOnError' => ['type' => 'boolean', 'default' => true],
                ], 'required' => ['calls']]]]],
                'responses' => ['200' => $this->json(['type' => 'object', 'properties' => ['data' => ['type' => 'array', 'items' => ['type' => 'object']]], 'required' => ['data']]), 'default' => ['$ref' => '#/components/responses/Error']],
            ]],
        ];

        $tags = ['abilities' => true];

        foreach ($this->abilities->all('rest') as $ability) {
            $paths['/abilities/'.$ability->name] = $this->path($ability);
            $tags[$ability->category] = true;
        }

        ksort($tags);

        return [
            'openapi' => '3.1.0',
            'info' => [
                'title' => config('app.name').' API',
                'version' => Cms::VERSION,
                self::ABOUT => 'Every action of this '.Brand::get().' site is an ability: POST /abilities/{name} with its input as JSON (GET also works for the ones that only read). An answer is {"data": …}; a failure is {"error": {"type", "message", "details"}} with a matching status. Abilities that change something take dryRun: true.',
            ],
            'servers' => [['url' => url('/api/v1')]],
            'security' => [['bearer' => []]],
            'tags' => array_map(static fn (string $name) => ['name' => $name], array_keys($tags)),
            'paths' => $paths,
            'components' => [
                'securitySchemes' => ['bearer' => ['type' => 'http', 'scheme' => 'bearer', self::ABOUT => 'An API token (Account → API tokens, or `cms token:create`).']],
                'schemas' => [
                    'Error' => ['type' => 'object', 'properties' => ['error' => ['type' => 'object', 'properties' => [
                        'type' => ['type' => 'string', 'enum' => ['invalid_input', 'unauthenticated', 'forbidden', 'not_found', 'conflict', 'rate_limited', 'failed']],
                        'message' => ['type' => 'string'],
                        'details' => ['type' => 'object', self::ABOUT => 'For invalid_input: a message for each path of the input that is wrong (title, data.summary).'],
                    ], 'required' => ['type', 'message']]], 'required' => ['error']],
                    'DryRun' => $this->schema(Ability::DRY_RUN_OUTPUT),
                ],
                'responses' => ['Error' => [self::ABOUT => 'The call failed: 401 unauthenticated, 403 forbidden, 404 not_found, 409 conflict, 422 invalid_input, 429 rate_limited, 500 failed.', 'content' => ['application/json' => ['schema' => ['$ref' => '#/components/schemas/Error']]]]],
            ],
        ];
    }

    private function path(Ability $ability): array
    {
        $input = $this->schema([...$ability->input(), 'type' => 'object']);
        $output = $ability->output() === null ? new stdClass : $this->schema($ability->output());
        $data = $ability->isReadOnly() ? $output : ['oneOf' => [$output, ['$ref' => '#/components/schemas/DryRun']]];

        $operation = [
            'operationId' => str_replace('/', '.', $ability->name),
            'summary' => $ability->label,
            self::ABOUT => $ability->description ?: $ability->label,
            'tags' => [$ability->category],
            'responses' => [
                '200' => $this->json(['type' => 'object', 'properties' => ['data' => $data], 'required' => ['data']]),
                'default' => ['$ref' => '#/components/responses/Error'],
            ],
            ...($ability->annotations === [] ? [] : ['x-annotations' => $ability->annotations]),
            ...($ability->package === null ? [] : ['x-package' => $ability->package]),
        ];

        $path = ['post' => [...$operation, 'requestBody' => ['required' => (array) ($ability->input['required'] ?? []) !== [], 'content' => ['application/json' => ['schema' => $input]]]]];

        // Abilities that only read also answer GET, with the input as the query string.
        if ($ability->isReadOnly()) {
            $required = (array) ($ability->input['required'] ?? []);
            $parameters = [];

            foreach ((array) ($ability->input['properties'] ?? []) as $name => $schema) {
                $complex = array_intersect((array) ($schema['type'] ?? []), ['object', 'array']) !== [];
                $parameters[] = [
                    'name' => (string) $name,
                    'in' => 'query',
                    'required' => in_array($name, $required, true),
                    'schema' => $this->schema((array) $schema),
                    ...($complex ? ['style' => 'deepObject', 'explode' => true] : []),
                ];
            }

            $path = ['get' => [...$operation, 'operationId' => $operation['operationId'].'.get', 'parameters' => $parameters], ...$path];
        }

        return $path;
    }

    private function json(array $schema): array
    {
        return [self::ABOUT => 'OK', 'content' => ['application/json' => ['schema' => $schema]]];
    }

    /** A schema as JSON has it: PHP's empty array is `{}` where a schema or a map of them stands, never `[]`. */
    private function schema(array $schema): array|stdClass
    {
        if ($schema === []) {
            return new stdClass;
        }

        foreach (['properties', '$defs'] as $key) {
            if (isset($schema[$key])) {
                $schema[$key] = (array) $schema[$key] === [] ? new stdClass : array_map(fn ($sub) => $this->schema((array) $sub), (array) $schema[$key]);
            }
        }

        foreach (['items', 'additionalProperties'] as $key) {
            if (isset($schema[$key]) && (is_array($schema[$key]) || is_object($schema[$key]))) {
                $schema[$key] = $this->schema((array) $schema[$key]);
            }
        }

        foreach (['anyOf', 'oneOf'] as $key) {
            if (isset($schema[$key])) {
                $schema[$key] = array_map(fn ($sub) => $this->schema((array) $sub), array_values((array) $schema[$key]));
            }
        }

        return $schema;
    }
}

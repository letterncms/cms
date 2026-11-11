<?php

declare(strict_types=1);

namespace Cms\Http;

use Cms\Abilities\Ability;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityRegistry;
use Cms\Cms;
use Cms\Support\Brand;
use stdClass;

/**
 * The REST API as an OpenAPI 3.1 document, made from the ability registry: one path per ability,
 * with the input and output schemas the abilities declare. Nothing about an ability is written by
 * hand, so it cannot drift from what the site runs, plugins included.
 *
 * There are two documents. Anyone gets the public one: how the API works and the public content
 * endpoints, and nothing that says which abilities, so which plugins, the site has. A token gets
 * the abilities it may run, each with its own path.
 */
final class OpenApi
{
    /** The document's descriptions are for agents and tools, like the abilities' own: English, and not strings to translate. */
    private const string ABOUT = 'description';

    private const string ERROR = '#/components/responses/Error';

    public function __construct(private readonly AbilityRegistry $abilities) {}

    /** What anyone may read: the generic paths, the public content API, the error shape. */
    public function public(): array
    {
        $name = ['name' => 'name', 'in' => 'path', 'required' => true, self::ABOUT => 'The ability, as thing/verb with its slash: entries/list.', 'schema' => ['type' => 'string', 'pattern' => '^[a-z0-9-]+/[a-z0-9.-]+$']];
        $answer = $this->json(['type' => 'object', 'properties' => ['data' => new stdClass], 'required' => ['data']]);
        $about = 'What it takes and answers with is the ability\'s own: GET /abilities lists them with their schemas, and this document, asked for with the token, has a path for each.';

        $run = ['/abilities/{name}' => [
            'parameters' => [$name],
            'get' => [
                'operationId' => 'abilities.run.get',
                'summary' => 'Run an Ability That Reads',
                self::ABOUT => 'Only for abilities that change nothing, with the input as the query string. '.$about,
                'tags' => ['abilities'],
                'responses' => ['200' => $answer, 'default' => ['$ref' => self::ERROR]],
            ],
            'post' => [
                'operationId' => 'abilities.run',
                'summary' => 'Run an Ability',
                self::ABOUT => 'The input is the JSON body. '.$about,
                'tags' => ['abilities'],
                'requestBody' => ['required' => false, 'content' => ['application/json' => ['schema' => ['type' => 'object']]]],
                'responses' => ['200' => $answer, 'default' => ['$ref' => self::ERROR]],
            ],
        ]];

        return $this->wrap([...$this->shared(), ...$run, ...$this->content()], ['abilities', 'content'], []);
    }

    /** What a token gets: a path for every ability it may run, in place of the generic one. */
    public function document(AbilityContext $context): array
    {
        $paths = [];
        $tags = ['abilities', 'content'];

        foreach ($this->abilities->available($context) as $ability) {
            $paths['/abilities/'.$ability->name] = $this->path($ability);
            $tags[] = $ability->category;
        }

        return $this->wrap([...$this->shared(), ...$paths, ...$this->content()], $tags, ['DryRun' => $this->schema(Ability::DRY_RUN_OUTPUT)]);
    }

    private function wrap(array $paths, array $tags, array $schemas): array
    {
        $tags = array_values(array_unique($tags));
        sort($tags);

        return [
            'openapi' => '3.1.0',
            'info' => [
                'title' => config('app.name').' API',
                'version' => Cms::VERSION,
                self::ABOUT => 'Every action of this '.Brand::get().' site is an ability: POST /abilities/{name} with its input as JSON (GET also works for the ones that only read). An answer is {"data": …}; a failure is {"error": {"type", "message", "details"}} with a matching status. Abilities that change something take dryRun: true. Asked for with a token, this document has a path for each ability the token may run. Published content is read without a token under /content.',
            ],
            'servers' => [['url' => url('/api/v1')]],
            'security' => [['bearer' => []]],
            'tags' => array_map(static fn (string $name) => ['name' => $name], $tags),
            'paths' => $paths,
            'components' => [
                'securitySchemes' => ['bearer' => ['type' => 'http', 'scheme' => 'bearer', self::ABOUT => 'An API token (Account → API tokens, or `cms token:create`).']],
                'schemas' => [
                    'Error' => ['type' => 'object', 'properties' => ['error' => ['type' => 'object', 'properties' => [
                        'type' => ['type' => 'string', 'enum' => ['invalid_input', 'unauthenticated', 'forbidden', 'not_found', 'conflict', 'rate_limited', 'failed']],
                        'message' => ['type' => 'string'],
                        'details' => ['type' => 'object', 'additionalProperties' => true, self::ABOUT => 'For invalid_input: a message for each path of the input that is wrong (title, data.summary).'],
                    ], 'required' => ['type', 'message']]], 'required' => ['error']],
                    'Entry' => $this->entry(),
                    ...$schemas,
                ],
                'responses' => [
                    'Error' => [self::ABOUT => 'The call failed: 401 unauthenticated, 403 forbidden, 404 not_found, 409 conflict, 422 invalid_input, 429 rate_limited, 500 failed.', 'content' => ['application/json' => ['schema' => ['$ref' => '#/components/schemas/Error']]]],
                    'NotFound' => [self::ABOUT => 'No such collection in the content API, or no published entry with that slug.', 'content' => ['application/json' => ['schema' => ['type' => 'object', 'properties' => ['message' => ['type' => 'string']], 'required' => ['message']]]]],
                ],
            ],
        ];
    }

    /** The two paths that are about abilities as such. */
    private function shared(): array
    {
        $list = $this->json(['type' => 'object', 'properties' => ['data' => ['type' => 'array', 'items' => ['type' => 'object']]], 'required' => ['data']]);

        return [
            '/abilities' => ['get' => [
                'operationId' => 'abilities',
                'summary' => 'List Abilities',
                self::ABOUT => 'The abilities this token may run, each with its input and output schema.',
                'tags' => ['abilities'],
                'responses' => ['200' => $list, 'default' => ['$ref' => self::ERROR]],
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
                'responses' => ['200' => $list, 'default' => ['$ref' => self::ERROR]],
            ]],
        ];
    }

    /** The public content API (DeliveryController): published entries of the collections that are served, without a token. */
    private function content(): array
    {
        $collection = ['name' => 'collection', 'in' => 'path', 'required' => true, self::ABOUT => 'The handle of a collection the site serves: one with `api: true`, or one whose entries have pages.', 'schema' => ['type' => 'string']];
        $locale = ['name' => 'locale', 'in' => 'query', 'required' => false, self::ABOUT => 'One of the site\'s languages; any other value is read as the default language.', 'schema' => ['type' => 'string']];
        $entry = ['$ref' => '#/components/schemas/Entry'];
        $missing = ['$ref' => '#/components/responses/NotFound'];

        return [
            '/content/{collection}' => ['get' => [
                'operationId' => 'content.list',
                'summary' => 'List Published Entries',
                self::ABOUT => 'One page of a collection\'s published entries. Answers may be cached for a minute.',
                'tags' => ['content'],
                'security' => [],
                'parameters' => [
                    $collection,
                    $locale,
                    ['name' => 'q', 'in' => 'query', 'required' => false, self::ABOUT => 'Words to search for.', 'schema' => ['type' => 'string']],
                    ['name' => 'sort', 'in' => 'query', 'required' => false, self::ABOUT => 'A field to order by, with a leading - for descending (-publishedAt). Without it, the collection\'s own order.', 'schema' => ['type' => 'string']],
                    ['name' => 'filter', 'in' => 'query', 'required' => false, self::ABOUT => 'Only entries whose field has this value: filter[category]=news. For a relation or terms field, the id or the slug of what it names: filter[topics]=news.', 'style' => 'deepObject', 'explode' => true, 'schema' => ['type' => 'object', 'additionalProperties' => ['type' => 'string']]],
                    ['name' => 'references', 'in' => 'query', 'required' => false, self::ABOUT => 'Only entries that name the published entry with this id: in a relation or terms field at any depth, a link field or a link in a block. The posts of an author, the projects of a client.', 'schema' => ['type' => 'string']],
                    ['name' => 'references_field', 'in' => 'query', 'required' => false, self::ABOUT => 'With references: only inside this field.', 'schema' => ['type' => 'string']],
                    ['name' => 'limit', 'in' => 'query', 'required' => false, self::ABOUT => 'Entries per page. Without it, the collection\'s own page size.', 'schema' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 200]],
                    ['name' => 'page', 'in' => 'query', 'required' => false, 'schema' => ['type' => 'integer', 'minimum' => 1, 'default' => 1]],
                ],
                'responses' => ['200' => $this->json(['type' => 'object', 'properties' => [
                    'data' => ['type' => 'array', 'items' => $entry],
                    'meta' => ['type' => 'object', 'properties' => ['total' => ['type' => 'integer'], 'page' => ['type' => 'integer'], 'perPage' => ['type' => 'integer'], 'pages' => ['type' => 'integer']], 'required' => ['total', 'page', 'perPage', 'pages']],
                ], 'required' => ['data', 'meta']]), '404' => $missing],
            ]],
            '/content/{collection}/{slug}' => ['get' => [
                'operationId' => 'content.get',
                'summary' => 'Get a Published Entry',
                self::ABOUT => 'One published entry by its slug. Answers may be cached for a minute.',
                'tags' => ['content'],
                'security' => [],
                'parameters' => [$collection, ['name' => 'slug', 'in' => 'path', 'required' => true, 'schema' => ['type' => 'string']], $locale],
                'responses' => ['200' => $this->json(['type' => 'object', 'properties' => ['data' => $entry], 'required' => ['data']]), '404' => $missing],
            ]],
        ];
    }

    /** An entry as the content API gives it: what is published, never the draft. */
    private function entry(): array
    {
        $text = ['type' => 'string'];
        $maybe = ['type' => ['string', 'null']];

        return ['type' => 'object', 'properties' => [
            'id' => $text,
            'collection' => $text,
            'locale' => $text,
            'title' => $text,
            'slug' => $text,
            'uri' => [...$maybe, self::ABOUT => 'The path of the entry\'s page, when it has one.'],
            'data' => ['type' => 'object', 'additionalProperties' => true, self::ABOUT => 'The values of the collection\'s fields.'],
            'parentId' => $maybe,
            'publishedAt' => [...$maybe, 'format' => 'date-time'],
            'updatedAt' => [...$maybe, 'format' => 'date-time'],
            'gated' => ['type' => 'boolean', 'const' => true, self::ABOUT => 'Present when the entry is for signed-in visitors and only its teaser is given.'],
        ], 'required' => ['id', 'collection', 'locale', 'title', 'slug', 'uri', 'data', 'parentId', 'publishedAt', 'updatedAt']];
    }

    private function path(Ability $ability): array
    {
        $input = $this->schema([...$ability->input(), 'type' => 'object']);
        $output = $ability->output() === null ? new stdClass : $this->schema($ability->output());
        $data = $ability->isReadOnly() ? $output : ['anyOf' => [$output, ['$ref' => '#/components/schemas/DryRun']]];

        $operation = [
            'operationId' => str_replace('/', '.', $ability->name),
            'summary' => $ability->label,
            self::ABOUT => $ability->description ?: $ability->label,
            'tags' => [$ability->category],
            'responses' => [
                '200' => $this->json(['type' => 'object', 'properties' => ['data' => $data], 'required' => ['data']]),
                'default' => ['$ref' => self::ERROR],
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
                $types = (array) ($schema['type'] ?? []);
                $of = (array) ($schema['items']['type'] ?? []);
                $nested = array_intersect($types, ['array', 'object']) !== [];
                // A list of plain values is given as the query string has lists: ids[]=a&ids[]=b.
                $list = in_array('array', $types, true) && $of !== [] && array_intersect($of, ['array', 'object']) === [];
                $described = $this->schema((array) $schema);

                $parameters[] = [
                    'name' => $list ? $name.'[]' : (string) $name,
                    'in' => 'query',
                    'required' => in_array($name, $required, true),
                    // Anything deeper (a map, a list of maps) is one value, as JSON: filters=[{"field":"title","value":"x"}].
                    ...match (true) {
                        $list => ['schema' => $described, 'style' => 'form', 'explode' => true],
                        $nested => ['content' => ['application/json' => ['schema' => $described]]],
                        default => ['schema' => $described],
                    },
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

    /** A schema as JSON has it: PHP's empty array is `{}` where a schema, a map of them or an object's default stands, never `[]`. */
    private function schema(array $schema): array|stdClass
    {
        if ($schema === []) {
            return new stdClass;
        }

        $types = (array) ($schema['type'] ?? []);

        if (($schema['default'] ?? null) === [] && in_array('object', $types, true) && ! in_array('array', $types, true)) {
            $schema['default'] = new stdClass;
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

<?php

declare(strict_types=1);

namespace Cms\Admin;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Cms;
use Cms\Support\Schema\Validator;
use Cms\Users\User;

/** Transport-independent contract for generated admin UI. Only registered code renders it. */
final class Surface
{
    public const int VERSION = 1;
    public const int MAX_BYTES = 48_000;

    public function __construct(private readonly Cms $cms) {}

    /** The live, permission-filtered catalog. Widget integrations require no extra registration. */
    public function catalog(User $user): array
    {
        $string = ['type' => 'string', 'maxLength' => 2000];
        $cell = ['type' => ['string', 'number', 'boolean', 'null']];
        $definitions = [
            'ui/stack' => ['label' => 'Stack', 'children' => true, 'props' => $this->object([])],
            'ui/grid' => ['label' => 'Responsive grid', 'children' => true, 'props' => $this->object(['columns' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 3, 'default' => 2]])],
            'ui/text' => ['label' => 'Text', 'props' => $this->object(['text' => $string], ['text'])],
            'ui/stat' => ['label' => 'Metric with optional trend', 'props' => $this->object([
                'label' => $string, 'value' => ['type' => ['string', 'number']],
                'delta' => ['type' => 'number'],
                'trend' => ['type' => 'array', 'maxItems' => 60, 'items' => ['type' => 'number', 'minimum' => 0]],
            ], ['label', 'value'])],
            'ui/table' => ['label' => 'Data table', 'props' => $this->object([
                'columns' => ['type' => 'array', 'minItems' => 1, 'maxItems' => 8, 'items' => $string],
                'rows' => ['type' => 'array', 'maxItems' => 50, 'items' => ['type' => 'array', 'maxItems' => 8, 'items' => $cell]],
            ], ['columns', 'rows'])],
            'ui/action' => ['label' => 'Action button (uses its submit action)', 'props' => $this->object(['label' => $string], ['label'])],
        ];

        foreach ($this->cms->admin()->widgetsForUser($user) as $widget) {
            // An assistant launcher is useful on Home, but not inside its own reply.
            if (($widget['assistant'] ?? true) === false) {
                continue;
            }
            $definitions['widget/'.$widget['id']] = ['label' => $widget['label'], 'description' => $widget['description'], 'props' => $this->object([])];
        }

        foreach ($this->cms->admin()->componentsForUser($user) as $component) {
            $definitions[$component['id']] = $component;
        }

        ksort($definitions);

        return array_map(static fn ($id, $definition) => ['id' => $id, 'description' => '', 'children' => false, ...$definition], array_keys($definitions), $definitions);
    }

    public function schema(): array
    {
        $id = ['type' => 'string', 'minLength' => 1, 'maxLength' => 80, 'pattern' => '^[a-zA-Z0-9_-]+$'];

        return $this->object([
            'version' => ['type' => 'integer', 'const' => self::VERSION],
            'id' => $id,
            'title' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 160],
            'spec' => $this->object([
                'root' => $id,
                'elements' => ['type' => 'object', 'maxProperties' => 64, 'additionalProperties' => $this->object([
                    'type' => ['type' => 'string', 'maxLength' => 160],
                    'props' => ['type' => 'object', 'default' => []],
                    'children' => ['type' => 'array', 'maxItems' => 64, 'uniqueItems' => true, 'items' => $id],
                    'on' => ['type' => 'object', 'maxProperties' => 12, 'additionalProperties' => $this->object([
                        'action' => ['type' => 'string', 'maxLength' => 160],
                        'params' => ['type' => 'object', 'default' => []],
                    ], ['action'])],
                ], ['type'])],
            ], ['root', 'elements']),
        ], ['version', 'id', 'title', 'spec']);
    }

    /** Validate structure, component schemas and action inputs before persisting or displaying anything. */
    public function validate(array $document, User $user): array
    {
        if (strlen((string) json_encode($document)) > self::MAX_BYTES) {
            throw AbilityException::invalid('This surface is too large. Use fewer rows or components.');
        }

        $document = Validator::validate($document, $this->schema());
        $catalog = array_column($this->catalog($user), null, 'id');
        $available = $this->cms->abilities()->available(AbilityContext::forUser($user, 'assistant'));
        $nodes = [];

        foreach ($document['spec']['elements'] as $id => $node) {
            if (! preg_match('/^[a-zA-Z0-9_-]{1,80}$/', (string) $id)) {
                throw AbilityException::invalid('Invalid element id.');
            }
            $component = $catalog[$node['type']] ?? throw AbilityException::invalid('Unknown or unavailable component: '.$node['type']);
            $node['props'] = Validator::validate($node['props'], $component['props']);
            $this->literalProps($node['props']);
            if (! $component['children'] && ! empty($node['children'])) {
                throw AbilityException::invalid('This component does not accept children: '.$node['type']);
            }
            if ($node['type'] === 'ui/table') {
                foreach ($node['props']['rows'] as $row) {
                    if (count($row) !== count($node['props']['columns'])) {
                        throw AbilityException::invalid('Each table row must match its columns.');
                    }
                }
            }
            if ($node['type'] === 'ui/action' && ! isset($node['on']['submit'])) {
                throw AbilityException::invalid('An action button needs a submit action.');
            }
            foreach ($node['on'] ?? [] as $name => $action) {
                if (! preg_match('/^[a-zA-Z0-9_-]{1,80}$/', (string) $name)) {
                    throw AbilityException::invalid('Invalid event name.');
                }
                $ability = $available[$action['action']] ?? throw AbilityException::forbidden('This surface action is unavailable.');
                $node['on'][$name]['params'] = Validator::validate($action['params'], $ability->input);
            }
            $nodes[$id] = $node;
        }

        $visited = [];
        $visit = function (string $id, int $depth) use (&$visit, &$visited, $nodes): void {
            if ($depth > 8 || isset($visited[$id]) || ! isset($nodes[$id])) {
                throw AbilityException::invalid('Surface must be a connected tree, at most eight levels deep, with valid child ids.');
            }
            $visited[$id] = true;
            foreach ($nodes[$id]['children'] ?? [] as $child) {
                $visit($child, $depth + 1);
            }
        };
        $visit($document['spec']['root'], 1);
        if (count($visited) !== count($nodes)) {
            throw AbilityException::invalid('Every surface node must be reachable from its root.');
        }

        return [...$document, 'spec' => [...$document['spec'], 'elements' => $nodes]];
    }

    private function object(array $properties, array $required = []): array
    {
        return ['type' => 'object', 'properties' => $properties ?: (object) [], 'required' => $required, 'additionalProperties' => false];
    }

    /** Plugin object props must not accidentally opt into json-render's expression language. */
    private function literalProps(array $value): void
    {
        foreach ($value as $key => $item) {
            if (is_string($key) && str_starts_with($key, '$')) {
                throw AbilityException::invalid('Surface version 1 accepts literal props, not dynamic expressions.');
            }
            if (is_array($item)) $this->literalProps($item);
        }
    }
}

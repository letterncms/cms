<?php

declare(strict_types=1);

namespace Cms\Modules\Assistant;

use Cms\Abilities\Ability;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Packages\Plugin;
use Cms\Support\Schema\Shape;
use Cms\Users\User;

/**
 * Claude in the workspace: the agent that answers plain language in its threads
 * (Cms\Contracts\Agent). It works only through abilities, as the signed-in user
 * and through the `assistant` transport — the same surface MCP agents get — so it
 * can never do more than the person could do by hand.
 */
final class AssistantModule extends Plugin
{
    public function register(): void
    {
        foreach ([Claude::class, Toolbox::class, Agent::class, Translator::class, Helper::class] as $service) {
            $this->app->singleton($service);
        }

        $this->app->singleton(\Cms\Contracts\Agent::class, static fn ($app) => $app->make(Agent::class));
        $this->app->singleton(\Cms\Contracts\Translator::class, static fn ($app) => $app->make(Translator::class));
    }

    public function boot(): void
    {
        $this->cms()->permissions()->register('assistant.use', 'Use the AI Assistant', 'Assistant', roles: ['editor', 'author']);
        $this->cms()->admin()->widget('assistant-ask', ['label' => 'Ask {brand}', 'description' => 'Ask the assistant from the Dashboard.', 'icon' => 'sparkle', 'column' => 'side', 'order' => 15, 'permission' => 'assistant.use', 'assistant' => false]);

        $this->cms()->settingsRegistry()->register('assistant', fields: [
            ['handle' => 'api_key', 'type' => 'text', 'label' => 'Anthropic API Key', 'secret' => true],
            ['handle' => 'model', 'type' => 'select', 'label' => 'Default Model', 'options' => array_map(static fn (array $model) => $model['name'], Claude::models()), 'default' => Claude::DEFAULT_MODEL, 'required' => true, 'display' => 'dropdown', 'width' => 'half'],
            ['handle' => 'small_model', 'type' => 'select', 'label' => 'Model for Small Tasks', 'options' => array_map(static fn (array $model) => $model['name'], Claude::models()), 'default' => Claude::DEFAULT_SMALL_MODEL, 'required' => true, 'display' => 'dropdown', 'width' => 'half'],
            ['handle' => 'effort', 'type' => 'select', 'label' => 'Effort', 'options' => Claude::efforts(), 'default' => 'medium', 'display' => 'dropdown'],
            ['handle' => 'approval', 'type' => 'select', 'label' => 'Ask Before', 'options' => ['destructive' => __('Deletes and Admin Changes'), 'writes' => __('Every Change')], 'default' => 'destructive', 'display' => 'radio'],
        ], icon: 'sparkle', description: 'API key, models and approvals.', order: 60, section: 'system');

        $this->abilities();

        // The chat offers AI before it is set up: switching to it says what is missing, and where to add it.
        $this->cms()->hooks()->addFilter('admin.manifest', function (array $manifest, User $user) {
            if (! $user->hasPermission('assistant.use') || $this->app->make(Claude::class)->configured()) {
                return $manifest;
            }
            $workspace = (array) ($manifest['config']['workspace'] ?? []);

            return [...$manifest, 'config' => [...($manifest['config'] ?? []), 'workspace' => [...$workspace, 'setup' => [
                'label' => $this->app->make(Agent::class)->label(),
                'to' => $user->hasPermission('settings.manage') ? '/settings/assistant' : null,
            ]]]];
        });

        $this->adminModule();
    }

    private function abilities(): void
    {
        $a = $this->cms()->abilities();
        // What the workspace's composer asks for: the admin's own.
        $expose = Ability::ADMIN_ONLY;

        $a->register('assistant/status', [
            'label' => 'Assistant Status',
            'description' => 'Whether the assistant is set up, the models to pick from and the default one.',
            'permission' => 'assistant.use',
            'annotations' => ['readOnly' => true],
            'expose' => $expose,
            'output' => Shape::of(['configured' => Shape::BOOLEAN, 'model' => Shape::STRING, 'models' => [['id' => Shape::STRING, 'name' => Shape::STRING, 'description' => Shape::STRING]]]),
            'handler' => fn () => [
                'configured' => $this->app->make(Claude::class)->configured(),
                'model' => $this->app->make(Claude::class)->model(),
                'models' => array_map(static fn (string $id, array $model) => ['id' => $id, ...$model], array_keys(Claude::models()), Claude::models()),
            ],
        ]);

        $a->register('assistant/skills', [
            'label' => 'List Assistant Skills',
            'description' => 'What / offers in a thread: the skills this person may use.',
            'permission' => 'assistant.use',
            'annotations' => ['readOnly' => true],
            'expose' => $expose,
            'output' => Shape::of([['name' => Shape::STRING, 'label' => Shape::STRING, 'description' => Shape::STRING, 'icon' => Shape::STRING]]),
            'handler' => fn (array $in, AbilityContext $c) => array_values(array_map(static fn (array $skill) => [
                'name' => $skill['name'], 'label' => __($skill['label']), 'description' => __($skill['description']), 'icon' => $skill['icon'],
            ], $this->cms()->skills()->all($c->user))),
        ]);

        $a->register('assistant-resources/list', [
            'label' => 'List Assistant Resources',
            'description' => 'What @ offers in a thread besides content: the context resources this person may read.',
            'permission' => 'assistant.use',
            'annotations' => ['readOnly' => true],
            'expose' => $expose,
            'output' => Shape::of([['uri' => Shape::STRING, 'name' => Shape::STRING]]),
            'handler' => fn (array $in, AbilityContext $c) => array_map(static fn (array $resource) => ['uri' => $resource['uri'], 'name' => __($resource['name'])], $this->cms()->context()->list($c->user)),
        ]);

        $a->register('assistant-resources/get', [
            'label' => 'Read Assistant Resource',
            'description' => 'One context resource, for a message that attaches it.',
            'permission' => 'assistant.use',
            'annotations' => ['readOnly' => true],
            'expose' => $expose,
            'input' => ['type' => 'object', 'properties' => ['uri' => ['type' => 'string']], 'required' => ['uri']],
            'output' => Shape::of(Shape::STRING),
            'handler' => fn (array $in, AbilityContext $c) => $this->cms()->context()->read($in['uri'], $c->user)['text'] ?? throw new AbilityException(__('Not found.'), 'not_found'),
        ]);
    }
}

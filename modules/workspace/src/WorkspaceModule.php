<?php

declare(strict_types=1);

namespace Cms\Modules\Workspace;

use Illuminate\Support\Facades\Route;
use Cms\Abilities\Ability;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Admin\Translations;
use Cms\Modules\Workspace\Http\TurnController;
use Cms\Packages\Plugin;
use Cms\Users\User;

/**
 * Where people work: a thread at the right edge of every screen of the admin. A command
 * runs an ability and is answered with a view to act on, a search with what was found,
 * plain language by the agent when one is bound (Cms\Contracts\Agent). The whole
 * site can be run from here without AI.
 */
final class WorkspaceModule extends Plugin
{
    public function register(): void
    {
        foreach ([Workspace::class, Answers::class, Search::class, Places::class] as $service) {
            $this->app->singleton($service);
        }
    }

    public function boot(): void
    {
        $cms = $this->cms();

        $this->abilities();

        Route::middleware(['web', 'cms.installed', 'auth:web', 'cms.admin', 'cms.locale', 'throttle:60,1'])
            ->post('/api/admin/workspace/turn', TurnController::class);

        // Whether plain language reaches an agent for this person: without one, nothing in the admin mentions AI.
        $cms->hooks()->addFilter('admin.manifest', function (array $manifest, User $user) {
            $agent = $this->app->make(Workspace::class)->agent();

            return [...$manifest, 'config' => [...($manifest['config'] ?? []), 'workspace' => [
                'agent' => $agent->available($user) ? ['name' => $agent->name(), 'label' => $agent->label()] : null,
            ]]];
        });

        // The foreign key cascades too; this also covers databases that do not enforce it.
        User::deleted(static fn (User $user) => Thread::query()->where('user_id', $user->id)->delete());

        $this->adminModule();
    }

    private function abilities(): void
    {
        $a = $this->cms()->abilities();
        // A thread is its person's: only the admin's own client reads it.
        $mine = Ability::ADMIN_ONLY;
        $threads = static fn (AbilityContext $c) => Thread::query()->where('user_id', $c->user?->id ?? throw new AbilityException(__('Authentication required.'), 'unauthenticated'));
        $workspace = fn () => $this->app->make(Workspace::class);

        $a->register('threads/list', [
            'label' => 'List Chats',
            'description' => 'Your chats, newest first.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'expose' => $mine,
            'input' => ['type' => 'object', 'properties' => ['limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100], 'offset' => ['type' => 'integer', 'minimum' => 0]]],
            'handler' => static fn (array $in, AbilityContext $c) => $threads($c)->latest('updated_at')->orderByDesc('id')->offset($in['offset'] ?? 0)->limit($in['limit'] ?? 30)->get()->map->summary()->all(),
        ]);

        $a->register('threads/get', [
            'label' => 'Get Chat',
            'description' => 'One of your chats as the workspace draws it: its turns, and what waits for your go-ahead.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'expose' => $mine,
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string']], 'required' => ['id']],
            'handler' => static fn (array $in, AbilityContext $c) => $workspace()->show($threads($c)->findOrFail($in['id']), $c->user),
        ]);

        $a->register('threads/rename', [
            'label' => 'Rename Chat',
            'description' => 'Give one of your chats a name, or without one let the agent name it from how it starts.',
            'permission' => 'admin.access',
            'expose' => $mine,
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string'], 'title' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 120]], 'required' => ['id']],
            'handler' => static function (array $in, AbilityContext $c) use ($threads, $workspace) {
                $thread = $threads($c)->findOrFail($in['id']);
                $agent = $workspace()->agent();
                $title = isset($in['title']) ? trim($in['title']) : ($thread->agent === $agent->name() && $agent->available($c->user) ? $agent->title($thread, $c->user) : null);

                if ($title !== null && $title !== '') {
                    $thread->title = $title;
                    $thread->save();
                }

                return $thread->summary();
            },
        ]);

        $a->register('threads/delete', [
            'label' => 'Delete Chat',
            'description' => 'Delete one of your chats.',
            'permission' => 'admin.access',
            'annotations' => ['destructive' => true],
            'expose' => $mine,
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string']], 'required' => ['id']],
            'handler' => static fn (array $in, AbilityContext $c) => ['deleted' => (bool) $threads($c)->whereKey($in['id'])->delete()],
        ]);

        $a->register('workspace/search', [
            'label' => 'Search the Admin',
            'description' => 'Places, content and people you may see that match a query, grouped, each with where it is in the admin.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'expose' => ['mcp' => false, 'assistant' => false],
            'input' => ['type' => 'object', 'properties' => ['query' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 200]], 'required' => ['query']],
            'handler' => fn (array $in, AbilityContext $c) => $this->app->make(Search::class)->run($in['query'], $c->user ?? throw new AbilityException(__('Authentication required.'), 'unauthenticated')),
        ]);

        // The agent's hand on the admin: it opens a place for the person, in their browser. Not for MCP, the API or the CLI, which have no admin open.
        $a->register('admin/open', [
            'label' => 'Open in Admin',
            'description' => 'Open a place of the admin for the person, in the admin they have open: the screen moves there, with this thread beside it. `to` is a path of the admin without /admin: /content/<collection>/<entry id> for an entry, /content/<collection> for a list, /settings/<namespace> for a settings page, /users, /forms, /navigation/<handle>, /media. Add ?tab=<id> to open a tab (/users?tab=visitors), ?field=<handle> to open a form at one field (/settings/site?field=name), ?do=<name> to start one of the place\'s named actions (/forms?do=new-form). The context note says where the person is now (Admin page). Open what the person asks to see, and what you just made or changed when they want to look at it. `label` names the place for them, such as the page title.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true, 'trustedOutput' => true],
            'expose' => ['rest' => false, 'mcp' => false, 'cli' => false],
            'input' => ['type' => 'object', 'properties' => [
                'to' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 300],
                'label' => ['type' => 'string', 'maxLength' => 120],
            ], 'required' => ['to']],
            'handler' => fn (array $in, AbilityContext $c) => $this->app->make(Places::class)->open((string) $in['to'], $c->user ?? throw new AbilityException(__('Authentication required.'), 'unauthenticated'), $in['label'] ?? null),
        ]);

        $a->register('workspace/commands', [
            'label' => 'List Commands',
            'description' => 'What / offers in a chat: the abilities you may run, grouped by what they belong to, with their input.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'expose' => $mine,
            'handler' => fn (array $in, AbilityContext $c) => $this->runnable($c),
        ]);
    }

    /** A schema's names for people (`title`, and the `x-labels` of a choice) in their language. */
    private static function worded(array $schema, Translations $t): array
    {
        foreach ($schema as $key => $value) {
            if ($key === 'title' && is_string($value)) {
                $schema[$key] = $t->label($value);
            } elseif ($key === 'x-labels' && is_array($value)) {
                $schema[$key] = array_map(static fn ($label) => is_string($label) ? $t->label($label) : $label, $value);
            } elseif (is_array($value)) {
                $schema[$key] = self::worded($value, $t);
            }
        }

        return $schema;
    }

    /** The abilities a person may run from a thread, in their language: not the admin's own plumbing (threads, views, what only its screens call). */
    private function runnable(AbilityContext $context): array
    {
        $t = $this->app->make(Translations::class);
        $packages = $this->cms()->packages()->repository();
        $groups = [];
        $out = [];

        foreach ($this->cms()->abilities()->available(AbilityContext::forUser($context->user, 'admin')) as $ability) {
            /** @var Ability $ability */
            if (! $ability->exposedTo('rest') || in_array($ability->category, ['threads', 'workspace', 'views', 'abilities'], true)) {
                continue;
            }
            $package = $ability->package ?? 'cms';
            $groups[$package] ??= $t->label($packages->find($package)?->label ?? 'System');
            $out[] = [
                'name' => $ability->name,
                'label' => $t->label($ability->label),
                'group' => $groups[$package],
                'icon' => $packages->find($package)?->icon ?? 'command',
                'input' => self::worded($ability->input === [] ? ['type' => 'object'] : $ability->input, $t),
                'destructive' => $ability->isDestructive(),
                'readOnly' => $ability->isReadOnly(),
            ];
        }

        usort($out, static fn ($a, $b) => strnatcasecmp($a['group'], $b['group']) ?: strnatcasecmp($a['label'], $b['label']));

        return $out;
    }
}

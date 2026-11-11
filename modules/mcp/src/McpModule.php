<?php

declare(strict_types=1);

namespace Cms\Modules\Mcp;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Cms\Abilities\AbilityContext;
use Cms\Modules\Audit\AuditAbilities;
use Cms\Modules\Mcp\Http\McpController;
use Cms\Modules\Mcp\OAuth\OAuthController;
use Cms\Packages\Plugin;
use Cms\Support\Schema\Shape;

final class McpModule extends Plugin
{
    public function register(): void
    {
        $this->app->singleton(Server::class);
        $this->app->singleton(Prompts::class);
    }

    public function boot(): void
    {
        Route::middleware(['throttle:cms-api'])->group(static function (): void {
            Route::post('/mcp', [McpController::class, 'handle']);
            Route::match(['get', 'delete'], '/mcp', [McpController::class, 'notAllowed']);
        });

        Route::middleware(['throttle:30,1'])->group(static function (): void {
            Route::get('/.well-known/oauth-protected-resource/{any?}', [OAuthController::class, 'protectedResource'])->where('any', '.*');
            Route::get('/.well-known/oauth-authorization-server/{any?}', [OAuthController::class, 'metadata'])->where('any', '.*');
            Route::post('/oauth/register', [OAuthController::class, 'register']);
            Route::post('/oauth/token', [OAuthController::class, 'token']);
            Route::post('/oauth/revoke', [OAuthController::class, 'revoke']);
        });

        Route::middleware(['web', 'cms.installed', 'cms.locale'])->group(static function (): void {
            Route::get('/oauth/authorize', [OAuthController::class, 'authorize']);
            Route::post('/oauth/authorize', [OAuthController::class, 'approve'])->middleware('auth:web');
        });

        $this->abilities();
        $this->cms()->admin()->widget('mcp-agents', ['label' => 'Agents', 'description' => 'AI agents connected to your account and what they changed lately.', 'icon' => 'mcp', 'column' => 'side', 'order' => 70, 'permission' => 'tokens.manage']);
        $this->adminModule();
        $this->cms()->admin()->command('connect-mcp', ['label' => 'Connect an AI Agent (MCP)', 'icon' => 'mcp', 'path' => '/account#mcp', 'keywords' => ['claude', 'cursor', 'agent', 'mcp', 'ai']]);
    }

    private function abilities(): void
    {
        $abilities = $this->cms()->abilities();

        $abilities->register('mcp/agents', [
            'label' => 'Connected Agents',
            'description' => 'AI agents (MCP clients) signed in to your account with OAuth, when each was last active, and the latest changes made through MCP as you.',
            'permission' => 'tokens.manage',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 20, 'default' => 5]]],
            'output' => Shape::of([
                'agents' => [['name' => Shape::STRING, 'connectedAt' => Shape::STRING_OR_NULL, 'lastUsedAt' => Shape::STRING_OR_NULL]],
                'connected' => Shape::INTEGER,
                'activity' => [['id' => Shape::STRING, 'ability' => Shape::STRING, 'label' => Shape::STRING, 'subject' => Shape::STRING_OR_NULL, 'to' => Shape::STRING_OR_NULL, 'createdAt' => Shape::STRING_OR_NULL]],
            ]),
            'handler' => function (array $in, AbilityContext $ctx) {
                $agents = $ctx->user->tokens()->where('name', 'like', 'MCP: %')
                    ->where(static fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                    ->get()
                    ->groupBy('name')
                    ->map(static fn ($tokens, string $name) => [
                        'name' => substr($name, 5),
                        'connectedAt' => $tokens->min('created_at')?->toIso8601String(),
                        'lastUsedAt' => $tokens->max('last_used_at')?->toIso8601String(),
                    ])
                    ->sortByDesc(static fn ($a) => $a['lastUsedAt'] ?? $a['connectedAt'])
                    ->values();

                // What agents did, in the Audit Log's words, while it keeps one.
                $activity = ! $this->cms()->isActive('letterncms/audit') ? [] : array_map(static fn (array $d) => [
                    'id' => $d['row']->id, 'ability' => $d['row']->ability, 'label' => $d['label'], 'subject' => $d['subject'], 'to' => $d['to'], 'createdAt' => $d['createdAt'],
                ], $this->app->make(AuditAbilities::class)->describe(
                    DB::table('audit_log')->where('transport', 'mcp')->where('user_id', $ctx->user->id)->orderByDesc('created_at')->limit($in['limit'])->get(),
                ));

                return ['agents' => $agents->take($in['limit'])->all(), 'connected' => $agents->count(), 'activity' => $activity];
            },
        ]);
    }
}

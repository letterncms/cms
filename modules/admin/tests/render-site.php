#!/usr/bin/env php
<?php

/** Read-only bridge from browser fixtures to an actual development site's renderer. */
declare(strict_types=1);

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Http\Request;
use Cms\Abilities\AbilityContext;
use Cms\Foundation\Bootstrap;
use Cms\Cms;
use Cms\Site\Http\SiteController;
use Cms\Users\User;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
$options = getopt('', ['site:', 'help']);
if (isset($options['help']) || ! isset($options['site'])) {
    fwrite(STDERR, "Usage: php cms/themes/admin/tests/render-site.php --site=/path/to/site < request.json\n\nRead: {\"operation\":\"read\",\"collection\":\"pages\",\"slug\":\"home\"}\nRender: {\"id\":\"existing-entry-id\",\"title\":\"Unsaved title\",\"data\":{...}}\nUnsaved and standalone render bodies follow POST /__preview.\nUses an existing superadmin; creates no account, session, token or content.\n");
    exit(isset($options['help']) ? 0 : 1);
}
$site = realpath((string) $options['site']);
if (! $site || ! is_file($site.'/cms') || ! is_dir($site.'/content')) {
    fwrite(STDERR, "Choose an existing development site directory.\n");
    exit(1);
}

try {
    $input = json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR);
    if (! is_array($input) || array_is_list($input) && $input !== []) {
        throw new InvalidArgumentException('A JSON request object is required.');
    }
    $installation = dirname(__DIR__, 3);
    require $installation.'/vendor/autoload.php';
    $app = Bootstrap::create($installation, $site);
    $app->make(Kernel::class)->bootstrap();
    $cms = $app->make(Cms::class);
    $user = User::query()->where('super', true)->orderBy('created_at')->first();
    if (! $user) {
        throw new RuntimeException('An existing super administrator is required; no account will be created or changed.');
    }

    $operation = $input['operation'] ?? 'render';
    if ($operation === 'read') {
        $handle = $input['collection'] ?? null;
        $collection = is_string($handle) ? $cms->collections()->find($handle) : null;
        if (! $collection) {
            throw new InvalidArgumentException('Choose an existing collection.');
        }
        $id = $input['id'] ?? null;
        if (is_string($id) && $id !== '') {
            $entry = $cms->entries()->find($id);
            if ($entry && $entry->collection !== $handle) {
                throw new InvalidArgumentException('The entry belongs to another collection.');
            }
        } else {
            $query = $cms->entries()->query()->collection($handle)->orderBy($collection->sort);
            if (is_string($input['slug'] ?? null)) $query->where('slug', $input['slug']);
            if (is_string($input['locale'] ?? null)) $query->locale($input['locale']);
            $entry = $query->first();
        }
        // Invoke these fixed read-only handlers directly so optional read auditing cannot write.
        $catalog = static function (string $name, array $input = []) use ($cms, $app, $user): mixed {
            $ability = $cms->abilities()->get($name);
            if (! $ability || ! $ability->isReadOnly()) {
                return null;
            }

            return $app->call($ability->handler, ['in' => $input, 'input' => $input, 'context' => AbilityContext::forUser($user, 'admin-test')]);
        };
        $output = [
            'collection' => $collection->toArray(),
            'entry' => $entry?->toArray(),
            'catalog' => $catalog('blocks/types'),
            'design' => $catalog('design/get'),
            'patterns' => $catalog('patterns/list', ['working' => true]),
            'site' => [
                'name' => config('app.name'), 'url' => $cms->site('url', config('app.url')),
                'locales' => $cms->locales(), 'defaultLocale' => $cms->defaultLocale(),
                'timezone' => config('app.timezone'),
            ],
        ];
    } elseif ($operation === 'render') {
        $id = $input['id'] ?? null;
        if ($id !== null && ! is_string($id)) {
            throw new InvalidArgumentException('Entry id must be a string.');
        }
        unset($input['operation'], $input['id']);
        $request = Request::create('http://localhost/__preview'.($id !== null ? '/'.$id : ''), 'POST', server: ['CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json'], content: json_encode($input, JSON_THROW_ON_ERROR));
        $app->instance('request', $request);
        $request->setUserResolver(static fn () => $user);
        $response = $app->make(SiteController::class)->render($request, $id);
        $output = ['status' => $response->getStatusCode(), 'document' => $response->headers->get('X-Cms-Editor-Document'), 'html' => $response->getContent()];
    } else {
        throw new InvalidArgumentException('Supported operations are read and render.');
    }
    echo json_encode($output, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)."\n";
} catch (Throwable $e) {
    $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;
    echo json_encode(['status' => $status, 'error' => $e->getMessage()], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)."\n";
    exit(1);
}

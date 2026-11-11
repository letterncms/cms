<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Build;

use Cms\Support\Brand;
use Closure;
use Cms\Content\Collections\Archives;
use Cms\Content\Entries\Entry;
use Cms\Contracts\SiteBuilder as SiteBuilderContract;
use Cms\Extend\Hooks;
use Cms\Cms;
use Cms\Modules\Media\MediaManifest;
use Cms\Modules\Site\Design\Code;
use Cms\Modules\Site\Rendering\PageContext;
use Cms\Modules\Site\Rendering\Renderer;
use Cms\Support\Files;
use Throwable;

/**
 * Static site generation into public/.
 *
 * - Full builds render every live, routable entry (+ pagination pages + extras such
 *   as sitemap.xml registered through the `site.build.extras` filter).
 * - Incremental builds re-render only pages that depend on what changed; dependencies
 *   are recorded while rendering (collections, entries, globals).
 * - Work is chunked: CLI runs it all, the web processes it after responses are sent
 *   and while the admin polls — no worker or cron required on shared hosting.
 */
final class SiteBuilder implements SiteBuilderContract
{
    private const array RESERVED = ['_cms', 'media', 'api', 'admin', 'install'];

    public function __construct(
        private readonly Cms $cms,
        private readonly Renderer $renderer,
        private readonly Hooks $hooks,
        private readonly Archives $archives,
    ) {}

    public function available(): bool
    {
        return (bool) $this->cms->setting('site', 'static', true);
    }

    public function queue(?array $uris = null, string $reason = ''): void
    {
        $queue = $this->readQueue();

        if ($uris === null) {
            $queue = ['all' => true, 'items' => [], 'done' => 0, 'total' => 0, 'state' => 'queued', 'reason' => $reason ?: __('Full Rebuild'), 'startedAt' => null, 'errors' => []];
        } else {
            $items = array_values(array_unique([...($queue['items'] ?? []), ...array_map(static fn ($u) => 'uri:'.$u, $uris), 'extras']));
            $queue = array_replace($queue, ['items' => $items, 'state' => 'queued', 'reason' => $reason ?: ($queue['reason'] ?? __('Changes'))]);
        }

        $this->writeQueue($queue);
    }

    /** Something on the page being built isn't right, without being a reason to stop (see `render.warning`). */
    public function warn(string $message): void
    {
        $this->warnings[] = $message;
    }

    /** Queue the pages showing a changed media item. */
    public function queueForMedia(string $id): void
    {
        $this->queueForDependency('media:'.$id, __('Media changed'));
    }

    /** Queue the pages that recorded this while they were built. A plugin records its own with the `render.depend` action. */
    public function queueForDependency(string $dependency, string $reason = ''): void
    {
        $uris = array_keys(array_filter($this->readManifest()['pages'], static fn (array $page) => in_array($dependency, $page['deps'] ?? [], true)));

        $uris !== [] && $this->queue(array_map('strval', $uris), $reason);
    }

    /** Queue the pages affected by a changed entry. */
    public function queueForEntry(Entry $entry, string $reason = ''): void
    {
        $manifest = $this->readManifest();
        $uris = [];

        foreach ($manifest['pages'] as $uri => $page) {
            $deps = $page['deps'] ?? [];

            if (in_array('entry:'.$entry->id, $deps, true) || in_array('collection:'.$entry->collection, $deps, true) || ($page['entry'] ?? null) === $entry->id) {
                $uris[] = (string) $uri;
            }
        }

        if ($entry->uri !== null) {
            $uris[] = $entry->uri;
        }

        // A term's archives: the ones built (a renamed term's old address is found gone and removed) and the ones it has now.
        foreach ($manifest['pages'] as $uri => $page) {
            ($page['archive'] ?? null) === $entry->id && $uris[] = (string) $uri;
        }

        foreach ($this->archives->of($entry) as $archive) {
            $uris[] = $archive['uri'];
        }

        $this->queue(array_values(array_unique($uris)), $reason ?: __('Updated “:title”', ['title' => $entry->title]));
    }

    public function status(): array
    {
        $queue = $this->readQueue();
        $manifest = $this->readManifest();
        $total = max(1, (int) ($queue['total'] ?? 0));

        return [
            'state' => (string) ($queue['state'] ?? 'idle'),
            'progress' => ($queue['state'] ?? 'idle') === 'running' ? round(($queue['done'] ?? 0) / $total, 3) : (($queue['state'] ?? 'idle') === 'queued' ? 0.0 : 1.0),
            'message' => (string) ($queue['reason'] ?? ''),
            'pending' => count($queue['items'] ?? []) + (! empty($queue['all']) ? 1 : 0),
            'finishedAt' => $manifest['builtAt'] ?? null,
            'pages' => count($manifest['pages']),
            'errors' => array_slice($queue['errors'] ?? [], 0, 20),
            'warnings' => array_slice($queue['warnings'] ?? [], 0, 200),
            'enabled' => $this->available(),
        ];
    }

    public function hasWork(): bool
    {
        $queue = $this->readQueue();

        if (! empty($queue['all']) || ! empty($queue['items'])) {
            return true;
        }

        // Built with another CMS version, plugin or runtime: pages may point at scripts and styles that are gone.
        if ($this->available() && is_file(storage_path('build/manifest.json')) && @file_get_contents(storage_path('build/signature')) !== $this->signature()) {
            $this->queue(null, __(':brand or a plugin was updated'));

            return true;
        }

        return $this->available() && $this->codeChanged();
    }

    /**
     * Scripts and styles beside the design change on disk (an editor, git, an agent) with nobody
     * telling the CMS. Pages say which they load, so only those are built again: a stylesheet's
     * pages, and for a script every page with an import map, since any script may import it.
     */
    private function codeChanged(): bool
    {
        $code = $this->cms->app()->make(Code::class);
        $seen = Files::readJson(storage_path('build/code.json'));

        if (($seen['stamp'] ?? null) === ($stamp = $code->stamp())) {
            return false;
        }

        $code->flush();
        $files = $this->rememberCode($code, $stamp);

        if (! is_file(storage_path('build/manifest.json')) || ! $this->cms->setting('site', 'auto_build', true)) {
            return false;
        }

        $before = (array) ($seen['files'] ?? []);
        $changed = array_keys(array_diff_assoc($files, $before) + array_diff_key($before, $files));

        if (in_array('code.json', $changed, true)) {
            $this->queue(null, __('Design code changed'));

            return true;
        }

        $dependencies = array_map(static fn (string $file) => 'design:'.$file, $changed);
        array_filter($changed, static fn (string $file) => str_starts_with($file, 'scripts/')) !== [] && $dependencies[] = 'design:importmap';
        $pages = $this->readManifest()['pages'];
        $uris = array_keys(array_filter($pages, static fn (array $page) => array_intersect($dependencies, $page['deps'] ?? []) !== []));
        $uris !== [] && $this->queue(array_map('strval', $uris), __('Design code changed'));

        return $uris !== [];
    }

    /** @return array<string, string> what each file beside the design holds now */
    private function rememberCode(Code $code, ?string $stamp = null): array
    {
        Files::putJson(storage_path('build/code.json'), ['stamp' => $stamp ?? $code->stamp(), 'files' => $files = $code->fingerprints()]);

        return $files;
    }

    /** Process queued work for up to $budgetMs milliseconds. */
    public function process(int $budgetMs = 3000): array
    {
        if (! $this->available() || ! $this->hasWork()) {
            return $this->status();
        }

        // This often runs after somebody's request, and what it writes is for everybody.
        return $this->cms->asVisitor(fn () => PageContext::building(fn () => $this->work($budgetMs)));
    }

    private function work(int $budgetMs): array
    {
        // One builder at a time: whoever finds it busy reports how far it got.
        Files::locked(storage_path('framework/build.lock'), fn () => $this->step($budgetMs), static fn () => null);

        return $this->status();
    }

    private function step(int $budgetMs): void
    {
        $deadline = microtime(true) + $budgetMs / 1000;
        $queue = $this->readQueue();
        $manifest = $this->readManifest();

        if (! empty($queue['all']) || (! empty($queue['full']) && ! isset($queue['generation']))) {
            $queue = $this->expandFull($queue, $manifest);
            $this->rememberCode($this->cms->app()->make(Code::class));
            Files::put(storage_path('build/signature'), $this->signature());
        }

        $queue['state'] = 'running';
        $queue['startedAt'] ??= now()->toIso8601String();

        while ($queue['items'] !== [] && microtime(true) < $deadline) {
            $item = array_shift($queue['items']);

            $this->warnings = [];

            try {
                $more = $this->buildItem($item, $manifest, $queue['generation'] ?? null);
                array_push($queue['items'], ...array_diff($more, $queue['items']));
                $queue['total'] = max((int) $queue['total'], (int) $queue['done'] + count($queue['items']) + 1);
            } catch (Throwable $e) {
                report($e);
                $queue['errors'][] = "{$item}: {$e->getMessage()}";
            }

            foreach (array_unique($this->warnings) as $warning) {
                $queue['warnings'][] = ['uri' => preg_replace('/^uri:|#.*$/', '', $item), 'message' => $warning];
            }

            $queue['done'] = (int) ($queue['done'] ?? 0) + 1;
        }

        if ($queue['items'] === []) {
            if (! empty($queue['full'])) {
                $this->removeStale($manifest, $queue['generation']);
            }

            $manifest['builtAt'] = now()->toIso8601String();
            $queue = ['all' => false, 'items' => [], 'done' => $queue['done'], 'total' => $queue['done'], 'state' => 'done', 'reason' => $queue['reason'] ?? '', 'errors' => $queue['errors'] ?? [], 'warnings' => $queue['warnings'] ?? []];
            // Every page now names the current scripts and styles: the versions before them can go.
            $this->cms->app()->make(Code::class)->sweep();
            $this->hooks->dispatch('site.built', $manifest);
        }

        $this->writeManifest($manifest);
        $this->writeQueue($queue);
    }

    /** Build everything now (CLI). */
    public function buildAll(?Closure $progress = null): array
    {
        // content/media may have come in with git or FTP.
        $this->cms->app()->make(MediaManifest::class)->import();
        $this->queue(null, __('Full Build'));

        while ($this->hasWork()) {
            $status = $this->process(10_000);
            $progress && $progress($status);
        }

        return $this->status();
    }

    /** Remove a built page (unpublished/deleted/moved entries). */
    public function forget(string $uri): void
    {
        $manifest = $this->readManifest();

        $this->forgetIn($manifest, $uri);
        $this->writeManifest($manifest);
    }

    public function forgetEntry(Entry $entry): void
    {
        $archives = null;

        foreach ($this->readManifest()['pages'] as $uri => $page) {
            if (($page['entry'] ?? null) === $entry->id && ($uri !== $entry->uri || ! $this->buildable($entry))) {
                $this->forget((string) $uri);
            }

            // A term's archives go with it: when it is deleted or no longer on the site for everybody, or the address moved.
            if (($page['archive'] ?? null) === $entry->id) {
                $archives ??= $this->buildable($entry) && $this->cms->entries()->find($entry->id) !== null ? array_column($this->archives->of($entry), 'uri') : [];
                in_array((string) $uri, $archives, true) || $this->forget((string) $uri);
            }
        }
    }

    /** A file is for everybody: anything behind the gate only ever renders per request. */
    private function buildable(Entry $entry): bool
    {
        return $entry->isLive() && ! $this->cms->entries()->gate()->isGated($entry);
    }

    /** @return array<string, array{path: string, render: callable(): string}> */
    public function extras(): array
    {
        return $this->hooks->filter('site.build.extras', []);
    }

    private function expandFull(array $queue, array $manifest): array
    {
        $items = [];

        foreach ($this->cms->collections()->all() as $collection) {
            if (! $collection->routable()) {
                continue;
            }

            foreach ($this->cms->entries()->query()->collection($collection->handle)->live()->get() as $entry) {
                if ($entry->uri !== null && $this->buildable($entry)) {
                    $items[] = 'uri:'.$entry->uri.'#'.$entry->locale;
                }
            }
        }

        // Every live term's archive of every collection that has one.
        foreach ($this->archives->all() as $archive) {
            $term = $this->archives->term($archive['term']);

            if ($term && $this->buildable($term)) {
                $items[] = 'uri:'.$archive['uri'].'#'.$archive['locale'];
            }
        }

        $items[] = 'notfound';
        $items[] = 'extras';

        return ['all' => false, 'full' => true, 'items' => $items, 'done' => 0, 'total' => count($items), 'state' => 'running', 'reason' => $queue['reason'] ?? __('Full Rebuild'), 'startedAt' => now()->toIso8601String(), 'generation' => bin2hex(random_bytes(12)), 'errors' => []];
    }

    /** @return list<string> follow-up items (pagination) */
    private function buildItem(string $item, array &$manifest, ?string $generation = null): array
    {
        if ($item === 'extras') {
            $extras = $this->extras();

            // A file nothing produces any more, like the sitemap of a language the site dropped, goes with it.
            foreach ($manifest['extras'] as $key => $path) {
                if (! isset($extras[$key])) {
                    $this->deleteFile(ltrim((string) $path, '/'));
                    unset($manifest['extras'][$key]);
                }
            }

            foreach ($extras as $key => $extra) {
                $this->write(ltrim($extra['path'], '/'), ($extra['render'])());
                $manifest['extras'][$key] = $extra['path'];
            }

            return [];
        }

        if ($item === 'notfound') {
            $this->write('404.html', $this->renderer->notFound()['html']);

            return [];
        }

        [$uri, $locale] = array_pad(explode('#', substr($item, 4), 2), 2, null);
        $page = 1;

        if (preg_match('#^(.*)/page/(\d+)$#', $uri, $m)) {
            [$uri, $page] = [$m[1] === '' ? '/' : $m[1], (int) $m[2]];
        }

        $entry = $this->cms->entries()->findByUri($uri, $locale ?: null);
        // Not a page of its own: a term's archive, built for as long as the term is on the site.
        $archive = $entry ? null : $this->archives->at($uri, $locale ?: null);
        $entry ??= $archive ? $this->cms->entries()->find($archive['term']) : null;
        $key = $page > 1 ? rtrim($uri, '/')."/page/{$page}" : $uri;

        if (! $entry || ! $this->buildable($entry)) {
            $this->forgetIn($manifest, $key);

            return [];
        }

        $result = $archive ? $this->renderer->archive($entry, $archive, $page) : $this->renderer->entry($entry, $page);

        // A page number past the last one (the list got shorter since it was queued) is no page.
        if ($page > 1 && $page > $result['context']->pages) {
            $this->forgetIn($manifest, $key);

            return [];
        }

        $file = $this->fileFor($key);
        $this->write($file, $result['html']);

        // An archive is the term's page at another address: it is the term's to rebuild, not its own page to move.
        $manifest['pages'][$key] = ['file' => $file, 'entry' => $archive ? null : $entry->id, ...($archive ? ['archive' => $archive['term']] : []), 'deps' => array_values(array_unique([...array_keys($result['context']->dependencies), ...($archive ? ['entry:'.$entry->id] : [])])), 'builtAt' => now()->toIso8601String(), 'generation' => $generation];
        // Who writes something beside the page (a Markdown version) gets the page's entry: on an archive, the term at the archive's address.
        $this->hooks->dispatch('site.page.built', $key, $archive ? ($result['context']->entry ?? $entry) : $entry, $file, $page);

        $follow = [];

        if ($page === 1) {
            for ($p = 2; $p <= min($result['context']->pages, 500); $p++) {
                $follow[] = 'uri:'.rtrim($uri, '/')."/page/{$p}#".$entry->locale;
            }

            // Drop pagination pages that no longer exist.
            foreach (array_keys($manifest['pages']) as $existing) {
                if (preg_match('#^'.preg_quote(rtrim($uri, '/'), '#').'/page/(\d+)$#', (string) $existing, $m) && (int) $m[1] > $result['context']->pages) {
                    $this->forgetIn($manifest, (string) $existing);
                }
            }
        }

        return $follow;
    }

    private function forgetIn(array &$manifest, string $uri): void
    {
        if (isset($manifest['pages'][$uri])) {
            $this->hooks->dispatch('site.page.removed', $uri, $manifest['pages'][$uri]['file']);
            $this->deleteFile($manifest['pages'][$uri]['file']);
            unset($manifest['pages'][$uri]);
        }
    }

    /** A full build owns an explicit generation; same-second removals are stale too. */
    private function removeStale(array &$manifest, string $generation): void
    {
        foreach ($manifest['pages'] as $uri => $page) {
            if (($page['generation'] ?? null) !== $generation) {
                $this->forgetIn($manifest, (string) $uri);
            }
        }
    }

    private function fileFor(string $uri): string
    {
        $uri = trim($uri, '/');

        if ($uri === '') {
            return 'index.html';
        }

        $first = explode('/', $uri)[0];

        if (in_array($first, self::RESERVED, true)) {
            throw new \RuntimeException(__('The URL /:uri uses a reserved path.', ['uri' => $uri]));
        }

        return $uri.'/index.html';
    }

    /** Write a file into public/ (also used by plugins writing build artifacts). */
    public function write(string $relative, string $contents): void
    {
        Files::put(Files::within(public_path(), $relative), $contents);
    }

    public function deleteFile(string $relative): void
    {
        $path = Files::within(public_path(), $relative);
        @unlink($path);

        // Remove now-empty directories up to public/.
        for ($dir = dirname($path); $dir !== public_path() && is_dir($dir) && count(scandir($dir) ?: []) === 2; $dir = dirname($dir)) {
            @rmdir($dir);
        }
    }

    private function readQueue(): array
    {
        return Files::readJson(storage_path('build/queue.json')) ?: ['all' => false, 'items' => [], 'state' => 'idle'];
    }

    private function writeQueue(array $queue): void
    {
        Files::putJson(storage_path('build/queue.json'), $queue);
    }

    private function readManifest(): array
    {
        $data = Files::readJson(storage_path('build/manifest.json'));

        return ['pages' => (array) ($data['pages'] ?? []), 'extras' => (array) ($data['extras'] ?? []), 'builtAt' => $data['builtAt'] ?? null];
    }

    /** What every page is built with: package versions, plus what plugins add with the `site.build.signature` filter (the blocks runtime). */
    private function signature(): string
    {
        $parts = array_map(static fn ($package) => $package->name.'@'.$package->version, array_values($this->cms->packages()->active()));

        return md5((string) json_encode($this->hooks->filter('site.build.signature', [...$parts, 'brand' => Brand::signature()])));
    }

    private function writeManifest(array $manifest): void
    {
        Files::putJson(storage_path('build/manifest.json'), $manifest);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\Site;

use Illuminate\Support\Facades\Route;
use Cms\Modules\Blocks\Anchors;
use Cms\Modules\Blocks\BlocksDocument;
use Cms\Modules\Blocks\Scope;
use Cms\Modules\Blocks\Templates;
use Cms\Content\Collections\Collection;
use Cms\Content\Entries\Entry;
use Cms\Contracts\SiteBuilder as SiteBuilderContract;
use Cms\Packages\Plugin;
use Cms\Support\Schema\Shape;
use Cms\Modules\Site\Build\SiteBuilder;
use Cms\Modules\Site\Design\Code;
use Cms\Modules\Site\Design\CodeAbilities;
use Cms\Modules\Site\Design\Design;
use Cms\Modules\Site\Design\DesignCompiler;
use Cms\Modules\Site\Design\DesignJson;
use Cms\Modules\Site\Design\ControlSizes;
use Cms\Modules\Site\Design\FieldStyles;
use Cms\Modules\Site\Design\Fonts;
use Cms\Modules\Site\Design\HttpVendorFetcher;
use Cms\Modules\Site\Design\Vendor;
use Cms\Modules\Site\Design\VendorAbilities;
use Cms\Modules\Site\Design\VendorFetcher;
use Cms\Modules\Site\Http\PublicPage;
use Cms\Modules\Site\Http\SiteController;
use Cms\Modules\Site\Rendering\AugmentedEntry;
use Cms\Modules\Site\Rendering\EntryQueryProxy;
use Cms\Modules\Site\Rendering\HtmlMinifier;
use Cms\Modules\Site\Rendering\PageContext;
use Cms\Modules\Site\Rendering\Renderer;
use Cms\Modules\Site\Rendering\UrlGenerator;
use Cms\Users\User;

final class SiteModule extends Plugin
{
    public function register(): void
    {
        require_once __DIR__.'/helpers.php';

        foreach ([Design::class, Code::class, Vendor::class, DesignCompiler::class, Fonts::class, Renderer::class, HtmlMinifier::class, UrlGenerator::class, SiteBuilder::class] as $service) {
            $this->app->singleton($service);
        }

        $this->app->singleton(SiteBuilderContract::class, SiteBuilder::class);
        $this->app->bind(VendorFetcher::class, HttpVendorFetcher::class);
    }

    public function boot(): void
    {
        // An agent's way into the design system: `/adjust-design` in the assistant's chat, a prompt for MCP clients.
        $this->cms()->skills()->register('adjust-design', [
            'label' => 'Adjust the Design',
            'description' => 'Change the design system so the site feels a certain way.',
            'icon' => 'palette',
            'prompt' => 'Change the design system so the site feels the way asked here: {feel}. Read cms://site/design first and change design tokens rather than individual blocks. Say what you changed and why.',
            'arguments' => [['name' => 'feel', 'description' => 'How the site should feel', 'required' => true]],
            'permission' => 'settings.manage',
        ]);

        $this->renderHooks();
        $this->dataSources();
        $this->archives();
        $this->routes();
        $this->settingsSchema();
        $this->abilities();
        CodeAbilities::register($this->cms(), fn () => $this->app->make(Code::class));
        VendorAbilities::register($this->cms(), fn () => $this->app->make(Vendor::class), fn () => $this->app->make(Code::class));
        $this->buildTriggers();
        $this->adminUi();
        $this->agentContext();

        $this->cms()->hooks()->on('cms.installed', fn (User $user) => $this->app->make(Starter::class)->seed($user));

        if ($this->app->runningInConsole()) {
            $this->commands([Console\BuildCommand::class, Console\CheckLinksCommand::class, Console\StarterRefreshCommand::class, Console\VendorCommand::class]);
        }
    }

    /** Let modules and plugins (blocks, seo…) contribute to the page being rendered. */
    private function renderHooks(): void
    {
        $hooks = $this->cms()->hooks();
        $design = fn () => $this->app->make(Design::class);

        $hooks->on('render.style', static fn (string $key, string $css, int $order = 0) => PageContext::current()?->addStyle($key, $css, $order));
        $hooks->on('render.head', static fn (string $key, string $html) => PageContext::current()?->addHead($key, $html));
        $hooks->on('render.foot', static fn (string $key, string $html) => PageContext::current()?->addFoot($key, $html));
        $code = fn () => $this->app->make(Code::class);
        $hooks->on('render.code', static fn (array $names) => PageContext::current()?->addCode($names));
        $hooks->on('render.component', static fn (string $handle) => PageContext::current()?->addCode($code()->for('components', $handle)));
        $hooks->on('design.saved', static fn () => $code()->flush());
        // A block's behaviour names a script: its published file, on a page that then depends on it.
        $hooks->addFilter('blocks.behavior', static function (?string $url, string $module) use ($code, $hooks) {
            $context = PageContext::current();
            $url = $code()->url('scripts', $module);

            if ($context !== null) {
                $context->dependencies["design:scripts/{$module}"] = true;
                $context->modules = $context->modules || $url !== null;
            }

            $url === null && $hooks->dispatch('render.warning', __('This page names :file, which is not in content/design.', ['file' => "scripts/{$module}.js"]));

            return $url;
        });
        $hooks->on('render.depend', static fn (string $key) => PageContext::depend($key));
        // Mail wears the site's colours, from whichever tokens this design has.
        $hooks->addFilter('email.colors', static function (array $colors) use ($design) {
            $token = static fn (string $path, string $fallback) => is_string($value = $design()->json()->token($path)) && $value !== '' ? $value : $fallback;

            return [...$colors, 'background' => $token('color.background', $colors['background']), 'card' => $token('color.raised', $colors['card']), 'text' => $token('color.ink', $token('color.foreground', $colors['text'])), 'muted' => $token('color.muted', $colors['muted']), 'line' => $token('color.line', $colors['line']), 'button' => $token('color.primary', $colors['button']), 'button_text' => $token('color.primary-foreground', $colors['button_text'])];
        });
        $hooks->on('render.warning', fn (string $message) => $this->app->make(SiteBuilder::class)->warn($message));

        $hooks->addFilter('site.build.extras', fn (array $extras) => $this->cms()->setting('site', 'search_index', true)
            ? [...$extras, 'search' => ['path' => 'search.json', 'render' => fn () => $this->app->make(Search\SearchIndex::class)->json()]]
            : $extras);
        // An animation's ease can be a curve of the design: token:ease.<name>.
        $hooks->addFilter('blocks.eases', static function (array $eases) use ($design) {
            foreach ($design()->json()->tokens() as $token) {
                $token['group'] === 'ease' && is_string($token['value']) && $eases[$token['name']] = $token['value'];
            }

            return $eases;
        });
        $hooks->addFilter('blocks.breakpoints', static fn (array $bp) => $design()->json()->breakpoints() ?: $bp);
        $hooks->addFilter('fields.options.button-variants', static function (array $options) use ($design) {
            foreach (array_keys($design()->json()->buttons()) as $variant) {
                $options[$variant] ??= ucfirst(str_replace(['-', '_'], ' ', (string) $variant));
            }

            return $options;
        });

        // Blocks rendered outside a page (Markdown twins, search) still see the site.
        $hooks->addFilter('blocks.scope', fn (array $scope) => $scope + ['site' => $this->app->make(Renderer::class)->site()]);
    }

    /** Lists for the Repeat block: entries, child pages, breadcrumbs and headings. */
    private function dataSources(): void
    {
        $this->cms()->hooks()->addFilter('blocks.data-sources', function (array $sources) {
            $entry = static fn (Scope $scope): ?AugmentedEntry => ($e = $scope->get('entry')) instanceof AugmentedEntry ? $e : null;
            $collections = array_map(static fn ($c) => $c->title, array_filter($this->cms()->collections()->all(), static fn ($c) => $c->routable()));

            $sources['entries'] = [
                'label' => 'Collection Entries',
                'description' => __('Live entries of a collection: posts, projects, team members…'),
                'fields' => [
                    ['handle' => 'collection', 'type' => 'select', 'label' => 'Collection', 'options' => $collections, 'required' => true],
                    ['handle' => 'sort', 'type' => 'select', 'label' => 'Sort Order', 'options' => ['-published_at' => __('Newest First'), 'published_at' => __('Oldest First'), 'title' => __('Title A–Z'), '-title' => __('Title Z–A'), 'position' => __('Manual Order')], 'default' => '-published_at'],
                    ['handle' => 'limit', 'type' => 'number', 'label' => 'How Many', 'min' => 1, 'max' => 200, 'default' => 6],
                    ['handle' => 'offset', 'type' => 'number', 'label' => 'Skip', 'min' => 0, 'max' => 200],
                    ['handle' => 'parent', 'type' => 'select', 'label' => 'Level', 'options' => ['any' => __('All'), 'top' => __('Top Level Only'), 'current' => __('Children of This Page'), 'item' => __('Children of the Outer Item')], 'default' => 'any'],
                    ['handle' => 'hasTag', 'type' => 'text', 'label' => 'Only with Tag'],
                    ['handle' => 'references', 'type' => 'select', 'label' => 'Only Entries Linking To', 'options' => ['' => __('Any'), 'current' => __('This Page'), 'item' => __('The Outer Item')]],
                    ['handle' => 'where', 'type' => 'json', 'component' => 'blocks-conditions', 'stack' => true, 'label' => 'Only Entries Where'],
                    ['handle' => 'skipCurrent', 'type' => 'toggle', 'label' => 'Leave Out This Page'],
                    ['handle' => 'paginate', 'type' => 'toggle', 'label' => 'Split into Pages'],
                ],
                'item' => ['title' => __('Title'), 'url' => __('Link'), 'date' => __('Published'), 'updated' => __('Updated'), 'excerpt' => __('A field (any field handle)'), 'children' => __('Child Entries'), 'current' => __('Is this page'), 'active' => __('Is this page or above it')],
                'resolve' => function (array $props, Scope $scope) use ($entry) {
                    $collection = (string) ($props['collection'] ?? '');

                    if ($collection === '' || ! $this->cms()->collections()->find($collection)) {
                        return [];
                    }

                    $locale = PageContext::current()?->locale() ?? $this->cms()->defaultLocale();
                    $query = new EntryQueryProxy($this->cms()->entries()->query()->collection($collection)->locale($locale)->live());
                    $query->orderBy((string) ($props['sort'] ?? '-published_at'));

                    match ($props['parent'] ?? 'any') {
                        'top' => $query->parent(null),
                        'current' => $query->parent($entry($scope)?->id ?? '-'),
                        'item' => $query->parent(($scope->get('item') instanceof AugmentedEntry) ? $scope->get('item')->id : '-'),
                        default => null,
                    };

                    // The reverse of a relation: posts by this author, projects of this client.
                    if (in_array($props['references'] ?? '', ['current', 'item'], true)) {
                        $to = $props['references'] === 'item' ? $scope->get('item') : $entry($scope);
                        $query->references($to instanceof AugmentedEntry ? $to->id : '');
                    }

                    if (! empty($props['hasTag'])) {
                        $query->where('tags', 'contains', (string) $props['hasTag']);
                    }

                    foreach ((array) ($props['where'] ?? []) as $where) {
                        if (is_array($where) && is_string($where['field'] ?? null) && $where['field'] !== '') {
                            $value = $where['value'] ?? null;
                            is_string($value) && Scope::isTemplate($value) && $value = Scope::text($scope->resolve($value));
                            $query->where($where['field'], (string) ($where['op'] ?? '='), $value);
                        }
                    }

                    $limit = max(1, min(200, (int) ($props['limit'] ?? 6)));

                    if (! empty($props['paginate'])) {
                        $page = $query->paginate($limit);
                        PageContext::current() && PageContext::current()->pagination = ['current' => $page['page'], 'total' => $page['pages'], 'prev' => $page['prev'], 'next' => $page['next'], 'count' => $page['total']];
                        $items = $page['items'];
                    } else {
                        $items = $query->offset(max(0, (int) ($props['offset'] ?? 0)))->limit($limit + (! empty($props['skipCurrent']) ? 1 : 0))->get();
                    }

                    if (! empty($props['skipCurrent']) && ($current = $entry($scope))) {
                        $items = array_values(array_filter($items, static fn (AugmentedEntry $e) => ! $e->is($current)));
                    }

                    return empty($props['paginate']) ? array_slice($items, 0, $limit) : $items;
                },
            ];

            $taxonomies = array_map(static fn ($c) => $c->title, array_filter($this->cms()->collections()->all(), static fn ($c) => $c->isTaxonomy()));

            $sources['terms'] = [
                'label' => 'Taxonomy Terms',
                'description' => __('The terms of a taxonomy with how many published entries are filed under each: a category list, a tag cloud.'),
                'fields' => [
                    ['handle' => 'taxonomy', 'type' => 'select', 'label' => 'Taxonomy', 'options' => $taxonomies, 'required' => true],
                    ['handle' => 'sort', 'type' => 'select', 'label' => 'Sort Order', 'options' => ['title' => __('Title A–Z'), '-count' => __('Most Used First'), 'position' => __('Manual Order')], 'default' => 'title'],
                    ['handle' => 'limit', 'type' => 'number', 'label' => 'How Many', 'min' => 1, 'max' => 200, 'default' => 50],
                    ['handle' => 'of', 'type' => 'select', 'label' => 'Of', 'options' => ['' => __('All Terms'), 'current' => __('This Page')]],
                    ['handle' => 'hideEmpty', 'type' => 'toggle', 'label' => 'Leave Out Unused Terms'],
                ],
                'item' => ['title' => __('Title'), 'url' => __('Link'), 'count' => __('How Many Entries'), 'entry' => __('The term (any field: item.entry.description)')],
                'resolve' => function (array $props, Scope $scope) use ($entry) {
                    $taxonomy = $this->cms()->collections()->find((string) ($props['taxonomy'] ?? ''));

                    if (! $taxonomy?->isTaxonomy()) {
                        return [];
                    }

                    $locale = PageContext::current()?->locale() ?? $this->cms()->defaultLocale();
                    $sort = (string) ($props['sort'] ?? 'title');
                    $query = new EntryQueryProxy($this->cms()->entries()->query()->collection($taxonomy->handle)->locale($locale)->live()->orderBy($sort === '-count' ? 'title' : $sort));
                    $terms = $query->get();

                    // The terms this page is filed under: every term its terms fields of this taxonomy name.
                    if (($props['of'] ?? '') === 'current') {
                        $current = $entry($scope);
                        $named = [];

                        foreach ($current ? $current->entry->blueprint()->relations() : [] as $path => $field) {
                            $field->get('taxonomy') === $taxonomy->handle && array_push($named, ...array_filter((array) data_get($current->entry->data, $path), 'is_string'));
                        }

                        $terms = array_values(array_filter($terms, static fn (AugmentedEntry $term) => in_array($term->id, $named, true)));
                    }

                    // A count changes when any entry that can be filed under a term does.
                    foreach (array_keys($this->cms()->collections()->all()) as $handle) {
                        PageContext::depend('collection:'.$handle);
                    }

                    // One pass over the published entries for every term's count.
                    $counts = $this->cms()->entries()->query()->live()->locale($locale)->referenceCounts(array_map(static fn (AugmentedEntry $term) => $term->id, $terms));
                    $items = array_map(static fn (AugmentedEntry $term) => ['id' => $term->id, 'title' => $term->title, 'slug' => $term->slug, 'url' => $term->url, 'count' => $counts[$term->id] ?? 0, 'entry' => $term], $terms);

                    if (! empty($props['hideEmpty'])) {
                        $items = array_values(array_filter($items, static fn (array $item) => $item['count'] > 0));
                    }

                    if ($sort === '-count') {
                        usort($items, static fn (array $a, array $b) => [$b['count'], $a['title']] <=> [$a['count'], $b['title']]);
                    }

                    return array_slice($items, 0, max(1, min(200, (int) ($props['limit'] ?? 50))));
                },
            ];

            $sources['archive'] = [
                'label' => 'Entries of This Term',
                'description' => __('On a term’s archive: the entries of its collection filed under the term. On the term’s own page: those of every collection.'),
                'fields' => [
                    ['handle' => 'sort', 'type' => 'select', 'label' => 'Sort Order', 'options' => ['-published_at' => __('Newest First'), 'published_at' => __('Oldest First'), 'title' => __('Title A–Z'), '-title' => __('Title Z–A')], 'default' => '-published_at'],
                    ['handle' => 'limit', 'type' => 'number', 'label' => 'How Many', 'min' => 1, 'max' => 200, 'default' => 10],
                    ['handle' => 'paginate', 'type' => 'toggle', 'label' => 'Split into Pages'],
                ],
                'item' => ['title' => __('Title'), 'url' => __('Link'), 'date' => __('Published'), 'excerpt' => __('A field (any field handle)')],
                'resolve' => function (array $props, Scope $scope) use ($entry) {
                    $term = $entry($scope);
                    $context = PageContext::current();

                    if (! $term) {
                        return [];
                    }

                    // The archive's collection; on the term's own page, every collection with pages.
                    $handles = $context?->archive ? [$context->archive['collection']] : array_keys(array_filter($this->cms()->collections()->all(), static fn ($c) => $c->routable() && ! $c->isTaxonomy()));

                    if ($handles === []) {
                        return [];
                    }

                    // Filed under it through a terms field of its taxonomy; a link in a body names the term but files nothing.
                    $archives = $this->app->make(\Cms\Content\Collections\Archives::class);
                    $own = $archives->term($term->id) ?? $this->cms()->entries()->find($term->id);

                    if (! $own) {
                        return [];
                    }

                    $query = new EntryQueryProxy($archives->filed($own, $handles));
                    $query->orderBy((string) ($props['sort'] ?? '-published_at'))->orderBy('title');
                    $limit = max(1, min(200, (int) ($props['limit'] ?? 10)));

                    if (empty($props['paginate'])) {
                        return $query->limit($limit)->get();
                    }

                    $page = $query->paginate($limit);
                    $context && $context->pagination = ['current' => $page['page'], 'total' => $page['pages'], 'prev' => $page['prev'], 'next' => $page['next'], 'count' => $page['total']];

                    return $page['items'];
                },
            ];

            $sources['children'] = [
                'label' => 'Child Pages',
                'description' => __('Pages below this page (or below the outer item) in a tree collection.'),
                'fields' => [['handle' => 'of', 'type' => 'select', 'label' => 'Of', 'options' => ['entry' => __('This Page'), 'item' => __('The Outer Item'), 'parent' => __('This Page’s Parent'), 'root' => __('The Top of This Page’s Branch')], 'default' => 'entry']],
                'item' => ['title' => __('Title'), 'url' => __('Link'), 'children' => __('Child Pages'), 'current' => __('Is this page'), 'active' => __('Is this page or above it')],
                'resolve' => static function (array $props, Scope $scope) use ($entry) {
                    $of = match ($props['of'] ?? 'entry') {
                        'item' => $scope->get('item'),
                        'parent' => $entry($scope)?->parent(),
                        'root' => $entry($scope)?->root(),
                        default => $entry($scope),
                    };

                    return $of instanceof AugmentedEntry ? $of->children() : [];
                },
            ];

            $sources['breadcrumbs'] = [
                'label' => 'Breadcrumbs',
                'description' => __('The pages above this one, from the top.'),
                'fields' => [['handle' => 'self', 'type' => 'toggle', 'label' => 'Include This Page']],
                'item' => ['title' => __('Title'), 'url' => __('Link')],
                'resolve' => static function (array $props, Scope $scope) use ($entry) {
                    $current = $entry($scope);

                    return $current ? [...$current->ancestors(), ...(! empty($props['self']) ? [$current] : [])] : [];
                },
            ];

            $sources['neighbors'] = [
                'label' => 'Previous and Next Entry',
                'description' => __('The entries before and after this one in its collection, for a detail page: newest last in a dated collection, the tree’s reading order, else the collection’s own order.'),
                'fields' => [
                    ['handle' => 'show', 'type' => 'select', 'label' => 'Show', 'options' => ['both' => __('Previous and Next'), 'previous' => __('Previous'), 'next' => __('Next')], 'default' => 'both'],
                    ['handle' => 'wrap', 'type' => 'toggle', 'label' => 'Go Round at the Ends'],
                ],
                'item' => ['title' => __('Title'), 'url' => __('Link'), 'date' => __('Published'), 'excerpt' => __('A field (any field handle)'), 'side' => __('Which side it is on: previous or next'), 'previous' => __('Is the previous entry'), 'following' => __('Is the next entry')],
                'resolve' => static function (array $props, Scope $scope) use ($entry) {
                    $current = $entry($scope);
                    $show = (string) ($props['show'] ?? 'both');
                    $wrap = ! empty($props['wrap']);
                    // Each says which side it is on, so one Repeat labels and points both: item.side is "previous"
                    // or "next", and item.previous and item.following are that as yes or no, for a condition or a state.
                    $on = static fn (?AugmentedEntry $item, string $side) => $item?->as(['side' => $side, 'previous' => $side === 'previous', 'following' => $side === 'next']);
                    $items = $current ? [
                        $show !== 'next' ? $on($current->sibling(-1, $wrap), 'previous') : null,
                        $show !== 'previous' ? $on($current->sibling(1, $wrap), 'next') : null,
                    ] : [];
                    $items = array_values(array_filter($items));

                    // With two entries, going round gives the same one twice: once is enough.
                    return count($items) === 2 && $items[0]->is($items[1]) ? [$items[0]] : $items;
                },
            ];

            $sources['headings'] = [
                'label' => 'Headings on This Page',
                'description' => __('For a table of contents: the page’s own headings, in order.'),
                'fields' => [['handle' => 'depth', 'type' => 'select', 'label' => 'Down To', 'options' => ['2' => 'H2', '3' => 'H3', '4' => 'H4'], 'default' => '3']],
                'item' => ['text' => __('Heading Text'), 'id' => __('Anchor (link to #id)'), 'level' => __('Level (2–4)')],
                'resolve' => static function (array $props, Scope $scope) use ($entry) {
                    $current = $entry($scope);
                    $body = $current ? $current->entry->collection()->body : null;
                    $value = $body ? $current->field($body) : null;

                    return $value instanceof BlocksDocument ? array_map(static fn ($h) => [...$h, 'url' => '#'.$h['id']], (new Anchors)->headings($value->nodes, (int) ($props['depth'] ?? 3))) : [];
                },
            ];

            return $sources;
        });

        // Pagination of the last paginated Repeat on the page.
        $this->cms()->hooks()->addFilter('site.scope', static fn (array $scope) => [...$scope, 'pagination' => new Rendering\LiveData(static fn () => PageContext::current()?->pagination ?? [])]);
    }

    private function routes(): void
    {
        Route::get('/search.json', fn () => $this->cms()->setting('site', 'search_index', true)
            ? response($this->app->make(Search\SearchIndex::class)->json(), 200, ['Content-Type' => 'application/json; charset=utf-8', 'Cache-Control' => 'public, max-age=300'])
            : abort(404));

        Route::middleware(['web', 'auth:web', 'cms.admin'])->group(static function (): void {
            Route::get('/__preview/{id}', [SiteController::class, 'preview'])->where('id', '[0-9a-z]{26}');
            Route::get('/__specimen/{kind}', [SiteController::class, 'specimen'])->whereIn('kind', ['fields', 'buttons', 'sizes', 'prose']);
            Route::post('/__preview', [SiteController::class, 'render']);
            Route::post('/__preview/{id}', [SiteController::class, 'render'])->where('id', '[0-9a-z]{26}');
        });

        // Too many requests from a person on the site: the site's own page and a plain message, not a bare error.
        $this->app->make(\Illuminate\Contracts\Debug\ExceptionHandler::class)->renderable(function (\Symfony\Component\HttpKernel\Exception\HttpExceptionInterface $e, \Illuminate\Http\Request $request) {
            if ($e->getStatusCode() !== 429 || $request->is('api/*', 'admin/*') || $request->expectsJson()) {
                return null;
            }

            try {
                $page = $this->app->make(Renderer::class)->message(
                    429,
                    __('Too many tries'),
                    __('We got too many requests from you in a short time and didn’t act on this one. Wait a minute and try again.'),
                    '/'.ltrim($request->path(), '/'),
                    self::sameSiteReferrer($request),
                );
            } catch (\Throwable) {
                return null; // A broken site still answers with the plain error.
            }

            return response($page['html'], 429, [...$e->getHeaders(), 'Content-Type' => 'text/html; charset=utf-8', 'Cache-Control' => 'no-store, private', 'X-Robots-Tag' => 'noindex']);
        });

        // Everything not handled elsewhere is a site page. Registered last.
        $this->app->booted(static function (): void {
            Route::fallback([SiteController::class, 'show'])->middleware([PublicPage::class, 'web']);
        });
    }

    /** Where the visitor came from, only when that's this site: a Referer is theirs to set. */
    private static function sameSiteReferrer(\Illuminate\Http\Request $request): string
    {
        $referer = (string) $request->headers->get('referer', '');
        $path = parse_url($referer, PHP_URL_PATH);

        return is_string($path) && parse_url($referer, PHP_URL_HOST) === $request->getHost() && str_starts_with($path, '/') && ! str_starts_with($path, '//') ? $path : '/';
    }

    /** Publishing is part of what the site is: its fields are on the General settings page, after the core's. */
    private function settingsSchema(): void
    {
        $this->cms()->hooks()->addFilter('settings.fields', static function (array $fields, string $namespace) {
            if ($namespace !== 'site') {
                return $fields;
            }

            return [...$fields,
                ['handle' => 'favicon', 'type' => 'media', 'label' => 'Favicon', 'max' => 1],
                ['handle' => 'static', 'section' => 'Publishing', 'type' => 'toggle', 'label' => 'Build a Static Site', 'default' => true],
                ['handle' => 'auto_build', 'section' => 'Publishing', 'type' => 'toggle', 'label' => 'Rebuild Automatically on Publish', 'default' => true],
                ['handle' => 'search_index', 'section' => 'Publishing', 'type' => 'toggle', 'label' => 'Publish a Search Index', 'default' => true],
            ];
        });
    }

    private function abilities(): void
    {
        $abilities = $this->cms()->abilities();
        $builder = fn () => $this->app->make(SiteBuilder::class);
        $design = fn () => $this->app->make(Design::class);

        $abilities->register('site/build', [
            'label' => 'Publish Site',
            'description' => 'Rebuild the static site (all pages). Work continues in the background; poll site/build-status.',
            'permission' => 'site.build',
            'output' => self::buildShape(),
            'handler' => function () use ($builder) {
                $builder()->queue(null, __('Manual Rebuild'));

                return $builder()->process(2000);
            },
        ]);

        $abilities->register('site/build-status', [
            'label' => 'Build Status',
            'description' => 'Progress of the static build. Calling it also advances queued work.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'output' => self::buildShape(),
            'handler' => fn () => $builder()->process(1500),
        ]);

        $abilities->register('design/get', [
            'label' => 'Design System',
            'description' => 'The site’s design system (content/design): tokens (use as token:group.name in styles), fonts, element styles, prose styles, button variants, form fields, page transition, breakpoints, custom CSS and JS, and the templates entries can use.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'output' => Shape::of([
                'name' => Shape::STRING,
                'tokens' => [[
                    'path' => Shape::STRING, 'group' => Shape::STRING, 'name' => Shape::STRING,
                    'value' => Shape::any('The token\'s value as tokens.json has it: CSS, a number, a reference to another token (token:group.name), or {min, max} for a fluid size.'),
                    'dark' => Shape::any('The value in dark mode, like `value`; null when the token has none.'),
                    'type' => Shape::STRING_OR_NULL, 'description' => Shape::STRING_OR_NULL,
                ]],
                'fonts' => [['family?' => Shape::STRING, 'src?' => Shape::STRING, 'weight?' => Shape::either(Shape::STRING, Shape::INTEGER), 'style?' => Shape::STRING, 'preload?' => Shape::BOOLEAN, 'display?' => Shape::STRING, 'fallback?' => Shape::either(Shape::STRING, [Shape::STRING]), 'sizeAdjust?' => Shape::STRING, 'ascentOverride?' => Shape::STRING, 'descentOverride?' => Shape::STRING, 'lineGapOverride?' => Shape::STRING]],
                'fontFiles' => [Shape::STRING],
                'styles' => self::described(Shape::map(self::declarationsShape()), 'Declarations by element. `elements` lists the ones the Design System offers; any tag works, alone or up to three deep with a space (inside) or " > " (directly inside), with one state or part at the end: "h1 em", "li > a", "nav a:hover", "li::marker". A class a block carries (its `class`, or the is-… of a state binding) works the same way, alone or on a tag: ".note", "span.note", ".note em", ".card.is-open > a:hover"; lowercase letters, digits and hyphens, never one that starts with cms-. No ids or attributes: those are custom.css.'),
                'prose' => Shape::raw([
                    ...Shape::of(['spacing?' => ['blocks?' => self::cssValue(), 'headings?' => self::cssValue(), 'afterHeadings?' => self::cssValue(), 'items?' => self::cssValue()]])->toSchema(),
                    'additionalProperties' => self::declarationsShape()->toSchema(),
                    'description' => 'Declarations by element of long-form text (`proseElements` lists them), and `spacing`: the flow between its blocks.',
                ]),
                'buttons' => self::described(
                    Shape::map(Shape::open('A look by state (base, hover, active, focus-visible), each a map of camelCase CSS property to a CSS value or a token (token:group.name, from `tokens`); `surface` names the background the variant is made for.')),
                    'Button variants by name (primary, secondary…), as tokens.json has them.',
                ),
                'fields' => self::described(Shape::map(Shape::map(self::cssValue())), 'What the site sets for its form fields: part => property => value. `fieldStyles` lists every part and property.'),
                'fieldStyles' => self::described(
                    Shape::map(Shape::map(['type' => Shape::STRING, 'variable' => Shape::STRING, 'default?' => Shape::either(Shape::STRING, [Shape::STRING]), 'inherits?' => Shape::STRING, 'hint?' => Shape::STRING, 'tokens?' => Shape::STRING, 'unit?' => Shape::STRING, 'options?' => [Shape::STRING]])),
                    'Every property `fields` may set: part (field, hover, focus, checkbox…) => property => what it is.',
                ),
                'controlSizes' => Shape::map(['height' => Shape::STRING, 'padding' => Shape::STRING, 'text' => [Shape::STRING]]),
                'transition' => ['type' => Shape::enum('none', 'fade', 'slide', 'scale'), 'duration' => Shape::NUMBER, 'navigation' => Shape::enum('document', 'client')],
                'breakpoints' => Shape::map(Shape::STRING),
                'templates' => Shape::map(Shape::STRING),
                'stylesheet' => Shape::STRING, 'css' => Shape::STRING, 'js' => Shape::STRING,
                'elements' => [Shape::STRING], 'proseElements' => [Shape::STRING],
            ]),
            'handler' => function () use ($design) {
                $json = $design()->json();

                return [
                    'name' => $json->name(),
                    'tokens' => array_values(array_map(static fn ($k, $v) => ['path' => $k, ...$v], array_keys($json->tokens()), $json->tokens())),
                    'fonts' => $json->fonts(),
                    'fontFiles' => $design()->fontFiles(),
                    'styles' => (object) $json->styles(),
                    'prose' => (object) [...$json->prose(), ...($json->proseSpacing() !== [] ? ['spacing' => (object) $json->proseSpacing()] : [])],
                    'buttons' => (object) $json->buttons(),
                    'fields' => (object) $json->fields(),
                    'fieldStyles' => FieldStyles::schema(),
                    'controlSizes' => ControlSizes::DEFAULTS,
                    'transition' => $json->transition(),
                    'breakpoints' => $json->breakpoints(),
                    'templates' => $this->app->make(Templates::class)->options(),
                    'stylesheet' => $design()->stylesheet(),
                    'css' => $design()->customCss(),
                    'js' => $design()->customJs(),
                    'elements' => DesignCompiler::ELEMENTS,
                    'proseElements' => DesignCompiler::PROSE_ELEMENTS,
                ];
            },
        ]);

        $abilities->register('design/update', [
            'label' => 'Update Design System',
            'description' => 'Change tokens (e.g. {"color.primary": "#0f766e"}; values may be CSS or {"min","max"} for fluid sizes), dark-mode values (null clears), renames, element styles, prose styles, button variants, form fields, fonts or the page transition. Sections you pass replace the stored ones, except `transition`, whose settings you name are changed and the others kept (null removes one, back to its default). The site rebuilds.',
            'permission' => 'settings.manage',
            'input' => ['type' => 'object', 'properties' => [
                'tokens' => ['type' => 'object', 'description' => 'path => value'],
                'dark' => ['type' => 'object', 'description' => 'path => dark-mode value'],
                'remove' => ['type' => 'array', 'items' => ['type' => 'string']],
                'rename' => ['type' => 'object', 'description' => 'old path => new path, within a group; references follow'],
                'styles' => ['type' => 'object', 'description' => 'Element styles: {"h1": {"fontSize": "token:text.5xl"}, "h1 em": {"fontStyle": "italic"}, "nav a:hover": {"color": "token:color.primary"}}. A key is a tag, or up to three tags with a space (inside) or " > " (directly inside), with one state or part at the end. A class a block carries works in the same places, alone or on a tag: {".note em": {"fontStyle": "italic"}, "span.note": {"fontFamily": "token:font.serif"}, ".card.is-open": {"borderColor": "token:color.primary"}}; lowercase, never one that starts with cms-. No ids or attributes. A key that does not fit is refused by name.'],
                'prose' => ['type' => 'object', 'description' => 'Long-form text, in any block with the prose prop (Prose, under Typography): element styles, and `spacing`, the flow between its blocks, custom ones too: {"spacing": {"blocks": "1.1em", "headings": "1.8em", "afterHeadings": "0.6em", "items": "0.35em"}, "h2": {"fontSize": "token:text.2xl", "marginTop": "2.5rem"}}. An element\'s marginTop replaces the spacing before it.'],
                'buttons' => ['type' => 'object', 'description' => 'Button variants, each a look by state: {"primary": {"base": {"backgroundColor": "token:color.primary", "borderRadius": "token:radius.md"}, "hover": {...}, "active": {...}, "focus-visible": {...}}}; `surface` names the background a variant is made for ("token:color.band"), where the Design System shows it. Sizes are not set here: height, padding and text size come from the control tokens (control.sm-height, control.md-padding, control.lg-text…), which fields share.'],
                'fields' => ['type' => 'object', 'description' => 'Every form field of the site, part by part, over the defaults (design/get fieldStyles has each part, property, type and default): {"field": {"height": "3rem", "background": "token:color.raised", "radius": "token:radius.md"}, "checkbox": {"checked": "token:color.primary", "mark": "check"}, "switch": {"on": "token:color.primary"}}. Parts: field (every boxed field), hover, focus, invalid, disabled, label, help, spacing (with size: the control size of fields in forms), select, textarea, checkbox, radio, switch, slider, tags, chips, file. A value is CSS, a token, or field:part.key to follow another property.'],
                'fonts' => ['type' => 'array'],
                'transition' => ['type' => 'object', 'description' => 'Merged into the stored transition: name only what changes. null removes a setting, which then has its default (type none, duration 0.3, navigation document).', 'properties' => ['type' => ['type' => ['string', 'null'], 'enum' => ['none', 'fade', 'slide', 'scale', null]], 'duration' => ['type' => ['number', 'null']], 'navigation' => ['type' => ['string', 'null'], 'enum' => ['document', 'client', null], 'description' => 'client: links to pages of the site swap the page without a page load, inside the transition, so blocks with `persist` live on across pages. document (default): the browser loads every page.']]],
            ]],
            'output' => Shape::of(['saved' => Shape::BOOLEAN, 'stylesheet' => Shape::STRING]),
            'handler' => function (array $in) use ($design) {
                $json = $design()->json();
                $json->apply($in);
                $json->save();
                $design()->saved();

                return ['saved' => true, 'stylesheet' => $design()->stylesheet()];
            },
        ]);

        $abilities->register('design/preview', [
            'label' => 'Preview Design System',
            'description' => 'The stylesheet the site would get with these changes (the design/update input, plus css), without saving. For live previews.',
            'permission' => 'settings.manage',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => [
                'tokens' => ['type' => 'object'],
                'dark' => ['type' => 'object'],
                'remove' => ['type' => 'array', 'items' => ['type' => 'string']],
                'rename' => ['type' => 'object'],
                'styles' => ['type' => 'object'],
                'prose' => ['type' => 'object'],
                'buttons' => ['type' => 'object'],
                'fields' => ['type' => 'object'],
                'transition' => ['type' => 'object'],
                'css' => ['type' => 'string', 'maxLength' => 200000],
            ]],
            'output' => Shape::of(['css' => Shape::STRING]),
            'handler' => function (array $in) use ($design) {
                $json = DesignJson::fromArray($design()->json()->toArray());
                $json->apply($in);

                return ['css' => $design()->compile($json, isset($in['css']) ? (string) $in['css'] : $design()->customCss())];
            },
        ]);

        $abilities->register('design-code/set-custom', [
            'label' => 'Custom CSS and JavaScript',
            'description' => 'Replace the site’s custom.css or custom.js (content/design). CSS is appended after everything else; JS loads as an ES module on every page and may register Alpine components (document.addEventListener("cms:alpine", (e) => e.detail.data("name", () => ({…})))) that elements use through logic.component.',
            'permission' => 'site.code',
            'input' => ['type' => 'object', 'properties' => ['css' => ['type' => 'string', 'maxLength' => 200000], 'js' => ['type' => 'string', 'maxLength' => 200000]]],
            'output' => Shape::of(['saved' => [Shape::enum('css', 'js')]]),
            'handler' => function (array $in) use ($design) {
                foreach (['css', 'js'] as $kind) {
                    if (isset($in[$kind])) {
                        $design()->saveCode($kind, (string) $in[$kind]);
                    }
                }

                $design()->saved();

                return ['saved' => array_keys(array_intersect_key($in, ['css' => 1, 'js' => 1]))];
            },
        ]);

        $abilities->register('design/fonts-import', [
            'label' => 'Add a Google Font',
            'description' => 'Download a Google Fonts family (latin) into content/design/fonts so it is self-hosted, and add it to the design system: the weights its variable axis really spans as one file, or the static weights it has; upright, italic or both. Then use it in a font token. Text does not move when the font arrives: each face gets a fallback read from the font’s own tables, {"fallback": "Arial", "sizeAdjust": "103.63%", "ascentOverride": "88.48%", "descentOverride": "24.32%", "lineGapOverride": "0%"} (Arial for a sans, Times New Roman for a serif, Courier New for a monospace family), which draws that local font at the web font’s size first; the font tokens that name the family get it by themselves. Change those numbers with design/update `fonts`: importing the family again keeps what its faces say.',
            'permission' => 'settings.manage',
            'input' => ['type' => 'object', 'properties' => [
                'family' => ['type' => 'string', 'minLength' => 2, 'maxLength' => 60],
                'style' => ['type' => 'string', 'enum' => ['normal', 'italic', 'both'], 'description' => 'normal when left out. Italic is left out when the family has none.'],
                'italic' => ['type' => 'boolean', 'description' => 'The same as style: "both", when style is not given.'],
                'weights' => ['type' => 'array', 'items' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 1000], 'maxItems' => 9, 'description' => 'Static weights to take when the family has no weight axis; 400, 500, 600 and 700 of what it has when left out.'],
            ], 'required' => ['family']],
            'output' => Shape::of(['fonts' => [['family' => Shape::STRING, 'src' => Shape::STRING, 'weight' => Shape::STRING, 'style' => Shape::enum('normal', 'italic'), 'preload' => Shape::BOOLEAN, 'fallback?' => Shape::STRING, 'sizeAdjust?' => Shape::STRING, 'ascentOverride?' => Shape::STRING, 'descentOverride?' => Shape::STRING, 'lineGapOverride?' => Shape::STRING]]]),
            'handler' => function (array $in) use ($design) {
                $fonts = $this->app->make(Fonts::class)->import((string) $in['family'], (string) ($in['style'] ?? (! empty($in['italic']) ? 'both' : 'normal')), array_map('intval', (array) ($in['weights'] ?? [])));
                $design()->saved();

                return ['fonts' => $fonts];
            },
        ]);

        $abilities->register('design/fonts-upload', [
            'label' => 'Upload a Font',
            'description' => 'Add a .woff2 file (base64) to content/design/fonts and the design system.',
            'permission' => 'settings.manage',
            'input' => ['type' => 'object', 'properties' => [
                'family' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 60],
                'name' => ['type' => 'string', 'maxLength' => 120],
                'data' => ['type' => 'string', 'maxLength' => 4000000],
                'weight' => ['type' => 'string', 'default' => '400'],
                'style' => ['type' => 'string', 'enum' => ['normal', 'italic'], 'default' => 'normal'],
            ], 'required' => ['family', 'data']],
            'output' => Shape::of(['family' => Shape::STRING, 'src' => Shape::STRING, 'weight' => Shape::STRING, 'style' => Shape::enum('normal', 'italic')]),
            'handler' => function (array $in) use ($design) {
                $font = $this->app->make(Fonts::class)->upload((string) $in['family'], (string) ($in['name'] ?? $in['family']), (string) $in['data'], (string) ($in['weight'] ?? '400'), (string) ($in['style'] ?? 'normal'));
                $design()->saved();

                return $font;
            },
        ]);

        $abilities->register('site/preview-url', [
            'label' => 'Preview URL',
            'description' => 'URL that previews an entry\'s working copy (drafts included) for signed-in users.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string', 'format' => 'ulid']], 'required' => ['id']],
            'output' => Shape::of(['url' => Shape::STRING]),
            'handler' => fn (array $in) => ['url' => url('/__preview/'.strtolower($in['id']))],
        ]);

        $this->cms()->permissions()->register('site.build', 'Publish the Site', 'Site', roles: ['editor']);
        $this->cms()->permissions()->register('site.code', 'Edit Custom CSS and JavaScript', 'Design', trusted: true);

        // Collections and entries choose from the site's templates.
        $this->cms()->hooks()->addFilter('fields.options.templates', fn (array $options, ?string $collection = null) => array_replace($options, $this->app->make(Templates::class)->options($collection)));
        $this->cms()->hooks()->addFilter('fields.definition.templates', function (array $field, array $context): array {
            if (($field['type'] ?? null) !== 'select' || ! empty($field['multiple'])) {
                return $field;
            }
            $collection = $context['collection'] ?? null;

            return array_replace($field, $this->templatePicker($collection instanceof Collection ? $collection : null, inheritCollection: true));
        });
        $this->cms()->hooks()->addFilter('collections.settings', function (array $fields, ?Collection $collection = null) {
            if ($collection?->system && ! $collection->routable()) {
                return $fields;
            }
            // Keep publishing settings available when URLs are enabled later.
            return [...$fields, [
                'handle' => 'template', 'type' => 'select', 'label' => 'Template', 'width' => 'half',
                ...$this->templatePicker($collection),
            ]];
        });
    }

    /** A shape with a sentence on what its keys are. */
    private static function described(Shape $shape, string $about): Shape
    {
        return Shape::raw([...$shape->toSchema(), 'description' => $about]);
    }

    /** A value in tokens.json: CSS or a token as a string, or a bare number. */
    private static function cssValue(): Shape
    {
        return Shape::either(Shape::STRING, Shape::NUMBER);
    }

    /** Declarations of one element, as tokens.json has them. */
    private static function declarationsShape(): Shape
    {
        return Shape::open('CSS declarations by camelCase property (fontSize, backgroundColor…); a value is CSS or a token (token:group.name, from `tokens`).');
    }

    /** SiteBuilder::status(): how far the static build is. */
    private static function buildShape(): Shape
    {
        return Shape::of([
            'state' => Shape::STRING, 'progress' => Shape::NUMBER, 'message' => Shape::STRING, 'pending' => Shape::INTEGER, 'finishedAt' => Shape::STRING_OR_NULL,
            'pages' => Shape::INTEGER, 'errors' => [Shape::STRING], 'warnings' => [['uri' => Shape::STRING_OR_NULL, 'message' => Shape::STRING]], 'enabled' => Shape::BOOLEAN,
        ]);
    }

    /** Collection settings inherit the site default; entry fields inherit their collection. */
    private function templatePicker(?Collection $collection, bool $inheritCollection = false): array
    {
        $templates = $this->app->make(Templates::class);
        $fallback = $templates->resolve($inheritCollection && $collection ? [$collection->template] : [], true);

        return [
            'component' => 'site-template',
            'options' => $templates->options($collection?->handle),
            'placeholder' => $fallback['title'] ?? __('Content Only'),
            'fallbackHandle' => $fallback['handle'] ?? null,
            'defaultHandle' => '',
        ];
    }

    /**
     * Term archives beyond the page itself: in the search index, in the sitemap (the SEO plugin's `seo.sitemap`),
     * and with the other languages' archives as their alternates.
     */
    private function archives(): void
    {
        $hooks = $this->cms()->hooks();
        $archives = fn () => $this->app->make(\Cms\Content\Collections\Archives::class);
        // The archives a visitor may open: of terms that are live and not behind the gate, in a language when one is asked for.
        $open = function (?string $locale = null) use ($archives): array {
            $gate = $this->cms()->entries()->gate();
            $out = [];

            foreach ($archives()->all() as $archive) {
                $term = $locale === null || $archive['locale'] === $locale ? $archives()->term($archive['term']) : null;

                if ($term && $term->isLive() && ! $gate->isGated($term)) {
                    $out[] = [...$archive, 'entry' => $term];
                }
            }

            return $out;
        };

        $hooks->addFilter('site.search.records', fn (array $records) => [...$records, ...array_map(fn (array $archive) => [
            'id' => $archive['collection'].':'.$archive['term'],
            'title' => $archive['entry']->title,
            'url' => $archive['uri'],
            'section' => (string) __((string) $this->cms()->collections()->find($archive['collection'])?->title),
            'collection' => $archive['collection'],
            'locale' => $archive['locale'],
            'description' => is_string($archive['entry']->data['description'] ?? null) ? $archive['entry']->data['description'] : '',
            'headings' => [],
            'text' => '',
        ], $open())]);

        // Per language where the sitemap is: `$locale` is null for a site with one.
        $hooks->addFilter('seo.sitemap', fn (array $urls, ?string $locale = null) => [...$urls, ...array_map(static fn (array $archive) => [
            'uri' => $archive['uri'], 'updated' => $archive['entry']->updatedAt?->toDateString(), 'locale' => $archive['locale'],
            // The term the archive is: for what the sitemap says of it (whether it is indexed, its other languages).
            'entry' => $archive['entry'],
        ], $open($locale))]);

        // On an archive, the other languages' versions are the same term's archives of the same collection.
        $hooks->addFilter('seo.alternates', function (array $alternates, Entry $entry) use ($archives) {
            // The page's entry is the term at the archive's address.
            $archive = $entry->uri === null ? null : $archives()->at($entry->uri, $entry->locale);
            $collection = $archive && $archive['term'] === $entry->id ? $this->cms()->collections()->find($archive['collection']) : null;

            if (! $collection) {
                return $alternates;
            }

            return array_values(array_filter(array_map(function (array $alternate) use ($archives, $collection, $entry) {
                // This page's own line already has the archive's address.
                if ($alternate['uri'] === $entry->uri) {
                    return $alternate;
                }

                $version = $this->cms()->entries()->findByUri((string) $alternate['uri'], $alternate['locale'] === 'x-default' ? $this->cms()->defaultLocale() : (string) $alternate['locale']);
                $uri = $version ? $archives()->uri($collection, $version) : null;

                return $uri === null ? null : [...$alternate, 'uri' => $uri];
            }, $alternates)));
        }, priority: 50);
    }

    private function buildTriggers(): void
    {
        $hooks = $this->cms()->hooks();
        $builder = fn () => $this->app->make(SiteBuilder::class);
        $auto = fn () => (bool) $this->cms()->setting('site', 'auto_build', true);

        // Previous and next are read from a collection's order, kept while pages render: not across a change.
        foreach (['entry.saved', 'entry.published', 'entry.unpublished', 'entry.deleted', 'entry.structure-changed', 'entries.reordered'] as $event) {
            $hooks->on($event, static fn () => AugmentedEntry::flush());
        }

        $hooks->on('entry.published', function (Entry $entry) use ($builder, $auto) {
            $builder()->forgetEntry($entry);
            $auto() && $builder()->queueForEntry($entry);
        });

        $hooks->on('entry.saved', function (Entry $entry, $user, string $action) use ($builder, $auto) {
            // Structural changes (moves, slug changes) of live entries affect URLs immediately.
            // …and a value shared across languages changes a live translation's page when its original changes.
            if ($entry->isLive() && (in_array($action, ['create', 'save'], true) && $entry->draft === null || $action === 'shared')) {
                $builder()->forgetEntry($entry);
                $auto() && $builder()->queueForEntry($entry);
            }
        });

        $hooks->on('entry.structure-changed', function (Entry $entry) use ($builder, $auto) {
            $builder()->forgetEntry($entry);
            $auto() && $builder()->queue(null, __('Content structure changed'));
        });

        foreach (['entry.unpublished', 'entry.deleted'] as $event) {
            $hooks->on($event, function (Entry $entry) use ($builder, $auto) {
                $builder()->forgetEntry($entry);
                $auto() && $builder()->queueForEntry($entry, __('Removed “:title”', ['title' => $entry->title]));
            });
        }

        foreach (['media.updated', 'media.deleted'] as $event) {
            $hooks->on($event, fn ($item) => $auto() && $builder()->queueForMedia((string) $item->id));
        }

        foreach (['globals.saved', 'design.saved', 'collection.saved', 'collection.deleted', 'entries.reordered', 'navigation.saved'] as $event) {
            $hooks->on($event, fn () => $auto() && $builder()->queue(null, __('Site-Wide Change')));
        }

        // The site's name, URL and language are on every page; the admin's own settings are on none.
        $hooks->on('settings.saved', fn (string $namespace) => $namespace === 'site' && $auto() && $builder()->queue(null, __('Site-Wide Change')));

        // Advance queued builds after the response is sent — no worker or cron needed.
        $this->app->terminating(function () use ($builder) {
            if (! $this->app->runningInConsole() && $builder()->hasWork()) {
                if (function_exists('fastcgi_finish_request')) {
                    fastcgi_finish_request();
                }

                $builder()->process(4000);
            }
        });
    }

    private function adminUi(): void
    {
        $admin = $this->cms()->admin();
        $admin->nav('design', ['label' => 'Design System', 'path' => '/design', 'icon' => 'palette', 'section' => 'design', 'order' => 5, 'permission' => 'settings.manage']);
        $admin->widget('site-status', ['label' => 'Site', 'description' => 'Whether the live site is up to date, with a button to publish it.', 'icon' => 'rocket', 'column' => 'side', 'enabled' => true, 'order' => 10]);
        $admin->command('publish-site', ['label' => 'Publish Site', 'icon' => 'rocket', 'ability' => 'site/build', 'permission' => 'site.build', 'keywords' => ['build', 'deploy', 'static']]);

        $this->adminModule();
    }

    private function agentContext(): void
    {
        $this->cms()->context()->register(
            'cms://site/design',
            'Design System',
            'The site’s design tokens (use as token:group.name), fonts, element styles, button variants, page transition and breakpoints. Compose with these instead of raw values.',
            fn () => $this->app->make(Design::class)->json()->toArray()
        );

        // Where the front end's own surface is described, for an agent that only read the general guide.
        $this->cms()->hooks()->addFilter('agent.guide', static fn (string $guide) => $guide."\n".<<<'TXT'
        Front end:
        - Motion, scripts and page transitions are data on blocks and in the design, not theme files: read cms://blocks for `motion` (load, appear, scroll with pin, scrub and progress), `behavior` (a script of the design mounted on a block, one or several), `persist` and `code`, and cms://site/code for the scripts, styles and libraries beside the design (design-code/list, design-code/save, design-vendor/create).
        - A scroll animation with progress: true (or with scrub) tells its element how far along it is (--cms-progress, and a cms:progress event), so a number that counts with the scroll needs a few lines in a behaviour and no library.
        - design/update changes the page transition one setting at a time ({"transition": {"navigation": "client"}} keeps its type and duration); the other sections it takes are replaced whole.
        - design/fonts-import brings a Google Fonts family as it is (style: normal, italic or both) and fills in each face's fallback (Arial, Times New Roman or Courier New, with sizeAdjust and the ascent, descent and line gap overrides) from the font's own tables, so text doesn’t move when it arrives: nothing to type. Change one through design/update `fonts` only to correct it; a value you set stays when the family is imported again.
        - Element styles reach a tag inside a tag ("h1 em", "nav a:hover") and a class a block carries (".note", "span.note em", ".card.is-open"): give the block that `class` and style it in the design’s `styles`, not in custom CSS. What needs an id, an attribute or a longer selector is a stylesheet beside the design.
        TXT);
    }
}

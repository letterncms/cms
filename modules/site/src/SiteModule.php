<?php

declare(strict_types=1);

namespace Cms\Modules\Site;

use Illuminate\Support\Facades\Route;
use Cms\Modules\Blocks\Anchors;
use Cms\Modules\Blocks\BlocksDocument;
use Cms\Modules\Blocks\Scope;
use Cms\Modules\Blocks\StyleCompiler;
use Cms\Modules\Blocks\Templates;
use Cms\Content\Collections\Collection;
use Cms\Content\Entries\Entry;
use Cms\Contracts\SiteBuilder as SiteBuilderContract;
use Cms\Packages\Plugin;
use Cms\Modules\Site\Build\SiteBuilder;
use Cms\Modules\Site\Design\Design;
use Cms\Modules\Site\Design\Fonts;
use Lettern\Design\Describe;
use Lettern\Design\Theme;
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

        foreach ([Design::class, Fonts::class, Renderer::class, HtmlMinifier::class, UrlGenerator::class, SiteBuilder::class] as $service) {
            $this->app->singleton($service);
        }

        $this->app->singleton(SiteBuilderContract::class, SiteBuilder::class);
    }

    public function boot(): void
    {
        // An agent's way into the design system: `/adjust-design` in the assistant's chat, a prompt for MCP clients.
        $this->cms()->skills()->register('adjust-design', [
            'label' => 'Adjust the Design',
            'description' => 'Change the design system so the site feels a certain way.',
            'icon' => 'palette',
            'prompt' => 'Change the design system so the site feels the way asked here: {feel}. Read cms://site/design first. Change the theme (its seeds, fonts, type scale, radius, motion, text styles) with design/update rather than restyling individual blocks: every page follows the theme. Keep what the contrast check finds clean. Say what you changed and why.',
            'arguments' => [['name' => 'feel', 'description' => 'How the site should feel', 'required' => true]],
            'permission' => 'settings.manage',
        ]);

        $this->renderHooks();
        $this->dataSources();
        $this->routes();
        $this->settingsSchema();
        $this->abilities();
        $this->buildTriggers();
        $this->adminUi();
        $this->agentContext();

        $this->cms()->hooks()->on('cms.installed', fn (User $user) => $this->app->make(Starter::class)->seed($user));

        if ($this->app->runningInConsole()) {
            $this->commands([Console\BuildCommand::class, Console\CheckLinksCommand::class, Console\StarterRefreshCommand::class]);
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
        $hooks->on('render.depend', static fn (string $key) => PageContext::depend($key));
        // Mail wears the site's colours: its light mode, worked out to hex, since mail clients know no custom properties.
        $hooks->addFilter('email.colors', static function (array $colors) use ($design) {
            $t = $design()->resolved()->resolved;
            $light = $t['schemes']['light'];
            $mix = static fn (float $p) => \Lettern\Design\Color::mix($light['foreground'], $light['background'], $p);

            return [...$colors, 'background' => $mix(0.04), 'card' => $light['background'], 'text' => $light['foreground'], 'muted' => $mix($light['mix']['muted'] / 100), 'line' => $mix(0.13), 'button' => $t['palettes']['primary']['fill'], 'button_text' => $t['palettes']['primary']['on']];
        });
        $hooks->on('render.warning', fn (string $message) => $this->app->make(SiteBuilder::class)->warn($message));

        $hooks->addFilter('site.build.extras', fn (array $extras) => $this->cms()->settings('site', 'search_index', true)
            ? [...$extras, 'search' => ['path' => 'search.json', 'render' => fn () => $this->app->make(Search\SearchIndex::class)->json()]]
            : $extras);
        // Styles and animations speak the theme's vocabulary: its own palettes, families and text styles, its durations.
        $hooks->addFilter('blocks.vocabulary', static fn ($v) => $design()->resolved()->vocabulary());
        $hooks->addFilter('blocks.durations', static fn (array $d) => $design()->resolved()->resolved['durations']);

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
        Route::get('/search.json', fn () => $this->cms()->settings('site', 'search_index', true)
            ? response($this->app->make(Search\SearchIndex::class)->json(), 200, ['Content-Type' => 'application/json; charset=utf-8', 'Cache-Control' => 'public, max-age=300'])
            : abort(404));

        Route::middleware(['web', 'auth:web', 'cms.admin'])->group(static function (): void {
            Route::get('/__preview/{id}', [SiteController::class, 'preview'])->where('id', '[0-9a-z]{26}');
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
                ['handle' => 'favicon', 'type' => 'media', 'label' => 'Favicon', 'max' => 1, 'instructions' => 'SVG or PNG, square.'],
                ['handle' => 'static', 'section' => 'Publishing', 'type' => 'toggle', 'label' => 'Build a Static Site', 'default' => true],
                ['handle' => 'auto_build', 'section' => 'Publishing', 'type' => 'toggle', 'label' => 'Rebuild Automatically on Publish', 'default' => true],
                ['handle' => 'search_index', 'section' => 'Publishing', 'type' => 'toggle', 'label' => 'Publish a Search Index', 'default' => true, 'instructions' => 'For the Search block.'],
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
            'handler' => fn () => $builder()->process(1500),
        ]);

        $abilities->register('design/get', [
            'label' => 'Design System',
            'description' => 'The site’s theme (content/design/theme.json, on https://design.lettern.org) and everything it resolves to: palettes, schemes, sizes and steps, the vocabulary every style uses (catalog: each property and the names it takes), DESIGN.md (the theme written for agents), what the contrast check found, fonts and custom JS.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'handler' => function () use ($design) {
                $resolved = $design()->resolved();

                return [
                    'theme' => $design()->theme(),
                    'resolved' => $resolved->resolved,
                    'catalog' => $this->app->make(StyleCompiler::class)->catalog(),
                    'design' => Describe::design($resolved),
                    'findings' => Describe::check($resolved),
                    'fontFiles' => $design()->fontFiles(),
                    'templates' => $this->app->make(Templates::class)->options(),
                    'stylesheet' => $design()->stylesheet(),
                    'js' => $design()->customJs(),
                ];
            },
        ]);

        $theme = ['type' => 'object', 'description' => 'A theme, or part of one (see https://design.lettern.org/v1/theme.schema.json): color seeds and palettes, font slots and faces, type base/ratio/styles, space, layout, radius, shadow, motion, flow, elements and recipes. Names only, never CSS values.'];

        $abilities->register('design/update', [
            'label' => 'Update Design System',
            'description' => 'Change the theme. By default `theme` merges into the saved one (objects merge, anything else replaces, null removes a key); with replace: true it replaces it. A theme with a name outside the vocabulary is refused with the reason, and nothing is saved. Returns what the contrast check found. The site rebuilds.',
            'permission' => 'settings.manage',
            'input' => ['type' => 'object', 'properties' => ['theme' => $theme, 'replace' => ['type' => 'boolean', 'default' => false]], 'required' => ['theme']],
            'handler' => function (array $in) use ($design) {
                $next = ! empty($in['replace']) ? (array) $in['theme'] : Design::merge($design()->theme(), (array) $in['theme']);
                $findings = $design()->save($next);
                $this->app->make(StyleCompiler::class)->forget();
                $design()->saved();

                return ['saved' => true, 'findings' => $findings, 'stylesheet' => $design()->stylesheet()];
            },
        ]);

        $abilities->register('design/preview', [
            'label' => 'Preview Design System',
            'description' => 'The stylesheet, resolved values and contrast findings a theme would give, without saving: the design/update input. For live previews.',
            'permission' => 'settings.manage',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['theme' => $theme, 'replace' => ['type' => 'boolean', 'default' => false]], 'required' => ['theme']],
            'handler' => function (array $in) use ($design) {
                $resolved = Theme::resolve(! empty($in['replace']) ? (array) $in['theme'] : Design::merge($design()->theme(), (array) $in['theme']));

                return ['css' => $design()->compile($resolved), 'resolved' => $resolved->resolved, 'findings' => Describe::check($resolved)];
            },
        ]);

        $abilities->register('design/code', [
            'label' => 'Custom JavaScript',
            'description' => 'Replace the site’s custom.js (content/design): an ES module on every page that may register Alpine components (document.addEventListener("cms:alpine", (e) => e.detail.data("name", () => ({…})))) that elements use through logic.component. Anything visual belongs in the theme, not here.',
            'permission' => 'site.code',
            'input' => ['type' => 'object', 'properties' => ['js' => ['type' => 'string', 'maxLength' => 200000]], 'required' => ['js']],
            'handler' => function (array $in) use ($design) {
                $design()->saveJs((string) $in['js']);
                $design()->saved();

                return ['saved' => true];
            },
        ]);

        $abilities->register('design/fonts-import', [
            'label' => 'Add a Google Font',
            'description' => 'Download a Google Fonts family (latin, variable weights when available) into content/design/fonts so it is self-hosted, and add its faces to the theme. Then put the family in a font slot (font.sans, font.display…) with design/update.',
            'permission' => 'settings.manage',
            'input' => ['type' => 'object', 'properties' => [
                'family' => ['type' => 'string', 'minLength' => 2, 'maxLength' => 60],
                'italic' => ['type' => 'boolean', 'default' => false],
            ], 'required' => ['family']],
            'handler' => function (array $in) use ($design) {
                $fonts = $this->app->make(Fonts::class)->import((string) $in['family'], (bool) ($in['italic'] ?? false));
                $design()->saved();

                return ['fonts' => $fonts];
            },
        ]);

        $abilities->register('design/fonts-upload', [
            'label' => 'Upload a Font',
            'description' => 'Add a .woff2 file (base64) to content/design/fonts and its face to the theme.',
            'permission' => 'settings.manage',
            'input' => ['type' => 'object', 'properties' => [
                'family' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 60],
                'name' => ['type' => 'string', 'maxLength' => 120],
                'data' => ['type' => 'string', 'maxLength' => 4000000],
                'weight' => ['type' => 'string', 'default' => '400'],
                'style' => ['type' => 'string', 'enum' => ['normal', 'italic'], 'default' => 'normal'],
            ], 'required' => ['family', 'data']],
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
            'handler' => fn (array $in) => ['url' => url('/__preview/'.strtolower($in['id']))],
        ]);

        $this->cms()->permissions()->register('site.build', __('Publish the Site'), __('Site'));
        $this->cms()->permissions()->register('site.code', __('Edit Custom JavaScript'), __('Design'), trusted: true);

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

    private function buildTriggers(): void
    {
        $hooks = $this->cms()->hooks();
        $builder = fn () => $this->app->make(SiteBuilder::class);
        $auto = fn () => (bool) $this->cms()->settings('site', 'auto_build', true);

        $hooks->on('entry.published', function (Entry $entry) use ($builder, $auto) {
            $builder()->forgetEntry($entry);
            $auto() && $builder()->queueForEntry($entry);
        });

        $hooks->on('entry.saved', function (Entry $entry, $user, string $action) use ($builder, $auto) {
            // Structural changes (moves, slug changes) of live entries affect URLs immediately.
            if ($entry->isLive() && in_array($action, ['create', 'save'], true) && $entry->draft === null) {
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
            'The site’s design: its theme as DESIGN.md (every name styles use, and what it is on this site) and the theme file itself. Style only with these names, never CSS values.',
            fn () => ['design' => Describe::design($this->app->make(Design::class)->resolved()), 'theme' => $this->app->make(Design::class)->theme()]
        );
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\Site;

use Illuminate\Support\Facades\Route;
use Cms\Modules\Blocks\Anchors;
use Cms\Modules\Blocks\BlocksDocument;
use Cms\Modules\Blocks\Scope;
use Cms\Modules\Blocks\Templates;
use Cms\Abilities\AbilityContext;
use Cms\Content\Collections\Collection;
use Cms\Content\Entries\Entry;
use Cms\Contracts\SiteBuilder as SiteBuilderContract;
use Cms\Packages\Plugin;
use Cms\Support\Schema\Shape;
use Cms\Modules\Site\Build\SiteBuilder;
use Cms\Modules\Site\Http\ContentPolicy;
use Cms\Modules\Site\Http\PublicPage;
use Cms\Modules\Site\Http\PublicPolicy;
use Cms\Modules\Site\Http\SiteController;
use Cms\Modules\Site\Rendering\AugmentedEntry;
use Cms\Modules\Site\Rendering\EntryQueryProxy;
use Cms\Modules\Site\Rendering\HtmlMinifier;
use Cms\Modules\Site\Rendering\PageContext;
use Cms\Modules\Site\Rendering\Renderer;
use Cms\Modules\Site\Rendering\UrlGenerator;
use Cms\Modules\Site\Styling\Candidates;
use Cms\Modules\Site\Styling\Code;
use Cms\Modules\Site\Styling\CodeAbilities;
use Cms\Modules\Site\Styling\Compiler;
use Cms\Modules\Site\Styling\FontFaces;
use Cms\Modules\Site\Styling\Fonts;
use Cms\Modules\Site\Styling\HttpVendorFetcher;
use Cms\Modules\Site\Styling\Styling;
use Cms\Modules\Site\Styling\StylingException;
use Cms\Modules\Site\Styling\Versions;
use Cms\Modules\Site\Styling\Vendor;
use Cms\Modules\Site\Styling\VendorAbilities;
use Cms\Modules\Site\Styling\VendorFetcher;
use Cms\Users\User;

final class SiteModule extends Plugin
{
    /** The design's sections, in the order a design is made: its values, then the looks made of them. */
    private const array DESIGN = [
        ['colors', 'Colors', 'palette'],
        ['typography', 'Typography', 'typography'],
        ['layout', 'Layout', 'ruler'],
        ['effects', 'Effects', 'shadow'],
        ['motion', 'Motion', 'animated'],
        ['styles', 'Styles', 'symbol'],
    ];

    public function register(): void
    {
        require_once __DIR__.'/helpers.php';

        foreach ([Styling::class, Candidates::class, Compiler::class, FontFaces::class, Code::class, Vendor::class, Fonts::class, Renderer::class, HtmlMinifier::class, UrlGenerator::class, SiteBuilder::class, ContentPolicy::class] as $service) {
            $this->app->singleton($service);
        }

        $this->app->singleton(SiteBuilderContract::class, SiteBuilder::class);
        $this->app->singleton(Sites\Sites::class);
        $this->app->bind(VendorFetcher::class, HttpVendorFetcher::class);
    }

    public function boot(): void
    {
        // An agent's way into the styling: `/adjust-styling` in the assistant's chat, a prompt for MCP clients.
        $this->cms()->skills()->register('adjust-styling', [
            'label' => 'Adjust the Styling',
            'description' => 'Change the styling so the site feels a certain way.',
            'icon' => 'palette',
            'prompt' => 'Change the styling so the site feels the way asked here: {feel}. Read cms://site/styling first and change the theme (the @theme variables, the element styles in @layer base and the site’s own @utility classes in the stylesheet, with styling/update) rather than the classes of individual blocks. Say what you changed and why.',
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
        $this->stylingTriggers();
        $this->adminUi();
        $this->agentContext();

        $this->sites();
        $this->policy();

        if ($this->app->runningInConsole()) {
            $this->commands([Console\BuildCommand::class, Console\CheckLinksCommand::class, Console\SiteApplyCommand::class, Console\SiteExportCommand::class, Console\SiteListCommand::class, Console\SiteSwitchCommand::class, Console\VendorCommand::class]);
        }
    }

    /**
     * The security policy of the public pages (Http\ContentPolicy): on for a site that starts today, a setting
     * for one that was there before, whose pages may load from hosts nobody listed yet.
     */
    private function policy(): void
    {
        $hooks = $this->cms()->hooks();
        $policy = fn () => $this->app->make(ContentPolicy::class);

        // Every answer passes it, and only one for which a public page was rendered gets the header: a site page, a
        // page of the account screens, the 429 page. The router's groups are the HTTP kernel's, so not there.
        $this->app->make(\Illuminate\Contracts\Http\Kernel::class)->pushMiddleware(PublicPolicy::class);

        $hooks->on('cms.installed', fn () => $this->cms()->settingsRegistry()->save('site', ['csp' => true]));
        // What code made a page load from (an image from elsewhere, a CDN, a video file): Images and Embeds say so.
        $hooks->on('site.policy.source', static fn (string $kind, mixed $url) => $policy()->source($kind, $url));
        // The canvas shows pages as the site does: the admin lets in the frames the site's pages may hold.
        $hooks->addFilter('admin.frames', static fn (array $frames) => [...$frames, ...$policy()->frames()]);
        // public/.htaccess is copied to a site once: the CMS's own lines in it are kept current here.
        $hooks->on('cms.migrated', static fn () => $policy()->publish());
        $hooks->on('settings.saved', static fn (string $namespace) => $namespace === 'site' && $policy()->publish());

        // A host is listed as a policy names it; anything else would be kept and never count.
        $hooks->addFilter('settings.saving', static function (array $values, string $namespace) {
            if ($namespace === 'site' && isset($values['csp_hosts'])) {
                $values['csp_hosts'] = array_values(array_unique(array_map(static fn ($host) => ContentPolicy::host($host)
                    ?? throw \Cms\Abilities\AbilityException::invalid(__('“:host” is not a host: write it like “player.example.com”, “*.example.com” or “https://example.com”.', ['host' => is_scalar($host) ? (string) $host : '?'])), (array) $values['csp_hosts'])));
            }

            return $values;
        });
    }

    /**
     * Sites: a new site starts from the one its setup chose (starter, a site of the store, unless someone chose another), when it
     * has no collections of its own yet, and any site can take one in later or be made into one.
     */
    private function sites(): void
    {
        $sites = fn () => $this->app->make(Sites\Sites::class);
        Sites\SiteAbilities::register($this->cms(), $sites, fn () => $this->app->make(Sites\SiteApplier::class), fn () => $this->app->make(Sites\SiteExporter::class), fn () => $this->app->make(Sites\SiteImporter::class), fn () => $this->app->make(Sites\SiteEditor::class));

        $this->cms()->hooks()->on('cms.installed', function (User $user) use ($sites): void {
            $chosen = \Cms\Install\Installer::site();

            if ($chosen !== null && ! glob(content_path('collections').'/*.yaml')) {
                // A site that could not be fetched leaves the site empty, and no site's: it is not claimed to be one that isn't there.
                if (($sitePackage = $sites()->find($chosen)) === null) {
                    $sites()->activate(\Cms\Install\Installer::NO_SITE);

                    return;
                }

                $this->app->make(Sites\SiteApplier::class)->apply($sitePackage, 'full', 'skip', $user, withoutPlugins: true, check: false);
            }
        });

        // The site's own mark and the sites it can be, for the admin's header: its favicon when it has one, and the switcher for whoever may switch.
        $this->cms()->hooks()->addFilter('admin.manifest', static fn (array $manifest, User $user) => [
            ...$manifest,
            'site' => [
                ...$manifest['site'],
                'favicon' => \Cms\Modules\Blocks\Media::url(cms()->setting('site', 'favicon')),
                'description' => (string) cms()->setting('site', 'description'),
                'sites' => $user->hasPermission('settings.manage') ? $sites()->switcher() : [],
            ],
        ]);

        // A site the store fetched is checked as any site is, while it is still being unpacked (PackageJobs).
        $this->cms()->hooks()->on('packages.site.staged', fn (string $dir, string $handle) => $this->app->make(Sites\SiteFiles::class)->read(Sites\Site::load($dir, 'site', $handle)));

        // A site's pictures, for the setup and the admin: only what its site.json names.
        Route::get('/_cms/sites/{handle}/{file}', function (string $handle, string $file) use ($sites) {
            $sitePackage = $sites()->find($handle);
            $path = 'previews/'.$file;

            abort_unless($sitePackage !== null && in_array($path, $sitePackage->previews(), true) && is_file($sitePackage->path.'/'.$path) && ! is_link($sitePackage->path.'/'.$path), 404);

            return response()->file($sitePackage->path.'/'.$path, ['Cache-Control' => 'public, max-age=3600', 'X-Content-Type-Options' => 'nosniff']);
        })->where(['handle' => '[a-z0-9][a-z0-9_-]{0,63}', 'file' => '[a-z0-9][a-z0-9_-]{0,60}\.(png|jpg|webp)']);
    }

    /** Let modules and plugins (blocks, seo…) contribute to the page being rendered. */
    private function renderHooks(): void
    {
        $hooks = $this->cms()->hooks();
        $styling = fn () => $this->app->make(Styling::class);

        $hooks->on('render.style', static fn (string $key, string $css, int $order = 0) => PageContext::current()?->addStyle($key, $css, $order));
        $hooks->on('render.head', static fn (string $key, string $html) => PageContext::current()?->addHead($key, $html));
        $hooks->on('render.foot', static fn (string $key, string $html) => PageContext::current()?->addFoot($key, $html));
        $code = fn () => $this->app->make(Code::class);
        $hooks->on('render.code', static fn (array $names) => PageContext::current()?->addCode($names));
        $hooks->on('render.component', static fn (string $handle) => PageContext::current()?->addCode($code()->for('components', $handle)));
        $hooks->on('styling.saved', static fn () => $code()->flush());
        // A block's behaviour names a script: its published file, on a page that then depends on it.
        $hooks->addFilter('blocks.behavior', static function (?string $url, string $module) use ($code, $hooks) {
            $context = PageContext::current();
            $url = $code()->url('scripts', $module);

            if ($context !== null) {
                $context->dependencies["styling:scripts/{$module}"] = true;
                $context->modules = $context->modules || $url !== null;
            }

            $url === null && $hooks->dispatch('render.warning', __('This page names :file, which is not in content/styling.', ['file' => "scripts/{$module}.js"]));

            return $url;
        });
        // A behaviour that draws in the builder's canvas too (`export const canvas = true`): its published file there.
        // Its page carries the import map, which the editor lends the admin so the script finds what it imports.
        $hooks->addFilter('blocks.behavior.canvas', static function (?string $url, string $module) use ($code) {
            $url = $code()->canvas($module) ? $code()->url('scripts', $module) : null;

            if ($url !== null && ($context = PageContext::current()) !== null) {
                $context->dependencies["styling:scripts/{$module}"] = true;
                $context->modules = true;
            }

            return $url;
        });
        $hooks->on('render.depend', static fn (string $key) => PageContext::depend($key));
        // Mail wears the site's colours. Mail clients read plain colours only: a value that is none stays the default.
        $hooks->addFilter('email.colors', static function (array $colors) use ($styling) {
            foreach (['background' => 'background', 'card' => 'raised', 'text' => 'foreground', 'muted' => 'muted', 'line' => 'border', 'button' => 'primary', 'button_text' => 'primary-foreground'] as $key => $name) {
                $value = $styling()->variable('--color-'.$name);
                $value !== null && preg_match('/^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%\/]+\))$/iD', $value) && $colors[$key] = $value;
            }

            return $colors;
        });
        $hooks->on('render.warning', fn (string $message) => $this->app->make(SiteBuilder::class)->warn($message));

        $hooks->addFilter('site.build.extras', fn (array $extras) => $this->cms()->setting('site', 'search_index', true)
            ? [...$extras, 'search' => ['path' => 'search.json', 'render' => fn () => $this->app->make(Search\SearchIndex::class)->json()]]
            : $extras);
        // Every site has an llms.txt: a plugin makes it richer through `site.llms` (see Llms), it does not write another.
        $hooks->addFilter('site.build.extras', fn (array $extras) => [...$extras, 'llms' => ['path' => 'llms.txt', 'render' => fn () => $this->app->make(Llms::class)->render()]]);
        // An animation's ease can be a curve of the theme by its name: --ease-out is "out".
        $hooks->addFilter('blocks.eases', static fn (array $eases) => [...$eases, ...$styling()->eases()]);
        // Where a block's motion and logic change with the screen: the widths the theme's sm:, md: and lg: start at.
        $hooks->addFilter('blocks.breakpoints', static fn (array $breakpoints) => $styling()->breakpoints());
        // A button's looks are the site's btn-<name> classes.
        $hooks->addFilter('fields.options.button-variants', static function (array $options) use ($styling) {
            foreach ($styling()->classes() as $class) {
                if (preg_match('/^btn-([a-z0-9][a-z0-9-]*)$/', $class, $m)) {
                    $options[$m[1]] ??= ucfirst(str_replace('-', ' ', $m[1]));
                }
            }

            return $options;
        });
        // The pages the Renderer makes of its own (an archive's list, a message, the 404) carry classes no content names.
        $hooks->addFilter('styling.candidates', static fn (array $classes) => [...$classes, ...Renderer::classes()]);

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
                    ['handle' => 'show', 'type' => 'select', 'label' => 'Show', 'options' => ['both' => __('Previous and Next'), 'previous' => __('Previous||entry'), 'next' => __('Next||entry')], 'default' => 'both'],
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
                    $body = $current?->entry->body()?->handle;
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
        Route::get('/llms.txt', fn () => response($this->app->make(Llms::class)->render(), 200, ['Content-Type' => 'text/plain; charset=utf-8']));
        Route::get('/search.json', fn () => $this->cms()->setting('site', 'search_index', true)
            ? response($this->app->make(Search\SearchIndex::class)->json(), 200, ['Content-Type' => 'application/json; charset=utf-8', 'Cache-Control' => 'public, max-age=300'])
            : abort(404));

        Route::middleware(['web', 'auth:web', 'cms.admin'])->group(static function (): void {
            Route::get('/__preview/{id}', [SiteController::class, 'preview'])->where('id', '[0-9a-z]{26}');
            Route::get('/__pattern/{handle}', [SiteController::class, 'pattern'])->where('handle', '[a-z0-9][a-z0-9_-]{0,63}');
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
                ['handle' => 'csp', 'section' => 'Security', 'type' => 'toggle', 'label' => 'Content Security Policy', 'default' => false],
                ['handle' => 'csp_hosts', 'section' => 'Security', 'type' => 'tags', 'label' => 'Allowed Hosts', 'placeholder' => 'player.example.com', 'if' => ['csp' => true]],
                ['handle' => 'csp_report_only', 'section' => 'Security', 'type' => 'toggle', 'label' => 'Report Only', 'default' => false, 'if' => ['csp' => true]],
            ];
        });
    }

    private function abilities(): void
    {
        $abilities = $this->cms()->abilities();
        $builder = fn () => $this->app->make(SiteBuilder::class);
        $styling = fn () => $this->app->make(Styling::class);
        $versions = fn () => $this->app->make(Versions::class);

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

        $fontShape = ['family?' => Shape::STRING, 'src?' => Shape::STRING, 'weight?' => Shape::either(Shape::STRING, Shape::INTEGER), 'style?' => Shape::STRING, 'preload?' => Shape::BOOLEAN, 'display?' => Shape::STRING, 'fallback?' => Shape::either(Shape::STRING, [Shape::STRING]), 'sizeAdjust?' => Shape::STRING, 'ascentOverride?' => Shape::STRING, 'descentOverride?' => Shape::STRING, 'lineGapOverride?' => Shape::STRING];
        $transitionShape = ['type' => Shape::enum('none', 'fade', 'slide', 'scale'), 'duration' => Shape::NUMBER, 'navigation' => Shape::enum('document', 'client')];
        // What the stylesheet or the fonts refuse is the caller's to correct: Tailwind's own message, not a server error.
        $guard = static function (\Closure $work) {
            try {
                return $work();
            } catch (StylingException|\InvalidArgumentException $e) {
                throw \Cms\Abilities\AbilityException::invalid($e->getMessage());
            }
        };

        $abilities->register('styling/get', [
            'label' => 'Styling',
            'description' => <<<'TXT'
            The site’s styling. `css` is content/styling/theme.css, a Tailwind CSS v4 stylesheet, and blocks carry Tailwind classes in `class` ("grid gap-6 md:grid-cols-3"). The stylesheet has four parts:
            - `@import "tailwindcss"; @import "cms";` first (Tailwind, then what blocks, buttons and fields are built from).
            - `@theme { --color-primary: #1d4ed8; --font-display: "Fraunces", serif; --container-content: 72rem; }`: every variable is a set of classes (bg-primary, text-primary, font-display, max-w-content). Namespaces are Tailwind’s: --color-*, --font-*, --text-*, --font-weight-*, --leading-*, --tracking-*, --spacing-*, --radius-*, --shadow-*, --inset-shadow-*, --drop-shadow-*, --text-shadow-*, --blur-*, --perspective-*, --aspect-*, --container-*, --breakpoint-*, --ease-*, --animate-*; Tailwind’s own values are there until a namespace is cleared (--text-*: initial). A value with a dark side is light-dark(#ffffff, #0b0b0c): a theme with one follows the visitor’s light or dark mode by itself.
            - `@layer base { h1 { @apply font-display text-5xl font-semibold tracking-tight; } }`: what elements look like before a block says otherwise.
            - `@utility card { @apply rounded-xl border border-border bg-raised p-6; }`: a class of the site’s own, used on blocks like any Tailwind class and with every variant (hover:card, md:card). `classes` lists them. A button’s looks are the btn-<name> classes (btn-primary, btn-secondary). A comment right before a class puts it in a group of the design’s Styles: `/* group: Cards */`.
            Anything else in it is plain CSS. Also here: `fonts` (the self-hosted font faces) and `fontFiles`, `transition` (the page transition), `templates` (handle => title), `js` (custom.js) and `stylesheet` (the published CSS file, compiled on the server whenever the stylesheet or the content changes).
            TXT,
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'output' => Shape::of([
                'css' => Shape::STRING,
                'classes' => [Shape::STRING],
                'fonts' => [$fontShape],
                'fontFiles' => [Shape::STRING],
                'transition' => $transitionShape,
                'templates' => Shape::map(Shape::STRING),
                'stylesheet' => Shape::STRING, 'js' => Shape::STRING,
            ]),
            'handler' => fn () => [
                'css' => $styling()->theme(),
                'classes' => $styling()->classes(),
                'fonts' => $styling()->fonts(),
                'fontFiles' => $styling()->fontFiles(),
                'transition' => $styling()->settings()['transition'],
                'templates' => $this->app->make(Templates::class)->options(),
                'stylesheet' => $styling()->stylesheet(),
                'js' => $styling()->customJs(),
            ],
        ]);

        $abilities->register('styling/update', [
            'label' => 'Update Styling',
            'description' => <<<'TXT'
            Change the site’s styling. `css` replaces the whole stylesheet (content/styling/theme.css): read it with styling/get, change it and send all of it back. It is Tailwind CSS v4 and starts `@import "tailwindcss"; @import "cms";`. Change a colour, font or size in `@theme` (--color-primary: #0f766e; a dark side as light-dark(#0f766e, #5eead4)), an element in `@layer base` (h2 { @apply text-3xl font-semibold; }), and add a class of the site’s own as `@utility name { @apply …; }`, which blocks then carry in `class` with any variant. For example, a new accent colour and a card:
            @theme { --color-accent: #e11d48; }
            @utility card { @apply rounded-xl border border-border bg-raised p-6 hover:border-accent; }
            A stylesheet Tailwind cannot compile is refused with Tailwind’s message, and nothing is saved. `fonts` replaces the font faces (styling/fonts-import adds a family for you). `transition` is merged: name only what changes, null puts a setting back to its default. The CSS is compiled at once and the site rebuilds.
            TXT,
            'permission' => 'settings.manage',
            'input' => ['type' => 'object', 'properties' => [
                'css' => ['type' => 'string', 'maxLength' => 500000, 'description' => 'The whole stylesheet.'],
                'fonts' => ['type' => 'array', 'items' => ['type' => 'object'], 'description' => 'Every font face: {family, src: "fonts/<file>.woff2", weight: "400" or "100 900", style: normal|italic, preload?, display?, fallback?, sizeAdjust?, ascentOverride?, descentOverride?, lineGapOverride?}. Name the family in the theme: --font-sans: "Hanken Grotesk", "Hanken Grotesk Fallback", sans-serif.'],
                'transition' => ['type' => 'object', 'description' => 'Merged into the stored transition: name only what changes. null removes a setting, which then has its default (type none, duration 0.3, navigation document).', 'properties' => ['type' => ['type' => ['string', 'null'], 'enum' => ['none', 'fade', 'slide', 'scale', null]], 'duration' => ['type' => ['number', 'null']], 'navigation' => ['type' => ['string', 'null'], 'enum' => ['document', 'client', null], 'description' => 'client: links to pages of the site swap the page without a page load, inside the transition, so blocks with `persist` live on across pages. document (default): the browser loads every page.']]],
            ]],
            'output' => Shape::of(['saved' => Shape::BOOLEAN, 'stylesheet' => Shape::STRING]),
            'handler' => static fn (array $in, AbilityContext $ctx) => $guard(static function () use ($in, $ctx, $styling, $versions) {
                $before = ['css' => $styling()->theme(), 'transition' => $styling()->settings()['transition']];
                // The stylesheet first: when it is refused, nothing of the change is saved.
                isset($in['css']) && $styling()->saveTheme((string) $in['css']);
                $settings = array_intersect_key($in, ['fonts' => 1, 'transition' => 1]);
                $settings !== [] && $styling()->saveSettings($settings);
                $styling()->saved();
                $versions()->record($ctx->user, $before);

                return ['saved' => true, 'stylesheet' => $styling()->stylesheet()];
            }),
        ]);

        $abilities->register('styling-versions/list', [
            'label' => 'Styling Versions',
            'description' => 'The styling as it was saved, newest first: each save of the stylesheet or the page transition, who saved it and when. `current` is what the site has now. Read one with styling-versions/get; to go back to it, send its css and transition to styling/update.',
            'permission' => 'settings.manage',
            'annotations' => ['readOnly' => true],
            'output' => Shape::of([['id' => Shape::STRING, 'at' => Shape::STRING, 'user' => Shape::STRING_OR_NULL, 'current' => Shape::BOOLEAN]]),
            'handler' => static fn () => $versions()->list(),
        ]);

        $abilities->register('styling-versions/get', [
            'label' => 'Styling Version',
            'description' => 'One saved version of the styling (see styling-versions/list): its whole stylesheet and its page transition.',
            'permission' => 'settings.manage',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string']], 'required' => ['id']],
            'output' => Shape::of(['css' => Shape::STRING, 'transition' => $transitionShape]),
            'handler' => static fn (array $in) => $versions()->find((string) $in['id']) ?? throw \Cms\Abilities\AbilityException::invalid(__('No saved version of the styling has this id.')),
        ]);

        $abilities->register('styling/source', [
            'label' => 'Styling Source',
            'description' => 'What Tailwind compiles the site’s CSS from, for a live preview of a draft: `css` (the stylesheet, or the draft given as `css`), `files` (the stylesheets it imports by name: "cms"), `candidates` (every class the content uses) and `signature`, which names exactly this source. `faces` is the CSS that stands before Tailwind’s output on a page: the @font-face rules and the page transition. The server compiles the saved stylesheet itself.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['css' => ['type' => 'string', 'maxLength' => 500000, 'description' => 'A draft of the stylesheet; the signature is then the draft’s.']]],
            'output' => Shape::of(['signature' => Shape::STRING, 'css' => Shape::STRING, 'files' => Shape::map(Shape::STRING), 'candidates' => [Shape::STRING], 'faces' => Shape::STRING]),
            'handler' => static function (array $in) use ($styling) {
                $source = $styling()->source(isset($in['css']) ? (string) $in['css'] : null);

                return ['signature' => $styling()->signature($source), ...$source, 'faces' => $styling()->faces()];
            },
        ]);

        $abilities->register('styling-code/set-custom', [
            'label' => 'Custom JavaScript',
            'description' => 'Replace the site’s custom.js (content/styling). It loads as an ES module on every page and may register Alpine components (document.addEventListener("cms:alpine", (e) => e.detail.data("name", () => ({…})))) that elements use through logic.component. CSS is not here: it goes in the stylesheet (styling/update).',
            'permission' => 'site.code',
            'input' => ['type' => 'object', 'properties' => ['js' => ['type' => 'string', 'maxLength' => 200000]], 'required' => ['js']],
            'output' => Shape::of(['saved' => [Shape::enum('js')]]),
            'handler' => static fn (array $in) => $guard(static function () use ($in, $styling) {
                $styling()->saveJs((string) $in['js']);
                $styling()->saved();

                return ['saved' => ['js']];
            }),
        ]);

        $abilities->register('styling/fonts-import', [
            'label' => 'Add a Google Font',
            'description' => 'Download a Google Fonts family (latin) into content/styling/fonts so it is self-hosted, and add its faces to the site’s fonts: the weights its variable axis really spans as one file, or the static weights it has; upright, italic or both. Then name it in the theme with styling/update: --font-display: "Fraunces", "Fraunces Fallback", serif. Text does not move when the font arrives: each face gets a fallback read from the font’s own tables, {"fallback": "Arial", "sizeAdjust": "103.63%", "ascentOverride": "88.48%", "descentOverride": "24.32%", "lineGapOverride": "0%"} (Arial for a sans, Times New Roman for a serif, Courier New for a monospace family), which draws that local font at the web font’s size first, as the family "<Family> Fallback". Change those numbers with styling/update `fonts`: importing the family again keeps what its faces say.',
            'permission' => 'settings.manage',
            'input' => ['type' => 'object', 'properties' => [
                'family' => ['type' => 'string', 'minLength' => 2, 'maxLength' => 60],
                'style' => ['type' => 'string', 'enum' => ['normal', 'italic', 'both'], 'description' => 'normal when left out. Italic is left out when the family has none.'],
                'italic' => ['type' => 'boolean', 'description' => 'The same as style: "both", when style is not given.'],
                'weights' => ['type' => 'array', 'items' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 1000], 'maxItems' => 9, 'description' => 'Static weights to take when the family has no weight axis; 400, 500, 600 and 700 of what it has when left out.'],
            ], 'required' => ['family']],
            'output' => Shape::of(['fonts' => [['family' => Shape::STRING, 'src' => Shape::STRING, 'weight' => Shape::STRING, 'style' => Shape::enum('normal', 'italic'), 'preload' => Shape::BOOLEAN, 'fallback?' => Shape::STRING, 'sizeAdjust?' => Shape::STRING, 'ascentOverride?' => Shape::STRING, 'descentOverride?' => Shape::STRING, 'lineGapOverride?' => Shape::STRING]]]),
            'handler' => fn (array $in) => $guard(function () use ($in, $styling) {
                $fonts = $this->app->make(Fonts::class)->import((string) $in['family'], (string) ($in['style'] ?? (! empty($in['italic']) ? 'both' : 'normal')), array_map('intval', (array) ($in['weights'] ?? [])));
                $styling()->saved();

                return ['fonts' => $fonts];
            }),
        ]);

        $abilities->register('styling/fonts-upload', [
            'label' => 'Upload a Font',
            'description' => 'Add a .woff2 file (base64) to content/styling/fonts and the site’s fonts. Name its family in the theme with styling/update (--font-sans: "My Font", sans-serif).',
            'permission' => 'settings.manage',
            'input' => ['type' => 'object', 'properties' => [
                'family' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 60],
                'name' => ['type' => 'string', 'maxLength' => 120],
                'data' => ['type' => 'string', 'maxLength' => 4000000],
                'weight' => ['type' => 'string', 'default' => '400'],
                'style' => ['type' => 'string', 'enum' => ['normal', 'italic'], 'default' => 'normal'],
            ], 'required' => ['family', 'data']],
            'output' => Shape::of(['family' => Shape::STRING, 'src' => Shape::STRING, 'weight' => Shape::STRING, 'style' => Shape::enum('normal', 'italic')]),
            'handler' => fn (array $in) => $guard(function () use ($in, $styling) {
                $font = $this->app->make(Fonts::class)->upload((string) $in['family'], (string) ($in['name'] ?? $in['family']), (string) $in['data'], (string) ($in['weight'] ?? '400'), (string) ($in['style'] ?? 'normal'));
                $styling()->saved();

                return $font;
            }),
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
        // Trusted: a site's scripts run as whoever opens the site, the builder (behaviors that draw there) or a
        // preview, administrators included. Only administrators hold it by default, and a site with code needs it.
        $this->cms()->permissions()->register('site.code', 'Edit Scripts and Stylesheets', 'Design', 'Its scripts run in the browser of everyone who opens the site, the builder or a preview, administrators too.', trusted: true);

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

        foreach (['globals.saved', 'styling.saved', 'collection.saved', 'collection.deleted', 'entries.reordered', 'navigation.saved'] as $event) {
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

    /**
     * The site's CSS holds the classes its content uses. When content changes, the classes are looked for again
     * and the CSS is compiled again, once, when it is next asked for or the request ends.
     */
    private function stylingTriggers(): void
    {
        $hooks = $this->cms()->hooks();

        foreach (['entry.saved', 'entry.published', 'entry.unpublished', 'entry.deleted', 'globals.saved', 'global.saved', 'global.deleted', 'navigation.saved', 'collection.deleted', 'site.cleared'] as $event) {
            $hooks->on($event, fn () => $this->app->make(Styling::class)->changed());
        }

        $this->app->terminating(fn () => $this->app->resolved(Styling::class) && $this->app->make(Styling::class)->settle());
    }

    private function adminUi(): void
    {
        $admin = $this->cms()->admin();
        // The design's sections, each beside the site as it looks with the draft: its theme, kind by kind, then its styles.
        // One screen draws them all (`/design/*`), so a change not yet saved goes along from one to the next.
        foreach (self::DESIGN as $order => [$id, $label, $icon]) {
            $admin->nav("design.{$id}", ['label' => $label, 'path' => "/design/{$id}", 'icon' => $icon, 'section' => 'design', 'order' => ($order + 1) * 10, 'permission' => 'settings.manage']);
        }
        // What a developer adds beside the structure: the site's own CSS, scripts and libraries.
        $admin->nav('code', ['label' => 'Code', 'path' => '/code', 'icon' => 'code', 'section' => 'structure', 'order' => 60, 'permission' => 'settings.manage']);
        // A whole site to switch to, import or export: with the design, as a site is a look of its own.
        $admin->nav('sites', ['label' => 'Sites', 'path' => '/sites', 'icon' => 'box', 'section' => 'design-site', 'order' => 80, 'permission' => 'settings.manage']);
        $admin->command('sites', ['label' => 'Sites', 'icon' => 'box', 'path' => '/sites', 'permission' => 'settings.manage', 'keywords' => ['starter', 'template', 'export', 'import']]);
        $admin->widget('site-status', ['label' => 'Site', 'description' => 'Whether the live site is up to date, with a button to publish it.', 'icon' => 'rocket', 'column' => 'side', 'enabled' => true, 'order' => 10]);
        $admin->command('publish-site', ['label' => 'Publish Site', 'icon' => 'rocket', 'ability' => 'site/build', 'permission' => 'site.build', 'keywords' => ['build', 'deploy', 'static']]);

        $this->adminModule();
    }

    private function agentContext(): void
    {
        $this->cms()->context()->register(
            'cms://site/styling',
            'Styling',
            'The site’s Tailwind stylesheet (theme.css: the @theme variables, the element styles and the site’s own @utility classes), its fonts and page transition. Style blocks with classes built from these names instead of arbitrary values.',
            function () {
                $styling = $this->app->make(Styling::class);

                return [
                    'rules' => [
                        'Blocks carry Tailwind CSS v4 classes in `class`: "grid gap-6 md:grid-cols-3", "bg-primary text-primary-foreground hover:opacity-90". Every class Tailwind has works, with its variants (sm: md: lg:, hover: focus-visible:, dark:, group-hover:).',
                        'A variable of `@theme` is a set of classes: --color-primary gives bg-primary, text-primary and border-primary; --font-display gives font-display; --container-content gives max-w-content. Use these names, not arbitrary values (bg-[#123456]).',
                        '`classes` are the site’s own (`@utility name { @apply …; }` in the stylesheet): use them like any class. A button’s looks are btn-<name>.',
                        'A state is an attribute, styled with a data variant: `data-open:rotate-45` on the element itself, `in-data-open:hidden` inside it, `group-data-open:…` under a `group`. `current:` styles the link to the page being shown.',
                        'Dark values are in the theme as light-dark(light, dark); `dark:` on a class works too.',
                        'Change the stylesheet with styling/update (the whole of it as `css`).',
                    ],
                    'css' => $styling->theme(),
                    'classes' => $styling->classes(),
                    ...$styling->settings(),
                ];
            }
        );

        // Where the front end's own surface is described, for an agent that only read the general guide.
        $this->cms()->hooks()->addFilter('agent.guide', static fn (string $guide) => $guide."\n".<<<'TXT'
        Front end:
        - Styling is Tailwind CSS v4. A block’s look is its `class` ("flex items-center gap-4 md:gap-8"); the site’s colours, fonts and sizes are the `@theme` variables of one stylesheet, content/styling/theme.css (styling/get, styling/update), which also holds the element styles (`@layer base`) and the site’s own classes (`@utility card { @apply …; }`). What many blocks share becomes such a class; a value the theme lacks goes into the theme, not into an arbitrary value on a block.
        - A state is an attribute (`data-open`, `data-scrolled`, `data-current`), styled with Tailwind’s data variants: `data-open:rotate-45`, `in-data-open:hidden`, `group-data-open:opacity-100`. `current:` is the link to the page being shown, `dark:` the dark side.
        - The CSS a page links is compiled on the server from the stylesheet for the classes the content uses, by itself, whenever either changes: a class an agent writes on a block has its CSS at once.
        - Motion, scripts and page transitions are data on blocks and in the styling, not theme files: read cms://blocks for `motion` (load, appear, scroll with pin, scrub and progress), `behavior` (a script of the site mounted on a block, one or several), `persist` and `code`, and cms://site/code for the scripts, stylesheets and libraries in content/styling (styling-code/list, styling-code/save, styling-vendor/create).
        - A scroll animation with progress: true (or with scrub) tells its element how far along it is (--cms-progress, and a cms:progress event), so a number that counts with the scroll needs a few lines in a behaviour and no library.
        - styling/update changes the page transition one setting at a time ({"transition": {"navigation": "client"}} keeps its type and duration); `css` and `fonts` are replaced whole.
        - styling/fonts-import brings a Google Fonts family as it is (style: normal, italic or both) and fills in each face's fallback (Arial, Times New Roman or Courier New, with sizeAdjust and the ascent, descent and line gap overrides) from the font's own tables, so text doesn’t move when it arrives: nothing to type. Name the family and its fallback in the theme (--font-sans: "Inter", "Inter Fallback", sans-serif). Change a face through styling/update `fonts` only to correct it; a value you set stays when the family is imported again.
        - A site is a whole site to start from, copied in once: sites/list has the ones here; sites/get with `mode` (design or full) is the plan, step by step; sites/apply takes it in (dryRun first: it refuses while the site has something of a name the site brings, until `clash` is skip, replace or rename); sites/export makes this site into one in sites/<handle>.
        TXT);
    }
}

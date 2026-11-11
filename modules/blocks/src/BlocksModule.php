<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks;

use Cms\Abilities\Ability;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Abilities\Shapes;
use Cms\Packages\Plugin;
use Cms\Support\Files;
use Cms\Support\Schema\Shape;

final class BlocksModule extends Plugin
{
    public function register(): void
    {
        foreach ([BlockRegistry::class, StyleCompiler::class, BlockRenderer::class, Patterns::class, Templates::class, DataSources::class, Document::class, MarkdownCodec::class] as $service) {
            $this->app->singleton($service);
        }

        $this->cms()->whenAvailable(\Cms\Content\Fields\FieldTypeRegistry::class, static function ($types) {
            $types->register(new BlocksField);
            $types->register(new PropertiesField);
        });
    }

    public function boot(): void
    {
        $registry = $this->app->make(BlockRegistry::class);

        foreach (CoreBlocks::all() as $block) {
            $registry->register($block);
        }

        foreach (CoreBlocks::categories() as $category) {
            $registry->category($category['name'], $category['label']);
        }

        $permissions = $this->cms()->permissions();
        $permissions->register('blocks.html', 'Add Custom HTML Blocks', 'Content', trusted: true);

        $this->cms()->admin()->widget('blocks-design', ['label' => 'Components and Templates', 'description' => 'Components and templates changed last.', 'icon' => 'palette', 'column' => 'main', 'order' => 50, 'permission' => 'entries.components.view']);
        $this->collections();
        $this->guardHtmlBlocks();
        $this->guardBlockCode();
        $this->cms()->hooks()->addFilter('blocks.data-sources', fn (array $sources) => [...$sources, ...$this->app->make(CmsSources::class)->sources()]);
        $this->frontend();
        $this->abilities();
        $this->agentContext();

        $this->adminModule(import: '@letterncms/blocks');
    }

    /**
     * Templates and components are collections, so they get everything entries
     * have — drafts, publishing, history, comments, the shared block workspace, abilities.
     * A site can redefine them in content/collections/<handle>.yaml.
     */
    private function collections(): void
    {
        $this->cms()->hooks()->addFilter('collections.defaults', static fn (array $defaults) => $defaults + [
            'body' => 'content',
            'fields' => [['handle' => 'content', 'type' => 'blocks', 'label' => 'Content']],
        ]);

        $this->cms()->hooks()->addFilter('collections', static function (array $collections) {
            $collections[Templates::COLLECTION] ??= \Cms\Content\Collections\Collection::fromArray(Templates::COLLECTION, [
                'title' => 'Templates', 'singular' => 'Template', 'icon' => 'layout', 'driver' => 'files', 'structure' => 'list',
                'section' => 'design', 'nav_order' => 20, 'system' => true, 'body' => 'blocks', 'sort' => 'title',
                'description' => 'The frame around each page: header, footer and layout. Default frames every page without one of its own; Not found shows when a page is missing.',
                'fields' => [
                    ['handle' => 'blocks', 'type' => 'blocks', 'label' => 'Template'],
                    ['handle' => 'description', 'type' => 'textarea', 'label' => 'Description', 'section' => 'sidebar'],
                    ['handle' => 'collections', 'type' => 'select', 'label' => 'Offered For', 'multiple' => true, 'dynamic' => 'collections', 'section' => 'sidebar', 'instructions' => 'Leave empty to offer it everywhere.'],
                ],
            ]);
            $collections[Patterns::COLLECTION] ??= \Cms\Content\Collections\Collection::fromArray(Patterns::COLLECTION, [
                'title' => 'Components', 'singular' => 'Component', 'icon' => 'symbol', 'driver' => 'files', 'structure' => 'list',
                'section' => 'design', 'nav_order' => 30, 'system' => true, 'body' => 'blocks', 'sort' => 'title',
                'description' => 'Reusable designs. A synced one (a header, a card) changes everywhere it is used; a section is copied when you insert it.',
                'fields' => [
                    ['handle' => 'blocks', 'type' => 'blocks', 'label' => 'Component'],
                    // With the handle, in the details' first group: one group of rows, labeled alike, then Info.
                    ['handle' => 'synced', 'type' => 'toggle', 'label' => 'Synced', 'default' => true, 'section' => 'sidebar'],
                    ['handle' => 'category', 'type' => 'text', 'label' => 'Category', 'section' => 'sidebar'],
                    ['handle' => 'description', 'type' => 'textarea', 'label' => 'Description', 'section' => 'sidebar'],
                    ['handle' => 'props', 'type' => 'properties', 'label' => 'Properties', 'section' => 'sidebar', 'placeholder' => 'No properties yet.', 'add' => 'Add Property'],
                ],
            ]);

            return $collections;
        });

        // The lists block fields choose from (`dynamic`). The site's design system adds its own button looks (`buttons` in tokens.json).
        $hooks = $this->cms()->hooks();
        $hooks->addFilter('fields.options.button-variants', static fn (array $options) => [...['primary' => 'Primary', 'secondary' => 'Secondary', 'ghost' => 'Ghost', 'link' => 'Text link'], ...$options], 5);
        $hooks->addFilter('fields.options.sources', fn (array $options) => [...$options, ...array_column($this->app->make(DataSources::class)->catalog(), 'label', 'name')]);
        $hooks->addFilter('fields.options.patterns', fn (array $options) => [...$options, ...array_map(static fn ($p) => $p['title'], array_filter($this->app->make(Patterns::class)->all(), static fn ($p) => $p['synced']))]);

        foreach (['entry.saved', 'entry.published', 'entry.unpublished', 'entry.deleted'] as $event) {
            $this->cms()->hooks()->on($event, function ($entry) {
                if (in_array($entry->collection ?? null, [Templates::COLLECTION, Patterns::COLLECTION], true)) {
                    $this->app->make(Templates::class)->flush();
                    $this->app->make(Patterns::class)->flush();
                }
            });
        }
    }

    /** Structural CSS for blocks, and the runtime for pages that use scripts, animation, search or code. */
    private function frontend(): void
    {
        $hooks = $this->cms()->hooks();
        $renderer = fn () => $this->app->make(BlockRenderer::class);

        $hooks->on('render.begin', fn () => $renderer()->begin());

        // Built pages name the runtime by its hashed file; a new one rebuilds them all.
        $hooks->addFilter('site.build.signature', fn (array $parts) => [...$parts, (string) $this->runtime()['entry'], (string) @filemtime($this->path('resources/css/blocks.css'))]);

        $hooks->addFilter('site.head', function (array $head) use ($renderer) {
            $css = (string) file_get_contents($this->path('resources/css/blocks.css'));
            $hash = substr(hash('xxh128', $css), 0, 10);
            $file = public_path("_cms/blocks/blocks-{$hash}.css");

            if (! is_file($file)) {
                foreach (glob(public_path('_cms/blocks/blocks-*.css')) ?: [] as $old) {
                    @unlink($old);
                }

                Files::put($file, $css);
            }

            // After the design stylesheet, before block styles collected while rendering.
            $head[] = '<link rel="stylesheet" href="/_cms/blocks/blocks-'.$hash.'.css">';

            $features = $renderer()->features;

            if (! empty($features['account']) && ! $renderer()->editor) {
                $head[] = \Cms\Users\AccountInBrowser::script();
            }

            // Editor placeholders stay available across rendered document updates.
            if ($renderer()->editor) {
                $head[] = '<style data-cms-editor="placeholders">'.file_get_contents($this->path('resources/css/editor.css')).'</style>';
            }

            return $head;
        }, 5);

        $hooks->addFilter('site.foot', function (array $foot, $context = null) use ($renderer, $hooks) {
            $features = array_keys(array_filter($renderer()->features));

            // Something that moves forever needs a way to stop it (WCAG 2.2.2).
            if (in_array('forever', $features, true) && ! in_array('motion-toggle', $features, true) && ! $renderer()->editor) {
                $hooks->dispatch('render.warning', __('This page has an animation that runs forever and no Motion Toggle block to pause it.'));
            }

            $features = array_values(array_diff($features, ['forever', 'motion-toggle', 'account']));

            if ($features === [] || $renderer()->editor) {
                return $foot;
            }

            $runtime = $this->runtime();

            if ($runtime['entry'] !== null) {
                $foot[] = '<script type="module" src="'.e($runtime['entry']).'" data-features="'.e(implode(' ', $features)).'"></script>';
            }

            return $foot;
        });
    }

    /**
     * The site runtime from dist/runtime (Vite manifest): its entry script.
     *
     * @return array{entry: ?string}
     */
    public function runtime(): array
    {
        static $cache = null;

        if ($cache !== null) {
            return $cache;
        }

        $entry = null;

        foreach (Files::readJson($this->path('dist/runtime/manifest.json')) as $chunk) {
            if (! empty($chunk['isEntry'])) {
                $entry = $this->asset('runtime/'.$chunk['file']);
            }
        }

        return $cache = ['entry' => $entry];
    }

    /** Only people with blocks.html may add or change Custom HTML blocks. */
    private function guardHtmlBlocks(): void
    {
        $this->cms()->hooks()->addFilter('ability.input', function (array $input, Ability $ability, AbilityContext $ctx) {
            if ($ctx->system || ! in_array($ability->name, ['entries/create', 'entries/update', 'components/save', 'globals/set'], true)) {
                return $input;
            }

            if ($ctx->user?->hasPermission('blocks.html')) {
                return $input;
            }

            $incoming = $this->htmlBlocks($input);

            if ($incoming === []) {
                return $input;
            }

            $existing = match ($ability->name) {
                'entries/update' => ($entry = $this->cms()->entries()->find((string) ($input['id'] ?? ''))) ? $this->htmlBlocks($entry->working()) : [],
                'components/save' => $this->htmlBlocks($this->app->make(Patterns::class)->all(true)[(string) ($input['handle'] ?? '')] ?? []),
                default => [],
            };

            if (array_diff($incoming, $existing) !== []) {
                throw AbilityException::forbidden('You are not allowed to add or change Custom HTML blocks.');
            }

            return $input;
        });
    }

    /**
     * Only people with site.code may put the design's code on a block: its `behavior` (a script mounted on it),
     * its `code` (scripts and styles it loads) and `persist` (kept across pages, with whatever runs in it).
     * Without it a block keeps what it has: saved back unchanged it passes, added or changed it is refused.
     */
    private function guardBlockCode(): void
    {
        $this->cms()->hooks()->addFilter('ability.input', function (array $input, Ability $ability, AbilityContext $ctx) {
            if ($ctx->system || ! in_array($ability->name, ['entries/create', 'entries/update', 'components/save', 'globals/set'], true)) {
                return $input;
            }

            if ($ctx->user?->hasPermission('site.code')) {
                return $input;
            }

            $incoming = $this->blockCode($input);

            if ($incoming === []) {
                return $input;
            }

            $existing = match ($ability->name) {
                'entries/update' => ($entry = $this->cms()->entries()->find((string) ($input['id'] ?? ''))) ? $this->blockCode($entry->working()) : [],
                'components/save' => $this->blockCode($this->app->make(Patterns::class)->all(true)[(string) ($input['handle'] ?? '')] ?? []),
                default => [],
            };

            if (array_diff($incoming, $existing) !== []) {
                throw AbilityException::forbidden('You are not allowed to add or change a block’s scripts, styles or behavior.');
            }

            return $input;
        });
    }

    /**
     * What each block carries of the design's code, as the document keeps it, one fingerprint per block that has any.
     *
     * @return list<string>
     */
    private function blockCode(array $data): array
    {
        $found = [];

        $walk = static function ($value) use (&$walk, &$found): void {
            if (! is_array($value)) {
                return;
            }

            if (is_string($value['type'] ?? null) && (isset($value['behavior']) || isset($value['code']) || isset($value['persist']))) {
                $kept = array_filter([
                    'behavior' => Document::behavior($value['behavior'] ?? null),
                    'code' => Document::code($value['code'] ?? null),
                    'persist' => is_string($value['persist'] ?? null) && preg_match(Document::PERSIST, $value['persist']) ? $value['persist'] : null,
                ]);
                // What the document would drop anyway (a name that is no name) is nothing added.
                $kept !== [] && $found[] = hash('sha256', (string) json_encode($kept));
            }

            foreach ($value as $child) {
                $walk($child);
            }
        };
        $walk($data);

        return $found;
    }

    /** @return list<string> */
    private function htmlBlocks(array $data): array
    {
        $found = [];

        $walk = static function ($value) use (&$walk, &$found): void {
            if (! is_array($value)) {
                return;
            }

            if (($value['type'] ?? null) === 'html' && isset($value['props']['html'])) {
                $found[] = hash('sha256', (string) $value['props']['html']);
            }

            foreach ($value as $child) {
                $walk($child);
            }
        };
        $walk($data);

        return $found;
    }

    /** The block catalog in the user's language: titles, descriptions and prop fields (agents read it in English). */
    private function translatedBlocks(): array
    {
        $t = $this->app->make(\Cms\Admin\Translations::class);

        return array_map(static fn (array $block) => [
            ...$block,
            'title' => $t->label($block['title']),
            'description' => $t->label($block['description'] ?? ''),
            'fields' => $t->fields($block['fields'] ?? []),
        ], $this->app->make(BlockRegistry::class)->catalog());
    }

    /** Block categories in the inserter's order and the user's language. */
    private function translatedCategories(): array
    {
        $t = $this->app->make(\Cms\Admin\Translations::class);

        return array_map(static fn (array $category) => [...$category, 'label' => $t->label($category['label'])], $this->app->make(BlockRegistry::class)->categories());
    }

    /** Data sources for Repeat in the user's language: names, descriptions, settings and item labels. */
    private function translatedSources(): array
    {
        $t = $this->app->make(\Cms\Admin\Translations::class);

        return array_map(static fn (array $source) => [
            ...$source,
            'label' => $t->label($source['label']),
            'description' => $t->label($source['description']),
            'fields' => $t->fields($source['fields']),
            'item' => (object) array_map($t->label(...), (array) $source['item']),
        ], $this->app->make(DataSources::class)->catalog());
    }

    private function abilities(): void
    {
        $a = $this->cms()->abilities();
        $patterns = fn () => $this->app->make(Patterns::class);
        $templates = fn () => $this->app->make(Templates::class);
        $document = fn () => $this->app->make(Document::class);
        $handle = ['type' => 'string', 'pattern' => '^[a-z0-9][a-z0-9_-]{0,63}$'];

        $a->register('blocks/types', [
            'label' => 'Block Catalog',
            'description' => 'Every block type (props, children, examples), every style property and variant, data sources for Repeat, and the schema of scripts (logic) and animations (motion). Compose pages from these.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true, 'trustedOutput' => true],
            'output' => Shape::of([
                'blocks' => [[
                    'name' => Shape::STRING, 'title' => Shape::STRING, 'icon' => Shape::STRING, 'category' => Shape::STRING, 'description' => Shape::STRING,
                    'keywords?' => [Shape::STRING], 'fields' => [Shapes::field()], 'children?' => Shape::either(Shape::BOOLEAN, [Shape::STRING]),
                    'styles?' => [Shape::STRING], 'inline?' => [Shape::STRING],
                    'defaults' => Shape::open('Prop values a new block of this type starts with, by prop handle (the handles are in `fields`).'),
                    'template?' => [self::nodeShape(written: true)], 'parent?' => Shape::STRING, 'variants?' => [Shape::STRING],
                    'example?' => Shape::open('Example prop values for this type, by prop handle (the handles are in `fields`).'), 'package?' => Shape::STRING, 'html' => Shape::STRING, 'placeholders?' => Shape::map(Shape::STRING),
                ]],
                'categories' => [['name' => Shape::STRING, 'label' => Shape::STRING]],
                'styles' => Shape::map(['property' => Shape::STRING, 'group' => Shape::STRING]),
                'states' => [Shape::STRING],
                'breakpoints' => Shape::map(Shape::STRING),
                'sources' => [['name' => Shape::STRING, 'label' => Shape::STRING, 'description' => Shape::STRING, 'fields' => [Shapes::field()], 'item' => Shape::map(Shape::STRING)]],
                'motion' => ['triggers' => [Shape::STRING], 'properties' => Shape::map(Shape::STRING), 'eases' => [Shape::STRING], 'screens' => [Shape::STRING]],
                'logic' => ['events' => [Shape::STRING], 'mods' => [Shape::STRING], 'actions' => [Shape::STRING], 'transitions' => [Shape::STRING], 'merges' => [Shape::STRING]],
            ]),
            'handler' => fn () => [
                'blocks' => $this->translatedBlocks(),
                'categories' => $this->translatedCategories(),
                'styles' => array_map(static fn ($p) => ['property' => $p[0], 'group' => $p[1]], StyleCompiler::PROPERTIES),
                'states' => [...array_keys(StyleCompiler::STATES), 'is-<name>', 'in-<name>'],
                'breakpoints' => $this->app->make(StyleCompiler::class)->breakpoints(),
                'sources' => $this->translatedSources(),
                'motion' => ['triggers' => Motion::TRIGGERS, 'properties' => Motion::PROPERTIES, 'eases' => array_keys(Motion::EASES), 'screens' => Motion::SCREENS],
                'logic' => ['events' => Logic::EVENTS, 'mods' => Logic::MODS, 'actions' => Logic::ACTIONS, 'transitions' => Logic::TRANSITIONS, 'merges' => Logic::MERGES],
            ],
        ]);

        $a->register('blocks/icons', [
            'label' => 'Find Icons',
            'description' => 'Search the Phosphor icon set for the Icon and Button blocks. Append -bold, -fill or -light to a name for other weights.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true, 'trustedOutput' => true],
            'input' => ['type' => 'object', 'properties' => ['query' => ['type' => 'string', 'maxLength' => 60], 'limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 400, 'default' => 120]]],
            'output' => Shape::of([['name' => Shape::STRING, 'svg' => Shape::STRING]]),
            'handler' => static fn (array $in) => Icons::search((string) ($in['query'] ?? ''), (int) ($in['limit'] ?? 120)),
        ]);

        $a->register('blocks/from-markdown', [
            'label' => 'Markdown to Blocks',
            'description' => 'Convert Block Markdown (Markdown plus ::: directives for other blocks) into a block tree.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true, 'trustedOutput' => true],
            'input' => ['type' => 'object', 'properties' => ['markdown' => ['type' => 'string', 'maxLength' => 500000]], 'required' => ['markdown']],
            'output' => Shape::of([self::nodeShape()]),
            'handler' => fn (array $in) => $document()->normalize($this->app->make(MarkdownCodec::class)->decode($in['markdown'])),
        ]);

        $a->register('blocks/to-markdown', [
            'label' => 'Blocks to Markdown',
            'description' => 'Convert a block tree to Block Markdown.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true, 'trustedOutput' => true],
            'input' => ['type' => 'object', 'properties' => ['blocks' => ['type' => 'array']], 'required' => ['blocks']],
            'output' => Shape::of(['markdown' => Shape::STRING]),
            'handler' => fn (array $in) => ['markdown' => $this->app->make(MarkdownCodec::class)->encode($in['blocks'])],
        ]);

        // ── Components and templates (read helpers; edit them with the entries abilities) ──
        $a->register('components/list', [
            'label' => 'List Components and Sections',
            'description' => 'Entries of the components collection (plus plugin patterns). Synced ones are components: instances update everywhere and take property values. Others are sections copied on insert. Create and change them with entries/create and entries/update in the "components" collection.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['working' => ['type' => 'boolean', 'default' => false]]],
            'output' => Shape::of([self::patternShape()]),
            'handler' => fn (array $in) => array_values($patterns()->all((bool) ($in['working'] ?? false))),
        ]);

        $a->register('components/save', [
            'label' => 'Save as Component or Section',
            'description' => 'Create or replace an entry of the components collection by handle (slug). synced: true makes it a component. Saved as a draft of an existing one unless publish is true.',
            'permission' => fn (?\Cms\Users\User $user) => (bool) $user?->hasPermission('entries.'.Patterns::COLLECTION.'.create'),
            'input' => ['type' => 'object', 'properties' => [
                'handle' => $handle,
                'title' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 120],
                'description' => ['type' => 'string', 'maxLength' => 500],
                'category' => ['type' => 'string', 'maxLength' => 60],
                'synced' => ['type' => 'boolean', 'default' => false],
                'props' => ['type' => 'array'],
                'blocks' => ['type' => 'array'],
                'publish' => ['type' => 'boolean', 'default' => true],
            ], 'required' => ['handle', 'title', 'blocks']],
            'output' => self::patternShape()->with(['id' => Shape::STRING]),
            'handler' => function (array $in, \Cms\Abilities\AbilityContext $ctx) use ($patterns) {
                $data = array_filter(['blocks' => $in['blocks'], 'synced' => (bool) ($in['synced'] ?? false), 'category' => $in['category'] ?? null, 'description' => $in['description'] ?? null, 'props' => $in['props'] ?? null], static fn ($v) => $v !== null);
                $existing = $patterns()->all(true)[$in['handle']]['id'] ?? null;
                $content = $this->cms()->entryService();
                $entry = $existing
                    ? $content->update($existing, ['title' => $in['title'], 'data' => $data], $ctx->user, (bool) ($in['publish'] ?? true))
                    : $content->create(Patterns::COLLECTION, ['title' => $in['title'], 'slug' => $in['handle'], 'data' => $data, 'status' => ($in['publish'] ?? true) ? 'published' : 'draft'], $ctx->user);
                $patterns()->flush();

                return ['id' => $entry->id, ...($patterns()->find($in['handle'], true) ?? [])];
            },
        ]);

        $a->register('templates/list', [
            'label' => 'List Templates',
            'description' => 'Entries of the templates collection: block documents that frame pages (header, Page content, footer…). `default` frames anything without its own, `404` renders missing pages. Edit them with entries/update; publishing rebuilds the site.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['working' => ['type' => 'boolean', 'default' => false]]],
            'output' => Shape::of([['handle' => Shape::STRING, 'id' => Shape::STRING, 'title' => Shape::STRING, 'description' => Shape::STRING, 'collections' => [Shape::STRING], 'blocks' => [self::nodeShape()]]]),
            'handler' => fn (array $in) => array_values($templates()->all((bool) ($in['working'] ?? false))),
        ]);
    }

    /**
     * A node of a block tree as Document::normalize() leaves it. `$written` is a tree as someone wrote it (a block
     * type's template, a plugin's pattern file): the same, but ids are given when it is inserted.
     */
    private static function nodeShape(bool $written = false): Shape
    {
        $value = Shape::either(Shape::STRING, Shape::NUMBER);

        return Shape::nested([
            ($written ? 'id?' : 'id') => Shape::STRING, 'type' => Shape::STRING,
            'props?' => Shape::open('Prop values by prop handle; the block type\'s `fields` in blocks/types say which props it takes and what each may be.'),
            'style?' => self::described(Shape::map(Shape::map($value)), 'Declarations by variant ("base", a breakpoint or state from blocks/types such as "md" or "hover", or both: "md:hover"), each a map of style property (`styles` in blocks/types) to a CSS value or a token ("token:color.primary", from design/get).'),
            'anchor?' => Shape::STRING, 'class?' => Shape::STRING, 'label?' => Shape::STRING,
            'attrs?' => self::described(Shape::map(Shape::STRING), 'HTML attributes by name (aria-*, data-*, role, title…).'),
            'bind?' => self::described(Shape::map(Shape::STRING), 'Data paths by what they fill: a prop handle, visible, hidden, text, state:<name>, attr:<name> or style:<property>.'),
            'logic?' => self::logicShape(), 'motion?' => [self::animationShape()], 'hidden?' => Shape::BOOLEAN,
            'code?' => ['scripts?' => [Shape::STRING], 'styles?' => [Shape::STRING]],
            'behavior?' => ['module' => Shape::STRING, 'props?' => Shape::open('What the script\'s mount() is handed: settings of the script\'s own, by name.'), 'when?' => Shape::enum('visible', 'idle')],
            'persist?' => Shape::STRING,
        ], 'children?');
    }

    /** A shape with a sentence on what its keys are. */
    private static function described(Shape $shape, string $about): Shape
    {
        return Shape::raw([...$shape->toSchema(), 'description' => $about]);
    }

    /** Logic::sanitize(): a node's script. */
    private static function logicShape(): Shape
    {
        $action = Shape::of([
            'do' => Shape::enum(...Logic::ACTIONS), 'var?' => Shape::STRING, 'value?' => Shape::STRING, 'test?' => Shape::STRING,
            'then?' => [Shape::any('An action of this same shape, run when the test holds.')], 'else?' => [Shape::any('An action of this same shape, run when the test fails.')],
            'ms?' => Shape::INTEGER, 'node?' => Shape::STRING, 'motion?' => Shape::STRING, 'mode?' => Shape::STRING, 'to?' => Shape::STRING, 'offset?' => Shape::INTEGER,
            'url?' => Shape::STRING, 'newTab?' => Shape::BOOLEAN, 'event?' => Shape::STRING, 'detail?' => Shape::STRING, 'urlFrom?' => Shape::STRING,
            'target?' => [Shape::STRING], 'on?' => Shape::BOOLEAN, 'expr?' => Shape::STRING,
        ]);

        return Shape::of([
            'component?' => Shape::STRING,
            'data?' => self::described(Shape::map(Shape::any('The variable\'s starting value, any JSON.')), 'State for this element and everything inside it, by variable name.'),
            'init?' => [$action],
            'on?' => [['event' => Shape::STRING, 'mods?' => [Shape::enum(...Logic::MODS)], 'key?' => Shape::STRING, 'actions' => [$action]]],
            'show?' => Shape::STRING, 'text?' => Shape::STRING, 'transition?' => Shape::enum(...Logic::TRANSITIONS),
            'states?' => self::described(Shape::map(Shape::STRING), 'Expressions by state name: the element has the class is-<name> while its expression is true.'),
            'attrs?' => self::described(Shape::map(Shape::STRING), 'Expressions by the HTML attribute they set.'),
            'model?' => Shape::STRING, 'target?' => [Shape::STRING], 'push?' => Shape::BOOLEAN, 'merge?' => Shape::enum(...Logic::MERGES),
            'behaviors?' => [
                'scroll?' => ['threshold' => Shape::INTEGER, 'hide' => Shape::BOOLEAN], 'spy?' => ['offset' => Shape::INTEGER], 'group?' => Shape::BOOLEAN,
                'menu?' => Shape::open('Empty: the behavior is on and takes no options.'), 'carousel?' => Shape::open('Empty: the behavior is on and takes no options.'),
                'marquee?' => ['speed' => Shape::INTEGER, 'reverse' => Shape::BOOLEAN, 'pause' => Shape::BOOLEAN],
            ],
        ]);
    }

    /** Motion::sanitize(): one of a node's animations. */
    private static function animationShape(): Shape
    {
        $side = self::described(Shape::map(Shape::either(Shape::NUMBER, Shape::STRING)), 'Values by animatable property (`motion.properties` in blocks/types).');

        return Shape::of([
            'id' => Shape::STRING, 'name?' => Shape::STRING,
            'trigger' => ['type' => Shape::enum(...Motion::TRIGGERS), 'start?' => Shape::STRING, 'end?' => Shape::STRING, 'once?' => Shape::BOOLEAN, 'node?' => Shape::STRING, 'pin?' => Shape::STRING, 'scrub?' => Shape::NUMBER],
            'on?' => [Shape::enum(...Motion::SCREENS)],
            'steps' => [[
                'target' => Shape::STRING, 'mask?' => Shape::BOOLEAN, 'from?' => $side, 'to?' => $side, 'duration' => Shape::NUMBER, 'delay?' => Shape::NUMBER,
                'ease?' => Shape::STRING, 'stagger?' => Shape::NUMBER, 'at?' => Shape::NUMBER,
            ]],
            'repeat?' => Shape::INTEGER, 'yoyo?' => Shape::BOOLEAN, 'hold?' => Shape::NUMBER,
        ]);
    }

    /** Patterns::shape(): a component or a section. */
    private static function patternShape(): Shape
    {
        return Shape::of([
            'handle' => Shape::STRING, 'id' => Shape::STRING_OR_NULL, 'title' => Shape::STRING, 'description' => Shape::STRING, 'category' => Shape::STRING,
            'synced' => Shape::BOOLEAN, 'props' => [Shapes::field()], 'blocks' => [self::nodeShape(written: true)], 'source' => Shape::STRING, 'editable' => Shape::BOOLEAN,
        ]);
    }

    private function agentContext(): void
    {
        $this->cms()->context()->register('cms://blocks', 'Blocks guide', 'How to compose pages, templates and components: node model, styles, bindings, Repeat, scripts and animations, with worked examples.', fn () => [
            'rules' => [
                'Everything visitors see is blocks: entries (their blocks field), templates (entries of the templates collection — they frame pages and contain one `outlet` block) and components (entries of the components collection — header, footer, cards). There are no theme files to edit.',
                'A node: {type, props, style?, attrs?, bind?, logic?, motion?, children?, label?}. Omit ids — they are generated. Name important layers with `label`.',
                'Compose layouts from `box` (any HTML tag; flex or grid via style) and text primitives (`heading`, `paragraph` with a tag, `link`, `button`, `icon`, `image`). Use `section` for page-width bands in content.',
                'style keys are CSS properties in camelCase (gridTemplateColumns, backdropFilter…). Prefer design tokens: token:space.8, token:color.primary, token:color.primary/20 (alpha), token:text.xl, token:radius.lg — read cms://site/design. Plain CSS values work too (clamp(), %, vw, gradients); media:<id> becomes url().',
                'Variants: base (all screens), tablet, mobile (desktop-first) or sm/md/lg/xl (min-width); states hover, focus-visible, active, before, after, first, last, group-hover (inside an element with logic.behaviors.group), dark; custom states is-<name> (set by logic.states, behaviors or bind state:<name>) and in-<name> (an ancestor has is-<name>). Combine: "mobile:hover".',
                'Text props are inline HTML: <strong>, <em>, <a href>, <code>, <mark>, <br>. Style <em>/<strong> inside headings through element styles in the design system.',
                'bind connects props to data: {"text": "entry.title"}, {"url": "item.url"}, {"image": "entry.cover"}, {"visible": "entry.excerpt"}, {"state:active": "item.active"}, {"attr:aria-label": "item.label"}, {"style:backgroundImage": "item.image"}. Filters: |date:M j, Y |excerpt:120 |upper |default:Text |count |not.',
                'Scope: site.*, entry.* (title, url, date, any field, parent, prev, next, children), globals.<set>.<field>, page.uri, item/index/first/last inside a Repeat, props.* inside a component, pagination.* after a paginated Repeat.',
                'Repeat renders its children once per item of a data source (see blocks/types sources): entries {collection, sort, limit, hasTag, parent, paginate}, menu {menu}, children, headings, breadcrumbs, languages, list {path: "item.children"}. Nest Repeats for sub-menus.',
                'Components: entries of the components collection with synced: true and props (fields). Instances: {"type":"pattern","props":{"ref":"card","values":{"title":"Fast"}}}; inside the component bind to props.title. Bind instance values to data with bind {"values.title": "item.title"}.',
                'logic compiles to Alpine.js (CSP build): data (state), on (events → actions: set, toggle, add, if, wait, play, scroll, copy, go, theme, focus, dispatch, fetch, lock, run), show + transition, states, text, attrs, model, target/merge (load links and forms into blocks), behaviors (scroll: is-scrolled/is-hidden on scroll, spy: scrollspy for in-page links, group: hover group, marquee, carousel: step through the first child with the buttons after it).',
                'motion compiles to CSS (load, scroll, loop) or Web Animations (appear, hover, press, event): [{trigger: {type: appear|scroll|hover|press|load|loop|event, start, end, once, node}, on: [desktop|tablet|mobile], steps: [{target: self|children|words|lines|chars|#<node id>, mask, from, to, duration, delay, ease, stagger, at}], repeat, yoyo}]. A scroll trigger takes pin: "150vh" (the element holds at the top of the screen for that much scrolling while its steps play; true is 100vh) and scrub: 0.6 (the steps trail the scroll by about that many seconds, which needs the script). A scroll animation with trigger.progress: true (or with scrub) sets --cms-progress (0 to 1) on its element and dispatches cms:progress on it (event.detail.progress; null once less motion is asked for), so a number can count with the scroll in a few lines of a behaviour and no library. chars splits letters inside their words (the block says its text in aria-label; text with a link in it, or in a script that joins its letters, animates by word instead); lines are real lines with appear, hover, press and event, and masked words with load, scroll and loop. ease is a name (expo.out, back.out), cubic-bezier(), linear(), steps() or a curve of the design: token:ease.<name>. start and end read "<top|center|bottom> <top|center|bottom|N%>". load caps its delay at 0.2s and its stagger at 0.3s so it cannot hold back the page. repeat -1 needs a motion-toggle block on the page. Properties: opacity, x, y, xPercent, yPercent, scale, rotate, rotateX/Y, skewX/Y, perspective, blur, clipPath, colors, borderRadius. Use event triggers with a logic play action for menus and modals.',
                'code brings files beside the design to the page a block is on: {"code": {"scripts": ["hero"], "styles": ["hero"]}} loads content/design/scripts/hero.js (an ES module) and content/design/styles/hero.css. Read cms://site/code for the files and for what loads on every page, with a template or with a component.',
                'behavior attaches a script of the design to one element, for what motion and logic can’t say (GSAP, WebGL, smooth scroll): {"behavior": {"module": "tilt", "props": {"max": 8}, "when": "visible"}} runs `export function mount(el, props, {token, reducedMotion, signal})` of content/design/scripts/tilt.js when the element is in the document, and the function it returns (and `export function unmount(el)`) when it leaves, page transitions included. token("color.primary") reads a design token where the element is; signal aborts on unmount. when: load (default), visible (fetched a screen before it is seen), idle, or loaded (after the page’s load event and its fonts, for a script that measures text or layout). Text in props may name data: "{props.speed}", "{entry.title}". Anyone who edits the page writes props, so a script treats them as untrusted input: never as HTML (innerHTML), code, or an address to load without checking it. reducedMotion is true when the visitor’s system asks for less motion or they paused motion with the page’s Motion Toggle block; the behaviour is mounted again when that changes. Outside a behaviour, the toggle sets <html data-cms-motion="paused"> and dispatches cms:motion on document with detail.paused. A block can carry several: "behavior": [{"module": "tilt"}, {"module": "cue", "props": {…}}], each mounted by itself; their scripts load side by side, so none may count on another having mounted first. Scripts never run in the editor.',
                'persist keeps one element alive across pages when the design’s transition has navigation: "client": {"type": "box", "persist": "stage", "behavior": {"module": "scene"}} in the template is the same element, still mounted, on every page that has a block with that persist name (a WebGL canvas, a music player). Scripts hear `cms:before-leave` (cancelable; event.detail.waitUntil(promise) holds the swap for an animation out) and `cms:after-enter` on document, and can call window.cmsNavigate.go(url) and .prefetch(url). A link inside an element with the attribute data-cms-reload always loads the page, as does any link with a query string. With client navigation a module script runs once per visit, not once per page, and so does an inline script whose text a page before it already ran: do a page’s own work in a behaviour’s mount, or on cms:after-enter.',
                'Templates and components are entries of the "templates" and "components" collections (body field: blocks). entries/update saves a draft; entries/publish (or publish: true) makes it live and rebuilds the pages that use it.',
                'Prefer existing components and sections (components/list) to keep sites consistent. You can send entry data for a blocks field as Block Markdown (a string).',
            ],
            'blocks' => $this->app->make(BlockRegistry::class)->catalog(),
            'examples' => [
                'navigation from a menu' => ['type' => 'box', 'label' => 'Nav', 'props' => ['tag' => 'nav'], 'attrs' => ['aria-label' => 'Main'], 'style' => ['base' => ['display' => 'flex', 'gap' => 'token:space.6']], 'children' => [
                    ['type' => 'repeat', 'props' => ['source' => 'menu', 'menu' => 'main', 'tag' => 'ul'], 'style' => ['base' => ['display' => 'flex', 'gap' => 'token:space.6', 'listStyle' => 'none', 'margin' => '0', 'padding' => '0']], 'children' => [
                        ['type' => 'box', 'props' => ['tag' => 'li'], 'children' => [
                            ['type' => 'link', 'bind' => ['label' => 'item.label', 'url' => 'item.url', 'state:active' => 'item.active'], 'style' => ['base' => ['color' => 'token:color.muted', 'textDecoration' => 'none'], 'hover' => ['color' => 'token:color.foreground'], 'is-active' => ['color' => 'token:color.foreground']]],
                        ]],
                    ]],
                ]],
                'blog list' => ['type' => 'repeat', 'props' => ['source' => 'entries', 'collection' => 'posts', 'sort' => '-published_at', 'limit' => 6], 'style' => ['base' => ['display' => 'grid', 'gridTemplateColumns' => 'repeat(3,1fr)', 'gap' => 'token:space.8'], 'mobile' => ['gridTemplateColumns' => '1fr']], 'children' => [
                    ['type' => 'box', 'props' => ['tag' => 'article'], 'bind' => ['link' => 'item.url'], 'children' => [
                        ['type' => 'image', 'bind' => ['image' => 'item.cover', 'visible' => 'item.cover'], 'props' => ['aspect' => '3/2']],
                        ['type' => 'paragraph', 'props' => ['tag' => 'time'], 'bind' => ['text' => 'item.date|date:M j, Y']],
                        ['type' => 'heading', 'props' => ['level' => '3'], 'bind' => ['text' => 'item.title']],
                    ]],
                ]],
                'mobile menu toggle' => ['type' => 'box', 'logic' => ['data' => ['open' => false], 'states' => ['open' => 'open'], 'on' => [['event' => 'keydown', 'key' => 'escape', 'mods' => ['window'], 'actions' => [['do' => 'set', 'var' => 'open', 'value' => 'false']]]]], 'children' => [
                    ['type' => 'box', 'props' => ['tag' => 'button'], 'attrs' => ['aria-label' => 'Menu'], 'logic' => ['attrs' => ['aria-expanded' => 'open'], 'on' => [['event' => 'click', 'actions' => [['do' => 'toggle', 'var' => 'open']]]]], 'children' => [['type' => 'icon', 'props' => ['icon' => 'list']]]],
                    ['type' => 'box', 'logic' => ['show' => 'open', 'transition' => 'fade'], 'children' => []],
                ]],
                'animated hero heading' => ['type' => 'heading', 'props' => ['text' => 'Design that moves', 'level' => '1'], 'motion' => [['trigger' => ['type' => 'load'], 'steps' => [['target' => 'words', 'from' => ['opacity' => 0, 'y' => 40], 'duration' => 0.9, 'ease' => 'power3.out', 'stagger' => 0.06]]]]],
                'parallax image' => ['type' => 'image', 'motion' => [['trigger' => ['type' => 'scroll', 'start' => 'top bottom', 'end' => 'bottom top'], 'steps' => [['from' => ['yPercent' => -10], 'to' => ['yPercent' => 10], 'ease' => 'none']]]]],
                'template' => ['title' => 'Post', 'collections' => ['posts'], 'blocks' => [['type' => 'pattern', 'props' => ['ref' => 'header']], ['type' => 'box', 'props' => ['tag' => 'main'], 'children' => [['type' => 'heading', 'props' => ['level' => '1'], 'bind' => ['text' => 'entry.title']], ['type' => 'outlet']]], ['type' => 'pattern', 'props' => ['ref' => 'footer']]]],
            ],
            'markdown' => "## Why Cms\n\nFast pages by default.\n\n::: buttons\n:::: button {\"props\":{\"label\":\"Start\",\"url\":\"/start\"}}\n::::\n:::",
        ]);
    }
}

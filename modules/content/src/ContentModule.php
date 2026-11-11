<?php

declare(strict_types=1);

namespace Cms\Modules\Content;

use Cms\Admin\Views;
use Cms\Admin\Translations;
use Cms\Cms;
use Cms\Packages\Plugin;
use Cms\Users\User;

/**
 * Entries in every collection. Collections themselves are the kernel's (files
 * in content/collections); this module lists, edits, publishes and searches
 * their entries, and puts one sidebar item per collection.
 */
final class ContentModule extends Plugin
{
    /** Entries per page of a list. */
    public const int PER_PAGE = 50;

    /** Milliseconds after the last change before the editor saves; ⌘S saves at once. */
    public const int AUTOSAVE = 1200;

    public function boot(): void
    {
        $cms = $this->cms();
        $permissions = $cms->permissions();

        // Once every package is booted: plugins add collections of their own (templates, components).
        $this->app->booted(function () use ($cms, $permissions) {
            foreach ($cms->collections()->all() as $collection) {
                // Grouped by collection, so the labels stay plain words the admin can translate.
                foreach ([
                    ['action' => 'view', 'label' => 'View'],
                    ['action' => 'create', 'label' => 'Create'],
                    ['action' => 'edit', 'label' => 'Edit'],
                    ['action' => 'publish', 'label' => 'Publish'],
                    ['action' => 'delete', 'label' => 'Delete'],
                ] as ['action' => $action, 'label' => $label]) {
                    $permissions->register("entries.{$collection->handle}.{$action}", $label, $collection->title);
                }
            }
        });

        $this->app->make(ContentAbilities::class)->register($cms->abilities());
        $this->skills($cms);

        // One sidebar item per collection, in the collection's own section (templates and components in Design).
        // Built-in pages (sign in, checkout) are pages: they belong to the pages' item and are listed with them.
        $cms->hooks()->addFilter('admin.nav', function (array $items) use ($cms) {
            foreach ($cms->collections()->all() as $collection) {
                $within = $this->within($collection->handle);
                $items["collection.{$collection->handle}"] ??= [
                    'home' => $within === null ? null : "collection.{$within}",
                    'id' => "collection.{$collection->handle}",
                    'label' => $collection->title,
                    'path' => "/content/{$collection->handle}",
                    'icon' => $collection->icon,
                    'section' => $collection->section,
                    'order' => (int) $collection->get('nav_order', 10),
                    'permission' => "entries.{$collection->handle}.view",
                ];
            }

            return $items;
        });

        $cms->hooks()->addFilter('admin.manifest', fn (array $manifest, User $user) => [
            ...$manifest,
            'collections' => $this->collectionsFor($user),
            'config' => [...($manifest['config'] ?? []), 'content' => ['perPage' => self::PER_PAGE, 'autosave' => self::AUTOSAVE]],
        ]);

        $cms->context()->register('cms://collections', 'Collections', 'Every collection with its fields and JSON schema — use these field handles in entry data.', fn () => array_map(
            static fn ($c) => [...$c->toArray(), 'schema' => $c->blueprint()->schema()],
            array_values($cms->collections()->all())
        ));

        $cms->admin()->widget('recent', ['label' => 'Recently Edited', 'description' => 'Entries you and your team changed last.', 'icon' => 'clock', 'column' => 'main', 'enabled' => true, 'order' => 10]);
        $cms->views()->register('content', '/content/:collection', fn (User $user, array $params) => $this->view((string) ($params['collection'] ?? ''), $user));
        $this->adminModule();
    }

    /**
     * One collection's place: its name and size, its New button, and its entries. The site's pages
     * have a tab beside them for each feature that brings pages of its own (sign in, checkout),
     * named after it, with the same list.
     */
    private function view(string $handle, User $user): array
    {
        $collection = $this->cms()->collections()->all()[$handle] ?? null;

        if ($collection === null || ! $user->hasPermission("entries.{$handle}.view")) {
            return Views::notFound('collection');
        }

        $view = new EntriesView($this->cms(), self::PER_PAGE);
        // The count follows what the list shows: its language, status and search.
        $count = ['source' => ['ability' => 'entries/list', 'input' => ['collection' => $handle, 'locale' => '{query.locale}', 'status' => '{query.status}', 'search' => '{query.search}', 'perPage' => 1, 'fields' => []]], 'at' => 'total'];
        $new = [['label' => self::newLabel($collection->singular), 'icon' => 'plus', 'variant' => 'primary', 'to' => "/content/{$handle}/new?locale={query.locale}", 'key' => 'c', 'can' => "entries.{$handle}.create"]];
        $records = ['type' => 'ui/records', 'props' => $view->records($collection, $user)];
        $page = ['title' => __($collection->title), 'icon' => $collection->icon];
        $features = $handle === 'pages' ? $this->builtinGroups($user) : [];

        if ($features === []) {
            return ['type' => 'ui/page', 'props' => [...$page, 'count' => $count, 'actions' => $new], 'children' => [$records]];
        }

        return ['type' => 'ui/page', 'props' => $page, 'children' => [['type' => 'ui/tabs', 'children' => [
            ['type' => 'ui/tab', 'props' => ['id' => 'site', 'label' => __('Site'), 'count' => $count, 'actions' => $new], 'children' => [$records]],
            ...array_map(static fn (array $group) => ['type' => 'ui/tab', 'props' => [
                'id' => $group['id'], 'label' => __($group['label']),
                'count' => ['source' => ['ability' => 'pages/builtin', 'input' => ['group' => $group['id']]], 'at' => '0.total'],
            ], 'children' => [['type' => 'ui/records', 'props' => $view->builtin($group)]]], $features),
        ]]]];
    }

    /** The features with pages of their own this person may see, named as the plugin is. */
    private function builtinGroups(User $user): array
    {
        return array_values(array_map(
            static fn (array $group) => ['id' => $group['id'], 'label' => \Cms\Packages\PackageRepository::labelOf($group['package']) ?? $group['label']],
            array_filter($this->cms()->builtinPages()->all(), static fn (array $group) => $user->hasPermission("entries.{$group['collection']}.view") && ($group['pages'])() !== []),
        ));
    }

    /** The collection whose list shows this one's entries: the site's pages, for built-in pages. */
    private function within(string $handle): ?string
    {
        $cms = $this->cms();

        return $handle !== 'pages' && $cms->builtinPages()->holds($handle) && isset($cms->collections()->all()['pages']) ? 'pages' : null;
    }

    /** The tab of Pages that lists a collection of built-in pages. */
    private function tabOf(string $handle): ?string
    {
        foreach ($this->within($handle) === null ? [] : $this->cms()->builtinPages()->all() as $group) {
            if ($group['collection'] === $handle) {
                return $group['id'];
            }
        }

        return null;
    }

    /** @return list<array> The collections this user may view, with what they may do in each. */
    private function collectionsFor(User $user): array
    {
        $out = [];

        foreach ($this->cms()->collections()->all() as $c) {
            if (! $user->hasPermission("entries.{$c->handle}.view")) {
                continue;
            }

            // Names read like the sidebar's: in the user's language when the dictionaries know them.
            $out[] = [
                'handle' => $c->handle, 'title' => __($c->title), 'singular' => __($c->singular), 'newLabel' => self::newLabel($c->singular), 'icon' => $c->icon,
                'structure' => $c->structure, 'routable' => $c->routable(), 'driver' => $c->driver, 'defaultView' => $c->defaultView, 'within' => $this->within($c->handle), 'tab' => $this->tabOf($c->handle),
                'can' => array_combine(['create', 'edit', 'publish', 'delete'], array_map(static fn ($a) => $user->hasPermission("entries.{$c->handle}.{$a}"), ['create', 'edit', 'publish', 'delete'])),
            ];
        }

        return $out;
    }

    /**
     * "New Page" for a collection's create button. Languages agree "new" with the noun
     * (Nieuwe pagina, Nieuw bericht, Nouvel article), so the CMS's own collections have a
     * phrase of their own; any other reads "Pagina toevoegen" / "Ajouter : page".
     */
    private static function newLabel(string $singular): string
    {
        $phrases = ['page' => __('New Page'), 'post' => __('New Post'), 'component' => __('New Component'), 'template' => __('New Template'), 'form' => __('New Form')];

        $item = __($singular);

        return $phrases[strtolower($singular)] ?? __('New :item', ['item' => app(Translations::class)->current() === Translations::SOURCE ? $item : mb_strtolower($item)]);
    }

    /** How agents work with content: `/proofread` in the assistant's chat, a prompt for MCP clients. */
    private function skills(Cms $cms): void
    {
        $skills = $cms->skills();

        $skills->register('proofread', [
            'label' => 'Proofread',
            'description' => 'Fix mistakes and tighten the copy of a page.',
            'icon' => 'text',
            'prompt' => 'Proofread the page in question: fix mistakes, tighten the copy and improve its SEO description. Keep what it says and how it sounds. Say what you changed.',
        ]);
        $skills->register('build-page', [
            'label' => 'Build a Page',
            'description' => 'Design a complete page from a brief, with the design tokens, blocks and patterns.',
            'icon' => 'blocks',
            'arguments' => [
                ['name' => 'brief', 'description' => 'What the page is for and what it should say', 'required' => true],
                ['name' => 'collection', 'description' => 'Collection to create it in (default: pages)'],
            ],
            'prompt' => <<<'TXT'
            Build a page for this brief: {brief}

            1. Read cms://site/design, cms://blocks and cms://collections. Check patterns/list for components and sections, templates/list for page templates.
            2. Plan the sections (hero, proof, features, FAQ, call to action…) before writing. Lead with the answer; keep paragraphs short.
            3. Create the entry with entries.create in collection "{collection}" (pages if empty), body as blocks: top-level `section` blocks, styles only with tokens.
            4. Give every image alt text; write an SEO description (seo.description) of 70–160 characters.
            5. Run seo.analyze on the new entry and fix warnings, then publish with entries.publish and report the URL.
            TXT,
        ]);
        $skills->register('write-post', [
            'label' => 'Write a Blog Post',
            'description' => 'Draft a well-structured, citable article for review.',
            'icon' => 'file-text',
            'arguments' => [
                ['name' => 'topic', 'description' => 'Topic or working title', 'required' => true],
                ['name' => 'audience', 'description' => 'Who it is for'],
            ],
            'prompt' => <<<'TXT'
            Write a blog post about: {topic}
            Audience: {audience}

            Open with a 2–3 sentence answer to the main question. Use question-style H2 headings, short paragraphs, one comparison table if useful, and an FAQ accordion with 3–5 questions at the end.
            Find the posts collection with collections.list, then create a draft with entries.create (do not publish). Fill excerpt and SEO fields. Reply with a summary and the draft's id.
            TXT,
        ]);
        $skills->register('audit-site', [
            'label' => 'Audit the Site',
            'description' => 'Check every published page for SEO, GEO and accessibility problems and propose fixes.',
            'icon' => 'shield',
            'prompt' => <<<'TXT'
            Audit this site. For each collection in collections.list, list published entries (entries.list with status "live") and run seo.analyze on each.
            Summarize the biggest problems first (missing alt text, thin pages, missing descriptions, no question headings), then propose concrete fixes. Do not change anything until I confirm.
            TXT,
        ]);
    }
}

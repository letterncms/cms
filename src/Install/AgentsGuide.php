<?php

declare(strict_types=1);

namespace Cms\Install;

use Cms\Cms;
use Cms\Foundation\Application;
use Cms\Packages\PackageManager;
use Cms\Packages\PackageManifest;
use Illuminate\Support\Facades\Route;

/**
 * The `AGENTS.md` a new site starts with: what the site is and how an AI agent works in it, written from
 * the install as it runs, so the commands, the folders and the lists of modules and plugins are true of
 * this site. Written once, when the site is installed. From then on it is the owner's file: nothing
 * overwrites it, and a site that already has one keeps it.
 *
 * It is in English whatever the admin speaks: agents read it, like the descriptions of abilities.
 */
final class AgentsGuide
{
    public const string FILE = 'AGENTS.md';

    public function __construct(private readonly Application $app, private readonly Cms $cms) {}

    /** Writes the guide unless the site has one. Says whether it wrote. */
    public function write(): bool
    {
        $file = $this->app->sitePath(self::FILE);

        if (file_exists($file) || is_link($file)) {
            return false;
        }

        return file_put_contents($file, $this->render()) !== false;
    }

    public function render(): string
    {
        $brand = cms_brand();
        $abilities = $this->cms->abilities();
        $has = static fn (string ...$names): bool => array_all($names, static fn (string $name) => $abilities->has($name));
        // By ability, not by console command: commands are only registered on the command line, and the
        // setup in the browser writes this file too. The module that builds the site brings both.
        $builds = $has('site/build');
        $url = rtrim((string) $this->cms->site('url', ''), '/');
        $name = trim((string) $this->cms->site('name', '')) ?: 'This site';

        $lines = [
            "# {$name}",
            '',
            "A website made with {$brand} ".Cms::VERSION.': a Composer project that keeps its content and design in this folder'
                .($builds ? ' and builds its pages as static files into `public/`.' : '.'),
            'This file was written when the site was installed. It is yours: edit it, nothing overwrites it.',
            '',
            '## Where things are',
            '',
            '| Path | Holds |',
            '|---|---|',
        ];

        foreach ($this->places($has('styling/get'), $has('blocks/types')) as $path => $holds) {
            $lines[] = "| `{$path}` | {$holds} |";
        }

        $collections = $this->cms->collections()->all();

        if ($collections !== []) {
            $lines[] = '';
            $lines[] = 'Collections: '.implode(', ', array_map(
                static fn ($c) => "`{$c->handle}` ({$c->title}, ".($c->driver === 'files' ? "files in `content/collections/{$c->handle}/`" : 'in the database').')',
                array_values($collections),
            )).'.';
        }

        array_push(
            $lines,
            '',
            '## Work through abilities',
            '',
            "Everything the admin does is an ability: a named action with a JSON Schema for its input and its answer. Use them instead of editing the database or guessing at files; they validate, check permissions, keep revisions and write the audit log.",
            '',
            '```bash',
            'php cms run abilities/list --json              # every ability, with its input and output schema',
        );

        if ($has('collections/schema')) {
            $handle = isset($collections['pages']) ? 'pages' : (array_key_first($collections) ?? 'pages');
            $lines[] = "php cms run collections/schema handle={$handle}   # what an entry of a collection must look like";
            $lines[] = 'php cms schemas --check                         # the same as files: content/schemas/ is current, or says what is not';
        }

        if ($has('entries/create')) {
            $lines[] = "php cms run entries/create --dry-run --input='{…}'  # check first: validates and authorizes, writes nothing";
        }

        array_push(
            $lines,
            '```',
            '',
            '`php cms run <ability> key=value …` runs one (values may be JSON, or pass everything as `--input=\'{…}\'`) and prints one JSON document: `{"data": …}`, or `{"error": {"type", "message", "details"}}` with a non-zero exit. Add `--dry-run` to any call that changes something and read what it would change before you run it for real. `--as=someone@example.com` runs with that person\'s permissions.',
        );

        if ($builds) {
            array_push(
                $lines,
                '',
                '## Build and check',
                '',
                '```bash',
                'php cms build --strict --json   # build every page; fails on a warning too, such as a missing image',
                'php cms links:check             # fails on links, images and anchors that lead nowhere',
                '```',
            );

            $lines[] = '';
            $lines[] = 'Publishing an entry rebuilds its pages. Run both commands after you change files in `content/` by hand, and before you say the work is done. The build also writes `public/llms.txt`, a map of the public pages for language models.';
        }

        if ($this->hasRoute('mcp')) {
            array_push(
                $lines,
                '',
                '## MCP',
                '',
                'The same abilities are tools over MCP at `'.($url !== '' ? $url : 'https://<this site>').'/mcp` (streamable HTTP, signed in through OAuth as a user of the site, with that user\'s permissions). `entries/create` is the tool `entries.create`. Resources such as `cms://collections`'.($has('blocks/types') ? ', `cms://blocks`' : '').($has('styling/get') ? ' and `cms://site/styling`' : '').' describe the site before you change it.',
            );
        }

        if ($has('styling/get')) {
            array_push($lines, ...$this->styling($builds));
        }

        array_push($lines, '', '## Rules', '');
        $lines[] = '- Change content, settings, users and design through abilities. Never write to the database, and never edit `public/`, `vendor/`, `storage/` or a plugin Composer or the store installed.';
        $lines[] = '- Read before you write: the collection\'s schema (`content/schemas/collections/<handle>.json`, or `collections/schema`)'.($has('blocks/types') ? ', `blocks/types` for the blocks' : '').($has('styling/get') ? ', `styling/get` for the stylesheet' : '').'. Reuse what the site has before adding something new.';

        if ($has('blocks/types')) {
            $lines[] = '- Entries kept as files are Markdown with YAML front matter; a field of blocks is written as Block Markdown ('.cms_brand('docs_url').'/reference/block-markdown), not as HTML. After editing a file, build.';
        }

        if ($has('styling/get')) {
            $lines[] = '- Style with Tailwind classes built from the theme (see Styling above), not with arbitrary values such as `bg-[#123456]` in a block.'
                .($has('styling-code/save') ? ' JavaScript and plain CSS of the site\'s own live in `content/styling/scripts` and `content/styling/styles`: read and write them with `styling-code/list`, `styling-code/get` and `styling-code/save`.' : '');
        }

        if ($has('sites/apply')) {
            $sitePackage = Installer::site();
            $lines[] = '- '.($sitePackage !== null ? "This site started from the site `{$sitePackage}`: a copy, which it owns, with no link back. " : '').'A site is a whole site to start from (content, design, code). `php cms site:list` lists the ones here, `php cms site:apply <handle> --mode=design --dry-run` says every file and entry it would create, replace or skip, and nothing that exists is overwritten unless `--clash=skip|replace|rename` says so. `php cms site:export <folder>` makes this site into one; as abilities: `sites/list`, `sites/get`, `sites/apply`, `sites/export`.';
        }

        $lines[] = '- `.env` and `storage/` hold secrets. Don\'t print, copy or commit them.';
        $lines[] = '- Docs: '.cms_brand('docs_url').' (agents: '.cms_brand('docs_url').'/agents/abilities).';

        $active = $this->app->make(PackageManager::class)->active();
        $labels = static fn (array $packages): string => implode(', ', array_map(static fn (PackageManifest $p) => "{$p->label} (`{$p->name}`)", array_values($packages)));
        $modules = array_filter($active, static fn (PackageManifest $p) => $p->core);
        $plugins = array_filter($active, static fn (PackageManifest $p) => ! $p->core);

        array_push(
            $lines,
            '',
            '## What is on',
            '',
            'When this file was written; `php cms plugins` says what is on now.',
            '',
            '- Modules: '.($modules === [] ? 'none' : $labels($modules)).'.',
            '- Plugins: '.($plugins === [] ? 'none' : $labels($plugins)).'.',
        );

        return implode("\n", $lines)."\n";
    }

    /**
     * How the site is styled, for whoever edits its files: Tailwind CSS in one stylesheet and on the blocks.
     *
     * @return list<string>
     */
    private function styling(bool $builds): array
    {
        return [
            '',
            '## Styling',
            '',
            'The site is styled with Tailwind CSS v4. There is one stylesheet, `content/styling/theme.css`, and every block carries Tailwind classes in its `class`.',
            '',
            '```css',
            '@import "tailwindcss";',
            '@import "cms";                        /* what blocks, buttons and form fields are built from */',
            '',
            '@theme {                              /* every variable is a set of classes */',
            '  --color-primary: light-dark(#1d4ed8, #93c5fd);   /* bg-primary, text-primary, border-primary/40 */',
            '  --font-display: "Fraunces", "Fraunces Fallback", serif;   /* font-display */',
            '  --container-content: 72rem;         /* max-w-content */',
            '}',
            '',
            '@layer base {                         /* elements, before a block says otherwise */',
            '  :root { color-scheme: light dark; } /* turns the dark side of light-dark() on */',
            '  h1 { @apply font-display text-5xl font-semibold tracking-tight text-balance; }',
            '}',
            '',
            '@utility card {                       /* a class of the site\'s own: takes hover:, md: and the rest */',
            '  @apply rounded-xl border border-border bg-raised p-6;',
            '}',
            '```',
            '',
            '- **Theme.** Colours, fonts and sizes are `@theme` variables in Tailwind\'s namespaces: `--color-*`, `--font-*`, `--text-*`, `--spacing-*`, `--radius-*`, `--shadow-*`, `--container-*`, `--breakpoint-*`, `--ease-*`. A dark value is the second argument of `light-dark()`: a theme with one follows the visitor\'s light or dark mode. To change how the whole site looks, change these, not the blocks.',
            '- **Classes on blocks.** A block\'s `class` is a string of Tailwind classes: `"grid gap-6 md:grid-cols-3"`, `"bg-primary text-primary-foreground hover:opacity-90"`. Use the theme\'s names. When several blocks share a look, give it a name with `@utility` and use that. A button\'s looks are the `btn-<name>` classes (`btn-primary`).',
            '- **States.** A state is an attribute on the element (`data-open`, `data-scrolled`, `data-hidden`, `data-current`), styled with Tailwind\'s data variants: `data-open:rotate-45` on the element itself, `in-data-open:hidden` on something inside it, `group-data-open:opacity-100` under an element with the class `group`. `current:` styles the link to the page being shown, `dark:` the dark side, `group-hover:` what is under a hovered `group`.',
            '- **Fonts.** `settings.json` lists the font faces (`.woff2` files in `content/styling/fonts/`); `styling/fonts-import family="Inter"` downloads a Google Fonts family and adds its faces. Name the family in the theme: `--font-sans: "Inter", "Inter Fallback", sans-serif`.',
            '- **Compiled CSS.** Pages link one stylesheet, which Tailwind makes from `theme.css` for exactly the classes the content uses (`storage/styling/compiled.css`, a build file: never edit or commit it). The server makes it again by itself whenever the stylesheet or the content changes through an ability'.($builds ? ', and `php cms build` does after you edited files by hand' : '').'.',
            '- **Changing it.** Edit `theme.css` as a file, or send the whole stylesheet with `php cms run styling/update --input=\'{"css": "…"}\'`, which refuses a stylesheet Tailwind cannot compile and says why.',
        ];
    }

    /** @return array<string, string> The folders of this site that exist or will, and what each holds. */
    private function places(bool $styling, bool $blocks): array
    {
        $places = [
            'content/collections/' => 'Each collection\'s definition (`<handle>.yaml`: fields, route, driver) and, for collections kept in files, its entries (`<handle>/*.md`)',
            'content/styling/' => 'The styling: `theme.css` (the Tailwind stylesheet), `settings.json` (fonts, page transition), `fonts/`, and the site\'s own `scripts/` and `styles/`',
            'content/globals/' => 'Site-wide values such as the footer\'s, one file per set',
            'content/navigation/' => 'Menus',
            'content/schemas/' => 'The content model as JSON Schema, one file per collection, blueprint and global'.($blocks ? ', and `blocks.json` for what a blocks field holds' : '').'. The site writes them whenever a definition changes: read them, never edit them',
            'content/media/' => 'Media records, one YAML file per item (the files are in `public/media/`); `php cms migrate` reads them in',
            'config/' => 'Settings, one YAML file per group: `site.yaml` (name, URL, languages), `plugins.yaml` (what is on)',
            'plugins/' => 'Installed plugins. Composer or the store puts them here',
            'sites/' => 'Sites this site can apply (`php cms site:list`); Composer or the store puts them here',
            'public/' => 'The built site and uploaded media. Rebuilt, never edited',
            'storage/' => 'Runtime files of this machine; its secrets are in `.env` beside it',
            'vendor/' => cms_brand().' and its libraries',
        ];

        if (! $styling) {
            unset($places['content/styling/']);
        }

        // A folder a site doesn't have yet is still where that thing goes; the ones named here always matter.
        $always = ['content/collections/', 'content/schemas/', 'content/styling/', 'config/', 'plugins/', 'public/', 'storage/', 'vendor/'];

        return array_filter($places, fn (string $holds, string $path) => in_array($path, $always, true) || file_exists($this->app->sitePath(rtrim($path, '/'))), ARRAY_FILTER_USE_BOTH);
    }

    private function hasRoute(string $uri): bool
    {
        foreach (Route::getRoutes() as $route) {
            if ($route->uri() === $uri && in_array('POST', $route->methods(), true)) {
                return true;
            }
        }

        return false;
    }
}

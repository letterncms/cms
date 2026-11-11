<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Rendering;

use Cms\Admin\Translations;
use Illuminate\Contracts\Support\Htmlable;
use Cms\Modules\Account\Site\Screens;
use Cms\Modules\Blocks\BlockRenderer;
use Cms\Modules\Languages\Languages;
use Cms\Modules\Blocks\BlocksDocument;
use Cms\Modules\Blocks\Scope;
use Cms\Modules\Blocks\Templates;
use Cms\Content\Entries\Entry;
use Cms\Extend\Hooks;
use Cms\Cms;
use Cms\Modules\Site\Design\Code;
use Cms\Modules\Site\Design\Design;

/**
 * Builds pages. There are no theme files: the HTML document is assembled here,
 * its body is the entry's template (a block document from content/templates)
 * with the entry's own blocks in the template's Page content block.
 *
 *   <html lang dir> head (design CSS, block CSS, plugin head tags) <body> template… </body>
 */
final class Renderer
{
    public function __construct(
        private readonly Cms $cms,
        private readonly Design $design,
        private readonly Templates $templates,
        private readonly BlockRenderer $blocks,
        private readonly Hooks $hooks,
        private readonly HtmlMinifier $minifier,
        private readonly Code $code,
    ) {}

    /**
     * Render an entry with its template.
     *
     * @return array{html: string, status: int, context: PageContext}
     */
    public function entry(Entry $entry, int $page = 1, bool $preview = false, bool $editor = false, ?array $template = null, ?string $bodyDocument = null, ?string $templateDocument = null): array
    {
        $context = new PageContext($entry, $page, $preview, $editor, $entry->uri ?? '/');
        $template ??= $this->templates->resolve([(string) ($entry->data['template'] ?? ''), $entry->collection()->template], $preview) ?? self::fallback();

        $context->addCode($this->code->for('templates', (string) ($template['handle'] ?? '')));

        $html = $this->document($context, $template['blocks'], fn () => $this->body($entry), $entry->title, $bodyDocument, $templateDocument);

        return ['html' => $html, 'status' => 200, 'context' => $context];
    }

    /** @return array{html: string, status: int, context: PageContext} */
    public function notFound(string $uri = '/404', bool $preview = false, ?array $template = null): array
    {
        $locale = $this->hooks->filter('site.locale', null, $uri);
        $context = new PageContext(null, 1, $preview, false, $uri, is_string($locale) ? $locale : null);
        $template ??= $this->templates->find('404', $preview) ?? self::fallback404();
        $context->addCode($this->code->for('templates', (string) ($template['handle'] ?? '')));
        $html = $this->document($context, $template['blocks'], static fn () => '', 'Page not found');

        return ['html' => $html, 'status' => 404, 'context' => $context];
    }

    /**
     * A page for a request that can't go on: the site's `error` or default template around a plain
     * message, with a way back. Never indexed, and it says nothing about the request.
     *
     * @return array{html: string, status: int, context: PageContext}
     */
    public function message(int $status, string $title, string $text, string $uri, string $back = '/', ?string $backLabel = null): array
    {
        $locale = $this->hooks->filter('site.locale', null, $uri);
        $context = new PageContext(null, 1, false, false, $uri, is_string($locale) ? $locale : null);
        $template = $this->templates->resolve(['error', 'default'], false) ?? self::fallback();
        $context->addCode($this->code->for('templates', (string) ($template['handle'] ?? '')));
        $nodes = [['id' => 'msg', 'type' => 'section', 'props' => ['width' => 'prose'], 'children' => [
            ['id' => 'msgt', 'type' => 'heading', 'props' => ['text' => $title, 'level' => '1']],
            ['id' => 'msgp', 'type' => 'paragraph', 'props' => ['text' => $text]],
            ['id' => 'msgb', 'type' => 'link', 'props' => ['label' => $backLabel ?? __('Go back'), 'url' => $back], 'style' => ['base' => ['display' => 'inline-block', 'marginTop' => '1rem', 'textDecoration' => 'underline']]],
        ]]];
        $html = $this->document($context, $template['blocks'], fn () => $this->blocks->render($nodes), $title);

        return ['html' => $html, 'status' => $status, 'context' => $context];
    }

    /**
     * Render any block document as a page (the builder's canvas for templates
     * and components). $entry provides sample data for templates.
     */
    public function blocks(array $nodes, ?Entry $entry = null, string $title = '', bool $editor = true, ?string $editorDocument = null): string
    {
        $context = new PageContext($entry, 1, true, $editor, $entry?->uri ?? '/');

        return $this->document($context, $nodes, fn () => $entry ? $this->body($entry) : '', $title ?: ($entry?->title ?? ''), templateDocument: $editorDocument);
    }

    /** The design system's specimen of fields or buttons, as a page of this site: its stylesheets, fonts and scripts. */
    public function specimen(\Closure $html, string $title): string
    {
        $context = new PageContext(null, 1, true, false, '/__specimen');

        // Its words are the admin's, like the canvas's: the Design System is part of the admin.
        return $this->document($context, [['id' => 'specimen', 'type' => 'outlet', 'props' => []]], function () use ($html) {
            $this->blocks->uses('fields');
            $translations = $this->cms->app()->make(Translations::class);
            $translations->apply($this->adminLanguage($translations));

            return $html();
        }, $title);
    }

    /** An entry's blocks as plain text-bearing blocks (components, Repeats and bindings resolved). */
    public function materialize(Entry $entry, array $nodes): array
    {
        $context = new PageContext($entry, 1, false, false, $entry->uri ?? '/');

        return $context->run(fn (PageContext $ctx) => $this->blocks->materialize($nodes, $this->scope($ctx)));
    }

    /** The data documents are rendered with. */
    public function scope(PageContext $context): Scope
    {
        $entry = $context->entry ? new AugmentedEntry($context->entry) : null;

        return new Scope((array) $this->hooks->filter('site.scope', [
            'site' => $this->site(),
            'entry' => $entry,
            'globals' => new LazyGlobals(fn () => $this->globals()),
            'page' => ['uri' => $context->uri, 'number' => $context->page, 'preview' => $context->preview],
        ], $context));
    }

    public function site(): array
    {
        return [
            'name' => config('app.name'),
            'url' => $this->cms->url(),
            'locale' => $this->cms->defaultLocale(),
            'locales' => $this->cms->locales(),
            'description' => $this->cms->site('description'),
            'year' => date('Y'),
        ];
    }

    public function globals(): array
    {
        PageContext::depend('globals');
        $locale = PageContext::current()?->locale();
        $out = [];

        foreach ($this->cms->globals()->all() as $handle => $set) {
            $out[$handle] = $set->blueprint()->augment($set->values($locale));
        }

        return $out;
    }

    /** The entry's own content: its body field (blocks, Markdown or rich text). */
    private function body(Entry $entry): string
    {
        $field = $entry->collection()->body;
        $value = $field ? (new AugmentedEntry($entry))->field($field) : null;

        $html = match (true) {
            $value instanceof BlocksDocument => $this->blocks->render($value->nodes),
            $value instanceof Htmlable => $value->toHtml(),
            is_string($value) => $value,
            default => '',
        };

        // A teaser ends by saying how to read the rest.
        return $entry->gated === 'teaser' && $this->cms->accounts()->enabled() ? $html.$this->cms->app()->make(Screens::class)->fragment('teaser-notice', $entry->locale) : $html;
    }

    private function document(PageContext $context, array $nodes, \Closure $outlet, string $title, ?string $bodyDocument = null, ?string $templateDocument = null): string
    {
        $this->hooks->dispatch('render.begin', $context);
        $translations = $this->cms->app()->make(Translations::class);
        $language = $translations->current();
        $editor = $this->blocks->editor;
        $this->blocks->editor = $context->editor;
        // Visitors read what the code says (a skip link, a form's messages) in the page's language. The canvas
        // speaks the admin's (placeholders, empty states): the one the editor asks for (`X-Cms-Locale` or `?lang=`), else the user's.
        $translations->apply($context->editor ? $this->adminLanguage($translations) : $context->locale());

        try {
            $body = $context->run(function (PageContext $ctx) use ($nodes, $outlet, $bodyDocument, $templateDocument) {
                // Which template a page gets can change with any template.
                PageContext::depend('collection:'.Templates::COLLECTION);
                $previous = [$this->blocks->scope, $this->blocks->outlet, $this->blocks->working];
                $this->blocks->scope = $this->scope($ctx);
                $this->blocks->outlet = $outlet;
                $this->blocks->working = $ctx->preview;

                try {
                    $html = $this->blocks->withOutletDocument($bodyDocument, fn () => $this->blocks->withEditorDocument($templateDocument, fn () => $this->blocks->render($nodes)));
                    if ($ctx->editor && $templateDocument !== null) {
                        $html = '<div data-cms-editor-root="'.e($templateDocument).'" style="display:contents" data-cms-contents>'.($html !== '' ? $html : '<div class="cms-placeholder" data-cms-editor-empty-root>'.e(__('Content')).'</div>').'</div>';
                    }
                    $source = $bodyDocument ?? $templateDocument;
                    if ($ctx->editor && $source !== null) $html .= $this->blocks->editorPrototypes($source);

                    return $html;
                } finally {
                    [$this->blocks->scope, $this->blocks->outlet, $this->blocks->working] = $previous;
                }
            });

            return $this->finish($context, $body, $title);
        } finally {
            $translations->apply($language);
            $this->blocks->editor = $editor;
        }
    }

    private function adminLanguage(Translations $translations): string
    {
        $request = request();
        $asked = (string) ($request->header('X-Cms-Locale') ?? $request->query('lang', ''));

        return isset($translations->languages()[$asked]) ? $asked : $translations->locale($request->user(), $request);
    }

    private function finish(PageContext $context, string $body, string $title): string
    {
        $entry = $context->entry;
        $locale = $context->locale();
        $dir = Languages::direction($locale);
        $name = (string) config('app.name');
        $design = $this->design->json();

        $head = [
            '<meta charset="utf-8">',
            '<meta name="viewport" content="width=device-width, initial-scale=1">',
            '<title>'.e($title !== '' && $entry?->uri !== '/' ? "{$title} · {$name}" : $name).'</title>',
        ];

        if ($design->hasDark()) {
            // A saved light/dark choice applies before the first paint.
            $head[] = '<script>try{var t=localStorage.getItem("cms-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}</script>';
        }

        foreach ($this->design->preloads() as $href) {
            $head[] = '<link rel="preload" href="'.e($href).'" as="font" type="font/woff2" crossorigin>';
        }

        if ($favicon = \Cms\Modules\Blocks\Media::url(cms()->setting('site', 'favicon'))) {
            $head[] = '<link rel="icon" href="'.e($favicon).'">';
        } else {
            // Without one, every browser asks for /favicon.ico and gets a 404.
            $head[] = '<link rel="icon" href="data:,">';
        }

        $head[] = '<link rel="stylesheet" href="'.e($this->design->stylesheet()).'">';

        if ($context->preview) {
            $head[] = '<meta name="robots" content="noindex, nofollow">';
        }

        $head = [...$head, ...array_values($context->head)];
        $head = $this->hooks->filter('site.head', $head, $context);

        // Stylesheets beside the design: the site's, then the template's, the components' and the blocks', in that order.
        foreach ($this->codeUrls($context, 'styles') as $href) {
            $head[] = '<link rel="stylesheet" href="'.e($href).'">';
        }

        if ($context->styles !== []) {
            $head[] = '<style>'.$context->css().'</style>';
        }

        $foot = array_values($context->foot);
        $modules = $context->editor ? [] : $this->codeUrls($context, 'scripts');

        if (! $context->editor && ($script = $this->design->script())) {
            $modules[] = $script;
        }

        foreach ($modules as $src) {
            $foot[] = '<script type="module" src="'.e($src).'"></script>';
        }

        // Pages swapped without a page load: every public page brings the script that does it, and the same import map,
        // since a page can't take another's place when its modules would resolve differently.
        $client = $context->mode !== PageContext::EDITOR && $context->mode !== PageContext::PREVIEW && $design->transition()['navigation'] === 'client';
        $client && $this->blocks->uses('navigate');

        $foot = $this->hooks->filter('site.foot', $foot, $context);

        // An import map counts from the first module on: it goes in the head, on pages that load one of the design's.
        if ((bool) $this->hooks->filter('site.modules', $modules !== [] || $context->modules || $client, $context) && ($map = $this->code->importMapTag()) !== '') {
            $context->dependencies['design:importmap'] = true;
            $head[] = $map;
        }
        $skipLink = ! $context->editor && str_contains($body, 'id="main"') ? '<a class="cms-skip" href="#main">'.e(__('Skip to content')).'</a>' : '';
        $alpine = ! $context->editor && (! empty($this->blocks->features['logic']) || ! empty($this->blocks->features['ajax'])) ? ' x-data' : '';

        // Paths the navigation script never fetches in place of a page load. A plugin adds its own
        // (a cart, a sign-out) with the `site.navigate.skip` filter.
        $skip = $client ? ' data-cms-navigate-skip="'.e(implode(' ', array_filter(
            (array) $this->hooks->filter('site.navigate.skip', ['/admin', '/api', '/install', '/media', '/_cms', '/__preview'], $context),
            static fn ($prefix) => is_string($prefix) && preg_match('#^/[A-Za-z0-9._~/-]*$#', $prefix),
        ))).'"' : '';

        $html = '<!doctype html><html lang="'.e($locale).'" dir="'.e($dir).'"'.$skip.'><head>'.implode("\n", $head).'</head><body'.$alpine.'>'.$skipLink.$body.implode("\n", $foot).'</body></html>';
        $html = $this->hooks->filter('site.html', $html, $context);

        return $context->editor || config('app.debug') && $context->preview ? $html : $this->minifier->minify($html);
    }

    /**
     * The published files of the page's scripts or styles. A name without a file is said once, where the build shows it.
     *
     * @return list<string>
     */
    private function codeUrls(PageContext $context, string $kind): array
    {
        $urls = [];

        foreach (Code::limit([...$this->code->for('global')[$kind], ...$context->code[$kind]]) as $name) {
            $context->dependencies["design:{$kind}/{$name}"] = true;
            $url = $this->code->url($kind, $name);
            $url !== null ? $urls[] = $url : $this->hooks->dispatch('render.warning', __('This page names :file, which is not in content/design.', ['file' => "{$kind}/{$name}.".Code::KINDS[$kind]]));
        }

        return $urls;
    }

    /** Used until a site has a `default` template: the content, nothing else. */
    public static function fallback(): array
    {
        return ['handle' => 'default', 'title' => 'Default', 'blocks' => [
            ['id' => 'tmain', 'type' => 'box', 'props' => ['tag' => 'main'], 'anchor' => 'main', 'children' => [['id' => 'toutlet', 'type' => 'outlet', 'props' => []]]],
        ]];
    }

    public static function fallback404(): array
    {
        return ['handle' => '404', 'title' => 'Not Found', 'blocks' => [
            ['id' => 't404', 'type' => 'section', 'props' => ['width' => 'prose'], 'anchor' => 'main', 'style' => ['base' => ['textAlign' => 'center']], 'children' => [
                ['id' => 't404c', 'type' => 'paragraph', 'props' => ['text' => '404'], 'style' => ['base' => ['color' => 'token:color.muted']]],
                ['id' => 't404h', 'type' => 'heading', 'props' => ['text' => 'This page does not exist', 'level' => '1']],
                ['id' => 't404l', 'type' => 'link', 'props' => ['label' => 'Go to the Home Page', 'url' => '/']],
            ]],
        ]];
    }
}

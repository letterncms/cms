<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Modules\Site\Rendering\Renderer;
use Cms\Tests\TestCase;

/** Pages render from templates and components (entries), with no theme files. */
final class RenderingTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    protected function collections(): array
    {
        return [
            'pages' => ['title' => 'Pages', 'route' => '/{slug}', 'template' => 'page', 'fields' => [['handle' => 'content', 'type' => 'blocks', 'body' => true]]],
            'posts' => ['title' => 'Posts', 'structure' => 'dated', 'route' => '/blog/{slug}', 'fields' => [['handle' => 'content', 'type' => 'blocks', 'body' => true], ['handle' => 'excerpt', 'type' => 'textarea']]],
            'trips' => ['title' => 'Trips', 'route' => '/trips/{slug}', 'template' => 'trip', 'fields' => [['handle' => 'content', 'type' => 'blocks', 'body' => true], ['handle' => 'cover', 'type' => 'media', 'max' => 1, 'accept' => 'image/*'], ['handle' => 'photos', 'type' => 'media', 'accept' => 'image/*']]],
        ];
    }

    public function test_plugins_add_their_collection_settings(): void
    {
        $settings = fn (string $handle) => array_column($this->cms()->collections()->settingsFields($this->cms()->collections()->find($handle)), null, 'handle');

        $pages = $settings('pages');
        $this->assertArrayNotHasKey('editor', $pages, 'editing capabilities come from fields, not a collection mode');
        $this->assertSame('template', $pages['template']['handle']);

        // Templates have no URL of their own, so no template to pick.
        $this->assertArrayNotHasKey('template', $settings('templates'));
    }

    public function test_collection_templates_are_explicit_and_the_picker_only_offers_real_templates(): void
    {
        $templates = $this->app->make(\Cms\Modules\Blocks\Templates::class);
        $posts = $this->cms()->collections()->find('posts');
        $this->assertSame('', $posts->template);
        $settings = fn () => array_column($this->cms()->collections()->settingsFields($posts), null, 'handle')['template'];
        $this->assertSame([], $settings()['options']);
        $this->assertSame('Content Only', $settings()['placeholder']);

        $this->cms()->entryService()->create('templates', ['title' => 'Default', 'slug' => 'default', 'status' => 'published', 'data' => ['blocks' => [['type' => 'outlet']]]]);
        $templates->flush();
        $this->assertSame('Default', $settings()['placeholder']);
        $this->assertSame('default', $templates->resolve([$posts->template])['handle']);
        $this->assertArrayNotHasKey('posts_single', $settings()['options']);

        $this->cms()->entryService()->create('templates', ['title' => 'Post detail', 'slug' => 'posts_single', 'status' => 'published', 'data' => ['blocks' => [
            ['type' => 'heading', 'props' => ['text' => 'Post template']], ['type' => 'outlet'],
        ]]]);
        $templates->flush();
        $this->assertSame('Post detail', $settings()['options']['posts_single']);
        $this->assertSame('default', $templates->resolve([$posts->template])['handle'], 'Creating a similarly named template does not silently change a collection.');
        $definition = $posts->toYaml();
        $definition['template'] = 'posts_single';
        $this->cms()->collections()->save(\Cms\Content\Collections\Collection::fromArray('posts', $definition));
        $post = $this->cms()->entryService()->create('posts', ['title' => 'Hello', 'status' => 'published', 'data' => ['excerpt' => 'Hi']]);
        $this->assertStringContainsString('Post template', $this->app->make(Renderer::class)->entry($this->cms()->entries()->find($post->id))['html']);

        $this->cms()->entryService()->create('templates', ['title' => 'Missing page', 'slug' => '404', 'status' => 'published', 'data' => ['blocks' => []]]);
        $this->cms()->entryService()->create('templates', ['title' => 'Pages only', 'slug' => 'pages_only', 'status' => 'published', 'data' => ['collections' => ['pages'], 'blocks' => []]]);
        $templates->flush();
        $this->assertSame(['default' => 'Default', 'posts_single' => 'Post detail'], $settings()['options']);

        // A maximum-length collection handle must still fit its template suffix.
        $longHandle = str_repeat('a', 64).'_single';
        $long = $this->cms()->entryService()->create('templates', ['title' => 'Long handle', 'slug' => $longHandle, 'data' => ['blocks' => []]]);
        $this->assertSame($longHandle, $long->slug);
    }

    public function test_entry_template_fields_share_picker_configuration_and_resolve_the_collection_fallback(): void
    {
        $collections = $this->cms()->collections();
        $definition = $collections->find('posts')->toYaml();
        $definition['template'] = 'article';
        $definition['fields'][] = ['handle' => 'template', 'type' => 'select', 'dynamic' => 'templates', 'section' => 'sidebar'];
        $definition['fields'][] = ['handle' => 'other_layout', 'type' => 'select', 'dynamic' => 'templates'];
        $definition['fields'][] = ['handle' => 'template_choices', 'type' => 'select', 'multiple' => true, 'dynamic' => 'templates'];
        $collections->save(\Cms\Content\Collections\Collection::fromArray('posts', $definition));
        $posts = $collections->find('posts');
        $fields = fn () => array_column($posts->toArray()['resolvedFields'], null, 'handle');
        $this->assertSame('Content Only', $fields()['template']['placeholder']);
        $this->assertNull($fields()['template']['fallbackHandle']);
        $content = $this->cms()->entryService();
        $templates = $this->app->make(\Cms\Modules\Blocks\Templates::class);
        $content->create('templates', ['title' => 'Site default', 'slug' => 'default', 'status' => 'published', 'data' => ['blocks' => [['type' => 'outlet']]]]);
        $templates->flush();
        $this->assertSame('Site default', $fields()['template']['placeholder'], 'a missing collection template falls back exactly like the renderer');
        $content->create('templates', ['title' => 'Article', 'slug' => 'article', 'status' => 'published', 'data' => ['collections' => ['posts'], 'blocks' => [['type' => 'outlet']]]]);
        $content->create('templates', ['title' => 'Pages only', 'slug' => 'pages_only', 'status' => 'published', 'data' => ['collections' => ['pages'], 'blocks' => []]]);
        $templates->flush();
        $field = $fields()['template'];
        $this->assertSame('site-template', $field['component']);
        $this->assertSame('Article', $field['placeholder']);
        $this->assertSame('article', $field['fallbackHandle']);
        $this->assertSame('', $field['defaultHandle']);
        $this->assertSame(['article' => 'Article', 'default' => 'Site default'], $field['options']);
        $this->assertSame($field['component'], $fields()['other_layout']['component'], 'the declared dynamic source selects presentation, not a magic field handle');
        $this->assertArrayNotHasKey('component', $fields()['template_choices'], 'multiple template choices keep the multiple-select contract');
        $settings = array_column($collections->settingsFields($posts), null, 'handle')['template'];
        $this->assertSame('site-template', $settings['component']);
        $this->assertSame('Site default', $settings['placeholder'], 'collection settings inherit the site; entries inherit their collection');
        $this->assertSame($field['options'], $settings['options']);
        $this->assertArrayNotHasKey('component', array_column($posts->toYaml()['fields'], null, 'handle')['template'], 'resolved presentation is never written into the collection definition');
        $plain = \Cms\Content\Fields\Blueprint::make([['handle' => 'template', 'type' => 'select', 'options' => ['x' => 'X']]])->toArray(['collection' => $posts]);
        $this->assertArrayNotHasKey('component', $plain[0], 'an unrelated select with the same handle remains an ordinary select');
    }

    public function test_a_page_is_its_template_with_the_entry_in_the_outlet(): void
    {
        $content = $this->cms()->entryService();
        $content->create('components', ['title' => 'Header', 'slug' => 'header', 'status' => 'published', 'data' => ['blocks' => [
            ['type' => 'box', 'props' => ['tag' => 'header'], 'children' => [['type' => 'link', 'props' => ['url' => '/'], 'bind' => ['label' => 'site.name']]]],
        ]]]);
        $content->create('templates', ['title' => 'Page', 'slug' => 'page', 'status' => 'published', 'data' => ['blocks' => [
            ['type' => 'component', 'props' => ['ref' => 'header']],
            ['type' => 'box', 'props' => ['tag' => 'main'], 'anchor' => 'main', 'children' => [
                ['type' => 'heading', 'props' => ['level' => '1'], 'bind' => ['text' => 'entry.title']],
                ['type' => 'outlet'],
                ['type' => 'repeat', 'props' => ['source' => 'entries', 'collection' => 'posts', 'limit' => 5], 'children' => [
                    ['type' => 'link', 'bind' => ['label' => 'item.title', 'url' => 'item.url']],
                ]],
            ]],
        ]]]);
        $content->create('posts', ['title' => 'First post', 'slug' => 'first', 'status' => 'published', 'data' => ['excerpt' => 'Hi']]);
        $page = $content->create('pages', ['title' => 'About us', 'slug' => 'about', 'status' => 'published', 'data' => ['content' => [['type' => 'paragraph', 'props' => ['text' => 'We make sites.']]]]]);

        $result = $this->app->make(Renderer::class)->entry($this->cms()->entries()->find($page->id));
        $html = $result['html'];

        $this->assertStringStartsWith('<!doctype html><html lang="en" dir="ltr">', $html);
        $this->assertMatchesRegularExpression('#<link rel="stylesheet" href="/_cms/site/design-\w+\.css">#', $html);
        $this->assertStringContainsString('<a class="cms-skip" href="#main">', $html);
        $this->assertMatchesRegularExpression('#<header class="cms-box"><a class="cms-link" href="/"[^>]*>#', $html);
        $this->assertStringContainsString('About us</h1>', $html);
        $this->assertStringContainsString('<p class="cms-paragraph">We make sites.</p>', $html);
        $this->assertStringContainsString('href="/blog/first">First post</a>', $html);

        $deps = array_keys($result['context']->dependencies);
        $this->assertContains('collection:templates', $deps, 'any template change rebuilds the page');
        $this->assertContains('collection:posts', $deps);
        $this->assertNotEmpty(array_filter($deps, static fn ($d) => str_starts_with($d, 'entry:')), 'the component it uses is a dependency');
    }

    public function test_media_blocks_bound_to_an_entrys_media_fields_show_its_files(): void
    {
        $jpeg = function (string $name, int $shade): string {
            $im = imagecreatetruecolor(1200, 800);
            imagefill($im, 0, 0, imagecolorallocate($im, $shade, 90, 200));
            ob_start();
            imagejpeg($im, null, 80);
            $file = tempnam(sys_get_temp_dir(), 'cms');
            file_put_contents($file, (string) ob_get_clean());

            return $this->app->make(\Cms\Modules\Media\MediaStore::class)->store($file, $name)->id;
        };
        [$cover, $one, $two] = [$jpeg('cover.jpg', 10), $jpeg('one.jpg', 120), $jpeg('two.jpg', 240)];
        $content = $this->cms()->entryService();
        $content->create('components', ['title' => 'Hero', 'slug' => 'hero', 'status' => 'published', 'data' => ['props' => [['handle' => 'image', 'type' => 'media', 'max' => 1]], 'blocks' => [
            ['type' => 'image', 'props' => ['alt' => 'Hero'], 'bind' => ['image' => 'props.image']],
        ]]]);
        $content->create('templates', ['title' => 'Trip', 'slug' => 'trip', 'status' => 'published', 'data' => ['blocks' => [
            ['type' => 'image', 'props' => ['alt' => 'Cover'], 'bind' => ['image' => 'entry.cover']],
            ['type' => 'component', 'props' => ['ref' => 'hero'], 'bind' => ['values.image' => 'entry.cover']],
            ['type' => 'gallery', 'bind' => ['images' => 'entry.photos']],
        ]]]);
        $trip = $content->create('trips', ['title' => 'Coast', 'slug' => 'coast', 'status' => 'published', 'data' => ['cover' => [$cover], 'photos' => [$one, $two]]]);

        $html = $this->app->make(Renderer::class)->entry($this->cms()->entries()->find($trip->id))['html'];

        $this->assertMatchesRegularExpression('#<figure class="cms-image"><picture>(<source[^>]*>)*<img src="/_cms/img/'.$cover.'/[^>]+ alt="Cover"#', $html, 'an image bound to the entry’s media field');
        $this->assertMatchesRegularExpression('#<figure class="cms-image"><picture>(<source[^>]*>)*<img src="/_cms/img/'.$cover.'/[^>]+ alt="Hero"#', $html, 'and through a component’s value');
        $this->assertSame(2, substr_count($html, '<li class="cms-gallery__item">'), 'a gallery bound to a list of them shows every one');
        $this->assertStringContainsString('/_cms/img/'.$two.'/', $html);
    }

    public function test_a_pattern_is_drawn_alone_in_the_sites_design_for_its_picture(): void
    {
        $saved = $this->cms()->abilities()->execute('patterns/save', ['handle' => 'hero', 'title' => 'Hero', 'category' => 'Heroes', 'publish' => false, 'blocks' => "## A pattern’s title\n\nIts words."], \Cms\Abilities\AbilityContext::system('test'));

        $html = (string) $this->actingAs($this->admin())->get('/__pattern/hero')->assertOk()->assertHeader('Cache-Control', 'no-store, private')->getContent();
        $this->assertMatchesRegularExpression('#<link rel="stylesheet" href="/_cms/site/design-\w+\.css">#', $html, 'in the site’s design');
        $this->assertStringContainsString('A pattern’s title</h2>', $html, 'a draft too: it is drawn to be chosen');
        $this->assertStringNotContainsString('data-cms-node', $html, 'a picture, not the canvas');

        // Saved and edited in the canvas like a component: alone, with no template around it.
        $canvas = (string) $this->postJson('/__preview/'.$saved['id'])->assertOk()->getContent();
        $this->assertStringContainsString('data-cms-node', $canvas);

        $this->get('/__pattern/nothing-here')->assertNotFound();
        auth()->logout();
        $this->assertNotSame(200, $this->get('/__pattern/hero')->getStatusCode(), 'for people who may open the admin');
    }

    public function test_search_and_twins_read_the_text_of_components_and_repeats(): void
    {
        $content = $this->cms()->entryService();
        $content->create('components', ['title' => 'Intro', 'slug' => 'intro', 'status' => 'published', 'data' => [            'props' => [['handle' => 'title', 'type' => 'text', 'label' => 'Title']],
            'blocks' => [['type' => 'heading', 'props' => ['level' => '2'], 'bind' => ['text' => 'props.title']]],
        ]]);
        $content->create('posts', ['title' => 'Launch notes', 'slug' => 'launch', 'status' => 'published', 'data' => []]);
        $page = $content->create('pages', ['title' => 'Home', 'slug' => 'home', 'status' => 'published', 'data' => ['content' => [
            ['type' => 'component', 'props' => ['ref' => 'intro', 'values' => ['title' => 'Built for agencies']]],
            ['type' => 'repeat', 'props' => ['source' => 'entries', 'collection' => 'posts'], 'children' => [['type' => 'paragraph', 'bind' => ['text' => 'item.title']]]],
        ]]]);

        $nodes = $this->app->make(Renderer::class)->materialize($this->cms()->entries()->find($page->id), $this->cms()->entries()->find($page->id)->data['content']);
        $text = $this->app->make(\Cms\Modules\Blocks\Document::class)->text($nodes);

        $this->assertSame('Built for agencies Launch notes', $text);
    }

    public function test_a_repeat_lists_the_entries_that_link_to_the_page(): void
    {
        $content = $this->cms()->entryService();
        $this->cms()->collections()->save(\Cms\Content\Collections\Collection::fromArray('posts', [...$this->collections()['posts'], 'fields' => [...$this->collections()['posts']['fields'], ['handle' => 'about', 'type' => 'entries', 'collections' => ['pages']]]]));
        $page = $content->create('pages', ['title' => 'Topic', 'slug' => 'topic', 'status' => 'published', 'data' => ['content' => [
            ['type' => 'repeat', 'props' => ['source' => 'entries', 'collection' => 'posts', 'sort' => 'title', 'references' => 'current'], 'children' => [['type' => 'paragraph', 'bind' => ['text' => 'item.title']]]],
        ]]]);
        $content->create('posts', ['title' => 'On topic', 'status' => 'published', 'data' => ['about' => [$page->id]]]);
        $content->create('posts', ['title' => 'Also on topic', 'status' => 'published', 'data' => ['about' => [$page->id]]]);
        $content->create('posts', ['title' => 'Elsewhere', 'status' => 'published', 'data' => []]);

        $entry = $this->cms()->entries()->find($page->id);
        $nodes = $this->app->make(Renderer::class)->materialize($entry, $entry->data['content']);

        $this->assertSame('Also on topic On topic', $this->app->make(\Cms\Modules\Blocks\Document::class)->text($nodes));
    }

    public function test_without_templates_a_page_still_renders_its_content(): void
    {
        $page = $this->cms()->entryService()->create('pages', ['title' => 'Bare', 'slug' => 'bare', 'status' => 'published', 'data' => ['content' => [['type' => 'heading', 'props' => ['text' => 'Hello', 'level' => '1']]]]]);
        $html = $this->app->make(Renderer::class)->entry($this->cms()->entries()->find($page->id))['html'];

        $this->assertStringContainsString('<main class="cms-box" id="main"><div class="cms-outlet" style="display:contents" data-cms-contents><h1 class="cms-heading" id="hello">Hello</h1></div></main>', $html);
        $this->assertSame(404, $this->app->make(Renderer::class)->notFound('/nope')['status']);
    }

    public function test_buttons_from_the_design_system_are_valid_block_variants(): void
    {
        $this->cms()->abilities()->execute('design/update', ['buttons' => ['on-brand' => ['base' => ['color' => '#000']]]], \Cms\Abilities\AbilityContext::system());

        $field = app(\Cms\Modules\Blocks\BlockRegistry::class)->get('button')->blueprint()->field('variant');

        $this->assertSame('On brand', $field->get('options')['on-brand']);
        $this->assertSame('Primary', $field->get('options')['primary']);
    }

    public function test_the_design_system_compiles_tokens_fonts_elements_and_buttons(): void
    {
        $this->cms()->abilities()->execute('design/update', [
            'tokens' => ['color.primary' => '#0f766e'],
            'dark' => ['color.primary' => '#5eead4'],
            'styles' => ['h1' => ['fontSize' => 'token:text.5xl', 'letterSpacing' => '-0.04em']],
            'buttons' => ['primary' => ['base' => ['backgroundColor' => 'token:color.primary'], 'hover' => ['opacity' => 0.9]]],
            'transition' => ['type' => 'slide', 'duration' => 0.4],
        ], \Cms\Abilities\AbilityContext::system('test'));

        $design = $this->app->make(\Cms\Modules\Site\Design\Design::class);
        $design->saved();
        $css = (string) file_get_contents(public_path(ltrim($design->stylesheet(), '/')));

        $this->assertFileExists(content_path('design/tokens.json'));
        $this->assertStringContainsString('--color-primary:#0f766e', $css);
        $this->assertStringContainsString('[data-theme=dark]{', $css);
        $this->assertStringContainsString('h1{font-size:var(--text-5xl);letter-spacing:-0.04em}', $css);
        $this->assertStringContainsString('.cms-button[data-variant="primary"]{background-color:var(--color-primary)}', $css);
        $this->assertStringContainsString('@view-transition{navigation:auto}', $css);
    }

    public function test_page_content_is_one_element_and_prose_is_a_toggle(): void
    {
        $content = $this->cms()->entryService();
        $content->create('templates', ['title' => 'Site default', 'slug' => 'default', 'status' => 'published', 'data' => ['blocks' => [
            ['type' => 'box', 'props' => ['prose' => true], 'children' => [['type' => 'outlet']]],
        ]]]);
        $page = $content->create('pages', ['title' => 'Notes', 'slug' => 'notes', 'status' => 'published', 'data' => ['content' => [['type' => 'paragraph', 'props' => ['text' => 'One']]]]]);
        $html = $this->app->make(Renderer::class)->entry($this->cms()->entries()->find($page->id))['html'];

        // Unwrapped, Page Content lends its blocks to the prose box around it, on the site as in the editor.
        $this->assertStringContainsString('<div class="cms-box cms-prose"><div class="cms-outlet" style="display:contents" data-cms-contents><p class="cms-paragraph">One</p></div></div>', $html);
    }

    public function test_prose_spacing_is_the_flow_between_its_blocks(): void
    {
        $this->cms()->abilities()->execute('design/update', [
            'prose' => ['spacing' => ['blocks' => '1.25em', 'headings' => 'token:space.12'], 'h2' => ['fontSize' => '2rem', 'marginTop' => '3rem'], 'a:hover' => ['color' => 'red'], 'li' => ['color' => 'blue'], '::selection' => ['color' => 'green']],
        ], \Cms\Abilities\AbilityContext::system('test'));

        $design = $this->app->make(\Cms\Modules\Site\Design\Design::class);
        $design->saved();
        $css = (string) file_get_contents(public_path(ltrim($design->stylesheet(), '/')));

        $this->assertStringContainsString('.cms-prose{--prose-blocks:1.25em;--prose-headings:var(--space-12)}', $css);
        $this->assertStringContainsString('.cms-prose h2:where(:not(.cms-box, .cms-repeat)){font-size:2rem}', $css);
        $this->assertStringContainsString('.cms-prose > * + h2:where(:not(.cms-box, .cms-repeat)),.cms-prose > [data-cms-contents] > * + h2:where(:not(.cms-box, .cms-repeat)),.cms-prose > * + [data-cms-contents] > h2:where(:not(.cms-box, .cms-repeat)):first-child{margin-top:3rem}', $css);
        // Prose styles text: a Box or Repeat drawn as a link or a list is layout, and so are the items of such a list.
        $this->assertStringContainsString('.cms-prose a:where(:not(.cms-box, .cms-repeat)):hover{color:red}', $css);
        $this->assertStringContainsString('.cms-prose :where(ul:not(.cms-box, .cms-repeat), ol:not(.cms-box, .cms-repeat)) > li{color:blue}', $css);
        $this->assertStringContainsString('.cms-prose ::selection{color:green}', $css);
        $this->assertArrayHasKey('spacing', (array) $this->cms()->abilities()->execute('design/get', [], \Cms\Abilities\AbilityContext::system('test'))['prose']);
    }

    public function test_blocks_name_each_other_across_the_template_a_component_and_the_page(): void
    {
        $this->cms()->entryService()->create('components', ['title' => 'Aside', 'slug' => 'aside', 'status' => 'published', 'data' => ['blocks' => [
            ['id' => 'aside', 'type' => 'box', 'props' => ['tag' => 'aside'], 'attrs' => ['aria-labelledby' => '#frame-title', 'aria-describedby' => '#lede'], 'children' => []],
        ]]]);
        $this->cms()->entryService()->create('templates', ['title' => 'Named', 'slug' => 'named', 'status' => 'published', 'data' => ['blocks' => [
            // Rendered first, named by what comes after it: the page's content and a component.
            ['id' => 'frame-title', 'type' => 'paragraph', 'props' => ['text' => 'Frame']],
            ['id' => 'region', 'type' => 'box', 'props' => ['tag' => 'section'], 'attrs' => ['aria-labelledby' => '#page-title'], 'children' => [['type' => 'outlet']]],
            ['type' => 'component', 'props' => ['ref' => 'aside']],
        ]]]);
        $this->app->make(\Cms\Modules\Blocks\Templates::class)->flush();
        $this->app->make(\Cms\Modules\Blocks\Components::class)->flush();
        $page = $this->cms()->entryService()->create('pages', ['title' => 'Named page', 'status' => 'published', 'data' => ['template' => 'named', 'content' => [
            ['id' => 'page-title', 'type' => 'heading', 'props' => ['text' => 'A page title', 'level' => '1']],
            ['id' => 'lede', 'type' => 'paragraph', 'props' => ['text' => 'Lede'], 'attrs' => ['aria-details' => '#frame-title']],
        ]]]);

        $html = $this->app->make(Renderer::class)->entry($this->cms()->entries()->find($page->id))['html'];

        $this->assertStringContainsString('<p class="cms-paragraph" data-cms="frame-title" id="cms-frame-title">Frame</p>', $html, 'a template block named only from the page and a component has its id');
        $this->assertStringContainsString('aria-labelledby="a-page-title"', $html, 'the template names a heading of the page');
        $this->assertStringContainsString('aria-details="cms-frame-title"', $html, 'the page names a block of the template');
        $this->assertStringContainsString('aria-labelledby="cms-frame-title" aria-describedby="cms-lede"', $html, 'a component names both');
        $this->assertStringNotContainsString("\x1B", $html);
    }

    public function test_element_styles_take_a_small_grammar_of_selectors_and_nothing_else(): void
    {
        $compiler = \Cms\Modules\Site\Design\DesignCompiler::class;

        foreach (['h1 em', 'h2 > strong', 'nav a:hover', 'li::marker', 'figure figcaption', 'ul li > a:focus-visible', 'a:hover', '::selection', 'body'] as $selector) {
            $this->assertTrue($compiler::selectable($selector), $selector);
        }

        foreach (['.hero em', '#main p', 'h1[title]', 'h1, body', 'h1{color:red}body', 'h1 em strong a', 'body em', 'a:has(img)', 'h1 em:hover:active', 'p}', 'script', '*', '', 'h1  em', ['h1']] as $selector) {
            $this->assertFalse($compiler::selectable($selector), json_encode($selector));
        }

        // A class a block carries, for element styles only: alone or on a tag, never the runtime's own, never an id.
        foreach (['.water', '.water em', 'span.water', '.card.is-open', 'nav.main > a:hover', '.a .b .c', 'h1 .water::after'] as $selector) {
            $this->assertTrue($compiler::selectable($selector, true), $selector);
            $this->assertFalse($compiler::selectable($selector), $selector.' in prose');
        }

        foreach (['.cms-box', 'p.cms-prose em', '.Water', '.water_', '.-x', '.a.b.c', '. water', '.water,.x', '.water{}', '#a.water', '.water[x]', '.a .b .c .d', 'body.water', '.water:hover em', '.'] as $selector) {
            $this->assertFalse($compiler::selectable($selector, true), $selector);
        }

        $context = \Cms\Abilities\AbilityContext::system('test');
        $css = $this->cms()->abilities()->execute('design/preview', [
            'styles' => ['h1 em' => ['fontStyle' => 'italic', 'color' => 'rgb(7, 8, 9)'], 'nav a:hover' => ['color' => 'red'], '.water em' => ['fontFamily' => 'token:font.serif', 'fontStyle' => 'italic', 'fontWeight' => '400', 'letterSpacing' => '-0.03em', 'fontSize' => '1.07em'], 'span.water' => ['fontStyle' => 'italic']],
            'prose' => ['spacing' => ['blocks' => '1em'], 'li::marker' => ['color' => 'green'], 'blockquote p' => ['color' => 'teal']],
        ], $context)['css'];

        // What can't be styled is refused by name when it is saved, not kept and dropped in silence.
        foreach ([['styles', '#x'], ['styles', '.cms-box'], ['styles', 'h1}body{display:none'], ['prose', '#lead p'], ['prose', '.lead']] as [$section, $selector]) {
            foreach (['design/update', 'design/preview'] as $ability) {
                try {
                    $this->cms()->abilities()->execute($ability, [$section => [$selector => ['color' => 'blue']]], $context);
                    $this->fail("{$ability} took {$selector}");
                } catch (\Cms\Abilities\AbilityException $e) {
                    $this->assertStringContainsString($selector, $e->getMessage());
                }
            }
        }

        // A file written by hand can still hold one: it compiles to nothing.
        \Cms\Support\Files::putJson(content_path('design/tokens.json'), ['styles' => ['#x' => ['color' => 'blue'], '.cms-box' => ['color' => 'blue'], 'p' => ['color' => 'teal']]]);
        $this->app->make(\Cms\Modules\Site\Design\Design::class)->saved();
        $stored = (string) file_get_contents(public_path(ltrim($this->app->make(\Cms\Modules\Site\Design\Design::class)->stylesheet(), '/')));
        $this->assertStringNotContainsString('blue', $stored);
        $this->assertStringContainsString('p{color:teal}', $stored);

        $this->assertStringContainsString('h1 em{font-style:italic;color:rgb(7, 8, 9)}', $css);
        $this->assertStringContainsString('nav a:hover{color:red}', $css);
        $this->assertStringNotContainsString('blue', $css);
        // What the showcase wrote custom CSS for: a class on a block, styled by the design.
        $this->assertStringContainsString('.water em{font-family:var(--font-serif);font-style:italic;font-weight:400;letter-spacing:-0.03em;font-size:1.07em}', $css);
        $this->assertStringContainsString('span.water{font-style:italic}', $css);
        $this->assertMatchesRegularExpression('/@layer elements\{[^@]*\.water em\{/', $css, 'with the element styles, under a block\'s own');
        $this->assertStringContainsString('.cms-prose li:where(:not(.cms-box, .cms-repeat))::marker{color:green}', $css);
        $this->assertStringContainsString('.cms-prose blockquote p:where(:not(.cms-box, .cms-repeat)){color:teal}', $css);

        // Inside prose a class still holds: at the same weight as `.cms-prose em`, it comes after it.
        $css = $this->cms()->abilities()->execute('design/preview', ['styles' => ['.note em' => ['color' => 'rgb(1, 2, 3)'], 'h1' => ['color' => 'rgb(4, 5, 6)']], 'prose' => ['em' => ['color' => 'rgb(9, 9, 9)']]], $context)['css'];
        $prose = strpos($css, '.cms-prose em');
        $this->assertNotFalse($prose);
        $this->assertGreaterThan($prose, strpos($css, '.note em{color:rgb(1, 2, 3)}'), 'a class comes after the prose rules');
        $this->assertLessThan($prose, strpos($css, 'h1{color:rgb(4, 5, 6)}'), 'a tag stays under them, as it was');
    }

    public function test_form_fields_are_styled_once_from_the_design_system(): void
    {
        $context = \Cms\Abilities\AbilityContext::system('test');
        $compile = fn (array $fields) => $this->cms()->abilities()->execute('design/preview', ['fields' => $fields], $context)['css'];

        // With nothing set, every field still looks finished, from the site's tokens.
        $css = $compile([]);
        $this->assertStringContainsString(':root,[data-theme]{--field-background:', $css);
        $this->assertStringContainsString('--field-background:var(--color-raised, var(--color-background, transparent))', $css);
        $this->assertStringContainsString('--field-radius:var(--radius-md, 0.5rem)', $css);
        $this->assertStringContainsString('--field-checkbox-background:var(--field-background)', $css);
        $this->assertStringContainsString('.cms-check:is(:checked', $css);

        $css = $compile([
            'field' => ['height' => '3rem', 'radius' => 'token:radius.lg', 'borderWidth' => 2],
            'spacing' => ['size' => 'lg'],
            'checkbox' => ['checked' => 'token:color.accent', 'mark' => 'dot', 'size' => 'field:switch.height'],
            'radio' => ['style' => 'ring'],
            'switch' => ['on' => 'url(https://example.com/x)', 'width' => ''],
            'nothing' => ['height' => '1px'],
        ]);

        // One value reaches every kind of field; a part follows another with field:part.key.
        // Size is the control scale's, not the look's: forms take the size the site picks.
        $this->assertStringNotContainsString('--field-height', $css);
        $this->assertStringContainsString('.cms-form:not([data-size]){--control-height:var(--control-lg-height);', $css);
        $this->assertStringContainsString('--field-radius:var(--radius-lg);', $css);
        $this->assertStringContainsString('--field-border-width:2px;', $css);
        $this->assertStringContainsString('--field-checkbox-checked:var(--color-accent);', $css);
        $this->assertStringContainsString('--field-checkbox-size:var(--field-switch-height);', $css);
        $this->assertStringContainsString("%3Ccircle%20cx%3D%278%27", $css);
        $this->assertStringContainsString('--field-radio-on-background:var(--field-checkbox-background);--field-radio-on-dot:var(--field-radio-checked)', $css);
        // What CSS can't take, a part that isn't there and an empty value keep the defaults.
        $this->assertStringNotContainsString('example.com', $css);
        $this->assertStringContainsString('--field-switch-width:2.25rem;', $css);
    }

    public function test_the_specimen_shows_every_field_and_button_to_the_admin_only(): void
    {
        $this->get('/__specimen/fields')->assertRedirect();

        $this->actingAs($this->admin());
        $html = $this->get('/__specimen/fields')->assertOk()->getContent();

        foreach (['cms-input', 'cms-tags', 'cms-check', 'cms-radio', 'cms-switch', 'cms-range', 'cms-chip', 'type="file"', 'data-part="checkbox"', 'data-cms-state="focus"'] as $needle) {
            $this->assertStringContainsString($needle, $html);
        }

        $this->assertStringContainsString('data-part="primary"', $this->get('/__specimen/buttons')->assertOk()->getContent());
        $this->assertStringContainsString('data-size="lg"', $this->get('/__specimen/sizes')->assertOk()->getContent());
        $this->get('/__specimen/nothing')->assertNotFound();
    }

    public function test_buttons_and_fields_share_one_size_scale_and_variants_are_looks(): void
    {
        $context = \Cms\Abilities\AbilityContext::system('test');
        $css = $this->cms()->abilities()->execute('design/preview', [
            'tokens' => ['control.md-height' => '2.5rem'],
            'buttons' => ['primary' => ['base' => ['backgroundColor' => 'token:color.primary', 'height' => '13.37rem', 'paddingInline' => '7.77rem', 'fontSize' => '9.99rem']]],
        ], $context)['css'];

        // The site's own size, the defaults for the rest, and the size in effect by data-size.
        $this->assertStringContainsString('--control-md-height:2.5rem', $css);
        $this->assertStringContainsString('--control-sm-height:2.25rem', $css);
        $this->assertStringContainsString('--control-lg-text:var(--text-lg)', $css);
        $this->assertStringContainsString('[data-size=sm]{--control-height:var(--control-sm-height);', $css);
        $this->assertStringContainsString('.cms-button {', $css);
        $this->assertStringContainsString('height: var(--control-height)', $css);
        // A variant keeps its look and loses what would size it.
        $this->assertStringContainsString('@layer components{@layer button-variants{.cms-button[data-variant="primary"]{background-color:var(--color-primary)}', $css);
        $this->assertStringNotContainsString('13.37rem', $css);

        $html = app(\Cms\Modules\Blocks\BlockRenderer::class)->render([['id' => 'b', 'type' => 'button', 'props' => ['label' => '', 'icon' => 'plus', 'shape' => 'round', 'accessible_label' => 'Add', 'size' => 'lg']]]);
        $this->assertStringContainsString('data-size="lg" data-shape="round" data-icon-only aria-label="Add"', $html);
    }

    public function test_tokens_rename_with_their_references_and_dark_values_clear(): void
    {
        $abilities = $this->cms()->abilities();
        $context = \Cms\Abilities\AbilityContext::system('test');
        $abilities->execute('design/update', ['buttons' => ['primary' => ['base' => ['backgroundColor' => 'token:color.primary']]], 'dark' => ['color.primary' => '#5eead4']], $context);
        $before = array_keys(array_filter((array) json_decode((string) file_get_contents(content_path('design/tokens.json')), true)['tokens']['color'], fn ($k) => $k[0] !== '$', ARRAY_FILTER_USE_KEY));

        $preview = $abilities->execute('design/preview', ['tokens' => ['color.primary' => '#123456'], 'css' => '.x{color:red}'], $context);
        $this->assertStringContainsString('--color-primary:#123456', $preview['css']);
        $this->assertStringContainsString('.x{color:red}', $preview['css']);

        $abilities->execute('design/update', ['rename' => ['color.primary' => 'color.brand'], 'dark' => ['color.brand' => null]], $context);

        $json = json_decode((string) file_get_contents(content_path('design/tokens.json')), true);
        $after = array_keys(array_filter($json['tokens']['color'], fn ($k) => $k[0] !== '$', ARRAY_FILTER_USE_KEY));
        $this->assertSame(array_search('primary', $before, true), array_search('brand', $after, true));
        $this->assertArrayNotHasKey('$extensions', $json['tokens']['color']['brand']);
        $this->assertSame('token:color.brand', $json['buttons']['primary']['base']['backgroundColor']);
    }

    public function test_rendered_preview_uses_the_unsaved_editorial_snapshot_without_persisting_it(): void
    {
        $actor = $this->admin(['name' => 'Original credit']);
        $credit = $this->admin(['name' => 'Preview credit']);
        $entry = $this->cms()->entryService()->create('pages', ['title' => 'Saved title', 'authorId' => $actor->id, 'data' => ['content' => []]]);
        $version = $entry->version();
        $snapshot = ['title' => 'Unsaved title', 'slug' => 'unsaved-slug', 'authorId' => $credit->id, 'data' => ['content' => [
            ['type' => 'heading', 'bind' => ['text' => 'entry.title']],
            ['type' => 'paragraph', 'bind' => ['text' => 'entry.author.name']],
            ['type' => 'paragraph', 'bind' => ['text' => 'entry.slug']],
        ]], 'play' => true];
        $response = $this->actingAs($actor)->postJson('/__preview/'.strtolower($entry->id), $snapshot)->assertOk();
        $response->assertSee('Unsaved title')->assertSee('Preview credit')->assertSee('unsaved-slug');
        $response->assertDontSee('data-cms-node=', false);
        $this->assertSame($version, $this->cms()->entries()->find($entry->id)->version());
        $this->assertSame($actor->id, $this->cms()->entries()->find($entry->id)->authorId);

        $snapshot['authorId'] = null;
        $this->postJson('/__preview/'.strtolower($entry->id), $snapshot)->assertOk()->assertDontSee('Preview credit');
        $snapshot['authorId'] = 'nonexistent';
        $this->postJson('/__preview/'.strtolower($entry->id), $snapshot)->assertStatus(422);
    }

    public function test_an_update_rebuilds_the_static_site(): void
    {
        $this->cms()->entryService()->create('pages', ['title' => 'About', 'slug' => 'about', 'status' => 'published', 'data' => ['content' => []]]);
        $builder = app(\Cms\Modules\Site\Build\SiteBuilder::class);
        $builder->buildAll();

        $this->assertFalse($builder->hasWork());

        // A new runtime (or CMS, or plugin version): every built page names files that are gone.
        $this->cms()->hooks()->addFilter('site.build.signature', fn (array $parts) => [...$parts, 'runtime/cms-new.js']);

        $this->assertTrue($builder->hasWork());
        $this->assertSame(\Cms\Support\Brand::get().' or a plugin was updated', $builder->status()['message']);

        while ($builder->hasWork()) {
            $builder->process(10_000);
        }

        $this->assertFalse($builder->hasWork());
    }
}

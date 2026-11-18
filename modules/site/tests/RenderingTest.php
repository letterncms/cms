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
        $this->assertMatchesRegularExpression('#<link rel="stylesheet" href="/_cms/site/styles-\w+\.css">#', $html);
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

    public function test_a_component_is_drawn_alone_with_the_sites_styling_for_its_picture(): void
    {
        $system = \Cms\Abilities\AbilityContext::system('test');
        $saved = $this->cms()->abilities()->execute('components/save', ['handle' => 'hero', 'title' => 'Hero', 'synced' => false, 'category' => 'Heroes', 'publish' => false, 'blocks' => "## A hero’s title\n\nIts words."], $system);
        $this->cms()->abilities()->execute('components/save', ['handle' => 'card', 'title' => 'Card', 'props' => [['handle' => 'title', 'type' => 'text', 'default' => 'A default title']], 'blocks' => [['type' => 'heading', 'bind' => ['text' => 'props.title']]]], $system);

        $html = (string) $this->actingAs($this->admin())->get('/__component/hero')->assertOk()->assertHeader('Cache-Control', 'no-store, private')->getContent();
        $this->assertMatchesRegularExpression('#<link rel="stylesheet" href="/_cms/site/styles-\w+\.css">#', $html, 'with the site’s stylesheet');
        $this->assertStringContainsString('A hero’s title</h2>', $html, 'a draft too: it is drawn to be chosen');
        $this->assertStringNotContainsString('data-cms-node', $html, 'a picture, not the canvas');
        $this->assertStringContainsString('A default title', (string) $this->get('/__component/card')->assertOk()->getContent(), 'a synced one as a page places it, its properties at their defaults');

        // A property with nothing in it shows what goes there, not a blank card.
        $event = $this->cms()->abilities()->execute('components/save', ['handle' => 'event', 'title' => 'Event', 'props' => [['handle' => 'venue', 'type' => 'text', 'label' => 'Venue'], ['handle' => 'photo', 'type' => 'media', 'label' => 'Photo', 'max' => 1]], 'blocks' => [['type' => 'image', 'bind' => ['image' => 'props.photo']], ['type' => 'paragraph', 'bind' => ['text' => 'props.venue']]]], $system);
        $empty = (string) $this->get('/__component/event')->assertOk()->getContent();
        $this->assertStringContainsString('data-cms-placeholder="Venue"', $empty, 'empty text says which property it is');
        $this->assertStringContainsString('cms-media-placeholder', $empty, 'an empty image is a neutral picture');
        $this->assertStringNotContainsString('data-cms-node', $empty, 'still a picture, not the canvas');
        $card = (string) $this->get('/__preview/'.$event['id'])->assertOk()->getContent();
        $this->assertStringContainsString('data-cms-placeholder="Venue"', $card, 'the same in the list of components');
        $this->assertStringNotContainsString('data-cms-node', $card);
        $played = (string) $this->postJson('/__preview/'.$event['id'], ['play' => true])->assertOk()->getContent();
        $this->assertStringNotContainsString('data-cms-placeholder', $played, 'playing it shows it as the site will');

        // Edited in the canvas alone, with no template around it.
        $canvas = (string) $this->postJson('/__preview/'.$saved['id'])->assertOk()->getContent();
        $this->assertStringContainsString('data-cms-node', $canvas);

        $this->get('/__component/nothing-here')->assertNotFound();
        $this->get('/__pattern/hero')->assertNotFound();
        auth()->logout();
        $this->assertNotSame(200, $this->get('/__component/hero')->getStatusCode(), 'for people who may open the admin');
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

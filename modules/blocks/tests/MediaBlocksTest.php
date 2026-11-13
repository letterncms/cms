<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks\Tests;

use Cms\Modules\Blocks\BlockRegistry;
use Cms\Modules\Blocks\BlockRenderer;
use Cms\Modules\Blocks\Document;
use Cms\Modules\Blocks\MarkdownCodec;
use Cms\Modules\Blocks\MediaBlocks;
use Cms\Modules\Blocks\Scope;
use Cms\Modules\Media\MediaStore;
use Cms\Tests\TestCase;

/** Video, Audio, Gallery, Carousel and File: what each prints, on the site and on the canvas. */
final class MediaBlocksTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks'];
    }

    private function render(array $nodes, bool $editor = false): string
    {
        $renderer = app(BlockRenderer::class);
        $renderer->begin();
        $renderer->editor = $editor;

        try {
            return $renderer->withEditorDocument($editor ? 'test-source' : null, fn () => $renderer->render(app(Document::class)->normalize($nodes), new Scope([])));
        } finally {
            $renderer->editor = false;
        }
    }

    /** @return array<string, bool> */
    private function features(): array
    {
        return app(BlockRenderer::class)->features;
    }

    private function upload(string $name, string $bytes): string
    {
        $file = tempnam(sys_get_temp_dir(), 'cms');
        file_put_contents($file, $bytes);

        return app(MediaStore::class)->store($file, $name)->id;
    }

    private function jpeg(string $name, int $w = 1600, int $h = 1000, array $meta = []): string
    {
        $im = imagecreatetruecolor($w, $h);
        imagefill($im, 0, 0, imagecolorallocate($im, 30, 90, 200));
        ob_start();
        imagejpeg($im, null, 80);
        $id = $this->upload($name, (string) ob_get_clean());
        $meta !== [] && \Cms\Modules\Media\MediaItem::query()->find($id)->forceFill($meta)->save();

        return $id;
    }

    public function test_the_media_blocks_come_in_through_the_api_a_plugin_has(): void
    {
        $registry = app(BlockRegistry::class);
        $features = $registry->features();

        foreach (['audio', 'gallery', 'carousel', 'file'] as $name) {
            $this->assertNotNull($registry->get($name), $name);
            $this->assertContains($name, $registry->get($name)->uses, "{$name} brings its stylesheet");
            $this->assertMatchesRegularExpression('#^/_cms/assets/letterncms-blocks/media/'.$name.'\.css\?v=\w+$#', (string) $features[$name]['style']);
        }

        $this->assertStringEndsWith('.js', strtok((string) $features['lightbox']['script'], '?'));
        $this->assertStringEndsWith('.js', strtok((string) $features['autoplay']['script'], '?'));

        $catalog = array_column($registry->catalog(), null, 'name');
        $this->assertSame('media', $catalog['gallery']['category']);
        $this->assertSame('Photos in a grid that open large.', $catalog['gallery']['description']);
        $this->assertContains('lightbox', $catalog['gallery']['keywords']);
        $this->assertSame(['caption' => 'Caption'], $catalog['audio']['placeholders'], 'the caption is edited on the canvas');
        $this->assertTrue($catalog['carousel']['children']);
        $this->assertSame(['file', 'url', 'caption', 'poster', 'aspect', 'fit', 'autoplay', 'controls', 'loop'], array_column($catalog['video']['fields'], 'handle'));
    }

    public function test_a_feature_needs_a_name_of_its_own_and_files_on_the_site(): void
    {
        $registry = app(BlockRegistry::class);

        foreach ([['motion', null], ['Bad Name', null], ['acme/ok', 'https://cdn.example.com/x.js'], ['acme/ok', '//cdn.example.com/x.js']] as [$name, $script]) {
            try {
                $registry->feature($name, script: $script ?? '/x.js');
                $this->fail("{$name} {$script} was taken");
            } catch (\InvalidArgumentException) {
                $this->addToAssertionCount(1);
            }
        }

        $registry->feature('acme/stars', script: '/_cms/assets/acme-stars/stars.js', style: '/_cms/assets/acme-stars/stars.css');
        $this->assertSame(['script' => '/_cms/assets/acme-stars/stars.js', 'style' => '/_cms/assets/acme-stars/stars.css'], $registry->features()['acme/stars']);
    }

    public function test_a_plugins_feature_reaches_only_the_pages_that_use_it(): void
    {
        $registry = app(BlockRegistry::class);
        $registry->feature('acme/stars', script: '/_cms/assets/acme-stars/stars.js', style: '/_cms/assets/acme-stars/stars.css');
        $registry->feature('acme/plain', style: '/_cms/assets/acme-stars/plain.css');
        $registry->register(['name' => 'acme/stars', 'title' => 'Stars', 'uses' => ['acme/plain'], 'render' => static function (array $d) {
            ! empty($d['block']['shine']) && $d['renderer']->uses('acme/stars');

            return '<div '.$d['attrs'].'>★</div>';
        }]);
        $hooks = $this->cms()->hooks();

        $this->render([['type' => 'paragraph', 'props' => ['text' => 'Nothing']]]);
        $this->assertStringNotContainsString('acme-stars', implode('', $hooks->filter('site.head', [])));
        $this->assertSame([], $hooks->filter('site.foot', []));

        $this->render([['type' => 'acme/stars']]);
        $head = implode('', $hooks->filter('site.head', []));
        $this->assertStringContainsString('<link rel="stylesheet" href="/_cms/assets/acme-stars/plain.css">', $head, 'a block’s own feature comes with it');
        $this->assertStringNotContainsString('stars.css', $head);
        $this->assertSame([], $hooks->filter('site.foot', []), 'a feature with only a stylesheet needs no script');

        $this->render([['type' => 'acme/stars', 'props' => ['shine' => true]], ['type' => 'code', 'props' => ['code' => 'x', 'language' => 'php']]]);
        $this->assertStringContainsString('stars.css', implode('', $hooks->filter('site.head', [])));
        $foot = implode('', $hooks->filter('site.foot', []));
        $this->assertMatchesRegularExpression('#<script type="module" src="[^"]+" data-features="[^"]*\bacme/stars\b[^"]*" data-modules="\{&quot;acme/stars&quot;:&quot;/_cms/assets/acme-stars/stars.js&quot;\}"></script>#', $foot);
        $this->assertStringContainsString('code', $foot, 'beside the runtime’s own');

        // The canvas has every feature's stylesheet, for any block that arrives, and runs no script.
        app(BlockRenderer::class)->editor = true;
        $this->assertStringContainsString('stars.css', implode('', $hooks->filter('site.head', [])));
        $this->assertSame([], $hooks->filter('site.foot', []));
        app(BlockRenderer::class)->editor = false;
    }

    public function test_a_video_plays_a_file_of_the_library_before_its_address(): void
    {
        $id = $this->upload('Harbour.mp4', "\x00\x00\x00\x1cftypisom\x00\x00\x02\x00isomiso2mp41".str_repeat("\0", 64));
        $html = $this->render([['type' => 'video', 'props' => ['file' => [$id], 'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'aspect' => '21/9', 'fit' => 'contain']]]);

        $this->assertMatchesRegularExpression('#<video src="/media/[^"]+harbour[^"]*\.mp4" controls playsinline preload="metadata" style="aspect-ratio:21/9;object-fit:contain"></video>#', $html);
        $this->assertStringNotContainsString('youtube', $html);
        $this->assertArrayNotHasKey('autoplay', $this->features(), 'nothing to run for a video that waits to be played');
    }

    public function test_a_video_saved_before_files_could_be_chosen_shows_as_it_did(): void
    {
        $html = $this->render([['type' => 'video', 'props' => ['url' => 'https://example.com/clip.mp4', 'caption' => 'Spring']]]);
        $this->assertStringContainsString('<video src="https://example.com/clip.mp4" controls playsinline preload="metadata" style="object-fit:cover"></video><figcaption>Spring</figcaption>', $html);

        $html = $this->render([['type' => 'video', 'props' => ['url' => 'https://vimeo.com/76979871']]]);
        $this->assertStringContainsString('<div class="cms-ratio" style="aspect-ratio:16/9"><iframe src="https://player.vimeo.com/video/76979871?dnt=1" title="Video"', $html);
    }

    public function test_an_autoplaying_video_starts_from_the_script_so_less_motion_can_stop_it(): void
    {
        $html = $this->render([['type' => 'video', 'props' => ['url' => '/media/loop.webm', 'autoplay' => true, 'controls' => true]]]);

        $this->assertStringContainsString('<video src="/media/loop.webm" muted loop playsinline data-cms-autoplay preload="metadata"', $html);
        $this->assertDoesNotMatchRegularExpression('/<video[^>]*\sautoplay[\s>]/', $html, 'never the attribute: it would start before anyone asked whether it may');
        $this->assertStringNotContainsString(' controls', $html);
        $this->assertTrue($this->features()['autoplay']);
        $this->assertTrue($this->features()['forever'], 'a page that moves forever needs a Motion Toggle');

        $youtube = $this->render([['type' => 'video', 'props' => ['url' => 'https://youtu.be/dQw4w9WgXcQ', 'autoplay' => true]]]);
        $this->assertStringContainsString('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&amp;mute=1&amp;loop=1&amp;playlist=dQw4w9WgXcQ" data-cms-autoplay="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&amp;mute=1&amp;loop=1&amp;playlist=dQw4w9WgXcQ" data-cms-still="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"', $youtube);

        $canvas = $this->render([['type' => 'video', 'props' => ['url' => '/media/loop.webm', 'autoplay' => true]]], editor: true);
        $this->assertStringNotContainsString('data-cms-autoplay', $canvas, 'the canvas holds still');
    }

    public function test_a_video_from_another_site_is_named_in_the_security_policy(): void
    {
        $sources = [];
        $this->cms()->hooks()->on('site.policy.source', function (string $kind, mixed $url) use (&$sources) {
            $sources[] = [$kind, $url];
        });

        $this->render([['type' => 'video', 'props' => ['url' => 'https://cdn.example.com/loop.mp4']], ['type' => 'audio', 'props' => ['url' => 'https://podcasts.example.com/ep1.mp3']]]);

        $this->assertContains(['media', 'https://cdn.example.com/loop.mp4'], $sources);
        $this->assertContains(['media', 'https://podcasts.example.com/ep1.mp3'], $sources);
    }

    public function test_audio_plays_a_file_or_an_address_under_its_title(): void
    {
        $id = $this->upload('Episode 12.m4a', "\x00\x00\x00\x1cftypM4A \x00\x00\x02\x00M4A isommp42".str_repeat("\0", 64));
        $html = $this->render([['type' => 'audio', 'props' => ['file' => [$id], 'url' => '/other.mp3', 'title' => 'Slow <mornings>', 'caption' => 'Recorded <em>live</em>', 'loop' => true]]]);

        $this->assertMatchesRegularExpression('#^<figure class="cms-audio"><p class="cms-audio__title">Slow &lt;mornings&gt;</p><audio controls preload="metadata" src="/media/[^"]+\.m4a" loop aria-label="Slow &lt;mornings&gt;"></audio><figcaption>Recorded <em>live</em></figcaption></figure>$#', $html);
        $this->assertTrue($this->features()['audio']);

        $this->assertStringContainsString('<audio controls preload="metadata" src="/media/ep.ogg"></audio>', $this->render([['type' => 'audio', 'props' => ['url' => '/media/ep.ogg']]]));

        // Whatever reaches the renderer, also what saving would have refused.
        foreach (['javascript:alert(1)//x.mp3', 'http://insecure.example.com/a.mp3', 'https://example.com/page', '//evil.example.com/a.mp3', '/a.mp3" onload="x'] as $bad) {
            app(BlockRenderer::class)->begin();
            $this->assertSame('', app(BlockRenderer::class)->render([['id' => 'a1', 'type' => 'audio', 'props' => ['url' => $bad]]]), $bad);
        }

        $canvas = $this->render([['type' => 'audio']], editor: true);
        $this->assertMatchesRegularExpression('/data-cms-type="audio"[^>]*data-cms-media><span class="cms-media-placeholder" style="aspect-ratio:8\/1"><svg/', $canvas);
        $this->assertSame('', $this->render([['type' => 'audio']]));
    }

    public function test_a_gallery_is_a_list_of_responsive_pictures_in_columns(): void
    {
        $a = $this->jpeg('Harbour.jpg', meta: ['alt' => 'Boats at dawn', 'caption' => 'The harbour <at> six']);
        $b = $this->jpeg('Dunes.jpg', 1000, 1500);
        $html = $this->render([['type' => 'gallery', 'props' => ['images' => [$a, $b, '/missing-but-given.jpg'], 'columns' => 4, 'aspect' => '1/1']]]);

        $this->assertMatchesRegularExpression('#^<ul class="cms-gallery( s\w+)+" role="list"><li class="cms-gallery__item"><figure><picture>#', $html);
        $this->assertSame(3, substr_count($html, '<li class="cms-gallery__item">'), 'an address is shown as it is');
        $this->assertStringContainsString('alt="Boats at dawn"', $html);
        $this->assertStringContainsString('<figcaption>The harbour &lt;at&gt; six</figcaption>', $html);
        $this->assertStringContainsString('sizes="(min-width: 72rem) 18rem, (min-width: 64rem) 25vw, (min-width: 48rem) 33.33vw, 50vw"', $html);
        $this->assertMatchesRegularExpression('#srcset="/_cms/img/'.$a.'/480-1x1-#', $html, 'cropped to the square');
        $this->assertStringNotContainsString('<a ', $html, 'no lightbox: nothing to click');
        $this->assertStringNotContainsString('data-cms-lightbox', $html);
        $this->assertArrayNotHasKey('lightbox', $this->features(), 'its script only comes with the lightbox');
        $this->assertTrue($this->features()['gallery']);

        $css = '';
        $this->cms()->hooks()->on('render.style', function ($key, $rule) use (&$css) {
            $css .= $rule;
        });
        $this->render([['type' => 'gallery', 'props' => ['images' => [$a], 'columns' => 5]]]);
        $this->assertStringContainsString('grid-template-columns:repeat(5,minmax(0,1fr))', $css);
        $this->assertStringContainsString('grid-template-columns:repeat(3,minmax(0,1fr))', $css, 'three on a tablet');
        $this->assertStringContainsString('grid-template-columns:repeat(2,minmax(0,1fr))', $css, 'two on a phone');

        $plain = $this->render([['type' => 'gallery', 'props' => ['images' => [$a], 'captions' => false]]]);
        $this->assertStringNotContainsString('figcaption', $plain);
    }

    public function test_the_lightbox_is_opt_in_and_works_as_links_without_scripts(): void
    {
        $a = $this->jpeg('Harbour.jpg', 3000, 2000, ['alt' => 'Boats at dawn', 'caption' => 'Six "o" clock']);
        $b = $this->jpeg('Dunes.jpg', 1000, 1500);
        $html = $this->render([['type' => 'gallery', 'props' => ['images' => [$a, $b], 'lightbox' => true, 'aspect' => '1/1']]]);

        $this->assertStringContainsString(' role="list" data-cms-lightbox>', $html);
        // The uncropped picture, as large as the library makes it.
        $this->assertMatchesRegularExpression('#<a href="/_cms/img/'.$a.'/2560-[\w-]+\.webp" data-srcset="/_cms/img/'.$a.'/480-[\w]+\.webp 480w, [^"]*2560w" data-width="3000" data-height="2000" data-caption="Six &quot;o&quot; clock"><picture>#', $html);
        $this->assertStringNotContainsString('data-srcset="/_cms/img/'.$a.'/480-1x1', $html);
        $this->assertStringContainsString('aria-label="Image 2 of 2"', $html, 'a picture without alt text still names its link');
        $this->assertStringContainsString('<template data-cms-lightbox-dialog><dialog class="cms-lightbox" aria-label="Images">', $html);
        $this->assertMatchesRegularExpression('/<button type="button" class="cms-lightbox__button cms-lightbox__close" data-cms-lightbox-close aria-label="Close"><svg/', $html);
        $this->assertStringContainsString('aria-label="Previous Image"', $html);
        $this->assertStringContainsString('aria-label="Next Image"', $html);
        $this->assertTrue($this->features()['lightbox']);

        $foot = implode('', $this->cms()->hooks()->filter('site.foot', []));
        $this->assertMatchesRegularExpression('#data-features="lightbox" data-modules="\{&quot;lightbox&quot;:&quot;/_cms/assets/letterncms-blocks/media/lightbox.js\?v=\w+&quot;\}"#', $foot);
        $this->assertStringContainsString('media/lightbox.css', implode('', $this->cms()->hooks()->filter('site.head', [])));

        $canvas = $this->render([['type' => 'gallery', 'props' => ['images' => [$a], 'lightbox' => true]]], editor: true);
        $this->assertStringNotContainsString('<template', $canvas);
        $this->assertArrayNotHasKey('lightbox', $this->features());
    }

    public function test_an_empty_gallery_shows_where_its_pictures_go_on_the_canvas_only(): void
    {
        $this->assertSame('', $this->render([['type' => 'gallery']]));
        $this->assertMatchesRegularExpression('/<div [^>]*data-cms-type="gallery"[^>]*data-cms-media><span class="cms-media-placeholder" style="aspect-ratio:3\/1"><svg/', $this->render([['type' => 'gallery']], editor: true));
    }

    public function test_a_carousel_is_a_row_of_slides_on_the_carousel_behaviour(): void
    {
        $slides = [
            ['type' => 'quote', 'props' => ['text' => 'Lovely']],
            ['type' => 'quote', 'props' => ['text' => 'Again']],
            ['type' => 'paragraph', 'props' => ['text' => '']],
            ['type' => 'quote', 'props' => ['text' => 'Hidden'], 'hidden' => true],
        ];
        $html = $this->render([['type' => 'carousel', 'props' => ['per_view' => '3', 'gap' => 'token:space.6', 'label' => 'What <people> say'], 'children' => $slides]]);

        $this->assertMatchesRegularExpression('#^<section class="cms-carousel" x-cms-carousel="\{\}" aria-roledescription="carousel" aria-label="What &lt;people&gt; say" data-per-view="3"><div class="cms-carousel__track" id="cms-carousel\d+" style="--cms-gap:var\(--space-6\)" tabindex="0">#', $html);
        $this->assertSame(2, substr_count($html, 'class="cms-carousel__slide"'), 'empty and hidden blocks are no slides');
        $this->assertStringContainsString('<div class="cms-carousel__slide" role="group" aria-roledescription="slide" aria-label="2 of 2"><figure class="cms-quote">', $html);
        $this->assertMatchesRegularExpression('#<div class="cms-carousel__nav"><button type="button" class="cms-carousel__button" aria-label="Previous Slide" aria-controls="cms-carousel\d+"><svg[^>]*>.*</svg></button><button type="button" class="cms-carousel__button" aria-label="Next Slide"#', $html);
        $this->assertTrue($this->features()['logic'], 'the behaviour runs on Alpine');
        $this->assertTrue($this->features()['carousel']);

        $linked = $this->render([['type' => 'carousel', 'children' => [['type' => 'button', 'props' => ['label' => 'Go', 'url' => '/go']]]]]);
        $this->assertStringNotContainsString('tabindex', $linked, 'a slide with a link to focus needs no stop of its own');

        $this->assertSame('', $this->render([['type' => 'carousel', 'children' => []]]));
    }

    public function test_on_the_canvas_a_carousels_blocks_are_its_slides(): void
    {
        $canvas = $this->render([['type' => 'carousel', 'children' => [['type' => 'quote', 'props' => ['text' => 'One']]]]], editor: true);

        $this->assertMatchesRegularExpression('#<div class="cms-carousel__track"[^>]*><figure [^>]*data-cms-type="quote"#', $canvas, 'each block can be selected and moved');
        $this->assertStringNotContainsString('x-cms-carousel', $canvas);
        $this->assertStringNotContainsString('cms-carousel__slide', $canvas);
    }

    public function test_a_file_says_what_it_is_before_it_is_downloaded(): void
    {
        $id = $this->upload('menu-spring.pdf', "%PDF-1.4\n".str_repeat('x', 245_000)."\n%%EOF");
        $html = $this->render([['type' => 'file', 'props' => ['file' => [$id]]]]);

        $this->assertMatchesRegularExpression('#^<a class="cms-file" href="/media/[^"]+\.pdf" download="Menu spring\.pdf"><span class="cms-file__icon"><svg[^>]*>.*</svg></span><span class="cms-file__body"><span class="cms-file__name">Menu spring\.pdf</span><span class="cms-file__meta">PDF, 245 KB</span></span><span class="cms-file__download"><svg#', $html);
        $this->assertTrue($this->features()['file']);

        $labelled = $this->render([['type' => 'file', 'props' => ['file' => [$id], 'label' => 'Our <spring> menu']]]);
        $this->assertStringContainsString('<span class="cms-file__name">Our &lt;spring&gt; menu</span>', $labelled);

        $this->assertStringContainsString('<span class="cms-file__name">brochure 2026.zip</span><span class="cms-file__meta">ZIP</span>', $this->render([['type' => 'file', 'props' => ['file' => ['https://cdn.example.com/brochure%202026.zip']]]]));
        $this->assertSame('', $this->render([['type' => 'file']]));
        $this->assertMatchesRegularExpression('/data-cms-type="file"[^>]*data-cms-media>/', $this->render([['type' => 'file']], editor: true));
    }

    public function test_a_files_size_reads_in_the_sites_language(): void
    {
        $this->assertSame('240 KB', MediaBlocks::size(240_123));
        $this->assertSame('1 KB', MediaBlocks::size(12));
        $this->assertSame('1.2 MB', MediaBlocks::size(1_234_567));
        $this->assertSame('48 MB', MediaBlocks::size(48_000_000));
        $this->assertSame('2.5 GB', MediaBlocks::size(2_500_000_000));

        app()->setLocale('de');
        app(\Cms\Admin\Translations::class)->apply('de');
        $this->assertSame('1,2 MB', MediaBlocks::size(1_234_567));
        app(\Cms\Admin\Translations::class)->apply('fr');
        app()->setLocale('fr');
        $this->assertSame('1,2 Mo', str_replace("\u{202F}", ' ', MediaBlocks::size(1_234_567)));
    }

    public function test_block_markdown_keeps_each_media_block(): void
    {
        $codec = app(MarkdownCodec::class);
        $nodes = app(Document::class)->normalize([
            ['type' => 'audio', 'props' => ['url' => '/media/ep.mp3', 'title' => 'Episode 1']],
            ['type' => 'gallery', 'props' => ['images' => ['/media/a.jpg', '/media/b.jpg'], 'columns' => 2, 'lightbox' => true]],
            ['type' => 'carousel', 'props' => ['per_view' => '2'], 'children' => [['type' => 'image', 'props' => ['image' => ['/media/a.jpg']]]]],
            ['type' => 'file', 'props' => ['file' => ['/media/menu.pdf']]],
            ['type' => 'video', 'props' => ['file' => ['/media/loop.mp4'], 'autoplay' => true, 'fit' => 'cover']],
        ]);

        $back = app(Document::class)->normalize($codec->decode($codec->encode($nodes)));

        $this->assertSame(array_column($nodes, 'props'), array_column($back, 'props'));
        $this->assertSame('image', $back[2]['children'][0]['type']);
    }
}

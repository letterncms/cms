<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Modules\Site\Build\SiteBuilder;
use Cms\Modules\Site\Design\Code;
use Cms\Modules\Site\Rendering\Renderer;
use Cms\Support\Files;
use Cms\Tests\TestCase;

/** Scripts and styles beside the design: content/design/scripts, content/design/styles and code.json. */
final class DesignCodeTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    protected function collections(): array
    {
        return ['pages' => ['title' => 'Pages', 'route' => '/{slug}', 'body' => 'content', 'fields' => [['handle' => 'content', 'type' => 'blocks']]]];
    }

    private function file(string $path, string $contents): void
    {
        Files::put(content_path('design/'.$path), $contents);
        $this->app->make(Code::class)->flush();
    }

    private function page(string $title, array $blocks, array $data = []): string
    {
        $entry = $this->cms()->entryService()->create('pages', ['title' => $title, 'status' => 'published', 'data' => ['content' => $blocks] + $data]);

        return $this->app->make(Renderer::class)->entry($this->cms()->entries()->find($entry->id))['html'];
    }

    public function test_a_page_without_any_of_it_is_what_it_was(): void
    {
        $html = $this->page('Plain', [['type' => 'paragraph', 'props' => ['text' => 'Hello']]]);

        $this->assertStringNotContainsString('importmap', $html);
        $this->assertStringNotContainsString('<script type="module"', $html);
        $this->assertStringNotContainsString('/_cms/site/styles/', $html);
    }

    public function test_scripts_and_styles_load_on_every_page_with_a_template_a_component_or_a_block(): void
    {
        $this->file('scripts/smooth.js', "import { ease } from './lib/ease.js'\nease()\n");
        $this->file('scripts/lib/ease.js', "export const ease = () => 1\n");
        $this->file('scripts/article.js', "console.log('article')\n");
        $this->file('scripts/nav.js', "console.log('nav')\n");
        $this->file('scripts/hero.js', "console.log('hero')\n");
        $this->file('styles/base.css', "body{margin:0}\n");
        $this->file('styles/article.css', ".a{color:red}\n");
        $this->file('styles/hero.css', ".hero{color:blue}\n");
        $this->file('code.json', (string) json_encode([
            'scripts' => ['smooth'], 'styles' => ['base'],
            'templates' => ['article' => ['scripts' => ['article'], 'styles' => ['article']]],
            'components' => ['nav' => ['scripts' => ['nav']]],
        ]));
        $this->cms()->entryService()->create('templates', ['title' => 'Article', 'slug' => 'article', 'status' => 'published', 'data' => ['blocks' => [['type' => 'outlet']]]]);
        $this->cms()->entryService()->create('components', ['title' => 'Nav', 'slug' => 'nav', 'status' => 'published', 'data' => ['synced' => true, 'blocks' => [['type' => 'paragraph', 'props' => ['text' => 'Menu']]]]]);
        $this->app->make(\Cms\Modules\Blocks\Templates::class)->flush();
        $this->app->make(\Cms\Modules\Blocks\Components::class)->flush();

        $plain = $this->page('Plain', [['type' => 'paragraph', 'props' => ['text' => 'Hello']]]);
        $this->assertMatchesRegularExpression('#<link rel="stylesheet" href="/_cms/site/styles/base-[0-9a-f]{10}\.css">#', $plain);
        $this->assertMatchesRegularExpression('#<script type="module" src="/_cms/site/scripts/smooth-[0-9a-f]{10}\.js"></script>#', $plain);
        $this->assertStringNotContainsString('src="/_cms/site/scripts/article-', $plain);
        $this->assertStringNotContainsString('/_cms/site/styles/article-', $plain);

        $html = $this->page('Story', [
            ['type' => 'component', 'props' => ['ref' => 'nav']],
            ['type' => 'box', 'code' => ['scripts' => ['hero', '../../etc/passwd', 'smooth'], 'styles' => ['hero']], 'children' => []],
        ], ['template' => 'article']);

        preg_match_all('#/_cms/site/styles/([a-z]+)-#', $html, $styles);
        $this->assertSame(['base', 'article', 'hero'], $styles[1], 'the site’s, the template’s, then the block’s');
        preg_match_all('#<script type="module" src="/_cms/site/scripts/([a-z]+)-#', $html, $scripts);
        $this->assertSame(['smooth', 'article', 'nav', 'hero'], $scripts[1], 'each once, a name that is no name dropped');

        // One script reaches another by its path: the import map sends that to the published file.
        $this->assertSame(1, preg_match('#<script type="importmap">(.+?)</script>#', $html, $m));
        $map = json_decode($m[1], true)['imports'];
        $this->assertMatchesRegularExpression('#^/_cms/site/scripts/lib/ease-[0-9a-f]{10}\.js$#', $map['/_cms/site/scripts/lib/ease.js']);
        $this->assertLessThan(strpos($html, '<script type="module"'), strpos($html, '<script type="importmap">'), 'a map counts from the first module on');
        $this->assertFileExists(public_path(ltrim($map['/_cms/site/scripts/lib/ease.js'], '/')));
        $this->assertSame("export const ease = () => 1\n", file_get_contents(public_path(ltrim($map['/_cms/site/scripts/lib/ease.js'], '/'))));
    }

    public function test_a_block_in_a_markdown_file_keeps_its_code(): void
    {
        $codec = $this->app->make(\Cms\Modules\Blocks\MarkdownCodec::class);
        $nodes = [['id' => 'b1', 'type' => 'paragraph', 'props' => ['text' => 'Hi'], 'code' => ['scripts' => ['hero']]]];

        $this->assertSame(['scripts' => ['hero']], $codec->decode($codec->encode($nodes))[0]['code']);
    }

    public function test_the_canvas_gets_the_styles_and_no_scripts(): void
    {
        $this->file('scripts/hero.js', "console.log('hero')\n");
        $this->file('styles/hero.css', ".hero{color:blue}\n");

        $html = $this->app->make(Renderer::class)->blocks([['id' => 'b1', 'type' => 'box', 'code' => ['scripts' => ['hero'], 'styles' => ['hero']], 'children' => []]]);

        $this->assertStringContainsString('/_cms/site/styles/hero-', $html);
        $this->assertStringNotContainsString('/_cms/site/scripts/', $html);
        $this->assertStringNotContainsString('importmap', $html);
    }

    public function test_custom_js_stays_and_can_import_the_scripts(): void
    {
        $this->file('custom.js', "import './scripts/x.js'\n");
        $this->file('scripts/x.js', "export {}\n");

        $html = $this->page('Plain', [['type' => 'paragraph', 'props' => ['text' => 'Hello']]]);

        $this->assertMatchesRegularExpression('#<script type="module" src="/_cms/site/custom-\w+\.js"></script>#', $html);
        $this->assertStringContainsString('"/_cms/site/scripts/x.js":"/_cms/site/scripts/x-', $html);
    }

    public function test_an_older_copy_stays_until_a_build_has_finished_and_a_deleted_file_is_unpublished_at_once(): void
    {
        $code = $this->app->make(Code::class);
        $this->file('styles/hero.css', ".hero{color:blue}\n");
        $this->file('styles/hero-video.css', ".v{color:blue}\n");
        $first = $code->url('styles', 'hero');
        $video = $code->url('styles', 'hero-video');

        $this->file('styles/hero.css', ".hero{color:red}\n");
        $second = $code->url('styles', 'hero');

        $this->assertNotSame($first, $second);
        $this->assertFileExists(public_path(ltrim((string) $first, '/')), 'pages not yet rebuilt still name it');
        $this->assertFileExists(public_path(ltrim((string) $second, '/')));
        $this->assertNull($code->url('styles', 'missing'));
        $this->assertNull($code->url('styles', '../tokens'));

        $this->assertSame([], $this->app->make(SiteBuilder::class)->buildAll()['errors']);
        $this->assertFileDoesNotExist(public_path(ltrim((string) $first, '/')), 'gone once the build has drained');
        $this->assertFileExists(public_path(ltrim((string) $second, '/')));
        $this->assertFileExists(public_path(ltrim((string) $video, '/')), 'a file whose name starts the same is another file');

        $this->cms()->abilities()->execute('design-code/delete', ['path' => 'styles/hero.css'], AbilityContext::system('test'));
        $this->assertFileDoesNotExist(public_path(ltrim((string) $second, '/')), 'a deleted file is not left reachable');
        $this->assertFileExists(public_path(ltrim((string) $video, '/')));
    }

    public function test_only_the_pages_that_load_a_changed_file_are_built_again(): void
    {
        $this->file('styles/hero.css', ".hero{color:blue}\n");
        $this->file('scripts/hero.js', "console.log(1)\n");
        $this->cms()->entryService()->create('pages', ['title' => 'With', 'status' => 'published', 'data' => ['content' => [['type' => 'box', 'code' => ['styles' => ['hero'], 'scripts' => ['hero']], 'children' => []]]]]);
        $this->cms()->entryService()->create('pages', ['title' => 'Without', 'status' => 'published', 'data' => ['content' => [['type' => 'paragraph', 'props' => ['text' => 'Hello']]]]]);

        $builder = $this->app->make(SiteBuilder::class);
        $this->assertSame([], $builder->buildAll()['errors']);
        $this->assertFalse($builder->hasWork());
        $manifest = fn () => Files::readJson(storage_path('build/manifest.json'))['pages'];
        $this->assertContains('design:styles/hero', $manifest()['/with']['deps']);
        $this->assertContains('design:scripts/hero', $manifest()['/with']['deps']);
        $this->assertContains('design:importmap', $manifest()['/with']['deps']);
        $this->assertNotContains('design:importmap', $manifest()['/without']['deps']);
        $built = array_map(static fn (array $page) => $page['builtAt'], $manifest());
        $old = (string) file_get_contents(public_path('with/index.html'));

        $this->travel(5)->seconds();
        // On disk, the way an editor or git changes it: nobody tells the CMS.
        file_put_contents(content_path('design/styles/hero.css'), ".hero{color:rebeccapurple}\n");
        clearstatcache();

        $this->assertTrue($builder->hasWork());
        while ($builder->hasWork()) {
            $builder->process(10_000);
        }

        $this->assertNotSame($built['/with'], $manifest()['/with']['builtAt']);
        $this->assertSame($built['/without'], $manifest()['/without']['builtAt']);
        $this->assertNotSame($old, file_get_contents(public_path('with/index.html')));

        // What loads where is on every page.
        $this->travel(5)->seconds();
        file_put_contents(content_path('design/code.json'), '{"styles":["hero"]}');
        clearstatcache();
        $this->assertTrue($builder->hasWork());
        while ($builder->hasWork()) {
            $builder->process(10_000);
        }
        $this->assertStringContainsString('/_cms/site/styles/hero-', (string) file_get_contents(public_path('without/index.html')));
    }

    public function test_a_name_without_a_file_is_a_warning_not_a_broken_page(): void
    {
        $this->cms()->entryService()->create('pages', ['title' => 'Typo', 'status' => 'published', 'data' => ['content' => [['type' => 'box', 'code' => ['styles' => ['heero']], 'children' => []]]]]);

        $status = $this->app->make(SiteBuilder::class)->buildAll();

        $this->assertSame([], $status['errors']);
        $this->assertStringContainsString('styles/heero.css', (string) json_encode($status['warnings'], JSON_UNESCAPED_SLASHES));
    }

    public function test_abilities_write_read_list_and_delete_and_refuse_paths_outside(): void
    {
        $abilities = $this->cms()->abilities();
        $context = AbilityContext::system('test');

        $abilities->execute('design-code/save', ['path' => 'scripts/lib/ease.js', 'contents' => 'export const ease = 1'], $context);
        $abilities->execute('design-code/save', ['path' => 'styles/base.css', 'contents' => 'body{margin:0}'], $context);
        $this->assertSame("export const ease = 1\n", file_get_contents(content_path('design/scripts/lib/ease.js')));
        $this->assertSame("export const ease = 1\n", $abilities->execute('design-code/get', ['path' => 'scripts/lib/ease.js'], $context)['contents']);

        $list = $abilities->execute('design-code/set-load', ['scripts' => ['lib/ease', 'No Such Name'], 'templates' => ['post' => ['styles' => ['base']], '../x' => ['styles' => ['base']]]], $context);
        $this->assertSame(['lib/ease'], $list['scripts']);
        $this->assertSame(['lib/ease'], $list['load']['scripts']);
        $this->assertSame(['post' => ['scripts' => [], 'styles' => ['base']]], $list['load']['templates']);
        $this->assertSame(['scripts' => ['lib/ease'], 'templates' => ['post' => ['styles' => ['base']]]], json_decode((string) file_get_contents(content_path('design/code.json')), true));

        foreach (['scripts/../../config/site.js', '../custom.js', 'scripts/x.php', 'styles/x.js', 'scripts/.hidden.js', 'fonts/a.js', "scripts/a\0.js", 'scripts/A.js'] as $path) {
            try {
                $abilities->execute('design-code/save', ['path' => $path, 'contents' => 'x'], $context);
                $this->fail("{$path} was written");
            } catch (AbilityException $e) {
                $this->assertStringContainsString('scripts/<name>.js', $e->getMessage());
            }
        }

        $abilities->execute('design-code/delete', ['path' => 'scripts/lib/ease.js'], $context);
        $this->assertFileDoesNotExist(content_path('design/scripts/lib/ease.js'));
        $this->assertSame([], $abilities->execute('design-code/list', [], $context)['scripts']);
    }

    public function test_the_guide_for_agents_points_at_the_front_end_and_names_abilities_that_exist(): void
    {
        $guide = $this->app->make(\Cms\Abilities\AgentGuide::class)->text();

        $this->assertStringContainsString('Front end:', $guide);
        preg_match_all('#\b(design(?:-code|-vendor)?/[a-z-]+)\b#', substr($guide, (int) strpos($guide, 'Front end:')), $m);
        $this->assertNotEmpty($m[1]);

        foreach (array_unique($m[1]) as $name) {
            $this->assertTrue($this->cms()->abilities()->has($name), "{$name} is named in the guide");
        }
    }

    public function test_writing_code_needs_the_permission_custom_code_needs(): void
    {
        $this->expectException(AbilityException::class);
        $this->cms()->abilities()->execute('design-code/save', ['path' => 'scripts/x.js', 'contents' => 'x'], AbilityContext::forUser($this->userWithRole('editor')));
    }
}

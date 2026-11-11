<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Contracts\SiteBuilder;
use Cms\Modules\Site\Llms;
use Cms\Tests\TestCase;

/** Every site has an llms.txt: built with the pages, served at /llms.txt, one file whoever adds to it. */
final class LlmsTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    private function entry(string $collection, string $title, array $more = []): array
    {
        return $this->cms()->abilities()->execute('entries/create', ['collection' => $collection, 'title' => $title, 'status' => 'published', ...$more], AbilityContext::system('test'));
    }

    public function test_the_build_writes_a_map_of_the_public_pages(): void
    {
        $this->cms()->settingsRegistry()->save('site', [...$this->cms()->setting('site'), 'description' => 'A boatyard in Ghent.']);
        $this->entry('pages', 'About');
        $this->entry('posts', 'Launch day', ['data' => ['excerpt' => 'We launched.']]);
        $this->entry('pages', 'Draft', ['status' => 'draft']);

        $status = $this->app->make(SiteBuilder::class)->buildAll();
        $this->assertSame([], $status['errors']);

        $text = (string) file_get_contents(public_path('llms.txt'));
        $this->assertStringStartsWith("# Test site\n\n> A boatyard in Ghent.\n\n", $text);
        $this->assertStringContainsString("## Pages\n\n- [About](http://localhost/about)\n", $text);
        $this->assertStringContainsString("## Posts\n\n- [Launch day](http://localhost/blog/launch-day)\n", $text);
        $this->assertStringNotContainsString('Draft', $text);
        // The same without a build, for a site that serves its pages itself.
        $this->assertSame($text, $this->get('/llms.txt')->assertOk()->assertHeader('Content-Type', 'text/plain; charset=utf-8')->getContent());
    }

    public function test_an_llms_txt_the_site_wrote_itself_is_left_as_it_is(): void
    {
        $this->entry('pages', 'About');
        \Cms\Support\Files::put(public_path('llms.txt'), "# Ours, by hand\n");

        $this->app->make(SiteBuilder::class)->buildAll();
        $this->assertSame("# Ours, by hand\n", file_get_contents(public_path('llms.txt')));

        // One the build wrote is the build's: it is written again, and goes if nothing makes it any more.
        unlink(public_path('llms.txt'));
        $this->app->make(SiteBuilder::class)->buildAll();
        $this->assertStringStartsWith('# Test site', (string) file_get_contents(public_path('llms.txt')));
        $this->entry('pages', 'Contact');
        $this->app->make(SiteBuilder::class)->buildAll();
        $this->assertStringContainsString('[Contact]', (string) file_get_contents(public_path('llms.txt')));
    }

    public function test_a_plugin_makes_it_richer_through_the_filter_and_adds_no_second_file(): void
    {
        $this->entry('pages', 'About');
        $this->cms()->hooks()->addFilter('site.llms', static function (array $document) {
            $document['summary'] = 'Said by a plugin.';
            $document['sections']['Pages'][0]['description'] = 'Who we are.';
            $document['sections']['Pages'][0]['url'] .= '.md';
            $document['sections']['Empty'] = [];

            return $document;
        });

        $text = $this->app->make(Llms::class)->render();

        $this->assertSame("# Test site\n\n> Said by a plugin.\n\n## Pages\n\n- [About](http://localhost/about.md): Who we are.\n", $text);
        $this->assertCount(1, array_filter($this->cms()->hooks()->filter('site.build.extras', []), static fn (array $extra) => $extra['path'] === 'llms.txt'));
    }

    public function test_the_item_a_filter_gets_carries_its_entry(): void
    {
        $about = $this->entry('pages', 'About');

        $page = $this->app->make(Llms::class)->document()['sections']['Pages'][0];

        $this->assertSame($about['id'], $page['entry']->id);
        $this->assertSame(['title', 'url', 'description', 'entry'], array_keys($page));
    }
}

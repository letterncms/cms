<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Content\Collections\Archives;
use Cms\Content\Entries\Entry;
use Cms\Content\Entries\ScheduledPublisher;
use Cms\Modules\Site\Build\SiteBuilder;
use Cms\Tests\TestCase;

/** A term has a page per collection that archives its taxonomy: served, built, kept in step and never in a page's way. */
final class TermArchivesTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site', 'letterncms/languages', 'letterncms/seo'];
    }

    protected function collections(): array
    {
        $fields = [['handle' => 'topics', 'type' => 'terms', 'taxonomy' => 'topics'], ['handle' => 'content', 'type' => 'blocks', 'body' => true]];

        return [
            'pages' => ['title' => 'Pages', 'structure' => 'tree', 'route' => '/{parent_uri}/{slug}', 'fields' => [['handle' => 'content', 'type' => 'blocks', 'body' => true]]],
            'topics' => ['title' => 'Topics', 'taxonomy' => true, 'route' => '/topics/{slug}', 'fields' => [['handle' => 'description', 'type' => 'textarea'], ['handle' => 'content', 'type' => 'blocks', 'body' => true]]],
            'posts' => ['title' => 'Posts', 'structure' => 'dated', 'route' => '/blog/{slug}', 'fields' => $fields, 'archives' => ['topics' => ['route' => '/blog/topics/{slug}', 'routes' => ['de' => '/blog/themen/{slug}']]]],
            'memos' => ['title' => 'Memos', 'driver' => 'files', 'route' => '/memos/{slug}', 'fields' => [['handle' => 'topics', 'type' => 'terms', 'taxonomy' => 'topics']], 'archives' => ['topics' => '/memos/topics/{slug}']],
        ];
    }

    private function ability(string $name, array $input = []): mixed
    {
        return $this->cms()->abilities()->execute($name, $input, AbilityContext::system());
    }

    private function make(string $collection, string $title, array $data = [], array $more = []): Entry
    {
        return $this->cms()->entryService()->create($collection, ['title' => $title, 'status' => 'published', 'data' => $data, ...$more]);
    }

    private function build(): SiteBuilder
    {
        $builder = app(SiteBuilder::class);

        while ($builder->hasWork()) {
            $builder->process(10_000);
        }

        $this->assertSame([], $builder->status()['errors']);

        return $builder;
    }

    private function built(string $path): string
    {
        $this->assertFileExists(public_path($path.'/index.html'));

        return (string) file_get_contents(public_path($path.'/index.html'));
    }

    public function test_a_term_has_an_archive_of_each_collection_on_both_drivers(): void
    {
        $tides = $this->make('topics', 'Tides', ['description' => 'The sea, twice a day.']);
        $moon = $this->make('topics', 'Moon');
        $this->make('posts', 'Spring tide', ['topics' => [$tides->id]]);
        $this->make('posts', 'Neap tide', ['topics' => [$tides->id, $moon->id]]);
        $this->make('posts', 'Full moon', ['topics' => [$moon->id]]);
        $this->cms()->entryService()->create('posts', ['title' => 'Unfinished tide', 'data' => ['topics' => [$tides->id]]]);
        $this->make('memos', 'Tide table', ['topics' => [$tides->id]]);
        // A post that links to the term in its text names it, but is not filed under it.
        $this->make('posts', 'Linked tide', ['topics' => [$moon->id], 'content' => [['type' => 'paragraph', 'props' => ['text' => 'See <a href="entry:'.$tides->id.'">the tides</a>.']]]]);

        $posts = $this->get('/blog/topics/tides')->assertOk()->getContent();
        $this->assertStringContainsString('Spring tide', $posts);
        $this->assertStringContainsString('Neap tide', $posts);
        $this->assertStringContainsString('href="/blog/spring-tide"', $posts);

        foreach (['Full moon', 'Unfinished tide', 'Tide table', 'Linked tide'] as $absent) {
            $this->assertStringNotContainsString($absent, $posts, $absent);
        }

        $this->assertStringContainsString('<link rel="canonical" href="'.$this->cms()->url('/blog/topics/tides').'">', $posts);
        $this->assertStringContainsString('Tide table', $this->get('/memos/topics/tides')->assertOk()->getContent());
        $this->assertStringNotContainsString('Spring tide', $this->get('/memos/topics/tides')->getContent());
        $this->assertStringContainsString('Full moon', $this->get('/blog/topics/moon')->assertOk()->getContent());

        // No such term, a term that is a draft, a collection without archives.
        $this->make('topics', 'Draft topic', [], ['status' => 'draft']);
        $this->get('/blog/topics/nowhere')->assertNotFound();
        $this->get('/blog/topics/draft-topic')->assertNotFound();
        $this->get('/pages/topics/tides')->assertNotFound();

        // Agents see where a term's archives are.
        $listed = array_column($this->ability('terms/list', ['taxonomy' => 'topics'])['items'], 'archives', 'title');
        $this->assertEqualsCanonicalizing([['collection' => 'posts', 'uri' => '/blog/topics/tides'], ['collection' => 'memos', 'uri' => '/memos/topics/tides']], $listed['Tides']);
    }

    public function test_the_site_designs_the_archive_and_long_ones_have_pages(): void
    {
        $tides = $this->make('topics', 'Tides', ['description' => 'The sea, twice a day.']);

        foreach (range(1, 12) as $n) {
            $this->make('posts', sprintf('Tide %02d', $n), ['topics' => [$tides->id]]);
        }

        // The plain list: ten to a page, and the way to the next.
        $first = $this->get('/blog/topics/tides')->assertOk()->getContent();
        $this->assertSame(10, substr_count($first, 'href="/blog/tide-'));
        $this->assertStringContainsString('href="/blog/topics/tides/page/2"', $first);
        $second = $this->get('/blog/topics/tides/page/2')->assertOk()->getContent();
        $this->assertSame(2, substr_count($second, 'href="/blog/tide-'));
        $this->assertStringContainsString('href="/blog/topics/tides"', $second);
        $this->get('/blog/topics/tides/page/3')->assertNotFound();

        // A template of the site's own: the term's fields, the collection, and the list as it wants it.
        $this->make('templates', 'Post archive', ['blocks' => [
            ['type' => 'heading', 'props' => ['level' => '1'], 'bind' => ['text' => 'entry.title']],
            ['type' => 'paragraph', 'bind' => ['text' => 'entry.description']],
            ['type' => 'paragraph', 'bind' => ['text' => 'archive.title']],
            ['type' => 'repeat', 'props' => ['source' => 'archive', 'sort' => 'title', 'limit' => 5, 'paginate' => true], 'children' => [['type' => 'paragraph', 'bind' => ['text' => 'item.title']]]],
            ['type' => 'paragraph', 'bind' => ['text' => 'pagination.total']],
        ]], ['slug' => 'posts_archive']);
        $this->app->make(\Cms\Modules\Blocks\Templates::class)->flush();

        $designed = $this->get('/blog/topics/tides')->assertOk()->getContent();
        $this->assertStringContainsString('The sea, twice a day.', $designed);
        $this->assertStringContainsString('>Posts<', $designed);
        $this->assertStringContainsString('Tide 05', $designed);
        $this->assertStringNotContainsString('Tide 06', $designed);
        $this->assertStringContainsString('Tide 11', $this->get('/blog/topics/tides/page/3')->assertOk()->getContent());

        // The term's own page lists what is filed under it in every collection.
        $this->make('memos', 'Tide table', ['topics' => [$tides->id]]);
        $this->cms()->entryService()->update($tides->id, ['data' => ['content' => [['type' => 'repeat', 'props' => ['source' => 'archive', 'sort' => 'title', 'limit' => 50], 'children' => [['type' => 'paragraph', 'bind' => ['text' => 'item.title']]]]]]], publish: true);
        $own = $this->get('/topics/tides')->assertOk()->getContent();
        $this->assertStringContainsString('Tide table', $own);
        $this->assertStringContainsString('Tide 12', $own);
    }

    public function test_archives_are_built_and_follow_what_changes(): void
    {
        $content = $this->cms()->entryService();
        $tides = $this->make('topics', 'Tides');
        $moon = $this->make('topics', 'Moon');
        $spring = $this->make('posts', 'Spring tide', ['topics' => [$tides->id]]);
        $this->make('memos', 'Tide table', ['topics' => [$tides->id]]);
        app(SiteBuilder::class)->buildAll();
        $this->build();

        $this->assertStringContainsString('Spring tide', $this->built('blog/topics/tides'));
        $this->assertStringContainsString('Tide table', $this->built('memos/topics/tides'));
        $this->built('blog/topics/moon');
        // In the search index and the sitemap.
        $this->assertStringContainsString('"url":"/blog/topics/tides"', (string) file_get_contents(public_path('search.json')));
        $this->assertStringContainsString($this->cms()->url('/memos/topics/tides'), (string) file_get_contents(public_path('sitemap.xml')));

        // Published, the archive has it; re-tagged, it moves; unpublished, it is gone.
        $neap = $this->make('posts', 'Neap tide', ['topics' => [$tides->id]]);
        $this->build();
        $this->assertStringContainsString('Neap tide', $this->built('blog/topics/tides'));

        $content->update($neap->id, ['data' => ['topics' => [$moon->id]]], publish: true);
        $this->build();
        $this->assertStringNotContainsString('Neap tide', $this->built('blog/topics/tides'));
        $this->assertStringContainsString('Neap tide', $this->built('blog/topics/moon'));

        $content->unpublish($neap->id);
        $this->build();
        $this->assertStringNotContainsString('Neap tide', $this->built('blog/topics/moon'));

        // An entry whose time is up leaves the archive when the scheduler has come by.
        $content->publish($spring->id, expiresAt: now()->addDay()->toIso8601String());
        $this->build();
        $this->travel(2)->days();
        $this->cms()->entries()->flush();
        $this->app->make(ScheduledPublisher::class)->run();
        $this->build();
        $this->assertStringNotContainsString('Spring tide', $this->built('blog/topics/tides'));
        $this->travelBack();

        // The site designs the archive: a template made afterwards is on the page that was built without it.
        $moonArchive = $this->make('templates', 'Post archive', ['blocks' => [
            ['type' => 'paragraph', 'props' => ['text' => 'Filed under']],
            ['type' => 'heading', 'props' => ['level' => '1'], 'bind' => ['text' => 'entry.title']],
        ]], ['slug' => 'posts_archive']);
        $this->build();
        $this->assertStringContainsString('Filed under', $this->built('blog/topics/tides'));
        $this->assertStringNotContainsString('Filed under', $this->built('memos/topics/tides'), 'Another collection keeps the list.');
        $this->assertArrayNotHasKey('posts_archive', $this->app->make(\Cms\Modules\Blocks\Templates::class)->options(), 'No page chooses it as its template.');
        // A name that only ends like one is a template like any: pages have no archives, so theirs is a page's to pick.
        $this->make('templates', 'Press archive', ['blocks' => []], ['slug' => 'pages_archive']);
        $this->app->make(\Cms\Modules\Blocks\Templates::class)->flush();
        $this->assertArrayHasKey('pages_archive', $this->app->make(\Cms\Modules\Blocks\Templates::class)->options());
        $content->delete($moonArchive->id);
        $this->build();
        $this->assertStringNotContainsString('Filed under', $this->built('blog/topics/tides'));

        // A renamed term moves its archives; one that is unpublished or deleted takes them with it.
        $content->update($tides->id, ['slug' => 'ebb-and-flow'], publish: true);
        $this->build();
        $this->assertFileDoesNotExist(public_path('blog/topics/tides/index.html'));
        $this->assertFileDoesNotExist(public_path('memos/topics/tides/index.html'));
        $this->assertStringContainsString('Tide table', $this->built('memos/topics/ebb-and-flow'));
        $this->built('blog/topics/ebb-and-flow');

        $content->unpublish($moon->id);
        $this->build();
        $this->assertFileDoesNotExist(public_path('blog/topics/moon/index.html'));

        $content->delete($tides->id);
        $this->build();
        $this->assertFileDoesNotExist(public_path('blog/topics/ebb-and-flow/index.html'));
        $this->assertFileDoesNotExist(public_path('memos/topics/ebb-and-flow/index.html'));
        $this->assertStringNotContainsString('/blog/topics/', (string) file_get_contents(public_path('search.json')));

        // A full build has exactly what there is.
        $content->publish($moon->id);
        app(SiteBuilder::class)->buildAll();
        $this->built('blog/topics/moon');
        $this->assertFileDoesNotExist(public_path('blog/topics/ebb-and-flow/index.html'));
    }

    public function test_with_auto_build_off_a_term_that_leaves_the_site_takes_its_archives_at_once(): void
    {
        $content = $this->cms()->entryService();
        $tides = $this->make('topics', 'Tides');
        $moon = $this->make('topics', 'Moon');
        $reef = $this->make('topics', 'Reef');
        $this->make('posts', 'Spring tide', ['topics' => [$tides->id, $moon->id, $reef->id]]);
        app(SiteBuilder::class)->buildAll();

        foreach (['tides', 'moon', 'reef'] as $slug) {
            $this->built('blog/topics/'.$slug);
        }

        // Nothing is rebuilt until somebody presses Publish Site, but what must not be public goes now.
        $this->cms()->settingsRegistry()->save('site', ['auto_build' => false]);
        $content->unpublish($tides->id);
        $content->delete($moon->id);
        $content->update($reef->id, ['data' => ['gate' => ['mode' => 'locked']]], publish: true);

        foreach (['tides', 'moon', 'reef'] as $slug) {
            $this->assertFileDoesNotExist(public_path('blog/topics/'.$slug.'/index.html'), $slug);
            $this->assertFileDoesNotExist(public_path('memos/topics/'.$slug.'/index.html'), $slug);
        }

        // A renamed term leaves its old address; the new one waits for the next build.
        $sand = $this->make('topics', 'Sand');
        app(SiteBuilder::class)->buildAll();
        $this->built('blog/topics/sand');
        $content->update($sand->id, ['slug' => 'dunes'], publish: true);
        $this->assertFileDoesNotExist(public_path('blog/topics/sand/index.html'));
    }

    public function test_an_archive_and_a_page_never_share_an_address(): void
    {
        $content = $this->cms()->entryService();
        $tides = $this->make('topics', 'Tides');
        $blog = $this->make('pages', 'Blog');
        $topics = $this->make('pages', 'Topics', [], ['parentId' => $blog->id]);
        $conflict = function (callable $run): string {
            try {
                $run();
            } catch (AbilityException $e) {
                $this->assertContains($e->type, ['conflict', 'invalid_input']);

                return $e->getMessage();
            }

            $this->fail('Nothing was refused.');
        };

        // A page at an archive's address, and a term whose archive would be at a page's.
        $this->assertStringContainsString('archive', $conflict(fn () => $this->make('pages', 'Tides', [], ['parentId' => $topics->id])));
        $moon = $this->make('pages', 'Moon', [], ['parentId' => $topics->id]);
        $this->assertSame('/blog/topics/moon', $moon->uri);
        $this->assertStringContainsString('/blog/topics/moon', $conflict(fn () => $this->make('topics', 'Moon')));
        $this->assertStringContainsString('/blog/topics/moon', $conflict(fn () => $content->update($tides->id, ['slug' => 'moon'], publish: true)));
        $this->assertStringContainsString('/blog/topics/moon', $conflict(fn () => $this->ability('entries/create', ['collection' => 'topics', 'title' => 'Moon', 'dryRun' => true])), 'A dry run says so too.');

        // A collection's archives: by a taxonomy, with the term in the address, where nothing else is.
        $posts = $this->collections()['posts'];
        $save = fn (mixed $archives) => fn () => $this->ability('collections/save', ['handle' => 'posts', 'definition' => [...$posts, 'archives' => $archives]]);
        $this->assertStringContainsString('not a taxonomy', $conflict($save(['pages' => '/blog/pages/{slug}'])));
        $this->assertStringContainsString('has the term in it', $conflict($save(['topics' => '/blog/topics'])));
        $this->assertStringContainsString('has the term in it', $conflict($save(['topics' => 'blog/{slug}'])));
        // Not where the CMS answers itself, and nothing a browser reads as something else.
        foreach (['/admin/{slug}', '/API/topics/{slug}', '/media/{slug}', '/_cms/{slug}', '/blog/../{slug}', '/blog/{slug}#top', '/blog/{slug}?x=1'] as $pattern) {
            $this->assertStringContainsString('is not one an archive can have', $conflict($save(['topics' => $pattern])), $pattern);
        }
        $this->assertStringContainsString('is not one an archive can have', $conflict($save(['topics' => ['route' => '/blog/topics/{slug}', 'routes' => ['de' => '/admin/themen/{slug}']]])));
        $this->assertStringContainsString('/topics/tides', $conflict($save(['topics' => '/topics/{slug}'])), 'The term\'s own page is there.');
        $this->assertStringContainsString('another archive', $conflict($save(['topics' => '/memos/topics/{slug}'])));

        $saved = $this->ability('collections/save', ['handle' => 'posts', 'definition' => [...$posts, 'archives' => ['topics' => '/journal/about/{slug}']]]);
        $this->assertSame(['topics' => '/journal/about/{slug}'], $saved['archives']);
        $this->get('/journal/about/tides')->assertOk();
        $this->get('/blog/topics/tides')->assertNotFound();
        $this->assertNull(app(Archives::class)->at('/blog/topics/tides'));
    }

    public function test_each_language_has_its_archives_at_its_own_address(): void
    {
        $content = $this->cms()->entryService();
        $tides = $this->make('topics', 'Tides');
        $gezeiten = $content->copyFrom($tides, ['title' => 'Gezeiten', 'slug' => 'gezeiten', 'data' => [], 'locale' => 'de', 'originId' => $tides->id, 'status' => 'published']);
        $this->make('posts', 'Spring tide', ['topics' => [$tides->id]]);
        $this->make('posts', 'Springflut', ['topics' => [$gezeiten->id]], ['locale' => 'de']);

        $english = $this->get('/blog/topics/tides')->assertOk()->getContent();
        $german = $this->get('/de/blog/themen/gezeiten')->assertOk()->getContent();
        $this->assertStringContainsString('Spring tide', $english);
        $this->assertStringNotContainsString('Springflut', $english);
        $this->assertStringContainsString('Springflut', $german);
        $this->assertStringContainsString('<html lang="de"', $german);
        $this->get('/de/blog/topics/gezeiten')->assertNotFound();

        // Each names the other as its version in that language.
        foreach ([$english, $german] as $html) {
            $this->assertStringContainsString('hreflang="de" href="'.$this->cms()->url('/de/blog/themen/gezeiten').'"', $html);
            $this->assertStringContainsString('hreflang="en" href="'.$this->cms()->url('/blog/topics/tides').'"', $html);
            $this->assertStringContainsString('hreflang="x-default" href="'.$this->cms()->url('/blog/topics/tides').'"', $html);
        }

        app(SiteBuilder::class)->buildAll();
        $this->assertStringContainsString('Springflut', $this->built('de/blog/themen/gezeiten'));
        $sitemaps = implode('', array_map(static fn (string $file) => (string) file_get_contents($file), glob(public_path('sitemap*.xml')) ?: []));
        $this->assertStringContainsString($this->cms()->url('/de/blog/themen/gezeiten'), $sitemaps);
        $this->assertStringContainsString($this->cms()->url('/blog/topics/tides'), $sitemaps);
    }
}

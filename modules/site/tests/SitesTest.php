<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Content\Collections\Collection;
use Cms\Install\Installer;
use Cms\Modules\Blocks\Document;
use Cms\Modules\Site\Build\SiteBuilder;
use Cms\Modules\Site\Sites\SiteApplier;
use Cms\Modules\Site\Sites\SiteExporter;
use Cms\Modules\Site\Sites\Sites;
use Cms\Support\Files;
use Cms\Support\Yaml;
use Cms\Tests\TestCase;
use Cms\Users\User;
use Illuminate\Support\Facades\Artisan;

final class SitesTest extends TestCase
{
    use InstallsMinimalSite;

    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site', 'letterncms/navigation', 'letterncms/languages', 'letterncms/seo'];
    }

    protected function collections(): array
    {
        return [];
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->installMinimalSite();
        $this->sites()->activate(Sites::DEFAULT);
    }

    protected function tearDown(): void
    {
        \Carbon\Carbon::setTestNow();
        \Carbon\CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    private function sites(): Sites
    {
        return $this->app->make(Sites::class);
    }

    private function apply(string $handle, string $mode = 'full', string $clash = 'refuse', ?User $user = null): array
    {
        return $this->app->make(SiteApplier::class)->apply($this->sites()->findOrFail($handle), $mode, $clash, $user ?? $this->admin(), withoutPlugins: true);
    }

    private function ability(string $name, array $input = [], ?User $user = null): mixed
    {
        return $this->cms()->abilities()->execute($name, $input, AbilityContext::forUser($user ?? $this->admin(), 'rest'));
    }

    /** @return array<string, string> every built page, by its path under public/ */
    private function pages(): array
    {
        $this->assertSame([], $this->app->make(SiteBuilder::class)->buildAll()['errors']);
        $out = [];

        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator(public_path(), \FilesystemIterator::SKIP_DOTS)) as $file) {
            $relative = substr($file->getPathname(), strlen(public_path()) + 1);

            if (str_ends_with($relative, '.html') || str_ends_with($relative, '.md') || $relative === 'search.json') {
                $out[$relative] = (string) file_get_contents($file->getPathname());
                // The search index names entries by id, and every entry a site brings has an id of its own.
                $relative === 'search.json' && $out[$relative] = (string) preg_replace(['/"id":"[0-9a-z]{26}"/', '/"generatedAt":"[^"]+"/'], ['"id":"…"', '"generatedAt":"…"'], $out[$relative]);
            }
        }

        ksort($out);

        return $out;
    }

    /** A site in the site's sites/ folder, written file by file. */
    private function site(string $handle, array $files, array $manifest = []): string
    {
        $dir = site_path('sites/'.$handle);
        Files::put($dir.'/site.json', json_encode(['handle' => $handle, 'name' => ucfirst($handle), 'version' => '1.0.0', ...$manifest]));

        foreach ($files as $path => $contents) {
            Files::put($dir.'/'.$path, $contents);
        }

        $this->sites()->flush();

        return $dir;
    }

    public function test_a_new_site_starts_from_minimal_a_working_block_blog(): void
    {
        $admin = $this->admin();
        $this->assertSame('minimal', Installer::site(), 'minimal unless the setup chose another');
        $this->cms()->hooks()->dispatch('cms.installed', $admin);

        $posts = $this->cms()->collections()->findOrFail('posts');
        $this->assertSame('Blog', $posts->title);
        $sidebar = array_column($this->cms()->adminNav()->forUser($admin)['sidebar']['sections'], null, 'id');
        $this->assertSame(['collection.pages', 'collection.posts'], array_slice($sidebar['content']['items'], 0, 2));
        $this->assertSame('blocks', $posts->blueprint()->field('content')->type);
        $entries = $this->cms()->entries()->query()->collection('posts')->get();
        $this->assertCount(3, $entries);

        foreach ($entries as $entry) {
            $this->assertSame($admin->id, $entry->authorId);
            $this->assertSame('published', $entry->status);
            $this->assertNotEmpty(app(Document::class)->text($entry->data['content']));
            $this->assertStringStartsNotWith('01kitminimal', $entry->id, 'every entry gets an id of its own');
        }

        $article = $this->cms()->entries()->query()->collection('templates')->where('slug', 'post')->first();
        $this->assertSame('token:container.prose', collect($article->data['blocks'])->firstWhere('id', 'p-main')['style']['base']['maxWidth']);
        $pages = $this->pages();
        $this->assertStringContainsString('Welcome to your blog', $pages['blog/index.html']);
        $this->assertStringContainsString('same blocks as pages', $pages['blog/hello-world/index.html']);
        $this->assertMatchesRegularExpression('#<section class="cms-section[^"]* spotlight[^"]*"[^>]* data-cms-behavior="/_cms/site/scripts/spotlight-[0-9a-f]{10}\.js"#', $pages['index.html']);
        $this->assertStringNotContainsString('data-cms-behavior', $pages['about/index.html']);

        // The menus name the entries as they are here.
        $menu = Yaml::read(content_path('navigation/main.yaml'));
        $this->assertCount(2, $menu['items']);

        foreach ($menu['items'] as $item) {
            $this->assertNotNull($this->cms()->entries()->find($item['entry']));
        }

        // A site with collections of its own is never given a site.
        $this->cms()->hooks()->dispatch('cms.installed', $admin);
        $this->assertCount(3, $this->cms()->entries()->query()->collection('posts')->get());
    }

    public function test_switching_sites_keeps_what_the_site_was_and_brings_it_back(): void
    {
        $admin = $this->admin();
        $this->cms()->hooks()->dispatch('cms.installed', $admin);
        $this->assertSame('minimal', $this->sites()->active());

        $this->site('studio', [
            'content/collections/pages.yaml' => "title: Pages\nsingular: Page\ndriver: database\nroute: '/{slug}'\nsort: position\nfields:\n  -\n    handle: content\n    type: blocks\n    label: Content\n",
            'content/collections/pages/studio-home.md' => "---\nid: 01studio00000000000000000a\ntitle: Studio Home\nstatus: published\n---\n",
        ]);

        // An edit made in the site the site is.
        $home = $this->cms()->entries()->query()->collection('pages')->where('slug', 'home')->first();
        $this->cms()->entryService()->update($home->id, ['title' => 'Our Home'], $admin, publish: true);
        $this->cms()->entryService()->create('posts', ['title' => 'A Draft I Wrote', 'status' => 'draft'], $admin);

        $result = $this->ability('sites/switch', ['handle' => 'studio']);
        $this->assertTrue($result['switched']);
        $this->assertSame(['handle' => 'minimal', 'name' => 'Minimal'], $result['saved']);
        $this->assertSame('studio', $this->sites()->active());
        $this->assertSame(['Studio Home'], array_map(static fn ($e) => $e->title, $this->cms()->entries()->query()->collection('pages')->get()));
        $this->assertNull($this->cms()->collections()->find('posts'), 'what the other site brought is gone');
        $this->assertFileDoesNotExist(content_path('navigation/main.yaml'));

        // Back: the site as it was left, drafts included, not the site as it came.
        $this->assertSame('studio', $this->ability('sites/switch', ['handle' => 'minimal'])['saved']['handle']);
        $this->assertSame('minimal', $this->sites()->active());
        $this->assertNotNull($this->cms()->entries()->query()->collection('pages')->where('title', 'Our Home')->first());
        $this->assertCount(4, $this->cms()->entries()->query()->collection('posts')->get());

        // Nothing to do when it already is.
        $this->assertFalse($this->ability('sites/switch', ['handle' => 'minimal'])['switched']);

        // Start over: the site as it came, and the copy let go of.
        $this->ability('sites/switch', ['handle' => 'minimal', 'fresh' => true]);
        $this->assertNull($this->cms()->entries()->query()->collection('pages')->where('title', 'Our Home')->first());
        $this->assertCount(3, $this->cms()->entries()->query()->collection('posts')->get());
        $this->assertArrayNotHasKey('minimal', $this->sites()->saved());

        $sites = array_column($this->ability('sites/list')['sites'], null, 'handle');
        $this->assertTrue($sites['minimal']['active']);
        $this->assertTrue($sites['studio']['edited']);
    }

    public function test_a_site_zip_is_imported_and_a_bad_one_refused(): void
    {
        $this->apply('minimal');
        $made = $this->ability('sites/export', ['handle' => 'copy', 'name' => 'Copy', 'zip' => true]);
        $imported = $this->ability('sites/import', ['content' => $made['content'], 'encoding' => 'base64']);
        $this->assertSame('copy', $imported['site']['handle']);
        $this->assertFileExists(site_path('sites/copy/site.json'));

        try {
            $this->ability('sites/import', ['content' => $made['content'], 'encoding' => 'base64']);
            $this->fail('a site of that handle is refused');
        } catch (AbilityException $e) {
            $this->assertSame('conflict', $e->type);
        }

        $this->ability('sites/import', ['content' => $made['content'], 'encoding' => 'base64', 'replace' => true]);

        $zip = tempnam(sys_get_temp_dir(), 'z');
        $archive = new \ZipArchive;
        $archive->open($zip, \ZipArchive::OVERWRITE);
        $archive->addFromString('bad/site.json', json_encode(['handle' => 'bad', 'name' => 'Bad', 'version' => '1.0.0']));
        $archive->addFromString('bad/content/run.php', '<?php');
        $archive->close();

        try {
            $this->ability('sites/import', ['content' => base64_encode((string) file_get_contents($zip)), 'encoding' => 'base64']);
            $this->fail('a site with a file a server would run is refused');
        } catch (AbilityException $e) {
            $this->assertSame('invalid_input', $e->type);
        }

        $this->assertDirectoryDoesNotExist(site_path('sites/bad'));
        @unlink($zip);
    }

    public function test_an_export_takes_a_thumbnail_and_the_sites_description_when_none_is_given(): void
    {
        $this->apply('minimal');
        $this->cms()->settingsRegistry()->save('site', ['description' => 'Our studio in Ghent']);
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
        $made = $this->ability('sites/export', ['handle' => 'shown', 'name' => 'Shown', 'preview' => base64_encode($png), 'previewType' => 'png']);
        $this->assertSame('Our studio in Ghent', $made['site']['description']);
        $this->assertCount(1, $made['site']['previews']);
        $this->assertFileExists(site_path('sites/shown/previews/home.png'));

        $own = $this->ability('sites/export', ['handle' => 'own', 'name' => 'Own', 'description' => 'Mine']);
        $this->assertSame('Mine', $own['site']['description']);
    }

    public function test_a_sites_details_can_be_changed_but_not_a_built_in_sites(): void
    {
        $this->cms()->hooks()->dispatch('cms.installed', $this->admin());
        $this->site('studio', ['content/collections/pages.yaml' => "title: Pages\nsingular: Page\ndriver: database\nroute: '/{slug}'\nsort: position\nfields:\n  -\n    handle: content\n    type: blocks\n    label: Content\n", 'content/collections/pages/studio-home.md' => "---\nid: 01studio00000000000000000a\ntitle: Studio Home\nstatus: published\n---\n"]);
        $png = base64_encode(base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='));

        $sitePackage = $this->ability('sites/update', ['handle' => 'studio', 'name' => 'Studio Two', 'description' => 'Dark', 'preview' => $png, 'previewType' => 'png'])['site'];
        $this->assertSame(['Studio Two', 'Dark'], [$sitePackage['name'], $sitePackage['description']]);
        $this->assertCount(1, $sitePackage['previews']);
        $this->assertFileExists(site_path('sites/studio/previews/home.png'));

        $sitePackage = $this->ability('sites/update', ['handle' => 'studio', 'description' => '', 'removePreview' => true])['site'];
        $this->assertSame(['Studio Two', '', []], [$sitePackage['name'], $sitePackage['description'], $sitePackage['previews']]);
        $this->assertFileDoesNotExist(site_path('sites/studio/previews/home.png'));

        // What was edited survives the site leaving that site.
        $this->ability('sites/switch', ['handle' => 'studio']);
        $this->ability('sites/update', ['handle' => 'studio', 'description' => 'Edited']);
        $this->ability('sites/switch', ['handle' => 'minimal']);
        $this->assertSame('Edited', $this->sites()->find('studio')->description());
        $this->assertSame('Studio Two', $this->sites()->saved()['studio']->name());
    }

    public function test_a_site_is_deleted_with_its_saved_copy_but_not_the_one_the_site_is(): void
    {
        $this->cms()->hooks()->dispatch('cms.installed', $this->admin());
        $this->site('studio', ['content/collections/pages.yaml' => "title: Pages\nsingular: Page\ndriver: database\nroute: '/{slug}'\nsort: position\nfields:\n  -\n    handle: content\n    type: blocks\n    label: Content\n"]);
        $this->ability('sites/switch', ['handle' => 'studio']);
        $this->ability('sites/switch', ['handle' => 'minimal']);
        $this->assertArrayHasKey('studio', $this->sites()->saved());

        foreach (['minimal', 'nothing'] as $handle) {
            try {
                $this->ability('sites/delete', ['handle' => $handle]);
                $this->fail("{$handle} is not deleted");
            } catch (AbilityException $e) {
                $this->assertContains($e->type, ['conflict', 'not_found']);
            }
        }

        $this->ability('sites/switch', ['handle' => 'studio']);

        try {
            $this->ability('sites/delete', ['handle' => 'studio']);
            $this->fail('the site the site is is not deleted');
        } catch (AbilityException $e) {
            $this->assertSame('conflict', $e->type);
        }

        $this->ability('sites/switch', ['handle' => 'minimal']);
        $this->ability('sites/delete', ['handle' => 'studio']);
        $this->assertNull($this->sites()->find('studio'));
        $this->assertArrayNotHasKey('studio', $this->sites()->saved());
        $this->assertDirectoryDoesNotExist(site_path('sites/studio'));
    }

    public function test_the_site_a_setup_chose_or_none(): void
    {
        $this->assertContains('site', array_keys(Installer::rules()));
        Files::putJson(storage_path('installed.json'), ['version' => '1', 'site' => 'none']);
        $this->assertNull(Installer::site());
        $this->cms()->hooks()->dispatch('cms.installed', $this->admin());
        $this->assertNull($this->cms()->collections()->find('posts'));

        Files::putJson(storage_path('installed.json'), ['version' => '1', 'site' => 'gone-from-the-store']);
        $this->cms()->hooks()->dispatch('cms.installed', $this->admin());
        $this->assertNull($this->cms()->collections()->find('posts'), 'a site that never arrived leaves the site empty');
        $this->assertNull(Installer::site(), 'and no site’s: it is not claimed to be one that is not there');
    }

    public function test_the_site_a_new_site_starts_from_is_deleted_like_any_other_once_the_site_is_another(): void
    {
        $this->cms()->hooks()->dispatch('cms.installed', $this->admin());
        $this->assertSame('minimal', $this->sites()->active());
        $this->site('studio', ['content/collections/pages.yaml' => "title: Pages\nsingular: Page\ndriver: database\nroute: '/{slug}'\nsort: position\nfields:\n  -\n    handle: content\n    type: blocks\n    label: Content\n"]);
        $this->ability('sites/switch', ['handle' => 'studio']);

        $this->ability('sites/delete', ['handle' => 'minimal']);
        $this->assertNull($this->sites()->find('minimal'));
        $this->assertArrayNotHasKey('minimal', $this->sites()->saved());
        $this->assertDirectoryDoesNotExist(site_path('sites/minimal'));

        try {
            $this->ability('sites/delete', ['handle' => 'studio']);
            $this->fail('a site is always a site that is there, or none');
        } catch (AbilityException $e) {
            $this->assertSame('conflict', $e->type);
        }

        if (! \Cms\Install\Installer::installed()) {
            // Its card is on the setup before the store has answered.
            $this->assertSame(1, substr_count((string) $this->get('/install')->getContent(), 'value="minimal"'));
        }
    }

    public function test_export_then_apply_to_an_empty_site_builds_the_same_pages(): void
    {
        // One moment for both sites: what a page says of when it changed is that site's.
        \Carbon\Carbon::setTestNow('2026-11-01 12:00:00');
        \Carbon\CarbonImmutable::setTestNow('2026-11-01 12:00:00');
        $admin = $this->admin();
        $this->apply('minimal');
        $this->cms()->collections()->save(Collection::fromArray('people', ['title' => 'People', 'route' => '/people/{slug}', 'template' => 'page', 'fields' => [
            ['handle' => 'portrait', 'type' => 'media', 'max' => 1],
            ['handle' => 'posts', 'type' => 'entries', 'collections' => ['posts']],
        ]]));
        $im = imagecreatetruecolor(20, 20);
        ob_start();
        imagepng($im);
        $picture = $this->ability('media/import', ['filename' => 'face.png', 'data' => base64_encode((string) ob_get_clean()), 'alt' => 'A face']);
        $unused = $this->ability('media/import', ['filename' => 'notes.txt', 'data' => base64_encode('nobody names this')]);
        $post = $this->cms()->entries()->query()->collection('posts')->where('slug', 'hello-world')->first();
        $this->cms()->entryService()->create('people', ['title' => 'Ines', 'data' => ['portrait' => [$picture['id']], 'posts' => [$post->id]], 'status' => 'published'], $admin);
        $about = $this->cms()->entries()->query()->collection('pages')->where('slug', 'about')->first();
        $this->cms()->entryService()->create('pages', ['title' => 'Über uns', 'slug' => 'ueber-uns', 'locale' => 'de', 'originId' => $about->id, 'status' => 'published', 'data' => ['content' => '::: section {"props":{"width":"prose"}}'."\n# Über uns\n:::"]], $admin);
        // A headline as long as a title may be makes the longest slug there is (180 letters), and its twin one longer still.
        $headline = 'An exceptionally long headline that keeps going well past what any column could reasonably hold, written to see where a list cuts it short, wraps it or pushes the other columns out of the way';
        foreach ([1, 2] as $_) {
            $this->cms()->entryService()->create('posts', ['title' => $headline, 'status' => 'published'], $admin);
        }
        $long = $this->cms()->entries()->query()->collection('posts')->where('title', $headline)->get();
        $long = array_map(static fn ($e) => $e->slug, $long);
        sort($long);
        $this->assertSame(180, strlen($long[0]));
        $this->assertSame($long[0].'-2', $long[1]);
        $this->cms()->saveSite(['description' => 'A calm site']);
        $before = $this->pages();

        $sitePackage = $this->app->make(SiteExporter::class)->export(site_path('sites/round'), ['handle' => 'round', 'name' => 'Round Trip']);
        $folder = $sitePackage['site']->path;
        $json = json_decode((string) file_get_contents($folder.'/site.json'), true);
        $this->assertSame(['en', 'de'], $json['languages']);
        $this->assertSame('Round Trip', $json['name']);
        $this->assertFileExists($folder.'/content/media/'.$picture['id'].'.yaml');
        $this->assertFileDoesNotExist($folder.'/content/media/'.$unused['id'].'.yaml', 'only the media something names');
        $this->assertFileExists($folder.'/content/collections/pages/de/ueber-uns.md');
        $this->assertFileExists($folder.'/content/collections/posts/'.$long[1].'.md', 'a site exports every entry it can make');
        $this->assertSame(['description' => 'A calm site', 'search_index' => true], Yaml::read($folder.'/config/site.yaml'), 'never the name, the address or the rest of config/');
        $everything = implode("\n", array_map('file_get_contents', array_filter(glob($folder.'/{,*/,*/*/,*/*/*/,*/*/*/*/}*', GLOB_BRACE), 'is_file')));
        $this->assertStringNotContainsString($admin->id, $everything, 'nobody’s account travels');
        $this->assertStringNotContainsString($admin->email, $everything);
        $this->assertStringNotContainsString('created_at', $everything);

        // An empty site: nothing of the first one is left but the site.
        foreach ($this->cms()->entries()->query()->ungated()->get() as $entry) {
            $this->cms()->entryService()->delete($entry->id, $admin);
        }

        foreach (['collections', 'globals', 'navigation', 'design', 'media'] as $folderName) {
            Files::deleteDirectory(content_path($folderName));
        }

        Files::deleteDirectory(public_path('media'));
        $this->app->make(\Cms\Modules\Media\MediaManifest::class)->import();
        $this->cms()->saveSite(['description' => null]);
        $this->cms()->collections()->flush();
        $this->cms()->entries()->flush();
        Files::deleteDirectory(public_path());
        Files::ensureDir(public_path());

        $this->sites()->flush();
        $this->apply('round');
        $this->assertSame($before, $this->pages());
        $ines = $this->cms()->entries()->query()->collection('people')->first();
        $this->assertSame([$picture['id']], $ines->data['portrait']);
        $this->assertSame([$this->cms()->entries()->query()->collection('posts')->where('slug', 'hello-world')->first()->id], $ines->data['posts'], 'a relation names the entry as it is here');
        $this->assertNotSame($post->id, $ines->data['posts'][0]);
    }

    public function test_a_dry_run_names_every_clash_and_the_apply_refuses_until_told(): void
    {
        $admin = $this->admin();
        $this->apply('minimal');
        $home = $this->cms()->entries()->query()->collection('pages')->where('slug', 'home')->first();
        $this->cms()->entryService()->update($home->id, ['title' => 'Our Home'], $admin, publish: true);
        Files::put(content_path('design/styles/spotlight.css'), '.spotlight { color: red }');

        $plan = $this->ability('sites/get', ['handle' => 'minimal', 'mode' => 'full']);
        $clashes = array_values(array_filter($plan['plan']['steps'], static fn ($s) => $s['action'] === 'clash'));
        $names = array_map(static fn ($s) => $s['type'].' '.$s['name'], $clashes);
        $this->assertContains('entry pages/home', $names);
        $this->assertContains('style styles/spotlight', $names);
        $this->assertContains('menu main', $names);
        $this->assertNotContains('tokens tokens.json', $names, 'what the site has the same of is left alone, not a clash');
        // Each is named as a person knows it: the site's title, and an entry's collection to say what kind it is.
        $homeStep = array_values(array_filter($clashes, static fn ($s) => $s['name'] === 'pages/home'))[0];
        $this->assertSame(['pages', 'Home'], [$homeStep['collection'], $homeStep['title']]);
        $this->assertSame('Main', array_values(array_filter($clashes, static fn ($s) => $s['name'] === 'main'))[0]['title'] ?? null);

        try {
            $this->ability('sites/apply', ['handle' => 'minimal', 'dryRun' => true]);
            $this->fail('a dry run refuses where the apply would');
        } catch (AbilityException $e) {
            $this->assertSame('conflict', $e->type);
            $this->assertSame($names, $e->details['clashes']);
        }

        try {
            $this->ability('sites/apply', ['handle' => 'minimal']);
            $this->fail('the apply refuses while there is a clash');
        } catch (AbilityException $e) {
            $this->assertSame('conflict', $e->type);
        }

        $this->assertSame('Our Home', $this->cms()->entries()->find($home->id)->title, 'nothing was written');

        $dry = $this->ability('sites/apply', ['handle' => 'minimal', 'clash' => 'rename', 'dryRun' => true]);
        $this->assertSame('full', $dry['checked']);
        $renamed = array_values(array_filter($dry['changes'], static fn ($s) => $s['name'] === 'pages/home'))[0];
        $this->assertSame(['rename', 'home-2'], [$renamed['action'], $renamed['as']]);
        $this->assertSame(3, $this->cms()->entries()->query()->collection('pages')->count(), 'a dry run writes nothing');

        $result = $this->ability('sites/apply', ['handle' => 'minimal', 'clash' => 'rename']);
        $this->assertNull($result['backup']);
        $this->assertNotNull($this->cms()->entries()->query()->collection('pages')->where('slug', 'home-2')->first());
        $this->assertSame('.spotlight { color: red }', file_get_contents(content_path('design/styles/spotlight.css')), 'a file has no second name: the site keeps its own');

        $result = $this->ability('sites/apply', ['handle' => 'minimal', 'clash' => 'replace']);
        $this->assertDirectoryExists($result['backup'].'/content');
        $this->assertSame('Home', $this->cms()->entries()->find($home->id)->title, 'the site’s takes the place of the site’s, under the site’s id');
        $this->assertStringContainsString('spotlight', (string) file_get_contents(content_path('design/styles/spotlight.css')));
        $this->assertStringNotContainsString('red', (string) file_get_contents(content_path('design/styles/spotlight.css')));

        $skipped = $this->ability('sites/apply', ['handle' => 'minimal', 'clash' => 'skip']);
        $this->assertSame([], array_values(array_filter($skipped['steps'], static fn ($s) => ! in_array($s['action'], ['skip', 'merge'], true) && $s['type'] !== 'entry')));
    }

    public function test_design_mode_brings_how_it_looks_and_no_content(): void
    {
        $plan = $this->ability('sites/get', ['handle' => 'minimal', 'mode' => 'design'])['plan']['steps'];
        $types = array_values(array_unique(array_column($plan, 'type')));
        sort($types);
        $this->assertSame(['entry', 'font', 'script', 'style', 'tokens'], $types);
        $this->assertSame([], array_filter($plan, static fn ($s) => $s['type'] === 'entry' && ! str_starts_with($s['name'], 'templates/') && ! str_starts_with($s['name'], 'components/')));

        $this->ability('sites/apply', ['handle' => 'minimal', 'mode' => 'design']);
        $this->assertNull($this->cms()->collections()->find('posts'));
        $this->assertFileExists(content_path('design/tokens.json'));
        $this->assertSame(4, $this->cms()->entries()->query()->collection('templates')->count());
    }

    public function test_a_site_whose_collection_files_under_its_own_taxonomy_in_its_own_languages_applies(): void
    {
        // Notes come before topics by name, and are filed under them; the site speaks Dutch too, the site not yet.
        $this->site('field', [
            'content/collections/notes.yaml' => "title: Notes\ndriver: files\nstructure: dated\nroute: '/notes/{slug}'\nfields:\n  - { handle: topics, type: terms, label: Topics, taxonomy: topics }\n  - { handle: about, type: entries, label: About, collections: [topics], max: 1 }\n",
            'content/collections/topics.yaml' => "title: Topics\ndriver: files\nstructure: tree\nroute: '/topics/{slug}'\ntaxonomy: true\nfields: []\n",
            'content/collections/topics/tides.md' => "---\nid: 01aaaaaaaaaaaaaaaaaaaaaab1\ntitle: Tides\nstatus: published\n---\n",
            'content/collections/topics/nl/getij.md' => "---\nid: 01aaaaaaaaaaaaaaaaaaaaaab2\ntitle: Getij\nstatus: published\norigin: 01aaaaaaaaaaaaaaaaaaaaaab1\n---\n",
            'content/collections/notes/slack.md' => "---\nid: 01aaaaaaaaaaaaaaaaaaaaaab3\ntitle: Slack\nstatus: published\npublished_at: '2025-12-01T09:00:00+00:00'\ntopics: [01aaaaaaaaaaaaaaaaaaaaaab1]\n---\n\nSlack water.\n",
            'content/collections/notes/nl/kentering.md' => "---\nid: 01aaaaaaaaaaaaaaaaaaaaaab4\ntitle: Kentering\nstatus: published\npublished_at: '2025-12-01T09:00:00+00:00'\norigin: 01aaaaaaaaaaaaaaaaaaaaaab3\ntopics: [01aaaaaaaaaaaaaaaaaaaaaab2]\n---\n\nDood tij.\n",
        ], ['languages' => ['en', 'nl']]);
        $this->assertNotContains('nl', $this->cms()->locales());

        $this->apply('field', 'full', 'rename');

        $this->assertContains('nl', $this->cms()->locales());
        $this->assertTrue($this->cms()->collections()->findOrFail('topics')->isTaxonomy());
        $slack = $this->cms()->entries()->query()->collection('notes')->ungated()->where('slug', 'slack')->first();
        $tides = $this->cms()->entries()->query()->collection('topics')->ungated()->where('slug', 'tides')->first();
        $this->assertSame([$tides->id], $slack->data['topics'], 'filed under the topic as the site brought it');
        $this->assertSame('nl', $this->cms()->entries()->query()->collection('notes')->ungated()->where('slug', 'kentering')->first()?->locale);
    }

    /** The site of the test above: notes filed under its own topics, in English and Dutch. */
    private function fieldSite(array $more = []): void
    {
        $this->site('field', [
            'content/collections/notes.yaml' => "title: Notes\ndriver: files\nstructure: dated\nroute: '/notes/{slug}'\nfields:\n  - { handle: topics, type: terms, label: Topics, taxonomy: topics }\n",
            'content/collections/topics.yaml' => "title: Topics\ndriver: files\nstructure: tree\nroute: '/topics/{slug}'\ntaxonomy: true\nfields: []\n",
            'content/collections/topics/tides.md' => "---\nid: 01aaaaaaaaaaaaaaaaaaaaaab1\ntitle: Tides\nstatus: published\n---\n",
            'content/collections/topics/nl/getij.md' => "---\nid: 01aaaaaaaaaaaaaaaaaaaaaab2\ntitle: Getij\nstatus: published\norigin: 01aaaaaaaaaaaaaaaaaaaaaab1\n---\n",
            'content/collections/notes/slack.md' => "---\nid: 01aaaaaaaaaaaaaaaaaaaaaab3\ntitle: Slack\nstatus: published\npublished_at: '2025-12-01T09:00:00+00:00'\ntopics: [01aaaaaaaaaaaaaaaaaaaaaab1]\n---\n\nSlack water.\n",
            ...$more,
        ], ['languages' => ['en', 'nl']]);
    }

    /** A collection of the site's own, with one published entry in it. */
    private function sitePage(string $collection, string $route, string $slug): \Cms\Content\Entries\Entry
    {
        $this->cms()->collections()->find($collection) ?? $this->ability('collections/save', ['handle' => $collection, 'definition' => ['title' => ucfirst($collection), 'driver' => 'files', 'route' => $route, 'fields' => []]]);
        $this->cms()->collections()->flush();

        return $this->cms()->entryService()->create($collection, ['title' => ucfirst($slug), 'slug' => $slug, 'status' => 'published'], $this->admin());
    }

    public function test_a_dry_run_names_the_language_a_site_adds_and_the_site_keeps_its_addresses(): void
    {
        $harbour = $this->sitePage('places', '/places/{slug}', 'harbour');
        $this->fieldSite();

        $dry = $this->ability('sites/apply', ['handle' => 'field', 'dryRun' => true]);
        $this->assertContains(['action' => 'create', 'type' => 'language', 'name' => 'nl'], array_map(static fn ($s) => array_intersect_key($s, array_flip(['action', 'type', 'name'])), $dry['changes']));
        $this->assertNotContains('nl', $this->cms()->locales(), 'a dry run adds no language');

        $this->apply('field');

        // The site's default language has no prefix, multilingual or not: what it had stays where it was.
        $this->assertContains('nl', $this->cms()->locales());
        $this->assertSame('/places/harbour', $this->cms()->entries()->find($harbour->id)->uri);
        $this->assertSame('/nl/topics/getij', $this->cms()->entries()->query()->collection('topics')->ungated()->where('slug', 'getij')->first()?->uri);
    }

    public function test_a_site_that_fails_after_adding_a_language_takes_it_away_again(): void
    {
        $this->fieldSite();
        $site = (string) file_get_contents(site_path('config/site.yaml'));
        $this->cms()->hooks()->on('collection.saved', static fn () => throw new \RuntimeException('The disk is full.'));

        try {
            $this->apply('field');
            $this->fail('the failure reached nobody');
        } catch (\Throwable) {
        }

        $this->assertSame($site, file_get_contents(site_path('config/site.yaml')));
        $this->assertNotContains('nl', $this->cms()->locales());
        $this->assertNull($this->cms()->collections()->find('notes'));
    }

    public function test_a_site_applied_twice_is_left_alone_or_comes_in_beside_itself(): void
    {
        $this->fieldSite();
        $this->apply('field');
        $count = fn (string $collection) => $this->cms()->entries()->query()->collection($collection)->ungated()->count();

        $this->apply('field', 'full', 'skip');
        $this->assertSame([2, 1], [$count('topics'), $count('notes')], 'skip: the site keeps what it has');

        $this->apply('field', 'full', 'rename');
        $this->assertSame([4, 2], [$count('topics'), $count('notes')]);
        $copy = $this->cms()->entries()->query()->collection('notes')->ungated()->where('slug', 'slack-2')->first();
        $tides = $this->cms()->entries()->query()->collection('topics')->ungated()->where('slug', 'tides-2')->first();
        $this->assertSame([$tides->id], $copy->data['topics'], 'the copy is filed under the copy of its topic');
    }

    public function test_a_site_archive_at_an_address_a_site_page_has_is_refused_before_anything_is_written(): void
    {
        $this->sitePage('places', '/topics/{slug}', 'tides');
        $this->site('atlas', [
            'content/collections/notes.yaml' => "title: Notes\ndriver: files\nroute: '/notes/{slug}'\narchives:\n  topics: '/topics/{slug}'\nfields:\n  - { handle: topics, type: terms, label: Topics, taxonomy: topics }\n",
            'content/collections/topics.yaml' => "title: Topics\ndriver: files\ntaxonomy: true\nfields: []\n",
            'content/collections/topics/tides.md' => "---\nid: 01aaaaaaaaaaaaaaaaaaaaaac1\ntitle: Tides\nstatus: published\n---\n",
            'content/collections/notes/slack.md' => "---\nid: 01aaaaaaaaaaaaaaaaaaaaaac2\ntitle: Slack\nstatus: published\ntopics: [01aaaaaaaaaaaaaaaaaaaaaac1]\n---\n",
        ]);

        foreach ([true, false] as $dry) {
            try {
                $this->ability('sites/apply', ['handle' => 'atlas', 'dryRun' => $dry]);
                $this->fail('the archive would take the site’s page’s address');
            } catch (AbilityException $e) {
                $this->assertStringContainsString('archive URL /topics/tides', $e->getMessage());
            }
        }

        $this->assertNull($this->cms()->collections()->find('notes'));
        $this->assertNull($this->cms()->collections()->find('topics'));
        $this->assertFileDoesNotExist(content_path('collections/notes.yaml'));
    }

    public function test_a_collection_the_site_keeps_its_own_of_is_checked_as_the_sites(): void
    {
        // The site has topics of its own, not a taxonomy: skipped, the site's notes can't file under them.
        $this->ability('collections/save', ['handle' => 'topics', 'definition' => ['title' => 'Topics', 'driver' => 'files', 'route' => '/t/{slug}', 'fields' => []]]);
        $this->fieldSite();

        try {
            $this->app->make(SiteApplier::class)->plan($this->sites()->findOrFail('field'), 'full', 'skip');
            $this->fail('the plan checked notes against the site’s topics, which the site doesn’t take');
        } catch (AbilityException $e) {
            $this->assertStringContainsString('“notes”', $e->getMessage());
        }

        $this->assertNull($this->cms()->collections()->find('notes'));
    }

    public function test_dates_ahead_of_the_export_stay_as_far_ahead(): void
    {
        $posts = (string) file_get_contents(__DIR__.'/fixtures/sites/minimal/content/collections/posts.yaml');
        $this->site('dated', [
            'content/collections/posts.yaml' => $posts,
            'content/collections/posts/past.md' => "---\nid: 01aaaaaaaaaaaaaaaaaaaaaaa1\ntitle: Past\nstatus: published\npublished_at: '2025-12-01T09:00:00+00:00'\n---\n\nWritten before.\n",
            'content/collections/posts/soon.md' => "---\nid: 01aaaaaaaaaaaaaaaaaaaaaaa2\ntitle: Soon\nstatus: published\npublished_at: '2026-01-11T00:00:00+00:00'\n---\n\nScheduled.\n",
            'content/collections/posts/over.md' => "---\nid: 01aaaaaaaaaaaaaaaaaaaaaaa3\ntitle: Over\nstatus: published\npublished_at: '2025-11-01T00:00:00+00:00'\nexpires_at: '2025-12-01T00:00:00+00:00'\n---\n\nEnded.\n",
        ], ['exported' => '2026-01-01T00:00:00+00:00']);
        \Carbon\CarbonImmutable::setTestNow('2026-06-01 00:00:00');
        \Carbon\Carbon::setTestNow('2026-06-01 00:00:00');
        $steps = $this->apply('dated')['steps'];
        $find = fn (string $slug) => $this->cms()->entries()->query()->collection('posts')->ungated()->where('slug', $slug)->first();

        $this->assertSame('2025-12-01', $find('past')->publishedAt->format('Y-m-d'), 'what was published then keeps its date');
        $this->assertSame('2026-06-11', $find('soon')->publishedAt->format('Y-m-d'), 'ten days ahead of the export is ten days ahead now');
        $this->assertSame('draft', $find('over')->status);
        $this->assertContains('Its end date has passed: it comes in as a draft.', array_column($steps, 'note'));
    }

    public function test_design_mode_offers_a_template_only_for_collections_the_site_has_and_a_refusal_copies_nothing(): void
    {
        $template = "---\nid: 01aaaaaaaaaaaaaaaaaaaaaab1\ntitle: Survey\nstatus: published\ncollections:\n  - surveys\n  - pages\n---\n\n::: section\n:::\n";
        $this->site('studio', ['content/design/tokens.json' => '{"tokens":{}}', 'content/collections/templates/survey.md' => $template]);
        $this->apply('minimal');
        $this->apply('studio', 'design', 'skip');
        $survey = $this->cms()->entries()->query()->collection('templates')->where('slug', 'survey')->first();
        $this->assertSame(['pages'], $survey->data['collections']);

        $this->site('broken', ['content/design/styles/new.css' => '.x{}', 'content/collections/templates/bad.md' => "---\ntitle: ''\nstatus: published\n---\n"]);

        try {
            $this->apply('broken', 'design');
            $this->fail('an entry the site refuses stops the apply');
        } catch (AbilityException $e) {
            $this->assertStringContainsString('bad.md', $e->getMessage());
        }

        $this->assertFileDoesNotExist(content_path('design/styles/new.css'), 'nothing was copied before the refusal');
    }

    public function test_a_site_that_fails_on_the_way_leaves_the_site_as_it_was(): void
    {
        $png = (function (): string {
            ob_start();
            imagepng(imagecreatetruecolor(4, 4));

            return (string) ob_get_clean();
        })();
        $this->site('broken', [
            'content/design/tokens.json' => '{"tokens":{}}',
            'content/design/styles/site.css' => '.site{}',
            'content/media/01bbbbbbbbbbbbbbbbbbbbbbbb.yaml' => "id: 01bbbbbbbbbbbbbbbbbbbbbbbb\npath: media/site/dot.png\nalt: A dot\n",
            'public/media/site/dot.png' => $png,
            'content/collections/notes.yaml' => "title: Notes\nfields: []\n",
        ]);
        Files::put(content_path('design/styles/mine.css'), '.mine{}');
        $this->cms()->hooks()->on('collection.saved', static fn () => throw new \RuntimeException('The disk is full.'));

        try {
            $this->apply('broken');
            $this->fail('the failure reached nobody');
        } catch (\Throwable $e) {
            // The ability that saves the collection says it failed; what failed is in its trace.
            $this->assertInstanceOf(\RuntimeException::class, $e->getPrevious() ?? $e);
        }

        $this->assertFileDoesNotExist(content_path('design/tokens.json'));
        $this->assertFileDoesNotExist(content_path('design/styles/site.css'));
        $this->assertSame('.mine{}', file_get_contents(content_path('design/styles/mine.css')));
        $this->assertFileDoesNotExist(content_path('media/01bbbbbbbbbbbbbbbbbbbbbbbb.yaml'));
        $this->assertFileDoesNotExist(public_path('media/site/dot.png'));
        $this->assertFileDoesNotExist(content_path('collections/notes.yaml'));
        $this->assertSame(0, \Cms\Modules\Media\MediaItem::query()->count());
    }

    public function test_what_a_site_writes_is_checked_before_anything_is(): void
    {
        $refused = function (string $handle, string $why): void {
            try {
                $this->apply($handle);
                $this->fail("{$handle} was taken in");
            } catch (AbilityException $e) {
                $this->assertStringContainsString($why, $e->getMessage());
            }

            $this->assertFileDoesNotExist(content_path('design/tokens.json'));
        };
        $tokens = ['content/design/tokens.json' => '{"tokens":{}}'];

        $this->site('linking', [...$tokens, 'content/navigation/main.yaml' => "title: Main\nitems:\n  - { url: 'javascript:alert(1)', label: Go }\n"]);
        $refused('linking', 'menu “main”');

        $this->site('setting', [...$tokens, 'config/site.yaml' => "description: [not, a, text]\n"]);
        $refused('setting', 'settings of “site”');

        $this->site('owning', [...$tokens, 'content/collections/templates.yaml' => "title: Mine\nsystem: true\nfields: []\n"]);
        $refused('owning', 'collection “templates”');

        $this->site('reserved', [...$tokens, 'content/collections/notes.yaml' => "title: Notes\nfields:\n  - { handle: slug, type: text }\n"]);
        $refused('reserved', 'slug');
    }

    public function test_a_site_writes_only_what_its_applier_may(): void
    {
        Yaml::write(site_path('config/roles.yaml'), ['roles' => [...$this->cms()->roles()->defaults(), 'designer' => ['label' => 'Designer', 'description' => 'Design.', 'permissions' => ['admin.access', 'settings.manage', 'site.code']]]]);
        $this->cms()->settingsRegistry()->forget('roles');
        $designer = User::query()->create(['name' => 'D', 'email' => 'd@example.com', 'password' => 'secret-pass-1', 'roles' => ['designer']]);

        try {
            $this->ability('sites/apply', ['handle' => 'minimal'], $designer);
            $this->fail('collections came in without collections.manage');
        } catch (AbilityException $e) {
            $this->assertSame('forbidden', $e->type);
            $this->assertStringContainsString('collections.manage', $e->getMessage());
        }

        $this->assertNull($this->cms()->collections()->find('posts'));
    }

    public function test_a_site_the_store_unpacks_is_checked_like_any_site(): void
    {
        $dir = site_path('storage-stage/odd');
        Files::put($dir.'/site.json', json_encode(['handle' => 'odd', 'name' => 'Odd', 'version' => '1.0.0']));
        Files::put($dir.'/content/notes.exe', 'MZ');

        try {
            $this->cms()->hooks()->dispatch('packages.site.staged', $dir, 'odd');
            $this->fail('a file no site carries was kept');
        } catch (AbilityException $e) {
            $this->assertStringContainsString('content/notes.exe', $e->getMessage());
        }
    }

    public function test_a_site_with_scripts_needs_the_permission_to_write_them(): void
    {
        Yaml::write(site_path('config/roles.yaml'), ['roles' => [...$this->cms()->roles()->defaults(), 'designer' => ['label' => 'Designer', 'description' => 'Design.', 'permissions' => ['admin.access', 'settings.manage']]]]);
        $this->cms()->settingsRegistry()->forget('roles');
        $designer = User::query()->create(['name' => 'D', 'email' => 'd@example.com', 'password' => 'secret-pass-1', 'roles' => ['designer']]);
        $this->assertTrue($this->ability('sites/get', ['handle' => 'minimal'], $designer)['code']);

        try {
            $this->ability('sites/apply', ['handle' => 'minimal', 'mode' => 'design', 'dryRun' => true], $designer->fresh());
            $this->fail('scripts come with site.code only');
        } catch (AbilityException $e) {
            $this->assertSame('forbidden', $e->type);
        }
    }

    public function test_a_site_that_is_not_safe_is_refused_before_anything_is_copied(): void
    {
        $tokens = ['content/design/tokens.json' => '{"tokens":{}}'];
        $refused = function (string $handle, string $why) {
            try {
                $this->apply($handle);
                $this->fail("{$handle} was taken in");
            } catch (AbilityException $e) {
                $this->assertStringContainsString($why, $e->getMessage());
            }

            $this->assertFileDoesNotExist(content_path('design/tokens.json'));
        };

        $this->site('runs', [...$tokens, 'public/media/shell.php' => '<?php echo 1;']);
        $refused('runs', 'shell.php');

        $this->site('hidden', [...$tokens, 'content/.env' => 'APP_KEY=x']);
        $refused('hidden', '.env');

        $this->site('stray', [...$tokens, 'storage/database/cms.sqlite' => 'x']);
        // storage/ is not a folder a site has: it is never read, and never copied.
        $this->apply('stray');
        $this->assertFileDoesNotExist(storage_path('database/cms.sqlite.site'));
        Files::deleteDirectory(content_path('design'));

        $dir = $this->site('linked', $tokens);
        symlink('/etc', $dir.'/content/design/fonts');
        $refused('linked', 'is a link');

        $this->site('locked', [...$tokens, 'content/design/vendor/lock.json' => json_encode(['imports' => ['gsap' => ['package' => 'gsap', 'version' => '3.12.5', 'file' => null, 'source' => 'npm', 'path' => 'gsap@3.12.5/index.js', 'files' => ['gsap@3.12.5/index.js' => 'sha384-AAAA']]]]), 'content/design/vendor/gsap@3.12.5/index.js' => 'export default 1']);
        $refused('locked', 'lock.json');

        $this->site('fonty', [...$tokens, 'content/design/fonts/x.woff2' => 'not a font']);
        $refused('fonty', 'woff2');

        $this->site('media', [...$tokens, 'content/media/01aaaaaaaaaaaaaaaaaaaaaaaa.yaml' => "id: 01aaaaaaaaaaaaaaaaaaaaaaaa\npath: media/../../index.php\n"]);
        $refused('media', 'content/media/01aaaaaaaaaaaaaaaaaaaaaaaa.yaml');

        // A site Composer links from a path is a site; only what is inside it may not be a link.
        $elsewhere = $this->site('elsewhere', ['content/design/tokens.json' => '{"tokens":{}}']);
        rename($elsewhere, $elsewhere.'-real');
        symlink($elsewhere.'-real', $elsewhere);
        $this->sites()->flush();
        $this->assertNotNull($this->sites()->find('elsewhere'));

        Files::put(site_path('sites/Bad.Name/site.json'), '{}');
        Files::put(site_path('sites/nope/readme.txt'), 'no site.json');
        $this->sites()->flush();
        $listed = $this->ability('sites/list');
        $this->assertContains('sites/nope', array_column($listed['problems'], 'folder'));
        $this->assertContains('sites/Bad.Name', array_column($listed['problems'], 'folder'), 'a folder that is no site is named, not passed over');
        $this->assertSame('minimal', $listed['sites'][0]['handle'], 'minimal first');
    }

    public function test_the_installer_offers_each_site_once_the_one_here_first(): void
    {
        $this->site('atelier', ['content/design/tokens.json' => '{"tokens":{}}']);
        $item = static fn (string $package, string $type = 'site') => ['package' => $package, 'type' => $type, 'action' => 'install', 'access' => ['allowed' => true], 'title' => ucfirst(explode('/', $package)[1]), 'preview' => null, 'icon' => null];
        $offered = \Cms\Http\Controllers\InstallController::storeSites(
            [$item('letterncms/atelier'), $item('acme/studio'), $item('acme/studio'), $item('letterncms/minimal'), $item('letterncms/forms', 'plugin')],
            array_keys($this->sites()->all()),
        );
        $this->assertSame(['acme-studio'], array_column($offered, 'handle'), 'what this site has is offered as it is here, and a store site once');

        if (! \Cms\Install\Installer::installed()) {
            $page = (string) $this->get('/install')->getContent();
            $this->assertSame(1, substr_count($page, 'value="atelier"'));
            $this->assertSame(1, substr_count($page, 'value="minimal"'));
        }
    }

    public function test_a_site_says_what_it_is_and_what_it_needs(): void
    {
        $this->site('studio', ['content/design/tokens.json' => '{"tokens":{}}'], ['plugins' => ['letterncms/forms'], 'cms' => '>=0.1', 'previews' => ['previews/home.png']]);
        $this->assertArrayHasKey('studio', $this->sites()->problems(), 'a picture site.json names has to be there');
        $this->assertStringContainsString('previews/home.png', $this->sites()->problems()['studio']);

        $im = imagecreatetruecolor(4, 4);
        ob_start();
        imagepng($im);
        Files::put(site_path('sites/studio/previews/home.png'), (string) ob_get_clean());
        $this->sites()->flush();
        $studio = $this->ability('sites/get', ['handle' => 'studio']);
        $this->assertSame(['letterncms/forms'], $studio['missingPlugins']);
        $this->assertSame(['/_cms/sites/studio/home.png'], $studio['previews']);
        $this->get('/_cms/sites/studio/home.png')->assertOk();
        $this->get('/_cms/sites/studio/site.json')->assertNotFound();

        try {
            $this->ability('sites/apply', ['handle' => 'studio']);
            $this->fail('a site that needs a plugin this site lacks says so');
        } catch (AbilityException $e) {
            $this->assertSame(['letterncms/forms'], $e->details['plugins']);
        }

        $this->site('later', [], ['cms' => '>=99.0']);
        $this->assertFalse($this->ability('sites/get', ['handle' => 'later'])['suits']);
    }

    public function test_export_as_an_ability_and_on_the_command_line(): void
    {
        $this->apply('minimal');
        $dry = $this->ability('sites/export', ['handle' => 'mine', 'name' => 'Mine', 'dryRun' => true]);
        $this->assertSame('full', $dry['checked']);
        $this->assertContains('sites/mine/site.json', array_column($dry['changes'], 'path'));
        $this->assertDirectoryDoesNotExist(site_path('sites/mine'));

        $this->cms()->entryService()->create('posts', ['title' => 'Half Written'], $this->admin());
        $made = $this->ability('sites/export', ['handle' => 'mine', 'name' => 'Mine']);
        $this->assertFileDoesNotExist(site_path('sites/mine/content/collections/posts/half-written.md'), 'a draft stays unless asked for');
        $this->ability('sites/export', ['handle' => 'mine', 'name' => 'Mine', 'drafts' => true, 'replace' => true]);
        $this->assertFileExists(site_path('sites/mine/content/collections/posts/half-written.md'));
        $this->assertSame('sites/mine', $made['path']);
        $this->assertSame('site', $made['site']['source']);
        $this->assertContains('mine', array_column($this->ability('sites/list')['sites'], 'handle'));

        // As a zip to download: the site in a folder of its handle, and nothing left on the site.
        $zipped = $this->ability('sites/export', ['handle' => 'takeaway', 'name' => 'Takeaway', 'zip' => true]);
        $this->assertSame(['takeaway.zip', 'application/zip', 'base64'], [$zipped['name'], $zipped['type'], $zipped['encoding']]);
        $file = tempnam(sys_get_temp_dir(), 'site');
        file_put_contents($file, base64_decode($zipped['content']));
        $zip = new \ZipArchive;
        $this->assertTrue($zip->open($file));
        $this->assertSame('Takeaway', json_decode((string) $zip->getFromName('takeaway/site.json'), true)['name']);
        $zip->close();
        unlink($file);
        $this->assertDirectoryDoesNotExist(site_path('sites/takeaway'));
        $this->assertSame([], glob(storage_path('app/site-export-*')) ?: []);

        try {
            $this->ability('sites/export', ['handle' => 'minimal', 'name' => 'Mine']);
            $this->fail('a built-in site is not overwritten');
        } catch (AbilityException $e) {
            $this->assertSame('conflict', $e->type);
        }

        $out = sys_get_temp_dir().'/cms-site-'.bin2hex(random_bytes(4)).'/elsewhere';
        $this->assertSame(0, Artisan::call('site:export', ['folder' => $out, '--name' => 'Elsewhere']));
        $this->assertSame('Elsewhere', json_decode((string) file_get_contents($out.'/site.json'), true)['name']);
        Files::deleteDirectory(dirname($out));

        $this->assertSame(0, Artisan::call('site:apply', ['handle' => 'minimal', '--dry-run' => true, '--clash' => 'skip']));
        $this->assertSame(1, Artisan::call('site:apply', ['handle' => 'minimal', '--json' => true]));
        $this->assertStringContainsString('"type": "conflict"', Artisan::output());
        $this->assertSame(0, Artisan::call('site:list', ['--json' => true]));
        $this->assertStringContainsString('"handle": "mine"', Artisan::output());
    }
}

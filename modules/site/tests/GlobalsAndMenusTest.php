<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Content\Collections\Collection;
use Cms\Content\Entries\Entry;
use Cms\Tests\TestCase;

/** Globals and menus are collections of their own type: their values and links are entries, read by templates. */
final class GlobalsAndMenusTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site', 'letterncms/languages'];
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->cms()->saveSite(['locales' => ['en', 'de', 'fr']]);
    }

    private function run_(string $ability, array $input): mixed
    {
        return $this->cms()->abilities()->execute($ability, $input, AbilityContext::system());
    }

    private function page(string $title, array $extra = []): Entry
    {
        return $this->cms()->entryService()->create('pages', ['title' => $title, 'status' => 'published', ...$extra]);
    }

    private function translation(Entry $source, string $locale, string $title, array $extra = []): Entry
    {
        return $this->cms()->entryService()->copyFrom($source, ['title' => $title, 'data' => $source->data, 'locale' => $locale, 'originId' => $source->id, 'status' => 'published', ...$extra]);
    }

    /** @return list<array{string, string}> each link's words and address, nested ones after their parent */
    private function links(string $menu, ?string $current = null, ?string $locale = null): array
    {
        $flat = static function (array $links) use (&$flat): array {
            return array_merge(...array_map(static fn (array $l) => [[$l['label'], $l['url']], ...$flat($l['children'])], $links)) ?: [];
        };

        return $flat($this->cms()->menus()->resolve($menu, $current, $locale) ?? []);
    }

    public function test_a_global_is_one_entry_whose_fields_templates_read(): void
    {
        $studio = $this->global('studio', [['handle' => 'phone', 'type' => 'text'], ['handle' => 'tagline', 'type' => 'text', 'default' => 'Made slowly']], ['phone' => '+31 20 123']);

        $this->assertSame(['phone' => '+31 20 123', 'tagline' => 'Made slowly'], $this->cms()->globals()->find('studio'));
        $this->assertSame('+31 20 123', cms_global('studio.phone'));
        $this->assertNull($this->cms()->globals()->find('pages'), 'a collection of entries is no global');

        // One entry holds them: a second is refused, a translation is not.
        try {
            $this->run_('entries/create', ['collection' => 'studio', 'title' => 'Studio', 'data' => ['phone' => 'another']]);
            $this->fail('a global took a second entry');
        } catch (AbilityException $e) {
            $this->assertSame('conflict', $e->type);
        }

        $this->translation($studio, 'de', 'Studio', ['data' => ['phone' => '+49 30 456', 'tagline' => 'Langsam gemacht']]);
        $this->assertSame('Langsam gemacht', $this->cms()->globals()->find('studio', 'de')['tagline']);
        $this->assertSame('Made slowly', $this->cms()->globals()->find('studio', 'fr')['tagline'], 'a language without its own reads the original');

        // A change not yet published is not on the site.
        $this->cms()->entryService()->update($studio->id, ['data' => ['phone' => 'draft']]);
        $this->assertSame('+31 20 123', $this->cms()->globals()->find('studio')['phone']);
    }

    public function test_a_page_shows_a_global_and_a_menu_and_is_rebuilt_when_either_changes(): void
    {
        $this->global('studio', [['handle' => 'phone', 'type' => 'text']], ['phone' => '+31 20 123']);
        $this->menu('main', [['Elsewhere', 'https://example.com']]);
        // The frame of every page: what the whole site shares.
        $this->cms()->entryService()->create('templates', ['title' => 'Default', 'slug' => 'default', 'status' => 'published', 'data' => ['blocks' => [
            ['type' => 'paragraph', 'props' => ['text' => '', 'tag' => 'p'], 'bind' => ['text' => 'globals.studio.phone']],
            ['type' => 'repeat', 'props' => ['source' => 'menu', 'menu' => 'main', 'tag' => 'ul'], 'children' => [['type' => 'link', 'bind' => ['label' => 'item.label', 'url' => 'item.url']]]],
            ['type' => 'outlet'],
        ]]]);
        $page = $this->page('Contact', ['slug' => 'contact']);

        $result = $this->app->make(\Cms\Modules\Site\Rendering\Renderer::class)->entry($this->cms()->entries()->find($page->id));

        $this->assertStringContainsString('+31 20 123', $result['html']);
        $this->assertStringContainsString('href="https://example.com"', $result['html']);
        // A change to any of their entries, a translation made later too, rebuilds the page.
        $this->assertContains('collection:studio', array_keys($result['context']->dependencies));
        $this->assertContains('collection:main', array_keys($result['context']->dependencies));
    }

    public function test_a_menu_shows_its_live_links_nested_and_marks_where_the_reader_is(): void
    {
        $work = $this->page('Work', ['slug' => 'work']);
        $chairs = $this->page('Chairs', ['slug' => 'chairs', 'parentId' => $work->id]);
        $draft = $this->cms()->entryService()->create('pages', ['title' => 'Soon', 'slug' => 'soon']);
        $this->menu('main', [
            ['Work', $work->id, [['Chairs', $chairs->id], ['Elsewhere', 'https://example.com']]],
            ['Soon', $draft->id, [['Hidden with it', '/x']]],
            ['Top', '#top'],
        ]);

        $this->assertSame([['Work', '/work'], ['Chairs', '/work/chairs'], ['Elsewhere', 'https://example.com'], ['Top', '#top']], $this->links('main'));

        $menu = $this->cms()->menus()->resolve('main', '/work/chairs');
        $this->assertSame([true, false], [$menu[0]['active'], $menu[0]['current']], 'the page above the one being read is active');
        $this->assertSame([true, true], [$menu[0]['children'][0]['active'], $menu[0]['children'][0]['current']]);
        $this->assertNull($this->cms()->menus()->resolve('pages'), 'a collection of entries is no menu');

        // What a page can't lead to is never kept.
        try {
            $this->run_('entries/create', ['collection' => 'main', 'title' => 'Go', 'data' => ['link' => ['type' => 'url', 'value' => 'javascript:alert(1)']]]);
            $this->fail('a javascript: link was kept');
        } catch (AbilityException $e) {
            $this->assertSame(['data.link.value'], array_keys($e->details));
        }
    }

    public function test_a_link_reads_the_language_of_the_page(): void
    {
        $pricing = $this->page('Pricing', ['slug' => 'pricing']);
        $this->translation($pricing, 'de', 'Preise', ['slug' => 'preise']);
        [$plans, $docs] = $this->menu('main', [['Plans', $pricing->id], ['Docs', 'https://docs.example']]);
        $this->translation($plans, 'de', 'Tarife');
        $this->translation($docs, 'de', 'Doku', ['data' => ['link' => ['type' => 'url', 'value' => 'https://docs.example/de']]]);
        $this->translation($docs, 'fr', 'Documentation');

        $this->assertSame([['Plans', '/pricing'], ['Docs', 'https://docs.example']], $this->links('main', null, 'en'));
        $this->assertSame([['Tarife', '/de/preise'], ['Doku', 'https://docs.example/de']], $this->links('main', null, 'de'));
        $this->assertSame([['Plans', '/pricing'], ['Documentation', 'https://docs.example']], $this->links('main', null, 'fr'));
    }

    public function test_links_nest_only_as_deep_as_the_menu_allows(): void
    {
        [$a, $b] = $this->menu('footer', [['A', '/a', [['B', '/b']]], ['C', '/c']], depth: 2);

        try {
            $this->run_('entries/create', ['collection' => 'footer', 'title' => 'Too deep', 'parentId' => $b->id, 'data' => ['link' => '/d']]);
            $this->fail('a link went a level deeper than the menu allows');
        } catch (AbilityException $e) {
            $this->assertStringContainsString('2 levels', $e->getMessage());
        }

        // A link with one under it can't go under another.
        $c = $this->cms()->entries()->query()->collection('footer')->where('slug', 'c')->first();
        $this->expectException(AbilityException::class);
        $this->cms()->entryService()->move($a->id, $c->id);
    }

    public function test_a_page_that_is_gone_takes_its_links_and_what_was_under_one_moves_up(): void
    {
        $about = $this->page('About', ['slug' => 'about']);
        [$link, $team] = $this->menu('main', [['About', $about->id, [['Team', '/team']]]]);
        $this->translation($link, 'de', 'Über uns');

        $this->cms()->entryService()->delete($about->id);

        $this->assertNull($this->cms()->entries()->find($link->id));
        $this->assertSame(['Team'], array_map(static fn (Entry $e) => $e->title, $this->cms()->entries()->query()->collection('main')->get()), 'its translation went with it');
        $this->assertNull($this->cms()->entries()->find($team->id)->parentId);
    }

    public function test_a_new_link_is_named_after_its_page_and_a_new_page_can_go_in_a_menu_from_its_answer(): void
    {
        $this->menu('main');
        $page = $this->run_('entries/create', ['collection' => 'pages', 'title' => 'Journal', 'slug' => 'journal', 'status' => 'published']);

        $view = $this->cms()->hooks()->filter('workspace.answer', ['children' => [['type' => 'ui/actions', 'props' => ['items' => [['label' => 'Open']]]]]], 'entries/create', $page, [], $this->admin());
        $add = $view['children'][0]['props']['items'][1];
        $this->assertSame(['Add to Menu', 'entries/create', ['main' => 'Main']], [$add['label'], $add['ability'], $add['form']['fields'][0]['options']]);

        $link = $this->run_('entries/create', [...$add['input'], 'collection' => 'main']);
        $this->assertSame('Journal', $link['title'], 'a link to a page given no words says what the page is called');
        $this->assertSame([['Journal', '/journal']], $this->links('main'));

        // The list says where each link goes.
        $listed = $this->run_('entries/list', ['collection' => 'main', 'fields' => ['link']])['items'][0];
        $this->assertSame('/journal', ((array) $listed['values'])['link']);
    }

    public function test_a_global_and_a_menu_are_their_name_and_keep_their_type(): void
    {
        $this->global('studio', [['handle' => 'phone', 'type' => 'text']]);
        $this->menu('main', depth: 2);
        $repository = $this->cms()->collections();

        $this->assertSame(['title', 'icon'], array_column($repository->settingsFields($repository->find('studio')), 'handle'));
        $this->assertSame(['title', 'icon', 'max_depth'], array_column($repository->settingsFields($repository->find('main')), 'handle'));
        $this->assertSame([2, 'menus', 'globals'], [$repository->find('main')->maxDepth(), $repository->find('main')->kind(), $repository->find('studio')->section]);
        $this->assertNull(Collection::fromArray('x', ['type' => 'global', 'route' => '/x'])->route, 'a global has no pages');

        foreach ([
            ['studio', ['type' => 'entries', 'title' => 'Studio', 'fields' => []], 'definition.type'],
            ['pages', ['type' => 'menu', 'title' => 'Pages', 'fields' => [['handle' => 'link', 'type' => 'link']]], 'definition.type'],
            ['footer', ['type' => 'menu', 'title' => 'Footer', 'fields' => []], 'fields'],
        ] as [$handle, $definition, $where]) {
            try {
                $this->run_('collections/save', ['handle' => $handle, 'definition' => $definition]);
                $this->fail("{$handle} was saved as ".$definition['type']);
            } catch (AbilityException $e) {
                $this->assertArrayHasKey($where, $e->details, $handle);
            }
        }
    }
}

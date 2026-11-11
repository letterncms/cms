<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Modules\Blocks\Uses;
use Cms\Tests\TestCase;

/** The lists of templates and components say where each one is used. */
final class UsesTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    private function rows(string $collection): array
    {
        return array_column($this->cms()->abilities()->execute('entries/list', ['collection' => $collection], AbilityContext::forUser($this->admin(), 'admin'))['items'], null, 'slug');
    }

    public function test_a_template_names_the_collections_it_frames_and_the_entries_that_chose_it(): void
    {
        $service = $this->cms()->entryService();
        $service->create('templates', ['title' => 'Landing', 'slug' => 'landing', 'status' => 'published', 'data' => ['content' => [['type' => 'outlet']]]], $this->admin());
        $service->create('templates', ['title' => 'Spare', 'slug' => 'spare', 'data' => ['content' => [['type' => 'outlet']]]], $this->admin());
        $service->create('pages', ['title' => 'Launch', 'data' => ['template' => 'landing']], $this->admin());

        $uses = $this->app->make(Uses::class)->templates();
        $this->assertSame('1 entry', $uses['landing']);
        $this->assertArrayNotHasKey('spare', $uses);
        $this->assertSame('Missing pages', $uses['404']);
        // Every collection with pages is framed by the template it names, or by `default`.
        $named = array_filter(array_map(static fn ($c) => $c->routable() ? ($c->template !== '' ? $c->template : 'default') : null, $this->cms()->collections()->all()));
        foreach (array_unique($named) as $slug) {
            $this->assertArrayHasKey($slug, $uses);
        }

        $rows = $this->rows('templates');
        $this->assertSame('1 entry', $rows['landing']['usedBy']);
        $this->assertArrayNotHasKey('usedBy', $rows['spare']);
    }

    public function test_a_template_chosen_only_in_a_draft_counts(): void
    {
        $service = $this->cms()->entryService();
        $service->create('templates', ['title' => 'Spare', 'slug' => 'spare', 'status' => 'published', 'data' => ['content' => [['type' => 'outlet']]]], $this->admin());
        $page = $service->create('pages', ['title' => 'Live', 'status' => 'published'], $this->admin());
        $this->assertTrue($service->update($page->id, ['data' => ['template' => 'spare']])->hasDraft());

        $this->assertSame('1 entry', $this->app->make(Uses::class)->templates()['spare'] ?? null);
    }

    public function test_a_component_counts_the_entries_that_hold_it(): void
    {
        $service = $this->cms()->entryService();
        $service->create('components', ['title' => 'Callout', 'slug' => 'callout', 'status' => 'published', 'data' => ['content' => [['type' => 'paragraph', 'props' => ['text' => 'Hi']]]]], $this->admin());
        $service->create('components', ['title' => 'Unused', 'slug' => 'unused', 'data' => ['content' => []]], $this->admin());
        $block = ['type' => 'component', 'props' => ['ref' => 'callout']];
        $service->create('pages', ['title' => 'One', 'data' => ['content' => [$block, ['type' => 'box', 'children' => [$block]]]]], $this->admin());
        $service->create('pages', ['title' => 'Two', 'data' => ['content' => [$block]]], $this->admin());

        $rows = $this->rows('components');
        // Held twice on one page, it is still one entry.
        $this->assertSame('2 entries', $rows['callout']['usedBy']);
        $this->assertArrayNotHasKey('usedBy', $rows['unused']);
    }

    public function test_their_lists_show_used_by_and_keep_the_title_to_its_words(): void
    {
        $view = $this->cms()->abilities()->execute('views/get', ['id' => 'content', 'params' => ['collection' => 'templates']], AbilityContext::forUser($this->admin(), 'admin'));
        $columns = array_column($view['root']['children'][0]['props']['columns'], null, 'key');

        $this->assertSame('minmax(200px,420px)', $columns['title']['width']);
        $this->assertSame(['Used By', 'Nothing', false], [$columns['usedBy']['label'], $columns['usedBy']['empty'], $columns['usedBy']['hidden']]);
        $this->assertFalse($columns['updated']['hidden']);

        $pages = $this->cms()->abilities()->execute('views/get', ['id' => 'content', 'params' => ['collection' => 'pages']], AbilityContext::forUser($this->admin(), 'admin'));
        $this->assertArrayNotHasKey('usedBy', array_column($pages['root']['children'][0]['props']['columns'], null, 'key'));
    }
}

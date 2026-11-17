<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Modules\Site\Rendering\Renderer;
use Cms\Tests\TestCase;

/** What lists of entries show: options by their label, dates against today, items under their first letter. */
final class ListingTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    protected function collections(): array
    {
        return [
            'topics' => ['title' => 'Topics', 'route' => '/topics/{slug}', 'template' => 'topic', 'fields' => [
                ['handle' => 'content', 'type' => 'blocks', 'body' => true],
                ['handle' => 'kind', 'type' => 'select', 'options' => ['condition' => 'Condition', 'test' => 'Test or scan']],
                ['handle' => 'tags', 'type' => 'select', 'multiple' => true, 'options' => ['kids' => 'Children', 'adults' => 'Adults']],
            ]],
            'events' => ['title' => 'Events', 'route' => '/events/{slug}', 'template' => 'topic', 'sort' => 'starts', 'fields' => [
                ['handle' => 'content', 'type' => 'blocks', 'body' => true],
                ['handle' => 'starts', 'type' => 'date', 'time' => true],
            ]],
            'list' => ['title' => 'List', 'route' => '/{slug}', 'template' => 'topic', 'fields' => [['handle' => 'content', 'type' => 'blocks', 'body' => true]]],
        ];
    }

    private function template(array $blocks): void
    {
        $this->cms()->entryService()->create('templates', ['title' => 'Topic', 'slug' => 'topic', 'status' => 'published', 'data' => ['blocks' => $blocks]]);
    }

    private function topic(string $title, array $data): string
    {
        return $this->cms()->entryService()->create('topics', ['title' => $title, 'status' => 'published', 'data' => ['content' => [], ...$data]])->id;
    }

    private function page(string $id): string
    {
        return $this->app->make(Renderer::class)->entry($this->cms()->entries()->find($id))['html'];
    }

    public function test_an_option_shows_its_label_and_still_equals_its_value(): void
    {
        $this->template([
            ['type' => 'paragraph', 'props' => ['tag' => 'p'], 'class' => 'data-test:font-bold', 'bind' => ['text' => 'entry.kind', 'state:test' => 'entry.kind|is:test']],
            ['type' => 'paragraph', 'props' => ['tag' => 'span'], 'bind' => ['text' => 'stored {entry.kind.value}', 'visible' => 'entry.kind|is:Test or scan']],
            ['type' => 'paragraph', 'props' => ['tag' => 'em'], 'bind' => ['text' => 'entry.tags', 'visible' => 'entry.tags|is:kids']],
        ]);
        $html = $this->page($this->topic('MRI scan', ['kind' => 'test', 'tags' => ['kids', 'adults']]));

        $this->assertStringContainsString('data-test>Test or scan</p>', $html);
        $this->assertStringContainsString('>stored test</span>', $html, 'the label matches too, and the value is there');
        $this->assertStringContainsString('>Children, Adults</em>', $html, 'a multiple select lists its labels and matches any of its values');

        $plain = $this->page($this->topic('Stroke', []));
        $this->assertStringNotContainsString('data-test', $plain);
        $this->assertStringNotContainsString('stored', $plain, 'no option is no value');
    }

    public function test_a_list_filter_offers_options_by_their_label(): void
    {
        $this->topic('Stroke', ['kind' => 'condition']);
        $this->topic('MRI scan', ['kind' => 'test']);
        $page = $this->cms()->entryService()->create('list', ['title' => 'All', 'status' => 'published', 'data' => ['content' => [['type' => 'list-filter', 'children' => [
            ['type' => 'filter-choice', 'props' => ['facet' => 'kind', 'label' => 'Show']],
            ['type' => 'repeat', 'props' => ['source' => 'entries', 'collection' => 'topics', 'sort' => 'title', 'filter_by' => 'item.kind', 'search_in' => 'item.title, item.kind'], 'children' => [['type' => 'paragraph', 'bind' => ['text' => 'item.title']]]],
        ]]]]]);
        $this->template([['type' => 'outlet']]);
        $html = $this->page($page->id);

        $this->assertStringContainsString('value="test-or-scan"><span>Test or scan</span>', $html);
        $this->assertStringContainsString('value="condition"><span>Condition</span>', $html);
        $this->assertStringContainsString('data-cms-f-kind="test-or-scan" data-cms-q="mri scan test or scan"', $html, 'search finds an item by its option’s label');
    }

    private function listPage(array $repeat, array $children = []): array
    {
        $page = $this->cms()->entryService()->create('list', ['title' => 'All '.uniqid(), 'status' => 'published', 'data' => ['content' => [
            ['type' => 'repeat', 'props' => $repeat, 'children' => $children ?: [['type' => 'paragraph', 'props' => ['tag' => 'p'], 'bind' => ['text' => 'item.title']]]],
        ]]]);

        return $this->app->make(Renderer::class)->entry($this->cms()->entries()->find($page->id));
    }

    public function test_a_list_can_show_what_is_still_to_come_and_is_built_again_the_next_day(): void
    {
        \Carbon\Carbon::setTestNow('2026-11-17 10:00:00');
        $this->template([['type' => 'outlet']]);

        foreach (['Last week' => '2026-11-10T19:00:00+00:00', 'Tonight' => '2026-11-17T19:00:00+00:00', 'Next month' => '2026-12-03T19:00:00+00:00'] as $title => $starts) {
            $this->cms()->entryService()->create('events', ['title' => $title, 'status' => 'published', 'data' => ['content' => [], 'starts' => $starts]]);
        }

        $upcoming = $this->listPage(['source' => 'entries', 'collection' => 'events', 'sort' => 'starts', 'where' => [['field' => 'starts', 'op' => '>=', 'value' => '{site.today}']]]);
        $this->assertStringContainsString('<p class="cms-paragraph">Tonight</p><p class="cms-paragraph">Next month</p>', $upcoming['html']);
        $this->assertStringNotContainsString('Last week', $upcoming['html']);
        $this->assertArrayHasKey('day', $upcoming['context']->dependencies, 'a page that reads today is built again when the day turns');

        $past = $this->listPage(['source' => 'entries', 'collection' => 'events', 'sort' => '-starts', 'where' => [['field' => 'starts', 'op' => '<', 'value' => '{site.today}']]]);
        $this->assertStringContainsString('>Last week</p>', $past['html']);
        $this->assertStringNotContainsString('Tonight', $past['html']);

        $plain = $this->listPage(['source' => 'entries', 'collection' => 'events']);
        $this->assertArrayNotHasKey('day', $plain['context']->dependencies, 'a page that doesn’t read the date is left alone');

        $days = [];
        $this->cms()->hooks()->on('day.started', static function ($now) use (&$days) { $days[] = $now->toDateString(); });
        $publisher = $this->app->make(\Cms\Content\Entries\ScheduledPublisher::class);
        $publisher->run();
        $publisher->run();
        \Carbon\Carbon::setTestNow('2026-11-18 00:01:00');
        $publisher->run();
        $this->assertSame(array_values(array_unique($days)), $days, 'once a day');
        $this->assertContains('2026-11-18', $days);
    }

    public function test_a_list_can_be_filed_from_a_to_z(): void
    {
        $this->template([['type' => 'outlet']]);

        foreach (['Stroke', 'asthma in children', 'Élan', 'Atrial fibrillation', '3D scan', 'Shingles'] as $title) {
            $this->topic($title, []);
        }

        $html = $this->listPage(['source' => 'entries', 'collection' => 'topics', 'sort' => 'title', 'group_by' => 'item.title|initial'], [
            ['type' => 'heading', 'props' => ['level' => '2'], 'bind' => ['text' => 'item.label']],
            ['type' => 'repeat', 'props' => ['source' => 'list', 'path' => 'item.items'], 'children' => [['type' => 'paragraph', 'props' => ['tag' => 'p'], 'bind' => ['text' => 'item.title']]]],
        ])['html'];
        preg_match_all('#<h2[^>]*>([^<]+)</h2>#', $html, $m);

        $this->assertSame(['#', 'A', 'E', 'S'], $m[1], 'a digit is under #, small letters and accents under their capital');
        $this->assertMatchesRegularExpression('#>A</h2>.*>asthma in children</p>.*>Atrial fibrillation</p>.*>E</h2>#s', $html);
    }
}

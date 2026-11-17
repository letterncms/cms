<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks\Tests;

use Cms\Modules\Blocks\BlockRegistry;
use Cms\Modules\Blocks\BlockRenderer;
use Cms\Modules\Blocks\Scope;
use Cms\Tests\TestCase;

/** Search Field and Search Results as the site and the canvas show them; the ⌘K Search block stays as it is. */
final class SearchBlocksTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks'];
    }

    /** @param list<array{0: string, 1: array}> $blocks type and props of each */
    private function render(array $blocks, bool $editor = false): string
    {
        $renderer = app(BlockRenderer::class);
        $renderer->begin();
        $renderer->editor = $editor;
        $nodes = array_map(static fn (array $block, int $i) => ['id' => 'b'.$i, 'type' => $block[0], 'props' => $block[1]], $blocks, array_keys($blocks));

        try {
            return $renderer->withEditorDocument($editor ? 'test-source' : null, fn () => $renderer->render($nodes, new Scope([])));
        } finally {
            $renderer->editor = false;
        }
    }

    private function field(array $props = []): string
    {
        return $this->render([['search-field', $props]]);
    }

    /** @return array<string, mixed> */
    private function config(string $html): array
    {
        preg_match('/data-cms-search-results="([^"]*)"/', $html, $m);

        return json_decode(html_entity_decode($m[1] ?? '', ENT_QUOTES | ENT_HTML5), true) ?? [];
    }

    public function test_the_blocks_sit_beside_the_search_block(): void
    {
        $registry = app(BlockRegistry::class);
        $names = array_keys($registry->all());

        $this->assertSame(['search', 'search-field', 'search-results'], array_values(array_slice($names, array_search('search', $names, true), 3)));
        $this->assertSame('Search Field', $registry->get('search-field')->title);
        $this->assertSame('Search Results', $registry->get('search-results')->title);
        $this->assertSame(['search-results'], $registry->get('search-results')->uses);
        $this->assertContains('search-results', BlockRegistry::RUNTIME, 'a feature of the runtime, not a plugin\'s name');
        $this->assertStringContainsString('aria-haspopup="dialog"', $this->render([['search', []]]), 'the ⌘K Search block as it was');
    }

    public function test_the_field_is_a_search_form_that_works_without_scripts(): void
    {
        $html = $this->field();

        $this->assertMatchesRegularExpression('#^<form class="cms-search-field"[^>]* role="search" aria-labelledby="([\w-]+)-label" method="get" action="/search" data-size="md" data-cms-search-field><label class="cms-label cms-search-field__label" id="\1-label" for="\1"#', $html, 'a landmark, a plain GET to /search');
        $this->assertStringContainsString('<label class="cms-label cms-search-field__label" id="cms-search-field-1-label" for="cms-search-field-1" data-hidden>Search</label>', $html, 'labelled, and hidden by default');
        $this->assertStringContainsString('<input class="cms-input cms-search-field__input" type="search" id="cms-search-field-1" name="q" placeholder="" autocomplete="off" enterkeyhint="search">', $html, 'the site\'s field, sending q');
        $this->assertStringContainsString('<button type="submit" class="cms-button btn-primary cms-search-field__button">Search</button>', $html, 'the site\'s button');
        $this->assertStringEndsWith('</div></form>', $html);
        $this->assertArrayNotHasKey('search-results', app(BlockRenderer::class)->features, 'no script for a form');
    }

    public function test_its_settings_shape_the_field(): void
    {
        $html = $this->field(['label' => 'Search the council', 'show_label' => true, 'placeholder' => 'Bins, parking…', 'button_label' => 'Find', 'button_style' => 'ghost', 'size' => 'lg', 'results_page' => '/find']);

        $this->assertStringContainsString('action="/find" data-size="lg"', $html);
        $this->assertStringContainsString('<label class="cms-label cms-search-field__label" id="cms-search-field-1-label" for="cms-search-field-1">Search the council</label>', $html, 'shown when asked');
        $this->assertStringContainsString('placeholder="Bins, parking…"', $html);
        $this->assertStringContainsString('<button type="submit" class="cms-button btn-ghost cms-search-field__button">Find</button>', $html);

        $icon = $this->field(['icon_only' => true, 'button_label' => 'Search the site']);
        $this->assertMatchesRegularExpression('#<button type="submit" class="cms-button btn-primary cms-search-field__button" data-icon-only aria-label="Search the site"><svg[^>]*class="cms-button__icon"#', $icon, 'a magnifying glass, named by the button label');
        $this->assertStringNotContainsString('>Search the site</button>', $icon);

        $odd = $this->field(['button_style' => 'Bad Style!', 'size' => 'xl', 'label' => '   ']);
        $this->assertStringContainsString('class="cms-button btn-primary ', $odd, 'a name that can\'t be a class is the primary look');
        $this->assertStringContainsString('data-size="md"', $odd);
        $this->assertStringContainsString('data-hidden>Search</label>', $odd, 'an empty label is the default');
    }

    public function test_the_results_page_is_a_link_on_the_site(): void
    {
        $page = $this->cms()->entryService()->create('pages', ['title' => 'Find', 'slug' => 'find', 'status' => 'published']);

        $this->assertStringContainsString('action="/find"', $this->field(['results_page' => 'entry:'.$page->id]), 'a page of the site, by reference');
        $this->assertStringContainsString('action="/en/search"', $this->field(['results_page' => '/en/search']));

        foreach (['javascript:alert(1)', '#top', 'mailto:a@example.com', 'entry:nonexistent', ''] as $nowhere) {
            $this->assertStringContainsString('action="/search"', $this->field(['results_page' => $nowhere]), $nowhere);
        }
    }

    public function test_every_field_on_a_page_has_its_own_ids(): void
    {
        $html = $this->render([['search-field', []], ['search-field', ['show_label' => true]]]);

        $this->assertSame(2, substr_count($html, 'role="search"'));
        $this->assertStringContainsString('for="cms-search-field-1"', $html);
        $this->assertStringContainsString('id="cms-search-field-1"', $html);
        $this->assertStringContainsString('for="cms-search-field-2"', $html);
        $this->assertStringContainsString('id="cms-search-field-2"', $html);
    }

    public function test_the_results_page_is_empty_until_the_script_searches(): void
    {
        $html = $this->render([['search-results', ['heading_level' => '3', 'per_page' => 10, 'many' => '{count} pages for “{query}”']]]);

        $this->assertStringStartsWith('<div class="cms-search-results"', $html);
        $this->assertStringContainsString('<p class="cms-search-results__status" role="status" aria-live="polite">Search needs JavaScript. Browse the site’s menu instead.</p>', $html, 'without scripts it says so, in the status line the script reuses');
        $this->assertStringContainsString('<nav class="cms-search-results__filters" aria-label="Filter results" hidden></nav>', $html);
        $this->assertStringContainsString('<ol class="cms-search-results__list"></ol>', $html);
        $this->assertStringNotContainsString('<button', $html, 'no button that would do nothing without scripts');
        $this->assertStringNotContainsString('<article', $html);
        $this->assertTrue(app(BlockRenderer::class)->features['search-results'] ?? false, 'the runtime feature that searches');

        $config = $this->config($html);
        $this->assertSame([3, 10, true, 'btn-secondary'], [$config['level'], $config['perPage'], $config['filters'], $config['moreClass']]);
        $this->assertSame('{count} pages for “{query}”', $config['texts']['many'], 'its own words');
        $this->assertSame('No results for “{query}”', $config['texts']['none'], 'the default for the rest');
        $this->assertSame(['noQuery', 'none', 'one', 'many', 'all', 'filters', 'noScript', 'more'], array_keys($config['texts']));

        $odd = $this->render([['search-results', ['heading_level' => '7', 'per_page' => 'lots', 'show_filters' => false, 'no_script' => 'Use the menu.', 'more_style' => 'ghost']]]);
        $config = $this->config($odd);
        $this->assertSame([2, 20, false, 'btn-ghost'], [$config['level'], $config['perPage'], $config['filters'], $config['moreClass']]);
        $this->assertStringContainsString('aria-live="polite">Use the menu.</p>', $odd);
    }

    public function test_the_canvas_shows_a_sample_to_style(): void
    {
        $html = $this->render([['search-results', ['heading_level' => '3']]], editor: true);

        $this->assertStringContainsString('<p class="cms-search-results__status" role="status">2 results for “recycling”</p>', $html);
        $this->assertStringContainsString('<a href="#" aria-current="true">All results (2)</a>', $html);
        $this->assertStringContainsString('<a href="#">Service (1)</a>', $html);
        $this->assertSame(2, substr_count($html, '<li class="cms-search-results__item"><article class="cms-search-results__result">'));
        $this->assertStringContainsString('<h3 class="cms-search-results__title"><a href="#">Bins and recycling collection</a></h3>', $html, 'at the heading level chosen');
        $this->assertStringContainsString('<p class="cms-search-results__kind">News</p>', $html);
        $this->assertStringContainsString('<time class="cms-search-results__date" datetime="2026-03-02">March 2, 2026</time>', $html);
        $this->assertStringContainsString('for <mark>recycling</mark>.</p>', $html, 'the words marked');
        $this->assertStringContainsString('<button type="button" class="cms-button btn-secondary cms-search-results__more">Show More Results</button>', $html);
        $this->assertStringNotContainsString('data-cms-search-results=', $html, 'nothing for a script to search');

        $this->assertStringNotContainsString('cms-search-results__filters', $this->render([['search-results', ['show_filters' => false]]], editor: true));
    }
}

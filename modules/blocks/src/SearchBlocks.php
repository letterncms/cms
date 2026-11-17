<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks;

/**
 * Search Field and Search Results: search as part of the page, for sites people mostly search, beside the Search
 * block's ⌘K dialog. The field is a plain GET form to the results page (`?q=`), so it works without scripts. The
 * results page holds a status line that says search needs scripts, an empty list of filters and an empty list; the
 * `search-results` runtime feature reads `q` and `kind` from the address, searches /search.json (SearchIndex) and
 * fills them in. On the canvas the results show a sample, so designers see every part they style.
 */
final class SearchBlocks
{
    /** Where the results are when nobody chose a page. */
    public const string RESULTS = '/search';

    private const array SIZES = ['sm', 'md', 'lg'];

    private const array LEVELS = [2, 3, 4];

    private const int PER_PAGE = 20;

    /** @return list<array> */
    public static function all(): array
    {
        $style = static fn (string $handle, string $label, string $default) => ['handle' => $handle, 'type' => 'select', 'label' => $label, 'options' => [], 'dynamic' => 'button-variants', 'default' => $default];

        return [
            [
                'name' => 'search-field', 'title' => 'Search Field', 'icon' => 'magnifying-glass', 'category' => 'interactive',
                'description' => 'A search field that opens the search results page.',
                'keywords' => ['search', 'find', 'query', 'lookup', 'form', 'input', 'site search'],
                'html' => 'form',
                'fields' => [
                    ['handle' => 'label', 'type' => 'text', 'label' => 'Label', 'placeholder' => 'Search'],
                    ['handle' => 'show_label', 'type' => 'toggle', 'label' => 'Show Label', 'default' => false],
                    ['handle' => 'placeholder', 'type' => 'text', 'label' => 'Placeholder'],
                    ['handle' => 'button_label', 'type' => 'text', 'label' => 'Button Label', 'placeholder' => 'Search'],
                    $style('button_style', 'Button Style', 'primary'),
                    ['handle' => 'icon_only', 'type' => 'toggle', 'label' => 'Icon Only Button', 'default' => false],
                    ['handle' => 'size', 'type' => 'select', 'label' => 'Size', 'options' => ['sm' => 'S', 'md' => 'M', 'lg' => 'L'], 'default' => 'md', 'display' => 'segmented'],
                    ['handle' => 'results_page', 'type' => 'url', 'component' => 'link', 'reference' => true, 'label' => 'Results Page', 'placeholder' => self::RESULTS],
                ],
                'defaults' => ['button_style' => 'primary', 'size' => 'md'],
                'render' => self::field(...),
                'example' => ['label' => 'Search the site', 'placeholder' => 'Bins, parking, council tax…', 'results_page' => self::RESULTS],
            ],
            [
                'name' => 'search-results', 'title' => 'Search Results', 'icon' => 'list-magnifying-glass', 'category' => 'interactive',
                'description' => 'The results of a search, with filters by kind of page.',
                'keywords' => ['search', 'results', 'find', 'query', 'filter', 'site search', 'search page'],
                'uses' => ['search-results'],
                'fields' => [
                    ['handle' => 'heading_level', 'type' => 'select', 'label' => 'Heading Level', 'options' => ['2' => 'H2', '3' => 'H3', '4' => 'H4'], 'default' => '2', 'display' => 'segmented', 'about' => 'Of each result’s title, below the page’s own headings.'],
                    ['handle' => 'per_page', 'type' => 'number', 'label' => 'Results Per Page', 'min' => 1, 'max' => 100, 'default' => self::PER_PAGE],
                    ['handle' => 'show_filters', 'type' => 'toggle', 'label' => 'Show Filters', 'default' => true],
                    ['handle' => 'filters_label', 'type' => 'text', 'label' => 'Filters Label', 'placeholder' => 'Filter results', 'about' => 'Read by screen readers for the list of filters.'],
                    ['handle' => 'no_query', 'type' => 'text', 'label' => 'No Query', 'placeholder' => 'Type what you are looking for.'],
                    ['handle' => 'none', 'type' => 'text', 'label' => 'No Results', 'placeholder' => 'No results for “{query}”', 'about' => '{query} is what was searched for.'],
                    ['handle' => 'one', 'type' => 'text', 'label' => 'One Result', 'placeholder' => '1 result for “{query}”'],
                    ['handle' => 'many', 'type' => 'text', 'label' => 'Many Results', 'placeholder' => '{count} results for “{query}”', 'about' => '{count} is how many were found.'],
                    ['handle' => 'all_label', 'type' => 'text', 'label' => 'All Label', 'placeholder' => 'All results'],
                    ['handle' => 'no_script', 'type' => 'text', 'label' => 'Without JavaScript', 'placeholder' => 'Search needs JavaScript. Browse the site’s menu instead.'],
                    ['handle' => 'more_label', 'type' => 'text', 'label' => 'More Label', 'placeholder' => 'Show More Results'],
                    $style('more_style', 'More Button Style', 'secondary'),
                ],
                'defaults' => ['heading_level' => '2', 'per_page' => self::PER_PAGE, 'show_filters' => true, 'more_style' => 'secondary'],
                'render' => self::results(...),
                'example' => ['heading_level' => '2', 'per_page' => self::PER_PAGE, 'show_filters' => true],
            ],
        ];
    }

    /**
     * A search form: the field looks like every field of the site (`cms-input`), the button like its buttons
     * (`cms-button btn-<style>`), and the size is the control size both share (`data-size`). The label is always
     * there for screen readers, and shown only when asked.
     */
    public static function field(array $d): string
    {
        $b = $d['block'];
        $id = $d['renderer']->nextId('search-field-');
        $label = self::text($b['label'] ?? null, __('Search'));
        $buttonLabel = self::text($b['button_label'] ?? null, __('Search'));
        $size = in_array($b['size'] ?? null, self::SIZES, true) ? $b['size'] : 'md';
        $button = '<button type="submit" class="cms-button '.self::buttonClass($b['button_style'] ?? null).' cms-search-field__button"'
            .(! empty($b['icon_only']) ? ' data-icon-only aria-label="'.e($buttonLabel).'">'.Icons::svg('magnifying-glass', 'cms-button__icon') : '>'.e($buttonLabel))
            .'</button>';

        return '<form '.$d['attrs'].' role="search" method="get" action="'.e(self::action($b['results_page'] ?? null)).'" data-size="'.$size.'" data-cms-search-field>'
            .'<label class="cms-label cms-search-field__label" for="'.$id.'"'.(empty($b['show_label']) ? ' data-hidden' : '').'>'.e($label).'</label>'
            .'<div class="cms-search-field__row">'
            .'<input class="cms-input cms-search-field__input" type="search" id="'.$id.'" name="q" placeholder="'.e(trim((string) ($b['placeholder'] ?? ''))).'" autocomplete="off" enterkeyhint="search">'
            .$button
            .'</div></form>';
    }

    /** The results page: empty until the script searches, and saying so where scripts don't run. */
    public static function results(array $d): string
    {
        $b = $d['block'];
        $texts = self::texts($b);
        $level = in_array((int) ($b['heading_level'] ?? 2), self::LEVELS, true) ? (int) $b['heading_level'] : 2;
        $perPage = is_numeric($b['per_page'] ?? null) ? max(1, min(100, (int) $b['per_page'])) : self::PER_PAGE;
        $filters = (bool) ($b['show_filters'] ?? true);
        $moreClass = self::buttonClass($b['more_style'] ?? 'secondary');

        if ($d['editor']) {
            return self::sample($d, $texts, $level, $filters, $moreClass);
        }

        // The button that shows more is the script's own: without scripts there is nothing it could do.
        $config = json_encode(['level' => $level, 'perPage' => $perPage, 'filters' => $filters, 'moreClass' => $moreClass, 'texts' => $texts], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return '<div '.$d['attrs'].' data-cms-search-results="'.e((string) $config).'">'
            .'<p class="cms-search-results__status" role="status" aria-live="polite">'.e($texts['noScript']).'</p>'
            .'<nav class="cms-search-results__filters" aria-label="'.e($texts['filters']).'" hidden></nav>'
            .'<ol class="cms-search-results__list"></ol>'
            .'</div>';
    }

    /** @return array{noQuery: string, none: string, one: string, many: string, all: string, filters: string, noScript: string, more: string} */
    public static function texts(array $b): array
    {
        return [
            'noQuery' => self::text($b['no_query'] ?? null, __('Type what you are looking for.')),
            'none' => self::text($b['none'] ?? null, __('No results for “{query}”')),
            'one' => self::text($b['one'] ?? null, __('1 result for “{query}”')),
            'many' => self::text($b['many'] ?? null, __('{count} results for “{query}”')),
            'all' => self::text($b['all_label'] ?? null, __('All results')),
            'filters' => self::text($b['filters_label'] ?? null, __('Filter results')),
            'noScript' => self::text($b['no_script'] ?? null, __('Search needs JavaScript. Browse the site’s menu instead.')),
            'more' => self::text($b['more_label'] ?? null, __('Show More Results')),
        ];
    }

    /** Where the form goes: the page chosen, else /search. A link that leads nowhere on the site counts as none. */
    public static function action(mixed $page): string
    {
        $url = Elements::url($page);

        return $url !== null && ! str_starts_with($url, '#') && ! preg_match('#^(mailto|tel):#i', $url) ? $url : self::RESULTS;
    }

    /** A button's look, a class of the site's theme (btn-<style>); btn-primary for a name that can't be one. */
    public static function buttonClass(mixed $style): string
    {
        $style = is_string($style) ? trim($style) : '';

        return 'btn-'.(preg_match('/^[a-z0-9][a-z0-9-]{0,40}$/', $style) ? $style : 'primary');
    }

    /** A setting's words, or the default when it has none. */
    private static function text(mixed $value, string $default): string
    {
        $value = is_string($value) ? trim($value) : '';

        return $value !== '' ? $value : $default;
    }

    /** Canvas only: a search with two results and the button for more, so a designer sees every part they style. */
    private static function sample(array $d, array $texts, int $level, bool $filters, string $moreClass): string
    {
        $query = __('recycling');
        $service = __('Service');
        $news = __('News');
        $mark = static fn (string $text) => (string) preg_replace('/'.preg_quote(e($query), '/').'/iu', '<mark>$0</mark>', e($text));
        $nav = $filters
            ? '<nav class="cms-search-results__filters" aria-label="'.e($texts['filters']).'"><ul>'
                .'<li><a href="#" aria-current="true">'.e($texts['all']).' (2)</a></li>'
                .'<li><a href="#">'.e($service).' (1)</a></li>'
                .'<li><a href="#">'.e($news).' (1)</a></li>'
                .'</ul></nav>'
            : '';

        return '<div '.$d['attrs'].'>'
            .'<p class="cms-search-results__status" role="status">'.e(strtr($texts['many'], ['{count}' => '2', '{query}' => $query])).'</p>'
            .$nav
            .'<ol class="cms-search-results__list">'
            .self::result($level, $service, __('Bins and recycling collection'), null, $mark(__('Find out which bin goes out this week, and what goes in it for recycling.')))
            .self::result($level, $news, __('A new recycling centre opens in March'), '2026-03-02', $mark(__('The centre takes garden waste, furniture and electricals for recycling, six days a week.')))
            .'</ol>'
            .'<button type="button" class="cms-button '.$moreClass.' cms-search-results__more">'.e($texts['more']).'</button>'
            .'</div>';
    }

    /** One result as the script draws it (runtime/src/searchResults.ts): its title as a link in a heading, then its kind, date and snippet. */
    private static function result(int $level, string $kind, string $title, ?string $date, string $snippet): string
    {
        $time = $date !== null ? '<time class="cms-search-results__date" datetime="'.$date.'">'.e(\Carbon\CarbonImmutable::parse($date)->locale(app()->getLocale())->isoFormat('LL')).'</time>' : '';

        return '<li class="cms-search-results__item"><article class="cms-search-results__result">'
            ."<h{$level} class=\"cms-search-results__title\"><a href=\"#\">".e($title)."</a></h{$level}>"
            .'<p class="cms-search-results__kind">'.e($kind).'</p>'
            .$time
            .'<p class="cms-search-results__snippet">'.$snippet.'</p>'
            .'</article></li>';
    }
}

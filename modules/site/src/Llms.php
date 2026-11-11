<?php

declare(strict_types=1);

namespace Cms\Modules\Site;

use Cms\Cms;
use Cms\Extend\Hooks;

/**
 * llms.txt: a map of the site for language models (llmstxt.org), built with the pages and served at
 * /llms.txt. The site's name, a line about it, and its public pages by collection, in the default
 * language: pages link their other languages themselves.
 *
 * Every site has one. A plugin that knows more about the pages makes it richer through the
 * `site.llms` filter instead of writing a file of its own (the SEO plugin: a summary written for the
 * purpose, each page's description and its Markdown twin, and no page hidden from search), so there is
 * one llms.txt whoever is installed.
 */
final class Llms
{
    /** As many pages as a section lists: a map, not an index. */
    private const int LIMIT = 200;

    public function __construct(private readonly Cms $cms, private readonly Hooks $hooks) {}

    /**
     * What the file says, before it is written: what `site.llms` filters.
     *
     * @return array{title: string, summary: string, sections: array<string, list<array{title: string, url: string, description: string, entry: \Cms\Content\Entries\Entry}>>}
     */
    public function document(): array
    {
        $sections = [];
        $gate = $this->cms->entries()->gate();

        foreach ($this->cms->collections()->all() as $collection) {
            if (! $collection->routable()) {
                continue;
            }

            foreach ($this->cms->entries()->query()->collection($collection->handle)->live()->orderBy('uri')->get() as $entry) {
                // What is behind a sign-in is no part of a public map.
                if ($entry->uri === null || $entry->locale !== $this->cms->defaultLocale() || $gate->isGated($entry)) {
                    continue;
                }

                $sections[$collection->title][] = ['title' => $entry->title, 'url' => $this->cms->url($entry->uri), 'description' => '', 'entry' => $entry];
            }
        }

        $document = (array) $this->hooks->filter('site.llms', [
            'title' => (string) config('app.name'),
            'summary' => trim((string) $this->cms->setting('site', 'description', '')),
            'sections' => $sections,
        ]);

        return ['title' => (string) ($document['title'] ?? ''), 'summary' => trim((string) ($document['summary'] ?? '')), 'sections' => array_filter((array) ($document['sections'] ?? []))];
    }

    public function render(): string
    {
        $document = $this->document();
        $lines = ["# {$document['title']}", ''];

        if ($document['summary'] !== '') {
            $lines[] = '> '.$document['summary'];
            $lines[] = '';
        }

        foreach ($document['sections'] as $title => $pages) {
            $lines[] = "## {$title}";
            $lines[] = '';

            foreach (array_slice(array_values($pages), 0, self::LIMIT) as $page) {
                $lines[] = '- ['.$page['title'].']('.$page['url'].')'.(($page['description'] ?? '') !== '' ? ': '.$page['description'] : '');
            }

            $lines[] = '';
        }

        return implode("\n", $lines);
    }
}

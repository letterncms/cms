<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Content\Fields\Blueprint;
use Cms\Tests\TestCase;

/** A matrix is a list of rows of several kinds, each held against the fields of its own kind. */
final class MatrixFieldTest extends TestCase
{
    private const array SECTIONS = ['handle' => 'sections', 'type' => 'matrix', 'max' => 4, 'types' => [
        ['handle' => 'quote', 'label' => 'Quote', 'fields' => [['handle' => 'text', 'type' => 'textarea', 'required' => true], ['handle' => 'by', 'type' => 'text']]],
        ['handle' => 'teasers', 'fields' => [['handle' => 'pages', 'type' => 'entries', 'collections' => ['pages']], ['handle' => 'columns', 'type' => 'number', 'min' => 1, 'max' => 4, 'default' => 3]]],
        ['handle' => 'steps', 'fields' => [['handle' => 'items', 'type' => 'repeater', 'fields' => [['handle' => 'label', 'type' => 'text', 'required' => true]]]]],
    ]];

    protected function collections(): array
    {
        return [
            ...parent::collections(),
            'landings' => ['title' => 'Landings', 'route' => '/l/{slug}', 'fields' => [self::SECTIONS]],
            'guides' => ['title' => 'Guides', 'driver' => 'files', 'route' => '/g/{slug}', 'fields' => [self::SECTIONS, ['handle' => 'body', 'type' => 'markdown', 'body' => true]]],
        ];
    }

    private function refused(callable $run): array
    {
        try {
            $run();
        } catch (AbilityException $e) {
            return $e->details;
        }

        $this->fail('The write went through.');
    }

    public function test_rows_are_stored_as_their_kind_on_both_drivers(): void
    {
        $content = $this->cms()->entryService();
        $page = $content->create('pages', ['title' => 'About']);
        $rows = [
            ['text' => 'Small is fine.', 'by' => 'Ada', 'type' => 'quote'],
            ['type' => 'teasers', 'pages' => [strtoupper($page->id)], 'columns' => '2'],
            ['type' => 'steps', 'items' => [['label' => 'One'], ['label' => 'Two']]],
        ];
        $stored = [
            ['type' => 'quote', 'text' => 'Small is fine.', 'by' => 'Ada'],
            ['type' => 'teasers', 'pages' => [$page->id], 'columns' => 2],
            ['type' => 'steps', 'items' => [['label' => 'One'], ['label' => 'Two']]],
        ];

        foreach (['landings', 'guides'] as $collection) {
            $entry = $content->create($collection, ['title' => 'Start', 'status' => 'published', 'data' => ['sections' => $rows, ...($collection === 'guides' ? ['body' => "Read **this**.\n"] : [])]]);
            $this->cms()->entries()->flush();
            $read = $this->cms()->entries()->find($entry->id);

            // The same rows with the same values: MySQL keeps a JSON object's keys in an order of its own.
            $sorted = static fn (array $rows) => array_map(static function (array $row) { ksort($row); return $row; }, $rows);
            $this->assertSame($sorted($stored), $sorted($read->data['sections']), $collection);
            $this->assertSame('Small is fine. Ada 2 One Two', $read->collection()->blueprint()->toText(['sections' => $read->data['sections']]));

            // Rows move and change kind; the whole list is replaced.
            $moved = $content->update($entry->id, ['data' => ['sections' => [$stored[2], $stored[0]]]], publish: true);
            $this->cms()->entries()->flush();
            $this->assertSame(['steps', 'quote'], array_column($this->cms()->entries()->find($moved->id)->data['sections'], 'type'), $collection);
        }

        // In a file, the rows are YAML and the body stays Markdown.
        $file = (string) file_get_contents($this->site.'/content/collections/guides/start.md');
        $this->assertStringContainsString("sections:\n", $file);
        $this->assertStringContainsString('type: steps', $file);
        $this->assertStringEndsWith("Read **this**.\n", $file);

        $augmented = (new \Cms\Content\Fields\Types\Matrix)->augment([$stored[1]], $this->cms()->collections()->find('landings')->blueprint()->field('sections'));
        $this->assertSame('teasers', $augmented[0]['type']);
        $this->assertSame([], $augmented[0]['pages'], 'A draft is not shown to a visitor.');
    }

    public function test_the_rows_of_a_kind_are_counted_on_both_drivers(): void
    {
        $content = $this->cms()->entryService();
        $quote = ['type' => 'quote', 'text' => 'Small is fine.'];
        $steps = ['type' => 'steps', 'items' => [['label' => 'One']]];
        $usage = fn (string $collection, string $kind, string $field = 'sections') => $this->cms()->abilities()->execute('collections/usage', ['handle' => $collection, 'field' => $field, 'rowType' => $kind], AbilityContext::system());

        foreach (['landings', 'guides'] as $collection) {
            $content->create($collection, ['title' => 'One', 'status' => 'published', 'data' => ['sections' => [$quote, $steps, $quote]]]);
            $content->create($collection, ['title' => 'Two', 'data' => ['sections' => [$steps]]]);
            // Published without a quote, with one in the draft being worked on.
            $third = $content->create($collection, ['title' => 'Three', 'status' => 'published', 'data' => ['sections' => [$steps]]]);
            $content->update($third->id, ['data' => ['sections' => [$steps, $quote]]]);
            $this->cms()->entries()->flush();

            $this->assertSame(['rows' => 3, 'entries' => 2], $usage($collection, 'quote'), $collection);
            $this->assertSame(['rows' => 3, 'entries' => 3], $usage($collection, 'steps'), $collection);
            $this->assertSame(['rows' => 0, 'entries' => 0], $usage($collection, 'teasers'), $collection);
            $this->assertSame(['rows' => 0, 'entries' => 0], $usage($collection, 'quote', 'elsewhere'), $collection);
        }

        try {
            $usage('nowhere', 'quote');
            $this->fail('A collection that is not there was counted.');
        } catch (AbilityException $e) {
            $this->assertSame('not_found', $e->type);
        }
    }

    public function test_a_row_is_held_against_the_fields_of_its_kind(): void
    {
        $content = $this->cms()->entryService();
        $post = $content->create('posts', ['title' => 'A post']);
        $create = fn (array $rows) => fn () => $content->create('landings', ['title' => 'Bad', 'data' => ['sections' => $rows]]);

        $this->assertSame(['data.sections.0.type'], array_keys($this->refused($create([['type' => 'video']]))));
        $this->assertSame(['data.sections.0.type'], array_keys($this->refused($create([['text' => 'No kind']]))));
        $this->assertSame(['data.sections.1.text'], array_keys($this->refused($create([['type' => 'quote', 'text' => 'Fine'], ['type' => 'quote', 'by' => 'Nobody']]))));
        $this->assertSame(['data.sections.0.columns'], array_keys($this->refused($create([['type' => 'teasers', 'columns' => 9]]))));
        $this->assertSame(['data.sections.0.items.1.label'], array_keys($this->refused($create([['type' => 'steps', 'items' => [['label' => 'One'], []]]]))));
        $this->assertSame(['data.sections'], array_keys($this->refused($create(array_fill(0, 5, ['type' => 'quote', 'text' => 'x'])))));
        // Relations inside a row are checked like any other.
        $this->assertSame(['data.sections.0.pages.0'], array_keys($this->refused($create([['type' => 'teasers', 'pages' => [$post->id]]]))));
    }

    public function test_the_schema_has_one_branch_per_kind(): void
    {
        $schema = $this->cms()->abilities()->execute('collections/schema', ['handle' => 'landings'], AbilityContext::system())['data']['properties']['sections'];

        $this->assertSame('array', $schema['type']);
        $this->assertSame(4, $schema['maxItems']);
        $this->assertSame(['quote', 'teasers', 'steps'], $schema['items']['properties']['type']['enum']);
        $this->assertSame(['type'], $schema['items']['required']);
        $this->assertSame(['properties' => ['type' => ['const' => 'quote']], 'required' => ['type']], $schema['items']['allOf'][0]['if']);
        $this->assertSame(['text'], $schema['items']['allOf'][0]['then']['required']);
        $this->assertSame(['pages', 'columns'], array_keys($schema['items']['allOf'][1]['then']['properties']));

        $type = array_column($this->cms()->abilities()->execute('fields/types', [], AbilityContext::system()), null, 'key')['matrix'];
        $this->assertSame(['types', 'max'], array_column($type['config'], 'handle'));
    }

    public function test_a_definition_names_its_kinds(): void
    {
        Blueprint::validate([self::SECTIONS]);

        foreach ([
            [],
            ['types' => []],
            ['types' => [['label' => 'No handle']]],
            ['types' => [['handle' => 'a'], ['handle' => 'a']]],
            ['types' => [['handle' => 'a', 'fields' => 'text']]],
            ['types' => [['handle' => 'a', 'fields' => [['handle' => 'type', 'type' => 'text']]]]],
            ['types' => [['handle' => 'a', 'fields' => [['handle' => 'x', 'type' => 'nope']]]]],
            ['types' => [['handle' => 'a', 'fields' => [['handle' => 'x', 'type' => 'text'], ['handle' => 'x', 'type' => 'text']]]]],
        ] as $config) {
            try {
                Blueprint::validate([['handle' => 'rows', 'type' => 'matrix', ...$config]]);
                $this->fail('Took '.json_encode($config));
            } catch (\InvalidArgumentException $e) {
                $this->assertStringContainsString('rows', $e->getMessage());
            }
        }
    }
}

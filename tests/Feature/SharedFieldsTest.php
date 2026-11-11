<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Content\Entries\Entry;
use Cms\Tests\TestCase;

/** A field with `localizable: false` holds one value for every language: the original has it, translations follow. */
final class SharedFieldsTest extends TestCase
{
    private const array FIELDS = [
        ['handle' => 'price', 'type' => 'number', 'localizable' => false, 'required' => true],
        ['handle' => 'photos', 'type' => 'tags', 'localizable' => false],
        ['handle' => 'summary', 'type' => 'textarea'],
    ];

    protected function collections(): array
    {
        return [
            ...parent::collections(),
            'products' => ['title' => 'Products', 'route' => '/products/{slug}', 'fields' => self::FIELDS],
            'sheets' => ['title' => 'Sheets', 'driver' => 'files', 'route' => '/sheets/{slug}', 'fields' => self::FIELDS],
        ];
    }

    private function ability(string $name, array $input = []): mixed
    {
        return $this->cms()->abilities()->execute($name, $input, AbilityContext::system());
    }

    private function read(string $id): Entry
    {
        $this->cms()->entries()->flush();

        return $this->cms()->entries()->find($id);
    }

    public function test_translations_follow_the_original_on_both_drivers(): void
    {
        $content = $this->cms()->entryService();
        $rebuilt = [];
        $this->cms()->hooks()->on('entry.saved', function (Entry $entry, $user, string $action) use (&$rebuilt): void {
            $action === 'shared' && $rebuilt[] = $entry->id;
        });

        $this->assertSame(['price', 'photos'], $this->cms()->collections()->find('products')->blueprint()->shared());

        foreach (['products', 'sheets'] as $collection) {
            $chair = $content->create($collection, ['title' => 'Chair', 'data' => ['price' => 100, 'photos' => ['a'], 'summary' => 'A chair.']]);

            // A translation is made with the original's values, whatever it is sent, and they count as filled.
            $stuhl = $content->create($collection, ['title' => 'Stuhl', 'locale' => 'de', 'originId' => $chair->id, 'status' => 'published', 'data' => ['price' => 5, 'summary' => 'Ein Stuhl.']]);
            $this->assertSame([100, ['a'], 'Ein Stuhl.'], [$stuhl->data['price'], $stuhl->data['photos'], $stuhl->data['summary']], $collection);
            $this->assertSame(['price', 'photos'], $this->ability('entries/get', ['id' => $stuhl->id])['sharedFields']);
            $this->assertArrayNotHasKey('sharedFields', $this->ability('entries/get', ['id' => $chair->id]));

            // The original changes: the translation has it, live at once since nothing of its own waits.
            $rebuilt = [];
            $content->update($chair->id, ['data' => ['price' => 120, 'summary' => 'A good chair.']]);
            $de = $this->read($stuhl->id);
            $this->assertSame([120, 'Ein Stuhl.', false], [$de->data['price'], $de->data['summary'], $de->hasDraft()], $collection);
            $this->assertSame([$stuhl->id], $rebuilt);

            // A translation cannot change it, and what it changes of its own is kept.
            $content->update($stuhl->id, ['data' => ['price' => 1, 'summary' => 'Ein guter Stuhl.']]);
            $de = $this->read($stuhl->id);
            $this->assertSame([120, 'Ein guter Stuhl.'], [$de->working()['data']['price'], $de->working()['data']['summary']], $collection);
            $this->assertSame(['summary'], $this->ability('entries/update', ['id' => $stuhl->id, 'data' => ['price' => 1, 'summary' => 'x'], 'dryRun' => true])['changes'][0]['fields']);

            // Published, the original's changes wait in its draft, and so they wait for the translations too.
            $content->publish($chair->id);
            $content->update($chair->id, ['data' => ['price' => 150]]);
            $this->assertSame(120, $this->read($stuhl->id)->working()['data']['price'], $collection);
            $rebuilt = [];
            $content->publish($chair->id);
            $de = $this->read($stuhl->id);
            // In what it serves and in its own waiting changes.
            $this->assertSame([150, 150, 'Ein guter Stuhl.'], [$de->data['price'], $de->working()['data']['price'], $de->working()['data']['summary']], $collection);
            $this->assertSame([$stuhl->id], $rebuilt);

            // Nothing changed, nothing saved.
            $rebuilt = [];
            $content->update($chair->id, ['data' => ['summary' => 'Still a chair.']], publish: true);
            $this->assertSame([], $rebuilt);
            $this->assertSame('shared', $this->ability('revisions/list', ['entryId' => $stuhl->id])[0]['action'] ?? $this->ability('revisions/list', ['entryId' => $stuhl->id])['items'][0]['action']);
        }
    }

    public function test_a_dry_run_shares_nothing(): void
    {
        $content = $this->cms()->entryService();
        $chair = $content->create('products', ['title' => 'Chair', 'data' => ['price' => 100]]);
        $stuhl = $content->create('products', ['title' => 'Stuhl', 'locale' => 'de', 'originId' => $chair->id]);

        $this->ability('entries/update', ['id' => $chair->id, 'data' => ['price' => 200], 'dryRun' => true]);

        $this->assertSame(100, $this->read($stuhl->id)->data['price']);
        $this->assertSame(100, $this->read($chair->id)->data['price']);
    }
}

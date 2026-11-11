<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Content\Fields\Blueprint;
use Cms\Modules\Media\MediaItem;
use Cms\Tests\TestCase;

/** link, date-range, time, range, table, geo and file: what each stores, takes and refuses, on both drivers. */
final class FieldTypesTest extends TestCase
{
    private const array FIELDS = [
        ['handle' => 'cta', 'type' => 'link', 'collections' => ['pages']],
        ['handle' => 'contact', 'type' => 'link', 'types' => ['email', 'phone']],
        ['handle' => 'season', 'type' => 'date-range'],
        ['handle' => 'slot', 'type' => 'date-range', 'time' => true],
        ['handle' => 'opens', 'type' => 'time'],
        ['handle' => 'precise', 'type' => 'time', 'seconds' => true],
        ['handle' => 'rating', 'type' => 'range', 'min' => 1, 'max' => 5],
        ['handle' => 'opacity', 'type' => 'range', 'min' => 0, 'max' => 1, 'step' => 0.25],
        ['handle' => 'prices', 'type' => 'table'],
        ['handle' => 'place', 'type' => 'geo'],
        ['handle' => 'downloads', 'type' => 'file', 'accept' => 'application/pdf, text/*'],
        ['handle' => 'body', 'type' => 'markdown'],
    ];

    protected function collections(): array
    {
        return [
            ...parent::collections(),
            'venues' => ['title' => 'Venues', 'route' => '/venues/{slug}', 'fields' => self::FIELDS],
            'places' => ['title' => 'Places', 'driver' => 'files', 'route' => '/places/{slug}', 'body' => 'body', 'fields' => self::FIELDS],
        ];
    }

    private function file(string $name, string $mime): MediaItem
    {
        return MediaItem::query()->create(['name' => $name, 'filename' => $name, 'path' => 'media/'.$name, 'mime' => $mime, 'size' => 12, 'hash' => hash('sha256', $name), 'folder' => 'tests']);
    }

    private function refused(array $data, string $collection = 'venues'): array
    {
        try {
            $this->cms()->entryService()->create($collection, ['title' => 'Bad', 'data' => $data]);
        } catch (AbilityException $e) {
            return array_keys($e->details);
        }

        $this->fail('Took '.json_encode($data));
    }

    public function test_values_are_cleaned_and_come_back_as_stored_on_both_drivers(): void
    {
        $content = $this->cms()->entryService();
        $page = $content->create('pages', ['title' => 'About', 'status' => 'published']);
        $pdf = $this->file('menu.pdf', 'application/pdf');

        $sent = [
            'cta' => ['type' => 'entry', 'value' => strtoupper($page->id), 'label' => ' Read more ', 'new_tab' => false],
            'contact' => 'mailto:Hello@Example.com',
            'season' => ['start' => '2026-06-01', 'end' => '1 September 2026'],
            'slot' => ['start' => '2026-06-01 09:00', 'end' => '2026-06-01T17:30:00+00:00'],
            'opens' => '9:5',
            'precise' => '18:30',
            'rating' => '4',
            'opacity' => 0.6,
            'prices' => [['Plan', 'Price', 'Note'], ['Solo', ' €9 '], ['Team', 49]],
            'place' => ['lat' => '51.0543422', 'lng' => 3.7174243, 'address' => ' Korenmarkt, Gent '],
            'downloads' => strtoupper($pdf->id),
        ];
        $stored = [
            'cta' => ['type' => 'entry', 'value' => $page->id, 'label' => 'Read more'],
            'contact' => ['type' => 'email', 'value' => 'hello@example.com'],
            'season' => ['start' => '2026-06-01', 'end' => '2026-09-01'],
            'slot' => ['start' => '2026-06-01T09:00:00+00:00', 'end' => '2026-06-01T17:30:00+00:00'],
            'opens' => '09:05',
            'precise' => '18:30:00',
            'rating' => 4,
            'opacity' => 0.5,
            'prices' => [['Plan', 'Price', 'Note'], ['Solo', '€9', ''], ['Team', '49', '']],
            'place' => ['lat' => 51.054342, 'lng' => 3.717424, 'address' => 'Korenmarkt, Gent'],
            'downloads' => [$pdf->id],
        ];

        foreach (['venues', 'places'] as $collection) {
            $entry = $content->create($collection, ['title' => 'Hall', 'status' => 'published', 'data' => $sent]);
            $this->cms()->entries()->flush();
            $read = $this->cms()->entries()->find($entry->id);

            foreach ($stored as $handle => $value) {
                $this->assertEquals($value, $read->data[$handle], "{$collection}.{$handle}");
            }

            $this->assertSame(4, $read->data['rating']);
            // A link names its page: it is found from the page's side.
            $this->assertSame(['Hall'], array_map(static fn ($e) => $e->title, $this->cms()->entries()->query()->collection($collection)->references($page->id)->get()), $collection);
            $this->assertSame(['Hall'], array_map(static fn ($e) => $e->title, $this->cms()->entries()->query()->collection($collection)->references($page->id, 'cta')->get()), $collection);
            $this->assertSame(0, $this->cms()->entries()->query()->collection($collection)->references($page->id, 'place')->count(), $collection);
            // Saved again as read, nothing moves.
            $again = $content->update($entry->id, ['data' => array_intersect_key($read->data, $stored)], publish: true);
            $this->assertEquals(array_intersect_key($read->data, $stored), array_intersect_key($again->data, $stored), $collection);

            // Emptied, each is nothing.
            $cleared = $content->update($entry->id, ['data' => ['cta' => ['type' => 'url', 'value' => ''], 'contact' => '', 'season' => ['start' => '', 'end' => ''], 'opens' => '', 'rating' => '', 'prices' => [], 'place' => ['lat' => '', 'lng' => ''], 'downloads' => []]], publish: true);
            $this->cms()->entries()->flush();
            $read = $this->cms()->entries()->find($cleared->id);

            foreach (['cta', 'contact', 'season', 'opens', 'rating', 'place'] as $handle) {
                $this->assertNull($read->data[$handle] ?? null, "{$collection}.{$handle}");
            }

            $this->assertSame([], $read->data['prices'] ?? []);
        }

        $blueprint = $this->cms()->collections()->find('venues')->blueprint();
        $seen = $blueprint->augment($stored);
        $this->assertSame(['type' => 'entry', 'value' => $page->id, 'url' => '/about', 'label' => 'Read more', 'new_tab' => false], $seen['cta']);
        $this->assertSame('mailto:hello@example.com', $seen['contact']['url']);
        $this->assertSame('hello@example.com', $seen['contact']['label']);
        $this->assertSame('2026-09-01', $seen['season']['end']->toDateString());
        $this->assertSame(['header' => ['Plan', 'Price', 'Note'], 'rows' => [['Solo', '€9', ''], ['Team', '49', '']]], $seen['prices']);
        $this->assertSame(['id' => $pdf->id, 'url' => '/media/menu.pdf', 'name' => 'menu.pdf', 'filename' => 'menu.pdf', 'extension' => 'pdf', 'mime' => 'application/pdf', 'kind' => 'pdf', 'size' => 12], $seen['downloads'][0]);
        $this->assertSame('Read more Plan Price Note Solo €9 Team 49 Korenmarkt, Gent', preg_replace('/\s+/', ' ', trim(str_replace(['2026-06-01 2026-09-01', '2026-06-01T09:00:00+00:00 2026-06-01T17:30:00+00:00', '09:05', '18:30:00', '0.5', ' 4 ', $pdf->id], ' ', $blueprint->toText($stored)))));

        // A link to a file leads to it; one to a draft leads nowhere.
        $link = new \Cms\Content\Fields\Types\Link;
        $field = $blueprint->field('cta');
        $this->assertSame(['/media/menu.pdf', 'menu.pdf'], array_values(array_intersect_key($link->augment(['type' => 'media', 'value' => $pdf->id], $field), ['url' => 1, 'label' => 1])));
        $this->assertSame('tel:+3291234567', $link->augment(['type' => 'phone', 'value' => '+32 (9) 123 45 67'], $field)['url']);
        $draft = $content->create('pages', ['title' => 'Soon']);
        $this->assertSame([null, ''], array_values(array_intersect_key($link->augment(['type' => 'entry', 'value' => $draft->id], $field), ['url' => 1, 'label' => 1])));
        $this->assertSame('', $link->augment(['type' => 'media', 'value' => '01hzzzzzzzzzzzzzzzzzzzzzzz'], $field)['label']);
        $this->assertSame('Soon enough', $link->augment(['type' => 'entry', 'value' => $draft->id, 'label' => 'Soon enough'], $field)['label']);

    }

    public function test_what_does_not_fit_is_refused_by_its_path(): void
    {
        $content = $this->cms()->entryService();
        $post = $content->create('posts', ['title' => 'A post']);
        $image = $this->file('photo.jpg', 'image/jpeg');
        $zip = $this->file('all.zip', 'application/zip');

        foreach ([
            [['cta' => ['type' => 'fax', 'value' => '1']], ['data.cta.type']],
            [['cta' => ['type' => 'email', 'value' => 'nobody']], ['data.cta.value']],
            [['cta' => ['type' => 'phone', 'value' => 'call me']], ['data.cta.value']],
            [['cta' => ['type' => 'url', 'value' => 'javascript:alert(1)']], ['data.cta.value']],
            [['cta' => ['type' => 'url', 'value' => '/x', 'rel' => 'nofollow']], ['data.cta.rel']],
            [['cta' => ['type' => 'entry', 'value' => '01hzzzzzzzzzzzzzzzzzzzzzzz']], ['data.cta.value']],
            [['cta' => ['type' => 'entry', 'value' => $post->id]], ['data.cta.value']],
            [['cta' => ['type' => 'media', 'value' => '01hzzzzzzzzzzzzzzzzzzzzzzz']], ['data.cta.value']],
            [['contact' => 'https://example.com'], ['data.contact.type']],
            [['season' => ['start' => '2026-06-01', 'end' => 'soon']], ['data.season.end']],
            [['season' => ['start' => '2026-06-02', 'end' => '2026-06-01']], ['data.season.end']],
            [['opens' => '25:00'], ['data.opens']],
            [['opens' => 'noon'], ['data.opens']],
            [['rating' => 6], ['data.rating']],
            [['rating' => 'high'], ['data.rating']],
            [['prices' => [['a', ['b']]]], ['data.prices.0.1']],
            [['prices' => 'a,b'], ['data.prices']],
            [['place' => ['lat' => 91, 'lng' => 3]], ['data.place.lat']],
            [['place' => ['address' => 'Somewhere']], ['data.place.lat', 'data.place.lng']],
            [['downloads' => [$image->id]], ['data.downloads.0']],
            [['downloads' => [$zip->id]], ['data.downloads.0']],
            [['downloads' => ['/media/menu.pdf']], ['data.downloads.0']],
        ] as [$data, $paths]) {
            $this->assertSame($paths, $this->refused($data), json_encode($data));
        }
    }

    public function test_each_type_says_what_it_takes_as_json_schema(): void
    {
        $schema = $this->cms()->abilities()->execute('collections/schema', ['handle' => 'venues'], AbilityContext::system())['data']['properties'];

        $this->assertSame(['object', 'null'], $schema['cta']['type']);
        $this->assertSame(['entry', 'url', 'email', 'phone', 'media'], $schema['cta']['properties']['type']['enum']);
        $this->assertSame(['email', 'phone'], $schema['contact']['properties']['type']['enum']);
        $this->assertSame(['properties' => ['value' => ['format' => 'email']]], $schema['contact']['allOf'][0]['then']);
        $this->assertSame(['type', 'value'], $schema['cta']['required']);
        $this->assertSame('date', $schema['season']['properties']['start']['format']);
        $this->assertSame('date-time', $schema['slot']['properties']['end']['format']);
        $this->assertSame(['string', 'null'], $schema['opens']['type']);
        $this->assertSame(['integer', 'null'], $schema['rating']['type']);
        $this->assertSame([1, 5], [$schema['rating']['minimum'], $schema['rating']['maximum']]);
        $this->assertSame(['number', 'null'], $schema['opacity']['type']);
        $this->assertSame('string', $schema['prices']['items']['items']['type']);
        $this->assertSame(['lat', 'lng'], $schema['place']['required']);
        $this->assertSame('ulid', $schema['downloads']['items']['format']);

        $types = array_column($this->cms()->abilities()->execute('fields/types', [], AbilityContext::system()), null, 'key');

        foreach (['link', 'date-range', 'time', 'range', 'table', 'geo', 'file'] as $key) {
            $this->assertArrayHasKey($key, $types);
        }

        // Required, each must be there.
        $required = Blueprint::make(array_map(static fn (array $f) => [...$f, 'required' => true], array_slice(self::FIELDS, 0, 10)))->schema();
        $this->assertSame('object', $required['properties']['cta']['type']);
        $this->assertSame('string', $required['properties']['opens']['type']);
        $this->assertSame('integer', $required['properties']['rating']['type']);
    }

    public function test_half_a_date_range_is_a_draft(): void
    {
        $content = $this->cms()->entryService();

        foreach (['venues', 'places'] as $collection) {
            $draft = $content->create($collection, ['title' => 'Soon', 'data' => ['season' => ['start' => '2026-06-01', 'end' => null]]]);
            $this->cms()->entries()->flush();
            $this->assertSame(['start' => '2026-06-01'], $this->cms()->entries()->find($draft->id)->data['season'], $collection);

            try {
                $content->publish($draft->id);
                $this->fail('Published half a range.');
            } catch (AbilityException $e) {
                $this->assertSame(['data.season.end'], array_keys($e->details));
            }

            $content->update($draft->id, ['data' => ['season' => ['start' => '2026-06-01', 'end' => '2026-06-30']]]);
            $this->assertTrue($content->publish($draft->id)->isPublished());
        }

        $schema = $this->cms()->abilities()->execute('collections/schema', ['handle' => 'venues'], AbilityContext::system());
        $this->assertSame(['start', 'end'], $schema['data']['properties']['season']['required']);
        $this->assertArrayNotHasKey('required', array_filter($schema['draft']['properties']['season']));
    }
}

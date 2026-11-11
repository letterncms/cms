<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Tests\TestCase;

/** The public content API: filters, order, projection and expansion, and never more than a visitor may read. */
final class DeliveryApiTest extends TestCase
{
    protected function collections(): array
    {
        return [
            ...parent::collections(),
            'authors' => ['title' => 'Authors', 'route' => '/authors/{slug}', 'fields' => [['handle' => 'bio', 'type' => 'textarea'], ['handle' => 'mentor', 'type' => 'entries', 'collections' => ['authors'], 'max' => 1]]],
            'secrets' => ['title' => 'Secrets', 'fields' => [['handle' => 'code', 'type' => 'text']]],
            'articles' => ['title' => 'Articles', 'route' => '/articles/{slug}', 'sort' => 'title', 'fields' => [
                ['handle' => 'summary', 'type' => 'textarea'],
                ['handle' => 'rating', 'type' => 'number'],
                ['handle' => 'featured', 'type' => 'toggle'],
                ['handle' => 'tags', 'type' => 'tags'],
                ['handle' => 'place', 'type' => 'geo'],
                ['handle' => 'authors', 'type' => 'entries', 'collections' => ['authors']],
                ['handle' => 'sources', 'type' => 'entries'],
                ['handle' => 'meta', 'type' => 'group', 'fields' => [['handle' => 'related', 'type' => 'entries'], ['handle' => 'weight', 'type' => 'number', 'decimals' => true]]],
            ]],
            'memos' => ['title' => 'Memos', 'driver' => 'files', 'route' => '/memos/{slug}', 'sort' => 'title', 'fields' => [
                ['handle' => 'summary', 'type' => 'textarea'],
                ['handle' => 'rating', 'type' => 'number'],
                ['handle' => 'featured', 'type' => 'toggle'],
                ['handle' => 'tags', 'type' => 'tags'],
                ['handle' => 'place', 'type' => 'geo'],
                ['handle' => 'authors', 'type' => 'entries', 'collections' => ['authors']],
                ['handle' => 'sources', 'type' => 'entries'],
                ['handle' => 'meta', 'type' => 'group', 'fields' => [['handle' => 'related', 'type' => 'entries'], ['handle' => 'weight', 'type' => 'number', 'decimals' => true]]],
            ]],
        ];
    }

    /** @return array<string, string> ids by name */
    private function fill(string $collection): array
    {
        $content = $this->cms()->entryService();
        $make = fn (string $in, string $title, array $data = [], string $status = 'published') => $content->create($in, ['title' => $title, 'data' => $data, 'status' => $status])->id;
        $ada = $this->cms()->entries()->query()->collection('authors')->where('slug', 'ada')->first()?->id ?? $make('authors', 'Ada', ['bio' => 'Wrote the first program.']);
        $bob = $this->cms()->entries()->query()->collection('authors')->where('slug', 'bob')->first()?->id ?? $make('authors', 'Bob', ['bio' => 'Builds things.', 'mentor' => [$ada]]);
        $ghost = $this->cms()->entries()->query()->collection('authors')->where('slug', 'ghost')->first()?->id ?? $make('authors', 'Ghost', [], 'draft');
        $secret = $this->cms()->entries()->query()->collection('secrets')->first()?->id ?? $make('secrets', 'Secret', ['code' => 'xyzzy']);

        $make($collection, 'Alpha', ['summary' => 'About apples.', 'rating' => 5, 'featured' => true, 'tags' => ['fruit', 'red'], 'place' => ['lat' => 51, 'lng' => 3, 'address' => 'Gent'], 'authors' => [$ada, $ghost], 'sources' => [$secret, $bob], 'meta' => ['related' => [$bob], 'weight' => 1.5]]);
        $make($collection, 'Beta', ['summary' => 'About pears.', 'rating' => 3, 'featured' => false, 'tags' => ['fruit'], 'authors' => [$bob]]);
        $make($collection, 'Gamma', ['rating' => 10, 'tags' => ['veg'], 'place' => ['lat' => 52, 'lng' => 4, 'address' => 'Leiden']]);
        $make($collection, 'Hidden draft', ['summary' => 'About apples, unpublished.', 'rating' => 5, 'tags' => ['fruit']], 'draft');

        return compact('ada', 'bob', 'ghost', 'secret');
    }

    private function titles(string $url): array
    {
        return array_column($this->getJson('/api/v1/content/'.$url)->assertOk()->json('data'), 'title');
    }

    public function test_filters_and_order_on_both_drivers(): void
    {
        foreach (['articles', 'memos'] as $c) {
            $this->fill($c);

            foreach ([
                'filter[rating]=5' => ['Alpha'],
                'filter[rating][ne]=5' => ['Beta', 'Gamma'],
                'filter[rating][gt]=3' => ['Alpha', 'Gamma'],
                'filter[rating][gte]=3&filter[rating][lt]=10' => ['Alpha', 'Beta'],
                'filter[rating][lte]=3' => ['Beta'],
                'filter[rating][in]=3,10' => ['Beta', 'Gamma'],
                'filter[title][in]=Alpha,Gamma,Hidden draft' => ['Alpha', 'Gamma'],
                'filter[tags][contains]=fruit' => ['Alpha', 'Beta'],
                'filter[summary][contains]=PEAR' => ['Beta'],
                'filter[title][contains]=amm' => ['Gamma'],
                'filter[summary][exists]=true' => ['Alpha', 'Beta'],
                'filter[summary][exists]=false' => ['Gamma'],
                'filter[featured]=true' => ['Alpha'],
                'filter[place.address]=Leiden' => ['Gamma'],
                'filter[data.rating][eq]=3' => ['Beta'],
                'filter[authors]=ada' => ['Alpha'],
                'filter[authors][contains]=bob' => ['Beta'],
                'filter[tags][contains]=fruit&filter[rating][gt]=4' => ['Alpha'],
                // What is not there equals only nothing, is unequal to everything else and is neither less nor more.
                'filter[summary]=' => ['Gamma'],
                'filter[summary][ne]=' => ['Alpha', 'Beta'],
                'filter[summary][ne]=About apples.' => ['Beta', 'Gamma'],
                'filter[summary][in]=About pears.,x' => ['Beta'],
                'filter[place.address][ne]=Gent' => ['Beta', 'Gamma'],
                'filter[place.lat][gte]=51.5' => ['Gamma'],
                'filter[place.lat][lt]=52' => ['Alpha'],
                'filter[place.lng][lte]=3.0' => ['Alpha'],
                'filter[meta.weight][gt]=1.25' => ['Alpha'],
                'filter[meta.weight][lt]=9' => ['Alpha'],
                'filter[featured]=false' => ['Beta', 'Gamma'],
                'filter[featured][ne]=true' => ['Beta', 'Gamma'],
                'filter[place][exists]=false' => ['Beta'],
                'filter[title][ne]=Alpha' => ['Beta', 'Gamma'],
                'filter[title][contains]=ALP' => ['Alpha'],
                'filter[rating][in]=5,7' => ['Alpha'],
                'filter[meta.related]=bob' => ['Alpha'],
                'sort=-rating' => ['Gamma', 'Alpha', 'Beta'],
                'sort=-featured,-title&filter[rating][lt]=10' => ['Alpha', 'Beta'],
                'sort=-title' => ['Gamma', 'Beta', 'Alpha'],
                'sort=-publishedAt,title&limit=2' => $this->titles($c.'?sort=-published_at,title&limit=2'),
            ] as $query => $expected) {
                $this->assertSame($expected, $this->titles($c.'?'.$query), "{$c}?{$query}");
            }

            foreach (['filter[status]=draft', 'filter[nope]=1', 'filter[rating][near]=3', 'filter[authors][ne]=ada', 'filter=5', 'sort=draft', 'sort=author_id', 'fields=nope', 'expand=tags', 'expand=authors.mentor.mentor', 'expand=authors.nope', 'filter[rating][contains]=5', 'filter[place][contains]=Gent', 'filter[featured][contains]=t', 'page=99', 'page=0', 'page=two', 'limit=0', 'limit=500'] as $bad) {
                $this->getJson("/api/v1/content/{$c}?{$bad}")->assertStatus(422)->assertJsonPath('error.type', 'invalid_input');
            }
        }
    }

    public function test_fields_expansion_and_pages(): void
    {
        foreach (['articles', 'memos'] as $c) {
            $ids = $this->fill($c);

            $alpha = $this->getJson("/api/v1/content/{$c}/alpha?fields=title,summary,uri")->assertOk()->json('data');
            $this->assertSame(['id', 'title', 'uri', 'data'], array_keys($alpha));
            $this->assertSame(['summary' => 'About apples.'], $alpha['data']);
            $this->assertSame([['id', 'slug']], array_values(array_unique(array_map('array_keys', $this->getJson("/api/v1/content/{$c}?fields=slug")->json('data')), SORT_REGULAR)));

            // Unexpanded, a relation is its ids, whatever they name.
            $plain = $this->getJson("/api/v1/content/{$c}/alpha")->json('data.data');
            $this->assertSame([$ids['ada'], $ids['ghost']], $plain['authors']);

            // Expanded: published entries of collections the API serves, as the API gives them. No draft, nothing of a collection it does not serve.
            $expanded = $this->getJson("/api/v1/content/{$c}/alpha?expand=authors,sources.mentor&fields=title,authors,sources")->assertOk()->json('data.data');
            $this->assertSame(['Ada'], array_column($expanded['authors'], 'title'));
            $this->assertSame('Wrote the first program.', $expanded['authors'][0]['data']['bio']);
            $this->assertSame(['Bob'], array_column($expanded['sources'], 'title'));
            $this->assertSame('Ada', $expanded['sources'][0]['data']['mentor'][0]['title']);
            $this->assertStringNotContainsString('xyzzy', json_encode($expanded));
            $this->assertStringNotContainsString('Ghost', json_encode($expanded));
            // One level asked, one level given.
            $this->assertSame([$ids['ada']], $this->getJson("/api/v1/content/{$c}/alpha?expand=sources")->json('data.data.sources.0.data.mentor'));
            $this->assertSame('Ada', $this->getJson("/api/v1/content/{$c}?expand=authors&filter[rating]=5")->json('data.0.data.authors.0.title'));
            // A relation in a group, and the relation of what it names.
            $this->assertSame('Bob', $this->getJson("/api/v1/content/{$c}/alpha?expand=meta.related")->json('data.data.meta.related.0.title'));
            $this->assertSame('Ada', $this->getJson("/api/v1/content/{$c}/alpha?expand=meta.related.mentor")->json('data.data.meta.related.0.data.mentor.0.title'));
            // A whole page is expanded with one lookup per level, whatever its size.
            $count = function (string $url): int {
                $queries = 0;
                \Illuminate\Support\Facades\DB::listen(function () use (&$queries): void { $queries++; });
                $this->getJson($url)->assertOk();
                \Illuminate\Support\Facades\DB::getEventDispatcher()->forget(\Illuminate\Database\Events\QueryExecuted::class);

                return $queries;
            };
            $count("/api/v1/content/{$c}?expand=authors,sources.mentor,meta.related");
            $this->assertLessThanOrEqual($count("/api/v1/content/{$c}?limit=1&expand=authors,sources.mentor,meta.related"), $count("/api/v1/content/{$c}?limit=3&expand=authors,sources.mentor,meta.related"), 'More entries on the page cost no more lookups.');

            $page = $this->getJson("/api/v1/content/{$c}?limit=2&filter[rating][gte]=3")->assertOk();
            $this->assertSame(['total' => 3, 'page' => 1, 'perPage' => 2, 'pages' => 2, 'count' => 2, 'from' => 1, 'to' => 2, 'hasMore' => true], $page->json('meta'));
            $this->assertNull($page->json('links.prev'));
            $next = (string) $page->json('links.next');
            $this->assertStringContainsString('page=2', $next);
            $this->assertStringContainsString('limit=2', $next);
            $last = $this->getJson(substr($next, strpos($next, '/api/')))->assertOk();
            $this->assertSame([1, 3, 3, false], [$last->json('meta.count'), $last->json('meta.from'), $last->json('meta.to'), $last->json('meta.hasMore')]);
            $this->assertSame(['count' => 0, 'from' => null, 'to' => null], array_intersect_key($this->getJson("/api/v1/content/{$c}?filter[rating]=99")->json('meta'), ['count' => 1, 'from' => 1, 'to' => 1]));
        }

        $this->getJson('/api/v1/content/secrets')->assertNotFound();
    }
}

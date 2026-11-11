<?php

declare(strict_types=1);

namespace Cms\Tests\Unit;

use Cms\Support\Schema\Conform;
use Cms\Support\Schema\Shape;
use PHPUnit\Framework\TestCase;
use stdClass;

/** JSON's own types for an answer, and the strict reading of a schema the tests hold results to. */
final class ConformTest extends TestCase
{
    public function test_encode_makes_maps_objects_where_the_schema_says_so(): void
    {
        $schema = Shape::of([
            'data' => Shape::open('Field values.'), 'tags' => [Shape::STRING], 'meta' => ['a?' => Shape::STRING],
            'either' => Shape::either(['x' => Shape::INTEGER], [Shape::STRING]), 'items' => [['values' => Shape::map(Shape::STRING)]],
            'maybe' => Shape::nullable(['a?' => Shape::STRING]),
        ])->toSchema();

        $json = json_encode(Conform::encode(['data' => [], 'tags' => [], 'meta' => [], 'either' => [], 'items' => [['values' => []]], 'maybe' => []], $schema));

        $this->assertSame('{"data":{},"tags":[],"meta":{},"either":[],"items":[{"values":{}}],"maybe":{}}', $json);
        $this->assertSame('{"a":[]}', json_encode(Conform::encode(['a' => []], null)), 'without a schema nothing is guessed');
    }

    public function test_errors_read_a_schema_strictly(): void
    {
        $schema = Shape::of(['id' => Shape::STRING, 'count?' => Shape::INTEGER_OR_NULL, 'tags' => [Shape::STRING], 'author' => Shape::nullable(['name' => Shape::STRING])])->toSchema();
        $errors = static fn (array $value) => Conform::errors(Conform::encode($value, $schema), $schema);

        $this->assertSame([], $errors(['id' => 'a', 'tags' => [], 'author' => null]));
        $this->assertSame([], $errors(['id' => 'a', 'count' => null, 'tags' => ['x'], 'author' => ['name' => 'Ada']]));
        $this->assertSame(['id' => 'is missing'], $errors(['tags' => [], 'author' => null]));
        $this->assertSame(['more' => 'is not in the schema'], $errors(['id' => 'a', 'tags' => [], 'author' => null, 'more' => 1]));
        $this->assertSame(['tags.1' => 'is int, not string'], $errors(['id' => 'a', 'tags' => ['x', 2], 'author' => null]));
        $this->assertSame(['tags' => 'is an object, not array'], $errors(['id' => 'a', 'tags' => ['k' => 'v'], 'author' => null]));
        $this->assertArrayHasKey('author', $errors(['id' => 'a', 'tags' => [], 'author' => ['name' => 'Ada', 'email' => 'x']]));
        $this->assertSame(['count' => 'is float, not integer | null'], $errors(['id' => 'a', 'count' => 1.5, 'tags' => [], 'author' => null]));
    }

    public function test_open_maps_any_values_enums_and_trees(): void
    {
        $open = Shape::of(['id' => Shape::STRING])->andMore('What a plugin adds.')->toSchema();
        $this->assertSame([], Conform::errors(Conform::encode(['id' => 'a', 'x' => [1], 'y' => ['z' => true]], $open), $open));

        $any = Shape::of(['value' => Shape::any('Whatever the field holds.'), 'kind' => Shape::enum('a', 'b')])->toSchema();
        $this->assertSame([], Conform::errors(Conform::encode(['value' => ['deep' => [1, 2]], 'kind' => 'b'], $any), $any));
        $this->assertArrayHasKey('kind', Conform::errors(Conform::encode(['value' => null, 'kind' => 'c'], $any), $any));

        $tree = Shape::of([Shape::nested(['id' => Shape::STRING], 'children', 3)])->toSchema();
        $node = static fn (string $id, array $children = []) => ['id' => $id, 'children' => $children];
        $this->assertSame([], Conform::errors(Conform::encode([$node('a', [$node('b', [$node('c', [$node('d', [$node('e')])])])])], $tree), $tree));
        $this->assertSame(['0.children.0.extra' => 'is not in the schema'], Conform::errors(Conform::encode([$node('a', [[...$node('b'), 'extra' => 1]])], $tree), $tree));

        $this->assertEquals(new stdClass, Conform::encode([], ['type' => 'object']));
        $this->assertSame([], Conform::encode([], ['type' => ['object', 'array']]));
    }

    public function test_a_map_with_keys_from_zero_is_an_object_at_every_depth(): void
    {
        $schema = Shape::of([
            'names' => Shape::map(Shape::STRING),
            'rows' => [['counts' => Shape::map(Shape::INTEGER)]],
            'open' => Shape::open('Anything by id.'),
            'by' => Shape::map(['tags' => Shape::map(Shape::STRING), 'list' => [Shape::STRING]]),
            'list' => [Shape::STRING],
        ])->toSchema();

        $encoded = Conform::encode([
            'names' => [0 => 'a', 1 => 'b'],
            'rows' => [['counts' => [3, 4]], ['counts' => []]],
            'open' => ['x', ['y']],
            'by' => [['tags' => ['t'], 'list' => ['l']]],
            'list' => ['a', 'b'],
        ], $schema);

        $this->assertSame(
            '{"names":{"0":"a","1":"b"},"rows":[{"counts":{"0":3,"1":4}},{"counts":{}}],"open":{"0":"x","1":["y"]},"by":{"0":{"tags":{"0":"t"},"list":["l"]}},"list":["a","b"]}',
            json_encode($encoded),
        );
        $this->assertSame([], Conform::errors($encoded, $schema));

        // A list where the schema names the keys is still wrong, and now says which.
        $closed = Shape::of(['meta' => ['a?' => Shape::STRING]])->toSchema();
        $this->assertSame(['meta.0' => 'is not in the schema'], Conform::errors(Conform::encode(['meta' => ['x']], $closed), $closed));
    }

    public function test_an_option_that_does_not_fit_leaves_nothing_behind(): void
    {
        // The first option turns `values` into an object and then fails on `kind`; the second wants the list.
        $schema = Shape::of(['item' => Shape::either(
            ['kind' => Shape::enum('map'), 'values' => Shape::map(Shape::STRING), 'inner' => ['data' => Shape::map(Shape::STRING)]],
            ['kind' => Shape::enum('list'), 'values' => [Shape::STRING], 'inner' => ['data' => [Shape::STRING]]],
        )])->toSchema();

        $list = Conform::encode(['item' => ['kind' => 'list', 'values' => ['a', 'b'], 'inner' => ['data' => []]]], $schema);
        $this->assertSame('{"item":{"kind":"list","values":["a","b"],"inner":{"data":[]}}}', json_encode($list));
        $this->assertSame([], Conform::errors($list, $schema));

        $map = Conform::encode(['item' => ['kind' => 'map', 'values' => ['a', 'b'], 'inner' => ['data' => []]]], $schema);
        $this->assertSame('{"item":{"kind":"map","values":{"0":"a","1":"b"},"inner":{"data":{}}}}', json_encode($map));
        $this->assertSame([], Conform::errors($map, $schema));

        // When no option fits, the value comes back as it was encoded.
        $neither = Conform::encode(['item' => ['kind' => 'other', 'values' => ['a'], 'inner' => ['data' => []]]], $schema);
        $this->assertSame('{"item":{"kind":"other","values":["a"],"inner":{"data":[]}}}', json_encode($neither));
        $this->assertNotSame([], Conform::errors($neither, $schema));
    }
}

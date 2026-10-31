<?php

declare(strict_types=1);

namespace Cms\Tests\Unit;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\Types\Url;
use Cms\Support\Schema\SchemaException;
use Cms\Support\Schema\Validator;
use PHPUnit\Framework\TestCase;

final class ValidatorTest extends TestCase
{
    private array $schema = [
        'type' => 'object',
        'properties' => [
            'title' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 10],
            'count' => ['type' => 'integer', 'minimum' => 0, 'default' => 1],
            'tags' => ['type' => 'array', 'items' => ['type' => 'string'], 'uniqueItems' => true],
            'mode' => ['type' => 'string', 'enum' => ['a', 'b']],
            'email' => ['type' => 'string', 'format' => 'email'],
            'meta' => ['type' => 'object', 'properties' => ['x' => ['type' => 'boolean']], 'additionalProperties' => false],
        ],
        'required' => ['title'],
    ];

    public function test_applies_defaults_and_accepts_valid_input(): void
    {
        $out = Validator::validate(['title' => 'Hi', 'tags' => ['a'], 'meta' => ['x' => true]], $this->schema);

        $this->assertSame(1, $out['count']);
        $this->assertSame(['a'], $out['tags']);
    }

    public function test_reports_every_error_with_paths(): void
    {
        try {
            Validator::validate(['count' => -1, 'mode' => 'c', 'email' => 'nope', 'tags' => ['a', 'a'], 'meta' => ['y' => 1]], $this->schema);
            $this->fail('Expected exception');
        } catch (SchemaException $e) {
            $this->assertArrayHasKey('title', $e->errors);
            $this->assertArrayHasKey('count', $e->errors);
            $this->assertArrayHasKey('mode', $e->errors);
            $this->assertArrayHasKey('email', $e->errors);
            $this->assertArrayHasKey('tags', $e->errors);
            $this->assertArrayHasKey('meta.y', $e->errors);
        }
    }

    public function test_coerces_cli_strings(): void
    {
        $out = Validator::validate(['title' => 'x', 'count' => '5', 'meta' => '{"x":"true"}'], $this->schema, coerce: true);

        $this->assertSame(5, $out['count']);
        $this->assertTrue($out['meta']['x']);
    }

    public function test_page_links_may_be_empty_unless_required(): void
    {
        $schema = fn (bool $required) => (new Url)->schema(Field::fromArray(['handle' => 'link', 'type' => 'url', 'reference' => true, 'required' => $required]));

        foreach (['', '/about', 'entry:01m5wn#intro', 'https://example.com', 'mailto:a@b.co', null] as $link) {
            $this->assertSame($link, Validator::validate($link, $schema(false)));
        }

        foreach ([['about', false], ['javascript:alert(1)', false], ['', true]] as [$link, $required]) {
            try {
                Validator::validate($link, $schema($required));
                $this->fail("Expected '{$link}' to be rejected");
            } catch (SchemaException) {
                $this->addToAssertionCount(1);
            }
        }
    }

    public function test_any_of_and_nullable(): void
    {
        $schema = ['anyOf' => [['type' => 'string'], ['type' => 'integer']]];
        $this->assertSame(3, Validator::validate(3, $schema));

        $this->expectException(SchemaException::class);
        Validator::validate(['x'], $schema);
    }
}

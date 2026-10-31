<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Content\Fields\Blueprint;
use Cms\Support\Schema\SchemaException;
use Cms\Tests\TestCase;

/** A field whose plugin is off stands in with its fallback, and what it stored waits for the plugin. */
final class FieldStandInTest extends TestCase
{
    private function blueprint(): Blueprint
    {
        return Blueprint::make([['handle' => 'image', 'type' => 'gone-type', 'fallback' => 'url']]);
    }

    public function test_it_edits_as_the_fallback(): void
    {
        $this->assertSame('url', $this->blueprint()->field('image')->type);
        $this->assertSame(['image' => '/a.png'], $this->blueprint()->process(['image' => '/a.png']));
    }

    public function test_what_the_real_type_stored_is_kept(): void
    {
        $this->assertSame(['image' => ['01m5wn8ra7gs5ph45nagmkawqn']], $this->blueprint()->process(['image' => ['01m5wn8ra7gs5ph45nagmkawqn']]));
    }

    public function test_anything_else_is_still_refused(): void
    {
        $this->expectException(SchemaException::class);

        $this->blueprint()->process(['image' => ['nested' => ['value']]]);
    }

    public function test_the_real_type_takes_over_when_it_is_there(): void
    {
        $blueprint = Blueprint::make([['handle' => 'title', 'type' => 'text', 'fallback' => 'url']]);

        $this->assertSame('text', $blueprint->field('title')->type);
        $this->assertNull($blueprint->field('title')->get('standsInFor'));
    }
}

<?php

declare(strict_types=1);

namespace Cms\Tests\Unit;

use Cms\Content\Fields\Field;
use Cms\Content\Fields\Types\Text;
use PHPUnit\Framework\TestCase;

/** What a field is for, as the site's schemas, the API and agents read it. */
final class FieldDescriptionTest extends TestCase
{
    public function test_instructions_come_first_then_about_then_the_label(): void
    {
        $this->assertSame('Shown under the field.', Field::fromArray(['handle' => 'a', 'type' => 'text', 'label' => 'Alt Text', 'instructions' => 'Shown under the field.', 'about' => 'For agents.'])->description());
        $this->assertSame('For agents.', Field::fromArray(['handle' => 'a', 'type' => 'text', 'label' => 'Alt Text', 'about' => 'For agents.'])->description());
        $this->assertSame('Alt Text', Field::fromArray(['handle' => 'a', 'type' => 'text', 'label' => 'Alt Text', 'about' => ''])->description());
    }

    public function test_a_schema_says_the_about_the_admin_leaves_to_its_label_and_placeholder(): void
    {
        $field = Field::fromArray(['handle' => 'alt', 'type' => 'text', 'label' => 'Alt Text', 'placeholder' => 'Decorative', 'about' => 'Describes the image for screen readers and search engines.']);

        $this->assertSame('Describes the image for screen readers and search engines.', (new Text)->schema($field)['description']);
        $this->assertNull($field->toArray()['instructions'] ?? null);
    }
}

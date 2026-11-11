<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks\Tests;

use Cms\Modules\Blocks\BlockRegistry;
use Cms\Modules\Blocks\DocumentSchema;
use Cms\Tests\TestCase;

/** content/schemas/blocks.json: what a blocks field holds, from the block types this site has. */
final class DocumentSchemaTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks'];
    }

    public function test_the_block_document_is_a_schema_file_beside_the_collections(): void
    {
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--no-interaction' => true]);
        $file = $this->site.'/content/schemas/blocks.json';

        if (! is_file($file)) {
            // The write after a migration reports its failure instead of throwing it at whoever migrated: say what it was.
            try {
                $this->app->make(\Cms\Content\Schemas\SchemaFiles::class)->write();
                $why = 'a second write made it';
            } catch (\Throwable $e) {
                $why = $e::class.': '.$e->getMessage();
            }

            $this->fail("`cms migrate` wrote no content/schemas/blocks.json ({$why}).");
        }

        $schema = json_decode((string) file_get_contents($file), true, 64, JSON_THROW_ON_ERROR);
        $this->assertSame('A block document', $schema['title']);
        $this->assertSame(['$ref' => '#/$defs/block'], $schema['items']);

        // Every block type of the site, and nothing else.
        $names = array_keys($this->app->make(BlockRegistry::class)->all());
        sort($names);
        $this->assertSame($names, array_keys($schema['$defs']['types']));
        $this->assertCount(count($names), $schema['$defs']['block']['anyOf']);

        foreach ($schema['$defs']['types'] as $name => $type) {
            $this->assertSame(['const' => $name], $type['properties']['type']);
            $this->assertSame('object', $type['properties']['props']['type']);
        }
    }

    public function test_a_type_says_which_props_it_takes_and_which_children(): void
    {
        $blocks = $this->app->make(BlockRegistry::class);
        $blocks->register(['name' => 'acme/leaf', 'title' => 'Leaf', 'fields' => [['handle' => 'label', 'type' => 'text'], ['handle' => 'size', 'type' => 'select', 'options' => ['s' => 'Small', 'l' => 'Large']]]]);
        $blocks->register(['name' => 'acme/branch', 'title' => 'Branch', 'children' => ['acme/leaf']]);
        $blocks->register(['name' => 'acme/tree', 'title' => 'Tree', 'children' => true]);

        $types = $this->app->make(DocumentSchema::class)->schema()['$defs']['types'];

        $this->assertSame(['label', 'size'], array_keys($types['acme/leaf']['properties']['props']['properties']));
        $this->assertContains('s', $types['acme/leaf']['properties']['props']['properties']['size']['enum']);
        $this->assertArrayNotHasKey('children', $types['acme/leaf']['properties']);
        // A name with a slash is one part of the pointer.
        $this->assertSame([['$ref' => '#/$defs/types/acme~1leaf']], $types['acme/branch']['properties']['children']['items']['anyOf']);
        $this->assertSame(['$ref' => '#/$defs/block'], $types['acme/tree']['properties']['children']['items']);
    }
}

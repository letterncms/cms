<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks;

use Cms\Content\Schemas\SchemaFiles;

/**
 * The JSON Schema of a block document, the value of every blocks field: a list of blocks, each one of
 * the block types this site has, with the props that type takes and the children it accepts. Written to
 * content/schemas/blocks.json beside the collections' schemas (see SchemaFiles), which say of a blocks
 * field only that it is a list of blocks.
 */
final class DocumentSchema
{
    /** Said to agents, like the descriptions of abilities: English, not translated. */
    private const string ID = 'Stable within the document. Given when left out.';

    private const string STYLE = 'Styles by property, as design tokens (token:space.8): blocks/types lists the properties of each section.';

    public function __construct(private readonly BlockRegistry $blocks) {}

    public function schema(): array
    {
        $types = [];

        foreach ($this->blocks->all() as $type) {
            $props = $type->blueprint()->schema(partial: true);
            unset($props['title'], $props['description']);

            $types[$type->name] = array_filter([
                'title' => $type->title,
                'description' => $type->description !== '' ? $type->description : null,
                'type' => 'object',
                'properties' => [
                    'type' => ['const' => $type->name],
                    'id' => ['type' => 'string', 'description' => self::ID],
                    'props' => $props,
                    'style' => ['type' => 'object', 'description' => self::STYLE],
                    // A type that takes no children has none; one that takes some names them.
                    ...match (true) {
                        $type->children === false => [],
                        $type->children === true => ['children' => ['type' => 'array', 'items' => ['$ref' => '#/$defs/block']]],
                        default => ['children' => ['type' => 'array', 'items' => ['anyOf' => array_map(static fn (string $name) => ['$ref' => '#/$defs/types/'.self::pointer($name)], $type->children)]]],
                    },
                ],
                'required' => ['type'],
            ], static fn ($value) => $value !== null);
        }

        ksort($types);

        return SchemaFiles::document(
            'A block document',
            'The value of a blocks field: a list of blocks. Each block is of one of this site\'s block types (`type`), with the props that type takes, its styles and, where the type accepts them, child blocks. A blocks field also takes Block Markdown as a string, which is read into this.',
            [
                'type' => 'array',
                'items' => ['$ref' => '#/$defs/block'],
                '$defs' => [
                    'block' => ['anyOf' => array_map(static fn (string $name) => ['$ref' => '#/$defs/types/'.self::pointer($name)], array_keys($types))],
                    'types' => $types,
                ],
            ],
        );
    }

    /** A block's name as a part of a JSON pointer: `forms/form` is one part. */
    private static function pointer(string $name): string
    {
        return str_replace(['~', '/'], ['~0', '~1'], $name);
    }
}

<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Tests\TestCase;

/** Reusable field groups: saved as checked as a collection's own fields are. */
final class FieldsetsTest extends TestCase
{
    private function save(array $fields): mixed
    {
        return $this->cms()->abilities()->execute('fieldsets/save', ['handle' => 'seo', 'title' => 'SEO', 'fields' => $fields], AbilityContext::system());
    }

    public function test_a_fieldset_is_saved_and_listed(): void
    {
        $this->save([['handle' => 'description', 'type' => 'textarea'], ['handle' => 'image', 'type' => 'text']]);

        $listed = $this->cms()->abilities()->execute('fieldsets/list', [], AbilityContext::system());

        $this->assertSame('SEO', $listed['seo']['title']);
        $this->assertSame(['description', 'image'], array_column($listed['seo']['fields'], 'handle'));
    }

    public function test_fields_are_checked_as_a_collections_are(): void
    {
        foreach ([
            'a type that does not exist' => [['handle' => 'x', 'type' => 'hologram']],
            'a handle used twice' => [['handle' => 'x', 'type' => 'text'], ['handle' => 'x', 'type' => 'text']],
            'a bad handle' => [['handle' => 'Not A Handle', 'type' => 'text']],
        ] as $what => $fields) {
            try {
                $this->save($fields);
                $this->fail("Saved a fieldset with {$what}.");
            } catch (AbilityException $e) {
                $this->assertSame('invalid_input', $e->type, $what);
            }
        }

        $this->assertArrayNotHasKey('seo', $this->cms()->abilities()->execute('fieldsets/list', [], AbilityContext::system()));
    }
}

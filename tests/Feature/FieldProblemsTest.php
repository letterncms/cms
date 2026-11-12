<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Content\Fields\FieldProblems;
use Cms\Tests\TestCase;

/** A blueprint that cannot be saved says which field is wrong, and what about it, by the field's path. */
final class FieldProblemsTest extends TestCase
{
    public function test_each_problem_is_under_the_option_it_is_about(): void
    {
        $problems = FieldProblems::of([
            ['handle' => 'intro', 'type' => 'text'],
            ['handle' => 'intro', 'type' => 'textarea'],
            ['handle' => 'Not A Handle', 'type' => 'text'],
            ['handle' => 'shape', 'type' => 'hologram'],
            ['handle' => 'status', 'type' => 'text'],
            ['import' => 'seo'],
            ['handle' => 'rows', 'type' => 'repeater', 'fields' => [['handle' => 'a', 'type' => 'text'], ['handle' => 'a', 'type' => 'hologram'], ['handle' => 'status', 'type' => 'text']]],
            ['handle' => 'box', 'type' => 'group', 'fields' => 'nothing'],
            ['type' => 'text'],
        ], ['status']);

        $this->assertSame(['fields.1.handle', 'fields.2.handle', 'fields.3.type', 'fields.4.handle', 'fields.6.fields.1.handle', 'fields.6.fields.1.type', 'fields.7.fields', 'fields.8.handle'], array_keys($problems));
        $this->assertSame([], FieldProblems::of([['handle' => 'intro', 'type' => 'text'], ['handle' => 'rows', 'type' => 'repeater', 'fields' => [['handle' => 'intro', 'type' => 'text']]]]));
    }

    public function test_saving_a_collection_a_global_or_a_fieldset_hands_them_on(): void
    {
        $fields = [['handle' => 'intro', 'type' => 'text'], ['handle' => 'shape', 'type' => 'hologram']];

        foreach ([
            'collections/save' => ['handle' => 'things', 'definition' => ['title' => 'Things', 'fields' => $fields]],
            'globals/save' => ['title' => 'Things', 'fields' => $fields],
            'fieldsets/save' => ['handle' => 'things', 'title' => 'Things', 'fields' => $fields],
        ] as $ability => $input) {
            try {
                $this->cms()->abilities()->execute($ability, $input, AbilityContext::system());
                $this->fail("{$ability} saved a field of a type that does not exist.");
            } catch (AbilityException $e) {
                $this->assertSame('invalid_input', $e->type, $ability);
                $this->assertSame(['fields.1.type'], array_keys($e->details), $ability);
            }
        }

        $this->assertNull($this->cms()->collections()->find('things'));

        try {
            $this->cms()->abilities()->execute('collections/save', ['handle' => 'things', 'definition' => ['title' => 'Things', 'fields' => [['handle' => 'status', 'type' => 'text']]]], AbilityContext::system());
            $this->fail('A reserved handle was saved.');
        } catch (AbilityException $e) {
            $this->assertSame(['fields.0.handle'], array_keys($e->details));
        }
    }
}

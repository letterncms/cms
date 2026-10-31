<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Tests\TestCase;
use Illuminate\Support\Facades\DB;

final class AbilitiesTest extends TestCase
{
    public function test_admin_can_run_and_actions_are_audited(): void
    {
        $admin = $this->admin();
        $result = $this->cms()->abilities()->execute('entries/create', ['collection' => 'pages', 'title' => 'Hi'], AbilityContext::forUser($admin, 'rest'));

        $this->assertSame('hi', $result['slug']);
        $this->assertSame(1, DB::table('audit_log')->where('ability', 'entries/create')->count());
    }

    public function test_author_cannot_publish(): void
    {
        $author = $this->userWithRole('author');
        $ctx = AbilityContext::forUser($author, 'rest');

        $entry = $this->cms()->abilities()->execute('entries/create', ['collection' => 'pages', 'title' => 'Mine'], $ctx);
        $this->assertSame('draft', $entry['status']);

        try {
            $this->cms()->abilities()->execute('entries/publish', ['id' => $entry['id']], $ctx);
            $this->fail('Author published');
        } catch (AbilityException $e) {
            $this->assertSame('forbidden', $e->type);
        }

        $this->expectException(AbilityException::class);
        $this->cms()->abilities()->execute('entries/create', ['collection' => 'pages', 'title' => 'Sneaky', 'status' => 'published'], $ctx);
    }

    public function test_invalid_input_returns_details(): void
    {
        try {
            $this->cms()->abilities()->execute('entries/create', ['collection' => 'pages'], AbilityContext::forUser($this->admin(), 'rest'));
            $this->fail('No exception');
        } catch (AbilityException $e) {
            $this->assertSame('invalid_input', $e->type);
            $this->assertArrayHasKey('title', $e->details);
        }
    }

    public function test_sub_fields_are_validated_when_a_collection_is_saved(): void
    {
        $ctx = AbilityContext::forUser($this->admin(), 'rest');
        $save = fn (array $fields) => $this->cms()->abilities()->execute('collections/save', ['handle' => 'team', 'definition' => ['title' => 'Team', 'fields' => $fields]], $ctx);

        foreach ([
            'Two fields use the handle "people.name"' => [['handle' => 'people', 'type' => 'repeater', 'fields' => [['handle' => 'name', 'type' => 'text'], ['handle' => 'name', 'type' => 'text']]]],
            'Unknown field type "nope" for field people.links.url' => [['handle' => 'people', 'type' => 'repeater', 'fields' => [['handle' => 'links', 'type' => 'group', 'fields' => [['handle' => 'url', 'type' => 'nope']]]]]],
            'The sub-fields of people must be a list' => [['handle' => 'people', 'type' => 'group', 'fields' => ['name' => ['type' => 'text']]]],
        ] as $message => $fields) {
            try {
                $save($fields);
                $this->fail("Saved invalid fields: {$message}");
            } catch (AbilityException $e) {
                $this->assertSame('invalid_input', $e->type);
                $this->assertStringContainsString($message, $e->getMessage());
            }
        }

        $saved = $save([['handle' => 'people', 'type' => 'repeater', 'fields' => [['handle' => 'name', 'type' => 'text'], ['handle' => 'links', 'type' => 'group', 'fields' => [['handle' => 'url', 'type' => 'url']]]]]]);
        $this->assertSame('url', $saved['fields'][0]['fields'][1]['fields'][0]['handle']);
    }

    public function test_token_scopes_limit_abilities(): void
    {
        $ctx = new AbilityContext($this->admin(), 'rest', scopes: ['read']);

        $this->assertNotEmpty($this->cms()->abilities()->execute('collections/list', [], $ctx));

        $this->expectException(AbilityException::class);
        $this->cms()->abilities()->execute('entries/create', ['collection' => 'pages', 'title' => 'x'], $ctx);
    }

    public function test_hidden_transport_looks_missing(): void
    {
        $this->expectExceptionMessage('Unknown ability');
        $this->cms()->abilities()->execute('tokens/create', ['name' => 'x'], AbilityContext::forUser($this->admin(), 'mcp'));
    }

    public function test_discovery_respects_permissions(): void
    {
        $names = array_keys($this->cms()->abilities()->available(AbilityContext::forUser($this->userWithRole('author'), 'rest')));

        $this->assertContains('entries/create', $names);
        $this->assertNotContains('users/delete', $names);
        $this->assertNotContains('packages/enable', $names);
    }

    public function test_guests_are_unauthenticated(): void
    {
        try {
            $this->cms()->abilities()->execute('collections/list', [], AbilityContext::forUser(null, 'rest'));
            $this->fail('Guest allowed');
        } catch (AbilityException $e) {
            $this->assertSame('unauthenticated', $e->type);
        }
    }
}

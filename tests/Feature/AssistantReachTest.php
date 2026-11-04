<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Tests\TestCase;

/** What the site promises: people, roles and tokens stay out of the assistant's reach, even for an admin. */
final class AssistantReachTest extends TestCase
{
    public function test_the_assistant_is_not_offered_people_or_roles(): void
    {
        $offered = array_map(static fn ($a) => $a->name, $this->cms()->abilities()->available(AbilityContext::forUser($this->admin(), 'assistant')));

        foreach (['users/create', 'users/update', 'users/grant', 'users/revoke', 'users/delete', 'users/invite'] as $name) {
            $this->assertNotContains($name, $offered);
        }

        // People still do all of it in the admin.
        $this->assertContains('users/create', array_map(static fn ($a) => $a->name, $this->cms()->abilities()->available(AbilityContext::forUser($this->admin(), 'admin'))));
    }

    public function test_the_assistant_cannot_change_roles_through_settings(): void
    {
        $this->expectException(AbilityException::class);

        $this->cms()->abilities()->execute('settings/update', ['namespace' => 'roles', 'values' => ['roles' => []]], AbilityContext::forUser($this->admin(), 'assistant'));
    }
}

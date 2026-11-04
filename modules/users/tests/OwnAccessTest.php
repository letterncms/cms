<?php

declare(strict_types=1);

namespace Cms\Modules\Users\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Tests\TestCase;

/** Nobody locks themselves out from the Users screen: another administrator changes their roles. */
final class OwnAccessTest extends TestCase
{
    public function test_people_keep_their_own_roles_and_super_admin(): void
    {
        $me = $this->admin();
        $ctx = AbilityContext::forUser($me, 'admin');

        // Saving one's own row unchanged, or adding a role, is fine.
        $this->cms()->abilities()->execute('users/update', ['id' => $me->id, 'name' => 'Ada', 'roles' => ['admin'], 'super' => true], $ctx);
        $this->cms()->abilities()->execute('users/update', ['id' => $me->id, 'roles' => ['admin', 'editor']], $ctx);

        foreach ([['roles' => ['editor']], ['super' => false]] as $change) {
            try {
                $this->cms()->abilities()->execute('users/update', ['id' => $me->id, ...$change], $ctx);
                $this->fail('Took away their own access: '.json_encode($change));
            } catch (AbilityException) {
            }
        }

        $me->refresh();
        $this->assertSame(['admin', 'editor'], $me->roles);
        $this->assertTrue($me->super);

        // Another administrator can.
        $other = AbilityContext::forUser($this->admin(), 'admin');
        $this->cms()->abilities()->execute('users/update', ['id' => $me->id, 'roles' => ['editor'], 'super' => false], $other);
        $this->assertSame(['editor'], $me->refresh()->roles);
    }
}

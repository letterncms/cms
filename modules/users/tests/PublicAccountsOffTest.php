<?php

declare(strict_types=1);

namespace Cms\Modules\Users\Tests;

use Cms\Tests\TestCase;

/** A site that never turned public accounts on has none of it, and loses nothing. */
final class PublicAccountsOffTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    public function test_it_is_all_off_until_a_site_turns_it_on(): void
    {
        $this->assertFalse(cms()->accounts()->enabled());
        $this->assertFalse(cms()->accounts()->signUpOpen());
        $this->assertNull(cms()->accounts()->signInUrl('/x'));
        $this->get('/sign-in')->assertNotFound();
        $this->get('/account')->assertNotFound();
        $this->post('/_cms/account/sign-up', ['email' => 'a@example.com'])->assertStatus(405);
        $this->assertNull(cms()->collections()->find('screens'));
        $this->assertNull(cms()->collections()->find('pages')->blueprint()->field('gate'));

        // The same word in a plugin's mouth still works, with no account page to send anyone to.
        $user = cms()->accounts()->ensure('a@example.com', 'A');
        cms()->accounts()->grant($user, 'x');
        $this->assertTrue(cms()->accounts()->holds($user, 'x'));
    }

    public function test_a_gated_entry_stays_closed_with_accounts_off(): void
    {
        // Stored earlier, or deployed in a file: the rule holds whether or not anyone can edit it now.
        $entry = cms()->entryService()->create('pages', ['title' => 'Closed', 'status' => 'published']);
        $entry = cms()->entries()->find($entry->id);
        $entry->data['gate'] = ['mode' => 'locked'];
        cms()->entries()->save($entry);
        cms()->entries()->gate()->forget();
        $this->assertSame('locked', cms()->entries()->gate()->rule($entry)['mode'] ?? null);
        $this->get($entry->uri)->assertNotFound();
        $this->assertSame([], cms()->entries()->query()->collection('pages')->live()->get());
    }
}

<?php

declare(strict_types=1);

namespace Cms\Modules\Sync\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Tests\TestCase;

/** The Sync screen is a view: it passes the catalog, and who may reach this site is saved in one go. */
final class ViewTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/sync'];
    }

    public function test_the_screen_resolves_and_the_switches_save_together(): void
    {
        $context = AbilityContext::forUser($this->admin(), 'admin');
        $view = $this->cms()->abilities()->execute('views/get', ['id' => 'sync', 'params' => []], $context)['root'];

        $this->assertSame('Sync', $view['props']['title']);
        $this->assertSame('sync/progress', $view['children'][0]['type']);
        // No site connected yet: the way to connect one is in the words that say so.
        $this->assertSame([], $view['props']['actions'] ?? []);
        $this->assertSame('ui/empty', $view['children'][1]['children'][0]['type']);
        $this->assertSame('Connect a Site', $view['children'][1]['children'][0]['props']['action']['label']);

        $site = $this->cms()->abilities()->execute('sync/allow', ['allow_pull' => false, 'allow_push' => true, 'key' => 'ignored'], $context);
        $this->assertSame([false, true], [$site['allow_pull'], $site['allow_push']]);
    }

    public function test_a_key_of_the_wrong_shape_is_refused_on_its_field_before_anything_is_asked(): void
    {
        $context = AbilityContext::forUser($this->admin(), 'admin');

        try {
            $this->cms()->abilities()->execute('sync/connect', ['key' => 'not a key'], $context);
            $this->fail('A key of the wrong shape connected.');
        } catch (AbilityException $e) {
            $this->assertSame('invalid_input', $e->toArray()['type']);
            $this->assertArrayHasKey('key', $e->toArray()['details']);
        }
    }
}

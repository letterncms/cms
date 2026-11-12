<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Modules\Dashboard\Start;
use Cms\Tests\TestCase;

/**
 * The guided start on a new site's Dashboard: a few steps that each lead to the real
 * screen, ticked by what happens on the site, gone when all are done or someone hides it.
 */
final class GuidedStartTest extends TestCase
{
    private function start(?AbilityContext $ctx = null): array
    {
        return $this->cms()->abilities()->execute('dashboard-start/get', [], $ctx ?? AbilityContext::forUser($this->admin(), 'admin'));
    }

    /** A site that was just installed: the guide counts from a moment ago. */
    private function install(int $ago = 60): void
    {
        \Cms\Support\Files::putJson(storage_path('app/start.json'), ['since' => time() - $ago, 'dismissed' => false]);
    }

    public function test_a_site_that_was_there_before_never_sees_it(): void
    {
        // Updated, not installed: no start.json, whatever the site holds.
        $this->assertFileDoesNotExist(storage_path('app/start.json'));
        $start = $this->start();
        $this->assertFalse($start['open']);

        // Hiding it writes nothing either: there is nothing to hide.
        $this->cms()->abilities()->execute('dashboard-start/update', ['dismissed' => true], AbilityContext::forUser($this->admin(), 'admin'));
        $this->assertFileDoesNotExist(storage_path('app/start.json'));

        // Installing starts it, once.
        $this->cms()->hooks()->dispatch('cms.installed', $this->admin());
        $this->assertTrue($this->start()['open']);
        $since = $this->app->make(Start::class)->state()['since'];
        $this->cms()->hooks()->dispatch('cms.installed', $this->admin());
        $this->assertSame($since, $this->app->make(Start::class)->state()['since']);
    }

    public function test_a_new_site_is_led_through_its_first_steps(): void
    {
        $this->install();
        $start = $this->start();

        $this->assertTrue($start['open']);
        $this->assertFalse($start['dismissed']);
        $this->assertSame(['name', 'page'], array_values(array_intersect(array_column($start['steps'], 'id'), ['name', 'page'])));

        foreach ($start['steps'] as $step) {
            $this->assertStringStartsWith('/', $step['to'], 'Every step leads to a screen of the admin.');
            $this->assertMatchesRegularExpression('/^[A-Z][a-z]+ /', $step['label'], 'Every step starts with a verb.');
        }
    }

    public function test_the_first_page_goes_where_the_sites_pages_are(): void
    {
        $this->install();
        // Before "pages" by name, and with pages of its own, but not at the root of the site.
        $this->cms()->collections()->save(\Cms\Content\Collections\Collection::fromArray('articles', ['title' => 'Articles', 'route' => '/articles/{slug}', 'fields' => []]));
        $this->cms()->collections()->save(\Cms\Content\Collections\Collection::fromArray('authors', ['title' => 'Authors', 'fields' => []]));
        $page = static fn (array $start) => array_values(array_filter($start['steps'], static fn (array $s) => $s['id'] === 'page'))[0]['to'];

        $this->assertSame('/content/pages/new', $page($this->start()));

        // Without a collection at the root, the first with pages of its own.
        $this->cms()->collections()->delete('pages');
        $this->assertSame('/content/articles/new', $page($this->start()));
    }

    public function test_a_step_is_done_when_the_site_says_so(): void
    {
        $admin = $this->admin();
        $ctx = AbilityContext::forUser($admin, 'admin');
        $done = fn () => array_column($this->start($ctx)['steps'], 'done', 'id');
        $page = array_values(array_filter($this->start($ctx)['steps'], static fn (array $s) => $s['id'] === 'page'))[0];
        $collection = explode('/', $page['to'])[2];

        // What was there when the site was ready (the site kit's pages) is not the first page someone made.
        $this->cms()->abilities()->execute('entries/create', ['collection' => $collection, 'title' => 'From the starter'], $ctx);
        $this->install(-60);
        $this->assertFalse($done()['page']);

        $this->install(60);
        $this->assertTrue($done()['page'], 'an entry made since');

        // The site's name is read from where it is set.
        $this->cms()->settingsRegistry()->save('site', ['name' => cms_brand()]);
        $this->assertFalse($done()['name']);
        $this->cms()->settingsRegistry()->save('site', ['name' => 'Harbour Books']);
        $this->assertTrue($done()['name']);

        // An agent that holds a token is connected, whoever connected it.
        if (array_key_exists('agent', $done())) {
            $this->assertFalse($done()['agent']);
            $admin->tokens()->create(['name' => 'MCP: Claude', 'token_hash' => hash('sha256', 'x'), 'scopes' => ['*']]);
            $this->assertTrue($done()['agent']);
        }

        // The design counts once it was saved after the site was ready.
        if (array_key_exists('design', $done())) {
            \Cms\Support\Files::put(content_path('design/tokens.json'), '{}');
            touch(content_path('design/tokens.json'), time() - 3600);
            clearstatcache();
            $this->assertFalse($done()['design']);
            touch(content_path('design/tokens.json'), time());
            clearstatcache();
            $this->assertTrue($done()['design']);
        }
    }

    public function test_it_closes_when_every_step_is_done_or_someone_hides_it(): void
    {
        $ctx = AbilityContext::forUser($this->admin(), 'admin');
        $this->install();
        $this->cms()->hooks()->addFilter('dashboard.start', static fn (array $steps) => array_map(static fn (array $step) => [...$step, 'done' => true], $steps), 99);
        $this->assertFalse($this->start($ctx)['open'], 'Every step done: nothing left to show.');
    }

    public function test_someone_who_manages_settings_hides_it_and_shows_it_again(): void
    {
        $ctx = AbilityContext::forUser($this->admin(), 'admin');
        $this->install();
        $this->assertTrue($this->start($ctx)['open']);

        $hidden = $this->cms()->abilities()->execute('dashboard-start/update', ['dismissed' => true], $ctx);
        $this->assertSame([true, false], [$hidden['dismissed'], $hidden['open']]);
        $this->assertTrue($this->cms()->abilities()->execute('dashboard-start/update', ['dismissed' => false], $ctx)['open']);
    }

    public function test_plugins_add_steps_and_only_who_manages_settings_hides_it(): void
    {
        $this->install();
        $this->cms()->hooks()->addFilter('dashboard.start', static fn (array $steps) => [...$steps, ['id' => 'shop', 'label' => 'Add a Product', 'to' => '/shop/new', 'done' => false]]);
        $steps = array_column($this->start()['steps'], null, 'id');
        $this->assertSame(['id' => 'shop', 'label' => 'Add a Product', 'to' => '/shop/new', 'done' => false], $steps['shop']);

        $author = \Cms\Users\User::query()->create(['name' => 'Ann', 'email' => 'ann@example.com', 'password' => 'x', 'roles' => ['author']]);
        $this->assertArrayNotHasKey('name', array_column($this->start(AbilityContext::forUser($author, 'admin'))['steps'], null, 'id'));

        $this->expectException(AbilityException::class);
        $this->cms()->abilities()->execute('dashboard-start/update', ['dismissed' => true], AbilityContext::forUser($author, 'admin'));
    }

    protected function tearDown(): void
    {
        @unlink(storage_path('app/start.json'));
        parent::tearDown();
    }
}

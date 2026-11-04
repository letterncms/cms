<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Tests\TestCase;
use Cms\Users\User;

/** The admin's places as data: checked against the catalog, fitted to who looks, and the only way they are drawn. */
final class ViewsTest extends TestCase
{
    private function page(array $children, array $props = []): array
    {
        return ['type' => 'ui/page', 'props' => ['title' => 'Things', ...$props], 'children' => $children];
    }

    private function resolved(string $id, User $user, array $params = []): array
    {
        return $this->cms()->abilities()->execute('views/get', ['id' => $id, 'params' => $params], AbilityContext::forUser($user, 'admin'));
    }

    public function test_a_view_comes_back_checked_with_its_path(): void
    {
        $this->cms()->views()->register('things', '/things/:id', fn (User $user, array $params) => $this->page([
            ['type' => 'ui/records', 'props' => ['label' => 'Things', 'source' => ['ability' => 'audit/list'], 'columns' => [['key' => 'label', 'label' => 'Change']]]],
        ], ['title' => 'Thing '.$params['id']]));

        $view = $this->resolved('things', $this->admin(), ['id' => '7']);

        $this->assertSame('/things/:id', $view['path']);
        $this->assertSame('Thing 7', $view['root']['props']['title']);
        $this->assertSame('ui/records', $view['root']['children'][0]['type']);
        $this->assertContains(['id' => 'things', 'path' => '/things/:id', 'package' => null, 'private' => false], $this->cms()->views()->forUser($this->admin()));
    }

    public function test_an_unknown_component_or_a_wrong_prop_is_refused(): void
    {
        $this->cms()->views()->register('odd', '/odd', $this->page([['type' => 'ui/marquee']]));
        $this->cms()->views()->register('typo', '/typo', $this->page([['type' => 'ui/text', 'props' => ['txt' => 'Hello']]]));

        foreach (['odd', 'typo'] as $id) {
            try {
                $this->resolved($id, $this->admin());
                $this->fail("{$id} was accepted.");
            } catch (AbilityException $e) {
                $this->assertSame('invalid_input', $e->type);
            }
        }
    }

    public function test_what_someone_may_not_see_or_do_is_left_out(): void
    {
        $this->cms()->views()->register('mixed', '/mixed', $this->page([
            ['type' => 'ui/text', 'props' => ['text' => 'For everyone']],
            ['type' => 'ui/text', 'can' => 'users.manage', 'props' => ['text' => 'For people managers']],
            ['type' => 'ui/actions', 'props' => ['items' => [
                ['label' => 'Remove Everyone', 'ability' => 'users/delete', 'input' => ['id' => '{row.id}']],
                ['label' => 'Go Home', 'to' => '/'],
            ]]],
        ]));

        $editor = $this->resolved('mixed', $this->userWithRole('editor'));
        $texts = array_column(array_column(array_filter($editor['root']['children'], static fn ($n) => $n['type'] === 'ui/text'), 'props'), 'text');
        $this->assertSame(['For everyone'], $texts);
        $this->assertSame(['Go Home'], array_column($editor['root']['children'][1]['props']['items'], 'label'));

        $admin = $this->resolved('mixed', $this->admin());
        $this->assertCount(3, $admin['root']['children']);
        $this->assertCount(2, $admin['root']['children'][2]['props']['items']);
    }

    public function test_a_view_behind_a_permission_is_neither_listed_nor_served(): void
    {
        $this->cms()->views()->register('secret', '/secret', $this->page([]), permission: 'users.manage');
        $editor = $this->userWithRole('editor');

        $this->assertNotContains('secret', array_column($this->cms()->views()->forUser($editor), 'id'));
        $this->expectException(AbilityException::class);
        $this->resolved('secret', $editor);
    }

    public function test_words_are_read_in_the_users_language_and_data_stays_as_written(): void
    {
        // "Main" is a word in some dictionary; as a menu's name it is the menu's name.
        $this->cms()->views()->register('words', '/words', fn () => $this->page([
            ['type' => 'ui/text', 'props' => ['text' => '{row.name}']],
            ['type' => 'ui/text', 'props' => ['text' => 'Main']],
        ], ['title' => __('Settings')]));
        app(\Cms\Admin\Translations::class)->apply('nl');

        $view = $this->resolved('words', $this->admin(['locale' => 'nl']));

        $this->assertSame('Instellingen', $view['root']['props']['title']);
        $this->assertSame('{row.name}', $view['root']['children'][0]['props']['text']);
        $this->assertSame('Main', $view['root']['children'][1]['props']['text']);
    }

    public function test_a_view_shipped_as_a_file_is_translated_for_it(): void
    {
        $file = sys_get_temp_dir().'/cms-view-'.bin2hex(random_bytes(3)).'.json';
        file_put_contents($file, json_encode(['path' => '/filed', 'view' => $this->page([['type' => 'ui/empty', 'props' => ['title' => 'Settings']]], ['title' => 'Settings'])]));
        $this->cms()->views()->registerFile($file);
        app(\Cms\Admin\Translations::class)->apply('nl');

        $view = $this->resolved(basename($file, '.json'), $this->admin(['locale' => 'nl']));
        unlink($file);

        $this->assertSame('Instellingen', $view['root']['props']['title']);
        $this->assertSame('Instellingen', $view['root']['children'][0]['props']['title']);
    }

    public function test_other_plugins_add_to_a_view_through_its_filter(): void
    {
        $this->cms()->views()->register('base', '/base', $this->page([]));
        $this->cms()->hooks()->addFilter('view.base', fn (array $view) => [...$view, 'children' => [['type' => 'ui/text', 'props' => ['text' => 'Added']]]]);

        $this->assertSame('Added', $this->resolved('base', $this->admin())['root']['children'][0]['props']['text']);
    }

    public function test_settings_pages_and_the_audit_log_are_views(): void
    {
        $admin = $this->admin();
        $settings = $this->resolved('settings', $admin, ['namespace' => 'site']);

        $this->assertSame('ui/settings', $settings['root']['children'][0]['children'][0]['children'][0]['type']);
        $this->assertSame('ui/records', $this->resolved('audit', $admin)['root']['children'][0]['children'][0]['children'][0]['type']);
        $this->assertSame('ui/empty', $this->resolved('settings', $admin, ['namespace' => 'nothing'])['root']['children'][0]['type']);
    }

    public function test_an_assistant_reply_cannot_bind_abilities_by_itself(): void
    {
        $catalog = array_column($this->app->make(\Cms\Admin\Surface::class)->catalog($this->admin()), null, 'id');

        $this->assertArrayHasKey('ui/stat', $catalog);
        $this->assertArrayNotHasKey('source', (array) $catalog['ui/stat']['props']['properties']);
        $this->assertArrayNotHasKey('action', (array) $catalog['ui/notice']['props']['properties']);
        $this->assertArrayNotHasKey('ui/records', $catalog);
    }
}

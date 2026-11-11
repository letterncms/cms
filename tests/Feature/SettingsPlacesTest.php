<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Admin\Manifest;
use Cms\Support\Files;
use Cms\Tests\TestCase;

/**
 * Where a plugin's settings are, in one place each: for a plugin with a screen of
 * its own, that screen's Settings tab, which /settings/<namespace> leads to and the
 * settings sidebar does not repeat; without one, under Plugins in the settings
 * sidebar, named by the plugin, wherever it asked to go.
 */
final class SettingsPlacesTest extends TestCase
{
    protected function plugins(): array
    {
        return ['acme/links'];
    }

    protected function prepareSite(string $site): void
    {
        Files::put($site.'/plugins/links/composer.json', (string) json_encode([
            'name' => 'acme/links',
            'type' => 'cms-plugin',
            'version' => '1.0.0',
            'autoload' => ['psr-4' => ['Acme\\Links\\' => 'src/']],
            'extra' => ['cms' => ['provider' => 'Acme\\Links\\LinksPlugin', 'label' => 'Links']],
        ]));
        Files::put($site.'/plugins/links/src/LinksPlugin.php', <<<'PHP'
            <?php
            namespace Acme\Links;
            final class LinksPlugin extends \Cms\Packages\Plugin
            {
                public function boot(): void
                {
                    $settings = $this->cms()->settingsRegistry();
                    // No section: it goes under Plugins.
                    $settings->register('links', fields: [['handle' => 'target', 'type' => 'text', 'label' => 'Target']]);
                    // A core group asked for: still under Plugins, a plugin never slips into the core's groups.
                    $settings->register('shortener', 'Shortener', [['handle' => 'domain', 'type' => 'text', 'label' => 'Domain']], section: 'site');
                    // A screen that lives in settings, like Languages.
                    $this->cms()->admin()->nav('redirects', ['label' => 'Redirect Rules', 'path' => '/redirect-rules', 'section' => 'people']);
                    // A screen of its own in the sidebar, which keeps its settings as a tab.
                    $this->cms()->admin()->nav('clicks', ['label' => 'Clicks', 'path' => '/clicks', 'section' => 'content']);
                    $settings->register('clicks', 'Clicks', [['handle' => 'days', 'type' => 'number', 'label' => 'Days']], home: 'clicks');
                    $this->cms()->admin()->widget('links-recent', ['label' => 'Links', 'description' => 'Recent links.']);
                }
            }
            PHP);
    }

    public function test_a_plugins_settings_go_under_plugins_by_its_name(): void
    {
        $result = $this->cms()->adminNav()->forUser($this->admin());
        $settings = array_column($result['settingsNav'], null, 'id');

        // The core's groups, then Plugins: alphabetical, whatever order or group they were registered with.
        // The settings a plugin keeps on its own screen are not among them.
        $this->assertSame(['account', 'people', 'plugins'], array_keys($settings));
        $this->assertSame('Plugins', $settings['plugins']['label']);
        $this->assertSame(['settings.links', 'redirects', 'settings.shortener'], $settings['plugins']['items']);
        $this->assertNotContains('settings.shortener', $settings['account']['items']);
        $this->assertNotContains('redirects', $settings['people']['items']);

        $nav = array_column($result['nav'], null, 'id');
        $this->assertSame('Links', $nav['settings.links']['label']);
        $this->assertSame('/settings/links', $nav['settings.links']['path']);
        $this->assertSame('acme/links', $nav['settings.links']['package']);
    }

    public function test_settings_kept_with_a_screen_are_its_settings_tab(): void
    {
        $result = $this->cms()->adminNav()->forUser($this->admin());
        $nav = array_column($result['nav'], null, 'id');

        // Its one place is the screen's Settings tab: /settings/clicks and every link to it lead there, and no sidebar lists it.
        $this->assertSame('/clicks?tab=settings', $nav['settings.clicks']['path']);
        $this->assertSame('clicks', $nav['settings.clicks']['home']);
        $this->assertNotContains('settings.clicks', array_merge(...array_column($result['settingsNav'], 'items')));
        $this->assertNotContains('settings.clicks', array_merge(...array_column($result['sidebar']['sections'], 'items')));
        $this->assertSame('clicks', array_column($this->app->make(Manifest::class)->build($this->admin())['settings'], 'home', 'namespace')['clicks']);
    }

    public function test_a_plugins_screen_is_in_the_sidebar_from_the_start(): void
    {
        $sidebar = $this->cms()->adminNav()->forUser($this->admin())['sidebar'];

        $this->assertContains('clicks', array_column($sidebar['sections'], 'items', 'id')['content']);
        $this->assertNotContains('clicks', $sidebar['hidden']);
    }
}

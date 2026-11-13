<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Install\AgentsGuide;
use Cms\Tests\TestCase;

/** With the modules that build a site and serve agents on, the guide says how to use them. */
final class AgentsGuideSiteTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site', 'letterncms/mcp'];
    }

    public function test_the_guide_covers_the_build_the_design_and_mcp(): void
    {
        $guide = $this->app->make(AgentsGuide::class)->render();

        $this->assertStringContainsString('php cms build --strict --json', $guide);
        $this->assertStringContainsString('php cms links:check', $guide);
        $this->assertStringContainsString('builds its pages as static files into `public/`', $guide);
        $this->assertStringContainsString('at `http://localhost/mcp`', $guide);
        $this->assertStringContainsString('Block Markdown ('.cms_brand('docs_url').'/reference/block-markdown)', $guide);
        $this->assertStringContainsString('`content/design/tokens.json`', $guide);
        $this->assertStringContainsString('`content/design/scripts`', $guide);
        $this->assertStringContainsString('`design-code/save`', $guide);

        $this->assertStringContainsString('never edit `public/`, `vendor/`, `storage/` or a plugin Composer or the store installed', $guide);

        // What it names is there: commands, and abilities written as `group/name`.
        $commands = array_keys($this->app->make(\Illuminate\Contracts\Console\Kernel::class)->all());
        preg_match_all('/php cms ([a-z:]+)/', $guide, $named);
        $this->assertSame([], array_values(array_diff(array_unique($named[1]), $commands)));

        foreach (['abilities/list', 'collections/schema', 'entries/create', 'blocks/types', 'design/get', 'design/update', 'design-code/list', 'design-code/get', 'design-code/save'] as $name) {
            $this->assertStringContainsString($name, $guide);
            $this->assertTrue($this->cms()->abilities()->has($name), $name);
        }
    }

    /** The setup in the browser, which the zip leads to: its last request writes the same guide, build section included. */
    public function test_the_browser_setup_writes_the_guide_with_the_build_section(): void
    {
        $this->assertFileDoesNotExist($this->site.'/AGENTS.md');

        $this->actingAs($this->admin())->postJson('/install/finish')->assertOk()->assertJsonPath('ok', true);

        $guide = (string) file_get_contents($this->site.'/AGENTS.md');
        $this->assertStringContainsString('## Build and check', $guide);
        $this->assertStringContainsString('php cms build --strict --json', $guide);
        $this->assertStringContainsString('php cms links:check', $guide);
        $this->assertStringContainsString('## MCP', $guide);
    }

    public function test_a_site_site_that_fails_does_not_cost_the_site_its_guide(): void
    {
        $this->cms()->hooks()->on('cms.installed', static function (): never {
            throw new \RuntimeException('The site broke.');
        });

        $this->app->make(\Cms\Install\Installer::class)->finish($this->admin());

        $this->assertFileExists($this->site.'/AGENTS.md');
    }

    public function test_the_guide_gives_away_nothing_of_this_machine(): void
    {
        file_put_contents($this->site.'/.env', "APP_KEY=base64:2fl+Ktvkfl+Fuz4Qp/A75G2RTiWVA/ZoKZvp6fiiM10=\nDB_PASSWORD=hunter2-very-secret\nCMS_STORE_SECRET=sk_live_abcdef123456\n", FILE_APPEND);

        $guide = $this->app->make(AgentsGuide::class)->render();

        // Paths are told from the site's folder, never from the disk's root.
        $this->assertStringNotContainsString($this->site, $guide);
        $this->assertStringNotContainsString(sys_get_temp_dir(), $guide);
        $this->assertStringNotContainsString(base_path(), $guide);

        foreach (['2fl+Ktvkfl+Fuz4Qp', 'hunter2-very-secret', 'sk_live_abcdef123456', (string) config('app.key')] as $secret) {
            $this->assertStringNotContainsString($secret, $guide);
        }
    }
}

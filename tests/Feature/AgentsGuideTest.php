<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Install\AgentsGuide;
use Cms\Install\Installer;
use Cms\Tests\TestCase;

/** A new site starts with an AGENTS.md that is true of it, and keeps it. */
final class AgentsGuideTest extends TestCase
{
    public function test_finishing_an_install_writes_the_guide_from_the_site_as_it_is(): void
    {
        $file = $this->site.'/AGENTS.md';
        $this->assertFileDoesNotExist($file);

        $this->app->make(Installer::class)->finish($this->admin());

        $guide = (string) file_get_contents($file);
        $this->assertStringStartsWith("# Test site\n", $guide);
        $this->assertStringContainsString('made with '.cms_brand().' '.\Cms\Cms::VERSION, $guide);
        $this->assertStringContainsString('php cms run abilities/list --json', $guide);
        $this->assertStringContainsString('php cms run collections/schema handle=pages', $guide);
        $this->assertStringContainsString('--dry-run', $guide);
        $this->assertStringContainsString('Never write to the database', $guide);
        $this->assertStringContainsString(cms_brand('docs_url'), $guide);
        // The collections of this site, and where each keeps its entries.
        $this->assertStringContainsString('`posts` (Posts, in the database)', $guide);
        $this->assertStringContainsString('`notes` (Notes, files in `content/collections/notes/`)', $guide);
        // Every module that is on, by the name the Modules screen gives it; nothing that is off.
        foreach ($this->cms()->packages()->active() as $package) {
            $this->assertStringContainsString("{$package->label} (`{$package->name}`)", $guide);
        }
        $this->assertStringContainsString('- Plugins: none.', $guide);
        // This site has no Site, Blocks or MCP module on: the guide doesn't send an agent to what isn't there.
        $this->assertStringNotContainsString('php cms build', $guide);
        $this->assertStringNotContainsString('## MCP', $guide);
        $this->assertStringNotContainsString('Block Markdown', $guide);
        $this->assertStringNotContainsString('content/design', $guide);
    }

    public function test_the_guide_belongs_to_the_site_once_it_is_there(): void
    {
        $file = $this->site.'/AGENTS.md';
        file_put_contents($file, "# Ours\n");

        $this->assertFalse($this->app->make(AgentsGuide::class)->write());
        $this->app->make(Installer::class)->finish($this->admin());

        $this->assertSame("# Ours\n", file_get_contents($file));
    }

    public function test_every_command_and_ability_the_guide_names_exists(): void
    {
        $guide = $this->app->make(AgentsGuide::class)->render();
        $commands = array_keys($this->app->make(\Illuminate\Contracts\Console\Kernel::class)->all());

        preg_match_all('/php cms ([a-z:]+)/', $guide, $named);
        $this->assertNotEmpty($named[1]);
        $this->assertSame([], array_values(array_diff(array_unique($named[1]), $commands)));

        // Above the list of packages, a `group/name` is an ability.
        $guide = explode('## What is on', $guide)[0];
        preg_match_all('/`([a-z-]+\/[a-z-]+)`|cms run ([a-z-]+\/[a-z-]+)/', $guide, $abilities);
        $names = array_unique(array_filter([...$abilities[1], ...$abilities[2]], static fn (string $name) => $name !== '' && ! str_contains($name, 'content/') && ! str_ends_with($name, '/mcp')));
        $this->assertNotEmpty($names);

        foreach ($names as $name) {
            $this->assertTrue($this->cms()->abilities()->has($name), "The guide names {$name}, which this site doesn't have.");
        }
    }
}

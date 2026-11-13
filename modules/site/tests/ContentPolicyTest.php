<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Abilities\AbilityException;
use Cms\Modules\Site\Build\SiteBuilder;
use Cms\Modules\Site\Http\ContentPolicy;
use Cms\Support\Files;
use Cms\Tests\TestCase;

/** The public pages' security policy: off until the site turns it on, then in public/.htaccess and on what PHP answers. */
final class ContentPolicyTest extends TestCase
{
    private const string THEME = 'try{var t=localStorage.getItem("cms-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}';

    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    protected function collections(): array
    {
        return ['pages' => ['title' => 'Pages', 'route' => '/{slug}', 'fields' => [['handle' => 'content', 'type' => 'blocks', 'body' => true]]]];
    }

    private static function hash(string $script): string
    {
        return "'sha256-".base64_encode(hash('sha256', $script, true))."'";
    }

    private function page(string $title, array $blocks = []): void
    {
        $this->cms()->entryService()->create('pages', ['title' => $title, 'status' => 'published', 'data' => ['content' => $blocks ?: [['type' => 'paragraph', 'props' => ['text' => $title]]]]]);
    }

    private function build(): string
    {
        $status = $this->app->make(SiteBuilder::class)->buildAll();
        $this->assertSame([], $status['errors']);

        return (string) file_get_contents(public_path('.htaccess'));
    }

    public function test_only_what_a_head_or_a_foot_runs_is_read(): void
    {
        $found = ContentPolicy::read([
            '<script>one()</script>',
            '<script type="module">two()</script><script type="importmap">{"imports":{}}</script>',
            '<script type="application/ld+json">{"@type":"Thing"}</script><script type="text/plain" data-cms-consent="marketing">later()</script>',
            '<script data-type="text/plain" data-src="https://not.example.com/x.js">inline()</script><script type="text/template">tpl()</script>',
            '<script src="https://js.example.com/api.js?x=1" async defer></script><script type="module" src="/_cms/code/scripts/a.js"></script>',
            '<link rel="stylesheet" href="https://fonts.example.com/css"><link rel="stylesheet" href="/_cms/design.css"><link rel="preload" href="https://other.example.com/x">',
        ]);

        // A script waiting for consent runs as itself once given; `data-type` and `data-src` are other attributes.
        $this->assertSame([self::hash('one()'), self::hash('two()'), self::hash('{"imports":{}}'), self::hash('later()'), self::hash('inline()')], $found['script']);
        $this->assertSame(['script' => ['https://js.example.com'], 'style' => ['https://fonts.example.com']], $found['hosts']);

        foreach (['player.example.com' => 'player.example.com', ' *.Example.com ' => '*.example.com', 'https://example.com/embed/x?y' => 'https://example.com', 'example.com:8443' => 'example.com:8443'] as $host => $named) {
            $this->assertSame($named, ContentPolicy::host($host));
        }

        foreach (['example', 'http://example.com', "example.com; script-src *", 'example.com"', "'unsafe-inline'", '*', 'data:', '', null, ['x']] as $host) {
            $this->assertNull(ContentPolicy::host($host), json_encode($host));
        }
    }

    public function test_a_site_that_was_there_before_gets_the_cms_lines_and_no_policy_until_it_asks(): void
    {
        Files::put(public_path('.htaccess'), "# The site's own.\nOptions -Indexes\n");
        $this->page('One');

        $this->cms()->hooks()->dispatch('cms.migrated');
        $htaccess = (string) file_get_contents(public_path('.htaccess'));

        $this->assertStringStartsWith("# The site's own.\nOptions -Indexes\n\n# BEGIN cms", $htaccess);
        $this->assertStringContainsString('Header set X-Content-Type-Options "nosniff"', $htaccess);
        $this->assertStringNotContainsString('Content-Security-Policy', $htaccess);
        $this->assertStringEndsWith("# END cms\n", $htaccess);
        $this->assertFileExists(public_path('media/.htaccess'), 'the media library\'s rules reach it the same way');

        $this->assertSame($htaccess, $this->build(), 'written once, and again only when it differs');
        $this->assertFalse($this->get('/one')->assertOk()->headers->has('Content-Security-Policy'));
    }

    public function test_the_policy_names_what_the_pages_run_and_reaches_built_and_answered_pages(): void
    {
        $context = \Cms\Abilities\AbilityContext::system('test');
        // A dark mode puts the saved theme's script in every head; a plugin's snippet goes in a foot.
        $this->cms()->abilities()->execute('design/update', ['dark' => ['color.background' => '#111111']], $context);
        $snippet = true;
        $this->cms()->hooks()->addFilter('site.foot', static function (array $foot) use (&$snippet) {
            return $snippet ? [...$foot, '<script>snippet()</script>', '<script src="https://js.example.com/api.js"></script>'] : $foot;
        });
        $this->page('One', [['type' => 'video', 'props' => ['url' => 'https://vimeo.com/123456']]]);
        // Content that names a script is not the site's code: what it says is never hashed.
        $this->page('Two', [['type' => 'paragraph', 'props' => ['text' => 'Words <script>stolen()</script>']]]);
        Files::put(public_path('.htaccess'), "Options -Indexes\n");

        $this->cms()->settingsRegistry()->save('site', ['csp' => true, 'csp_hosts' => ['Player.Example.com', 'https://api.example.com/v1', 'player.example.com']]);
        $this->assertSame(['player.example.com', 'https://api.example.com'], $this->cms()->setting('site', 'csp_hosts'));

        $htaccess = $this->build();
        $this->assertSame(1, substr_count($htaccess, '# BEGIN cms'));
        $this->assertStringStartsWith("Options -Indexes\n\n# BEGIN cms", $htaccess);
        $this->assertSame(1, preg_match('/Header set Content-Security-Policy "([^"\n]+)"/', $htaccess, $m));
        $policy = $m[1];

        $this->assertStringContainsString("default-src 'self'; script-src 'self' 'wasm-unsafe-eval' ", $policy);
        $this->assertStringContainsString(self::hash(self::THEME), $policy);
        $this->assertStringContainsString(self::hash('snippet()'), $policy);
        $this->assertStringNotContainsString(self::hash('stolen()'), $policy);
        $this->assertStringContainsString(' https://js.example.com player.example.com https://api.example.com; style-src ', $policy, 'the host a foot loads a script from, then the listed ones');
        $this->assertStringContainsString("style-src 'self' 'unsafe-inline' player.example.com", $policy);
        $this->assertStringContainsString("img-src 'self' data: blob: player.example.com", $policy);
        $this->assertStringContainsString("font-src 'self' player.example.com", $policy);
        $this->assertStringContainsString("connect-src 'self' data: blob: player.example.com", $policy);
        $this->assertStringContainsString("frame-src 'self' www.youtube-nocookie.com player.vimeo.com ", $policy);
        $this->assertStringContainsString("object-src 'none'; base-uri 'self'; form-action 'self' player.example.com", $policy);
        $this->assertStringNotContainsString("'unsafe-eval'", $policy);
        $this->assertDoesNotMatchRegularExpression("/script-src[^;]*'unsafe-inline'/", $policy);

        // What PHP answers carries the same policy.
        $response = $this->get('/one')->assertOk();
        $this->assertSame($policy, $response->headers->get('Content-Security-Policy'));
        $this->assertSame('nosniff', $response->headers->get('X-Content-Type-Options'));
        $this->assertSame($policy, $this->get('/nothing-here')->assertNotFound()->headers->get('Content-Security-Policy'));

        // The admin, a preview and the builder's canvas are not public pages.
        $entry = $this->cms()->entries()->findByUri('/one');
        $this->actingAs($this->admin());
        $admin = (string) $this->get('/admin')->headers->get('Content-Security-Policy');
        $this->assertStringNotContainsString('sha256-', $admin);
        // The canvas shows embeds and plugins' players as the site does: the admin frames what the site's pages may.
        $this->cms()->hooks()->addFilter('site.policy', static fn (array $policy) => [...$policy, 'frame-src' => [...$policy['frame-src'], 'player.plugin.example']]);
        $admin = (string) $this->get('/admin')->headers->get('Content-Security-Policy');
        $this->assertMatchesRegularExpression("/frame-src 'self' [^;]*open\\.spotify\\.com[^;]*player\\.plugin\\.example/", $admin);
        $this->assertStringContainsString('www.google.com', $admin);
        $this->assertFalse($this->get('/__preview/'.strtolower($entry->id))->assertOk()->headers->has('Content-Security-Policy'));
        $this->assertFalse($this->get('/__specimen/buttons')->assertOk()->headers->has('Content-Security-Policy'));

        // A script no page carries any more leaves the policy with the next full build.
        $snippet = false;
        $this->app->make(SiteBuilder::class)->queue(null, 'again');
        $after = $this->build();
        $this->assertStringNotContainsString(self::hash('snippet()'), $after);
        $this->assertStringNotContainsString('js.example.com', $after);
        $this->assertStringContainsString(self::hash(self::THEME), $after);

        // Turned off, the CMS's lines stay and the policy goes.
        $this->cms()->settingsRegistry()->save('site', ['csp' => false]);
        $off = (string) file_get_contents(public_path('.htaccess'));
        $this->assertStringNotContainsString('Content-Security-Policy', $off);
        $this->assertStringContainsString('X-Content-Type-Options', $off);
    }

    public function test_it_goes_out_after_a_full_build_names_outside_files_and_can_only_report(): void
    {
        $this->page('One', [
            ['type' => 'image', 'props' => ['image' => 'https://img.example.com/harbour.jpg', 'alt' => 'The harbour']],
            ['type' => 'video', 'props' => ['url' => 'https://files.example.com/tide.mp4']],
        ]);
        // Many scripts at once: the policy keeps every one the pages carry, the theme's and import map's first of all.
        $this->cms()->hooks()->addFilter('site.foot', static fn (array $foot) => [...$foot, ...array_map(static fn (int $i) => "<script>n({$i})</script>", range(1, 130))]);
        Files::put(public_path('.htaccess'), "Options -Indexes\n");

        // Turned on, nothing has been built yet: nosniff, and no policy that could leave out a page's script.
        $this->cms()->settingsRegistry()->save('site', ['csp' => true]);
        $this->assertStringNotContainsString('Content-Security-Policy', (string) file_get_contents(public_path('.htaccess')));
        $this->assertFalse($this->get('/nothing-here')->headers->has('Content-Security-Policy'));

        $htaccess = $this->build();
        $this->assertSame(1, preg_match('/Header set Content-Security-Policy "([^"\n]+)"/', $htaccess, $m));
        $this->assertStringContainsString("img-src 'self' data: blob: https://img.example.com", $m[1]);
        $this->assertStringContainsString("media-src 'self' blob: https://files.example.com", $m[1]);
        $this->assertStringContainsString(self::hash('n(130)'), $m[1]);
        $this->assertNotNull($this->get('/nothing-here')->headers->get('Content-Security-Policy'));

        // Report Only: the same policy under the other name, in both places.
        $this->cms()->settingsRegistry()->save('site', ['csp_report_only' => true]);
        $this->assertStringContainsString('Header set Content-Security-Policy-Report-Only "', (string) file_get_contents(public_path('.htaccess')));
        $answer = $this->get('/nothing-here');
        $this->assertNotNull($answer->headers->get('Content-Security-Policy-Report-Only'));
        $this->assertFalse($answer->headers->has('Content-Security-Policy'));
    }

    public function test_a_host_that_is_none_is_refused_by_name_and_a_new_site_starts_with_the_policy(): void
    {
        try {
            $this->cms()->settingsRegistry()->save('site', ['csp_hosts' => ['player.example.com', "evil.example.com; script-src *"]]);
            $this->fail('took a host that would rewrite the policy');
        } catch (AbilityException $e) {
            $this->assertStringContainsString('evil.example.com; script-src *', $e->getMessage());
        }

        $this->assertFalse((bool) $this->cms()->setting('site', 'csp', false));
        $this->cms()->hooks()->dispatch('cms.installed', $this->admin());
        $this->assertTrue((bool) $this->cms()->setting('site', 'csp'));

        // Plugins add to it by name: a captcha's frames, a beacon's address.
        $this->cms()->hooks()->addFilter('site.policy', static fn (array $policy) => [...$policy, 'frame-src' => [...$policy['frame-src'], 'challenges.example.com'], 'bad src' => ['x'], 'img-src' => [...$policy['img-src'], 'x"; y']]);
        $this->page('One');
        $htaccess = $this->build();
        $this->assertMatchesRegularExpression('/frame-src [^;]* challenges\.example\.com;/', $htaccess);
        $this->assertStringNotContainsString('bad src', $htaccess);
        $this->assertStringNotContainsString('x"; y', $htaccess);
    }
}

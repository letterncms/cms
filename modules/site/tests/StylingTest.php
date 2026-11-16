<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Modules\Site\Build\SiteBuilder;
use Cms\Modules\Site\Rendering\Renderer;
use Cms\Modules\Site\Styling\Candidates;
use Cms\Modules\Site\Styling\Compiler;
use Cms\Modules\Site\Styling\Styling;
use Cms\Modules\Site\Styling\Theme;
use Cms\Support\Files;
use Cms\Tests\TestCase;

/**
 * The site's styling is a Tailwind stylesheet and the classes its content carries, compiled on the server
 * (in PHP) whenever either changes.
 */
final class StylingTest extends TestCase
{
    private const string THEME = <<<'CSS'
    @import "tailwindcss";
    @import "cms";

    /* A comment with a brace { and --color-ghost: #000; in it. */
    @theme {
      --color-background: light-dark(#ffffff, #0b0b0c);
      --color-primary: light-dark(rgb(15, 118, 110), #5eead4);
      --color-muted: oklch(55% 0.02 250);
      --color-border: #e6e6e2;
      --font-display: "Fraunces", "Fraunces Fallback", serif;
      --breakpoint-md: 50rem;
      --breakpoint-3xl: 120rem;
      --ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
      --ease-snap: cubic-bezier(0.5, 0, 0, 1);
      @keyframes spin { to { --angle: 360deg; } }
    }

    @layer base {
      :root { color-scheme: light dark; --not-theme: 1; }
      h1 { @apply font-display text-5xl; }
    }

    @utility card {
      @apply rounded-xl border border-border p-6;
    }
    @utility btn-primary { @apply bg-primary; }
    @utility btn-on-brand { @apply bg-background; }
    @utility tab-* { tab-size: --value(integer); }

    @theme inline {
      --color-border: #111111;
    }
    CSS;

    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    protected function collections(): array
    {
        return [
            'pages' => ['title' => 'Pages', 'route' => '/{slug}', 'fields' => [['handle' => 'content', 'type' => 'blocks', 'body' => true]]],
            'notes' => ['title' => 'Notes', 'driver' => 'files', 'route' => '/notes/{slug}', 'fields' => [['handle' => 'body', 'type' => 'markdown', 'body' => true]]],
        ];
    }

    private function styling(): Styling
    {
        return $this->app->make(Styling::class);
    }

    private function ability(string $name, array $input = []): mixed
    {
        return $this->cms()->abilities()->execute($name, $input, AbilityContext::system('test'));
    }

    private function page(string $title, array $blocks): \Cms\Content\Entries\Entry
    {
        return $this->cms()->entryService()->create('pages', ['title' => $title, 'status' => 'published', 'data' => ['content' => $blocks]]);
    }

    public function test_the_classes_in_a_text_are_those_of_blocks_and_of_html(): void
    {
        $this->assertSame(['flex', 'gap-4', 'md:grid-cols-3'], Candidates::in('{"type":"box","class":"flex gap-4  md:grid-cols-3"}'));
        $this->assertSame(['hover:bg-primary/50', 'w-[calc(100%-2rem)]', 'content-["a"]'], Candidates::in((string) json_encode(['class' => 'hover:bg-primary/50 w-[calc(100%-2rem)] content-["a"]'], JSON_UNESCAPED_SLASHES)));
        $this->assertSame(['text-center', 'mt-4', 'underline', 'p-2'], Candidates::in('<p class="text-center mt-4">x</p><a class=\'underline\'>y</a><i class = "p-2"></i>'));
        // HTML kept inside JSON or YAML has its quotes escaped.
        $this->assertSame(['prose', 'lg:prose-xl'], Candidates::in((string) json_encode(['html' => '<div class="prose lg:prose-xl">x</div>'])));
        $this->assertSame(['data-open:rotate-45', 'in-data-open:hidden'], Candidates::in('{"class":"data-open:rotate-45 in-data-open:hidden","className":"no","classes":"none"}{"class":""}'));
        $this->assertSame([], Candidates::in('nothing here'));
        $this->assertSame([], Candidates::in('{"class":"'.str_repeat('a', 201).'"}'), 'a run longer than a class is none');
    }

    public function test_the_candidates_are_every_class_the_content_carries_and_what_code_adds(): void
    {
        $this->page('One', [['type' => 'box', 'class' => 'grid gap-6 md:grid-cols-3', 'children' => [['type' => 'paragraph', 'class' => 'text-muted', 'props' => ['text' => 'Hi']]]]]);
        // A draft counts: the canvas shows it.
        $draft = $this->cms()->entryService()->create('pages', ['title' => 'Draft', 'data' => ['content' => [['type' => 'box', 'class' => 'bg-surface', 'children' => []]]]]);
        Files::put(content_path('collections/notes/hello.md'), "---\nid: 01aaaaaaaaaaaaaaaaaaaaaaa1\ntitle: Hello\nstatus: published\n---\n\n<div class=\"not-prose lead\">Hi</div>\n");
        $this->cms()->hooks()->addFilter('styling.candidates', static fn (array $classes) => [...$classes, 'plugin-class', '', 7]);

        $candidates = $this->app->make(Candidates::class);
        $candidates->flush();
        $all = $candidates->all();

        foreach (['grid', 'gap-6', 'md:grid-cols-3', 'text-muted', 'bg-surface', 'not-prose', 'lead', 'plugin-class', ...Renderer::classes()] as $class) {
            $this->assertContains($class, $all);
        }

        $sorted = $all;
        sort($sorted, SORT_STRING);
        $this->assertSame($sorted, $all, 'sorted, so the same content gives the same list');
        $this->assertSame($all, array_values(array_unique($all)));
        $this->assertNotContains('', $all);
        $this->assertNotEmpty($draft->id);

        // Kept until content changes: a second look reads the cache.
        $this->assertFileExists(storage_path('cache/styling/candidates.json'));
        $this->assertSame($all, (new Candidates($this->cms()->hooks(), $this->cms()->collections(), $this->cms()->entries()))->all());
    }

    public function test_the_built_in_pages_name_their_classes(): void
    {
        $this->assertEqualsCanonicalizing(['block', 'inline-block', 'mt-4', 'mr-4', 'underline', 'text-center', 'text-muted'], Renderer::classes());
    }

    public function test_a_theme_is_read_without_compiling_it(): void
    {
        $theme = new Theme(self::THEME);

        $this->assertSame('#ffffff', $theme->variable('--color-background'), 'the light side of light-dark()');
        $this->assertSame('rgb(15, 118, 110)', $theme->variable('color-primary'), 'a comma inside a function is not where the sides part');
        $this->assertSame('light-dark(#ffffff, #0b0b0c)', $theme->variables()['--color-background']);
        $this->assertSame('#111111', $theme->variable('--color-border'), 'a later @theme block wins');
        $this->assertSame('"Fraunces", "Fraunces Fallback", serif', $theme->variable('--font-display'));
        $this->assertNull($theme->variable('--color-ghost'), 'not from a comment');
        $this->assertNull($theme->variable('--not-theme'), 'not from outside @theme');
        $this->assertNull($theme->variable('--angle'), 'not from a block inside @theme');
        $this->assertSame(['out' => 'cubic-bezier(0.2, 0.8, 0.2, 1)', 'snap' => 'cubic-bezier(0.5, 0, 0, 1)'], $theme->group('--ease-'));
        $this->assertSame(['card', 'btn-primary', 'btn-on-brand'], $theme->classes(), 'a class that takes a value (tab-*) is a family, not one to pick');
        $this->assertTrue($theme->dark(), 'a colour has a dark side');
        $this->assertTrue((new Theme('@import "tailwindcss"; @theme { --color-primary: #000; } :root { color-scheme: light dark; }'))->dark(), 'a site that says so itself');
        $this->assertFalse((new Theme('@import "tailwindcss"; @theme { --color-primary: #000; }'))->dark());
    }

    public function test_the_site_starts_with_a_stylesheet_and_answers_from_its_theme(): void
    {
        $styling = $this->styling();

        // Until the site has one: the stylesheet a site starts with, and the kernel's defaults under it.
        $this->assertFileDoesNotExist(content_path('styling/theme.css'));
        $this->assertStringStartsWith('@import "tailwindcss";', $styling->theme());
        $this->assertContains('btn-primary', $styling->classes());
        $this->assertSame('#1d4ed8', $styling->variable('--color-primary'));
        $this->assertSame('#d92d20', $styling->variable('--color-danger'), 'what the theme does not name is the kernel’s');
        $this->assertNull($styling->variable('--color-nothing'));
        $this->assertFalse($styling->dark());
        $this->assertSame(['sm' => '40rem', 'md' => '48rem', 'lg' => '64rem', 'xl' => '80rem', '2xl' => '96rem'], $styling->breakpoints(), 'Tailwind’s own');

        $styling->saveTheme(self::THEME);
        $this->assertSame(rtrim(self::THEME)."\n", (string) file_get_contents(content_path('styling/theme.css')));
        $this->assertSame(['card', 'btn-primary', 'btn-on-brand'], $styling->classes());
        $this->assertTrue($styling->dark());
        $this->assertSame(['sm' => '40rem', 'md' => '50rem', 'lg' => '64rem', 'xl' => '80rem', '2xl' => '96rem', '3xl' => '120rem'], $styling->breakpoints(), 'the theme’s over Tailwind’s, narrowest first');
        $this->assertSame(['out', 'snap'], array_keys($styling->eases()));

        try {
            $styling->saveTheme('body { color: red }');
            $this->fail('a stylesheet without Tailwind was saved');
        } catch (\InvalidArgumentException $e) {
            $this->assertStringContainsString('@import "tailwindcss"', $e->getMessage());
        }

        $this->assertTrue($styling->dark(), 'what was refused replaced nothing');
    }

    public function test_blocks_mail_and_buttons_read_the_theme(): void
    {
        $hooks = $this->cms()->hooks();
        $defaults = \Cms\Modules\Email\Body::colors();
        $this->assertSame('#1d4ed8', $defaults['button'], 'the starting stylesheet’s primary');

        $this->styling()->saveTheme(self::THEME);
        $this->styling()->saved();

        $this->assertSame('50rem', $hooks->filter('blocks.breakpoints', ['md' => '768px'])['md']);
        $this->assertSame('cubic-bezier(0.5, 0, 0, 1)', $hooks->filter('blocks.eases', [])['snap']);

        $colors = \Cms\Modules\Email\Body::colors();
        $this->assertSame('#ffffff', $colors['background'], 'the light side');
        $this->assertSame('rgb(15, 118, 110)', $colors['button']);
        $this->assertSame('#111111', $colors['line']);
        $this->assertSame($defaults['muted'], $colors['muted'], 'a colour mail clients cannot read stays the default');

        $variants = app(\Cms\Modules\Blocks\BlockRegistry::class)->get('button')->blueprint()->field('variant')->get('options');
        $this->assertSame('On brand', $variants['on-brand'], 'a btn-<name> class of the site is a look a button can have');
        $this->assertSame('Primary', $variants['primary']);
    }

    public function test_settings_keep_the_fonts_and_the_page_transition(): void
    {
        $styling = $this->styling();
        $this->assertSame(['fonts' => [], 'transition' => ['type' => 'none', 'duration' => 0.3, 'navigation' => 'document']], $styling->settings());
        $this->assertSame('', $styling->faces());

        $styling->saveSettings(['fonts' => [['family' => 'Inter', 'src' => '/fonts/inter.woff2', 'weight' => '100 900', 'preload' => true], 'not a face'], 'transition' => ['type' => 'slide', 'duration' => 9]]);
        $this->assertSame([['family' => 'Inter', 'src' => '/fonts/inter.woff2', 'weight' => '100 900', 'preload' => true]], $styling->fonts());
        $this->assertSame(['type' => 'slide', 'duration' => 2.0, 'navigation' => 'document'], $styling->settings()['transition'], 'a duration stays within two seconds');
        $this->assertSame(['/fonts/inter.woff2'], $styling->preloads());

        // What is not named stays.
        $styling->saveSettings(['transition' => ['navigation' => 'client', 'type' => 'no-such']]);
        $this->assertCount(1, $styling->fonts());
        $this->assertSame(['type' => 'none', 'duration' => 2.0, 'navigation' => 'client'], $styling->settings()['transition']);
        $styling->saveSettings(['transition' => ['type' => 'fade', 'duration' => 0.4]]);

        // Fonts and the transition stand before Tailwind's output, and are no part of what it compiles.
        $signature = $styling->signature();
        $styling->refresh();
        $compiled = (string) file_get_contents(storage_path('styling/compiled.css'));
        $faces = $styling->faces();
        $this->assertStringStartsWith('@font-face{font-family:"Inter";src:url("/fonts/inter.woff2") format("woff2");font-weight:100 900;font-style:normal;font-display:swap}', $faces);
        $this->assertStringContainsString('@view-transition{navigation:auto}', $faces);
        $this->assertStringContainsString('animation-duration:0.4s', $faces);
        $this->assertStringStartsWith("/* {$signature} */\n", $compiled);
        $this->assertSame($faces.$compiled, $styling->css());

        $styling->saveSettings(['fonts' => []]);
        $this->assertSame($signature, $styling->signature());
        $this->assertTrue($styling->current());
    }

    public function test_the_server_compiles_the_css_with_tailwind(): void
    {
        $styling = $this->styling();

        $source = $styling->source();
        $this->assertSame(['css', 'files', 'candidates'], array_keys($source));
        $this->assertSame($styling->theme(), $source['css']);
        $this->assertSame([Styling::KERNEL], array_keys($source['files']));
        $this->assertStringContainsString('--control-md-height', $source['files'][Styling::KERNEL], 'the kernel’s own stylesheets');
        $this->assertStringContainsString('.cms-button', $source['files'][Styling::KERNEL]);
        $this->assertStringNotContainsString('color-scheme: light dark', $source['files'][Styling::KERNEL], 'no dark values: the page stays light');

        $signature = $styling->signature();
        $this->assertMatchesRegularExpression('/^[0-9a-f]{32}$/', $signature);
        $this->assertSame($signature, $styling->signature($source));
        $this->assertNotSame($signature, $styling->signature($styling->source($styling->theme().'/* draft */')), 'a draft is another source');

        $this->assertFalse($styling->current());
        $styling->refresh();
        $this->assertTrue($styling->current());
        $compiled = (string) file_get_contents(storage_path('styling/compiled.css'));
        $this->assertStringStartsWith("/* {$signature} */\n", $compiled);
        // Tailwind's own output: the theme's variables, Preflight, the kernel and the stylesheet's own classes, minified.
        $this->assertStringContainsString('--color-primary:#1d4ed8', $compiled);
        $this->assertStringContainsString('box-sizing:border-box', $compiled);
        $this->assertStringContainsString('.btn-primary{', $compiled);
        $this->assertStringContainsString('.cms-button', $compiled);
        $this->assertStringNotContainsString("\n  ", $compiled);
        $this->assertStringContainsString('.btn-primary{', (string) file_get_contents(public_path(ltrim($styling->stylesheet(), '/'))));

        // Dark values: the page follows the visitor's light or dark mode.
        $styling->saveTheme(self::THEME);
        $this->assertStringContainsString(':where(:root) { color-scheme: light dark; }', $styling->source()['files'][Styling::KERNEL]);
        $this->assertStringContainsString('color-scheme:light dark', (string) file_get_contents(storage_path('styling/compiled.css')));

        // What a plugin adds to the kernel's stylesheet is part of the source.
        $this->cms()->hooks()->addFilter('styling.kernel', static fn (array $css) => [...$css, '.plugin-thing{display:block}', 7]);
        $this->assertStringEndsWith(".plugin-thing{display:block}\n@layer base { :where(:root) { color-scheme: light dark; } }\n", $styling->source()['files'][Styling::KERNEL]);
        $this->assertFalse($styling->current());
        $styling->refresh();
        $this->assertStringContainsString('.plugin-thing{display:block}', $styling->css());
    }

    public function test_content_that_brings_a_class_compiles_the_css_again_and_saving_never_fails_for_it(): void
    {
        $styling = $this->styling();
        $this->page('One', [['type' => 'box', 'class' => 'flex', 'children' => []]]);
        $this->assertStringContainsString('.flex{display:flex}', $styling->css());
        $this->assertTrue($styling->current());

        // A new class, as an agent writes it over the API: the CSS has it the next time it is asked for.
        $two = $this->page('Two', [['type' => 'box', 'class' => 'flex', 'children' => []]]);
        $this->ability('entries/update', ['id' => $two->id, 'data' => ['content' => [['type' => 'box', 'class' => 'flex gap-8 md:columns-3', 'children' => []]]]]);
        $this->assertContains('gap-8', $styling->source()['candidates']);
        $css = $styling->css();
        $this->assertStringContainsString('.gap-8{gap:calc(var(--spacing) * 8)}', $css);
        $this->assertStringContainsString('md\:columns-3', $css);

        $this->cms()->entryService()->delete($two->id, $this->admin());
        $this->assertStringNotContainsString('.gap-8{', $styling->css(), 'what no content uses goes');

        // A stylesheet that does not compile is reported, and content is saved all the same.
        $this->app->instance(Compiler::class, $broken = new class extends Compiler
        {
            public int $asked = 0;

            public function compile(array $source): string
            {
                $this->asked++;

                throw new \Cms\Modules\Site\Styling\StylingException('Cannot apply unknown utility class `nope`');
            }
        });
        // Whoever was made with the Styling before is made again with this one.
        foreach ([Styling::class, Candidates::class, Renderer::class, SiteBuilder::class] as $made) {
            $this->app->forgetInstance($made);
        }
        $three = $this->page('Three', [['type' => 'box', 'class' => 'grid', 'children' => []]]);
        $this->assertNotEmpty($this->app->make(Renderer::class)->entry($this->cms()->entries()->find($three->id))['html']);
        $this->assertSame(1, $broken->asked, 'asked once, when the page wanted its stylesheet');

        // Where the stylesheet itself is saved, the same message refuses it, and the one before stays.
        $before = $this->styling()->theme();

        try {
            $this->ability('styling/update', ['css' => self::THEME]);
            $this->fail('a stylesheet that does not compile was saved');
        } catch (AbilityException $e) {
            $this->assertSame('invalid_input', $e->type);
            $this->assertStringContainsString('unknown utility class `nope`', $e->getMessage());
        }

        $this->assertSame($before, $this->styling()->theme());
    }

    public function test_a_site_without_compiled_css_gets_it_when_a_page_asks(): void
    {
        $styling = $this->styling();
        $this->page('One', [['type' => 'box', 'class' => 'columns-5', 'children' => []]]);
        $styling->settle();
        // A server updated from a version that kept it elsewhere, a site copied in by hand: nothing to serve yet.
        @unlink($styling->compiledPath());
        $this->app->forgetInstance(Styling::class);

        $fresh = $this->styling();
        $this->assertStringContainsString('.columns-5{', $fresh->css());
        $this->assertTrue($fresh->current());
        $this->assertStringContainsString('.columns-5{', (string) file_get_contents(public_path(ltrim($fresh->stylesheet(), '/'))));
    }

    public function test_a_stylesheet_tailwind_refuses_is_not_saved(): void
    {
        $before = $this->styling()->theme();

        try {
            $this->ability('styling/update', ['css' => "@import \"tailwindcss\";\n@utility card { @apply no-such-class; }\n"]);
            $this->fail('a stylesheet that does not compile was saved');
        } catch (AbilityException $e) {
            $this->assertSame('invalid_input', $e->type);
            $this->assertStringContainsString('no-such-class', $e->getMessage());
        }

        $this->assertSame($before, $this->styling()->theme());
    }

    public function test_compiling_is_done_once_however_many_entries_were_saved(): void
    {
        $this->app->instance(Compiler::class, $counted = new class extends Compiler
        {
            public int $asked = 0;

            public function compile(array $source): string
            {
                $this->asked++;

                return parent::compile($source);
            }
        });
        $this->app->forgetInstance(Styling::class);
        $styling = $this->styling();

        $saved = $this->ability('styling/update', ['css' => self::THEME]);
        $this->assertSame(1, $counted->asked, 'compiled once: to check it, and that is the site’s CSS');
        $this->assertStringContainsString('.card{', (string) file_get_contents(public_path(ltrim($saved['stylesheet'], '/'))));

        $this->page('One', [['type' => 'box', 'class' => 'columns-3', 'children' => []]]);
        $this->page('Two', [['type' => 'box', 'class' => 'columns-4', 'children' => []]]);
        $this->assertSame(1, $counted->asked, 'not on every save');
        $this->assertStringContainsString('.columns-3{', $styling->css());
        $this->assertStringContainsString('.columns-4{', $styling->css());
        $this->assertSame(2, $counted->asked, 'once, when the CSS was asked for');
        $this->assertTrue($styling->current());
    }

    public function test_abilities_read_change_and_store_the_styling(): void
    {
        $got = $this->ability('styling/get');
        $this->assertSame(['css', 'classes', 'fonts', 'fontFiles', 'transition', 'templates', 'stylesheet', 'js'], array_keys($got));
        $this->assertSame($this->styling()->theme(), $got['css']);
        $this->assertSame(['btn-primary', 'btn-secondary', 'btn-ghost', 'btn-link'], $got['classes']);

        $updated = $this->ability('styling/update', ['css' => self::THEME, 'fonts' => [['family' => 'Inter', 'src' => '/fonts/inter.woff2']], 'transition' => ['type' => 'fade']]);
        $this->assertSame(['saved', 'stylesheet'], array_keys($updated));
        $this->assertTrue($updated['saved']);
        $this->assertStringContainsString('.card{', (string) file_get_contents(public_path(ltrim($updated['stylesheet'], '/'))));
        $this->assertFileExists(content_path('styling/theme.css'));
        $this->assertSame(['fonts' => [['family' => 'Inter', 'src' => '/fonts/inter.woff2']], 'transition' => ['type' => 'fade', 'duration' => 0.3, 'navigation' => 'document']], Files::readJson(content_path('styling/settings.json')));
        $this->assertSame(['card', 'btn-primary', 'btn-on-brand'], $this->ability('styling/get')['classes']);

        // A draft is compiled without saving it: its source, with a signature of its own.
        $source = $this->ability('styling/source');
        $this->assertSame(['signature', 'css', 'files', 'candidates', 'faces'], array_keys($source));
        $this->assertSame($this->styling()->signature(), $source['signature']);
        $this->assertStringContainsString('@font-face{font-family:"Inter"', $source['faces']);
        $draft = $this->ability('styling/source', ['css' => "@import \"tailwindcss\";\n.draft{}"]);
        $this->assertSame("@import \"tailwindcss\";\n.draft{}", $draft['css']);
        $this->assertNotSame($source['signature'], $draft['signature']);
        // The content's classes are the same; a stylesheet's own classes come with that stylesheet.
        $this->assertSame(array_values(array_diff($source['candidates'], ['card', 'btn-primary', 'btn-on-brand'])), $draft['candidates']);
        $this->assertContains('btn-primary', $source['candidates']);

        $this->assertFalse($this->cms()->abilities()->has('styling/compiled'), 'the server compiles: nothing is handed in');

        foreach ([['styling/update', ['css' => 'h1{}']], ['styling/update', ['transition' => ['type' => 'spin']]]] as [$name, $input]) {
            try {
                $this->ability($name, $input);
                $this->fail("{$name} took ".json_encode($input));
            } catch (AbilityException $e) {
                $this->assertSame('invalid_input', $e->type);
            }
        }

        // Custom JavaScript is the only custom file left: CSS is the stylesheet.
        $this->assertSame(['js'], $this->ability('styling-code/set-custom', ['js' => 'console.log(1)'])['saved']);
        $this->assertSame("console.log(1)\n", $this->ability('styling/get')['js']);
        $this->assertFalse($this->cms()->abilities()->has('styling/preview'));
    }

    public function test_agents_read_the_stylesheet_and_are_told_how_it_works(): void
    {
        $this->styling()->saveTheme(self::THEME);
        $context = json_decode($this->cms()->context()->read('cms://site/styling', $this->admin())['text'], true);

        $this->assertSame(rtrim(self::THEME)."\n", $context['css']);
        $this->assertSame(['card', 'btn-primary', 'btn-on-brand'], $context['classes']);
        $this->assertSame('none', $context['transition']['type']);
        $this->assertSame([], $context['fonts']);
        $this->assertNotEmpty($context['rules']);

        foreach (['styling/get', 'styling/update'] as $name) {
            $description = $this->cms()->abilities()->get($name)->description;

            foreach (['Tailwind CSS v4', '@theme', '@utility', '@layer base', 'light-dark('] as $taught) {
                $this->assertStringContainsString($taught, $description, "{$name} explains {$taught}");
            }
        }

        $this->assertArrayHasKey('adjust-styling', $this->cms()->skills()->all());
    }

    public function test_a_page_links_the_one_stylesheet_and_follows_a_saved_theme_choice_only_with_dark_values(): void
    {
        $entry = $this->page('One', [['type' => 'paragraph', 'props' => ['text' => 'Hello']]]);
        $render = fn () => $this->app->make(Renderer::class)->entry($this->cms()->entries()->find($entry->id))['html'];

        $html = $render();
        $this->assertSame(1, preg_match_all('#<link rel="stylesheet" href="(/_cms/site/styles-\w+\.css)">#', $html, $m));
        $this->assertSame($this->styling()->stylesheet(), $m[1][0]);
        $this->assertStringNotContainsString('cms-theme', $html);
        // What the kernel's stylesheet holds is in the compiled CSS, not written into every page.
        $this->assertStringNotContainsString('.cms-button{', $html);
        $this->assertStringNotContainsString('--field-background', $html);

        $this->ability('styling/update', ['css' => self::THEME]);
        $this->assertStringContainsString('localStorage.getItem("cms-theme")', $render());

        $notFound = $this->app->make(Renderer::class)->notFound('/nope')['html'];
        $this->assertStringContainsString('text-center', $notFound);
        $this->assertStringContainsString('text-muted', $notFound);
        $this->assertStringNotContainsString('style="text-align', $notFound);
    }

    public function test_built_pages_keep_their_stylesheet_until_every_page_is_built_again(): void
    {
        $styling = $this->styling();
        $one = $this->page('One', [['type' => 'box', 'class' => 'flex', 'children' => []]]);
        $builder = $this->app->make(SiteBuilder::class);
        $status = $builder->buildAll();
        $this->assertSame([], $status['errors']);
        $this->assertSame([], $status['warnings'], 'the CSS is current');
        $first = $styling->stylesheet();
        $this->assertStringContainsString($first, (string) file_get_contents(public_path('one/index.html')));

        // New CSS: pages not built again still find the one they name.
        $this->page('Two', [['type' => 'box', 'class' => 'grid', 'children' => []]]);
        $styling->settle();
        $second = $styling->stylesheet();
        $this->assertNotSame($first, $second);
        $this->assertFileExists(public_path(ltrim($first, '/')));
        $this->assertFileExists(public_path(ltrim($second, '/')));

        // A full build: every page names the new one, and the old one goes.
        $this->assertSame([], $builder->buildAll()['warnings']);
        $this->assertStringContainsString($second, (string) file_get_contents(public_path('one/index.html')));
        $this->assertFileDoesNotExist(public_path(ltrim($first, '/')));
        $this->assertFileExists(public_path(ltrim($second, '/')));

        // Content that came in beside the CMS (git, FTP): the build looks and compiles.
        Files::put(content_path('collections/notes/hello.md'), "---\nid: 01aaaaaaaaaaaaaaaaaaaaaaa1\ntitle: Hello\nstatus: published\n---\n\n<div class=\"columns-2\">Hi</div>\n");
        $this->cms()->entries()->flush();
        $status = $builder->buildAll();
        $this->assertSame([], $status['errors']);
        $this->assertSame([], $status['warnings']);
        $this->assertStringContainsString('.columns-2{', $styling->css());
        $this->assertNotEmpty($one->id);
    }

    public function test_a_saved_stylesheet_rebuilds_the_site(): void
    {
        $this->page('One', [['type' => 'box', 'class' => 'flex', 'children' => []]]);
        $builder = $this->app->make(SiteBuilder::class);
        $builder->buildAll();
        $this->assertFalse($builder->hasWork());

        $this->ability('styling/update', ['transition' => ['type' => 'fade']]);
        $this->assertTrue($builder->hasWork());
    }

    public function test_each_save_is_a_version_to_go_back_to(): void
    {
        $before = $this->styling()->theme();
        $admin = AbilityContext::forUser($this->userWithRole('admin'));
        $save = fn (array $in) => $this->cms()->abilities()->execute('styling/update', $in, $admin);

        $save(['css' => self::THEME]);
        $save(['transition' => ['type' => 'fade']]);
        // A save that changes nothing is no version.
        $save(['transition' => ['type' => 'fade']]);

        $versions = $this->ability('revisions/list', ['kind' => 'styling', 'subject' => 'theme']);
        // The styling as it was before the first save, then the saves, newest first: one person's saves in a row are one version.
        $this->assertSame(['save', 'save'], array_column($versions, 'action'));
        $now = $this->ability('revisions/get', ['id' => $versions[0]['id']])['snapshot'];
        $this->assertSame(['fade', $this->styling()->theme()], [$now['transition']['type'], $now['css']]);
        $this->assertSame($before, $this->ability('revisions/get', ['id' => $versions[1]['id']])['snapshot']['css']);

        // Going back is a version of its own, and puts the transition back as it was: no fade.
        $this->assertSame(['kind' => 'styling', 'subject' => 'theme'], $this->ability('revisions/restore', ['revisionId' => $versions[1]['id']]));
        $this->assertSame($before, $this->styling()->theme());
        $this->assertSame($this->ability('revisions/get', ['id' => $versions[1]['id']])['snapshot']['transition'], $this->styling()->settings()['transition']);
        $this->assertSame(['restore', 'save', 'save'], array_column($this->ability('revisions/list', ['kind' => 'styling', 'subject' => 'theme']), 'action'));

        $this->expectException(AbilityException::class);
        $this->ability('revisions/get', ['id' => '../settings']);
    }
}

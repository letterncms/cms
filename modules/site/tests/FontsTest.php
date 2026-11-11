<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Modules\Site\Design\Design;
use Cms\Modules\Site\Design\Fonts;
use Cms\Tests\TestCase;
use RuntimeException;

/** Importing a family takes what the family really has, each file once; a face can say what stands in for it. */
final class FontsTest extends TestCase
{
    /** @var list<string> */
    private array $asked = [];

    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site'];
    }

    /** Google Fonts as an array: metadata by family, a stylesheet by query, files by address. */
    private function fonts(array $families): Fonts
    {
        $fonts = $this->app->make(Fonts::class);
        $face = static fn (string $style, string $weight, string $file) => "/* latin-ext */\n@font-face { font-family: 'X'; font-style: {$style}; font-weight: {$weight}; src: url(https://fonts.gstatic.com/s/x/{$file}-ext.woff2) format('woff2'); }\n/* latin */\n@font-face { font-family: 'X'; font-style: {$style}; font-weight: {$weight}; src: url(https://fonts.gstatic.com/s/x/{$file}.woff2) format('woff2'); }\n";
        $fonts->fetcher = function (string $url) use ($families, $face): string {
            $this->asked[] = $url;

            if (preg_match('#^https://fonts\.google\.com/metadata/fonts/(.+)$#', $url, $m)) {
                return isset($families[rawurldecode($m[1])]) ? ")]}'\n".json_encode($families[rawurldecode($m[1])]) : throw new RuntimeException('404');
            }

            if (preg_match('#^https://fonts\.googleapis\.com/css2\?family=([^:]+):(ital,)?wght@([^&]+)&display=swap$#', $url, $m)) {
                $about = $families[str_replace('+', ' ', $m[1])];
                $variable = ($about['axes'] ?? []) !== [];
                $css = '';

                foreach (explode(';', $m[3]) as $tuple) {
                    [$ital, $weight] = $m[2] !== '' ? explode(',', $tuple) : ['0', $tuple];
                    $range = str_replace('..', ' ', $weight);
                    // A variable family answers every weight with the one file that holds them all.
                    $css .= $face($ital === '1' ? 'italic' : 'normal', $range, ($variable ? 'var' : 'w'.$weight).($ital === '1' ? '-i' : ''));
                }

                return $css;
            }

            return str_ends_with($url, '.woff2') ? 'wOF2'.md5($url) : throw new RuntimeException('404');
        };

        return $fonts;
    }

    private function files(): array
    {
        $files = array_map('basename', glob(content_path('design/fonts/*.woff2')) ?: []);
        sort($files);

        return $files;
    }

    public function test_a_variable_family_is_one_file_for_the_weights_it_really_spans(): void
    {
        $fonts = $this->fonts(['EB Garamond' => ['axes' => [['tag' => 'wght', 'min' => 400, 'max' => 800]], 'fonts' => ['400' => [], '400i' => [], '800' => [], '800i' => []]]]);

        $added = $fonts->import('EB Garamond');

        $this->assertSame([['family' => 'EB Garamond', 'src' => 'fonts/eb-garamond-400-800.woff2', 'weight' => '400 800', 'style' => 'normal', 'preload' => true]], $added);
        $this->assertContains('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400..800&display=swap', $this->asked, 'asked for its own range, not 100 to 900');
        $this->assertSame(['eb-garamond-400-800.woff2'], $this->files());

        // Italic only, as a display face: the upright file goes with the faces that named it.
        $italic = $fonts->import('EB Garamond', 'italic');
        $this->assertSame([['family' => 'EB Garamond', 'src' => 'fonts/eb-garamond-400-800-italic.woff2', 'weight' => '400 800', 'style' => 'italic', 'preload' => false]], $italic);
        $this->assertSame(['eb-garamond-400-800-italic.woff2'], $this->files());

        $this->assertCount(2, $fonts->import('EB Garamond', 'both'));
        $this->assertSame(['eb-garamond-400-800-italic.woff2', 'eb-garamond-400-800.woff2'], $this->files());
        $this->assertCount(2, array_filter($this->app->make(Design::class)->json()->fonts(), static fn ($f) => $f['family'] === 'EB Garamond'));
    }

    public function test_a_static_family_takes_the_weights_it_has_and_no_file_twice(): void
    {
        $fonts = $this->fonts([
            'IBM Plex Mono' => ['axes' => [], 'fonts' => ['300' => [], '400' => [], '400i' => [], '700' => []]],
            'Upright Only' => ['axes' => [], 'fonts' => ['400' => []]],
        ]);

        $added = $fonts->import('IBM Plex Mono');
        $this->assertSame(['400', '700'], array_column($added, 'weight'), 'of 400 to 700, what the family has');
        $this->assertSame(['ibm-plex-mono-400.woff2', 'ibm-plex-mono-700.woff2'], $this->files());
        $this->assertSame([true, false], array_column($added, 'preload'));

        $this->assertSame(['300'], array_column($fonts->import('IBM Plex Mono', 'normal', [300, 900]), 'weight'), 'the weights asked for, where it has them');
        $this->assertSame(['normal'], array_column($fonts->import('Upright Only', 'both'), 'style'), 'italic is left out when there is none');

        $this->expectException(\InvalidArgumentException::class);
        $fonts->import('No Such Family');
    }

    public function test_a_weight_is_any_the_axis_has_and_a_name_is_one_line(): void
    {
        $fonts = $this->fonts(['Wide Axis' => ['axes' => [['tag' => 'wght', 'min' => 1, 'max' => 1000]], 'fonts' => ['400' => []]]]);
        $this->assertSame('1 1000', $fonts->import('Wide Axis')[0]['weight']);

        $compile = fn (array $font) => $this->cms()->abilities()->execute('design/preview', ['fonts' => [['family' => 'Wide Axis', 'src' => 'fonts/wide-axis-1-1000.woff2', ...$font]]], AbilityContext::system('test'))['css'];
        $this->assertStringContainsString('font-weight:1 1000;', $compile(['weight' => '1 1000']));
        $this->assertStringContainsString('font-weight:100 1000;', $compile(['weight' => '100 1000']), 'not 400, as three digits only gave');
        $this->assertStringContainsString('font-weight:50;', $compile(['weight' => '50']));
        $this->assertStringContainsString('font-weight:400;', $compile(['weight' => "700\n}body{display:none"]));
        $this->assertStringContainsString('font-weight:400;', $compile(['weight' => '0']));

        $upload = fn (string $weight) => $this->cms()->abilities()->execute('design/fonts-upload', ['family' => 'Up', 'data' => 'data:font/woff2;base64,'.base64_encode('wOF2'.str_repeat("\0", 40)), 'weight' => $weight], AbilityContext::system('test'));
        $this->assertSame('100 1000', $upload('100 1000')['weight']);

        // A name with a line break in it is no name: nothing of it reaches the stylesheet.
        $css = $compile(['family' => "Wide\nAxis", 'fallback' => "Arial\n}body{display:none"]);
        $this->assertStringNotContainsString('display:none', $css);
        $this->assertStringNotContainsString('Fallback', $css);
        $this->assertStringNotContainsString('wide-axis', $css);
    }

    public function test_a_face_names_what_stands_in_for_it_and_its_tokens_follow(): void
    {
        $css = $this->cms()->abilities()->execute('design/preview', [
            'fonts' => [
                ['family' => 'Hanken Grotesk', 'src' => 'fonts/missing.woff2', 'weight' => '100 900', 'fallback' => 'Arial, Helvetica Neue', 'sizeAdjust' => '102%', 'ascentOverride' => '98%', 'descentOverride' => '26%', 'lineGapOverride' => '0%'],
                ['family' => 'Hanken Grotesk', 'src' => 'fonts/missing-i.woff2', 'style' => 'italic', 'fallback' => 'Arial'],
                ['family' => 'Bad', 'fallback' => 'x");}body{display:none', 'sizeAdjust' => '1em'],
            ],
            'tokens' => ['font.sans' => ['Hanken Grotesk', 'system-ui', 'sans-serif'], 'font.mono' => 'ui-monospace, monospace'],
        ], AbilityContext::system('test'))['css'];

        $this->assertStringContainsString('@font-face{font-family:"Hanken Grotesk Fallback";src:local("Arial"),local("Helvetica Neue");font-style:normal;size-adjust:102%;ascent-override:98%;descent-override:26%;line-gap-override:0%}', $css);
        $this->assertStringContainsString('@font-face{font-family:"Hanken Grotesk Fallback";src:local("Arial");font-style:italic}', $css);
        $this->assertStringContainsString('--font-sans:"Hanken Grotesk", "Hanken Grotesk Fallback", system-ui, sans-serif', $css, 'the token that names the family gets its stand-in');
        $this->assertStringContainsString('--font-mono:ui-monospace, monospace', $css);
        $this->assertStringNotContainsString('display:none', $css);
        $this->assertStringNotContainsString('Bad Fallback', $css);
    }
}

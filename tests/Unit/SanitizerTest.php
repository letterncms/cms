<?php

declare(strict_types=1);

namespace Cms\Tests\Unit;

use Cms\Support\Html\Sanitizer;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class SanitizerTest extends TestCase
{
    public static function attacks(): array
    {
        return [
            'script' => ['<p>x<script>alert(1)</script></p>', 'alert'],
            'handler' => ['<p onclick="alert(1)">x</p>', 'onclick'],
            'js url' => ['<a href="javascript:alert(1)">x</a>', 'javascript'],
            'entity js url' => ['<a href="&#106;avascript:alert(1)">x</a>', 'avascript'],
            'data url' => ['<a href="data:text/html;base64,PHNjcmlwdD4=">x</a>', 'data:'],
            'svg' => ['<svg onload="alert(1)"><circle/></svg>', 'svg'],
            'iframe' => ['<iframe src="https://evil.test"></iframe>', 'iframe'],
            'style attr' => ['<p style="background:url(javascript:alert(1))">x</p>', 'style'],
            'protocol-relative' => ['<a href="//evil.test">x</a>', 'evil'],
            'img onerror' => ['<img src=x onerror=alert(1)>', 'onerror'],
        ];
    }

    #[DataProvider('attacks')]
    public function test_strips_attack(string $html, string $needle): void
    {
        $this->assertStringNotContainsStringIgnoringCase($needle, Sanitizer::clean($html));
    }

    public function test_keeps_allowed_markup(): void
    {
        $html = '<h2 id="intro">Intro</h2><p><strong>Bold</strong> <a href="/docs" target="_blank">docs</a></p><ul><li>One</li></ul>';
        $clean = Sanitizer::clean($html);

        $this->assertStringContainsString('<h2 id="intro">Intro</h2>', $clean);
        $this->assertStringContainsString('rel="noopener noreferrer"', $clean);
        $this->assertStringContainsString('<li>One</li>', $clean);
    }

    public function test_inline_mode_unwraps_blocks(): void
    {
        $this->assertSame('Title <em>yes</em>', Sanitizer::inline('<h1>Title</h1> <em>yes</em>'));
    }

    public function test_plain_text_is_escaped(): void
    {
        $this->assertSame('a &lt; b &amp; c', Sanitizer::clean('a < b & c'));
    }
}

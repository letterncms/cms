<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Admin\StandaloneStyle;
use Cms\Tests\TestCase;

final class StandaloneStyleTest extends TestCase
{
    public function test_pages_outside_the_admin_wear_its_tokens(): void
    {
        $css = StandaloneStyle::css();

        if ($css === '') {
            $this->markTestSkipped('The admin has not been built.');
        }

        // The admin's own values, light and dark, and its typeface from this site's public folder.
        $this->assertStringContainsString('--cms-ink:', $css);
        $this->assertStringContainsString('prefers-color-scheme:dark', $css);
        $this->assertStringNotContainsString('%font%', $css);
        $this->assertStringContainsString('/_cms/brand/InstrumentSans-Latin.woff2?v=', $css);
        $this->assertFileExists(public_path('_cms/brand/InstrumentSans-Latin.woff2'));
        // The admin's own eye, for a password that can be looked at; a name it does not have is nothing.
        $this->assertStringStartsWith('<svg ', StandaloneStyle::icon('eye'));
        $this->assertStringStartsWith('<svg ', StandaloneStyle::icon('eye-off'));
        $this->assertSame('', StandaloneStyle::icon('nothing'));
    }
}

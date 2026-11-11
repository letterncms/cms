<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Tests;

use Cms\Modules\Site\Design\FontMetrics;
use PHPUnit\Framework\TestCase;

/** A font's metrics come from its own tables: the fixtures are real families under the Open Font License. */
final class FontMetricsTest extends TestCase
{
    private function font(string $name): string
    {
        return (string) file_get_contents(__DIR__.'/fixtures/fonts/'.$name.'.ttf');
    }

    public function test_the_tables_say_how_tall_a_line_is_and_how_wide_its_letters_are(): void
    {
        $karla = FontMetrics::read($this->font('karla-400'));

        $this->assertSame([2000, 1834, 504, 0], [$karla['unitsPerEm'], $karla['ascent'], $karla['descent'], $karla['lineGap']]);
        $this->assertEqualsWithDelta(0.4556, $karla['width'], 0.0001);

        // Every letter of a monospace font is as wide as the next: 600 of 1000 units.
        $plex = FontMetrics::read($this->font('ibm-plex-mono-400'));
        $this->assertSame([1000, 1025, 275, 0, 0.6], [$plex['unitsPerEm'], $plex['ascent'], $plex['descent'], $plex['lineGap'], $plex['width']]);
    }

    public function test_the_fallback_is_as_wide_and_as_tall_as_the_font(): void
    {
        $karla = FontMetrics::read($this->font('karla-400'));
        $fallback = FontMetrics::fallback($karla, 'sans');

        $this->assertSame(['fallback' => 'Arial', 'sizeAdjust' => '103.63%', 'ascentOverride' => '88.48%', 'descentOverride' => '24.32%', 'lineGapOverride' => '0%'], $fallback);
        // Arial at that size has Karla's average letter width, and the line is Karla's own height.
        $this->assertEqualsWithDelta($karla['width'], FontMetrics::SYSTEM['sans']['width'] * 1.0363, 0.0001);
        $this->assertEqualsWithDelta(($karla['ascent'] + $karla['descent']) / $karla['unitsPerEm'], (0.8848 + 0.2432) * 1.0363, 0.0002);

        $this->assertSame('Times New Roman', FontMetrics::fallback($karla, 'serif')['fallback']);
        $this->assertSame('Arial', FontMetrics::fallback($karla, 'display')['fallback'], 'a kind it does not know stands on the sans');
    }

    public function test_what_is_no_font_is_not_read(): void
    {
        $karla = $this->font('karla-400');

        $this->assertNull(FontMetrics::read(''));
        $this->assertNull(FontMetrics::read('wOF2'.substr($karla, 4)), 'a compressed font is not opened');
        $this->assertNull(FontMetrics::read(substr($karla, 0, 600)), 'a table that runs past the end');
        $this->assertNull(FontMetrics::read("\x00\x01\x00\x00".str_repeat("\xff", 4000)));
    }

    public function test_a_font_without_advance_widths_has_no_metrics_and_a_fallback_never_divides_by_nothing(): void
    {
        // Karla with its hmtx table emptied in the table directory: every letter is 0 wide.
        $font = $this->font('karla-400');

        for ($i = 0, $count = unpack('n', $font, 4)[1]; $i < $count; $i++) {
            if (substr($font, 12 + 16 * $i, 4) === 'hmtx') {
                $font = substr_replace($font, "\x00\x00\x00\x00", 12 + 16 * $i + 12, 4);
            }
        }

        $this->assertNull(FontMetrics::read($font));

        // Metrics given by hand stay within reach: half to twice the system font, never a division by zero.
        $none = FontMetrics::fallback(['unitsPerEm' => 1000, 'ascent' => 800, 'descent' => 200, 'lineGap' => 0, 'width' => 0.0], 'sans');
        $this->assertSame(['50%', '160%'], [$none['sizeAdjust'], $none['ascentOverride']]);
        $this->assertSame('200%', FontMetrics::fallback(['unitsPerEm' => 1000, 'ascent' => 800, 'descent' => 200, 'lineGap' => 0, 'width' => 9.0], 'sans')['sizeAdjust']);
    }
}

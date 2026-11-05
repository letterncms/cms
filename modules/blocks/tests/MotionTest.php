<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks\Tests;

use Cms\Modules\Blocks\BlockRenderer;
use Cms\Modules\Blocks\Document;
use Cms\Modules\Blocks\Motion;
use Cms\Modules\Blocks\TextSplit;
use Cms\Tests\TestCase;
use Lettern\Design\Spec;

final class MotionTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks'];
    }

    /** @return array{html: string, css: string, features: array<string, bool>} */
    private function render(array $nodes): array
    {
        $css = '';
        $this->cms()->hooks()->on('render.style', function ($class, $rule) use (&$css) {
            $css .= $rule;
        });
        $renderer = app(BlockRenderer::class);
        $renderer->begin();
        $html = $renderer->render(app(Document::class)->normalize($nodes));

        return ['html' => $html, 'css' => $css, 'features' => $renderer->features];
    }

    private function animated(string $trigger, array $step = [], array $extra = [], string $type = 'box'): array
    {
        return ['id' => 'node1', 'type' => $type, 'props' => $type === 'heading' ? ['text' => 'Hello there <em>world</em>'] : [], 'motion' => [[
            'id' => 'm1', 'trigger' => ['type' => $trigger, ...($extra['trigger'] ?? [])], 'steps' => [['target' => 'self', 'from' => ['opacity' => '0', 'y' => 'md'], 'duration' => 'slow', 'ease' => 'emphasized', ...$step]],
        ] + array_diff_key($extra, ['trigger' => 1])]];
    }

    public function test_load_is_css_with_no_script_and_nothing_hidden_until_it_runs(): void
    {
        $page = $this->render([$this->animated('load')]);

        $this->assertStringNotContainsString('data-cms-motion', $page['html']);
        $this->assertStringNotContainsString('data-cms-appear', $page['html']);
        $this->assertSame([], $page['features'], 'no animation script on this page');
        $this->assertMatchesRegularExpression('/@keyframes cms-mk-\w+\{from\{transform:translateY\(var\(--space-md\)\);opacity:0\}\}/', $page['css']);
        $this->assertStringContainsString('@media (prefers-reduced-motion:no-preference){', $page['css']);
        $this->assertMatchesRegularExpression('/\.cms-m-\w+\{animation:cms-mk-\w+ 450ms cubic-bezier\(0\.16, 1, 0\.3, 1\) 0ms 1 backwards\}/', $page['css']);
        $this->assertMatchesRegularExpression('/class="[^"]*cms-m-\w+/', $page['html']);
    }

    public function test_load_cannot_hold_the_page_back(): void
    {
        $css = $this->render([$this->animated('load', ['delay' => 'slower'])])['css'];
        $this->assertStringContainsString(' 200ms 1 backwards', $css, 'the delay stops at 0.2s');

        $css = $this->render([$this->animated('load', ['target' => 'words', 'stagger' => 'faster'], type: 'heading')])['css'];
        $this->assertStringContainsString('min(var(--i,0)*120ms,300ms)', $css, 'the last word starts by 0.3s');
    }

    public function test_words_are_split_in_the_html_and_stay_real_text(): void
    {
        $page = $this->render([$this->animated('load', ['target' => 'words', 'stagger' => 'fastest'], type: 'heading')]);

        $this->assertStringContainsString('<span class="cms-w"><span class="cms-w__i" style="--i:0">Hello</span></span>', $page['html']);
        $this->assertStringContainsString('</span></span> <span class="cms-w">', $page['html'], 'spaces stay between words');
        $this->assertStringContainsString('<em><span class="cms-w"><span class="cms-w__i" style="--i:2">world</span></span></em>', $page['html'], 'tags stay');
        $this->assertSame('Hello there world', trim(strip_tags($page['html'])));
    }

    public function test_lines_and_letters_read_as_masked_words_and_words(): void
    {
        $clean = Motion::sanitize([['trigger' => ['type' => 'load'], 'steps' => [['target' => 'lines', 'from' => ['y' => 'full']], ['target' => 'chars', 'from' => ['y' => 'xs']]]]]);

        $this->assertSame('words', $clean[0]['steps'][0]['target']);
        $this->assertTrue($clean[0]['steps'][0]['mask']);
        $this->assertSame('words', $clean[0]['steps'][1]['target']);
        $this->assertArrayNotHasKey('mask', $clean[0]['steps'][1]);

        $html = $this->render([$this->animated('load', ['target' => 'lines', 'from' => ['y' => 'full']], type: 'heading')])['html'];
        $this->assertStringContainsString('cms-w--mask', $html);
    }

    public function test_the_text_split_leaves_markup_and_entities_alone(): void
    {
        $html = TextSplit::html('<a href="/a b">One&nbsp;two</a> &amp; <code>not this</code><br>three');

        $this->assertStringContainsString('<a href="/a b"><span class="cms-w"><span class="cms-w__i" style="--i:0">One&nbsp;two</span></span></a>', $html);
        $this->assertStringContainsString('<span class="cms-w__i" style="--i:1">&amp;</span>', $html);
        $this->assertStringContainsString('<code>not this</code>', $html);
        $this->assertStringContainsString('<br><span class="cms-w"><span class="cms-w__i" style="--i:2">three</span>', $html);
        $this->assertSame($html, TextSplit::html($html), 'once is enough');

        $long = '<p>'.str_repeat('word ', TextSplit::LIMIT + 1).'</p>';
        $this->assertSame($long, TextSplit::html($long), 'too many words: left alone');
    }

    public function test_scroll_follows_the_scroll_with_css_for_browsers_that_can(): void
    {
        $page = $this->render([$this->animated('scroll', ['from' => ['scale' => '95'], 'to' => ['scale' => '100'], 'ease' => 'linear'], ['trigger' => ['start' => 'top 70%', 'end' => 'top 5%', 'scrub' => 0.5, 'pin' => true]])]);

        $this->assertSame([], $page['features']);
        $this->assertStringContainsString('@supports (animation-timeline:view()){', $page['css']);
        $this->assertStringContainsString('animation-timeline:view()', $page['css']);
        $this->assertStringContainsString('animation-range:cover calc((30vh) + 0 * ((95vh) - (30vh)) ) cover calc((30vh) + 1 * ((95vh) - (30vh)) )', $page['css']);
        $this->assertStringContainsString('{from{transform:scale(0.95)}to{transform:scale(1)}}', $page['css']);
    }

    public function test_scroll_can_watch_another_element_and_timelines_share_one_scope(): void
    {
        $page = $this->render([
            ['id' => 'watched', 'type' => 'box'],
            ['id' => 'other1', 'type' => 'box'],
            $this->animated('scroll', ['from' => ['y' => 'sm']], ['trigger' => ['node' => '#watched']]),
            ['id' => 'node2'] + $this->animated('scroll', ['from' => ['y' => 'lg']], ['trigger' => ['node' => '#other1']]),
        ]);

        $this->assertStringContainsString('[data-cms="watched"]{view-timeline:--cms-t-watched}', $page['css']);
        $this->assertStringContainsString(':root{timeline-scope:--cms-t-watched,--cms-t-other1}', $page['css']);
        $this->assertStringContainsString('data-cms="watched"', $page['html']);
    }

    public function test_a_position_maps_onto_the_cover_range(): void
    {
        $range = fn (string $start, string $end) => Motion::compile([['id' => 'm', 'trigger' => ['type' => 'scroll', 'start' => $start, 'end' => $end], 'steps' => [['target' => 'self', 'from' => ['y' => 'xs']]]]])['rules'];

        $this->assertStringContainsString('calc(50% + 10vh)', implode('', $range('center 40%', 'bottom 20%')));
        $this->assertStringContainsString('calc(100% - 20vh)', implode('', $range('center 40%', 'bottom 20%')));
        $this->assertStringContainsString('(0vh)', implode('', $range('top bottom', 'bottom top')));
    }

    public function test_what_waits_on_the_visitor_goes_to_the_runtime(): void
    {
        foreach (['appear', 'hover', 'press', 'event'] as $trigger) {
            $page = $this->render([$this->animated($trigger)]);

            $this->assertSame(['motion' => true], $page['features'], $trigger);
            $this->assertSame('', $page['css'], $trigger);
            $this->assertStringContainsString('data-cms="node1"', $page['html']);

            preg_match('/data-cms-motion="([^"]+)"/', $page['html'], $m);
            $runtime = json_decode(html_entity_decode($m[1]), true);
            $this->assertSame($trigger, $runtime[0]['type']);
            $this->assertSame([['transform' => 'translateY(var(--space-md))', 'opacity' => 0, 'offset' => 0]], $runtime[0]['steps'][0]['k'], 'the other side is the element itself');
            $this->assertSame(450, $runtime[0]['steps'][0]['d']);
            $this->assertSame('cubic-bezier(0.16, 1, 0.3, 1)', $runtime[0]['steps'][0]['e']);
        }
    }

    public function test_steps_share_a_clock_and_a_later_from_waits_for_its_turn(): void
    {
        [$runtime] = Motion::compile(Motion::sanitize([['id' => 'm', 'trigger' => ['type' => 'event'], 'steps' => [
            ['target' => 'self', 'from' => ['x' => 'sm'], 'duration' => 'slow'],
            ['target' => 'self', 'from' => ['y' => 'sm'], 'duration' => 'slow', 'delay' => 'faster'],
            ['target' => 'children', 'to' => ['y' => 'xs'], 'duration' => 'fast', 'at' => 0.2, 'stagger' => 'fastest'],
        ]]]))['runtime'];

        [$a, $b, $c] = $runtime['steps'];
        $this->assertSame('both', $a['f']);
        $this->assertSame('forwards', $b['f']);
        $this->assertSame(570, $b['w'], 'after the first (450ms) and its own delay (120ms)');
        $this->assertSame(570, $a['r'], 'ends together with the last step, so they reverse together');
        $this->assertSame(200, $c['w'], 'at stays seconds');
        $this->assertSame(75, $c['s']);
        $this->assertSame(1, $c['h'], 'an end state of its own is kept after playing');
    }

    public function test_plays_on_limits_css_and_the_runtime_to_those_screens(): void
    {
        $page = $this->render([$this->animated('load', extra: ['on' => ['desktop']])]);
        $this->assertStringContainsString('@media (min-width:1024px){', $page['css']);

        $phone = Motion::compile(Motion::sanitize([['trigger' => ['type' => 'appear'], 'on' => ['mobile', 'tablet'], 'steps' => [['from' => ['y' => 'xs']]]]]));
        $this->assertSame('(min-width:768px) and (max-width:1023.98px),(max-width:767.98px)', $phone['runtime'][0]['media']);

        $this->assertArrayNotHasKey('on', Motion::sanitize([['on' => ['desktop', 'tablet', 'mobile', 'watch'], 'steps' => [['from' => ['y' => 'xs']]]]])[0]);
    }

    public function test_a_loop_stops_by_itself_unless_it_can_be_paused(): void
    {
        $css = $this->render([$this->animated('loop', ['to' => ['y' => '-sm'], 'from' => [], 'duration' => 'glacial'], ['repeat' => 50, 'yoyo' => true])])['css'];
        $this->assertStringContainsString(' 2 alternate both', $css, 'two rounds of 1.8s stop within 5s');

        $page = $this->render([$this->animated('loop', ['to' => ['y' => '-sm'], 'from' => []], ['repeat' => -1])]);
        $this->assertStringContainsString(' infinite both', $page['css']);
        $this->assertTrue($page['features']['forever']);

        $warnings = [];
        $this->cms()->hooks()->on('render.warning', function ($message) use (&$warnings) {
            $warnings[] = $message;
        });
        $this->assertSame([], $this->cms()->hooks()->filter('site.foot', []));
        $this->assertCount(1, $warnings);

        $page = $this->render([$this->animated('loop', ['to' => ['y' => '-sm'], 'from' => []], ['repeat' => -1]), ['type' => 'motion-toggle']]);
        $this->assertStringContainsString('data-cms-motion-toggle', $page['html']);
        $this->assertMatchesRegularExpression('/<button[^>]*data-cms-motion-toggle[^>]* hidden>Pause animations<\/button>/', $page['html']);
        $foot = implode('', $this->cms()->hooks()->filter('site.foot', []));
        $this->assertCount(1, $warnings, 'with a toggle on the page there is nothing to warn about');
        $this->assertStringNotContainsString('forever', $foot);
    }

    public function test_the_canvas_gets_no_animation_at_all(): void
    {
        $renderer = app(BlockRenderer::class);
        $renderer->editor = true;
        $page = $this->render([$this->animated('load', ['target' => 'words'], type: 'heading')]);
        $renderer->editor = false;

        $this->assertSame('', $page['css']);
        $this->assertStringNotContainsString('cms-w__i', $page['html']);
        $this->assertStringNotContainsString('cms-m-', $page['html']);
    }

    public function test_sanitize_drops_what_no_longer_exists(): void
    {
        $clean = Motion::sanitize([['trigger' => ['type' => 'scroll', 'scrub' => 1, 'pin' => true, 'start' => 'top+=100 80%'], 'steps' => [[
            'from' => ['width' => 'sm', 'transformPerspective' => 'near', 'yPercent' => 100, 'y' => '14px', 'scale' => 0.97, 'clipPath' => 'inset(0 0 100% 0)', 'opacity' => '0'],
            'to' => ['clipPath' => 'hidden-up', 'color' => 'primary', 'blur' => 'md'],
            'ease' => 'nonsense(', 'duration' => 0.9, 'delay' => 0.2,
        ]]]]);

        $this->assertSame(['type' => 'scroll'], $clean[0]['trigger']);
        $this->assertSame(['opacity' => '0'], $clean[0]['steps'][0]['from'], 'raw lengths, numbers and clip shapes are not names');
        $this->assertSame(['clipPath' => 'hidden-up', 'color' => 'primary', 'blur' => 'md'], $clean[0]['steps'][0]['to']);
        $this->assertSame('base', $clean[0]['steps'][0]['duration'], 'durations are names now, not seconds');
        $this->assertArrayNotHasKey('delay', $clean[0]['steps'][0]);
        $this->assertArrayNotHasKey('ease', $clean[0]['steps'][0]);
    }

    public function test_every_ease_is_a_name_with_valid_css(): void
    {
        foreach (Spec::EASES as $name => $css) {
            $this->assertMatchesRegularExpression('/^(linear|cubic-bezier\(.+\)|linear\(.+\))$/', $css, $name);
        }

        $clean = Motion::sanitize([['steps' => [['ease' => 'overshoot', 'from' => ['y' => 'xs']], ['ease' => 'steps(4)', 'from' => ['y' => 'xs']], ['ease' => 'power3.out', 'from' => ['y' => 'xs']]]]]);
        [$a, $b, $c] = Motion::compile($clean)['runtime'][0]['steps'];
        $this->assertSame(Spec::EASES['overshoot'], $a['e']);
        $this->assertSame(Spec::EASES['out'], $b['e'], 'what is not a name eases out');
        $this->assertSame(Spec::EASES['out'], $c['e']);
    }

    public function test_names_compile_to_the_values_of_the_vocabulary(): void
    {
        $frames = fn (array $from) => Motion::compile(Motion::sanitize([['trigger' => ['type' => 'event'], 'steps' => [['from' => $from]]]]))['runtime'][0]['steps'][0]['k'][0];

        $this->assertSame(['transform' => 'translateY(-50%) rotate(-6deg) scale(0.95)', 'offset' => 0], $frames(['y' => '-1/2', 'rotate' => '-6', 'scale' => '95']));
        $this->assertSame(['filter' => 'blur(8px)', 'opacity' => 0.4, 'color' => 'var(--color-primary)', 'offset' => 0], $frames(['blur' => 'md', 'opacity' => '40', 'color' => 'primary']));
        $this->assertSame(['clipPath' => Motion::CLIPS['hidden-up'], 'offset' => 0], $frames(['clipPath' => 'hidden-up']));
    }

    public function test_an_appear_timeline_with_a_hold_loops_as_one(): void
    {
        $motion = Motion::compile(Motion::sanitize([[
            'id' => 'demo', 'trigger' => ['type' => 'appear'], 'repeat' => -1, 'hold' => 2,
            'steps' => [
                ['target' => '#panel', 'from' => ['opacity' => '0'], 'duration' => 'slowest', 'at' => 1, 'ease' => 'linear'],
                ['target' => '#panel', 'to' => ['opacity' => '0'], 'duration' => 'slowest', 'at' => 3, 'ease' => 'linear'],
            ],
        ]]), ['slowest' => 1000] + Spec::DURATIONS);

        $this->assertTrue($motion['forever'], 'A page with it needs a Motion Toggle.');
        $animation = $motion['runtime'][0];
        $this->assertTrue($animation['cycle']);
        $this->assertCount(1, $animation['steps'], 'One animation per target, however many steps touch it.');
        $step = $animation['steps'][0];
        $this->assertSame(6000, $step['d'], 'With the theme\'s durations (slowest is 1s here), steps end at 4 seconds, and it rests for 2.');
        $this->assertSame(-1, $step['i']);
        $this->assertSame(
            [[0.0, 0], [0.16667, 0], [0.33333, null], [0.5, null], [0.66667, 0], [1.0, 0]],
            array_map(static fn (array $frame) => [$frame['offset'], $frame['opacity'] === null ? null : (int) $frame['opacity']], $step['k']),
        );
    }

    public function test_a_timeline_without_a_hold_stays_per_step(): void
    {
        $motion = Motion::compile(Motion::sanitize([[
            'id' => 'a', 'trigger' => ['type' => 'appear'], 'repeat' => 2,
            'steps' => [['target' => 'self', 'from' => ['opacity' => '0'], 'duration' => 'slowest']],
        ]]));

        $this->assertArrayNotHasKey('cycle', $motion['runtime'][0]);
        $this->assertFalse($motion['forever']);
    }
}

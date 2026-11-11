<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks\Tests;

use Cms\Modules\Blocks\BlockRenderer;
use Cms\Modules\Blocks\Document;
use Cms\Modules\Blocks\Motion;
use Cms\Modules\Blocks\TextSplit;
use Cms\Tests\TestCase;

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
            'id' => 'm1', 'trigger' => ['type' => $trigger, ...($extra['trigger'] ?? [])], 'steps' => [['target' => 'self', 'from' => ['opacity' => 0, 'y' => 14], 'duration' => 0.9, 'ease' => 'expo.out', ...$step]],
        ] + array_diff_key($extra, ['trigger' => 1])]];
    }

    public function test_load_is_css_with_no_script_and_nothing_hidden_until_it_runs(): void
    {
        $page = $this->render([$this->animated('load')]);

        $this->assertStringNotContainsString('data-cms-motion', $page['html']);
        $this->assertStringNotContainsString('data-cms-appear', $page['html']);
        $this->assertSame([], $page['features'], 'no animation script on this page');
        $this->assertMatchesRegularExpression('/@keyframes cms-mk-\w+\{from\{transform:translateY\(14px\);opacity:0\}\}/', $page['css']);
        $this->assertStringContainsString('@media (prefers-reduced-motion:no-preference){', $page['css']);
        $this->assertMatchesRegularExpression('/\.cms-m-\w+\{animation:cms-mk-\w+ 900ms cubic-bezier\(\.16,1,\.3,1\) 0ms 1 backwards\}/', $page['css']);
        $this->assertMatchesRegularExpression('/class="[^"]*cms-m-\w+/', $page['html']);
    }

    public function test_load_cannot_hold_the_page_back(): void
    {
        $css = $this->render([$this->animated('load', ['delay' => 0.8])])['css'];
        $this->assertStringContainsString(' 200ms 1 backwards', $css, 'the delay stops at 0.2s');

        $css = $this->render([$this->animated('load', ['target' => 'words', 'stagger' => 0.1], type: 'heading')])['css'];
        $this->assertStringContainsString('min(var(--i,0)*100ms,300ms)', $css, 'the last word starts by 0.3s');
    }

    public function test_words_are_split_in_the_html_and_stay_real_text(): void
    {
        $page = $this->render([$this->animated('load', ['target' => 'words', 'stagger' => 0.05], type: 'heading')]);

        $this->assertStringContainsString('<span class="cms-w"><span class="cms-w__i" style="--i:0">Hello</span></span>', $page['html']);
        $this->assertStringContainsString('</span></span> <span class="cms-w">', $page['html'], 'spaces stay between words');
        $this->assertStringContainsString('<em><span class="cms-w"><span class="cms-w__i" style="--i:2">world</span></span></em>', $page['html'], 'tags stay');
        $this->assertSame('Hello there world', trim(strip_tags($page['html'])));
    }

    public function test_lines_in_css_are_masked_words_and_the_runtime_finds_real_ones(): void
    {
        // CSS runs before there is a layout to ask: a line is each of its words, rising from behind its edge.
        $clean = Motion::sanitize([['trigger' => ['type' => 'load'], 'steps' => [['target' => 'lines', 'from' => ['yPercent' => 108]]]]]);
        $this->assertSame('words', $clean[0]['steps'][0]['target']);
        $this->assertTrue($clean[0]['steps'][0]['mask']);

        // What waits for the visitor has a layout: the runtime gives the words of a line one turn.
        $page = $this->render([$this->animated('appear', ['target' => 'lines', 'from' => ['yPercent' => 108], 'stagger' => 0.08], type: 'heading')]);
        $this->assertStringContainsString('cms-w--mask', $page['html']);
        $this->assertStringContainsString('&quot;t&quot;:&quot;lines&quot;', $page['html']);
        $this->assertSame('Hello there world', trim(strip_tags($page['html'])), 'the words stay where they are');
    }

    public function test_letters_are_split_inside_their_word_and_read_as_the_word(): void
    {
        $page = $this->render([$this->animated('load', ['target' => 'chars', 'stagger' => 0.02], type: 'heading')]);

        $this->assertStringContainsString('<span class="cms-w"><span class="cms-w__i" style="--i:0" aria-hidden="true"><span class="cms-c" style="--i:0">H</span><span class="cms-c" style="--i:1">e</span>', $page['html']);
        $this->assertStringContainsString('</span><span class="cms-sr">Hello</span></span> <span class="cms-w">', $page['html']);
        $this->assertStringContainsString(' .cms-c{animation:', $page['css']);
        $this->assertStringContainsString('var(--i,0)*20ms', $page['css']);

        // What a screen reader meets: everything not hidden from it.
        $heard = (string) preg_replace('#<span class="cms-w__i"[^>]*aria-hidden="true">(<span class="cms-c"[^>]*>[^<]*</span>)*</span>#', '', $page['html']);
        $this->assertSame('Hello there world', trim(strip_tags($heard)));

        $split = TextSplit::html('<a href="/x">R&amp;D 👩‍🚀</a>', false, true);
        $this->assertStringContainsString('<span class="cms-c" style="--i:1">&amp;</span>', $split, 'an entity is one letter');
        $this->assertStringContainsString('<span class="cms-c" style="--i:3">👩‍🚀</span>', $split, 'so is an emoji made of several');
        $this->assertSame(1, substr_count($split, '<a '), 'a link stays one link');

        $long = '<p>'.str_repeat('abcdefghij ', 61).'</p>';
        $this->assertStringNotContainsString('cms-c', TextSplit::html($long, false, true), 'too many letters: the words animate');
        $this->assertStringContainsString('cms-w__i', TextSplit::html($long, false, true));
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

    public function test_scroll_follows_the_scroll_with_css_and_describes_itself_for_browsers_that_cannot(): void
    {
        $page = $this->render([$this->animated('scroll', ['from' => ['scale' => 0.97], 'to' => ['scale' => 1], 'ease' => 'none'], ['trigger' => ['start' => 'top 70%', 'end' => 'top 5%']])]);

        $this->assertSame(['scroll' => true], $page['features'], 'the runtime only fetches its scroll chunk where CSS can’t do it');
        $this->assertStringContainsString('@supports (animation-timeline:view()){', $page['css']);
        $this->assertStringContainsString('animation-timeline:view()', $page['css']);
        $this->assertStringContainsString('animation-range:cover calc((30vh) + 0 * ((95vh) - (30vh)) ) cover calc((30vh) + 1 * ((95vh) - (30vh)) )', $page['css']);
        $this->assertStringContainsString('{from{transform:scale(0.97)}to{transform:scale(1)}}', $page['css']);

        preg_match('/data-cms-scroll="([^"]+)"/', $page['html'], $m);
        [$described] = json_decode(html_entity_decode($m[1]), true);
        $this->assertSame(['top 70%', 'top 5%'], [$described['start'], $described['end']]);
        $this->assertSame([['transform' => 'scale(0.97)', 'offset' => 0], ['transform' => 'scale(1)', 'offset' => 1]], $described['steps'][0]['k']);
        $this->assertArrayNotHasKey('scrub', $described);
    }

    public function test_scrub_trails_the_scroll_which_only_the_runtime_does(): void
    {
        $page = $this->render([$this->animated('scroll', ['from' => ['y' => 80]], ['trigger' => ['scrub' => 0.6]])]);

        $this->assertStringNotContainsString('animation-timeline', $page['css']);
        $this->assertStringContainsString('&quot;scrub&quot;:0.6', $page['html']);
        $this->assertSame(['scroll' => true], $page['features']);
    }

    public function test_pin_holds_the_element_in_a_wrapper_it_is_scrolled_through(): void
    {
        $page = $this->render([$this->animated('scroll', ['from' => ['opacity' => 0]], ['trigger' => ['pin' => '150vh']])]);

        $this->assertStringContainsString('<div class="cms-pin" data-cms-pin="node1"><div class="cms-box', $page['html']);
        $this->assertStringContainsString('@media (prefers-reduced-motion:no-preference){[data-cms-pin="node1"]{view-timeline:--cms-p-node1}[data-cms-pin="node1"]::after{content:"";display:block;height:150vh}[data-cms-pin="node1"]>*{position:sticky;top:0}}', $page['css'], 'no script, and not for people who asked for less motion');
        $this->assertStringContainsString('animation-timeline:--cms-p-node1;animation-range:cover calc((100vh) + 0 * ((100vh + 150vh) - (100vh)) ) cover calc((100vh) + 1 * ((100vh + 150vh) - (100vh)) )', $page['css'], 'from the wrapper’s top at the top of the screen, for the distance');
        $this->assertStringContainsString(':root{timeline-scope:--cms-p-node1}', $page['css']);
        $this->assertStringContainsString('&quot;pin&quot;:1', $page['html']);

        $this->assertSame('100vh', Motion::sanitize([['trigger' => ['type' => 'scroll', 'pin' => true], 'steps' => [['from' => ['y' => 1]]]]])[0]['trigger']['pin']);
        $this->assertArrayNotHasKey('pin', Motion::sanitize([['trigger' => ['type' => 'scroll', 'pin' => '100vh}body{display:none'], 'steps' => [['from' => ['y' => 1]]]]])[0]['trigger']);
        $this->assertArrayNotHasKey('pin', Motion::sanitize([['trigger' => ['type' => 'appear', 'pin' => true, 'scrub' => 1], 'steps' => [['from' => ['y' => 1]]]]])[0]['trigger'], 'only scroll pins');

        $canvas = app(BlockRenderer::class);
        $canvas->editor = true;
        $this->assertStringNotContainsString('cms-pin', $canvas->render(app(Document::class)->normalize([$this->animated('scroll', ['from' => ['opacity' => 0]], ['trigger' => ['pin' => true]])])));
        $canvas->editor = false;
    }

    public function test_an_ease_can_be_a_curve_of_the_design(): void
    {
        $this->cms()->hooks()->addFilter('blocks.eases', fn (array $eases) => [...$eases, 'brand' => 'cubic-bezier(0.2, 0.8, 0.2, 1)', 'bad' => 'url(x)']);
        $motion = Motion::sanitize([['trigger' => ['type' => 'appear'], 'steps' => [['ease' => 'token:ease.brand', 'from' => ['y' => 1]], ['ease' => 'token:ease.bad', 'from' => ['y' => 1]], ['ease' => 'token:color.x', 'from' => ['y' => 1]]]]]);

        $this->assertSame('token:ease.brand', $motion[0]['steps'][0]['ease']);
        $this->assertArrayNotHasKey('ease', $motion[0]['steps'][2]);

        $page = $this->render([['id' => 'n', 'type' => 'box', 'motion' => $motion], $this->animated('load', ['ease' => 'token:ease.brand'])]);
        $this->assertStringContainsString('&quot;e&quot;:&quot;cubic-bezier(0.2, 0.8, 0.2, 1)&quot;', $page['html'], 'the runtime gets the curve itself');
        $this->assertStringNotContainsString('url(x)', $page['html'], 'a token that is no curve falls back');
        $this->assertStringContainsString('900ms cubic-bezier(0.2, 0.8, 0.2, 1)', $page['css']);
    }

    public function test_scroll_can_watch_another_element_and_timelines_share_one_scope(): void
    {
        $page = $this->render([
            ['id' => 'watched', 'type' => 'box'],
            ['id' => 'other1', 'type' => 'box'],
            $this->animated('scroll', ['from' => ['y' => 10]], ['trigger' => ['node' => '#watched']]),
            ['id' => 'node2'] + $this->animated('scroll', ['from' => ['y' => 20]], ['trigger' => ['node' => '#other1']]),
        ]);

        $this->assertStringContainsString('[data-cms="watched"]{view-timeline:--cms-t-watched}', $page['css']);
        $this->assertStringContainsString(':root{timeline-scope:--cms-t-watched,--cms-t-other1}', $page['css']);
        $this->assertStringContainsString('data-cms="watched"', $page['html']);
    }

    public function test_a_position_maps_onto_the_cover_range(): void
    {
        $range = fn (string $start, string $end) => Motion::compile([['id' => 'm', 'trigger' => ['type' => 'scroll', 'start' => $start, 'end' => $end], 'steps' => [['target' => 'self', 'from' => ['y' => 1]]]]])['rules'];

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
            $this->assertSame([['transform' => 'translateY(14px)', 'opacity' => 0, 'offset' => 0]], $runtime[0]['steps'][0]['k'], 'the other side is the element itself');
            $this->assertSame(900, $runtime[0]['steps'][0]['d']);
            $this->assertSame('cubic-bezier(.16,1,.3,1)', $runtime[0]['steps'][0]['e']);
        }
    }

    public function test_steps_share_a_clock_and_a_later_from_waits_for_its_turn(): void
    {
        [$runtime] = Motion::compile(Motion::sanitize([['id' => 'm', 'trigger' => ['type' => 'event'], 'steps' => [
            ['target' => 'self', 'from' => ['x' => 1], 'duration' => 0.5],
            ['target' => 'self', 'from' => ['y' => 1], 'duration' => 0.5, 'delay' => 0.1],
            ['target' => 'children', 'to' => ['y' => 1], 'duration' => 0.2, 'at' => 0.2, 'stagger' => 0.05],
        ]]]))['runtime'];

        [$a, $b, $c] = $runtime['steps'];
        $this->assertSame('both', $a['f']);
        $this->assertSame('forwards', $b['f']);
        $this->assertSame(600, $b['w']);
        $this->assertSame(600, $a['r'], 'ends together with the last step, so they reverse together');
        $this->assertSame(200, $c['w']);
        $this->assertSame(50, $c['s']);
        $this->assertSame(1, $c['h'], 'an end state of its own is kept after playing');
    }

    public function test_plays_on_limits_css_and_the_runtime_to_those_screens(): void
    {
        $page = $this->render([$this->animated('load', extra: ['on' => ['desktop']])]);
        $this->assertStringContainsString('@media (min-width:1024px){', $page['css']);

        $phone = Motion::compile(Motion::sanitize([['trigger' => ['type' => 'appear'], 'on' => ['mobile', 'tablet'], 'steps' => [['from' => ['y' => 1]]]]]));
        $this->assertSame('(min-width:768px) and (max-width:1023.98px),(max-width:767.98px)', $phone['runtime'][0]['media']);

        $this->assertArrayNotHasKey('on', Motion::sanitize([['on' => ['desktop', 'tablet', 'mobile', 'watch'], 'steps' => [['from' => ['y' => 1]]]]])[0]);
    }

    public function test_a_loop_stops_by_itself_unless_it_can_be_paused(): void
    {
        $css = $this->render([$this->animated('loop', ['to' => ['y' => -10], 'from' => [], 'duration' => 2], ['repeat' => 50, 'yoyo' => true])])['css'];
        $this->assertStringContainsString(' 2 alternate both', $css, 'two rounds of 2s stop within 5s');

        $page = $this->render([$this->animated('loop', ['to' => ['y' => -10], 'from' => []], ['repeat' => -1])]);
        $this->assertStringContainsString(' infinite both', $page['css']);
        $this->assertTrue($page['features']['forever']);

        $warnings = [];
        $this->cms()->hooks()->on('render.warning', function ($message) use (&$warnings) {
            $warnings[] = $message;
        });
        $this->assertSame([], $this->cms()->hooks()->filter('site.foot', []));
        $this->assertCount(1, $warnings);

        $page = $this->render([$this->animated('loop', ['to' => ['y' => -10], 'from' => []], ['repeat' => -1]), ['type' => 'motion-toggle']]);
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
        $clean = Motion::sanitize([['trigger' => ['type' => 'scroll', 'scrub' => true, 'pin' => 'auto', 'markers' => true, 'start' => 'top+=100 80%'], 'steps' => [['from' => ['width' => '10px', 'transformPerspective' => 400, 'opacity' => 0], 'ease' => 'nonsense(']]]]);

        $this->assertSame(['type' => 'scroll'], $clean[0]['trigger']);
        $this->assertSame(['opacity' => 0.0], $clean[0]['steps'][0]['from']);
        $this->assertArrayNotHasKey('ease', $clean[0]['steps'][0]);
    }

    public function test_every_ease_name_is_valid_css(): void
    {
        foreach (Motion::EASES as $name => $css) {
            $this->assertMatchesRegularExpression('/^(linear|cubic-bezier\(.+\)|linear\(.+\))$/', $css, $name);
        }

        $clean = Motion::sanitize([['steps' => [['ease' => 'back.out(1.7)', 'from' => ['y' => 1]], ['ease' => 'steps(4)', 'from' => ['y' => 1]], ['ease' => 'power3', 'from' => ['y' => 1]]]]]);
        [$a, $b, $c] = Motion::compile($clean)['runtime'][0]['steps'];
        $this->assertSame(Motion::EASES['back.out'], $a['e']);
        $this->assertSame('steps(4)', $b['e']);
        $this->assertSame(Motion::EASES['power3.out'], $c['e']);
    }

    public function test_an_appear_timeline_with_a_hold_loops_as_one(): void
    {
        $motion = Motion::compile(Motion::sanitize([[
            'id' => 'demo', 'trigger' => ['type' => 'appear'], 'repeat' => -1, 'hold' => 2,
            'steps' => [
                ['target' => '#panel', 'from' => ['opacity' => 0], 'duration' => 1, 'at' => 1, 'ease' => 'linear'],
                ['target' => '#panel', 'to' => ['opacity' => 0], 'duration' => 1, 'at' => 3, 'ease' => 'linear'],
            ],
        ]]));

        $this->assertTrue($motion['forever'], 'A page with it needs a Motion Toggle.');
        $animation = $motion['runtime'][0];
        $this->assertTrue($animation['cycle']);
        $this->assertCount(1, $animation['steps'], 'One animation per target, however many steps touch it.');
        $step = $animation['steps'][0];
        $this->assertSame(6000, $step['d'], 'Steps end at 4 seconds, and it rests for 2.');
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
            'steps' => [['target' => 'self', 'from' => ['opacity' => 0], 'duration' => 1]],
        ]]));

        $this->assertArrayNotHasKey('cycle', $motion['runtime'][0]);
        $this->assertFalse($motion['forever']);
    }
}

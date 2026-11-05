<?php

declare(strict_types=1);

namespace Cms\Modules\Sync\Tests;

use Cms\Modules\Sync\Rewriter;
use PHPUnit\Framework\TestCase;

final class RewriterTest extends TestCase
{
    private function rewriter(): Rewriter
    {
        return new Rewriter([['https://www.example.com', 'http://localhost:8000'], ['/home/acme/public_html', '/Users/me/sites/acme']]);
    }

    public function test_addresses_are_rewritten_in_plain_text_with_either_scheme_and_without_one(): void
    {
        $r = $this->rewriter();

        $this->assertSame('<a href="http://localhost:8000/about">', $r->apply('<a href="https://www.example.com/about">'));
        $this->assertSame('http://localhost:8000', $r->apply('http://www.example.com'));
        $this->assertSame('src="//localhost:8000/media/a.jpg"', $r->apply('src="//www.example.com/media/a.jpg"'));
        $this->assertSame('See http://localhost:8000.', $r->apply('See https://WWW.example.com.'));
    }

    public function test_a_longer_host_or_a_word_that_starts_the_same_is_left_alone(): void
    {
        $r = $this->rewriter();

        foreach (['https://www.example.com.au/x', 'https://www.example.community', 'https://www.example.com-shop.net', 'https://sub.www.example.com/', 'mailto:hi@www.example.com'] as $text) {
            $this->assertSame($text, $r->apply($text), $text);
        }
    }

    public function test_json_escaped_and_url_encoded_forms_are_rewritten_too(): void
    {
        $r = $this->rewriter();
        $json = json_encode(['url' => 'https://www.example.com/a', 'path' => '/home/acme/public_html/storage']);

        $this->assertSame(['url' => 'http://localhost:8000/a', 'path' => '/Users/me/sites/acme/storage'], json_decode((string) $r->apply($json), true));
        $this->assertSame('?next='.rawurlencode('http://localhost:8000/x'), $r->apply('?next='.rawurlencode('https://www.example.com/x')));
    }

    public function test_serialized_values_get_their_string_lengths_counted_again(): void
    {
        $r = $this->rewriter();
        $value = serialize(['home' => 'https://www.example.com/', 'nested' => ['https://www.example.com/a";s:1:"x'], 'n' => 3, 'f' => 1.5, 'b' => true, 'none' => null]);
        $out = (string) $r->apply($value);

        $this->assertSame(['home' => 'http://localhost:8000/', 'nested' => ['http://localhost:8000/a";s:1:"x'], 'n' => 3, 'f' => 1.5, 'b' => true, 'none' => null], unserialize($out));
    }

    public function test_serialized_objects_are_rewritten_without_being_woken_up(): void
    {
        $r = $this->rewriter();
        $object = (object) ['url' => 'https://www.example.com', 'inner' => ['https://www.example.com/a/b']];
        $value = str_replace('O:8:"stdClass"', 'O:9:"Missing\\X"', serialize($object));
        $out = (string) $r->apply($value);

        $this->assertStringContainsString('s:21:"http://localhost:8000"', $out);
        $this->assertStringContainsString('s:25:"http://localhost:8000/a/b"', $out);
        $this->assertNotFalse(@unserialize($out, ['allowed_classes' => false]));
    }

    public function test_serialized_values_inside_json_are_counted_again_too(): void
    {
        $r = $this->rewriter();
        $json = (string) json_encode(['meta' => serialize(['home' => 'https://www.example.com/']), 'link' => 'https://www.example.com/x', 'empty' => new \stdClass]);
        $out = json_decode((string) $r->apply($json), true);

        $this->assertSame(['home' => 'http://localhost:8000/'], unserialize($out['meta']));
        $this->assertSame('http://localhost:8000/x', $out['link']);
        $this->assertStringContainsString('"empty":{}', (string) $r->apply($json));
    }

    public function test_what_one_rule_writes_is_never_rewritten_by_another(): void
    {
        $r = new Rewriter([['https://example.com', 'https://staging.example.com']]);

        $this->assertSame('https://staging.example.com/a and https://staging.example.com', $r->apply('https://example.com/a and http://example.com'));
        $this->assertSame('https://staging.example.com', $r->apply('https://staging.example.com'));
    }

    public function test_values_that_do_not_mention_the_site_and_non_strings_pass_through(): void
    {
        $r = $this->rewriter();

        $this->assertSame(42, $r->apply(42));
        $this->assertNull($r->apply(null));
        $this->assertSame(['b64' => 'AAEC'], $r->apply(['b64' => 'AAEC']));
        $this->assertSame('a:1:{i:0;s:3:"abc";}', $r->apply('a:1:{i:0;s:3:"abc";}'));
        $this->assertFalse(Rewriter::none()->active());
    }

    public function test_broken_serialized_looking_text_is_treated_as_text(): void
    {
        $r = $this->rewriter();

        $this->assertSame('s:5:"http://localhost:8000";', $r->apply('s:5:"https://www.example.com";'));
    }
}

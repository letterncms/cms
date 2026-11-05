<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

/**
 * Turns one site's addresses and folders into another's, wherever they're written down: plain
 * text, JSON (where `/` may be escaped), URL-encoded values and PHP-serialized data, whose string
 * lengths have to be counted again. A match has to end where the address ends, so example.com
 * never touches example.com.au.
 */
final class Rewriter
{
    /** One pass over the text, so what one rule writes is never rewritten by another. */
    private ?string $pattern = null;

    /** @var array<string, string> lower-case match => replacement */
    private array $map = [];

    /** @var list<string> cheap substrings: a value holding none of them is left alone */
    private array $needles = [];

    /** @param  list<array{0: string, 1: string}>  $pairs  from => to: site URLs, folders, or anything else to replace */
    public function __construct(array $pairs)
    {
        $rules = [];

        foreach ($pairs as [$from, $to]) {
            $from = rtrim(trim($from), '/');
            $to = rtrim(trim($to), '/');

            if ($from === '' || $from === $to) {
                continue;
            }

            if (preg_match('#^https?://#i', $from) === 1) {
                $host = (string) preg_replace('#^https?:#i', '', $from);
                $toHost = (string) preg_replace('#^https?:#i', '', $to);

                foreach (['https:', 'http:'] as $scheme) {
                    $rules[$scheme.$host] = $to;
                }

                $rules[$host] = $toHost;
            } else {
                $rules[$from] = $to;
            }
        }

        uksort($rules, static fn (string $a, string $b) => strlen($b) <=> strlen($a));

        foreach ($rules as $from => $to) {
            // As written, JSON-escaped, and URL-encoded.
            foreach ([[$from, $to], [str_replace('/', '\\/', $from), str_replace('/', '\\/', $to)], [rawurlencode($from), rawurlencode($to)]] as [$f, $t]) {
                $this->map[strtolower($f)] ??= $t;
            }
        }

        if ($this->map !== []) {
            $keys = array_keys($this->map);
            usort($keys, static fn (string $a, string $b) => strlen($b) <=> strlen($a));
            $this->needles = $keys;
            $this->pattern = '~(?<![a-z0-9_.-])(?:'.implode('|', array_map(static fn (string $k) => preg_quote($k, '~'), $keys)).')(?![a-z0-9_-]|\.[a-z0-9])~i';
        }
    }

    public static function none(): self
    {
        return new self([]);
    }

    public function active(): bool
    {
        return $this->pattern !== null;
    }

    public function apply(mixed $value): mixed
    {
        if (! is_string($value) || $this->pattern === null || ! $this->mentions($value)) {
            return $value;
        }

        if (self::looksSerialized($value)) {
            $out = (new SerializedRewriter($this->text(...)))->rewrite($value);

            if ($out !== null) {
                return $out;
            }
        }

        // Serialized data kept inside JSON needs its lengths counted too: then the JSON is walked.
        if (($value[0] === '{' || $value[0] === '[') && str_contains($value, ':{') && ($out = $this->json($value)) !== null) {
            return $out;
        }

        return $this->text($value);
    }

    /** Null when nothing inside is serialized: plain replacement keeps the JSON exactly as it was written. */
    private function json(string $value): ?string
    {
        $decoded = json_decode($value, false, 512, JSON_BIGINT_AS_STRING);

        if (! is_array($decoded) && ! is_object($decoded)) {
            return null;
        }

        $serialized = false;
        $walk = function (mixed $node) use (&$walk, &$serialized): mixed {
            if (is_string($node)) {
                if (self::looksSerialized($node) && $this->mentions($node) && ($out = (new SerializedRewriter($this->text(...)))->rewrite($node)) !== null) {
                    $serialized = true;

                    return $out;
                }

                return $this->text($node);
            }

            if (is_array($node)) {
                return array_map($walk, $node);
            }

            if (is_object($node)) {
                foreach (get_object_vars($node) as $k => $v) {
                    $node->{$k} = $walk($v);
                }
            }

            return $node;
        };
        $walked = $walk($decoded);

        if (! $serialized) {
            return null;
        }

        $flags = JSON_PRESERVE_ZERO_FRACTION | (str_contains($value, '\\/') ? 0 : JSON_UNESCAPED_SLASHES) | (preg_match('/[\x80-\xff]/', $value) === 1 ? JSON_UNESCAPED_UNICODE : 0);

        return (string) json_encode($walked, $flags);
    }

    /** @param  array<int|string, mixed>  $row */
    public function row(array $row): array
    {
        foreach ($row as $key => $value) {
            $row[$key] = $this->apply($value);
        }

        return $row;
    }

    public function text(string $value): string
    {
        if ($this->pattern === null) {
            return $value;
        }

        return (string) preg_replace_callback($this->pattern, fn (array $m) => $this->map[strtolower($m[0])] ?? $m[0], $value);
    }

    private function mentions(string $value): bool
    {
        $lower = strtolower($value);

        foreach ($this->needles as $needle) {
            if (str_contains($lower, $needle)) {
                return true;
            }
        }

        return false;
    }

    private static function looksSerialized(string $value): bool
    {
        return preg_match('/^(?:[aO]:\d+:|s:\d+:"|C:\d+:"|i:-?\d+;|b:[01];|d:|N;)/', $value) === 1 && in_array(substr($value, -1), [';', '}'], true);
    }
}

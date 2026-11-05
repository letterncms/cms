<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use Closure;

/**
 * Rewrites the strings inside PHP-serialized data and counts their lengths again, without
 * unserializing: no object is ever made, so no class of the other site's is needed or woken up.
 * Null when the value isn't well-formed, and the caller treats it as text.
 */
final class SerializedRewriter
{
    private string $in = '';

    private int $at = 0;

    /** @param  Closure(string): string  $rewrite */
    public function __construct(private readonly Closure $rewrite) {}

    public function rewrite(string $value): ?string
    {
        $this->in = $value;
        $this->at = 0;

        $out = $this->value(0);

        return $out !== null && $this->at === strlen($value) ? $out : null;
    }

    private function value(int $depth): ?string
    {
        if ($depth > 64 || $this->at >= strlen($this->in)) {
            return null;
        }

        $type = $this->in[$this->at];

        return match ($type) {
            'N' => $this->literal('N;'),
            'b', 'i', 'd', 'r', 'R' => $this->scalar($type),
            's' => $this->string(),
            'S' => $this->escapedString(),
            'E' => $this->enum(),
            'a' => $this->container('a', $depth),
            'O' => $this->object($depth),
            'C' => $this->custom(),
            default => null,
        };
    }

    private function literal(string $token): ?string
    {
        if (substr($this->in, $this->at, strlen($token)) !== $token) {
            return null;
        }

        $this->at += strlen($token);

        return $token;
    }

    private function scalar(string $type): ?string
    {
        if (preg_match('/\G'.$type.':[^;]*;/', $this->in, $m, 0, $this->at) !== 1) {
            return null;
        }

        $this->at += strlen($m[0]);

        return $m[0];
    }

    private function string(): ?string
    {
        $raw = $this->counted('s');

        return $raw === null ? null : $this->ended(';', 's:'.strlen($new = ($this->rewrite)($raw)).':"'.$new.'"');
    }

    /** The S: form escapes bytes as \xx; it's rare enough to pass through untouched. */
    private function escapedString(): ?string
    {
        if (preg_match('/\GS:(\d+):"/', $this->in, $m, 0, $this->at) !== 1) {
            return null;
        }

        $end = strpos($this->in, '";', $this->at + strlen($m[0]));

        if ($end === false) {
            return null;
        }

        $token = substr($this->in, $this->at, $end + 2 - $this->at);
        $this->at = $end + 2;

        return $token;
    }

    private function enum(): ?string
    {
        $raw = $this->counted('E');

        return $raw === null ? null : $this->ended(';', 'E:'.strlen($raw).':"'.$raw.'"');
    }

    private function container(string $type, int $depth, string $head = ''): ?string
    {
        if (preg_match('/\G'.($head === '' ? $type.':' : '').'(\d+):\{/', $this->in, $m, 0, $this->at) !== 1) {
            return null;
        }

        $this->at += strlen($m[0]);
        $out = ($head === '' ? $type.':' : $head).$m[1].':{';

        for ($i = 0, $n = (int) $m[1] * 2; $i < $n; $i++) {
            $part = $this->value($depth + 1);

            if ($part === null) {
                return null;
            }

            $out .= $part;
        }

        return $this->ended('}', $out);
    }

    private function object(int $depth): ?string
    {
        $class = $this->counted('O');

        if ($class === null || ($this->in[$this->at] ?? '') !== ':') {
            return null;
        }

        $this->at++;

        return $this->container('O', $depth, 'O:'.strlen($class).':"'.$class.'":');
    }

    /** C: holds what the class's own serialize() wrote, which only that class can read. Untouched. */
    private function custom(): ?string
    {
        $class = $this->counted('C');

        if ($class === null || preg_match('/\G:(\d+):\{/', $this->in, $m, 0, $this->at) !== 1) {
            return null;
        }

        $start = $this->at + strlen($m[0]);
        $data = substr($this->in, $start, (int) $m[1]);

        if (strlen($data) !== (int) $m[1] || ($this->in[$start + (int) $m[1]] ?? '') !== '}') {
            return null;
        }

        $this->at = $start + (int) $m[1] + 1;

        return 'C:'.strlen($class).':"'.$class.'":'.$m[1].':{'.$data.'}';
    }

    /** `x:<length>:"<bytes>"`, read by its length: the bytes may hold quotes and semicolons. */
    private function counted(string $type): ?string
    {
        if (preg_match('/\G'.$type.':(\d+):"/', $this->in, $m, 0, $this->at) !== 1) {
            return null;
        }

        $start = $this->at + strlen($m[0]);
        $raw = substr($this->in, $start, (int) $m[1]);

        if (strlen($raw) !== (int) $m[1] || ($this->in[$start + (int) $m[1]] ?? '') !== '"') {
            return null;
        }

        $this->at = $start + (int) $m[1] + 1;

        return $raw;
    }

    private function ended(string $char, string $out): ?string
    {
        if (($this->in[$this->at] ?? '') !== $char) {
            return null;
        }

        $this->at++;

        return $out.$char;
    }
}

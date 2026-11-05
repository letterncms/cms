<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use RuntimeException;

/** Files on the wire: for each piece, a 4-byte length, a JSON header, then the bytes, which the header counts. */
final class Pack
{
    /** @param  list<array{0: array<string, mixed>, 1: string}>  $pieces */
    public static function encode(array $pieces): string
    {
        $out = '';

        foreach ($pieces as [$header, $data]) {
            $json = (string) json_encode([...$header, 'length' => strlen($data)], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            $out .= pack('N', strlen($json)).$json.$data;
        }

        return $out;
    }

    /** @return list<array{0: array<string, mixed>, 1: string}> */
    public static function decode(string $pack): array
    {
        $pieces = [];
        $at = 0;
        $total = strlen($pack);

        while ($at < $total) {
            if ($at + 4 > $total) {
                throw new RuntimeException(__('A transfer arrived incomplete. It’s sent again.'));
            }

            $length = unpack('N', substr($pack, $at, 4))[1];
            $header = json_decode(substr($pack, $at + 4, $length), true);
            $at += 4 + $length;

            if (! is_array($header) || ! isset($header['length']) || $at + (int) $header['length'] > $total) {
                throw new RuntimeException(__('A transfer arrived incomplete. It’s sent again.'));
            }

            $pieces[] = [$header, substr($pack, $at, (int) $header['length'])];
            $at += (int) $header['length'];
        }

        return $pieces;
    }
}

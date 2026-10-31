<?php

declare(strict_types=1);

namespace Cms\Modules\License\Token;

/** What a verified token says. Strict: a token missing anything needed here counts as malformed. */
final readonly class Claims
{
    /**
     * @param  list<string>  $domains
     * @param  array<string, array{p: string, ed: string, st: string, upd: ?string, trm: ?string, tgr: int}>  $items  product => item
     */
    private function __construct(
        public string $lid,
        public int $iat,
        public int $rev,
        public array $domains,
        public array $items,
    ) {}

    public static function parse(string $message): ?self
    {
        $data = json_decode($message, true);

        if (! is_array($data) || ! is_string($data['lid'] ?? null) || $data['lid'] === '' || ! is_int($data['rev'] ?? null) || ! is_array($data['items'] ?? null)) {
            return null;
        }

        $iat = is_string($data['iat'] ?? null) ? strtotime($data['iat']) : false;
        $domains = $data['dom'] ?? null;

        // A package always belongs to a site, so a token with no domains means nothing here.
        if ($iat === false || ! is_array($domains) || $domains === [] || array_filter($domains, static fn ($d) => ! is_string($d) || $d === '') !== []) {
            return null;
        }

        $items = [];

        foreach ($data['items'] as $item) {
            if (! is_array($item) || ! is_string($item['p'] ?? null) || ! in_array($item['st'] ?? null, ['active', 'refunded', 'charged_back', 'revoked'], true)) {
                return null;
            }

            $items[$item['p']] = [
                'p' => $item['p'],
                'ed' => (string) ($item['ed'] ?? ''),
                'st' => $item['st'],
                'upd' => isset($item['upd']) ? (string) $item['upd'] : null,
                'trm' => isset($item['trm']) ? (string) $item['trm'] : null,
                'tgr' => max(0, (int) ($item['tgr'] ?? 0)),
            ];
        }

        return new self($data['lid'], $iat, $data['rev'], array_values($domains), $items);
    }
}

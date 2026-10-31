<?php

declare(strict_types=1);

namespace Cms\Modules\License\Report;

use Cms\Modules\License\Host\HostClass;

/** The state of this site's paid plugin licences, as the admin shows it. Nothing else ever reads it. */
final readonly class LicenseReport
{
    /**
     * @param  'none'|'valid'|'invalid'|'wrong_family'|'unknown_key'|'key_revoked'|'unverifiable'|'unknown'  $token
     * @param  array<string, array{edition: ?string, status: ?string, level: int, reason: string, upd: ?string, trm: ?string}>  $items  product => item
     * @param  list<string>  $notes  Codes, each a line on the licence screen
     * @param  list<string>  $domains
     */
    public function __construct(
        public string $host,
        public HostClass $class,
        public string $token,
        public ?string $lid,
        public int $level,
        public array $items,
        public array $notes = [],
        public array $domains = [],
        public ?int $rev = null,
    ) {}

    public static function unknown(string $host = ''): self
    {
        return new self($host, HostClass::Nonpublic, 'unknown', null, 0, []);
    }

    public function toArray(): array
    {
        return [
            'host' => $this->host,
            'class' => $this->class->value,
            'token' => $this->token,
            'lid' => $this->lid,
            'rev' => $this->rev,
            'level' => $this->level,
            'items' => $this->items,
            'notes' => $this->notes,
            'domains' => $this->domains,
        ];
    }
}

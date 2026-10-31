<?php

declare(strict_types=1);

namespace Cms\Contracts;

/** Builds the static site. Bound by letterncms/site (or a replacement such as a headless deploy hook). */
interface SiteBuilder
{
    public function available(): bool;

    /** Queue a rebuild. $uris null = everything. */
    public function queue(?array $uris = null, string $reason = ''): void;

    /** @return array{state: string, progress: float, message: string, finishedAt: ?string} */
    public function status(): array;
}

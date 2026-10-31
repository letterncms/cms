<?php

declare(strict_types=1);

namespace Cms\Content\Entries;

use Illuminate\Support\Carbon;
use Cms\Extend\Hooks;

/**
 * Entries published with a future date go live by themselves; this fires
 * `entry.published` for those whose time has come, so the static site and
 * other listeners catch up. Runs from cron (`cms publish:scheduled`) or, on
 * hosts without cron, after web requests at most once a minute.
 */
final class ScheduledPublisher
{
    public function __construct(private readonly EntryRepository $entries, private readonly Hooks $hooks) {}

    /** @return int how many entries went live */
    public function run(): int
    {
        $marker = $this->marker();
        $since = is_file($marker) ? Carbon::parse((string) file_get_contents($marker)) : now()->subDay();
        $now = now();

        $due = $this->entries->query()->status('published')->where('published_at', '>', $since)->where('published_at', '<=', $now)->get();

        foreach ($due as $entry) {
            $this->hooks->dispatch('entry.published', $entry, null);
        }

        @file_put_contents($marker, $now->toIso8601String());

        return count($due);
    }

    public function runIfDue(int $everySeconds = 60): void
    {
        $marker = $this->marker();

        if (! is_file($marker) || filemtime($marker) < time() - $everySeconds) {
            $this->run();
        }
    }

    private function marker(): string
    {
        return storage_path('framework/scheduled.last');
    }
}

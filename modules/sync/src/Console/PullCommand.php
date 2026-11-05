<?php

declare(strict_types=1);

namespace Cms\Modules\Sync\Console;

final class PullCommand extends TransferCommand
{
    protected $signature = 'pull
        {remote : The connected site, like production (php cms remote lists them)}
        {what?* : What to pull: content, media, people, files, settings, a plugin\'s data or other; the usual set when left out}
        {--collections= : Only these collections of the content, comma separated}
        {--replace=* : Also replace this text, as from=>to}
        {--dry-run : Show what would change, and stop}
        {--yes : Don\'t ask}';

    protected $description = 'Copy another site into this one: its content, media and whatever else you choose, with a preview and a backup first.';

    protected function direction(): string
    {
        return 'pull';
    }
}

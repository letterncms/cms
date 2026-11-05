<?php

declare(strict_types=1);

namespace Cms\Modules\Sync\Console;

final class PushCommand extends TransferCommand
{
    protected $signature = 'push
        {remote : The connected site, like production (php cms remote lists them)}
        {what?* : What to push: content, media, people, files, settings, a plugin\'s data or other; the usual set when left out}
        {--collections= : Only these collections of the content, comma separated}
        {--replace=* : Also replace this text, as from=>to}
        {--dry-run : Show what would change, and stop}
        {--yes : Don\'t ask}';

    protected $description = 'Copy this site into another one: content and media by default, with a preview, and a backup there first.';

    protected function direction(): string
    {
        return 'push';
    }
}

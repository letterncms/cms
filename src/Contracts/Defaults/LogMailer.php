<?php

declare(strict_types=1);

namespace Cms\Contracts\Defaults;

use Illuminate\Support\Facades\Log;
use Cms\Contracts\MailMessage;
use Cms\Contracts\Mailer;

/** Used when no mail plugin is active: messages are written to the log. */
final class LogMailer implements Mailer
{
    public function send(MailMessage $message): void
    {
        Log::warning('Mail not sent (no mail plugin active).', ['to' => $message->recipients(), 'subject' => $message->subject]);
    }

    public function configured(): bool
    {
        return false;
    }
}

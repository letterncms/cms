<?php

declare(strict_types=1);

namespace Cms\Contracts;

/** Sends email. Bound by a mail plugin (letterncms/mail, or any replacement). */
interface Mailer
{
    public function send(MailMessage $message): void;

    /** False when no transport is configured (messages would only be logged). */
    public function configured(): bool;
}

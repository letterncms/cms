<?php

declare(strict_types=1);

namespace Cms\Contracts;

final class MailMessage
{
    /**
     * @param  list<string>|string  $to
     * @param  array<string, string>  $headers
     * @param  list<array{name: string, content: string, mime: string}>  $attachments
     */
    public function __construct(
        public array|string $to,
        public string $subject,
        public string $html = '',
        public string $text = '',
        public ?string $replyTo = null,
        public ?string $fromAddress = null,
        public ?string $fromName = null,
        public array $headers = [],
        public array $attachments = [],
        public ?string $tag = null,
        /** Keep no record of the address: the last message to someone whose data is erased. */
        public bool $ephemeral = false,
    ) {}

    /** @return list<string> */
    public function recipients(): array
    {
        return array_values(array_filter(array_map('trim', (array) $this->to)));
    }
}

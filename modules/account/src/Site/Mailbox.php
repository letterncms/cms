<?php

declare(strict_types=1);

namespace Cms\Modules\Account\Site;

use Cms\Admin\Translations;
use Cms\Cms;
use Cms\Contracts\MailMessage;
use Cms\Contracts\Mailer;
use Cms\Support\MailBody;

/** The mail public accounts send. Short and in the reader's language; links use the site's own URL, never the request's Host header. */
final class Mailbox
{
    public function __construct(private readonly Cms $cms, private readonly Mailer $mailer) {}

    /**
     * @param  \Closure(array $site): array{0: string, 1: string, 2?: array{0: string, 1: string}}  $message  subject, text and optionally [label, path], written with __() so they read in this language
     */
    public function send(string $to, string $locale, string $tag, \Closure $message): void
    {
        $translations = $this->cms->app()->make(Translations::class);
        $previous = $translations->current();
        $translations->apply($locale);

        try {
            [$subject, $intro, $action] = [...$message(['site' => (string) config('app.name')]), null];
        } finally {
            $translations->apply($previous);
        }

        $body = MailBody::render([$intro], $action !== null ? [$action[0], $this->absolute($action[1])] : null);

        $this->mailer->send(new MailMessage(to: $to, subject: $subject, html: $body['html'], text: $body['text'], tag: 'account-'.$tag, ephemeral: $tag === 'deleted'));
    }

    public function absolute(string $path): string
    {
        return rtrim((string) $this->cms->site('url', config('app.url')), '/').$path;
    }
}

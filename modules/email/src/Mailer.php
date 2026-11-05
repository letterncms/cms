<?php

declare(strict_types=1);

namespace Cms\Modules\Email;

use Illuminate\Contracts\View\Factory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Cms\Admin\Translations;
use Cms\Cms;
use Cms\Users\User;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;
use Throwable;

/**
 * Sends the site's email through the configured transport, in the site's layout, and logs it.
 * Plugins add transports (see Transports); tests may stand in a subclass.
 */
class Mailer
{
    public function __construct(private readonly Cms $cms, private readonly Transports $transports, private readonly Factory $views) {}

    public function configured(): bool
    {
        $transport = (string) $this->cms->settings('email', 'transport', 'log');

        return $transport !== 'log' && $this->transports->has($transport);
    }

    /** Never throws: failures are logged so a form or invite never breaks on mail problems. */
    public function send(Message $message): void
    {
        try {
            $this->deliver($message);
        } catch (Throwable $e) {
            report($e);
        }
    }

    /** Send and throw on failure (test mails, CLI). */
    public function deliver(Message $message): void
    {
        $settings = (array) $this->cms->settings('email');
        $key = (string) ($settings['transport'] ?? 'log');
        $email = $this->build($message, $settings);

        try {
            $this->transports->make($key, $settings)->send($email);
            $this->log($message, $key, 'sent');
        } catch (Throwable $e) {
            $this->log($message, $key, 'failed', $e->getMessage());
            throw $e;
        }
    }

    /** Where mail comes from when the settings name no address: no-reply@ the site's host. */
    public function noReply(): string
    {
        return 'no-reply@'.(parse_url($this->cms->url(), PHP_URL_HOST) ?: 'example.com');
    }

    private function build(Message $message, array $settings): Email
    {
        $from = new Address(
            $message->fromAddress ?? (string) ($settings['from_address'] ?? $this->noReply()),
            $message->fromName ?? (string) ($settings['from_name'] ?? config('app.name'))
        );

        $html = $message->html !== '' ? $this->layout($message, $settings) : '';

        $email = (new Email)
            ->from($from)
            ->to(...$message->recipients())
            ->subject($message->subject)
            ->text($message->text !== '' ? $message->text : trim(html_entity_decode(strip_tags(str_replace(['</p>', '<br>'], "\n", $message->html)))));

        if ($html !== '') {
            $email->html($html);
        }

        if ($message->replyTo) {
            $email->replyTo($message->replyTo);
        }

        foreach ($message->headers as $name => $value) {
            if (preg_match('/^[A-Za-z0-9-]+$/', $name)) {
                $email->getHeaders()->addTextHeader($name, $value);
            }
        }

        if ($message->tag) {
            $email->getHeaders()->addTextHeader('X-Cms-Tag', $message->tag);
        }

        foreach ($message->attachments as $file) {
            $email->attach($file['content'], $file['name'], $file['mime']);
        }

        return $email;
    }

    /**
     * The message in the CMS's email layout, in the recipient's language: the account's
     * own when the address belongs to one, else the language the message was written in.
     */
    private function layout(Message $message, array $settings): string
    {
        $translations = $this->cms->app()->make(Translations::class);
        $previous = $translations->current();
        $user = ($to = $message->recipients()[0] ?? null) ? User::query()->where('email', strtolower($to))->first() : null;
        $locale = $user ? $translations->locale($user) : $previous;

        $translations->apply($locale);

        try {
            return $this->views->make('email::layout', ['body' => $message->html, 'site' => config('app.name'), 'url' => $this->cms->url(), 'footer' => (string) ($settings['footer'] ?? '') ?: __('Sent by :site', ['site' => config('app.name')]), 'locale' => $locale, 'colors' => Body::colors()])->render();
        } finally {
            $translations->apply($previous);
        }
    }

    private function log(Message $message, string $transport, string $status, ?string $error = null): void
    {
        try {
            DB::table('email_log')->insert([
                'id' => strtolower((string) Str::ulid()),
                'to' => $message->ephemeral ? 'erased' : mb_substr(implode(', ', $message->recipients()), 0, 1000),
                'subject' => mb_substr($message->subject, 0, 500),
                'tag' => $message->tag,
                'transport' => $transport,
                'status' => $status,
                'error' => $error ? mb_substr($error, 0, 2000) : null,
                'created_at' => now(),
            ]);
        } catch (Throwable) {
            // Logging is best effort.
        }
    }
}
